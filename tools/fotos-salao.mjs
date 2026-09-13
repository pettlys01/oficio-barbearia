#!/usr/bin/env node
// Gera as fotos de detalhe do salão (tira de filme + cópia impressa) no ComfyUI local.
//
// Uso (com o ComfyUI aberto):
//   node tools/fotos-salao.mjs            gera todas
//   node tools/fotos-salao.mjs g03 g08    gera só essas
// Depois: python tools/converter-fotos.py
//
// Regras de prompt que valem pra esse modelo (Z-Image-Turbo, text encoder Qwen3):
// · frase natural de 60-100 palavras, nunca lista de tags estilo Midjourney;
// · prompt negativo é ignorado (cfg 1) — restrição vira afirmação ("the space is empty");
// · nomear fonte, direção e qualidade da luz: é o que mais muda o resultado;
// · nada de nome de marca ("Kodak Portra" virou placa na porta) — descrever a cor;
// · rótulos e aventais "plain, with no lettering" (texto sai deformado);
// · sem pessoas e sem mãos no quadro; espelho só como fundo, nunca assunto.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMFY_GEN = 'C:/Users/Lucas/Documents/comfy-gen/comfy-gen.mjs';
const OUT = join(ROOT, 'assets/img/src');
const LOOK = 'Warm muted analog film color, fine natural grain.';

const FOTOS = [
  ['g01-toalha', `A close-up photograph of three white cotton towels, neatly folded and stacked, resting on a dark walnut counter in a traditional barbershop. The towels are dry and still, the air around them perfectly clear. Shot on a 50mm lens at f/2.8 with shallow depth of field, an exposed red brick wall softly blurred in the background. Warm tungsten light from the left brings out the soft texture of the cotton. ${LOOK} Calm and quiet.`],
  ['g02-ferramentas', `A top-down still life photograph of a pair of black hair clippers with a plain unmarked matte body, a black fine-tooth comb and a pair of steel barber scissors arranged neatly side by side on a worn cognac leather surface. Shot on a 50mm lens at f/4, everything in sharp focus. Soft warm window light from the upper right creates gentle highlights on the steel and a subtle shadow under each tool. ${LOOK} Simple and orderly.`],
  ['g03-capa', `A close-up still life photograph of a tall clear glass jar filled with blue disinfectant liquid, with four black combs standing straight up inside it side by side, on a worn dark walnut counter. Nothing else is on the counter. The glass has no label or lettering. Behind it, an exposed red brick wall falls softly out of focus. Shot on a 50mm lens at f/2.8, shallow depth of field. Warm tungsten light from the left makes the blue liquid glow gently and catches the edges of the glass. ${LOOK} Quiet and simple.`],
  ['g04-lavatorio', `A photograph of a black ceramic shampoo basin with a brass tap mounted in front of an exposed red brick wall, a folded white towel resting on its edge, inside a small traditional barbershop. Shot on a 50mm lens at f/2.8, shallow depth of field. Warm amber light from a brass wall sconce above creates soft highlights on the glazed ceramic. There is no mirror; the wall above the basin is plain brick. The room is empty and still. ${LOOK}`],
  ['g05-avental', `A photograph of a black canvas barber apron and a grey felt hat hanging on two old brass hooks mounted on an exposed red brick wall. Shot on a 50mm lens at f/2.8. Warm side light from the right rakes across the brick, revealing its rough texture and casting soft shadows behind the fabric. The apron is plain with no lettering or logo. ${LOOK} Quiet and simple.`],
  ['g06-couro-luz', `A close-up photograph of the cracked cognac leather headrest of an antique barber chair, crossed by narrow streaks of late afternoon sunlight coming through a window blind. Shot on an 85mm lens at f/2, very shallow depth of field, the dark room falling out of focus behind. The warm light reveals every crease and scratch in the old leather. ${LOOK} Intimate and still.`],
  ['g07-poste', `A close-up photograph of a classic barber pole with red, white and blue diagonal stripes inside a glass cylinder capped with polished brass, mounted on a dark painted wooden facade at dusk. The stripes wind evenly around the cylinder and the glass is clean with only a soft vertical highlight. Shot on an 85mm lens at f/2, the street behind it dissolving into soft warm bokeh with no signs or lettering. The pole glows softly from within. ${LOOK} Calm evening mood.`],
  ['g08-chao', `A photograph of a wooden push broom leaning against the round chrome base of a barber chair on worn wooden floorboards, with a thin loose scattering of very short, fine dark hair trimmings spread lightly across the floor like dust. Shot on a 35mm lens at f/4 from a low angle. Soft warm daylight from a nearby window grazes the floor and highlights the grain of the wood. ${LOOK} An honest end of day moment.`],
  ['g09-assentador', `A photograph of a long brown leather sharpening strop hanging straight down from a single brass hook on an exposed red brick wall, and a small wooden shelf below it holding a badger hair shaving brush standing upright beside a white ceramic shaving mug. Every object rests firmly on the shelf. Shot on a 50mm lens at f/2.8, shallow depth of field, an exposed red brick wall softly blurred behind. Warm tungsten light from the upper left brings out the patina of the leather and the polished steel. ${LOOK}`],
  ['g10-salao-manha', `A side view photograph of a small traditional barbershop: three antique barber chairs with brown leather seats standing in a row in front of a solid exposed red brick wall, with a long wooden shelf and brass pendant lamps above them. Soft cool morning daylight comes from a window outside the frame on the left and falls across the chairs and the concrete floor. The brick wall is solid and bare, with no mirrors, no windows and no pictures. Shot on a 35mm lens at f/4, straight vertical lines. The shop is empty and quiet before opening. ${LOOK}`],
];

const pedidas = process.argv.slice(2);
const fila = pedidas.length ? FOTOS.filter(([nome]) => pedidas.some((p) => nome.startsWith(p))) : FOTOS;

for (const [nome, prompt] of fila) {
  console.error(`→ ${nome}`);
  const r = spawnSync('node', [COMFY_GEN, '--width', '1216', '--height', '832', '--out', join(OUT, `${nome}.png`), '--prompt', prompt], { stdio: ['ignore', 'inherit', 'inherit'] });
  if (r.status !== 0) { console.error(`falhou em ${nome} — o ComfyUI está aberto?`); process.exit(r.status || 1); }
}
