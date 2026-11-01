/* core.js — namespace global, eventos, helpers de DOM, ícones e progresso (LocalStorage).
   Tudo fica sob window.DQD para não depender de bundler. */
(function () {
  'use strict';
  const DQD = (window.DQD = window.DQD || {});
  DQD.views = {};

  /* ---------- eventos simples ---------- */
  const handlers = {};
  DQD.bus = {
    on(evt, fn) { (handlers[evt] = handlers[evt] || []).push(fn); },
    emit(evt, data) {
      (handlers[evt] || []).forEach((fn) => { try { fn(data); } catch (e) { console.error(e); } });
    }
  };

  /* ---------- DOM ---------- */
  // h('button', { class: 'btn', onclick: fn }, 'Texto', outroNo)  → elemento
  DQD.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach((k) => {
      if (k == null || k === false) return;
      el.append(k.nodeType ? k : document.createTextNode(String(k)));
    });
    return el;
  };

  // "[Let it] go" → fragmento com <mark class="link">Let it</mark> go, mais a lista de palavras (<span class="w">)
  DQD.phrase = function (str) {
    const frag = document.createDocumentFragment();
    const words = [];
    str.split(/(\[[^\]]+\])/).filter(Boolean).forEach((seg) => {
      const marked = seg[0] === '[';
      const text = marked ? seg.slice(1, -1) : seg;
      const host = marked ? DQD.h('mark', { class: 'link' }) : frag;
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { host.append(document.createTextNode(part)); return; }
        const span = DQD.h('span', { class: 'w' }, part);
        words.push(span);
        host.append(span);
      });
      if (marked) frag.append(host);
    });
    return { frag, words };
  };

  // Substitui os filhos de um elemento ignorando null/false. O replaceChildren nativo converteria null em
  // o texto "null"; por isso todo conteúdo condicional passa por aqui.
  DQD.fill = function (el, ...kids) {
    el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false));
    return el;
  };

  /* ---------- ícones (SVG inline, traço) ---------- */
  const ICONS = {
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2.2-4.2.2 2 1 3 2.3 3.2C11 9.5 10.8 6 12 3z"/>',
    volume: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 9a4 4 0 0 1 0 6"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    play: '<path d="M7 5v14l12-7z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    contrast: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
    reset: '<path d="M4 4v6h6"/><path d="M5 14a8 8 0 1 0 2-6.5L4 10"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/>',
    wave: '<path d="M3 12h2M7 7v10M11 4v16M15 8v8M19 10v4M22 12h-1"/>',
    blocks: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>'
  };
  DQD.icon = function (name, size) {
    const s = size || 20;
    const span = document.createElement('span');
    span.className = 'ico';
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s +
      '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[name] || '') + '</svg>';
    return span;
  };

  /* ---------- progresso, meta diária e streak (LocalStorage) ---------- */
  const KEY = 'dqd.v1';
  let memory = null; // reserva quando o navegador bloqueia o storage
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const shift = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  function defaults() {
    return { goal: 5, streak: 0, best: 0, lastGoalDay: null, doneDay: null, done: [], days: {}, theme: null };
  }
  function load() {
    let stored = null;
    try { const raw = localStorage.getItem(KEY); if (raw) stored = JSON.parse(raw); } catch (e) { /* sem storage */ }
    const s = Object.assign(defaults(), stored || memory || {});
    const today = ymd(new Date());
    if (s.doneDay !== today) { s.doneDay = today; s.done = []; } // novo dia: zera as frases de hoje
    return s;
  }
  function save(s) {
    memory = s;
    const keys = Object.keys(s.days).sort();
    while (keys.length > 30) delete s.days[keys.shift()];
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignora */ }
  }
  // Atualiza o registro do dia e o streak. Retorna true só no instante em que a meta é batida.
  function checkGoal(s) {
    const today = ymd(new Date());
    s.days[today] = { n: s.done.length, met: s.lastGoalDay === today };
    if (s.done.length >= s.goal && s.lastGoalDay !== today) {
      const yesterday = ymd(shift(new Date(), -1));
      s.streak = s.lastGoalDay === yesterday ? s.streak + 1 : 1;
      s.best = Math.max(s.best, s.streak);
      s.lastGoalDay = today;
      s.days[today].met = true;
      return true;
    }
    return false;
  }
  function snapshot() {
    const s = load();
    const today = ymd(new Date());
    const yesterday = ymd(shift(new Date(), -1));
    const alive = s.lastGoalDay === today || s.lastGoalDay === yesterday;
    return { count: s.done.length, goal: s.goal, streak: alive ? s.streak : 0, best: s.best, met: s.lastGoalDay === today };
  }

  DQD.progress = {
    snapshot,
    isDone(id) { return load().done.includes(id); },
    // Conta uma frase/exercício no dia (cada id conta uma vez por dia)
    markDone(id) {
      const s = load();
      if (s.done.includes(id)) return { added: false, goalReached: false, snap: snapshot() };
      s.done.push(id);
      const reached = checkGoal(s);
      save(s);
      const snap = snapshot();
      DQD.bus.emit('progress', { reached, snap });
      return { added: true, goalReached: reached, snap };
    },
    setGoal(n) {
      const s = load();
      s.goal = n;
      const reached = checkGoal(s);
      save(s);
      const snap = snapshot();
      DQD.bus.emit('progress', { reached, snap });
      return { added: false, goalReached: reached, snap };
    },
    // Últimos 7 dias (do mais antigo ao de hoje)
    week() {
      const s = load();
      const out = [];
      for (let i = 6; i >= 0; i--) {
        const d = shift(new Date(), -i);
        const rec = s.days[ymd(d)];
        out.push({ date: d, n: i === 0 ? s.done.length : (rec ? rec.n : 0), met: rec ? rec.met : false, isToday: i === 0 });
      }
      return out;
    },
    getTheme() { return load().theme; },
    setTheme(t) { const s = load(); s.theme = t; save(s); }
  };
})();
