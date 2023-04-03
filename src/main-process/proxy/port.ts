import getPort, { portNumbers } from 'get-port';

import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import log from '../../log';
import { GET_PORT, PORT } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

const PORT_MIN_RANGE = 1234;
const PORT_MAX_RANGE = 1239;

let port: number;

/**
 * Initializes the proxy port to an available port
 * @returns The port that was found to be available
 */
export const initToAvailablePort = async (): Promise<number> => {
  port = await getPort({ port: portNumbers(PORT_MIN_RANGE, PORT_MAX_RANGE) });
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
