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
