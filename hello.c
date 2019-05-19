#include <unistd.h>

typedef int ssize_t;
typedef unsigned int size_t; 

int main(int argc, char **argv) {
    write(1, "Hello world!\n", 13);
    return 0;
}
