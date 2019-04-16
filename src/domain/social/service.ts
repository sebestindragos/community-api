import {Collection, ObjectID} from 'mongodb';
import {context} from 'exceptional.js';

import {IService} from '../../application/IService';
import { IUserFriendsList } from './kernel/IUserFriendsList';
import { IFriendRequest, FriendRequestStatus } from './kernel/IFriendRequest';

export const SOCIAL_SERVICE_COMPONENT = 'community:social';
const EXCEPTIONAL = context('default');

/**
 * Notifications service class.
 *
 * @author Dragos Sebestin
 */
export class SocialService implements IService {
  public id = SOCIAL_SERVICE_COMPONENT;

  /**
   * Class constructor.
   */
  constructor (
    private _friendListsRepo: Collection<IUserFriendsList>,
    private _friendRequestsRepo: Collection<IFriendRequest>,
  ) { }

  /**
   * IService interface methods.
   */

   /**
    * Create a new friend request.
    */
  async createFriendRequest(params: {
    fromUserId: ObjectID,
    toUserId: ObjectID
  }) : Promise<IFriendRequest> {
    // make sure we don't already have a request for this pair
    let found = await this._friendRequestsRepo.findOne({
      fromId: params.fromUserId,
      toId: params.toUserId,
      status: FriendRequestStatus.pending
    });
    if (found) {
      throw EXCEPTIONAL.ConflictException(0, {
        message: 'A friend request was already sent.'
      });
    }

    // create new request and save it to DB
    let request: IFriendRequest = {
      _id: new ObjectID(),
      fromId: params.fromUserId,
      toId: params.toUserId,
      status: FriendRequestStatus.pending
    };
    await this._friendRequestsRepo.insertOne(request);
    return request;
  }

  /**
   * Respond to a friend request.
   */
  async respondToFriendRequest(id: ObjectID, status: FriendRequestStatus) : Promise<boolean> {
    // find request and make sure it's status is pending
    let friendRequest = await this._friendRequestsRepo.findOne({
      _id: id, status: FriendRequestStatus.pending
    });
    if (!friendRequest) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: 'Could not find friend request.'
      });
    }

    friendRequest.status = status;

    // if it was accepted, add this friends to each other's friend lists
    if (friendRequest.status === FriendRequestStatus.accepted) {
      this._friendListsRepo.updateOne({
        userId: friendRequest.fromId
      }, {
        $push: {
          friendIds: friendRequest.toId
        }
      }, {
        upsert: true
      });

      this._friendListsRepo.updateOne({
        userId: friendRequest.toId
      }, {
        $push: {
          friendIds: friendRequest.fromId
        }
      }, {
        upsert: true
      });
    }

    // update request
    await this._friendRequestsRepo.updateOne({
      _id: friendRequest._id
    }, {
      $set: {
        status: friendRequest.status
      }
    });

    return friendRequest.status === FriendRequestStatus.accepted;
  }

  /**
   * Get a friend request by id.
   */
  async getFriendRequest (id: ObjectID) : Promise<IFriendRequest> {
    let found = await this._friendRequestsRepo.findOne({_id: id});
    if (!found) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: 'Could not find friend request'
      });
    }

    return found;
  }

  /**
   * Fetch the friends list for a user.
   */
  async getUserFriendList(userId: ObjectID) : Promise<IUserFriendsList> {
    let found = await this._friendListsRepo.findOne({
      userId
    });

    if (found) return found;

    return {
      _id: new ObjectID(),
      userId,
      friendIds: []
    };
  }
}
