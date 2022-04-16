const Joi = require('joi')

const ruleSchema = Joi.object({
    name: Joi.string()
        .alphanum()
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

const createRuleSetSchema = Joi.object().keys({
    body: Joi.object({
        name: Joi.string()
            .alphanum()
            .min(3)
            .max(50)
            .required(),
        isActive: Joi.bool().required(),
        rules: Joi.array().items(ruleSchema)
    })
}).unknown(true)

const getRuleSetSchema = Joi.object().keys({
    params: Joi.object({
        id: Joi.string().required()
    }).unknown(true)
}).unknown(true)

const updateRuleSetSchema = Joi.object().keys({
    params: Joi.object({
        id: Joi.string().required()
    }),
    body: Joi.object({
        id: Joi.string().required(),
        name: Joi.string()
            .alphanum()
            .min(3)
            .max(50)
            .required(),
        isActive: Joi.bool().required(),
        rules: Joi.array().items(ruleSchema)
    })
})

const deleteRuleSetSchema = Joi.object().keys({
    params: Joi.object({
        id: Joi.string().required()
    }).unknown(true)
}).unknown(true)

module.exports = {
    createRuleSetSchema,
    getRuleSetSchema,
    updateRuleSetSchema,
    deleteRuleSetSchema
};