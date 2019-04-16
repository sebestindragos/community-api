import * as express from 'express';
import {ObjectID} from 'mongodb';
import {Schema} from 'inpt.js';

import {isAuthorized} from '../middleware/authorization';
import {sanitize} from '../middleware/sanitize';
import {ServiceRegistry} from '../../application/serviceRegistry';
import {SOCIAL_SERVICE_COMPONENT, SocialService} from '../../domain/social/service';

export function get (
  registry: ServiceRegistry,
  jwtSecret: string
) : express.Router {
  let router = express.Router();

  let social = registry.get(SOCIAL_SERVICE_COMPONENT) as SocialService;

  router.post('/social/friend-request', isAuthorized(jwtSecret), sanitize(new Schema({
    friendId: Schema.Types.String
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let userId = (req as any).user._id;
      await social.createFriendRequest({
        fromUserId: userId,
        toUserId: new ObjectID(req.body.friendId)
      });
      res.end();
    } catch (err) {
      next(err);
    }
  });

  router.put('/social/friend-request/:id/status', isAuthorized(jwtSecret), sanitize(new Schema({
    status: Schema.Types.Number
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      // let userId = (req as any).user._id;
      await social.respondToFriendRequest(
        new ObjectID(req.params.id), req.body.status
      );
      res.end();
    } catch (err) {
      next(err);
    }
  });

  router.get('/social/friends', isAuthorized(jwtSecret), sanitize(new Schema({
    status: Schema.Types.Number
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let userId = (req as any).user._id;
      let friendsList = await social.getUserFriendList(userId);
      res.json({friendsList});
    } catch (err) {
      next(err);
    }
  });

  return router;
}
