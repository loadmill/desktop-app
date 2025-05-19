import {
  spawn,
  SpawnOptions,
  StdioOptions,
} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { app } from 'electron';

import log from '../log';

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
  // Private properties
  const platform: NodeJS.Platform = process.platform;
  const arch: string = process.arch;

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
    const PACKED_RELATIVE_PATH = path.join(app.getAppPath(), '.webpack', 'main');
    const bundledNodeBase = path.join(PACKED_RELATIVE_PATH, 'bundled_node');
    log.info(`Bundled Node.js base path: ${bundledNodeBase}`);
    if (!fs.existsSync(bundledNodeBase)) {
      throw new Error(`Bundled Node.js base path does not exist: ${bundledNodeBase}`);
    }
    log.info(`Bundled Node.js base path exists: ${bundledNodeBase}`);
    log.info(`Platform: ${platform}`);
    log.info(`Architecture: ${arch}`);
    log.info(`Node.js version: ${process.versions.node}`);
    log.info(`Electron version: ${process.versions.electron}`);
    log.info(`Electron app path: ${app.getAppPath()}`);
    log.info(`Electron user data path: ${app.getPath('userData')}`);
    log.info(`Electron app name: ${app.getName()}`);
    log.info(`Electron app version: ${app.getVersion()}`);
    log.info(`Electron app is dev: ${app.isPackaged ? 'No' : 'Yes'}`);

    // Determine platform-specific directory
    let platformDir: string;
    if (platform === 'darwin') {
      platformDir = 'macos';
    } else if (platform === 'win32') {
      platformDir = 'windows';
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // Determine architecture-specific directory
    let archDir: string;
    if (arch === 'arm64') {
      archDir = 'arm64';
    } else if (arch === 'x64') {
      archDir = 'x64';
    } else {
      throw new Error(`Unsupported architecture: ${arch}`);
    }

    // Only use arm64 on macOS if it's available
    if (platform === 'darwin' && arch === 'arm64') {
      const arm64Path = path.join(bundledNodeBase, platformDir, 'arm64');
      if (!fs.existsSync(arm64Path)) {
        // Fall back to x64 if arm64 is not available
        archDir = 'x64';
      }
    }

    // Construct the base path to the Node.js distribution
    const nodeDistBase = path.join(bundledNodeBase, platformDir, archDir);

    // Find the Node.js directory within the architecture directory
    const nodeDir = fs.readdirSync(nodeDistBase).find(dir => dir.startsWith('node-'));
    if (!nodeDir) {
      throw new Error(`Could not find Node.js directory in ${nodeDistBase}`);
    }

    nodeBasePath = path.join(nodeDistBase, nodeDir);

    // Set executable permissions on macOS/Linux for all relevant npm/npx binaries in the bin directory
    if (platform !== 'win32') {
      try {
        // Set executable permissions for symlinks and corepack in the Node.js bin directory
        const nodeBinDir = path.join(nodeBasePath, 'bin');

        if (!fs.existsSync(nodeBinDir)) {
          fs.mkdirSync(nodeBinDir, { recursive: true });
          log.info(`Created Node.js bin directory: ${nodeBinDir}`);
        }

        const symlinks = [
          {
            link: path.join(nodeBinDir, 'npm'),
            target: path.join(nodeBasePath, 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
          },
          {
            link: path.join(nodeBinDir, 'npx'),
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
  };

  // Initialize paths on module load
  initPaths();

  /**
   * Run a command using spawn
   *
   * @param command - Command to run
   * @param args - Arguments to pass to the command
   * @param options - Options for the child process
   * @returns Promise resolving to stdout and stderr
   */
  const runCommand = (
    command: string,
    args: string[] = [],
    options: NodeRunnerOptions = {},
  ): Promise<ProcessResult> => {
    return new Promise((resolve, reject) => {
      const defaultOptions: NodeRunnerOptions = {
        cwd: app.getAppPath(),
        env: process.env,
        stdio: 'pipe',
      };

      const mergedOptions: NodeRunnerOptions = { ...defaultOptions, ...options };

      // Add the Node.js bin directory to PATH to ensure the npm/npx binaries can find the right Node.js
      if (nodeBasePath) {
        const nodeBinDir = path.join(nodeBasePath, 'bin');
        const currentPath = mergedOptions.env?.PATH || process.env.PATH || '';
        mergedOptions.env = {
          ...mergedOptions.env,
          PATH: `${nodeBinDir}${path.delimiter}${currentPath}`,
        };
      }

      const cmdStr = [command, ...args].join(' ');
      log.info(`Running command: ${cmdStr}`, {
        args,
        command,
        options,
      });

      const childProcess = spawn(command, args, mergedOptions);
      log.info(`Spawned process PID: ${childProcess.pid}`);

      let stdout = '';
      let stderr = '';

      childProcess.stdout?.on('data', (data: Buffer) => {
        const dataStr = data.toString();
        stdout += dataStr;
        log.info(`[NodeRunner stdout] ${dataStr}`);
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        const dataStr = data.toString();
        stderr += dataStr;
        log.error(`[NodeRunner stderr] ${dataStr}`);
      });

      childProcess.on('close', (code: number | null) => {
        if (code === 0) {
          resolve({ stderr, stdout });
        } else {
          reject(new Error(`Process closed with code ${code}: ${stderr}`));
        }
      });

      childProcess.on('error', (error: Error) => {
        reject(new Error(`Failed to start process: ${error.message}`));
      });

      childProcess.on('exit', (code: number | null) => {
        log.info(`Process exited with code: ${code}`);
        if (code !== 0) {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
  };

  /**
   * Run an npm command using the npm binary
   *
   * @param args - Arguments to pass to npm
   * @param options - Options for the child process
   * @returns Promise resolving to stdout and stderr
   */
  const runNpm = (args: string[] = [], options: NodeRunnerOptions = {}): Promise<ProcessResult> => {
    if (!npmBinary) {
      return Promise.reject(new Error('npm binary path not initialized'));
    }
    return runCommand(npmBinary, args, options);
  };

  /**
   * Run an npx command using the npx binary
   *
   * @param args - Arguments to pass to npx
   * @param options - Options for the child process
   * @returns Promise resolving to stdout and stderr
   */
  const runNpx = (args: string[] = [], options: NodeRunnerOptions = {}): Promise<ProcessResult> => {
    if (!npxBinary) {
      return Promise.reject(new Error('npx binary path not initialized'));
    }
    return runCommand(npxBinary, args, options);
  };

  /**
   * Run a direct Node.js command (equivalent to `node script.js`)
   *
   * @param scriptPath - Path to the script to run
   * @param args - Arguments to pass to the script
   * @param options - Options for the child process
   * @returns Promise resolving to stdout and stderr
   */
  const runNode = (
    scriptPath: string,
    args: string[] = [],
    options: NodeRunnerOptions = {},
  ): Promise<ProcessResult> => {
    // Use process.execPath (Electron) to run the script
    return runCommand(process.execPath, ['--no-sandbox', scriptPath, ...args], options);
  };

  // Public API
  return {
    // Expose paths for external use
    getNodeBasePath: () => nodeBasePath,
    getNpmBinary: () => npmBinary,
    getNpxBinary: () => npxBinary,
    getNpxDir: () => npxDir,

    // Re-initialize if needed (rarely used)
    reinitialize: initPaths,

    // Command runner methods
    runNode,
    runNpm,
    runNpx,
  };
})();

export { NodeBundleRunner, ProcessResult, NodeRunnerOptions };
