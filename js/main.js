/* Funções e dados globais do projeto Flashcards */

// Paleta de cores usada em todas as telas
const C = {
  card: '#121826',
  accent: '#43b6ff',
  accent2: '#7cffad',
  text: '#e7eef7',
  sub: '#9fb3c8',
  danger: '#ff6b6b',
  warn: '#ffd166',
  stroke: 'rgba(255,255,255,0.08)'
};

/**
 * Ajusta o canvas para preencher a área visível e retorna contexto e elemento.
 */
function setupCanvas(id = 'app') {
  const cvs = document.getElementById(id);
  const ctx = cvs.getContext('2d');
  function fit() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const w = window.innerWidth;
    const h = window.innerHeight - 56; // considera o cabeçalho fixo
    cvs.width = w * dpr;
    cvs.height = h * dpr;
    cvs.style.width = w + 'px';
    cvs.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', fit);
  fit();
  return { cvs, ctx };
}

// Desenha um retângulo com cantos arredondados
function roundRect(ctx, x, y, w, h, r = 16) {
  r = Math.min(r, Math.min(w, h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Desenha um botão simples no canvas
function drawButton(ctx, b) {
  const { x, y, w, h, label, fill = C.accent, stroke = C.stroke, text = C.text } = b;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.fillStyle = text;
  ctx.font = `600 ${Math.max(12, Math.floor(h * 0.42))}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(label), x + w / 2, y + h / 2 + 1);
}

// Embaralha um array in-place (Fisher-Yates)
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Baralho padrão inicial
const defaultDeck = [
  { id: '1', hiragana: '\u3053\u3093\u306b\u3061\u306f', romaji: 'konnichiwa', pt: 'olá' },
  { id: '2', hiragana: '\u3042\u308a\u304c\u3068\u3046', romaji: 'arigatou', pt: 'obrigado' },
  { id: '3', hiragana: '\u3059\u307f\u307e\u305b\u3093', romaji: 'sumimasen', pt: 'desculpa' }
];

// Carrega e salva o deck no localStorage
function loadDeck() {
  try {
    return JSON.parse(localStorage.getItem('jpDeck')) || defaultDeck.slice();
  } catch (e) {
    return defaultDeck.slice();
  }
}

function saveDeck(deck) {
  localStorage.setItem('jpDeck', JSON.stringify(deck));
}

// Destaca no menu a página atual
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('header nav a');
  const path = location.pathname.split('/').pop() || 'index.html';
  links.forEach((l) => {
    if (l.getAttribute('href') === path) l.classList.add('active');
  });
});

// Expoe funções globais para outros scripts
window.FC = {
  C,
  setupCanvas,
  drawButton,
  shuffleInPlace,
  loadDeck,
  saveDeck,
};
