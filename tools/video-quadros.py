# Monta uma folha de contato com N quadros de um vídeo pra revisar erros de geração
# (objetos que mudam de forma, gente aparecendo, texto surgindo) sem assistir quadro a quadro.
# Uso: python video-quadros.py entrada.mp4 saida.jpg [n=8]
# Roda com o Python do ComfyUI (já tem PyAV e Pillow).
import sys
import av
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
n = int(sys.argv[3]) if len(sys.argv) > 3 else 8

with av.open(src) as c:
    frames = [f.to_image() for f in c.decode(video=0)]
total = len(frames)
idx = [round(i * (total - 1) / (n - 1)) for i in range(n)]
w, h = frames[0].size
tw = 640
th = round(h * tw / w)
cols = 2
rows = (n + cols - 1) // cols
sheet = Image.new('RGB', (tw * cols, th * rows), 'black')
for k, i in enumerate(idx):
    sheet.paste(frames[i].resize((tw, th)), ((k % cols) * tw, (k // cols) * th))
sheet.save(dst, quality=85)
print(f'{total} quadros {w}x{h}; amostrados {idx}')
