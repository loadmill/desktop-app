import { randomUUID } from 'crypto';
import http from 'http';

import async from 'async';
import Proxy from 'http-mitm-proxy';

import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import log from '../../log';
import { Header } from '../../types/header';
import { ProxyEntry, ProxyRequest, ProxyResponse } from '../../types/proxy-entry';
import { PROXY } from '../../universal/constants';
import { PROXY_CERTIFICATES_DIR_PATH } from '../constants';

import { subscribeToClearEntriesEvents } from './clear-entries-handlers';
import { dummyEntries } from './dummy-entries-delete-later';
import { addEntry, initEntries } from './entries';
import { subscribeToExportAsHar } from './export-as-har';
import { shouldSendEntry } from './filters';
import { subscribeToFilterRegexEvents } from './filters-handlers';
import { subscribeToGetIpAddressFromRenderer } from './ip-address';
import { appendToProxyErrorsLog, getProxyErrorsLogPath } from './proxy-error-file';
import { getIsRecording, subscribeToRecordingStateEvents } from './recording-state';
import { subscribeToRefreshEntriesFromRenderer } from './refresh-entries';

export const initProxyServer = (): void => {
  initEntries(dummyEntries);
  subscribeToProxyEvents();
  const proxyPort = Number(process.env.PROXY_PORT || 1234);

  const proxy = Proxy();
  proxy.use(Proxy.gunzip);

  proxy.onError((_ctx, err) => {
    const logId = randomUUID();
    log.error('Proxy Error: For more details, see', {
      id: logId,
      path: getProxyErrorsLogPath(),
    });
    appendToProxyErrorsLog(`${new Date().toLocaleString() } ${logId}: ${err}\n`, 'proxy-erros.log');
  });

  // nasty hack, will fix it later
  //@ts-ignore
  proxy._onWebSocketClose = function (ctx, closedByServer, code, message) {
    if (!ctx.closedByServer && !ctx.closedByClient) {
      ctx.closedByServer = closedByServer;
      ctx.closedByClient = !closedByServer;
      //@ts-ignore
      async.forEach(this.onWebSocketCloseHandlers.concat(ctx.onWebSocketCloseHandlers), function (fn: Function, callback) {
        return fn(ctx, code, message, callback);
      }, function (err) {
        if (err) {
          //@ts-ignore
          return self._onWebSocketError(ctx, err);
        }
        if (ctx.clientToProxyWebSocket.readyState !== ctx.proxyToServerWebSocket.readyState) {
          if (ctx.clientToProxyWebSocket.readyState === WebSocket.CLOSED && ctx.proxyToServerWebSocket.readyState === WebSocket.OPEN) {
            ctx.proxyToServerWebSocket.close(1000, message);
          } else if (ctx.proxyToServerWebSocket.readyState === WebSocket.CLOSED && ctx.clientToProxyWebSocket.readyState === WebSocket.OPEN) {
            ctx.clientToProxyWebSocket.close(1000, message);
          }
        }
      });
    }
  };

  proxy.onRequest(function (ctx, callback) {
    if (!getIsRecording()) {
      return callback();
    }

    const request = createRequest(ctx);

    handleResponse(request, ctx);

    return callback();
  });

  proxy.listen({
    port: proxyPort,
    sslCaDir: PROXY_CERTIFICATES_DIR_PATH,
  }, () => log.info(`Proxy listening on port ${proxyPort}! and saving to ${PROXY_CERTIFICATES_DIR_PATH}`));
};

const createRequest = (ctx: Proxy.IContext): ProxyRequest => {
  const request = toRequest(ctx);
  handleRequestBody(request, ctx);
  return request;
};

const toRequest = (ctx: HttpMitmProxy.IContext): ProxyRequest => {
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
        value: stringOrArrayToString(value)
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
  rOr.body = {
    mimeType: getMimeType(rOr.headers),
    text: (Buffer.concat(chunks)).toString(),
  };
};

const getMimeType = (headers: Header[]): string | undefined => {
  const contentTypeHeader = headers.find((header) =>
    header.name?.toLowerCase() === 'content-type'
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
      sendFromProxyToRenderer({
        data: {
          proxy: entry,
        },
        type: PROXY,
      });
    }
    return callback();
  });
};

const getResponse = (ctx: HttpMitmProxy.IContext): ProxyResponse => {
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
};
