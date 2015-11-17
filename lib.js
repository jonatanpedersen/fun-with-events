import mongodb from 'mongodb';
import amqp from 'amqp';

export function createNoopAuthorize() {
  return async function authorize(action) {
      return Promise.resolve();
  };
}

export function createValidateUsingJsonSchema(validator, schema) {
  return async function validate(action) {
    let result = validator.validate(action, schema);

    if (result.errors.length > 0)
      return Promise.reject(new Error('Invalid'));

    return Promise.resolve();
  };
}

export function createCompositeHandle(...handles) {
  return async function handle(action) {
    for(let i = 0; i < handles.length; i++) {
      await handles[i](action);
    }
  }
}

export function createConnectToMongoDB() {
  return async function connectToMongoDB(connectionString) {
    return new Promise(function(resolve, reject) {
      mongodb.MongoClient.connect(connectionString, (err, db) => {
        if (err)
          reject(err);

        resolve(db);
      });
    });
  };
}

export function createAppendEventToMongoDB(db) {
  return async function appendEvent(streamName, eventName, eventData) {
    return new Promise((resolve, reject) => {
      db.collection('events').insert({
        streamName: streamName,
        name: eventName,
        data: eventData
      }, (err, event) => {
        if (err)
          reject(err);

        resolve(event.ops[0]);
      });
    });
  };
}

export function createReadEventsFromMongoDB(db) {
  return async function readEvents(streamName) {
    return new Promise((resolve, reject) => {
      db.collection('events')
        .find({ streamName: streamName })
        .toArray((err, events) => {
          if (err)
            reject(err);

          resolve(events);
        });
    });
  };
}

export function createConnectToRabbitMQ() {
  return async function connectToRabbitMQ(connectionString) {
    return new Promise((resolve, reject) => {
      let connection = amqp.createConnection({
        url: connectionString
      });

      connection.on('ready', () => {
        resolve(connection);
      });
    });
  };
}

export function createPublishEventToRabbitMQ(connection) {
  return async function publishEvent(eventName, eventData) {
    return new Promise((resolve, reject) => {
      connection.publish(eventName, eventData, {}, () => {});

      resolve();
    });
  };
}

export function createGetRequestBody() {
  return async function getRequestBody(request) {
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
  };
}

export function createHandleRequest(getRequestBody, dispatch) {
  return async function handleRequest(request, response) {
    try {
      let requestBody = await getRequestBody(request);
      await dispatch(requestBody.name, requestBody.data);

      response.statusCode = 200;
    }
    catch(ex) {
      response.statusCode = 304;
      response.statusMessage = ex;
    }

    response.end();
  };
}

export function createDispatch(handles) {
  return async function dispatch(name, action) {
    let handle = handles[name]();

    await handle(action);
  };
}
