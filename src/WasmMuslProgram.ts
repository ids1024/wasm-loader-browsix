// Round 'num' up so it is aligned to a multiple of 'align'
function round_up_align(num: number, align: number): number {
  if (align === 0 || num % align === 0) {
    return num;
  }
  return num + align - num % align;
}

class WasmMuslProgram {
  public HEAPU8: Uint8Array;
  public HEAP32: Int32Array;
  public readonly __heap_base: number;
  public __heap_end: number;
  private instance: WebAssembly.Instance;
  private memory: WebAssembly.Memory;

  constructor(instance: WebAssembly.Instance, memory: WebAssembly.Memory) {
    this.instance = instance;
    this.memory = memory;
    this.HEAPU8 = new Uint8Array(memory.buffer);
    this.HEAP32 = new Int32Array(memory.buffer);
    this.__heap_base = instance.exports.__heap_base.value;
    this.__heap_end = this.__heap_base;
  }

  public run_and_exit(args: string[], environ: string[]) {
    const [argv, envp] = this.write_args_environ_to_heap(args, environ);

    // NOTE: we can't just call musl's cstart(). It is broken on WebAssembly,
    // since WebAssembly functions have a fixed number of arguments. So it isn't
    // possible to support main() with varying number of arguments when calling
    // from WebAssembly.
    this.instance.exports.__init_libc(envp, this.HEAP32[argv / 4]);
    this.instance.exports.__libc_start_init();
    const ret = this.instance.exports.main(args.length, argv, envp);
    this.instance.exports.exit(ret);
  }

  // Writes JS string str to WASM memory at address addr,
  // as NUL-terminated UTF-8. Returns the length of the C
  // string (excluding NUL byte).
  public str_to_mem(str: string, addr: number): number {
    // XXX integrate with allocator?
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    this.HEAPU8.set(bytes, addr);
    this.HEAPU8[addr + bytes.length] = 0; // NUL
    return bytes.length;
  }

  // Write argv and environ to the heap, where musl can access them
  // Reads and updates __heap_end, so it should be used before any allocation
  // Returns [argv, envp]
  private write_args_environ_to_heap(args: string[], environ: string[]): [number, number] {
    // Update to word-aligned address
    this.__heap_end = round_up_align(this.__heap_end, 4);

    // Allocate space for argv
    const argv = this.__heap_end;
    this.__heap_end += (args.length + 1) * 4;

    // Allocate space for environ
    const envp = this.__heap_end;
    this.__heap_end += (Object.keys(environ).length + 1) * 4;

    // auxv
    // http://articles.manugarg.com/aboutelfauxiliaryvectors
    this.HEAP32[this.__heap_end / 4] = 0;
    this.HEAP32[this.__heap_end / 4 + 1] = 0;
    this.__heap_end += 8;

    // Write arguments and populate argv
    for (let i = 0; i < args.length; i++) {
      this.HEAP32[argv / 4 + i] = this.__heap_end;
      this.__heap_end += this.str_to_mem(args[i], this.__heap_end) + 1;
    }
    // NULL terminate
    this.HEAP32[argv / 4 + args.length] = 0;

    // Write env variables and populate envp
    const entries = Object.entries(environ);
    for (let i = 0; i < entries.length; i++) {
      this.HEAP32[envp / 4 + i] = this.__heap_end;
      const [k, v] = entries[i];
      const entry = k + "=" + v;
      this.__heap_end += this.str_to_mem(entry, this.__heap_end) + 1;
    }
    // NULL terminate
    this.HEAP32[envp / 4 + entries.length] = 0;

    return [argv, envp];
  }
}
