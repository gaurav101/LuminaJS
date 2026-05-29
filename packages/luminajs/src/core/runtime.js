/**
 * Runtime guards for browser-only APIs used by LuminaJS.
 */

/**
 * Returns true when canvas/DOM primitives are available.
 * Evaluated at call time so test environments that install globals later
 * still behave like a browser runtime.
 *
 * @returns {boolean}
 */
export function isBrowserEnvironment() {
  const hasWindow = typeof globalThis.window !== 'undefined';
  const hasDocument =
    typeof globalThis.document !== 'undefined' &&
    typeof globalThis.document.createElement === 'function';

  return hasWindow || hasDocument;
}

/**
 * Throws a deterministic error in non-browser runtimes.
 *
 * @param {string} operation
 */
export function assertBrowserEnvironment(operation) {
  if (isBrowserEnvironment()) {
    return;
  }

  throw new Error(
    `LuminaJS [runtime]: "${operation}" is browser-only. ` +
      `Run this on the client side (window/document available).`,
  );
}

/**
 * Safe instanceof check for browser globals that may be undefined in SSR.
 *
 * @param {unknown} value
 * @param {string} globalName
 * @returns {boolean}
 */
export function instanceOfGlobal(value, globalName) {
  const globalObj = /** @type {Record<string, unknown>} */ (globalThis);
  const globalCtor = globalObj[globalName];
  return typeof globalCtor === 'function' && value instanceof globalCtor;
}
