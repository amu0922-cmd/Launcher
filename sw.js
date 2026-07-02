const CACHE_NAME = 'launcher-cache-v149';
/* index.htmlはキャッシュしない — 常に最新版をネットワークから取得 */
const STATIC_ASSETS = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/keiba.png',
  './icons/dbanalysis.png',
  './icons/mytube.png',
  './icons/passvault.png'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
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
  /* 外部APIはスルー */
  if(url.indexOf(self.location.origin) !== 0) return;

  /* index.htmlは常にネットワーク優先、失敗時はキャッシュ */
  if(url.endsWith('/') || url.includes('index.html')){
    event.respondWith(
      fetch(event.request, {cache: 'no-cache'}).catch(function(){
        return caches.match(event.request);
      })
    );
    return;
  }

  /* その他の静的ファイルはキャッシュ優先 */
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request).then(function(res){
        const clone = res.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
        return res;
      });
    })
  );
});

self.addEventListener('message', function(event){
  if(event.data === 'skipWaiting') self.skipWaiting();
});
