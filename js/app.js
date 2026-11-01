/* app.js — roteador (hash), cabeçalho, tema, tela "Hoje" (streak e meta diária), avisos e confete. */
(function () {
  'use strict';
  const { h, icon } = DQD;
  const P = DQD.progress;
  const $ = (id) => document.getElementById(id);
  const ROUTES = ['hoje', 'cotonete', 'destrava', 'chunks'];
  const GOALS = [3, 5, 8, 10];
  const plural = (n, one, many) => (n === 1 ? one : many);
  let current = null;

  /* ---------- avisos e celebração ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }
  function confetti() {
    const cv = $('confetti');
    const ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = getComputedStyle(document.documentElement);
    const cols = ['--accent', '--link', '--good', '--fg'].map((v) => cs.getPropertyValue(v).trim() || '#0A7A62');
    const ps = Array.from({ length: 110 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 9 - 3, s: 4 + Math.random() * 6,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[Math.floor(Math.random() * cols.length)]
    }));
    const t0 = performance.now();
    (function frame(t) {
      const el = t - t0;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const alpha = Math.max(0, 1 - el / 2200);
      ps.forEach((p) => {
        p.vy += 0.28; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.6); ctx.restore();
      });
      if (el < 2200) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }
  function celebrate(snap) {
    toast('Meta do dia batida! Sequência: ' + snap.streak + ' ' + plural(snap.streak, 'dia', 'dias') + '.');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) confetti();
  }

  // Os módulos chamam DQD.ui.notify(resultadoDeMarkDone) depois de contar uma frase
  DQD.ui = {
    toast,
    notify(r) {
      if (!r) return;
      if (!r.added) { toast('Essa frase já foi contada hoje.'); return; }
      const s = r.snap;
      if (r.goalReached) celebrate(s);
      else toast(s.count >= s.goal ? s.count + ' frases hoje. Meta já batida.' : s.count + ' de ' + s.goal + ' frases hoje.');
    }
  };

  /* ---------- cabeçalho ---------- */
  function renderHeader() {
    const s = P.snapshot();
    $('streakNum').textContent = s.streak;
    $('goalNum').textContent = s.count + '/' + s.goal;
    $('topFill').style.width = Math.min(100, (s.count / s.goal) * 100) + '%';
    $('streakChip').title = s.streak + ' ' + plural(s.streak, 'dia seguido', 'dias seguidos');
  }

  /* ---------- tema ---------- */
  function applyTheme(t) {
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
  }
  function toggleTheme() {
    const root = document.documentElement;
    const now = root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = now === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    P.setTheme(next);
  }

  /* ---------- tela "Hoje" ---------- */
  function renderHoje(root) {
    const s = P.snapshot();
    const week = P.week();
    root.append(
      h('section', { class: 'grid gap-2' },
        h('p', { class: 'eyebrow' }, 'Sequência'),
        h('div', { class: 'streak-row' },
          h('span', { class: 'streak-num' }, String(s.streak)),
          h('span', { class: 'streak-lbl' }, plural(s.streak, 'dia seguido', 'dias seguidos'))),
        h('p', { class: 'muted' }, s.best > 0
          ? 'Recorde: ' + s.best + ' ' + plural(s.best, 'dia', 'dias') + '. A sequência cresce quando você bate a meta do dia.'
          : 'Bata a meta de hoje para começar sua sequência.')),

      h('section', { class: 'card' },
        h('div', { class: 'flex flex-wrap items-end justify-between gap-3' },
          h('div', {}, h('p', { class: 'eyebrow' }, 'Meta de hoje'),
            h('p', { class: 'goal-count' }, s.count + ' de ' + s.goal + ' ' + plural(s.goal, 'frase', 'frases'))),
          h('div', { class: 'chips', role: 'group', 'aria-label': 'Escolher meta diária' },
            GOALS.map((g) => h('button', {
              class: 'pill', type: 'button', 'aria-pressed': String(g === s.goal),
              onclick: () => { const r = P.setGoal(g); if (r.goalReached) celebrate(r.snap); }
            }, String(g))))),
        h('div', { class: 'pips', 'aria-hidden': 'true' },
          Array.from({ length: s.goal }, (_, i) => h('i', { class: 'pip' + (i < s.count ? ' on' : '') }))),
        h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(s.goal), 'aria-valuenow': String(Math.min(s.count, s.goal)), 'aria-label': 'Progresso do dia' },
          h('i', { style: 'width:' + Math.min(100, (s.count / s.goal) * 100) + '%' })),
        s.met ? h('p', { class: 'notice' }, icon('check'), s.count >= s.goal
          ? 'Meta batida hoje. Sua sequência está garantida.'
          : 'Sequência de hoje garantida. Faltam ' + (s.goal - s.count) + ' para a nova meta.')
          : h('p', { class: 'muted' }, 'Faltam ' + (s.goal - s.count) + ' ' + plural(s.goal - s.count, 'frase', 'frases') + '. Cada frase conta uma vez por dia.')),

      h('section', { class: 'card' },
        h('p', { class: 'eyebrow' }, 'Últimos 7 dias'),
        h('div', { class: 'week' }, week.map((d) => {
          const label = d.date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
          const pct = Math.min(100, (d.n / s.goal) * 100);
          return h('div', {
            class: 'day' + (d.met ? ' met' : '') + (d.isToday ? ' today' : ''),
            role: 'img',
            'aria-label': label + ': ' + d.n + ' ' + plural(d.n, 'frase', 'frases') + (d.met ? ', meta batida' : '')
          }, h('span', { class: 'day-bar' }, d.n > 0 ? h('i', { style: 'height:' + pct + '%' }) : null), h('b', {}, label));
        }))),

      h('section', { class: 'grid gap-3' },
        h('h2', { class: 'section-title' }, 'Rota sugerida'),
        h('div', { class: 'grid gap-3 sm:grid-cols-1' },
          route('cotonete', 'Efeito Cotonete', 'Ouça lento e conectado. Veja onde as palavras se ligam.'),
          route('destrava', 'Laboratório de Destrava', 'Fale a frase e receba retorno palavra por palavra.'),
          route('chunks', 'Treino por Chunks', 'Monte frases do dia a dia com blocos prontos.'))));
  }
  function route(hash, title, desc) {
    return h('a', { class: 'route', href: '#' + hash }, h('div', {}, h('b', {}, title), h('span', {}, desc)), icon('arrow'));
  }
  DQD.views.hoje = { render: renderHoje, cleanup() {} };

  /* ---------- roteador ---------- */
  function route_() {
    const name = ROUTES.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'hoje';
    if (current && DQD.views[current].cleanup) DQD.views[current].cleanup();
    current = name;
    const view = $('view');
    view.replaceChildren();
    DQD.views[name].render(view);
    document.querySelectorAll('#tabs a').forEach((a) => {
      if (a.dataset.route === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    renderHeader(); // atualiza também se o dia virou com a página aberta
    window.scrollTo(0, 0);
  }

  /* ---------- inicialização ---------- */
  function init() {
    applyTheme(P.getTheme());
    $('streakIcon').append(icon('flame', 18));
    $('themeBtn').append(icon('contrast', 18));
    $('themeBtn').addEventListener('click', toggleTheme);
    document.querySelectorAll('#tabs [data-ico]').forEach((n) => n.append(icon(n.dataset.ico, 22)));
    DQD.bus.on('progress', () => {
      renderHeader();
      if (current === 'hoje') { const v = $('view'); v.replaceChildren(); renderHoje(v); }
    });
    window.addEventListener('hashchange', route_);
    renderHeader();
    route_();
  }
  init();

  // PWA: só registra quando servido por http(s) (no artefato e em file:// isso é ignorado)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => { try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) { /* ok */ } });
  }
})();
