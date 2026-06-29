export default function decorate(block) {
  const table = document.createElement('table');
  [...block.children].forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const td = document.createElement(rowIndex === 0 ? 'th' : 'td');
      td.innerHTML = cell.innerHTML;
      if (rowIndex === 0) td.setAttribute('scope', 'col');
      tr.append(td);
    });
    if (rowIndex === 0) {
      const thead = document.createElement('thead');
      thead.append(tr);
      table.append(thead);
    } else {
      let tbody = table.querySelector('tbody');
      if (!tbody) { tbody = document.createElement('tbody'); table.append(tbody); }
      tbody.append(tr);
    }
  });
  block.textContent = '';
  block.append(table);
}
