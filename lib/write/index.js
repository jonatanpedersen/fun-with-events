var amqp = require('amqplib');
var when = require('when');

export function createAppendEventToMongoDB(db, publishEvent) {
  return async function appendEvent(streamName, event) {
    return new Promise((resolve, reject) => {
      db.collection('events').insert({ streamName, event }, (err, event) => {
        if (err)
          reject(err);

        resolve();
      });
    }).then(() => {
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
