import { cvs, mobileInput, hideMobileInput, bulkTextarea, hideBulkTextarea, syncMobileInput } from './main.js';
import { IS_MOBILE } from './device.js';
import { State, addCardFromForm, checkAnswer, chooseDifficulty, pasteFromClipboard } from './state.js';
import { layout } from './layout.js';

export const mouse = { x: 0, y: 0, down: false };

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
    if (e.key === 'Tab') {
      e.preventDefault();
      State.focusField = f === 'hiragana' ? 'romaji' : f === 'romaji' ? 'pt' : 'hiragana';
      if (IS_MOBILE && mobileInput) {
        mobileInput.value = State.addForm[State.focusField] || '';
        mobileInput.focus();
        const v = mobileInput.value || '';
        mobileInput.setSelectionRange(v.length, v.length);
      }
      return;
    }
    if (e.key === 'Enter') { hideMobileInput(); addCardFromForm(); return; }
    if (mobileActive) return;
    if (e.key === 'Backspace') { State.addForm[f] = State.addForm[f].slice(0, -1); return; }
    if (e.key.length === 1) { State.addForm[f] += e.key; return; }
  }
  if (State.mode === 'bulk') {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') { pasteFromClipboard(); }
  }
}

export function mousemoveHandler(e) {
  const r = cvs.getBoundingClientRect();
  mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
}
export function mousedownHandler() { mouse.down = true; handleClick(mouse.x, mouse.y); }
export function mouseupHandler() { mouse.down = false; }

function hit(b, x, y) { return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; }
export function handleClick(x, y) {
  const u = layout();
  if (State.lastInputRect && hit(State.lastInputRect, x, y)) return;
  if (State.lastBulkRect && hit(State.lastBulkRect, x, y)) return;
  hideMobileInput(); hideBulkTextarea();
  const all = [...u.buttons, ...u.clickZones];
  for (const b of all) { if (hit(b, x, y)) { b.onClick && b.onClick(); return; } }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    cvs.addEventListener('touchstart', (e) => {
      if (!IS_MOBILE) return;
      const t = e.changedTouches[0];
      const r = cvs.getBoundingClientRect();
      const x = t.clientX - r.left, y = t.clientY - r.top;
      if (State.lastInputRect) {
        const { x:ix, y:iy, w:iw, h:ih } = State.lastInputRect;
        const inside = x>=ix && x<=ix+iw && y>=iy && y<=iy+ih;
        if (inside && mobileInput) {
          e.preventDefault();
          mobileInput.focus();
          const v = mobileInput.value || '';
          mobileInput.setSelectionRange(v.length, v.length);
          syncMobileInput(State.lastInputRect);
          return;
        }
      }
      if (State.mode==='bulk' && State.lastBulkRect) {
        const { x:bx, y:by, w:bw, h:bh } = State.lastBulkRect;
        const insideB = x>=bx && x<=bx+bw && y>=by && y<=by+bh;
        if (insideB && bulkTextarea) {
          e.preventDefault();
          bulkTextarea.focus();
          const v = bulkTextarea.value || '';
          bulkTextarea.setSelectionRange(v.length, v.length);
        }
      }
    }, { passive:false });
  });
}

