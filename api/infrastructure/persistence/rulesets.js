import { RuleSetSchema } from './sequelize/index.js';
import { ResourceNotFound } from '../../errors/index.js'

const list = async () => await RuleSetSchema.findAll();
const findById = async (id) => await RuleSetSchema.findByPk(id)
const create = async (body) => await RuleSetSchema.create({ ...body });

const update = async (body, id) => {
  const model = await findById(id);

  if (!model) {
    throw new ResourceNotFound(`RuleSet with id: ${id}`)
  }
  await model.update({ ...body })
};

const remove = async (body, id) => {
  const model = await findById(id);
  if (!model) {
    throw new ResourceNotFound(`RuleSet with id: ${id}`)
  }
  await model.destroy();
};

const RuleSets = {
  list,
  findById,
  create,
  update,
  remove
}

export { RuleSets }