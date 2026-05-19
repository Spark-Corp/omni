import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { getSession } = await import('@/lib/auth-client');
        const session = await getSession();
        if (session?.user) {
          setUser(session.user);
          setLoading(false);
          return;
        }
      } catch {}
      setUser(null);
      setLoading(false);
    };
    checkSession();
  }, []);

  const signIn = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  const signUp = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  const signOut = useCallback(async () => {
    try {
      const { signOut: apiSignOut } = await import('@/lib/auth-client');
      await apiSignOut();
    } catch {
      // Ignore errors
    }
    setUser(null);
    navigate('/');
  }, [navigate]);

  const refreshSession = useCallback(async () => {
    const { getSession } = await import('@/lib/auth-client');
    const session = await getSession();
    setUser(session?.user || null);
    return session;
  }, []);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getSession: null,
    refreshSession,
  };
}

export default useAuth;