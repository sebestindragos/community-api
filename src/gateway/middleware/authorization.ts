import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import {context} from 'exceptional.js';

import { ObjectID } from 'bson';

const EXCEPTIONAL = context('default');

/**
 * Middleware used to check if a user is authorized to access a route (via JWT).
 */
export function isAuthorized (secret: string) {
  return function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    res;
    let authorizationHeader = req.headers['Authorization'] || req.headers['authorization'];
    if (typeof authorizationHeader === 'string') {
      let token = authorizationHeader as string;
      if (!token) {
        return next(EXCEPTIONAL.UnauthorizedException(0, {}));
      }

      token = token.substr('Bearer '.length);
      let decoded = jwt.decode(token) as any;
      if (!decoded) {
        return next(EXCEPTIONAL.UnauthorizedException(0, {}));
      }

      jwt.verify(token, secret, (err, decodedToken) => {
        if (err) {
          return next(EXCEPTIONAL.UnauthorizedException(0, {}));
        } else {
          Object.defineProperty(req, 'user', {
            value: {
              _id: new ObjectID((decodedToken as any)._id)
            }
          });
          next();
        }
      });
    } else {
      return next(EXCEPTIONAL.UnauthorizedException(0, {}));
    }
  };
}
