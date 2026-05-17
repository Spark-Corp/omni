let fetchHandler = null;

export default async function handler(request) {
  if (!fetchHandler) {
    try {
      const mod = await import('../build/server/index.js');
      fetchHandler = mod.default.fetch;
    } catch (err) {
      return new Response(`Server build error: ${err.message}`, { status: 500 });
    }
  }
  return fetchHandler(request);
}
