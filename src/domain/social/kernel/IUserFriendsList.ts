import { ObjectID } from 'mongodb';

export interface IUserFriendsList {
  _id: ObjectID,
  userId: ObjectID,
  friendIds: ObjectID[]
}
