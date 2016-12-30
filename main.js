import fs from 'fs';
import http from 'http';
import https from 'https';
import httpProxy from 'http-proxy';

export function main() {

  let httpRouteMap = {
    '/api/write(.*)': 'http://127.0.0.1:10080',
    '/api/read(.*)': 'http://127.0.0.1:20080',
    '(.*)': 'http://127.0.0.1:30080'
  }

  let httpsRouteMap = {
    '/api/write(.*)': 'https://127.0.0.1:10433',
    '/api/read(.*)': 'https://127.0.0.1:20433',
    '(.*)': 'https://127.0.0.1:30433'
  }

  function createApp(routeMap) {
    let proxy = httpProxy.createProxyServer();

    proxy.on('error', function (err, req, res) {
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });

      res.end('Something went wrong. And we are reporting a custom error message.');
    });

    let routes = Object.keys(routeMap).reduce((routes, routeKey) => {
        routes.push({
          pattern:new RegExp(routeKey),
          target: routeMap[routeKey]
        });

        return routes;
    }, []);

    return function(request, response) {
      for (let i = 0; i < routes.length; i++) {
        let route = routes[i];
        let matches = request.url.match(route.pattern);

        if (matches) {
          console.log(`Proxy: ${request.url} => ${route.target}${matches[1]}`);

          request.url = matches[1];
          proxy.web(request, response, { target: route.target });

          break;
        }
      }
    };
  }

  let httpServer = http.createServer(createApp(httpRouteMap));
  let httpsServer = https.createServer({ key: fs.readFileSync('./server.key', 'utf8'), cert: fs.readFileSync('./server.crt', 'utf8') }, createApp(httpsRouteMap));

  httpServer.listen(80, () => { console.log('proxy listening on port 80'); });
  httpsServer.listen(443, () => { console.log('proxy listening on port 443'); });
}