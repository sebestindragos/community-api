import { ObjectID } from 'mongodb';

export enum NotificationType {
  generic, friendRequest, friendRequestResponse
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

export interface IFriendRequestDataType {
  fromUserId: ObjectID
}

export interface IFriendRequestResponseDataType {
  responseId: ObjectID
}
