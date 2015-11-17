export function createHandleDeleteTask(readEvents, appendEvent) {
  return async function handle(action) {
    let events = await readEvents(action.params.taskId);

    if (events.every(event => event.name !== 'taskCreated'))
      throw new Error(`Task ${action.params.taskId} not created yet`);

    if (events.some(event => event.name === 'taskDeleted'))
      throw new Error(`Task ${action.params.taskId} already deleted`);

    await appendEvent(action.params.taskId, {
      name: 'taskDeleted',
      data: {
        taskId: action.params.taskId
      }
    });
  }
}
