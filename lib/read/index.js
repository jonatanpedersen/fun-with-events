export function createSubscribeToRabbitMQAndDispatch(amqp, dispatch) {
  return function() {
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

        function handleEvent(rawEvent) {
          var event = {
            name: rawEvent.fields.routingKey,
            data: JSON.parse(rawEvent.content.toString())
          };

          dispatch(event);
        }
      });
    }).then(null, console.warn);
  };
}

export function createReadFromMongoDB(db) {
  return async function read(id) {
    return new Promise((resolve, reject) => {
      db.collection('objects').findOne({ 'id': id }, (err, object) => {
        if (err)
          throw err;

        resolve((object || {}).data);
      });
    });
  }
}

export function createWriteToMongoDB(db) {
  return async function write(id, data) {
    return new Promise((resolve, reject) => {
      db.collection('objects').update({ 'id': id }, { id: id, data: data }, { upsert: true}, (err, object) => {
        if (err)
          throw err;

        resolve(object.data);
      });
    });
  }
}
