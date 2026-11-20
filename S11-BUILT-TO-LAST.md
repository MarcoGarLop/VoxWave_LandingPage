# S11 · Built to last

Sustituye a la S11 actual, en la posición #12, después de S10. Tiene 4 pasos con `auto: [7.5, 8, 9.5]`. Referencia: `src/slides/S11.tsx` de la rama `business`.

- No pongas en pantalla ninguna etiqueta del criterio que cubre (1.3).
- Los textos van literales, tal como aparecen aquí.
- Coordenadas en el escenario de 1920×1080. Tiempos en segundos desde el inicio de cada paso (`k = t − t0`, con `t0 = clock.t`).

## Constantes de toda la diapositiva

- **Onda**: `wave({ y: 990, amp: 18, speed: 0.7 })`, toda en coral, `opacity 0.45`, `core 1.2`, `glow 0.6`, `duration 1200`, `stagger 0.3`. Es la misma que al final de S10.
- **bg**: `{ pool: [0.55, 0.6], poolStrength: 1, warm: 0.55 }`.
- **Partículas**: `size 5.2` en todos los pasos. Las que no se usan en un paso van con alfa 0 y tamaño 0.5.

| Paso | Estado de partículas |
|---|---|
| b0 | `seed: 'wave'`, `duration 2000`, `scatter 0.5` |
| b1 | `duration 1400`, `scatter 0.2` |
| b2 | `duration 1600`, `scatter 0.3` |
| b3 | `duration 1800`, `scatter 0.35` |

- **ASH**: muted aclarado un 35 % hacia paper.
- **Funciones auxiliares**:
  - `io(x)` = smoothstep(clamp(x)).
  - `hh(i)` = fract(sin(i·12.9898 + 4.1)·43758.5453). Para valores independientes: `hh(i)`, `hh(i+7919)`, `hh(i+15497)`.
  - Disco girasol: `r·√((m+.5)/count)` con ángulo `m·2.39996`.

## Titular

- **Línea 1, fija en los 4 pasos**: **"Built to last."**
  - `display` 72, color `ink-60`, `left 120`, `top 112`.
  - Entra con `Words delay 0.2` y no tiene animación de salida.
- **Línea 2, una por paso**:
  - `display` 72, color paper, `left 120`, `top 192`, sin salto de línea.
  - Entra con `Words`: retardo 0.7 en b0 y 0.4 en los demás.
  - Salida: opacidad 0 e `y −8` en 0.35 s.
  - Textos:
    - b0: **"Clinics pay, not grants."**
    - b1: **"And it saves them money."**
    - b2: **"No extra work. No waste."**
    - b3: **"Every risk has an answer."**

## Estilos de texto

Todos los bloques de texto entran con `opacity 0→1` e `y 12→0` en 0.85 s, con `EASE`. El grupo de cada paso sale con opacidad 0 en 0.45 s.

| Estilo | Definición |
|---|---|
| **kicker** | `mono` 16, `letterSpacing .18em`, coral, en mayúsculas |
| **big** | `number` 150, `lineHeight` 1 |
| **line** | `body` 32, `lineHeight` 1.3, paper |
| **small** | `body` 24, color por defecto |

---

## b0 · "Clinics pay, not grants."

### Partículas

**Bloque:**
- Usa las partículas `i < 300`.
- Rejilla de 20 columnas × 15 filas, separación 24, origen (200, 420), fila a fila.
- `c = i % 20`.

**Encendido:**
- La partícula `i` se enciende en `tᵢ = 1.4 + 3.4·i/299`.
- Progreso: `f = clamp((k − tᵢ)/0.25)`.
- Si `f ≤ 0`: color paper, alfa 0.08, tamaño 0.9.
- Si ya está encendida:
  - Color: de coral a hot según `max(1−f, flash)`.
  - Alfa 0.95.
  - Tamaño `1.5 + .35(1−f) + .3·flash`.

**Destello final**, de izquierda a derecha, al encenderse el último punto:
- `sw = k − 4.8 − 0.2 − c·0.035`
- `flash = exp(−sw²·18)`

### Texto

Columna en `x 760`.

| Elemento | `top` | Retardo (s) | Contenido |
|---|---|---|---|
| kicker | 440 | 0.9 | `For us` |
| big + unidad | debajo, `marginTop 10`, en fila con alineación de línea base y `gap 18` | 0.9 | Contador `0→300` + `patients` (`body` 34) |
| line | 660 | 1.3 | `€40 a patient a month.` |
| line, en coral | 704 | 5.1 | `At 300, VoxWave pays for itself.` |
| small | 774 | 5.8 | `Just 0.15% of patients in Spain.` |

**Contador**: con `rAF`, muestra `round(300·clamp((s − 0.5)/3.4))`, donde `s` son los segundos desde el montaje. Va sincronizado con el encendido de los puntos.

---

## b1 · "And it saves them money."

### Partículas

Usa las mismas `i < 300` del paso anterior.

**Punto:**
- Antes de `BURST = 2.6`: disco girasol de radio `26·(1 + .06·sin 3k)` centrado en (437, 606).
- Color coral con un 80 % de hot, alfa 1, tamaño 1.7.

**Estallido:**
- Progreso: `b = io((k − 2.6)/0.9)`.
- Cada partícula va del disco a su celda `i % 108` en una rejilla de 12 columnas (meses) × 9 filas (pacientes), separación 34, origen (250, 470).
- Desplazamiento aleatorio de ±1.5 px; interpolación lineal según `b`.

**Meses:**
- `lit = clamp((k − 3.5 − mes·0.13)/0.3)`.
- Al terminar el estallido: alfa `0.5 + 0.45·lit`; el color pasa de un 20 % de paper a coral.
- Tamaño 1.45.

### Texto

Columna en `x 760`.

| Elemento | `top` | Retardo (s) | Contenido |
|---|---|---|---|
| kicker | 440 | 0.6 | `For the clinic` |
| big | debajo | 0.6 | `€4,400` |
| line | 660 | 1.0 | `One avoided hospital stay.` |
| line, en coral | 704 | 3.0 | `It pays for 9 patients for a whole year.` |
| `mono` 14, `ink-60`, en (244, 414) | — | 3.3 | `9 patients × 12 months` |
| small | 774 | 5.2 | `Avoid 1 stay per 9 patients a year, and it's free.` |

**No añadir "Each clinic pays back in 6 months".** Esos 6 meses son lo que tardamos nosotros en recuperar el CAC, no lo que tarda la clínica en recuperar su gasto.

---

## b2 · "No extra work. No waste."

Separador vertical discontinuo en `x 960`, `top 430`, altura 400, con `rgba(241,237,228,.22)` en tramos de 5 px y huecos de 6 px. Entra con `scaleY 0→1` en 1 s, retardo 0.6.

### Izquierda: la pila de informes se pliega en una página

**Páginas:**
- Página final: centro (530, 610), 220×290.
- 7 páginas × 150 partículas (índices 0–1049), repartidas por el perímetro del rectángulo con `s = (i % 150)/150`.
- Abanico inicial (dx, dy, rotación) de cada página:
  `[-160,30,-.3] [-70,-40,.18] [40,50,-.12] [140,-20,.28] [-110,-70,.08] [100,20,-.22] [0,0,.03]`
- Plegado de la página j: `f = io((k − 1.1 − j·.06)/1.4)`. El desplazamiento y la rotación se multiplican por `(1−f)`.
- Color paper, alfa `.32 + .3f`, tamaño 0.85.

**Líneas de texto** (índices 1050–1209):
- 4 líneas de 40 partículas.
- Longitudes `.82 / .6 / .72 / .5` de 168 px, empezando en `x 446`.
- `y = 505 + l·26`.
- Alfa `.55·io((k − 2.6 − l·.12)/.4)`, tamaño 0.75.

**Curva** (índices 1210–1289):
- 80 partículas a lo largo de 168 px desde `x 446`.
- `y = 680 − 26·sin(5.2u)·(1 − .5u) + 20u`.
- Coral con un 20 % de hot, alfa `.95·io((k − 3.1 − .5u)/.3)`, tamaño 1.1.

### Derecha: un dispositivo pasa de paciente en paciente

**Pacientes** (índices 1290–1505):
- 6 discos girasol de 36 partículas, radio 16.
- Posición: `x = 1110 + p·112`, `y 650`.

**Cuándo llega el dispositivo** a cada paciente:
- p = 0: segundo 1.6.
- p ≥ 1: `2.4 + (p−1)·1.05 + 0.7`.

**Color de los pacientes**:
- `lit = io((k − llegada)/.4)`: de ASH a coral, alfa `.4 + .55·lit`.
- Destello hot al llegar el dispositivo: `exp(−(k − llegada − .2)²·10)`.
- Se quedan encendidos.

**Dispositivo** (índices 1506–1553):
- 8×6 partículas con separación 4.
- Aparece con `io((k − 1)/.5)`.
- Reposo en `y 606`.
- Salto h: empieza en `2.4 + h·1.05` y dura 0.7, con `f = io(...)`. La x se interpola entre pacientes y `y = 606 − 70·sin(πf)`.
- Color hot `.45 + .55·sin(πf)`, tamaño `.9 + .3·sin(πf)`: en lo alto del arco se "revisa".

### Texto

| Elemento | Centro x | `top` | Ancho | Retardo (s) | Contenido |
|---|---|---|---|---|---|
| kicker | 530 | 400 | 500 | 0.8 | `For her doctor` |
| kicker | 1390 | 400 | 600 | 1.0 | `For the planet` |
| line | 530 | 800 | 560 | 3.3 | `One page. Under 2 minutes.` |
| line | 1390 | 800 | 760 | 3.6 | `Every device is refurbished and lent again.` |

---

## b3 · "Every risk has an answer."

Nada de tabla ni cuadrícula: solo el hilo.

### Partículas

**Hilo:**
- 4.600 partículas (índices 0–4599).
- `x = 160 + ((i + hh)/4600)·1600`.
- `y = 610 + 24·sin(.011x − 1.1t)·(1 − broken) + (hh3 − .5)·5 + shake`.

**Roturas:**
- Centros en `x = 390, 770, 1150, 1530`, semiancho 80.
- Peso: `w = 1 − smoothstep(44, 80, d)`.
- Apertura: `brk = io((k − .5)/.8)`. Al empezar, el hilo se rompe a la vista.
- Curación desde el centro en `HEAL = [2.4, 4.6, 6.8, 9.0]`:
  - `hf = clamp(((k − HEAL)·170 − d)/30)`
  - `broken = w·brk·(1 − hf)`
  - `flash = hf(1 − hf)·4w`

**Mientras está roto:**
- Temblor: `shake = broken·(hh2 − .5)·70·(.65 + .35·sin(9t + i))`.
- Color de coral a ASH según `broken`, alfa `.9 − .45·broken`.
- La mitad de las partículas (`hh3 ≤ .5`) multiplica su alfa por `(1 − .85·broken)`.

**Al curarse:**
- Color hot según `flash`, alfa .95, tamaño `1 + .4·flash`.

El paso termina con el hilo entero, en coral.

### Texto

**Pregunta:**
- `display` 32, `ink-60`.
- Caja de 340×100 en `top 430`, centrada sobre la rotura y alineada abajo.
- Entra en `HEAL − 1.3`, con `y 10→0`.

**Respuesta:**
- `body` 26, paper, `pre-line`, ancho 340, `top 690`, centrada.
- Entra en `HEAL + 0.35`, con `y −8→0`.

| Centro x | Pregunta | Respuesta |
|---|---|---|
| 390 | `What if it's wrong?` | `It never diagnoses.\nHer doctor decides.` |
| 770 | `Who hears her voice?` | `Only her doctor.\nHer data stays in the EU.` |
| 1150 | `Does it work for every voice?` | `It compares her\nonly with herself.` |
| 1530 | `What if she can't use tech?` | `One button.\nNo phone, no internet.` |

---

## notes

> VoxWave is built to last. Clinics pay, not grants: forty euros a patient a month, and at three hundred patients, just 0.15% of patients in Spain, VoxWave pays for itself. And it saves clinics money: one avoided hospital stay costs about four thousand four hundred euros. That pays for nine patients for a whole year. It adds no extra work: one page, under two minutes for her doctor. And no waste: every device is refurbished and lent again. Every risk has an answer. What if it's wrong? It never diagnoses; her doctor decides. Who hears her voice? Only her doctor, and her data stays in the EU. Does it work for every voice? It compares her only with herself. And if she can't use tech: one button, no phone, no internet.
