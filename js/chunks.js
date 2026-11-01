/* chunks.js — "Treino por Chunks": monte frases do dia a dia com blocos (chunks) tocando nos blocos.
   Blocos extras (distratores) entram na mistura para exigir atenção. */
(function () {
  'use strict';
  const { h, icon } = DQD;
  const P = DQD.progress;

  let order = [], pos = 0, pool = [], line = [], result = null, correct = 0, finished = false;
  let box = null;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const exercise = () => DQD.data.chunks[order[pos]];

  function newRound() {
    order = shuffle(DQD.data.chunks.map((_, i) => i));
    pos = 0; correct = 0; finished = false;
    loadExercise();
  }
  function loadExercise() {
    const ex = exercise();
    pool = shuffle(ex.answer.concat(ex.extra || []).map((t, i) => ({ id: i, t })));
    line = []; result = null;
    draw();
  }

  function pick(b) { pool = pool.filter((x) => x.id !== b.id); line.push(b); draw(); }
  function unpick(b) { line = line.filter((x) => x.id !== b.id); pool.push(b); draw(); }
  function reset() { pool = pool.concat(line); line = []; result = null; draw(); }

  function check() {
    const ex = exercise();
    const ok = line.map((b) => b.t).join(' ') === ex.answer.join(' ');
    result = ok ? 'ok' : 'no';
    if (ok) { correct++; DQD.ui.notify(P.markDone('chk:' + ex.id)); }
    draw();
  }
  function next() {
    if (pos + 1 >= order.length) { finished = true; draw(); return; }
    pos++; loadExercise();
  }

  function draw() {
    if (!box) return;
    if (finished) {
      DQD.fill(box,
        h('p', { class: 'eyebrow' }, 'Rodada completa'),
        h('p', { class: 'score' }, correct + ' de ' + order.length),
        h('p', { class: 'muted' }, correct === order.length ? 'Todos os blocos no lugar.' : 'Refaça a rodada: a ordem muda a cada vez.'),
        h('div', { class: 'btn-row' }, h('button', { class: 'btn', type: 'button', onclick: newRound }, icon('reset'), 'Nova rodada')));
      return;
    }
    const ex = exercise();
    const locked = result !== null;
    const full = ex.answer.join(' ');
    DQD.fill(box,
      h('p', { class: 'eyebrow' }, 'Exercício ' + (pos + 1) + ' de ' + order.length),
      h('p', { class: 'pt' }, ex.pt),
      h('p', { class: 'muted' }, ex.note),
      h('div', { class: 'line', role: 'group', 'aria-label': 'Sua frase' },
        line.length ? line.map((b) => h('button', { class: 'blk', type: 'button', disabled: locked, onclick: () => unpick(b) }, b.t))
          : h('span', { class: 'empty' }, 'Toque nos blocos abaixo, na ordem.')),
      h('div', { class: 'pool', role: 'group', 'aria-label': 'Blocos disponíveis' },
        pool.map((b) => h('button', { class: 'blk', type: 'button', disabled: locked, onclick: () => pick(b) }, b.t))),
      result === null ? h('div', { class: 'btn-row' },
        h('button', { class: 'btn', type: 'button', disabled: line.length === 0, onclick: check }, icon('check'), 'Verificar'),
        h('button', { class: 'btn ghost', type: 'button', disabled: line.length === 0, onclick: reset }, icon('reset'), 'Limpar')) : null,
      result === 'ok' ? h('div', { class: 'feedback ok', role: 'status' },
        h('p', {}, 'Certo!'), h('p', { class: 'answer' }, full),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn soft', type: 'button', onclick: () => DQD.tts.speakFast(full) }, icon('volume'), 'Ouvir conectada'),
          h('button', { class: 'btn', type: 'button', onclick: next }, 'Próximo'))) : null,
      result === 'no' ? h('div', { class: 'feedback no', role: 'status' },
        h('p', {}, 'Quase. A ordem certa:'), h('p', { class: 'answer' }, full),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn soft', type: 'button', onclick: () => DQD.tts.speakFast(full) }, icon('volume'), 'Ouvir'),
          h('button', { class: 'btn ghost', type: 'button', onclick: reset }, icon('reset'), 'Tentar de novo'),
          h('button', { class: 'btn', type: 'button', onclick: next }, 'Próximo'))) : null);
  }

  function render(root) {
    box = h('section', { class: 'card' });
    root.append(
      h('header', { class: 'page-head' },
        h('p', { class: 'eyebrow' }, 'Módulo 3'),
        h('h1', { class: 'page-title' }, 'Treino por Chunks'),
        h('p', { class: 'muted' }, 'Falamos em blocos prontos, não em palavras soltas. Monte a frase e depois ouça como ela soa conectada.')),
      box);
    newRound();
  }

  DQD.views.chunks = { render, cleanup: () => { DQD.tts.cancel(); box = null; } };
})();
