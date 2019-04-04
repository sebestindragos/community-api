import {Db} from 'mongodb';

import {UserService} from './service';
import { Mailer } from '../mailer';

export function get (
  usersDb: Db, mailer: Mailer, hostname: string, jwtSecret: string
) : UserService {

  // fetch collections
  let usersCollection = usersDb.collection('users');
  let randomCodesCollection = usersDb.collection('random-codes');

  // create indexes
  usersCollection.createIndex({
    email: 1
  }, {unique: true});

  let service = new UserService(
    mailer, hostname, jwtSecret, usersCollection, randomCodesCollection
  );

  return service;
}
