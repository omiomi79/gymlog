// 種目名 → 鍛えられる筋肉（1 = メイン、小数 = サブ）と、前後の人体図ヒートマップ
export const MUSCLES = {
  chest: '胸', delt_f: '肩（前）', delt_s: '肩（横）', delt_r: '肩（後ろ）',
  biceps: '上腕二頭', triceps: '上腕三頭', forearm: '前腕',
  abs: '腹直筋', oblique: '腹斜筋', traps: '僧帽筋', lats: '広背筋', midback: '背中中部', lowback: '腰',
  glutes: 'お尻', quads: '前もも', hams: '裏もも', adductor: '内もも', calves: 'ふくらはぎ',
};

// 上から順に最初に当たったものを使う（名前は「/」で分けてそれぞれ判定）
const RULES = [
  [/カーフ/, { calves: 1 }],
  [/レッグカール/, { hams: 1 }],
  [/レッグエクステンション/, { quads: 1 }],
  [/アブダクション/, { glutes: 1 }],
  [/アダクション/, { adductor: 1 }],
  [/ヒップ|グルート/, { glutes: 1, hams: 0.5 }],
  [/ルーマニアン|スティッフ/, { hams: 1, glutes: 0.7, lowback: 0.5 }],
  [/デッドリフト|ラックプル/, { lowback: 1, glutes: 1, hams: 0.8, traps: 0.5, forearm: 0.3 }],
  [/スクワット|レッグプレス|ランジ|ハック|振り子/, { quads: 1, glutes: 0.7, adductor: 0.3, hams: 0.3 }],
  [/バックエクステンション/, { lowback: 1, glutes: 0.5, hams: 0.3 }],
  [/シュラッグ/, { traps: 1 }],
  [/アップライト/, { delt_s: 1, traps: 0.6 }],
  [/フェイスプル|リアデルト|リアレイズ/, { delt_r: 1, midback: 0.5 }],
  [/サイドレイズ|ラテラル/, { delt_s: 1 }],
  [/ショルダー|オーバーヘッド|アーノルド/, { delt_f: 1, delt_s: 0.5, triceps: 0.5 }],
  [/チン.*ディップ/, { lats: 1, triceps: 0.7, chest: 0.5, biceps: 0.5 }],
  [/ディップ/, { triceps: 1, chest: 0.7, delt_f: 0.3 }],
  [/ナロー/, { triceps: 1, chest: 0.7 }],
  [/トライセ|プレスダウン|フレンチ|スカル|キックバック|ロープエクステンション/, { triceps: 1 }],
  [/リスト|グリップトレーナー|ファーマーズ/, { forearm: 1, traps: 0.3 }],
  [/ハンマー/, { biceps: 1, forearm: 0.6 }],
  [/カール|バイセ/, { biceps: 1, forearm: 0.3 }],
  [/プルオーバー/, { lats: 1, chest: 0.6 }],
  [/フライ|ペック|クロス/, { chest: 1, delt_f: 0.3 }],
  [/ベンチプレス|チェスト|腕立て|ギロチン/, { chest: 1, delt_f: 0.4, triceps: 0.4 }],
  [/ツイスト|トルソー|サイドプランク|ウッドチョップ|サイドターニング|バイシクル/, { oblique: 1, abs: 0.5 }],
  [/クランチ|シットアップ|レッグレイズ|アブ|ニーアップ|ローラー|プランク|マウンテン/, { abs: 1, oblique: 0.3 }],
  [/ラット|懸垂|チン|プルダウン|プルアップ/, { lats: 1, biceps: 0.4, midback: 0.3 }],
  [/ロウ|プルバック|プーリー|プーリ/, { midback: 1, lats: 0.7, biceps: 0.3, delt_r: 0.3 }],
  [/ケトルベル|クリーン|バーピー/, { glutes: 0.7, hams: 0.5, lowback: 0.5, quads: 0.5, delt_f: 0.3 }],
];
const FALLBACK = {
  chest: { chest: 1 }, back: { lats: 0.8, midback: 0.8 }, shoulder: { delt_f: 0.6, delt_s: 0.6, delt_r: 0.6 },
  arm: { biceps: 0.6, triceps: 0.6 }, leg: { quads: 0.7, hams: 0.5, glutes: 0.5 }, abs: { abs: 1 },
  multi: {}, cardio: {},
};
const cache = new Map();
export function musclesOf(x) {
  if (cache.has(x.id)) return cache.get(x.id);
  const out = {};
  for (const seg of x.name.split(/[/／]/)) {
    const hit = RULES.find(([re]) => re.test(seg));
    if (hit) for (const [m, w] of Object.entries(hit[1])) out[m] = Math.max(out[m] || 0, w);
  }
  if (!Object.keys(out).length) for (const p of x.parts) Object.assign(out, FALLBACK[p] || {});
  cache.set(x.id, out);
  return out;
}

/* ---- 人体図（右半分を描いて左右反転） ---- */
const FRONT = {
  traps: 'M108,55 L128,64 L112,67 Z',
  delt_f: 'M131,64 C146,64 155,75 155,92 L145,97 C141,85 136,76 127,71 Z',
  chest: 'M102,70 L127,71 C137,77 142,89 140,101 C130,109 112,110 102,106 Z',
  biceps: 'M145,100 L156,95 C160,109 160,124 157,137 L147,138 C143,125 142,112 145,100 Z',
  forearm: 'M147,142 L158,141 C164,158 164,176 160,193 L150,193 C146,177 144,159 147,142 Z',
  abs: 'M102,112 L120,112 L120,180 C115,189 107,192 102,192 Z',
  oblique: 'M123,111 L138,106 C140,130 138,160 135,180 L123,185 Z',
  quads: 'M106,205 L134,197 C142,221 142,260 136,292 L118,296 C110,270 106,240 106,205 Z',
  adductor: 'M101,205 L104,206 C105,236 109,256 113,270 L101,262 Z',
  calves: 'M119,307 L136,302 C140,330 138,360 132,380 L122,380 C118,356 116,330 119,307 Z',
};
const BACK = {
  traps: 'M100,50 L110,56 L134,66 L114,80 L100,112 Z',
  delt_r: 'M131,64 C146,64 155,75 155,92 L145,97 C141,85 136,76 127,71 Z',
  midback: 'M101,114 L114,84 L126,82 L118,118 L101,126 Z',
  lats: 'M128,80 L138,84 C142,100 140,126 128,150 L106,160 L104,132 L120,120 Z',
  lowback: 'M101,150 L120,146 L121,186 L101,190 Z',
  triceps: 'M145,100 L156,95 C160,109 160,124 157,137 L147,138 C143,125 142,112 145,100 Z',
  forearm: 'M147,142 L158,141 C164,158 164,176 160,193 L150,193 C146,177 144,159 147,142 Z',
  glutes: 'M101,193 L132,189 C142,205 140,225 128,233 C116,237 105,233 101,227 Z',
  hams: 'M104,239 L134,233 C140,257 138,281 132,297 L116,299 C108,277 104,259 104,239 Z',
  calves: 'M116,307 L136,302 C144,320 142,346 134,362 L122,364 C114,346 112,326 116,307 Z',
};
const BASE = [
  '<ellipse cx="100" cy="30" rx="17" ry="21"/>',
  '<path d="M92,48 L108,48 L108,62 L92,62 Z"/>',
  '<path d="M100,60 L130,63 C152,65 158,80 156,96 L146,100 L140,110 L138,186 C140,192 140,196 136,198 L100,200 Z"/>',
  '<path d="M146,96 L158,92 C166,120 166,160 164,196 L160,206 L148,206 C142,170 140,130 146,96 Z"/>',
  '<ellipse cx="155" cy="214" rx="7" ry="10"/>',
  '<path d="M100,198 L138,194 C146,240 142,290 138,300 C144,330 142,360 136,384 L120,386 C114,356 114,330 116,302 C106,270 102,240 100,200 Z"/>',
  '<ellipse cx="128" cy="391" rx="10" ry="5"/>',
].join('');

export const HEAT = ['#3d434d', '#ffe066', '#ffa94d', '#ff6b6b', '#e03131'];
export const level = (v, th) => (v <= 0 ? 0 : v <= th[0] ? 1 : v <= th[1] ? 2 : v <= th[2] ? 3 : 4);

function half(shapes, vals, th, view) {
  return Object.entries(shapes).map(([m, d]) => {
    // 肩の横は前後どちらの図にも出す
    let v = vals[m] || 0;
    if (m === 'delt_f' || m === 'delt_r') v = Math.max(v, vals.delt_s || 0);
    return `<path d="${d}" style="fill:${HEAT[level(v, th)]}" data-m="${m}"><title>${MUSCLES[m]} ${Math.round(v * 10) / 10}セット</title></path>`;
  }).join('') + (view === 'front'
    ? '<path d="M102,134 L120,134 M102,156 L120,156" style="stroke:var(--bg);stroke-width:1.5;fill:none"/>'
    : '');
}
function figure(shapes, vals, th, view, label) {
  const h = half(shapes, vals, th, view);
  return `<svg viewBox="30 0 140 412" class="body" role="img" aria-label="${label}">
    <g style="fill:#2b3038">${BASE}<g transform="translate(200,0) scale(-1,1)">${BASE}</g></g>
    <g style="stroke:var(--bg);stroke-width:1.2">${h}<g transform="translate(200,0) scale(-1,1)">${h}</g></g>
    <text x="100" y="410" text-anchor="middle" font-size="13" style="fill:var(--sub)">${label}</text>
  </svg>`;
}
export function bodyHeat(vals, th = [3, 6, 10]) {
  return `<div class="bodies">${figure(FRONT, vals, th, 'front', '前')}${figure(BACK, vals, th, 'back', '後ろ')}</div>`;
}
