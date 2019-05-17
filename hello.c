typedef int ssize_t;
typedef unsigned int size_t; 

long syscall(long, long, long, long, long, long, long);

ssize_t write(int fd, const void *buf, size_t count) {
    // XXX remember errno
    return syscall(4, fd, (long)buf, count, 0, 0, 0);
}

//void exit(int status) {
//    syscall(252, status, 0, 0, 0, 0, 0);
//    asm("unreachable");
//}

int main(int argc, char **argv) {
    write(1, "Hello world!\n", 13);
    write(1, argv[1], 4);
    write(1, "\n", 1);
    return 0;
}
