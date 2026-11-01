# DQD Inglês

App web (SPA) para treinar inglês falado: sequência diária, Efeito Cotonete (connected speech),
laboratório de voz e montagem de chunks. HTML + Tailwind CSS (CDN) + JavaScript puro, sem build.

## Estrutura

```
dqd-ingles/
├── index.html            # casca da SPA: cabeçalho, navegação, carrega CSS e JS
├── manifest.webmanifest   # dados do app instalável (PWA)
├── sw.js                  # service worker (offline)
├── icons/                 # ícones do app
├── css/
│   └── style.css         # tokens de cor (claro/escuro), componentes, marca-texto do cotonete
├── js/
│   ├── core.js           # helpers de DOM, ícones, progresso/streak/meta no LocalStorage
│   ├── data.js           # TODO o conteúdo (títulos, frases do laboratório, exercícios de chunks)
│   ├── tts.js            # voz do navegador (síntese de voz): lenta (palavra a palavra) e rápida (conectada), com velocidades
│   ├── cotonete.js       # módulo Efeito Cotonete
│   ├── lab.js            # módulo Laboratório de Destrava (Web Speech API)
│   ├── chunks.js         # módulo Treino por Chunks
│   └── app.js            # rotas (#hoje, #cotonete, #destrava, #chunks), tema, confete, avisos
├── tools/build_artifact.py   # opcional: junta tudo em dist/artifact.html (arquivo único)
├── tools/export_keys.js      # lista as frases/palavras que precisam de áudio (lê js/data.js)
├── tools/make_audio.py       # gera js/audio.js (voz Piper "Amy")
└── dist/artifact.html        # saída do script acima
```

## Como executar localmente

Requisito: um navegador moderno e internet (Tailwind e as fontes vêm de CDN). O console do navegador pode avisar que o CDN do Tailwind
é indicado só para desenvolvimento; para publicar de verdade, gere o CSS com a CLI do Tailwind. Se o CDN não carregar, o app continua
funcional, só perde alguns espaçamentos.

**Opção 1: abrir o arquivo.** Dê dois cliques em `index.html`. Tudo funciona, exceto que o
microfone pode pedir permissão a cada uso ou ser bloqueado (veja abaixo).

**Opção 2 (recomendada): servidor local.**

```bash
cd dqd-ingles
python3 -m http.server 8080
# abra http://localhost:8080 no Chrome ou Edge
```

Também serve `npx serve .` ou a extensão Live Server do VS Code.

## Voz feminina e velocidade

Os botões de ouvir tocam áudios **pré-gerados** com uma voz feminina em inglês americano (modelo Kokoro, voz `af_bella`, rodado
com sherpa-onnx), embutidos em `js/audio.js`. O som é o mesmo em qualquer aparelho. Frases novas que você colocar em `data.js`
não têm áudio até regerar; nesse caso o app usa a voz do aparelho (preferindo uma feminina em en-US), que depende do que está instalado.

Regerar (python3, node, ffmpeg com libmp3lame): `pip install "sherpa-onnx==1.12.40" numpy`, baixe o modelo
`kokoro-en-v0_19` (releases `tts-models` do sherpa-onnx) e rode
`python3 tools/make_audio.py --kokoro --speaker 1 --model-dir /caminho/kokoro-en-v0_19`.
(A licença que acompanha o modelo Kokoro é Apache 2.0; confira os termos das vozes antes de distribuir.)
Para desligar os áudios embutidos, tire a linha `<script src="js/audio.js">` do `index.html`.

A velocidade (x0,5, x0,75, x1, x1,25, x2, x3) é escolhida nos botões "Velocidade" e fica salva no navegador.

## Padrões de conexão

No fim do Cotonete há três padrões (Consoante + Vogal, Flap T, Redução de Verbo), definidos em `data.patterns` no `data.js`.
Cada um tem a frase original, a grafia conectada e o texto falado no modo "Conectada".

## Instalar no celular como app (PWA)

O projeto já traz `manifest.webmanifest`, `sw.js` (funciona offline depois da primeira visita) e `icons/`. Para instalar é
preciso servir a pasta em **HTTPS**; abrir o arquivo direto (`file://`) não instala.

1. Publique a pasta inteira em uma hospedagem estática gratuita (por exemplo GitHub Pages, Cloudflare Pages ou Netlify).
   Os passos exatos dessas telas mudam com o tempo; siga a documentação de cada serviço.
2. Abra o endereço no celular. **Android (Chrome):** menu ⋮ → "Instalar app". **iPhone (Safari):** Compartilhar → "Adicionar à Tela de Início".
3. Ao publicar uma versão nova, troque `CACHE = 'dqd-v1'` em `sw.js` (ex.: `dqd-v2`) para o celular baixar os arquivos atualizados.

Observações: o endereço fica público (qualquer pessoa com o link abre o app); o progresso fica só no navegador do celular;
o microfone e o reconhecimento de voz dependem do navegador (no iPhone costumam ser limitados) e precisam de internet.

## Microfone e reconhecimento de voz

- O Laboratório usa `SpeechRecognition` (Web Speech API). Acredito que funcione melhor no Chrome e no Edge;
  Firefox não costuma oferecer essa API e o Safari tem suporte parcial. Verifique no seu navegador.
- Acredito que o Chrome envie o áudio a um serviço online para transcrever, então é preciso internet.
- Use `localhost` ou `https`. Em `file://` o navegador tende a se comportar de forma menos previsível.
- Sem microfone (bloqueado, sem permissão ou navegador sem a API), abra "Sem microfone? Digite o que você falou":
  o app compara o texto digitado com a frase-alvo do mesmo jeito.

## Como o progresso funciona

- Uma **frase** conta quando você: marca "Treinei esta frase" (Cotonete), fala uma frase com pelo menos 70% de
  acerto (Destrava) ou acerta um exercício de chunks. Cada frase conta **uma vez por dia**.
- A **meta diária** (3, 5, 8 ou 10, padrão 5) mostra a barra do dia no cabeçalho e na tela Hoje.
- A **sequência (streak)** sobe 1 no primeiro momento do dia em que a meta é batida. Se você pular um dia, volta a 0.
- Dados ficam no `localStorage`, chave `dqd.v1`, só neste navegador. Para zerar:
  `localStorage.removeItem('dqd.v1')` no console.

## Personalizar o conteúdo

Tudo está em `js/data.js`. Nos títulos do Cotonete, `[colchetes]` marcam as palavras que se conectam
(`'[Let it] Go'`) e a mesma marcação vale na grafia aproximada (`'[Lé-rit] Gô'`). Para adicionar uma frase ao
Laboratório ou um exercício de chunks, copie um item existente e troque os textos.

## Nota sobre o conteúdo

Os cards usam apenas **títulos** de músicas, filmes e séries, e frases curtas escritas para este app.
Não há trechos de letras nem falas. As grafias ("Lé-rit") são aproximações para brasileiros, não IPA.
O app segue a ideia geral de connected speech e do Efeito Cotonete; não reproduz material oficial do método DQD.
