import {Collection, ObjectID} from 'mongodb';
import {context} from 'exceptional.js';

import {IService} from '../../application/IService';
import { INotification, NotificationType, IGenericDataType } from './kernel/INotification';
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
    private _notificationsRepo: Collection<INotification<any>>
  ) { }

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
   * List all user notifications.
   */
  async listUserNotifications (userId: ObjectID) : Promise<Array<INotification<any>>> {
    let userNotifications = await this._notificationsRepo.find({
      userId: userId
    }).toArray();

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
}
