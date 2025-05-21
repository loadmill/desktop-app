/**
 * Type definitions for NodeBundleRunner API
 * Provides TypeScript typings for the exposed Electron API
 */

/**
 * Result of a command execution
 */
interface CommandResult {
  /** Error message if the command failed */
  error?: string;
  /** Standard error output from the command */
  stderr?: string;
  /** Standard output from the command, if successful */
  stdout?: string;
  /** Whether the command was successful */
  success: boolean;
}

/**
 * API for interacting with the bundled Node.js runtime
 */
interface NodeBundleRunnerAPI {
  /**
   * Run a Node.js script
   * @param scriptPath - Path to the script to run
   * @param args - Arguments to pass to the script
   * @returns Promise resolving to command result
   */
  runNodeScript: (scriptPath: string, args: string[]) => Promise<CommandResult>;

  /**
   * Run an npm command
   * @param args - Arguments to pass to npm
   * @returns Promise resolving to command result
   */
  runNpm: (args: string[]) => Promise<CommandResult>;

  /**
   * Run an npx command
   * @param args - Arguments to pass to npx
   * @returns Promise resolving to command result
   */
  runNpx: (args: string[]) => Promise<CommandResult>;
}

/**
 * Extend Window interface to include our API
 */
declare global {
  interface Window {
    nodeBundleRunner: NodeBundleRunnerAPI;
  }
}

export { CommandResult, NodeBundleRunnerAPI };
