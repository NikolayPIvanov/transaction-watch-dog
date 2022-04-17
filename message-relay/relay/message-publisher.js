const createBroker = require('./broker')
const mongoose = require('mongoose')
const scheduler = require('./scheduler')
const Message = require('./message')
const logger = require('../../shared/logging')
const { mongoUri, rabbitMqPassword, rabbitMqUser, cronExpression } = require('../config');

const pendingMessages = async () => {
  const filter = { read: false, sent: false }
  const sort = { ts: 1 }
  return await Message.find(filter).lean().sort(sort);
}

const lockMessages = (messages) => {
  // If the relay is replicated we need lock on the messages so we do no sent duplicate data
  return messages
}

const sendMessages = (broker, messages) => {
  messages.forEach(async (message) => {
    const data = JSON.parse(message.data)
    const publisher = `messages.${data.command.toLowerCase()}`
    const publication = await broker.publish(publisher, message.data);
    publication.on('error', console.error);
    message.sent = true
  })
  return messages
}

const saveMessages = async (messages) => {
  await Message.updateMany(
    { _id: { $in: messages.map(i => i._id.toString()) } },
    { $set: { read: true, sent: true } }
  )
}

const relayMessages = async () => {
  const broker = await createBroker(rabbitMqUser, rabbitMqPassword)
  await mongoose.connect(mongoUri);
  const handler = async (broker) => {
    logger.info('Getting pending messages')
    const messages = await pendingMessages()
    const lockedMessages = lockMessages(messages)
    await sendMessages(broker, lockedMessages)
    await saveMessages(lockedMessages)
    logger.info(`Sent ${lockedMessages.length} messages.`)
  }

  logger.info(`Starting message relay. Cron expression: ${cronExpression}.`)
  await scheduler(broker, cronExpression, handler)
}

module.exports = {
  relayMessages
}