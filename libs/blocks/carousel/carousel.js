export default function decorate(block) {
  const slides = [...block.children].map((row) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.append(...row.childNodes);
    return slide;
  });

  block.textContent = '';

  const track = document.createElement('div');
  track.className = 'carousel-track';
  slides.forEach((s) => track.append(s));

  const prev = document.createElement('button');
  prev.className = 'carousel-btn carousel-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.innerHTML = '&#8249;';

  const next = document.createElement('button');
  next.className = 'carousel-btn carousel-next';
  next.setAttribute('aria-label', 'Next slide');
  next.innerHTML = '&#8250;';

  const dots = document.createElement('div');
  dots.className = 'carousel-dots';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dots.append(dot);
  });

  block.append(prev, track, next, dots);

  let current = 0;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.querySelectorAll('button').forEach((d, i) => d.classList.toggle('active', i === current));
    slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== current)));
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  dots.querySelectorAll('button').forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  goTo(0);

  // keyboard navigation
  block.setAttribute('tabindex', '0');
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });
}
