/* tts.js — ouvir a pronúncia.
   1) Primeiro tenta os áudios embutidos (js/audio.js, voz feminina en-US pré-gerada): o som é o mesmo em qualquer
      aparelho, sem depender das vozes instaladas no celular/computador.
   2) Se uma frase não estiver no banco (ex.: você editou data.js e não regerou os áudios), cai para a voz do
      navegador (speechSynthesis), preferindo uma voz feminina em inglês americano.
   Lenta  = palavra por palavra (cada palavra com seu clipe).
   Rápida = frase inteira de uma vez, que é onde a conexão entre as palavras aparece. */
(function () {
  'use strict';
  window.DQD = window.DQD || {};

  const bank = DQD.audioBank || {};
  const hasBank = Object.keys(bank).length > 0;
  const synth = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? window.speechSynthesis : null;
  const supported = hasBank || !!synth;

  // Mesma normalização de tools/export_keys.js (as chaves do banco são geradas com ela).
  const norm = (s) => String(s).toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const clip = (kind, text) => bank[kind + ':' + norm(text)] || null;

  /* ---------- velocidade (x0,5 a x3) ---------- */
  const RATES = [0.5, 0.75, 1, 1.25, 2, 3];
  let rate = 1;
  try { const r = parseFloat(localStorage.getItem('dqd.rate')); if (RATES.includes(r)) rate = r; } catch (e) { /* sem storage: fica 1x */ }
  const rateLabel = (r) => 'x' + String(r).replace('.', ',');
  const listeners = [];
  function setRate(r) {
    if (!RATES.includes(r)) return;
    rate = r;
    try { localStorage.setItem('dqd.rate', String(r)); } catch (e) { /* ok */ }
    if (player) player.playbackRate = r;           // vale também para o clipe que está tocando
    listeners.forEach((f) => f(r));
  }

  // Diagnóstico: de onde veio o último som? 'clip' = áudio feminino embutido; 'voice' = voz do aparelho (reserva)
  let source = '';
  const srcListeners = [];
  function setSource(x) { source = x; srcListeners.forEach((f) => f(x)); }

  let token = 0;          // invalida callbacks de áudios cancelados
  let timer = 0;          // pausa entre palavras no modo lento
  const GAP = 250;        // ms entre palavras no modo lento
  let player = null;      // um único <audio> reutilizado (o iOS libera o som depois do primeiro toque)
  function audioEl() {
    if (!player) player = new Audio();
    return player;
  }

  /* ---------- voz do navegador (reserva) ---------- */
  let voice = null;
  let keep = [];
  const FEMALE = /samantha|ava|allison|susan|victoria|karen|tessa|moira|aria|jenny|zira|michelle|emma|joanna|salli|kendra|kimberly|google us english|female/i;
  const MALE = /\b(alex|fred|daniel|david|mark|james|guy|george|tom|aaron|ralph|male)\b/i;

  function pickVoice() {
    if (!synth) return;
    const list = synth.getVoices();
    const us = list.filter((v) => /^en[-_]US/i.test(v.lang));
    const en = list.filter((v) => /^en/i.test(v.lang));
    const pool = us.length ? us : en;
    voice = pool.find((v) => FEMALE.test(v.name) && !MALE.test(v.name)) || pool.find((v) => !MALE.test(v.name)) || pool[0] || null;
  }
  if (synth) {
    pickVoice();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice);
  }

  function utter(text, rate) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    if (voice) u.voice = voice;
    u.rate = rate;
    keep.push(u);
    if (keep.length > 24) keep.shift();
    return u;
  }

  /* ---------- controle ---------- */
  function cancel() {
    token++;
    clearTimeout(timer);
    if (player) { player.onended = null; player.onerror = null; try { player.pause(); } catch (e) { /* ok */ } }
    if (wsrc) { try { wsrc.onended = null; wsrc.stop(); } catch (e) { /* ok */ } wsrc = null; }
    if (synth) synth.cancel();
  }

  /* Plano B para o áudio embutido: Web Audio (decodifica os bytes direto, sem URL). Funciona mesmo quando o
     ambiente bloqueia <audio> com data: URI. Aqui a velocidade muda o tom (não há preservesPitch). */
  let actx = null, wsrc = null;
  function playViaWebAudio(b64, mine, onStart, done) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return done(false);
      if (!actx) actx = new AC();
      if (actx.state === 'suspended' && actx.resume) actx.resume();
      const bin = atob(b64), buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      const ok = (ab) => {
        if (mine !== token) return;
        const src = actx.createBufferSource();
        src.buffer = ab; src.playbackRate.value = rate; src.connect(actx.destination);
        src.onended = () => { if (mine === token) done(true); };
        wsrc = src; src.start(0);
        setSource('clip'); if (onStart) onStart();
      };
      const p = actx.decodeAudioData(buf.buffer, ok, () => { if (mine === token) done(false); });
      if (p && p.catch) p.catch(() => {});
    } catch (e) { done(false); }
  }

  // Toca um clipe do banco. done(true) = tocou até o fim; done(false) = não conseguiu (usa a reserva).
  function playClip(b64, mine, onStart, done) {
    const a = audioEl();
    a.onended = () => { if (mine === token) done(true); };
    const viaWeb = () => playViaWebAudio(b64, mine, onStart, done);
    a.onerror = () => { if (mine === token) viaWeb(); };
    a.src = 'data:audio/mpeg;base64,' + b64;
    a.defaultPlaybackRate = rate; a.playbackRate = rate;   // trocar o src zera a velocidade
    a.preservesPitch = true; a.mozPreservesPitch = true; a.webkitPreservesPitch = true; // sem voz de esquilo/monstro
    const p = a.play();
    if (p && p.then) {
      p.then(() => { if (mine === token) { setSource('clip'); if (onStart) onStart(); } })
       .catch(() => { if (mine === token) viaWeb(); });
    } else { setSource('clip'); if (onStart) onStart(); }
  }

  function speakFast(text, cb) {
    cb = cb || {};
    cancel();
    const mine = token;
    const end = (ok) => { if (mine === token && cb.onEnd) cb.onEnd(ok); };
    const fallback = () => {
      if (!synth) return end(false);
      setSource('voice');
      const u = utter(text, Math.min(rate, 2));
      u.onstart = () => { if (mine === token && cb.onStart) cb.onStart(); };
      u.onend = u.onerror = () => end(true);
      // pequena espera após o cancel(): alguns Chromes descartam o áudio falado logo em seguida
      setTimeout(() => { if (mine === token) synth.speak(u); }, 60);
    };
    const b64 = clip('p', text);
    if (!b64) return fallback();
    playClip(b64, mine, cb.onStart, (ok) => (ok ? end(true) : fallback()));
  }

  function speakSlow(words, cb) {
    cb = cb || {};
    if (!words.length) { if (cb.onEnd) cb.onEnd(false); return; }
    cancel();
    const mine = token;
    const end = (ok) => { if (mine === token && cb.onEnd) cb.onEnd(ok); };

    // Cada palavra: clipe do banco; se faltar (ou falhar), fala essa palavra com a voz do navegador.
    function say(i) {
      if (mine !== token) return;
      if (i >= words.length) return end(true);
      const next = () => { timer = setTimeout(() => say(i + 1), GAP / rate); };
      const b64 = clip('w', words[i]);
      const viaVoice = () => {
        if (!synth) return next();
        setSource('voice');
        const u = utter(words[i], Math.min(0.6 * rate, 2));
        u.onstart = () => { if (mine === token && cb.onWord) cb.onWord(i); };
        u.onend = u.onerror = () => { if (mine === token) next(); };
        synth.speak(u);
      };
      if (!b64) return viaVoice();
      playClip(b64, mine, () => { if (cb.onWord) cb.onWord(i); }, (ok) => (ok ? next() : viaVoice()));
    }
    say(0);
  }

  // Avisa (sem travar nada) quando não há voz em inglês no aparelho e o banco não cobre o texto.
  function hasEnglishVoice() { return hasBank || !!voice; }

  // Seletor de velocidade reutilizável (mesma escolha vale em todas as telas)
  function speedPicker() {
    const box = DQD.h('div', { class: 'chips speed', role: 'group', 'aria-label': 'Velocidade do áudio' });
    const paint = () => DQD.fill(box, DQD.h('span', { class: 'muted speed-lbl' }, 'Velocidade'),
      ...RATES.map((r) => DQD.h('button', {
        class: 'pill', type: 'button', 'aria-pressed': String(r === rate), onclick: () => setRate(r)
      }, rateLabel(r))));
    paint();
    listeners.push(paint);
    return box;
  }

  // Linha pequena que mostra qual voz está tocando (ajuda a descobrir se o áudio embutido está sendo usado)
  function sourceBadge() {
    const el = DQD.h('p', { class: 'muted src-badge', role: 'status' });
    const paint = (x) => { el.textContent = x === 'clip' ? 'Voz: áudio feminino embutido' : x === 'voice' ? (hasBank ? 'Voz: do aparelho (reserva; o áudio embutido não tocou)' : 'Voz: do aparelho') : ''; };
    paint(source);
    srcListeners.push(paint);
    return el;
  }

  DQD.tts = { sourceBadge, RATES, getRate: () => rate, setRate, speedPicker, supported, cancel, speakFast, speakSlow, hasEnglishVoice, norm };
})();
