# fun-with-events
This is an ongoing exploration of [CQRS](http://martinfowler.com/bliki/CQRS.html), [Event Sourcing](http://martinfowler.com/eaaDev/EventSourcing.html), [Pub/Sub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) and [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) in the context of [ES6/7](http://www.ecma-international.org/publications/standards/Ecma-262.htm), [functional programming](https://en.wikipedia.org/wiki/Functional_programming) and [S.O.L.I.D.](http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod) principles.

## Setup
Clone from GitHub:
``` bash
git clone git@github.com:jonatanpedersen/fun-with-events.git
```
Install dependencies:

``` bash
npm install
```

## Usage
Start the application:
``` bash
npm start
```

Note: You need RabbitMQ and MongoDB. The application connects to ```amqp://guest:guest@localhost:5672``` and ```mongodb://localhost:27017/test``` by default.

### Core Concepts

#### action
Something that describes a desired mutation of a domain object. Consists of a name and some parameters.

``` js
{
  name: 'createTask',
  params: {
    taskId: 1,
    description: 'Get ducks in a row'
  }
}
```

Actions are always named with a verb followed by the name of the domain object. e.g. ```createTask```.

#### event
Something that tell us that a domain object has mutated. Consists of a name and some data.

``` js
{
  name: 'taskCreated',
  data: {
    taskId: 1,
    description: 'Get ducks in a row'
  }
}
```

Events are always named in the past tense e.g. ```taskCreated```.

#### dispatch
Dispatches an ```action``` to a ```handle```.

``` js
async function dispatch(action) {
}
```

#### handle
Handles an ```action``` by mutating a domain object.

``` js
async function handle(action) {
}
```

#### validate
Validates an ```action``` and throws errors if necessary.

``` js
async function validate(action) {
}
```

#### composition root
The applications ```main()``` function is the composition root, and it is composed primarily of ```functions```.

#### dependency injection
All functions should have their dependencies injected during creation.

``` js
function create(dependency1, dependency2) {
  return async function (arg1, arg2) {
      // call dependency1
      // call dependency2
  }
}
```

### API
The following actions have been created in this example application.

#### Create Task
```
POST / HTTP/1.1
Content-Type: application/json

{
  "name": "createTask",
  "params": {
      "taskId": 1,
      "description": "Get ducks in a row"
    }
}
```

#### Delete Task
```
POST / HTTP/1.1
Content-Type: application/json

{
  "name": "deleteTask",
  "params": {
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
