'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Favorite } from '@/lib/database';
import MovieCard from '@/components/MovieCard';
import { Movie, TVShow } from '@/lib/tmdb';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user?._id) return;

    try {
      const response = await fetch(`/api/favorites?userId=${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (movieId: number, mediaType: 'movie' | 'tv') => {
    if (!user?._id) return;

    try {
      const response = await fetch(
        `/api/favorites?userId=${user._id}&movieId=${movieId}&mediaType=${mediaType}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setFavorites(favorites.filter(fav => 
          !(fav.movieId === movieId && fav.mediaType === mediaType)
        ));
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Sign In Required</h1>
          <p className="text-gray-400">
            Please sign in to view your favorite movies and TV shows.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2"
          >
            My Favorites
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400"
          >
            Your saved movies and TV shows
          </motion.p>
        </div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No favorites yet</h2>
            <p className="text-gray-400 mb-8">
              Start adding movies and TV shows to your favorites to see them here.
            </p>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Content
            </motion.a>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {favorites.map((favorite, index) => {
              // Convert favorite to Movie/TVShow format for MovieCard
              const item: Movie | TVShow = {
                id: favorite.movieId,
                title: favorite.mediaType === 'movie' ? favorite.title : '',
                name: favorite.mediaType === 'tv' ? favorite.title : '',
                poster_path: favorite.posterPath,
                vote_average: 0,
                overview: '',
                release_date: favorite.mediaType === 'movie' ? '' : '',
                first_air_date: favorite.mediaType === 'tv' ? '' : '',
                genre_ids: [],
                adult: false,
                backdrop_path: '',
                original_language: 'en',
                original_title: favorite.mediaType === 'movie' ? favorite.title : '',
                original_name: favorite.mediaType === 'tv' ? favorite.title : '',
                popularity: 0,
                video: false,
                vote_count: 0
              };

              return (
                <motion.div
                  key={`${favorite.movieId}-${favorite.mediaType}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <MovieCard
                    item={item}
                    type={favorite.mediaType}
                    index={index}
                    size="medium"
                    showDetails={false}
                  />
                  
                  {/* Remove Button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    onClick={() => removeFavorite(favorite.movieId, favorite.mediaType)}
                    className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
