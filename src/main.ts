// A lot of the code here is based on code from
// https://github.com/plasma-umass/browsix-emscripten

function open(path: string, flags: number, mode: number): Promise<[number, number]> {
  return process.syscallAsync('open', [path, flags, mode], []) as Promise<[number, number]>;
}

function read(fd: number, count: number): Promise<[number, number, Uint8Array]> {
  return process.syscallAsync('pread', [fd, count, -1], []) as Promise<[number, number, Uint8Array]>;
}

function fstat(fd: number): Promise<[number, Uint8Array]> {
  return process.syscallAsync('fstat', [fd], []) as Promise<[number, Uint8Array]>;
}

function exit(retval: number): void {
  process.syscallSync(SYS.exit_group, retval, 0, 0, 0, 0, 0);
}

// Read a file from the Browsix filesystem asynchronously
async function readFile(path: string): Promise<Uint8Array> {
  // XXX better error handling
  console.log('Reading', path);
  var [err, fd] = await open(path, 0, 0);
  if (err != 0) {
    throw 'open() Failed: ' + err;
  }
  var stat_buf;
  [err, stat_buf] = await fstat(fd);
  if (err != 0) {
    throw 'fstat() Failed: ' + err;
  }

  // TODO don't hardcode offset
  var st_size = (new BigInt64Array(stat_buf.buffer.slice(48, 48+8)))[0];
  
  var bytes, len;
  [err, len, bytes] = await read(fd, Number(st_size));
  if (err != 0) {
    throw 'read() Failed: ' + err;
  }
  console.log('Read', len, 'byte file');
  return bytes;
}

// Write an error to the JavaScript console, and stderr
function print_error(message: string) {
  console.error(message);
  process.syscallAsync('pwrite', [2, message + '\n', -1], []);
}

// Return the name of the system call with a certain number
// TODO: More efficient
function syscall_number_to_name(num: number): string | null {
  var entries = Object.entries(SYS);
  for (var i = 0; i < entries.length; i++) {
    var [k, v] = entries[i];
    if (v === num) {
      return k;
    }
  };
  return null;
}

// Issue a system call. This is the function exported to wasm.
function __browsix_syscall(trap: number, a1: number, a2: number, a3: number, a4: number, a5: number, a6: number) {
  if (WASM_STRACE) {
    var name = syscall_number_to_name(trap);
    process.syscallAsync('pwrite',
      [2, `${name || 'unknown'}(${a1}, ${a2}, ${a3}, ${a4}, ${a5}, ${a6})\n`, -1],
      []);
  }
  console.log('__browsix_syscall', [trap, a1, a2, a3, a4, a5, a6]);
  switch (trap) {
    case SYS.read:
    case SYS.write:
    case SYS.open:
    case SYS.close:
    case SYS.unlink:
    case SYS.execve:
    case SYS.chdir:
    case SYS.getpid:
    case SYS.access:
    case SYS.kill:
    case SYS.rename:
    case SYS.mkdir:
    case SYS.rmdir:
    case SYS.dup:
    case SYS.pipe2:
    case SYS.ioctl:
    case SYS.getppid:
    case SYS.wait4:
    case SYS._llseek:
    case SYS.rt_sigaction:
    case SYS.getcwd:
    case SYS.stat64:
    case SYS.lstat64:
    case SYS.fstat64:
    case SYS.getdents64:
    case SYS.fcntl64:
    case SYS.exit_group:
    case SYS.dup3:
      return process.syscallSync(trap, a1, a2, a3, a4, a5, a6);
    case SYS.getuid32:
      return 0;
    case SYS.brk:
      // TODO
      if (a1 > program.__heap_end && a1 < memory.buffer.byteLength) {
        program.__heap_end = a1;
      }
      console.log(program.__heap_end);
      return program.__heap_end;
    case SYS.set_tid_address:
      // TODO Threads support
      return process.syscallSync(SYS.getpid, 0, 0, 0, 0, 0, 0);
    case SYS.dup2:
      if (a1 == a2) {
        return a2;
      } else {
        return process.syscallSync(SYS.dup3, a1, a2, 0, 0, 0, 0);
      }
    // TODO
    // case SYS.clock_gettime:
    case SYS.writev:
      // TODO probably should be done with one write()
      var written = 0;
      for (var i = 0; i < a3; i++) {
        var buf = program.HEAP32[a2 / 4 + 2*i];
        var len = program.HEAP32[a2 / 4 + 2*i + 1];
        var ret = process.syscallSync(SYS.write, a1, buf, len, 0, 0, 0);
        if (ret < 0) {
          return ret;
        }
        written += len;
        if (ret != len) {
          break;
        }
      }
      return written;
    // case SYS.readv:
    case SYS.madvise:
      // XXX is there any issue with this?
      return 0;
    default:
      var name = syscall_number_to_name(trap);
      if (name === null) {
        print_error("Unrecognized system call " + trap);
      } else {
        print_error("Unhandled system call '" + name + "'");
      }
      exit(255);
  }
}

// Handler for the 'init' signal, which the Browsix kernel sends at startup
// with the processes arguments, environmental variables, etc.
async function init(data: any) {
  console.log('init');

  var args = data.args[0];
  var executable = args[1];
  args = args.slice(2);
  var environ = data.args[1];

  if (environ['WASM_STRACE']) {
    WASM_STRACE = true;
    delete environ['WASM_STRACE'];
  }

  // TODO copy heap from args[4]

  // Pass SharedArrayBuffer to kernel, so it can access wasm's memory and
  // support synchronous system calls.
  // TODO handle error
  var waitOff = 0; // TODO
  await process.personality(memory.buffer, waitOff);

  var bytes = await readFile(executable);
  var env = {
    __browsix_syscall: __browsix_syscall,
    memory: memory
  };
  var results = await WebAssembly.instantiate(bytes, {env: env});

  program = new WasmMuslProgram(results.instance, memory);
  program.run_and_exit(args, environ);
}

var memory = new WebAssembly.Memory({
  'initial': 1024,
  'maximum': 1024,
// @ts-ignore
  'shared': true
});

var WASM_STRACE: boolean = false;

// TODO No cast
var process = new BrowsixProcess(self as DedicatedWorkerGlobalScope);
var program: WasmMuslProgram;

process.onSignal('init', init);
