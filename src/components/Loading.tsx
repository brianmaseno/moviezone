'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className={`mx-auto mb-4 ${sizeClasses[size]} text-red-600`}
        >
          <Film className="w-full h-full" />
        </motion.div>

        {/* Loading Text */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`text-white font-medium ${textSizes[size]}`}
        >
          {text}
        </motion.p>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-red-600 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading Components
export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="w-48 h-72 bg-gray-800 rounded-xl animate-pulse">
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl" />
    </div>
  );
};

export const CarouselSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title Skeleton */}
      <div className="h-8 w-64 bg-gray-800 rounded animate-pulse" />
      
      {/* Cards Skeleton */}
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse">
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="h-16 w-96 bg-gray-700 rounded" />
            <div className="h-6 w-80 bg-gray-700 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-700 rounded" />
              <div className="h-4 w-4/5 bg-gray-700 rounded" />
              <div className="h-4 w-3/5 bg-gray-700 rounded" />
            </div>
            <div className="flex space-x-4">
              <div className="h-12 w-32 bg-gray-700 rounded" />
              <div className="h-12 w-32 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
