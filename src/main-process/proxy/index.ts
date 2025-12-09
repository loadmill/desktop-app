import { randomUUID } from 'crypto';
import http from 'http';
import https from 'https';

import Proxy from 'loadmill-http-mitm-proxy';

import {
  sendFromProxyViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../log';
import { Header } from '../../types/header';
import { ProxyEntry, ProxyRequest, ProxyResponse } from '../../types/proxy-entry';
import { PROXY } from '../../universal/constants';
import { getHttpAgent, getHttpsAgent } from '../fetch/https-agent';

import { subscribeToClearEntriesEvents } from './clear-entries-handlers';
import { PROXY_CERTIFICATES_DIR_PATH } from './constants';
import { getEncoding } from './encoding';
import { addEntry } from './entries';
import { subscribeToExportAsHar } from './export-as-har';
import { shouldSendEntry } from './filters';
import { subscribeToFilterRegexEvents } from './filters-handlers';
import { subscribeToImportHar } from './import-har';
import { subscribeToGetIpAddressFromRenderer } from './ip-address';
import { subscribeToMarkRelevant } from './mark-relevant';
import { initToAvailablePort, subscribeToPort } from './port';
import { appendToProxyErrorsLog, getProxyErrorsLogPath } from './proxy-error-file';
import { getIsRecording, subscribeToRecordingStateEvents } from './recording-state';
import { subscribeToRefreshEntriesFromRenderer } from './refresh-entries';
import { subscribeToAnalyzeRequests } from './test-actions/analyze';
import { subscribeToCreateTest } from './test-actions/create-test';

const handleProxyError = (_ctx: Proxy.IContext, err: Error | undefined) => {
  const logId = randomUUID();
  log.error('Proxy Error: For more details, see', {
    id: logId,
    path: getProxyErrorsLogPath(),
  });
  appendToProxyErrorsLog(`${new Date().toLocaleString()} ${logId}: ${err}\n`, 'proxy-erros.log');
};

export const initProxyServer = async (): Promise<void> => {
  subscribeToProxyEvents();
  const proxyPort = await initToAvailablePort();

  const proxy = Proxy();
  proxy.use(Proxy.gunzip);

  proxy.onError(handleProxyError);
  proxy.onWebSocketError(handleProxyError);
  proxy.onWebSocketClose(() => appendToProxyErrorsLog(`${new Date().toLocaleString()}: WebSocket closed\n`, 'proxy-erros.log'));

  proxy.onWebSocketConnection = (): void => {};

  proxy.onWebSocketSend = (): void => {};

  proxy.onWebSocketMessage = (): void => {};

  proxy.onWebSocketFrame = (): void => {};

  proxy.onRequest(function (ctx, callback) {
    if (!getIsRecording()) {
      return callback();
    }

    const request = createRequest(ctx);

    handleResponse(request, ctx);

    return callback();
  });

  proxy.listen({
    httpAgent: getHttpAgent() as http.Agent,
    httpsAgent: getHttpsAgent() as https.Agent,
    port: proxyPort,
    sslCaDir: PROXY_CERTIFICATES_DIR_PATH,
  }, () => log.info(`Proxy listening on port ${proxyPort}! and saving to ${PROXY_CERTIFICATES_DIR_PATH}`));
};

const createRequest = (ctx: Proxy.IContext): ProxyRequest => {
  const request = toRequest(ctx);
  handleRequestBody(request, ctx);
  return request;
};

const toRequest = (ctx: Proxy.IContext): ProxyRequest => {
  const protocol = 'http' + (ctx.isSSL ? 's' : '') + '://';

  const { headers, method, url } = ctx.clientToProxyRequest;
  const { host } = headers;

  return {
    headers: toArrayHeaders(headers),
    method,
    url: protocol + host + url,
  };
};

const toArrayHeaders = (headers: http.IncomingHttpHeaders): Header[] => {
  const result: Header[] = [];

  if (!headers) {
    return result;
  }

  Object.entries(headers)
    .forEach(([name, value]) => {
      result.push({
        name,
        value: stringOrArrayToString(value),
      });
    });

  return result;
};

const stringOrArrayToString = (value: string | string[]): string =>
  Array.isArray(value) ?
    value.join(',') :
    value;

const handleRequestBody = (request: ProxyRequest, ctx: Proxy.IContext): void => {
  const requestBodyChunks: Uint8Array[] = [];

  ctx.onRequestData(function (_ctx, chunk, callback) {
    requestBodyChunks.push(chunk);
    return callback(null, chunk);
  });

  ctx.onRequestEnd(function (_ctx, callback) {
    setBody(request, requestBodyChunks);
    return callback();
  });
};

const setBody = (rOr: ProxyRequest | ProxyResponse, chunks: Uint8Array[]) => {
  const text = (Buffer.concat(chunks)).toString();
  rOr.body = {
    encoding: getEncoding(text),
    mimeType: getMimeType(rOr.headers),
    text,
  };
};

const getMimeType = (headers: Header[]): string | undefined => {
  const contentTypeHeader = headers.find((header) =>
    header.name?.toLowerCase() === 'content-type',
  );
  return contentTypeHeader?.value;
};

const handleResponse = (request: ProxyRequest, ctx: Proxy.IContext) => {
  const responseBodyChunks: Uint8Array[] = [];

  ctx.onResponseData((_ctx, chunk, callback) => {
    responseBodyChunks.push(chunk);
    return callback(null, chunk);
  });

  ctx.onResponseEnd((ctx, callback) => {
    const response = getResponse(ctx);

    setBody(response, responseBodyChunks);
    const entry: ProxyEntry = {
      id: randomUUID(),
      request,
      response,
      timestamp: Date.now(),
    };
    addEntry(entry);
    if (shouldSendEntry(entry.request.url)) {
      sendFromProxyViewToRenderer({
        data: {
          proxy: entry,
        },
        type: PROXY,
      });
    }
    return callback();
  });
};

const getResponse = (ctx: Proxy.IContext): ProxyResponse => {
  const { headers, statusCode, statusMessage } = ctx.serverToProxyResponse;
  return {
    headers: toArrayHeaders(headers),
    status: statusCode,
    statusText: statusMessage,
  };
};

const subscribeToProxyEvents = (): void => {
  subscribeToRecordingStateEvents();
  subscribeToRefreshEntriesFromRenderer();
  subscribeToFilterRegexEvents();
  subscribeToExportAsHar();
  subscribeToClearEntriesEvents();
  subscribeToGetIpAddressFromRenderer();
  subscribeToCreateTest();
  subscribeToAnalyzeRequests();
  subscribeToMarkRelevant();
  subscribeToPort();
  subscribeToImportHar();
};
