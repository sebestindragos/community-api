import { ObjectID } from 'mongodb';
import * as bcrypt from 'bcrypt';

// types
import { IUser } from './IUser';

/**
 * Class used for working with user objects.
 *
 * @author Dragos Sebestin
 */
export class User implements IUser {
  public _id: ObjectID;
  public active: boolean;
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
    this.active = data.active;
    this.email = String(data.email).trim();
    this.password = data.password;
    this.profile = {
      firstname: String(data.profile.firstname).trim(),
      lastname: String(data.profile.lastname).trim(),
    };
  }

  /**
   * Create a new user object and hash the password.
   */
  static create(params: IUser) : User {
    let newUser = new User({
      _id: params._id,
      active: params.active,
      email: params.email,
      password: '',
      profile: {
        firstname: params.profile.firstname,
        lastname: params.profile.lastname
      }
    });

    let hashedPwd = bcrypt.hashSync(params.password, 12);
    newUser.password = hashedPwd;

    return newUser;
  }

  /**
   * Activate this user account.
   */
  activate () {
    this.active = true;
  }
}
