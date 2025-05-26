import { error as logError, log as logInfo } from 'console';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

import * as AdmZip from 'adm-zip';
import * as tar from 'tar';

import { getElectronNodeVersion } from './electron-node-version';

const NODE_VERSION = getElectronNodeVersion();
const TARGET_DIR = 'standalone_npx';

const main = async () => {
  try {
    logInfo('🔧 Preparing standalone_npx directory...');
    logInfo(
      'This script will download and install a standalone npx package in the target directory.',
      {
        NODE_VERSION,
        TARGET_DIR,
      },
    );

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

    logInfo('✅ standalone_npx directory prepared successfully');
  } catch (error) {
    logError('❌ Failed to prepare standalone_npx:', error);
    process.exit(1);
  }
};

const deleteBinDirIfExists = (): void => {
  const binDir = path.join(TARGET_DIR, 'bin');
  if (fs.existsSync(binDir)) {
    logInfo('🗑️  Deleting existing bin directory', binDir);
    fs.rmSync(binDir, { force: true, recursive: true });
  }
};

const isAlreadyPrepared = (): boolean => {
  if (!fs.existsSync(TARGET_DIR)) {
    return false;
  }

  return verifyStructure();
};

const verifyStructure = (): boolean => {
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
};

const downloadAndExtractNode = async () => {
  logInfo('🔄 Downloading and extracting Node.js...');

  const nodeDownloadInfo = getNodeDownloadInfo();
  logInfo('Downloading Node.js...', nodeDownloadInfo);
  const {
    ext,
    nodeArchiveCompressedFileName,
    nodeArchiveDecompressedDirName,
    nodeUrl,
  } = nodeDownloadInfo;
  await downloadFile(nodeUrl, nodeArchiveCompressedFileName);
  logInfo('Node.js archive downloaded successfully');

  logInfo('Extracting Node.js archive...');
  await extractArchive(ext, nodeArchiveCompressedFileName);
  logInfo('Node.js archive extracted successfully');

  logInfo('Renaming extracted directory...', { TARGET_DIR, nodeArchiveDecompressedDirName });
  renameTempDirToTarget(nodeArchiveDecompressedDirName);
  logInfo('Deleting archive file...');
  deleteArchive(nodeArchiveCompressedFileName);

  logInfo('✅ Node.js downloaded and extracted successfully');
};

const getNodeDownloadInfo = () => {
  const platform = process.platform === 'darwin' ? 'darwin' : process.platform === 'win32' ? 'win' : 'linux';
  const arch = process.arch === 'x64' ? 'x64' : process.arch === 'arm64' ? 'arm64' : 'x64';
  const ext = platform === 'win' ? 'zip' : 'tar.gz';

  const nodeUrl = `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${platform}-${arch}.${ext}`;
  const nodeArchiveCompressedFileName = `node-v${NODE_VERSION}-${platform}-${arch}.${ext}`;
  const nodeArchiveDecompressedDirName = `node-v${NODE_VERSION}-${platform}-${arch}`;
  return {
    ext,
    nodeArchiveCompressedFileName,
    nodeArchiveDecompressedDirName,
    nodeUrl,
  };
};

const downloadFile = async (nodeUrl: string, fileName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(fileName);
    https.get(nodeUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(fileName, () => { });
      reject(err);
    });
  });
};

const extractArchive = async (
  ext: string,
  compressedFileName: string,
) => {
  if (ext === 'tar.gz') {
    await extractTarGzArchive(compressedFileName);
  } else if (ext === 'zip') {
    extractZip(compressedFileName);
  } else {
    throw new Error(`Unsupported archive format: ${ext}`);
  }
};

const extractTarGzArchive = async (tempFile: string) => {
  await tar.x({ cwd: '.', file: tempFile });
};

const extractZip = (zipPath: string, extractTo: string = '.') => {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractTo, true);
};

const renameTempDirToTarget = (tempDir: string) => {
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { force: true, recursive: true });
  }
  fs.renameSync(tempDir, TARGET_DIR);
};

const deleteArchive = (tempFile: string) => {
  fs.unlinkSync(tempFile);
};

const cleanupNodeDist = () => {
  logInfo('Cleaning up Node.js distribution...');
  logInfo('Keeping only the necessary directories and files for a standalone npx');

  removeUnwantedRootDirectories();
  cleanupLibDirectory();
  cleanupNodeModulesDirectory();
  removeRedundantNpmFiles();
};

const removeUnwantedRootDirectories = () => {
  const keepDirectories = new Set(['lib']);
  logInfo('Keeping directories:', Array.from(keepDirectories).join(', '));

  processDirectoryItems(
    TARGET_DIR,
    (item) => !keepDirectories.has(item),
  );
};

const cleanupLibDirectory = () => {
  const libDir = path.join(TARGET_DIR, 'lib');

  processDirectoryItems(
    libDir,
    (item) => item !== 'node_modules',
  );
};

const cleanupNodeModulesDirectory = () => {
  const nodeModulesDir = path.join(TARGET_DIR, 'lib', 'node_modules');

  processDirectoryItems(
    nodeModulesDir,
    (item) => item !== 'npm',
  );
};

const removeRedundantNpmFiles = () => {
  const npmDir = path.join(TARGET_DIR, 'lib', 'node_modules', 'npm');

  processDirectoryItems(
    npmDir,
    (item) => isRedundantFile(item),
    (itemPath) => `Removing redundant npm file/folder: ${itemPath}`,
  );
};

const processDirectoryItems = (
  dirPath: string,
  shouldRemove: (item: string) => boolean,
  logMessage?: (itemPath: string) => string,
): void => {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    if (shouldRemove(item)) {
      const itemPath = path.join(dirPath, item);
      const message = logMessage ? logMessage(itemPath) : `Removing ${itemPath}`;
      logInfo(message);
      fs.rmSync(itemPath, { force: true, recursive: true });
    }
  }
};

const isRedundantFile = (filename: string): boolean => {
  return redundantFilePatterns.some(pattern => pattern.test(filename));
};

const redundantFilePatterns = [
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

main();
