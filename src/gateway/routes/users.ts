import * as express from 'express';
// import {ObjectID} from 'mongodb';
import {Schema} from 'inpt.js';

// import {isAuthorized} from '../middleware/authorization';
import {sanitize} from '../middleware/sanitize';
import {ServiceRegistry} from '../../application/serviceRegistry';
import {USER_SERVICE_COMPONENT, UserService} from '../../domain/users/service';

export function get (
  registry: ServiceRegistry
) : express.Router {
  let router = express.Router();

  let users = registry.get(USER_SERVICE_COMPONENT) as UserService;

  router.post('/user/register', sanitize(new Schema({
    grantType: Schema.Types.String,
    clientId: Schema.Types.String,
    clientSecret: Schema.Types.Optional(Schema.Types.String),
    state: Schema.Types.String,

    accountKitCode: Schema.Types.String,
    firstname: Schema.Types.String,
    lastname: Schema.Types.Optional(Schema.Types.String)
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      req; users;
      // todo - add code
      res.end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
