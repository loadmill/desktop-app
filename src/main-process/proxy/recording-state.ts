import { ipcMain } from 'electron';

import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import { MainMessage } from '../../types/messaging';
import { IS_RECORDING, SET_IS_RECORDING } from '../../universal/constants';

let isRecording = false;

export const getIsRecording = (): boolean => isRecording;

export const setIsRecording = (value: boolean): void => {
  isRecording = value;
};

export const subscribeToIsRecording = (): void => {
  ipcMain.on(IS_RECORDING, (_event: Electron.IpcMainEvent) => {
    sendIsRecording();
  });
};

export const subscribeToSetIsRecording = (): void => {
  ipcMain.on(SET_IS_RECORDING, (_event: Electron.IpcMainEvent, { isRecording }: MainMessage['data']) => {
    setIsRecording(isRecording);
    sendIsRecording();
  });
};

const sendIsRecording = (): void => {
  sendFromProxyToRenderer({
    data: { isRecording: getIsRecording() },
    type: IS_RECORDING,
  });
};

export const subscribeToRecordingStateEvents = (): void => {
  subscribeToIsRecording();
  subscribeToSetIsRecording();
};
