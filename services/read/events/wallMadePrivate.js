export function createHandleWallMadePrivate(read, write) {
  return async function handle(event) {
    let wallList = await read('wallList') || [];
    console.log(wallList);
    wallList.splice(wallList.indexOf(event.data.wallId), 1);
    await write('wallList', wallList);

    let id = `wall-${event.data.wallId}`;
    let wall = await read(id) || {};
    wall.private = true;
    await write(id, wall);
  }
}
