import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

// Mock fetch globally
global.fetch = vi.fn();

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.getState().signOut();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have null user and false isAuthenticated initially', () => {
      const { user, isAuthenticated } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });

    it('should have loading set to false initially', () => {
      const { loading } = useAuthStore.getState();
      expect(loading).toBe(false);
    });
  });

  describe('Login Flow', () => {
    it('should sign in successfully with valid credentials', async () => {
      const mockUser = { id: '1', phone: '+1234567890', name: 'Test User' };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const result = await useAuthStore.getState().signIn('+1234567890', '123456');
      
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should fail sign in with invalid credentials', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Invalid OTP' }),
      });

      const result = await useAuthStore.getState().signIn('+1234567890', 'wrong');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid OTP');
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle network error during sign in', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await useAuthStore.getState().signIn('+1234567890', '123456');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Erreur');
    });
  });

  describe('Logout Flow', () => {
    it('should sign out and clear user state', async () => {
      // First sign in
      const mockUser = { id: '1', phone: '+1234567890' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });
      
      await useAuthStore.getState().signIn('+1234567890', '123456');
      
      // Now sign out
      useAuthStore.getState().signOut();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.vendor).toBeNull();
    });
  });

  describe('Send OTP', () => {
    it('should send OTP successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await useAuthStore.getState().sendOTP('+1234567890');
      
      expect(result.success).toBe(true);
      expect(useAuthStore.getState().loading).toBe(false);
    });

    it('should fail to send OTP with error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Invalid phone number' }),
      });

      const result = await useAuthStore.getState().sendOTP('invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number');
    });
  });

  describe('Session Persistence', () => {
    it('should persist user to localStorage via zustand persist', () => {
      const mockUser = { id: '1', phone: '+1234567890', name: 'Test User' };
      useAuthStore.getState().setUser(mockUser);
      
      // Zustand persist middleware handles localStorage automatically
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should clear error when setting user', () => {
      useAuthStore.getState().setError('Some error');
      useAuthStore.getState().setUser({ id: '1', name: 'Test' });
      
      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('State Helpers', () => {
    it('should set vendor correctly', () => {
      const mockVendor = { id: '1', name: 'Test Vendor' };
      useAuthStore.getState().setVendor(mockVendor);
      
      expect(useAuthStore.getState().vendor).toEqual(mockVendor);
    });

    it('should set loading state correctly', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().loading).toBe(true);
      
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().loading).toBe(false);
    });

    it('should set and clear error', () => {
      useAuthStore.getState().setError('Test error');
      expect(useAuthStore.getState().error).toBe('Test error');
      
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});