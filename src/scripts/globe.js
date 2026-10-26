// Interactive globe for the map home (ADR-015, ADR-017). D3 orthographic projection over our own
// boundary files: India from Survey of India data, elsewhere Natural Earth (ADR-005, ADR-013).
import * as d3 from 'd3';
import { feature } from 'topojson-client';

const DATA = JSON.parse(document.getElementById('tracker-data').textContent);
const NAT = DATA.countries;
const STATUS = DATA.statusLabel;
const FOCUS = ['IND', 'BRA', 'ZAF', 'KOR', 'CHN'];
const RANK = ['in_force', 'passed', 'voluntary', 'in_progress', 'proposed'];
const HOME_ROT = [-62, -6, 0];
const K_MIN = 0.8, K_MAX = 18;

// India's states and UTs keyed by LGD code: [code, name, tile row, tile col, LGD].
const IN_UNITS = [['JK','Jammu and Kashmir',0,2,1],['LA','Ladakh',0,3,37],['PB','Punjab',1,2,3],['HP','Himachal Pradesh',1,3,2],['CH','Chandigarh',2,1,4],['HR','Haryana',2,2,6],['UK','Uttarakhand',2,3,5],['RJ','Rajasthan',3,1,8],['DL','Delhi',3,2,7],['UP','Uttar Pradesh',3,3,9],['BR','Bihar',3,4,10],['SK','Sikkim',3,5,11],['AS','Assam',3,6,18],['AR','Arunachal Pradesh',3,7,12],['GJ','Gujarat',4,1,24],['MP','Madhya Pradesh',4,2,23],['CG','Chhattisgarh',4,3,22],['JH','Jharkhand',4,4,20],['WB','West Bengal',4,5,19],['ML','Meghalaya',4,6,17],['NL','Nagaland',4,7,13],['DH','Dadra and Nagar Haveli and Daman and Diu',5,1,38],['MH','Maharashtra',5,2,27],['TS','Telangana',5,3,36],['OD','Odisha',5,4,21],['TR','Tripura',5,6,16],['MN','Manipur',5,7,14],['GA','Goa',6,1,30],['KA','Karnataka',6,2,29],['AP','Andhra Pradesh',6,3,28],['MZ','Mizoram',6,6,15],['KL','Kerala',7,2,32],['TN','Tamil Nadu',7,3,33],['PY','Puducherry',7,4,34],['LD','Lakshadweep',8,0,31],['AN','Andaman and Nicobar Islands',8,6,35]];
const IN_UT = new Set(['JK','LA','CH','DL','DH','PY','LD','AN']);
const RENAME = { 'CN-NM': 'Inner Mongolia', 'KR-45': 'Jeonbuk' };

function kindOf(code, iso) {
  if (iso === 'IND') return IN_UT.has(code) ? 'Union territory' : 'State';
  if (iso === 'BRA') return code === 'BR-DF' ? 'Federal District' : 'State';
  if (iso === 'ZAF') return 'Province';
  if (iso === 'KOR') {
    if (code === 'KR-11') return 'Special city';
    if (code === 'KR-50') return 'Special self-governing city';
    if (['KR-42','KR-45','KR-49'].includes(code)) return 'Special self-governing province';
    if (['KR-26','KR-27','KR-28','KR-29','KR-30','KR-31'].includes(code)) return 'Metropolitan city';
    return 'Province';
  }
  if (['CN-BJ','CN-SH','CN-TJ','CN-CQ'].includes(code)) return 'Municipality';
  if (['CN-GX','CN-NM','CN-NX','CN-XJ','CN-XZ'].includes(code)) return 'Autonomous region';
  if (['CN-HK','CN-MO'].includes(code)) return 'Special administrative region';
  return 'Province';
}

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDeg = (v, p, n) => Math.abs(Math.round(v)) + '°' + (v >= 0 ? p : n);
const stamp = (s) => `<span class="stamp s-${s}">${STATUS[s] || s}</span>`;

const units = new Map();
let worldF = [], unitF = [], outline = null, W = 0, H = 0, R = 200, projection, geo;
let rot = [52, 10, 0], k = 1, cx = 0, view = null, sel = null, mode = 'map', last = null, interacted = false, raf = 0;
const svg = d3.select('#map');
let gGlobe, gOver, worldSel, unitSel, activeUnits = d3.select(null);

async function loadGeo() {
  const get = (f) => fetch(`${DATA.base}geo/${f}`).then((r) => { if (!r.ok) throw new Error(f); return r.json(); });
  const [w, i, a] = await Promise.all([get('world.topojson'), get('india.topojson'), get('admin1.topojson')]);
  worldF = feature(w, w.objects.world).features;
  outline = feature(i, i.objects.india_outline);
  const byLgd = new Map(IN_UNITS.map((u) => [u[4], u]));
  feature(i, i.objects.states).features.forEach((f) => {
    const p = f.properties;
    if (p.disputed) f.u = { key: 'disp-' + unitF.length, iso: 'IND', disputed: true };
    else { const u = byLgd.get(p.lgd); f.u = { key: u[0], iso: 'IND', name: u[1], kind: kindOf(u[0], 'IND'), lgd: p.lgd }; units.set(u[0], f.u); }
    unitF.push(f);
  });
  feature(a, a.objects.admin1).features.forEach((f) => {
    const p = f.properties;
    f.u = { key: p.code, iso: p.iso3, name: RENAME[p.code] || p.name, kind: kindOf(p.code, p.iso3), code: p.code };
    units.set(p.code, f.u); unitF.push(f);
  });
}

function nationalLine(iso) {
  const s = NAT[iso].status;
  return s ? `${STATUS[s]} at national level` : 'No records yet';
}

function build() {
  gGlobe = svg.append('g');
  gGlobe.append('path').attr('class', 'sphere');
  gGlobe.append('path').attr('class', 'grat');
  worldSel = gGlobe.append('g').selectAll('path').data(worldF).join('path')
    .on('click', (e, d) => { const iso = d.properties.iso3; if (FOCUS.includes(iso) && iso !== view) drill(iso); })
    .on('mousemove', (e, d) => { if (e.buttons) return hideTip(); const iso = d.properties.iso3; if (FOCUS.includes(iso) && iso !== view) tip(e, NAT[iso].name, nationalLine(iso), 'Click to see states'); else hideTip(); })
    .on('mouseleave', hideTip);
  unitSel = gGlobe.append('g').selectAll('path').data(unitF).join('path')
    .on('click', (e, d) => { if (!d.u.disputed && d.u.iso === view) select(d.u.key); })
    .on('mousemove', (e, d) => { if (e.buttons || d.u.disputed || d.u.iso !== view) return hideTip(); tip(e, d.u.name, 'No state-level records yet', d.u.kind); })
    .on('mouseleave', hideTip);
  gGlobe.append('path').attr('class', 'ib');
  gGlobe.append('circle').attr('class', 'shade').attr('fill', 'url(#shadeGrad)');
  gOver = svg.append('g');
  gOver.append('circle').attr('class', 'rim');
  gOver.append('circle').attr('class', 'rim2');
  gOver.append('g').attr('class', 'ticks');
  gOver.append('g').attr('class', 'locators');
  gOver.append('g').attr('class', 'labels');
}

function setup() {
  const b = $('#frame').getBoundingClientRect(); W = b.width || 800; H = b.height || 520;
  svg.attr('viewBox', `0 0 ${W} ${H}`);
  R = Math.max(120, Math.min(W, H) / 2 - 34);
  projection = d3.geoOrthographic().precision(0.6);
  geo = d3.geoPath(projection);
  gOver.select('.ticks').selectAll('line').data(d3.range(0, 360, 5)).join('line').attr('class', 'tick');
  render();
}

function refW() { const r = $('#ref'); return W > 700 && r.open && r.offsetParent ? r.offsetWidth + 24 : 0; }
function targetCx() { return view ? (W - refW()) / 2 : W / 2; }

const LOFF = { KOR: [10, 20, 'start'], CHN: [-30, -8, 'middle'], IND: [-8, 8, 'middle'], BRA: [0, 6, 'middle'], ZAF: [0, 4, 'middle'] };

function render() {
  raf = 0;
  projection.translate([cx || W / 2, H / 2]).scale(R * k).rotate(rot);
  gGlobe.select('.sphere').attr('d', geo({ type: 'Sphere' }));
  gGlobe.select('.grat').attr('d', geo(d3.geoGraticule10()));
  worldSel.attr('d', geo);
  activeUnits.attr('d', geo);
  gGlobe.select('.ib').attr('d', geo(outline));
  const c = projection.translate(), r = R * k;
  gGlobe.select('.shade').attr('cx', c[0]).attr('cy', c[1]).attr('r', r);
  const showRim = r < Math.max(W, H);
  gOver.select('.rim').attr('cx', c[0]).attr('cy', c[1]).attr('r', r).attr('display', showRim ? null : 'none');
  gOver.select('.rim2').attr('cx', c[0]).attr('cy', c[1]).attr('r', r + 11).attr('display', showRim ? null : 'none');
  gOver.select('.ticks').attr('display', showRim ? null : 'none').selectAll('line')
    .attr('x1', (d) => c[0] + (r + 4) * Math.cos(d * Math.PI / 180)).attr('y1', (d) => c[1] + (r + 4) * Math.sin(d * Math.PI / 180))
    .attr('x2', (d) => c[0] + (r + (d % 30 ? 7 : 11)) * Math.cos(d * Math.PI / 180)).attr('y2', (d) => c[1] + (r + (d % 30 ? 7 : 11)) * Math.sin(d * Math.PI / 180));
  const centre = [-rot[0], -rot[1]];
  const vis = (p) => d3.geoDistance(p, centre) < 1.4;
  const labs = view ? [] : FOCUS.map((iso) => { const f = worldF.find((d) => d.properties.iso3 === iso); return { iso, f, p: f.properties.c || (f.properties.c = d3.geoCentroid(f)) }; }).filter((d) => vis(d.p));
  // Countries too small to see at this zoom (South Korea, most of the time) get a locator ring and a callout label outside the rim.
  labs.forEach((d) => {
    const b = geo.bounds(d.f), s = projection(d.p); d.s = s;
    d.small = Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]) < 34;
    if (d.small) {
      const vx = s[0] - c[0], vy = s[1] - c[1], vl = Math.hypot(vx, vy) || 1, tw = NAT[d.iso].name.length * 10.5;
      if (showRim) { d.lx = c[0] + vx / vl * (r + 28); d.ly = c[1] + vy / vl * (r + 28) + 4; d.anchor = vx >= 0 ? 'start' : 'end'; }
      else { d.anchor = s[0] + 170 < W ? 'start' : 'end'; d.lx = s[0] + (d.anchor === 'start' ? 34 : -34); d.ly = s[1] + 40; }
      d.clamped = false;
      if (d.anchor === 'start' && d.lx + tw > W - 6) { d.anchor = 'end'; d.lx = W - 6; d.clamped = true; }
      else if (d.anchor === 'end' && d.lx - tw < 6) { d.anchor = 'start'; d.lx = 6; d.clamped = true; }
      if (d.clamped) d.ly += d.ly > s[1] ? 16 : -16;
      d.ly = Math.max(18, Math.min(H - 24, d.ly));
    } else { d.anchor = LOFF[d.iso][2]; d.lx = s[0] + LOFF[d.iso][0]; d.ly = s[1] + LOFF[d.iso][1]; }
  });
  const statusVar = { in_progress: 'progress', in_force: 'force', voluntary: 'vol' };
  gOver.select('.locators').selectAll('g.loc').data(labs.filter((d) => d.small), (d) => d.iso).join((enter) => {
    const g = enter.append('g').attr('class', 'loc').attr('role', 'button').attr('aria-label', (d) => NAT[d.iso].name)
      .on('click', (e, d) => drill(d.iso))
      .on('mousemove', (e, d) => tip(e, NAT[d.iso].name, nationalLine(d.iso), 'Click to see states'))
      .on('mouseleave', hideTip);
    g.append('line').attr('class', 'leader');
    g.append('circle').attr('class', 'locator-hit').attr('r', 20);
    g.append('circle').attr('class', 'locator').attr('r', 14);
    g.append('circle').attr('r', 3).style('fill', (d) => { const s = NAT[d.iso].status; return s ? `var(--s-${statusVar[s] || s})` : 'var(--ink-3)'; });
    return g;
  })
    .attr('transform', (d) => `translate(${d.s[0]},${d.s[1]})`)
    .each(function (d) {
      const tw = NAT[d.iso].name.length * 10.5;
      const ex = d.clamped ? d.lx + (d.anchor === 'end' ? -tw / 2 : tw / 2) : d.lx + (d.anchor === 'start' ? -5 : 5);
      const ey = d.clamped ? d.ly + (d.ly > d.s[1] ? -16 : 6) : d.ly - 4;
      const dx = ex - d.s[0], dy = ey - d.s[1], len = Math.hypot(dx, dy) || 1;
      d3.select(this).select('line').attr('x1', dx / len * 14).attr('y1', dy / len * 14).attr('x2', dx).attr('y2', dy);
    });
  gOver.select('.labels').selectAll('text').data(labs, (d) => d.iso).join('text').attr('class', 'lbl')
    .attr('x', (d) => d.lx).attr('y', (d) => d.ly).attr('text-anchor', (d) => d.anchor).text((d) => NAT[d.iso].name);
  const kmPx = 6371 / (R * k);
  const nice = [5, 10, 20, 50, 100, 200, 250, 500, 1000, 2000, 2500].find((n) => n / kmPx >= 60) || 2500;
  $('#readout').innerHTML = `<span>Centre ${fmtDeg(centre[1], 'N', 'S')} ${fmtDeg(centre[0], 'E', 'W')} · ×${k.toFixed(1)}</span><span>0 — ${nice.toLocaleString('en-IN')} km at centre</span><i style="width:${Math.round(nice / kmPx)}px"></i>`;
}
function schedule() { if (!raf) raf = requestAnimationFrame(render); }

// d3.zoom supplies gestures only; the globe keeps its own rotation and zoom factor.
// Drag turns the globe by the pointer's movement; wheel and pinch scale k by the gesture's ratio.
const zoom = d3.zoom().scaleExtent([1e-6, 1e6]).clickDistance(4)
  .on('start', (e) => { last = e.transform; if (e.sourceEvent) { svg.interrupt('fly'); firstTouch(); svg.classed('dragging', e.sourceEvent.type !== 'wheel'); hideTip(); } })
  .on('zoom', (e) => {
    const t = e.transform, se = e.sourceEvent;
    if (!se || !last) { last = t; return; }
    const pinch = se.type === 'wheel' || (se.touches && se.touches.length > 1);
    if (pinch) k = Math.max(K_MIN, Math.min(K_MAX, k * t.k / last.k));
    else { const s = (180 / Math.PI) / (R * k); rot = [rot[0] + (t.x - last.x) * s, Math.max(-85, Math.min(85, rot[1] - (t.y - last.y) * s)), 0]; }
    last = t; schedule();
  })
  .on('end', () => svg.classed('dragging', false));

function flyTo(r1, k1, dur) {
  const r0 = rot.slice(), k0 = k, c0 = cx || W / 2, c1 = targetCx();
  const dl = ((r1[0] - r0[0]) % 360 + 540) % 360 - 180;
  const ir = d3.interpolate(r0, [r0[0] + dl, r1[1], 0]), ik = d3.interpolateNumber(k0, k1), ic = d3.interpolateNumber(c0, c1);
  if (reduceMotion || !dur) { rot = ir(1); k = k1; cx = c1; render(); return; }
  svg.transition('fly').duration(dur).ease(d3.easeCubicInOut).tween('fly', () => (t) => { rot = ir(t); k = ik(t); cx = ic(t); render(); });
}
function fitCountry(iso) {
  const f = worldF.find((d) => d.properties.iso3 === iso), c = d3.geoCentroid(f), b = d3.geoBounds(f);
  const th = Math.max(0.02, d3.geoDistance(b[0], b[1]) / 2);
  const kk = Math.max(1, Math.min(16, 0.42 * Math.min(W - refW(), H) / (R * Math.sin(th))));
  return { rot: [-c[0], -c[1], 0], k: kk };
}
function firstTouch() { if (!interacted) { interacted = true; $('#hint').classList.add('gone'); } }

function restyle() {
  worldSel.attr('class', (d) => {
    const iso = d.properties.iso3;
    if (!FOCUS.includes(iso)) return 'land';
    if (iso === view) return 'land drilled';
    return view ? 'land other' : 'land focus' + (NAT[iso].status ? ' f-' + NAT[iso].status : '');
  });
  unitSel.attr('class', (d) => unitClass(d.u));
  unitSel.filter((d) => d.u.iso !== view).attr('d', null);
  activeUnits = unitSel.filter((d) => d.u.iso === view);
  activeUnits.filter((d) => d.u.key === sel).raise();
  gGlobe.select('.ib').attr('class', view ? 'ib' : 'ib world').raise();
  gGlobe.select('.shade').raise();
  if (mode === 'grid') grid();
  render();
}
function unitClass(u) {
  if (u.iso !== view) return 'unit off';
  if (u.disputed) return 'unit neutral';
  return 'unit on nodata' + (u.key === sel ? ' sel' : '');
}

function legend() {
  const ib = '<svg width="34" height="8" aria-hidden="true"><line x1="0" y1="4" x2="34" y2="4" style="stroke:var(--ink);stroke-width:1.4;stroke-dasharray:8 3 1.5 3"/></svg>';
  const sw = (cls, op) => `<svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" class="${cls}" style="fill-opacity:${op};stroke:var(--ink-3);stroke-width:.8"/></svg>`;
  const rows = RANK.map((s) => `<li>${sw('f-' + s, 0.62)}${STATUS[s]}</li>`).join('') + `<li>${sw('unit nodata', 1)}No records yet</li>`;
  $('#refBody').innerHTML = `<ul>${rows}<li>${ib}Boundary of India</li></ul><p class="note">Countries are coloured by their most advanced national instrument.</p><p class="note">India: Survey of India. Elsewhere: Natural Earth.</p>`;
}

function drill(iso) {
  view = iso; sel = null; hideTip(); firstTouch();
  $('#viewSeg').hidden = iso !== 'IND'; if (iso !== 'IND' && mode === 'grid') setMode('map');
  restyle(); const t = fitCountry(iso); flyTo(t.rot, t.k, 1200); showCountry(iso); crumbs(); gotoState();
}
function home() { const lastView = view; view = null; sel = null; hideTip(); setMode('map'); $('#viewSeg').hidden = true; restyle(); flyTo(HOME_ROT, 1, 1100); showCountry(lastView || 'IND'); crumbs(); gotoState(); }
function select(key) {
  sel = key; restyle(); showUnit(key); crumbs();
  const f = unitF.find((d) => d.u.key === key);
  if (f && mode === 'map') { const c = d3.geoCentroid(f); if (d3.geoDistance(c, [-rot[0], -rot[1]]) > 0.9) flyTo([-c[0], -c[1], 0], k, 700); }
}
function crumbs() {
  let h = view ? '<button type="button" data-go="home">All countries</button>' : '<strong>All countries</strong>';
  if (view) h += ' / ' + (sel ? `<button type="button" data-go="${view}">${esc(NAT[view].name)}</button>` : `<strong>${esc(NAT[view].name)}</strong>`);
  if (sel) h += ` / <strong>${esc(units.get(sel).name)}</strong>`;
  $('#crumbs').innerHTML = h;
}
function gotoState() { document.querySelectorAll('#goto button').forEach((b) => b.setAttribute('aria-current', String(b.dataset.iso === view))); }

function logList(items) {
  if (!items.length) return '<p class="empty">No records yet. New items appear here when the daily check finds them.</p>';
  return `<ol class="log">${items.map((i) => `<li><time>${esc(i.dateLabel || '')}</time><div><div class="sl">${stamp(i.status)}<span class="prov ${i.provenance}">${i.provenance === 'reviewed' ? 'Reviewed' : 'Auto-extracted'}</span></div><p class="t"><a href="${esc(i.href)}">${esc(i.title)}</a></p><p class="m"><span>${esc(i.issuer)}</span>·<a href="${esc(i.source)}" rel="noopener" target="_blank">Source ↗</a></p></div></li>`).join('')}</ol>`;
}
function showCountry(iso) {
  const n = NAT[iso], c = n.counts;
  const lede = n.status ? `${c.total} instrument${c.total === 1 ? '' : 's'} tracked · strongest status ${stamp(n.status)}` : 'No instruments tracked yet';
  const figs = [['In force', c.in_force], ['In progress', c.in_progress], ['Voluntary', c.voluntary], ['Initiatives', n.initiatives]];
  const money = n.topFund ? `<b>${esc(n.topFund.label)}</b><small>${esc(n.topFund.note)}</small>` : '<b>Not yet tracked</b>';
  $('#regBody').innerHTML = `<div style="display:flex;flex-direction:column;gap:16px">
    <div><p class="eyebrow">Country · ${esc(n.units)}</p><h2>${esc(n.name)}</h2><p class="lede">${lede}</p></div>
    <dl class="figs">${figs.map((f) => `<div><dt>${f[0]}</dt><dd>${f[1]}</dd></div>`).join('')}</dl>
    <div class="money"><span>Largest fund tracked</span><div>${money}</div></div>
    <div><h3 class="sc">Latest changes</h3>${logList(n.latest)}</div>
    <a class="cta" href="${esc(n.href)}">Open ${esc(n.name)} profile</a></div>`;
}
function showUnit(key) {
  const u = units.get(key), n = NAT[u.iso];
  const eyebrow = `${u.kind} · ${n.name}${u.lgd ? ' · LGD ' + u.lgd : u.code ? ' · ' + u.code : ''}`;
  $('#regBody').innerHTML = `<div style="display:flex;flex-direction:column;gap:16px">
    <div><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(u.name)}</h2><p class="lede">No state-level records yet</p></div>
    <p class="empty">State and provincial records are being added. Until then, ${esc(n.name)}'s national records apply here.</p>
    <a class="cta" href="${esc(n.href)}">Open ${esc(n.name)} profile</a></div>`;
}

function tip(e, title, line, sub) {
  const t = $('#tip'), b = $('#frame').getBoundingClientRect();
  t.innerHTML = `<b>${esc(title)}</b>${line ? esc(line) + '<br>' : ''}<span style="color:var(--ink-2)">${esc(sub || '')}</span>`;
  t.hidden = false;
  t.style.left = Math.min(e.clientX - b.left, b.width - 240) + 'px'; t.style.top = (e.clientY - b.top) + 'px';
}
function hideTip() { $('#tip').hidden = true; }

function grid() {
  const g = d3.select('#grid'); g.attr('viewBox', '0 0 356 346'); g.selectAll('*').remove();
  IN_UNITS.forEach((u) => {
    const x = 4 + u[3] * 44, y = 4 + u[2] * 38;
    const t = g.append('g').attr('class', 'tile' + (sel === u[0] ? ' sel' : '')).attr('tabindex', 0).attr('role', 'button').attr('aria-label', u[1])
      .on('click', () => select(u[0])).on('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(u[0]); } })
      .on('mousemove', (e) => tip(e, u[1], 'No state-level records yet', IN_UT.has(u[0]) ? 'Union territory' : 'State')).on('mouseleave', hideTip);
    t.append('rect').attr('x', x).attr('y', y).attr('width', 40).attr('height', 34).attr('class', 'unit nodata');
    t.append('text').attr('x', x + 20).attr('y', y + 18).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').text(u[0]);
  });
}
function setMode(m) {
  mode = m; document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  $('#map').hidden = m !== 'map'; $('#grid').hidden = m !== 'grid'; ['#zoomctl', '#readout', '#hint'].forEach((s) => ($(s).hidden = m !== 'map'));
  if (m === 'grid') grid(); else render();
}

function wireControls() {
  svg.call(zoom).on('dblclick.zoom', null);
  $('#zIn').addEventListener('click', () => { firstTouch(); flyTo(rot, Math.min(K_MAX, k * 1.6), 350); });
  $('#zOut').addEventListener('click', () => { firstTouch(); flyTo(rot, Math.max(K_MIN, k / 1.6), 350); });
  $('#zReset').addEventListener('click', () => { firstTouch(); if (view) home(); else flyTo(HOME_ROT, 1, 900); });
  $('#map').addEventListener('keydown', (e) => {
    const s = 12 / k, m = { ArrowLeft: [s, 0], ArrowRight: [-s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
    if (m) { e.preventDefault(); firstTouch(); rot = [rot[0] + m[0], Math.max(-85, Math.min(85, rot[1] + m[1])), 0]; render(); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); flyTo(rot, Math.min(K_MAX, k * 1.4), 200); }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); flyTo(rot, Math.max(K_MIN, k / 1.4), 200); }
  });
  $('#crumbs').addEventListener('click', (e) => { const g = e.target.dataset.go; if (!g) return; if (g === 'home') home(); else { sel = null; restyle(); showCountry(g); crumbs(); } });
  $('#goto').innerHTML = '<span>Go to</span>' + FOCUS.map((i) => `<button type="button" data-iso="${i}">${esc(NAT[i].name)}</button>`).join('');
  $('#goto').addEventListener('click', (e) => { const i = e.target.dataset.iso; if (i && i !== view) drill(i); });
  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
}

(async () => {
  try {
    await loadGeo();
    build(); setup(); if (W < 760) $('#ref').open = false;
    wireControls(); restyle(); legend(); showCountry('IND'); crumbs(); gotoState();
    $('#loading').remove();
    flyTo(HOME_ROT, 1, 2400);
    // Re-measure whenever the frame itself changes size.
    let rt;
    new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => {
      const b = $('#frame').getBoundingClientRect(); if (!b.width || !b.height) return;
      setup(); if (view) { const t = fitCountry(view); flyTo(t.rot, t.k, 0); }
    }, 120); }).observe($('#frame'));
  } catch (err) {
    $('#loading').textContent = `The globe could not load (${err.message}). Reload the page to try again.`;
  }
})();
