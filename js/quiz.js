/* Lógica específica do modo Quiz */

document.addEventListener('DOMContentLoaded', () => {
  const { cvs, ctx } = FC.setupCanvas();
  const deck = FC.loadDeck();
  let current = null;
  let options = [];
  let buttons = [];
  let correctIndex = -1;
  let selected = -1;

  // Gera nova pergunta
  function newQuestion() {
    FC.shuffleInPlace(deck);
    current = deck[0];
    const pool = deck.slice(0, 4).map((c) => c.pt);
    FC.shuffleInPlace(pool);
    options = pool;
    correctIndex = options.indexOf(current.pt);
    selected = -1;
    layout();
    render();
  }

  // Calcula layout dos botões
  function layout() {
    const cw = cvs.clientWidth;
    const ch = cvs.clientHeight;
    const w = Math.min(320, cw - 40);
    const hBtn = 48;
    const startY = ch - (hBtn + 16) * options.length - 40;
    buttons = options.map((label, i) => ({
      x: (cw - w) / 2,
      y: startY + i * (hBtn + 16),
      w,
      h: hBtn,
      label,
    }));
  }

  // Renderização principal
  function render() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    const cw = cvs.clientWidth;

    // Romaji e Hiragana
    ctx.fillStyle = FC.C.text;
    ctx.font = '700 32px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(current.romaji, cw / 2, 24);

    ctx.fillStyle = FC.C.sub;
    ctx.font = '600 24px system-ui';
    ctx.fillText(current.hiragana, cw / 2, 70);

    // Botões
    buttons.forEach((b, i) => {
      let fill = FC.C.accent;
      if (selected !== -1) {
        fill = i === correctIndex ? FC.C.accent2 : FC.C.danger;
      }
      FC.drawButton(ctx, { ...b, fill });
    });
  }

  // Trata cliques do usuário
  cvs.addEventListener('click', (ev) => {
    if (selected !== -1) return; // já respondido
    const rect = cvs.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    buttons.forEach((b, i) => {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        selected = i;
        render();
        setTimeout(newQuestion, 1000);
      }
    });
  });

  newQuestion();
});
