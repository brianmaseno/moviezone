'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Trophy } from 'lucide-react';
import { Movie, TVShow, tmdbService } from '@/lib/tmdb';
import { withCache, cacheKeys, CACHE_DURATIONS } from '@/lib/cache';
import MovieCard from '@/components/MovieCard';
import Loading from '@/components/Loading';

type MediaType = 'all' | 'movie' | 'tv';

const TopRatedPage = () => {
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadTopRatedData = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      let movieData, tvData;
      
      if (mediaType === 'all' || mediaType === 'movie') {
        movieData = await withCache(
          cacheKeys.topRatedMovies(page),
          () => tmdbService.getTopRatedMovies(page),
          CACHE_DURATIONS.MOVIES
        );
      }

      if (mediaType === 'all' || mediaType === 'tv') {
        tvData = await withCache(
          cacheKeys.topRatedTVShows(page),
          () => tmdbService.getTopRatedTVShows(page),
          CACHE_DURATIONS.TV_SHOWS
        );
      }

      // Update state based on page number
      if (page === 1) {
        setMovies(movieData?.results || []);
        setTvShows(tvData?.results || []);
      } else {
        if (movieData) setMovies(prev => [...prev, ...movieData.results]);
        if (tvData) setTvShows(prev => [...prev, ...tvData.results]);
      }

      // Set total pages
      if (mediaType === 'movie' && movieData) {
        setTotalPages(movieData.total_pages);
      } else if (mediaType === 'tv' && tvData) {
        setTotalPages(tvData.total_pages);
      } else if (mediaType === 'all') {
        setTotalPages(Math.max(movieData?.total_pages || 0, tvData?.total_pages || 0));
      }

      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load top rated data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [mediaType]);

  useEffect(() => {
    setMovies([]);
    setTvShows([]);
    loadTopRatedData(1);
  }, [mediaType, loadTopRatedData]);

  const loadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      loadTopRatedData(currentPage + 1);
    }
  };

  const allItems = [
    ...movies.map(movie => ({ item: movie, type: 'movie' as const })),
    ...tvShows.map(show => ({ item: show, type: 'tv' as const }))
  ].sort((a, b) => (b.item.vote_average || 0) - (a.item.vote_average || 0));

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
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl md:text-4xl font-bold">Top Rated</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl">
            The highest-rated movies and TV shows of all time. Critically acclaimed and audience favorites.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <div className="flex gap-2">
            <span className="text-gray-400 self-center mr-2">Type:</span>
            {(['all', 'movie', 'tv'] as MediaType[]).map((type) => (
              <button
                key={type}
                onClick={() => setMediaType(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  mediaType === type
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {type === 'all' && <Award className="w-4 h-4" />}
                {type === 'movie' && <Star className="w-4 h-4" />}
                {type === 'tv' && <Trophy className="w-4 h-4" />}
                {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {isLoading && currentPage === 1 ? (
          <Loading />
        ) : (
          <>
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

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="text-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      Load More
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </>
        )}

        {allItems.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No top-rated content found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRatedPage;
