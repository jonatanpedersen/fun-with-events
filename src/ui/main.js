import fs from 'fs';
import http from 'http';
import https from 'https';
import express from 'express';

export function main () {
	let app = express();
	app.use('/', express.static('./services/ui/public'));

	let httpServer = http.createServer(app);
	let httpsServer = https.createServer({ key: fs.readFileSync('./server.key', 'utf8'), cert: fs.readFileSync('./server.crt', 'utf8') }, app);

	httpServer.listen(30080, () => { console.log('ui listening on port 30080'); });
	httpsServer.listen(30443, () => { console.log('ui listening on port 30443'); });
}