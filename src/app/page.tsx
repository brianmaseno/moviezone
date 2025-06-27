import React from 'react';
import Hero from '@/components/Hero';
import MovieCarousel from '@/components/MovieCarousel';
import { HeroSkeleton, CarouselSkeleton } from '@/components/Loading';
import { tmdbService } from '@/lib/tmdb';

export default async function Home() {
  try {
    // Fetch data for all sections
    const [
      trendingMovies,
      popularMovies,
      topRatedMovies,
      upcomingMovies,
      trendingTVShows,
      popularTVShows,
      topRatedTVShows
    ] = await Promise.all([
      tmdbService.getTrendingMovies('week'),
      tmdbService.getPopularMovies(),
      tmdbService.getTopRatedMovies(),
      tmdbService.getUpcomingMovies(),
      tmdbService.getTrendingTVShows('week'),
      tmdbService.getPopularTVShows(),
      tmdbService.getTopRatedTVShows()
    ]);

    // Get hero items (trending movies for hero section)
    const heroItems = trendingMovies.results.slice(0, 5);

    return (
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <Hero items={heroItems} type="movie" />

        {/* Content Sections */}
        <div className="relative z-10 space-y-16 py-16 bg-gradient-to-b from-transparent via-black to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Trending Movies */}
            <MovieCarousel
              title="Trending Movies"
              items={trendingMovies.results.slice(5, 25)}
              type="movie"
              cardSize="medium"
            />

            {/* Popular TV Shows */}
            <MovieCarousel
              title="Popular TV Shows"
              items={popularTVShows.results.slice(0, 20)}
              type="tv"
              cardSize="medium"
            />

            {/* Top Rated Movies */}
            <MovieCarousel
              title="Top Rated Movies"
              items={topRatedMovies.results.slice(0, 20)}
              type="movie"
              cardSize="medium"
            />

            {/* Trending TV Shows */}
            <MovieCarousel
              title="Trending TV Shows"
              items={trendingTVShows.results.slice(0, 20)}
              type="tv"
              cardSize="medium"
            />

            {/* Popular Movies */}
            <MovieCarousel
              title="Popular Movies"
              items={popularMovies.results.slice(0, 20)}
              type="movie"
              cardSize="medium"
            />

            {/* Top Rated TV Shows */}
            <MovieCarousel
              title="Top Rated TV Shows"
              items={topRatedTVShows.results.slice(0, 20)}
              type="tv"
              cardSize="medium"
            />

            {/* Upcoming Movies */}
            <MovieCarousel
              title="Coming Soon"
              items={upcomingMovies.results.slice(0, 20)}
              type="movie"
              cardSize="medium"
            />

          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    
    return (
      <div className="min-h-screen bg-black">
        <HeroSkeleton />
        <div className="relative z-10 space-y-16 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {Array.from({ length: 5 }).map((_, i) => (
              <CarouselSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
