export async function GET() {
  try {
    const { getSession } = await import('@/lib/auth');
    const session = await getSession();
    
    if (!session) {
      return Response.json({ user: null });
    }

    return Response.json({
      user: session.user,
      session: session,
    });
  } catch (error) {
    console.error('Session error:', error);
    return Response.json({ user: null });
  }
}

export async function POST() {
  try {
    // Sign out - clear session cookies
    return Response.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return Response.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
