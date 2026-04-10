import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getAuthClient } from '@/lib/auth-client';

function useAuth() {
  const navigate = useNavigate();

  const signIn = useCallback(async () => {
    // Navigate to Neon Auth page
    navigate('/auth');
  }, [navigate]);

  const signUp = useCallback(async () => {
    // Navigate to Neon Auth page (handles both signin/signup)
    navigate('/auth');
  }, [navigate]);

  const signOut = useCallback(async () => {
    const authClient = await getAuthClient();
    await authClient.signOut();
    navigate('/');
  }, [navigate]);

  const getSession = useCallback(async () => {
    const authClient = await getAuthClient();
    const session = await authClient.getSession();
    return session;
  }, []);

  return {
    signIn,
    signUp,
    signOut,
    getSession,
    getAuthClient,
  };
}

export default useAuth;