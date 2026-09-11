export interface OGMetadata {
  title: string
  description: string
  image: string | null
  siteName: string
}

export async function extractOGMetadata(url: string): Promise<OGMetadata> {
  try {
    // Attempt microlink API
    const endpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}`
    const res = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
    })
    if (res.ok) {
      const data = await res.json()
      if (data.status === 'success' && data.data) {
        return {
          title: data.data.title || '',
          description: data.data.description || '',
          image: data.data.image?.url || null,
          siteName: data.data.publisher || 'Social Media',
        }
      }
    }
  } catch (err) {
    console.warn('Microlink fetch error, falling back to direct html fetch:', err)
  }

  // Fallback: direct HTML fetch with regex metadata parsing
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CivilTraceBot/1.0; +https://civiltrace.org)',
      },
    })
    const html = await res.text()

    const getMeta = (property: string) => {
      const match =
        html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
      return match ? match[1] : ''
    }

    return {
      title: getMeta('og:title') || getMeta('twitter:title') || '',
      description: getMeta('og:description') || getMeta('twitter:description') || '',
      image: getMeta('og:image') || getMeta('twitter:image') || null,
      siteName: getMeta('og:site_name') || 'Social Media',
    }
  } catch (err) {
    console.error('Direct OG fetch failed:', err)
    return {
      title: '',
      description: '',
      image: null,
      siteName: 'Unknown',
    }
  }
}
