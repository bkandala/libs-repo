import { getMetadata, loadFragment } from '../../utils/utils.js';

export default async function decorate(block) {
  const footerPath = getMetadata('footer') || '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  block.append(footer);
}
