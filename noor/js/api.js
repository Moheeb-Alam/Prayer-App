// API layer: all network access lives here. Responses are cached in localStorage for offline use.
const B = 'https://api.aladhan.com/v1', Q = 'https://api.alquran.cloud/v1';
export const METHODS = {0:'Shia Ithna-Ashari',1:'Karachi (UISK)',2:'ISNA (North America)',3:'Muslim World League',4:'Umm Al-Qura (Makkah)',5:'Egyptian General Authority',8:'Gulf Region',9:'Kuwait',10:'Qatar',11:'Singapore',12:'France (UOIF)',13:'Turkey (Diyanet)',15:'Moonsighting Committee'};
async function get(u) {
  try {
    const r = await fetch(u); if (!r.ok) throw new Error(r.status);
    const d = (await r.json()).data;
    try { localStorage.setItem('c:' + u, JSON.stringify(d)); } catch {}
    return d;
  } catch (e) {
    const c = localStorage.getItem('c:' + u); if (c) return JSON.parse(c);
    throw e;
  }
}
const P = (l, o) => new URLSearchParams({ ...(l.lat != null ? { latitude: l.lat, longitude: l.lon } : { city: l.city, country: l.country }), method: o.method, school: o.school });
const ep = (n, l) => n + (l.lat != null ? '' : 'ByCity');
export const day = (l, o, d) => get(`${B}/${ep('timings', l)}/${d}?${P(l, o)}`);
export const month = (l, o, y, m) => get(`${B}/${ep('calendar', l)}/${y}/${m}?${P(l, o)}`);
export const hijriMonth = (l, o, y, m) => get(`${B}/${ep('hijriCalendar', l)}/${y}/${m}?${P(l, o)}`);
export const gToH = d => get(`${B}/gToH/${d}`);
export const hToG = d => get(`${B}/hToG/${d}`);
export const qibla = (la, lo) => get(`${B}/qibla/${la}/${lo}`);
export const surahs = () => get(`${Q}/surah`);
export const surah = (n, tr) => get(`${Q}/surah/${n}/editions/quran-uthmani,${tr}`);
export const audio = n => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`;
export const geocode = async q => (await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6`)).json()).results || [];
