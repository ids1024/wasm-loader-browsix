declare var work: any;

import * as work from 'webworkify';
import * as worker from './wasm';

async function loadModule(m: WebAssembly.Module) {
  var w = work(worker);
}
