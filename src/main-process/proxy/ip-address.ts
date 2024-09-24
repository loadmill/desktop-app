import { NetworkInterfaceInfo, networkInterfaces } from 'os';

import {
  sendFromProxyViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import { MainMessage } from '../../types/messaging';
import { GET_IP_ADDRESS, IP_ADDRESS } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

const DEFAULT_IP_ADDRESS = '0.0.0.0';

export const getIpAddress = (family: 'IPv4' | 'IPv6' = 'IPv4'): NetworkInterfaceInfo['address'] => {
  const nets = networkInterfaces();
  const en0: NetworkInterfaceInfo[] = nets.en0;
  if (en0) {
    const net = en0.find(net => net.family === family);
    if (net?.address) {
      return net.address;
    }
  }
  return DEFAULT_IP_ADDRESS;
};

export const subscribeToGetIpAddressFromRenderer = (): void => {
  subscribeToMainProcessMessage(GET_IP_ADDRESS, (_event: Electron.IpcMainEvent, { ipvFamily }: MainMessage['data']) => {
    sendFromProxyViewToRenderer({
      data: {
        ipAddress: getIpAddress(ipvFamily),
      },
      type: IP_ADDRESS,
    });
  });
};
