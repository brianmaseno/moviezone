'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Plus, Star, Calendar } from 'lucide-react';
import { Movie, TVShow, getImageUrl, formatVoteAverage } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'tv';
  index?: number;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  watchProgress?: number; // Progress percentage (0-100)
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  item, 
  type, 
  index = 0, 
  size = 'medium',
  showDetails = true,
  watchProgress 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isMovie = (item: Movie | TVShow): item is Movie => {
    return 'title' in item;
  };

  const getTitle = (item: Movie | TVShow) => {
    return isMovie(item) ? item.title : item.name;
  };

  const getReleaseDate = (item: Movie | TVShow) => {
    return isMovie(item) ? item.release_date : item.first_air_date;
  };

  const sizeClasses = {
    small: 'w-40 h-60',
    medium: 'w-48 h-72',
    large: 'w-56 h-84'
  };

  const detailsSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${type}/${item.id}`}>
        <div className={cn(
          "relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer",
          sizeClasses[size],
          "group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50"
        )}>
          {/* Poster Image */}
          <div className="relative w-full h-full">
            {!imageError ? (
              <Image
                src={getImageUrl(item.poster_path, 'w500')}
                alt={getTitle(item)}
                fill
                className={cn(
                  "object-cover transition-opacity duration-300",
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs">No Image</p>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Rating Badge */}
            {item.vote_average > 0 && (
              <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-yellow-400 text-xs font-semibold">
                <Star className="w-3 h-3 fill-current" />
                <span>{formatVoteAverage(item.vote_average)}</span>
              </div>
            )}

            {/* Hover Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHovered ? 1 : 0, 
                y: isHovered ? 0 : 20 
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Handle play action
                  }}
                >
                  <Play className="w-5 h-5 fill-current" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Handle add to watchlist
                  }}
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Quick Info Overlay */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0, 
                  y: isHovered ? 0 : 10 
                }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="absolute bottom-0 left-0 right-0 p-4 text-white"
              >
                <h3 className={cn(
                  "font-bold mb-1 line-clamp-2",
                  detailsSize[size]
                )}>
                  {getTitle(item)}
                </h3>
                
                {getReleaseDate(item) && (
                  <div className="flex items-center space-x-1 text-gray-300 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{getReleaseDate(item)?.split('-')[0]}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Watch Progress Bar */}
            {watchProgress && watchProgress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${watchProgress}%` }}
                  className="h-full bg-red-500"
                />
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Title Below Card (for non-hover layouts) */}
      {!showDetails && (
        <div className="mt-3 space-y-1">
          <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-gray-300 transition-colors duration-200">
            {getTitle(item)}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{getReleaseDate(item)?.split('-')[0] || 'N/A'}</span>
            {item.vote_average > 0 && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
                <span>{item.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MovieCard;
