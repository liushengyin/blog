var staticCacheName = 'sy-v1';
var contentCache = 'content';
var allCaches = [
  staticCacheName,
  contentCache
];

var urlsToCache = [
  '/',
  './inline.bundle.js',
  './polyfills.bundle.js',
  './styles.bundle.js',
  './vendor.bundle.js',
  './main.bundle.js',
  'index.html',
  '/assets/kitten-small.png',
  '/assets/kitten-medium.png',
  '/assets/kitten-large.png'
];
self.addEventListener('install', function(event) {

  event.waitUntil(
    caches.open(staticCacheName).then(function(cache){
      return cache.addAll(urlsToCache);
    })
  );

});

self.addEventListener('activate', function(event) {

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName){
          return cacheName.startsWith('SY-') && !allCaches.includes(cacheName);
        }).map(function(cacheName){
          return caches.delete(cacheName);
        })
      )
    })
  );

});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.pathname.startsWith('/api/article/')) {
      event.respondWith(serveBlog(event.request));
      return;
  }

  event.respondWith(
    caches.match(event.request).then(function(response){
      return response || fetch(event.request);
    })
  );

});


function serveBlog(request) {
  var storageUrl = request.url;

  return caches.open(contentCache).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      if (response) return response;

      return fetch(request).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});