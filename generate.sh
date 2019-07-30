#!/bin/sh

if [ -z "$MUSL" ]; then
	if [ ! -d musl ] && [ -d ../musl ]; then
		MUSL=../musl
	else
		MUSL=musl
	fi
fi

IN=$MUSL/arch/wasm32/bits/syscall.h.in
OUT=syscall_generated.ts

echo 'var SYS: Record<string, number> = {' > $OUT
cpp -dN $IN \
	| sed -n 's/.*__NR_\([a-z0-9_]*\).*/  \1: __NR_\1,/p' \
	| cpp -include $IN - \
	| sed '/^#/d' \
	>> $OUT
echo '}' >> $OUT
