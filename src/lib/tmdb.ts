// API configuration
export const TMDB_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  accessToken: process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
  baseUrl: process.env.NEXT_PUBLIC_TMDB_BASE_URL,
  imageBaseUrl: process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL,
  streamingBaseUrl: process.env.NEXT_PUBLIC_STREAMING_BASE_URL,
};

// API headers
const headers = {
  'Authorization': `Bearer ${TMDB_CONFIG.accessToken}`,
  'Content-Type': 'application/json',
};

// Image size configurations
export const IMAGE_SIZES = {
  backdrop: {
    small: 'w780',
    medium: 'w1280',
    large: 'original',
  },
  poster: {
    small: 'w342',
    medium: 'w500',
    large: 'w780',
  },
  profile: {
    small: 'w185',
    medium: 'w632',
    large: 'original',
  },
};

// Types for API responses
export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string;
  origin_country: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  production_code: string;
  runtime: number;
  season_number: number;
  still_path: string | null;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_count: number;
  poster_path: string | null;
  season_number: number;
  episodes: Episode[];
}

export interface NextEpisodeToAir {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  production_code: string;
  runtime: number;
  season_number: number;
  still_path: string | null;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  id: number;
  cast: Cast[];
  crew: Crew[];
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface VideosResponse {
  id: number;
  results: Video[];
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_name: string;
  origin_country: string[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  budget: number;
  revenue: number;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string;
    origin_country: string;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string;
  imdb_id: string;
}

export interface TVShowDetails extends TVShow {
  genres: Genre[];
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: Array<{
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    episode_count: number;
    air_date: string;
  }>;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string;
    origin_country: string;
  }>;
  status: string;
  tagline: string;
  last_air_date: string;
  next_episode_to_air: NextEpisodeToAir | null;
  in_production: boolean;
}

// API functions
class TMDBService {
  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${TMDB_CONFIG.baseUrl}${endpoint}`, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return response.json();
  }

  // Movie endpoints
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week') {
    return this.request<{ results: Movie[] }>(`/trending/movie/${timeWindow}`);
  }

  async getPopularMovies(page: number = 1) {
    return this.request<{ results: Movie[]; total_pages: number; total_results: number }>
      (`/movie/popular?page=${page}`);
  }

  async getTopRatedMovies(page: number = 1) {
    return this.request<{ results: Movie[]; total_pages: number; total_results: number }>
      (`/movie/top_rated?page=${page}`);
  }

  async getUpcomingMovies(page: number = 1) {
    return this.request<{ results: Movie[]; total_pages: number; total_results: number }>
      (`/movie/upcoming?page=${page}`);
  }

  async getNowPlayingMovies(page: number = 1) {
    return this.request<{ results: Movie[]; total_pages: number; total_results: number }>
      (`/movie/now_playing?page=${page}`);
  }

  async getMovieDetails(id: number) {
    return this.request<MovieDetails>(`/movie/${id}`);
  }

  async getMovieCredits(id: number) {
    return this.request<Credits>(`/movie/${id}/credits`);
  }

  async getMovieVideos(id: number) {
    return this.request<VideosResponse>(`/movie/${id}/videos`);
  }

  async getSimilarMovies(id: number) {
    return this.request<{ results: Movie[] }>(`/movie/${id}/similar`);
  }

  async getMovieRecommendations(id: number) {
    return this.request<{ results: Movie[] }>(`/movie/${id}/recommendations`);
  }

  // TV Show endpoints
  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week') {
    return this.request<{ results: TVShow[] }>(`/trending/tv/${timeWindow}`);
  }

  async getPopularTVShows(page: number = 1) {
    return this.request<{ results: TVShow[]; total_pages: number; total_results: number }>
      (`/tv/popular?page=${page}`);
  }

  async getTopRatedTVShows(page: number = 1) {
    return this.request<{ results: TVShow[]; total_pages: number; total_results: number }>
      (`/tv/top_rated?page=${page}`);
  }

  async getAiringTodayTVShows(page: number = 1) {
    return this.request<{ results: TVShow[]; total_pages: number; total_results: number }>
      (`/tv/airing_today?page=${page}`);
  }

  async getOnTheAirTVShows(page: number = 1) {
    return this.request<{ results: TVShow[]; total_pages: number; total_results: number }>
      (`/tv/on_the_air?page=${page}`);
  }

  async getTVShowDetails(id: number) {
    return this.request<TVShowDetails>(`/tv/${id}`);
  }

  async getTVShowCredits(id: number) {
    return this.request<Credits>(`/tv/${id}/credits`);
  }

  async getTVShowVideos(id: number) {
    return this.request<VideosResponse>(`/tv/${id}/videos`);
  }

  async getSimilarTVShows(id: number) {
    return this.request<{ results: TVShow[] }>(`/tv/${id}/similar`);
  }

  async getTVShowRecommendations(id: number) {
    return this.request<{ results: TVShow[] }>(`/tv/${id}/recommendations`);
  }

  async getTVShowSeason(id: number, seasonNumber: number) {
    return this.request<Season>(`/tv/${id}/season/${seasonNumber}`);
  }

  // Search endpoints
  async searchMovies(query: string, page: number = 1) {
    return this.request<{ results: Movie[]; total_pages: number; total_results: number }>
      (`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
  }

  async searchTVShows(query: string, page: number = 1) {
    return this.request<{ results: TVShow[]; total_pages: number; total_results: number }>
      (`/search/tv?query=${encodeURIComponent(query)}&page=${page}`);
  }

  async searchMulti(query: string, page: number = 1) {
    return this.request<{ results: (Movie | TVShow)[]; total_pages: number; total_results: number }>
      (`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
  }

  // Genre endpoints
  async getMovieGenres() {
    return this.request<{ genres: Genre[] }>('/genre/movie/list');
  }

  async getTVGenres() {
    return this.request<{ genres: Genre[] }>('/genre/tv/list');
  }

  async getMoviesByGenre(genreId: number, page: number = 1) {
    return this.request<{ results: Movie[]; total_pages: number; total_results: number }>
      (`/discover/movie?with_genres=${genreId}&page=${page}`);
  }

  async getTVShowsByGenre(genreId: number, page: number = 1) {
    return this.request<{ results: TVShow[]; total_pages: number; total_results: number }>
      (`/discover/tv?with_genres=${genreId}&page=${page}`);
  }
}

// Utility functions
export function getImageUrl(path: string, size: string = 'original'): string {
  if (!path) return '/placeholder-image.jpg';
  return `${TMDB_CONFIG.imageBaseUrl}/${size}${path}`;
}

export function getStreamingUrl(type: 'movie' | 'tv', id: number, season?: number, episode?: number): string {
  if (type === 'movie') {
    return `${TMDB_CONFIG.streamingBaseUrl}/movie/${id}`;
  } else {
    return `${TMDB_CONFIG.streamingBaseUrl}/tv/${id}/${season}/${episode}`;
  }
}

export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

export function formatVoteAverage(voteAverage: number): string {
  return (voteAverage * 10).toFixed(0) + '%';
}

export function formatReleaseDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export const tmdbService = new TMDBService();
