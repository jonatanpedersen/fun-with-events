'use strict';

import fs from 'fs';
import http from 'http';
import https from 'https';
import mongodb from 'mongodb';
import amqp from 'amqplib';

import { Validator } from 'jsonschema';
import {
  createConnectToMongoDB,
  createConnectToRabbitMQ,
  createHandleRequest,
  createGetRequestBody,
  createGetRequestQuery,
  createDispatch,
  createCompositeHandle,
  createValidateUsingJsonSchema,
  createReadEventsFromMongoDB,
  createAppendEventToMongoDB
} from  '../lib';

// read/write
import { createReadFromMongoDB } from '../lib/read/read';
import { createWriteToMongoDB } from '../lib/read/write';

// queries
import { createHandleWall } from  './queries/wall';
import { createHandleStats } from  './queries/stats';

// events
import { createHandleWallBuilt } from  './events/wallBuilt';
import { createHandleWallCleaned } from  './events/wallCleaned';
import { createHandleWallDrawnOn } from  './events/wallDrawnOn';
import { createHandleWallWrittenOn } from  './events/wallWrittenOn';

let schemas = {
  wall: require('./queries/wall.json')
}

async function main() {
  try {
    let db = await createConnectToMongoDB(mongodb)('mongodb://localhost:27017/test');
    let read = createReadFromMongoDB(db);
    let write = createWriteToMongoDB(db);

    async function dispatchEvent(event) {
      let handles = {
        wallBuilt: () => createHandleWallBuilt(read, write),
        wallCleaned: () => createHandleWallCleaned(read, write),
        wallDrawnOn: () => createHandleWallDrawnOn(read, write),
        wallWrittenOn: () => createHandleWallWrittenOn(read, write),
      }

      let createHandle = handles[event.name];

      if (createHandle) {
        let handle = createHandle();

        if (handle) {
          try {
            await handle(event);
          }
          catch(ex) {
            console.log(ex);
          }
        }
      }
    }

    amqp.connect('amqp://localhost').then(function(connection) {
      process.once('SIGINT', function() { connection.close(); });

      return connection.createChannel().then(function(channel) {
        var ok = channel.assertExchange('test', 'fanout', {durable: true});

        ok = ok.then(function() {
          return channel.assertQueue('', { exclusive: true });
        });

        ok = ok.then(function(qok) {
          return channel.bindQueue(qok.queue, 'test', 'read').then(function() {
            return qok.queue;
          });
        });

        ok = ok.then(function(queue) {
          return channel.consume(queue, handleEvent, { noAck: false });
        });

        return ok.then(function() {
          console.log(' [*] Waiting for logs. To exit press CTRL+C');
        });

        function handleEvent(rawEvent) {
          var event = {
            name: rawEvent.fields.routingKey,
            data: JSON.parse(rawEvent.content.toString())
          };

          dispatchEvent(event);
        }
      });
    }).then(null, console.warn);

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
            wall: () => createValidateWithJsonHandleWithReadFromMongoDB(schemas.wall, createHandleWall),
            stats: () => createHandleStats(read)
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

    httpServer.listen(20080, () => { console.log('write listening on port 20080'); });
    httpsServer.listen(20443, () => { console.log('write listening on port 20443'); });
  }
  catch (ex) {
    console.log(ex);
  }
}

main();
