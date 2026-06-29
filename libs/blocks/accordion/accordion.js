export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [summaryEl, detailEl] = [...row.children];
    if (!summaryEl || !detailEl) return;

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.innerHTML = summaryEl.innerHTML;

    const content = document.createElement('div');
    content.className = 'accordion-content';
    content.innerHTML = detailEl.innerHTML;

    details.append(summary, content);
    row.replaceWith(details);
  });
}
