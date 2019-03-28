import {Db} from 'mongodb';

import {UserService} from './service';

export function get (
  usersDb: Db,
) : UserService {

  // fetch collections
  let usersCollection = usersDb.collection('users');

  // create indexes
  usersCollection.createIndex({
    email: 1
  }, {unique: true});

  let service = new UserService(
    usersCollection
  );

  return service;
}
