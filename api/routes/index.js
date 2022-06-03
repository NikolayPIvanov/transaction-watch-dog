import { Router } from 'express';

const Routes = Router();

Routes.get('/', (req, res) => {
  res.json({ title: 'great' });
});

export default Routes;
