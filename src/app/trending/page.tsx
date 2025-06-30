'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';
import { Movie, TVShow, tmdbService } from '@/lib/tmdb';
import { withCache, cacheKeys, CACHE_DURATIONS } from '@/lib/cache';
import MovieCard from '@/components/MovieCard';
import Loading from '@/components/Loading';

type TimeWindow = 'day' | 'week';
type MediaType = 'all' | 'movie' | 'tv';

const TrendingPage = () => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('week');
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrendingData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (mediaType === 'all' || mediaType === 'movie') {
        const movieData = await withCache(
          cacheKeys.trendingMovies(timeWindow),
          () => tmdbService.getTrendingMovies(timeWindow),
          CACHE_DURATIONS.TRENDING
        );
        setMovies(movieData.results);
      } else {
        setMovies([]);
      }

      if (mediaType === 'all' || mediaType === 'tv') {
        const tvData = await withCache(
          cacheKeys.trendingTVShows(timeWindow),
          () => tmdbService.getTrendingTVShows(timeWindow),
          CACHE_DURATIONS.TRENDING
        );
        setTvShows(tvData.results);
      } else {
        setTvShows([]);
      }
    } catch (error) {
      console.error('Failed to load trending data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeWindow, mediaType]);

  useEffect(() => {
    loadTrendingData();
  }, [loadTrendingData]);

  const allItems = [
    ...movies.map(movie => ({ item: movie, type: 'movie' as const })),
    ...tvShows.map(show => ({ item: show, type: 'tv' as const }))
  ].sort((a, b) => (b.item.popularity || 0) - (a.item.popularity || 0));

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl md:text-4xl font-bold">Trending Now</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl">
            Discover what&apos;s hot right now. The most popular movies and TV shows trending {timeWindow === 'day' ? 'today' : 'this week'}.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          {/* Time Window Filter */}
          <div className="flex gap-2">
            <span className="text-gray-400 self-center mr-2">Trending:</span>
            {(['day', 'week'] as TimeWindow[]).map((window) => (
              <button
                key={window}
                onClick={() => setTimeWindow(window)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  timeWindow === window
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {window === 'day' ? 'Today' : 'This Week'}
              </button>
            ))}
          </div>

          {/* Media Type Filter */}
          <div className="flex gap-2">
            <span className="text-gray-400 self-center mr-2">Type:</span>
            {(['all', 'movie', 'tv'] as MediaType[]).map((type) => (
              <button
                key={type}
                onClick={() => setMediaType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mediaType === type
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <Loading />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {allItems.map(({ item, type }, index) => (
              <motion.div
                key={`${type}-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard
                  item={item}
                  type={type}
                  index={index}
                  showDetails={true}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {allItems.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No trending content found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
