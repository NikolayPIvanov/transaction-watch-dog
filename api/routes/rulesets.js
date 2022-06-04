import { Router } from 'express';
import { route } from '../server/middleware.js';
import { RuleSetSchemas, validator } from '../validation/index.js';
import { RuleSets as RuleSetDAL } from '../infrastructure/persistence/index.js';
import * as UseCases from '../use-cases/index.js';

const RuleSets = Router();

RuleSets
  .get(
    '/',
    route(async (req, res) => {
      const rules = await UseCases.RuleSets.list(RuleSetDAL);
      res.json({ rules })
    }))
  .get(
    '/:id',
    validator.params(RuleSetSchemas.get.params),
    route(async (req, res) => {
      const { id } = req.params;
      const rulesets = await UseCases.RuleSets.findById(RuleSetDAL, id);
      res.json({ rulesets })
    }))
  .post(
    '/',
    validator.body(RuleSetSchemas.create.body),
    route(async (req, res) => {
      const body = req.body;
      const result = await UseCases.RuleSets.create(RuleSetDAL, body);
      res.json({ result })
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
