export function createHandleWriteOnWall(readEvents, appendEvent) {
  return async function handle(action) {
    let events = await readEvents(action.params.wallId);

    let event = await appendEvent(action.params.wallId, {
      name: 'wallWrittenOn',
      data: {
        wallId: action.params.wallId,
        text: action.params.text,
        x: action.params.x,
        y: action.params.y,
        color: action.params.color
      }
    });
  }
}
