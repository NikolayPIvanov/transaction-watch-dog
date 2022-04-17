const Joi = require('joi')
const mongoose = require('mongoose')

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
    status: Joi.bool()
})

const createRuleSetSchema = {
    body: Joi.object({
        name: Joi.string()
            .min(3)
            .max(50)
            .required(),
        isActive: Joi.bool().required(),
        rules: Joi.array().items(ruleSchema)
    }).unknown(true)
}

const getRuleSetSchema = {
    params: Joi.object({
        id: Joi.string().required()
            .custom((value, helpers) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.error(`any.invalid`)
                }
                return value
            })
    }).unknown(true)
}

const updateRuleSetSchema = {
    params: Joi.object({
        id: Joi.string()
            .required()
            .custom((value, helpers) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.error(`any.invalid`)
                }
                return value
            })
    }).unknown(true),
    body: Joi.object({
        name: Joi.string()
            .min(3)
            .max(50)
            .required(),
        isActive: Joi.bool().required(),
        rules: Joi.array().items(ruleSchema)
    }).unknown(true)
}

const deleteRuleSetSchema = {
    params: Joi.object({
        id: Joi
            .string()
            .required()
            .custom((value, helpers) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.error(`any.invalid`)
                }
                return value
            })
    }).unknown(true)
}

module.exports = {
    createRuleSetSchema,
    getRuleSetSchema,
    updateRuleSetSchema,
    deleteRuleSetSchema
};