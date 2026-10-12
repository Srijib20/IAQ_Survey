/* =========================================================================
   IAQ Wearable Assistant Survey — app engine (no build step, no framework)
   ========================================================================= */
(function () {
  'use strict';

  const D = window.SURVEY;
  const CFG = window.SURVEY_CONFIG;
  const STATE_KEY = 'iaq-survey-v1';
  const SUB_KEY = 'iaq-survey-submissions';
  const INSTRUMENT_VERSION = 'first-draft-2026-09-23';
  const params = new URLSearchParams(location.search);
  const DEBUG = params.has('debug');

  /* ---------------- DOM ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = $('#app');
  const topbar = $('#topbar');
  const navbar = $('#navbar');
  const nextBtn = $('#nextBtn');
  const backBtn = $('#backBtn');

  /* ---------------- Utils ---------------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const uid = () => (window.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : 'r-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10));
  const clusterById = (id) => D.CLUSTERS.find((c) => c.id === +id);
  const kanoById = (id) => D.KANO.find((k) => k.id === id);
  const queryById = (id) => D.QUERIES.find((q) => q.id === id);
  const sectionByKey = (k) => D.SECTIONS.find((s) => s.key === k);
  const isAnswered = (v) => {
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'string') return v.trim() !== '';
    if (typeof v === 'number') return !Number.isNaN(v);
    return true;
  };
  const noneVulnerable = (a) => Array.isArray(a.A5) && a.A5.includes('None of these');

  /* ---------------- Icons (inline SVG, Lucide-style strokes) ---------------- */
  const ICONS = {
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/>',
    fan: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sparkle: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0M12 17v4"/>',
    wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    move: '<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    replay: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    up: '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    down: '<path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>',
  };
  const icon = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const TICK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ---------------- State ---------------- */
  let S = null;
  let SAVED = false; // true when state was restored from a previous visit
  let SCREENS = [];
  let enterT = Date.now();
  let autoTimer = null;
  let saveTimer = null;

  function freshState() {
    return {
      v: 1,
      id: uid(),
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      t0: Date.now(),
      screen: 0,
      furthest: 0,
      answers: {},
      times: {},
      design: buildDesign(),
      channel: params.get('ch') || params.get('src') || null,
    };
  }
  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STATE_KEY));
      if (s && s.v === 1 && s.status === 'in_progress' && s.design) return s;
    } catch (e) { /* ignore */ }
    return null;
  }
  function save() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(S)); } catch (e) { /* storage may be blocked */ }
  }
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 300);
  }

  /* Per-respondent randomization, stored so a reload keeps the same design. */
  function buildDesign() {
    const ids = D.CLUSTERS.map((c) => c.id);

    // Kano: 2 random features per cluster, random order; trim/extend to kanoTotal (cap 20)
    const total = Math.max(1, Math.min(CFG.kanoTotal || 14, 20));
    let kano = [];
    ids.forEach((c) => kano.push(...shuffle(D.KANO.filter((k) => k.c === c)).slice(0, 2).map((k) => k.id)));
    while (kano.length > total) {
      const counts = {};
      kano.forEach((id) => { const c = kanoById(id).c; counts[c] = (counts[c] || 0) + 1; });
      let droppable = kano.filter((id) => counts[kanoById(id).c] > 1);
      if (!droppable.length) droppable = kano;
      kano.splice(kano.indexOf(droppable[Math.floor(Math.random() * droppable.length)]), 1);
    }
    if (kano.length < total) {
      const rest = shuffle(D.KANO.map((k) => k.id).filter((id) => !kano.includes(id)));
      kano = kano.concat(rest.slice(0, total - kano.length));
    }
    kano = shuffle(kano);

    // MaxDiff: BIBD sets in random order, random position within set
    const maxdiff = shuffle(D.MAXDIFF).map((s) => ({ set: s.set, items: shuffle(s.items) }));

    // Closed card sort: stratified 2 per cluster + wild card(s)
    const n = CFG.cardSortCount || 15;
    let cards = [];
    ids.forEach((c) => cards.push(...shuffle(D.QUERIES.filter((q) => q.c === c)).slice(0, 2).map((q) => q.id)));
    const rest = shuffle(D.QUERIES.map((q) => q.id).filter((id) => !cards.includes(id)));
    cards = shuffle(cards.concat(rest.slice(0, Math.max(0, n - cards.length))));

    const utaut = shuffle(D.UTAUT.filter((u) => !u.pricing || CFG.pricingInScope).map((u) => u.id));

    return { orderB: shuffle(ids), orderC: shuffle(ids), kano, maxdiff, cards, utaut };
  }

  /* ---------------- Rendering helpers ---------------- */
  const READOUT = {};

  function q(key, label, inner, o = {}) {
    const num = DEBUG && o.code ? `<span class="q-num">${o.code}</span>` : '';
    return `<div class="q${o.cls ? ' ' + o.cls : ''}" data-block="${key}"${o.cond ? ` data-cond="${o.cond}"` : ''}>
      <div class="q-label">${num}<span>${label}${o.optional ? '<span class="opt-tag">Optional</span>' : ''}</span></div>
      ${o.hint ? `<div class="q-hint">${o.hint}</div>` : ''}
      ${inner}
    </div>`;
  }

  function choices(key, opts, o = {}) {
    const a = S.answers[key];
    const btns = opts.map((v) => {
      const on = o.multi ? Array.isArray(a) && a.includes(v) : a === v;
      const excl = o.exclusive && o.exclusive.includes(v);
      const na = o.na && o.na.includes(v);
      return `<button type="button" class="choice${o.multi ? ' multi' : ''}${on ? ' on' : ''}${na ? ' na' : ''}"
        data-q="${key}" data-v="${esc(v)}"${o.multi ? ' data-multi="1"' : ''}${excl ? ' data-excl="1"' : ''}
        aria-pressed="${on}"><span class="mark">${TICK}</span><span>${esc(v)}</span></button>`;
    }).join('');
    return `<div class="choices${o.cols ? ' cols-' + o.cols : ''}">${btns}</div>`;
  }

  // Numeric rating scale. o: start, anchors[2], labels[], extra (string option), extraFirst, juster
  function scale(key, n, o = {}) {
    const start = o.start != null ? o.start : 1;
    READOUT[key] = { labels: o.labels || [], start, n };
    const a = S.answers[key];
    let btns = '';
    for (let i = 0; i < n; i++) {
      const v = start + i;
      const on = a === v;
      const lab = o.labels && o.labels[i] ? ` – ${esc(o.labels[i])}` : '';
      btns += `<button type="button" class="scale-btn${on ? ' on' : ''}" style="--k:${i}" data-q="${key}" data-v="${v}" data-num="1" aria-pressed="${on}" aria-label="${v}${lab}">${v}</button>`;
    }
    const extra = o.extra
      ? `<div class="scale-extra"><button type="button" class="chip-btn${a === o.extra ? ' on' : ''}" data-q="${key}" data-v="${esc(o.extra)}" aria-pressed="${a === o.extra}">${esc(o.extra)}</button></div>`
      : '';
    return `<div class="scale-wrap${o.extra ? ' has-extra' : ''}${o.extraFirst ? ' extra-first' : ''}">
      <div class="scale-main">
        <div class="scale${o.juster ? ' juster' : ''}" style="--n:${n}">${btns}</div>
        <div class="anchors"><span>${o.anchors ? o.anchors[0] : ''}</span>
          <span class="readout" data-readout="${key}">${esc(readoutText(key))}</span>
          <span>${o.anchors ? o.anchors[1] : ''}</span></div>
      </div>
      ${extra}
    </div>`;
  }
  function readoutText(key) {
    const r = READOUT[key];
    const v = S.answers[key];
    if (v == null || !r) return '';
    if (typeof v !== 'number') return v;
    const lab = r.labels[v - r.start];
    return lab ? `${v} — ${lab}` : `${v} of ${r.start + r.n - 1}`;
  }

  // Short labelled options shown as a segmented row
  function segmented(key, opts) {
    const a = S.answers[key];
    return `<div class="scale" style="--n:${opts.length}">${opts.map((v) =>
      `<button type="button" class="scale-btn${a === v ? ' on' : ''}" data-q="${key}" data-v="${esc(v)}" aria-pressed="${a === v}">${esc(v)}</button>`).join('')}</div>`;
  }

  function textArea(key, ph = '') {
    return `<textarea class="field" data-q="${key}" placeholder="${esc(ph)}" maxlength="2000" rows="3">${esc(S.answers[key] || '')}</textarea>`;
  }
  function textInput(key, ph = '') {
    return `<input class="field" data-q="${key}" value="${esc(S.answers[key] || '')}" placeholder="${esc(ph)}" maxlength="200" />`;
  }
  function money(key) {
    const v = S.answers[key];
    return `<div class="money"><span>₹</span><input class="field" type="number" inputmode="numeric" min="0" step="1" data-q="${key}" value="${v != null ? esc(v) : ''}" placeholder="0" /></div>`;
  }

  const AGREE = { anchors: ['Strongly disagree', 'Strongly agree'], labels: D.AGREE7 };
  const JUSTER = { start: 0, juster: true, anchors: ['No chance', 'Certain'], labels: D.JUSTER };

  /* ---------------- Device illustration ---------------- */
  function deviceSVG() {
    return `<svg class="device" viewBox="0 0 220 280" aria-hidden="true">
      <defs>
        <linearGradient id="gBand" x1="0" x2="1"><stop offset="0" stop-color="#0c7a6e"/><stop offset="1" stop-color="#17b29f"/></linearGradient>
        <linearGradient id="gFace" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#21403f"/><stop offset="1" stop-color="#0b1f1e"/></linearGradient>
        <linearGradient id="gGauge" x1="0" x2="1"><stop offset="0" stop-color="#ffc85c"/><stop offset="1" stop-color="#ff7a59"/></linearGradient>
      </defs>
      <circle class="ring" cx="110" cy="140" r="104"/>
      <circle class="ring r2" cx="110" cy="140" r="104"/>
      <circle class="ring r3" cx="110" cy="140" r="104"/>
      <rect x="80" y="0" width="60" height="280" rx="26" fill="url(#gBand)"/>
      <rect x="92" y="16" width="36" height="6" rx="3" fill="#fff" opacity=".25"/>
      <rect x="92" y="258" width="36" height="6" rx="3" fill="#fff" opacity=".25"/>
      <rect x="42" y="72" width="136" height="136" rx="42" fill="url(#gFace)"/>
      <rect x="43.5" y="73.5" width="133" height="133" rx="40.5" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="3"/>
      <circle cx="110" cy="140" r="42" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="8"/>
      <circle cx="110" cy="140" r="42" fill="none" stroke="url(#gGauge)" stroke-width="8" stroke-linecap="round" stroke-dasharray="190 264" transform="rotate(-90 110 140)"/>
      <text x="110" y="144" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="23" font-weight="700" fill="#fff">1450</text>
      <text x="110" y="161" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="9.5" font-weight="700" fill="#8fdccd" letter-spacing="1.2">CO₂ · PPM</text>
      <circle cx="110" cy="112" r="3.2" fill="#ff7a59"><animate attributeName="opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite"/></circle>
    </svg>`;
  }

  /* ---------------- Screens ---------------- */
  function buildScreens() {
    const d = S.design;
    const L = [];

    L.push({ id: 'welcome', kind: 'landing' });

    /* ---- Section A ---- */
    L.push({
      id: 'A-1', sec: 'A', title: 'First, a little about you',
      render: () =>
        `<div class="card">
          ${q('A1', D.A.A1.q, choices('A1', D.A.A1.opts, { cols: 2 }), { code: 'A1' })}
          ${q('A2', D.A.A2.q, choices('A2', D.A.A2.opts, { cols: 2 }), { code: 'A2' })}
          ${q('A3', D.A.A3.q, choices('A3', D.A.A3.opts, { cols: 2 }), { code: 'A3' })}
          ${q('A4', D.A.A4.q, segmented('A4', D.A.A4.opts), { code: 'A4' })}
        </div>`,
      required: () => ['A1', 'A2', 'A3', 'A4'],
      check: (a) => (a.A1 === 'Under 18' ? 'screenout' : null),
    });
    L.push({
      id: 'A-2', sec: 'A', title: 'Your household',
      render: () =>
        `<div class="card">
          ${q('A5', D.A.A5.q, choices('A5', D.A.A5.opts, { multi: true, cols: 2, exclusive: D.A.A5.exclusive }), { code: 'A5', hint: 'Select all that apply.' })}
          ${q('A6', D.A.A6.q, choices('A6', D.A.A6.opts, { cols: 2 }), { code: 'A6' })}
          ${q('A7', D.A.A7.q, choices('A7', D.A.A7.opts, { cols: 3 }), { code: 'A7' })}
        </div>`,
      required: () => ['A5', 'A6', 'A7'],
    });
    L.push({
      id: 'A-3', sec: 'A', title: 'Air and technology',
      render: () =>
        `<div class="card">
          ${q('A8', D.A.A8.q, choices('A8', D.A.A8.opts, { multi: true, cols: 2, exclusive: D.A.A8.exclusive }), { code: 'A8', hint: 'Select all that apply.' })}
          ${q('A9', D.A.A9.q, choices('A9', D.A.A9.opts, { cols: 3 }), { code: 'A9' })}
          ${q('A10', D.A.A10.q, scale('A10', 5, { anchors: D.A.A10.anchors, labels: ['Not at all', null, null, null, 'Very comfortable'] }), { code: 'A10' })}
          ${q('A11', D.A.A11.q, choices('A11', D.A.A11.opts, { cols: 2 }) +
            `<div class="inline-field" data-cond="selfDescribe">${textInput('A11_text', 'Describe in your own words')}</div>`, { code: 'A11', optional: true })}
        </div>`,
      conds: { selfDescribe: (a) => a.A11 === 'Prefer to self-describe' },
      required: () => ['A8', 'A9', 'A10'],
    });

    /* ---- Concept card (once, before Section B) ---- */
    L.push({
      id: 'concept', sec: 'B', noBanner: true,
      eyebrow: 'Before we continue', title: 'Meet the assistant',
      lead: 'Here’s the idea we’re exploring. Keep it in mind for the rest of the survey.',
      render: () =>
        `<div class="card">
          <div class="concept">
            <div class="hero-art">${deviceSVG()}</div>
            <div>
              <p>Imagine a small wearable — a clip or a band — that works with sensors in your home. It keeps track of the air around you: dust, smoke, CO₂ and gases. You can ask it questions in plain language, <b>by voice or text</b>, and it answers using live readings from your rooms and suggests what to do.</p>
              <ul class="perks">
                <li><span class="ic">${icon('mic')}</span>Ask by voice or text</li>
                <li><span class="ic">${icon('home')}</span>Knows the air in each room</li>
                <li><span class="ic">${icon('bell')}</span>Warns you before the air gets bad</li>
              </ul>
            </div>
          </div>
          <div class="chat" id="chat" aria-label="Sample conversation">
            <div class="chat-head"><span class="av"><svg viewBox="0 0 24 24"><path d="M3 9h11a3 3 0 1 0-3-3M2 14h15a3 3 0 1 1-3 3M5 19h4"/></svg></span>
              <span>Air assistant<br><small>● Live readings</small></span></div>
          </div>
        </div>`,
      onShow: playChat,
    });

    /* ---- Section B: vignettes ---- */
    d.orderB.forEach((c, i) => {
      const k = 'B' + c;
      const cl = clusterById(c);
      const v = D.VIGNETTES[c];
      L.push({
        id: 'B-' + c, sec: 'B',
        render: (a) => {
          let freq = D.FREQ;
          if (c === 2) freq = noneVulnerable(a) ? [D.FREQ_NA, ...D.FREQ] : [...D.FREQ, D.FREQ_NA];
          return `<div class="vignette" style="--c:${cl.color}">
              <div class="count">${icon('clock')} Moment ${i + 1} of ${d.orderB.length}</div>
              <div class="stem">Think about the past 4 weeks. Picture a specific moment when…</div>
              <div class="text">${esc(v.text)}</div>
            </div>
            <div class="card">
              ${q(k + '_freq', 'In the past 4 weeks, how often did something like this happen?',
                choices(k + '_freq', freq, { cols: 2, na: [D.FREQ_NA] }), { code: k + '.a' })}
              ${q(k + '_future', 'How likely is this to happen to you in the next few months?',
                scale(k + '_future', 5, { anchors: ['Very unlikely', 'Very likely'], labels: ['Very unlikely', null, null, null, 'Very likely'] }),
                { cond: 'never', code: k + '.never' })}
              ${q(k + '_juster', 'If you had the assistant then, what is the chance you would have asked it about this?',
                `<div class="q-hint" data-cond="never">Imagine it had happened.</div>` + scale(k + '_juster', 11, JUSTER),
                { cond: 'asked', code: k + '.b' })}
            </div>`;
        },
        conds: {
          never: (a) => a[k + '_freq'] === 'Never',
          asked: (a) => isAnswered(a[k + '_freq']) && a[k + '_freq'] !== D.FREQ_NA,
        },
        required: (a) => {
          const f = a[k + '_freq'];
          if (!f || f === D.FREQ_NA) return [k + '_freq'];
          if (f === 'Never') return [k + '_freq', k + '_future', k + '_juster'];
          return [k + '_freq', k + '_juster'];
        },
      });
    });

    /* ---- Section C: perceived benefit + current performance ---- */
    d.orderC.forEach((c, i) => {
      const k = 'C' + c;
      const cl = clusterById(c);
      L.push({
        id: 'C-' + c, sec: 'C',
        render: (a) => {
          const naFirst = c === 2 && noneVulnerable(a);
          return `<div class="card" style="--c:${cl.color}">
              <div class="cl-head">
                <span class="cl-ic">${icon(cl.icon)}</span>
                <div>
                  <div class="eyebrow"><span class="dot"></span>Kind of help ${i + 1} of ${d.orderC.length}</div>
                  <h3>${esc(cl.name)}</h3>
                  <p>${esc(cl.def)}</p>
                </div>
              </div>
              <div class="examples">${cl.examples.map((e) => `<span class="ex">“${esc(e)}”</span>`).join('')}</div>
            </div>
            <div class="card">
              <p class="q-hint" style="margin:0 0 6px">How much do you agree with each statement?</p>
              ${D.BENEFITS.map((b) => q(`${k}_${b.n}`, esc(b.text),
                scale(`${k}_${b.n}`, 7, Object.assign({ extra: 'Not applicable', extraFirst: naFirst }, AGREE)),
                { code: `${k}.${b.n}` })).join('')}
              ${q(k + '_5', 'How well do your current tools or habits (purifier, apps, opening windows, asking others) meet this need today?',
                scale(k + '_5', 7, { anchors: ['Not at all', 'Completely'], labels: ['Not at all', null, null, null, null, null, 'Completely'], extra: 'I do nothing for this now' }),
                { code: k + '.5' })}
              ${CFG.askTopBenefit ? q(k + '_top', 'Which ONE of these benefits matters most to you for this category?',
                choices(k + '_top', D.BENEFITS.map((b) => b.type), { cols: 2 }), { optional: true, code: k + '.6' }) : ''}
            </div>`;
        },
        required: () => [1, 2, 3, 4, 5].map((n) => `${k}_${n}`),
      });
    });

    /* ---- Section D1: Kano pairs ---- */
    d.kano.forEach((kid, i) => {
      const f = kanoById(kid);
      const cl = clusterById(f.c);
      L.push({
        id: 'D-' + kid, sec: 'D', auto: true,
        render: () =>
          `<div class="card" style="--c:${cl.color}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
              <span class="cl-tag">${icon(cl.icon)} ${esc(cl.short)}</span>
              <span class="eyebrow" style="margin:0">Feature ${i + 1} of ${d.kano.length}</span>
            </div>
            ${q(kid + '_f', `<span class="pill can">CAN</span> If the assistant <b>could</b> ${esc(f.f)}, how would you feel?`, kanoOpts(kid + '_f'), { code: kid + ' functional' })}
            ${q(kid + '_d', `<span class="pill cannot">CANNOT</span> If the assistant <b>could NOT</b> ${esc(f.f)}, how would you feel?`, kanoOpts(kid + '_d'), { code: kid + ' dysfunctional' })}
          </div>`,
        required: () => [kid + '_f', kid + '_d'],
      });
    });

    /* ---- Section D2: MaxDiff ---- */
    d.maxdiff.forEach((m, i) => {
      const bk = `MD${m.set}_best`;
      const wk = `MD${m.set}_worst`;
      L.push({
        id: 'D-MD' + m.set, sec: 'D', auto: true,
        eyebrow: `Set ${i + 1} of ${d.maxdiff.length}`,
        title: 'Most and least useful',
        lead: 'In each set, which ONE would be MOST useful to you, and which ONE LEAST useful?',
        render: (a) =>
          `<div class="card">
            <div class="md-head"><span>Most</span><span></span><span>Least</span></div>
            ${m.items.map((c) => {
              const cl = clusterById(c);
              return `<div class="md-row${a[bk] === c ? ' is-best' : ''}${a[wk] === c ? ' is-worst' : ''}" data-row="${c}">
                <button type="button" class="md-btn best${a[bk] === c ? ' on' : ''}" data-q="${bk}" data-v="${c}" data-num="1" aria-pressed="${a[bk] === c}" aria-label="Most useful: ${esc(cl.name)}">${icon('up')}</button>
                <div class="md-item" style="--c:${cl.color}"><span class="cl-ic">${icon(cl.icon)}</span><div><b>${esc(cl.name)}</b><span>${esc(cl.def)}</span></div></div>
                <button type="button" class="md-btn worst${a[wk] === c ? ' on' : ''}" data-q="${wk}" data-v="${c}" data-num="1" aria-pressed="${a[wk] === c}" aria-label="Least useful: ${esc(cl.name)}">${icon('down')}</button>
              </div>`;
            }).join('')}
          </div>`,
        onChange: (key, a) => {
          if (a[bk] != null && a[bk] === a[wk]) {
            if (key === bk) delete a[wk]; else delete a[bk];
            syncGroup(bk); syncGroup(wk);
          }
          $$('.md-row', app).forEach((r) => {
            r.classList.toggle('is-best', +r.dataset.row === a[bk]);
            r.classList.toggle('is-worst', +r.dataset.row === a[wk]);
          });
        },
        required: () => [bk, wk],
        validate: (a) => (a[bk] == null || a[wk] == null ? 'Pick one MOST and one LEAST useful.' : null),
      });
    });

    /* ---- Section E1: closed card sort ---- */
    L.push({
      id: 'E-1', sec: 'E', title: 'Sort the questions',
      lead: 'Below are questions someone might ask the assistant. Drag each into the category where you would expect to find it.',
      render: () => `<div class="card"><div id="cs"></div></div>`,
      onShow: () => csRender(),
      required: () => [],
      validate: () => {
        const left = S.design.cards.filter((id) => !(S.answers.E1 || {})[id]).length;
        return left ? `Please sort all the cards — ${left} left.` : null;
      },
    });

    /* ---- Section E2: coverage ---- */
    L.push({
      id: 'E-2', sec: 'E', title: 'Do these categories work for you?',
      render: () =>
        `<div class="card">
          ${q('E2_1', 'These 7 categories cover the questions I would want to ask about the air at home.', scale('E2_1', 7, AGREE), { code: 'E2.1' })}
          ${q('E2_2', 'Is anything important missing from these categories? Please describe.', textArea('E2_2', 'e.g. a kind of question you would ask that doesn’t fit anywhere'), { optional: true, code: 'E2.2' })}
          ${q('E2_3', 'Are any of these categories not useful or not relevant to you?',
            choices('E2_3', D.CLUSTERS.map((c) => c.name).concat('None'), { multi: true, exclusive: ['None'] }), { hint: 'Select all that apply.', code: 'E2.3' })}
          ${q('E2_4', 'Why?', textArea('E2_4'), { cond: 'notRelevant', optional: true, code: 'E2.4' })}
          ${q('E2_5', 'Were any category names confusing? Which, and what would you call it?', textArea('E2_5'), { optional: true, code: 'E2.5' })}
        </div>`,
      conds: { notRelevant: (a) => Array.isArray(a.E2_3) && a.E2_3.some((x) => x !== 'None') },
      required: () => ['E2_1', 'E2_3'],
    });

    /* ---- Section F1: UTAUT grid ---- */
    L.push({
      id: 'F-1', sec: 'F', title: 'Using an assistant like this',
      lead: 'How much do you agree with each statement?',
      render: () =>
        `<div class="card">
          <div class="legend">${D.AGREE7.map((l, i) => `<span><b>${i + 1}</b> ${l}</span>`).join('')}</div>
          ${d.utaut.map((id) => {
            const u = D.UTAUT.find((x) => x.id === id);
            return q('F1_' + id, esc(u.text), scale('F1_' + id, 7, AGREE), { cls: 'grid-row', code: id });
          }).join('')}
        </div>`,
      required: () => d.utaut.map((id) => 'F1_' + id),
    });

    /* ---- Section F2: calibrated demand ---- */
    L.push({
      id: 'F-2', sec: 'F', title: 'Would you get one?',
      render: () =>
        `<div class="card">
          ${q('F2_1', 'If this assistant were available at a price you consider fair, what is the chance you would get one in the next 12 months?', scale('F2_1', 11, JUSTER), { code: 'F2.1' })}
        </div>`,
      required: () => ['F2_1'],
    });

    /* ---- Section F3 (optional pricing) + F4 commitment ---- */
    const vw = D.VAN_WESTENDORP;
    L.push({
      id: 'F-3', sec: 'F', title: CFG.pricingInScope ? 'Price and pilot' : 'Join the pilot?',
      lead: CFG.pricingInScope ? 'For the wearable device itself. There are no right answers — just your gut feeling, in rupees.' : '',
      render: () =>
        `${CFG.pricingInScope ? `<div class="card"><div class="price-grid">
            ${vw.map((p) => q(p.id, esc(p.q), money(p.id), { code: p.id })).join('')}
            <div class="warn-note" data-cond="vwOrder">${icon('sparkle')}<span>Just checking: usually “too cheap” &lt; “bargain” &lt; “getting expensive” &lt; “too expensive”. Fine to keep your answers if they’re what you meant.</span></div>
          </div></div>` : ''}
          <div class="card">
            ${q('F4_1', 'Would you like to join the waitlist for a pilot of this assistant?',
              `<div class="waitlist">${choices('F4_1', ['Yes', 'No'], { cols: 2 })}</div>`,
              { hint: 'If yes, we’ll show you a separate sign-up form at the end. Your email is never linked to your answers.', code: 'F4.1' })}
          </div>`,
      conds: {
        vwOrder: (a) => {
          const [ex, ge, ba, ch] = vw.map((p) => a[p.id]);
          if ([ex, ge, ba, ch].some((v) => v == null || Number.isNaN(v))) return false;
          return !(ch <= ba && ba <= ge && ge <= ex);
        },
      },
      required: () => (CFG.pricingInScope ? vw.map((p) => p.id) : []).concat('F4_1'),
      validate: (a) => (CFG.pricingInScope && vw.some((p) => a[p.id] < 0) ? 'Prices can’t be negative.' : null),
    });

    /* ---- Section G: open feedback ---- */
    L.push({
      id: 'G-1', sec: 'G', title: 'Last thoughts',
      render: () =>
        `<div class="card">
          ${q('G1', esc(D.G.G1), textArea('G1', 'Type here…'), { optional: true, code: 'G1' })}
          ${q('G2', esc(D.G.G2), textArea('G2', 'Type here…'), { optional: true, code: 'G2' })}
          ${q('G3', esc(D.G.G3), segmented('G3', D.G.G3opts) + '<div class="anchors"><span>alerts per week</span><span></span></div>', { optional: true, code: 'G3' })}
          ${q('G4', esc(D.G.G4), textArea('G4', 'Type here…'), { optional: true, code: 'G4' })}
        </div>`,
      required: () => [],
    });

    return L;
  }

  function kanoOpts(key) {
    const a = S.answers[key];
    return `<div class="kano-opts">${D.KANO_OPTS.map((o) =>
      `<button type="button" class="kano-opt${a === o.v ? ' on' : ''}" data-q="${key}" data-v="${o.v}" aria-pressed="${a === o.v}">
        <span class="em" aria-hidden="true">${o.emoji}</span><span>${o.label}</span></button>`).join('')}</div>`;
  }

  /* ---------------- Card sort ---------------- */
  function csBins() {
    return D.CLUSTERS.map((c) => ({ id: String(c.id), name: c.name, def: c.def, color: c.color, icon: c.icon }))
      .concat([{ id: 'none', name: 'Doesn’t fit any', alt: true }, { id: 'unsure', name: 'Not sure', alt: true }]);
  }
  function csRender(flashBin) {
    const root = $('#cs');
    if (!root) return;
    const cards = S.design.cards;
    const placed = S.answers.E1 || (S.answers.E1 = {});
    const left = cards.filter((id) => !placed[id]);
    const cur = left[0];
    const done = cards.length - left.length;

    const deck = cur
      ? `<div class="cs-stack${left.length === 1 ? ' last' : ''}">
           <div class="cs-card" data-card="${cur}">
             <q>${esc(queryById(cur).text)}</q>
             <div class="hint">${icon('move')} Drag to a category — or just tap one below</div>
           </div>
         </div>
         <div class="cs-count">Card ${done + 1} of ${cards.length}<span class="bar"><i style="width:${(done / cards.length) * 100}%"></i></span></div>`
      : `<div class="cs-done"><div class="big">🎉</div><b>All ${cards.length} cards sorted!</b>
           <span>Changed your mind? Tap a card inside a category to send it back.</span></div>`;

    root.innerHTML = `<div class="cs-deck">${deck}</div>
      <div class="cs-bins">${csBins().map((b) => {
        const inBin = cards.filter((id) => placed[id] === b.id);
        return `<div class="cs-bin${b.alt ? ' alt' : ''}${flashBin === b.id ? ' flash' : ''}" data-bin="${b.id}" role="button" tabindex="0"
            aria-label="Put the card in: ${esc(b.name)}"${b.color ? ` style="--c:${b.color}"` : ''}>
          <div class="cs-bin-top">${b.icon ? `<span class="cl-ic">${icon(b.icon)}</span>` : ''}<b>${esc(b.name)}</b>
            <span class="cnt${inBin.length ? ' has' : ''}">${inBin.length}</span></div>
          ${b.def ? `<div class="def">${esc(b.def)}</div>` : ''}
          ${inBin.length ? `<div class="cs-chips">${inBin.map((id) =>
            `<button type="button" class="cs-chip" data-unplace="${id}" title="Send back to the deck">${icon('x')}<span>${esc(queryById(id).text)}</span></button>`).join('')}</div>` : ''}
        </div>`;
      }).join('')}</div>`;
    bindDrag(root);
  }
  function csPlace(bin, cardId) {
    const placed = S.answers.E1 || (S.answers.E1 = {});
    const id = cardId || S.design.cards.find((c) => !placed[c]);
    if (!id) { toast('All cards are sorted. Tap a card in a category to move it.'); return; }
    placed[id] = bin;
    save();
    csRender(bin);
  }
  function bindDrag(root) {
    const card = $('.cs-card', root);
    if (!card) return;
    let sx = 0, sy = 0, pid = null, ghost = null, over = null;
    card.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      sx = e.clientX; sy = e.clientY; pid = e.pointerId;
      try { card.setPointerCapture(pid); } catch (err) { /* ignore */ }
    });
    card.addEventListener('pointermove', (e) => {
      if (pid !== e.pointerId) return;
      if (!ghost) {
        if (Math.hypot(e.clientX - sx, e.clientY - sy) < 6) return;
        ghost = card.cloneNode(true);
        ghost.classList.add('cs-ghost');
        document.body.appendChild(ghost);
        card.classList.add('dragging');
      }
      ghost.style.left = e.clientX + 'px';
      ghost.style.top = e.clientY + 'px';
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const b = el && el.closest('[data-bin]');
      if (b !== over) {
        if (over) over.classList.remove('over');
        over = b;
        if (over) over.classList.add('over');
      }
      if (e.clientY > innerHeight - 110) scrollBy(0, 14);
      else if (e.clientY < 140) scrollBy(0, -14);
    });
    const end = (e) => {
      if (pid !== e.pointerId) return;
      pid = null;
      if (!ghost) return;
      ghost.remove(); ghost = null;
      card.classList.remove('dragging');
      if (over) {
        const bin = over.dataset.bin;
        over.classList.remove('over'); over = null;
        csPlace(bin, card.dataset.card);
      }
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  }

  /* ---------------- Concept chat animation ---------------- */
  function playChat() {
    const chat = $('#chat');
    if (!chat) return;
    $$('.bubble, .typing, .replay', chat).forEach((n) => n.remove());
    const add = (html) => { chat.insertAdjacentHTML('beforeend', html); return chat.lastElementChild; };
    add('<div class="bubble user">Why does this room feel stuffy?</div>');
    setTimeout(() => {
      if (!chat.isConnected) return;
      const t = add('<div class="typing" aria-label="typing"><i></i><i></i><i></i></div>');
      setTimeout(() => {
        if (!chat.isConnected) return;
        t.remove();
        add('<div class="bubble bot">CO₂ in the study is <b>1,450 ppm</b>, about 3× outdoor levels. Opening the window for 10 minutes should bring it under 800 ppm.</div>');
        add(`<button type="button" class="link-btn replay" data-action="replay">Replay</button>`);
      }, 1500);
    }, 900);
  }

  /* ---------------- Rendering ---------------- */
  const cur = () => SCREENS[S.screen];

  function render(dir = 1) {
    clearTimeout(autoTimer);
    const sc = cur();
    if (sc.kind === 'landing') return renderLanding();

    topbar.hidden = false;
    navbar.hidden = false;
    app.classList.remove('bare');

    const sec = sectionByKey(sc.sec);
    const firstOfSec = SCREENS.find((x) => x.sec === sc.sec && !x.noBanner) === sc;
    const secIdx = D.SECTIONS.indexOf(sec);
    const banner = firstOfSec
      ? `<div class="sec-banner"><span class="ic">${icon(sec.icon)}</span>
           <div><small>Part ${secIdx + 1} of ${D.SECTIONS.length} · about ${sec.minutes} min</small>
           <strong>${esc(sec.label)}</strong><p>${esc(sec.intro)}</p></div></div>`
      : '';
    const head = sc.title
      ? `<div class="screen-head">
           ${sc.eyebrow ? `<div class="eyebrow"><span class="dot"></span>${esc(sc.eyebrow)}</div>` : ''}
           <h2>${esc(sc.title)}</h2>${sc.lead ? `<p class="lead">${esc(sc.lead)}</p>` : ''}
         </div>`
      : '';
    app.innerHTML = `<section class="screen${dir < 0 ? ' from-left' : ''}">${banner}${head}${sc.render(S.answers)}</section>`;
    applyConds(true);
    updateChrome();
    if (sc.onShow) sc.onShow();
    window.scrollTo(0, 0);
    enterT = Date.now();
    if (DEBUG) debugPanel();
  }

  function applyConds(initial) {
    const sc = cur();
    $$('[data-cond]', app).forEach((el) => {
      const f = sc.conds && sc.conds[el.dataset.cond];
      const show = f ? !!f(S.answers) : true;
      if (el.hidden === show) {
        el.hidden = !show;
        if (show && !initial) {
          el.classList.remove('reveal'); void el.offsetWidth; el.classList.add('reveal');
        }
      }
    });
  }

  let stepsBuilt = false;
  function updateChrome() {
    const sc = cur();
    const secIdx = D.SECTIONS.findIndex((s) => s.key === sc.sec);
    const steps = $('#steps');
    if (!stepsBuilt) {
      steps.innerHTML = D.SECTIONS.map((s) =>
        `<div class="step" data-step="${s.key}"><div class="step-bar"><i></i></div><div class="step-label">${esc(s.label)}</div></div>`).join('');
      stepsBuilt = true;
    }
    D.SECTIONS.forEach((s, i) => {
      const el = $(`[data-step="${s.key}"]`, steps);
      const inSec = SCREENS.filter((x) => x.sec === s.key);
      const pct = i < secIdx ? 100 : i > secIdx ? 0 : Math.round(((inSec.indexOf(sc) + 1) / inSec.length) * 100);
      el.classList.toggle('active', i === secIdx);
      el.classList.toggle('past', i < secIdx);
      $('i', el).style.width = pct + '%';
    });
    $('#secNow').textContent = `${secIdx + 1}/${D.SECTIONS.length} · ${D.SECTIONS[secIdx].label}`;

    // Time left: each section's budget spread evenly over its screens
    const per = (x) => (x.sec ? sectionByKey(x.sec).minutes / SCREENS.filter((y) => y.sec === x.sec).length : 0);
    const left = SCREENS.slice(S.screen).reduce((t, x) => t + per(x), 0);
    $('#timeLeft').textContent = left < 1 ? 'Under a minute left' : `About ${Math.ceil(left)} min left`;

    const pct = Math.round(((S.screen - 1) / (SCREENS.length - 2)) * 100);
    $('#navCount').textContent = `${Math.max(0, pct)}% done`;

    const last = S.screen === SCREENS.length - 1;
    nextBtn.classList.toggle('submit', last);
    $('span', nextBtn).textContent = last ? 'Submit' : 'Next';
  }

  function renderBare(html) {
    topbar.hidden = true;
    navbar.hidden = true;
    app.classList.add('bare');
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }

  /* ---------------- Landing ---------------- */
  function renderLanding() {
    const a = S.answers;
    const pct = Math.round(((S.furthest - 1) / (SCREENS.length - 2)) * 100);
    const resume = SAVED && S.furthest > 0
      ? `<div class="resume"><div><b>Welcome back!</b><span>You’re about ${Math.max(1, pct)}% of the way through. Pick up where you left off.</span></div>
          <div style="display:flex;gap:10px;align-items:center"><button type="button" class="link-btn" data-action="restart">Start over</button>
          <button type="button" class="btn primary" data-action="resume">Continue ${icon('arrow')}</button></div></div>`
      : '';
    renderBare(`<section class="screen">
      <div class="hero">
        <div>
          <span class="hero-kicker"><b>Research study</b> UbiNet Lab · IIT Kharagpur</span>
          <h1>How does the air in your home <em>feel</em> to you?</h1>
          <p class="sub">We’re designing a wearable assistant you could ask about indoor air and health — by voice or text. Share your real experiences and help decide what it should do.</p>
          <div class="meta-chips">
            <span class="meta-chip">${icon('clock')} About 17 minutes</span>
            <span class="meta-chip">${icon('lock')} Anonymous</span>
            <span class="meta-chip">${icon('phone')} Works on your phone</span>
            ${CFG.incentiveText ? `<span class="meta-chip">${icon('gift')} ${esc(CFG.incentiveText)}</span>` : ''}
          </div>
          <div class="hero-cta">
            <button type="button" class="btn primary big" data-action="toConsent">Take the survey ${icon('arrow')}</button>
            <small>No right or wrong answers.</small>
          </div>
        </div>
        <div class="hero-art">
          ${deviceSVG()}
          <span class="tag t1"><i style="background:#1f9d6b"></i>PM2.5 · 38 µg/m³</span>
          <span class="tag t2"><i style="background:#ff7a59"></i>CO₂ · High</span>
          <span class="tag t3"><i style="background:#3b8ee6"></i>VOC · Low</span>
        </div>
      </div>
      ${resume}
      <div class="steps-preview">
        <div class="sp"><span class="ic" style="background:#fdeef5;color:#d6589f">${icon('clock')}</span><div><b>Share real moments</b><span>When did the air at home bother or worry you?</span></div></div>
        <div class="sp"><span class="ic" style="background:#efedfd;color:#7b68ee">${icon('star')}</span><div><b>React to ideas</b><span>Which features would you love, expect or skip?</span></div></div>
        <div class="sp"><span class="ic" style="background:#e3f5f1;color:#0f8b7d">${icon('grid')}</span><div><b>Sort questions</b><span>Help us organise what people want to ask.</span></div></div>
      </div>
      <div class="card consent-card" id="consent">
        <h3>Before we begin</h3>
        <div class="consent-text"><p>We are researchers at the UbiNet Lab, IIT Kharagpur, studying how people deal with the air inside their homes. We are designing a wearable assistant that you could ask questions about indoor air and health, by voice or text. This survey takes about 15–18 minutes. There are no right or wrong answers; we want to know about your real experiences. Participation is voluntary, you may stop at any time, and your answers are stored without your name. [Ethics approval no. ${esc(CFG.ethicsApprovalNo)}]</p></div>
        <button type="button" class="check${a.consent ? ' on' : ''}" data-action="consent" aria-pressed="${!!a.consent}">
          <span class="mark">${TICK}</span><span>I am 18 or older and agree to take part.</span>
        </button>
        <div class="consent-actions">
          <small style="color:var(--muted)">Your progress is saved on this device, so you can come back later.</small>
          <button type="button" class="btn primary big" data-action="start" id="startBtn"${a.consent ? '' : ' disabled'}>Start ${icon('arrow')}</button>
        </div>
      </div>
      <p class="foot">UbiNet Lab · IIT Kharagpur</p>
    </section>`);
  }

  /* ---------------- Interaction ---------------- */
  function syncGroup(key) {
    const a = S.answers[key];
    $$(`[data-q="${key}"]`, app).forEach((b) => {
      if (b.tagName !== 'BUTTON') return;
      const v = b.dataset.num ? +b.dataset.v : b.dataset.v;
      const on = Array.isArray(a) ? a.includes(v) : a === v;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
    });
    const ro = $(`[data-readout="${key}"]`, app);
    if (ro) ro.textContent = readoutText(key);
  }

  function onChoice(btn) {
    const key = btn.dataset.q;
    const v = btn.dataset.num ? +btn.dataset.v : btn.dataset.v;
    const A = S.answers;
    if (btn.dataset.multi) {
      let arr = Array.isArray(A[key]) ? A[key].slice() : [];
      const excl = $$(`[data-q="${key}"][data-excl]`, app).map((b) => b.dataset.v);
      if (arr.includes(v)) arr = arr.filter((x) => x !== v);
      else if (btn.dataset.excl) arr = [v];
      else arr = arr.filter((x) => !excl.includes(x)).concat(v);
      A[key] = arr;
    } else {
      A[key] = v;
    }
    syncGroup(key);
    afterChange(key);
  }

  function afterChange(key, typing) {
    const blk = $(`[data-block="${key}"]`, app);
    if (blk) blk.classList.remove('missing');
    const sc = cur();
    if (sc.onChange) sc.onChange(key, S.answers);
    applyConds();
    if (typing) saveSoon(); else save();
    if (!typing) maybeAutoAdvance();
  }

  function maybeAutoAdvance() {
    const sc = cur();
    clearTimeout(autoTimer);
    if (!sc.auto) return;
    if (sc.required(S.answers).every((k) => isAnswered(S.answers[k]))) {
      autoTimer = setTimeout(() => { if (cur() === sc) next(); }, 600);
    }
  }

  function validate() {
    const sc = cur();
    const keys = sc.required ? sc.required(S.answers) : [];
    const missing = keys.filter((k) => !isAnswered(S.answers[k]));
    $$('.q.missing', app).forEach((e) => e.classList.remove('missing'));
    if (missing.length) {
      missing.forEach((k) => {
        const b = $(`[data-block="${k}"]`, app);
        if (b && b.classList.contains('q')) {
          b.classList.add('missing');
          b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        }
      });
      const first = $(`.q[data-block="${missing[0]}"]`, app);
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (sc.validate) { const m = sc.validate(S.answers); if (m) { toast(m); return false; } }
      toast(missing.length === 1 ? 'Please answer the highlighted question.' : `Please answer the ${missing.length} highlighted questions.`);
      return false;
    }
    if (sc.validate) {
      const msg = sc.validate(S.answers);
      if (msg) { toast(msg); return false; }
    }
    return true;
  }

  function trackTime() {
    const sc = cur();
    if (!sc) return;
    S.times[sc.id] = (S.times[sc.id] || 0) + (Date.now() - enterT);
    enterT = Date.now();
  }

  function go(i, dir = 1) {
    trackTime();
    S.screen = i;
    S.furthest = Math.max(S.furthest || 0, i);
    save();
    render(dir);
    app.focus({ preventScroll: true });
  }

  function next() {
    clearTimeout(autoTimer);
    const sc = cur();
    if (!validate()) return;
    if (sc.check && sc.check(S.answers) === 'screenout') return screenOut();
    if (S.screen >= SCREENS.length - 1) return submit();
    go(S.screen + 1, 1);
  }
  function back() {
    clearTimeout(autoTimer);
    if (S.screen > 0) go(S.screen - 1, -1);
  }

  const actions = {
    next, back,
    toConsent: () => {
      const c = $('#consent');
      c.scrollIntoView({ behavior: 'smooth', block: 'center' });
      c.animate([{ boxShadow: '0 0 0 0 rgba(15,139,125,.5)' }, { boxShadow: '0 0 0 14px rgba(15,139,125,0)' }], { duration: 900, delay: 350 });
    },
    consent: (el) => {
      S.answers.consent = !S.answers.consent;
      S.answers.consentAt = S.answers.consent ? new Date().toISOString() : null;
      el.classList.toggle('on', S.answers.consent);
      el.setAttribute('aria-pressed', S.answers.consent);
      $('#startBtn').disabled = !S.answers.consent;
    },
    start: () => {
      if (!S.answers.consent) return toast('Please tick the box to agree before starting.');
      go(1);
    },
    resume: () => {
      if (!S.answers.consent) { actions.toConsent(); return toast('Please confirm consent to continue.'); }
      go(Math.min(S.furthest, SCREENS.length - 1));
    },
    restart: () => {
      try { localStorage.removeItem(STATE_KEY); } catch (e) { /* ignore */ }
      S = freshState();
      SAVED = false;
      SCREENS = buildScreens();
      enterT = Date.now();
      renderLanding();
    },
    replay: playChat,
    copyLink: async () => {
      try { await navigator.clipboard.writeText(shareUrl()); toast('Link copied — thank you for sharing!'); }
      catch (e) { toast(shareUrl()); }
    },
    nativeShare: () => {
      navigator.share({ title: 'Indoor Air Survey', text: shareText(), url: shareUrl() }).catch(() => {});
    },
    download: (el) => {
      const blob = new Blob([el.dataset.json ? decodeURIComponent(el.dataset.json) : '{}'], { type: 'application/json' });
      const u = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = u; link.download = 'iaq-response.json'; link.click();
      setTimeout(() => URL.revokeObjectURL(u), 1000);
    },
  };

  document.addEventListener('click', (e) => {
    const t = e.target;
    const act = t.closest('[data-action]');
    if (act) {
      if (act.disabled) return;
      e.preventDefault();
      const fn = actions[act.dataset.action];
      if (fn) fn(act);
      return;
    }
    const un = t.closest('[data-unplace]');
    if (un) {
      delete S.answers.E1[un.dataset.unplace];
      save();
      csRender();
      return;
    }
    const bin = t.closest('[data-bin]');
    if (bin) { csPlace(bin.dataset.bin); return; }
    const b = t.closest('button[data-q]');
    if (b && app.contains(b)) onChoice(b);
  });

  document.addEventListener('keydown', (e) => {
    const bin = e.target.closest && e.target.closest('[data-bin]');
    if (bin && e.target === bin && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      csPlace(bin.dataset.bin);
    }
  });

  app.addEventListener('input', (e) => {
    const el = e.target;
    if (!el.matches('input[data-q], textarea[data-q]')) return;
    let v = el.value;
    if (el.type === 'number') v = v === '' ? null : Number(v);
    S.answers[el.dataset.q] = v;
    afterChange(el.dataset.q, true);
  });

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  /* ---------------- Screen-out ---------------- */
  function screenOut() {
    try { localStorage.removeItem(STATE_KEY); } catch (e) { /* ignore */ }
    renderBare(`<section class="screen"><div class="card done">
      <div class="badge muted"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <h1>Thank you for your interest</h1>
      <p>This study is only open to adults aged 18 and over, so we can’t include your answers. We really appreciate you stopping by!</p>
    </div></section>`);
    S = freshState();
    SAVED = false;
    SCREENS = buildScreens();
  }

  /* ---------------- Submit ---------------- */
  function assignGroup(a) {
    const vulnerable = ['Child under 5', 'Adult 65+', 'Asthma, COPD or other breathing condition', 'Heart condition', 'Currently pregnant'];
    const g1 = (a.A5 || []).some((x) => vulnerable.includes(x));
    const g2 = (a.A8 || []).some((x) => x === 'Air purifier' || x === 'Indoor air-quality monitor');
    return { group: g1 ? 'G1' : g2 ? 'G2' : 'G3', qualifiesG1andG2: g1 && g2 };
  }

  function buildPayload() {
    const a = S.answers;
    const activeMs = Object.values(S.times).reduce((t, x) => t + x, 0);
    return {
      instrument: INSTRUMENT_VERSION,
      respondentId: S.id,
      channel: S.channel,
      startedAt: S.startedAt,
      consentAt: a.consentAt || null,
      submittedAt: new Date().toISOString(),
      elapsedSec: Math.round((Date.now() - S.t0) / 1000),
      activeSec: Math.round(activeMs / 1000),
      secondsByScreen: Object.fromEntries(Object.entries(S.times).map(([k, v]) => [k, Math.round(v / 100) / 10])),
      recruitment: assignGroup(a),
      quality: { attentionCheckPassed: a.F1_ATT === 3 },
      design: S.design,
      config: { pricingInScope: CFG.pricingInScope, askTopBenefit: CFG.askTopBenefit, kanoTotal: CFG.kanoTotal },
      answers: a,
      client: { userAgent: navigator.userAgent, language: navigator.language, screen: `${screen.width}x${screen.height}` },
    };
  }

  function storeLocally(payload) {
    try {
      const arr = JSON.parse(localStorage.getItem(SUB_KEY) || '[]');
      arr.push(payload);
      localStorage.setItem(SUB_KEY, JSON.stringify(arr));
    } catch (e) { /* ignore */ }
  }

  const hasBackend = () => !!(window.SurveyBackend || CFG.submitUrl);

  // Resolves to 'ok', 'rejected' (server refused it) or 'failed' (retry later)
  async function sendPayload(payload) {
    if (window.SurveyBackend) return window.SurveyBackend.send(payload);
    if (!CFG.submitUrl) return 'failed';
    try {
      const r = await fetch(CFG.submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return r.ok ? 'ok' : 'failed';
    } catch (e) {
      return 'failed';
    }
  }

  // Retry responses that failed to send on a previous visit. A rejection on
  // retry usually means an earlier attempt already arrived (responses can't be
  // overwritten), so only network failures are kept for another try.
  async function flushQueue() {
    if (!hasBackend()) return;
    let arr;
    try { arr = JSON.parse(localStorage.getItem(SUB_KEY) || '[]'); } catch (e) { return; }
    if (!arr.length) return;
    const remaining = [];
    for (const p of arr) if ((await sendPayload(p)) === 'failed') remaining.push(p);
    try { localStorage.setItem(SUB_KEY, JSON.stringify(remaining)); } catch (e) { /* ignore */ }
  }

  async function submit() {
    trackTime();
    S.status = 'submitted';
    const payload = buildPayload();
    const wantsPilot = S.answers.F4_1 === 'Yes';
    renderBare(`<section class="screen"><div class="card done"><span class="sending"><span class="spinner"></span>Sending your answers…</span></div></section>`);

    const result = await sendPayload(payload);
    if (result !== 'ok') storeLocally(payload); // no backend, offline or refused: keep it on the device
    console.log('[IAQ survey] response', payload);
    try { localStorage.removeItem(STATE_KEY); } catch (e) { /* ignore */ }

    renderThanks(payload, wantsPilot);
    S = freshState();
    SAVED = false;
    SCREENS = buildScreens();
  }

  function shareUrl() { return location.href.split(/[?#]/)[0]; }
  function shareText() { return 'I just took a short survey on indoor air at home by UbiNet Lab, IIT Kharagpur. Your experiences could help too:'; }

  function renderThanks(payload, wantsPilot) {
    const wa = `https://wa.me/?text=${encodeURIComponent(shareText() + ' ' + shareUrl())}`;
    const pilot = wantsPilot
      ? `<div class="next-box"><b>Join the pilot waitlist</b>
          <p>This opens a separate form. Your email is never linked to your survey answers.</p>
          ${CFG.waitlistUrl
            ? `<a class="btn accent" href="${esc(CFG.waitlistUrl)}" target="_blank" rel="noopener">Open the sign-up form ${icon('arrow')}</a>`
            : `<p style="margin:0"><i>The sign-up form isn’t open yet — the research team will share the link soon.</i></p>`}
        </div>`
      : '';
    renderBare(`<section class="screen"><div class="card done">
      <div class="badge"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <h1>Thank you!</h1>
      <p>Your answers are in. They will directly shape what the assistant can do — and help make the air at home healthier for families like yours.</p>
      ${pilot}
      <div class="next-box" style="background:linear-gradient(120deg,#e9f9f1,#f3f8ff)">
        <b>Know someone who should take this?</b>
        <p>Every response helps — especially from families with kids, older adults or anyone with asthma.</p>
        <div class="share" style="margin:0">
          <a class="btn wa" href="${wa}" target="_blank" rel="noopener">${icon('chat')} Share on WhatsApp</a>
          <button type="button" class="btn ghost" data-action="copyLink">${icon('copy')} Copy link</button>
          ${navigator.share ? `<button type="button" class="btn ghost" data-action="nativeShare">${icon('share')} Share</button>` : ''}
        </div>
      </div>
      ${DEBUG ? `<p style="margin-top:18px"><button type="button" class="btn ghost" data-action="download" data-json="${encodeURIComponent(JSON.stringify(payload, null, 2))}">${icon('download')} Download response JSON</button></p>` : ''}
      <p style="margin-top:20px"><button type="button" class="link-btn" data-action="restart">Start a new response (shared device)</button></p>
    </div></section>`);
    confetti();
  }

  /* ---------------- Confetti ---------------- */
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('#confetti');
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ['#0f8b7d', '#17b29f', '#ff7a59', '#ffc85c', '#7b68ee', '#3b8ee6', '#d6589f'];
    const parts = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 13 - 4,
      s: Math.random() * 7 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    const t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (t - t0 < 3500) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  /* ---------------- Ambient particles ---------------- */
  function particles() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = $('#particles');
    let html = '';
    for (let i = 0; i < 16; i++) {
      const size = 4 + Math.random() * 8;
      html += `<span style="left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${16 + Math.random() * 18}s;animation-delay:${-Math.random() * 30}s;--dx:${(Math.random() - 0.5) * 120}px"></span>`;
    }
    root.innerHTML = html;
  }

  /* ---------------- Debug helpers (?debug=1) ---------------- */
  function debugPanel() {
    let p = $('#debug');
    if (!p) {
      p = document.createElement('div');
      p.id = 'debug'; p.className = 'debug';
      document.body.appendChild(p);
      p.addEventListener('change', (e) => { S.answers.consent = true; go(+e.target.value); });
    }
    p.innerHTML = `Jump: <select>${SCREENS.map((s, i) => `<option value="${i}"${i === S.screen ? ' selected' : ''}>${i} · ${s.id}</option>`).join('')}</select>`;
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    particles();
    const loaded = loadState();
    if (loaded) { S = loaded; SAVED = true; } else { S = freshState(); }
    if (DEBUG && params.has('fresh')) { S = freshState(); SAVED = false; }
    SCREENS = buildScreens();
    if (DEBUG && params.has('screen')) {
      S.answers.consent = true;
      S.screen = Math.min(+params.get('screen') || 0, SCREENS.length - 1);
      render();
    } else {
      S.screen = 0;
      renderLanding();
      if (DEBUG) debugPanel();
    }
    flushQueue();
  }

  boot();
})();
