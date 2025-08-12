import {todayStr} from './date-utils.js';

export const LS_KEYS={deck:'jpDeck_v4',stats:'jpStats_v1'};
const defaultDeck=[
  {id:'1',hiragana:'こんにちは',romaji:'konnichiwa',pt:'olá|ola|boa tarde',due:todayStr(),ef:2.5,ivl:0,reps:0,ok:0,err:0,cat:'none'},
  {id:'2',hiragana:'ありがとう',romaji:'arigatou',pt:'obrigado|obrigada',due:todayStr(),ef:2.5,ivl:0,reps:0,ok:0,err:0,cat:'none'},
  {id:'3',hiragana:'すみません',romaji:'sumimasen',pt:'desculpa|com licença|com licenca',due:todayStr(),ef:2.5,ivl:0,reps:0,ok:0,err:0,cat:'none'}
];
export function loadDeck(){try{return migrate(JSON.parse(localStorage.getItem(LS_KEYS.deck))||defaultDeck.slice());}catch(e){return defaultDeck.slice();}}
export function saveDeck(deck){localStorage.setItem(LS_KEYS.deck,JSON.stringify(deck));}
const defaultStats={streak:0,lastStudy:null,studiedToday:0,dailyGoal:20};
export function loadStats(){try{return Object.assign({},defaultStats,JSON.parse(localStorage.getItem(LS_KEYS.stats)||'{}'));}catch(e){return {...defaultStats};}}
export function saveStats(stats){localStorage.setItem(LS_KEYS.stats,JSON.stringify(stats));}
export function migrate(a){
  return (a||[]).map(c=>({
    id:c.id||String(Date.now()+Math.random()),
    hiragana:c.hiragana||'',
    romaji:(c.romaji||'').toLowerCase(),
    pt:(c.pt||'').toLowerCase(),
    due:c.due||todayStr(),
    ef:typeof c.ef==='number'?c.ef:2.5,
    ivl:typeof c.ivl==='number'?c.ivl:0,
    reps:c.reps||0, ok:c.ok||0, err:c.err||0,
    cat:(c.cat==='dificil'||c.cat==='medio'||c.cat==='facil')?c.cat:'none'
  }));
}
