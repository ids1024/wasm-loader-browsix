// Webworker
if(typeof importScripts === 'function')
  var isBrosix = true;
else
  var isNode = true;

if (isNode) {
  var fs = require('fs');
  var readFileAsync = fs.ReadFile;

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
  function readFileAsync(path) {
    fd = syscall(5, path, 0, 0, 0, 0, 0);
    // TODO
  }
}

if (typeof SharedArrayBuffer !== 'function') {
}

memory = new WebAssembly.Memory({ 
  'initial': 1024,
  'maximum': 1024,
  'shared': true
});

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

var PER_BLOCKING = 0x80;
syscallAsync('personality', 
             [PER_BLOCKING, memory.buffer, waitOff],
             [],
             err => {
   // XXX handle error
 
  var importObject = {'env': env};
  readFile('hello.wasm').then(bytes =>
    WebAssembly.instantiate(bytes, importObject)
  ).then(results => {
    // XXX envp
    results.instance.exports.main(argc, argv);
  });
});

