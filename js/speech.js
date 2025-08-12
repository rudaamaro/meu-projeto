import {State} from './state.js';

export function speakJP(t){if(!('speechSynthesis'in window)){State.message='TTS não suportado';return;} const u=new SpeechSynthesisUtterance(t); u.lang='ja-JP'; const vs=speechSynthesis.getVoices(); const jp=vs.find(v=>/ja-JP|Japanese/i.test(v.lang+v.name))||vs.find(v=>/ja|JP|Japanese/i.test(v.lang+v.name)); if(jp)u.voice=jp; u.rate=0.95; speechSynthesis.cancel(); speechSynthesis.speak(u);}
if('speechSynthesis'in window){speechSynthesis.onvoiceschanged=()=>{};}
