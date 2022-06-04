import { Router } from 'express';
import RuleSets from './rulesets.js';

const Routes = Router();

Routes.get('/', (req, res) => {
  res.json({ title: 'great' });
});

Routes.use(RuleSets)

export default Routes;
