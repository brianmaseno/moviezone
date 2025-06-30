'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  X,
  RotateCcw
} from 'lucide-react';
import { getStreamingUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, sessionId } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('HD');
  const [speed, setSpeed] = useState(1);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const streamingUrl = getStreamingUrl(type, id, season, episode);

  const loadWatchProgress = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('movieId', id.toString());
      params.set('mediaType', type);
      
      if (user?._id) {
        params.set('userId', user._id.toString());
      } else if (sessionId) {
        params.set('sessionId', sessionId);
      }
      
      if (season) {
        params.set('season', season.toString());
      }
      if (episode) {
        params.set('episode', episode.toString());
      }

      const response = await fetch(`/api/watch-progress?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.progress && data.progress.progress > 5) { // Show prompt if more than 5% watched
          setCurrentTime(data.progress.timestamp);
          setProgress(data.progress.progress);
          setShowResumePrompt(true);
        }
      }
    } catch (error) {
      console.error('Failed to load watch progress:', error);
    }
  }, [id, type, user?._id, sessionId, season, episode]);

  const saveProgress = useCallback(async () => {
    if (currentTime > 0 && duration > 0) {
      try {
        const progressData = {
          movieId: id,
          mediaType: type,
          progress: (currentTime / duration) * 100,
          timestamp: currentTime,
          duration,
          ...(user?._id && { userId: user._id }),
          ...(!user?._id && { sessionId }),
          ...(season && { season }),
          ...(episode && { episode })
        };

        await fetch('/api/watch-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progressData)
        });
      } catch (error) {
        console.error('Failed to save watch progress:', error);
      }
    }
  }, [currentTime, duration, id, type, user?._id, sessionId, season, episode]);

  useEffect(() => {
    // Load previous watch progress
    loadWatchProgress();
    
    // Auto-save progress every 30 seconds
    const interval = setInterval(saveProgress, 30000);
    
    return () => {
      clearInterval(interval);
      saveProgress(); // Save on unmount
    };
  }, [loadWatchProgress, saveProgress]);

  useEffect(() => {
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);



  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
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
  };

  const handlePlayPause = () => {
    // Note: Since we're using an iframe, we can't directly control playback
    // This is a UI state for demonstration
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const newTime = percentage * duration;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIsPlaying(true);
    
    // Simulate duration and progress updates
    setDuration(7200); // 2 hours default
    
    // Start progress simulation
    const startTime = currentTime;
    const startTimestamp = Date.now();
    
    const updateProgress = () => {
      const elapsed = (Date.now() - startTimestamp) / 1000;
      const newTime = startTime + elapsed;
      
      if (newTime < duration) {
        setCurrentTime(newTime);
        setProgress((newTime / duration) * 100);
        progressUpdateRef.current = setTimeout(updateProgress, 1000);
      }
    };
    
    progressUpdateRef.current = setTimeout(updateProgress, 1000);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const qualities = ['Auto', 'HD', '720p', '480p'];
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

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

        {/* Resume Prompt */}
        <AnimatePresence>
          {showResumePrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-20"
            >
              <motion.div
                className="bg-gray-900 rounded-2xl p-8 max-w-md mx-4 text-center border border-gray-700"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <div className="mb-6">
                  <RotateCcw className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Continue Watching?</h3>
                  <p className="text-gray-400">
                    You were at {formatTime(currentTime)} of {formatTime(duration)}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentTime(0);
                      setProgress(0);
                      setShowResumePrompt(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Start Over
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowResumePrompt(false)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Resume
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Player */}
        <iframe
          ref={iframeRef}
          src={streamingUrl}
          className="w-full h-full"
          allowFullScreen
          frameBorder="0"
          onLoad={handleIframeLoad}
          title={`Streaming ${title}`}
          allow="autoplay; fullscreen"
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
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlayPause}
                    className="p-6 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
                  >
                    <Play className="w-12 h-12 fill-current" />
                  </motion.button>
                </div>
              )}

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                {/* Progress Bar */}
                <div className="mb-4 w-full">
                  <div 
                    className="relative w-full h-2 bg-white/30 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all duration-200"
                    onClick={handleProgressClick}
                  >
                    <motion.div
                      className="h-full bg-red-600 rounded-full"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>

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
                      onClick={handlePlayPause}
                      className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors duration-200"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current" />
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:text-gray-300 transition-colors duration-200"
                    >
                      <SkipForward className="w-6 h-6" />
                    </motion.button>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleMute}
                        className="p-2 text-white hover:text-gray-300 transition-colors duration-200"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-6 h-6" />
                        ) : (
                          <Volume2 className="w-6 h-6" />
                        )}
                      </motion.button>
                      
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 text-white hover:text-gray-300 transition-colors duration-200"
                    >
                      <Settings className="w-6 h-6" />
                    </motion.button>

                    {/* Settings Panel */}
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-48"
                        >
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-white text-sm font-medium mb-2">Quality</h4>
                              <div className="space-y-1">
                                {qualities.map((q) => (
                                  <button
                                    key={q}
                                    onClick={() => setQuality(q)}
                                    className={cn(
                                      "block w-full text-left px-2 py-1 rounded text-sm transition-colors",
                                      quality === q 
                                        ? "bg-red-600 text-white" 
                                        : "text-gray-300 hover:bg-white/10"
                                    )}
                                  >
                                    {q}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-white text-sm font-medium mb-2">Speed</h4>
                              <div className="space-y-1">
                                {speeds.map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => setSpeed(s)}
                                    className={cn(
                                      "block w-full text-left px-2 py-1 rounded text-sm transition-colors",
                                      speed === s 
                                        ? "bg-red-600 text-white" 
                                        : "text-gray-300 hover:bg-white/10"
                                    )}
                                  >
                                    {s}x
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quality & Info Badge */}
        <div className="absolute top-4 right-20 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
          {quality} Quality
        </div>
      </div>
    </motion.div>
  );
};

export default StreamingPlayer;
