import Joi from 'joi'

const ruleSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required(),

  from: Joi.string(),
  to: Joi.string(),
  lowerValueThreshold: Joi.number(),
  upperValueThreshold: Joi.number(),
  lowerGasThreshold: Joi.number(),
  upperGasThreshold: Joi.number(),
  input: Joi.string(),
  status: Joi.bool(),
}).unknown(false);

const get = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

const create = {
  body: Joi.object({
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    isActive: Joi.bool().required(),
    rules: Joi.array().items(ruleSchema),
  }),
};

const update = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    isActive: Joi.bool().required(),
    rules: Joi.array().items(ruleSchema),
  }),
};

const deleteSchema = {
  params: Joi.object({
    id: Joi.string().required()
  }),
};

const RuleSetSchemas = {
  get,
  create,
  update,
  deleteSchema
}

export default RuleSetSchemas;