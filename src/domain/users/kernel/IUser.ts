import { ObjectId } from 'mongodb';

export interface IUser {
  _id: ObjectId,
  active: boolean,
  email: string,
  password: string,
  profile: {
    firstname: string,
    lastname: string
  }
}
