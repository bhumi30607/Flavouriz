import * as storage from './storageService.js';

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function followUser(currentUserId, targetUserId) {
  if (String(currentUserId) === String(targetUserId)) {
    const error = new Error('You cannot follow yourself.');
    error.statusCode = 400;
    throw error;
  }

  const target = await storage.findById('users', targetUserId);
  if (!target) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const current = await storage.findById('users', currentUserId);
  const following = Array.isArray(current.following) ? current.following : [];
  if (!following.includes(targetUserId)) {
    await storage.updateById('users', currentUserId, { following: [...following, targetUserId] });
  }

  const followers = Array.isArray(target.followers) ? target.followers : [];
  if (!followers.includes(currentUserId)) {
    await storage.updateById('users', targetUserId, { followers: [...followers, currentUserId] });
  }

  return { following: true };
}

export async function unfollowUser(currentUserId, targetUserId) {
  const current = await storage.findById('users', currentUserId);
  const target = await storage.findById('users', targetUserId);

  if (current) {
    await storage.updateById('users', currentUserId, {
      following: (current.following || []).filter((id) => String(id) !== String(targetUserId)),
    });
  }
  if (target) {
    await storage.updateById('users', targetUserId, {
      followers: (target.followers || []).filter((id) => String(id) !== String(currentUserId)),
    });
  }

  return { following: false };
}

export async function getFollowList(userId, field) {
  const user = await storage.findById('users', userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const ids = Array.isArray(user[field]) ? user[field] : [];
  const users = await Promise.all(ids.map((id) => storage.findById('users', id)));
  return users.filter(Boolean).map(sanitizeUser);
}

export async function getPersonalizedFeed(userId, cursor, limit = 9) {
  const user = await storage.findById('users', userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const following = Array.from(new Set(user.following || []));
  let recipes = await storage.find(
    'recipes',
    (recipe) => following.some((id) => String(id) === String(recipe.authorId))
  );

  recipes.sort((a, b) => {
    const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return timeDiff || String(a.id).localeCompare(String(b.id));
  });

  let startIndex = 0;
  if (cursor) {
    try {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
      const [cursorId] = decoded.split('|');
      const cursorIndex = recipes.findIndex((recipe) => String(recipe.id) === cursorId);
      if (cursorIndex >= 0) startIndex = cursorIndex + 1;
    } catch (_) {}
  }

  const pageSize = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
  const page = recipes.slice(startIndex, startIndex + pageSize);
  const hasMore = startIndex + pageSize < recipes.length;
  const last = page.at(-1);
  const nextCursor = hasMore && last
    ? Buffer.from(`${last.id}|${last.createdAt}`).toString('base64url')
    : null;

  return { recipes: page, nextCursor, hasMore };
}
