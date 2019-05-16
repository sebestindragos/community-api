import {Collection, ObjectID} from 'mongodb';
import {context} from 'exceptional.js';

import {IService} from '../../application/IService';
import { IUserFriendsList } from './kernel/IUserFriendsList';
import { IFriendRequest, FriendRequestStatus } from './kernel/IFriendRequest';
import { IWallPost } from './kernel/IWallPost';

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
    private _wallPostsRepo: Collection<IWallPost>,
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
        $addToSet: {
          friendIds: friendRequest.toId
        }
      });

      this._friendListsRepo.updateOne({
        userId: friendRequest.toId
      }, {
        $addToSet: {
          friendIds: friendRequest.fromId
        }
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
   * Create a new friend list for a user.
   * Should only be used when registering a new user account.
   */
  async registerUserFriendList (userId: ObjectID) {
    await this._friendListsRepo.insertOne({
      _id: new ObjectID(),
      userId,
      friendIds: []
    });
  }

  /**
   * Fetch the friends list for a user.
   */
  async getUserFriendList(userId: ObjectID) : Promise<IUserFriendsList> {
    let found = await this._friendListsRepo.findOne({
      userId
    });

    if (!found) {
      throw EXCEPTIONAL.GenericException(0, {
        message: 'Something really bad happened on our side.'
      });
    }

    return found;
  }

  /**
   * Remove user friend.
   */
  async removeUserFriend (userId: ObjectID, friendId: ObjectID) {
    let found = await this._friendListsRepo.findOne({
      userId
    });

    if (!found) {
      throw EXCEPTIONAL.GenericException(0, {
        message: 'Something really bad happened on our side.'
      });
    }

    await this._friendListsRepo.updateOne({userId}, {$pull: {friendIds: friendId}});
  }

  /**
   * Create a new wall post.
   */
  async createWallPost (
    ownerId: ObjectID,
    data: {
      text: string
    }
  ) : Promise<IWallPost> {
    let newPost: IWallPost = {
      _id: new ObjectID(),
      createdAt: new Date(),
      ownerId: ownerId,
      data: data
    };

    await this._wallPostsRepo.insertOne(newPost);
    return newPost;
  }

  /**
   * Get user wall post feed.
   */
  async getWallFeed(userId: ObjectID, fromId?: ObjectID, limit?: number) : Promise<IWallPost[]> {
    // get user fiend list
    let friendList = await this.getUserFriendList(userId);

    let filterByOwners = friendList.friendIds;
    filterByOwners.push(userId);

    let q: any = {
      ownerId: {$in: filterByOwners}
    };

    if (fromId) {
      q._id = {$lt: fromId};
    }
    return this._wallPostsRepo.find(q).sort({_id: -1}).limit(limit || 10).toArray();
  }

  /**
   * Get user wall posts.
   */
  async getUserWallPosts (userId: ObjectID, fromId?: ObjectID, limit?: number) : Promise<IWallPost[]> {
    let q: any = {
      ownerId: userId
    };

    if (fromId) {
      q._id = {$lt: fromId};
    }
    return this._wallPostsRepo.find(q).sort({_id: -1}).limit(limit || 10).toArray();
  }
}
