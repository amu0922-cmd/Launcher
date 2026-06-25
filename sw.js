const CACHE_NAME = 'launcher-cache-v136';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/keiba.png',
  './icons/dbanalysis.png',
  './icons/mytube.png',
  './icons/passvault.png'
];

self.addEventListener('install', function(event){
  /* skip waiting immediately so new SW takes over right away */
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    Promise.all([
      /* claim all clients immediately */
      self.clients.claim(),
      /* delete old caches */
      caches.keys().then(function(keys){
        return Promise.all(
          keys.filter(function(k){ return k !== CACHE_NAME; })
              .map(function(k){ return caches.delete(k); })
        );
      })
    ])
  );
});

self.addEventListener('fetch', function(event){
  const url = event.request.url;
  /* don't cache external API calls */
  if(url.indexOf(location.origin) !== 0){
    return;
  }
  /* network first: always try to get fresh content */
  event.respondWith(
    fetch(event.request).then(function(response){
      /* update cache with fresh response */
      const clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache){
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function(){
      /* offline fallback: use cache */
      return caches.match(event.request);
    })
  );
});

/* handle skipWaiting message from page */
self.addEventListener('message', function(event){
  if(event.data === 'skipWaiting') self.skipWaiting();
});
