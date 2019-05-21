// A lot of the code here is based on code from
// https://github.com/plasma-umass/browsix-emscripten

var SYS_OPEN = 5;
var SYS_READ = 3;
var SYS_EXIT = 252;

function open(path, flags, mode) {
  return syscall(SYS_OPEN, path, flags, mode, 0, 0, 0);
}

function read(fd, buf, count) {
  return syscall(SYS_READ, fd, buf, count, 0, 0, 0);
}

function exit(retval) {
  return syscall(SYS_EXIT, retval, 0, 0, 0, 0, 0);
}

// Writes JS string str to WASM memory at address addr,
// as NUL-terminated UTF-8. Returns the length of the C
// string (excluding NUL byte).
function str_to_mem(str, addr) {
  // XXX integrate with allocator?
  var encoder = new TextEncoder();
  var bytes = encoder.encode(str);
  HEAPU8.set(bytes, addr);
  HEAPU8[addr + bytes.length] = 0; // NUL
  return bytes.length;
}

function readFileSync(path) {
  // XXX better error handling
  console.log('Reading ', path);
  str_to_mem(path, 16); // XXX 16
  var fd = open(16, 0, 0);
  console.log(fd);
  if (fd < 0) {
    console.log('open() Failed: ', fd);
  }
  
  var addr = 32; // XXX
  var len = 0;
  var bytes;
  do {
    bytes = read(fd, addr + len, 1024);
    len += bytes;
  } while (bytes > 0);
  if (bytes < 0) {
    console.log('read() Failed: ', bytes);
  }
  console.log('Read ', len, 'byte file');
  return HEAPU8.slice(addr, addr+len);
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

function complete (id, args) {
  var cb = this.outstanding[id];
  delete this.outstanding[id];
  if (cb) {
    cb.apply(undefined, args);
  }
  else {
    console.log('unknown callback for msg ' + id + ' - ' + args);
  }
}

function addEventListener(type, handler) {
  if (!handler)
    return;
  if (this.signalHandlers[type])
    this.signalHandlers[type].push(handler);
  else
    this.signalHandlers[type] = [handler];
}

self.onmessage = function(ev) {
  var response = SyscallResponseFrom(ev);
  if (!response) {
    console.log('bad usyscall message, dropping');
    console.log(ev);
    return;
  }
  if (response.name) {
    var handlers = this.signalHandlers[response.name];
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
function syscallAsync(name, args, transferrables, cb) {
  var msgId = nextMsgId();
  this.outstanding[msgId] = cb;
  self.postMessage({
    id: msgId,
    name: name,
    args: args,
  }, transferrables);
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

  self.postMessage({
    trap: trap,
    args: [a1, a2, a3, a4, a5, a6],
  });

  Atomics.wait(HEAP32, waitOff >> 2, 0);
  Atomics.store(HEAP32, waitOff >> 2, 0);

  return Atomics.load(HEAP32, (waitOff >> 2) + 1);
}

function __browsix_syscall(trap, a1, a2, a3, a4, a5, a6) {
  console.log('__browsix_syscall', [trap, a1, a2, a3, a4, a5, a6]);

  switch (trap) {
    case SYS_read:
    case SYS_write:
    case SYS_open:
    case SYS_close:
    case SYS_unlink:
    case SYS_execve:
    case SYS_chdir:
    case SYS_getpid:
    case SYS_access:
    case SYS_kill:
    case SYS_rename:
    case SYS_mkdir:
    case SYS_rmdir:
    case SYS_dup:
    case SYS_pipe2:
    case SYS_ioctl:
    case SYS_getppid:
    case SYS_wait4:
    case SYS_llseek:
    case SYS_rt_sigaction:
    case SYS_getcwd:
    case SYS_stat64:
    case SYS_lstat64:
    case SYS_fstat64:
    case SYS_getdents64:
    case SYS_fcntl64:
    case SYS_exit_group:
    case SYS_dup3:
      return syscall(trap, a1, a2, a3, a4, a5, a6);
    default:
      console.log("Unrecognized system call ", trap);
      exit(255);
  }
}

var env = {
  __browsix_syscall: __browsix_syscall,
  memory: memory
};

function init1(data) {
  // TODO
  console.log('init1\n');

  var args = data.args[0];
  var executable = args[1];
  args = args.slice(1);
  //var environ = data.args[1];

  // TODO copy heap from args[4]

  var PER_BLOCKING = 0x80;
  syscallAsync('personality', 
    [PER_BLOCKING, memory.buffer, waitOff],
    [],
    err => {
      // XXX handle error
              
      var importObject = {'env': env};
      var bytes = readFileSync(executable);
      WebAssembly.instantiate(bytes, importObject).then(results => {

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
      });
    });
}

addEventListener('init', init1);
