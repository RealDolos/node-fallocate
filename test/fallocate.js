"use strict";
/* eslint-disable no-undef, no-magic-numbers */

const fs = require("fs");

require("mocha");
require("should");

// cannot use /tmp, as it's often tmpfs and refused fallocate
const TEST_ALLOC = "test.alloc";

function checkSize(fd, size) {
  const {size: actualSize = 0} = fs.fstatSync(fd);
  actualSize.should.equal(size);
}

async function doAlloc(method, offset, size, mode, cb) {
  if (!cb) {
    cb = mode;
    mode = 0;
  }
  const fd = fs.openSync(TEST_ALLOC, "w", {encoding: null});
  try {
    checkSize(fd, 0);
    try {
      await method(TEST_ALLOC, offset, size, mode);
      cb(null, fd);
    }
    catch (ex) {
      cb(ex);
    }
  }
  finally {
    try {
      fs.closeSync(fd);
    }
    catch (ex) {
      // ignore
    }
    try {
      fs.unlinkSync(TEST_ALLOC);
    }
    catch (ex) {
      // ignore
    }
  }
}

async function shouldSize(method, size) {
  await doAlloc(method, 0, size, (err, fd) => checkSize(fd, size));
}


describe("fallocate tests", function() {
  const {
    FallocateError,
    fallocate,
    fallocateSync,
    posix_fallocate,
    posix_fallocateSync,
  } = require("../fallocate");

  for (const method of [
    posix_fallocate,
    posix_fallocateSync,
    fallocate,
    fallocateSync]) {
    it(`${method.name} power2 size`, async () => {
      await shouldSize(method, 1 << 20);
    });

    it(`${method.name} unpower2 size`, async () => {
      await shouldSize(method, (1 << 20) + 1);
    });

    it(`${method.name} invalid offsets`, async () => {
      await doAlloc(method, -1, 1, err => {
        err.should.instanceof(FallocateError);
        err.code.should.equal("EGENERIC");
        err.errno.should.equal(-1);
        err.message.should.match(/offset/);
      });
      await doAlloc(method, NaN, 1, err => {
        err.should.instanceof(FallocateError);
        err.code.should.equal("EGENERIC");
        err.errno.should.equal(-1);
        err.message.should.match(/offset/);
      });
      await doAlloc(method, 1.09, 1, err => {
        err.should.instanceof(FallocateError);
        err.code.should.equal("EGENERIC");
        err.errno.should.equal(-1);
        err.message.should.match(/offset/);
      });
    });

    it(`${method.name} invalid lengths`, async () => {
      await doAlloc(method, 0, -1, err => {
        err.should.instanceof(FallocateError);
        err.code.should.equal("EGENERIC");
        err.errno.should.equal(-1);
        err.message.should.match(/length/);
      });
      await doAlloc(method, 0, NaN, err => {
        err.should.instanceof(FallocateError);
        err.code.should.equal("EGENERIC");
        err.errno.should.equal(-1);
        err.message.should.match(/length/);
      });
      await doAlloc(method, 0, 1.09, err => {
        err.should.instanceof(FallocateError);
        err.code.should.equal("EGENERIC");
        err.errno.should.equal(-1);
        err.message.should.match(/length/);
      });
      await doAlloc(method, 0, Infinity, err => {
        err.should.instanceof(FallocateError);
        err.code.should.equal("EGENERIC");
        err.errno.should.equal(-1);
        err.message.should.match(/length/);
      });
    });
  }

  it(`${posix_fallocateSync.name} any mode other than 0`, async () => {
    await doAlloc(posix_fallocateSync, 0, 1, 1, err => {
      err.should.instanceof(FallocateError);
      err.code.should.equal("EGENERIC");
      err.errno.should.equal(-1);
      err.message.should.match(/mode/);
    });
  });
});
