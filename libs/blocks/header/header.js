import { getMetadata, loadFragment, createTag } from '../../utils/utils.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function toggleMenu(nav, expanded) {
  nav.setAttribute('aria-expanded', String(expanded));
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
}

function closeAllDrops(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((d) => d.setAttribute('aria-expanded', 'false'));
}

function decorateDrops(navSections) {
  navSections.querySelectorAll(':scope > ul > li').forEach((li) => {
    if (!li.querySelector('ul')) return;
    li.classList.add('nav-drop');
    li.setAttribute('aria-expanded', 'false');
    li.addEventListener('click', (e) => {
      if (!isDesktop.matches) return;
      e.stopPropagation();
      const open = li.getAttribute('aria-expanded') === 'true';
      closeAllDrops(navSections.closest('nav'));
      li.setAttribute('aria-expanded', String(!open));
    });
  });
}

export default async function decorate(block) {
  const navPath = getMetadata('nav') || '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  block.textContent = '';
  const nav = createTag('nav', { id: 'nav', 'aria-expanded': 'false' });

  const [brand, sections, tools] = ['brand', 'sections', 'tools'].map((cls, i) => {
    const el = fragment.children[i] || document.createElement('div');
    el.className = `nav-${cls}`;
    return el;
  });

  // hamburger
  const hamburger = createTag('div', { class: 'nav-hamburger' });
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
    <span class="nav-hamburger-icon"></span>
  </button>`;
  hamburger.querySelector('button').addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    toggleMenu(nav, !open);
  });

  if (sections) decorateDrops(sections.querySelector('ul') ? sections : sections);
  document.addEventListener('click', () => closeAllDrops(nav));

  nav.append(hamburger, brand, sections, tools);

  const navWrapper = createTag('div', { class: 'nav-wrapper' });
  navWrapper.append(nav);
  block.append(navWrapper);

  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    closeAllDrops(nav);
  });
}
