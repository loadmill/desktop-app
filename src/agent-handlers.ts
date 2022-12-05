import { ChildProcessWithoutNullStreams, fork } from 'child_process';

import '@loadmill/agent/dist/cli';
import { app, ipcMain } from 'electron';

import { appendToAgentLog, readAgentLog } from './agent-log-file';
import { refreshConnectedStatus } from './connected-status';
import {
  DATA,
  INIT_AGENT_LOG,
  IS_AGENT_CONNECTED,
  LOADMILL_AGENT,
  START_AGENT,
  STDERR,
  STDOUT,
  STOP_AGENT
} from './constants';
import log from './log';
import { send as sendToRenderer } from './main-to-renderer';
import { ProcessMessageAgent, ProcessMessageMain } from './types/messaging';

let agent: ChildProcessWithoutNullStreams | null;

const subscribeToStartFromRenderer = () => {
  ipcMain.on(START_AGENT, startAgent);
};

const startAgent = (_event: Electron.IpcMainEvent, token: string) => {
  if (!agent || !agent.connected) {
    initAgent();
  }
  if (agent && token) {
    sendToAgentProcess({
      data: { token },
      type: START_AGENT,
    });
  }
};

const initAgent = () => {
  agent = createAgentProcess();
  addOnAgentExitEvent();
  addOnAgentIsConnectedEvent();
  if (agent.stdout) {
    pipeAgentStdout();
  }
  if (agent.stderr) {
    pipeAgentStderr();
  }
};

const createAgentProcess = (): ChildProcessWithoutNullStreams => {
  return fork(app.getAppPath() + '/.webpack/main/' + LOADMILL_AGENT, {
    stdio: 'pipe',
  });
};

const addOnAgentExitEvent = () => {
  agent.on('exit', (code) => {
    log.info('Agent process exited with code:', code);
  });
};

const addOnAgentIsConnectedEvent = (): void => {
  agent.on('message', ({ data, type }: ProcessMessageMain) => {
    if (type === IS_AGENT_CONNECTED) {
      sendToRenderer({ data, type: IS_AGENT_CONNECTED });
    }
  });
};

const pipeAgentStdout = () => {
  agent.stdout.on(DATA, (data: string | Buffer) => {
    pipeAgentStd(data, STDOUT);
  });
};

const pipeAgentStderr = () => {
  agent.stderr.on(DATA, (data: string | Buffer) => {
    pipeAgentStd(data, STDERR);
  });
};

const pipeAgentStd = (
  data: string | Buffer,
  type: typeof STDOUT | typeof STDERR
) => {
  const text = Buffer.from(data).toString();
  log.info('Agent:', text);
  refreshConnectedStatus({ text });
  sendToRenderer({ data: { text }, type });
  appendToAgentLog(text);
};

const subscribeToStopFromRenderer = () => {
  ipcMain.on(STOP_AGENT, (_event: Electron.IpcMainEvent) => {
    log.info('Stopping agent...');
    sendToAgentProcess({ type: STOP_AGENT });
  });
};

export const subscribeToIsConnectedFromRenderer = (): void => {
  ipcMain.on(IS_AGENT_CONNECTED, (_event: Electron.IpcMainEvent) => {
    if (agent && agent.connected) {
      sendToAgentProcess({ type: IS_AGENT_CONNECTED });
    }
  });
};

export const subscribeToInitAgentLogFromRenderer = (): void => {
  ipcMain.on(INIT_AGENT_LOG, (_event: Electron.IpcMainEvent) => {
    const lines = readAgentLog();
    sendToRenderer({ data: { lines }, type: INIT_AGENT_LOG });
  });
};

export const subscribeToRendererEvents = (): void => {
  subscribeToStartFromRenderer();
  subscribeToStopFromRenderer();
  subscribeToIsConnectedFromRenderer();
  subscribeToInitAgentLogFromRenderer();
};

subscribeToRendererEvents();

const sendToAgentProcess = (msg: ProcessMessageAgent) => {
  if (agent && agent.connected) {
    agent.send(msg);
  }
};
