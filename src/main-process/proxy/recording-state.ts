
import {
  sendFromProxyViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import { MainMessage } from '../../types/messaging';
import { IS_RECORDING, SET_IS_RECORDING } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

let isRecording = false;

export const getIsRecording = (): boolean => isRecording;

export const setIsRecording = (value: boolean): void => {
  isRecording = value;
};

export const subscribeToIsRecording = (): void => {
  subscribeToMainProcessMessage(IS_RECORDING, sendIsRecording);
};

export const subscribeToSetIsRecording = (): void => {
  subscribeToMainProcessMessage(SET_IS_RECORDING, (_event: Electron.IpcMainEvent, { isRecording }: MainMessage['data']) => {
    setIsRecording(isRecording);
    sendIsRecording();
  });
};

const sendIsRecording = (): void => {
  sendFromProxyViewToRenderer({
    data: { isRecording: getIsRecording() },
    type: IS_RECORDING,
  });
};

export const subscribeToRecordingStateEvents = (): void => {
  subscribeToIsRecording();
  subscribeToSetIsRecording();
};
