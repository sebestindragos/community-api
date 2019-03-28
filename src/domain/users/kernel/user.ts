import { ObjectID } from 'mongodb';

// types
import { IUser } from './IUser';

/**
 * Class used for working with user objects.
 *
 * @author Dragos Sebestin
 */
export class User implements IUser {
  public _id: ObjectID;
  public email: string;
  public password: string;
  public profile: {
    firstname: string,
    lastname: string,
  };

  /**
   * Class constructor.
   */
  constructor (data: IUser) {
    this._id = data._id;
    this.email = String(data.email).trim();
    this.password = data.password;
    this.profile = {
      firstname: String(data.profile.firstname).trim(),
      lastname: String(data.profile.lastname).trim(),
    };
  }
}
