export let cvs, ctx;
import {render} from './render.js';
import {keydownHandler,mousemoveHandler,mousedownHandler,mouseupHandler} from './input-handlers.js';
import './tests-smoke.js';

cvs=document.getElementById('app');
ctx=cvs.getContext('2d');

function fitCanvas(){
  const dpr=Math.max(1,Math.floor(window.devicePixelRatio||1));
  const w=Math.floor(window.innerWidth), h=Math.floor(window.innerHeight);
  cvs.width=w*dpr; cvs.height=h*dpr; cvs.style.width=w+'px'; cvs.style.height=h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize',fitCanvas); fitCanvas();

window.addEventListener('keydown',keydownHandler);
cvs.addEventListener('mousemove',mousemoveHandler);
cvs.addEventListener('mousedown',mousedownHandler);
window.addEventListener('mouseup',mouseupHandler);

render();
