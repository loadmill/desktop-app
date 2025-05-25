/**
 * This script creates a symlink named `node` that points to the
 * `electron` executable
 *
 * @param {string} targetExecutable - The path to the Electron executable
 * @param {string} symlinkPath - The path where the symlink should be created
 * @returns {void}
 */
import { error as logError } from 'console';
import fs from 'fs';
import path from 'path';

const arg1 = process.argv[2];
const arg2 = process.argv[3];
if (!arg1 || !arg2) {
  logError('Usage: electron-exec-as-node-symlink <targetExecutable> <symlinkPath>');
  process.exit(1);
}

const targetExecutable = path.resolve(arg1);
const symlinkPath = path.resolve(arg2);

if (!fs.existsSync(targetExecutable)) {
  logError(`Target executable does not exist: ${targetExecutable}`);
  process.exit(1);
}
if (fs.existsSync(symlinkPath)) {
  logError(`Symlink path already exists: ${symlinkPath}`);
  process.exit(1);
}
fs.symlinkSync(targetExecutable, symlinkPath, 'file');
