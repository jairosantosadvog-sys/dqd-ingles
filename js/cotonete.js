/* cotonete.js — Módulo "Efeito Cotonete": biblioteca de títulos, player lento vs. conectado,
   destaque visual (marca-texto + colchete) onde as palavras se ligam. */
(function () {
  'use strict';
  const { h, icon, phrase } = DQD;
  const P = DQD.progress;
  const KIND = { musica: 'Música', filme: 'Filme', serie: 'Série' };
  const FILTERS = { todas: 'Todas', musica: 'Músicas', filme: 'Filmes', serie: 'Séries' };

  let filter = 'todas';
  let currentId = null;
  let els = {};
  let words = [];   // <span> das palavras do player (para destacar durante o áudio)
  let gap = null;   // pausa entre "lenta" e "rápida" no botão Comparar

  const current = () => DQD.data.cotonete.find((c) => c.id === currentId);
  const plain = (c) => c.text.replace(/[\[\]]/g, '');

  function render(root) {
    if (!currentId) currentId = DQD.data.cotonete[0].id;
    els.player = h('section', { class: 'card', 'aria-label': 'Player de pronúncia' });
    els.filters = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filtrar por tipo' });
    els.list = h('ul', { class: 'list' });
    root.append(
      h('header', { class: 'page-head' },
        h('p', { class: 'eyebrow' }, 'Módulo 1'),
        h('h1', { class: 'page-title' }, 'Efeito Cotonete'),
        h('p', { class: 'muted' }, 'Quando as palavras se conectam na fala, elas soam como uma só. Ouça devagar, depois conectado, e então imite.')),
      els.player,
      h('h2', { class: 'section-title' }, 'Biblioteca de títulos'),
      els.filters,
      els.list,
      h('h2', { class: 'section-title' }, 'Padrões de conexão'),
      h('p', { class: 'muted' }, 'Três jeitos comuns de as palavras se ligarem. Ouça a frase devagar e depois conectada.'),
      patternList());
    drawFilters(); drawList(); drawPlayer();
  }

  /* ---------- player ---------- */
  function clearSpeaking() {
    words.forEach((w) => w.classList.remove('speaking'));
    if (els.player) els.player.classList.remove('fast-on');
  }
  function stop() { clearTimeout(gap); DQD.tts.cancel(); clearSpeaking(); }

  function playSlow(then) {
    clearTimeout(gap); clearSpeaking();
    DQD.tts.speakSlow(words.map((w) => w.textContent), {
      onWord: (i) => words.forEach((w, k) => w.classList.toggle('speaking', k === i)),
      onEnd: () => { clearSpeaking(); if (typeof then === 'function') gap = setTimeout(then, 450); }
    });
  }
  function playFast() {
    clearTimeout(gap); clearSpeaking();
    DQD.tts.speakFast(plain(current()), {
      onStart: () => els.player.classList.add('fast-on'),
      onEnd: clearSpeaking
    });
  }

  function drawPlayer() {
    stop();
    const c = current();
    const big = phrase(c.text);
    const rp = phrase(c.respell);
    words = big.words;
    const ok = DQD.tts.supported;
    const done = P.isDone('cot:' + c.id);
    DQD.fill(els.player,
      h('p', { class: 'eyebrow' }, KIND[c.kind] + ' · título'),
      h('p', { class: 'phrase-big' }, big.frag),
      h('p', { class: 'respell', title: 'Grafia aproximada para brasileiros (não é IPA)' }, rp.frag),
      h('p', {}, c.tip),
      h('div', { class: 'chips' }, c.tags.map((t) => h('span', { class: 'tag' }, DQD.data.tags[t]))),
      DQD.tts.speedPicker(),
      DQD.tts.sourceBadge(),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn soft', type: 'button', disabled: !ok, onclick: () => playSlow() }, icon('volume'), 'Lenta'),
        h('button', { class: 'btn', type: 'button', disabled: !ok, onclick: playFast }, icon('volume'), 'Conectada'),
        h('button', { class: 'btn ghost', type: 'button', disabled: !ok, onclick: () => playSlow(playFast) }, icon('play'), 'Comparar'),
        h('button', { class: 'btn ghost', type: 'button', disabled: !ok, onclick: stop, 'aria-label': 'Parar áudio' }, icon('stop'))),
      ok ? null : h('p', { class: 'muted' }, 'Este navegador não tem síntese de voz. Teste no Chrome, Edge ou Safari.'),
      h('div', { class: 'btn-row' },
        h('button', {
          class: done ? 'btn good' : 'btn', type: 'button',
          onclick: () => { const r = P.markDone('cot:' + c.id); DQD.ui.notify(r); drawPlayer(); drawList(); }
        }, icon('check'), done ? 'Frase treinada hoje' : 'Treinei esta frase')));
  }

  /* ---------- padrões de conexão ---------- */
  function patternList() {
    return h('ul', { class: 'list' }, DQD.data.patterns.map((x) => {
      const orig = phrase(x.original), conn = phrase(x.cotonete);
      const ok = DQD.tts.supported;
      const done = P.isDone('pat:' + x.id);
      const card = h('li', { class: 'card pattern' });
      const slow = () => { DQD.tts.speakSlow(orig.words.map((w) => w.textContent), {
        onWord: (i) => orig.words.forEach((w, k) => w.classList.toggle('speaking', k === i)),
        onEnd: () => orig.words.forEach((w) => w.classList.remove('speaking')) }); };
      const fast = () => { card.classList.add('fast-on'); DQD.tts.speakFast(x.fast, { onEnd: () => card.classList.remove('fast-on') }); };
      card.append(
        h('div', { class: 'chips' }, h('span', { class: 'tag' }, x.categoria), h('span', { class: 'tag' }, x.padrao)),
        h('p', { class: 'phrase-big' }, orig.frag),
        h('p', { class: 'respell', title: 'Como soa conectado (grafia aproximada)' }, conn.frag),
        h('p', {}, x.tip),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn soft', type: 'button', disabled: !ok, onclick: slow }, icon('volume'), 'Lenta'),
          h('button', { class: 'btn', type: 'button', disabled: !ok, onclick: fast }, icon('volume'), 'Conectada'),
          h('button', { class: done ? 'btn good' : 'btn ghost', type: 'button', onclick: (e) => {
            const r = P.markDone('pat:' + x.id); DQD.ui.notify(r); e.currentTarget.className = 'btn good';
          } }, icon('check'), done ? 'Treinada hoje' : 'Treinei')));
      return card;
    }));
  }

  /* ---------- filtros e lista ---------- */
  function drawFilters() {
    els.filters.replaceChildren(...Object.keys(FILTERS).map((k) =>
      h('button', {
        class: 'pill', type: 'button', 'aria-pressed': String(filter === k),
        onclick: () => { filter = k; drawFilters(); drawList(); }
      }, FILTERS[k])));
  }
  function drawList() {
    const items = DQD.data.cotonete.filter((c) => filter === 'todas' || c.kind === filter);
    els.list.replaceChildren(...items.map((c) =>
      h('li', {},
        h('button', {
          class: 'row', type: 'button', 'aria-current': String(c.id === currentId),
          onclick: () => {
            currentId = c.id; drawList(); drawPlayer();
            els.player.scrollIntoView({ block: 'nearest' });
          }
        },
          h('span', { class: 'row-title' }, phrase(c.text).frag),
          h('span', { class: 'row-meta' },
            P.isDone('cot:' + c.id) ? h('span', { class: 'ok' }, icon('check', 16)) : null,
            KIND[c.kind])))));
  }

  DQD.views.cotonete = { render, cleanup: stop };
})();
