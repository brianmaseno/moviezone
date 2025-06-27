import React from 'react';
import MovieCarousel from '@/components/MovieCarousel';
import { CarouselSkeleton } from '@/components/Loading';
import { tmdbService } from '@/lib/tmdb';

export default async function MoviesPage() {
  try {
    const [
      popularMovies,
      topRatedMovies,
      upcomingMovies,
      nowPlayingMovies,
      actionMovies,
      comedyMovies,
      dramaMovies,
      horrorMovies
    ] = await Promise.all([
      tmdbService.getPopularMovies(),
      tmdbService.getTopRatedMovies(),
      tmdbService.getUpcomingMovies(),
      tmdbService.getNowPlayingMovies(),
      tmdbService.getMoviesByGenre(28), // Action
      tmdbService.getMoviesByGenre(35), // Comedy
      tmdbService.getMoviesByGenre(18), // Drama
      tmdbService.getMoviesByGenre(27)  // Horror
    ]);

    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Movies
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Discover the latest blockbusters, timeless classics, and hidden gems. 
              From action-packed adventures to heartwarming dramas.
            </p>
          </div>

          {/* Movie Sections */}
          <div className="space-y-16">
            <MovieCarousel
              title="Popular Movies"
              items={popularMovies.results}
              type="movie"
              cardSize="large"
            />

            <MovieCarousel
              title="Now Playing in Theaters"
              items={nowPlayingMovies.results}
              type="movie"
              cardSize="medium"
            />

            <MovieCarousel
              title="Top Rated Movies"
              items={topRatedMovies.results}
              type="movie"
              cardSize="medium"
            />

            <MovieCarousel
              title="Coming Soon"
              items={upcomingMovies.results}
              type="movie"
              cardSize="medium"
            />

            <MovieCarousel
              title="Action & Adventure"
              items={actionMovies.results}
              type="movie"
              cardSize="medium"
            />

            <MovieCarousel
              title="Comedy Movies"
              items={comedyMovies.results}
              type="movie"
              cardSize="medium"
            />

            <MovieCarousel
              title="Drama Movies"
              items={dramaMovies.results}
              type="movie"
              cardSize="medium"
            />

            <MovieCarousel
              title="Horror Movies"
              items={horrorMovies.results}
              type="movie"
              cardSize="medium"
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching movies:', error);
    
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-12">
            <div className="h-12 w-48 bg-gray-800 rounded animate-pulse mb-4" />
            <div className="h-6 w-96 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="space-y-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <CarouselSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
