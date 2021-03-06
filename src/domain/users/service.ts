import {Collection, ObjectID} from 'mongodb';
import {context} from 'exceptional.js';
import * as jwt from 'jsonwebtoken';

import {IService} from '../../application/IService';
import { IUser } from './kernel/IUser';
import { User } from './kernel/user';
import { RandomCode } from './kernel/randomCode';
import { IRandomCode } from './kernel/IRandomCode';
import { Mailer } from '../mailer';

export const USER_SERVICE_COMPONENT = 'community:users';
const EXCEPTIONAL = context('default');

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
    private _mailer: Mailer,
    private _hostname: string,
    private _clientHostname: string,
    private _jwtSecret: string,
    private _usersRepo: Collection<IUser>,
    private _randomCodesRepo: Collection<IRandomCode>,
  ) {
    this._hostname;
  }

  /**
   * IService interface methods.
   */

  /**
   * Register a new user account.
   */
  async registerAccount (params: {
    email: string,
    password: string,
    firstname: string,
    lastname: string
  }) : Promise<IUser> {
    // check if email is already used
    let found = await this._usersRepo.findOne({
      email: params.email
    });
    if (found) {
      throw EXCEPTIONAL.ConflictException(0, {
        message: 'The email address is already used.'
      });
    }

    // create account
    let newAccount = User.create({
      _id: new ObjectID(),
      active: false,
      email: params.email,
      password: params.password,
      profile: {
        firstname: params.firstname,
        lastname: params.lastname
      }
    });

    // save to db
    await this._usersRepo.insertOne(newAccount);

    // create random code and send it for confirmation
    let code = new RandomCode({
      _id: new ObjectID(),
      forId: newAccount._id
    });
    await this._randomCodesRepo.insertOne(code);

    await this._mailer.send(
      newAccount.email,
      'Account confirmation',
      `${this._clientHostname}confirm?code=${code._id}`
    );

    return newAccount;
  }

  /**
   * confirm a previously created account.
   */
  async confirmAccount (randomCodeId: ObjectID) : Promise<IUser> {
    // find confirmation code
    let foundCode = await this._randomCodesRepo.findOne({
      _id: randomCodeId
    });

    if (!foundCode) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: 'Confirmation code not found.'
      });
    }

    // activate account
    let userData = await this._usersRepo.findOne({
      _id: foundCode.forId
    });

    if (!userData) {
      throw EXCEPTIONAL.GenericException(0, {
        message: 'Something went wrong on our side. Contact support team.'
      });
    }

    let user = new User(userData);
    user.activate();

    // update user in DB
    await this._usersRepo.updateOne({_id: user._id}, {
      $set: {
        active: user.active
      }
    });

    return user;
  }

  async login (params: {
    email: string,
    password: string
  }) : Promise<string> {
    // check if email is already used
    let found = await this._usersRepo.findOne({
      email: params.email
    });
    if (!found) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: 'No user registered with this email address.'
      });
    }
    let user = new User(found);
    let passwordMatches = user.checkPassword(params.password);
    if (!passwordMatches) {
      throw EXCEPTIONAL.DomainException(0, {
        message: 'Wrong password.'
      });
    }

    return jwt.sign({
      _id: user._id
    }, this._jwtSecret, {
      expiresIn: 30 * 24 * 60 * 60
    });
  }

  async getUserById (id: ObjectID) : Promise<IUser> {
    let user = await this._usersRepo.findOne({
      _id: id
    });

    if (!user) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: 'No user with this id in the database'
      });
    }

    delete user.password;

    return user;
  }

  /**
   * Search users.
   */
  async search (term: string) :  Promise<IUser[]> {
    if (!term) return [];

    return this._usersRepo.find({$text: {$search: term}}).toArray();
  }
}
