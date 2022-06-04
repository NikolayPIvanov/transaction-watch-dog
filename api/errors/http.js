
import { BaseError } from "./base.js";

export class ResourceNotFound extends BaseError {
  constructor(resource) {
    super(404, true, `Could not find resource ${resource}.`)
  }
}