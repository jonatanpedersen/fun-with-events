export function createHandleWall(read) {
  return async function handle(query) {
    try {
      let id = `wall-${query.params.wallId}`;
      return await read(id);
    } catch (err) {
      throw err;
    }
  }
}
