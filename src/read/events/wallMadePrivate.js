export function createHandleWallMadePrivate(read, write) {
  return async function handle(event) {
    try {
      let wallList = await read('wallList') || [];
      wallList.splice(wallList.indexOf(event.data.wallId), 1);
      await write('wallList', wallList);

      let id = `wall-${event.data.wallId}`;
      let wall = await read(id) || {};
      wall.private = true;
      await write(id, wall);
    } catch (err) {
      throw err;
    }    
  }
}
