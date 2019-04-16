import {MongoClient, Db} from 'mongodb';
import {setLocale, registerTable} from 'exceptional.js';
import * as nconf from 'nconf';
import * as socketIO from 'socket.io';

// plumbing
import {Logger} from './util/process/logger';

// services
import {ServiceRegistry} from './application/serviceRegistry';
import {get as UserServiceFactory} from './domain/users';
import {get as NotificationServiceFactory} from './domain/notifications';
import {get as SocialServiceFactory} from './domain/social';

// gateway
import {get as ApiGatewayFactory, ApiGateway} from './gateway';
import { Mailer } from './domain/mailer';

/**
 * Class representing the application object.
 *
 * @author Dragos Sebestin
 */
export class CommunityAPI {
  private _mongoClient: MongoClient | undefined;
  private _mailer: Mailer;

  public serviceRegistry = new ServiceRegistry(); // make it public for import usage
  public apiGateway: ApiGateway | undefined;

  /**
   * Class constructor.
   */
  constructor (private _io: socketIO.Server) {
    // initialize error subsystem
    registerTable({
      errors: {
        0: '${message}'
      },
      locale: 'en',
      namespace: 'default'
    });
    setLocale('en');

    this._mailer = new Mailer();
  }

  /**
   * Start the application.
   */
  async start () {
    // connect to DB
    this._mongoClient = await MongoClient.connect(
      nconf.get('db:url'), {
        useNewUrlParser: true
      }
    );

    // init services
    let db = this._mongoClient.db(nconf.get('db:name'));
    await this._initUsers(db);
    await this._initNotifications(db, this._io);
    await this._initSocial(db);

    // init api gateway
    await this._initGateway();

    Logger.get().write('*** Community started ***');
  }

  /**
   * Stop the application.
   */
  async stop () {
    // close MongoDB connection
    if (this._mongoClient)
      await this._mongoClient.close();
    Logger.get().write('*** Community closed ***');
  }

  /**
   * Initialize the user service.
   */
  private async _initUsers (db: Db) {
    let service = UserServiceFactory(
      db, this._mailer, nconf.get('hostname'), nconf.get('users:jwtSecret')
    );
    this.serviceRegistry.add(service);
  }

  /**
   * Initialize the notifications service.
   */
  private async _initNotifications (db: Db, io: socketIO.Server) {
    let service = NotificationServiceFactory(
      db, io
    );
    this.serviceRegistry.add(service);
  }

  /**
   * Initialize the social service.
   */
  private async _initSocial (db: Db) {
    let service = SocialServiceFactory(
      db
    );
    this.serviceRegistry.add(service);
  }

  /**
   * Initialize API gateway.
   */
  private async _initGateway () {
    this.apiGateway = ApiGatewayFactory(
      nconf.get('engine:version'),
      this.serviceRegistry,
      nconf.get('users:jwtSecret')
    );
  }
}
