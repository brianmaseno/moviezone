'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WatchProgress } from '@/lib/types';
import { Movie, TVShow, tmdbService } from '@/lib/tmdb';
import MovieCard from './MovieCard';

const ContinueWatching = () => {
  const { user, sessionId } = useAuth();
  const [watchList, setWatchList] = useState<Array<{
    item: Movie | TVShow;
    type: 'movie' | 'tv';
    progress: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWatchProgress = useCallback(async () => {
    if (!user && !sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (user?._id) {
        params.set('userId', user._id.toString());
      } else if (sessionId) {
        params.set('sessionId', sessionId);
      }
      params.set('limit', '10');

      const response = await fetch(`/api/watch-progress?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        // Fetch movie/TV details for each progress entry
        const watchItems = await Promise.all(
          data.progress
            .filter((p: WatchProgress) => p.progress > 5 && p.progress < 95) // Only show partially watched
            .map(async (progress: WatchProgress) => {
              try {
                const item = progress.mediaType === 'movie' 
                  ? await tmdbService.getMovieDetails(progress.movieId)
                  : await tmdbService.getTVShowDetails(progress.movieId);
                
                return {
                  item,
                  type: progress.mediaType,
                  progress: progress.progress
                };
              } catch (error) {
                console.error(`Failed to load ${progress.mediaType} ${progress.movieId}:`, error);
                return null;
              }
            })
        );

        setWatchList(watchItems.filter(Boolean) as typeof watchList);
      }
    } catch (error) {
      console.error('Error loading watch progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    loadWatchProgress();
  }, [loadWatchProgress]);

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
        </div>
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-48 h-72 bg-gray-800 rounded-lg animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (watchList.length === 0) {
    return null; // Don't show section if no items
  }

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-2 mb-6"
      >
        <Clock className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
      </motion.div>

      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
        >
          {watchList.map((item, index) => (
            <motion.div
              key={`${item.type}-${item.item.id}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 relative group"
            >
              <MovieCard 
                item={item.item} 
                type={item.type} 
                index={index}
                watchProgress={item.progress}
              />
              
              {/* Continue watching overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  onClick={() => {
                    // Navigate to player with resume
                    const url = item.type === 'movie' 
                      ? `/movie/${item.item.id}` 
                      : `/tv/${item.item.id}`;
                    window.location.href = url;
                  }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Continue</span>
                </motion.button>
              </div>

              {/* Progress percentage indicator */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-semibold">
                {Math.round(item.progress)}%
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ContinueWatching;
