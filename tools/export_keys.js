#!/usr/bin/env node
/* Lista tudo que precisa de áudio, lendo js/data.js. A normalização da chave (norm) é idêntica à de js/tts.js.
   Saída: JSON em stdout, usado por tools/make_audio.py. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = {};
ctx.window = ctx; // como no navegador: window é o escopo global
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8'), ctx);
const D = ctx.DQD.data;

const norm = (s) => String(s).toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const items = new Map();
const addPhrase = (text) => { const k = norm(text); if (k && !items.has('p:' + k)) items.set('p:' + k, { id: 'p:' + k, text, speed: 1.0 }); };
const addWords = (text) => text.split(/\s+/).filter(Boolean).forEach((w) => {
  const k = norm(w);
  if (k && !items.has('w:' + k)) items.set('w:' + k, { id: 'w:' + k, text: w.replace(/[^A-Za-z0-9']+/g, ''), speed: 0.65 });
});

D.cotonete.forEach((c) => { const t = c.text.replace(/[\[\]]/g, ''); addPhrase(t); addWords(t); });
D.patterns.forEach((x) => { const t = x.original.replace(/[\[\]]/g, ''); addPhrase(t); addWords(t); addPhrase(x.fast); });
D.lab.forEach((l) => { addPhrase(l.text); addWords(l.text); });
D.chunks.forEach((c) => addPhrase(c.answer.join(' ')));

process.stdout.write(JSON.stringify([...items.values()]));
