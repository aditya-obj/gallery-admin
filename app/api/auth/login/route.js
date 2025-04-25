import { NextResponse } from 'next/server';
import { database } from '@/config/firebase';
import { ref, get } from 'firebase/database';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Get user from Firebase
    const userRef = ref(database, `users/auth/${username}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const storedPassword = snapshot.val();

    // Check password
    if (storedPassword !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
