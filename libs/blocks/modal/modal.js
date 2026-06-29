import { loadFragment, createTag } from '../../utils/utils.js';

let currentModal = null;

function closeModal() {
  if (!currentModal) return;
  currentModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentModal = null;
}

function openModal(modal) {
  closeModal();
  currentModal = modal;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal-close')?.focus();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

export default async function decorate(block) {
  const link = block.querySelector('a');
  if (!link) return;

  const path = link.getAttribute('href');
  const trigger = link.textContent.trim();
  block.textContent = '';

  // Trigger button
  const btn = createTag('button', { class: 'button primary modal-trigger' }, trigger);
  block.append(btn);

  // Modal shell (lazy-load content on first open)
  const overlay = createTag('div', { class: 'modal-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-hidden': 'true' });
  const dialog = createTag('div', { class: 'modal-dialog' });
  const closeBtn = createTag('button', { class: 'modal-close', 'aria-label': 'Close' }, '&times;');
  const content = createTag('div', { class: 'modal-content' });

  dialog.append(closeBtn, content);
  overlay.append(dialog);
  document.body.append(overlay);

  let loaded = false;
  btn.addEventListener('click', async () => {
    if (!loaded) {
      const fragment = await loadFragment(path);
      if (fragment) content.append(...fragment.children);
      loaded = true;
    }
    openModal(overlay);
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
}
