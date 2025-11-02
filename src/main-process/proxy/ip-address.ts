import { NetworkInterfaceInfo, networkInterfaces } from 'os';

import {
  sendFromProxyViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../log';
import { IpAddressFamily } from '../../types/ip-address';
import { MainMessage } from '../../types/messaging';
import { GET_IP_ADDRESS, IP_ADDRESS } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

const DEFAULT_IP_ADDRESS = '0.0.0.0';

const _getIpAddressForMac = (family: IpAddressFamily = 'IPv4'): NetworkInterfaceInfo['address'] => {
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

const _getIpAddressForWindows = (family: IpAddressFamily = 'IPv4'): NetworkInterfaceInfo['address'] => {
  const nets = networkInterfaces();
  const ethernetInterfaces = Object.keys(nets).filter(name => name.startsWith('Ethernet'));
  ethernetInterfaces && log.debug('Ethernet interfaces found:', { ethernetInterfaces });
  const wifiInterfaces = Object.keys(nets).filter(name => /^Wi-?Fi$/i.test(name));
  wifiInterfaces && log.debug('Wi-Fi interfaces found:', { wifiInterfaces });
  const preferredInterfaces = [...ethernetInterfaces, ...wifiInterfaces];

  for (const interfaceName of preferredInterfaces) {
    const net = nets[interfaceName].find(net => net.family === family);
    if (net?.address) {
      log.debug('Found IP address', { interfaceName, netAddress: net.address });
      return net.address;
    }
  }
  return DEFAULT_IP_ADDRESS;
};

const _getIpAddress = (family: IpAddressFamily = 'IPv4'): NetworkInterfaceInfo['address'] => {
  if (process.platform === 'win32') {
    return _getIpAddressForWindows(family);
  }
  return _getIpAddressForMac(family);
};

export const subscribeToGetIpAddressFromRenderer = (): void => {
  subscribeToMainProcessMessage(GET_IP_ADDRESS, (_event: Electron.IpcMainEvent, { ipvFamily }: MainMessage['data']) => {
    sendFromProxyViewToRenderer({
      data: {
        ipAddress: _getIpAddress(ipvFamily),
      },
      type: IP_ADDRESS,
    });
  });
};
