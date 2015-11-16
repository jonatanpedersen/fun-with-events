# fun-with-events

Fun with NODDD, DI, ES, MongoDB and RabbitMQ :)

## Create Task
```
POST / HTTP/1.1
Content-Type: application/json

{
"name": "createTask",
"data": {
    "taskId": 1,
    "description": "Get ducks in a row"
  }
}
```

## Delete Task
```
POST / HTTP/1.1
Content-Type: application/json

{
"name": "deleteTask",
"data": {
    "taskId": 1
  }
}
```
