if (typeof window === 'object')
  var isBrowser = true;
else
  var isNode = true;

if (isNode) {
  var fs = require('fs');
  var readFile = fs.promises.readFile;

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
  function readFile(path) {
    return fetch(path).then(resp => resp.arrayBuffer());
  }
}

if (typeof SharedArrayBuffer !== 'function') {
}

wasmMemory = new WebAssembly.Memory({ 
  'initial': 1024,
  'shared': true
});

HEAP32 = new Int32Array(wasmMemory.buffer);

//console.log(typeof wasmMemory.buffer);
//console.log(wasmMemory.buffer);

env = {
  syscall: syscall, 
  memory: wasmMemory
}

function syscall(trap, a1, a2, a3, a4, a5, a6) {
  var syncMsg = {
    trap: trap,
    args: [a1, a2, a3, a4, a5, a6],
  };

  //self.postMessage(syncMsg);

  //Atomics.store(HEAP32, waitOff >> 2, 0);
}

// https://developer.mozilla.org/en-US/docs/WebAssembly/Loading_and_running
var importObject = {'env': env};
readFile('hello.wasm').then(bytes =>
  WebAssembly.instantiate(bytes, importObject)
).then(results => {
  // XXX envp
  results.instance.exports.main(argc, argv);
});
