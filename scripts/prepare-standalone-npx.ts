import { error as logError, log as logInfo } from 'console';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

import * as tar from 'tar';

import { getElectronNodeVersion } from './electron-node-version';

const NODE_VERSION = getElectronNodeVersion();
const TARGET_DIR = 'standalone_npx';

async function downloadAndExtractNode(): Promise<void> {
  const platform = process.platform === 'darwin' ? 'darwin' : process.platform === 'win32' ? 'win' : 'linux';
  const arch = process.arch === 'x64' ? 'x64' : process.arch === 'arm64' ? 'arm64' : 'x64';
  const ext = platform === 'win' ? 'zip' : 'tar.gz';

  const nodeUrl = `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${platform}-${arch}.${ext}`;
  const tempFile = `node-v${NODE_VERSION}-${platform}-${arch}.${ext}`;
  const tempDir = `node-v${NODE_VERSION}-${platform}-${arch}`;

  logInfo(`Downloading Node.js ${NODE_VERSION} from ${nodeUrl}...`);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(tempFile);
    https.get(nodeUrl, (response) => {
      response.pipe(file);
      file.on('finish', async () => {
        file.close();

        try {
          // Extract the archive
          if (ext === 'tar.gz') {
            await tar.x({ cwd: '.', file: tempFile });
          } else {
            // For Windows zip files, you'd need additional handling
            throw new Error('Windows zip extraction not implemented in this example');
          }

          // Move and clean up the extracted directory
          if (fs.existsSync(TARGET_DIR)) {
            fs.rmSync(TARGET_DIR, { force: true, recursive: true });
          }

          fs.renameSync(tempDir, TARGET_DIR);
          fs.unlinkSync(tempFile);

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (err) => {
      fs.unlink(tempFile, () => { });
      reject(err);
    });
  });
}

function cleanupNodeDist(): void {
  logInfo('Cleaning up Node.js distribution...');

  const keep = new Set(['lib']);
  const items = fs.readdirSync(TARGET_DIR);
  for (const item of items) {
    if (!keep.has(item)) {
      const itemPath = path.join(TARGET_DIR, item);
      logInfo(`Removing ${itemPath}`);
      fs.rmSync(itemPath, { force: true, recursive: true });
    }
  }

  // Remove everything from lib except node_modules/npm
  const libDir = path.join(TARGET_DIR, 'lib');
  if (fs.existsSync(libDir)) {
    const libItems = fs.readdirSync(libDir);
    for (const item of libItems) {
      if (item !== 'node_modules') {
        const itemPath = path.join(libDir, item);
        logInfo(`Removing ${itemPath}`);
        fs.rmSync(itemPath, { force: true, recursive: true });
      }
    }

    // Remove everything from node_modules except npm
    const nodeModulesDir = path.join(libDir, 'node_modules');
    if (fs.existsSync(nodeModulesDir)) {
      const nodeModulesItems = fs.readdirSync(nodeModulesDir);
      for (const item of nodeModulesItems) {
        if (item !== 'npm') {
          const itemPath = path.join(nodeModulesDir, item);
          logInfo(`Removing ${itemPath}`);
          fs.rmSync(itemPath, { force: true, recursive: true });
        }
      }
    }

    // Remove redundant files from lib/node_modules/npm
    const npmDir = path.join(libDir, 'node_modules', 'npm');
    if (fs.existsSync(npmDir)) {
      const redundantPatterns = [
        /^README/i,
        /^readme/i,
        /^LICENSE/i,
        /^license/i,
        /^LICENCE/i,
        /^licence/i,
        /^CHANGELOG/i,
        /^changelog/i,
        /^HISTORY/i,
        /^history/i,
        /^docs?$/i,
        /^man$/i,
        /^manuals?$/i,
        /^test$/i,
        /^examples?$/i,
        /^CONTRIBUTING/i,
        /^.github$/i,
        /^.npmrc$/i,
      ];
      const npmItems = fs.readdirSync(npmDir);
      for (const item of npmItems) {
        if (redundantPatterns.some(pattern => pattern.test(item))) {
          const itemPath = path.join(npmDir, item);
          logInfo(`Removing redundant npm file/folder: ${itemPath}`);
          fs.rmSync(itemPath, { force: true, recursive: true });
        }
      }
    }
  }
}

function verifyStructure(): boolean {
  logInfo('Verifying standalone_npx structure...');

  const requiredPaths = [
    path.join(TARGET_DIR, 'lib', 'node_modules', 'npm'),
    path.join(TARGET_DIR, 'lib', 'node_modules', 'npm', 'node_modules'),
    path.join(TARGET_DIR, 'lib', 'node_modules', 'npm', 'bin'),
    path.join(TARGET_DIR, 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(TARGET_DIR, 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js'),
    path.join(TARGET_DIR, 'lib', 'node_modules', 'npm', 'index.js'),
    path.join(TARGET_DIR, 'lib', 'node_modules', 'npm', 'package.json'),
  ];

  for (const requiredPath of requiredPaths) {
    if (!fs.existsSync(requiredPath)) {
      logError(`Missing required path: ${requiredPath}`);
      return false;
    }
  }

  logInfo('✅ standalone_npx structure verified successfully');
  return true;
}

function isAlreadyPrepared(): boolean {
  if (!fs.existsSync(TARGET_DIR)) {
    return false;
  }

  return verifyStructure();
}

const deleteBinDirIfExists = (): void => {
  const binDir = path.join(TARGET_DIR, 'bin');
  if (fs.existsSync(binDir)) {
    logInfo('🗑️  Deleting existing bin directory', binDir);
    fs.rmSync(binDir, { force: true, recursive: true });
  }
};

async function main(): Promise<void> {
  try {
    logInfo('🔧 Preparing standalone npx...');

    deleteBinDirIfExists();

    if (isAlreadyPrepared()) {
      logInfo('✅ standalone_npx is already prepared and valid');
      return;
    }

    await downloadAndExtractNode();
    cleanupNodeDist();

    if (!verifyStructure()) {
      throw new Error('Failed to create valid standalone_npx structure');
    }

    logInfo('✅ standalone_npx prepared successfully');
  } catch (error) {
    logError('❌ Failed to prepare standalone_npx:', error);
    process.exit(1);
  }
}

main();
