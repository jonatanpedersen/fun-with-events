export function createHandleWriteOnWall(readEvents, appendEvent) {
  return async function handle(action) {
    try {
      let events = await readEvents(action.params.wallId);

      let event = await appendEvent(action.params.wallId, {
        name: 'wallWrittenOn',
        data: {
          wallId: action.params.wallId,
          x: action.params.x,
          y: action.params.y,
          text: action.params.text,
          color: action.params.color
        }
      });
    } catch (err) {
      throw err;
    }
  }
}
