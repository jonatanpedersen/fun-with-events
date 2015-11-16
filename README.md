# fun-with-events

Fun with NO-DDD, NO-CRUD, NO-REST, DI, ES, MongoDB and RabbitMQ :)

## Install

``` bash
git clone git@github.com:jonatanpedersen/fun-with-events.git
```

``` bash
npm install
```

## Usage

``` bash
npm start
```
## Test

``` bash
npm test
```

## API
### Create Task
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

### Delete Task
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
