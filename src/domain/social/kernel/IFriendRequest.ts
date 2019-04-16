import { ObjectID } from 'mongodb';

export enum FriendRequestStatus {
  pending, accepted, rejected
}

export interface IFriendRequest {
  _id: ObjectID,
  fromId: ObjectID,
  toId: ObjectID,
  status: FriendRequestStatus
}
