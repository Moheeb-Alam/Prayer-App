import * as A from './api.js';
import { t, setLang, TR } from './i18n.js';
import { DUAS, REMS } from './data.js';
const $ = s => document.querySelector(s), app = $('#app');
const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const sv = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const S = ld('st', { label: 'Bhakkar, Pakistan', city: 'Bhakkar', country: 'Pakistan', lat: null, lon: null, method: 1, school: 1, h24: false, lang: 'en', theme: 'auto' });
const N = ld('nt', { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 }), F = new Set(ld('fav', []));
const OR = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'], IC = { Fajr: '🌌', Sunrise: '🌅', Dhuhr: '☀️', Asr: '🌤', Maghrib: '🌇', Isha: '🌙' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const P2 = x => String(x).padStart(2, 0);
const lc = () => S.lat != null ? { lat: S.lat, lon: S.lon } : { city: S.city, country: S.country };
const o = () => ({ method: S.method, school: S.school });
let T = null, tz, SU = null, lastN = '', deferred;
const nowTZ = () => tz ? new Date(new Date().toLocaleString('en-US', { timeZone: tz })) : new Date();
const dmy = d => `${P2(d.getDate())}-${P2(d.getMonth() + 1)}-${d.getFullYear()}`;
const at = (s, b, add = 0) => { const [h, m] = s.slice(0, 5).split(':'); const d = new Date(b); d.setDate(d.getDate() + add); d.setHours(+h, +m, 0, 0); return d; };
const fmt = s => { const [h, m] = s.slice(0, 5).split(':').map(Number); return S.h24 ? `${P2(h)}:${P2(m)}` : `${h % 12 || 12}:${P2(m)} ${h < 12 ? 'AM' : 'PM'}`; };
const hms = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return [s / 3600 | 0, s % 3600 / 60 | 0, s % 60].map(P2).join(':'); };
const sk = () => app.innerHTML = '<div class="card sk"></div><div class="card sk"></div>';
const err = fn => { app.innerHTML = `<div class="card c"><p>⚠️ ${t('err')}</p><button class="btn" id="rt">${t('retry')}</button></div>`; $('#rt').onclick = fn; };
const today = async () => { T = await A.day(lc(), o(), dmy(nowTZ())); tz = T.meta.timezone; T.key = dmy(nowTZ()); };
function nextP() { const n = nowTZ(); for (const k of OR) { const d = at(T.timings[k], n); if (d > n) return [k, d]; } return ['Fajr', at(T.timings.Fajr, n, 1)]; }
const until = k => { const n = nowTZ(); let d = at(T.timings[k], n); if (d <= n) d = at(T.timings[k], n, 1); return hms(d - n); };
const favBtn = id => `<button class="fav" data-id="${id}" aria-label="Save">${F.has(id) ? '★' : '☆'}</button>`;

function apply() {
  setLang(S.lang);
  const d = document.documentElement; d.lang = S.lang; d.dir = S.lang === 'en' ? 'ltr' : 'rtl';
  d.dataset.theme = S.theme === 'auto' ? (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light') : S.theme;
  document.querySelectorAll('[data-t]').forEach(e => e.textContent = t(e.dataset.t));
}
const save = () => sv('st', S);

async function notify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const r = await navigator.serviceWorker?.getRegistration();
  r ? r.showNotification(title, { body, icon: 'icon.svg', tag: title }) : new Notification(title, { body });
}
function tick() {
  const n = nowTZ(); $('#clock').textContent = n.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !S.h24 });
  if (!T) return;
  if (dmy(n) !== T.key) { T = null; route(); return; }
  const [k, d] = nextP(), cd = $('#cd');
  if (cd) { cd.textContent = hms(d - n); $('#np').textContent = `${t(k)} · ${fmt(T.timings[k])}`; document.querySelectorAll('.row[data-k]').forEach(r => r.classList.toggle('on', r.dataset.k === k)); }
  if ($('#sc')) { $('#sc').textContent = until('Fajr'); $('#ic').textContent = until('Maghrib'); }
  const mn = n.getHours() * 60 + n.getMinutes();
  for (const p of OR) if (N[p]) { const [h, m] = T.timings[p].split(':'); if (mn === +h * 60 + +m.slice(0, 2) && lastN !== p + T.key) { lastN = p + T.key; notify(t(p), `${fmt(T.timings[p])} · ${S.label}`); } }
}

const V = {};
V.home = async () => {
  sk(); try { await today(); } catch { return err(V.home); }
  const h = T.date.hijri, g = T.date.gregorian, r = REMS[Math.floor(Date.now() / 864e5) % REMS.length];
  app.innerHTML = `<section class="hero"><svg class="dome" viewBox="0 0 120 60" aria-hidden="true"><path d="M10 60V38h8v-8l-4-4 4-4V10l2-4 2 4v12l4 4-4 4v8h8V60zM110 60V38h-8v-8l4-4-4-4V10l-2-4-2 4v12l-4 4 4 4v8h-8V60zM36 60V40a24 24 0 0148 0v20z" fill="currentColor" opacity=".16"/></svg>
  <a class="loc" href="#settings">📍 ${esc(S.label)}</a><h1>${g.weekday.en}, ${g.day} ${g.month.en} ${g.year}</h1><p class="ar">${h.day} ${h.month.ar} ${h.year} هـ</p><p class="sub">${h.day} ${h.month.en} ${h.year} AH</p>
  <div class="cdw"><small>${t('next')}: <b id="np"></b></small><div id="cd" class="cd">--:--:--</div></div></section>
  <div class="card">${OR.map(k => `<div class="row" data-k="${k}"><span>${IC[k]} ${t(k)}</span><b>${fmt(T.timings[k])}</b></div>`).join('')}</div>
  <div class="card"><small>${t('rem')}</small><p>${esc(r)}</p></div>`; tick();
};
V.cal = async (m = new Date().toISOString().slice(0, 7)) => {
  app.innerHTML = `<div class="card"><input type="month" id="mo" value="${m}" aria-label="Month"></div><div id="tb"><div class="card sk"></div></div>`;
  $('#mo').onchange = e => e.target.value && V.cal(e.target.value);
  const [y, mm] = m.split('-');
  try {
    const d = await A.month(lc(), o(), y, +mm), td = T ? T.key : dmy(new Date());
    $('#tb').innerHTML = `<div class="card scroll"><table><tr><th>${t('date')}</th>${OR.map(k => `<th>${t(k)}</th>`).join('')}</tr>${d.map(x => `<tr class="${x.date.gregorian.date === td ? 'on' : ''}"><td>${x.date.gregorian.day}</td>${OR.map(k => `<td>${fmt(x.timings[k])}</td>`).join('')}</tr>`).join('')}</table></div>`;
  } catch { $('#tb').innerHTML = `<div class="card c">⚠️ ${t('err')}</div>`; }
};
V.conv = () => {
  const iso = new Date().toISOString().slice(0, 10);
  app.innerHTML = `<div class="card"><h3>${t('g2h')}</h3><input type="date" id="gd" value="${iso}"><button class="btn" id="g">${t('go')}</button><p id="go" class="out"></p></div>
  <div class="card"><h3>${t('h2g')}</h3><div class="grp"><input id="hd" type="number" min="1" max="30" value="1" aria-label="Day"><input id="hm" type="number" min="1" max="12" value="9" aria-label="Month"><input id="hy" type="number" value="1448" aria-label="Year"></div><button class="btn" id="h">${t('go')}</button><p id="ho" class="out"></p></div>`;
  $('#g').onclick = async () => { const [y, m, d] = $('#gd').value.split('-'); try { const h = (await A.gToH(`${d}-${m}-${y}`)).hijri; $('#go').innerHTML = `${h.day} ${h.month.en} ${h.year} AH<br><span class="ar">${h.day} ${h.month.ar} ${h.year}</span>`; } catch { $('#go').textContent = t('err'); } };
  $('#h').onclick = async () => { try { const g = (await A.hToG(`${P2($('#hd').value)}-${P2($('#hm').value)}-${$('#hy').value}`)).gregorian; $('#ho').textContent = `${g.weekday.en}, ${g.day} ${g.month.en} ${g.year}`; } catch { $('#ho').textContent = t('err'); } };
};
V.qibla = async () => {
  sk(); let d; try { if (!T) await today(); d = (await A.qibla(T.meta.latitude, T.meta.longitude)).direction; } catch { return err(V.qibla); }
  app.innerHTML = `<div class="card c"><div class="compass"><div id="nd" class="needle" style="--a:${d}deg"></div><i>N</i></div><h2>${d.toFixed(1)}°</h2><p>${t('qdesc')}</p><button class="btn" id="se">${t('sensor')}</button></div>`;
  $('#se').onclick = async () => {
    try {
      if (DeviceOrientationEvent.requestPermission && await DeviceOrientationEvent.requestPermission() !== 'granted') return;
      const h = e => { const hd = e.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null); if (hd != null && $('#nd')) $('#nd').style.setProperty('--a', (d - hd) + 'deg'); };
      addEventListener('deviceorientationabsolute', h, true); addEventListener('deviceorientation', h, true);
    } catch { alert(t('err')); }
  };
};
V.quran = async () => {
  sk(); try { SU ??= await A.surahs(); } catch { return err(V.quran); }
  app.innerHTML = `<div class="card"><input id="qs" type="search" placeholder="${t('search')}" aria-label="${t('search')}"></div><div id="ql"></div>`;
  const draw = () => { const v = $('#qs').value.toLowerCase(); $('#ql').innerHTML = SU.filter(s => (s.englishName + s.englishNameTranslation + s.number).toLowerCase().includes(v)).map(s => `<div class="card item"><b class="num">${s.number}</b><a href="#surah/${s.number}"><span>${s.englishName}</span><small>${s.englishNameTranslation} · ${s.numberOfAyahs}</small></a><span class="ar">${s.name}</span>${favBtn('s' + s.number)}</div>`).join(''); };
  $('#qs').oninput = draw; draw();
};
V.surah = async n => {
  sk(); let a, b; try { [a, b] = await A.surah(n, TR[S.lang]); } catch { return err(() => V.surah(n)); }
  app.innerHTML = `<div class="card c"><a href="#quran">← ${t('quran')}</a><h2 class="ar">${a.name}</h2><p>${a.englishName} · ${a.englishNameTranslation}</p><audio controls preload="none" src="${A.audio(n)}" aria-label="${t('listen')}"></audio></div>${a.ayahs.map((x, i) => `<div class="card ay"><span class="num">${x.numberInSurah}</span><p class="ar big">${esc(x.text)}</p><p ${S.lang !== 'en' ? 'dir="rtl"' : ''}>${esc(b.ayahs[i].text)}</p></div>`).join('')}`;
};
V.tasbih = () => {
  const s = ld('tas', { c: 0, tot: 0, tg: 33 });
  app.innerHTML = `<div class="card c"><p class="ar big">سُبْحَانَ ٱللَّٰهِ</p><button id="tp" class="tap" aria-label="Count"><span id="tc">${s.c}</span><small>/ ${s.tg}</small></button><p>${t('total')}: <b id="tt">${s.tot}</b></p><div class="grp"><select id="ts" aria-label="Target"><option>33</option><option>99</option><option>100</option></select><button class="btn alt" id="tr">${t('reset')}</button></div></div>`;
  $('#ts').value = s.tg; $('#ts').onchange = e => { s.tg = +e.target.value; s.c = 0; sv('tas', s); V.tasbih(); };
  $('#tp').onclick = () => { s.c++; s.tot++; if (s.c >= s.tg) { s.c = 0; navigator.vibrate?.([80, 40, 80]); } else navigator.vibrate?.(15); sv('tas', s); $('#tc').textContent = s.c; $('#tt').textContent = s.tot; };
  $('#tr').onclick = () => { s.c = 0; s.tot = 0; sv('tas', s); V.tasbih(); };
};
V.duas = () => { app.innerHTML = DUAS.map((d, i) => `<div class="card"><div class="item"><b>${d.t}</b>${favBtn('d' + i)}</div><p class="ar big">${d.a}</p><p>${d.e}</p></div>`).join(''); };
V.ramadan = async () => {
  sk(); let d, y; try { if (!T) await today(); y = T.date.hijri.year; d = await A.hijriMonth(lc(), o(), y, 9); } catch { return err(V.ramadan); }
  app.innerHTML = `<div class="card c"><h3>${t('ramadan')} ${y}</h3><div class="two"><div><small>${t('sehri')}</small><div id="sc" class="cd s">--</div></div><div><small>${t('iftar')}</small><div id="ic" class="cd s">--</div></div></div></div>
  <div class="card scroll"><table><tr><th>#</th><th>${t('date')}</th><th>${t('sehri').split(' ')[0]}</th><th>${t('iftar').split(' ')[0]}</th></tr>${d.map(x => `<tr><td>${x.date.hijri.day}</td><td>${x.date.gregorian.day} ${x.date.gregorian.month.en.slice(0, 3)}</td><td>${fmt(x.timings.Fajr)}</td><td>${fmt(x.timings.Maghrib)}</td></tr>`).join('')}</table></div>`; tick();
};
V.notif = () => {
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  app.innerHTML = `<div class="card"><p>${t('nhelp')}</p><button class="btn" id="ap">${t('allow')}: <span id="ps">${perm}</span></button></div><div class="card">${Object.keys(N).map(k => `<label class="row"><span>${t(k)}</span><input type="checkbox" class="sw" data-k="${k}" ${N[k] ? 'checked' : ''}></label>`).join('')}</div><button class="btn alt" id="nt">${t('test')}</button>`;
  $('#ap').onclick = async () => { if ('Notification' in window) $('#ps').textContent = await Notification.requestPermission(); };
  document.querySelectorAll('.sw').forEach(c => c.onchange = () => { N[c.dataset.k] = +c.checked; sv('nt', N); });
  $('#nt').onclick = () => notify('Noor', t('test'));
};
V.saved = async () => {
  try { SU ??= await A.surahs(); } catch {}
  const items = [...F].map(id => id[0] === 's' ? (SU || []).find(s => 's' + s.number === id) && `<div class="card item"><a href="#surah/${id.slice(1)}">${SU.find(s => 's' + s.number === id).englishName}</a>${favBtn(id)}</div>` : DUAS[id.slice(1)] && `<div class="card"><div class="item"><b>${DUAS[id.slice(1)].t}</b>${favBtn(id)}</div><p class="ar big">${DUAS[id.slice(1)].a}</p></div>`).filter(Boolean);
  app.innerHTML = items.length ? items.join('') : `<div class="card c"><p>🔖 ${t('empty')}</p><a class="btn" href="#quran">${t('quran')}</a></div>`;
};
V.more = () => { app.innerHTML = `<div class="grid">${[['tasbih', '📿'], ['duas', '🤲'], ['ramadan', '🌙'], ['conv', '📅'], ['notif', '🔔'], ['saved', '🔖'], ['settings', '⚙️']].map(([k, i]) => `<a class="card c tile" href="#${k}"><span>${i}</span>${t(k)}</a>`).join('')}</div>`; };
V.settings = () => {
  app.innerHTML = `<div class="card"><h3>📍 ${t('loc')}</h3><p>${esc(S.label)}</p><div class="grp"><input id="ls" placeholder="${t('city')}" aria-label="${t('city')}"><button class="btn" id="lb">${t('search')}</button></div><button class="btn alt" id="gps">${t('gps')}</button><div id="lr"></div></div>
  <div class="card form"><label>${t('method')}<select id="me">${Object.entries(A.METHODS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
  <label>${t('madhab')}<select id="ma"><option value="0">Shafi / Maliki / Hanbali</option><option value="1">Hanafi</option></select></label>
  <label>${t('tf')}<select id="tf"><option value="0">12h</option><option value="1">24h</option></select></label>
  <label>${t('lang')}<select id="lg"><option value="en">English</option><option value="ur">اردو</option><option value="ar">العربية</option></select></label>
  <label>${t('theme')}<select id="th"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label></div><button class="btn" id="inst" hidden>⬇ Install app</button>`;
  $('#me').value = S.method; $('#ma').value = S.school; $('#tf').value = +S.h24; $('#lg').value = S.lang; $('#th').value = S.theme;
  const ch = (id, fn, reload) => $(id).onchange = e => { fn(e.target.value); save(); if (reload) T = null; apply(); route(); };
  ch('#me', v => S.method = +v, 1); ch('#ma', v => S.school = +v, 1); ch('#tf', v => S.h24 = v === '1'); ch('#lg', v => S.lang = v); ch('#th', v => S.theme = v);
  const pick = (la, lo, label) => { Object.assign(S, { lat: la, lon: lo, label }); save(); T = null; tz = undefined; location.hash = 'home'; };
  const find = async () => { const q = $('#ls').value.trim(); if (!q) return; $('#lr').innerHTML = '<div class="sk mini"></div>'; try { const r = await A.geocode(q); $('#lr').innerHTML = r.length ? r.map((x, i) => `<button class="res" data-i="${i}">${esc(x.name)}${x.admin1 ? ', ' + esc(x.admin1) : ''}, ${esc(x.country || '')}</button>`).join('') : `<p>—</p>`; $('#lr').querySelectorAll('.res').forEach(b => b.onclick = () => { const x = r[b.dataset.i]; pick(x.latitude, x.longitude, `${x.name}, ${x.country || ''}`); }); } catch { $('#lr').textContent = t('err'); } };
  $('#lb').onclick = find; $('#ls').onkeydown = e => e.key === 'Enter' && find();
  $('#gps').onclick = () => navigator.geolocation ? navigator.geolocation.getCurrentPosition(p => pick(+p.coords.latitude.toFixed(4), +p.coords.longitude.toFixed(4), `${p.coords.latitude.toFixed(2)}, ${p.coords.longitude.toFixed(2)}`), () => $('#lr').textContent = t('err')) : 0;
  if (deferred) { $('#inst').hidden = false; $('#inst').onclick = () => deferred.prompt(); }
};
function route() {
  const [n, a] = (location.hash.slice(1) || 'home').split('/'), f = V[n] || V.home;
  document.querySelectorAll('.tabs a').forEach(l => l.classList.toggle('on', l.dataset.r === (['home', 'cal', 'quran', 'qibla'].includes(n) ? n : n === 'surah' ? 'quran' : 'more')));
  scrollTo(0, 0); f(a);
}
document.addEventListener('click', e => { const b = e.target.closest('.fav'); if (!b) return; const id = b.dataset.id; F.has(id) ? F.delete(id) : F.add(id); sv('fav', [...F]); b.textContent = F.has(id) ? '★' : '☆'; });
$('#theme').onclick = () => { S.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; save(); apply(); };
addEventListener('hashchange', route);
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
apply(); route(); setInterval(tick, 1000);
