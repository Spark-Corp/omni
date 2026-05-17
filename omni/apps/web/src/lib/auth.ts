// Neon Auth client - for use in API routes
import { createAuthClient } from '@neondatabase/neon-js/auth';

const authUrl = 'https://ep-purple-fog-amwsyc3j.neonauth.c-5.us-east-1.aws.neon.tech/neondb/auth';
export const authClient = createAuthClient(authUrl);

// Simple email/password auth using our own database
// Uses Neon serverless driver directly

import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const dbUrl = process.env.DATABASE_URL;
const sql = dbUrl ? neon(dbUrl) : null;

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + hash.toString(16);
}

export async function signUp({ email, password, name }) {
  if (!sql) return { error: { message: 'Database not configured' } };
  
  try {
    const passwordHash = simpleHash(password);
    
    const result = await sql(
      `INSERT INTO auth_users (email, name, password_hash, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO UPDATE SET name = $2
       RETURNING id, email, name`,
      [email, name || email.split('@')[0], passwordHash]
    );

    if (!result.length) {
      return { error: { message: 'Failed to create user' } };
    }

    const user = result[0];
    return { 
      user: { id: user.id, email: user.email, name: user.name },
      session: { userId: user.id }
    };
  } catch (error) {
    console.error('[Auth] Sign up error:', error.message);
    return { error: { message: error.message } };
  }
}

export async function signIn({ email, password }) {
  if (!sql) return { error: { message: 'Database not configured' } };
  
  try {
    const passwordHash = simpleHash(password);
    
    const result = await sql(
      `SELECT id, email, name 
       FROM auth_users 
       WHERE email = $1 AND password_hash = $2`,
      [email, passwordHash]
    );

    if (!result.length) {
      return { error: { message: 'Invalid email or password' } };
    }

    const user = result[0];
    return { 
      user: { id: user.id, email: user.email, name: user.name },
      session: { userId: user.id }
    };
  } catch (error) {
    console.error('[Auth] Sign in error:', error.message);
    return { error: { message: error.message } };
  }
}

export async function signOut() {
  return { success: true };
}

export async function getSession(sessionToken) {
  return null;
}