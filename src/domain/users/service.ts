import {Collection} from 'mongodb';
import {context} from 'exceptional.js';

import {IService} from '../../application/IService';
import { IUser } from './kernel/IUser';

export const USER_SERVICE_COMPONENT = 'community:users';
const EXCEPTIONAL = context('users');

/**
 * User service class.
 *
 * @author Dragos Sebestin
 */
export class UserService implements IService {
  public id = USER_SERVICE_COMPONENT;

  /**
   * Class constructor.
   */
  constructor (
    private _usersRepo: Collection<IUser>
  ) {
    this._usersRepo; EXCEPTIONAL;
  }

  /**
   * IService interface methods.
   */
}
