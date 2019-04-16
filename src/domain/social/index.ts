import {Db} from 'mongodb';

import {SocialService} from './service';

export function get (
  db: Db
) : SocialService {

  // fetch collections
  let friendListsCollection = db.collection('friend-lists');
  let friendRequestsCollection = db.collection('friend-requests');

  let service = new SocialService(
    friendListsCollection, friendRequestsCollection
  );

  return service;
}
