'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Plus, 
  Star, 
  Calendar, 
  Clock, 
  Globe,
  Heart,
  Share,
  Download,
  Info
} from 'lucide-react';
import { 
  MovieDetails, 
  tmdbService, 
  getImageUrl, 
  formatVoteAverage, 
  formatRuntime, 
  formatReleaseDate 
} from '@/lib/tmdb';
import MovieCarousel from '@/components/MovieCarousel';
import StreamingPlayer from '@/components/StreamingPlayer';
import Loading from '@/components/Loading';

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = Number(params.id);
  
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<any[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        const [movieData, similarData, recommendedData, creditsData] = await Promise.all([
          tmdbService.getMovieDetails(movieId),
          tmdbService.getSimilarMovies(movieId),
          tmdbService.getMovieRecommendations(movieId),
          tmdbService.getMovieCredits(movieId)
        ]);

        setMovie(movieData);
        setSimilarMovies(similarData.results || []);
        setRecommendedMovies(recommendedData.results || []);
        setCredits(creditsData);
      } catch (err) {
        setError('Failed to fetch movie details');
        console.error('Error fetching movie data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (movieId) {
      fetchMovieData();
    }
  }, [movieId]);

  if (isLoading) {
    return <Loading fullScreen text="Loading movie details..." />;
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Movie Not Found</h1>
          <p className="text-gray-400 mb-8">
            {error || 'The movie you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const director = credits?.crew?.find((person: any) => person.job === 'Director');
  const mainCast = credits?.cast?.slice(0, 6) || [];

  return (
    <>
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <div className="relative h-screen overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'original')})`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* Poster */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="hidden md:block"
                >
                  <img
                    src={getImageUrl(movie.poster_path, 'w500')}
                    alt={movie.title}
                    className="w-full max-w-sm mx-auto rounded-xl shadow-2xl"
                  />
                </motion.div>

                {/* Movie Info */}
                <div className="md:col-span-2 space-y-6">
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl md:text-6xl font-bold text-white leading-tight"
                  >
                    {movie.title}
                  </motion.h1>

                  {/* Metadata */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-wrap items-center gap-4 text-sm md:text-base"
                  >
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold">
                        {formatVoteAverage(movie.vote_average)}
                      </span>
                      <span className="text-gray-400">
                        ({movie.vote_count?.toLocaleString()} votes)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="w-5 h-5" />
                      <span>{formatReleaseDate(movie.release_date)}</span>
                    </div>
                    {movie.runtime && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Clock className="w-5 h-5" />
                        <span>{formatRuntime(movie.runtime)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Globe className="w-5 h-5" />
                      <span>{movie.original_language?.toUpperCase()}</span>
                    </div>
                  </motion.div>

                  {/* Genres */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex flex-wrap gap-2"
                  >
                    {movie.genres?.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-white/20 text-white text-sm rounded-full backdrop-blur-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </motion.div>

                  {/* Tagline */}
                  {movie.tagline && (
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="text-xl text-gray-300 italic"
                    >
                      "{movie.tagline}"
                    </motion.p>
                  )}

                  {/* Overview */}
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="text-gray-300 text-lg leading-relaxed max-w-2xl"
                  >
                    {movie.overview}
                  </motion.p>

                  {/* Action Buttons */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-wrap items-center gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPlayer(true)}
                      className="flex items-center space-x-3 px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      <Play className="w-6 h-6 fill-current" />
                      <span>Watch Now</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`flex items-center space-x-3 px-8 py-4 font-semibold rounded-lg transition-colors duration-200 ${
                        isFavorite 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                      <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
                    >
                      <Share className="w-6 h-6" />
                    </motion.button>
                  </motion.div>

                  {/* Director and Cast */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    {director && (
                      <div>
                        <h3 className="text-white font-semibold mb-2">Director</h3>
                        <p className="text-gray-300">{director.name}</p>
                      </div>
                    )}
                    {mainCast.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-2">Starring</h3>
                        <p className="text-gray-300">
                          {mainCast.map((actor: any) => actor.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Content */}
        <div className="bg-black py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* Similar Movies */}
            {similarMovies.length > 0 && (
              <MovieCarousel
                title="More Like This"
                items={similarMovies}
                type="movie"
                cardSize="medium"
              />
            )}

            {/* Recommended Movies */}
            {recommendedMovies.length > 0 && (
              <MovieCarousel
                title="Recommended for You"
                items={recommendedMovies}
                type="movie"
                cardSize="medium"
              />
            )}
          </div>
        </div>
      </div>

      {/* Streaming Player Modal */}
      <AnimatePresence>
        {showPlayer && (
          <StreamingPlayer
            id={movie.id}
            type="movie"
            title={movie.title}
            onClose={() => setShowPlayer(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
