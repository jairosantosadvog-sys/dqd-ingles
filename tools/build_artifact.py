#!/usr/bin/env python3
"""Gera dist/artifact.html: o mesmo app em um único arquivo (CSS e JS embutidos).

Uso (a partir da raiz do projeto):  python3 tools/build_artifact.py
Serve para publicar o app como página única; para uso local, basta abrir o index.html.
"""
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "css" / "style.css").read_text(encoding="utf-8")

title = re.search(r"<title>(.*?)</title>", html, re.S).group(1)
external = re.search(r"<!-- external:start.*?-->(.*?)<!-- external:end -->", html, re.S).group(1)
body = re.search(r"<body[^>]*>(.*?)</body>", html, re.S).group(1)
script_paths = re.findall(r'<script src="(js/[^"]+)"></script>', html)
body = re.sub(r'\s*<script src="js/[^"]+"></script>', "", body)
body = re.sub(r"<!--.*?-->", "", body, flags=re.S)
js = "\n".join((root / p).read_text(encoding="utf-8") for p in script_paths)

out = f"""<title>{title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
{external.strip()}
<style>
{css}
</style>
{body.strip()}
<script>
{js}
</script>
"""
dist = root / "dist"
dist.mkdir(exist_ok=True)
(dist / "artifact.html").write_text(out, encoding="utf-8")
print("ok:", dist / "artifact.html", len(out), "bytes")
