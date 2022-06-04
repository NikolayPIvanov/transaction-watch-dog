import { Router } from 'express';
import { route } from '../server/middleware.js';
import { RuleSetSchemas, validator } from '../validation/index.js';

const RuleSets = Router();

RuleSets
  .get(
    '/',
    validator.params(RuleSetSchemas.get.params),
    route(async (req, res) => {

    }))
  .post(
    '/',
    validator.body(RuleSetSchemas.create.body),
    route(async (req, res) => {

    })
  )
  .put(
    '/:id',
    validator.body(RuleSetSchemas.update.body),
    validator.params(RuleSetSchemas.update.params),
    route(async (req, res) => {

    }))
  .delete(
    '/:id',
    validator.params(RuleSetSchemas.deleteSchema.params),
    route(async (req, res) => {

    }))

export default RuleSets;
