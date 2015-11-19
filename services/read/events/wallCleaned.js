export function createHandleWallCleaned(read, write) {
  return async function handle(event) {
    let stats = await read('stats');
    if (!stats.wallsCleaned) {
      stats.wallsCleaned = 0;
    }
    stats.wallsCleaned++;;
    await write('stats', stats);

    let id = `wall-${event.data.wallId}`;
    let wall = await read(id);
    wall.lines = [];
    wall.texts = [];
    await write(id, wall);
  }
}
