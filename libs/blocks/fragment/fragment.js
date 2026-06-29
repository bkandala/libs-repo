import { loadFragment } from '../../utils/utils.js';

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link?.getAttribute('href') || block.textContent.trim();
  const fragment = await loadFragment(path);
  if (!fragment) return;

  const section = fragment.querySelector(':scope .section');
  if (section) {
    block.closest('.section')?.classList.add(...section.classList);
    block.replaceWith(...section.childNodes);
  }
}
