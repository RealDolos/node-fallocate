fallocate for node
---

Because files matter!


Usage
===

Prefer `posix_fallocate` over `fallocate` as it is more portable.
`offset` and `length` have po be integers.

```js
const {posix_fallocate, fallocate /* linux only */} = require("fallocate");

posix_fallocate("some_file", 0 /* offset */, 1<<20).
  then(console.log).
  catch(console.error);
posix_fallocate("some_file", 0 /* offset */, 1<<20, (err, path) => {
  if (err) {
    console.error(err);
  }
  else {
    console.log(path);
  }
});

fallocate("some_file", 0 /* offset */, 1<<20, 0 /* mode */).
  then(console.log).
  catch(console.error);
fallocate("some_file", 0 /* offset */, 1<<20, 0 /* mode */, (err, path) => {
  if (err) {
    console.error(err);
  }
  else {
    console.log(path);
  }
});

posix_fallocateSync("some_file", 0 /* offset */, 1<<20);
fallocateSync("some_file", 0 /* offset */, 1<<20, 0 /* mode */);

const fd = fs.openSync("some_file", "w", {encoding: null});
try {
  fposix_fallocateSync(fd, 0 /* offset */, 1<<20);
  ffallocateSync(fd, 0 /* offset */, 1<<20, 0 /* mode */);
}
finally {
  fs.closeSync(fd);
}
```


Errors
===

Errors are either errors as returned by underlying APIs, or `FallocateError`s.
`FallocateError` additionally exposes `.errno` and `.code`.


Limitations
===

Unfortunately the `fposix_allocateSync` and `ffallocateSync` cannot be in an
async fashion, due to node not offering a proper way to pass file descriptors
to child processes (only sockets and such).

If your OS or rather libc doesn't provide *64 implementations for offsets, the
off_t sizes are guesses.


Supported platforms
===

At the moment only Linux is supported. BSDs might be supported when they provide
a `posix_fallocate` implementation.

Windows are not supported for lack of support of this API. However, maxos offers
APIs which can be used to simulate the functionality. This is not implemented at
the moment, tho.

Unsupported plaforms will always raise an error.


Implementation details
===

- Implemented using `ffi`, no binary components.
- Async functions implemented using a `child_process` performing the actual
  allocation. That worker is started on demand and kept alive until the parent
  process exits.
  If you're messing with the working directory after the first `fallocate` call
  make sure to pass a qualified path.
- Files will be opened with `a` (unless using the function taking an `fd`).
