export default function sitemap() {

    const baseUrl = "http://localhost:3000"

    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
      },
      {
        url: `${baseUrl}/sign-in`,
        lastModified: new Date().toISOString(),
      },
      {
        url: `${baseUrl}/sign-up`,
        lastModified: new Date().toISOString(),
      },
    ];
  }