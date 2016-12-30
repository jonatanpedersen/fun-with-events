export function createHandleStats(read) {
  return async function handle(query) {
    try {
      return await read('stats');
    } catch (err) {
      throw err;
    }
  }
}
