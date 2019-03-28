import {MongoClient, Db} from 'mongodb';
import {setLocale} from 'exceptional.js';
import * as nconf from 'nconf';

// plumbing
import {Logger} from './util/process/logger';

// services
import {ServiceRegistry} from './application/serviceRegistry';
import {get as UserServiceFactory} from './domain/users';

// gateway
import {get as ApiGatewayFactory, ApiGateway} from './gateway';

/**
 * Class representing the application object.
 *
 * @author Dragos Sebestin
 */
export class CommunityAPI {
  private _mongoClient: MongoClient | undefined;

  public serviceRegistry = new ServiceRegistry(); // make it public for import usage
  public apiGateway: ApiGateway | undefined;

  /**
   * Class constructor.
   */
  constructor () {
    // initialize error subsystem

    setLocale('ro');
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
    await this._initUsers(this._mongoClient.db(nconf.get('db:name')));

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
    let userService = UserServiceFactory(db);
    this.serviceRegistry.add(userService);
  }

  /**
   * Initialize API gateway.
   */
  private async _initGateway () {
    this.apiGateway = ApiGatewayFactory(
      nconf.get('engine:version'),
      this.serviceRegistry
    );
  }
}
