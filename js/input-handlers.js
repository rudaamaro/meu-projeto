import { cvs } from './main.js';
import { State, addCardFromForm, checkAnswer, chooseDifficulty, pasteFromClipboard } from './state.js';
import { layout } from './layout.js';

export const mouse = { x: 0, y: 0, down: false };

const mobileInput = document.createElement('input');
mobileInput.type = 'text';
mobileInput.autocomplete = 'off';
mobileInput.autocapitalize = 'off';
mobileInput.spellcheck = false;
mobileInput.style.position = 'fixed';
mobileInput.style.opacity = '0';
mobileInput.style.left = '-1000px';
mobileInput.style.top = '-1000px';
mobileInput.style.width = '1px';
mobileInput.style.height = '1px';
mobileInput.style.pointerEvents = 'none';
document.body.appendChild(mobileInput);

let mobileCB = null;
mobileInput.addEventListener('input', () => { if (mobileCB) mobileCB(mobileInput.value); });

export function showMobileInput(value = '', cb) {
  mobileInput.value = value;
  mobileCB = cb;
  mobileInput.style.left = '0px';
  mobileInput.style.top = '0px';
  mobileInput.style.pointerEvents = 'none';
  mobileInput.focus();
  setTimeout(() => mobileInput.setSelectionRange(mobileInput.value.length, mobileInput.value.length), 0);
}

export function hideMobileInput() {
  mobileCB = null;
  mobileInput.blur();
  mobileInput.style.left = '-1000px';
  mobileInput.style.top = '-1000px';
  mobileInput.style.pointerEvents = 'none';
}

export function keydownHandler(e) {
  const mobileActive = document.activeElement === mobileInput;
  if ((State.mode === 'study' || State.mode === 'train' || State.mode === 'quiz') && (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r'))) {
    e.preventDefault(); return;
  }
  if (State.mode === 'study' || State.mode === 'train') {
    if (!State.showAnswer) {
      if (e.key === 'Enter') { hideMobileInput(); checkAnswer(); return; }
      if (mobileActive) return;
      if (e.key === 'Backspace') { State.input = State.input.slice(0, -1); return; }
      if (e.key.length === 1) { State.input += e.key; return; }
    } else {
      if (e.key === '1') { chooseDifficulty('dificil'); return; }
      if (e.key === '2') { chooseDifficulty('medio'); return; }
      if (e.key === '3') { chooseDifficulty('facil'); return; }
    }
  }
  if (State.mode === 'add') {
    const f = State.focusField || 'hiragana';
    if (e.key === 'Tab') { e.preventDefault(); State.focusField = f === 'hiragana' ? 'romaji' : f === 'romaji' ? 'pt' : 'hiragana'; showMobileInput(State.addForm[State.focusField], v => { State.addForm[State.focusField] = v; }); return; }
    if (e.key === 'Enter') { hideMobileInput(); addCardFromForm(); return; }
    if (mobileActive) return;
    if (e.key === 'Backspace') { State.addForm[f] = State.addForm[f].slice(0, -1); return; }
    if (e.key.length === 1) { State.addForm[f] += e.key; return; }
  }
  if (State.mode === 'bulk') { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') { pasteFromClipboard(); } }
}

export function mousemoveHandler(e) {
  const r = cvs.getBoundingClientRect();
  mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
}
export function mousedownHandler() { mouse.down = true; handleClick(mouse.x, mouse.y); }
export function mouseupHandler() { mouse.down = false; }

function hit(b, x, y) { return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; }
export function handleClick(x, y) {
  hideMobileInput();
  const u = layout();
  const all = [...u.buttons, ...u.clickZones];
  for (const b of all) { if (hit(b, x, y)) { b.onClick && b.onClick(); return; } }
}

