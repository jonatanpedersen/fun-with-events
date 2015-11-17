export function createHandleCreateTask(readEvents, appendEvent) {
  return async function handle(action) {
    let events = await readEvents(action.taskId);

    if (events.some(event => event.name === 'taskCreated'))
      throw new Error(`Task ${action.taskId} already created`);

    let event = await appendEvent(action.taskId, 'taskCreated', {
      taskId: action.taskId,
      description: action.description
    });
  }
}
