import { signIn as neonSignIn } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Use Neon Auth server function to sign in
    const result = await neonSignIn({
      email,
      password,
    });

    if (result.error) {
      return Response.json(
        { error: result.error.message || 'Sign in failed' },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      user: result.user,
      session: result.session,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
