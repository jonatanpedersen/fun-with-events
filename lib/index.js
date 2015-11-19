var amqp = require('amqplib');
var when = require('when');
var url = require('url');

export function createValidateUsingJsonSchema(validator, schema) {
  return async function validate(command) {
    let result = validator.validate(command.params || {}, schema);

    if (result.errors.length > 0)
      return Promise.reject(new Error('Invalid'));

    return Promise.resolve();
  };
}

export function createCompositeHandle(...handles) {
  return async function handle(command) {
    let result;

    for(let i = 0; i < handles.length; i++) {
      result = await handles[i](command);
    }

    return result;
  }
}

export function createConnectToMongoDB(mongodb) {
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

export function createAppendEventToMongoDB(db, publishEvent) {
  return async function appendEvent(streamName, event) {
    return new Promise((resolve, reject) => {
      db.collection('events').insert({ streamName, event }, (err, event) => {
        if (err)
          reject(err);

        resolve();
      });
    }).then((err) => {
      console.log(err); 
      publishEvent(event.name, event.data);


      return event;
    });
  };
}

export function createReadEventsFromMongoDB(db) {
  return async function readEvents(streamName) {
    return new Promise((resolve, reject) => {
      db.collection('events')
        .find({ streamName: streamName })
        .toArray((err, documents) => {
          if (err)
            reject(err);

          resolve(documents.map(document => document.event));
        });
    });
  };
}

// export function createConnectToRabbitMQ(amqp) {
//   return async function connectToRabbitMQ(connectionString) {
//     return new Promise((resolve, reject) => {
//       let connection = amqp.createConnection({
//         url: connectionString
//       });
//
//       var exchange = connection.exchange('test', () => {
//         console.log(a);
//       });
//
//       connection.on('ready', () => {
//         console.log(exchange);
//         resolve(exchange);
//       });
//     });
//   };
// }

export function createPublishEventToRabbitMQ() {
  return async function publishEvent(eventName, eventData) {
    return amqp.connect('amqp://localhost').then(function(connection) {
      return when(connection.createChannel().then(function(channel) {
        var exchange = 'test';
        var ok = channel.assertExchange(exchange, 'fanout', {durable: true})

        return ok.then(function() {
          channel.publish(exchange, eventName, new Buffer(JSON.stringify(eventData)));

          return channel.close();
        });
      })).ensure(function() { connection.close(); });
    }).then(null, console.warn);
  };
}

export function createGetRequestQuery() {
  return async function getRequestQuery(request) {
    return new Promise((resolve, reject) => {
      if (request.method == 'GET') {
        let requestUrl = url.parse(request.url, true);

        let name = requestUrl.query.name;
        delete requestUrl.query.name;

        let params = requestUrl.query;

        resolve({ name, params });
      } else {
          reject();
      }
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

export function createHandleRequest(modelBind, dispatch) {
  return async function handleRequest(request, response) {
    try {
      let model = await modelBind(request);
      let result = await dispatch(model);
      let json = JSON.stringify(result || {});
      response.setHeader('Content-Type', 'application/json');
      response.write(json);
      response.statusCode = 200;
    }
    catch (ex) {
      response.statusCode = 500;
      response.statusMessage = ex;
    }
    finally {
      response.end();
    }
  };
}

export function createDispatch(handles) {
  return async function dispatch(action) {
    let createHandle = handles[action.name];

    if (createHandle) {
      let handle = createHandle();
      let result = await handle(action);

      return result;
    } else {
      throw new Error(`action ${action.name} not handled`);
    }
  };
}
