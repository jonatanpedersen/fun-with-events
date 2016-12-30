export function createHandleWallMadePublic(read, write) {
  return async function handle(event) {
    try {
      let wallList = await read('wallList') || [];
      wallList.push(event.data.wallId);
      await write('wallList', wallList);

      let id = `wall-${event.data.wallId}`;
      let wall = await read(id) || {};
      wall.private = false;
      await write(id, wall);
    } catch (err) {
      throw err;
    }
  }
}
