'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { Movie, TVShow, getImageUrl, formatVoteAverage } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface HeroProps {
  items: (Movie | TVShow)[];
  type: 'movie' | 'tv';
}

const Hero: React.FC<HeroProps> = ({ items, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const currentItem = items[currentIndex];

  useEffect(() => {
    if (!isAutoPlay || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlay, items.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsAutoPlay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsAutoPlay(false);
  };

  const isMovie = (item: Movie | TVShow): item is Movie => {
    return 'title' in item;
  };

  const getTitle = (item: Movie | TVShow) => {
    return isMovie(item) ? item.title : item.name;
  };

  const getReleaseDate = (item: Movie | TVShow) => {
    return isMovie(item) ? item.release_date : item.first_air_date;
  };

  if (!currentItem) return null;

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getImageUrl(currentItem.backdrop_path, 'original')})`
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Title */}
                <motion.h1 
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {getTitle(currentItem)}
                </motion.h1>

                {/* Metadata */}
                <motion.div 
                  className="flex items-center space-x-6 text-sm md:text-base"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-semibold">
                      {formatVoteAverage(currentItem.vote_average)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="w-5 h-5" />
                    <span>{getReleaseDate(currentItem)?.split('-')[0] || 'N/A'}</span>
                  </div>
                  <div className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                    {type === 'movie' ? 'Movie' : 'TV Show'}
                  </div>
                </motion.div>

                {/* Overview */}
                <motion.p 
                  className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {currentItem.overview.length > 200 
                    ? `${currentItem.overview.substring(0, 200)}...` 
                    : currentItem.overview
                  }
                </motion.p>

                {/* Action Buttons */}
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-3 px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span>Play Now</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-3 px-8 py-4 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm border border-white/20"
                  >
                    <Info className="w-6 h-6" />
                    <span>More Info</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-2">
          {items.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlay(false);
              }}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-white scale-125" 
                  : "bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      </div>

      {/* Side Navigation */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevious}
          className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-200 backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      </div>

      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-200 backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      {/* Auto-play Indicator */}
      {isAutoPlay && (
        <div className="absolute bottom-20 right-8 z-20">
          <div className="flex items-center space-x-2 text-white/70 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Auto-playing</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
