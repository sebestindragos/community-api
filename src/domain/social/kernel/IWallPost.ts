import { ObjectID } from 'mongodb';

export interface IWallPost {
  _id: ObjectID,
  createdAt: Date,
  ownerId: ObjectID,
  data: {
    text: string
  }
}
