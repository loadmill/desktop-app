import {
  SpawnOptions,
  StdioOptions,
} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import log from '../log';
import { STANDALONE_NPX_FOLDER_PATH } from '../main-process/constants';

/**
 * Interface for process execution results
 */
interface ProcessResult {
  stderr: string;
  stdout: string;
}

/**
 * Options for running Node.js commands
 * Extends NodeJS.SpawnOptions
 */
interface NodeRunnerOptions extends SpawnOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  stdio?: 'pipe' | 'ignore' | 'inherit' | StdioOptions;
}

/**
 * NodeBundleRunner - A utility module to run Node.js commands using Electron's built-in Node.js with
 * npm and npx binaries from the bundled Node.js distribution
 */
const NodeBundleRunner = (() => {

  const platform: NodeJS.Platform = process.platform;

  let npmBinary: string | null = null;
  let npxBinary: string | null = null;
  let nodeBasePath: string | null = null;
  let npxDir: string | null = null;

  /**
   * Initialize paths to the npm and npx binaries
   * @throws Error if paths cannot be resolved
   */
  const initPaths = (): void => {
    // Base path to the bundled Node.js directory
    log.info(`Bundled Node.js base path: ${STANDALONE_NPX_FOLDER_PATH}`);
    if (!fs.existsSync(STANDALONE_NPX_FOLDER_PATH)) {
      throw new Error(`Bundled Node.js base path does not exist: ${STANDALONE_NPX_FOLDER_PATH}`);
    }

    nodeBasePath = STANDALONE_NPX_FOLDER_PATH;
    const binDir = path.join(STANDALONE_NPX_FOLDER_PATH, 'bin');

    // Set executable permissions on macOS/Linux for all relevant npm/npx binaries in the bin directory
    if (platform !== 'win32') {
      try {
        // Set executable permissions for symlinks and corepack in the Node.js bin directory
        if (!fs.existsSync(binDir)) {
          fs.mkdirSync(binDir, { recursive: true });
          log.info(`Created bin directory: ${binDir}`);
        }

        const symlinks = [
          {
            link: path.join(binDir, 'npm'),
            target: path.join(nodeBasePath, 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
          },
          {
            link: path.join(binDir, 'npx'),
            target: path.join(nodeBasePath, 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js'),
          },
        ];
        for (const { link, target } of symlinks) {
          try {
            if (!fs.existsSync(link)) {
              fs.symlinkSync(target, link);
              log.info(`Created symlink: ${link} -> ${target}`);
            }
            // Always set executable permissions on the link target
            if (fs.existsSync(target)) {
              fs.chmodSync(target, 0o755);
              log.info(`Set executable permissions for: ${target}`);
            }
            // And on the symlink itself (if it exists)
            if (fs.existsSync(link)) {
              fs.chmodSync(link, 0o755);
              log.info(`Set executable permissions for symlink: ${link}`);
            }
          } catch (err) {
            log.error(`Failed to create symlink or set permissions: ${link} -> ${target}`, err);
          }
        }
        log.info('Executable permissions set successfully for npm/npx binaries and symlinks');
      } catch (error) {
        log.error('Failed to set executable permissions for npm/npx binaries');
        throw error;
      }
    }

    // Set paths to npm/npx binaries based on platform
    if (platform === 'darwin') {
      npmBinary = path.join(nodeBasePath, 'bin', 'npm');
      npxBinary = path.join(nodeBasePath, 'bin', 'npx');
    } else if (platform === 'win32') {
      npmBinary = path.join(nodeBasePath, 'npm.cmd');
      npxBinary = path.join(nodeBasePath, 'npx.cmd');
    }

    // Set the npxDir for external access
    npxDir = path.dirname(npxBinary);

    // Ensure the paths exists
    if (!npmBinary || !fs.existsSync(npmBinary)) {
      throw new Error(`npm binary not found at: ${npmBinary}`);
    }

    if (!npxBinary || !fs.existsSync(npxBinary)) {
      throw new Error(`npx binary not found at: ${npxBinary}`);
    }

    log.info(`Using npm binary: ${npmBinary}`);
    log.info(`Using npx binary: ${npxBinary}`);
    log.info(`NPX directory: ${npxDir}`);

    // Create symlink for node in the bin directory
    // if symlink does not exist already
    if (fs.existsSync(path.join(binDir, 'node'))) {
      log.info(`Symlink for node already exists: ${path.join(binDir, 'node')}`);
      // also log the file which symlink points to
      const symlinkTarget = fs.readlinkSync(path.join(binDir, 'node'));
      log.info(`Symlink points to: ${symlinkTarget}`);
      return;
    }
    log.info('Creating symlink for node:', {
      link: path.join(binDir, 'node'),
      target: process.execPath,
    });
    fs.symlinkSync(
      process.execPath,
      path.join(binDir, 'node'),
      'file',
    );
    log.info('Symlink created successfully');
    const symlinkTarget = fs.readlinkSync(path.join(binDir, 'node'));
    log.info(`Symlink points to: ${symlinkTarget}`);
  };

  // Initialize paths on module load
  initPaths();

  // Public API
  return {
    getNpxDir: () => npxDir,
  };
})();

export { NodeBundleRunner, ProcessResult, NodeRunnerOptions };
