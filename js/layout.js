import { cvs } from './main.js';
import { SIZES } from './constants.js';

export function layout(){
  const W = cvs?.clientWidth || 800;
  const H = cvs?.clientHeight || 600;
  const pad = Math.max(12, Math.floor(W*0.02));

  const safeTop = pad + SIZES.headerPadY;
  const headerH = SIZES.headerHeight;

  // Header area
  const bar = {
    x: pad,
    y: safeTop,
    w: Math.min(420, Math.floor(W*0.55)),
    h: 16
  };

  // Reserve área do FAB no topo direito (não colidir com streak)
  const streakBox = {
    x: Math.max(bar.x + bar.w + 12, W - (SIZES.fabReserveW + pad + 160)),
    y: safeTop - 6,
    w: 160,
    h: 28
  };

  // Card inicia logo abaixo do header
  const card = {
    x: pad*1.2,
    y: safeTop + headerH,
    w: W - pad*2.4,
    h: Math.max(200, H - (safeTop + headerH + pad*2.0))
  };

  // Pills de treino (se existirem)
  const trainPills = [
    { x: card.x, y: card.y - 38, w: 74, h: 28, label:'Todas' },
    // ... demais se aplicável
  ];

  // Botões de topo (se desenhar como menu FAB, deixe vazio aqui)
  const buttons = []; // (render adiciona)
  const clickZones = [];

  return { pad, safeTop, bar, streakBox, card, trainPills, buttons, clickZones };
}
