export function createHandleWallWrittenOn(read, write) {
  return async function handle(event) {
    try {
      let id = `wall-${event.data.wallId}`;
      let wall = await read(id) || {};
      wall.texts.push(event.data);
      await write(id, wall);
    } catch (err) {
      throw err;
    }
  }
}
