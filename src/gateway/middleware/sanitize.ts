import * as express from 'express';
import {ObjectID} from 'mongodb';
import {context} from 'exceptional.js';
import {Inpt, Schema, TypeTransformerBase} from 'inpt.js';

const EXCEPTIONAL = context('default');

/**
 * Express middleware used for applying a
 * Inpt.js Schema on the request body object.
 */
export function sanitize (schema: Schema) {
  return function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    res;
    try {
      let inpt = new Inpt(schema);
      req.body = inpt.transform(req.body);
      next(null);
    } catch (err) {
      next(EXCEPTIONAL.GenericException(0, {}));
    }
  };
}

/**
 * Same as transform method but used for query params
 */
export function sanitizeQ (schema: Schema) {
  return function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    res;
    try {
      let inpt = new Inpt(schema);
      req.query = inpt.transform(req.query);
      next(null);
    } catch (err) {
      next(EXCEPTIONAL.GenericException(0, {}));
    }
  };
}

export class ObjectIdTransformer extends TypeTransformerBase {
  transform () : ObjectID {
    try {
      let objectId = new ObjectID(this._originalValue);
      return objectId;
    } catch (err) {
      return new ObjectID();
    }
  }
}
