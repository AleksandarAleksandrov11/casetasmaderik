# Créditos de texturas 3D

Texturas PBR con licencia CC0 (dominio público) de [ambientCG](https://ambientcg.com/), creadas por Lennart Demes. No requieren atribución; se deja constancia igualmente. Licencia: https://docs.ambientcg.com/license/

Peso total de las seis texturas: 496.580 bytes (485 KB), por debajo del límite de 600 KB del brief (6.4).

## Pino: tablones horizontales

- Asset: **Wood 052** (veta de madera lisa, sin juntas de tablón, tileable).
- Fuente: https://ambientcg.com/a/Wood052 (paquete `Wood052_1K-JPG.zip`).
- Autor: ambientCG (Lennart Demes). Licencia: CC0.
- Tamaño real que cubre una repetición según ambientCG: 80 x 80 cm.
- La veta corre en horizontal (eje U), adecuada para tablas horizontales. Al no tener juntas, cada tabla se puede mapear por separado sin costuras visibles.

| archivo | mapa | resolución | peso | notas |
|---|---|---|---|---|
| `pino-color.webp` | color (albedo) | 1024 x 1024 | 76.328 bytes (75 KB) | WebP calidad 80, sRGB |
| `pino-normal.webp` | normal, convención OpenGL (Y+) | 1024 x 1024 | 80.008 bytes (78 KB) | WebP calidad 90, desde `NormalGL` |
| `pino-roughness.webp` | roughness | 512 x 512 | 17.706 bytes (17 KB) | WebP calidad 80 |

Color medio de la textura: `#D47E4C`. Color base sugerido para teñir: `#FFFFFF` si se usa el mapa tal cual (ya es miel anaranjado), o `#E9C9A4` como multiplicador para un pino tintado algo más oscuro y menos saturado. Para el modo sin texturas (`quality="low"`), color plano sugerido: `#C8844A`.

## Cubierta: tejado de tejas asfálticas oscuras

- Asset: **Roofing Tiles 003** (tejas rectangulares planas en hilera escalonada, aspecto de teja asfáltica o pizarra, tono carbón).
- Fuente: https://ambientcg.com/a/RoofingTiles003 (paquete `RoofingTiles003_1K-JPG.zip`).
- Autor: ambientCG (Lennart Demes). Licencia: CC0.

| archivo | mapa | resolución | peso | notas |
|---|---|---|---|---|
| `cubierta-color.webp` | color (albedo) | 1024 x 1024 | 95.704 bytes (93 KB) | WebP calidad 80, sRGB |
| `cubierta-normal.webp` | normal, convención OpenGL (Y+) | 1024 x 1024 | 169.334 bytes (165 KB) | WebP calidad 88, desde `NormalGL` |
| `cubierta-roughness.webp` | roughness | 512 x 512 | 57.500 bytes (56 KB) | WebP calidad 80 |

Color medio de la textura: `#343634`. Color base sugerido para teñir: `#FFFFFF` con el mapa tal cual, o `#2E3033` como color plano carbón para el modo sin texturas.

## Uso en three.js

- `pino-color.webp` y `cubierta-color.webp`: `texture.colorSpace = THREE.SRGBColorSpace`.
- Normales y roughness: dejar `THREE.NoColorSpace` (datos lineales).
- Las normales están en convención OpenGL, la que espera three.js por defecto (`normalScale` positivo).
- Todas las texturas son tileables: `wrapS = wrapT = THREE.RepeatWrapping`.

## Alternativas revisadas y descartadas

- Poly Haven `coated_pine_02` (pino barnizado con nudos, CC0): muy realista y del tono adecuado, pero incluye varias tablas con juntas en cada repetición, lo que choca con mapear la textura tabla a tabla.
- Poly Haven `bitumen` (lámina asfáltica lisa, CC0): encaja con "lámina asfáltica" del brief, pero las fotos de referencia muestran tejas asfálticas, así que se eligió Roofing Tiles 003. Si se prefiere la lámina lisa, está en https://polyhaven.com/a/bitumen.
- Poly Haven `roof_slates_03` y `grey_roof_01`: pizarra y tejas grises demasiado claras o con escamas pequeñas.
