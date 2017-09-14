"use strict";

const fallocate = require("./fallocate");

function process_message(msg) {
  const {method, offset, length, mode, path, job} = msg;
  try {
    fallocate[method](path, offset, length, mode);
    process.send({job, path});
  }
  catch (ex) {
    const {message, errno = -1} = ex;
    process.send({error: message, errno, job, path});
  }
}

process.on("message", process_message);
process.on("error", () => {});
