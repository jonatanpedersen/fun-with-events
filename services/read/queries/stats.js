export function createHandleStats(read) {
  return async function handle(query) {
    return await read('stats');
  }
}
