// example-proxy/example-proxy.js
//
// Minimal HTTP proxy for local testing of Electron / Selenium / etc.
// - Supports HTTP CONNECT (for HTTPS)
// - Can require Basic proxy auth (Proxy-Authorization header)
// - Simple logging for debugging

const http = require('http');
const net = require('net');
const { URL } = require('url');

/**
 * Configuration
 */
const PROXY_PORT = process.env.PROXY_PORT || 5678;

// Toggle auth requirement
const REQUIRE_AUTH = true;              // set to false to allow all traffic
const PROXY_USER = 'user';             // proxy username
const PROXY_PASS = 'pass';             // proxy password

// If you want to reject upstream self-signed certs, set to true
const REJECT_UNAUTHORIZED = false;

// Very simple logger
function log(...args) {
  console.log(new Date().toISOString(), '-', ...args);
}

/**
 * Auth helpers
 */
const expectedAuthHeader = (() => {
  const token = Buffer.from(`${PROXY_USER}:${PROXY_PASS}`, 'utf8').toString('base64');
  return `Basic ${token}`;
})();

function checkProxyAuth(headers) {
  if (!REQUIRE_AUTH) return true;
  log({ headers });
  const header = headers['proxy-authorization'];
  return header === expectedAuthHeader;
}

function sendProxyAuthRequired(res) {
  res.writeHead(407, {
    'Proxy-Authenticate': 'Basic realm="ExampleProxy"',
    'Content-Type': 'text/plain',
  });
  res.end('407 Proxy Authentication Required\n');
}

/**
 * HTTP request handler (non-CONNECT)
 */
function handleHttpRequest(clientReq, clientRes) {
  if (!checkProxyAuth(clientReq.headers)) {
    log('407 for HTTP request', clientReq.method, clientReq.url);
    return sendProxyAuthRequired(clientRes);
  }

  // Remove Proxy-Authorization before forwarding
  const headers = { ...clientReq.headers };
  delete headers['proxy-authorization'];

  // clientReq.url is usually an absolute URL when using a proxy
  let targetUrl;
  try {
    if (/^https?:\/\//i.test(clientReq.url)) {
      targetUrl = new URL(clientReq.url);
    } else {
      // Fallback for relative URLs: use Host header
      const host = clientReq.headers.host;
      const protocol = 'http:'; // best effort; most proxies only see absolute URLs
      targetUrl = new URL(`${protocol}//${host}${clientReq.url}`);
    }
  } catch (err) {
    log('Bad URL from client', clientReq.url, err.message);
    clientRes.writeHead(400);
    clientRes.end('Bad request URL');
    return;
  }

  const isHttps = targetUrl.protocol === 'https:';
  const upstreamModule = isHttps ? require('https') : require('http');

  const options = {
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port: targetUrl.port || (isHttps ? 443 : 80),
    method: clientReq.method,
    path: targetUrl.pathname + targetUrl.search,
    headers,
    rejectUnauthorized: REJECT_UNAUTHORIZED,
  };

  log('HTTP proxy request ->', clientReq.method, targetUrl.href);

  const upstreamReq = upstreamModule.request(options, upstreamRes => {
    clientRes.writeHead(upstreamRes.statusCode, upstreamRes.headers);
    upstreamRes.pipe(clientRes);
  });

  upstreamReq.on('error', err => {
    log('Upstream HTTP error', targetUrl.href, err.code || err.message);
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
    }
    clientRes.end('Bad gateway\n');
  });

  clientReq.pipe(upstreamReq);
}

/**
 * CONNECT handler (for HTTPS tunneling)
 */
function handleConnect(req, clientSocket, head) {
  if (!checkProxyAuth(req.headers)) {
    log('407 for CONNECT request', req.url);
    clientSocket.write(
      'HTTP/1.1 407 Proxy Authentication Required\r\n' +
        'Proxy-Authenticate: Basic realm="ExampleProxy"\r\n' +
        'Content-Type: text/plain\r\n' +
        '\r\n' +
        '407 Proxy Authentication Required\n'
    );
    clientSocket.destroy();
    return;
  }

  // req.url is host:port
  const [host, portString] = req.url.split(':');
  const port = parseInt(portString, 10) || 443;

  log('CONNECT proxy request ->', host, port);

  // Create a raw TCP tunnel to the target server
  const serverSocket = net.connect(port, host, () => {
    // Tell client the tunnel is established
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');

    // If there was any buffered data, send it
    if (head && head.length) {
      serverSocket.write(head);
    }

    // Pipe data in both directions
    clientSocket.pipe(serverSocket);
    serverSocket.pipe(clientSocket);
  });

  serverSocket.on('error', err => {
    log('Upstream CONNECT error', host, port, err.code || err.message);
    clientSocket.end();
  });

  clientSocket.on('error', err => {
    log('Client socket error', err.code || err.message);
    serverSocket.end();
  });
}

/**
 * Start the proxy server
 */
const server = http.createServer();
server.on('request', handleHttpRequest);
server.on('connect', handleConnect);

server.on('clientError', (err, socket) => {
  log('Client parse error', err.message);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PROXY_PORT, () => {
  log(`Example proxy listening on port ${PROXY_PORT}`);
  log(`Auth required: ${REQUIRE_AUTH ? 'yes' : 'no'}`);
  if (REQUIRE_AUTH) {
    log(`Username: ${PROXY_USER}, Password: ${PROXY_PASS}`);
  }
  log('Proxy settings', {
    host: 'localhost',
    port: PROXY_PORT,
    protocol: 'http',
    ...(REQUIRE_AUTH ? { username: PROXY_USER, password: PROXY_PASS } : {}),
  })
  log('Proxy URL:', (() => {
    const authPart = REQUIRE_AUTH ? `${PROXY_USER}:${PROXY_PASS}@` : '';
    return `http://${authPart}localhost:${PROXY_PORT}`;
  })());
});
