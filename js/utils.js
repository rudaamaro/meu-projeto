export function normalizeBasic(s){
  return (s||'')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
export function parseAnswers(pt){return (pt||'').split(/[|;,]/).map(normalizeBasic).filter(Boolean);}
export function shuffleInPlace(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
export function pillet(p){ return p; }
export let _tick=0; export function tick(){return _tick;} export function incTick(){_tick++;}

export function fitTextToWidth(ctx, text, maxWidth, maxPx, minPx=12, weight='800') {
  let size = maxPx;
  ctx.font = `${weight} ${size}px system-ui`;
  while (size > minPx && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `${weight} ${size}px system-ui`;
  }
  return size;
}
