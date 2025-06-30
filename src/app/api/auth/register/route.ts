import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    const user = await createUser(email, name, password);

    return NextResponse.json({
      message: 'User created successfully',
      user
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
