'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"version.json": "fc1950aa8c20fcaad2182e4ee28d3c89",
"index.html": "be201fb04eb7b7c5affd13c63c6b539f",
"/": "be201fb04eb7b7c5affd13c63c6b539f",
"main.dart.js": "77de3c02b5d2285f403f89c098446351",
"flutter.js": "6fef97aeca90b426343ba6c5c9dc5d4a",
"favicon.png": "81b951c210ca3bb2bbc110efa20d80dc",
"icons/Icon-192.png": "81b951c210ca3bb2bbc110efa20d80dc",
"icons/Icon-maskable-192.png": "81b951c210ca3bb2bbc110efa20d80dc",
"icons/Icon-maskable-512.png": "81b951c210ca3bb2bbc110efa20d80dc",
"icons/Icon-512.png": "81b951c210ca3bb2bbc110efa20d80dc",
"manifest.json": "990681db6d915295ef362ca962ef0567",
"assets/AssetManifest.json": "5e670d171af733aceb16c7a2a7d178ec",
"assets/NOTICES": "bcecddae53a6dcb81e124dbbccb15512",
"assets/FontManifest.json": "56a1121a5bc4a1108e8f64ac559e8c4d",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347",
"assets/shaders/ink_sparkle.frag": "f8b80e740d33eb157090be4e995febdf",
"assets/AssetManifest.bin": "32d6cee4bd5f28aa50f016b9e7ec9ced",
"assets/fonts/MaterialIcons-Regular.otf": "8394baba21dedfca99de38736ce4459f",
"assets/assets/images/logo_gubug.jpg": "7471ba5603b2e42593e3599857cc76d5",
"assets/assets/images/menu_image_default.png": "9eb7eeac3cb3340caec2788840f774ee",
"assets/assets/images/vector.png": "75bbb8b2bab0503d530f7d5243cb41e4",
"assets/assets/images/menu_empty.png": "b2ade6982697cb4b55f90c25ea044dfc",
"assets/assets/images/logo_gubug_bg.png": "81b951c210ca3bb2bbc110efa20d80dc",
"assets/assets/images/meja_empty.png": "93717b17899638235bc01f23993f82cb",
"assets/assets/images/dashboard/place.png": "36f52cef32c0972f7c3bcfc2b07ad06d",
"assets/assets/images/dashboard/meja.png": "38aa325a04fea89966712c4c829cbdc9",
"assets/assets/images/dashboard/secure.png": "bd42314ad89d4335039cd76315d0ce81",
"assets/assets/images/dashboard/logout.png": "df9a25ddfd1662343ce2cd32080bcc0b",
"assets/assets/images/dashboard/home.png": "f57db47d10f091d8444fcc4295956854",
"assets/assets/images/dashboard/user.png": "eb3ea152db09869578522cf4bf6b3aac",
"assets/assets/images/dashboard/menu.png": "84280285c99276db354c04caeead6302",
"assets/assets/images/dashboard/transaksi.png": "f296e6decf096fba7ac15a55c7a3e0be",
"assets/assets/images/dashboard/categories.png": "7ce9420e29bbfa27b8e4a8a40d575c6e",
"assets/assets/fonts/poppins.ttf": "093ee89be9ede30383f39a899c485a82",
"assets/assets/fonts/raleway.ttf": "d95649da7dfb965a289ac29105ce8771",
"canvaskit/skwasm.js": "95f16c6690f955a45b2317496983dbe9",
"canvaskit/skwasm.wasm": "1a074e8452fe5e0d02b112e22cdcf455",
"canvaskit/chromium/canvaskit.js": "96ae916cd2d1b7320fff853ee22aebb0",
"canvaskit/chromium/canvaskit.wasm": "be0e3b33510f5b7b0cc76cc4d3e50048",
"canvaskit/canvaskit.js": "bbf39143dfd758d8d847453b120c8ebb",
"canvaskit/canvaskit.wasm": "42df12e09ecc0d5a4a34a69d7ee44314",
"canvaskit/skwasm.worker.js": "51253d3321b11ddb8d73fa8aa87d3b15"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
