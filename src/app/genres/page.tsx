'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List } from 'lucide-react';
import { Movie, TVShow, Genre, tmdbService } from '@/lib/tmdb';
import { withCache, cacheKeys, CACHE_DURATIONS } from '@/lib/cache';
import MovieCard from '@/components/MovieCard';
import Loading from '@/components/Loading';

type MediaType = 'movie' | 'tv';
type ViewMode = 'grid' | 'list';

const GenresPage = () => {
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [items, setItems] = useState<Array<Movie | TVShow>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Load genres on component mount and when media type changes
  useEffect(() => {
    loadGenres();
  }, [mediaType]);

  // Load items when genre is selected
  useEffect(() => {
    if (selectedGenre) {
      loadGenreItems(1);
    }
  }, [selectedGenre, mediaType]);

  const loadGenres = async () => {
    setIsLoading(true);
    try {
      const data = await withCache(
        mediaType === 'movie' ? cacheKeys.movieGenres() : cacheKeys.tvGenres(),
        () => mediaType === 'movie' ? tmdbService.getMovieGenres() : tmdbService.getTVGenres(),
        CACHE_DURATIONS.MOVIE_DETAILS
      );
      setGenres(data.genres);
      // Auto-select first genre
      if (data.genres.length > 0 && !selectedGenre) {
        setSelectedGenre(data.genres[0]);
      }
    } catch (error) {
      console.error('Failed to load genres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGenreItems = async (page: number) => {
    if (!selectedGenre) return;
    
    setIsLoadingItems(true);
    try {
      const data = await withCache(
        `${mediaType}_genre_${selectedGenre.id}_page_${page}`,
        () => mediaType === 'movie' 
          ? tmdbService.getMoviesByGenre(selectedGenre.id, page)
          : tmdbService.getTVShowsByGenre(selectedGenre.id, page),
        CACHE_DURATIONS.MOVIES
      );
      
      setItems(page === 1 ? data.results : [...items, ...data.results]);
      setTotalPages(data.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load genre items:', error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const loadMore = () => {
    if (currentPage < totalPages && !isLoadingItems) {
      loadGenreItems(currentPage + 1);
    }
  };

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    setItems([]);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <Loading />;
  }

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
            <Filter className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl md:text-4xl font-bold">Browse by Genre</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl">
            Explore {mediaType === 'movie' ? 'movies' : 'TV shows'} by your favorite genres. From action-packed thrillers to heartwarming comedies.
          </p>
        </motion.div>

        {/* Media Type Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          <div className="flex gap-2">
            <span className="text-gray-400 self-center mr-2">Browse:</span>
            {(['movie', 'tv'] as MediaType[]).map((type) => (
              <button
                key={type}
                onClick={() => setMediaType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mediaType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {type === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          {selectedGenre && (
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Genre Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold mb-4">Select Genre</h3>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <motion.button
                key={genre.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGenreSelect(genre)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedGenre?.id === genre.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {genre.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Selected Genre Content */}
        {selectedGenre && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-blue-400 mb-2">
                {selectedGenre.name} {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
              </h2>
              <p className="text-gray-400">
                Showing {items.length} results for {selectedGenre.name.toLowerCase()} {mediaType === 'movie' ? 'movies' : 'TV shows'}
              </p>
            </motion.div>

            {/* Items Grid */}
            {isLoadingItems && currentPage === 1 ? (
              <Loading />
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
                      : 'space-y-4'
                  }
                >
                  {items.map((item, index) => (
                    <motion.div
                      key={`${mediaType}-${item.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MovieCard
                        item={item}
                        type={mediaType}
                        index={index}
                        size={viewMode === 'grid' ? 'medium' : 'large'}
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
                      disabled={isLoadingItems}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      {isLoadingItems ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Filter className="w-4 h-4" />
                          Load More
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </>
            )}

            {items.length === 0 && !isLoadingItems && (
              <div className="text-center py-12">
                <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No {selectedGenre.name.toLowerCase()} {mediaType === 'movie' ? 'movies' : 'TV shows'} found
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GenresPage;
