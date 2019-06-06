wasm-loader-browsix
===================

This is an experimental implementation for a WebAssembly loader for [Browsix](https://github.com/plasma-umass/browsix), intended for use with musl, as an alternative to the [emscriten fork](https://github.com/plasma-umass/browsix-emscripten) Browsix provides.

This is only partly functional.

Building
--------
Building just requires `tsc` and `cpp` (TypeScript and the C preprocessor). Then it should be possible to build with just `make`.

But it's not really useful without compiling something to WebAssembly. See the [emscriptenless branch of ids1024/browsix-busybox](https://github.com/ids1024/browsix-busybox/tree/emscriptenless) for an example.

Design
------
The relies on Browsix's asynchronous system call API, and requires the not-yet-standardized [WebAssembly threads proposal](https://github.com/WebAssembly/threads). The support for this exists in the latest versions of Chrome and Firefox, but it may be necessary to manually enabled support for `SharedArrayBuffer`, which browser have disabled since it suffers from vulnerabilities related to Spectre.

The design here is based on emulating Linux at the system call level, and letting musl make system calls into Javascript using the same API as normal Linux system calls. This is similar to Emscripten.

The loader provides a single function to WebAssembly, called `__browsix_syscall`. Calls provided by the Browsix kernel are passed through to it directly, while some others are handled here. Currently, many calls are not implemented yet.
