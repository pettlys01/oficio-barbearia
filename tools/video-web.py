# Converte o vídeo gerado no ComfyUI pro loop do hero do site.
#
# Loop sem emenda: o último quadro gerado é bem diferente do primeiro (a câmera avançou), então
# repetir direto daria um pulo. Aqui o clipe vira ida e volta: a câmera avança e recua, com a
# velocidade seguindo um cosseno (desacelera até parar em cada ponta, como um pêndulo). Nas duas
# pontas a velocidade é zero, então nem a virada nem o recomeço do loop têm tranco visível.
# Quadros "entre" dois gerados saem da mistura dos vizinhos, por isso o movimento mais lento
# continua liso em vez de travar em quadros repetidos.
#
# Sem áudio e só MP4/H.264: o WebKit diz tocar WebM/VP9 mas trava nele, e H.264 tem
# decodificação por hardware em qualquer aparelho (menos bateria no celular).
# Duas versões de enquadramento:
#   {nome}-1344     16:9 inteiro, pra tablet e desktop
#   {nome}-retrato  fatia central 9:16 já recortada, pra celular em pé: o hero é alto e estreito,
#                   então o navegador jogaria fora ~70% da largura do 16:9 de qualquer jeito
#
# Uso: python video-web.py entrada.mp4 pasta-saida nome [segundos_por_sentido=7]
# Roda com o Python do ComfyUI (já tem PyAV com libx264, NumPy e Pillow).
import sys
import os
import math
import av
import numpy as np
from PIL import Image

src, outdir, name = sys.argv[1], sys.argv[2], sys.argv[3]
seg = float(sys.argv[4]) if len(sys.argv) > 4 else 7.0
FPS = 24
os.makedirs(outdir, exist_ok=True)

with av.open(src) as c:
    frames = [np.asarray(f.to_image(), dtype=np.float32) for f in c.decode(video=0)]
n = len(frames)
h0, w0 = frames[0].shape[:2]

# ida: m+1 quadros de 0 até n-1 com velocidade em cosseno; volta: o mesmo caminho ao contrário,
# sem repetir as pontas (senão cada ponta ficaria parada um quadro a mais)
m = round(seg * FPS)
ida = [(1 - math.cos(math.pi * k / m)) / 2 * (n - 1) for k in range(m + 1)]
tempos = ida + ida[-2:0:-1]

def quadro(t):
    i = int(math.floor(t))
    j = min(i + 1, n - 1)
    a = t - i
    px = frames[i] if a < 1e-3 else frames[i] * (1 - a) + frames[j] * a
    return Image.fromarray(np.clip(px + 0.5, 0, 255).astype(np.uint8))

X264 = {'crf': '21', 'preset': 'slow', 'movflags': '+faststart', 'profile': 'high'}
pw = round(h0 * 9 / 16 / 2) * 2
left = (w0 - pw) // 2
saidas = {
    '1344': (lambda img: img, (w0, h0)),
    'retrato': (lambda img: img.crop((left, 0, left + pw, h0)), (pw, h0)),
}

conts = {}
for tag, (prep, (w, h)) in saidas.items():
    path = os.path.join(outdir, f'{name}-{tag}.mp4')
    out = av.open(path, 'w')
    s = out.add_stream('libx264', rate=FPS)
    s.width, s.height, s.pix_fmt, s.options = w, h, 'yuv420p', X264
    conts[tag] = (out, s, prep, path)

for t in tempos:
    img = quadro(t)
    for out, s, prep, _ in conts.values():
        for p in s.encode(av.VideoFrame.from_image(prep(img))):
            out.mux(p)

for out, s, _, path in conts.values():
    for p in s.encode():
        out.mux(p)
    out.close()
    print(f'{path}: {os.path.getsize(path) // 1024} KB, {len(tempos)} quadros ({len(tempos) / FPS:.1f}s por volta)')
