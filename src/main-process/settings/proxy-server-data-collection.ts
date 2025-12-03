import path from 'path';

import {
  app,
  netLog,
  OnCompletedListenerDetails,
  OnErrorOccurredListenerDetails,
  session,
} from 'electron';

import { createLogger } from '../../log';

const log = createLogger(
  'proxy-server-data-collection',
  'proxy-server-data-collection.log',
  'debug',
);

export const logWebRequests = (): void => {
  try {
    log.info('Registering webRequest listeners for proxy data collection');

    session.defaultSession.webRequest.onCompleted(
      { urls: ['*://app.loadmill.com/*'] },
      (details) => log.info('onCompleted WebRequest', { details: _filterDetails(details) }),
    );

    session.defaultSession.webRequest.onErrorOccurred(
      (details) => log.info('onErrorOccurred WebRequest', { details: _filterDetails(details) }),
    );

    log.info('WebRequest listeners registered for proxy data collection');
  } catch (error) {
    log.error('Error attaching proxy authentication interceptor', {
      error: (error as Error).message || error,
      stack: (error as Error).stack,
    });
  }
};

const _filterDetails = (details: OnCompletedListenerDetails | OnErrorOccurredListenerDetails): Record<string, unknown> => {
  const filtered = _removeFilteredProps(details);
  return _normalizeResponseHeaders(filtered);
};

const _removeFilteredProps = (details: OnCompletedListenerDetails | OnErrorOccurredListenerDetails): Record<string, unknown> => {
  const filterProps = ['webContentsId', 'webContents', 'frame', 'uploadData'];
  return Object.fromEntries(
    Object.entries(details).filter(([key]) =>
      !filterProps.includes(key as keyof OnCompletedListenerDetails),
    ),
  );
};

const _normalizeResponseHeaders = (details: Record<string, unknown>): Record<string, unknown> => {
  if (!details.responseHeaders) {
    return details;
  }
  return {
    ...details,
    responseHeaders: Object.fromEntries(
      Object.entries(details.responseHeaders).map(([header, value]) =>
        [header, Array.isArray(value) ? value.join('; ') : value],
      ),
    ),
  };
};

export const checkProxyResolution = async (): Promise<void> => {
  log.info('Checking current proxy configuration by resolving proxy for target URLs');
  try {
    const targetUrls = ['https://app.loadmill.com', 'wss://app.loadmill.com', 'https://google.com', 'https://app.loadmill.com'];

    for (const url of targetUrls) {
      try {
        const resolvedProxy = await session.defaultSession.resolveProxy(url);
        log.info('Resolved proxy for URL', { resolvedProxy, url });
      } catch (error) {
        log.error('Failed to resolve proxy', { error, url });
      }
    }
  } catch (error) {
    log.error('Error querying current proxy configuration', {
      error: (error as Error).message || error,
      stack: (error as Error).stack,
    });
  }
};

export const logAllCommandLineSwitches = (): void => {
  log.info('Logging all command line switches related to proxy configuration');
  try {
    const switches = [
      'proxy-server',
      'proxy-bypass-list',
      'proxy-pac-url',
      'no-proxy-server',
      'host-resolver-rules',
      'auth-server-whitelist',
      'auth-negotiate-delegate-whitelist',
      'disable-http2',
      'ignore-certificate-errors',
      'disable-features',
      'enable-features',
    ];

    switches.forEach(switchName => {
      const value = app.commandLine.getSwitchValue(switchName);
      const hasSwitch = app.commandLine.hasSwitch(switchName);
      log.info({ hasSwitch, switchName, value });
    });
  } catch (error) {
    log.error('Error logging command line switches', {
      error: (error as Error).message || error,
      stack: (error as Error).stack,
    });
  }
};

export const logProxyEnvironmentVariables = (): void => {
  log.info('Logging proxy-related environment variables');
  const proxyEnvVars = [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'NO_PROXY',
    'http_proxy',
    'https_proxy',
    'no_proxy',
    'ALL_PROXY',
  ];

  log.info('Proxy environment variables to check', { proxyEnvVars });

  let foundVarsCount = 0;
  proxyEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log.info('Proxy environment variable found', { value, varName });
      foundVarsCount++;
    }
  });

  if (foundVarsCount === 0) {
    log.info('No proxy-related environment variables found');
  }
  log.info('Completed logging proxy-related environment variables');
};

export const startChromiumNetLog = async (): Promise<void> => {
  const logPath = path.join(app.getPath('logs'), 'net-log.json');
  log.info('Starting Chromium Net Log for proxy data collection', { logPath });
  try {
    await netLog.startLogging(logPath, {
      captureMode: 'includeSensitive', // Captures auth headers (be careful!)
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    log.info('Net log started', { logPath });

    setTimeout(async () => {
      await netLog.stopLogging();
      log.info('Net log stopped', { logPath });
    }, 60000); // 1 minute of logging
  } catch (error) {
    log.error('Error starting Chromium Net Log', {
      error: (error as Error).message || error,
      stack: (error as Error).stack,
    });
  }
};

export const collectProxyServerData = async (): Promise<void> => {
  log.info('Starting proxy server data collection');
  logWebRequests();
  await checkProxyResolution();
  logAllCommandLineSwitches();
  logProxyEnvironmentVariables();
  await startChromiumNetLog();
};
