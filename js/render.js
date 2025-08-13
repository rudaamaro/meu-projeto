import { ctx, cvs, syncMobileInput } from './main.js';
import { C, SIZES } from './constants.js';
import { layout } from './layout.js';
import { fitTextToWidth, parseAnswers, incTick } from './utils.js';
import { State, currentCard, stats, trainPool } from './state.js';
import { drawButton, drawInput, drawProgressBar, roundRect } from './canvas-helpers.js';

export function render(){
  incTick();
  const L = layout();
  ctx.clearRect(0,0,cvs.clientWidth,cvs.clientHeight);

  // === HEADER (sempre abaixo de safeTop) ===
  ctx.fillStyle = C.text;
  ctx.font = '700 18px system-ui';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Flashcards JP↔PT — Canvas', L.pad, L.safeTop - 26);

  const pct = Math.max(0, Math.min(1, (stats.studiedToday||0)/(stats.dailyGoal||20)));
  drawProgressBar(L.bar.x, L.bar.y, L.bar.w, L.bar.h, pct);

  // streak pill
  roundRect(L.streakBox.x, L.streakBox.y, L.streakBox.w, L.streakBox.h, 12);
  ctx.fillStyle = '#0f1422'; ctx.fill();
  ctx.strokeStyle = C.stroke; ctx.stroke();
  ctx.fillStyle = C.sub;
  ctx.font = '600 12px system-ui';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`Streak: ${stats.streak||0} dia(s)`, L.streakBox.x + L.streakBox.w/2, L.streakBox.y + L.streakBox.h/2);

  // === CARD ===
  roundRect(L.card.x, L.card.y, L.card.w, L.card.h, 20);
  ctx.fillStyle = C.card; ctx.fill();
  ctx.strokeStyle = C.stroke; ctx.stroke();

  // === CONTEÚDO ===
  if (State.mode==='study' || State.mode==='train'){
    const cardW = L.card.w, cardH = L.card.h;

    if (!currentCard){
      ctx.fillStyle=C.sub; ctx.font='500 16px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const msg = (State.mode==='study') ? 'Nenhum card devido agora. Use TREINAR/QUIZ ou volte depois.'
                                         : (trainPool().length ? 'Escolha "Verificar" após digitar sua resposta.' : 'Nenhum card nessa categoria. Troque o filtro.');
      ctx.fillText(msg, L.card.x+cardW/2, L.card.y+cardH/2);
      State.lastInputRect = null;
      syncMobileInput(null);
    } else {
      // Hiragana responsivo (máx 88% da largura do card)
      const glyphMax = fitTextToWidth(ctx, currentCard.hiragana, cardW*0.88, Math.floor(cardH*0.22), 18, '700');
      ctx.font = `700 ${glyphMax}px system-ui`;
      ctx.fillStyle = C.text;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const glyphY = L.card.y + 28;
      ctx.fillText(currentCard.hiragana, L.card.x + cardW/2, glyphY);

      // Romaji abaixo, menor e com respiro
      const romajiMax = fitTextToWidth(ctx, currentCard.romaji, cardW*0.8, Math.floor(cardH*0.16), 14, '600');
      ctx.font = `600 ${romajiMax}px system-ui`;
      ctx.fillStyle = C.sub;
      const romajiY = glyphY + glyphMax + 10;
      ctx.fillText(currentCard.romaji, L.card.x + cardW/2, romajiY);

      // Label PT-BR + Input com mais afastamento
      let afterY = romajiY + Math.max(28, Math.floor(romajiMax*0.9));
      const ansY = Math.min(L.card.y + cardH - 120, afterY + 24);

      ctx.fillStyle = C.sub;
      ctx.font = '600 14px system-ui';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Tradução (PT-BR) — digite e pressione Enter:', L.card.x+24, ansY-36);

      const inp = { x: L.card.x+24, y: ansY-24, w: cardW-48-150, h: 48, label:'', value:State.input, placeholder:'ex.: olá; boa tarde', focused:true };
      drawInput(inp);
      State.lastInputRect = { ...inp };
      syncMobileInput(State.lastInputRect);

      // Se mostrar respostas aceitas
      if (State.showAnswer){
        const answers = parseAnswers(currentCard.pt);
        ctx.fillStyle=C.sub; ctx.font='600 14px system-ui'; ctx.textAlign='center';
        ctx.fillText('Respostas aceitas:', L.card.x+cardW/2, ansY+32);
        ctx.fillStyle=C.text; ctx.font='800 20px system-ui';
        ctx.fillText(answers.join(' / '), L.card.x+cardW/2, ansY+54);
      }
    }
  }

  if (State.mode==='quiz'){
    const q = State.quiz;
    ctx.fillStyle=C.text; ctx.font='700 22px system-ui'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('Quiz — escolha a tradução correta', L.card.x+L.card.w/2, L.card.y+20);

    if (!q.current){
      ctx.fillStyle=C.sub; ctx.font='500 16px system-ui';
      ctx.fillText('Sem cartas suficientes. Adicione ⚙ algumas e volte ao Quiz.', L.card.x+L.card.w/2, L.card.y+L.card.h/2);
    } else {
      // Romaji gigante? Ajustar para caber em 90% da largura útil
      const innerW = L.card.w * 0.9;
      const maxRomaji = fitTextToWidth(ctx, q.current.romaji, innerW, Math.floor(L.card.h*0.22), 20, '800');
      ctx.font = `800 ${maxRomaji}px system-ui`;
      ctx.fillStyle = C.text;
      const romajiY = L.card.y + 64;
      ctx.fillText(q.current.romaji, L.card.x+L.card.w/2, romajiY);

      const m = ctx.measureText(q.current.romaji);
      const romajiH = (m.actualBoundingBoxAscent||maxRomaji*0.8) + (m.actualBoundingBoxDescent||maxRomaji*0.2);
      const hiraY = romajiY + romajiH + SIZES.hiraganaQuizOffset;
      ctx.fillStyle = C.sub;
      ctx.font = `600 ${SIZES.hiraganaQuizPx}px system-ui`;
      ctx.fillText(q.current.hiragana, L.card.x+L.card.w/2, hiraY);

      // ... (opções e botão Pular permanecem iguais)
    }
  }

  // Botões (se houver)
  const L2 = layout(); for(const b of L2.buttons) drawButton(b);
  requestAnimationFrame(render);
}
