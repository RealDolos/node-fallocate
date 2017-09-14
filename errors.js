"use strict";
/* eslint-disable new-cap, eqeqeq */

const {errno} = require("errno");
const {ffi, int, pick_one} = require("./util");

class ErrorResolverBase {
  resolve(err) {
    if (err === -1) {
      return {code: "EGENERIC", description: ""};
    }
    try {
      return this._resolve(err);
    }
    catch (ex) {
      return this._resolve_generic();
    }
  }
  _resolve_generic(err) {
    const {code = "ERROR", description = ""} = err ? errno[err] || {} : {};
    return {code, description};
  }
}

class ErrorResolverUV extends ErrorResolverBase {
  constructor(libname) {
    super();
    Object.assign(this, ffi.Library(libname, {
      uv_strerror: ["string", [int]],
      uv_err_name: ["string", [int]],
      uv_translate_sys_error: [int, [int]],
    }));
    if (!this.uv_strerror) {
      throw new Error("No UV");
    }
  }
  _resolve(err) {
    const uverr = this.uv_translate_sys_error(err);
    return {
      code: this.uv_err_name(uverr),
      description: this.uv_strerror(uverr),
    };
  }
}

const resolve_error = pick_one("resolve", "resolve_error", [
  [null, ErrorResolverUV],
  ["libuv", ErrorResolverUV],
  ["uv", ErrorResolverUV],
  [null, ErrorResolverBase],
]);


class FallocateError extends Error {
  constructor(err, message) {
    const {code = "ERROR", description = ""} = resolve_error(err);
    super(`${description || message} (${err}, ${code})`);
    this.code = code;
    this.errno = err;
  }
}

module.exports = { FallocateError };
