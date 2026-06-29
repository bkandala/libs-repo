import { toClassName } from '../../utils/utils.js';

export default function decorate(block) {
  const meta = {};
  [...block.children].forEach((row) => {
    const [keyEl, valEl] = [...row.children];
    const key = toClassName(keyEl?.textContent.trim() || '');
    const val = valEl?.textContent.trim() || '';
    if (key) meta[key] = val;
  });

  const section = block.closest('.section');
  if (!section) return;

  Object.entries(meta).forEach(([key, val]) => {
    if (key === 'style') {
      val.split(',').map((s) => toClassName(s.trim())).filter(Boolean).forEach((cls) => section.classList.add(cls));
    } else if (key === 'background') {
      section.style.background = val;
    } else {
      section.dataset[key] = val;
    }
  });

  block.closest('.section-metadata-wrapper')?.remove();
}
