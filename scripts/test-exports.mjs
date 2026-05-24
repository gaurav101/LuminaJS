/* global console */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const distModule = await import('../dist/lumina.esm.js');
assert.equal(typeof distModule.lumina, 'function');
assert.equal(typeof distModule.loadImage, 'function');

const pkgModule = await import('@gks101/luminajs');
assert.equal(typeof pkgModule.lumina, 'function');

const reactModule = await import('@gks101/luminajs/react');
assert.equal(typeof reactModule.useLumina, 'function');

let cjsError = null;
try {
  require('@gks101/luminajs');
} catch (error) {
  cjsError = error;
}

assert.ok(
  cjsError,
  'CommonJS require should fail for strict ESM-only package.',
);
assert.equal(cjsError.code, 'ERR_PACKAGE_PATH_NOT_EXPORTED');

let runtimeGuardCaught = false;
try {
  await distModule.lumina('https://example.com/image.jpg').render();
} catch (error) {
  runtimeGuardCaught =
    error instanceof Error &&
    error.message.includes('browser-only') &&
    error.message.includes('client side');
}

assert.ok(
  runtimeGuardCaught,
  'Browser-only runtime guard should throw a deterministic error in Node.',
);

console.log('Export/runtime compatibility checks passed.');
