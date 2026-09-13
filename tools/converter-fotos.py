"""Converte as fotos geradas (assets/img/src/g*.png) pros quadros da tira de filme.

Mantém o nome: g03-banco.png -> assets/img/film/g03-banco-900.webp,
então o HTML não precisa mudar quando as fotos provisórias forem trocadas.
"""
import glob
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "img", "src")
OUT = os.path.join(ROOT, "assets", "img", "film")
os.makedirs(OUT, exist_ok=True)

for path in sorted(glob.glob(os.path.join(SRC, "g*.png"))):
    name = os.path.splitext(os.path.basename(path))[0]
    im = Image.open(path).convert("RGB")
    im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
    dest = os.path.join(OUT, f"{name}-900.webp")
    im.save(dest, "WEBP", quality=80, method=6)
    print(f"{name}-900.webp  {im.width}x{im.height}  {os.path.getsize(dest) / 1024:.0f} KB")
