import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Get credentials from environment variables
    const loginIds = process.env.NEXT_PUBLIC_LOGIN_ID.replace(/[\[\]]/g, '').split(',');
    const loginPasswords = process.env.NEXT_PUBLIC_LOGIN_PASSWORD.replace(/[\[\]]/g, '').split(',');

    // Find matching credentials
    const userIndex = loginIds.findIndex(id => id.trim() === username);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    if (loginPasswords[userIndex].trim() !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        username,
        role: 'admin' // You can add more user info if needed
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
