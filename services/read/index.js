'use strict';

import fs from 'fs';
import http from 'http';
import https from 'https';
import mongodb from 'mongodb';
import amqp from 'amqplib';
import { Validator } from 'jsonschema';

// lib
import { createConnectToMongoDB, createHandleRequest, createGetRequestBody, createGetRequestQuery, createDispatch, createCompositeHandle, createValidateUsingJsonSchema } from  '../../lib';
import { createReadFromMongoDB, createWriteToMongoDB, createSubscribeToRabbitMQAndDispatch } from '../../lib/read';

// events
import events from '../../events';

// handle events
import { createHandleWallBuilt } from  './events/wallBuilt';
import { createHandleWallCleaned } from  './events/wallCleaned';
import { createHandleWallDrawnOn } from  './events/wallDrawnOn';
import { createHandleWallMadePrivate } from  './events/wallMadePrivate';
import { createHandleWallMadePublic } from  './events/wallMadePublic';
import { createHandleWallWrittenOn } from  './events/wallWrittenOn';

// queries
import queries from '../../queries';

// handle queries
import { createHandleStats } from  './queries/stats';
import { createHandleWall } from  './queries/wall';
import { createHandleWallList } from  './queries/wallList';

async function main() {
  try {
    let db = await createConnectToMongoDB(mongodb)('mongodb://localhost:27017/read');
    let read = createReadFromMongoDB(db);
    let write = createWriteToMongoDB(db);

    let subscribeToRabbitMQAndDispatch = createSubscribeToRabbitMQAndDispatch(amqp, createDispatch({
      wallBuilt: () => createHandleWallBuilt(read, write),
      wallCleaned: () => createHandleWallCleaned(read, write),
      wallDrawnOn: () => createHandleWallDrawnOn(read, write),
      wallMadePrivate: () => createHandleWallMadePrivate(read, write),
      wallMadePublic: () => createHandleWallMadePublic(read, write),
      wallWrittenOn: () => createHandleWallWrittenOn(read, write)
    }));

    subscribeToRabbitMQAndDispatch();

    function createValidateWithJsonHandleWithReadFromMongoDB(schema, createHandle) {
      return createCompositeHandle(
        createValidateUsingJsonSchema(
          new Validator(),
          schema
        ),
        createHandle(read)
      );
    }

    async function compositionRoot(request, response) {
      try {
        let handleRequest = createHandleRequest(
          createGetRequestQuery(),
          createDispatch({
            stats: () => createHandleStats(read),
            wall: () => createValidateWithJsonHandleWithReadFromMongoDB(queries.wall, createHandleWall),
            wallList: () => createHandleWallList(read)
          })
        );

        await handleRequest(request, response);
      }
      catch(ex) {
        console.log(ex);
      }
    }

    let httpServer = http.createServer(compositionRoot);
    let httpsServer = https.createServer({ key: fs.readFileSync('./server.key', 'utf8'), cert: fs.readFileSync('./server.crt', 'utf8') }, compositionRoot);

    httpServer.listen(20080, () => { console.log('read listening on port 20080'); });
    httpsServer.listen(20443, () => { console.log('read listening on port 20443'); });
  }
  catch (ex) {
    console.log(ex);
  }
}

main();
