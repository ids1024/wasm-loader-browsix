// A lot of the code here is based on code from
// https://github.com/plasma-umass/browsix-emscripten

// browsix_process = new BrowsixProcess(self, memory, 0);
// browsix_process.onSignal('init', await function(data) {
//   await browsix_process.personality(memory, waitOff);
// })

class BrowsixProcess {
  private worker: DedicatedWorkerGlobalScope;
  private msgIdSeq: number;
  private outstanding: Record<number, Function>;
  private signalHandlers: Record<string, Function[]>;

  private buffer: SharedArrayBuffer | null = null;
  private HEAP32: Int32Array | null = null;
  private waitOff: number | null = null;

  constructor(worker: DedicatedWorkerGlobalScope) {
    this.worker = worker;
    this.msgIdSeq = 1;
    this.outstanding = {};
    this.signalHandlers = {};

    worker.onmessage = BrowsixProcess.prototype.onmessage.bind(this);
  }

  public personality(buffer: SharedArrayBuffer, waitOff: number) {
    this.buffer = buffer;
    this.HEAP32 = new Int32Array(buffer);
    this.waitOff = waitOff;

    const PER_BLOCKING = 0x80;
    return this.syscallAsync("personality",
      [PER_BLOCKING, memory.buffer, this.waitOff],
      []);
  }

  // Make an asynchrounous system call
  public syscallAsync(name: string, args: any[], transferrables: any[]): Promise<any[]> {
    return new Promise((resolve) => {
      const msgId = ++this.msgIdSeq;
      this.outstanding[msgId] = (...args: any[]) => resolve(args);
      this.worker.postMessage({
        args,
        id: msgId,
        name,
      }, transferrables);
    });
  }

  // Make a synchronous system call.
  //
  // Cannot be used until the personality() system call has
  // been used to pass the SharedArrayBuffer to the kernel.
  public syscallSync(trap: number, a1: number, a2: number, a3: number, a4: number, a5: number, a6: number) {
    const HEAP32 = this.HEAP32 as Int32Array;
    const waitOff = this.waitOff as number;

    console.log("syscall", [trap, a1, a2, a3, a4, a5, a6]);

    Atomics.store(HEAP32, waitOff >> 2, 0);

    this.worker.postMessage({
      args: [a1, a2, a3, a4, a5, a6],
      trap,
    });

    Atomics.wait(HEAP32, waitOff >> 2, 0);
    Atomics.store(HEAP32, waitOff >> 2, 0);

    return Atomics.load(HEAP32, (waitOff >> 2) + 1);
  }

  // @ts-ignore
  public onSignal(type, handler) {
    if (!handler) {
      return;
    }
    if (this.signalHandlers[type]) {
      this.signalHandlers[type].push(handler);
    } else {
      this.signalHandlers[type] = [handler];
    }
  }

  private SyscallResponseFrom(ev: any) {
    const requiredOnData = ["id", "name", "args"];
    if (!ev.data) {
      return;
    }
    for (const i of requiredOnData) {
      if (!ev.data.hasOwnProperty(i)) {
        return;
      }
    }
    const args = ev.data.args;
    return {id: ev.data.id, name: ev.data.name, args};
  }

  private complete(id: number, args: any[]) {
    const cb = this.outstanding[id];
    delete this.outstanding[id];
    if (cb) {
      cb.apply(undefined, args);
    } else {
      console.log("unknown callback for msg " + id + " - " + args);
    }
  }

  private onmessage(ev: object) {
    const response = this.SyscallResponseFrom(ev);
    if (!response) {
      console.log("bad usyscall message, dropping");
      console.log(ev);
      return;
    }
    if (response.name) {
      const handlers = this.signalHandlers[response.name];
      if (handlers) {
        for (const handler of handlers) {
          handler(response);
        }
      } else {
        console.log("unhandled signal " + response.name);
      }
      return;
    }
    this.complete(response.id, response.args);
  }
}
