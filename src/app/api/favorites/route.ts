import { NextRequest, NextResponse } from 'next/server';
import { addToFavorites, removeFromFavorites, getUserFavorites, isFavorite } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId, movieId, mediaType, title, posterPath } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User must be logged in to add favorites' },
        { status: 401 }
      );
    }

    await addToFavorites(userId, movieId, mediaType, title, posterPath);
    
    return NextResponse.json({ message: 'Added to favorites successfully' });
  } catch (error: any) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const movieId = parseInt(url.searchParams.get('movieId') || '0');
    const mediaType = url.searchParams.get('mediaType') as 'movie' | 'tv';

    if (!userId) {
      return NextResponse.json(
        { error: 'User must be logged in' },
        { status: 401 }
      );
    }

    await removeFromFavorites(userId, movieId, mediaType);
    
    return NextResponse.json({ message: 'Removed from favorites successfully' });
  } catch (error: any) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const movieId = url.searchParams.get('movieId');
    const mediaType = url.searchParams.get('mediaType') as 'movie' | 'tv';

    if (!userId) {
      return NextResponse.json(
        { error: 'User must be logged in' },
        { status: 401 }
      );
    }

    if (movieId && mediaType) {
      // Check if specific item is favorite
      const favorite = await isFavorite(userId, parseInt(movieId), mediaType);
      return NextResponse.json({ isFavorite: favorite });
    } else {
      // Get all user favorites
      const favorites = await getUserFavorites(userId);
      return NextResponse.json({ favorites });
    }
  } catch (error: any) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to get favorites' },
      { status: 500 }
    );
  }
}
