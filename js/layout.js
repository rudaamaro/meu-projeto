import { ctx, cvs, IS_MOBILE, mobileInput } from './main.js';
import { roundRect } from './canvas-helpers.js';
import { C, SIZES } from './constants.js';
import {
  State,
  currentCard,
  deck,
  pickNext,
  pickNextTrain,
  checkAnswer,
  chooseDifficulty,
  addCardFromForm,
  openBulk,
  pasteFromClipboard,
  addBulk,
  deleteSelected,
  sortDeck,
} from './state.js';
import { startQuizQuestion, selectQuizOption, nextQuiz } from './quiz.js';
import { speakJP } from './speech.js';

export function layout() {
    const W = cvs.clientWidth, H = cvs.clientHeight;
    const pad = Math.max(12, Math.floor(W * 0.02));
  const cardW = Math.min(880, W - pad * 2);
  const cardH = Math.min(560, H - pad * 3 - 64);
  const cx = (W - cardW) / 2, cy = pad * 2;

  const buttons = [], clickZones = [], inputs = [];

  // Barra superior
  const bar = { x: pad, y: pad, w: W - pad * 2, h: 20 };
  const prog = { x: bar.x, y: bar.y, w: Math.min(420, bar.w * 0.55), h: 16 };
  const streakBox = { x: bar.x + prog.w + 12, y: bar.y - 2, w: 220, h: 22 };

    // Botões principais
    const topBtnW = IS_MOBILE ? 84 : 112;
    const topBtnH = IS_MOBILE ? 34 : 36;
    const rightBoxW = topBtnW * 5 + 16 * 4;
  const rightBox = { x: W - pad - rightBoxW, y: bar.y - 10, w: rightBoxW, h: topBtnH };

  const btnStudy = { x: rightBox.x, y: rightBox.y, w: topBtnW, h: topBtnH, label: 'Estudar', onClick: () => { State.mode = 'study'; pickNext(); } };
  const btnTrain = { x: rightBox.x + topBtnW + 16, y: rightBox.y, w: topBtnW, h: topBtnH, label: 'Treinar', fill: '#0ea5e9', onClick: () => { State.mode = 'train'; pickNextTrain(); } };
  const btnQuiz  = { x: rightBox.x + (topBtnW + 16) * 2, y: rightBox.y, w: topBtnW, h: topBtnH, label: 'Quiz', fill: '#f59e0b', onClick: () => { State.mode = 'quiz'; startQuizQuestion(); } };
  const btnSum   = { x: rightBox.x + (topBtnW + 16) * 3, y: rightBox.y, w: topBtnW, h: topBtnH, label: 'Resumo', fill: '#8b5cf6', onClick: () => { State.mode = 'summary'; } };
  const btnList  = { x: rightBox.x + (topBtnW + 16) * 4, y: rightBox.y, w: topBtnW, h: topBtnH, label: 'Lista', fill: '#334155', onClick: () => { State.mode = 'manage'; } };
  buttons.push(btnStudy, btnTrain, btnQuiz, btnSum, btnList);

  // Engrenagem (Adicionar)
    const gear = { x: pad, y: H - pad - 40, w: 40, h: 40, onClick: () => { State.mode = 'add'; State.focusField = 'hiragana'; if (IS_MOBILE && mobileInput) { mobileInput.value = State.addForm.hiragana || ''; mobileInput.focus(); const v = mobileInput.value || ''; mobileInput.setSelectionRange(v.length, v.length); } } };
  clickZones.push(gear);

  // Card
  const card = { x: cx, y: cy, w: cardW, h: cardH };

  // UI do Treino: filtro por dificuldade
  let trainPills = [];
  if (State.mode === 'train') {
    const defs = [
      { key: 'todas', label: 'Todas' },
      { key: 'dificil', label: 'Difícil' },
      { key: 'medio',  label: 'Médio'  },
      { key: 'facil',  label: 'Fácil'  },
    ];
    const gap = 10;
    const ph = Math.max(24, Math.floor(cardH * 0.05));
    const pw = Math.max(60, Math.floor((cardW - gap * (defs.length - 1) - 48) / defs.length));
    let px = cx + 24, py = cy + 16;
    for (const p of defs) {
      const pill = { x: px, y: py, w: pw, h: ph, label: p.label, active: State.trainFilter === p.key };
      trainPills.push(pill);
      clickZones.push({ x: pill.x, y: pill.y, w: pw, h: ph, onClick: () => { State.trainFilter = p.key; pickNextTrain(); } });
      px += pw + gap;
    }
  }

  // STUDY & TRAIN
  if (State.mode === 'study' || State.mode === 'train') {
    const btnAudio = { x: cx + cardW - 56, y: cy + 16, w: 40, h: 36, label: '\uD83D\uDD0A', fill: '#243b55', onClick: () => { if (currentCard) speakJP(currentCard.hiragana); } };
    buttons.push(btnAudio);
    if (!State.showAnswer) {
      const btnVer = { x: cx + cardW - 140, y: cy + cardH - 56, w: 120, h: 44, label: 'Verificar', onClick: checkAnswer };
      buttons.push(btnVer);
      const startY = cy + (State.mode === 'train' ? 72 : 28);
      const ry = startY + Math.max(SIZES.hiraganaStudyMin, Math.floor(cardH * SIZES.hiraganaStudyFactor)) + 8;
      let afterY = ry + 36;
      const ansY = Math.min(cy + cardH - 120, afterY + 16);
    } else {
      const bx = cx + cardW - (120 * 3 + 12 * 2) - 16, by = cy + cardH - 56;
      const bHard = { x: bx,                y: by, w: 120, h: 44, label: 'Difícil (1)', fill: C.danger, onClick: () => chooseDifficulty('dificil') };
      const bMed  = { x: bx + 120 + 12,     y: by, w: 120, h: 44, label: 'Médio (2)',  fill: C.warn,   onClick: () => chooseDifficulty('medio')  };
      const bEasy = { x: bx + (120 + 12) * 2, y: by, w: 120, h: 44, label: 'Fácil (3)',  fill: C.accent2, onClick: () => chooseDifficulty('facil')  };
      buttons.push(bHard, bMed, bEasy);
    }
  }

  // ADD
  if (State.mode === 'add') {
    const iw = Math.min(560, cardW - 40);
    const ix = cx + (cardW - iw) / 2;
    const i1 = { x: ix, y: cy + 80,  w: iw, h: 64, label: 'Hiragana',         value: State.addForm.hiragana, placeholder: 'ex.: こんにちは',     focused: State.focusField === 'hiragana' };
    const i2 = { x: ix, y: cy + 160, w: iw, h: 64, label: 'Romaji',           value: State.addForm.romaji,   placeholder: 'ex.: konnichiwa',    focused: State.focusField === 'romaji' };
    const i3 = { x: ix, y: cy + 240, w: iw, h: 64, label: 'Tradução (PT-BR)', value: State.addForm.pt,       placeholder: 'ex.: olá; boa tarde', focused: State.focusField === 'pt' };
    inputs.push(i1, i2, i3);

    const bTab  = { x: ix,         y: cy + 320, w: 120, h: 42, label: 'Tab ↹',                    fill: '#1f2937', onClick: () => { State.focusField = State.focusField === 'hiragana' ? 'romaji' : State.focusField === 'romaji' ? 'pt' : 'hiragana'; } };
    const bAdd  = { x: ix + iw - 200, y: cy + 320, w: 200, h: 42, label: 'Adicionar (Enter)',                      onClick: addCardFromForm };
    const bBulk = { x: ix,         y: cy + 372, w: iw,  h: 44, label: 'Colar lista (Importar em massa)', fill: '#334155', onClick: openBulk };
    buttons.push(bTab, bAdd, bBulk);

    clickZones.push({ x: i1.x, y: i1.y, w: i1.w, h: i1.h, onClick: () => { State.focusField = 'hiragana'; if (IS_MOBILE && mobileInput) { mobileInput.value = State.addForm.hiragana || ''; mobileInput.focus(); const v = mobileInput.value || ''; mobileInput.setSelectionRange(v.length, v.length); } } });
    clickZones.push({ x: i2.x, y: i2.y, w: i2.w, h: i2.h, onClick: () => { State.focusField = 'romaji'; if (IS_MOBILE && mobileInput) { mobileInput.value = State.addForm.romaji || ''; mobileInput.focus(); const v = mobileInput.value || ''; mobileInput.setSelectionRange(v.length, v.length); } } });
    clickZones.push({ x: i3.x, y: i3.y, w: i3.w, h: i3.h, onClick: () => { State.focusField = 'pt'; if (IS_MOBILE && mobileInput) { mobileInput.value = State.addForm.pt || ''; mobileInput.focus(); const v = mobileInput.value || ''; mobileInput.setSelectionRange(v.length, v.length); } } });
  }

  // BULK
  if (State.mode === 'bulk') {
    const bPaste  = { x: cx + 24,             y: cy + cardH - 56, w: 160, h: 44, label: 'Colar (Ctrl+V)',  fill: '#1f2937', onClick: pasteFromClipboard };
    const bAddAll = { x: cx + 24 + 160 + 12,  y: cy + cardH - 56, w: 200, h: 44, label: 'Adicionar tudo',  fill: '#16a34a', onClick: () => addBulk(State.bulkText) };
    const bBack   = { x: cx + cardW - 120 - 24, y: cy + cardH - 56, w: 120, h: 44, label: 'Voltar',        fill: '#374151', onClick: () => { State.mode = 'add'; } };
    buttons.push(bPaste, bAddAll, bBack);
  }

  // MANAGE (Lista)
  if (State.mode === 'manage') {
    const listX = card.x + 16, listY = card.y + 56, listW = card.w - 32, rowH = 36;

    const header = ['#', 'Hiragana', 'Romaji', 'Cat', 'Próx.', 'Ivl(d)', 'EF', '✓', '✗'];
    const cols   = [ 40, 180,        160,      80,    100,     70,      60,  40,  40 ];

    // Barra de cabeçalho
    roundRect(card.x + 16, card.y + 16, listW, 28, 10);
    ctx.fillStyle = '#0f1422'; ctx.fill(); ctx.strokeStyle = C.stroke; ctx.stroke();
    ctx.fillStyle = C.sub; ctx.font = '600 14px system-ui'; ctx.textBaseline = 'middle';

    let xh = listX + 12;
    for (let i = 0; i < header.length; i++) {
      ctx.textAlign = (i === 1 || i === 2) ? 'left' : 'center';
      ctx.fillText(
        header[i],
        (i === 1 || i === 2) ? xh : xh + cols[i] / 2,
        card.y + 30
      );
      xh += cols[i];
    }

    const items = sortDeck ? sortDeck(deck, State.manage.sort) : deck.slice();
    const start = State.manage.page * State.manage.pageSize;
    const end   = Math.min(items.length, start + State.manage.pageSize);

    for (let r = start, row = 0; r < end; r++, row++) {
      const it = items[r];
      const y  = listY + row * rowH;

      if (State.manage.selected === it.id) {
        roundRect(listX, y, listW, rowH - 4, 10);
        ctx.fillStyle = 'rgba(67,182,255,0.12)'; ctx.fill();
      }

      let x = listX + 12;
      ctx.fillStyle = C.text; ctx.font = '500 14px system-ui'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.fillText(String(r + 1), x + cols[0] / 2 - 12, y + rowH / 2);

      x += cols[0];
      ctx.textAlign = 'left';
      const prevFont = ctx.font;
      ctx.font = `500 ${SIZES.hiraganaManagePx}px system-ui`;
      ctx.fillText(it.hiragana, x, y + rowH / 2);
      ctx.font = prevFont;

      x += cols[1]; ctx.textAlign = 'left';   ctx.fillStyle = C.sub;  ctx.fillText(it.romaji, x, y + rowH / 2);
      x += cols[2]; ctx.textAlign = 'center'; ctx.fillStyle = C.text; ctx.fillText((it.cat || 'none'), x + cols[3] / 2 - 10, y + rowH / 2);
      x += cols[3]; ctx.textAlign = 'center';                        ctx.fillText(it.due || '',        x + cols[4] / 2 - 10, y + rowH / 2);
      x += cols[4];                                                 ctx.fillText(String(it.ivl || 0), x + cols[5] / 2 - 10, y + rowH / 2);
      x += cols[5];                                                 ctx.fillText((it.ef || 2.5).toFixed(2), x + cols[6] / 2 - 10, y + rowH / 2);
      x += cols[6]; ctx.fillStyle = '#22c55e';                      ctx.fillText(String(it.ok  || 0), x + cols[7] / 2 - 10, y + rowH / 2);
      x += cols[7]; ctx.fillStyle = '#ef4444';                      ctx.fillText(String(it.err || 0), x + cols[8] / 2 - 10, y + rowH / 2);

      // Seleção da linha
      clickZones.push({ x: listX, y, w: listW, h: rowH - 4, onClick: () => { State.manage.selected = it.id; } });
    }

    const totalPages = Math.max(1, Math.ceil(deck.length / State.manage.pageSize));
    const bPrev = { x: cx + 16,               y: cy + cardH - 56, w: 112, h: 40, label: '◀ Anterior', fill: '#1f2937', onClick: () => { State.manage.page = Math.max(0, State.manage.page - 1); } };
    const bNext = { x: cx + 16 + 112 + 12,    y: cy + cardH - 56, w: 112, h: 40, label: 'Próxima ▶',  fill: '#1f2937', onClick: () => { State.manage.page = Math.min(totalPages - 1, State.manage.page + 1); } };
    const bDel  = { x: cx + cardW - 160 - 16, y: cy + cardH - 56, w: 160, h: 40, label: 'Excluir selecionado', fill: '#dc2626', onClick: deleteSelected };
    buttons.push(bPrev, bNext, bDel);

    ctx.fillStyle = C.sub; ctx.font = '500 12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`Página ${State.manage.page + 1}/${totalPages} — clique numa linha para selecionar`, cx + 16, cy + cardH - 64);
  }

  // QUIZ — define botões/zonas de clique
  if (State.mode === 'quiz') {
    const q = State.quiz;
    if (q.current) {
      const gridPad = 20;
      const bw = (card.w - gridPad * 3) / 2;
      const bh = 56;
      const marginBottom = 24;
      const gap = 12;
      const baseline = card.y + card.h - marginBottom;
      const nextBtnH = 44, volH = 36;
      const nextBtnY = baseline - nextBtnH;
      const volY = baseline - volH;
      const optionsBottom = nextBtnY - gap;
      let ox = card.x + gridPad,
          oy = optionsBottom - (bh * 2 + gridPad);

      for (let i = 0; i < 4; i++) {
        const row = Math.floor(i / 2), col = i % 2;
        const bx = ox + col * (bw + gridPad), by = oy + row * (bh + gridPad);
        const isSel = q.selectedIndex === i;
        const isCorrect = (q.correctIndex === i);
        let fillVar = '#1f2937';
        if (q.selectedIndex !== -1) {
          if (isCorrect) fillVar = C.accent2;
          else if (isSel) fillVar = C.danger;
        }
        buttons.push({ x: bx, y: by, w: bw, h: bh, label: q.options[i] || '—', fill: fillVar, onClick: () => selectQuizOption(i) });
      }

      buttons.push({ x: card.x + card.w - 140, y: nextBtnY, w: 120, h: nextBtnH, label: (q.selectedIndex === -1 ? 'Pular' : 'Próximo ▶'), fill: '#0ea5e9', onClick: nextQuiz });
      buttons.push({ x: card.x + 20, y: volY, w: 40, h: volH, label: '🔊', fill: '#243b55', onClick: () => { speakJP(q.current.hiragana); } });
    }
  }

  return {
    pad,
    bar,
    prog,
    streakBox,
    buttons,
    clickZones,
    card,
    inputs,
    cx,
    cy,
    cardW,
    cardH,
    gear,
    trainPills,
  };
}
