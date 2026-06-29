import { createOptimizedPicture } from '../../utils/utils.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'card';
    [...row.children].forEach((col, i) => {
      if (i === 0 && col.querySelector('picture')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-image';
        wrapper.append(col.querySelector('picture'));
        li.append(wrapper);
      } else {
        const body = document.createElement('div');
        body.className = 'card-body';
        body.append(...col.childNodes);
        li.append(body);
      }
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
