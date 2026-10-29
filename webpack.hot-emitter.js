// Drop-in replacement for webpack/hot/emitter.js, which the dev server's HMR client injects into
// every renderer bundle, including the preloads.
// Forge marks `events` as external for sandboxed preloads, but since Electron 45 a sandboxed
// preload's `require` can only load `electron`, so the original `require('events')` throws.
// Requesting `events/` bypasses that external and bundles the `events` polyfill instead.
const EventEmitter = require('events/');

module.exports = new EventEmitter();
