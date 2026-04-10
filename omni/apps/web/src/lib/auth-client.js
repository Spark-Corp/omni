import { createAuthClient } from '@neondatabase/neon-js/auth';

// Client-side Neon Auth - for browser use only
const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

// Don't call createAuthClient during SSR
const createClient = typeof window !== 'undefined' && authUrl ? createAuthClient(authUrl) : null;

// We need to await the client, but for ESM we export a promise
let authClientPromiseInternal = null;
let cachedClient = null;

export async function getAuthClient() {
  if (cachedClient) return cachedClient;
  if (!createClient) {
    // Return a mock client for SSR
    return {
      signIn: async () => ({ error: new Error('Auth not available during SSR') }),
      signUp: async () => ({ error: new Error('Auth not available during SSR') }),
      signOut: async () => ({ error: new Error('Auth not available during SSR') }),
      getSession: async () => null,
    };
  }
  if (!authClientPromiseInternal) {
    authClientPromiseInternal = createClient();
  }
  cachedClient = await authClientPromiseInternal;
  return cachedClient;
}

// For components that need immediate access, export the promise
export const authClientPromise = createClient || Promise.resolve({
  signIn: async () => ({ error: new Error('Auth not configured') }),
  signUp: async () => ({ error: new Error('Auth not configured') }),
  signOut: async () => ({ error: new Error('Auth not configured') }),
  getSession: async () => null,
});

// Export authClient as the promise for backward compatibility
// Components should await it or use getAuthClient()
export const authClient = authClientPromise;

// Default export for backward compatibility - will be the promise
export default authClientPromise;
