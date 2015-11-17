export function createHandleCreateTask(readEvents, appendEvent) {
  return async function handle(action) {
    let events = await readEvents(action.params.taskId);

    if (events.some(event => event.name === 'taskCreated'))
      throw new Error(`Task ${action.params.taskId} already created`);

    let event = await appendEvent(action.params.taskId, {
      name: 'taskCreated',
      data: {
        taskId: action.params.taskId,
        description: action.params.description
      }
    });
  }
}
