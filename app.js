const CURRENCIES = [
  {code:"USD",flag:"🇺🇸"},{code:"EUR",flag:"🇪🇺"},{code:"GBP",flag:"🇬🇧"},
  {code:"JPY",flag:"🇯🇵"},{code:"INR",flag:"🇮🇳"},{code:"CAD",flag:"🇨🇦"},
  {code:"AUD",flag:"🇦🇺"},{code:"CHF",flag:"🇨🇭"},{code:"CNY",flag:"🇨🇳"},
  {code:"SGD",flag:"🇸🇬"},{code:"HKD",flag:"🇭🇰"},{code:"MXN",flag:"🇲🇽"},
  {code:"BRL",flag:"🇧🇷"},{code:"KRW",flag:"🇰🇷"},{code:"SEK",flag:"🇸🇪"},
  {code:"NOK",flag:"🇳🇴"},{code:"NZD",flag:"🇳🇿"},{code:"ZAR",flag:"🇿🇦"},
  {code:"AED",flag:"🇦🇪"},{code:"THB",flag:"🇹🇭"},
];

const FALLBACK = {
  USD:1, EUR:0.921, GBP:0.790, JPY:149.5, INR:83.1, CAD:1.354,
  AUD:1.525, CHF:0.897, CNY:7.24, SGD:1.34, HKD:7.82, MXN:17.1,
  BRL:4.97, KRW:1325, SEK:10.4, NOK:10.6, NZD:1.63, ZAR:18.7,
  AED:3.67, THB:35.2
};

const DEFAULT_CMP = ["EUR","GBP","JPY","INR","CAD","AUD","CHF","CNY"];

let rates = null, ratesTime = null;
let favorites = JSON.parse(localStorage.getItem('cc_favs') || '[]');
let history = JSON.parse(localStorage.getItem('cc_hist') || '[]');
let chartInstance = null;
let chartDays = 7;
let cmpSelected = new Set(DEFAULT_CMP);

// --- Helpers ---
function fmt(val, code) {
  if (isNaN(val) || val === null) return '—';
  const isInt = ['JPY','KRW'].includes(code);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: isInt ? 0 : 2,
    maximumFractionDigits: isInt ? 0 : 4
  }).format(val);
}

function getRate(a, b) {
  if (!rates) return null;
  return rates[b] / rates[a];
}

function saveFavs() { localStorage.setItem('cc_favs', JSON.stringify(favorites)); }
function saveHist() { localStorage.setItem('cc_hist', JSON.stringify(history.slice(0, 50))); }

function formatAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

// --- Populate selects ---
function populateSel(sel, defVal) {
  CURRENCIES.forEach(c => {
    const o = document.createElement('option');
    o.value = c.code;
    o.textContent = `${c.flag} ${c.code}`;
    sel.appendChild(o);
  });
  sel.value = defVal;
}

['fromCurrency','toCurrency','cmpBase','chartFrom','chartTo'].forEach((id, i) => {
  const defaults = ['USD','INR','USD','USD','EUR'];
  populateSel(document.getElementById(id), defaults[i]);
});

// --- Tabs ---
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('tab-' + t.dataset.tab).classList.add('active');
    if (t.dataset.tab === 'chart') renderChart();
    if (t.dataset.tab === 'favorites') renderFavs();
    if (t.dataset.tab === 'history') renderHistory();
    if (t.dataset.tab === 'compare') renderCompare();
  });
});

// --- Fetch rates ---
async function fetchRates() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    rates = data.rates;
    ratesTime = new Date();
  } catch {
    rates = FALLBACK;
    ratesTime = null;
  }
  convert();
  renderCompare();
  renderFavs();
  const ts = document.getElementById('timestamp');
  ts.textContent = ratesTime
    ? `Rates updated ${ratesTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`
    : 'Using fallback rates';
}

// --- Convert ---
function convert() {
  if (!rates) return;
  const from = document.getElementById('fromCurrency').value;
  const to = document.getElementById('toCurrency').value;
  const amount = parseFloat(document.getElementById('fromAmount').value);
  const rate = getRate(from, to);
  if (!rate || isNaN(amount)) { document.getElementById('toOutput').textContent = '—'; return; }
  const result = amount * rate;
  document.getElementById('toOutput').textContent = fmt(result, to);
  document.getElementById('rateBar').style.display = 'flex';
  document.getElementById('rateLabel').textContent = `1 ${from} =`;
  document.getElementById('rateVal').textContent = `${fmt(rate, to)} ${to}`;
  updateFavBtn();
  if (!isNaN(amount) && amount > 0) {
    history.unshift({ from, to, amount, result: parseFloat(result.toFixed(4)), rate: parseFloat(rate.toFixed(6)), time: Date.now() });
    if (history.length > 50) history.pop();
    saveHist();
  }
}

// --- Favorites button ---
function updateFavBtn() {
  const from = document.getElementById('fromCurrency').value;
  const to = document.getElementById('toCurrency').value;
  const isFav = favorites.some(f => f.key === `${from}_${to}`);
  document.getElementById('favToggleBtn').textContent = isFav ? '★' : '☆';
}

document.getElementById('favToggleBtn').addEventListener('click', () => {
  const from = document.getElementById('fromCurrency').value;
  const to = document.getElementById('toCurrency').value;
  const key = `${from}_${to}`;
  const idx = favorites.findIndex(f => f.key === key);
  if (idx >= 0) favorites.splice(idx, 1);
  else favorites.push({ key, from, to });
  saveFavs(); updateFavBtn(); renderFavs();
});

// --- Swap ---
document.getElementById('swapBtn').addEventListener('click', () => {
  const f = document.getElementById('fromCurrency');
  const t = document.getElementById('toCurrency');
  const tmp = f.value; f.value = t.value; t.value = tmp;
  const btn = document.getElementById('swapBtn');
  btn.classList.add('spin');
  setTimeout(() => btn.classList.remove('spin'), 200);
  convert();
});

document.getElementById('fromCurrency').addEventListener('change', () => { convert(); updateFavBtn(); });
document.getElementById('toCurrency').addEventListener('change', () => { convert(); updateFavBtn(); });
document.getElementById('fromAmount').addEventListener('input', convert);

// --- Compare ---
function buildCmpChecks() {
  const wrap = document.getElementById('cmpChecks');
  wrap.innerHTML = '';
  CURRENCIES.filter(c => c.code !== 'USD').forEach(c => {
    const div = document.createElement('div');
    div.className = 'cmp-check' + (cmpSelected.has(c.code) ? ' checked' : '');
    div.textContent = `${c.flag} ${c.code}`;
    div.addEventListener('click', () => {
      if (cmpSelected.has(c.code)) cmpSelected.delete(c.code);
      else cmpSelected.add(c.code);
      div.classList.toggle('checked');
      renderCompare();
    });
    wrap.appendChild(div);
  });
}

function renderCompare() {
  if (!rates) return;
  const base = document.getElementById('cmpBase').value;
  const amount = parseFloat(document.getElementById('cmpAmount').value) || 1;
  const grid = document.getElementById('compareGrid');
  grid.innerHTML = '';
  cmpSelected.forEach(code => {
    if (code === base) return;
    const rate = getRate(base, code);
    const div = document.createElement('div');
    div.className = 'cmp-item';
    const c = CURRENCIES.find(x => x.code === code);
    div.innerHTML = `<div class="cmp-code">${c?.flag || ''} ${code}</div><div class="cmp-val">${fmt(amount * rate, code)}</div>`;
    div.addEventListener('click', () => {
      document.getElementById('fromCurrency').value = base;
      document.getElementById('toCurrency').value = code;
      document.getElementById('fromAmount').value = amount;
      document.querySelectorAll('.tab')[0].click();
      convert();
    });
    grid.appendChild(div);
  });
}

document.getElementById('cmpBase').addEventListener('change', renderCompare);
document.getElementById('cmpAmount').addEventListener('input', renderCompare);
buildCmpChecks();

// --- Chart ---
function generateHistory(from, to, days) {
  const base = getRate(from, to) || 1;
  const pts = [];
  const now = Date.now();
  const volatility = base * 0.008;
  let val = base * (0.97 + Math.random() * 0.06);
  for (let i = days; i >= 0; i--) {
    val += ((base - val) * 0.05) + (Math.random() - 0.5) * volatility;
    pts.push({ x: new Date(now - i * 86400000), y: parseFloat(val.toFixed(6)) });
  }
  pts[pts.length - 1].y = base;
  return pts;
}

function renderChart() {
  if (!rates) return;
  const from = document.getElementById('chartFrom').value;
  const to = document.getElementById('chartTo').value;
  const pts = generateHistory(from, to, chartDays);
  const vals = pts.map(p => p.y);
  const minVal = Math.min(...vals), maxVal = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  document.getElementById('chartMin').textContent = `Low: ${fmt(minVal, to)}`;
  document.getElementById('chartAvg').textContent = `Avg: ${fmt(avg, to)}`;
  document.getElementById('chartMax').textContent = `High: ${fmt(maxVal, to)}`;

  const canvas = document.getElementById('rateChart');
  const wrap = canvas.parentElement;
  const W = wrap.clientWidth || 560;
  const H = 180;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const padL = 10, padR = 60, padT = 16, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const range = maxVal - minVal || maxVal * 0.01;

  function xPos(i) { return padL + (i / (pts.length - 1)) * chartW; }
  function yPos(v) { return padT + chartH - ((v - minVal) / range) * chartH; }

  // Grid lines + Y labels (right side)
  const ySteps = 4;
  ctx.font = '10px monospace';
  ctx.fillStyle = '#aaa';
  ctx.textAlign = 'left';
  for (let i = 0; i <= ySteps; i++) {
    const v = minVal + (range * i / ySteps);
    const y = yPos(v);
    ctx.strokeStyle = 'rgba(128,128,128,0.12)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
    ctx.fillText(fmt(v, to), padL + chartW + 6, y + 3);
  }

  // X axis date labels
  const xLabelCount = Math.min(pts.length, chartDays <= 7 ? 7 : chartDays <= 30 ? 5 : 4);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#aaa';
  for (let i = 0; i < xLabelCount; i++) {
    const idx = Math.round(i * (pts.length - 1) / (xLabelCount - 1));
    const d = pts[idx].x;
    const label = chartDays <= 7
      ? d.toLocaleDateString([], { weekday: 'short' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    ctx.fillText(label, xPos(idx), H - 6);
  }

  // Fill area under line
  ctx.beginPath();
  ctx.moveTo(xPos(0), yPos(pts[0].y));
  for (let i = 1; i < pts.length; i++) {
    const x0 = xPos(i - 1), y0 = yPos(pts[i - 1].y);
    const x1 = xPos(i), y1 = yPos(pts[i].y);
    const cpx = (x0 + x1) / 2;
    ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
  }
  ctx.lineTo(xPos(pts.length - 1), padT + chartH);
  ctx.lineTo(xPos(0), padT + chartH);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  grad.addColorStop(0, 'rgba(55,138,221,0.18)');
  grad.addColorStop(1, 'rgba(55,138,221,0.01)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(xPos(0), yPos(pts[0].y));
  for (let i = 1; i < pts.length; i++) {
    const x0 = xPos(i - 1), y0 = yPos(pts[i - 1].y);
    const x1 = xPos(i), y1 = yPos(pts[i].y);
    const cpx = (x0 + x1) / 2;
    ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
  }
  ctx.strokeStyle = '#378ADD';
  ctx.lineWidth = 1.8;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Hover tooltip
  canvas.onmousemove = function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left - padL;
    const idx = Math.max(0, Math.min(pts.length - 1, Math.round((mx / chartW) * (pts.length - 1))));
    renderChart._hover = idx;
    renderChart();
    // Draw tooltip dot + label
    const cx = xPos(idx), cy = yPos(pts[idx].y);
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#378ADD';
    ctx.fill();
    const label = `${fmt(pts[idx].y, to)} ${to}`;
    const tx = cx + 8 > W - 80 ? cx - 70 : cx + 8;
    ctx.fillStyle = '#555';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, tx, cy - 6);
  };
  canvas.onmouseleave = function() { renderChart._hover = null; renderChart(); };
}

document.getElementById('chartFrom').addEventListener('change', renderChart);
document.getElementById('chartTo').addEventListener('change', renderChart);
document.querySelectorAll('.period-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    chartDays = parseInt(b.dataset.d);
    renderChart();
  });
});

// --- Favorites list ---
function renderFavs() {
  const list = document.getElementById('favList');
  if (!favorites.length) { list.innerHTML = '<div class="empty">No favorites yet.<br>Star a pair from the Convert tab.</div>'; return; }
  list.innerHTML = '';
  favorites.forEach((f, i) => {
    const rate = getRate(f.from, f.to);
    const fc = CURRENCIES.find(c => c.code === f.from);
    const tc = CURRENCIES.find(c => c.code === f.to);
    const div = document.createElement('div');
    div.className = 'fav-item';
    div.innerHTML = `<div><div class="fav-pair">${fc?.flag || ''} ${f.from} → ${tc?.flag || ''} ${f.to}</div><div class="fav-rate">1 ${f.from} = ${fmt(rate, f.to)} ${f.to}</div></div><button class="fav-del" data-i="${i}">✕</button>`;
    div.addEventListener('click', e => {
      if (e.target.classList.contains('fav-del')) return;
      document.getElementById('fromCurrency').value = f.from;
      document.getElementById('toCurrency').value = f.to;
      document.querySelectorAll('.tab')[0].click();
      convert();
    });
    list.appendChild(div);
  });
  document.querySelectorAll('.fav-del').forEach(btn => {
    btn.addEventListener('click', () => {
      favorites.splice(parseInt(btn.dataset.i), 1);
      saveFavs(); renderFavs(); updateFavBtn();
    });
  });
}

// --- History ---
function renderHistory() {
  const hdr = document.getElementById('histHeader');
  const list = document.getElementById('histList');
  if (!history.length) { hdr.innerHTML = ''; list.innerHTML = '<div class="empty">No conversions yet.</div>'; return; }
  hdr.innerHTML = `<button class="clear-btn" id="clearHistBtn">Clear all</button>`;
  document.getElementById('clearHistBtn').addEventListener('click', () => { history = []; saveHist(); renderHistory(); });
  list.innerHTML = '';
  history.slice(0, 30).forEach(h => {
    const div = document.createElement('div');
    div.className = 'hist-item';
    div.innerHTML = `<div style="flex:1"><div class="hist-conv">${fmt(h.amount, h.from)} ${h.from} = ${fmt(h.result, h.to)} ${h.to}</div><div class="hist-time">${formatAgo(h.time)}</div></div><div class="hist-rate">@ ${fmt(h.rate, h.to)}</div>`;
    list.appendChild(div);
  });
}

// --- Init ---
fetchRates();
