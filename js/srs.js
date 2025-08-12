import {todayStr,addDays} from './date-utils.js';

export function schedule(card,grade){const minEF=1.3; if(grade===0){card.err=(card.err||0)+1; card.reps=0; card.ef=Math.max(minEF,(card.ef||2.5)-0.2); card.ivl=1; card.due=addDays(todayStr(),1); return;} card.ok=(card.ok||0)+1; const ef=card.ef||2.5; if(card.reps===0){card.ivl=(grade===2)?3:1;} else {const mult=grade===2?(ef*1.3):ef; card.ivl=Math.max(1,Math.round(card.ivl*mult));} card.ef=Math.max(minEF,ef+(grade===2?+0.10:-0.05)); card.reps=(card.reps||0)+1; card.due=addDays(todayStr(),card.ivl);}
