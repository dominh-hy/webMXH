const CACHE_VERSION = 'mxh-mobile-v1'
const ARTICLE_CACHE = `${CACHE_VERSION}-articles`
const STATIC_CACHE = `${CACHE_VERSION}-static`
const STATIC_ASSETS = ['/', '/manifest.json', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('mxh-mobile-') && !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const sameOrigin = url.origin === self.location.origin

  if (request.mode === 'navigate' && sameOrigin && url.pathname.startsWith('/bai-viet/')) {
    event.respondWith(cacheArticlePage(request))
    return
  }

  if (sameOrigin && (url.pathname.startsWith('/_next/static/') || url.pathname === '/manifest.json' || url.pathname === '/icon.svg')) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE))
  }
})

async function cacheArticlePage(request) {
  const cache = await caches.open(ARTICLE_CACHE)

  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return caches.match('/')
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached)

  return cached || network
}
