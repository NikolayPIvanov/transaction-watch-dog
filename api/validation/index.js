import RuleSetSchemas from "./rulesets-validators.js";
import { createValidator } from 'express-joi-validation';

const validator = createValidator({
  passError: true,
  joi: {
    abortEarly: false
  }
});

export { validator, RuleSetSchemas };