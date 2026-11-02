const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const { notarize } = require('@electron/notarize');

const execFileAsync = promisify(execFile);

// Delays between staple attempts (5 attempts total). Apple's stapler intermittently fails with
// NSURLErrorDomain -1005 ("staple ... Error 68"); @electron/notarize only retries it for a few seconds.
const STAPLE_RETRY_DELAYS_MS = [15000, 30000, 60000, 120000];

// Message thrown by @electron/notarize's internal stapleApp (lib/staple.js) once its own retries run out.
const STAPLE_FAILURE_PREFIX = 'Failed to staple your application';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, { delaysMs, label, log = console.log }) => {
  const maxAttempts = delaysMs.length + 1;
  for (let attempt = 1; ; attempt++) {
    log(`${label}: attempt ${attempt}/${maxAttempts}`);
    try {
      const result = await fn(attempt);
      log(`${label}: attempt ${attempt}/${maxAttempts} succeeded`);
      return result;
    } catch (err) {
      if (attempt >= maxAttempts) {
        log(`${label}: attempt ${attempt}/${maxAttempts} failed, giving up`);
        throw err;
      }
      const delay = delaysMs[attempt - 1];
      log(`${label}: attempt ${attempt}/${maxAttempts} failed (${err.message.trim()}), retrying in ${delay / 1000}s`);
      await sleep(delay);
    }
  }
};

const stapleApp = async (appPath) => {
  await execFileAsync('xcrun', ['stapler', 'staple', '-v', path.basename(appPath)], {
    cwd: path.dirname(appPath),
  });
};

const notarizeApp = async (appPath, { stapleDelaysMs = STAPLE_RETRY_DELAYS_MS, staple = stapleApp } = {}) => {
  const label = `Notarize ${appPath}`;
  const start = Date.now();
  console.log(`${label}: submitting to Apple and waiting for the result...`);
  try {
    // Submits, waits for Apple's verdict, then staples (with @electron/notarize's own short retry).
    await notarize({
      appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.LOADMILL_KEY_CODE,
      tool: 'notarytool',
    });
    console.log(`${label}: notarized and stapled in ${Math.round((Date.now() - start) / 1000)}s`);
    return;
  } catch (err) {
    // Submission/rejection errors fail immediately; only a stapling failure is retried, without resubmitting.
    if (!String(err && err.message).startsWith(STAPLE_FAILURE_PREFIX)) {
      throw err;
    }
    console.log(`${label}: notarized, but stapling failed: ${err.message.trim()}`);
  }
  await retryWithBackoff(() => staple(appPath), {
    delaysMs: stapleDelaysMs,
    label: `Staple ${appPath}`,
  });
  console.log(`${label}: notarized and stapled in ${Math.round((Date.now() - start) / 1000)}s`);
};

// Forge postPackage hook: outputPaths are the packager output dirs (e.g. out/Loadmill-darwin-x64), one per arch.
const notarizePackagedApps = async (outputPaths) => {
  const appPaths = outputPaths.flatMap((outputPath) => fs.readdirSync(outputPath)
    .filter((entry) => entry.endsWith('.app'))
    .map((entry) => path.join(outputPath, entry)));
  if (appPaths.length === 0) {
    throw new Error(`No .app found to notarize in ${outputPaths.join(', ')}`);
  }
  await Promise.all(appPaths.map((appPath) => notarizeApp(appPath)));
};

module.exports = {
  notarizeApp,
  notarizePackagedApps,
  retryWithBackoff,
  stapleApp,
};
