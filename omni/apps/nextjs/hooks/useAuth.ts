'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  phone: string;
  name?: string;
  // Add other user properties as needed
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verifier si l utilisateur est deja connecte au chargement
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedUser = localStorage.getItem('omni_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user:', err);
        localStorage.removeItem('omni_user');
      }
    }
  }, []);

  const signIn = useCallback(async (phone: string, otp: string): Promise<AuthResult> => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        localStorage.setItem('omni_user', JSON.stringify(result.user));
        return { success: true, user: result.user };
      } else {
        setError(result.error || 'Echec de connexion');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'Erreur de connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('omni_user');
    }
    setError('');
  }, []);

  const sendOTP = useCallback(async (phone: string): Promise<AuthResult> => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || 'Echec envoi OTP');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'Erreur envoi OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
    sendOTP,
  };
}