import { ctx, cvs, syncMobileInput, IS_MOBILE, showBulkTextareaOver, hideBulkTextarea } from './main.js';
import { C, SIZES } from './constants.js';
import {
  roundRect,
  drawIconButton,
  drawButton,
  drawPill,
  drawInput,
  drawProgressBar,
  drawMultiline
} from './canvas-helpers.js';
import { State, currentCard, stats, deck, dueCards, trainPool } from './state.js';
import { layout } from './layout.js';
import { parseAnswers, tick, incTick } from './utils.js';

const clamp = (min, v, max) => Math.max(min, Math.min(v, max));

function fitTextToWidth(text, maxWidth, startPx, weight='800'){
  let px = startPx;
  ctx.font = `${weight} ${px}px system-ui`;
  while (ctx.measureText(text).width > maxWidth && px > 10) {
    px -= 1;
    ctx.font = `${weight} ${px}px system-ui`;
  }
  return px;
}

export function render() {
  incTick();
  const L = layout();
  ctx.clearRect(0, 0, cvs.clientWidth, cvs.clientHeight);

  // Header
  ctx.fillStyle = C.text; ctx.font = '700 18px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Flashcards JP↔PT — Canvas', L.pad, 14);
  drawIconButton({ x: L.gear.x, y: L.gear.y, w: L.gear.w || 40, h: L.gear.h || 36 }, '⚙');

  const pct = Math.max(0, Math.min(1, (stats.studiedToday || 0) / (stats.dailyGoal || 20)));
  drawProgressBar(L.bar.x, L.bar.y + 26, Math.min(420, L.bar.w * 0.55), 16, pct);

  roundRect(L.streakBox.x, L.streakBox.y, L.streakBox.w, L.streakBox.h, 12);
  ctx.fillStyle = '#0f1422'; ctx.fill(); ctx.strokeStyle = C.stroke; ctx.stroke();
  ctx.fillStyle = C.sub; ctx.font = '600 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`Streak: ${stats.streak || 0} dia(s)`, L.streakBox.x + L.streakBox.w / 2, L.streakBox.y + L.streakBox.h / 2);

  roundRect(L.card.x, L.card.y, L.card.w, L.card.h, 20); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.stroke; ctx.stroke();

  if (State.mode === 'menu') {
    ctx.fillStyle = C.sub; ctx.font = '500 16px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Clique em ESTUDAR, TREINAR, QUIZ ou ⚙ para ADICIONAR.', L.card.x + L.card.w / 2, L.card.y + L.card.h / 2);
  }

  if (State.mode === 'study' || State.mode === 'train') {
    if (State.mode === 'train' && L.trainPills) { for (const p of L.trainPills) drawPill(p); }

    if (!currentCard) {
      ctx.fillStyle = C.sub; ctx.font = '500 16px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const msg = (State.mode === 'study')
        ? 'Nenhum card devido agora. Use TREINAR/QUIZ ou volte depois.'
        : (trainPool().length ? 'Escolha "Verificar" após digitar sua resposta.' : 'Nenhum card nessa categoria. Troque o filtro.');
      ctx.fillText(msg, L.card.x + L.card.w / 2, L.card.y + L.card.h / 2);
    } else {
        const startY = L.card.y + (State.mode === 'train' ? 72 : 28) + (IS_MOBILE ? 16 : 0);
        ctx.fillStyle = C.text;
        const base = Math.min(L.card.w, L.card.h);
        const maxHira = Math.floor(L.card.h * 0.10);
        const hiraPx0 = clamp(
          SIZES.hiraganaStudyMin,
          Math.floor(L.card.h * SIZES.hiraganaStudyFactor),
          Math.floor(base * 0.22)
        );
        const hiraPx = Math.min(hiraPx0, maxHira);
        ctx.font = `700 ${hiraPx}px system-ui`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(currentCard.hiragana, L.card.x + L.card.w / 2, startY);
        const mHira = ctx.measureText(currentCard.hiragana);
        const hiraH = (mHira.actualBoundingBoxAscent || hiraPx * 0.8) + (mHira.actualBoundingBoxDescent || hiraPx * 0.2);

        const ry = startY + hiraH + 8;
        const maxRomaji = Math.floor(base * 0.22);
        let romajiPx = Math.min(clamp(14, Math.floor(base * 0.12), Math.floor(base * 0.16)), maxRomaji);
        romajiPx = fitTextToWidth(currentCard.romaji, L.card.w * 0.9, romajiPx, '600');
        ctx.fillStyle = C.sub; ctx.font = `600 ${romajiPx}px system-ui`;
        ctx.fillText(currentCard.romaji, L.card.x + L.card.w / 2, ry);
        const mRoma = ctx.measureText(currentCard.romaji);
        const romajiH = (mRoma.actualBoundingBoxAscent || romajiPx * 0.8) + (mRoma.actualBoundingBoxDescent || romajiPx * 0.2);

        let afterY = ry + romajiH + 14;
      if (State.showAnswer) {
        const answers = parseAnswers(currentCard.pt);
        ctx.fillStyle = C.sub; ctx.font = '600 14px system-ui'; ctx.fillText('Respostas aceitas:', L.card.x + L.card.w / 2, afterY);
        ctx.fillStyle = C.text; ctx.font = '800 20px system-ui'; ctx.fillText(answers.join(' / '), L.card.x + L.card.w / 2, afterY + 20);
        afterY += 56;
      }

        let subtitleY = afterY;
        let inputY = subtitleY + 12;
        const ansY = Math.min(L.card.y + L.card.h - 120, inputY);
        subtitleY = ansY - 12;
        ctx.fillStyle = C.sub; ctx.font = '600 14px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('Tradução (PT-BR) — digite e pressione Enter:', L.card.x + 24, subtitleY);
        const inp = { x: L.card.x + 24, y: ansY, w: L.card.w - 48 - 150, h: 48, label: '', value: State.input, placeholder: 'ex.: olá; boa tarde', focused: true };
        drawInput(inp);
        State.lastInputRect = { ...inp };
        syncMobileInput(State.lastInputRect);
    }
  } else {
    State.lastInputRect = null;
    syncMobileInput(null);
  }

  if (State.mode === 'add') {
    const base = Math.min(L.card.w, L.card.h);
    const titlePx = fitTextToWidth('Adicionar novo card', L.card.w * 0.9, Math.floor(base * 0.10), '700');
    ctx.fillStyle = C.text; ctx.font = `700 ${titlePx}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Adicionar novo card', L.card.x + L.card.w / 2, L.card.y + 24);
    for (const i of L.inputs) drawInput(i);
    ctx.fillStyle = C.sub; ctx.font = '500 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Dica: separe sinônimos com ;  (ex.: olá; boa tarde)', L.card.x + L.card.w / 2, L.card.y + L.card.h - 96);
  }

  if (State.mode === 'bulk') {
    const base = Math.min(L.card.w, L.card.h);
    const titlePx = fitTextToWidth('Importar em massa (colar lista)', L.card.w * 0.9, Math.floor(base * 0.10), '700');
    ctx.fillStyle = C.text; ctx.font = `700 ${titlePx}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Importar em massa (colar lista)', L.card.x + L.card.w / 2, L.card.y + 24);
    ctx.fillStyle = C.sub; ctx.font = '500 14px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    const guide = [
      'Formato por linha: hiragana ; romaji ; tradução1 ; tradução2 ...',
      'Ex.: こんにちは ; konnichiwa ; olá ; boa tarde',
      'Você pode usar TAB no lugar de ponto e vírgula.',
      'Atalho: Ctrl+V para colar. Depois clique em "Adicionar tudo".'
    ];
    let gy = L.card.y + 64; for (const g of guide) { ctx.fillText('• ' + g, L.card.x + 24, gy); gy += 22; }
    const boxX = L.card.x + 24, boxY = gy + 8, boxW = L.card.w - 48, boxH = Math.max(120, L.card.h - (boxY - L.card.y) - 88);
    roundRect(boxX, boxY, boxW, boxH, 12); ctx.fillStyle = '#0f1422'; ctx.fill(); ctx.strokeStyle = C.stroke; ctx.stroke();
    const textRect = { x: boxX + 12, y: boxY + 12, w: boxW - 24, h: boxH - 24 };
    State.lastBulkRect = textRect;
    showBulkTextareaOver(textRect);
    ctx.fillStyle = State.bulkText ? C.text : 'rgba(231,238,247,0.4)';
    ctx.font = '500 14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    const text = State.bulkText || 'Cole aqui com Ctrl+V...'; drawMultiline(text, textRect.x, textRect.y, textRect.w, 18);
  } else {
    State.lastBulkRect = null;
    hideBulkTextarea();
  }

  if (State.mode === 'summary') {
    const base = Math.min(L.card.w, L.card.h);
    const titlePx = fitTextToWidth('Resumo do dia', L.card.w * 0.9, Math.floor(base * 0.10), '700');
    ctx.fillStyle = C.text; ctx.font = `700 ${titlePx}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Resumo do dia', L.card.x + L.card.w / 2, L.card.y + 24);
    ctx.textAlign = 'left'; ctx.font = '600 16px system-ui'; ctx.fillStyle = C.sub;
    const Ls = [
      `Cards estudados hoje: ${stats.studiedToday || 0}`,
      `Meta diária: ${stats.dailyGoal || 20}`,
      `Streak atual: ${stats.streak || 0} dia(s)`,
      `Cards no deck: ${deck.length}`,
      `Cards devidos agora: ${dueCards().length}`
    ];
    let yy = L.card.y + 80; for (const t of Ls) { ctx.fillText(t, L.card.x + 24, yy); yy += 28; }
  }

  if (State.mode === 'quiz') {
    const q = State.quiz;
    const base = Math.min(L.card.w, L.card.h);
    const titlePx = fitTextToWidth('Quiz — escolha a tradução correta', L.card.w * 0.9, Math.floor(base * 0.10), '700');
    ctx.fillStyle = C.text; ctx.font = `700 ${titlePx}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Quiz — escolha a tradução correta', L.card.x + L.card.w / 2, L.card.y + 20);
    if (!q.current) {
      ctx.fillStyle = C.sub; ctx.font = '500 16px system-ui';
      ctx.fillText('Sem cartas suficientes. Adicione ⚙ algumas e volte ao Quiz.', L.card.x + L.card.w / 2, L.card.y + L.card.h / 2);
    } else {
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        const base = Math.min(L.card.w, L.card.h);
        const maxRomaji = Math.floor(base * 0.22);
        let romajiSize = Math.min(clamp(28, Math.floor(L.card.h * 0.18), Math.floor(base * 0.22)), maxRomaji);
        romajiSize = fitTextToWidth(q.current.romaji, L.card.w * 0.9, romajiSize);
        const romajiY = L.card.y + 70;
        ctx.fillStyle = C.text; ctx.font = `800 ${romajiSize}px system-ui`;
      ctx.fillText(q.current.romaji, L.card.x + L.card.w / 2, romajiY);
      const m = ctx.measureText(q.current.romaji);
      const romajiH = (m.actualBoundingBoxAscent || romajiSize * 0.8) + (m.actualBoundingBoxDescent || romajiSize * 0.2);
        const hiraganaY = romajiY + romajiH + 8 + SIZES.hiraganaQuizOffset;
        ctx.fillStyle = C.sub; ctx.font = `600 ${SIZES.hiraganaQuizPx}px system-ui`;
        ctx.fillText(q.current.hiragana, L.card.x + L.card.w / 2, hiraganaY);
    }
  }

  if (State.message) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    const mw = Math.min(640, cvs.clientWidth - 40);
    const mx = (cvs.clientWidth - mw) / 2, my = cvs.clientHeight - 64;
    roundRect(mx, my, mw, 40, 12); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
    ctx.fillStyle = C.text; ctx.font = '600 14px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(State.message, mx + mw / 2, my + 20);
  }

  const L2 = layout();
  if (L2.menuOverlay) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, cvs.clientWidth, cvs.clientHeight);
    roundRect(L2.menuOverlay.x, L2.menuOverlay.y, L2.menuOverlay.w, L2.menuOverlay.h, 12);
    ctx.fillStyle = '#0f1422'; ctx.fill(); ctx.strokeStyle = C.stroke; ctx.stroke();
  }
  for (const b of L2.buttons) drawButton(b);

  requestAnimationFrame(render);
}
