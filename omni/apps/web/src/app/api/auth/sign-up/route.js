import { signUp as neonSignUp, signIn as neonSignIn } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Use Neon Auth server function to sign up
    const result = await neonSignUp({
      email,
      password,
      name,
    });

    if (result.error) {
      return Response.json(
        { error: result.error.message || 'Sign up failed' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      user: result.user,
      session: result.session,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
