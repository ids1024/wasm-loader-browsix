MUSL := musl

all: wasm.js

wasm.js: syscall_generated.ts src/wasm.ts
	tsc

syscall_generated.ts: $(MUSL)/arch/wasm32/bits/syscall.h.in
	echo 'var SYS: Record<string, number> = {' > $@
	cpp -dN $< \
		| sed -n 's/.*__NR_\([a-z0-9_]*\).*/  \1: __NR_\1,/p' \
		| cpp -include $< - \
		| sed '/^#/d' \
		>> $@
	echo '}' >> $@

clean:
	rm -f wasm.js syscall_generated.ts
