import * as express from 'express';
import {ObjectID} from 'mongodb';
import {Schema} from 'inpt.js';

// import {isAuthorized} from '../middleware/authorization';
import {sanitize, sanitizeQ} from '../middleware/sanitize';
import {ServiceRegistry} from '../../application/serviceRegistry';
import {USER_SERVICE_COMPONENT, UserService} from '../../domain/users/service';

export function get (
  registry: ServiceRegistry
) : express.Router {
  let router = express.Router();

  let users = registry.get(USER_SERVICE_COMPONENT) as UserService;

  router.post('/users/register', sanitize(new Schema({
    email: Schema.Types.String,
    password: Schema.Types.String,
    firstname: Schema.Types.String,
    lastname: Schema.Types.String
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await users.registerAccount({
        email: req.body.email,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname
      });
      res.end();
    } catch (err) {
      next(err);
    }
  });

  router.get('/users/confirm', sanitizeQ(new Schema({
    code: Schema.Types.String
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await users.confirmAccount(
        new ObjectID(req.query.code)
      );
      res.end();
    } catch (err) {
      next(err);
    }
  });

  router.post('/users/login', sanitize(new Schema({
    email: Schema.Types.String,
    password: Schema.Types.String
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let jwt = await users.login({
        email: req.body.email,
        password: req.body.password
      });
      res.json({
        accessToken: jwt
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/users/me', sanitize(new Schema({
    email: Schema.Types.String,
    password: Schema.Types.String
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      req;
      let user = await users.getUserById(new ObjectID());
      res.json({
        user
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
