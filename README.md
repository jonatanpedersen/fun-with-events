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

## Licence
The MIT License (MIT)

Copyright (c) 2015 Jonatan Pedersen https://www.jonatanpedersen.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
