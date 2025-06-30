'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Movie, TVShow, tmdbService, Genre } from '@/lib/tmdb';
import { withCache, cacheKeys, CACHE_DURATIONS } from '@/lib/cache';
import MovieCard from '@/components/MovieCard';
import Loading from '@/components/Loading';

type MediaType = 'all' | 'movie' | 'tv';
type ViewMode = 'grid' | 'list';

const SearchContent = () => {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Array<{ item: Movie | TVShow; type: 'movie' | 'tv' }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'rating' | 'release_date'>('relevance');

  // Load genres on component mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const [movieGenresData, tvGenresData] = await Promise.all([
          withCache(
            cacheKeys.movieGenres(),
            () => tmdbService.getMovieGenres(),
            CACHE_DURATIONS.MOVIE_DETAILS
          ),
          withCache(
            cacheKeys.tvGenres(),
            () => tmdbService.getTVGenres(),
            CACHE_DURATIONS.TV_DETAILS
          )
        ]);
        setMovieGenres(movieGenresData.genres);
        setTvGenres(tvGenresData.genres);
      } catch (error) {
        console.error('Failed to load genres:', error);
      }
    };

    loadGenres();
  }, []);

  const performSearch = useCallback(async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      let searchResults: any[] = [];
      let totalPages = 0;

      if (mediaType === 'all') {
        const data = await withCache(
          `search_multi_${encodeURIComponent(searchQuery)}_${page}`,
          () => tmdbService.searchMulti(searchQuery, page),
          CACHE_DURATIONS.SEARCH_RESULTS
        );
        searchResults = data.results.map((item: any) => ({
          item,
          type: item.media_type === 'movie' ? 'movie' : 'tv'
        })).filter((item: any) => item.type === 'movie' || item.type === 'tv');
        totalPages = data.total_pages;
      } else if (mediaType === 'movie') {
        const data = await withCache(
          cacheKeys.searchMovies(searchQuery, page),
          () => tmdbService.searchMovies(searchQuery, page),
          CACHE_DURATIONS.SEARCH_RESULTS
        );
        searchResults = data.results.map((item: Movie) => ({ item, type: 'movie' as const }));
        totalPages = data.total_pages;
      } else if (mediaType === 'tv') {
        const data = await withCache(
          cacheKeys.searchTVShows(searchQuery, page),
          () => tmdbService.searchTVShows(searchQuery, page),
          CACHE_DURATIONS.SEARCH_RESULTS
        );
        searchResults = data.results.map((item: TVShow) => ({ item, type: 'tv' as const }));
        totalPages = data.total_pages;
      }

      // Filter by selected genres
      if (selectedGenres.length > 0) {
        searchResults = searchResults.filter(({ item }) =>
          item.genre_ids?.some((genreId: number) => selectedGenres.includes(genreId))
        );
      }

      // Sort results
      if (sortBy !== 'relevance') {
        searchResults.sort((a, b) => {
          switch (sortBy) {
            case 'popularity':
              return (b.item.popularity || 0) - (a.item.popularity || 0);
            case 'rating':
              return (b.item.vote_average || 0) - (a.item.vote_average || 0);
            case 'release_date':
              const aDate = a.item.release_date || a.item.first_air_date || '';
              const bDate = b.item.release_date || b.item.first_air_date || '';
              return new Date(bDate).getTime() - new Date(aDate).getTime();
            default:
              return 0;
          }
        });
      }

      setResults(page === 1 ? searchResults : [...results, ...searchResults]);
      setTotalPages(totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [mediaType, selectedGenres, sortBy, results]);

  // Update query when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    setQuery(urlQuery);
    if (urlQuery.trim()) {
      performSearch(urlQuery, 1);
    }
  }, [searchParams, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setCurrentPage(1);
      performSearch(query.trim(), 1);
    }
  };

  const loadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      performSearch(query, currentPage + 1);
    }
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const allGenres = mediaType === 'movie' ? movieGenres : mediaType === 'tv' ? tvGenres : [...movieGenres, ...tvGenres];
  const uniqueGenres = allGenres.filter((genre, index, self) => 
    index === self.findIndex((g) => g.id === genre.id)
  );

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Search Results
          </motion.h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, TV shows..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex flex-wrap gap-4">
              {/* Media Type Filter */}
              <div className="flex gap-2">
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

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="popularity">Popularity</option>
                <option value="rating">Rating</option>
                <option value="release_date">Release Date</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Genre Filter */}
          {uniqueGenres.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {uniqueGenres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedGenres.includes(genre.id)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {query && !isLoading && results.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-gray-400">No results found for &quot;{query}&quot;</p>
          </div>
        )}

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
                : 'space-y-4'
            }
          >
            {results.map(({ item, type }, index) => (
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
                  size={viewMode === 'grid' ? 'medium' : 'large'}
                  showDetails={true}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More Button */}
        {currentPage < totalPages && !isLoading && (
          <div className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMore}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Load More
            </motion.button>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center py-8">
            <Loading />
          </div>
        )}
      </div>
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
