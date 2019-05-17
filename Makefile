CFLAGS := -nostdlib  --target=wasm32 -Os
LDFLAGS := -Wl,--no-entry -Wl,--export=main -Wl,--allow-undefined-file=functions -Wl,--import-memory -Wl,--shared-memory -Wl,--max-memory=67108864

hello.wasm: hello.c
	clang $(CFLAGS) $(LDFLAGS) $< -o $@

clean:
	rm -f hello.wasm
