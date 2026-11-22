'use strict';

/* ==========================================================
   Explore Bangladesh - script.js
   1. Data   2. Helpers   3. Filters + cards   4. Gallery
   5. Cost calculator   6. Itinerary builder   7. Start-up
   ========================================================== */

/* ---------- 1. DATA ----------
   km     = road distance from Dhaka (approx.)
   local  = entry fees + local transport per person per day (BDT, approx.)
   extra  = boat / ship / launch cost per person for the round trip (BDT)
   hf     = hotel price factor (1 = normal, higher = more expensive area)
   Covers are self-contained category-inspired SVG illustrations.
*/
const ICON_PATHS = { Beach: 'M2 10q3-4 6 0t6 0t6 0M2 16q3-4 6 0t6 0t6 0', Hills: 'M2 19 10 4l4 8 3-5 5 12ZM7 10l3 2 3-2', Heritage: 'M3 8 12 3l9 5ZM5 10v9m7-9v9m7-9v9M3 21h18', Nature: 'M19 3C8 1 2 8 6 16s16 2 13-13ZM5 20 16 7', Water: 'M2 17h20l-4 4H6ZM12 3v14M10 4 3 14h7M14 5l6 9h-6' };
const EMOJI = Object.fromEntries(Object.entries(ICON_PATHS).map(([type, path]) => [type, `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`]));
const TYPES = Object.keys(EMOJI);

const DESTINATIONS = [
  { id: 'lalbagh-fort', name: 'Lalbagh Fort', division: 'Dhaka', district: 'Dhaka', type: 'Heritage', km: 5, local: 250, extra: 0, hf: 1.2, season: 'Nov–Feb',
    desc: 'A 17th-century Mughal fort complex in Old Dhaka with a mosque, a tomb and quiet gardens.' },
  { id: 'ahsan-manzil', name: 'Ahsan Manzil', division: 'Dhaka', district: 'Dhaka', type: 'Heritage', km: 5, local: 250, extra: 0, hf: 1.2, season: 'Nov–Feb',
    desc: 'The pink palace on the Buriganga river, once home to the Dhaka Nawab family and now a museum.' },
  { id: 'sonargaon', name: 'Sonargaon (Panam City)', division: 'Dhaka', district: 'Narayanganj', type: 'Heritage', km: 30, local: 400, extra: 0, hf: 1, season: 'Nov–Feb',
    desc: 'The old capital region, with Panam City’s long rows of colonial-era merchant houses and a folk art museum.' },

  { id: 'coxs-bazar', name: 'Cox’s Bazar Beach', division: 'Chattogram', district: 'Cox’s Bazar', type: 'Beach', km: 400, local: 800, extra: 0, hf: 1.3, season: 'Nov–Mar',
    desc: 'One of the longest natural sea beaches in the world. Come for the sunsets, seafood and the surf.' },
  { id: 'saint-martins', name: 'Saint Martin’s Island', division: 'Chattogram', district: 'Cox’s Bazar', type: 'Beach', km: 450, local: 900, extra: 3500, hf: 1.2, season: 'Nov–Feb',
    desc: 'An offshore island known for turquoise water and coastal scenery. Check current visitor permissions, seasons and transport arrangements before planning a visit.' },
  { id: 'patenga', name: 'Patenga Beach', division: 'Chattogram', district: 'Chattogram', type: 'Beach', km: 260, local: 300, extra: 0, hf: 1, season: 'Nov–Mar',
    desc: 'Chattogram’s city beach near the port. Popular for evening walks and watching ships on the horizon.' },
  { id: 'nilgiri', name: 'Nilgiri Hills', division: 'Chattogram', district: 'Bandarban', type: 'Hills', km: 330, local: 900, extra: 0, hf: 1, season: 'Oct–Feb',
    desc: 'A hilltop viewpoint in Bandarban where clouds roll below you. Best at sunrise.' },
  { id: 'sajek', name: 'Sajek Valley', division: 'Chattogram', district: 'Rangamati', type: 'Hills', km: 420, local: 1000, extra: 0, hf: 1.2, season: 'Oct–Feb',
    desc: 'A hill valley known for cloud views, indigenous community homes and cool evenings.' },
  { id: 'kaptai-lake', name: 'Kaptai Lake', division: 'Chattogram', district: 'Rangamati', type: 'Water', km: 310, local: 700, extra: 0, hf: 1, season: 'Oct–Mar',
    desc: 'A large lake ringed by hills, with boat rides, the Hanging Bridge and floating restaurants.' },
  { id: 'shalban-vihara', name: 'Shalban Vihara', division: 'Chattogram', district: 'Cumilla', type: 'Heritage', km: 100, local: 300, extra: 0, hf: 0.9, season: 'Nov–Feb',
    desc: 'Ruins of an ancient Buddhist monastery near Cumilla, part of the Mainamati archaeological area.' },

  { id: 'ratargul', name: 'Ratargul Swamp Forest', division: 'Sylhet', district: 'Sylhet', type: 'Water', km: 260, local: 800, extra: 0, hf: 1, season: 'Jun–Oct',
    desc: 'A freshwater swamp forest. Row a small boat between half-submerged trees in the rainy season.' },
  { id: 'jaflong', name: 'Jaflong', division: 'Sylhet', district: 'Sylhet', type: 'Nature', km: 270, local: 600, extra: 0, hf: 1, season: 'Jun–Oct',
    desc: 'A border-side river of clear water and stone collectors, with the Khasia hills rising behind.' },
  { id: 'sreemangal', name: 'Sreemangal Tea Gardens', division: 'Sylhet', district: 'Moulvibazar', type: 'Nature', km: 170, local: 600, extra: 0, hf: 0.9, season: 'Oct–Mar',
    desc: 'The tea capital of Bangladesh: rolling tea gardens, seven-colour tea and cycling lanes.' },
  { id: 'lawachara', name: 'Lawachara National Park', division: 'Sylhet', district: 'Moulvibazar', type: 'Nature', km: 180, local: 400, extra: 0, hf: 0.9, season: 'Nov–Mar',
    desc: 'A protected rainforest where you may spot hoolock gibbons and many birds on a guided walk.' },
  { id: 'tanguar-haor', name: 'Tanguar Haor', division: 'Sylhet', district: 'Sunamganj', type: 'Nature', km: 310, local: 700, extra: 0, hf: 0.8, season: 'Jun–Sep',
    desc: 'A vast wetland in Sunamganj, famous for migratory birds, boats and beautiful seasonal landscapes.'},

  { id: 'sundarbans', name: 'The Sundarbans', division: 'Khulna', district: 'Khulna', type: 'Nature', km: 330, local: 1500, extra: 4500, hf: 1.1, season: 'Nov–Feb',
    desc: 'The world’s largest mangrove forest and home of the Bengal tiger. Visited by launch trip.' },
  { id: 'sixty-dome', name: 'Sixty Dome Mosque', division: 'Khulna', district: 'Bagerhat', type: 'Heritage', km: 300, local: 400, extra: 0, hf: 0.9, season: 'Nov–Feb',
    desc: 'A 15th-century brick mosque in the historic city of Bagerhat, a UNESCO World Heritage Site.' },

  { id: 'kuakata', name: 'Kuakata Sea Beach', division: 'Barishal', district: 'Patuakhali', type: 'Beach', km: 320, local: 600, extra: 0, hf: 1, season: 'Nov–Mar',
    desc: 'A rare beach where you can watch both the sunrise and the sunset over the sea.' },
  { id: 'swarupkathi', name: 'Floating Guava Market', division: 'Barishal', district: 'Pirojpur', type: 'Water', km: 190, local: 500, extra: 0, hf: 0.8, season: 'Jul–Sep',
    desc: 'Early-morning boats packed with guavas trade along the canals near Swarupkathi.' },

  { id: 'puthia', name: 'Puthia Temple Complex', division: 'Rajshahi', district: 'Rajshahi', type: 'Heritage', km: 260, local: 300, extra: 0, hf: 0.9, season: 'Nov–Feb',
    desc: 'A cluster of terracotta Hindu temples from the 18th and 19th centuries, near Rajshahi city.' },
  { id: 'paharpur', name: 'Paharpur Buddhist Vihara', division: 'Rajshahi', district: 'Naogaon', type: 'Heritage', km: 300, local: 350, extra: 0, hf: 0.8, season: 'Nov–Feb',
    desc: 'Somapura Mahavihara, a vast ruined monastery and a UNESCO World Heritage Site.' },
  { id: 'mahasthangarh', name: 'Mahasthangarh', division: 'Rajshahi', district: 'Bogura', type: 'Heritage', km: 230, local: 300, extra: 0, hf: 0.8, season: 'Nov–Feb',
    desc: 'One of the oldest known archaeological sites in Bangladesh, an ancient fortified city near Bogura.' },

  { id: 'tajhat', name: 'Tajhat Palace', division: 'Rangpur', district: 'Rangpur', type: 'Heritage', km: 330, local: 300, extra: 0, hf: 0.8, season: 'Nov–Feb',
    desc: 'A zamindar palace in Rangpur with a grand colonnaded front and a museum inside.' },
  { id: 'kantajew', name: 'Kantajew Temple', division: 'Rangpur', district: 'Dinajpur', type: 'Heritage', km: 410, local: 300, extra: 0, hf: 0.8, season: 'Nov–Feb',
    desc: 'An 18th-century temple covered in detailed terracotta carvings, near Dinajpur.' },
  { id: 'tetulia', name: 'Tetulia and Banglabandha', division: 'Rangpur', district: 'Panchagarh', type: 'Nature', km: 500, local: 400, extra: 0, hf: 0.8, season: 'Nov–Feb',
    desc: 'The northernmost tip of Bangladesh, with tea estates and, on clear winter mornings, far-off Himalayan peaks.' },

  { id: 'birishiri', name: 'Birishiri', division: 'Mymensingh', district: 'Netrokona', type: 'Hills', km: 180, local: 500, extra: 0, hf: 0.8, season: 'Oct–Mar',
    desc: 'Near the Garo hills, known for its white clay lake and for Garo culture.' },
  { id: 'shashi-lodge', name: 'Shashi Lodge', division: 'Mymensingh', district: 'Mymensingh', type: 'Heritage', km: 120, local: 250, extra: 0, hf: 0.9, season: 'Nov–Feb',
    desc: 'An early 20th-century mansion in Mymensingh town, set in gardens and now a museum.' }
  
];

const DIVISIONS = [...new Set(DESTINATIONS.map(d => d.division))].sort();
const byId = id => DESTINATIONS.find(d => d.id === id);

/* ---------- 2. HELPERS ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Bangladeshi number grouping (e.g. ৳1,25,000)
const taka = n => '৳' + Math.round(n).toLocaleString('en-IN');

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Put your PNG files in the images folder beside index.html.
// Use these exact filenames. Unavailable images keep the illustrated cover.
const DESTINATION_PHOTOS = Object.freeze({
  'ahsan-manzil': 'images/ahsan-manzil.png',
  'birishiri': 'images/birishiri.png',
  'coxs-bazar': 'images/coxs-bazar.png',
  'swarupkathi': 'images/swarupkathi.png',
  'jaflong': 'images/jaflong.png',
  'kantajew': 'images/kantajew.png',
  'kuakata': 'images/kuakata.png',
  'lawachara': 'images/lawachara.png',
  'kaptai-lake': 'images/kaptai-lake.png',
  'lalbagh-fort': 'images/lalbagh-fort.png',
  'mahasthangarh': 'images/mahasthangarh.png',
  'nilgiri': 'images/nilgiri.png',
  'patenga': 'images/patenga.png',
  'puthia': 'images/puthia.png',
  'paharpur': 'images/paharpur.png',
  'ratargul': 'images/ratargul.png',
  'sajek': 'images/sajek.png',
  'saint-martins': 'images/saint-martins.png',
  'shashi-lodge': 'images/shashi-lodge.png',
  'shalban-vihara': 'images/shalban-vihara.png',
  'sixty-dome': 'images/sixty-dome.png',
  'sreemangal': 'images/sreemangal.png',
  'sonargaon': 'images/sonargaon.png',
  'tajhat': 'images/tajhat.png',
  'tetulia': 'images/tetulia.png',
  'tanguar-haor': 'images/tangua.png',
  'sundarbans': 'images/sundarbans.png'
  
});

// Hero slideshow: 8000 = 8 seconds, matching the full Ken Burns zoom.
const HERO_SLIDE_INTERVAL_MS = 8000;
const HERO_SLIDES = ['coxs-bazar', 'ratargul', 'ahsan-manzil', 'sundarbans', 'saint-martins', 'jaflong', 'kuakata', 'tanguar-haor'];

const HERO_VIDEOS = Object.freeze({
  'coxs-bazar': 'videos/coxs-bazar.mp4',
  'sundarbans': 'videos/sundarbans.mp4',
  'lawachara': 'videos/lawachara.mp4',
  'ratargul': 'videos/ratargul.mp4',
  'saint-martins': 'videos/saint-martins.mp4',
  
});

function bindDestinationPhotos() {
  // Capture handles images added later by filtering, gallery and lightbox.
  document.addEventListener('load', e => {
    const img = e.target;
    if (!img.classList?.contains('destination-photo')) return;
    img.classList.add('photo-loaded');
    img.closest('.cover')?.querySelector('svg')?.setAttribute('aria-hidden', 'true');
  }, true);
  document.addEventListener('error', e => {
    if (e.target.classList?.contains('destination-photo')) e.target.remove();
  }, true);
}

// Self-contained vector covers: no missing image files or network dependency.
// These are category-inspired illustrations, not photos of specific landmarks.
function coverHTML(d, withBadge = false) {
  const photoPath = DESTINATION_PHOTOS[d.id];
  const photo = photoPath ? `<img class="destination-photo" src="${esc(photoPath)}" alt="${esc(d.name)}" loading="lazy" decoding="async" width="600" height="360">` : '';
  const seed = DESTINATIONS.indexOf(d);
  const sunX = 110 + (seed * 41 % 290);
  const palettes = { Beach: ['#e9d9b5','#acbdad','#507d75','#e0c896'], Hills: ['#eadfbc','#9eb19a','#517c64','#255341'], Heritage: ['#e8d3b5','#bca387','#a46346','#653d30'], Nature: ['#e1dfbb','#a5b88c','#60805c','#2c513a'], Water: ['#e4dfc3','#9bb6a2','#638d7b','#325e50'] };
  const c = palettes[d.type];
  let scene = '';
  if (d.type === 'Beach') scene = `<path d="M0 135Q130 117 280 139T600 131V360H0" fill="${c[1]}"/><path d="M0 199Q120 172 320 204T600 195V360H0" fill="${c[2]}"/><path d="M0 287Q95 216 299 281T600 275V360H0" fill="${c[3]}"/><path d="M0 279Q95 208 299 273T600 267" fill="none" stroke="#f5eed4" stroke-width="7"/><g fill="none" stroke="#e6edd7" opacity=".5"><path d="M25 170h124m180-15h89m-160 69h120m85-3h95"/></g><path d="M398 185h71l-14 12h-41z" fill="#4d4839"/><path d="M433 129v57h-30z" fill="#f7ebd1"/>`;
  else if (d.type === 'Heritage') scene = `<path d="M0 260Q130 213 280 247T600 249V360H0" fill="${c[1]}"/><rect x="132" y="146" width="338" height="155" fill="${c[2]}"/><path d="M120 150h362v13H120zM130 270h342v14H130z" fill="${c[3]}"/><path d="M248 144Q300 58 352 144" fill="${c[3]}"/><path d="M287 88h26l-13-23z" fill="${c[3]}"/><g fill="${c[3]}"><path d="M160 245v-40q20-40 40 0v40zM222 245v-40q20-40 40 0v40zM340 245v-40q20-40 40 0v40zM402 245v-40q20-40 40 0v40zM279 301v-80q22-50 44 0v80z"/></g><path d="M0 304h600v56H0" fill="#46674a"/><path d="M273 304h54l55 56H218" fill="#d6bd8a"/>`;
  else {
    scene = `<path d="M0 181Q94 ${40+seed*2} 223 164T430 156T600 155V360H0" fill="${c[1]}"/><path d="M0 231Q103 111 249 211T465 193T600 188V360H0" fill="${c[2]}"/><path d="M0 308Q145 181 326 277T600 234V360H0" fill="${c[3]}"/>`;
    if(d.type === 'Water') scene += `<path d="M291 211C192 244 384 250 290 283S248 330 342 360H556C393 313 349 306 363 280S260 244 315 211" fill="#b5cdba"/><path d="M315 295h55l-10 12h-36z" fill="#513e2e"/><path d="M330 295q10-24 24 0" fill="#dfc792"/>`;
    else scene += `<g stroke="#c4d09b" opacity=".35" fill="none" stroke-width="2"><path d="M0 294Q140 204 300 280M0 310Q145 220 300 296M0 328Q140 239 300 314M0 344Q135 257 300 332"/></g>`;
  }
  return `<div class="cover" data-type="${d.type}">${photo}<svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrated ${d.type.toLowerCase()} landscape for ${esc(d.name)}"><path fill="${c[0]}" d="M0 0h600v360H0z"/><circle cx="${sunX}" cy="85" r="42" fill="#c78251"/>${scene}<g fill="none" stroke="#526553" stroke-width="2"><path d="M400 67q10-10 20 0q10-10 20 0m-70 25q8-8 16 0q8-8 16 0"/></g></svg>${withBadge ? `<span class="badge">${d.type}</span>` : ''}</div>`;
}

const SAVED_KEY = 'explore-bangladesh-saved';
let savedPlaces = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(SAVED_KEY));
  if (Array.isArray(stored)) savedPlaces = new Set(stored.filter(id => byId(id)));
} catch (_) { /* Work without persistence if storage is blocked. */ }
let savedOnly = false;
let budgetLimit = 1500;
let listView = false;
function persist(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch (_) { toast('Browser storage is unavailable. Export your plan to keep a copy.'); return false; }
}
function toggleSaved(id) {
  if (savedPlaces.has(id)) savedPlaces.delete(id); else savedPlaces.add(id);
  persist(SAVED_KEY, JSON.stringify([...savedPlaces]));
  renderCards();
  // Preserve keyboard focus when replacing cards after saving.
  const button = $(`.save-place[data-id="${id}"]`);
  (button || $('#saved-filter')).focus({preventScroll:true});
  motionSavePop(button);
}

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: document.documentElement.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}

/* ---------- 3. FILTERS + DESTINATION CARDS ---------- */
const filters = { q: '', division: '', district: '', type: '', sort: 'name' };

function fillDivisionSelect() {
  $('#f-division').innerHTML =
    '<option value="">All divisions</option>' +
    DIVISIONS.map(d => `<option value="${d}">${d}</option>`).join('');
}

function fillDistrictSelect() {
  const pool = filters.division ? DESTINATIONS.filter(d => d.division === filters.division) : DESTINATIONS;
  const districts = [...new Set(pool.map(d => d.district))].sort();
  $('#f-district').innerHTML =
    '<option value="">All districts</option>' +
    districts.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
  $('#f-district').value = filters.district;
}

function fillTypeChips() {
  const all = ['All', ...TYPES];
  $('#type-chips').innerHTML = all.map(t => {
    const value = t === 'All' ? '' : t;
    return `<button type="button" data-type="${value}" aria-pressed="${filters.type === value}">${t === 'All' ? 'All types' : EMOJI[t] + ' ' + t}</button>`;
  }).join('');
}

function fillHeroChips() {
  $('#division-chips').innerHTML = DIVISIONS.map(div => {
    const n = DESTINATIONS.filter(d => d.division === div).length;
    return `<button type="button" data-division="${div}">${div}<small>${n}</small></button>`;
  }).join('');
}

function syncFilterUI() {
  $('#f-search').value = filters.q;
  $('#f-division').value = filters.division;
  fillDistrictSelect();
  $('#f-sort').value = filters.sort;
  fillTypeChips();
}

function getFiltered() {
  const q = filters.q.trim().toLowerCase();
  const list = DESTINATIONS.filter(d =>
    (!savedOnly || savedPlaces.has(d.id)) && d.local <= budgetLimit &&
    (!filters.division || d.division === filters.division) &&
    (!filters.district || d.district === filters.district) &&
    (!filters.type || d.type === filters.type) &&
    (!q || [d.name, d.district, d.division, d.type, d.desc].join(' ').toLowerCase().includes(q))
  );
  if (filters.sort === 'cost')     list.sort((a, b) => a.local - b.local || a.name.localeCompare(b.name));
  else if (filters.sort === 'distance') list.sort((a, b) => a.km - b.km || a.name.localeCompare(b.name));
  else list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function renderCards() {
  const list = getFiltered();
  const previousCards = captureMotionCards(list);
  $('#cards').innerHTML = list.map(d => `
    <article class="card" data-motion-id="${d.id}">
      <button class="save-place" type="button" data-act="save" data-id="${d.id}" aria-label="${savedPlaces.has(d.id) ? 'Unsave' : 'Save'} ${esc(d.name)}" aria-pressed="${savedPlaces.has(d.id)}">${savedPlaces.has(d.id) ? '♥' : '♡'}</button>
      ${coverHTML(d, true)}
      <div class="card-body">
        <h3>${esc(d.name)}</h3>
        <p class="place">${esc(d.district)}, ${d.division} Division</p>
        <p class="desc">${esc(d.desc)}</p><button class="detail-link" data-act="details" data-id="${d.id}" type="button">Explore this place <span class="motion-arrow" aria-hidden="true">↗</span></button>
        <p class="facts">
          <span>Best time: <strong>${d.season}</strong></span>
          <span>From Dhaka: <strong>${d.km} km</strong></span>
          <span>Local costs: <strong>${taka(d.local)}/day</strong></span>
        </p>
        <div class="card-actions">
          <button class="btn" type="button" data-act="add" data-id="${d.id}">Add to itinerary</button>
          <button class="btn-outline" type="button" data-act="cost" data-id="${d.id}">Estimate cost</button>
        </div>
      </div>
    </article>`).join('');

  $('#saved-count').textContent = savedPlaces.size;
  $('#empty').hidden = list.length > 0;
  $('#result-count').textContent =
    `Showing ${list.length} of ${DESTINATIONS.length} destinations`;
  animateMotionCards(previousCards);
}

function bindFilters() {
  $('#filters').addEventListener('submit', e => e.preventDefault());

  $('#f-search').addEventListener('input', e => { filters.q = e.target.value; renderCards(); });

  $('#f-division').addEventListener('change', e => {
    filters.division = e.target.value;
    filters.district = '';
    fillDistrictSelect();
    renderCards();
  });

  $('#f-district').addEventListener('change', e => { filters.district = e.target.value; renderCards(); });
  $('#f-sort').addEventListener('change', e => { filters.sort = e.target.value; renderCards(); });

  $('#type-chips').addEventListener('click', e => {
    const btn = e.target.closest('button[data-type]');
    if (!btn) return;
    filters.type = btn.dataset.type;
    fillTypeChips();
    renderCards();
  });

  $('#reset-filters').addEventListener('click', () => {
    savedOnly = false; budgetLimit = 1500;
    $('#saved-filter').setAttribute('aria-pressed', 'false');
    $('#f-budget').value = 1500; $('#budget-label').textContent = 'Any budget';
    Object.assign(filters, { q: '', division: '', district: '', type: '', sort: 'name' });
    syncFilterUI();
    renderCards();
  });

  // Hero division chips jump to the filtered list
  $('#division-chips').addEventListener('click', e => {
    const btn = e.target.closest('button[data-division]');
    if (!btn) return;
    Object.assign(filters, { q: '', division: btn.dataset.division, district: '', type: '' });
    syncFilterUI();
    renderCards();
    scrollToId('explore');
  });

  // Card buttons (event delegation)
  $('#cards').addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    if (btn.dataset.act === 'save') toggleSaved(btn.dataset.id);
    if (btn.dataset.act === 'details') { showLightbox(DESTINATIONS.findIndex(d => d.id === btn.dataset.id)); openMotionDialog($('#lightbox')); }
    if (btn.dataset.act === 'add') addToItinerary(btn.dataset.id);
    if (btn.dataset.act === 'cost') {
      $('#c-dest').value = btn.dataset.id;
      renderCalc();
      scrollToId('calculator');
    }
  });
}

/* ---------- 4. GALLERY + LIGHTBOX ---------- */
let lbIndex = 0;

let galleryExpanded = false;
function renderGallery() {
  const featured = ['sreemangal', 'coxs-bazar', 'paharpur', 'ratargul', 'sajek'];
  const places = galleryExpanded ? DESTINATIONS : featured.map(byId);
  $('#gallery-grid').innerHTML = places.map(d => `
    <button class="tile" type="button" data-i="${DESTINATIONS.indexOf(d)}" data-motion-id="gallery-${d.id}" aria-label="Open ${esc(d.name)}">
      ${coverHTML(d)}<span class="cap">${esc(d.name)}</span>
    </button>`).join('');
}

function showLightbox(i) {
  const n = DESTINATIONS.length;
  lbIndex = (i + n) % n;
  const d = DESTINATIONS[lbIndex];
  $('#lb-media').innerHTML = coverHTML(d, true);
  if ($('#lightbox').open) motionFade($('#lb-media'));
  $('#lb-title').textContent = d.name;
  $('#lb-meta').textContent = `${d.district}, ${d.division} Division · Best time: ${d.season}`;
  $('#lb-desc').textContent = d.desc;
  $('#lb-map').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(d.name + ', ' + d.district + ', Bangladesh');
}

function bindGallery() {
  const box = $('#lightbox');

  $('#gallery-grid').addEventListener('click', e => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    showLightbox(Number(tile.dataset.i));
    openMotionDialog(box);
  });

  $('#lb-prev').addEventListener('click', () => showLightbox(lbIndex - 1));
  $('#lb-next').addEventListener('click', () => showLightbox(lbIndex + 1));
  $('#lb-close').addEventListener('click', () => closeMotionDialog(box));
  $('#lb-add').addEventListener('click', () => addToItinerary(DESTINATIONS[lbIndex].id));

  // Click on the dark backdrop closes the dialog
  box.addEventListener('click', e => { if (e.target === box && motionOutsideDialog(e, box)) closeMotionDialog(box); });

  box.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  showLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
  });
}

/* ---------- 5. COST CALCULATOR ---------- */
// approximate BDT per km (one way, per person)
const RATE_PER_KM = { bus: 2.5, acbus: 4.5, train: 3.5, air: 22 };
const HOTEL_PER_ROOM_NIGHT = { budget: 1200, standard: 2800, premium: 6500 };
const FOOD_PER_PERSON_DAY  = { budget: 350, standard: 700, premium: 1400 };
const MIN_TRANSPORT_PER_PERSON = 200; // round trip, for very short distances

function estimate({ dest, days, people, transport, hotel, food }) {
  let mode = transport;
  let warning = '';
  if (mode === 'air' && dest.km < 250) {
    mode = 'acbus';
    warning = 'For this short-distance sample budget, AC bus pricing is used. This calculator does not check routes or flight availability.';
  }
  const transportPP = Math.max(dest.km * RATE_PER_KM[mode] * 2, MIN_TRANSPORT_PER_PERSON);
  const nights = Math.max(days - 1, 0);
  const rooms = Math.ceil(people / 2);

  const items = [
    { label: 'Transport (round trip)', amount: transportPP * people },
    { label: `Hotel (${nights} night${nights === 1 ? '' : 's'}, ${rooms} room${rooms === 1 ? '' : 's'})`, amount: HOTEL_PER_ROOM_NIGHT[hotel] * dest.hf * nights * rooms },
    { label: 'Food', amount: FOOD_PER_PERSON_DAY[food] * days * people },
    { label: 'Entry fees and local transport', amount: dest.local * days * people }
  ];
  if (dest.extra > 0) items.push({ label: 'Boat, ship or launch', amount: dest.extra * people });

  const total = items.reduce((sum, it) => sum + it.amount, 0);
  return { items, total, perPerson: total / people, warning };
}

function readCalcInputs() {
  const clamp = (v, min, max, fallback) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? fallback : Math.min(max, Math.max(min, n));
  };
  return {
    dest: byId($('#c-dest').value),
    days: clamp($('#c-days').value, 1, 14, 1),
    people: clamp($('#c-people').value, 1, 30, 1),
    transport: $('#c-transport').value,
    hotel: $('#c-hotel').value,
    food: $('#c-food').value
  };
}

function renderCalc() {
  const input = readCalcInputs();
  if (!input.dest) return;
  const r = estimate(input);

  $('#c-total').textContent = taka(r.total);
  $('#c-per').textContent = `${taka(r.perPerson)} per person`;

  const warn = $('#c-warn');
  warn.hidden = !r.warning;
  warn.textContent = r.warning;

  $('#c-breakdown').innerHTML = r.items.map(it => {
    const pct = r.total ? Math.round((it.amount / r.total) * 100) : 0;
    return `<li><span>${esc(it.label)}</span><strong>${taka(it.amount)}</strong>
      <span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span></li>`;
  }).join('');
}

function bindCalc() {
  $('#c-dest').innerHTML = [...DESTINATIONS]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
  $('#c-dest').value = 'coxs-bazar';

  $('#calc-form').addEventListener('input', renderCalc);
  $('#calc-form').addEventListener('change', renderCalc);
  $('#calc-form').addEventListener('submit', e => e.preventDefault());
  $('#c-add').addEventListener('click', () => addToItinerary($('#c-dest').value));
  renderCalc();
}

/* ---------- 6. ITINERARY BUILDER ---------- */
const STORE_KEY = 'explore-bangladesh-itinerary';
const MAX_DAYS = 7;
let plan = loadPlan();

function loadPlan() {
  const fallback = { active: 0, items: [[], [], []] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && Array.isArray(saved.items) && saved.items.length >= 1 && saved.items.length <= MAX_DAYS) {
      saved.items = saved.items.map(day => (Array.isArray(day) ? day.filter(s => s && byId(s.id)).map(s => ({ id: s.id, note: typeof s.note === 'string' ? s.note.slice(0,80) : '' })) : []));
      saved.active = Math.max(0, Math.min(Math.trunc(Number(saved.active)) || 0, saved.items.length - 1));
      return saved;
    }
  } catch (err) { /* storage unavailable or corrupted, start fresh */ }
  return fallback;
}

function savePlan() {
  persist(STORE_KEY, JSON.stringify(plan));
}

function addToItinerary(id) {
  const d = byId(id);
  if (!d) return;
  const day = plan.items[plan.active];
  if (day.some(s => s.id === id)) {
    toast(`${d.name} is already on Day ${plan.active + 1}`);
    return;
  }
  day.push({ id, note: '' });
  savePlan();
  renderItinerary();
  toast(`Added ${d.name} to Day ${plan.active + 1}`);
}

function setTripLength(n) {
  n = Math.min(MAX_DAYS, Math.max(1, n));
  while (plan.items.length < n) plan.items.push([]);
  while (plan.items.length > n) {
    const removed = plan.items.pop();            // keep stops: move them to the last remaining day
    const last = plan.items[plan.items.length - 1];
    for (const stop of removed) {
      const existing = last.find(item => item.id === stop.id);
      if (!existing) last.push(stop);
      else if (stop.note && !existing.note.includes(stop.note)) existing.note = [existing.note, stop.note].filter(Boolean).join(' / ').slice(0, 80);
    }
  }
  plan.active = Math.min(plan.active, n - 1);
  savePlan();
  renderItinerary();
}

function renderItinerary() {
  const dayCount = plan.items.length;

  $('#i-days').innerHTML = Array.from({ length: MAX_DAYS }, (_, i) =>
    `<option value="${i + 1}">${i + 1} day${i ? 's' : ''}</option>`).join('');
  $('#i-days').value = dayCount;

  $('#i-tabs').innerHTML = plan.items.map((day, i) => `
    <button type="button" role="tab" id="day-tab-${i}" aria-controls="i-panel" tabindex="${i === plan.active ? 0 : -1}" data-day="${i}" aria-selected="${i === plan.active}">
      Day ${i + 1}<span class="count">${day.length}</span>
    </button>`).join('');

  const day = plan.items[plan.active];
  $('#i-list').innerHTML = day.map((stop, i) => {
    const d = byId(stop.id);
    return `<li class="stop" data-i="${i}">
      <div class="stop-main"><strong>${esc(d.name)}</strong><span>${esc(d.district)}, ${d.division}</span></div>
      <input type="text" class="note" maxlength="80" placeholder="Note (time, hotel, who to call)" aria-label="Note for ${esc(d.name)}" value="${esc(stop.note)}">
      <div class="stop-btns">
        <button type="button" data-act="up" aria-label="Move ${esc(d.name)} up" ${i === 0 ? 'disabled' : ''}>Up</button>
        <button type="button" data-act="down" aria-label="Move ${esc(d.name)} down" ${i === day.length - 1 ? 'disabled' : ''}>Down</button>
        <button type="button" class="rm" data-act="remove" aria-label="Remove ${esc(d.name)}">Remove</button>
      </div>
    </li>`;
  }).join('');

  $('#i-panel').setAttribute('aria-labelledby', 'day-tab-' + plan.active);
  $('#i-empty').hidden = day.length > 0;
  $('#i-busy')?.remove();
  if (day.length > 4) {
    $('#i-list').insertAdjacentHTML('afterend', '<p class="busy" id="i-busy">This day has more than four stops. Check the travel time between them.</p>');
  } else {
    const old = $('#i-busy');
    if (old) old.remove();
  }

  // Summary stub
  const allStops = plan.items.flat();
  const daysUsed = plan.items.filter(d => d.length).length;
  $('#i-count').textContent = `${allStops.length} stop${allStops.length === 1 ? '' : 's'}`;
  $('#i-daysused').textContent = `${daysUsed} of ${dayCount} day${dayCount === 1 ? '' : 's'}`;
  $('#i-cost').textContent = taka(allStops.reduce((sum, s) => sum + byId(s.id).local, 0));
}

function bindItinerary() {
  $('#i-days').addEventListener('change', e => setTripLength(Number(e.target.value)));

  $('#i-tabs').addEventListener('click', e => {
    const tab = e.target.closest('button[data-day]');
    if (!tab) return;
    plan.active = Number(tab.dataset.day);
    savePlan();
    renderItinerary();
    $(`#day-tab-${plan.active}`).focus();
  });

  $('#i-tabs').addEventListener('keydown', e => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const n = plan.items.length;
    plan.active = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (plan.active + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
    savePlan(); renderItinerary(); $(`#day-tab-${plan.active}`).focus();
  });

  $('#i-list').addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const i = Number(btn.closest('.stop').dataset.i);
    const day = plan.items[plan.active];
    if (btn.dataset.act === 'remove') day.splice(i, 1);
    if (btn.dataset.act === 'up' && i > 0) [day[i - 1], day[i]] = [day[i], day[i - 1]];
    if (btn.dataset.act === 'down' && i < day.length - 1) [day[i + 1], day[i]] = [day[i], day[i + 1]];
    savePlan();
    renderItinerary();
  });

  // Save notes as the user types (no re-render, so the cursor stays put)
  $('#i-list').addEventListener('input', e => {
    if (!e.target.classList.contains('note')) return;
    const i = Number(e.target.closest('.stop').dataset.i);
    plan.items[plan.active][i].note = e.target.value;
    savePlan();
  });

  $('#i-print').addEventListener('click', () => { renderPrintPlan(); window.print(); });
  window.addEventListener('beforeprint', renderPrintPlan);
  $('#i-export').addEventListener('click', exportPlan);

  $('#i-clear').addEventListener('click', () => {
    if (!plan.items.flat().length) { toast('Your plan is already empty'); return; }
    if (confirm('Remove all stops from your itinerary?')) {
      plan.items = plan.items.map(() => []);
      savePlan();
      renderItinerary();
    }
  });
}

/* ---------- 7. START-UP ---------- */
function bindNav() {
  // MOTION: accessible mobile panel, preserved desktop navigation.
  const toggle = $('#nav-toggle');
  const nav = $('#nav');
  const mobile = matchMedia('(max-width: 760px)');
  nav.classList.add('motion-menu-ready');
  $$('#nav a').forEach((link, i) => link.style.setProperty('--menu-index', i));
  function setMenu(open, returnFocus = false) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    nav.inert = mobile.matches && !open;
    $('.site-header').classList.remove('motion-header-hidden');
    if (returnFocus) toggle.focus();
    queueMotionFrame();
  }
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => {
    if (e.target.closest('a')) setMenu(false, mobile.matches);
  });
  nav.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); setMenu(false, true); }
  });
  document.addEventListener('pointerdown', e => {
    if (mobile.matches && nav.classList.contains('open') && !e.target.closest('.site-header')) setMenu(false);
  });
  document.addEventListener('focusin', e => {
    if (mobile.matches && nav.classList.contains('open') && !e.target.closest('.site-header')) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));
  setMenu(false);
}

function renderPrintPlan() {
  $('#print-plan').innerHTML = `<h1>My Bangladesh travel notebook</h1><p>${plan.items.length}-day itinerary · Explore Bangladesh</p>` + plan.items.map((day, i) => `<section><h2>Day ${i + 1}</h2>${day.length ? '<ol>' + day.map(stop => { const d = byId(stop.id); return `<li><strong>${esc(d.name)}</strong> — ${esc(d.district)}<br><small>Approximate local cost: ${taka(d.local)} / person${stop.note ? '<br>Note: ' + esc(stop.note) : ''}</small></li>`; }).join('') + '</ol>' : '<p>No stops planned.</p>'}</section>`).join('') + '<p><small>Sample local costs only; excludes intercity transport, accommodation and food. Check current access and prices before travelling.</small></p>';
}
function exportPlan() {
  const lines = ['EXPLORE BANGLADESH — MY TRAVEL NOTEBOOK', ''];
  plan.items.forEach((day, i) => {
    lines.push('DAY ' + (i+1));
    if (!day.length) lines.push('No stops planned.');
    day.forEach((stop, n) => { const d = byId(stop.id); lines.push(`${n+1}. ${d.name} — ${d.district}, ${d.division}`, `   Approx. local cost: ${taka(d.local)} / person`); if(stop.note) lines.push('   Note: ' + stop.note); });
    lines.push('');
  });
  lines.push('Costs are sample estimates. Local costs exclude accommodation, food and intercity transport. Verify prices and access before travelling.');
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'my-bangladesh-trip.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Your travel notebook has been exported');
}
function bindExtras() {
  const theme = $('#theme-toggle');
  function setTheme(dark) { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; theme.setAttribute('aria-pressed', String(dark)); theme.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'); theme.textContent = dark ? '☀' : '◐'; }
  let preference = null;
  try { preference = localStorage.getItem('explore-bangladesh-theme'); } catch (_) {}
  setTheme(preference ? preference === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
  theme.addEventListener('click', () => { const dark = document.documentElement.dataset.theme !== 'dark'; setTheme(dark); persist('explore-bangladesh-theme', dark ? 'dark' : 'light'); });
  $('#saved-filter').addEventListener('click', () => { savedOnly = !savedOnly; $('#saved-filter').setAttribute('aria-pressed', String(savedOnly)); renderCards(); });
  $('#f-budget').addEventListener('input', e => { budgetLimit = Number(e.target.value); $('#budget-label').textContent = budgetLimit === 1500 ? 'Any budget' : 'Up to ' + taka(budgetLimit); renderCards(); });
  for (const id of ['view-grid', 'view-list']) $('#' + id).addEventListener('click', () => { listView = id === 'view-list'; $('#cards').classList.toggle('list-view', listView); $('#view-grid').setAttribute('aria-pressed', String(!listView)); $('#view-list').setAttribute('aria-pressed', String(listView)); });
  $('#surprise').addEventListener('click', () => { showLightbox(Math.floor(Math.random() * DESTINATIONS.length)); openMotionDialog($('#lightbox')); });
  $('#gallery-grid').insertAdjacentHTML('afterend', '<div class="gallery-footer"><button class="btn-outline" type="button" id="gallery-more" aria-expanded="false" aria-controls="gallery-grid">Explore all 27 places ↗</button></div>');
  $('#gallery-more').addEventListener('click', e => { galleryExpanded = !galleryExpanded; renderGallery(); e.target.textContent = galleryExpanded ? 'Show the curated selection ↑' : 'Explore all 27 places ↗'; e.target.setAttribute('aria-expanded', String(galleryExpanded)); });
  // Normalize numeric inputs on blur so visible values match the calculation.
  for (const id of ['c-days', 'c-people']) $('#' + id).addEventListener('blur', () => { const input = readCalcInputs(); $('#' + id).value = id === 'c-days' ? input.days : input.people; renderCalc(); });
}

document.addEventListener('DOMContentLoaded', () => {
  bindDestinationPhotos();
  fillHeroChips();
  fillDivisionSelect();
  syncFilterUI();
  renderCards();
  bindFilters();

  renderGallery();
  bindGallery();

  bindCalc();

  renderItinerary();
  bindItinerary();

  bindNav();
  bindExtras();
  bindMotionDesign();
  bindCinematicJourneys();
  bindMotionDialogs();
  bindMotionAccordions();
  bindMotionCounters();
});

/* ---------- 8. MOTION DESIGN ----------
   Progressive enhancement: content is visible without animation support.
   Motion follows the visitor's OS Reduced Motion setting.
*/
function bindMotionDesign() {
  // MOTION: one preference source and one shared scroll frame scheduler.
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  MOTION.preference = preference;
  function sync() {
    root.dataset.motion = preference.matches ? 'off' : 'on';
    if (preference.matches) {
      MOTION.animations.forEach(animation => animation.cancel());
      $$('.reveal-pending').forEach(el => el.classList.remove('reveal-pending'));
    }
    document.dispatchEvent(new Event('motion-preference'));
    queueMotionFrame();
  }
  sync();
  preference.addEventListener('change', sync);
  root.classList.add('motion-enhanced');
  MOTION.ready = true;
  bindMotionHeadingMasks();
  bindMotionHeader();
  bindMotionReveals();
  addEventListener('scroll', queueMotionFrame, {passive:true});
  addEventListener('resize', queueMotionFrame, {passive:true});
  if ('ResizeObserver' in window) new ResizeObserver(queueMotionFrame).observe(document.body);
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('page-inactive', document.hidden);
    MOTION.animations.forEach(animation => {
      if (document.hidden) animation.pause();
      else if (animation.playState === 'paused') animation.play();
    });
    if (!document.hidden) queueMotionFrame();
  });
  queueMotionFrame();
}

/* ---------- 9. SCROLL-LED TRAVEL STORIES ----------
   Native document scrolling, sticky imagery and lightweight frame updates.
   All text and links remain available without motion or on smaller screens.
*/
function bindCinematicJourneys() {
  const root = document.documentElement;
  const hero = $('.cinema-hero');
  const heroMedia = $('#cinema-hero-media');
  bindHeroSlideshow(hero, heroMedia);

  const stories = [
    { id: 'coxs-bazar', label: 'THE OPEN COAST', title: 'A little more <br>sea. A little <br>less hurry.', text: 'Let the coastline lead the way. Take a long walk, watch the fishing boats, and stay for the evening light.', action: 'Explore the coast' },
    { id: 'birishiri', label: 'THE QUIETER WAY', title: 'Take the <br>scenic way <br>to nowhere.', text: 'Make room for a slower day around Birishiri. Discover waterside views and the landscape near the Garo hills.', action: 'Find your quiet escape' },
    { id: 'ahsan-manzil', label: 'STORIES IN COLOUR', title: 'Old cities. <br>New ways <br>to wonder.', text: 'Walk into a different chapter at Ahsan Manzil. Make time for the architecture, the museum and the stories of Old Dhaka.', action: 'Step into the story' },
    { id: 'kuakata', label: 'THE GOLDEN HOUR', title: 'Stay for <br>one more <br>sunset.', text: 'Let your day follow the light at Kuakata. Put the phone away for a moment and find your own stretch of shore.', action: 'Meet the horizon' }
  ];
  $('#journey-copy').innerHTML = stories.map((s,i) => `<article class="journey-step" id="journey-${i}" data-story="${i}"><p class="eyebrow">${s.label}</p><h3>${s.title}</h3><div class="journey-mobile-media">${coverHTML(byId(s.id))}</div><p class="journey-description">${s.text}</p><button type="button" class="story-link" data-place="${s.id}">${s.action}<span aria-hidden="true">↗</span></button><span class="story-index">0${i+1} / 04</span></article>`).join('');
  $('#journey-visual').innerHTML = stories.map((s,i) => `<div class="journey-panel ${i===0?'is-current':''}" data-panel="${i}">${coverHTML(byId(s.id))}<div class="journey-caption"><span>${esc(byId(s.id).name)}</span><span>0${i+1} / 04</span></div></div>`).join('') + '<div class="journey-meter"><span id="journey-meter-fill"></span></div>';
  $('#journey-copy').addEventListener('click', e => {
    const button = e.target.closest('button[data-place]');
    if (!button) return;
    showLightbox(DESTINATIONS.findIndex(d => d.id === button.dataset.place));
    openMotionDialog($('#lightbox'));
  });
  const statement = $('#scroll-statement');
  const originalText = statement.textContent;
  statement.setAttribute('aria-label', originalText);
  statement.innerHTML = originalText.split(/\s+/).filter(Boolean).map(word => `<span aria-hidden="true" class="reveal-word">${esc(word)}</span>`).join(' ');
  const words = $$('.reveal-word', statement);
  const steps = $$('.journey-step');
  const panels = $$('.journey-panel');
  const wide = matchMedia('(min-width: 901px)');
  let active = -1;
  let geometry = {
    heroTop: 0,
    heroHeight: 1,
    statementTop: 0,
    statementHeight: 1,
    steps: [],
    tints: []
  };
  const clamp = n => Math.max(0, Math.min(1,n));
  function cacheGeometry() {
    const heroBox = hero.getBoundingClientRect();
    const textBox = statement.getBoundingClientRect();
    geometry = {
      heroTop: scrollY + heroBox.top,
      heroHeight: Math.max(1, heroBox.height),
      statementTop: scrollY + textBox.top,
      statementHeight: Math.max(1, textBox.height),
      steps: steps.map(step => {
        const box = step.getBoundingClientRect();
        return { top: scrollY + box.top, height: Math.max(1, box.height) };
      }),
      tints: $$('.section-tint').map(section => {
        const box = section.getBoundingClientRect();
        return { top: scrollY + box.top, height: Math.max(1, box.height), section };
      })
    };
  }
  const queueGeometryCache = () => { cacheGeometry(); queueMotionFrame(); };
  function paint() {
    const motion = root.dataset.motion !== 'off';
    const scrollTop = scrollY;
    const progress = clamp((scrollTop - geometry.heroTop) / geometry.heroHeight);
    heroMedia.style.setProperty('--hero-pan', motion && wide.matches ? (progress*55)+'px' : '0px');
    heroMedia.style.setProperty('--hero-scale', motion && wide.matches ? 1.025 : 1);
    $('.cinema-copy').style.setProperty('--copy-pan', motion && wide.matches ? (progress*22)+'px' : '0px');
    const statementTop = geometry.statementTop - scrollTop;
    const readProgress = motion ? clamp((innerHeight*.85 - statementTop) / (geometry.statementHeight + innerHeight*.22)) : 1;
    words.forEach((word,i) => word.classList.toggle('is-read', readProgress >= i / words.length));
    let next = 0;
    geometry.steps.forEach((step,i) => { if(step.top - scrollTop < innerHeight*.48) next=i; });
    if (next !== active) {
      active = next;
      panels.forEach((panel,i) => panel.classList.toggle('is-current',i===active));
      steps.forEach((step,i) => step.classList.toggle('is-active-story',i===active));
      motionStoryText(steps[active]);
    }
    const activeStep = geometry.steps[active];
    const activeStepTop = activeStep.top - scrollTop;
    const chapterProgress = clamp((innerHeight*.48 - activeStepTop) / activeStep.height);
    $('#journey-meter-fill').style.transform = `scaleX(${(active+chapterProgress)/stories.length})`;
    const scale = motion && wide.matches ? 1.07 - chapterProgress*.07 : 1;
    panels[active].style.setProperty('--story-scale',scale);
    panels[active].style.setProperty('--story-pan', motion && wide.matches ? (chapterProgress - .5) * 18 + 'px' : '0px');
    geometry.tints.forEach(({section, top, height}) => {
      const tintProgress = clamp((scrollTop + innerHeight - top) / (innerHeight + height));
      const tintPan = motion && wide.matches ? (tintProgress - .5) * 30 : 0;
      section.style.setProperty('--tint-pan', tintPan + 'px');
    });
  }
  MOTION.frames.add(paint);
  wide.addEventListener('change', queueGeometryCache);
  addEventListener('resize', queueGeometryCache, {passive:true});
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(queueGeometryCache);
    resizeObserver.observe(hero);
    resizeObserver.observe(statement);
    resizeObserver.observe($('#journey-copy'));
    $$('.section-tint').forEach(section => resizeObserver.observe(section));
  }
  document.addEventListener('load', event => {
    if (event.target instanceof HTMLImageElement) queueGeometryCache();
  }, true);
  if (document.fonts?.ready) document.fonts.ready.then(queueGeometryCache);
  document.addEventListener('motion-preference', queueMotionFrame);
  bindFeaturedStoryCarousel(stories);
  // Focus on a story button also brings its corresponding photograph forward.
  $('#journey-copy').addEventListener('focusin', e => {
    const step=e.target.closest('.journey-step');
    if(step && wide.matches) {
      active=Number(step.dataset.story);
      panels.forEach((panel,i)=>panel.classList.toggle('is-current',i===active));
    }
  });
  cacheGeometry();
  paint();
}

function bindHeroSlideshow(hero, media) {
  const root = document.documentElement;
  const places = HERO_SLIDES.map(byId).filter(Boolean);
  if (!places.length) return;
  media.innerHTML = places.map((place, i) => `<div class="hero-slide ${i === 0 ? 'is-current' : ''}" data-place="${place.id}" aria-hidden="true">${coverHTML(place)}${HERO_VIDEOS[place.id] ? `<video class="hero-video" src="${esc(HERO_VIDEOS[place.id])}" muted playsinline preload="${i === 0 ? 'auto' : 'metadata'}" aria-hidden="true" tabindex="-1"></video>` : ''}</div>`).join('');
  // Prepare every slide before its turn; each retains its illustration on failure.
  $$('img', media).forEach((img, i) => {
    img.loading = 'eager';
    img.fetchPriority = i === 0 ? 'high' : 'low';
  });
  // HERO VIDEO: fade in only when really playing; remove on error so the photo stays.
  $$('.hero-video', media).forEach(video => {
    video.defaultMuted = true;
    video.muted = true;
    video.addEventListener('playing', () => video.classList.add('is-playing'));
    video.addEventListener('error', () => video.remove());
  });
  const controls = document.createElement('div');
  controls.className = 'hero-slideshow-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Banner photo slideshow');
  controls.innerHTML = `<button type="button" class="slide-arrow" data-slide-step="-1" aria-label="Previous photo">←</button><div class="hero-slide-dots">${places.map((place, i) => `<button type="button" data-slide-index="${i}" aria-label="Show ${esc(place.name)}" aria-pressed="${i === 0}"><span></span></button>`).join('')}</div><button type="button" class="slide-arrow" data-slide-step="1" aria-label="Next photo">→</button>`;
  hero.append(controls);
  const slides = $$('.hero-slide', media);
  const dots = $$('[data-slide-index]', controls);
  const label = $('.hero-location', hero);
  label.setAttribute('aria-live', 'off');
  let current = 0;
  let visible = true;
  let zoom = null;
  const zooms = new Map();
  function startZoom() {
    zooms.get(current)?.cancel();
    if (motionReduced()) { zoom = null; return; }
    zoom = $('.cover', slides[current]).animate(
      [{transform:'scale(1)'}, {transform:'scale(1.08)'}],
      {duration:motionDuration('--motion-kenburns',8000),easing:'linear',fill:'both'}
    );
    zooms.set(current, zoom);
    syncZoom();
  }
  function syncZoom() {
    if (motionReduced()) { zooms.forEach(a => a.cancel()); zoom = null; return; }
    if (!zoom) startZoom();
    if (zoom) {
      if (document.hidden || !visible) zoom.pause();
      else if (zoom.playState === 'paused') zoom.play();
    }
  }
  // HERO VIDEO: play only the current slide's video, and only when motion is allowed.
  function syncVideo() {
    const allowed = !document.hidden && visible && !motionReduced() && !document.querySelector('dialog[open]');
    slides.forEach((slide, i) => {
      const video = $('.hero-video', slide);
      if (!video) return;
      if (i === current && allowed) {
        const attempt = video.play();
        if (attempt && attempt.catch) attempt.catch(() => {});
      } else {
        video.pause();
        if (i !== current) video.classList.remove('is-playing');
      }
    });
  }
  function show(index) {
    zoom?.pause();
    current = (index + places.length) % places.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-current', i === current));
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === current)));
    label.textContent = `${String(current + 1).padStart(2, '0')} / ${String(places.length).padStart(2, '0')} · ${places[current].name}`;
    motionFade(label);
    startZoom();
    const nextVideo = $('.hero-video', slides[current]);
    if (nextVideo) nextVideo.currentTime = 0;
    syncVideo();
    clock.reset();
  }
  const clock = createMotionClock({
    duration:HERO_SLIDE_INTERVAL_MS,
    allowed:() => {
      // Pause only for keyboard focus on the controls; a mouse/touch click must not freeze the slideshow.
      const active = document.activeElement;
      const keyboardOnControls = controls.contains(active) && active.matches(':focus-visible');
      return visible && !keyboardOnControls && !document.querySelector('dialog[open]');
    },
    advance:() => show(current + 1)
  });
  controls.addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button) return;
    if (button.dataset.slideIndex !== undefined) show(Number(button.dataset.slideIndex));
    else if (button.dataset.slideStep) show(current + Number(button.dataset.slideStep));
    // Keyboard users (Enter/Space) keep focus; mouse/touch clicks release it.
    if (e.detail > 0) button.blur();
    clock.sync();
  });
  controls.addEventListener('focusin', clock.sync);
  controls.addEventListener('focusout', () => queueMicrotask(clock.sync));
  document.addEventListener('visibilitychange', () => { syncZoom(); syncVideo(); });
  document.addEventListener('motion-preference', () => { syncZoom(); syncVideo(); });
  document.addEventListener('motion-dialog-state', syncVideo);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      hero.classList.toggle('motion-outside', !visible);
      syncZoom(); syncVideo(); clock.sync();
    }, {threshold:0}).observe(hero);
  }
  show(0);
}

/* ==========================================================
   MOTION — original, library-free enhancement functions
   Colors, typography, destination data and core flows are preserved.
   Tune shared CSS variables in the final MOTION stylesheet block.
   ========================================================== */
const MOTION = {
  ready:false, preference:null, frame:0, frames:new Set(),
  animations:new Set(), seen:new Set(), ghosts:new Set()
};
function motionReduced() {
  return MOTION.preference ? MOTION.preference.matches : matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function motionDuration(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const number = parseFloat(value);
  return Number.isFinite(number) ? number * (value.endsWith('ms') ? 1 : 1000) : fallback;
}
function motionAnimate(element, frames, options = {}) {
  if (!element || document.hidden || !element.animate) return null;
  if (motionReduced()) {
    frames = frames.map(frame => ({opacity:frame.opacity ?? 1}));
    options = {...options, duration:120, delay:0};
  }
  const animation = element.animate(frames, {
    duration:motionDuration('--motion-medium',420),
    easing:getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim() || 'ease-out',
    ...options
  });
  MOTION.animations.add(animation);
  const clean = () => MOTION.animations.delete(animation);
  animation.finished.then(clean,clean);
  return animation;
}
function motionFade(element) {
  return motionAnimate(element,[{opacity:.3},{opacity:1}],{duration:motionDuration('--motion-fast',180)});
}
function queueMotionFrame() {
  if (MOTION.frame || document.hidden) return;
  MOTION.frame = requestAnimationFrame(() => {
    MOTION.frame = 0;
    MOTION.frames.forEach(paint => paint());
  });
}

/* MOTION: header scroll direction, hero boundary and focus protection. */
function bindMotionHeader() {
  const root = document.documentElement;
  const header = $('.site-header');
  const hero = $('.cinema-hero');
  const sections = $$('#journeys, .section[id]');
  const links = $$('#nav a');
  let anchor = scrollY;
  // FIXED TRANSPARENT HEADER: choose white or dark text from whatever is behind the header.
  function headerOnDark() {
    const hit = document.elementsFromPoint(innerWidth / 2, Math.min(header.offsetHeight / 2, 40))
      .find(el => !header.contains(el));
    if (!hit) return true;
    if (hit.closest('.cinema-hero, .journey-visual, .site-footer, .calc-result')) return true;
    for (let el = hit; el && el !== document.documentElement; el = el.parentElement) {
      const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
      if (!m) continue;
      if ((m.length > 3 ? Number(m[3]) : 1) < 0.5) continue;
      return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 < 0.45;
    }
    return false;
  }
  function paint() {
    const y = Math.max(0,scrollY);
    header.classList.toggle('header-on-dark', headerOnDark());
    const heroBottom = hero.getBoundingClientRect().bottom;
    const headerHeight = header.offsetHeight;
    const tops = sections.map(section => section.getBoundingClientRect().top);
    const maximum = root.scrollHeight - innerHeight;
    const protectedHeader = header.contains(document.activeElement) || $('#nav').classList.contains('open') || !!$('dialog[open]');
    header.classList.toggle('is-scrolled', heroBottom <= headerHeight);
    if (y < headerHeight || protectedHeader || motionReduced()) {
      header.classList.remove('motion-header-hidden'); anchor = y;
    } else if (Math.abs(y - anchor) > 12) {
      header.classList.toggle('motion-header-hidden',y > anchor);
      anchor = y;
    }
    $('#reading-progress').style.transform = `scaleX(${maximum > 0 ? Math.min(1,y / maximum) : 0})`;
    let active = '';
    sections.forEach((section,i) => { if (tops[i] <= 150) active = section.id; });
    links.forEach(link => {
      const current = link.getAttribute('href') === '#' + active;
      link.classList.toggle('is-active',current);
      if (current) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  header.addEventListener('focusin', () => header.classList.remove('motion-header-hidden'));
  header.addEventListener('focusout',queueMotionFrame);
  MOTION.frames.add(paint);
}

/* MOTION: once-only IntersectionObserver reveals, also for rendered grids. */
function bindMotionReveals() {
  if (!('IntersectionObserver' in window)) return;
  const reveal = element => {
    element.classList.remove('reveal-pending');
    if (element.dataset.motionId) MOTION.seen.add(element.dataset.motionId);
    observer.unobserve(element);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, {threshold:.04, rootMargin:'0px 0px -20px 0px'});
  function observe(container, selector) {
    const nodes = $$(selector,container);
    // Read positions together, before any class/style writes.
    const tops = nodes.map(element => element.getBoundingClientRect().top);
    nodes.forEach((element,index) => {
      if (element.dataset.revealReady) return;
      element.dataset.revealReady = 'true';
      element.classList.add('reveal-item');
      const stagger = motionReduced() ? 0 : (index % (innerWidth > 1050 ? 3 : 2)) * motionDuration('--motion-stagger',90);
      element.style.setProperty('--reveal-delay',stagger+'ms');
      if (!motionReduced() && tops[index] > innerHeight && !MOTION.seen.has(element.dataset.motionId) && !element.contains(document.activeElement)) {
        element.classList.add('reveal-pending'); observer.observe(element);
      } else if (element.dataset.motionId && tops[index] < innerHeight) MOTION.seen.add(element.dataset.motionId);
    });
  }
  observe(document,'.section > .wrap > .eyebrow, .section h2:not([data-motion-heading]), .section h2[data-motion-heading] .heading-mask, .section-sub, .heading-aside, .filters, .calc-form, .calc-result, .ticket, .card, .tile, .travel-intro .eyebrow, .intro-foot');
  for (const id of ['cards','gallery-grid']) {
    const container = document.getElementById(id);
    new MutationObserver(() => observe(container,'.card, .tile')).observe(container,{childList:true});
  }

  document.addEventListener('focusin',event => {
    const hidden = event.target.closest('.reveal-pending');
    if (hidden) reveal(hidden);
  });
  document.addEventListener('motion-preference', () => {
    if (motionReduced()) $$('.reveal-pending').forEach(reveal);
  });
}

/* MOTION: split selected section headings into once-only line masks. */
function bindMotionHeadingMasks() {
  $$('#explore h2, #gallery h2, #calculator h2, #itinerary h2').forEach(heading => {
    const lines = [];
    let line = '';
    heading.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'BR') {
        if (line.trim()) lines.push(line.trim());
        line = '';
      } else {
        line += node.textContent;
      }
    });
    if (line.trim()) lines.push(line.trim());
    if (!lines.length) return;
    heading.setAttribute('aria-label', lines.join(' ').replace(/\s+/g, ' '));
    heading.dataset.motionHeading = 'true';
    heading.replaceChildren(...lines.map((text, index) => {
      const mask = document.createElement('span');
      mask.className = 'heading-mask';
      mask.style.setProperty('--heading-index', index);
      const inner = document.createElement('span');
      inner.textContent = text;
      inner.setAttribute('aria-hidden', 'true');
      mask.append(inner);
      return mask;
    }));
  });
}

/* MOTION: FLIP for surviving cards, small ghosts for departing cards.
   The real DOM/filter state is updated synchronously; rapid typing cannot
   commit stale results. Ghosts are inert and never affect document height. */
function captureMotionCards(next) {
  if (!MOTION.ready) return null;
  MOTION.ghosts.forEach(ghost => ghost.remove()); MOTION.ghosts.clear();
  const old = $$('#cards .card');
  if (old.map(card => card.dataset.motionId).join() === next.map(d => d.id).join()) return null;
  const keep = new Set(next.map(d => d.id));
  const records = old.map(card => ({id:card.dataset.motionId,box:card.getBoundingClientRect(),card}));
  const previous = new Map(records.map(record => [record.id,record.box]));
  if (!motionReduced() && !document.hidden) {
    records.filter(({id,box}) => !keep.has(id) && box.bottom > 0 && box.top < innerHeight).slice(0,6).forEach(({card,box}) => {
      const ghost = card.cloneNode(true);
      ghost.inert = true; ghost.setAttribute('aria-hidden','true');
      ghost.classList.remove('reveal-pending'); ghost.classList.add('motion-card-ghost');
      ghost.style.cssText = `position:fixed;left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px;margin:0;pointer-events:none;z-index:3;`;
      document.body.append(ghost); MOTION.ghosts.add(ghost);
      const animation = motionAnimate(ghost,[{opacity:.65,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{duration:150});
      const clean = () => {ghost.remove(); MOTION.ghosts.delete(ghost);};
      if (animation) animation.finished.then(clean,clean); else clean();
    });
  }
  return previous;
}
function animateMotionCards(previous) {
  if (!previous) return;
  const cards = $$('#cards .card');
  const boxes = cards.map(card => card.getBoundingClientRect());
  cards.forEach((card,index) => {
    const box = boxes[index];
    if (box.bottom < 0 || box.top > innerHeight) return;
    const old = previous.get(card.dataset.motionId);
    const dx = old ? old.left - box.left : 0;
    const dy = old ? Math.max(-80,Math.min(80,old.top - box.top)) : 18;
    motionAnimate(card,[{opacity:old ? .7 : 0,transform:`translate(${dx}px,${dy}px)`},{opacity:1,transform:'translate(0,0)'}],{
      duration:motionDuration('--motion-medium',420),delay:motionReduced() ? 0 : (index % 3) * 45
    });
    if (!old && !motionReduced()) card.classList.add('motion-card-arrival');
  });
  motionFade($('#result-count'));
}
function motionSavePop(button) {
  if (!button) return;
  motionAnimate(button,[{transform:'scale(1)'},{transform:'scale(1.24)',offset:.45},{transform:'scale(1)'}],{duration:300});
}

/* MOTION: counters reserve their final width and run once per page visit. */
function bindMotionCounters() {
  const counters = $$('.motion-counter[data-count]');
  const jobs = new Map();
  const finish = element => {
    cancelAnimationFrame(jobs.get(element)?.frame);
    element.textContent = element.dataset.count; jobs.delete(element);
  };
  function start(element) {
    if (element.dataset.counted) return;
    element.dataset.counted = 'true';
    if (motionReduced()) { finish(element); return; }
    const job = {elapsed:0,last:0,frame:0}; jobs.set(element,job);
    const duration = motionDuration('--motion-counter',1000);
    function tick(now) {
      if (document.hidden) { job.last = 0; return; }
      if (motionReduced()) { finish(element); return; }
      if (job.last) job.elapsed += now - job.last;
      job.last = now;
      const progress = Math.min(1,job.elapsed / duration);
      element.textContent = Math.round(Number(element.dataset.count) * (1-Math.pow(1-progress,3)));
      if (progress < 1) job.frame = requestAnimationFrame(tick); else finish(element);
    }
    job.tick = tick; job.frame = requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {start(entry.target); observer.unobserve(entry.target);}
    }),{threshold:.5});
    counters.forEach(counter => observer.observe(counter));
  } else counters.forEach(start);
  document.addEventListener('visibilitychange', () => {
    jobs.forEach(job => {cancelAnimationFrame(job.frame); job.last=0; if (!document.hidden) job.frame=requestAnimationFrame(job.tick);});
  });
  document.addEventListener('motion-preference', () => {if (motionReduced()) counters.forEach(finish);});
}

/* MOTION: clock pauses elapsed time and progress when hidden/offscreen.
   No setInterval and no continuous JavaScript progress-loop are needed. */
function createMotionClock({duration,allowed,advance,progress}) {
  let timer = 0, started = 0, elapsed = 0, running = false, fill = null;
  function stop() {
    if (running) elapsed = Math.min(duration,elapsed + performance.now() - started);
    running = false; clearTimeout(timer); timer = 0; fill?.pause();
  }
  function sync() {
    const play = !document.hidden && !motionReduced() && allowed();
    if (!play) {stop(); return;}
    if (running) return;
    running = true; started = performance.now();
    fill?.play();
    timer = setTimeout(() => {
      running = false; elapsed = 0; timer = 0;
      advance();
    },Math.max(0,duration-elapsed));
  }
  function reset() {
    stop(); elapsed = 0; fill?.cancel();
    if (progress && !motionReduced()) {
      fill = progress.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration,easing:'linear',fill:'both'});
      fill.pause();
    } else {fill=null; if(progress) progress.style.transform='scaleX(0)';}
    sync();
  }
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('motion-preference', () => {if(motionReduced()){fill?.cancel();fill=null;} sync();});
  document.addEventListener('motion-dialog-state',sync);
  return {sync,reset};
}

/* MOTION: dialog lifecycle preserves focus and native Escape semantics. */
const MOTION_DIALOG_CLOSING = new WeakMap();
function motionOutsideDialog(event, dialog) {
  const box = dialog.getBoundingClientRect();
  return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
}
function openMotionDialog(dialog) {
  if (!dialog) return;
  MOTION_DIALOG_CLOSING.get(dialog)?.cancel();
  MOTION_DIALOG_CLOSING.delete(dialog);
  dialog.classList.remove('motion-dialog-closing');
  if (!dialog.open) dialog.showModal();
  dialog.classList.remove('motion-dialog-enter');
  // Restart a finite entrance without triggering a page layout read.
  motionAnimate(dialog,[{opacity:0,transform:'translateY(14px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:motionDuration('--motion-dialog',260)});
  document.dispatchEvent(new Event('motion-dialog-state'));
  queueMotionFrame();
}
function closeMotionDialog(dialog) {
  if (!dialog?.open || MOTION_DIALOG_CLOSING.has(dialog)) return;
  dialog.classList.add('motion-dialog-closing');
  const animation = motionAnimate(dialog,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(8px) scale(.98)'}],{duration:motionDuration('--motion-fast',180)});
  if (!animation) {dialog.close(); dialog.classList.remove('motion-dialog-closing');return;}
  MOTION_DIALOG_CLOSING.set(dialog,animation);
  const finish = () => {
    if (MOTION_DIALOG_CLOSING.get(dialog) !== animation) return;
    MOTION_DIALOG_CLOSING.delete(dialog); dialog.close(); dialog.classList.remove('motion-dialog-closing');
  };
  // A reduced-motion change cancels in-flight effects but still completes
  // the requested close. Reopening deletes the token and keeps it open.
  animation.finished.then(finish, finish);
}
function bindMotionDialogs() {
  $$('dialog').forEach(dialog => {
    dialog.classList.add('motion-dialog');
    dialog.addEventListener('cancel', event => {event.preventDefault();closeMotionDialog(dialog);});
    dialog.addEventListener('close', () => {document.dispatchEvent(new Event('motion-dialog-state'));queueMotionFrame();});
  });
}

/* MOTION: optional native details accordion support. No new FAQ/content is
   added. Mark future details elements with data-motion-accordion to opt in. */
function bindMotionAccordions() {
  $$('details[data-motion-accordion]').forEach(details => {
    const summary = $('summary',details);
    if (!summary) return;
    const panel = document.createElement('div'); panel.className='motion-accordion-panel';
    [...details.childNodes].filter(node => node !== summary).forEach(node => panel.append(node)); details.append(panel);
    let animation = null, desired = details.open;
    summary.addEventListener('click', event => {
      event.preventDefault(); desired=!desired;
      const start = details.open ? panel.getBoundingClientRect().height : 0;
      animation?.cancel();
      details.dataset.expanded=String(desired);
      if (motionReduced()) {details.open=desired;return;}
      details.open=true;
      const end = desired ? panel.scrollHeight : 0;
      // Height is intentionally limited to the accordion panel; all other
      // motion uses transform/opacity. Read both heights before animation.
      animation = motionAnimate(panel,[{height:start+'px',opacity:desired?0:1},{height:end+'px',opacity:desired?1:0}],{duration:motionDuration('--motion-medium',420),easing:'ease-out'});
      if (!animation) {details.open=desired;return;}
      const current = animation;
      const finish = () => {if(animation===current){details.open=desired;animation=null;}};
      animation.finished.then(finish,finish);
    });
    details.dataset.expanded=String(details.open);
  });
}

/* MOTION: story text stagger and a four-story preview carousel.
   The original page's scroll-linked story layout remains unchanged. */
function motionStoryText(step) {
  if (!step) return;
  $$('.eyebrow, h3, .journey-description, .story-link, .story-index',step).forEach((element,index) => {
    motionAnimate(element,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:460,delay:motionReduced()?0:index*65});
  });
}
function bindFeaturedStoryCarousel(stories) {
  const dialog = $('#story-preview');
  const track = $('#featured-story-slides');
  track.innerHTML=stories.map((story,index)=>`<article class="featured-story-slide ${index===0?'is-current':''}" role="group" aria-roledescription="slide" aria-label="${index+1} of ${stories.length}" aria-hidden="${index!==0}" ${index?'inert':''}>
    <div class="featured-story-image">${coverHTML(byId(story.id))}</div><div class="featured-story-text"><p class="eyebrow">${story.label}</p><h3>${story.title.replace(/<br>/g,'')}</h3><p>${story.text}</p><button type="button" class="story-link" data-featured-place="${story.id}">${story.action} <span aria-hidden="true">↗</span></button></div></article>`).join('');
  const slides=$$('.featured-story-slide',track);
  const counter=$('#story-preview-counter');
  const play=$('#story-preview-play');
  let index=0, paused=false;
  const clock=createMotionClock({duration:motionDuration('--motion-story-interval',6000),progress:$('#story-autoplay-progress'),allowed:()=>dialog.open && !dialog.classList.contains('motion-dialog-closing') && !paused && !document.activeElement?.matches('#story-preview-prev, #story-preview-next, [data-featured-place]'),advance:()=>show(index+1)});
  function show(next) {
    index=(next+slides.length)%slides.length;
    slides.forEach((slide,i)=>{slide.classList.toggle('is-current',i===index);slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
    counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    motionAnimate(counter,[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:240});
    $$('.featured-story-text > *',slides[index]).forEach((element,i)=>motionAnimate(element,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:460,delay:motionReduced()?0:80*i}));
    clock.reset();
  }
  function syncPlay() {
    play.disabled=motionReduced();
    play.textContent=motionReduced()?'Manual stories':paused?'Play stories':'Pause stories';
    play.setAttribute('aria-pressed',String(paused||motionReduced()));
    clock.sync();
  }
  $('#story-preview-open').addEventListener('click',()=>{
    paused=false;openMotionDialog(dialog);$('#story-preview-title').focus();show(index);syncPlay();
  });
  $('#story-preview-prev').addEventListener('click',()=>show(index-1));
  $('#story-preview-next').addEventListener('click',()=>show(index+1));
  play.addEventListener('click',()=>{paused=!paused;syncPlay();});
  $('#story-preview-close').addEventListener('click',()=>{closeMotionDialog(dialog);clock.sync();});
  dialog.addEventListener('click',event=>{
    if(event.target===dialog && motionOutsideDialog(event,dialog)){closeMotionDialog(dialog);clock.sync();}
    const button=event.target.closest('[data-featured-place]');
    if(button){paused=true;syncPlay();showLightbox(DESTINATIONS.findIndex(d=>d.id===button.dataset.featuredPlace));openMotionDialog($('#lightbox'));}
  });
  dialog.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();paused=true;show(index+(event.key==='ArrowRight'?1:-1));syncPlay();}
  });
  dialog.addEventListener('focusin',clock.sync);
  dialog.addEventListener('focusout',()=>queueMicrotask(clock.sync));
  dialog.addEventListener('close',clock.sync);
  document.addEventListener('motion-preference',syncPlay);
  syncPlay();
}