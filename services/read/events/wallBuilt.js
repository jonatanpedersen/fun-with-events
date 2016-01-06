export function createHandleWallBuilt(read, write) {
  return async function handle(event) {
    let wallList = await read('wallList');
    wallList = wallList || [];
    wallList.push(event.data.wallId);
    await write('wallList', wallList);

    let stats = await read('stats');
    stats = stats || {};
    if (!stats.wallsBuilt) {
      stats.wallsBuilt = 0;
    }
    stats.wallsBuilt++;;
    await write('stats', stats);

    let id = `wall-${event.data.wallId}`;
    let wall = await read(id);
    wall = wall || {};
    wall.private = false;
    wall.wallId = event.data.wallId;
    wall.lines = [];
    wall.texts = [];

    await write(id, wall);
  }
}
