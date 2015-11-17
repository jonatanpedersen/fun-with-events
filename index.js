'use strict';

import fs from 'fs';
import http from 'http';
import https from 'https';
import mongodb from 'mongodb';
import amqp from 'amqp';
import { Validator } from 'jsonschema';
import {
  createConnectToMongoDB,
  createConnectToRabbitMQ,
  createHandleRequest,
  createGetRequestBody,
  createDispatch,
  createCompositeHandle,
  createValidateUsingJsonSchema,
  createReadEventsFromMongoDB,
  createAppendEventToMongoDB
} from  './lib';

import { createHandleCreateTask } from  './actions/createTask';
import { createHandleDeleteTask } from  './actions/deleteTask';

let schemas = {
  createTask: require('./actions/createTask.json'),
  deleteTask: require('./actions/deleteTask.json')
}

async function main() {
  try {
    let db = await createConnectToMongoDB(mongodb)('mongodb://localhost:27017/test');
    let mq = await createConnectToRabbitMQ(amqp)('amqp://guest:guest@localhost:5672');

    async function compositionRoot(request, response) {
      try {
        let handleRequest = createHandleRequest(
          createGetRequestBody(),
          createDispatch({
            createTask: () => createCompositeHandle(
              createValidateUsingJsonSchema(
                new Validator(),
                schemas.createTask
              ),
              createHandleCreateTask(
                createReadEventsFromMongoDB(db),
                createAppendEventToMongoDB(db)
              )
            ),
            deleteTask: () => createCompositeHandle(
              createValidateUsingJsonSchema(
                new Validator(),
                schemas.deleteTask
              ),
              createHandleDeleteTask(
                createReadEventsFromMongoDB(db),
                createAppendEventToMongoDB(db)
              )
            )
          })
        );

        await handleRequest(request, response);
      }
      catch(ex) {
        console.log(ex);
      }
    }

    let httpServer = http.createServer(compositionRoot);
    let httpsServer = https.createServer({ key: fs.readFileSync('server.key', 'utf8'), cert: fs.readFileSync('server.crt', 'utf8') }, compositionRoot);

    httpServer.listen(80, () => { console.log('Listening on port 80'); });
    httpsServer.listen(443, () => { console.log('Listening on port 443'); });
  }
  catch (ex) {
    console.log(ex);
  }
}

main();
