// Server-side auth for API routes
// Makes direct HTTP requests to Neon Auth API

const NEON_AUTH_URL = process.env.NEON_AUTH_URL || process.env.VITE_NEON_AUTH_URL;

export async function neonAuthRequest(path: string, body: any) {
  const response = await fetch(`${NEON_AUTH_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  return response.json();
}

export async function signUp({ email, password, name }: { email: string; password: string; name?: string }) {
  return neonAuthRequest('/sign-up/email', {
    email,
    password,
    name,
  });
}

export async function signIn({ email, password }: { email: string; password: string }) {
  return neonAuthRequest('/sign-in/email', {
    email,
    password,
  });
}

export async function getSession() {
  // Session is handled via cookies by the browser
  // For server-side, we would need the session token from the request
  return null;
}

