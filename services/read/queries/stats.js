export function createHandleStats(read) {
  return async function handle(query) {
    let id = `stats`;
    return await read(id);
  }
}
