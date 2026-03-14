/**
 * Must run before Vite loads. Use: set NODE_OPTIONS=--require ./vite-crypto-polyfill.cjs
 * Then: npx vite
 * Fixes "crypto.hash is not a function" on Node 18/20 (Windows).
 */
const { createHash } = require('node:crypto');
if (typeof globalThis.crypto?.hash !== 'function') {
  globalThis.crypto = { ...globalThis.crypto, hash: (alg) => createHash(alg) };
}
