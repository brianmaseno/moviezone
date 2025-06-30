// Cache duration constants (in minutes)
export const CACHE_DURATIONS = {
  MOVIES: 60, // 1 hour
  TV_SHOWS: 60, // 1 hour
  MOVIE_DETAILS: 120, // 2 hours
  TV_DETAILS: 120, // 2 hours
  SEARCH_RESULTS: 30, // 30 minutes
  TRENDING: 15, // 15 minutes
} as const;

// In-memory cache with expiration
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

// Generic cache wrapper for API calls
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration: number = CACHE_DURATIONS.MOVIES
): Promise<T> {
  try {
    // Try to get from memory cache first
    const cached = memoryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    // If not in cache or expired, fetch fresh data
    const data = await fetcher();
    
    // Store in memory cache
    memoryCache.set(key, {
      data,
      expiresAt: Date.now() + (duration * 60 * 1000) // Convert minutes to milliseconds
    });
    
    return data;
  } catch (error) {
    // If cache fails, still try to fetch fresh data
    console.warn('Cache operation failed, fetching fresh data:', error);
    return await fetcher();
  }
}

// Specific cache key generators
export const cacheKeys = {
  popularMovies: (page = 1) => `popular_movies_${page}`,
  topRatedMovies: (page = 1) => `top_rated_movies_${page}`,
  upcomingMovies: (page = 1) => `upcoming_movies_${page}`,
  nowPlayingMovies: (page = 1) => `now_playing_movies_${page}`,
  
  popularTVShows: (page = 1) => `popular_tv_${page}`,
  topRatedTVShows: (page = 1) => `top_rated_tv_${page}`,
  onTheAirTVShows: (page = 1) => `on_the_air_tv_${page}`,
  airingTodayTVShows: (page = 1) => `airing_today_tv_${page}`,
  
  movieDetails: (id: number) => `movie_details_${id}`,
  tvDetails: (id: number) => `tv_details_${id}`,
  
  trendingMovies: (timeWindow: 'day' | 'week') => `trending_movies_${timeWindow}`,
  trendingTVShows: (timeWindow: 'day' | 'week') => `trending_tv_${timeWindow}`,
  
  searchMovies: (query: string, page = 1) => `search_movies_${encodeURIComponent(query)}_${page}`,
  searchTVShows: (query: string, page = 1) => `search_tv_${encodeURIComponent(query)}_${page}`,
  
  movieGenres: () => 'movie_genres',
  tvGenres: () => 'tv_genres',
};

// Helper function to clear expired cache entries
export function clearExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
}

// Clear expired entries every hour
if (typeof window === 'undefined') {
  // Only run on server side
  setInterval(clearExpiredCache, 60 * 60 * 1000);
}
