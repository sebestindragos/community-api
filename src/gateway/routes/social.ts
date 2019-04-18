import * as express from 'express';
import {ObjectID} from 'mongodb';
import {Schema} from 'inpt.js';

import {isAuthorized} from '../middleware/authorization';
import {sanitize} from '../middleware/sanitize';
import {ServiceRegistry} from '../../application/serviceRegistry';
import {SOCIAL_SERVICE_COMPONENT, SocialService} from '../../domain/social/service';
import {NOTIFICATIONS_SERVICE_COMPONENT, NotificationService} from '../../domain/notifications/service';

export function get (
  registry: ServiceRegistry,
  jwtSecret: string
) : express.Router {
  let router = express.Router();

  let social = registry.get(SOCIAL_SERVICE_COMPONENT) as SocialService;
  let notifications = registry.get(NOTIFICATIONS_SERVICE_COMPONENT) as NotificationService;

  router.post('/social/friend-request', isAuthorized(jwtSecret), sanitize(new Schema({
    friendId: Schema.Types.String
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let userId = (req as any).user._id;
      let request = await social.createFriendRequest({
        fromUserId: userId,
        toUserId: new ObjectID(req.body.friendId)
      });

      let notification = await notifications.createFriendRequestNotification(
        request.toId, {fromUserId: request.fromId}
      );
      await notifications.sendNotification(notification);

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
      let friendRequestId = new ObjectID(req.params.id);
      let accepted = await social.respondToFriendRequest(
        friendRequestId, req.body.status
      );

      // send response notification to requesting user
      if (accepted) {
        let friendRequest = await social.getFriendRequest(friendRequestId);
        let notification = await notifications.createFriendRequestResponseNotification(
          friendRequest.fromId, {responseId: friendRequest.toId}
        );
        await notifications.sendNotification(notification);
      }

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

  router.post('/social/wall-post', isAuthorized(jwtSecret), sanitize(new Schema({
    text: Schema.Types.String
  })), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let userId = (req as any).user._id;
      let wallPost = await social.createWallPost(
        userId, {
          text: req.body.text
        }
      );
      res.json({wallPost});
    } catch (err) {
      next(err);
    }
  });

  router.get('/social/wall-post', isAuthorized(jwtSecret), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let userId = (req as any).user._id;
      let wallPosts = await social.getWallFeed(userId);
      res.json({wallPosts});
    } catch (err) {
      next(err);
    }
  });

  return router;
}
