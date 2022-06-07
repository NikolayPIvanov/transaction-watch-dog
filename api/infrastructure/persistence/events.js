import { EventSchema } from './sequelize/index.js';
import { ResourceNotFound } from '../../errors/index.js'

export const EventTypes = {
  CREATE: 'CREATE'
}

export const create = async (type, event) => await EventSchema.create({ body: { type, data: event } })
export const update = async (id, eventMessage) => {
  const event = await EventSchema.findByPk(id)
  if (!event) {
    throw new ResourceNotFound(`Event with id: ${id}`)
  }

  await model.update({ ...eventMessage })
}

export const fetch = async (amount) => {
  return await EventSchema.findAll({
    where: {
      processed: false
    },
    limit: amount,
    order: [
      'createdAt', 'DESC'
    ]
  })
}