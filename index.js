'use strict';

import fs from 'fs';
import http from 'http';
import https from 'https';
import mongodb from 'mongodb';
import amqp from 'amqp';
import { Validator } from 'jsonschema';

let schemas = {
  createTask: require('./schemas/createTask.json'),
  deleteTask: require('./schemas/deleteTask.json')
};

async function authorize(command) {
  if (this.user)
    return Promise.resolve();

  return Promise.reject(new Error('Unathorized'));
}

async function validateUsingJsonSchema(command) {
  let result = this.validator.validate(command, this.schema);

  if (result.errors.length > 0)
    return Promise.reject(new Error('Invalid'));

  return Promise.resolve();
}

async function validateAuthorizeHandle(command) {
    await this.validate(command);
    await this.authorize(command);
    await this.handle(command);
}

async function dbFactory(connectionString) {
  return new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(connectionString, (err, db) => {
      if (err)
        reject(err);

      resolve(db);
    });
  });
}

async function appendToEventStream(streamName, eventName, eventData) {
  let publishEvent = this.publishEvent;

  return new Promise((resolve, reject) => {
    this.db.collection('events').insert({
      streamName: streamName,
      name: eventName,
      data: eventData
    }, (err, event) => {
      if (err)
        reject(err);

      resolve(event.ops[0]);
    });
  }).then(async (event) => {
    await publishEvent(event.name, event.data);

    return event;
  });
}

async function readEventStream(streamName) {
  return new Promise((resolve, reject) => {
    this.db.collection('events')
      .find({ streamName: streamName })
      .toArray((err, events) => {
        if (err)
          reject(err);

        resolve(events);
      });
  });
}

async function mqFactory(connectionString) {
  return new Promise((resolve, reject) => {
    let connection = amqp.createConnection({
      url: connectionString
    });

    connection.on('ready', () => {
      resolve(connection);
    });
  });
}

async function publishEvent(eventName, eventData) {
  return new Promise((resolve, reject) => {
    this.mq.publish(eventName, eventData, {}, () => {});

    resolve();
  });
}

async function getRequestBody(request) {
  return new Promise((resolve, reject) => {
    if (request.method == 'POST') {
        let body = '';

        request.on('data', function (data) {
            body += data;

            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
          try {
            let obj = JSON.parse(body);
            resolve(obj);
          }
          catch(ex) {
            reject(new Error(ex));
          }
        });
    } else {
        reject();
    }
  });
}

async function handleRequest(request, response) {
  try {
    let requestBody = await this.getRequestBody(request);
    await this.dispatch(requestBody.name, requestBody.data);

    response.statusCode = 200;
  }
  catch(ex) {
    response.statusCode = 304;
    response.statusMessage = ex;
  }

  response.end();
}

async function dispatch(name, data) {
  let handler = await this.handlers[name]();

  await handler(data);
}

async function createTask(data) {
  let events = await this.readEventStream(data.taskId);

  if (events.some(event => event.name === 'taskCreated'))
    throw new Error(`Task ${data.taskId} already created`);

  let event = await this.appendToEventStream(data.taskId, 'taskCreated', {
    taskId: data.taskId,
    description: data.description
  });
}

async function deleteTask(data) {
  let events = await this.readEventStream(data.taskId);

  if (events.every(event => event.name !== 'taskCreated'))
    throw new Error(`Task ${data.taskId} not created yet`);

  if (events.some(event => event.name === 'taskDeleted'))
    throw new Error(`Task ${data.taskId} already deleted`);

  await this.appendToEventStream(data.taskId, 'taskDeleted', {
    taskId: data.taskId
  });
}

async function main() {
  let db = await dbFactory('mongodb://localhost:27017/test');
  let mq = await mqFactory('amqp://guest:guest@localhost:5672');

  async function compositionRoot(request, response) {
    try {
      let boundPublishEvent = publishEvent.bind({mq: mq});
      let boundAppendToEventStream = appendToEventStream.bind({ db: db, publishEvent: boundPublishEvent });
      let boundReadEventStream = readEventStream.bind( {db: db });
      let boundAuthorize = authorize.bind({
        user: true
      });

      let boundHandleRequest = handleRequest.bind({
        dispatch: dispatch.bind({
          handlers: {
            createTask: () => validateAuthorizeHandle.bind({
              validate: validateUsingJsonSchema.bind({
                validator: new Validator(),
                schema: schemas.createTask
              }),
              authorize: boundAuthorize,
              handle: createTask.bind({
                readEventStream: boundReadEventStream,
                appendToEventStream: boundAppendToEventStream,
                publishEvent: boundPublishEvent
              })
            }),
            deleteTask: () => validateAuthorizeHandle.bind({
              validate: validateUsingJsonSchema.bind({
                validator: new Validator(),
                schema: schemas.deleteTask
              }),
              authorize: boundAuthorize,
              handle: deleteTask.bind({
                readEventStream: boundReadEventStream,
                appendToEventStream: boundAppendToEventStream,
                publishEvent: boundPublishEvent
              })
            })
          }
        }),
        getRequestBody: getRequestBody.bind({})
      });

      await boundHandleRequest(request, response);
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

main();
