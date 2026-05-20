// Neon Auth URL for server-side session verification
const authUrl = 'https://ep-purple-fog-amwsyc3j.neonauth.c-5.us-east-1.aws.neon.tech/neondb/auth';

import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const dbUrl = process.env.DATABASE_URL;
const sql = dbUrl ? neon(dbUrl) : null;

async function ensureAppUser(authUser) {
  if (!sql) return;
  try {
    const email = authUser.email || `${authUser.id.replace(/-/g, '')}@omni.app`;
    await sql`
      INSERT INTO users (id, name, email)
      VALUES (${authUser.id}::uuid, ${authUser.name || 'Utilisateur'}, ${email})
      ON CONFLICT (id) DO UPDATE
        SET name = COALESCE(EXCLUDED.name, users.name),
            email = COALESCE(EXCLUDED.email, users.email),
            updated_at = CURRENT_TIMESTAMP
    `;
  } catch (e) {
    console.error('[Auth] Failed to sync user:', e.message);
  }
}

export async function getServerSession(request) {
  let authUser = null;

  // 1. Try cookie-based Neon Auth session first
  const cookie = request.headers.get('cookie');
  if (cookie) {
    try {
      const res = await fetch(`${authUrl}/get-session`, {
        headers: { cookie },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user?.id) {
          authUser = data.user;
        }
      }
    } catch {}
  }

  // 2. Fallback: x-user-id header WITH database validation
  if (!authUser) {
    const headerUserId = request.headers.get('x-user-id');
    if (headerUserId) {
      try {
        const result = await sql`SELECT id, name, email FROM auth_users WHERE id = ${headerUserId}`;
        if (result.length > 0) {
          authUser = { id: headerUserId, name: result[0].name, email: result[0].email };
        }
      } catch {}
    }
  }

  if (authUser) {
    await ensureAppUser(authUser);
    return { data: { user: authUser, session: {} } };
  }

  return null;
}