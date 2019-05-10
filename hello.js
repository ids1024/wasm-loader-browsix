// Webworker
if(typeof importScripts === 'function')
  var isBrosix = true;
else
  var isNode = true;

if (isNode) {
  var fs = require('fs');
  var readFileSync = fs.ReadFileSync;

  /*
  var ffi = require('ffi');
  // #XXX requires glibc
  var syscall = ffi.Library(null, {
      'syscall': [ 'long', [ 'long' ], { varargs: true } ]
  }).syscall;
  */

  var argv = process.argv.slice(1);
  var argc = argv.length;
} else {
  function readFileSync(path) {
    // XXX better error handling
    var encoder = new TextEncoder();
    var path_bytes = encoder.encode(path);
    HEAPU8.set(path_bytes, 16); // XXX 16
    HEAPU8[16 + path_bytes.length] = 0; // NUL
    fd = syscall(5, 16, 0, 0, 0, 0, 0); // open
    console.log(fd);
    if (fd < 0) {
      console.log("open() Failed: ", fd);
    }
    
    addr = 32; // XXX
    len = 0;
    do {
      bytes = syscall(3, fd, addr + len, 1024, 0, 0, 0); // read
      len += bytes;
    } while (bytes > 0);
    if (bytes < 0) {
      console.log("read() Failed: ", bytes);
    }
    console.log("Read ", len, "byte file")
    return HEAPU8.slice(addr, addr+len);
  }
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

  var PER_BLOCKING = 0x80;
  syscallAsync('personality', 
               [PER_BLOCKING, memory.buffer, waitOff],
               [],
               err => {
     // XXX handle error
              
    console.log('A');
   
    var view = new Int8Array(memory.buffer);
    view[32] = 72;
    view[33] = 101;
    view[34] = 108;
    view[35] = 108;
    view[36] = 111;
    view[37] = 32;
    view[38] = 87;
    view[39] = 111;
    view[40] = 114;
    view[41] = 108;
    view[42] = 100;
    view[43] = 33;
    view[44] = 10;
    syscall(4, 1, 32, 13);

    console.log('B');

    //syscall(252, 42);

    //console.log('C');

    var importObject = {'env': env};
    var bytes = readFileSync('hello.wasm');
    WebAssembly.instantiate(bytes, importObject).then(results => {
      // XXX envp
      results.instance.exports.main(argc, argv);
    });
  });
}

addEventListener('init', init1);
