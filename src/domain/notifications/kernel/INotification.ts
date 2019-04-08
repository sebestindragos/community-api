import { ObjectID } from 'mongodb';

export enum NotificationType {
  generic
}

export interface INotification<DataType> {
  _id: ObjectID,
  userId: ObjectID,
  type: NotificationType,
  createdAt: Date,
  seen: boolean,
  data: DataType
}

export interface IGenericDataType {
  message: string
}
