"use strict";
/* eslint-disable new-cap, eqeqeq */

const {fork} = require("child_process");
const fs = require("fs");
const {FallocateError} = require("./errors");
const {
  ffi,
  int,
  int64,
  off_guess_t,
  pick_one,
} = require("./util");

const UNKNOWN_ERROR = -1;

class FallocateBase {
  constructor() {
    this.fn = null;
  }

  fallocate(path, offset, length, mode) {
    const fd = fs.openSync(path, "a", {encoding: null});
    try {
      this.ffallocate(fd, offset, length, mode);
    }
    finally {
      fs.closeSync(fd);
    }
  }

  ffallocate(fd, offset, length, mode) {
    if (!this.fn) {
      throw new FallocateError(UNKNOWN_ERROR, "Not implemented");
    }
    mode = mode || 0;
    if (offset < 0 || offset !== (offset | 0)) {
      throw new FallocateError(UNKNOWN_ERROR, "Invalid offset");
    }
    if (length < 1 || length !== (length | 0)) {
      throw new FallocateError(UNKNOWN_ERROR, "Invalid length");
    }
    if (mode && mode !== (mode | 0)) {
      throw new FallocateError(UNKNOWN_ERROR, "Invalid mode");
    }
    return this._fallocate(fd, offset, length, mode);
  }

  _fallocate(fd, offset, length, mode) {
    const {fn} = this;
    const rv = fn(fd, mode, offset, length);
    if (rv != 0) {
      throw new FallocateError(ffi.errno() || rv, "Allocation failed");
    }
  }
}

class Fallocate64 extends FallocateBase {
  constructor(libname) {
    super();
    const {fallocate64: fallocate} = ffi.Library(libname, {
      fallocate64: [int, [int, int, int64, int64]],
    });
    this.fn = fallocate;
    if (!this.fn) {
      throw new FallocateError(UNKNOWN_ERROR, "Implemention not available");
    }
  }
}

class Fallocate extends FallocateBase {
  constructor(libname) {
    super();
    const {fallocate} = ffi.Library(libname, {
      fallocate: [int, [int, int, off_guess_t, off_guess_t]],
    });
    this.fn = fallocate;
    if (!this.fn) {
      throw new FallocateError(UNKNOWN_ERROR, "Implemention not available");
    }
  }
}

class PosixFallocateBase extends FallocateBase {
  _fallocate(fd, offset, length, mode) {
    if (mode) {
      throw new FallocateError(
        UNKNOWN_ERROR, "Invalid mode supplied for posix_fallocate");
    }
    const {fn} = this;
    const rv = fn(fd, offset, length);
    if (rv != 0) {
      throw new FallocateError(rv, "Allocation failed");
    }
  }
}

class PosixFallocate64 extends PosixFallocateBase {
  constructor(libname) {
    super();
    const {posix_fallocate64: fallocate} = ffi.Library(libname, {
      posix_fallocate64: [int, [int, int64, int64]],
    });
    this.fn = fallocate;
    if (!this.fn) {
      throw new FallocateError(0, "Implemention not available");
    }
  }
}

class PosixFallocate extends PosixFallocateBase {
  constructor(libname) {
    super();
    const {posix_fallocate: fallocate} = ffi.Library(libname, {
      posix_fallocate: [int, [int, off_guess_t, off_guess_t]],
    });
    this.fn = fallocate;
    if (!this.fn) {
      throw new FallocateError(0, "Implemention not available");
    }
  }
}

class PosixFallocateFallocate extends PosixFallocateBase {
  constructor() {
    super();
    this._fallocate = (fd, offset, length) => {
      return fallocateSync(fd, offset, length, 0);
    };
    this.fn = true;
  }
}

const fallocateSync = pick_one("fallocate", "fallocateSync", [
  [null, Fallocate64],
  ["libc", Fallocate64],
  ["c", Fallocate64],
  [null, Fallocate],
  ["libc", Fallocate],
  ["c", Fallocate],
  [null, FallocateBase],
]);

const posix_fallocateSync = pick_one("fallocate", "posix_fallocateSync", [
  [null, PosixFallocate64],
  ["libc", PosixFallocate64],
  ["c", PosixFallocate64],
  [null, PosixFallocate],
  ["libc", PosixFallocate],
  ["c", PosixFallocate],
  [null, PosixFallocateFallocate],
  [null, PosixFallocateBase],
]);

const ffallocateSync = pick_one("ffallocate", "ffallocateSync", [
  [null, Fallocate64],
  ["libc", Fallocate64],
  ["c", Fallocate64],
  [null, Fallocate],
  ["libc", Fallocate],
  ["c", Fallocate],
  [null, FallocateBase],
]);

const fposix_fallocateSync = pick_one("ffallocate", "fposix_fallocateSync", [
  [null, PosixFallocate64],
  ["libc", PosixFallocate64],
  ["c", PosixFallocate64],
  [null, PosixFallocate],
  ["libc", PosixFallocate],
  ["c", PosixFallocate],
  [null, PosixFallocateFallocate],
  [null, PosixFallocateBase],
]);

let _worker;
let _jobs = 0;
const _inflight = new Map();

function ensureWorker() {
  if (_worker) {
    return;
  }
  _worker = fork(`${__dirname}/subprocess.js`);
  _worker.on("exit", () => {
    _worker = null;
  });
  _worker.on("error", () => {
    _worker = null;
  });
  _worker.on("message", msg => {
    const {error = null, errno = 0, path, job} = msg;
    const cb = _inflight.get(job);
    if (!cb) {
      return;
    }
    _inflight.delete(job);
    if (errno || error) {
      try {
        cb(new FallocateError(errno, error));
      }
      catch (ex) {
        cb(ex);
      }
      return;
    }
    cb(null, path);
  });
}

function _scheduleInternal(method, path, offset, length, mode, cb) {
  ensureWorker();
  const job = ++_jobs;
  _worker.send({job, method, path, offset, length, mode}, null, err => {
    if (err) {
      cb(err);
      return;
    }
    _inflight.set(job, cb);
  });
}

function _schedule(method, path, offset, length, mode, cb) {
  if (!cb && typeof mode !== "number") {
    cb = mode;
    mode = 0;
  }
  let rv;
  if (!cb) {
    rv = new Promise((resolve, reject) => {
      cb = (err, path) => {
        if (err) {
          return reject(err);
        }
        return resolve(path);
      };
    });
  }
  _scheduleInternal(method, path, offset, length, mode, cb);
  return rv;
}

const fallocate = _schedule.bind(null, "fallocateSync");
Object.defineProperty(fallocate, "name", { value: "fallocate" });
const posix_fallocate = _schedule.bind(null, "posix_fallocateSync");
Object.defineProperty(posix_fallocate, "name", { value: "posix_fallocate" });

module.exports = {
  FallocateError,
  fallocate,
  fallocateSync,
  ffallocateSync,
  posix_fallocate,
  posix_fallocateSync,
  fposix_fallocateSync,
};
