import { KONGOU } from './kongou.js';
import { GENERAL } from './exercises.js';
import { MUSCLES, musclesOf, bodyHeat, HEAT, level } from './muscles.js';

/* ---------- 定数 ---------- */
const PARTS = {
  chest: ['胸', 'var(--chest)'], back: ['背中', 'var(--back)'], shoulder: ['肩', 'var(--shoulder)'],
  arm: ['腕', 'var(--arm)'], leg: ['脚', 'var(--leg)'], abs: ['腹', 'var(--abs)'],
  multi: ['全身', 'var(--multi)'], cardio: ['有酸素', 'var(--cardio)'],
};
const PART_ORDER = Object.keys(PARTS);
const MTYPE = {
  weight_stack: 'ウェイトスタック', plate_load: 'プレートロード', cable_function: 'ケーブル',
  rack_smith: 'スミス', benches: 'ベンチ', cardio: '有酸素マシン',
};
const KINDS = { weight: '重量×回数', bw: '自重（回数）', hold: '秒数', time: '有酸素（分・km）' };
// [フィールド, 見出し, inputmode]
const FIELDS = {
  weight: [['w', 'kg', 'decimal'], ['r', '回', 'numeric']],
  bw: [['w', '+kg', 'decimal'], ['r', '回', 'numeric']],
  hold: [['s', '秒', 'numeric']],
  time: [['min', '分', 'decimal'], ['km', 'km', 'decimal'], ['kcal', 'kcal', 'numeric']],
};
const KEY = 'gymlog.v1';
const TKEY = 'gymlog.timer';
const WD = '日月火水木金土';

/* ---------- 小物 ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const ds = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => ds(new Date());
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ds(d); };
const jd = (s) => { const d = pd(s); return `${d.getMonth() + 1}月${d.getDate()}日(${WD[d.getDay()]})`; };
const md = (s) => { const d = pd(s); return `${d.getMonth() + 1}/${d.getDate()}`; };
const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : 0; };
const f2 = (n) => String(+(+n).toFixed(2));
const kg = (n) => n >= 10000 ? `${f2(n / 1000)}t` : `${Math.round(n).toLocaleString()}kg`;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const kata = (s) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
const norm = (s) => kata(String(s).normalize('NFKC').toLowerCase()).replace(/[\s・／/ー\-（）()]/g, '');
const chip = (p) => `<span class="chip" style="--c:${PARTS[p]?.[1]}">${PARTS[p]?.[0] ?? p}</span>`;
const icon = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>',
  note: '<svg viewBox="0 0 24 24" style="width:14px;height:14px;flex:none;margin-top:2px"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 19h16M6 15l4-5 4 3 5-7"/></svg>',
  swap: '<svg viewBox="0 0 24 24"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
};

/* ---------- 保存 ---------- */
const blank = () => ({
  v: 1, days: {}, custom: [], fav: [], routines: [], notes: {},
  settings: { rest: 90, auto: true, sound: true, wake: false, week: 0 },
});
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v) return { ...blank(), ...s, settings: { ...blank().settings, ...s.settings } };
  } catch {}
  return blank();
}
let S = load();
let saveT;
function save(now) {
  clearTimeout(saveT);
  const f = () => {
    for (const [d, o] of Object.entries(S.days)) if (!o.entries?.length && !o.memo && !o.bw) delete S.days[d];
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { toast('保存に失敗しました（容量不足？）'); }
  };
  now ? f() : (saveT = setTimeout(f, 250));
}
document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });
navigator.storage?.persist?.();

/* ---------- 種目 ---------- */
let EX = new Map();
function buildEx() {
  EX = new Map();
  for (const k of KONGOU) EX.set(k.id, { ...k, src: 'kongou' });
  for (const g of GENERAL) EX.set(g.id, g);
  for (const c of S.custom) EX.set(c.id, { ...c, src: 'custom' });
}
buildEx();
const ex = (id) => EX.get(id) || { id, name: '（削除された種目）', parts: ['multi'], kind: 'weight', src: 'custom' };
const thumb = (e, cls = 'thumb') => e.thumb
  ? `<img class="${cls}" data-peek="${esc(e.id)}" draggable="false" src="${esc(e.thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'${cls} ph',innerHTML:'${icon.dumbbell.replace(/"/g, '&quot;')}'}))">`
  : `<div class="${cls} ph">${icon.dumbbell}</div>`;

/* ---------- セット計算 ---------- */
function valid(kind, s) {
  if (kind === 'weight' || kind === 'bw') return num(s.r) > 0;
  if (kind === 'hold') return num(s.s) > 0;
  return num(s.min) > 0 || num(s.km) > 0;
}
const validSets = (e) => { const k = ex(e.ex).kind; return e.sets.filter((s) => valid(k, s)); };
const workSets = (e) => validSets(e).filter((s) => s.t !== 'w');
const e1rm = (w, r) => (r <= 1 ? w : w * (1 + r / 30));
const entryVol = (e) => ex(e.ex).kind === 'weight' ? workSets(e).reduce((a, s) => a + num(s.w) * num(s.r), 0) : 0;
const dayObj = (d, create) => S.days[d] || (create ? (S.days[d] = { entries: [], memo: '', bw: '' }) : null);
const dayEntries = (d) => S.days[d]?.entries || [];
const dayValid = (d) => dayEntries(d).some((e) => validSets(e).length);
const dayVol = (d) => dayEntries(d).reduce((a, e) => a + entryVol(e), 0);
const dayParts = (d) => {
  const set = new Set();
  for (const e of dayEntries(d)) if (validSets(e).length) ex(e.ex).parts.forEach((p) => set.add(p));
  return PART_ORDER.filter((p) => set.has(p));
};

// 筋肉ごとのセット数（メイン1・サブは割合で加算）と有酸素の分数
function muscleVals(dates) {
  const vals = {};
  let cardio = 0;
  for (const d of dates) for (const e of dayEntries(d)) {
    const x = ex(e.ex), ws = workSets(e);
    if (x.kind === 'time') { cardio += ws.reduce((a, s) => a + num(s.min), 0); continue; }
    for (const [m, w] of Object.entries(musclesOf(x))) vals[m] = (vals[m] || 0) + ws.length * w;
  }
  return { vals, cardio };
}
const HEAT_TH = { 1: [3, 6, 10], 7: [4, 10, 16], 30: [12, 30, 50] };
function heatHtml(dates, th) {
  const { vals, cardio } = muscleVals(dates);
  const top = Object.entries(vals).filter(([, v]) => v >= 0.5).sort((a, b) => b[1] - a[1]);
  if (!top.length && !cardio) return '<div class="empty" style="padding:12px">この期間の記録がありません</div>';
  return `${bodyHeat(vals, th)}
    <div class="heat-scale"><span>少</span>${HEAT.slice(1).map((c) => `<i style="background:${c}"></i>`).join('')}<span>多</span></div>
    <div class="heat-top">${top.map(([m, v]) => `<span class="hchip"><i style="background:${HEAT[level(v, th)]}"></i>${MUSCLES[m]}<b>${f2(Math.round(v * 10) / 10)}</b></span>`).join('')}${cardio ? `<span class="hchip"><i style="background:var(--cardio)"></i>有酸素<b>${f2(cardio)}分</b></span>` : ''}</div>
    <div class="sub small" style="text-align:center;margin-top:6px">数字はセット数（補助で使われる筋肉は0.3〜0.7セットで計算）</div>`;
}
const dayHeat = (date) => (dayValid(date) ? `<div class="card heat"><div class="row" style="margin-bottom:4px"><b class="grow">${date === today() ? '今日' : 'この日'}鍛えた部位</b><span class="sub small">セット数</span></div>${heatHtml([date], HEAT_TH[1])}</div>` : '');

function setText(kind, s) {
  if (kind === 'weight') return `${f2(num(s.w))}kg×${num(s.r)}`;
  if (kind === 'bw') return num(s.w) ? `+${f2(num(s.w))}kg×${num(s.r)}` : `${num(s.r)}回`;
  if (kind === 'hold') return `${num(s.s)}秒`;
  return [num(s.min) && `${f2(num(s.min))}分`, num(s.km) && `${f2(num(s.km))}km`, num(s.kcal) && `${num(s.kcal)}kcal`].filter(Boolean).join(' ');
}
function summarize(kind, sets) {
  const out = [];
  for (const s of sets) {
    const t = (s.t === 'w' ? 'W ' : s.t === 'd' ? 'D ' : '') + setText(kind, s);
    if (out.length && out.at(-1)[0] === t) out.at(-1)[1]++;
    else out.push([t, 1]);
  }
  return out.map(([t, n]) => (n > 1 ? `${t} ×${n}` : t)).join(' / ');
}

// 種目ごとの日付別セット（有効セットのみ）
function perDate(id) {
  const m = new Map();
  for (const d of Object.keys(S.days).sort()) {
    for (const e of dayEntries(d)) {
      if (e.ex !== id) continue;
      const vs = validSets(e);
      if (vs.length) m.set(d, [...(m.get(d) || []), ...vs]);
    }
  }
  return m;
}
function prevPerf(id, date) {
  let best = null;
  for (const [d, sets] of perDate(id)) if (d < date) best = { date: d, sets };
  return best;
}
function bestBefore(id, date) {
  let w = 0;
  for (const [d, sets] of perDate(id)) if (d < date) for (const s of sets) if (s.t !== 'w') w = Math.max(w, num(s.w));
  return w;
}
function recentIds() {
  const seen = new Map();
  for (const d of Object.keys(S.days).sort().reverse()) for (const e of dayEntries(d)) if (!seen.has(e.ex)) seen.set(e.ex, d);
  return [...seen.keys()].filter((id) => EX.has(id));
}

function newEntry(id, date, target) {
  const kind = ex(id).kind;
  const keys = FIELDS[kind].map((f) => f[0]);
  const pick = (s) => Object.fromEntries(keys.map((k) => [k, s[k] ?? '']));
  let sets;
  if (target && target.n) {
    sets = Array.from({ length: target.n }, () => ({ p: { w: target.w ?? '', r: target.r ?? '' } }));
  } else {
    const prev = prevPerf(id, date);
    sets = prev ? prev.sets.map((s) => ({ p: pick(s), ...(s.t ? { t: s.t } : {}) }))
      : Array.from({ length: kind === 'time' || kind === 'hold' ? 1 : 3 }, () => ({ p: {} }));
  }
  return { id: uid(), ex: id, sets };
}

/* ---------- ルーティング ---------- */
const CUR = { month: today().slice(0, 7), metric: null, range: 'all', heat: 7 };
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [r, ...rest] = h.split('/');
  const name = r || 'cal';
  document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === name));
  wake(name === 'day');
  if (name === 'day') return viewDay(rest[0] && /^\d{4}-\d\d-\d\d$/.test(rest[0]) ? rest[0] : today());
  if (name === 'stats') {
    if (rest[0] === 'ex' && rest[1]) return viewExStats(decodeURIComponent(rest.slice(1).join('/')));
    return viewStats();
  }
  if (name === 'routines') return rest[0] ? viewRoutine(rest[0]) : viewRoutines();
  if (name === 'settings') return viewSettings();
  return viewCal();
}
window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
const go = (h) => { if (location.hash === h) route(); else location.hash = h; };

function setTop(title, left = '<div class="sp"></div>', right = '<div class="sp"></div>') {
  $('#top').innerHTML = `${left}<h1>${title}</h1>${right}`;
}
const view = (html) => { $('#view').innerHTML = html; };

/* ---------- カレンダー ---------- */
function viewCal() {
  const [y, m] = CUR.month.split('-').map(Number);
  setTop('ジムログ', '<div class="sp"></div>', '<button class="ib" data-a="cal-today" aria-label="今月へ" style="width:auto;padding:0 10px;font-size:13px;font-weight:700">今日</button>');
  const first = new Date(y, m - 1, 1);
  const ws = S.settings.week;
  const start = new Date(first); start.setDate(1 - ((first.getDay() - ws + 7) % 7));
  const t = today();
  let cells = '';
  for (let i = 0; i < 7; i++) {
    const wd = (i + ws) % 7;
    cells += `<div class="wd ${wd === 0 ? 'sun' : wd === 6 ? 'sat' : ''}">${WD[wd]}</div>`;
  }
  const d = new Date(start);
  for (let i = 0; i < 42; i++) {
    const s = ds(d);
    if (i >= 35 && d.getMonth() !== m - 1) break;
    const out = d.getMonth() !== m - 1;
    const parts = dayParts(s);
    const has = dayEntries(s).length > 0;
    cells += `<button class="d ${out ? 'out' : ''} ${s === t ? 'today' : ''} ${has ? 'has' : ''} ${d.getDay() === 0 ? 'sun' : d.getDay() === 6 ? 'sat' : ''}" data-a="open-day" data-d="${s}">
      <span class="n">${d.getDate()}</span>
      <span class="dots">${parts.map((p) => `<i class="dot" style="--c:${PARTS[p][1]}"></i>`).join('')}${has && !parts.length ? '<i class="dot" style="--c:var(--dim)"></i>' : ''}</span>
    </button>`;
    d.setDate(d.getDate() + 1);
  }
  // 集計
  const monthDays = Object.keys(S.days).filter((s) => s.startsWith(CUR.month) && dayValid(s));
  const wkStart = (() => { const x = new Date(); x.setDate(x.getDate() - ((x.getDay() - ws + 7) % 7)); return ds(x); })();
  const weekDays = Object.keys(S.days).filter((s) => s >= wkStart && s <= t && dayValid(s));
  const vol = monthDays.reduce((a, s) => a + dayVol(s), 0);
  const recent = Object.keys(S.days).filter(dayValid).sort().reverse().slice(0, 8);

  view(`
    <div class="cal-head">
      <button class="ib" data-a="cal-move" data-n="-1" aria-label="前の月">${icon.left}</button>
      <div class="m"><small>${y}</small>${m}月</div>
      <button class="ib" data-a="cal-move" data-n="1" aria-label="次の月">${icon.right}</button>
    </div>
    <div class="cal" id="cal">${cells}</div>
    <div class="legend">${PART_ORDER.map((p) => `<span><i class="dot" style="--c:${PARTS[p][1]}"></i>${PARTS[p][0]}</span>`).join('')}</div>
    <div class="stat3">
      <div><b>${monthDays.length}</b><span>${m}月のトレ日数</span></div>
      <div><b>${weekDays.length}</b><span>今週</span></div>
      <div><b>${kg(vol)}</b><span>${m}月の総ボリューム</span></div>
    </div>
    <button class="btn pri block" data-a="open-day" data-d="${t}">${icon.dumbbell}今日のトレーニングを記録</button>
    <h2>最近のトレーニング</h2>
    <div class="card" style="padding:4px 12px">
      ${recent.length ? recent.map((s) => recentRow(s)).join('') : '<div class="empty">まだ記録がありません。<br>日付をタップして記録を始めましょう。</div>'}
    </div>
  `);
  // スワイプで月移動
  const cal = $('#cal');
  let sx = null, sy = null;
  cal.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  cal.addEventListener('touchend', (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { moveMonth(dx < 0 ? 1 : -1); }
    sx = null;
  });
}
function recentRow(s) {
  const d = pd(s);
  const names = dayEntries(s).filter((e) => validSets(e).length).map((e) => ex(e.ex).name);
  return `<a class="recent" href="#/day/${s}">
    <div class="date"><b>${d.getDate()}</b><span>${d.getMonth() + 1}月 ${WD[d.getDay()]}</span></div>
    <div class="grow">
      <div class="row" style="gap:4px;flex-wrap:wrap">${dayParts(s).map(chip).join('')}</div>
      <div class="sub" style="margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(names.join('、'))}</div>
    </div>
    <div class="sub small">${dayVol(s) ? kg(dayVol(s)) : ''}</div>
  </a>`;
}
function moveMonth(n) {
  const [y, m] = CUR.month.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  CUR.month = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  viewCal();
}

/* ---------- 日 ---------- */
let DAY = today();
function viewDay(date) {
  DAY = date;
  CUR.month = date.slice(0, 7);
  const t = today();
  const label = date === t ? '今日' : date === addDays(t, -1) ? '昨日' : date === addDays(t, 1) ? '明日' : '';
  setTop(`${jd(date)}${label ? `<span class="sub" style="margin-left:6px;font-weight:600">${label}</span>` : ''}`,
    `<button class="ib" data-a="day-move" data-n="-1" aria-label="前の日">${icon.left}</button>`,
    `<button class="ib" data-a="day-move" data-n="1" aria-label="次の日">${icon.right}</button>`);
  const o = dayObj(date);
  const entries = o?.entries || [];
  view(`
    <div class="day-sum" id="day-sum">${daySumHtml(date)}</div>
    <div id="day-heat">${dayHeat(date)}</div>
    <div id="entries">${entries.map((e, i) => entryHtml(e, i, date)).join('')}</div>
    <button class="btn pri block" data-a="pick-day">${icon.plus}種目を追加</button>
    <div class="btns" style="margin-top:8px">
      <button class="btn sm" data-a="apply-routine">ルーティンから</button>
      <button class="btn sm" data-a="copy-day">過去からコピー</button>
      ${entries.length ? '<button class="btn sm" data-a="save-routine">ルーティン保存</button>' : ''}
    </div>
    <h2>体調・メモ</h2>
    <div class="card">
      <div class="bwrow"><span class="sub grow">体重</span><input class="f" data-f="bw" inputmode="decimal" placeholder="--" value="${esc(o?.bw ?? '')}"><span class="sub">kg</span></div>
      <label class="lb">メモ</label>
      <textarea class="f" data-f="memo" placeholder="調子、睡眠、気づいたことなど">${esc(o?.memo ?? '')}</textarea>
    </div>
  `);
}
function daySumHtml(date) {
  const es = dayEntries(date);
  const nSets = es.reduce((a, e) => a + workSets(e).length, 0);
  const vol = dayVol(date);
  return `${dayParts(date).map(chip).join('')}
    <span class="sub grow">${es.length}種目 · ${nSets}セット${vol ? ` · ${kg(vol)}` : ''}</span>
    <button class="btn sm" data-a="timer-start">${icon.timer}休憩</button>`;
}
function entryHtml(e, i, date) {
  const x = ex(e.ex);
  const prev = prevPerf(e.ex, date);
  const best = x.kind === 'weight' ? bestBefore(e.ex, date) : 0;
  const note = S.notes[e.ex];
  let n = 0;
  const rows = e.sets.map((s, si) => {
    const isW = s.t === 'w', isD = s.t === 'd';
    const label = isW ? 'W' : isD ? 'D' : ++n;
    const isPr = s.done && best > 0 && !isW && valid(x.kind, s) && num(s.w) > best;
    return `<div class="set ${s.done ? 'done' : ''}" data-si="${si}">
      <button class="no ${isW ? 'w' : isD ? 'd' : ''}" data-a="smenu">${label}</button>
      ${FIELDS[x.kind].map(([f, , im]) => `<input data-f="set" data-k="${f}" inputmode="${im}" enterkeyhint="next" value="${esc(s[f] ?? '')}" placeholder="${esc(effP(e, si, f) || (f === 'w' && x.kind === 'bw' ? '自重' : '-'))}">`).join('')}
      <button class="ck" data-a="check" aria-label="完了">${icon.check}${isPr ? '<span class="pr">PR</span>' : ''}</button>
    </div>`;
  }).join('');
  return `<div class="entry" data-ei="${i}">
    <div class="eh">
      ${x.src === 'kongou' ? `<button data-a="info" style="flex:none">${thumb(x)}</button>` : ''}
      <div class="grow">
        <div class="en">${esc(x.name)}</div>
        <div class="meta">${x.parts.map(chip).join('')}${x.mtype ? `<span class="sub small">${MTYPE[x.mtype] || ''}</span>` : ''}</div>
      </div>
      <button class="more" data-a="emenu" aria-label="メニュー">${icon.more}</button>
    </div>
    <button class="note ${note ? '' : 'empty-note'}" data-a="note" style="text-align:left;width:calc(100% - 24px)">${icon.note}<span>${note ? esc(note) : '設定メモを追加（シート位置など）'}</span></button>
    ${prev ? `<div class="prev">前回 ${md(prev.date)}：${esc(summarize(x.kind, prev.sets))}</div>` : ''}
    <div class="sets k-${x.kind}">
      <div class="hd"><span>セット</span>${FIELDS[x.kind].map(([, h]) => `<span>${h}</span>`).join('')}<span></span></div>
      ${rows}
    </div>
    <div class="add-set">
      <button class="btn ghost" data-a="add-set">${icon.plus}セット</button>
      ${e.sets.length ? '<button class="btn ghost" data-a="del-set">最後のセットを削除</button>' : ''}
    </div>
    <div class="ev" data-ev>${entryEvHtml(e)}</div>
  </div>`;
}
function entryEvHtml(e) {
  const x = ex(e.ex);
  const ws = workSets(e);
  if (!ws.length) return '';
  if (x.kind === 'weight') {
    const top = Math.max(...ws.map((s) => e1rm(num(s.w), num(s.r))));
    return `<span>ボリューム ${kg(entryVol(e))}</span><span>推定1RM ${f2(Math.round(top * 10) / 10)}kg</span>`;
  }
  if (x.kind === 'bw') return `<span>合計 ${ws.reduce((a, s) => a + num(s.r), 0)}回</span>`;
  if (x.kind === 'hold') return `<span>合計 ${ws.reduce((a, s) => a + num(s.s), 0)}秒</span>`;
  return `<span>合計 ${f2(ws.reduce((a, s) => a + num(s.min), 0))}分</span>`;
}
// 未入力欄の薄い表示：保存された前回値、なければ直前セットの入力値
function effP(e, si, f) {
  const s = e.sets[si];
  if (s.p?.[f] !== '' && s.p?.[f] != null) return s.p[f];
  for (let i = si - 1; i >= 0; i--) {
    const v = e.sets[i][f];
    if (v !== '' && v != null) return v;
  }
  return '';
}
const entryAt = (el) => {
  const ei = +el.closest('[data-ei]').dataset.ei;
  const si = el.closest('[data-si]') ? +el.closest('[data-si]').dataset.si : null;
  const e = dayEntries(DAY)[ei];
  return { ei, si, e, s: si != null ? e.sets[si] : null, x: ex(e.ex) };
};
const rerenderDay = () => viewDay(DAY);

/* ---------- ピッカー ---------- */
let PK = null;
function openPicker(mode, opts = {}) {
  PK = { mode, sel: [], q: '', part: S.fav.length && mode !== 'fav' ? 'fav' : 'all', src: mode === 'fav' ? 'kongou' : 'all', ...opts };
  pickerShell();
}
function pickerShell() {
  const title = { day: '種目を追加', routine: 'ルーティンに追加', swap: '種目を入れ替え', fav: 'マイジムのマシン' }[PK.mode];
  const srcs = [['all', 'すべて'], ['kongou', 'マシン'], ['general', 'フリー・自重'], ...(S.custom.length ? [['custom', 'カスタム']] : [])];
  openSheet(`
    <div class="sh"><h3>${title}</h3><button class="btn sm" data-a="close">閉じる</button></div>
    <div class="sb" id="pk-sb">
      <div class="pk-search">
        ${PK.mode === 'fav' ? '<div class="sub small" style="margin-bottom:8px">通っているジムにあるマシンに★を付けると、種目追加のときに「★マイジム」で絞り込めます。</div>' : ''}
        <div class="sub small" style="margin:-2px 2px 6px">マシン画像は長押しで拡大</div>
        <input class="f" id="pk-q" type="search" placeholder="種目・マシン名・型番で検索" autocomplete="off" value="${esc(PK.q)}">
        <div class="seg" style="margin-top:8px">${srcs.map(([k, l]) => `<button class="${PK.src === k ? 'on' : ''}" data-a="pk-src" data-v="${k}">${l}</button>`).join('')}</div>
        <div class="chips" id="pk-parts"></div>
      </div>
      <div id="pk-list"></div>
      <div class="pk-foot" id="pk-foot"></div>
    </div>`, { full: true });
  renderPk();
}
function renderPk() {
  const parts = [...(S.fav.length ? [['fav', '★マイジム']] : []), ['recent', '最近'], ['all', '全部'], ...PART_ORDER.map((p) => [p, PARTS[p][0]])];
  $('#pk-parts').innerHTML = parts.map(([k, l]) => `<button class="${PK.part === k ? 'on' : ''}" data-a="pk-part" data-v="${k}">${l}</button>`).join('');
  let list;
  if (PK.part === 'recent') list = recentIds().map((id) => EX.get(id));
  else {
    list = [...EX.values()];
    if (PK.part === 'fav') list = list.filter((e) => S.fav.includes(e.id));
    else if (PK.part !== 'all') list = list.filter((e) => e.parts.includes(PK.part));
    const so = { custom: 0, general: 1, kongou: 2 };
    list.sort((a, b) => PART_ORDER.indexOf(a.parts[0]) - PART_ORDER.indexOf(b.parts[0]) || so[a.src] - so[b.src] || a.name.localeCompare(b.name, 'ja'));
  }
  if (PK.src !== 'all') list = list.filter((e) => e.src === PK.src);
  const q = norm(PK.q);
  if (q) {
    list = list.filter((e) => norm(e.name + (e.codes || []).join('')).includes(q));
    const rank = (e) => (norm(e.name) === q ? 0 : norm(e.name).startsWith(q) ? 1 : 2);
    list.sort((a, b) => rank(a) - rank(b) || a.name.length - b.name.length);
  }
  let lastPart = null;
  const grouped = PK.part === 'all' && !q;
  $('#pk-list').innerHTML = list.map((e) => {
    let h = '';
    if (grouped && e.parts[0] !== lastPart) { lastPart = e.parts[0]; h = `<h2>${PARTS[lastPart][0]}</h2>`; }
    const sel = PK.sel.includes(e.id);
    const fav = S.fav.includes(e.id);
    return `${h}<div class="pk-item ${sel ? 'sel' : ''}" data-a="pk" data-id="${esc(e.id)}">
      ${thumb(e)}
      <div class="grow">
        <div class="nm">${esc(e.name)}</div>
        <div class="row" style="gap:4px;margin-top:2px;flex-wrap:wrap">${e.parts.map(chip).join('')}<span class="sub small">${e.src === 'kongou' ? (MTYPE[e.mtype] || '') + (e.codes?.length ? ' · ' + esc(e.codes.join(' / ')) : '') : e.src === 'custom' ? 'カスタム' : KINDS[e.kind]}</span></div>
      </div>
      ${PK.mode === 'day' || PK.mode === 'routine' ? `<span class="ck">${sel ? icon.check : ''}</span>` : ''}
      <button class="st ${fav ? 'on' : ''}" data-a="star" data-id="${esc(e.id)}" aria-label="マイジム">${icon.star}</button>
    </div>`;
  }).join('') || `<div class="empty">見つかりません${PK.part === 'fav' ? '<br>（「全部」で探して★を付けてください）' : ''}</div>`;
  const n = PK.sel.length;
  $('#pk-foot').innerHTML = `
    ${PK.mode === 'day' || PK.mode === 'routine' ? `<button class="btn pri block" data-a="pk-add" ${n ? '' : 'disabled style="opacity:.4"'}>${n ? `${n}種目を追加` : '種目をタップして選択'}</button>` : ''}
    ${PK.mode === 'fav' ? '<button class="btn pri block" data-a="close">完了</button>' : ''}
    ${PK.mode !== 'fav' ? `<button class="btn ghost block" style="margin-top:8px" data-a="custom-new">${icon.plus}${PK.q ? `「${esc(PK.q)}」を` : ''}カスタム種目を作る</button>` : ''}`;
}
function customForm() {
  openSheet(`
    <div class="sh"><h3>カスタム種目</h3><button class="btn sm" data-a="back-picker">戻る</button></div>
    <div class="sb">
      <label class="lb">名前</label><input class="f" id="cu-name" value="${esc(PK.q)}" placeholder="例：ジムのオリジナルマシン">
      <label class="lb">部位</label><select class="f" id="cu-part">${PART_ORDER.map((p) => `<option value="${p}">${PARTS[p][0]}</option>`).join('')}</select>
      <label class="lb">記録の種類</label><select class="f" id="cu-kind">${Object.entries(KINDS).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>
      <button class="btn pri block" style="margin-top:16px" data-a="custom-save">作成</button>
    </div>`);
  setTimeout(() => $('#cu-name')?.focus(), 50);
}

/* ---------- シート ---------- */
let sheetOpen = false;
function openSheet(html, { full = false } = {}) {
  const sh = $('#sheet');
  sh.className = full ? 'full' : '';
  sh.innerHTML = '<div class="grab"></div>' + html;
  $('#sheet-wrap').hidden = false;
  if (!sheetOpen) { history.pushState({ sheet: 1 }, ''); sheetOpen = true; }
}
function closeSheet(nav) {
  if (!sheetOpen) return;
  sheetOpen = false;
  $('#sheet-wrap').hidden = true;
  $('#sheet').innerHTML = '';
  if (nav) { if (location.hash === nav) { history.back(); } else location.replace(nav); }
  else if (history.state?.sheet) history.back();
}
window.addEventListener('popstate', () => { if (sheetOpen) { sheetOpen = false; $('#sheet-wrap').hidden = true; $('#sheet').innerHTML = ''; } });
$('#sheet-bg').addEventListener('click', () => closeSheet());
const menu = (title, items) => openSheet(`<div class="sh"><h3>${title}</h3></div><div class="sb menu">${items.map(([a, label, ic = '', cls = '', extra = '']) => `<button class="${cls}" data-a="${a}" ${extra}>${ic}${label}</button>`).join('')}</div>`);

let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2200);
}

/* ---------- 休憩タイマー ---------- */
let T = null;
try { T = JSON.parse(localStorage.getItem(TKEY)); } catch {}
let audio;
const unlockAudio = () => { try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); } catch {} };
const persistT = () => { try { T ? localStorage.setItem(TKEY, JSON.stringify(T)) : localStorage.removeItem(TKEY); } catch {} };
function startTimer(sec = S.settings.rest) { unlockAudio(); T = { end: Date.now() + sec * 1000, total: sec }; persistT(); buildTimer(); tick(); }
function buildTimer() {
  const el = $('#timer');
  el.innerHTML = `<button data-a="timer-add" data-n="-15">−15</button><span class="t"></span><button data-a="timer-add" data-n="15">+15</button><button data-a="timer-stop" aria-label="止める">${icon.x.replace('<svg', '<svg style="width:18px;height:18px"')}</button><span class="bar"><i></i></span>`;
  el.hidden = false;
}
function alarm() {
  navigator.vibrate?.([250, 120, 250, 120, 400]);
  if (!S.settings.sound || !audio) return;
  try {
    const t0 = audio.currentTime;
    [0, 0.25, 0.5].forEach((dt) => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(0.0001, t0 + dt); g.gain.exponentialRampToValueAtTime(0.4, t0 + dt + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.18);
      o.start(t0 + dt); o.stop(t0 + dt + 0.2);
    });
  } catch {}
}
function tick() {
  const el = $('#timer');
  if (!T) { el.hidden = true; return; }
  if (el.hidden || !el.firstChild) buildTimer();
  const left = Math.ceil((T.end - Date.now()) / 1000);
  if (left <= 0 && !T.fired) { T.fired = true; persistT(); alarm(); }
  if (left < -90) { T = null; persistT(); el.hidden = true; return; }
  const a = Math.abs(left);
  $('.t', el).textContent = `${left < 0 ? '+' : ''}${Math.floor(a / 60)}:${pad(a % 60)}`;
  $('.bar i', el).style.width = `${Math.max(0, Math.min(1, left / T.total)) * 100}%`;
  el.classList.toggle('over', left <= 0);
}
setInterval(tick, 250);

let wl = null;
async function wake(on) {
  try {
    if (on && S.settings.wake && !wl && navigator.wakeLock) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => (wl = null)); }
    else if ((!on || !S.settings.wake) && wl) { await wl.release(); wl = null; }
  } catch {}
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && location.hash.startsWith('#/day')) wake(true); });

/* ---------- 推移 ---------- */
function weekKey(s) { const d = pd(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ds(d); }
function viewStats() {
  setTop('推移');
  const days = Object.keys(S.days).filter(dayValid).sort();
  const t = today();
  // 連続週
  const weeks = new Set(days.map(weekKey));
  let wk = weekKey(t), streak = 0;
  if (!weeks.has(wk)) wk = addDays(wk, -7);
  while (weeks.has(wk)) { streak++; wk = addDays(wk, -7); }
  // 部位別セット数（30日）
  const from = addDays(t, -29);
  const partSets = Object.fromEntries(PART_ORDER.map((p) => [p, 0]));
  for (const d of days) if (d >= from) for (const e of dayEntries(d)) { const n = workSets(e).length; for (const p of ex(e.ex).parts) partSets[p] += n; }
  const maxP = Math.max(1, ...Object.values(partSets));
  // 体重
  const bws = Object.keys(S.days).sort().filter((d) => num(S.days[d].bw) > 0).map((d) => ({ x: d, y: num(S.days[d].bw) }));
  // 種目一覧
  const exs = new Map();
  for (const d of days) for (const e of dayEntries(d)) if (validSets(e).length) exs.set(e.ex, d);
  const exList = [...exs.entries()].sort((a, b) => b[1].localeCompare(a[1]));

  view(`
    <div class="stat3" style="margin-top:0">
      <div><b>${days.length}</b><span>総トレ日数</span></div>
      <div><b>${days.filter((d) => d >= from).length}</b><span>直近30日</span></div>
      <div><b>${streak}</b><span>連続週</span></div>
    </div>
    <h2>部位ヒートマップ</h2>
    <div class="card heat">
      <div class="seg" style="margin-bottom:8px">${[[1, '今日'], [7, '7日'], [30, '30日']].map(([k, l]) => `<button class="${CUR.heat === k ? 'on' : ''}" data-a="heat-range" data-v="${k}">${l}</button>`).join('')}</div>
      ${heatHtml(Array.from({ length: CUR.heat }, (_, i) => addDays(t, -i)), HEAT_TH[CUR.heat])}
    </div>
    <h2>部位別セット数（直近30日）</h2>
    <div class="card bars">
      ${PART_ORDER.map((p) => `<div class="b" style="--c:${PARTS[p][1]}"><span>${PARTS[p][0]}</span><span class="tr"><i style="width:${(partSets[p] / maxP) * 100}%"></i></span><span class="v">${partSets[p]}</span></div>`).join('')}
    </div>
    <h2>体重</h2>
    <div class="card">
      ${bws.length ? `<div class="row" style="margin-bottom:6px"><b style="font-size:22px">${f2(bws.at(-1).y)}<span class="sub"> kg</span></b><span class="sub grow">${md(bws.at(-1).x)} 時点</span>${bws.length > 1 ? `<span class="sub">${bws.at(-1).y - bws[0].y >= 0 ? '+' : ''}${f2(bws.at(-1).y - bws[0].y)}kg</span>` : ''}</div>${chartSvg(bws, 'kg')}` : '<div class="empty" style="padding:12px">日の画面で体重を入れるとグラフになります</div>'}
    </div>
    <h2>種目別の推移</h2>
    <div class="card" style="padding:4px 12px">
      ${exList.length ? exList.map(([id, last]) => {
        const x = ex(id); const b = bestOf(id);
        return `<a class="exrow" href="#/stats/ex/${encodeURIComponent(id)}">
          <div class="grow"><div style="font-weight:600">${esc(x.name)}</div><div class="row" style="gap:4px;margin-top:2px">${x.parts.map(chip).join('')}<span class="sub small">最終 ${md(last)}</span></div></div>
          <div class="v">${b}</div>${icon.right.replace('<svg', '<svg style="color:var(--dim);width:18px"')}
        </a>`;
      }).join('') : '<div class="empty">記録するとここに種目が並びます</div>'}
    </div>
  `);
}
function bestOf(id) {
  const x = ex(id);
  let b = 0;
  for (const sets of perDate(id).values()) for (const s of sets) if (s.t !== 'w') {
    b = Math.max(b, x.kind === 'weight' ? num(s.w) : x.kind === 'bw' ? num(s.r) : x.kind === 'hold' ? num(s.s) : num(s.min));
  }
  return `${f2(b)}<span class="sub small">${{ weight: 'kg', bw: '回', hold: '秒', time: '分' }[x.kind]}</span>`;
}
const METRICS = {
  weight: [['max', '最大重量', 'kg'], ['e1rm', '推定1RM', 'kg'], ['vol', 'ボリューム', 'kg'], ['reps', '総回数', '回']],
  bw: [['best', '最多回数', '回'], ['reps', '総回数', '回'], ['maxw', '最大加重', 'kg']],
  hold: [['best', '最長', '秒'], ['total', '合計', '秒']],
  time: [['min', '時間', '分'], ['km', '距離', 'km'], ['kcal', '消費', 'kcal']],
};
function metricVal(m, sets) {
  const w = sets.filter((s) => s.t !== 'w');
  const S_ = (f) => w.reduce((a, s) => a + f(s), 0);
  const M_ = (f) => Math.max(0, ...w.map(f));
  switch (m) {
    case 'max': return M_((s) => num(s.w));
    case 'e1rm': return Math.round(M_((s) => e1rm(num(s.w), num(s.r))) * 10) / 10;
    case 'vol': return S_((s) => num(s.w) * num(s.r));
    case 'reps': return S_((s) => num(s.r));
    case 'best': return M_((s) => num(s.r) || num(s.s));
    case 'maxw': return M_((s) => num(s.w));
    case 'total': return S_((s) => num(s.s));
    case 'min': return S_((s) => num(s.min));
    case 'km': return S_((s) => num(s.km));
    case 'kcal': return S_((s) => num(s.kcal));
  }
  return 0;
}
function viewExStats(id) {
  const x = ex(id);
  setTop(esc(x.name), `<button class="ib" data-a="back" data-h="#/stats" aria-label="戻る">${icon.left}</button>`);
  const ms = METRICS[x.kind];
  if (!ms.some(([k]) => k === CUR.metric)) CUR.metric = ms[0][0];
  const unit = ms.find(([k]) => k === CUR.metric)[2];
  const data = [...perDate(id).entries()];
  const cut = { '3m': addDays(today(), -90), '1y': addDays(today(), -365), all: '0000' }[CUR.range];
  let run = 0;
  const pts = data.map(([d, sets]) => {
    const y = metricVal(CUR.metric, sets);
    const pr = y > run && run > 0; run = Math.max(run, y);
    return { x: d, y, pr };
  }).filter((p) => p.x >= cut);
  // 自己ベスト
  let prs = '';
  if (x.kind === 'weight') {
    let mw = { v: 0 }, m1 = { v: 0 }, mv = { v: 0 };
    for (const [d, sets] of data) {
      for (const s of sets) if (s.t !== 'w') {
        if (num(s.w) > mw.v) mw = { v: num(s.w), d, r: num(s.r) };
        const e = e1rm(num(s.w), num(s.r)); if (e > m1.v) m1 = { v: e, d };
      }
      const v = metricVal('vol', sets); if (v > mv.v) mv = { v, d };
    }
    prs = `<div class="prs">
      <div><b>${f2(mw.v)}<small>kg</small></b><span>最大重量${mw.d ? `<br>${md(mw.d)} ×${mw.r}回` : ''}</span></div>
      <div><b>${f2(Math.round(m1.v * 10) / 10)}<small>kg</small></b><span>推定1RM${m1.d ? `<br>${md(m1.d)}` : ''}</span></div>
      <div><b>${kg(mv.v)}</b><span>1日の最大<br>ボリューム</span></div>
    </div>`;
  } else {
    prs = `<div class="prs">${ms.slice(0, 3).map(([k, l, u]) => {
      let best = 0, bd = '';
      for (const [d, sets] of data) { const v = metricVal(k, sets); if (v > best) { best = v; bd = d; } }
      return `<div><b>${f2(best)}<small>${u}</small></b><span>${l}${bd ? `<br>${md(bd)}` : ''}</span></div>`;
    }).join('')}</div>`;
  }
  view(`
    <div class="row" style="gap:6px;margin-bottom:10px;flex-wrap:wrap">${x.parts.map(chip).join('')}<span class="sub small">${x.src === 'kongou' ? MTYPE[x.mtype] || '' : KINDS[x.kind]}</span><span class="sub small grow" style="text-align:right">${data.length}回記録</span></div>
    <div class="card">${prs}</div>
    <div class="card">
      <div class="seg" style="margin-bottom:10px">${ms.map(([k, l]) => `<button class="${CUR.metric === k ? 'on' : ''}" data-a="metric" data-v="${k}">${l}</button>`).join('')}</div>
      ${pts.length ? chartSvg(pts, unit) : '<div class="empty">この期間の記録がありません</div>'}
      <div class="seg" style="margin-top:10px">${[['3m', '3ヶ月'], ['1y', '1年'], ['all', '全期間']].map(([k, l]) => `<button class="${CUR.range === k ? 'on' : ''}" data-a="range" data-v="${k}">${l}</button>`).join('')}</div>
    </div>
    ${S.notes[id] ? `<div class="card" style="color:var(--abs);font-size:13px">${icon.note} ${esc(S.notes[id])}</div>` : ''}
    <h2>履歴</h2>
    <div class="card" style="padding:4px 12px">
      ${data.length ? [...data].reverse().map(([d, sets]) => `<a class="hist" href="#/day/${d}"><div class="hd">${jd(d)}</div><div class="hs grow">${esc(summarize(x.kind, sets))}</div></a>`).join('') : '<div class="empty">まだ記録がありません</div>'}
    </div>
  `);
}
function chartSvg(pts, unit) {
  const W = 340, H = 170, L = 38, R = 10, Tp = 10, B = 22;
  const xs = pts.map((p) => pd(p.x).getTime());
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y));
  if (y0 === y1) { y0 -= Math.max(1, y0 * 0.1); y1 += Math.max(1, y1 * 0.1); }
  const pdY = (y1 - y0) * 0.12; y0 = Math.max(0, y0 - pdY); y1 += pdY;
  const X = (t) => (x1 === x0 ? (L + W - R) / 2 : L + ((t - x0) / (x1 - x0)) * (W - L - R));
  const Y = (v) => Tp + (1 - (v - y0) / (y1 - y0)) * (H - Tp - B);
  const P = pts.map((p, i) => [X(xs[i]), Y(p.y)]);
  const line = P.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join('');
  const area = P.length > 1 ? `${line}L${P.at(-1)[0].toFixed(1)},${H - B}L${P[0][0].toFixed(1)},${H - B}Z` : '';
  const grid = [0, 1, 2, 3].map((i) => {
    const v = y0 + ((y1 - y0) * i) / 3, y = Y(v);
    return `<line class="grid" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text x="${L - 6}" y="${y + 3}" text-anchor="end">${v >= 1000 ? Math.round(v / 100) / 10 + 'k' : f2(Math.round(v * 10) / 10)}</text>`;
  }).join('');
  const r = pts.length > 40 ? 2 : 3.5;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="推移グラフ（${unit}）">
    ${grid}
    ${area ? `<path class="ar" d="${area}"/>` : ''}<path class="ln" d="${line}"/>
    ${P.map(([a, b], i) => `<circle class="pt ${pts[i].pr ? 'pr' : ''}" cx="${a.toFixed(1)}" cy="${b.toFixed(1)}" r="${r}"/>`).join('')}
    <text x="${L}" y="${H - 6}">${md(pts[0].x)}</text>
    ${pts.length > 1 ? `<text x="${W - R}" y="${H - 6}" text-anchor="end">${md(pts.at(-1).x)}</text>` : ''}
    <text x="${W - R}" y="${Tp + 2}" text-anchor="end">${unit}</text>
  </svg>`;
}

/* ---------- ルーティン ---------- */
let RT = null;
function viewRoutines() {
  setTop('ルーティン');
  view(`
    <p class="sub" style="margin:0 4px 12px">よくやるメニューを登録しておくと、日の画面から一発で追加できます。</p>
    ${S.routines.map((r) => `<a class="card" style="display:block" href="#/routines/${r.id}">
      <div class="row"><b class="grow" style="font-size:16px">${esc(r.name)}</b><span class="sub small">${r.items.length}種目</span></div>
      <div class="row" style="gap:4px;margin:6px 0 4px;flex-wrap:wrap">${[...new Set(r.items.flatMap((i) => ex(i.ex).parts))].map(chip).join('')}</div>
      <div class="sub small">${esc(r.items.map((i) => ex(i.ex).name).join('、'))}</div>
    </a>`).join('') || '<div class="empty">ルーティンはまだありません</div>'}
    <button class="btn pri block" data-a="rt-new">${icon.plus}新しいルーティン</button>
  `);
}
function viewRoutine(id) {
  const r = S.routines.find((x) => x.id === id);
  if (!r) return go('#/routines');
  RT = r;
  setTop('ルーティン編集', `<button class="ib" data-a="back" data-h="#/routines" aria-label="戻る">${icon.left}</button>`);
  view(`
    <label class="lb">名前</label>
    <input class="f" data-f="rt-name" value="${esc(r.name)}">
    <h2>種目（セット数・目標）</h2>
    <div class="card" style="padding:4px 12px">
      ${r.items.map((it, i) => {
        const x = ex(it.ex);
        return `<div class="rt-item" data-ri="${i}">
          <div class="grow"><div style="font-weight:600;line-height:1.3">${esc(x.name)}</div><div class="row" style="gap:4px;margin-top:2px">${x.parts.map(chip).join('')}</div>
            <div class="row" style="gap:4px;margin-top:6px;font-size:12px" >
              <input class="f" data-f="rt-n" inputmode="numeric" value="${esc(it.n)}"><span class="sub">セット</span>
              ${x.kind === 'weight' || x.kind === 'bw' ? `<input class="f" data-f="rt-w" inputmode="decimal" value="${esc(it.w ?? '')}" placeholder="kg"><span class="sub">kg×</span><input class="f" data-f="rt-r" inputmode="numeric" value="${esc(it.r ?? '')}" placeholder="回"><span class="sub">回</span>` : ''}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <button class="mini-ib" data-a="rt-up" aria-label="上へ">${icon.up}</button>
            <button class="mini-ib" data-a="rt-del" aria-label="削除">${icon.trash}</button>
          </div>
        </div>`;
      }).join('') || '<div class="empty">種目を追加してください</div>'}
    </div>
    <button class="btn block" data-a="rt-add">${icon.plus}種目を追加</button>
    <p class="sub small" style="margin:8px 4px">kg・回を空欄にすると、追加するときに前回の記録が入ります。</p>
    <div class="btns" style="margin-top:12px">
      <button class="btn pri" data-a="rt-apply-today">今日に追加</button>
      <button class="btn danger" data-a="rt-delete">削除</button>
    </div>
  `);
}
function applyRoutine(r, date) {
  const o = dayObj(date, true);
  for (const it of r.items) {
    const target = (it.w !== '' && it.w != null) || (it.r !== '' && it.r != null) ? it : null;
    const e = newEntry(it.ex, date, target);
    if (!target) e.sets = e.sets.slice(0, Math.max(1, num(it.n))).concat(Array.from({ length: Math.max(0, num(it.n) - e.sets.length) }, () => ({ p: { ...(e.sets.at(-1)?.p || {}) } })));
    o.entries.push(e);
  }
  save();
}

/* ---------- 設定 ---------- */
function viewSettings() {
  setTop('設定');
  const st = S.settings;
  const tg = (k) => `<button class="btn sm ${st[k] ? 'pri' : ''}" data-a="toggle" data-k="${k}" style="min-width:64px">${st[k] ? 'ON' : 'OFF'}</button>`;
  view(`
    <h2>休憩タイマー</h2>
    <div class="card">
      <div class="row"><span class="grow">休憩時間</span><select class="f" data-f="rest" style="width:auto">${[30, 45, 60, 75, 90, 120, 150, 180, 240, 300].map((s) => `<option value="${s}" ${st.rest === s ? 'selected' : ''}>${s >= 60 ? `${Math.floor(s / 60)}分${s % 60 ? `${s % 60}秒` : ''}` : `${s}秒`}</option>`).join('')}</select></div>
      <div class="row" style="margin-top:10px"><span class="grow">セット完了で自動スタート</span>${tg('auto')}</div>
      <div class="row" style="margin-top:10px"><span class="grow">終了時に音を鳴らす</span>${tg('sound')}</div>
    </div>
    <h2>表示</h2>
    <div class="card">
      <div class="row"><span class="grow">週のはじまり</span><select class="f" data-f="week" style="width:auto"><option value="0" ${st.week === 0 ? 'selected' : ''}>日曜</option><option value="1" ${st.week === 1 ? 'selected' : ''}>月曜</option></select></div>
      <div class="row" style="margin-top:10px"><span class="grow">記録中は画面を消さない</span>${tg('wake')}</div>
    </div>
    <h2>マイジム</h2>
    <div class="card">
      <div class="row"><span class="grow">★を付けたマシン・種目</span><b>${S.fav.length}</b></div>
      <button class="btn block" style="margin-top:10px" data-a="fav-edit">${icon.star}マイジムのマシンを選ぶ</button>
    </div>
    ${S.custom.length ? `<h2>カスタム種目</h2><div class="card" style="padding:4px 12px">${S.custom.map((c) => `<div class="exrow"><div class="grow">${esc(c.name)} <span class="sub small">${KINDS[c.kind]}</span></div>${chip(c.parts[0])}<button class="mini-ib" data-a="custom-del" data-id="${esc(c.id)}" aria-label="削除">${icon.trash}</button></div>`).join('')}</div>` : ''}
    <h2>データ</h2>
    <div class="card">
      <p class="sub small" style="margin:0 0 10px">記録はこの端末のブラウザ内だけに保存されます。機種変更やブラウザのデータ削除に備えて、ときどきバックアップしてください。</p>
      <div class="btns">
        <button class="btn" data-a="export">バックアップ保存</button>
        <label class="btn" style="cursor:pointer">復元<input type="file" accept="application/json,.json" data-f="import" hidden></label>
      </div>
      <button class="btn danger block" style="margin-top:10px" data-a="wipe">すべてのデータを削除</button>
    </div>
    <p class="sub small" style="text-align:center;margin:20px 0 0">マシン一覧の出典：<a href="https://www.kongou-fitness.com/product/" target="_blank" rel="noopener" style="text-decoration:underline">KONGOU 製品一覧</a>（${KONGOU.length}機種）</p>
  `);
}

/* ---------- アクション ---------- */
const A = {
  close: () => closeSheet(),
  back: (el) => go(el.dataset.h),
  'cal-move': (el) => moveMonth(+el.dataset.n),
  'cal-today': () => { CUR.month = today().slice(0, 7); viewCal(); },
  'open-day': (el) => go(`#/day/${el.dataset.d}`),
  'day-move': (el) => location.replace(`#/day/${addDays(DAY, +el.dataset.n)}`),
  'pick-day': () => openPicker('day'),
  'timer-start': () => startTimer(),
  'timer-add': (el) => { if (T) { T.end += +el.dataset.n * 1000; T.total = Math.max(T.total, Math.ceil((T.end - Date.now()) / 1000)); T.fired = T.end <= Date.now(); persistT(); tick(); } },
  'timer-stop': () => { T = null; persistT(); tick(); },

  check: (el) => {
    const { e, s, si, x } = entryAt(el);
    if (!s.done) {
      for (const [f] of FIELDS[x.kind]) if (s[f] === '' || s[f] == null) { const v = effP(e, si, f); if (v !== '') s[f] = v; }
      if (!valid(x.kind, s)) {
        toast(x.kind === 'hold' ? '秒数を入力してください' : x.kind === 'time' ? '時間か距離を入力してください' : '回数を入力してください');
        el.closest('.set').querySelector('input:placeholder-shown')?.focus();
        return;
      }
      s.done = true;
      if (S.settings.auto && x.kind !== 'time') startTimer();
    } else s.done = false;
    save(); rerenderDay();
  },
  'add-set': (el) => {
    const { e } = entryAt(el);
    const last = e.sets.at(-1);
    const p = last ? Object.fromEntries(FIELDS[ex(e.ex).kind].map(([f]) => [f, last[f] !== '' && last[f] != null ? last[f] : last.p?.[f] ?? ''])) : {};
    e.sets.push({ p });
    save(); rerenderDay();
    setTimeout(() => document.querySelector(`[data-ei="${el.closest('[data-ei]').dataset.ei}"] .set:last-child input`)?.focus(), 30);
  },
  'del-set': (el) => { const { e } = entryAt(el); e.sets.pop(); save(); rerenderDay(); },
  smenu: (el) => {
    const { ei, si, s } = entryAt(el);
    menu(`セット ${si + 1}`, [
      ['set-type', '通常セット', '', s.t ? '' : 'on', `data-ei="${ei}" data-si="${si}" data-v=""`],
      ['set-type', 'ウォームアップ（W・集計に含めない）', '', '', `data-ei="${ei}" data-si="${si}" data-v="w"`],
      ['set-type', 'ドロップセット（D）', '', '', `data-ei="${ei}" data-si="${si}" data-v="d"`],
      ['set-dup', 'このセットを複製', icon.copy, '', `data-ei="${ei}" data-si="${si}"`],
      ['set-del', 'このセットを削除', icon.trash, 'danger', `data-ei="${ei}" data-si="${si}"`],
    ]);
  },
  'set-type': (el) => { const s = dayEntries(DAY)[+el.dataset.ei].sets[+el.dataset.si]; s.t = el.dataset.v || undefined; save(); closeSheet(); rerenderDay(); },
  'set-dup': (el) => { const e = dayEntries(DAY)[+el.dataset.ei]; const s = e.sets[+el.dataset.si]; e.sets.splice(+el.dataset.si + 1, 0, { ...structuredClone(s), done: false }); save(); closeSheet(); rerenderDay(); },
  'set-del': (el) => { dayEntries(DAY)[+el.dataset.ei].sets.splice(+el.dataset.si, 1); save(); closeSheet(); rerenderDay(); },
  emenu: (el) => {
    const { ei, x, e } = entryAt(el);
    const d = `data-ei="${ei}"`;
    menu(esc(x.name), [
      ['e-stats', '推移を見る', icon.chart, '', `data-id="${esc(e.ex)}"`],
      ...(x.src === 'kongou' ? [['e-info', 'マシン情報', icon.info, '', d]] : []),
      ['e-swap', '種目を入れ替え', icon.swap, '', d],
      ...(ei > 0 ? [['e-up', '上へ移動', icon.up, '', d]] : []),
      ...(ei < dayEntries(DAY).length - 1 ? [['e-down', '下へ移動', icon.down, '', d]] : []),
      ['e-del', 'この種目を削除', icon.trash, 'danger', d],
    ]);
  },
  'e-stats': (el) => closeSheet(`#/stats/ex/${encodeURIComponent(el.dataset.id)}`),
  'e-info': (el) => machineInfo(dayEntries(DAY)[+el.dataset.ei].ex),
  info: (el) => machineInfo(entryAt(el).e.ex),
  'e-swap': (el) => openPicker('swap', { ei: +el.dataset.ei }),
  'e-up': (el) => { const es = dayEntries(DAY), i = +el.dataset.ei; [es[i - 1], es[i]] = [es[i], es[i - 1]]; save(); closeSheet(); rerenderDay(); },
  'e-down': (el) => { const es = dayEntries(DAY), i = +el.dataset.ei; [es[i + 1], es[i]] = [es[i], es[i + 1]]; save(); closeSheet(); rerenderDay(); },
  'e-del': (el) => {
    const es = dayEntries(DAY), i = +el.dataset.ei;
    if (validSets(es[i]).length && !confirm(`「${ex(es[i].ex).name}」の記録を削除しますか？`)) return;
    es.splice(i, 1); save(); closeSheet(); rerenderDay();
  },
  note: (el) => noteEditor(entryAt(el).e.ex),
  'note-save': (el) => {
    const v = $('#note-in').value.trim();
    if (v) S.notes[el.dataset.id] = v; else delete S.notes[el.dataset.id];
    save(); closeSheet(); route();
  },
  'm-note': (el) => noteEditor(el.dataset.id),

  // ピッカー
  'pk-src': (el) => { PK.src = el.dataset.v; pickerShell(); },
  'pk-part': (el) => { PK.part = el.dataset.v; renderPk(); $('#pk-sb').scrollTop = 0; },
  pk: (el) => {
    const id = el.dataset.id;
    if (PK.mode === 'swap') {
      const es = dayEntries(DAY);
      es[PK.ei] = { ...newEntry(id, DAY), id: es[PK.ei].id };
      save(); closeSheet(); rerenderDay(); return;
    }
    if (PK.mode === 'fav') return A.star(el);
    PK.sel.includes(id) ? PK.sel.splice(PK.sel.indexOf(id), 1) : PK.sel.push(id);
    const sel = PK.sel.includes(id);
    el.classList.toggle('sel', sel);
    $('.ck', el).innerHTML = sel ? icon.check : '';
    const n = PK.sel.length;
    const b = $('[data-a="pk-add"]');
    b.disabled = !n; b.style.opacity = n ? '' : '.4'; b.textContent = n ? `${n}種目を追加` : '種目をタップして選択';
  },
  star: (el) => {
    const id = el.dataset.id;
    S.fav.includes(id) ? S.fav.splice(S.fav.indexOf(id), 1) : S.fav.push(id);
    save();
    const btn = el.matches('.st') ? el : $('.st', el);
    btn?.classList.toggle('on', S.fav.includes(id));
    if (!el.closest('.pk-item')) toast(S.fav.includes(id) ? 'マイジムに追加しました' : 'マイジムから外しました');
  },
  'pk-add': () => {
    if (!PK.sel.length) return;
    if (PK.mode === 'day') {
      const o = dayObj(DAY, true);
      for (const id of PK.sel) o.entries.push(newEntry(id, DAY));
      save(); closeSheet(); rerenderDay();
      setTimeout(() => document.querySelector('.entry:last-child')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    } else if (PK.mode === 'routine') {
      for (const id of PK.sel) RT.items.push({ ex: id, n: ex(id).kind === 'time' || ex(id).kind === 'hold' ? 1 : 3, w: '', r: '' });
      save(); closeSheet(); viewRoutine(RT.id);
    }
  },
  'custom-new': () => customForm(),
  'back-picker': () => pickerShell(),
  'custom-save': () => {
    const name = $('#cu-name').value.trim();
    if (!name) return toast('名前を入れてください');
    const c = { id: 'c:' + uid(), name, parts: [$('#cu-part').value], kind: $('#cu-kind').value };
    S.custom.push(c); buildEx(); save();
    PK.q = ''; PK.src = 'all'; PK.part = 'all';
    if (PK.mode === 'day' || PK.mode === 'routine') PK.sel.push(c.id);
    if (PK.mode === 'swap') { const es = dayEntries(DAY); es[PK.ei] = { ...newEntry(c.id, DAY), id: es[PK.ei].id }; save(); closeSheet(); rerenderDay(); return; }
    pickerShell();
    toast(`「${name}」を作成しました`);
  },
  'custom-del': (el) => {
    const id = el.dataset.id;
    const used = Object.values(S.days).some((d) => d.entries?.some((e) => e.ex === id));
    if (!confirm(used ? 'この種目は記録で使われています。削除すると記録の種目名が表示できなくなります。削除しますか？' : 'このカスタム種目を削除しますか？')) return;
    S.custom = S.custom.filter((c) => c.id !== id); S.fav = S.fav.filter((f) => f !== id);
    buildEx(); save(); viewSettings();
  },
  'fav-edit': () => openPicker('fav'),

  // 日のツール
  'apply-routine': () => {
    if (!S.routines.length) { toast('ルーティンが未登録です（ルーティンタブで作成）'); return; }
    menu('ルーティンから追加', S.routines.map((r) => ['rt-apply', `${esc(r.name)}<span class="sub small" style="margin-left:auto">${r.items.length}種目</span>`, icon.dumbbell, '', `data-id="${r.id}"`]));
  },
  'rt-apply': (el) => { applyRoutine(S.routines.find((r) => r.id === el.dataset.id), DAY); closeSheet(); rerenderDay(); },
  'copy-day': () => {
    const days = Object.keys(S.days).filter((d) => d !== DAY && dayEntries(d).length).sort().reverse().slice(0, 30);
    if (!days.length) { toast('コピーできる過去の記録がありません'); return; }
    openSheet(`<div class="sh"><h3>どの日のメニューをコピー？</h3><button class="btn sm" data-a="close">閉じる</button></div>
      <div class="sb">${days.map((d) => `<button class="recent" style="width:100%;text-align:left" data-a="copy-from" data-d="${d}">
        <div class="date"><b>${pd(d).getDate()}</b><span>${pd(d).getMonth() + 1}月 ${WD[pd(d).getDay()]}</span></div>
        <div class="grow"><div class="row" style="gap:4px;flex-wrap:wrap">${dayParts(d).map(chip).join('')}</div><div class="sub" style="margin-top:3px">${esc(dayEntries(d).map((e) => ex(e.ex).name).join('、'))}</div></div>
      </button>`).join('')}</div>`, { full: true });
  },
  'copy-from': (el) => {
    const o = dayObj(DAY, true);
    for (const e of dayEntries(el.dataset.d)) {
      const k = ex(e.ex).kind;
      const src = validSets(e).length ? validSets(e) : e.sets.map((s) => ({ ...s.p, t: s.t }));
      o.entries.push({ id: uid(), ex: e.ex, sets: src.map((s) => ({ p: Object.fromEntries(FIELDS[k].map(([f]) => [f, s[f] ?? ''])), ...(s.t ? { t: s.t } : {}) })) });
    }
    save(); closeSheet(); rerenderDay(); toast(`${md(el.dataset.d)} のメニューをコピーしました`);
  },
  'save-routine': () => {
    openSheet(`<div class="sh"><h3>ルーティンとして保存</h3></div><div class="sb">
      <label class="lb">名前</label><input class="f" id="rt-name-in" value="${esc(dayParts(DAY).map((p) => PARTS[p][0]).join('・') || 'メニュー')}の日">
      <button class="btn pri block" style="margin-top:14px" data-a="save-routine-do">保存</button></div>`);
  },
  'save-routine-do': () => {
    const items = dayEntries(DAY).map((e) => {
      const ws = workSets(e);
      return { ex: e.ex, n: Math.max(1, ws.length || e.sets.length), w: '', r: '' };
    });
    S.routines.push({ id: uid(), name: $('#rt-name-in').value.trim() || 'メニュー', items });
    save(); closeSheet(); toast('ルーティンに保存しました');
  },

  // ルーティン
  'rt-new': () => { const r = { id: uid(), name: '新しいルーティン', items: [] }; S.routines.push(r); save(); go(`#/routines/${r.id}`); },
  'rt-add': () => openPicker('routine'),
  'rt-up': (el) => { const i = +el.closest('[data-ri]').dataset.ri; if (i > 0) { [RT.items[i - 1], RT.items[i]] = [RT.items[i], RT.items[i - 1]]; save(); viewRoutine(RT.id); } },
  'rt-del': (el) => { RT.items.splice(+el.closest('[data-ri]').dataset.ri, 1); save(); viewRoutine(RT.id); },
  'rt-apply-today': () => { if (!RT.items.length) return toast('種目がありません'); applyRoutine(RT, today()); go(`#/day/${today()}`); toast('今日のメニューに追加しました'); },
  'rt-delete': () => { if (!confirm(`「${RT.name}」を削除しますか？`)) return; S.routines = S.routines.filter((r) => r !== RT); save(); go('#/routines'); },

  // 推移
  metric: (el) => { CUR.metric = el.dataset.v; route(); },
  range: (el) => { CUR.range = el.dataset.v; route(); },
  'heat-range': (el) => { CUR.heat = +el.dataset.v; route(); },

  // 設定
  toggle: (el) => { S.settings[el.dataset.k] = !S.settings[el.dataset.k]; save(); viewSettings(); if (el.dataset.k === 'sound') unlockAudio(); },
  export: () => {
    save(true);
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `gymlog-${today()}.json`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  wipe: () => {
    if (!confirm('すべての記録・ルーティン・設定を削除します。元に戻せません。よろしいですか？')) return;
    S = blank(); buildEx(); save(true); toast('削除しました'); viewSettings();
  },
};

function machineInfo(id) {
  const x = ex(id);
  const big = x.thumb ? `<img class="machine-big" src="${esc(x.big || x.thumb)}" alt="" referrerpolicy="no-referrer">` : '';
  openSheet(`<div class="sh"><h3>${esc(x.name)}</h3><button class="btn sm" data-a="close">閉じる</button></div>
    <div class="sb">
      ${big}
      <div class="row" style="gap:6px;margin:10px 0;flex-wrap:wrap">${x.parts.map(chip).join('')}<span class="sub small">${MTYPE[x.mtype] || ''}${x.codes?.length ? ' · ' + esc(x.codes.join(' / ')) : ''}</span></div>
      ${S.notes[id] ? `<div class="card" style="color:var(--abs);font-size:13px;background:#ffd43b14">${icon.note} ${esc(S.notes[id])}</div>` : ''}
      <div class="btns">
        <button class="btn" data-a="m-note" data-id="${esc(id)}">${icon.note}設定メモ</button>
        <button class="btn" data-a="star" data-id="${esc(id)}"><span class="st ${S.fav.includes(id) ? 'on' : ''}" style="display:contents">${icon.star}</span>マイジム</button>
      </div>
      ${x.url ? `<a class="btn ghost block" style="margin-top:8px" href="${esc(x.url)}" target="_blank" rel="noopener">KONGOU の製品ページを開く</a>` : ''}
    </div>`);
}
function noteEditor(id) {
  const x = ex(id);
  openSheet(`<div class="sh"><h3>設定メモ</h3><button class="btn sm" data-a="close">閉じる</button></div>
    <div class="sb">
      <div class="sub" style="margin-bottom:8px">${esc(x.name)} — 毎回表示されます</div>
      <textarea class="f" id="note-in" placeholder="例：シート3 / 背もたれ5 / グリップは広め">${esc(S.notes[id] || '')}</textarea>
      <button class="btn pri block" style="margin-top:12px" data-a="note-save" data-id="${esc(id)}">保存</button>
    </div>`);
  setTimeout(() => $('#note-in')?.focus(), 50);
}

document.addEventListener('click', (ev) => {
  unlockAudio();
  const el = ev.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const f = A[el.dataset.a];
  if (f) { ev.preventDefault(); f(el); }
});

document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.id === 'pk-q') { PK.q = el.value; renderPk(); return; }
  const f = el.dataset.f;
  if (!f) return;
  if (f === 'set') {
    const { e, s } = entryAt(el);
    s[el.dataset.k] = el.value.trim();
    save();
    const card = el.closest('.entry');
    card.querySelectorAll('.set').forEach((row, i) => row.querySelectorAll('input').forEach((inp) => {
      const v = effP(e, i, inp.dataset.k);
      if (v !== '') inp.placeholder = v;
    }));
    $('[data-ev]', card).innerHTML = entryEvHtml(e);
    $('#day-sum').innerHTML = daySumHtml(DAY);
    $('#day-heat').innerHTML = dayHeat(DAY);
  } else if (f === 'bw' || f === 'memo') {
    dayObj(DAY, true)[f] = el.value; save();
  } else if (f === 'rt-name') { RT.name = el.value; save(); }
  else if (f.startsWith('rt-')) {
    const it = RT.items[+el.closest('[data-ri]').dataset.ri];
    it[f.slice(3)] = el.value.trim(); save();
  }
});
document.addEventListener('change', (ev) => {
  const el = ev.target, f = el.dataset.f;
  if (f === 'rest' || f === 'week') { S.settings[f] = +el.value; save(); }
  if (f === 'import' && el.files[0]) {
    el.files[0].text().then((t) => {
      const d = JSON.parse(t);
      if (!d || !d.v || !d.days) throw 0;
      if (!confirm(`${Object.keys(d.days).length}日分の記録を復元します。今のデータは置き換わります。よろしいですか？`)) return;
      S = { ...blank(), ...d, settings: { ...blank().settings, ...d.settings } };
      buildEx(); save(true); toast('復元しました'); viewSettings();
    }).catch(() => toast('このファイルは読み込めませんでした'));
  }
});
// 入力欄フォーカスで全選択（数字の打ち直しを楽に）
document.addEventListener('focusin', (ev) => { if (ev.target.matches('.set input')) setTimeout(() => ev.target.select(), 0); });
// Enterで次の入力へ
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter' || !ev.target.matches('.set input')) return;
  ev.preventDefault();
  const all = [...document.querySelectorAll('.set input')];
  const i = all.indexOf(ev.target);
  if (all[i + 1]) all[i + 1].focus(); else ev.target.blur();
});

/* ---------- 長押しでマシン画像を拡大 ---------- */
let lp = null, peeked = false, swallowClick = false;
function peek(id) {
  const x = ex(id);
  const el = $('#peek');
  el.innerHTML = `<div class="pk-card"><img src="${esc(x.big || x.thumb)}" alt="" referrerpolicy="no-referrer" draggable="false"><b>${esc(x.name)}</b><span>${x.parts.map(chip).join('')} ${esc((x.codes || []).join(' / '))}</span></div><div class="sub small" style="margin-top:12px">指を離すと閉じます</div>`;
  el.hidden = false;
  peeked = true;
  navigator.vibrate?.(12);
}
function unpeek() { $('#peek').hidden = true; peeked = false; }
document.addEventListener('pointerdown', (e) => {
  const t = e.target.closest('[data-peek]');
  if (!t) return;
  lp = { x: e.clientX, y: e.clientY, timer: setTimeout(() => { swallowClick = true; peek(t.dataset.peek); }, 380) };
});
document.addEventListener('pointermove', (e) => {
  if (lp && !peeked && Math.hypot(e.clientX - lp.x, e.clientY - lp.y) > 10) { clearTimeout(lp.timer); lp = null; }
});
const endPress = (e) => {
  if (lp) { clearTimeout(lp.timer); lp = null; }
  if (peeked && e.type === 'pointerup') unpeek();
};
document.addEventListener('pointerup', endPress);
document.addEventListener('pointercancel', endPress);
$('#peek').addEventListener('click', unpeek);
document.addEventListener('click', (e) => { if (swallowClick) { swallowClick = false; e.stopPropagation(); e.preventDefault(); } }, true);
document.addEventListener('contextmenu', (e) => { if (e.target.closest('[data-peek]')) e.preventDefault(); });

if (T) buildTimer();
route();

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js');
