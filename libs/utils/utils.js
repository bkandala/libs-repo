/*
 * Shared Library Utilities
 * Central config/block-loading engine — imported by consuming repos via:
 *   import { setConfig, loadArea } from 'https://main--libs-repo--<org>.aem.live/libs/utils/utils.js';
 */

const PAGE_URL = new URL(window.location.href);

// ---------------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------------

const ENVS = {
  local: { name: 'local' },
  stage: { name: 'stage' },
  prod: { name: 'prod' },
};

export function getEnv(conf = {}) {
  const query = PAGE_URL.searchParams.get('env');
  if (query && ENVS[query]) return { ...ENVS[query], consumer: conf[query] };
  const { host } = window.location;
  if (host.includes('localhost') || host.includes('127.0.0.1')) return { ...ENVS.local, consumer: conf.local };
  if (host.includes('.aem.page') || host.includes('.hlx.page')) return { ...ENVS.stage, consumer: conf.stage };
  return { ...ENVS.prod, consumer: conf.prod };
}

// ---------------------------------------------------------------------------
// Configuration — setConfig / getConfig / updateConfig
// ---------------------------------------------------------------------------

export const [setConfig, updateConfig, getConfig] = (() => {
  let config = {};
  return [
    /** Full replacement — call once at page init */
    (conf) => {
      const origin = conf.origin || window.location.origin;
      config = { env: getEnv(conf), ...conf };
      config.codeRoot = conf.codeRoot ? `${origin}${conf.codeRoot}` : origin;
      // base is the root from which ALL shared blocks/styles are resolved.
      // Consuming repos set `libsUrl` to point here; falls back to their own origin.
      config.base = config.libsUrl || config.codeRoot;
      return config;
    },
    /** Partial update — merge extra keys after init */
    (conf) => { config = { ...config, ...conf }; return config; },
    /** Read current config */
    () => config,
  ];
})();

// ---------------------------------------------------------------------------
// Style & Script loading helpers
// ---------------------------------------------------------------------------

export function loadStyle(href, callback) {
  if (document.querySelector(`link[href="${href}"]`)) { callback?.(); return; }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  if (callback) link.onload = callback;
  document.head.append(link);
}

export async function loadScript(src, attrs = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

// ---------------------------------------------------------------------------
// Block resolution & loading
// ---------------------------------------------------------------------------

/**
 * Resolves the file path for a block.
 * Resolution order:
 *  1. externalLibs override (per-block base from config.externalLibs)
 *  2. config.base  (libsUrl if consumer provided one, else codeRoot)
 *  3. config.codeRoot (consuming repo's own blocks)
 *
 * Path: ${base}/blocks/${name}/${name}.{js|css}
 */
function getBlockData(block) {
  const name = block.classList[0];
  if (!name) return null;

  const { base, codeRoot, externalLibs = [] } = getConfig();

  // Check external lib overrides (array of { base, blocks[] })
  const externalMatch = externalLibs.find((lib) => lib.blocks?.includes(name));
  const resolvedBase = externalMatch?.base ?? base ?? codeRoot;

  const blockPath = `${resolvedBase}/blocks/${name}/${name}`;
  const hasStyles = !!document.querySelector(`link[href="${blockPath}.css"]`) === false;

  return { blockPath, name, hasStyles };
}

export async function loadBlock(block) {
  const status = block.dataset.blockStatus;
  if (status === 'loading' || status === 'loaded') return block;
  block.dataset.blockStatus = 'loading';

  const data = getBlockData(block);
  if (!data) { block.dataset.blockStatus = 'loaded'; return block; }

  const { blockPath, name } = data;

  try {
    const cssLoaded = new Promise((resolve) => loadStyle(`${blockPath}.css`, resolve));
    const { default: init } = await import(`${blockPath}.js`);
    await Promise.all([cssLoaded, init(block)]);
  } catch (err) {
    console.warn(`[libs] Failed to load block "${name}":`, err);
  }

  block.dataset.blockStatus = 'loaded';
  return block;
}

// ---------------------------------------------------------------------------
// DOM decoration helpers
// ---------------------------------------------------------------------------

export function toClassName(name) {
  return typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}

export function toCamelCase(name) {
  return toClassName(name).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export function getMetadata(name, doc = document) {
  const attr = name.includes(':') ? 'property' : 'name';
  return [...doc.head.querySelectorAll(`meta[${attr}="${name}"]`)]
    .map((m) => m.content).join(', ') || '';
}

export function createTag(tag, attrs = {}, html = '') {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (html) el.innerHTML = html;
  return el;
}

export function decorateBlock(block) {
  const name = block.classList[0];
  if (!name) return;
  block.classList.add('block');
  block.dataset.blockName = name;
  block.dataset.blockStatus = 'initialized';
  block.parentElement?.classList.add(`${name}-wrapper`);
  block.closest('.section')?.classList.add(`${name}-container`);
}

export function decorateBlocks(main) {
  main.querySelectorAll('div.section > div > div').forEach(decorateBlock);
}

export function decorateSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((el) => {
      if (el.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = el.tagName !== 'DIV';
        if (defaultContent) wrapper.classList.add('default-content-wrapper');
      }
      wrappers[wrappers.length - 1].append(el);
    });
    wrappers.forEach((w) => section.append(w));
    section.classList.add('section');
    section.dataset.sectionStatus = 'initialized';
    section.style.display = 'none';
  });
}

export function decorateButtons(el = document) {
  el.querySelectorAll('em a, strong a').forEach((a) => {
    const up = a.parentElement;
    if (up.tagName === 'EM') a.classList.add('button', 'secondary');
    if (up.tagName === 'STRONG') a.classList.add('button', 'primary');
    up.replaceWith(a);
  });
}

export function decorateIcons(el = document) {
  const { base } = getConfig();
  el.querySelectorAll('span.icon').forEach((span) => {
    const name = span.className.replace('icon ', '').replace('icon-', '');
    span.innerHTML = `<img src="${base}/img/icons/${name}.svg" alt="${name}">`;
  });
}

export function decoratePictures(main) {
  main.querySelectorAll('img[src*="/media_"]').forEach((img, i) => {
    const picture = img.closest('picture');
    if (!picture) return;
    const source = document.createElement('source');
    source.setAttribute('media', '(min-width: 600px)');
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${img.src}?width=2000&format=webply&optimize=medium`);
    picture.prepend(source);
    img.setAttribute('loading', i === 0 ? 'eager' : 'lazy');
  });
}

export function decorateMain(main) {
  decoratePictures(main);
  decorateButtons(main);
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
}

// ---------------------------------------------------------------------------
// Section / page loading orchestration
// ---------------------------------------------------------------------------

function updateSectionStatus(main) {
  main.querySelectorAll('.section').forEach((section) => {
    if (section.dataset.sectionStatus === 'loaded') return;
    const allLoaded = [...section.querySelectorAll('.block')]
      .every((b) => b.dataset.blockStatus === 'loaded');
    if (allLoaded) {
      section.dataset.sectionStatus = 'loaded';
      section.style.display = null;
    }
  });
}

export async function loadBlocks(main) {
  updateSectionStatus(main);
  const blocks = [...main.querySelectorAll('.block')];
  for (const block of blocks) {
    await loadBlock(block); // eslint-disable-line no-await-in-loop
    updateSectionStatus(main);
  }
}

export async function loadArea(main = document.querySelector('main')) {
  if (!main) return;
  decorateMain(main);
  document.body.classList.add('appear');
  await loadBlocks(main);
}

// ---------------------------------------------------------------------------
// Fragment loader (used by fragment block + header/footer)
// ---------------------------------------------------------------------------

export async function loadFragment(path) {
  if (!path?.startsWith('/')) return null;
  const resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) return null;
  const main = document.createElement('main');
  main.innerHTML = await resp.text();
  decorateMain(main);
  await loadBlocks(main);
  return main;
}

// ---------------------------------------------------------------------------
// Optimized picture helper
// ---------------------------------------------------------------------------

export function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [
  { media: '(min-width: 600px)', width: '2000' },
  { width: '750' },
]) {
  const url = new URL(src, window.location.href);
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);
  const picture = document.createElement('picture');

  breakpoints.forEach((br) => {
    if (br.media) {
      const source = document.createElement('source');
      source.setAttribute('media', br.media);
      source.setAttribute('type', 'image/webp');
      source.setAttribute('srcset', `${pathname}?width=${br.width}&format=webply&optimize=medium`);
      picture.append(source);
    }
  });

  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.append(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      img.setAttribute('src', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.append(img);
    }
  });

  return picture;
}

// ---------------------------------------------------------------------------
// RUM / analytics
// ---------------------------------------------------------------------------

export function sampleRUM(checkpoint, data = {}) {
  window.hlx = window.hlx || {};
  try {
    if (!window.hlx.rum) {
      const usp = new URLSearchParams(window.location.search);
      const weight = usp.get('rum') === 'on' ? 1 : 100;
      const id = Math.random().toString(36).slice(-4);
      window.hlx.rum = { weight, id, origin: window.location.origin };
    }
    const { weight, id, origin } = window.hlx.rum;
    if (Math.random() * weight < 1) {
      const body = JSON.stringify({ weight, id, referer: window.location.href, checkpoint, ...data });
      navigator.sendBeacon(`${origin}/.rum/${weight}`, body);
    }
  } catch (_) { /* noop */ }
}
