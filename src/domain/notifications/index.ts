import {Db} from 'mongodb';

import {NotificationService} from './service';

export function get (
  db: Db
) : NotificationService {

  // fetch collections
  let notificationsCollection = db.collection('notifications');

  let service = new NotificationService(
    notificationsCollection
  );

  return service;
}
