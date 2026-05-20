// Neon Auth URL for server-side session verification
const authUrl = 'https://ep-purple-fog-amwsyc3j.neonauth.c-5.us-east-1.aws.neon.tech/neondb/auth';

import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const dbUrl = process.env.DATABASE_URL;
const sql = dbUrl ? neon(dbUrl) : null;

export async function getServerSession(request) {
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
          return { data: { user: data.user, session: data.session } };
        }
      }
    } catch {}
  }

  // 2. Fallback: x-user-id header WITH database validation
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId) {
    try {
      const result = await sql`SELECT id FROM auth_users WHERE id = ${headerUserId}`;
      if (result.length > 0) {
        return { data: { user: { id: headerUserId }, session: {} } };
      }
    } catch {}
  }

  return null;
}