var SYS_restart_syscall = 0;
var SYS_exit = 1;
var SYS_fork = 2;
var SYS_read = 3;
var SYS_write = 4;
var SYS_open = 5;
var SYS_close = 6;
var SYS_waitpid = 7;
var SYS_creat = 8;
var SYS_link = 9;
var SYS_unlink = 10;
var SYS_execve = 11;
var SYS_chdir = 12;
var SYS_time = 13;
var SYS_mknod = 14;
var SYS_chmod = 15;
var SYS_lchown = 16;
var SYS_break = 17;
var SYS_oldstat = 18;
var SYS_lseek = 19;
var SYS_getpid = 20;
var SYS_mount = 21;
var SYS_umount = 22;
var SYS_setuid = 23;
var SYS_getuid = 24;
var SYS_stime = 25;
var SYS_ptrace = 26;
var SYS_alarm = 27;
var SYS_oldfstat = 28;
var SYS_pause = 29;
var SYS_utime = 30;
var SYS_stty = 31;
var SYS_gtty = 32;
var SYS_access = 33;
var SYS_nice = 34;
var SYS_ftime = 35;
var SYS_sync = 36;
var SYS_kill = 37;
var SYS_rename = 38;
var SYS_mkdir = 39;
var SYS_rmdir = 40;
var SYS_dup = 41;
var SYS_pipe = 42;
var SYS_times = 43;
var SYS_prof = 44;
var SYS_brk = 45;
var SYS_setgid = 46;
var SYS_getgid = 47;
var SYS_signal = 48;
var SYS_geteuid = 49;
var SYS_getegid = 50;
var SYS_acct = 51;
var SYS_umount2 = 52;
var SYS_lock = 53;
var SYS_ioctl = 54;
var SYS_fcntl = 55;
var SYS_mpx = 56;
var SYS_setpgid = 57;
var SYS_ulimit = 58;
var SYS_oldolduname = 59;
var SYS_umask = 60;
var SYS_chroot = 61;
var SYS_ustat = 62;
var SYS_dup2 = 63;
var SYS_getppid = 64;
var SYS_getpgrp = 65;
var SYS_setsid = 66;
var SYS_sigaction = 67;
var SYS_sgetmask = 68;
var SYS_ssetmask = 69;
var SYS_setreuid = 70;
var SYS_setregid = 71;
var SYS_sigsuspend = 72;
var SYS_sigpending = 73;
var SYS_sethostname = 74;
var SYS_setrlimit = 75;
var SYS_getrlimit = 76;
var SYS_getrusage = 77;
var SYS_gettimeofday = 78;
var SYS_settimeofday = 79;
var SYS_getgroups = 80;
var SYS_setgroups = 81;
var SYS_select = 82;
var SYS_symlink = 83;
var SYS_oldlstat = 84;
var SYS_readlink = 85;
var SYS_uselib = 86;
var SYS_swapon = 87;
var SYS_reboot = 88;
var SYS_readdir = 89;
var SYS_mmap = 90;
var SYS_munmap = 91;
var SYS_truncate = 92;
var SYS_ftruncate = 93;
var SYS_fchmod = 94;
var SYS_fchown = 95;
var SYS_getpriority = 96;
var SYS_setpriority = 97;
var SYS_profil = 98;
var SYS_statfs = 99;
var SYS_fstatfs = 100;
var SYS_ioperm = 101;
var SYS_socketcall = 102;
var SYS_syslog = 103;
var SYS_setitimer = 104;
var SYS_getitimer = 105;
var SYS_stat = 106;
var SYS_lstat = 107;
var SYS_fstat = 108;
var SYS_olduname = 109;
var SYS_iopl = 110;
var SYS_vhangup = 111;
var SYS_idle = 112;
var SYS_vm86old = 113;
var SYS_wait4 = 114;
var SYS_swapoff = 115;
var SYS_sysinfo = 116;
var SYS_ipc = 117;
var SYS_fsync = 118;
var SYS_sigreturn = 119;
var SYS_clone = 120;
var SYS_setdomainname = 121;
var SYS_uname = 122;
var SYS_modify_ldt = 123;
var SYS_adjtimex = 124;
var SYS_mprotect = 125;
var SYS_sigprocmask = 126;
var SYS_create_module = 127;
var SYS_init_module = 128;
var SYS_delete_module = 129;
var SYS_get_kernel_syms = 130;
var SYS_quotactl = 131;
var SYS_getpgid = 132;
var SYS_fchdir = 133;
var SYS_bdflush = 134;
var SYS_sysfs = 135;
var SYS_personality = 136;
var SYS_afs_syscall = 137;
var SYS_setfsuid = 138;
var SYS_setfsgid = 139;
var SYS__llseek = 140;
var SYS_getdents = 141;
var SYS__newselect = 142;
var SYS_flock = 143;
var SYS_msync = 144;
var SYS_readv = 145;
var SYS_writev = 146;
var SYS_getsid = 147;
var SYS_fdatasync = 148;
var SYS__sysctl = 149;
var SYS_mlock = 150;
var SYS_munlock = 151;
var SYS_mlockall = 152;
var SYS_munlockall = 153;
var SYS_sched_setparam = 154;
var SYS_sched_getparam = 155;
var SYS_sched_setscheduler = 156;
var SYS_sched_getscheduler = 157;
var SYS_sched_yield = 158;
var SYS_sched_get_priority_max = 159;
var SYS_sched_get_priority_min = 160;
var SYS_sched_rr_get_interval = 161;
var SYS_nanosleep = 162;
var SYS_mremap = 163;
var SYS_setresuid = 164;
var SYS_getresuid = 165;
var SYS_vm86 = 166;
var SYS_query_module = 167;
var SYS_poll = 168;
var SYS_nfsservctl = 169;
var SYS_setresgid = 170;
var SYS_getresgid = 171;
var SYS_prctl = 172;
var SYS_rt_sigreturn = 173;
var SYS_rt_sigaction = 174;
var SYS_rt_sigprocmask = 175;
var SYS_rt_sigpending = 176;
var SYS_rt_sigtimedwait = 177;
var SYS_rt_sigqueueinfo = 178;
var SYS_rt_sigsuspend = 179;
var SYS_pread64 = 180;
var SYS_pwrite64 = 181;
var SYS_chown = 182;
var SYS_getcwd = 183;
var SYS_capget = 184;
var SYS_capset = 185;
var SYS_sigaltstack = 186;
var SYS_sendfile = 187;
var SYS_getpmsg = 188;
var SYS_putpmsg = 189;
var SYS_vfork = 190;
var SYS_ugetrlimit = 191;
var SYS_mmap2 = 192;
var SYS_truncate64 = 193;
var SYS_ftruncate64 = 194;
var SYS_stat64 = 195;
var SYS_lstat64 = 196;
var SYS_fstat64 = 197;
var SYS_lchown32 = 198;
var SYS_getuid32 = 199;
var SYS_getgid32 = 200;
var SYS_geteuid32 = 201;
var SYS_getegid32 = 202;
var SYS_setreuid32 = 203;
var SYS_setregid32 = 204;
var SYS_getgroups32 = 205;
var SYS_setgroups32 = 206;
var SYS_fchown32 = 207;
var SYS_setresuid32 = 208;
var SYS_getresuid32 = 209;
var SYS_setresgid32 = 210;
var SYS_getresgid32 = 211;
var SYS_chown32 = 212;
var SYS_setuid32 = 213;
var SYS_setgid32 = 214;
var SYS_setfsuid32 = 215;
var SYS_setfsgid32 = 216;
var SYS_pivot_root = 217;
var SYS_mincore = 218;
var SYS_madvise = 219;
var SYS_getdents64 = 220;
var SYS_fcntl64 = 221;
var SYS_gettid = 224;
var SYS_readahead = 225;
var SYS_setxattr = 226;
var SYS_lsetxattr = 227;
var SYS_fsetxattr = 228;
var SYS_getxattr = 229;
var SYS_lgetxattr = 230;
var SYS_fgetxattr = 231;
var SYS_listxattr = 232;
var SYS_llistxattr = 233;
var SYS_flistxattr = 234;
var SYS_removexattr = 235;
var SYS_lremovexattr = 236;
var SYS_fremovexattr = 237;
var SYS_tkill = 238;
var SYS_sendfile64 = 239;
var SYS_futex = 240;
var SYS_sched_setaffinity = 241;
var SYS_sched_getaffinity = 242;
var SYS_set_thread_area = 243;
var SYS_get_thread_area = 244;
var SYS_io_setup = 245;
var SYS_io_destroy = 246;
var SYS_io_getevents = 247;
var SYS_io_submit = 248;
var SYS_io_cancel = 249;
var SYS_fadvise64 = 250;
var SYS_exit_group = 252;
var SYS_lookup_dcookie = 253;
var SYS_epoll_create = 254;
var SYS_epoll_ctl = 255;
var SYS_epoll_wait = 256;
var SYS_remap_file_pages = 257;
var SYS_set_tid_address = 258;
var SYS_timer_create = 259;
var SYS_timer_create = 259;
var SYS_timer_create = 259;
var SYS_timer_create = 259;
var SYS_timer_create = 259;
var SYS_timer_create = 259;
var SYS_timer_create = 259;
var SYS_timer_create = 259;
var SYS_timer_create = 259;
var SYS_statfs64 = 268;
var SYS_fstatfs64 = 269;
var SYS_tgkill = 270;
var SYS_utimes = 271;
var SYS_fadvise64_64 = 272;
var SYS_vserver = 273;
var SYS_mbind = 274;
var SYS_get_mempolicy = 275;
var SYS_set_mempolicy = 276;
var SYS_mq_open = 277;
var SYS_mq_open = 277;
var SYS_mq_open = 277;
var SYS_mq_open = 277;
var SYS_mq_open = 277;
var SYS_mq_open = 277;
var SYS_kexec_load = 283;
var SYS_waitid = 284;
var SYS_add_key = 286;
var SYS_request_key = 287;
var SYS_keyctl = 288;
var SYS_ioprio_set = 289;
var SYS_ioprio_get = 290;
var SYS_inotify_init = 291;
var SYS_inotify_add_watch = 292;
var SYS_inotify_rm_watch = 293;
var SYS_migrate_pages = 294;
var SYS_openat = 295;
var SYS_mkdirat = 296;
var SYS_mknodat = 297;
var SYS_fchownat = 298;
var SYS_futimesat = 299;
var SYS_fstatat64 = 300;
var SYS_unlinkat = 301;
var SYS_renameat = 302;
var SYS_linkat = 303;
var SYS_symlinkat = 304;
var SYS_readlinkat = 305;
var SYS_fchmodat = 306;
var SYS_faccessat = 307;
var SYS_pselect6 = 308;
var SYS_ppoll = 309;
var SYS_unshare = 310;
var SYS_set_robust_list = 311;
var SYS_get_robust_list = 312;
var SYS_splice = 313;
var SYS_sync_file_range = 314;
var SYS_tee = 315;
var SYS_vmsplice = 316;
var SYS_move_pages = 317;
var SYS_getcpu = 318;
var SYS_epoll_pwait = 319;
var SYS_utimensat = 320;
var SYS_signalfd = 321;
var SYS_timerfd_create = 322;
var SYS_eventfd = 323;
var SYS_fallocate = 324;
var SYS_timerfd_settime = 325;
var SYS_timerfd_gettime = 326;
var SYS_signalfd4 = 327;
var SYS_eventfd2 = 328;
var SYS_epoll_create1 = 329;
var SYS_dup3 = 330;
var SYS_pipe2 = 331;
var SYS_inotify_init1 = 332;
var SYS_preadv = 333;
var SYS_pwritev = 334;
var SYS_rt_tgsigqueueinfo = 335;
var SYS_perf_event_open = 336;
var SYS_recvmmsg = 337;
var SYS_fanotify_init = 338;
var SYS_fanotify_mark = 339;
var SYS_prlimit64 = 340;
var SYS_name_to_handle_at = 341;
var SYS_open_by_handle_at = 342;
var SYS_clock_adjtime = 343;
var SYS_syncfs = 344;
var SYS_sendmmsg = 345;
var SYS_setns = 346;
var SYS_process_vm_readv = 347;
var SYS_process_vm_writev = 348;
var SYS_kcmp = 349;
var SYS_finit_module = 350;
var SYS_sched_setattr = 351;
var SYS_sched_getattr = 352;
var SYS_renameat2 = 353;
var SYS_seccomp = 354;
var SYS_getrandom = 355;
var SYS_memfd_create = 356;
var SYS_bpf = 357;
var SYS_execveat = 358;
var SYS_socket = 359;
var SYS_socketpair = 360;
var SYS_bind = 361;
var SYS_connect = 362;
var SYS_listen = 363;
var SYS_accept4 = 364;
var SYS_getsockopt = 365;
var SYS_setsockopt = 366;
var SYS_getsockname = 367;
var SYS_getpeername = 368;
var SYS_sendto = 369;
var SYS_sendmsg = 370;
var SYS_recvfrom = 371;
var SYS_recvmsg = 372;
var SYS_shutdown = 373;
var SYS_userfaultfd = 374;
var SYS_membarrier = 375;
var SYS_mlock2 = 376;
var SYS_copy_file_range = 377;
var SYS_preadv2 = 378;
var SYS_pwritev2 = 379;
var SYS_pkey_mprotect = 380;
var SYS_pkey_alloc = 381;
var SYS_pkey_free = 382;
var SYS_statx = 383;
var SYS_arch_prctl = 384;
var SYS_io_pgetevents = 385;
var SYS_rseq = 386;
// A lot of the code here is based on code from
// https://github.com/plasma-umass/browsix-emscripten

var SYS_OPEN = 5;
var SYS_READ = 3;
var SYS_EXIT = 252;

function open(path, flags, mode) {
  return syscall(SYS_OPEN, path, flags, mode, 0, 0, 0);
}

function read(fd, buf, count) {
  return syscall(SYS_READ, fd, buf, count, 0, 0, 0);
}

function exit(retval) {
  return syscall(SYS_EXIT, retval, 0, 0, 0, 0, 0);
}

// Writes JS string str to WASM memory at address addr,
// as NUL-terminated UTF-8. Returns the length of the C
// string (excluding NUL byte).
function str_to_mem(str, addr) {
  // XXX integrate with allocator?
  var encoder = new TextEncoder();
  var bytes = encoder.encode(str);
  HEAPU8.set(bytes, addr);
  HEAPU8[addr + bytes.length] = 0; // NUL
  return bytes.length;
}

function readFileSync(path) {
  // XXX better error handling
  console.log('Reading ', path);
  str_to_mem(path, 16); // XXX 16
  var fd = open(16, 0, 0);
  console.log(fd);
  if (fd < 0) {
    console.log('open() Failed: ', fd);
  }
  
  var addr = 32; // XXX
  var len = 0;
  var bytes;
  do {
    bytes = read(fd, addr + len, 1024);
    len += bytes;
  } while (bytes > 0);
  if (bytes < 0) {
    console.log('read() Failed: ', bytes);
  }
  console.log('Read ', len, 'byte file');
  return HEAPU8.slice(addr, addr+len);
}

if (typeof SharedArrayBuffer !== 'function') {
}

var memory = new WebAssembly.Memory({ 
  'initial': 1024,
  'maximum': 1024,
  'shared': true
});

var HEAPU8 = new Uint8Array(memory.buffer);
var HEAP32 = new Int32Array(memory.buffer);

//console.log(typeof memory.buffer);
//console.log(memory.buffer);

var msgIdSeq = 1;
var outstanding = {};
var signalHandlers = {};

function SyscallResponseFrom(ev) {
  var requiredOnData = ['id', 'name', 'args'];
  if (!ev.data)
    return;
  for (var i = 0; i < requiredOnData.length; i++) {
    if (!ev.data.hasOwnProperty(requiredOnData[i]))
      return;
  }
  var args = ev.data.args; //.map(convertApiErrors);
  return {id: ev.data.id, name: ev.data.name, args: args};
}

function complete (id, args) {
  var cb = this.outstanding[id];
  delete this.outstanding[id];
  if (cb) {
    cb.apply(undefined, args);
  }
  else {
    console.log('unknown callback for msg ' + id + ' - ' + args);
  }
}

function addEventListener(type, handler) {
  if (!handler)
    return;
  if (this.signalHandlers[type])
    this.signalHandlers[type].push(handler);
  else
    this.signalHandlers[type] = [handler];
}

self.onmessage = function(ev) {
  var response = SyscallResponseFrom(ev);
  if (!response) {
    console.log('bad usyscall message, dropping');
    console.log(ev);
    return;
  }
  if (response.name) {
    var handlers = this.signalHandlers[response.name];
    if (handlers) {
      for (var i = 0; i < handlers.length; i++)
        handlers[i](response);
    }
    else {
      console.log('unhandled signal ' + response.name);
    }
    return;
  }
  complete(response.id, response.args);
};

function nextMsgId() {
  return ++msgIdSeq;
}

// Make an asynchrounous system call
function syscallAsync(name, args, transferrables, cb) {
  var msgId = nextMsgId();
  this.outstanding[msgId] = cb;
  self.postMessage({
    id: msgId,
    name: name,
    args: args,
  }, transferrables);
}

// XXX
var waitOff = 0;

// Make a synchronous system call.
//
// Cannot be used until the personality() system call has
// been used to pass the SharedArrayBuffer to the kernel.
function syscall(trap, a1, a2, a3, a4, a5, a6) {
  console.log('syscall', [trap, a1, a2, a3, a4, a5, a6]);

  Atomics.store(HEAP32, waitOff >> 2, 0);

  self.postMessage({
    trap: trap,
    args: [a1, a2, a3, a4, a5, a6],
  });

  Atomics.wait(HEAP32, waitOff >> 2, 0);
  Atomics.store(HEAP32, waitOff >> 2, 0);

  return Atomics.load(HEAP32, (waitOff >> 2) + 1);
}

function __browsix_syscall(trap, a1, a2, a3, a4, a5, a6) {
  console.log('__browsix_syscall', [trap, a1, a2, a3, a4, a5, a6]);

  switch (trap) {
    case SYS_read:
    case SYS_write:
    case SYS_open:
    case SYS_close:
    case SYS_unlink:
    case SYS_execve:
    case SYS_chdir:
    case SYS_getpid:
    case SYS_access:
    case SYS_kill:
    case SYS_rename:
    case SYS_mkdir:
    case SYS_rmdir:
    case SYS_dup:
    case SYS_pipe2:
    case SYS_ioctl:
    case SYS_getppid:
    case SYS_wait4:
    case SYS_llseek:
    case SYS_rt_sigaction:
    case SYS_getcwd:
    case SYS_stat64:
    case SYS_lstat64:
    case SYS_fstat64:
    case SYS_getdents64:
    case SYS_fcntl64:
    case SYS_exit_group:
    case SYS_dup3:
      return syscall(trap, a1, a2, a3, a4, a5, a6);
    default:
      console.log("Unrecognized system call ", trap);
      exit(255);
  }
}

var env = {
  __browsix_syscall: __browsix_syscall,
  memory: memory
};

function init1(data) {
  // TODO
  console.log('init1\n');

  var args = data.args[0];
  var executable = args[1];
  args = args.slice(1);
  //var environ = data.args[1];

  // TODO copy heap from args[4]

  var PER_BLOCKING = 0x80;
  syscallAsync('personality', 
    [PER_BLOCKING, memory.buffer, waitOff],
    [],
    err => {
      // XXX handle error
              
      var importObject = {'env': env};
      var bytes = readFileSync(executable);
      WebAssembly.instantiate(bytes, importObject).then(results => {

        var __heap_base = results.instance.exports.__heap_base.value;
        var argc = args.length;
        var arg_ptrs = [];
        var addr = __heap_base;
        for (var i = 0; i < args.length; i++) {
          arg_ptrs.push(addr);
          addr += str_to_mem(args[i], addr) + 1;
        }
        addr += 4 - (addr % 4);
        var argv = addr;
        for (var i = 0; i < arg_ptrs.length; i++) {
          HEAP32[addr / 4] = arg_ptrs[i];
          addr += 4;
        }

        // XXX envp
        var ret = results.instance.exports.main(argc, argv);

        exit(ret);
      });
    });
}

addEventListener('init', init1);
