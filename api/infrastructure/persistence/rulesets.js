import { RuleSetSchema } from './sequelize/index.js';
import { create as createEvent, EventTypes } from './events.js';
import { ResourceNotFound } from '../../errors/index.js'

const list = async () => await RuleSetSchema.findAll();
const findById = async (id) => await RuleSetSchema.findByPk(id)
const create = async (body) => {
  const model = await RuleSetSchema.create({ ...body });
  await createEvent(EventTypes.CREATE, model)
  return model
}

const update = async (body, id) => {
  const model = await findById(id);
  if (!model) {
    throw new ResourceNotFound(`RuleSet with id: ${id}`)
  }

  await model.update() // TODO
  await createEvent(body) // TODO
};

const remove = async (body, id) => {
  const model = await findById(id);
  if (!model) {
    throw new ResourceNotFound(`RuleSet with id: ${id}`)
  }
  await model.destroy();
  await createEvent(body)
};

const RuleSets = {
  list,
  findById,
  create,
  update,
  remove
}

export { RuleSets }