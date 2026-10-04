# Noor – Islamic Prayer Times PWA

Plain HTML/CSS/JS (no build step). Data: [AlAdhan API](https://aladhan.com/prayer-times-api), [Al Quran Cloud](https://alquran.cloud/api), Open-Meteo geocoding (city search).

## Features
Prayer times + live countdown · city search / GPS · calculation methods & madhab · monthly calendar · Hijri converter · Qibla compass · per-prayer alerts · Quran (Arabic, translation, audio) · Tasbih · Duas · Ramadan table + Sehri/Iftar countdown · saved items · dark mode · English/Urdu/Arabic (RTL) · installable PWA with offline cache.

## Structure
`index.html` shell · `css/style.css` theme · `js/api.js` all network calls (+ offline cache) · `js/app.js` views & logic · `js/i18n.js` translations · `js/data.js` duas/reminders · `sw.js` service worker · `manifest.webmanifest`.

## Run locally
Needs http(s) (ES modules + service worker don't work from `file://`):
```
cd noor
python3 -m http.server 8080     # or: npx serve .
```
Open http://localhost:8080

## API usage
- `GET /v1/timingsByCity/{DD-MM-YYYY}` or `/v1/timings/{date}?latitude&longitude&method&school`
- `/v1/calendar/{y}/{m}`, `/v1/hijriCalendar/{hijriYear}/{m}`, `/v1/gToH/{date}`, `/v1/hToG/{date}`, `/v1/qibla/{lat}/{lon}`
- Quran: `/v1/surah`, `/v1/surah/{n}/editions/quran-uthmani,en.sahih`; audio from `cdn.islamic.network`.

## Deploy: GitHub
```
git init && git add . && git commit -m "Noor prayer app"
git branch -M main
git remote add origin https://github.com/<you>/noor.git
git push -u origin main
```
## Deploy: Vercel
Dashboard: **Add New → Project →** import the repo → Framework "Other" → no build command, output dir `.` → Deploy.
CLI: `npm i -g vercel && vercel --prod` (run inside this folder).

## Notes
- Alerts fire while the app/tab is open (browsers don't allow background timers without a push server).
- For Play-Store-style install on all browsers, add 192×192 and 512×512 PNG icons to the manifest.
- Verify times against your local mosque; methods differ by a few minutes.
