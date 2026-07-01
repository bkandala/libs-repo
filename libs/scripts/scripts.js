/**
 * Shared page-load pipeline.
 * Consuming repos can import individual exports or call loadPage() directly.
 *
 * Usage in consuming repo:
 *   import { loadPage } from 'https://main--libs-repo--<org>.aem.live/libs/scripts/scripts.js';
 *   loadPage({ libsUrl: 'https://main--libs-repo--<org>.aem.live/libs' });
 */

import {
  setConfig,
  getConfig,
  sampleRUM,
  loadArea,
  loadStyle,
  loadScript,
  loadFragment,
  getMetadata,
} from '../utils/utils.js';

// ---------------------------------------------------------------------------
// Header & Footer
// ---------------------------------------------------------------------------

async function loadHeader(header) {
  const { base } = getConfig();
  const headerBlock = document.createElement('div');
  headerBlock.className = 'header block';
  headerBlock.dataset.blockName = 'header';
  headerBlock.dataset.blockStatus = 'initialized';
  header.append(headerBlock);

  const { default: init } = await import(`${base}/blocks/header/header.js`);
  await init(headerBlock);
  headerBlock.dataset.blockStatus = 'loaded';
}

async function loadFooter(footer) {
  const { base } = getConfig();
  const footerBlock = document.createElement('div');
  footerBlock.className = 'footer block';
  footerBlock.dataset.blockName = 'footer';
  footerBlock.dataset.blockStatus = 'initialized';
  footer.append(footerBlock);

  const { default: init } = await import(`${base}/blocks/footer/footer.js`);
  await init(footerBlock);
  footerBlock.dataset.blockStatus = 'loaded';
}

// ---------------------------------------------------------------------------
// Phases
// ---------------------------------------------------------------------------

async function loadEager(doc, config) {
  document.documentElement.lang = config.locale?.ietf || 'en';

  // Inject shared styles
  loadStyle(`${config.base}/styles/styles.css`);

  const main = doc.querySelector('main');
  if (main) await loadArea(main);

  sampleRUM('top');
  window.addEventListener('load', () => sampleRUM('load'));
}

async function loadLazy(doc, config) {
  const header = doc.querySelector('header');
  const footer = doc.querySelector('footer');

  if (header) loadHeader(header);
  if (footer) loadFooter(footer);

  loadStyle(`${config.base}/styles/lazy-styles.css`);
  loadScript(`${config.codeRoot}/scripts/sidekick.js`, { defer: '' });

  const hash = window.location.hash;
  if (hash) doc.getElementById(hash.slice(1))?.scrollIntoView();
}

function loadDelayed(config) {
  window.setTimeout(() => {
    // Load analytics / martech / etc after 3 s
    const delayedPath = `${config.codeRoot}/scripts/delayed.js`;
    import(delayedPath).catch(() => { /* optional file */ });
  }, 3000);
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Initialise the page.
 * @param {object} conf  Merged into setConfig — must include at minimum:
 *   - libsUrl  : full URL to the shared /libs folder (this repo's AEM live URL)
 *   - codeRoot : '/' or the consuming repo's code root path
 */
export async function loadPage(conf = {}) {
  const config = setConfig(conf);
  await loadEager(document, config);
  await loadLazy(document, config);
  loadDelayed(config);
}

/* Place at the very bottom of scripts.js */
(async function loadDa() {
  if (!new URL(window.location.href).searchParams.get('dapreview')) return;
  // eslint-disable-next-line import/no-unresolved
  import('https://da.live/scripts/dapreview.js').then(({ default: daPreview }) => daPreview(loadPage));
}());


export { loadFragment, getMetadata, loadStyle, loadScript };
