const Joi = require('joi');
const mongoose = require('mongoose');

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
}).unknown(false); // Left out to simulate inner collection error validation

const createRuleSetSchema = {
  body: Joi.object({
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    isActive: Joi.bool().required(),
    rules: Joi.array().items(ruleSchema),
  }),
};

const getRuleSetSchema = {
  params: Joi.object({
    id: Joi.string().required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }),
  }),
};

const updateRuleSetSchema = {
  params: Joi.object({
    id: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }),
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

const deleteRuleSetSchema = {
  params: Joi.object({
    id: Joi
      .string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }),
  }),
};

module.exports = {
  createRuleSetSchema,
  getRuleSetSchema,
  updateRuleSetSchema,
  deleteRuleSetSchema,
};
