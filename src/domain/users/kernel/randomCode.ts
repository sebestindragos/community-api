import { IRandomCode } from './IRandomCode';
import { ObjectID } from 'mongodb';

export class RandomCode implements IRandomCode {
  public _id: ObjectID;
  public forId: ObjectID;

  constructor (data: IRandomCode) {
    this._id = data._id;
    this.forId = data.forId;
  }
}
