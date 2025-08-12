import {deck,State} from './state.js';
import {parseAnswers,normalizeBasic,shuffleInPlace} from './utils.js';

export function startQuizQuestion(){
  if(deck.length===0){ State.quiz={current:null,options:[],correctIndex:-1,selectedIndex:-1}; return; }
  const idx=Math.floor(Math.random()*deck.length);
  const card=deck[idx];
  const answers=parseAnswers(card.pt);
  const correctPT = answers[Math.floor(Math.random()*Math.max(1,answers.length))] || '';

  const pool = deck.filter((c,i)=> i!==idx && parseAnswers(c.pt).length>0);
  shuffleInPlace(pool);
  const distractors = [];
  const used = new Set([normalizeBasic(correctPT)]);
  for(const c of pool){
    if(distractors.length>=3) break;
    const list=parseAnswers(c.pt);
    if(list.length===0) continue;
    const pick=list[Math.floor(Math.random()*list.length)];
    const norm=normalizeBasic(pick);
    if(!used.has(norm)) { used.add(norm); distractors.push(pick); }
  }
  while(distractors.length<3){ distractors.push('—'); }

  const options=[correctPT, ...distractors.slice(0,3)];
  const order=[0,1,2,3]; shuffleInPlace(order);
  const mapped = order.map(i=>options[i]);
  const correctIndex = order.indexOf(0);

  State.quiz={current:card, options:mapped, correctIndex:correctIndex, selectedIndex:-1};
}

export function selectQuizOption(index){
  if(State.quiz.selectedIndex!==-1) return;
  State.quiz.selectedIndex=index;
  const ok = index===State.quiz.correctIndex;
  State.message = ok? '✔ Correto!':'✘ Resposta incorreta.';
}

export function nextQuiz(){ startQuizQuestion(); State.message=''; }
