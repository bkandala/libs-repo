(() => {
  const { host } = window.location;
  const isDev = host.includes('localhost') || host.includes('.aem.page') || host.includes('.hlx.page') || host.includes('.aem.live');
  if (!isDev) return;
  const s = document.createElement('script');
  s.src = 'https://www.aem.live/tools/sidekick/loader.js';
  s.setAttribute('data-config-id', window.location.origin);
  document.head.append(s);
})();
