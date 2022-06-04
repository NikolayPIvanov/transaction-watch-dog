import { Router } from 'express';
import RuleSets from './rulesets.js';
import { ResourceNotFound } from '../errors/index.js';

const Routes = Router();

Routes
  .use('/rules', RuleSets)
  .use(
    '*',
    (req, __, next) => {
      next(new ResourceNotFound(req.baseUrl));
    });

export default Routes;
