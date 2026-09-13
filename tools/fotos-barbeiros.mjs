#!/usr/bin/env node
// Retratos dos três barbeiros no ComfyUI local — com cara de brasileiro de São Paulo.
//
// Uso (com o ComfyUI aberto):  node tools/fotos-barbeiros.mjs [b1 b2 b3]
// Depois: python tools/converter-barbeiros.py
//
// Mesmas regras de tools/fotos-salao.mjs, mais duas:
// · retrato do peito pra cima, braços fora do quadro (mão é o ponto fraco do modelo);
// · descrever pele, cabelo e barba concretamente — "Brazilian" sozinho não segura o
//   fenótipo, e a primeira leva saiu com cara de indiano.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMFY_GEN = 'C:/Users/Lucas/Documents/comfy-gen/comfy-gen.mjs';
const OUT = join(ROOT, 'assets/img/src');
const CENA = 'He stands in front of an exposed red brick wall, softly out of focus. The photo is framed from the chest up and his arms are out of the frame. Soft warm window light from the left, shot on an 85mm lens at f/2.8. Warm muted analog film color, fine natural grain. A natural, unposed working portrait.';

const RETRATOS = [
  ['barbeiro-1', `A portrait photograph of Wagner, a Brazilian barber from São Paulo in his mid fifties, of Italian and Portuguese descent, with fair sun-tanned skin, short grey hair combed back, a thick grey mustache and light white stubble, deep smile lines around his eyes. He wears a plain white t-shirt under a worn dark grey canvas apron with no lettering, and looks at the camera with a calm, friendly half smile. ${CENA}`],
  ['barbeiro-2', `A portrait photograph of Diego, a Black Brazilian barber from São Paulo in his mid thirties, with deep brown skin, short black hair with a clean low fade, and a full, sharply lined black beard. He wears a plain black t-shirt under a black canvas apron with no lettering, and looks at the camera with a relaxed, confident expression. ${CENA}`],
  ['barbeiro-3', `A portrait photograph of Thiago, a mixed-race Brazilian barber from São Paulo in his late twenties, with light brown skin, short dark brown curly hair cut close on the sides, and a thin short beard. He wears a plain olive green t-shirt under a black canvas apron with no lettering, and looks at the camera with an easy, open smile. ${CENA}`],
  ['barbeiro-4', `A portrait photograph of Marcos, a Japanese-Brazilian barber from São Paulo in his early forties, with light olive skin, straight black hair with a few grey strands worn slightly long and swept back, and a short neat black goatee. He wears a plain charcoal grey t-shirt under a brown leather apron with no lettering, and looks at the camera with a quiet, attentive expression. ${CENA}`],
];

const pedidas = process.argv.slice(2).map((p) => p.replace(/^b/, 'barbeiro-'));
const fila = pedidas.length ? RETRATOS.filter(([nome]) => pedidas.includes(nome)) : RETRATOS;

for (const [nome, prompt] of fila) {
  console.error(`→ ${nome}`);
  const r = spawnSync('node', [COMFY_GEN, '--width', '896', '--height', '1152', '--out', join(OUT, `${nome}.png`), '--prompt', prompt], { stdio: ['ignore', 'inherit', 'inherit'] });
  if (r.status !== 0) { console.error(`falhou em ${nome} — o ComfyUI está aberto?`); process.exit(r.status || 1); }
}
