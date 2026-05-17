export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/auth/', '/vendor/', '/api/'] },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://omni.app'}/sitemap.xml`,
  }
}
