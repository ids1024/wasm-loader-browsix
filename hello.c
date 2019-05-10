typedef int ssize_t;
typedef unsigned int size_t; 

long syscall(long, long, long, long, long, long, long);

ssize_t write(int fd, const void *buf, size_t count) {
    // XXX remember errno
    return syscall(4, (long)buf, count, 0, 0, 0, 0);
    /*
      var SYS_WRITE = 4;
      var fd = SYSCALLS.get(), buf = SYSCALLS.get(), count = SYSCALLS.get();
      return SYSCALLS.browsix.syscall.sync(SYS_WRITE, fd, buf, count);
      */
}

void exit(int status) {
    //syscall(0, status);
}

int main() {
    //syscall(1);
    //syscall(1, 2, 3, 4, 5, 6, 7);
    write(1, "Hello world!\n", 13);
    //exit(2);
    return 0;
}
