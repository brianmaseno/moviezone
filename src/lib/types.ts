// Shared types that can be used on both client and server
export interface User {
  _id?: string; // Always string when sent to client
  email: string;
  name: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface WatchProgress {
  _id?: string;
  userId?: string; // Optional - for guests, this will be null
  sessionId: string; // For tracking guests
  movieId: number;
  mediaType: 'movie' | 'tv';
  progress: number; // Percentage watched (0-100)
  timestamp: number; // Seconds into the content
  duration: number; // Total duration in seconds
  season?: number; // For TV shows
  episode?: number; // For TV shows
  updatedAt: Date;
}

export interface Favorite {
  _id?: string;
  userId: string;
  movieId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  addedAt: Date;
}

export interface CacheEntry {
  _id?: string;
  key: string;
  data: unknown; // Changed from any to unknown
  expiresAt: Date;
  createdAt: Date;
}
