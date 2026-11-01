/* data.js — conteúdo do app. Edite aqui para adicionar frases sem mexer na lógica.

   Convenção de marcação: [colchetes] envolvem as palavras que se conectam.
   - cotonete: usamos apenas TÍTULOS de músicas, filmes e séries (não trechos de letras ou falas).
   - respell: grafia aproximada para falantes de português. Não é IPA e varia com o sotaque. */
window.DQD = window.DQD || {};
DQD.data = {

  tags: {
    flap: 't entre vogais vira "r" rápido',
    ty: 'd/t + you → dj/tch',
    reducao: 'redução (gonna, wanna)',
    liga: 'consoante liga na vogal',
    fraca: 'palavra fraca'
  },

  /* Padrões de conexão (categorias do Efeito Cotonete). `original` e `cotonete` usam [colchetes] nas partes ligadas;
     `fast` é o texto falado no modo "Conectada" (na redução de verbo, a frase muda: want to -> wanna). */
  patterns: [
    { id: 'p-cv', categoria: 'Consoante + Vogal', padrao: 'C + V',
      original: '[Turn off] the light', cotonete: '[Tur-noff] the light', fast: 'Turn off the light',
      tip: 'A consoante final de "turn" passa para a vogal de "off": tur-noff.' },
    { id: 'p-flap', categoria: 'Flap T', padrao: 'T/D em som de R',
      original: 'I gotta [open it] first', cotonete: 'I gotta [o-pe-nit] first', fast: 'I gotta open it first',
      tip: 'O T entre vogais vira um R rápido, e "it" gruda em "open": o-pe-nit.' },
    { id: 'p-red', categoria: 'Redução de Verbo', padrao: 'Want to -> Wanna',
      original: 'I [want to] go home', cotonete: 'I [wanna] go home', fast: 'I wanna go home',
      tip: '"Want to" encolhe para "wanna" na fala rápida do dia a dia.' }
  ],

  cotonete: [
    { id: 'gotta', kind: 'musica', text: '[I Gotta] Feeling', respell: '[Ái gá-ra] fí-lin',
      tags: ['reducao', 'flap'], tip: '"gotta" vem de "got to". O "t" fica entre vogais e vira um "r" rápido: gá-ra.' },
    { id: 'whatcha', kind: 'musica', text: '[Whatcha] [Gonna] Do', respell: '[Uó-tcha] [Gâ-na] Du',
      tags: ['ty', 'reducao'], tip: '"Whatcha" é "what do you" colado. "Gonna" é "going to".' },
    { id: 'letitgo', kind: 'musica', text: '[Let it] Go', respell: '[Lé-rit] Gô',
      tags: ['flap', 'liga'], tip: 'O "t" de "let" encontra a vogal de "it" e vira um "r" leve: le-rit.' },
    { id: 'dontstop', kind: 'musica', text: "[Don't Stop] Believin'", respell: '[Dôn-stóp] bi-lí-vin',
      tags: ['liga'], tip: 'O "t" final de "don\'t" quase some antes do "s": o som corre direto para "stop".' },
    { id: 'girls', kind: 'musica', text: 'Girls [Just Wanna] Have Fun', respell: 'Gârls [Djâs-uó-na] Hév Fân',
      tags: ['reducao'], tip: '"want to" vira "wanna" e o "just" encosta nele: djâs-uó-na.' },
    { id: 'shutup', kind: 'musica', text: '[Shut Up] and Dance', respell: '[Xâ-râp] ân Dénss',
      tags: ['flap', 'fraca'], tip: 'O "t" de "shut" cai entre vogais e vira "r". O "and" encolhe para "ân".' },
    { id: 'whatdoyou', kind: 'musica', text: '[What do you] Mean', respell: '[Uó-dja] Min',
      tags: ['ty'], tip: '"do you" cola e vira "dja". Com "what" na frente, soa uó-dja.' },
    { id: 'letHer', kind: 'musica', text: '[Let her] Go', respell: '[Lé-târ] Gô',
      tags: ['fraca', 'liga'], tip: 'O "h" de "her" quase some em fala rápida, então "let her" soa lé-târ.' },
    { id: 'takeon', kind: 'musica', text: '[Take on] Me', respell: '[Têi-kon] Mi',
      tags: ['liga'], tip: 'O "k" final de "take" gruda na vogal de "on": têi-kon.' },
    { id: 'shakeit', kind: 'musica', text: '[Shake it] Off', respell: '[Xêi-kit] Óf',
      tags: ['liga'], tip: 'Mesmo padrão: o "k" de "shake" liga em "it": xêi-kit.' },

    { id: 'backfuture', kind: 'filme', text: 'Back [to the] Future', respell: 'Bék [ta-dhâ] Fiú-tchâr',
      tags: ['fraca'], tip: '"to" e "the" são palavras fracas e viram "ta-dhâ", coladas uma na outra.' },
    { id: 'dragon', kind: 'filme', text: '[How to] Train Your Dragon', respell: '[Ráu-ta] Trêin ior Drég-ân',
      tags: ['fraca'], tip: 'O "to" enfraquece para "ta" e gruda no "how".' },
    { id: 'lotr', kind: 'filme', text: '[Lord of] the Rings', respell: '[Lór-dâv] dhâ Rínz',
      tags: ['liga', 'fraca'], tip: 'O "d" de "lord" liga no "of", que vira "âv": lór-dâv.' },

    { id: 'himym', kind: 'serie', text: 'How I [Met Your] Mother', respell: 'Rau ái [Mé-tchor] Mâ-dhâr',
      tags: ['ty'], tip: '"t" + "you" vira "tch": met your → mé-tchor.' },
    { id: 'saul', kind: 'serie', text: '[Better] Call Saul', respell: '[Bé-râr] Cól Sól',
      tags: ['flap'], tip: 'O "tt" de "better" entre vogais vira "r" rápido: bé-râr.' },
    { id: 'got', kind: 'serie', text: '[Game of] Thrones', respell: '[Guêi-mâv] Thrôuns',
      tags: ['liga', 'fraca'], tip: 'O "m" de "game" liga no "of" (âv): guêi-mâv.' }
  ],

  /* Laboratório de Destrava: frases curtas do dia a dia, escritas por nós */
  lab: [
    { id: 1, text: 'What do you want to do?', pt: 'O que você quer fazer?', tip: '"What do you" → "whatcha"; "want to" → "wanna".' },
    { id: 2, text: "I'm going to call you later.", pt: 'Eu vou te ligar mais tarde.', tip: '"going to" → "gonna"; "call you" liga.' },
    { id: 3, text: 'Can you give me a hand?', pt: 'Pode me dar uma mão?', tip: '"Can you" → "kenya"; "give me" → "gimme".' },
    { id: 4, text: 'Let me know if you need help.', pt: 'Me avise se precisar de ajuda.', tip: '"Let me" → "lemme"; "know if" liga.' },
    { id: 5, text: 'I have to go now.', pt: 'Eu preciso ir agora.', tip: '"have to" → "hafta".' },
    { id: 6, text: 'Did you eat yet?', pt: 'Você já comeu?', tip: '"Did you" → "didja".' },
    { id: 7, text: 'Where are you going?', pt: 'Aonde você vai?', tip: '"are you" → "arya".' },
    { id: 8, text: "I don't know what to say.", pt: 'Eu não sei o que dizer.', tip: '"don\'t know" → "dunno"; "what to" → "whatta".' },
    { id: 9, text: 'Could you speak a little slower?', pt: 'Você poderia falar um pouco mais devagar?', tip: '"Could you" → "couldja"; "a little" → "a lidl".' },
    { id: 10, text: "I'll see you tomorrow.", pt: 'Vejo você amanhã.', tip: '"see you" liga: "seeya".' }
  ],

  /* Treino por Chunks: monte a frase com blocos. "extra" = blocos que confundem. */
  chunks: [
    { id: 1, pt: 'Você quer vir comigo?', answer: ['Do you', 'want to', 'come', 'with me?'], extra: ['going to'], note: 'Blocos: pergunta + intenção + ação + companhia.' },
    { id: 2, pt: 'Eu vou te ligar mais tarde.', answer: ["I'm going to", 'call you', 'later.'], extra: ['want to'], note: '"I\'m going to" é um bloco só, que vira "ai\'m gonna".' },
    { id: 3, pt: 'Pode me dar uma mão?', answer: ['Can you', 'give me', 'a hand?'], extra: ['let me'], note: '"Can you" e "give me" são pedidos prontos.' },
    { id: 4, pt: 'Me avise se precisar de ajuda.', answer: ['Let me know', 'if you', 'need help.'], extra: ['want to'], note: '"Let me know" é o bloco de avisar.' },
    { id: 5, pt: 'Eu preciso ir agora.', answer: ['I have to', 'go', 'now.'], extra: ['going to'], note: '"have to" expressa obrigação.' },
    { id: 6, pt: 'Você já comeu?', answer: ['Did you', 'eat', 'yet?'], extra: ['do you'], note: '"yet" fecha perguntas sobre algo já feito.' },
    { id: 7, pt: 'Eu não sei o que dizer.', answer: ["I don't know", 'what to', 'say.'], extra: ['how to'], note: '"what to" + verbo é um bloco útil.' },
    { id: 8, pt: 'Você poderia falar mais devagar?', answer: ['Could you', 'speak', 'a little', 'slower?'], extra: ['more slow'], note: '"a little" suaviza o pedido.' },
    { id: 9, pt: 'Estou procurando meu celular.', answer: ["I'm looking for", 'my phone.'], extra: ['looking at'], note: '"look for" = procurar.' },
    { id: 10, pt: 'Vamos nos encontrar às oito?', answer: ["Let's", 'meet', 'at eight?'], extra: ['we go'], note: '"Let\'s" convida para fazer algo junto.' },
    { id: 11, pt: 'Eu estava pensando em viajar.', answer: ['I was thinking', 'about', 'taking a trip.'], extra: ['of go'], note: '"I was thinking about" apresenta uma ideia.' },
    { id: 12, pt: 'Deixa eu ver isso.', answer: ['Let me', 'see', 'that.'], extra: ['leave me'], note: '"Let me" = deixa eu.' }
  ]
};
