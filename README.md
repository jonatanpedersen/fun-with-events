# fun-with-events
This is an ongoing exploration of [CQRS](http://martinfowler.com/bliki/CQRS.html), [Event Sourcing](http://martinfowler.com/eaaDev/EventSourcing.html), [Pub/Sub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) and [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) in the context of [ES6/7](http://www.ecma-international.org/publications/standards/Ecma-262.htm) and the [S.O.L.I.D.](http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod) principles.

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
Start the services:
``` bash
sudo npm start
```

Open the user interface https://localhost

Note: You need RabbitMQ and MongoDB. The application connects to ```amqp://guest:guest@localhost:5672``` and ```mongodb://localhost:27017/test``` by default.

### Core Concepts

#### write api
 * Listens for commands and dispatches them to handlers that consume and append events from and to event streams. The event streams persist and publish events.

#### read api
 * Listens for events and dispatches them to handlers that update view models.
 * Listens for queries and dispatches them to handlers that serve view models.

#### ui
 * Serves static html files.

#### command
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

#### query
Something that describes a view on the read side. Contains a name and optional parameters.

``` js
{
  name: 'tasks',
  params: {
    order: 1
  }
}
```

#### dispatch
Dispatches a ```command```, ```event``` or  ```query``` to the appropriate ```handle``` function.

``` js
async function dispatch(thing) {
}
```

#### handle
Handles a ```command``` by mutating a domain object on the write side.
Handles an ```event``` by updating a view on the read side.
Handles a ```query``` by returning a view from the read side.

``` js
async function handle(thing) {
}
```

#### validate
Validates a ```command```, ```event``` or  ```query``` and throws an error if necessary.

``` js
async function validate(thing) {
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
