// js/render.js
import { roundRect, drawButton, drawIconButton, drawPill, drawInput, drawProgressBar, drawMultiline, wrapAndDraw } from './canvas-helpers.js';
import {ctx,cvs} from './main.js';
import {C,SIZES} from './constants.js';
import {State,currentCard,stats,deck,dueCards,trainPool} from './state.js';
import {layout} from './layout.js';
import {parseAnswers,tick,incTick} from './utils.js';

export function render(){
  incTick();
  const L=layout();
  ctx.clearRect(0,0,cvs.clientWidth,cvs.clientHeight);

  // Header
  ctx.fillStyle=C.text; ctx.font='700 18px system-ui'; ctx.textAlign='left'; ctx.textBaseline='top'; ctx.fillText('Flashcards JP↔PT — Canvas', L.pad, 14);
  drawIconButton({x:L.gear.x,y:L.gear.y,w:L.gear.w || 40,h:L.gear.h || 36},'⚙');

  const pct=Math.max(0,Math.min(1,(stats.studiedToday||0)/(stats.dailyGoal||20)));
  drawProgressBar(L.bar.x,L.bar.y+26,Math.min(420,L.bar.w*0.55),16,pct);
  roundRect(L.streakBox.x,L.streakBox.y,L.streakBox.w,L.streakBox.h,12); ctx.fillStyle='#0f1422'; ctx.fill(); ctx.strokeStyle=C.stroke; ctx.stroke(); ctx.fillStyle=C.sub; ctx.font='600 12px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(`Streak: ${stats.streak||0} dia(s)`, L.streakBox.x+L.streakBox.w/2, L.streakBox.y+L.streakBox.h/2);
  roundRect(L.card.x,L.card.y,L.card.w,L.card.h,20); ctx.fillStyle=C.card; ctx.fill(); ctx.strokeStyle=C.stroke; ctx.stroke();

  if(State.mode==='menu'){
    ctx.fillStyle=C.sub; ctx.font='500 16px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('Clique em ESTUDAR, TREINAR, QUIZ ou ⚙ para ADICIONAR.', L.card.x+L.card.w/2, L.card.y+L.card.h/2);
  }

  if(State.mode==='study'||State.mode==='train'){
    if(State.mode==='train' && L.trainPills){ for(const p of L.trainPills) drawPill(p); }

    if(!currentCard){
      ctx.fillStyle=C.sub; ctx.font='500 16px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const msg = (State.mode==='study')?'Nenhum card devido agora. Use TREINAR/QUIZ ou volte depois.':(trainPool().length? 'Escolha "Verificar" após digitar sua resposta.':'Nenhum card nessa categoria. Troque o filtro.');
      ctx.fillText(msg, L.card.x+L.card.w/2, L.card.y+L.card.h/2);
    } else {
      const startY = L.card.y + (State.mode==='train' ? 72 : 28);
      ctx.fillStyle=C.text;
      ctx.font = `700 ${Math.max(SIZES.hiraganaStudyMin, Math.floor(L.card.h * SIZES.hiraganaStudyFactor))}px system-ui`;
      ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(currentCard.hiragana, L.card.x+L.card.w/2, startY);

      ctx.fillStyle=C.sub; ctx.font='600 22px system-ui';
      const ry=startY+Math.max(SIZES.hiraganaStudyMin, Math.floor(L.card.h*SIZES.hiraganaStudyFactor))+8;
      ctx.fillText(currentCard.romaji, L.card.x+L.card.w/2, ry);

      let afterY=ry+36;
      if(State.showAnswer){
        const answers=parseAnswers(currentCard.pt);
        ctx.fillStyle=C.sub; ctx.font='600 14px system-ui'; ctx.fillText('Respostas aceitas:', L.card.x+L.card.w/2, afterY);
        ctx.fillStyle=C.text; ctx.font='800 20px system-ui'; ctx.fillText(answers.join(' / '), L.card.x+L.card.w/2, afterY+20);
        afterY+=56;
      }
      const ansY=Math.min(L.card.y+L.card.h-120,afterY+16);
      ctx.fillStyle=C.sub; ctx.font='600 14px system-ui'; ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.fillText('Tradução (PT-BR) — digite e pressione Enter:', L.card.x+24, ansY-36);
      const inp={x:L.card.x+24,y:ansY-24,w:L.card.w-48-150,h:48,label:'',value:State.input,placeholder:'ex.: olá; boa tarde',focused:true};
      drawInput(inp);
    }
  }

  if(State.mode==='add'){
    ctx.fillStyle=C.text; ctx.font='700 20px system-ui'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('Adicionar novo card', L.card.x+L.card.w/2, L.card.y+24);
    for(const i of L.inputs) drawInput(i);
    ctx.fillStyle=C.sub; ctx.font='500 13px system-ui'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('Dica: separe sinônimos com ;  (ex.: olá; boa tarde)', L.card.x+L.card.w/2, L.card.y+L.card.h-96);
  }

  if(State.mode==='bulk'){
    ctx.fillStyle=C.text; ctx.font='700 20px system-ui'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('Importar em massa (colar lista)', L.card.x+L.card.w/2, L.card.y+24);
    ctx.fillStyle=C.sub; ctx.font='500 14px system-ui'; ctx.textAlign='left'; ctx.textBaseline='top';
    const guide=['Formato por linha: hiragana ; romaji ; tradução1 ; tradução2 ...','Ex.: こんにちは ; konnichiwa ; olá ; boa tarde','Você pode usar TAB no lugar de ponto e vírgula.','Atalho: Ctrl+V para colar. Depois clique em "Adicionar tudo".'];
    let gy=L.card.y+64; for(const g of guide){ctx.fillText('• '+g, L.card.x+24, gy); gy+=22;}
    const boxX=L.card.x+24, boxY=gy+8, boxW=L.card.w-48, boxH=Math.max(120,L.card.h-(boxY-L.card.y)-88);
    roundRect(boxX,boxY,boxW,boxH,12); ctx.fillStyle='#0f1422'; ctx.fill(); ctx.strokeStyle=C.stroke; ctx.stroke();
    ctx.fillStyle=State.bulkText?C.text:'rgba(231,238,247,0.4)'; ctx.font='500 14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'; ctx.textAlign='left'; ctx.textBaseline='top';
    const text=State.bulkText||'Cole aqui com Ctrl+V...'; drawMultiline(text, boxX+12, boxY+12, boxW-24, 18);
  }

  if(State.mode==='summary'){
    ctx.fillStyle=C.text; ctx.font='700 20px system-ui'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('Resumo do dia', L.card.x+L.card.w/2, L.card.y+24);
    ctx.textAlign='left'; ctx.font='600 16px system-ui'; ctx.fillStyle=C.sub;
    const Ls=[`Cards estudados hoje: ${stats.studiedToday||0}`,`Meta diária: ${stats.dailyGoal||20}`,`Streak atual: ${stats.streak||0} dia(s)`,`Cards no deck: ${deck.length}`,`Cards devidos agora: ${dueCards().length}`];
    let yy=L.card.y+80; for(const t of Ls){ctx.fillText(t,L.card.x+24,yy); yy+=28;}
  }

  if(State.mode==='quiz'){
    const q=State.quiz;
    ctx.fillStyle=C.text; ctx.font='700 22px system-ui'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('Quiz — escolha a tradução correta', L.card.x+L.card.w/2, L.card.y+20);
    if(!q.current){
      ctx.fillStyle=C.sub; ctx.font='500 16px system-ui'; ctx.fillText('Sem cartas suficientes. Adicione ⚙ algumas e volte ao Quiz.', L.card.x+L.card.w/2, L.card.y+L.card.h/2);
    } else {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const romajiSize = Math.max(32, Math.floor(L.card.h * 0.18));
      const romajiY = L.card.y + 70;
      ctx.fillStyle = C.text;
      ctx.font = `800 ${romajiSize}px system-ui`;
      ctx.fillText(q.current.romaji, L.card.x + L.card.w/2, romajiY);
      const m = ctx.measureText(q.current.romaji);
      const romajiH = (m.actualBoundingBoxAscent || romajiSize * 0.8) + (m.actualBoundingBoxDescent || romajiSize * 0.2);
      const hiraganaY = romajiY + romajiH + 8 + SIZES.hiraganaQuizOffset;
      ctx.fillStyle = C.sub;
      ctx.font = `600 ${SIZES.hiraganaQuizPx}px system-ui`;
      ctx.fillText(q.current.hiragana, L.card.x + L.card.w/2, hiraganaY);
    }
  }

  if(State.message){
    ctx.fillStyle='rgba(0,0,0,0.5)';
    const mw=Math.min(640,cvs.clientWidth-40);
    const mx=(cvs.clientWidth-mw)/2, my=cvs.clientHeight-64;
    roundRect(mx,my,mw,40,12); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.stroke();
    ctx.fillStyle=C.text; ctx.font='600 14px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(State.message, mx+mw/2, my+20);
  }

  const L2=layout(); for(const b of L2.buttons) drawButton(b);
  requestAnimationFrame(render);
}
