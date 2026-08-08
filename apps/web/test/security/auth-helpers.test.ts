import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('auth-helpers', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('getCurrentUser', () => {
    it('should return null when session fetch fails', async () => {
      vi.doMock('@/lib/auth-client', () => ({
        authFetch: vi.fn().mockRejectedValue(new Error('no session')),
      }));
      const { getCurrentUser } = await import('@/lib/auth-helpers');
      const user = await getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return user object when session returns data', async () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test' };
      vi.doMock('@/lib/auth-client', () => ({
        authFetch: vi.fn().mockResolvedValue({
          json: vi.fn().mockResolvedValue({ user: mockUser }),
        }),
      }));
      const { getCurrentUser } = await import('@/lib/auth-helpers');
      const user = await getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should return null when session returns no user', async () => {
      vi.doMock('@/lib/auth-client', () => ({
        authFetch: vi.fn().mockResolvedValue({
          json: vi.fn().mockResolvedValue({ user: null }),
        }),
      }));
      const { getCurrentUser } = await import('@/lib/auth-helpers');
      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user', async () => {
      vi.doMock('@/lib/auth-client', () => ({
        authFetch: vi.fn().mockResolvedValue({
          json: vi.fn().mockResolvedValue({ user: null }),
        }),
      }));
      const { isAuthenticated } = await import('@/lib/auth-helpers');
      expect(await isAuthenticated()).toBe(false);
    });

    it('should return true when valid user exists', async () => {
      vi.doMock('@/lib/auth-client', () => ({
        authFetch: vi.fn().mockResolvedValue({
          json: vi.fn().mockResolvedValue({ user: { id: '123' } }),
        }),
      }));
      const { isAuthenticated } = await import('@/lib/auth-helpers');
      expect(await isAuthenticated()).toBe(true);
    });
  });

  describe('invalidateUserCache', () => {
    it('should export invalidateUserCache function', async () => {
      const mod = await import('@/lib/auth-helpers');
      expect(typeof mod.invalidateUserCache).toBe('function');
    });
  });
});
