"use strict";

function pick_one(symbol, name, cands) {
  for (const [lib, CLS] of cands) {
    try {
      const inst = new CLS(lib);
      const method = inst[symbol].bind(inst);
      Object.defineProperty(method, "name", { value: name || CLS.name });
      return method;
    }
    catch (ex) {
      // ignore
    }
  }
  return null;
}

const ffi = require("ffi");
const ref = require("ref");

const {int, int32, int64, void: void_t} = ref.types;
const void_ptr_t = ref.refType(void_t);
const SMALL = 4;
const off_guess_t = void_ptr_t.size > SMALL ? int64 : int32;


module.exports = {
  ffi,
  int,
  int32,
  int64,
  off_guess_t,
  pick_one,
  ref,
};
