/* Página de Lista - mostra todas as cartas em tabela */

document.addEventListener('DOMContentLoaded', () => {
  const deck = FC.loadDeck();
  const tbody = document.querySelector('#deck tbody');
  deck.forEach((card) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${card.hiragana}</td><td>${card.romaji}</td><td>${card.pt}</td>`;
    tbody.appendChild(tr);
  });
});
