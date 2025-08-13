import {loadDeck,saveDeck,loadStats,saveStats} from './storage.js';
import {parseAnswers,normalizeBasic} from './utils.js';
import {todayStr,applyRollover} from './date-utils.js';
import {schedule} from './srs.js';

export let deck=loadDeck(); export let stats=loadStats();
applyRollover(stats,saveStats);

export const State={
  mode:'menu',
  input:'',
  showAnswer:false,
  focusField:null,
  addForm:{hiragana:'',romaji:'',pt:''},
  message:'',
    manage:{page:0,pageSize:10,selected:null,sort:'due'},
    bulkText:'',
    trainFilter:'todas',
    quiz:{current:null, options:[], correctIndex:-1, selectedIndex:-1},
    lastInputRect:null
  };

export let currentCard=null;

export function dueCards(){const t=todayStr(); return deck.filter(c => (c.due||t) <= t);} 
export function pickNext(){ const p=dueCards(); currentCard=p.length?p[Math.floor(Math.random()*p.length)]:null; State.input=''; State.showAnswer=false; }
export function trainPool(){ if(State.trainFilter==='todas') return deck; return deck.filter(c=>c.cat===State.trainFilter); }
export function pickNextTrain(){ const pool=trainPool(); currentCard=pool.length?pool[Math.floor(Math.random()*pool.length)]:null; State.input=''; State.showAnswer=false; }

const pasteArea = typeof document !== 'undefined'
  ? (() => {
      const ta = document.createElement('textarea');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      document.body.appendChild(ta);
      return ta;
    })()
  : null;

export function addCardFromForm(){
  const f=State.addForm;
  if(!f.hiragana.trim()||!f.romaji.trim()||!f.pt.trim()){State.message='Preencha todos os campos';return;}
  const combo=`${f.hiragana.trim()}|${f.romaji.trim().toLowerCase()}`;
  const dup=deck.some(c=>`${(c.hiragana||'').trim()}|${(c.romaji||'').toLowerCase().trim()}`===combo);
  if(dup){State.message='Já existe um card com esse Hiragana+Romaji';return;}
  const id=String(Date.now());
  const ptStore=f.pt.trim().toLowerCase().replace(/\s*([;|,])\s*/g,'|');
  deck.push({id:id,hiragana:f.hiragana.trim(),romaji:f.romaji.trim().toLowerCase(),pt:ptStore,due:todayStr(),ef:2.5,ivl:0,reps:0,ok:0,err:0,cat:'none'});
  saveDeck(deck);
  State.addForm={hiragana:'',romaji:'',pt:''};
  State.focusField='hiragana';
  State.message='Card adicionado! (Dica: sinônimos com ;)';
}

export function checkAnswer(){
  if(!currentCard)return;
  const ok=parseAnswers(currentCard.pt).includes(normalizeBasic(State.input));
  State.showAnswer=true;
  State.message= ok?'✔ Correto! Escolha a dificuldade.':'✘ Quase! Veja as respostas e marque a dificuldade.';
}

export function chooseDifficulty(level){
  if(!currentCard) return;
  currentCard.cat = level;
  saveDeck(deck);

  if(State.mode==='study'){
    const g = (level==='dificil')?0:(level==='medio')?1:2;
    const ok = parseAnswers(currentCard.pt).includes(normalizeBasic(State.input));
    if(ok) currentCard.ok=(currentCard.ok||0)+1; else currentCard.err=(currentCard.err||0)+1;
    schedule(currentCard,g);
    saveDeck(deck);
    stats.studiedToday=(stats.studiedToday||0)+1; stats.lastStudy=todayStr(); if(!stats.streak)stats.streak=1; saveStats(stats);
    pickNext();
  } else {
    pickNextTrain();
  }
}

export function openBulk(){State.mode='bulk'; State.bulkText=''; State.message='Cole sua lista com Ctrl+V';}
export function pasteFromClipboard(){
  if(!pasteArea) return;
  pasteArea.value='';
  pasteArea.focus();
  setTimeout(()=>{State.bulkText=pasteArea.value; State.message='Texto colado!';},10);
}
export function parseBulk(text){const out=[]; const lines=(text||'').split(/\r?\n/); for(let line of lines){line=line.trim(); if(!line)continue; const parts=line.split(/\t|\s*;\s*/).map(s=>s.trim()).filter(Boolean); if(parts.length<3)continue; const [hiragana,romaji,...rest]=parts; const trs=rest.join(';'); out.push({hiragana:hiragana,romaji:romaji,pt:trs});} return out;}
export function addBulk(text){
  const items=parseBulk(text); if(!items.length){State.message='Nada válido encontrado';return;}
  let added=0,skipped=0;
  const existing=new Set(deck.map(c=>`${(c.hiragana||'').trim()}|${(c.romaji||'').toLowerCase().trim()}`));
  const seen=new Set();
  for(const it of items){
    const key=`${(it.hiragana||'').trim()}|${(it.romaji||'').toLowerCase().trim()}`;
    if(!it.hiragana||!it.romaji){skipped++;continue;}
    if(existing.has(key)||seen.has(key)){skipped++;continue;}
    const id=String(Date.now()+Math.floor(Math.random()*9999));
    const ptStore=(it.pt||'').toLowerCase().replace(/\s*([;|,])\s*/g,'|');
    deck.push({id:id,hiragana:it.hiragana.trim(),romaji:(it.romaji||'').toLowerCase().trim(),pt:ptStore,due:todayStr(),ef:2.5,ivl:0,reps:0,ok:0,err:0,cat:'none'});
    existing.add(key); seen.add(key); added++;
  }
  saveDeck(deck);
  State.message=`Importados: ${added}. Ignorados (duplicados): ${skipped}.`;
}

export function deleteSelected(){const id=State.manage.selected; if(!id){State.message='Selecione um item';return;} deck=deck.filter(c=>c.id!==id); saveDeck(deck); State.manage.selected=null; State.message='Card removido.';}
export function sortDeck(items,key){const a=items.slice(); a.sort((x,y)=>{if(key==='due'){return (x.due||'')<(y.due||'')?-1:1;} if(key==='ok'){return (y.ok||0)-(x.ok||0);} if(key==='err'){return (y.err||0)-(x.err||0);} if(key==='cat'){return (x.cat||'').localeCompare(y.cat||'');} return x.hiragana.localeCompare(y.hiragana);}); return a;}
