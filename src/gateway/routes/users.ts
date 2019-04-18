import * as express from 'express';
import {ObjectID} from 'mongodb';
import {Schema} from 'inpt.js';

import {isAuthorized} from '../middleware/authorization';
import {sanitize, sanitizeQ} from '../middleware/sanitize';
import {ServiceRegistry} from '../../application/serviceRegistry';
import {USER_SERVICE_COMPONENT, UserService} from '../../domain/users/service';
import {NOTIFICATIONS_SERVICE_COMPONENT, NotificationService} from '../../domain/notifications/service';
import {SOCIAL_SERVICE_COMPONENT, SocialService} from '../../domain/social/service';

export function get (
  registry: ServiceRegistry,
  jwtSecret: string
) : express.Router {
  let router = express.Router();

  let users = registry.get(USER_SERVICE_COMPONENT) as UserService;
  let notifications = registry.get(NOTIFICATIONS_SERVICE_COMPONENT) as NotificationService;
  let social = registry.get(SOCIAL_SERVICE_COMPONENT) as SocialService;

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
      let user = await users.registerAccount({
        email: req.body.email,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname
      });
      await social.registerUserFriendList(user._id);
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
      let confirmedAccount = await users.confirmAccount(
        new ObjectID(req.query.code)
      );

      await notifications.createGenericNotification(
        confirmedAccount._id,
        'Your account has been confirmed. Welcome to Community!'
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

  router.get('/users/me', isAuthorized(jwtSecret), sanitize(new Schema({
    email: Schema.Types.String,
    password: Schema.Types.String
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let userId = (req as any).user._id;
      let user = await users.getUserById(userId);
      res.json({
        user
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
