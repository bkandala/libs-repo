export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      col.className = 'column';
      const pic = col.querySelector('picture');
      if (pic && pic.parentElement === col) {
        const wrapper = document.createElement('div');
        wrapper.className = 'column-image';
        wrapper.append(pic);
        col.prepend(wrapper);
      }
    });
  });
}
