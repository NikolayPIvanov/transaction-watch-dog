# Ethereum Transactions Watchdog

## Introduction

The goal of the Ruling system is to monitor the Ethereum blockchain and make the right decision based on a given rule set.
The solution is looking at the system as a distributed system of three different components - API, Message Relay and Watchdog.

## Requirements

For detailed requirements check transaction-watch-dog.md file in this repository.

## Quick start

1. Install LTS version of [Node](https://nodejs.org/en/)
2. Clone the repository
3. (_Optional_) If you have Docker you can run `docker-compose up` in root of the repository. This will create the infrastructure dependencies.
4. API
   1. Navigate to `ruling-api` folder
   2. Open a terminal and write `npm i`
   3. Create `.env` file with the following envrionment variables
      ```
        PORT=<port on which the API will run>
        MONGODB_URI=<MongoDB connection string for API database>
        ENV=<type of environment for the API>
      ```
      Default value for `PORT` is `3000`.
      No default value for `MONGODB_URI` is present. This uri has to specify the name of the database you want to be created.
      Default value for `ENV` is `production`. Possible values are `production` and `development`
   4. Open a terminal and write `npm start`
   5. Logs should indicate that the API is running on the specified port.
5. Message Relay

   1. Navigate to `message-relay` folder
   2. Open a terminal and write `npm i`
   3. Create `.env` file with the following envrionment variables
      ```
        CRON_EXPRESSION=<at what interval the message relay will look for messages to publish>
        MONGODB_URI=<MongoDB connection string for API database>
        RABBITMQ_HOSTNAME=<RabbitMQ hostname>
        RABBITMQ_PROTOCOL=<RabbitMQ protocol>
        RABBITMQ_PORT=<RabbitMQ port>
        RABBITMQ_USER=<RabbitMQ username>
        RABBITMQ_PASS=<RabbitMQ password>
      ```
      Default value for `CRON_EXPRESSION` is `'*/5 * * * * *'` (each 5 seconds).
      No default value for `MONGODB_URI` is present. This has to point to the same database as the API for the [Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html) to work.
      Default value for `RABBITMQ_HOSTNAME` is `localhost`.
      Default value for `RABBITMQ_PROTOCOL` is `amqp`.
      Default value for `RABBITMQ_PORT` is `5672`.
      Default value for `RABBITMQ_USER` is `myuser`.
      Default value for `RABBITMQ_PASS` is `mypassword`.
   4. Open a terminal and write `npm start`
   5. Logs should indicate that the relay is running.

6. Watchdog
   1. Navigate to `watchdog` folder
   2. Open a terminal and write `npm i`
   3. Create `.env` file with the following envrionment variables
      ```
        INFURA_PROJECTID=<Infura project id>
        MONGODB_URI=<MongoDB connection string for different database from the API>
        RABBITMQ_HOSTNAME=<RabbitMQ hostname>
        RABBITMQ_PROTOCOL=<RabbitMQ protocol>
        RABBITMQ_PORT=<RabbitMQ port>
        RABBITMQ_USER=<RabbitMQ username>
        RABBITMQ_PASS=<RabbitMQ password>
        MODE=<the mode in which we want to run the watchdog>
      ```
      No default value for `INFURA_PROJECTID` is present. Register for project on [Infura](https://infura.io/) here.
      No default value for `MONGODB_URI` is present. This can and _should_ be pointing for different database.
      Default value for `RABBITMQ_HOSTNAME` is `localhost`.
      Default value for `RABBITMQ_PROTOCOL` is `amqp`.
      Default value for `RABBITMQ_PORT` is `5672`.
      Default value for `RABBITMQ_USER` is `myuser`.
      Default value for `RABBITMQ_PASS` is `mypassword`.
      Default value for `MODE` is `block`. Possible values are `block` for block mode and _any_ other string for `pending transactions` mode.
   4. Open a terminal and write `npm start`
   5. Logs should indicate that the watchdog is running.

## System Design

![System Design Schema](https://github.com/NikolayPIvanov/transaction-watch-dog/blob/main/transaction-watch-dog-schema.drawio.png)
The system consists of three projects - API, Message Relay and Watchdog.
The system is designed to be distributed and each component individually scalable.
_NOTE:_ The Load balancer on the diagram is not part of the implementation. This is a holistic architecture design concept.
_NOTE:_ The message locking is not part of the implementation. Locking is needed to prevent duplicate events being published.
_NOTE:_ The Watchdog cannot be scaled horizontally due to the nature of the blockchain messages. If we want scaling we can implement global filter for each instance of the watchdog e.g filter by gas price on Watchdog instance level.

The flow is as follow: 1. The client sends CRUD requests to the instance(s) of the API. 2. The API stores the data changes locally and stores a message records that tracks what changes were done. The message body includes field names `externalId` which is the `id` of the document in the current system. This can be replaced by uniquely generated correlation id if we are going to share the document changes across many systems. 3. The message relay is running on a given schedule picking up all unread and unsent messages from the message collection. Once picked up they are sent to the corresponding queues in the Message Broker depending on the action in the message's body. 4. The Watchdog is listening for events on all of the queues and is updating the currently active rule set on the instance. This way we can 'hot load' the new rule set on all instances. Meanwhile the watchdog is running a blockchain listener that is query the Ethereum network or listening for pending transactions (depends on the `mode` of the instnace)

### Why such a hassle and so many components?

I view these requirements to be addressing a distirbuted system so I designed the system with that in mind. The [Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html) is something that is quite overlooked in distributed system and thus they tend to lose messages. If the requirements of this system are for a product running millions of dollars we do not want rule sets being lost due to network, connectivity or other issues. Even though this solution does not provide locking for horizontal scaling that is kept in mind with the design.

### Ruling API Code Structure and style

The structure of the API is not defined as controller/service/database layer but on components or features. These are isolated slices of functionality which are not co-dependent - inspired by [CQRS](https://github.com/jasontaylordev/CleanArchitecture) and [Vertical Slices Architecture](https://en.wikipedia.org/wiki/Vertical_slice).

ESLint is implemented using the 'airbnb-base' coding style.

```
config\
 |--database.js    # Logic related to connetcting to the MongoDB and creating a connection pool
 |--server.js      # Configuration file for extracting environment variables
 |--index.js       # Single place export of functionality
src\
 |--features\
    |--ruleset\
        |--index.js                 # Single place export of functionality
        |--message-actions.js       # Possible values for types of messages/actions.
        |--message.js               # Message database model
        |--ruleset-handler.js       # Handlers for CRUD operations on the API
        |--ruleset-validator.js     # Validators using the Joi library
        |--ruleset.js               # Ruleset database model
 |--log\
    |--index.js                     # Single place export of functionality
    |--http-logger.js               # HTTP logging functionality using Morgan
 |--routes\
    |--index.js                     # Single place export of functionality
    |--v1\
        |--ruleset.js               # V1 routes for ruleset CRUD operations
 |--utils\
    |--error-handler.js             # Single point for handling all errors and return unified response to the client.
    |--errors\
        |--index.js                     # Single place export of functionality
        |--api-error.js                 # Api error model
        |--base-error.js                # Base error model
        |--http-codes.js                # HTTP Response codes
        |--index.js                     # Single place export of functionality
 |--app.js          # Server construction
 |--index.js        # Entry point
```

### Message Relay Code Structure and Style

The style is resolved around single entry point for creating the CRON job and starting the message relay.
ESLint is implemented using the 'airbnb-base' coding style.

```
config\
 |--relay.js       # Configuration file for extracting environment variables
 |--index.js       # Single place export of functionality
relay\
 |--index.js           # Single place export of functionality
 |--message.js         # Message database model
 |--message-relay.js   # Logic to extract and sent messages
```

### Watchdog Code Structure and Style

The style is resolved around single entry point for creating listener for storing transactions.
ESLint is implemented using the 'airbnb-base' coding style.

```
config\
 |--relay.js       # Configuration file for extracting environment variables
 |--index.js       # Single place export of functionality
relay\
 |--index.js           # Single place export of functionality
 |--message.js         # Message database model
 |--message-relay.js   # Logic to extract and sent messages
```
