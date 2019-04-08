import { INotification, NotificationType } from './INotification';
import { ObjectID } from 'mongodb';

/**
 * Notification concrete class.
 */
export class Notification<DataType> implements INotification<DataType> {
  public _id: ObjectID;
  public userId: ObjectID;
  public type: NotificationType;
  public createdAt: Date;
  public seen: boolean;
  public data: DataType;

  /**
   * Class constructor.
   */
  constructor (from: INotification<DataType>) {
    this._id = from._id;
    this.userId = from.userId;
    this.type = from.type;
    this.createdAt = from.createdAt;
    this.seen = from.seen;
    this.data = from.data;
  }

  /**
   * Create a new notification instance.
   */
  static create <NewDataType> (params: {
    forUserId: ObjectID
    type: NotificationType,
    data: NewDataType
  }) : Notification<NewDataType> {
    let notification = new Notification({
      _id: new ObjectID(),
      userId: params.forUserId,
      type: params.type,
      createdAt: new Date(),
      seen: false,
      data: params.data
    });

    return notification;
  }

  /**
   * Mark this notification as seen.
   */
  markSeen () {
    this.seen = true;
  }
}
