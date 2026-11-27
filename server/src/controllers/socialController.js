import * as socialService from '../services/socialService.js';

export async function followUser(req, res, next) {
  try {
    const result = await socialService.followUser(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function unfollowUser(req, res, next) {
  try {
    const result = await socialService.unfollowUser(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getFollowers(req, res, next) {
  try {
    const users = await socialService.getFollowList(req.params.id, 'followers');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function getFollowing(req, res, next) {
  try {
    const users = await socialService.getFollowList(req.params.id, 'following');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function getFeed(req, res, next) {
  try {
    const result = await socialService.getPersonalizedFeed(
      req.user.id,
      req.query.cursor,
      req.query.limit
    );
    res.status(200).json({
      success: true,
      data: result.recipes,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
}
