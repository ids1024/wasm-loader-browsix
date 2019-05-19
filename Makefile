CFLAGS := -nostdlib  --target=wasm32 -Os -nostdinc -isystem $(PWD)/musl/include -isystem $(PWD)/musl/arch/wasm32 -isystem $(PWD)/musl/obj/include
LDFLAGS := -Wl,--no-entry -Wl,--export=main -Wl,--allow-undefined-file=functions -Wl,--import-memory -Wl,--shared-memory -Wl,--max-memory=67108864 -L$(PWD)/musl/lib -L$(PWD)/compiler-rt/build/lib/generic -Wl,--whole-archive -lc -lclang_rt.builtins-wasm32

hello.wasm: hello.c
	clang $(CFLAGS) $(LDFLAGS) $< -o $@

clean:
	rm -f hello.wasm
