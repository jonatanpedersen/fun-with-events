export function createHandleCleanWall(readEvents, appendEvent) {
  return async function handle(action) {
    try {
      let events = await readEvents(action.params.wallId);

      let event = await appendEvent(action.params.wallId, {
        name: 'wallCleaned',
        data: {
          wallId: action.params.wallId
        }
      });
    } catch (err) {
      throw err;
    }
  }
}
