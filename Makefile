CFLAGS := -nostdlib  --target=wasm32 -Os -nostdinc -isystem $(PWD)/musl/include -isystem $(PWD)/musl/arch/wasm32 -isystem $(PWD)/musl/obj/include
LDFLAGS := -Wl,--no-entry -Wl,--export=__init_libc -Wl,--export=main -Wl,--export=exit -Wl,--export=__libc_start_init -Wl,--allow-undefined-file=functions -Wl,--import-memory -Wl,--shared-memory -Wl,--max-memory=67108864 -L$(PWD)/musl/lib -L$(PWD)/compiler-rt/build/lib/generic -Wl,--whole-archive -lc -lclang_rt.builtins-wasm32

all: wasm.js hello.wasm

wasm.js: syscall.js wasm.ts
	tsc --lib es2019,webworker --allowJs $^ --outFile $@

syscall.js: musl/arch/wasm32/bits/syscall.h.in
	echo 'var SYS = {' > $@
	cpp -dN $< \
		| sed -n 's/.*__NR_\([a-z0-9_]*\).*/  \1: __NR_\1,/p' \
		| cpp -include $< - \
		| sed '/^#/d' \
		>> $@
	echo '}' >> $@

hello.wasm: hello.c
	clang $(CFLAGS) $(LDFLAGS) $< -o $@

clean:
	rm -f hello.wasm wasm.js
