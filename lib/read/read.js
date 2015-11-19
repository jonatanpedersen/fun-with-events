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
