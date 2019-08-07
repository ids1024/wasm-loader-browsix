const WASM_PAGE_SIZE = 64 * 1024;

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
  public __heap_end: number;
  private instance: WebAssembly.Instance;
  private memory: WebAssembly.Memory;

  constructor(instance: WebAssembly.Instance, memory: WebAssembly.Memory) {
      this.instance = instance;
      this.memory = memory;
      this.HEAPU8 = new Uint8Array(memory.buffer);
      this.HEAP32 = new Int32Array(memory.buffer);
      this.__heap_end = instance.exports.__heap_base.value;
  }

  public run_and_exit(args: string[], environ: string[]) {
      const [argv, envp] = this.write_args_environ_to_heap(args, environ);

      // NOTE: we can't just call musl's _start_c(). It is broken on WebAssembly,
      // since WebAssembly functions have a fixed number of arguments. So it isn't
      // possible to support main() with varying number of arguments when calling
      // from WebAssembly.
      this.instance.exports.__init_libc(envp, this.HEAP32[argv / 4]);
      this.instance.exports.__libc_start_init();
      const ret = this.instance.exports.main(args.length, argv, envp);
      this.instance.exports.exit(ret);
  }

  public brk(end: number) {
      let pages = this.memory.buffer.byteLength / WASM_PAGE_SIZE;
      let new_pages = (end + WASM_PAGE_SIZE - 1) / WASM_PAGE_SIZE;
      if (new_pages > pages) {
          this.memory.grow(new_pages - pages);
      }
      this.__heap_end = end;
  }

  public sbrk(n: number): number {
      let prev_end = this.__heap_end;
      this.brk(this.__heap_end + n);
      return prev_end;
  }

  // Allocates WASM memory with brk() and writes JS string str,
  // as NUL-terminated UTF-8. Returns address of the start of
  // the string.
  private str_to_mem(str: string): number {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      let addr = this.sbrk(bytes.length + 1);
      this.HEAPU8.set(bytes, addr);
      this.HEAPU8[addr + bytes.length] = 0; // NUL
      return addr;
  }

  // Write argv and environ to the heap, where musl can access them
  // Reads and updates __heap_end, so it should be used before any allocation
  // Returns [argv, envp]
  private write_args_environ_to_heap(args: string[], environ: string[]): [number, number] {
      // Update to word-aligned address
      this.__heap_end = round_up_align(this.__heap_end, 4);

      // Allocate space for argv
      const argv = this.sbrk((args.length + 1) * 4);

      // Allocate space for environ
      const envp = this.sbrk((Object.keys(environ).length + 1) * 4);

      // http://articles.manugarg.com/aboutelfauxiliaryvectors
      const auxv = this.sbrk(8);
      this.HEAP32[auxv / 4] = 0;
      this.HEAP32[auxv / 4 + 1] = 0;

      // Write arguments and populate argv
      for (let i = 0; i < args.length; i++) {
          this.HEAP32[argv / 4 + i] = this.str_to_mem(args[i]);
      }
      // NULL terminate
      this.HEAP32[argv / 4 + args.length] = 0;

      // Write env variables and populate envp
      const entries = Object.entries(environ);
      for (let i = 0; i < entries.length; i++) {
          const [k, v] = entries[i];
          const entry = k + "=" + v;
          this.HEAP32[envp / 4 + i] = this.str_to_mem(entry);
      }
      // NULL terminate
      this.HEAP32[envp / 4 + entries.length] = 0;

      return [argv, envp];
  }
}
