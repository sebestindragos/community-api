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
  fromUser: {
    _id: ObjectID,
    firstname: string,
    lastname: string
  }
}

export interface IFriendRequestResponseDataType {
  responder: {
    _id: ObjectID,
    firstname: string,
    lastname: string
  }
}
