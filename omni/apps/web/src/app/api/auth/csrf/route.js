import { randomBytes } from "crypto";

export async function GET(request) {
  const csrfToken = randomBytes(32).toString("hex");

  return new Response(JSON.stringify({ csrfToken }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
