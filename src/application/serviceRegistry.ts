import {IService} from './IService';

/**
 * Service container class.
 *
 * @author Dragos Sebestin
 */
export class ServiceRegistry {
  private _services = new Map<string, IService>();

  /**
   * Register a new service.
   */
  add (service: IService) {
    if (this._services.has(service.id))
      throw `${service.id} is already registered.`;
    this._services.set(service.id, service);
  }

  /**
   * Get service instance.
   */
  get (id: string) : IService {
    let service = this._services.get(id);
    if (!service)
      throw `There is no ${id} service registered.`;

    return service;
  }

  /**
   * Perform shutdown operations.
   */
  async tearDown () : Promise<void> {
  }
}
