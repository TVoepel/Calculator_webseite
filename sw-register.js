if ('serviceWorker' in navigator) {
  // Resolve sw.js relative to this script's own location (not the including
  // page's URL), so pages under /nl/ and /fr/ still register the root sw.js.
  const swUrl = new URL('sw.js', document.currentScript.src).href;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl).catch(() => {});
  });
}
