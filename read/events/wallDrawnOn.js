export function createHandleWallDrawnOn(read, write) {
  return async function handle(event) {
    let id = `wall-${event.data.wallId}`;
    let wall = await read(id);
    wall.lines.push(event.data);
    await write(id, wall);
  }
}
