import {Db} from 'mongodb';
import {Server} from 'socket.io';

import {NotificationService} from './service';

export function get (
  db: Db, io: Server, jwtSecret: string
) : NotificationService {

  // fetch collections
  let notificationsCollection = db.collection('notifications');

  let service = new NotificationService(
    notificationsCollection, io, jwtSecret
  );

  return service;
}
