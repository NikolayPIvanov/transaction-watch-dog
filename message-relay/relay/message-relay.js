const mongoose = require('mongoose');
const Message = require('./message');
const logger = require('../../shared/logging');
const {
  mongoUri, cronExpression,
} = require('../config');

const pendingMessages = async () => {
  const filter = { read: false, sent: false };
  const sort = { ts: 1 };
  return Message.find(filter).lean().sort(sort);
};

// If the relay is replicated we need lock on the messages so we do no sent duplicate data
const lockMessages = (messages) => messages;

const sendMessages = async (broker, messages) => {
  const sentMessages = messages.map(async (message) => {
    const data = JSON.parse(message.data);
    const publisher = `messages.${data.command.toLowerCase()}`;
    const publication = await broker.publish(publisher, message.data);
    publication.on('error', logger.error);
    return {
      ...message,
      sent: true,
    };
  });

  return sentMessages;
};

const saveMessages = async (messages) => {
  await Message.updateMany(
    // eslint-disable-next-line no-underscore-dangle
    { _id: { $in: messages.map((i) => i._id.toString()) } },
    { $set: { read: true, sent: true } },
  );
};

const catchAsync = async (fn) => {
  try {
    await fn();
  } catch (err) {
    logger.error(err);
  }
};

const mongoConnect = async () => {
  catchAsync(async () => {
    await mongoose.connect(mongoUri, { keepAlive: true, keepAliveInitialDelay: 300000 });
    mongoose.connection.on('error', (err) => {
      logger.error(err);
    });
  });
};

const createRelayHandler = async (broker) => {
  await mongoConnect();

  const handler = async () => {
    catchAsync(async () => {
      logger.info('Getting pending messages.');
      const messages = await pendingMessages();
      if (messages.length === 0) {
        logger.info('No messages to process.');
        return;
      }
      const lockedMessages = lockMessages(messages);
      await sendMessages(broker, lockedMessages);
      await saveMessages(lockedMessages);
      logger.info(`Sent ${lockedMessages.length} messages.`);
    });
  };

  logger.info(`Starting message relay. Cron expression: ${cronExpression}.`);

  return handler;
};

module.exports = {
  createRelayHandler,
};
