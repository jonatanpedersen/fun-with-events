'use strict';

import fs from 'fs';
import http from 'http';
import https from 'https';
import mongodb from 'mongodb';
import amqp from 'amqp';
import { Validator } from 'jsonschema';
import {
  createConnectToMongoDB,
  createHandleRequest,
  createGetRequestBody,
  createDispatch,
  createCompositeHandle,
  createValidateUsingJsonSchema,
  createReadEventsFromMongoDB,
  createAppendEventToMongoDB,
  createPublishEventToRabbitMQ
} from  '../../lib';

import { createHandleBuildWall } from  './commands/buildWall';
import { createHandleCleanWall } from  './commands/cleanWall';
import { createHandleDrawOnWall } from  './commands/drawOnWall';
import { createHandleWriteOnWall } from  './commands/writeOnWall';

let schemas = {
  buildWall: require('../../commands/buildWall.json'),
  cleanWall: require('../../commands/cleanWall.json'),
  drawOnWall: require('../../commands/drawOnWall.json'),
  writeOnWall: require('../../commands/writeOnWall.json')
}

async function main() {
  try {
    let db = await createConnectToMongoDB(mongodb)('mongodb://localhost:27017/test');

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
            buildWall: () => createValidateWithJsonHandleWithDb(schemas.buildWall, createHandleBuildWall),
            cleanWall: () => createValidateWithJsonHandleWithDb(schemas.cleanWall, createHandleCleanWall),
            drawOnWall: () => createValidateWithJsonHandleWithDb(schemas.drawOnWall, createHandleDrawOnWall),
            writeOnWall: () => createValidateWithJsonHandleWithDb(schemas.writeOnWall, createHandleWriteOnWall)
          })
        );

        await handleRequest(request, response);
      }
      catch (ex) {
        console.log(ex);
      }
    }

    let httpServer = http.createServer(compositionRoot);
    let httpsServer = https.createServer({ key: fs.readFileSync('./server.key', 'utf8'), cert: fs.readFileSync('./server.crt', 'utf8') }, compositionRoot);

    httpServer.listen(10080, () => { console.log('write listening on port 10080'); });
    httpsServer.listen(10443, () => { console.log('write listening on port 10443'); });
  }
  catch (ex) {
    console.log(ex);
  }
}

main();
