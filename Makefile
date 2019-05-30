MUSL := musl

all: wasm.js

wasm.js: syscall.js wasm.ts
	tsc --lib es2019,esnext.bigint,webworker --allowJs $^ --outFile $@

syscall.js: $(MUSL)/arch/wasm32/bits/syscall.h.in
	echo 'var SYS = {' > $@
	cpp -dN $< \
		| sed -n 's/.*__NR_\([a-z0-9_]*\).*/  \1: __NR_\1,/p' \
		| cpp -include $< - \
		| sed '/^#/d' \
		>> $@
	echo '}' >> $@

clean:
	rm -f wasm.js
