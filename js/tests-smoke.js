import {parseAnswers,normalizeBasic,shuffleInPlace} from './utils.js';
import {migrate} from './storage.js';
import {layout} from './layout.js';
import {startQuizQuestion} from './quiz.js';
import {State} from './state.js';

(function tests(){
  console.assert(parseAnswers('olá; boa tarde').length===2,'parse ;');
  console.assert(parseAnswers('a, b|c').length===3,'parse mix');
  console.assert(normalizeBasic('Licença')===normalizeBasic('licenca'),'acentos');
  const tmp = migrate([{hiragana:'a',romaji:'b',pt:'c'}])[0];
  console.assert(tmp.cat==='none','default cat');

  const Ltest = layout();
  console.assert(Ltest && Ltest.card && typeof Ltest.card.x==='number','layout básico');
  console.assert(Ltest.gear && typeof Ltest.gear.x==='number','gear presente');

  startQuizQuestion();
  State.mode='quiz';
  const Lq = layout();
  console.assert(Array.isArray(State.quiz.options) && State.quiz.options.length===4, 'quiz 4 opções');
  const labels = new Set(Lq.buttons.map(b=>b.label));
  console.assert(State.quiz.options.every(o=>labels.has(o)), 'layout inclui os 4 botões do quiz');
  console.assert(Lq.buttons.some(b=>b.label==='Pular' || b.label==='Próximo ▶'), 'layout inclui Próximo/Pular');

  const arr=[1,2,3,4,5]; const copy=arr.slice(); shuffleInPlace(copy);
  console.assert(copy.length===arr.length && arr.every(v=>copy.includes(v)), 'shuffle preserva elementos');

  console.log('%c[Canvas Flashcards v4.6] Tests OK','color:#7cffad');
})();
