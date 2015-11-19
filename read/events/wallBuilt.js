export function createHandleWallBuilt(read, write) {
  return async function handle(event) {
    let stats = await read('stats');
    if (!stats.wallsBuilt) {
      stats.wallsBuilt = 0;
    }
    stats.wallsBuilt++;;
    await write('stats', stats);

    let id = `wall-${event.data.wallId}`;
    let wall = await read(id);

    wall.wallId = event.data.wallId;
    wall.lines = [];
    wall.texts = [];

    await write(id, wall);
  }
}
