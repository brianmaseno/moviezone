import React from 'react';
import MovieCarousel from '@/components/MovieCarousel';
import { CarouselSkeleton } from '@/components/Loading';
import { tmdbService } from '@/lib/tmdb';

export default async function TVShowsPage() {
  try {
    const [
      popularTVShows,
      topRatedTVShows,
      airingTodayTVShows,
      onTheAirTVShows,
      actionTVShows,
      comedyTVShows,
      dramaTVShows,
      sciFiTVShows
    ] = await Promise.all([
      tmdbService.getPopularTVShows(),
      tmdbService.getTopRatedTVShows(),
      tmdbService.getAiringTodayTVShows(),
      tmdbService.getOnTheAirTVShows(),
      tmdbService.getTVShowsByGenre(10759), // Action & Adventure
      tmdbService.getTVShowsByGenre(35),    // Comedy
      tmdbService.getTVShowsByGenre(18),    // Drama
      tmdbService.getTVShowsByGenre(10765)  // Sci-Fi & Fantasy
    ]);

    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              TV Shows
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Binge-watch the most captivating series, from gripping dramas to 
              hilarious comedies and mind-bending sci-fi adventures.
            </p>
          </div>

          {/* TV Show Sections */}
          <div className="space-y-16">
            <MovieCarousel
              title="Popular TV Shows"
              items={popularTVShows.results}
              type="tv"
              cardSize="large"
            />

            <MovieCarousel
              title="Airing Today"
              items={airingTodayTVShows.results}
              type="tv"
              cardSize="medium"
            />

            <MovieCarousel
              title="Top Rated Series"
              items={topRatedTVShows.results}
              type="tv"
              cardSize="medium"
            />

            <MovieCarousel
              title="Currently On Air"
              items={onTheAirTVShows.results}
              type="tv"
              cardSize="medium"
            />

            <MovieCarousel
              title="Action & Adventure Series"
              items={actionTVShows.results}
              type="tv"
              cardSize="medium"
            />

            <MovieCarousel
              title="Comedy Series"
              items={comedyTVShows.results}
              type="tv"
              cardSize="medium"
            />

            <MovieCarousel
              title="Drama Series"
              items={dramaTVShows.results}
              type="tv"
              cardSize="medium"
            />

            <MovieCarousel
              title="Sci-Fi & Fantasy"
              items={sciFiTVShows.results}
              type="tv"
              cardSize="medium"
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    
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
