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
