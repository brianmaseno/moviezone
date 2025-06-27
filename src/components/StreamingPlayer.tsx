'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Settings,
  X
} from 'lucide-react';
import { getStreamingUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface StreamingPlayerProps {
  id: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title: string;
  onClose: () => void;
  className?: string;
}

const StreamingPlayer: React.FC<StreamingPlayerProps> = ({
  id,
  type,
  season,
  episode,
  title,
  onClose,
  className
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const streamingUrl = getStreamingUrl(type, id, season, episode);

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 bg-black z-50 flex items-center justify-center",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <div 
        ref={playerRef}
        className="relative w-full h-full max-w-7xl mx-auto"
      >
        {/* Loading Spinner */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-10"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 border-4 border-red-500/30 border-t-red-500 rounded-full"
                />
                <p className="text-white text-lg">Loading {title}...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Player */}
        <iframe
          src={streamingUrl}
          className="w-full h-full"
          allowFullScreen
          frameBorder="0"
          onLoad={handleIframeLoad}
          title={`Streaming ${title}`}
        />

        {/* Controls Overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none"
            >
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center space-x-4">
                  <h1 className="text-white text-xl font-semibold">{title}</h1>
                  {type === 'tv' && season && episode && (
                    <span className="text-gray-300 text-sm">
                      S{season}E{episode}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleFullscreen}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors duration-200"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Center Play Button (when paused) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-6 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm opacity-0 hover:opacity-100"
                >
                  <Play className="w-12 h-12 fill-current" />
                </motion.button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:text-gray-300 transition-colors duration-200"
                    >
                      <SkipBack className="w-6 h-6" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Play className="w-6 h-6 fill-current" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:text-gray-300 transition-colors duration-200"
                    >
                      <SkipForward className="w-6 h-6" />
                    </motion.button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:text-gray-300 transition-colors duration-200"
                    >
                      <Volume2 className="w-6 h-6" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:text-gray-300 transition-colors duration-200"
                    >
                      <Settings className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 w-full">
                  <div className="relative w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-600 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '25%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quality & Info Badge */}
        <div className="absolute top-4 right-20 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
          HD Quality
        </div>
      </div>
    </motion.div>
  );
};

export default StreamingPlayer;
