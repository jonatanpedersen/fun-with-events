export function createHandleDrawOnWall(readEvents, appendEvent) {
  return async function handle(action) {
    try {
      let events = await readEvents(action.params.wallId);

      let event = await appendEvent(action.params.wallId, {
        name: 'wallDrawnOn',
        data: {
          wallId: action.params.wallId,
          x1: action.params.x1,
          y1: action.params.y1,
          x2: action.params.x2,
          y2: action.params.y2,
          color: action.params.color
        }
      });
    } catch (err) {
      throw err;
    }
  }
}
