function open(path, flags, mode) {
  return syscall(5, path, flags, mode, 0, 0, 0);
}

function read(fd, buf, count) {
  return syscall(3, fd, buf, count, 0, 0, 0);
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
  str_to_mem(path, 16); // XXX 16
  fd = open(16, 0, 0);
  console.log(fd);
  if (fd < 0) {
    console.log("open() Failed: ", fd);
  }
  
  addr = 32; // XXX
  len = 0;
  do {
    bytes = read(fd, addr + len, 1024);
    len += bytes;
  } while (bytes > 0);
  if (bytes < 0) {
    console.log("read() Failed: ", bytes);
  }
  console.log("Read ", len, "byte file")
  return HEAPU8.slice(addr, addr+len);
}

if (typeof SharedArrayBuffer !== 'function') {
}

memory = new WebAssembly.Memory({ 
  'initial': 1024,
  'maximum': 1024,
  'shared': true
});

HEAPU8 = new Uint8Array(memory.buffer);
HEAP32 = new Int32Array(memory.buffer);

//console.log(typeof memory.buffer);
//console.log(memory.buffer);

env = {
  syscall: syscall, 
  memory: memory
}

msgIdSeq = 1;
outstanding = {};
signalHandlers = {};

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
};

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
}

function nextMsgId() {
  return ++msgIdSeq;
}

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

function syscall(trap, a1, a2, a3, a4, a5, a6) {
  console.log("syscall", [trap, a1, a2, a3, a4, a5, a6]);

  Atomics.store(HEAP32, waitOff >> 2, 0);

  self.postMessage({
    trap: trap,
    args: [a1, a2, a3, a4, a5, a6],
  });

  Atomics.wait(HEAP32, waitOff >> 2, 0);
  Atomics.store(HEAP32, waitOff >> 2, 0);

  return Atomics.load(HEAP32, (waitOff >> 2) + 1);
}

function init1(data) {
  // TODO
  console.log("init1\n");

  var args = data.args[0];
  var environ = data.args[1];

  // TODO copy heap from args[4]

  var PER_BLOCKING = 0x80;
  syscallAsync('personality', 
               [PER_BLOCKING, memory.buffer, waitOff],
               [],
               err => {
     // XXX handle error
              
    var importObject = {'env': env};
    var bytes = readFileSync('hello.wasm');
    WebAssembly.instantiate(bytes, importObject).then(results => {

      var __heap_base = results.instance.exports.__heap_base.value;
      var argc = args.length;
      var arg_ptrs = []
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
      syscall(252, ret); // exit
    });
  });
}

addEventListener('init', init1);
