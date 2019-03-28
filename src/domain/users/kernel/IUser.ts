import { ObjectId } from 'mongodb';

export interface IUser {
  _id: ObjectId,
  email: string,
  password: string,
  profile: {
    firstname: string,
    lastname: string
  }
}
