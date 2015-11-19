export function createHandleWall(read) {
  return async function handle(query) {
    let id = `wall-${query.params.wallId}`;
    return await read(id);
  }
}
