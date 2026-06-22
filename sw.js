const CACHE_NAME = 'launcher-cache-v106';
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
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
});

self.addEventListener('fetch', function(event){
  const url = event.request.url;
  // Don't cache external API calls (weather, search, geocoding)
  if(url.indexOf(location.origin) !== 0){
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request);
    })
  );
});
