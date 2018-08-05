#!/bin/env node

const {
  f_console_fatal
} = require("ccc_console");

const {
  TC_mediorg
} = require("./TC_mediorg");


try {
  const lo_mediorg = new TTC_mediorg();
  lo_mediorg.m_run();
}

catch (po_err) {
  f_console_fatal(`caught unexpected error [${po_err}]`);
}
