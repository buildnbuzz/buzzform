import { defineConfig } from "vitest/config";

const nodeMajor = Number(process.versions.node.split(".")[0]);

// Node 25+ ships Web Storage on globalThis by default. The built-in localStorage
// is incomplete without --localstorage-file, so jsdom skips its polyfill and tests
// that call localStorage.clear() fail. --no-webstorage disables Node's API so jsdom
// can provide a full Storage implementation.
// On Node < 25 the flag does not exist (CI uses Node 20), so we must omit it there.
const modernNodeExecArgv = nodeMajor >= 25 ? ["--no-webstorage"] : [];

export default defineConfig({
  test: {
    execArgv: modernNodeExecArgv,
  },
});
