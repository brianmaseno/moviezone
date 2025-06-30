import { NextRequest, NextResponse } from 'next/server';
import { saveWatchProgress, getWatchProgress, getUserWatchProgress } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    await saveWatchProgress(data);
    
    return NextResponse.json({ message: 'Progress saved successfully' });
  } catch (error: any) {
    console.error('Save progress error:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const movieId = url.searchParams.get('movieId');
    const mediaType = url.searchParams.get('mediaType') as 'movie' | 'tv';
    const userId = url.searchParams.get('userId') || undefined;
    const sessionId = url.searchParams.get('sessionId') || undefined;
    const season = url.searchParams.get('season') ? parseInt(url.searchParams.get('season')!) : undefined;
    const episode = url.searchParams.get('episode') ? parseInt(url.searchParams.get('episode')!) : undefined;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;

    // If movieId is provided, get specific progress
    if (movieId) {
      const progress = await getWatchProgress(parseInt(movieId), mediaType, userId, sessionId, season, episode);
      return NextResponse.json({ progress });
    }

    // Otherwise, get all progress for user/session (for continue watching)
    if (userId || sessionId) {
      const progress = await getUserWatchProgress(userId, sessionId, limit);
      return NextResponse.json({ progress });
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}
