import { getDatabase, COLLECTIONS } from './mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import type { User, WatchProgress, Favorite } from './types';

// Re-export types
export type { User, WatchProgress, Favorite, CacheEntry } from './types';

// User functions
export async function createUser(email: string, name: string, password: string): Promise<User> {
  const db = await getDatabase();
  const users = db.collection(COLLECTIONS.USERS);
  
  // Check if user already exists
  const existingUser = await users.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = {
    email,
    name,
    password: hashedPassword,
    createdAt: new Date()
  };
  
  const result = await users.insertOne(user);
  
  return {
    _id: result.insertedId.toString(),
    email,
    name,
    createdAt: user.createdAt
  };
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const db = await getDatabase();
  const users = db.collection(COLLECTIONS.USERS);
  
  const user = await users.findOne({ email });
  if (!user) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }
  
  // Update last login
  await users.updateOne(
    { _id: user._id },
    { $set: { lastLogin: new Date() } }
  );
  
  delete user.password; // Don't return password
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = await getDatabase();
  const users = db.collection(COLLECTIONS.USERS);
  
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return null;
  }
  
  delete user.password;
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };
}

// Watch progress functions
export async function saveWatchProgress(progress: Omit<WatchProgress, '_id' | 'updatedAt'>): Promise<void> {
  const db = await getDatabase();
  const watchProgress = db.collection(COLLECTIONS.WATCH_PROGRESS);
  
  const filter: Record<string, unknown> = {
    movieId: progress.movieId,
    mediaType: progress.mediaType
  };
  
  if (progress.userId) {
    filter.userId = progress.userId;
  } else {
    filter.sessionId = progress.sessionId;
    filter.userId = { $exists: false };
  }
  
  if (progress.season && progress.episode) {
    filter.season = progress.season;
    filter.episode = progress.episode;
  }
  
  await watchProgress.updateOne(
    filter,
    {
      $set: {
        ...progress,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
}

export async function getWatchProgress(
  movieId: number,
  mediaType: 'movie' | 'tv',
  userId?: string,
  sessionId?: string,
  season?: number,
  episode?: number
): Promise<WatchProgress | null> {
  const db = await getDatabase();
  const watchProgress = db.collection(COLLECTIONS.WATCH_PROGRESS);
  
  const filter: Record<string, unknown> = {
    movieId,
    mediaType
  };
  
  if (userId) {
    filter.userId = userId;
  } else if (sessionId) {
    filter.sessionId = sessionId;
    filter.userId = { $exists: false };
  }
  
  if (season && episode) {
    filter.season = season;
    filter.episode = episode;
  }
  
  const result = await watchProgress.findOne(filter);
  if (!result) {
    return null;
  }
  
  return {
    _id: result._id.toString(),
    userId: result.userId,
    sessionId: result.sessionId,
    movieId: result.movieId,
    mediaType: result.mediaType,
    progress: result.progress,
    timestamp: result.timestamp,
    duration: result.duration,
    season: result.season,
    episode: result.episode,
    updatedAt: result.updatedAt
  };
}

export async function getUserWatchProgress(
  userId?: string,
  sessionId?: string,
  limit: number = 20
): Promise<WatchProgress[]> {
  const db = await getDatabase();
  const watchProgress = db.collection(COLLECTIONS.WATCH_PROGRESS);
  
  const filter: Record<string, unknown> = {};
  
  if (userId) {
    filter.userId = userId;
  } else if (sessionId) {
    filter.sessionId = sessionId;
    filter.userId = { $exists: false };
  } else {
    return [];
  }
  
  const results = await watchProgress
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();
  
  return results.map(result => ({
    ...result,
    _id: result._id.toString()
  })) as WatchProgress[];
}

// Favorites functions
export async function addToFavorites(userId: string, movieId: number, mediaType: 'movie' | 'tv', title: string, posterPath: string): Promise<void> {
  const db = await getDatabase();
  const favorites = db.collection(COLLECTIONS.FAVORITES);
  
  await favorites.updateOne(
    { userId, movieId, mediaType },
    {
      $set: {
        userId,
        movieId,
        mediaType,
        title,
        posterPath,
        addedAt: new Date()
      }
    },
    { upsert: true }
  );
}

export async function removeFromFavorites(userId: string, movieId: number, mediaType: 'movie' | 'tv'): Promise<void> {
  const db = await getDatabase();
  const favorites = db.collection(COLLECTIONS.FAVORITES);
  
  await favorites.deleteOne({ userId, movieId, mediaType });
}

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  const db = await getDatabase();
  const favorites = db.collection(COLLECTIONS.FAVORITES);
  
  const results = await favorites.find({ userId }).sort({ addedAt: -1 }).toArray();
  return results.map(result => ({
    ...result,
    _id: result._id.toString()
  })) as Favorite[];
}

export async function isFavorite(userId: string, movieId: number, mediaType: 'movie' | 'tv'): Promise<boolean> {
  const db = await getDatabase();
  const favorites = db.collection(COLLECTIONS.FAVORITES);
  
  const result = await favorites.findOne({ userId, movieId, mediaType });
  return !!result;
}

// Cache functions
export async function setCache(key: string, data: unknown, expirationMinutes: number = 60): Promise<void> {
  const db = await getDatabase();
  const cache = db.collection(COLLECTIONS.CACHE);
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);
  
  await cache.updateOne(
    { key },
    {
      $set: {
        key,
        data,
        expiresAt,
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
}

export async function getCache(key: string): Promise<unknown | null> {
  const db = await getDatabase();
  const cache = db.collection(COLLECTIONS.CACHE);
  
  const result = await cache.findOne({
    key,
    expiresAt: { $gt: new Date() }
  });
  
  return result ? result.data : null;
}

export async function clearExpiredCache(): Promise<void> {
  const db = await getDatabase();
  const cache = db.collection(COLLECTIONS.CACHE);
  
  await cache.deleteMany({
    expiresAt: { $lt: new Date() }
  });
}

// Generate session ID for guests
export function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
