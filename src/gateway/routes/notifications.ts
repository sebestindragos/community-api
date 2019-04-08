import * as express from 'express';
import {ObjectID} from 'mongodb';
// import {Schema} from 'inpt.js';

import {isAuthorized} from '../middleware/authorization';
// import {sanitize, sanitizeQ} from '../middleware/sanitize';
import {ServiceRegistry} from '../../application/serviceRegistry';
import {NOTIFICATIONS_SERVICE_COMPONENT, NotificationService} from '../../domain/notifications/service';

export function get (
  registry: ServiceRegistry,
  jwtSecret: string
) : express.Router {
  let router = express.Router();

  let notifications = registry.get(NOTIFICATIONS_SERVICE_COMPONENT) as NotificationService;

  router.get('/notifications', isAuthorized(jwtSecret), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let userId = (req as any).user._id;
      let userNotifications = await notifications.listUserNotifications(userId);
      res.json({
        notifications: userNotifications
      });
    } catch (err) {
      next(err);
    }
  });

  router.put('/notifications/:id/seen', isAuthorized(jwtSecret), async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let userId = (req as any).user._id;
      await notifications.markNotificationAsSeen({
        notificationId: new ObjectID(req.params.id),
        userId: userId
      });
      res.end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
