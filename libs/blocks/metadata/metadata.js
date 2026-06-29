import { toClassName } from '../../utils/utils.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [keyEl, valEl] = [...row.children];
    const key = keyEl?.textContent.trim();
    const val = valEl?.innerHTML.trim();
    if (!key || !val) return;

    const meta = document.createElement('meta');
    if (key.includes(':')) {
      meta.setAttribute('property', key);
    } else {
      meta.setAttribute('name', toClassName(key));
    }
    meta.setAttribute('content', valEl?.textContent.trim());
    document.head.append(meta);
  });

  block.closest('.metadata-wrapper')?.remove();
}
