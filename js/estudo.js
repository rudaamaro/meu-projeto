/* Lógica da página de Estudo - mostra um card por vez */

document.addEventListener('DOMContentLoaded', () => {
  const { cvs, ctx } = FC.setupCanvas();
  const deck = FC.loadDeck();
  let index = 0;
  let showAnswer = false;
  let btn = null;

  function render() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    const cw = cvs.clientWidth;
    const ch = cvs.clientHeight;
    const card = deck[index];

    // Romaji e Hiragana
    ctx.fillStyle = FC.C.text;
    ctx.font = '700 32px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(card.romaji, cw / 2, ch / 2 - 40);

    ctx.fillStyle = FC.C.sub;
    ctx.font = '600 24px system-ui';
    ctx.fillText(card.hiragana, cw / 2, ch / 2);

    // Tradução aparece quando solicitado
    if (showAnswer) {
      ctx.fillStyle = FC.C.accent2;
      ctx.font = '600 24px system-ui';
      ctx.fillText(card.pt, cw / 2, ch / 2 + 40);
    }

    // Botão
    const w = 160;
    const h = 48;
    const x = cw / 2 - w / 2;
    const y = ch - 80;
    const label = showAnswer ? 'Próximo' : 'Mostrar';
    FC.drawButton(ctx, { x, y, w, h, label });
    btn = { x, y, w, h };
  }

  cvs.addEventListener('click', (ev) => {
    const rect = cvs.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      if (showAnswer) {
        index = (index + 1) % deck.length;
        showAnswer = false;
      } else {
        showAnswer = true;
      }
      render();
    }
  });

  render();
});
