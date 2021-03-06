import {Db} from 'mongodb';

import {UserService} from './service';
import { Mailer } from '../mailer';

export function get (
  usersDb: Db, mailer: Mailer, hostname: string, clientHostname: string, jwtSecret: string
) : UserService {

  // fetch collections
  let usersCollection = usersDb.collection('users');
  let randomCodesCollection = usersDb.collection('random-codes');

  // create indexes
  usersCollection.createIndex({
    email: 1
  }, {unique: true});
  usersCollection.createIndex({
    'profile.firstname': 'text',
    'profile.lastname': 'text'
  }, {unique: true});

  let service = new UserService(
    mailer, hostname, clientHostname, jwtSecret, usersCollection, randomCodesCollection
  );

  return service;
}
