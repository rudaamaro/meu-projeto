/* Página de resumo - exibe informações gerais do deck */

document.addEventListener('DOMContentLoaded', () => {
  const deck = FC.loadDeck();
  const list = document.getElementById('stats');
  list.innerHTML = '';
  const items = [
    `Cartas no deck: ${deck.length}`,
    'Funcionalidades completas podem ser adicionadas conforme necessário.'
  ];
  for (const t of items) {
    const li = document.createElement('li');
    li.textContent = t;
    list.appendChild(li);
  }
});
