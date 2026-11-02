#!/usr/bin/env python3
"""Gera tools/optional/audio.js: banco de áudios com voz feminina (en-US) para o app.

Frases inteiras saem em velocidade normal (é onde o Efeito Cotonete aparece); palavras soltas saem mais lentas
(para o modo "Lenta"). Tudo vira MP3 mono pequeno, embutido em base64.

Requisitos: python3, node, ffmpeg (com libmp3lame), e:  pip install "sherpa-onnx==1.12.40" numpy
(usei a 1.12.40: a 2.0.1 não montou o fonemizador espeak para este modelo)
Modelo (Piper "Amy", en_US, voz feminina):
  curl -L -o amy.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-amy-medium.tar.bz2
  tar -xjf amy.tar.bz2
Uso (da raiz do projeto):
  python3 tools/make_audio.py --model-dir /caminho/vits-piper-en_US-amy-medium
Depois de editar js/data.js, rode de novo para gerar os áudios das frases novas.
"""
import argparse
import base64
import json
import pathlib
import subprocess
import sys

import numpy as np
import sherpa_onnx

ROOT = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("--model-dir", required=True)
ap.add_argument("--speaker", type=int, default=0)
ap.add_argument("--kokoro", action="store_true",
                help="modelo Kokoro (kokoro-en-v0_19): vozes femininas en-US 0=af 1=af_bella 2=af_nicole 3=af_sarah 4=af_sky")
args = ap.parse_args()
md = pathlib.Path(args.model_dir)

items = json.loads(subprocess.check_output(["node", str(ROOT / "tools" / "export_keys.js")]))
print(f"{len(items)} áudios a gerar")

if args.kokoro:
    mcfg = sherpa_onnx.OfflineTtsModelConfig(
        kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=str(md / "model.onnx"), voices=str(md / "voices.bin"), tokens=str(md / "tokens.txt"),
            data_dir=str(md / "espeak-ng-data")),
        num_threads=2, provider="cpu", debug=False)
else:
    mcfg = sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=str(next(md.glob("*.onnx"))), tokens=str(md / "tokens.txt"), data_dir=str(md / "espeak-ng-data")),
        num_threads=2, provider="cpu", debug=False)
cfg = sherpa_onnx.OfflineTtsConfig(model=mcfg, max_num_sentences=1)
tts = sherpa_onnx.OfflineTts(cfg)


def trim(x, sr, thr=0.004, pad=0.08):
    """Corta o silêncio do começo e do fim (deixa 40 ms) e normaliza o pico."""
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * sr)); b = min(len(x), idx[-1] + int(pad * sr))
    y = x[a:b]
    return y * (0.89 / max(1e-6, float(np.max(np.abs(y)))))


def to_mp3(x, sr):
    p = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-",
                        "-c:a", "libmp3lame", "-b:a", "40k", "-ar", "22050", "-f", "mp3", "-"],
                       input=x.astype(np.float32).tobytes(), stdout=subprocess.PIPE, check=True)
    return p.stdout


bank, total = {}, 0
for it in items:
    g = tts.generate(it["text"], sid=args.speaker, speed=it["speed"])
    x = trim(np.array(g.samples, dtype=np.float32), g.sample_rate)
    mp3 = to_mp3(x, g.sample_rate)
    bank[it["id"]] = base64.b64encode(mp3).decode()
    total += len(mp3)
    print(f'{it["id"]:<48} {len(x) / g.sample_rate:4.1f}s {len(mp3) / 1024:5.1f} KB')

out = ROOT / "js" / "audio.js"  # (para desativar: tire a tag <script> de js/audio.js do index.html)
out.write_text(
    "/* GERADO por tools/make_audio.py (voz feminina en-US, gerada com sherpa-onnx). Não edite à mão. */\n"
    "window.DQD = window.DQD || {};\n"
    "DQD.audioBank = " + json.dumps(bank, separators=(",", ":")) + ";\n", encoding="utf-8")
print(f"ok: {out} ({out.stat().st_size / 1024:.0f} KB, {total / 1024:.0f} KB de áudio)")
