import { createAuthClient } from '@neondatabase/neon-js/auth';

const authUrl = 'https://ep-purple-fog-amwsyc3j.neonauth.c-5.us-east-1.aws.neon.tech/neondb/auth';
console.log('[AuthClient] Using URL:', authUrl);

export const authClient = createAuthClient(authUrl);

export async function getSession() {
  try {
    const result = await authClient.getSession();
    if (result.error) {
      console.log('[AuthClient] getSession error:', result.error);
      return { user: null, session: null };
    }
    return { 
      user: result.data?.user || null, 
      session: result.data?.session || null 
    };
  } catch (e) {
    console.log('[AuthClient] getSession exception:', e.message);
    return { user: null, session: null };
  }
}

export async function checkAuth() {
  const { user } = await getSession();
  return !!user;
}