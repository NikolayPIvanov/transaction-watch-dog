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
   1. I strongly recommend using [Atlas MongoDB](https://www.mongodb.com/atlas/database) for fast setup.
4. API
   1. Navigate to `ruling-api` folder
   2. Open a terminal and write `npm i`
   3. Create `.env` file with the following environment variables
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
   3. Create `.env` file with the following environment variables
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
   3. Create `.env` file with the following environment variables
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

The flow is as follow:

1. The client sends CRUD requests to the instance(s) of the API.
2. The API stores the data changes in local Mongo database and stores a message records that tracks what changes were done. The message body includes field names `externalId` which is the `id` of the document in the current system. This can be replaced by uniquely generated correlation id if we are going to share the document changes across many systems.
3. The message relay is running on a given schedule picking up all unread and unsent messages from the message collection. Once picked up they are sent to the corresponding queues in the Message Broker depending on the action in the message's body.
4. The Watchdog is listening for events on all of the queues and is updating the currently active rule set on the instance both in-memory and in the database. This way we can 'hot load' the new rule set on all instances and not query the database. Meanwhile the watchdog is running a blockchain listener that is query the Ethereum network or listening for pending transactions (depends on the `mode` of the instance).

### Why such a hassle and so many components?

I view these requirements to be addressing a distributed system so I designed the system with that in mind. The [Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html) is something that is quite overlooked in distributed system and thus they tend to lose messages. If the requirements of this system are for a product running millions of dollars we do not want rule sets being lost due to network, connectivity or other issues. Even though this solution does not provide locking for horizontal scaling that is kept in mind with the design.

### Ruling API Code Structure and style

The structure of the API is not defined as controller/service/database layer but on components or features. These are isolated slices of functionality which are not co-dependent - inspired by [CQRS](https://github.com/jasontaylordev/CleanArchitecture) and [Vertical Slices Architecture](https://en.wikipedia.org/wiki/Vertical_slice).

ESLint is implemented using the 'airbnb-base' coding style.

```
config\
 |--database.js    # Logic related to connecting to the MongoDB and creating a connection pool
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
 |--watchdog.js       # Configuration file for extracting environment variables
 |--index.js          # Single place export of functionality
listeners\
 |--BlockchainListener.js           # Base listener class for encapsulating logic
 |--BlockTransactionsListener.js    # Listening to mined blocks and their transactions (pooling)
 |--message-listener.js             # Listening to message broker events
 |--PendingTransactionsListener.js  # Listening to pending transactions on the blockchain (listening for events)
 |--index.js                        # Single place export of functionality
models\
 |--block.js                        # Model for keeping last block number
 |--index.js                        # Single place export of functionality
 |--ruleset.js                      # Model for rule set
 |--transaction.js                  # Model for transaction
rules-engine\
 |--engine.js                       # Functionality for filtering transaction
 |--index.js                        # Single place export of functionality
index.js                            # Start of the watchdog
```

### Shared Project Code Structure and Style

ESLint is implemented using the 'airbnb-base' coding style.

```
config\                 # Holds shared rabbit mq publisher/subscription configuration
broker\                 # Holds logic to create RabbitMQ message brokers
logging\                # Holds shared logic for logging
models\                 # Holds database models schemas that are reused from different bounded contexts
```

## API functionality

The API holds configurations called rulesets. Rulesets are the core of the API. There can be only one active ruleset at a time. The API has validation for that. If we want to change the currently active ruleset we can update the currently active to no inactive and then set the new as active.

Rules number is not restricted. When we get at transaction will look if the transaction is matching any of the rules of the currently active ruleset.

Rulesets have the following structure

```
    name: String/required,
    isActive: Boolean/required,
    rules: [
        {
          name: String/required,

          // From / To Address
          from: String/optional,
          to: String/optional,

          // Value in ether
          lowerValueThreshold: Number/optional,
          upperValueThreshold: Number/optional,

          // Gas Price in ether
          lowerGasThreshold: Number/optional,
          upperGasThreshold: Number/optional,

          // Input
          input: String/optional,

          // Status
          status: Boolean/optional
        }
      ]
```

#### Create Ruleset

`Endpoint`: <host>/api/v1/rules
`Method`: `POST`
`Body`:

```
{
    "name": "Standard Ruleset for Value",
    "isActive": true,
    "rules": [
        {
            "name": "Value Lower and Upper Threshold Rule",
            "lowerValueThreshold": 25,
            "upperValueThreshold": 70
        }
    ]
}
```

`Response`

```
Status: 201 CREATED
{
    "id": "625d283296d4c821807cf2be"
}
```

#### Update Ruleset

`Endpoint`: <host>/api/v1/rules/:id
`Method`: `PUT`
`Body`:

```
{
    "name": "Standard Ruleset for Value Updated",
    "isActive": true,
    "rules": [
        {
            "name": "Value Lower and Upper Threshold Rule",
            "lowerValueThreshold": 25,
            "upperValueThreshold": 50
        }
    ]
}
```

`Response` :

```
204 NO CONTENT
```

#### Delete Ruleset

`Endpoint`: <host>/api/v1/rules/:id
`Method`: `DELETE`
`Body`: none
`Response` :

```
204 NO CONTENT
```

#### GET Ruleset

`Endpoint`: <host>/api/v1/rules/:id
`Method`: `GET`
`Body`: none
`Response` :

```
200 OK
{
    "_id": "625d280ed0b5f1005c107a81",
    "name": "Standard Ruleset for Value",
    "isActive": false,
    "rules": [
        {
            "name": "Value Lower Threshold",
            "lowerValueThreshold": 25,
            "upperValueThreshold": 70,
            "_id": "625d280ed0b5f1005c107a82"
        }
    ],
    "__v": 0
},
```

#### Get Rulesets

`Endpoint`: <host>/api/v1/rules
`Method`: `GET`
`Body`: none
`Response` :

```
200 OK
[
    {
        "_id": "625d280ed0b5f1005c107a81",
        "name": "Standard Ruleset for Value",
        "isActive": false,
        "rules": [
            {
                "name": "Value Lower Threshold",
                "lowerValueThreshold": 25,
                "upperValueThreshold": 70,
                "_id": "625d280ed0b5f1005c107a82"
            }
        ],
        "__v": 0
    },
    ...
]
```

#### Error Response

This is returned on internal error due to infrastructure e.g database, broker and this format is also returned on validation error due to the central error handling piece
`Endpoint`: <host>/api/v1/rules
`Method`: `POST`
`Body`:

```
{
    "name": "",
    "isActive": true,
    "rules": [
        {
            "name": "Value Lower and Upper Threshold Rule",
            "lowerValueThreshold": 25,
            "upperValueThreshold": 70
        }
    ]
}
```

`Response`

```
Status: 400 BAD REQUEST
{
    "message": "Validation error",
    "code": 400,
    "description": "A validation error has occurred",
    "details": {
        "validations": [
            "'name' is not allowed to be empty"
        ]
    }
}
```

## Watchdog

The watchdog's main purpose is to watch the transactions on the Ethereum network and store the ones that are fitting our ruleset's rules. There are two modes of working with the Watchdog - `block` and `pendingTransactions`.

The `block` mode is querying the Ethereum blockchain blocks and their transactions. Running the through the ruling engine that we have by passing the transaction and the currently active rules (active ruleset). The query is running every 10 seconds and only one active execution can be happening at a time. If the execution has taken more than 1 second e.g 5 seconds the next execution takes place 5 seconds later (10 seconds delay - 5 seconds previous execution) = 5 seconds until next run and vice versa - if the query took more than 10 seconds, we schedule another query immediately.

The `pendingTransactions` mode is listening for `pendingTransaction` events via Web Sockets. Upon event we query the transaction data via HTTP and then pass it to the ruling engine.

Both modes share common class `BlockchainListener` which encapsulates ruleset change functionality.

Alongside with this, the watchdog has functionality to listen to changes in the rulesets that are coming the form of events from the message broker. Each event performs CUD operation on the local copies of the rulesets in the watchdog's own database. This is known as _eventual consistency_. Once the change is stored to the database and once it is successfully stored we update it on the watchdog instance in memory.

Ruling engine holds the way we treat rules. Currently it is a function and it is injected via parameter to the listeners. This allows us to use the listeners with any kind of ruling engine we might create, decoupling the decision from the data gathering.

#### Scaling the Watchdog

Scaling the Watchdog is tricky due to the nature of the way we listen for transactions and they way they are propagated to us. The only effective way to scale it that I can think of is to have a unique filter on each instance of the watchdog e.g filter by gas price, filter by amount, by hash/number and so on.

## Libraries used

### Database

- Mongoose - connection to MongoDB cluster

### Message Broker

- Rascal - configuration and functionality to RabbitMQ

### Logging

- Winston - General Logging
- Morgan - HTTP Logging

### Scheduling

- Cron

### Ethereum Blockchain

- Web3

### Linting

- ESLint

### Configuration

- dotenv

### Server

- Express
- Cors
- Helmet
- Joi
- Compression
