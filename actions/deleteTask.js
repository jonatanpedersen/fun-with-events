export function createHandleDeleteTask(readEvents, appendEvent) {
  return async function handle(action) {
    let events = await readEvents(action.taskId);

    if (events.every(event => event.name !== 'taskCreated'))
      throw new Error(`Task ${action.taskId} not created yet`);

    if (events.some(event => event.name === 'taskDeleted'))
      throw new Error(`Task ${action.taskId} already deleted`);

    await appendEvent(action.taskId, 'taskDeleted', {
      taskId: action.taskId
    });
  }
}
