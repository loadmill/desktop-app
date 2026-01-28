import '@loadmill/agent/dist/cli';

/**
 * AgentOrchestrator - Main entry point for agent management
 *
 * This file coordinates all agent-related modules and initializes
 * the agent management system. It's responsible for:
 * - Initializing all subsystems in the correct order
 * - Wiring up dependencies between modules
 * - Exposing the public API for agent control
 *
 * Import this file and call initializeAgentSystem() during app startup.
 */

import {
  startAgent,
  stopAgent,
  subscribeToAgentEventsFromRenderer,
} from './agent-ipc-handlers';
import { initializeLogProcessor } from './agent-log-processor';
import {
  killAgentProcess,
  sendToAgentProcess,
  stopAgentProcess,
} from './agent-process-manager';
import { initializeStatusNotifier } from './agent-status-notifier';

/**
 * Initialize the entire agent management system
 * Call this once during app initialization
 */
export function initializeAgentSystem(): void {
  // 1. Initialize status notifier (subscribes to status changes)
  initializeStatusNotifier();

  // 2. Initialize log processor with dependencies
  initializeLogProcessor(sendToAgentProcess, stopAgentProcess);

  // 3. Subscribe to IPC events from renderer
  subscribeToAgentEventsFromRenderer();
}

/**
 * Public API - exported functions for controlling the agent
 */
export {
  startAgent,
  stopAgent,
  killAgentProcess,
};
