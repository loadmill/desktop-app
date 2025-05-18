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
 * NodeBundleRunner - A utility class to run Node.js commands using Electron's built-in Node.js with
 * npm and npx binaries from the bundled Node.js distribution
 */
export class NodeBundleRunner {
  private platform: NodeJS.Platform;
  private arch: string;
  private npmBinary: string | null = null;
  private npxBinary: string | null = null;
  private nodeBasePath: string | null = null;

  /**
   * Initialize the NodeBundleRunner
   * Detects platform and architecture
   * Sets up paths to npm and npx binaries
   */
  constructor() {
    this.platform = process.platform;
    this.arch = process.arch;

    this.initPaths();
  }

  /**
   * Initialize paths to the npm and npx binaries
   * @throws Error if paths cannot be resolved
   */
  private initPaths(): void {
    // Base path to the bundled Node.js directory
    const PACKED_RELATIVE_PATH = path.join(app.getAppPath(), '.webpack', 'main');
    const bundledNodeBase = path.join(PACKED_RELATIVE_PATH, 'bundled_node');
    log.info(`Bundled Node.js base path: ${bundledNodeBase}`);
    if (!fs.existsSync(bundledNodeBase)) {
      throw new Error(`Bundled Node.js base path does not exist: ${bundledNodeBase}`);
    }
    log.info(`Bundled Node.js base path exists: ${bundledNodeBase}`);
    log.info(`Platform: ${this.platform}`);
    log.info(`Architecture: ${this.arch}`);
    log.info(`Node.js version: ${process.versions.node}`);
    log.info(`Electron version: ${process.versions.electron}`);
    log.info(`Electron app path: ${app.getAppPath()}`);
    log.info(`Electron user data path: ${app.getPath('userData')}`);
    log.info(`Electron app name: ${app.getName()}`);
    log.info(`Electron app version: ${app.getVersion()}`);
    log.info(`Electron app is dev: ${app.isPackaged ? 'No' : 'Yes'}`);

    // Determine platform-specific directory
    let platformDir: string;
    if (this.platform === 'darwin') {
      platformDir = 'macos';
    } else if (this.platform === 'win32') {
      platformDir = 'windows';
    } else {
      throw new Error(`Unsupported platform: ${this.platform}`);
    }

    // Determine architecture-specific directory
    let archDir: string;
    if (this.arch === 'arm64') {
      archDir = 'arm64';
    } else if (this.arch === 'x64') {
      archDir = 'x86_64';
    } else {
      throw new Error(`Unsupported architecture: ${this.arch}`);
    }

    // Only use arm64 on macOS if it's available
    if (this.platform === 'darwin' && this.arch === 'arm64') {
      const arm64Path = path.join(bundledNodeBase, platformDir, 'arm64');
      if (!fs.existsSync(arm64Path)) {
        // Fall back to x64 if arm64 is not available
        archDir = 'x86_64';
      }
    }

    // Construct the base path to the Node.js distribution
    const nodeDistBase = path.join(bundledNodeBase, platformDir, archDir);

    // Find the Node.js directory within the architecture directory
    const nodeDir = fs.readdirSync(nodeDistBase).find(dir => dir.startsWith('node-'));
    if (!nodeDir) {
      throw new Error(`Could not find Node.js directory in ${nodeDistBase}`);
    }

    this.nodeBasePath = path.join(nodeDistBase, nodeDir);

    // Set paths to npm/npx binaries based on platform
    if (this.platform === 'darwin') {
      this.npmBinary = path.join(this.nodeBasePath, 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js');
      this.npxBinary = path.join(this.nodeBasePath, 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js');
    } else if (this.platform === 'win32') {
      this.npmBinary = path.join(this.nodeBasePath, 'npm.cmd');
      this.npxBinary = path.join(this.nodeBasePath, 'npx.cmd');
    }

    // Ensure the paths exist
    if (!this.npmBinary || !fs.existsSync(this.npmBinary)) {
      throw new Error(`npm binary not found at: ${this.npmBinary}`);
    }

    if (!this.npxBinary || !fs.existsSync(this.npxBinary)) {
      throw new Error(`npx binary not found at: ${this.npxBinary}`);
    }

    // Set executable permissions on macOS/Linux
    if (this.platform !== 'win32') {
      try {
        log.info('Setting executable permissions for npm and npx binaries');
        log.info('Setting executable permissions for npm binary:');
        fs.chmodSync(this.npmBinary, 0o755);
        log.info('Setting executable permissions for npx binary:');
        fs.chmodSync(this.npxBinary, 0o755);
        log.info('Executable permissions set successfully');
      } catch (error) {
        log.error('Failed to set executable permissions');
        throw error;
      }
    }

    log.info(`Using npm binary: ${this.npmBinary}`);
    log.info(`Using npx binary: ${this.npxBinary}`);
  }

  /**
   * Run a command using spawn
   *
   * @param command - Command to run
   * @param args - Arguments to pass to the command
   * @param options - Options for the child process
   * @returns Promise resolving to stdout and stderr
   */
  private runCommand(
    command: string,
    args: string[] = [],
    options: NodeRunnerOptions = {},
  ): Promise<ProcessResult> {
    return new Promise((resolve, reject) => {
      const defaultOptions: NodeRunnerOptions = {
        cwd: app.getAppPath(),
        env: process.env,
        stdio: 'pipe',
      };

      const mergedOptions: NodeRunnerOptions = { ...defaultOptions, ...options };

      // Add the Node.js bin directory to PATH to ensure the npm/npx binaries can find the right Node.js
      if (this.nodeBasePath) {
        const nodeBinDir = path.join(this.nodeBasePath, 'bin');
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

      const xprocess = spawn(command, args, mergedOptions);
      log.info(`Spawned process PID: ${xprocess.pid}`);

      let stdout = '';
      let stderr = '';

      xprocess.stdout?.on('data', (data: Buffer) => {
        const dataStr = data.toString();
        stdout += dataStr;
        log.info(`[NodeRunner stdout] ${dataStr}`);
      });

      xprocess.stderr?.on('data', (data: Buffer) => {
        const dataStr = data.toString();
        stderr += dataStr;
        log.error(`[NodeRunner stderr] ${dataStr}`);
      });

      xprocess.on('close', (code: number | null) => {
        if (code === 0) {
          resolve({ stderr, stdout });
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr}`));
        }
      });

      xprocess.on('error', (error: Error) => {
        reject(new Error(`Failed to start process: ${error.message}`));
      });
    });
  }

  /**
   * Run an npm command using the npm binary
   *
   * @param args - Arguments to pass to npm
   * @param options - Options for the child process
   * @returns Promise resolving to stdout and stderr
   */
  public runNpm(args: string[] = [], options: NodeRunnerOptions = {}): Promise<ProcessResult> {
    if (!this.npmBinary) {
      return Promise.reject(new Error('npm binary path not initialized'));
    }
    return this.runCommand(this.npmBinary, args, options);
  }

  /**
   * Run an npx command using the npx binary
   *
   * @param args - Arguments to pass to npx
   * @param options - Options for the child process
   * @returns Promise resolving to stdout and stderr
   */
  public runNpx(args: string[] = [], options: NodeRunnerOptions = {}): Promise<ProcessResult> {
    if (!this.npxBinary) {
      return Promise.reject(new Error('npx binary path not initialized'));
    }
    return this.runCommand(this.npxBinary, args, options);
  }

  /**
   * Run a direct Node.js command (equivalent to `node script.js`)
   *
   * @param scriptPath - Path to the script to run
   * @param args - Arguments to pass to the script
   * @param options - Options for the child process
   * @returns Promise resolving to stdout and stderr
   */
  public runNode(
    scriptPath: string,
    args: string[] = [],
    options: NodeRunnerOptions = {},
  ): Promise<ProcessResult> {
    // Use process.execPath (Electron) to run the script
    return this.runCommand(process.execPath, ['--no-sandbox', scriptPath, ...args], options);
  }
}

export { ProcessResult, NodeRunnerOptions };
