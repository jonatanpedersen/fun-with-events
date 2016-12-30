export function createHandleWallList(read) {
  return async function handle(query) {
    try {
      return await read('wallList');
    } catch (err) {
      throw err;
    }
  }
}
