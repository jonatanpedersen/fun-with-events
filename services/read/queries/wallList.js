export function createHandleWallList(read) {
  return async function handle(query) {
    return await read('wallList');
  }
}
