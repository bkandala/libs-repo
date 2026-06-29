import { createOptimizedPicture } from '../../utils/utils.js';

export default function decorate(block) {
  const [pictureCell, ...contentCells] = [...block.children].map((row) => row.firstElementChild);

  // Background image
  const picture = pictureCell?.querySelector('picture');
  if (picture) {
    block.style.backgroundImage = `url(${picture.querySelector('img')?.src})`;
    pictureCell.remove();
  }

  // Content wrapper
  const content = document.createElement('div');
  content.className = 'marquee-content';
  contentCells.forEach((cell) => {
    if (cell) {
      cell.querySelectorAll('a').forEach((a) => {
        if (a.parentElement?.tagName === 'STRONG') {
          a.classList.add('button', 'primary');
          a.parentElement.replaceWith(a);
        } else if (a.parentElement?.tagName === 'EM') {
          a.classList.add('button', 'secondary');
          a.parentElement.replaceWith(a);
        }
      });
      content.append(cell);
    }
  });

  block.textContent = '';
  block.append(content);
}
