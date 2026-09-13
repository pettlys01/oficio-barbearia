# Converte assets/img/src/barbeiro-N.png nos dois tamanhos que o site usa (480 e 720 de largura).
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets/img/src'
DST = ROOT / 'assets/img'

for png in sorted(SRC.glob('barbeiro-*.png')):
    im = Image.open(png).convert('RGB')
    for w in (480, 720):
        h = round(im.height * w / im.width)
        out = DST / f'{png.stem}-{w}.webp'
        im.resize((w, h), Image.LANCZOS).save(out, 'WEBP', quality=82, method=6)
        print(f'{out.name}  {w}x{h}  {out.stat().st_size // 1024} KB')
