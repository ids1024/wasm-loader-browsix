CFLAGS := -nostdlib -Wl,--no-entry -Wl,--export=main -Wl,--allow-undefined-file=functions -Wl,--import-memory --target=wasm32 -Os

hello.wasm: hello.c
	clang $(CFLAGS) $< -o $@

clean:
	rm -f hello.wasm
