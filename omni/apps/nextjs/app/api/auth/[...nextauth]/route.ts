// Auth handler placeholder
// To be implemented with proper Neon Auth setup

export async function GET(request: Request) {
  return new Response(JSON.stringify({ error: "Not configured" }), {
    status: 501,
    headers: { "Content-Type": "application/json" }
  });
}

export async function POST(request: Request) {
  return new Response(JSON.stringify({ error: "Not configured" }), {
    status: 501,
    headers: { "Content-Type": "application/json" }
  });
}