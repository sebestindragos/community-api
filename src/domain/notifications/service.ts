import {Collection, ObjectID} from 'mongodb';
import {context} from 'exceptional.js';
import * as SocketIO from 'socket.io';
import * as jwt from 'jsonwebtoken';

import {IService} from '../../application/IService';
import {
  INotification,
  NotificationType,
  IGenericDataType,
  IFriendRequestDataType,
  IFriendRequestResponseDataType
} from './kernel/INotification';
import { Notification } from './kernel/notification';

export const NOTIFICATIONS_SERVICE_COMPONENT = 'community:notifications';
const EXCEPTIONAL = context('default');

/**
 * Notifications service class.
 *
 * @author Dragos Sebestin
 */
export class NotificationService implements IService {
  public id = NOTIFICATIONS_SERVICE_COMPONENT;

  /**
   * Class constructor.
   */
  constructor (
    private _notificationsRepo: Collection<INotification<any>>,
    private _socketIO: SocketIO.Server,
    private _jwtSecret: string
  ) {
    this._socketIO.on('connection', (socket) => {
      try {
        console.log('an user connected');
        let token = socket.handshake.query.jwt;
        let decoded: any = jwt.verify(token, this._jwtSecret);

        socket.join('notifications-' + decoded._id);
      } catch (error) {
        console.log('user connection rejected');
        socket.disconnect();
      }
    });
  }

  /**
   * IService interface methods.
   */

  /**
   * Create a new generic notification for a user.
   */
  async createGenericNotification (forUserId: ObjectID, message: string) : Promise<INotification<any>> {
    // create new generic notification instance
    let notification = Notification.create<IGenericDataType>({
      forUserId: forUserId,
      type: NotificationType.generic,
      data: {
        message: message
      }
    });

    // save notification to DB
    await this._notificationsRepo.insertOne(notification);

    return notification;
  }

  /**
   * Create notification for a friend request.
   */
  async createFriendRequestNotification (
    forUserId: ObjectID,
    data: IFriendRequestDataType
  ) : Promise<INotification<any>> {
    // create new friend request notification instance
    let notification = Notification.create<IFriendRequestDataType>({
      forUserId: forUserId,
      type: NotificationType.friendRequest,
      data
    });

    // save notification to DB
    await this._notificationsRepo.insertOne(notification);

    return notification;
  }

  /**
   * Create notification for a friend request response.
   */
  async createFriendRequestResponseNotification (
    forUserId: ObjectID,
    data: IFriendRequestResponseDataType
  ) : Promise<INotification<any>> {
    // create new friend request notification instance
    let notification = Notification.create<IFriendRequestResponseDataType>({
      forUserId: forUserId,
      type: NotificationType.friendRequestResponse,
      data
    });

    // save notification to DB
    await this._notificationsRepo.insertOne(notification);

    return notification;
  }

  /**
   * List all user notifications.
   */
  async listUserNotifications (userId: ObjectID) : Promise<Array<INotification<any>>> {
    let userNotifications = await this._notificationsRepo.find({
      userId: userId
    }).sort({_id: -1}).toArray();

    return userNotifications;
  }

  /**
   * Find a notification by id and mark it as seen.
   */
  async markNotificationAsSeen (params: {
    userId: ObjectID,
    notificationId: ObjectID
  }) : Promise<void> {
    // find notification by id
    let found = await this._notificationsRepo.findOne({
      _id: params.notificationId,
      userId: params.userId
    });
    if (!found) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: 'No notification found with this id.'
      });
    }

    let notification = new Notification(found);
    notification.markSeen();

    // save changes to DB
    await this._notificationsRepo.updateOne({
      _id: notification._id
    }, {
      $set: {
        seen: notification.seen
      }
    });
  }

  sendNotification (notification: INotification<any>) {
    this._socketIO.to('notifications-' + notification.userId).emit('notification', JSON.stringify(notification));
  }

  /**
   * Get number of unread notifications for a user.
   */
  getUnseenCount (userId: ObjectID) : Promise<number> {
    return this._notificationsRepo.find({userId, seen: false}).count();
  }
}
