/* lab.js — "Laboratório de Destrava": fale a frase e veja, palavra por palavra, o que foi entendido.
   Usa a Web Speech API (SpeechRecognition). Onde o microfone não está disponível, há o modo digitação. */
(function () {
  'use strict';
  const { h, icon } = DQD;
  const P = DQD.progress;

  /* ===================== lógica pura (sem DOM) ===================== */
  const EXPAND = {
    gonna: ['going', 'to'], wanna: ['want', 'to'], gotta: ['got', 'to'], gimme: ['give', 'me'],
    lemme: ['let', 'me'], kinda: ['kind', 'of'], dunno: ['do', 'not', 'know'], cannot: ['can', 'not'],
    whatcha: ['what', 'do', 'you']
  };
  const CONTR = {
    "i'm": ['i', 'am'], "you're": ['you', 'are'], "we're": ['we', 'are'], "they're": ['they', 'are'],
    "it's": ['it', 'is'], "he's": ['he', 'is'], "she's": ['she', 'is'], "that's": ['that', 'is'], "what's": ['what', 'is'],
    "don't": ['do', 'not'], "doesn't": ['does', 'not'], "didn't": ['did', 'not'], "can't": ['can', 'not'],
    "won't": ['will', 'not'], "couldn't": ['could', 'not'], "wouldn't": ['would', 'not'], "isn't": ['is', 'not'],
    "i'll": ['i', 'will'], "i've": ['i', 'have'], "let's": ['let', 'us']
  };
  const HOMO = { too: 'to', two: 'to', four: 'for', their: 'there' };

  // texto → lista de palavras normalizadas (minúsculas, sem pontuação, contrações e "gonna/wanna" expandidas)
  function tokens(str) {
    const out = [];
    String(str).toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean).forEach((raw) => {
      const w = raw.replace(/^'+|'+$/g, '');
      const parts = CONTR[w] || EXPAND[w] || [w.replace(/'/g, '')];
      parts.forEach((p) => { if (p) out.push(HOMO[p] || p); });
    });
    return out;
  }
  function lev(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return dp[a.length][b.length];
  }
  // 2 = igual, 1 = parecida (quase), 0 = diferente
  function score(t, s) {
    if (t === s) return 2;
    const d = lev(t, s);
    return (t.length >= 4 && d <= 1) || (t.length >= 6 && d <= 2) ? 1 : 0;
  }
  // alinhamento por programação dinâmica: devolve 'ok' | 'near' | 'miss' para cada palavra-alvo
  function align(target, heard) {
    const n = target.length, m = heard.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        let best = Math.max(dp[i - 1][j], dp[i][j - 1]);
        const s = score(target[i - 1], heard[j - 1]);
        if (s > 0) best = Math.max(best, dp[i - 1][j - 1] + s);
        dp[i][j] = best;
      }
    }
    const st = new Array(n).fill('miss');
    let i = n, j = m;
    while (i > 0 && j > 0) {
      const s = score(target[i - 1], heard[j - 1]);
      if (s > 0 && dp[i][j] === dp[i - 1][j - 1] + s) { st[i - 1] = s === 2 ? 'ok' : 'near'; i--; j--; }
      else if (dp[i][j] === dp[i - 1][j]) i--;
      else j--;
    }
    return st;
  }
  function prepTarget(text) {
    const shown = text.split(/\s+/).filter(Boolean);
    const flat = [], owner = [];
    shown.forEach((w, wi) => tokens(w).forEach((t) => { flat.push(t); owner.push(wi); }));
    return { shown, flat, owner };
  }
  // estado de cada palavra exibida (uma palavra como "I'm" agrupa vários tokens)
  function grade(prep, heardText) {
    const st = align(prep.flat, tokens(heardText));
    const per = prep.shown.map(() => []);
    st.forEach((s, k) => per[prep.owner[k]].push(s));
    return per.map((a) => (a.length === 0 || a.every((s) => s === 'ok')) ? 'ok' : a.some((s) => s === 'miss') ? 'miss' : 'near');
  }
  function accuracy(states) {
    if (!states.length) return 0;
    return states.reduce((sum, s) => sum + (s === 'ok' ? 1 : s === 'near' ? 0.5 : 0), 0) / states.length;
  }
  DQD.lab = { tokens, grade, prepTarget, accuracy }; // exposto para testes

  const HINTS = {
    to: '"to" enfraquece para "ta" no meio da frase.', want: '"want to" junto soa "wanna".',
    going: '"going to" pode soar "gonna".', you: 'depois de "t" ou "d", "you" vira "tch"/"dj" (did you → didja).',
    the: '"the" é fraco: quase "dhâ".', of: '"of" vira "âv", colado na palavra anterior.',
    and: '"and" costuma virar só "n".', me: 'em "give me" e "let me" o "me" gruda: gimme, lemme.',
    what: '"what do you" vira "whatcha".', have: '"have to" soa "hafta".', little: 'o "t" entre vogais vira "r": "lidl".'
  };

  /* ===================== interface ===================== */
  let idx = 0, prep = null, listening = false, rec = null, lastHeard = '';
  let els = {};

  function render(root) {
    els = {};
    els.counter = h('p', { class: 'eyebrow' });
    els.toks = h('div', { class: 'toks', role: 'group', 'aria-label': 'Frase para falar' });
    els.pt = h('p', { class: 'muted' });
    els.tip = h('p', {});
    els.mic = h('button', { class: 'mic', type: 'button', 'aria-pressed': 'false', 'aria-label': 'Falar a frase', onclick: toggleMic }, icon('mic', 34));
    els.status = h('p', { class: 'status', 'aria-live': 'polite' }, 'Toque no microfone e fale a frase inteira.');
    els.heard = h('p', { class: 'heard' });
    els.result = h('div', { class: 'adjust' });
    els.typed = h('textarea', { class: 'field', id: 'typed-input', rows: '2', placeholder: 'Digite o que você falou…', 'aria-label': 'Texto do que você falou' });
    els.fallback = h('details', { class: 'fallback' },
      h('summary', {}, 'Sem microfone? Digite o que você falou'),
      h('div', { class: 'card', style: 'border:0;padding:12px 0 0' },
        h('p', { class: 'muted' }, 'Escreva do jeito que você pronunciou. O app compara com a frase-alvo da mesma forma.'),
        els.typed,
        h('div', { class: 'btn-row' }, h('button', { class: 'btn soft', type: 'button', onclick: () => finish(els.typed.value) }, 'Comparar'))));

    root.append(
      h('header', { class: 'page-head' },
        h('p', { class: 'eyebrow' }, 'Módulo 2'),
        h('h1', { class: 'page-title' }, 'Laboratório de Destrava'),
        h('p', { class: 'muted' }, 'Fale a frase. Verde = entendido, âmbar = quase, vermelho = precisa de ajuste.')),
      h('section', { class: 'card' },
        els.counter, els.toks, els.pt, els.tip,
        DQD.tts.speedPicker(),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn soft', type: 'button', onclick: () => DQD.tts.speakSlow(prep.shown) }, icon('volume'), 'Modelo lento'),
          h('button', { class: 'btn soft', type: 'button', onclick: () => DQD.tts.speakFast(DQD.data.lab[idx].text) }, icon('volume'), 'Modelo normal')),
        h('div', { class: 'btn-row', style: 'align-items:center' }, els.mic, els.status),
        els.heard, els.result, els.fallback,
        h('div', { class: 'btn-row', style: 'justify-content:space-between' },
          h('button', { class: 'btn ghost', type: 'button', onclick: () => go(-1) }, 'Anterior'),
          h('button', { class: 'btn ghost', type: 'button', onclick: () => go(1) }, 'Próxima'))));
    loadPhrase();
  }

  function go(d) {
    const n = DQD.data.lab.length;
    idx = (idx + d + n) % n;
    loadPhrase();
  }
  function loadPhrase() {
    stopMic();
    const p = DQD.data.lab[idx];
    prep = prepTarget(p.text);
    lastHeard = '';
    els.counter.textContent = 'Frase ' + (idx + 1) + ' de ' + DQD.data.lab.length;
    els.pt.textContent = p.pt;
    els.tip.textContent = 'Dica: ' + p.tip;
    els.heard.textContent = '';
    els.result.replaceChildren();
    els.typed.value = '';
    setStatus('Toque no microfone e fale a frase inteira.');
    drawToks(null);
  }
  function drawToks(states) {
    els.toks.replaceChildren(...prep.shown.map((w, i) => h('span', { class: 'tok', 'data-s': states ? states[i] : 'pending' }, w)));
  }
  function setStatus(t) { els.status.textContent = t; }
  function setListening(on) {
    listening = on;
    els.mic.setAttribute('aria-pressed', String(on)); // o rótulo fica fixo; o estado vem do aria-pressed
  }
  function openFallback(msg) {
    setStatus(msg);
    els.fallback.open = true;
  }

  // mostra o que foi ouvido; com final=false (parcial) as palavras ainda não ouvidas ficam neutras
  function show(text, final) {
    els.heard.textContent = text ? 'Ouvi: ' + text : '';
    const states = grade(prep, text);
    drawToks(final ? states : states.map((s) => (s === 'miss' ? 'pending' : s)));
    return states;
  }
  function finish(text) {
    if (!text || !text.trim()) { setStatus('Nada para comparar ainda.'); return; }
    const states = show(text, true);
    const acc = accuracy(states);
    const pct = Math.round(acc * 100);
    const need = states.map((s, i) => ({ s, w: prep.shown[i] })).filter((x) => x.s !== 'ok');
    setStatus(acc >= 0.9 ? 'Excelente: ' + pct + '%.' : acc >= 0.7 ? 'Boa: ' + pct + '%. Ajuste as palavras marcadas.' : 'Entendi ' + pct + '%. Tente de novo, mais devagar.');
    els.result.replaceChildren(...need.map((x) => {
      const key = x.w.toLowerCase().replace(/[^a-z']/g, '');
      return h('li', {}, h('b', {}, x.w), ' — ', HINTS[key] || 'repita devagar e depois conecte com a palavra vizinha.');
    }));
    if (acc >= 0.7) DQD.ui.notify(P.markDone('lab:' + DQD.data.lab[idx].id));
  }

  function stopMic() {
    if (rec) {
      // solta os handlers antes de abortar: um onend atrasado não pode "finalizar" a frase seguinte
      rec.onresult = rec.onerror = rec.onend = rec.onstart = null;
      try { rec.abort(); } catch (e) { /* já parado */ }
      rec = null;
    }
    if (els.mic) setListening(false);
  }
  function toggleMic() {
    if (listening) { try { rec.stop(); } catch (e) { stopMic(); } return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { openFallback('Este navegador não tem reconhecimento de voz (Chrome e Edge têm). Use o modo digitação.'); return; }
    DQD.tts.cancel();
    lastHeard = '';
    let finalText = '';
    const mine = (rec = new SR());
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => { setListening(true); setStatus('Ouvindo… fale a frase inteira.'); };
    rec.onresult = (e) => {
      let txt = '', isFinal = false;
      for (let i = 0; i < e.results.length; i++) { txt += e.results[i][0].transcript + ' '; if (e.results[i].isFinal) isFinal = true; }
      lastHeard = txt.trim();
      show(lastHeard, false);
      if (isFinal) { finalText = lastHeard; finish(finalText); }
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') openFallback('O microfone está bloqueado neste ambiente ou foi negado. Rode o app em localhost no Chrome e permita o microfone, ou use o modo digitação.');
      else if (e.error === 'audio-capture') openFallback('Nenhum microfone encontrado. Use o modo digitação.');
      else if (e.error === 'network') openFallback('O reconhecimento de voz precisa de internet. Use o modo digitação por enquanto.');
      else if (e.error === 'no-speech') setStatus('Não ouvi nada. Chegue mais perto do microfone e tente de novo.');
      else if (e.error !== 'aborted') setStatus('Erro de reconhecimento: ' + e.error);
    };
    rec.onend = () => {
      setListening(false);
      if (rec === mine) rec = null;
      if (!finalText && lastHeard) finish(lastHeard);
    };
    try { rec.start(); } catch (err) { openFallback('Não consegui iniciar o microfone. Use o modo digitação.'); }
  }

  DQD.views.destrava = { render, cleanup: () => { stopMic(); DQD.tts.cancel(); } };
})();
