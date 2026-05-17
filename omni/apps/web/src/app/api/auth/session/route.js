import { createAuthClient } from '@neondatabase/neon-js/auth';

const authUrl = 'https://ep-purple-fog-amwsyc3j.neonauth.c-5.us-east-1.aws.neon.tech/neondb/auth';
const authClient = createAuthClient(authUrl);

export async function GET(request) {
  console.log('[Session] Request received');
  console.log('[Session] Cookies:', request.headers.get('cookie'));
  
  try {
    const result = await authClient.getSession();
    console.log('[Session] Result:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('[Session] Error:', result.error);
      return Response.json({ user: null });
    }

    if (result.data?.user) {
      return Response.json({
        user: result.data.user,
        session: result.data.session,
      });
    }

    console.log('[Session] No user found');
    return Response.json({ user: null });
  } catch (error) {
    console.error('[Session] Exception:', error);
    return Response.json({ user: null });
  }
}

export async function POST(request) {
  try {
    await authClient.signOut();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return Response.json({ success: true });
  }
}