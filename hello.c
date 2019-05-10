typedef int ssize_t;
typedef unsigned int size_t; 

long syscall(long, long, long, long, long, long, long);

ssize_t write(int fd, const void *buf, size_t count) {
    // XXX remember errno
    return syscall(4, fd, (long)buf, count, 0, 0, 0);
}

int main() {
    write(1, "Hello world!\n", 13);
    return 0;
}
