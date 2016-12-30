import fs from 'fs';
import http from 'http';
import https from 'https';
import mongodb from 'mongodb';
import { Validator } from 'jsonschema';
import { createConnectToMongoDB, createHandleRequest, createGetRequestBody, createDispatch, createCompositeHandle, createValidateUsingJsonSchema } from  '../../lib';
import { createReadEventsFromMongoDB, createAppendEventToMongoDB, createPublishEventToRabbitMQ } from  '../../lib/write';
import { createHandleBuildWall } from  './commands/buildWall';
import { createHandleCleanWall } from  './commands/cleanWall';
import { createHandleDrawOnWall } from  './commands/drawOnWall';
import { createHandleMakeWallPrivate } from  './commands/makeWallPrivate';
import { createHandleMakeWallPublic } from  './commands/makeWallPublic';
import { createHandleWriteOnWall } from  './commands/writeOnWall';
import commands from '../../commands';

export async function main() {
  try {
    let db = await createConnectToMongoDB(mongodb)('mongodb://localhost:27017/write');

    function createValidateWithJsonHandleWithDb(schema, createHandle) {
      return createCompositeHandle(
        createValidateUsingJsonSchema(
          new Validator(),
          schema
        ),
        createHandle(
          createReadEventsFromMongoDB(db),
          createAppendEventToMongoDB(db, createPublishEventToRabbitMQ())
        )
      );
    }

    async function compositionRoot(request, response) {
      try {
        let handleRequest = createHandleRequest(
          createGetRequestBody(),
          createDispatch({
            buildWall: () => createValidateWithJsonHandleWithDb(commands.buildWall, createHandleBuildWall),
            cleanWall: () => createValidateWithJsonHandleWithDb(commands.cleanWall, createHandleCleanWall),
            drawOnWall: () => createValidateWithJsonHandleWithDb(commands.drawOnWall, createHandleDrawOnWall),
            makeWallPrivate: () => createValidateWithJsonHandleWithDb(commands.makeWallPrivate, createHandleMakeWallPrivate),
            makeWallPublic: () => createValidateWithJsonHandleWithDb(commands.makeWallPublic, createHandleMakeWallPublic),
            writeOnWall: () => createValidateWithJsonHandleWithDb(commands.writeOnWall, createHandleWriteOnWall)
          })
        );

        await handleRequest(request, response);
      }
      catch (err) {
        console.error(err);
      }
    }

    let httpServer = http.createServer(compositionRoot);
    let httpsServer = https.createServer({ key: fs.readFileSync('./server.key', 'utf8'), cert: fs.readFileSync('./server.crt', 'utf8') }, compositionRoot);

    httpServer.listen(10080, () => { console.log('write listening on port 10080'); });
    httpsServer.listen(10443, () => { console.log('write listening on port 10443'); });
  }
  catch (err) {
    console.error(err);
  }
}