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
  return async function dispatch(thing) {
    let createHandle = handles[thing.name];

    if (createHandle) {
      let handle = createHandle();
      let result = await handle(thing);

      return result;
    } else {
      throw new Error(`${thing.name} not handled`);
    }
  };
}
