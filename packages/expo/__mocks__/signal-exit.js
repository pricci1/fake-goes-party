'use strict';
// write-file-atomic@4.x expects signal-exit@3.x where the default export is a function.
// Bun resolves it to signal-exit@4.x which uses named exports. Use the v3 shim.
try {
  module.exports = require('/home/user/fake-goes-party/node_modules/.bun/signal-exit@3.0.7/node_modules/signal-exit/index.js');
} catch {
  const { onExit } = require('signal-exit');
  module.exports = Object.assign(onExit, { onExit });
}
