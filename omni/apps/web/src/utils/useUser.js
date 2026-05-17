import { useState, useEffect, useCallback } from 'react';
import { authClient } from "@/lib/auth-client";

const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      // First check localStorage for immediate auth
      const storedUser = localStorage.getItem("omni_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      }

      // Then check Neon Auth session
      const session = await authClient.getSession();
      if (session?.data?.user) {
        localStorage.setItem("omni_user", JSON.stringify(session.data.user));
        setUser(session.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { 
    user, 
    data: user, 
    loading, 
    refetch 
  };
};

export { useUser };
export default useUser;