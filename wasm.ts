// A lot of the code here is based on code from
// https://github.com/plasma-umass/browsix-emscripten

// TODO
declare var WebAssembly;
declare var BigInt64Array;

function open(path: string, flags: number, mode: number): Promise<[number, number]> {
  return syscallAsync('open', [path, flags, mode], []);
 }

function read(fd: number, count: number): Promise<[number, number, any]> {
  return syscallAsync('pread', [fd, count, -1], []);
}

function fstat(fd: number): Promise<[number, Uint8Array]> {
  return syscallAsync('fstat', [fd], []);
}

function exit(retval: number): void {
  syscall(SYS.exit_group, retval, 0, 0, 0, 0, 0);
}

// Writes JS string str to WASM memory at address addr,
// as NUL-terminated UTF-8. Returns the length of the C
// string (excluding NUL byte).
function str_to_mem(str: string, addr: number): number {
  // XXX integrate with allocator?
  var encoder = new TextEncoder();
  var bytes = encoder.encode(str);
  HEAPU8.set(bytes, addr);
  HEAPU8[addr + bytes.length] = 0; // NUL
  return bytes.length;
}

async function readFile(path: string): Promise<Uint8Array> {
  // XXX better error handling
  console.log('Reading', path);
  var [err, fd] = await open(path, 0, 0);
  if (err != 0) {
    console.log('open() Failed: ', fd);
  }
  var stat_buf;
  [err, stat_buf] = await fstat(fd);
  if (err != 0) {
    console.log('fstat() Failed: ', fd);
  }
  // TODO
  var st_size = (new BigInt64Array(stat_buf.buffer.slice(48, 48+8)))[0];
  
  var bytes, len;
  [err, len, bytes] = await read(fd, Number(st_size));
  if (err != 0) {
    console.log('read() Failed: ', bytes);
  }
  console.log('Read', len, 'byte file');
  return bytes;
}

if (typeof SharedArrayBuffer !== 'function') {
}

var memory = new WebAssembly.Memory({ 
  'initial': 1024,
  'maximum': 1024,
  'shared': true
});

var HEAPU8 = new Uint8Array(memory.buffer);
var HEAP32 = new Int32Array(memory.buffer);

//console.log(typeof memory.buffer);
//console.log(memory.buffer);

var msgIdSeq = 1;
var outstanding = {};
var signalHandlers = {};

function SyscallResponseFrom(ev) {
  var requiredOnData = ['id', 'name', 'args'];
  if (!ev.data)
    return;
  for (var i = 0; i < requiredOnData.length; i++) {
    if (!ev.data.hasOwnProperty(requiredOnData[i]))
      return;
  }
  var args = ev.data.args; //.map(convertApiErrors);
  return {id: ev.data.id, name: ev.data.name, args: args};
}

function complete(id, args) {
  var cb = this.outstanding[id];
  delete this.outstanding[id];
  if (cb) {
    cb.apply(undefined, args);
  }
  else {
    console.log('unknown callback for msg ' + id + ' - ' + args);
  }
}

// @ts-ignore
function addEventListener(type, handler) {
  if (!handler)
    return;
  if (signalHandlers[type])
    signalHandlers[type].push(handler);
  else
    signalHandlers[type] = [handler];
}

onmessage = function(ev) {
  var response = SyscallResponseFrom(ev);
  if (!response) {
    console.log('bad usyscall message, dropping');
    console.log(ev);
    return;
  }
  if (response.name) {
    var handlers = signalHandlers[response.name];
    if (handlers) {
      for (var i = 0; i < handlers.length; i++)
        handlers[i](response);
    }
    else {
      console.log('unhandled signal ' + response.name);
    }
    return;
  }
  complete(response.id, response.args);
};

function nextMsgId() {
  return ++msgIdSeq;
}

// Make an asynchrounous system call
function syscallAsync(name, args, transferrables): Promise<any[]> {
  return new Promise(resolve => {
    var msgId = nextMsgId();
    this.outstanding[msgId] = (...args) => resolve(args);
    postMessage({
      id: msgId,
      name: name,
      args: args,
    }, transferrables);
  });
}

// XXX
var waitOff = 0;

// Make a synchronous system call.
//
// Cannot be used until the personality() system call has
// been used to pass the SharedArrayBuffer to the kernel.
function syscall(trap, a1, a2, a3, a4, a5, a6) {
  console.log('syscall', [trap, a1, a2, a3, a4, a5, a6]);

  Atomics.store(HEAP32, waitOff >> 2, 0);

  postMessage({
    trap: trap,
    args: [a1, a2, a3, a4, a5, a6],
  });

  Atomics.wait(HEAP32, waitOff >> 2, 0);
  Atomics.store(HEAP32, waitOff >> 2, 0);

  return Atomics.load(HEAP32, (waitOff >> 2) + 1);
}

function print_error(message: string) {
  console.error(message);
  syscallAsync('pwrite', [2, message + '\n', -1], []);
}

function __browsix_syscall(trap, a1, a2, a3, a4, a5, a6) {
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
      return syscall(trap, a1, a2, a3, a4, a5, a6);
    case SYS.getuid32:
      return 0;
    case SYS.dup2:
      if (a1 == a2) {
        return a2;
      } else {
        return syscall(SYS.dup3, a1, a2, 0, 0, 0, 0);
      }
    default:
      Object.entries(SYS).forEach(([k, v]) => {
        if (v === trap) {
          print_error("Unhandled system call '" + k + "'");
          exit(255);
        }
      });
      print_error("Unrecognized system call " + trap);
      exit(255);
  }
}

var env = {
  __browsix_syscall: __browsix_syscall,
  memory: memory
};

async function init(data) {
  // TODO
  console.log('init1\n');

  var args = data.args[0];
  var executable = args[1];
  args = args.slice(1);
  //var environ = data.args[1];

  // TODO copy heap from args[4]

  var PER_BLOCKING = 0x80;
  // XXX handle error
  await syscallAsync('personality',
    [PER_BLOCKING, memory.buffer, waitOff],
    []);
              
  var importObject = {'env': env};
  var bytes = await readFile(executable);
  var results = await WebAssembly.instantiate(bytes, importObject);

  var __heap_base = results.instance.exports.__heap_base.value;
  var argc = args.length;
  var arg_ptrs = [];
  var addr = __heap_base;
  for (var i = 0; i < args.length; i++) {
    arg_ptrs.push(addr);
    addr += str_to_mem(args[i], addr) + 1;
  }
  addr += 4 - (addr % 4);
  var argv = addr;
  for (var i = 0; i < arg_ptrs.length; i++) {
    HEAP32[addr / 4] = arg_ptrs[i];
    addr += 4;
  }

  // XXX envp
  var ret = results.instance.exports.main(argc, argv);

  exit(ret);
}

addEventListener('init', init);
