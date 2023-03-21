import getPort from 'get-port';

import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import log from '../../log';
import { GET_PORT, PORT } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

const DESIRED_PORTS = [8080, 8081, 9090, 9091];

let port: number;

/**
 * Initializes the proxy port to an available port
 * @returns The port that was found to be available
 */
export const initToAvailablePort = async (): Promise<number> => {
  port = await getPort({ port: DESIRED_PORTS });
  log.info(`Proxy port set to ${port}`);
  return port;
};

export const subscribeToPort = (): void => {
  subscribeToMainProcessMessage(GET_PORT, sendPortToRenderer);
};

const sendPortToRenderer = (): void => {
  sendFromProxyToRenderer({
    data: {
      port,
    },
    type: PORT,
  });
};
