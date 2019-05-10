CFLAGS := -nostdlib -Wl,--no-entry -Wl,--export=main -Wl,--allow-undefined-file=functions -Wl,--import-memory -Wl,--shared-memory -Wl,--max-memory=67108864 --target=wasm32 -Os

hello.wasm: hello.c
	clang $(CFLAGS) $< -o $@

clean:
	rm -f hello.wasm
