import { ObjectID } from 'mongodb';

export interface IRandomCode {
  _id: ObjectID,
  forId: ObjectID
}
