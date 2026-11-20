# VoxWave · Pitch final y landing (Creative Shock 2026)

**Documento definitivo** para construir la presentación del pitch final como una **landing page** que se proyecta como un PowerPoint: diapositivas a pantalla completa, muy visuales, con planos y transiciones generados con **Kling**. Es autosuficiente: quien lo lea en otro workspace (personas o agentes de IA) no necesita nada más para construirla.

**Idioma:** el pitch es en **inglés**. La explicación de este documento está en español; el texto en pantalla, lo que se dice y los prompts de Kling, en inglés.

### Cómo usar este documento

| Parte | Secciones | Para qué |
|---|---|---|
| **Contexto** | Esta cabecera y la sección 0 | Qué es VoxWave, quién lo presenta, cómo se puntúa y el hilo del relato |
| **A · Cómo construir la landing** | Sección 1 | Concepto, sistema visual, mecánica de diapositivas, producción con Kling, mapa de las 20 diapositivas, arquitectura técnica y criterios de aceptación |
| **B · Contenido** | Secciones 2–10 | Para cada momento del pitch: cifras con fuente, texto en pantalla y guion |
| **C · Preguntas, tareas y fuentes** | Secciones 11–13 | Diapositivas de reserva, lista de tareas y bibliografía |

**Reglas para quien construya la landing:**

1. **No inventar datos.** Solo se usan las cifras de este documento, con su etiqueta. Si falta algo, se deja un marcador visible.
2. **Los [PENDIENTE] se quedan como marcador visible** (por ejemplo `[N] people`), para rellenarlos el domingo.
3. **Todo el texto lo pone el código, nunca Kling.** La IA de vídeo deforma las letras.
4. **La landing tiene que funcionar sin internet** y con un mando de presentar.

### Contexto del proyecto

- **VoxWave:** una plataforma de seguimiento de pacientes con Parkinson a través de **biomarcadores de voz**.
  - **La sesión:** cada día, 3 minutos de voz: sostener una "aah", leer una frase y charlar un poco.
  - **Dónde:** desde el móvil, o desde un **dispositivo de un botón** que funciona sin internet.
  - **Cómo analiza:** compara a cada paciente consigo mismo, con su línea base, y avisa al neurólogo cuando la voz se desvía de forma sostenida.
  - **Lema:** *"We measure; doctors decide."*
- **El evento:** la final de **Creative Shock 2026**, en Vilna (Lituania): 8 minutos de pitch y 8 de preguntas, puntuados con la rúbrica de la sección 0.
- **El equipo, FdiProtocol:**
  - **Martin:** IA y voz.
  - **Marco:** producto y finanzas.
  - **Victor:** marketing y estrategia de mercado.
  - **Javier:** hardware.
- **Lo que ya existe:**
  - **El vídeo del pitch,** hecho en Remotion. Su línea visual es la referencia: una onda coral sobre papel o azul marino.
  - **La plataforma del MVP,** con dos vistas: `/patient` y `/clinic`. Está descrita en `VOXWAVE-MVP.md` y desplegada.
  - **El dispositivo físico:** una caja blanca impresa en 3D, con una Raspberry Pi, un botón coral, una pantalla OLED y un micrófono. Graba la sesión y se sincroniza por USB.
- **La marca:**

  | Token | Color | Uso |
  |---|---|---|
  | `navy` | `#092634` | Fondo principal y sombras |
  | `abyss` | `#04141C` | Fondo más profundo, viñetas |
  | `teal` | `#004E72` | Secundario: rejillas, franjas, datos de apoyo |
  | `coral` | `#FF6E42` | **El acento:** la onda, las alertas, las cifras clave. Nunca en bloques grandes |
  | `paper` | `#F1EDE4` | Texto y luces (blanco roto, nunca blanco puro) |
  | `muted` | `#5E7480` | La onda cuando "nadie escucha", datos secundarios |

  Tipografías: **Sora** (titulares y cifras), **Inter** (texto) y **JetBrains Mono** (etiquetas y criterios). El logo es `Logo.svg`, en la carpeta `Recursos/` del repositorio del vídeo: hay que copiarlo al proyecto nuevo.
- **El tono:** médico y serio, pero cálido; nada de estética de anuncio. Un toque de *storytelling* sutil con María.

**Qué cambió en esta versión, tras la sesión con los mentores:**

1. **Nuevo mercado.** Ya no empezamos por Lituania y los Bálticos, sino por **España**, y el mercado se mide en **hispanohablantes** (TAM mundo → SAM comunidad hispanohablante → SOM España).
2. **Relato sutil con María**, una paciente que aparece en cuatro momentos del pitch, con una frase cada vez.
3. **El cierre** vuelve a la escala del mercado y termina con lo más fuerte: **el mismo sistema sirve para otras enfermedades neurológicas, empezando por el ictus.**

**Etiquetas de cada dato:**

| Etiqueta | Significa | En el pitch |
|---|---|---|
| **[V]** | Verificado, con fuente (al final del documento) | Se puede decir tal cual |
| **[C]** | Cálculo nuestro a partir de datos [V] o [S] | Se dice como "≈" |
| **[S]** | Supuesto de trabajo | Se dice como "we estimate" |
| **[H]** | Hipótesis que el piloto tiene que medir | Se dice como "we expect / we will measure" |
| **[PENDIENTE]** | Hay que rellenarlo este fin de semana | No se presenta hasta tenerlo |

---

## 0. La idea en una frase y lo que dice la rúbrica

> **Parkinson's speaks long before it is diagnosed, and keeps speaking between visits. VoxWave makes sure someone is listening.**

**Lo que manda en la nota:**

- **El 70 % de la nota es impacto (35) y negocio (35).** La solución vale 10 y la presentación otros 10.
- **El tiempo se reparte en proporción a los puntos,** salvo la demo y el algoritmo. Esos dos se pasan algo de su peso porque también puntúan en creatividad (5.2) y en el avance del fin de semana (4.1).
- **Cada sección nombra en voz alta su criterio.** Una etiqueta pequeña en pantalla ayuda: `IMPACT · HOW WE MEASURE IT`. El jurado tiene la tabla delante; hay que ponérselo fácil.

### Reparto de los 8 minutos

| # | Tiempo | Sección | Criterios (puntos) | Habla |
|---|---|---|---|---|
| 1 | 0:00–1:15 | **María y la magnitud del problema** | 1.1 (10), 5.2 | Victor |
| 2 | 1:15–2:00 | **La solución y su respaldo científico** | 3.2 (5), 1.1 | Martin |
| 3 | 2:00–2:45 | **Demo en directo** | 3.1 (5), 4.1, 5.2 | Javier (habla) + Martin (pantalla) |
| 4 | 2:45–3:15 | **El algoritmo** | 3.1, 3.2 | Martin |
| 5 | 3:15–4:30 | **Impacto esperado y cómo lo medimos** | 1.2 (15) | Martin |
| 6 | 4:30–5:10 | **Sostenibilidad y efectos negativos** | 1.3 (10) | Victor |
| 7 | 5:10–6:50 | **Negocio:** clientes, ingresos, costes, salida al mercado y crecimiento | 2.1–2.5 (35) | Marco |
| 8 | 6:50–7:25 | **Qué hemos mejorado y qué hemos aprendido** | 4.1 + 4.2 (10) | Javier |
| 9 | 7:25–8:00 | **Cierre:** quién es María, la escala del mercado y el ictus | 2.5, 5.1, 5.2 | Victor |

**Cómo ensayarlo:**

- **Ensayad para 7:30.** En directo siempre se alarga, y pasarse de tiempo resta en 5.1.
- **Calculad unas 140 palabras por minuto.** Los guiones de abajo están escritos con esa medida.
- **El reparto de voces es una propuesta.** Lo importante es que cada persona hable de lo que luego defenderá en las preguntas.

### María: el hilo del relato

El relato es **sutil**: María aparece solo en **cuatro momentos**, con una o dos frases cada vez, y nunca ocupa tiempo propio.

| Momento | Sección | Qué pasa con María |
|---|---|---|
| 1 | Apertura | *"Meet María."* Tiene Parkinson y su última visita al neurólogo fue hace seis meses |
| 2 | Demo | El dispositivo de la demo es el suyo |
| 3 | Impacto | Día 9: su voz se aparta de su línea base y su neurólogo lo ve ese mismo día |
| 4 | Cierre | *"María isn't one person."* Representa a 200.000 personas en España, a millones de hispanohablantes y a 12 millones en el mundo |

**Por qué funciona sin un paciente real:** el cierre revela que María representa a muchas personas. Es honesto sin pedir disculpas, y es el momento más fuerte del pitch. Si os preguntan, María es un perfil compuesto, construido con lo que nos han contado la asociación y los neurólogos.

---

## 1. Parte A · Cómo construir la landing

### 1.1 El concepto: un PowerPoint que parece una película

- **Funciona como un PowerPoint:** 20 diapositivas a pantalla completa (16:9), que se pasan con el mando o con las flechas. Dentro de una diapositiva, cada pulsación puede revelar el siguiente elemento, como las animaciones de PowerPoint.
- **Se ve como una película:** cada diapositiva tiene de fondo un **plano cinematográfico de Kling** que se mueve en bucle. Al pasar a la siguiente, en vez de un corte, **una transición de Kling lleva la cámara de un plano al otro.** Los 8 minutos se sienten como un solo plano continuo.
- **El hilo es una onda coral: la voz de María.** Aparece en todos los planos más o menos a la misma altura (el tercio inferior), así las transiciones encajan. Puede ser un reflejo en una ventana, una línea de luz en un pasillo o un anillo sobre el agua. Encima, el código dibuja una onda fina que nunca desaparece.
- **Mucha imagen y poco texto.** Un mensaje por diapositiva, cifras grandes y gráficos dibujados como líneas coral. El texto largo está en el guion de quien habla (sección B), no en pantalla.

### 1.2 Las tres capas de cada diapositiva

| Capa | Qué es | Quién la hace |
|---|---|---|
| **1 · Fondo** | El plano de Kling: una imagen fija, su bucle en movimiento y la transición a la siguiente | Kling (ver 1.4) |
| **2 · Contenido** | Titulares, cifras que suben, tarjetas, gráficos en línea coral, fórmulas, la onda en directo de la demo | Código (React + SVG o canvas) |
| **3 · Marco** | La onda fina que cruza todas las diapositivas, la etiqueta del criterio, el número de diapositiva y el cronómetro | Código |

**Cómo se compone cada diapositiva** (pensada a 1920 × 1080):

- **El texto va en el 40 % izquierdo.** Los planos de Kling dejan ese espacio libre, oscuro y poco detallado.
- **La onda va en el tercio inferior,** a ≈ 65 % de la altura.
- **Titulares en Sora 800, de 64 a 120 px; cifras en Sora, de 140 a 220 px; texto en Inter, mínimo 28 px.** Se proyecta en una sala: si no se lee desde el fondo, sobra.
- **Etiqueta del criterio arriba a la izquierda,** en JetBrains Mono coral: por ejemplo, `IMPACT · HOW WE MEASURE IT · 1.2`. Así el jurado marca la casilla.
- **Un degradado navy, de izquierda a derecha,** sobre el vídeo, para que el texto siempre se lea.

**Cómo se mueve el contenido:**

- **Movimientos lentos y suaves:** 400–800 ms, con curva de salida suave.
- **Los titulares aparecen palabra a palabra,** con una máscara de abajo arriba.
- **Las cifras cuentan hasta su valor.**
- **Los gráficos se dibujan como una línea coral que avanza** (`stroke-dashoffset`).
- **Nada rebota ni gira.**

### 1.3 La mecánica de diapositivas

**Cómo se reproduce el fondo:**

1. **Al llegar a una diapositiva,** se ve su imagen fija y arranca su **bucle** (vídeo en silencio, en bucle).
2. **Al pulsar "siguiente":**
   - si quedan elementos por revelar en la diapositiva, aparece el siguiente;
   - si no, el contenido sale (300 ms), **se reproduce la transición** de Kling y, al terminar, arranca el bucle de la siguiente y entra su contenido.
3. **Al ir hacia atrás o saltar a una diapositiva concreta,** fundido cruzado de 600 ms, sin transición.
4. **Si falta un archivo,** se baja de nivel sin romperse:
   - **sin transición:** fundido cruzado;
   - **sin bucle:** la imagen fija con un zoom muy lento (efecto Ken Burns);
   - **sin imagen:** un degradado navy con la onda.

   Así la landing se puede construir y ensayar **antes** de tener los vídeos.
5. **Precarga** de la imagen fija, el bucle y la transición de las dos siguientes diapositivas. **Nunca un fotograma negro:** cada vídeo se monta encima del anterior y solo se quita el de abajo cuando el de arriba ya se está reproduciendo.

**Controles:**

| Tecla | Acción |
|---|---|
| `→` `Espacio` `AvPág` `↓` | Siguiente elemento o diapositiva (los mandos de presentar envían AvPág/RePág) |
| `←` `RePág` `↑` | Anterior |
| `Inicio` / `Fin` | Primera / última diapositiva |
| `1`–`9` y `0` | Saltar a las diapositivas 1–10 (con `Mayús`, a las 11–20) |
| `A` | Mostrar u ocultar las diapositivas de reserva |
| `T` | Cronómetro: arranca al salir de la primera diapositiva y se pone en coral pasados los 7:30 |
| `F` | Pantalla completa |
| `B` | Pantalla en negro, para cuando el jurado tiene que mirar a quien habla |
| `D` | En la diapositiva de la demo, reproducir el vídeo de reserva |
| `M` | Activar el micrófono para la onda en directo |

**Opcional, si da tiempo: la vista de presentador.** En `/presenter`, en el portátil, se ve el guion "Se dice" de la diapositiva actual, la miniatura de la siguiente y el cronómetro. Se sincroniza con la ventana proyectada mediante `BroadcastChannel`.

**La demo.** La plataforma del MVP se abre **en otra ventana de Chrome**: importa del USB con la File System Access API, que no funciona bien dentro de un iframe de otro dominio. La diapositiva S07 muestra el titular y la onda del micrófono en directo. Quien presenta cambia de ventana (`Alt+Tab`) y vuelve al terminar. `D` reproduce el vídeo de reserva de la demo si algo falla.

### 1.4 La producción con Kling

**El proceso, en cinco pasos:**

1. **La hoja de personaje de María.** Se genera primero una imagen de referencia (ver abajo) y se usa en todos los planos donde aparece, con la función de referencia de imagen o personaje de Kling. Siempre es la misma mujer.
2. **Las imágenes fijas.** Una por diapositiva, generadas con la herramienta de imagen de Kling (o cualquier generador de imágenes), **con el mismo bloque de estilo**. Se generan 3–4 variantes y se elige una. Son el primer fotograma de todo lo demás.
3. **Los bucles.** Kling, de imagen a vídeo, **con la misma imagen como primer y último fotograma** (*start frame* = *end frame*): así el bucle no salta. 5 s, movimiento mínimo y cámara casi quieta.
4. **Las transiciones.** Kling con **primer fotograma = imagen fija de la diapositiva N y último fotograma = imagen fija de la N+1**. El prompt describe el movimiento de cámara que las une. 5 s; en la landing se pueden acelerar a 1,5×.
5. **El montaje.** Se recodifica cada vídeo (comando en 1.6), se le pone su nombre y se deja en la carpeta del proyecto.

**El bloque de estilo, que se añade al final de todos los prompts:**

```
STYLE: cinematic still, 16:9, deep navy (#092634) and near-black shadows, warm off-white highlights (#F1EDE4),
a single accent of coral-orange light (#FF6E42), one thin glowing coral wave of light crossing the frame
horizontally at about 65% of the height, soft volumetric haze, shallow depth of field, subtle 35mm film grain,
calm and minimal composition, dark empty negative space on the left 40% of the frame, medical and humane,
no text, no letters, no logos, no watermark
```

**El prompt negativo, en todos:**

```
text, letters, subtitles, logo, watermark, brand names, distorted hands, extra fingers, deformed face,
bright white background, saturated colors, neon, cartoon, 3D render look, busy composition, fast camera movement
```

**La hoja de personaje de María:**

```
Character reference sheet: María, a 68-year-old Spanish woman from Madrid, short silver-grey hair, warm olive skin,
kind tired eyes, wearing a soft navy cardigan over a cream blouse, simple gold earrings. Natural, real, not glamorous.
Three views: from behind, three-quarter side profile, soft-focus front. Neutral warm interior light. + STYLE
```

**Cómo se enseña a María:** de espaldas, de perfil o desenfocada, nunca en un primer plano frontal que parezca un anuncio. Es un perfil compuesto: no se presenta como una paciente real.

**El dispositivo:** para S05, **mejor una foto real del dispositivo** en una mesa de cocina, como imagen de partida de Kling. Es más honesto y además demuestra que existe.

**Especificaciones de los archivos:**

- **Formato:** 1080p, 16:9, sin audio.
- **Bucles:** 5 s, con el primer fotograma igual al último.
- **Transiciones:** 5 s.
- **Nombres:**
  - imágenes fijas: `media/plates/S01.jpg`
  - bucles: `media/loops/S01.mp4`
  - transiciones: `media/transitions/S01-S02.mp4`

**Consejos para Kling:**

- Un solo movimiento de cámara por clip, lento: *slow push-in*, *slow dolly*, *static camera*.
- Nada de texto en el prompt: lo pondría en la imagen, deformado.
- Generad 2–3 variantes de cada vídeo y quedaos con la más tranquila.
- Si una transición no sale bien en dos intentos, dejad el fundido cruzado: la landing ya funciona sin ella.

**Prioridades si no da tiempo** (aproximadamente 20 imágenes + 20 bucles + 19 transiciones, con variantes ≈ 100 generaciones):

| Prioridad | Qué | Diapositivas |
|---|---|---|
| **P1** | Las 20 imágenes fijas: con ellas ya se puede presentar | Todas |
| **P2** | Bucles de los planos más emotivos | S01, S02, S04, S05, S09, S11, S16 y S18 |
| **P3** | Transiciones de la columna del relato | S01→S02, S03→S04, S04→S05, S08→S09, S17→S18 y S18→S19 |
| **P4** | El resto de bucles y transiciones | — |

### 1.5 Mapa de las 20 diapositivas

`+ STYLE` significa añadir el bloque de estilo de 1.4. "Contenido" es lo que pinta el código encima; el texto exacto está en la sección B que se indica.

| ID | Tiempo | Sección B | Habla | Plano de fondo (Kling) | Contenido (código) | Elementos que se revelan |
|---|---|---|---|---|---|---|
| **S01** | 0:00–0:15 | 2 · María | Victor | María de espaldas junto a la ventana, por la mañana | `Meet María · 68 · Madrid` → `Last neurology visit: 6 months ago` | 2 |
| **S02** | 0:15–0:40 | 2 · Problema | Victor | La Tierra de noche desde la órbita | Cifras que suben: `Spain 200,000+` → `World 11.8M → 25.2M by 2050` → `€28.8B a year in Europe` | 3 |
| **S03** | 0:40–0:50 | 2 · Problema | Victor | Primerísimo plano de una línea de luz que vibra | `Nearly 9 in 10 lose part of their voice` | 1 |
| **S04** | 0:50–1:15 | 2 · Problema | Victor | Pasillo de hospital de noche, dos puertas lejanas | Diagrama `VISIT · · · NEXT VISIT`, `111 days`, `THE MONITORING GAP` → *"It's a lack of information between visits."* | 3 |
| **S05** | 1:15–1:35 | 3 · Solución | Martin | El dispositivo en la mesa de la cocina de María | `Three minutes a day` + los 3 pasos (aah · read · chat) + `We measure. Doctors decide.` | 3 |
| **S06** | 1:35–2:00 | 3 · Ciencia | Martin | Hojas de estudios translúcidas flotando | 4–5 tarjetas de estudios + la línea de socios | 2 |
| **S07** | 2:00–2:45 | 4 · Demo | Javier + Martin | Estudio navy vacío, una línea coral | `LIVE DEMO · María's device` + onda del micrófono en directo. Cambio a la ventana de la plataforma | 1 |
| **S08** | 2:45–3:15 | 5 · Algoritmo | Martin | Una onda que se descompone en capas | Los 4 pasos del proceso + 4–6 fórmulas en KaTeX que se escriben solas | 2 |
| **S09** | 3:15–3:45 | 6 · Impacto | Martin | María otra vez, más tarde, luz cálida | `Day 9` + gráfico de su tendencia con la franja de la línea base, la alerta el día 9 y la siguiente visita el día 120 | 2 |
| **S10** | 3:45–4:30 | 6 · Impacto | Martin | Escenario abstracto: suelo de rejilla y horizonte coral | `≈60–125× more data` → tabla de indicadores (5 filas clave) → el piloto en Madrid | 3 |
| **S11** | 4:30–5:10 | 7 · Sostenibilidad | Victor | Un anillo de luz coral sobre agua oscura | 5 dimensiones en anillo → riesgos y mitigaciones | 2 |
| **S12** | 5:10–5:30 | 8 · 2.1 Clientes | Marco | Madrid al atardecer, edificios unidos por líneas coral | Quién paga, quién lo usa y quién se beneficia (órbitas) | 1 |
| **S13** | 5:30–5:50 | 8 · 2.2 Ingresos | Marco | Una balanza hecha de líneas de luz | `€40 / month` · `€0 for the patient` → `1 avoided admission ≈ €4,400 = 9 patients for a year` | 2 |
| **S14** | 5:50–6:10 | 8 · 2.3 Costes | Marco | Una línea que baja y luego sube con fuerza | Curva de repago con `BREAK-EVEN ≈ 300 patients · 0.15% of Spain` + `≈80% margin` | 2 |
| **S15** | 6:10–6:30 | 8 · 2.4 Salida al mercado | Marco | Un hospital moderno genérico al amanecer | 3 pasos: validación clínica → clínicas privadas → sanidad pública | 3 |
| **S16** | 6:30–6:50 | 8 · 2.5 Mercado | Marco | La Tierra de noche, ondas que salen de Madrid hacia América | Círculos TAM / SAM / SOM + 3 datos de EE. UU. | 3 |
| **S17** | 6:50–7:25 | 9 · Aprendizajes | Javier | Mesa de trabajo del hackathon de noche (mejor con fotos reales) | Viernes | domingo → pruebas con resultados → "descubrimos X → cambiamos Y" | 3 |
| **S18** | 7:25–7:40 | 10 · Cierre | Victor | La ventana de María, con el reflejo lleno de siluetas | `María isn't one person.` → `200,000+ · 2.3M · 11.8M` | 2 |
| **S19** | 7:40–7:52 | 10 · Cierre | Victor | Dos ondas de luz que se separan desde un punto | `Next: stroke · 12M new cases a year · up to 4 in 10 lose part of their speech` | 1 |
| **S20** | 7:52–8:00 | 10 · Cierre | Victor | Línea coral plana con un latido | `What if the answer was there all along?` → logo, `FdiProtocol` y los cuatro nombres con su rol | 2 |
| **A1–A9** | Preguntas | 11 · Reserva | — | Sin Kling: degradado navy con la onda | Las diapositivas de reserva de la sección 11 | — |

#### Los prompts de Kling, diapositiva a diapositiva

Cada diapositiva lleva tres prompts:

- **Imagen:** la imagen fija (+ STYLE).
- **Bucle:** el movimiento en bucle, con primer fotograma = último.
- **→:** la transición a la siguiente, con primer fotograma = esta imagen fija y último = la siguiente.

**S01 · María**
- **Imagen:** `Early morning in a modest Madrid apartment. María (see character sheet) seen from behind, sitting by a tall window holding a cup of coffee. Soft blue morning light, out-of-focus Madrid rooftops. A thin coral wave of light is reflected across the window glass at lower third. + STYLE`
- **Bucle:** `Steam rises gently from the cup, the sheer curtain moves slightly, she breathes softly. Static camera.`
- **→ S02:** `The camera slowly pushes through the window glass; the coral reflection becomes a line of light that rises into the night sky above Madrid, and the curve of the Earth comes into view. One continuous smooth move.`

**S02 · La escala**
- **Imagen:** `The Earth at night from low orbit, warm city lights across Spain, Latin America and the United States, a thin coral wave of light arcing along the horizon, deep navy space. + STYLE`
- **Bucle:** `Very slow rotation of the Earth, city lights gently twinkle.`
- **→ S03:** `The camera dives toward the coral wave of light on the horizon until it fills the frame as a single vibrating line.`

**S03 · La voz**
- **Imagen:** `Extreme macro of a single glowing coral line vibrating like a vocal cord in dark navy space, tiny particles of light floating around it, scientific and elegant. + STYLE`
- **Bucle:** `The line oscillates gently like a sound wave, particles drift slowly.`
- **→ S04:** `The vibrating line slowly stretches and lies down, becoming a thin line of light along the floor of a dark hospital corridor.`

**S04 · El hueco entre visitas**
- **Imagen:** `A long empty hospital corridor at night, one closed door near the left and another far away on the right, a thin line of coral light along the floor that fades to grey between the two doors, cold navy light, quiet and lonely. + STYLE`
- **Bucle:** `A fluorescent light flickers faintly, extremely slow dolly forward.`
- **→ S05:** `The cold corridor dissolves into warm morning light; the line on the floor becomes the edge of a wooden kitchen table.`

**S05 · La solución** (usad de partida una **foto real del dispositivo**)
- **Imagen:** `A small white rounded device with a single coral button and a tiny screen on a wooden kitchen table in warm morning light, a cup of coffee beside it, an older woman's hand (María) resting near the button, soft coral glow from the device. + STYLE`
- **Bucle:** `The coral light of the device breathes slowly, warm light shifts gently. Static camera.`
- **→ S06:** `The camera rises from the device; its coral glow expands into a dark space filled with floating translucent pages.`

**S06 · La ciencia**
- **Imagen:** `Dark navy space with dozens of translucent sheets of paper floating at different depths (no readable text), a thin coral wave of light passing through them. + STYLE`
- **Bucle:** `The sheets drift very slowly, light passes through them.`
- **→ S07:** `The sheets fall away into darkness, leaving only the coral wave line in the center of an empty dark studio.`

**S07 · La demo**
- **Imagen:** `A minimal dark navy studio, soft vignette, empty space, a faint thin coral horizontal line at the center. + STYLE`
- **Bucle:** `Subtle haze moves, the line glows faintly.`
- **→ S08:** `The coral line splits into many thin parallel lines that stack in depth like layers of light.`

**S08 · El algoritmo**
- **Imagen:** `A coral light wave splitting into many thin parallel layers stacked in depth like a spectrogram, ridgelines of light receding into dark navy space, mostly on the right half of the frame. + STYLE`
- **Bucle:** `The layers undulate gently, each at its own rhythm.`
- **→ S09:** `All the layers merge back into one line, which becomes a reflection on María's window.`

**S09 · El día 9 de María**
- **Imagen:** `The same Madrid window as before, later in the day, warm golden light. María in soft focus, side profile, holding a phone to her ear, calm and relieved. Coral reflection on the glass. + STYLE`
- **Bucle:** `Golden light shifts slowly, she nods slightly. Static camera.`
- **→ S10:** `The camera pulls back through the window into an abstract dark space with a faint grid floor and a coral horizon line.`

**S10 · Cómo medimos**
- **Imagen:** `An abstract dark navy space with a faint perspective grid floor and a single thin coral horizon line, clean, like a stage for data. + STYLE`
- **Bucle:** `The grid lines drift slowly toward the camera.`
- **→ S11:** `The coral horizon line bends and closes into a glowing ring floating above dark water.`

**S11 · Sostenibilidad**
- **Imagen:** `A glowing coral ring of light floating above still dark water at dusk, its reflection on the surface, calm and circular, on the right half of the frame. + STYLE`
- **Bucle:** `Gentle ripples move across the water, the ring glows softly.`
- **→ S12:** `The camera rises high above; the ring becomes a roundabout of light in an aerial view of Madrid at blue hour.`

**S12 · Clientes**
- **Imagen:** `Aerial view of Madrid at blue hour, wide avenues and rooftops, thin coral lines of light connecting several buildings like a care network, no signage. + STYLE`
- **Bucle:** `Traffic lights flow slowly along the avenues, the coral network pulses softly.`
- **→ S13:** `The camera zooms into one coral node that turns into a simple balance scale made of light.`

**S13 · Ingresos**
- **Imagen:** `A minimal balance scale drawn in thin coral lines of light in dark navy space: a small glowing coin on one side, a larger glowing block on the other, tilted toward the block. + STYLE`
- **Bucle:** `The scale sways very gently.`
- **→ S14:** `The beam of the scale straightens into a line that dips down and then rises steeply to the right.`

**S14 · Costes y repago**
- **Imagen:** `A single coral line of light on dark navy that dips down and then rises steeply toward the right like a growth curve, small particles of light along it, on the right two-thirds of the frame. + STYLE`
- **Bucle:** `Particles travel slowly along the line.`
- **→ S15:** `The rising line becomes the horizon of a road at dawn leading to a modern hospital.`

**S15 · Salida al mercado**
- **Imagen:** `A modern generic hospital building at dawn in Madrid (no signage, no logos), wide shot, a coral sunrise line on the horizon, a few people walking in. + STYLE`
- **Bucle:** `Clouds move slowly, people walk in the distance.`
- **→ S16:** `The camera rises into the sky and up into orbit, revealing the Earth at night over the Atlantic.`

**S16 · El mercado**
- **Imagen:** `The Earth at night centered on the Atlantic Ocean, Spain on the right and the Americas on the left, coral ripples of light expanding from Madrid across the ocean toward the United States and Latin America. + STYLE`
- **Bucle:** `The coral ripples pulse outward from Madrid in a slow rhythm.`
- **→ S17:** `The ripples collapse into a single warm point that becomes a desk lamp over a workbench at night.`

**S17 · Lo que hemos aprendido** (mejor fotos reales del equipo; Kling solo si no las hay)
- **Imagen:** `A hackathon workbench at night: electronic parts, a small single-board computer, cables, a white 3D-printed case, a laptop glow and a warm desk lamp with a coral tint. + STYLE`
- **Bucle:** `The lamp light flickers softly, the laptop glow shifts.`
- **→ S18:** `The camera moves toward the window of the room, which becomes María's window.`

**S18 · María no es una persona**
- **Imagen:** `María's window again at dusk; the reflection on the glass shows hundreds of soft silhouettes of older people standing together, forming a wave-like line of coral light. + STYLE`
- **Bucle:** `The silhouettes shimmer softly in the reflection.`
- **→ S19:** `The coral line of silhouettes becomes a single wave of light that splits into two waves.`

**S19 · Lo siguiente: el ictus**
- **Imagen:** `Two thin glowing waves of light diverging from a single point in dark navy space, one coral and one off-white, elegant and calm. + STYLE`
- **Bucle:** `The two waves oscillate gently, each with its own rhythm.`
- **→ S20:** `Both waves converge back into a single point that becomes a flat coral line with a small heartbeat pulse.`

**S20 · Final**
- **Imagen:** `Dark navy, a single thin coral horizontal line across the center with a small heartbeat-like pulse. + STYLE`
- **Bucle:** `A small pulse travels slowly along the line from left to right.`

### 1.6 La arquitectura técnica

**Herramientas:** Vite + React + TypeScript; Framer Motion para animar el contenido; KaTeX para las fórmulas; las fuentes Sora, Inter y JetBrains Mono instaladas con `@fontsource`, para que funcionen sin internet. Nada de CDN.

**Estructura de carpetas:**

```
landing/
  public/media/plates/S01.jpg …          imágenes fijas de Kling
  public/media/loops/S01.mp4 …           bucles
  public/media/transitions/S01-S02.mp4 … transiciones
  public/media/demo-backup.mp4           vídeo de reserva de la demo
  public/media/photos/…                  fotos reales (equipo, antes y después, dispositivo)
  public/logo.svg
  src/slides.ts                          la lista de diapositivas (abajo)
  src/stage/Background.tsx               las capas de vídeo, precarga y fundidos
  src/stage/Deck.tsx                     navegación, elementos que se revelan y teclado
  src/stage/Thread.tsx                   la onda fina de todas las diapositivas (y el micrófono)
  src/overlays/…                         un componente por tipo de contenido
  src/presenter/…                        (opcional) vista de presentador
```

**Cada diapositiva se describe con datos, no con código suelto:**

```ts
type Slide = {
  id: `S${string}` | `A${number}`;
  section: string;          // "IMPACT · HOW WE MEASURE IT"
  criterion?: string;       // "1.2"
  speaker: 'Victor' | 'Martin' | 'Marco' | 'Javier';
  plate: string;            // media/plates/S09.jpg
  loop?: string;            // media/loops/S09.mp4
  transitionToNext?: string;// media/transitions/S09-S10.mp4
  overlay: OverlayKind;     // 'title' | 'counters' | 'gap' | 'steps' | 'studies' | 'demo' | 'formulas'
                            // | 'trend' | 'kpis' | 'ring' | 'orbits' | 'balance' | 'jcurve' | 'funnel'
                            // | 'market' | 'beforeAfter' | 'reveal' | 'end'
  builds: number;           // elementos que se revelan con cada pulsación
  notes: string;            // el guion "Se dice" de la sección B
  appendix?: boolean;
};
```

**Tipos de contenido que hay que construir:**

| Tipo | Qué hace |
|---|---|
| `title` | Titular palabra a palabra |
| `counters` | Cifras grandes que cuentan hasta su valor |
| `gap` | Las dos agujas VISIT y NEXT VISIT, con la onda que pierde color entre ellas |
| `steps` | Pasos numerados |
| `studies` | Tarjetas de estudios, con autor, revista y año en mono |
| `demo` | Onda del micrófono en directo con la Web Audio API |
| `formulas` | KaTeX que se escribe solo |
| `trend` | Tendencia del paciente con la franja de su línea base y la alerta |
| `kpis` | Tabla de indicadores |
| `ring` | Elementos colocados alrededor de un anillo |
| `orbits` | Clientes, pacientes y sanidad pública en órbitas |
| `balance` | La balanza de 2.2 |
| `jcurve` | La curva de repago con el punto de equilibrio |
| `funnel` | Los pasos de la salida al mercado |
| `market` | Círculos concéntricos TAM / SAM / SOM |
| `beforeAfter` | Pantalla partida entre viernes y domingo |
| `reveal` | Cierre: cifras que aparecen una tras otra |
| `end` | Logo y equipo |

Todos los gráficos van en **SVG con líneas coral de 2–3 px** sobre el vídeo, nunca con una librería de gráficos estándar.

**Para recodificar los vídeos de Kling:**

```
ffmpeg -i in.mp4 -an -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -g 30 -movflags +faststart -vf scale=1920:-2 out.mp4
```

Con fotogramas clave cada segundo, los vídeos arrancan al instante. Cada clip de 5 s ocupa ≈ 5–10 MB, ≈ 300 MB en total: no es problema en local.

**Para presentar:**

1. `npm run build` y luego `npx vite preview`, o servir `dist/` en local.
2. Chrome a pantalla completa (`F`), con la plataforma de la demo abierta en otra ventana.
3. **Probadlo con el wifi apagado.**

### 1.7 Criterios de aceptación

- [ ] Las 20 diapositivas se pasan con el mando y con el teclado, incluidos los elementos que se revelan dentro de cada una.
- [ ] Sin vídeos todavía, la landing funciona con imágenes fijas o degradados. Cuando aparecen los vídeos, se usan sin tocar el código: basta con dejarlos en su carpeta.
- [ ] Ninguna transición enseña un fotograma negro ni da tirones en el portátil del pitch.
- [ ] Todo el texto se lee a 1920 × 1080 desde el fondo de una sala, y siempre hay contraste con el vídeo de detrás.
- [ ] Cada diapositiva tiene la etiqueta de su criterio de la rúbrica.
- [ ] Las cifras son exactamente las de la sección B, y los [PENDIENTE] se ven como marcadores.
- [ ] Funciona sin internet: fuentes, librerías y vídeos van dentro del proyecto.
- [ ] El cronómetro, la pantalla en negro, el vídeo de reserva de la demo y las diapositivas de reserva funcionan.
- [ ] Una pasada completa sin hablar dura menos de 8 minutos.

---

# Parte B · El contenido del pitch

Cada sección es un bloque del pitch, con sus cifras, su texto en pantalla y su guion. El mapa de 1.5 dice qué diapositivas (S01–S20) le corresponden. El guion "Se dice" va en el campo `notes` de cada diapositiva.

## 2. Sección 1 · María y la magnitud del problema (0:00–1:15) · criterio 1.1 · diapositivas S01–S04

**Objetivo:** en 75 segundos, ponerle cara al problema con María, dar la escala con cifras y dejar clara la parte que resolvemos: **la falta de información entre visitas**.

### Las cifras, de lo cercano a lo global

| Cifra | Dato | Etiqueta |
|---|---|---|
| **María** | 68 años, vive en Madrid, tiene Parkinson y su última visita al neurólogo fue hace seis meses | Persona compuesta |
| **Más de 200.000 en España** | ≈ 10.000 diagnósticos nuevos al año; la SEN prevé que se tripliquen en 2050 | [V] SEN 2026 |
| **111 días** | Espera media para una **primera** consulta de neurología en la sanidad pública (junio de 2025): la neurología está saturada | [V] Ministerio de Sanidad, SISLE |
| **1.900 M€ al año** | Coste del Parkinson en España (2019) | [V] Movement Disorders 2026, COIN-Eu |
| **28.800 M€ al año** | Coste en Europa a precios de 2025, con 2,2 M de pacientes: **≈ 13.000 € por paciente y año** | [V] / [C] |
| **11,8 M → 25,2 M** | Personas con Parkinson en el mundo en 2021, y en 2050 | [V] GBD 2021; Su et al., BMJ 2025 |
| **La que más crece** | La discapacidad y la mortalidad por Parkinson aumentan más deprisa que las de cualquier otra enfermedad neurológica | [V] OMS |
| **Casi 9 de cada 10** | Pacientes con trastornos de la voz o el habla | [V] Logemann 1978, n = 200 |
| **72 %** | Ingresos por Parkinson que son urgentes, no programados (Inglaterra, 4 años de datos) | [V] Low et al. 2019 |
| **≈ 4.400 € por ingreso** | Coste medio de un ingreso por Parkinson en la sanidad pública española: **4.378 €**, con una estancia media de 10 días y ≈ 120 M€ al año para el SNS. Los datos son de 1997–2012, así que hoy la cifra es conservadora: el coste medio de cualquier alta hospitalaria en el SNS fue de 6.005 € en 2024. En Inglaterra, ≈ 4.650 € | [V] PLOS ONE 2016; Ministerio de Sanidad |

### Texto en pantalla (en orden)

`Meet María · 68 · Madrid` → `Last neurology visit: 6 months ago` → `Spain · 200,000+` → `World · 11.8M → 25.2M by 2050` → `€28.8B a year in Europe` → `Nearly 9 in 10 lose part of their voice` → `111 days · average wait for a first neurology visit` → `VISIT · · · NEXT VISIT` → `THE MONITORING GAP`

### Se dice (Victor, ≈ 160 palabras)

> Meet María. She's sixty-eight, she lives in Madrid, and she has Parkinson's. Her last neurology visit was six months ago. Since then, nobody has measured how she's doing.
>
> María is one of more than two hundred thousand people with Parkinson's in Spain. Worldwide, almost twelve million, and twenty-five million by 2050. Disability and death from Parkinson's are growing faster than for any other neurological disease. In Europe, it already costs almost twenty-nine billion euros a year.
>
> And nearly nine in ten patients will see their voice change.
>
> Neurology is saturated: in Spain, the average wait just for a first appointment is a hundred and eleven days. Between visits, small changes go unnoticed until they become a fall, an infection, an emergency. Seven in ten Parkinson's admissions are emergencies, and each one costs thousands of euros.
>
> The problem is not a lack of treatment. **It's a lack of information between visits.**

**Nota.** El "nearly 9 in 10" viene de un estudio de 1978 con 200 pacientes: es la cifra clásica que repite toda la literatura. Si os preguntan, añadid que Ho et al. (1998) confirma que la voz es el primer aspecto del habla que se ve afectado y el más frecuente.

---

## 3. Sección 2 · La solución y su respaldo científico (1:15–2:00) · criterios 3.2 y 1.1 · diapositivas S05–S06

**Objetivo:** explicar la idea en una frase, demostrar que la ciencia la respalda y que no estamos solos.

### Qué es VoxWave

- **Una sesión de voz diaria de 3 minutos:** sostener una "aah", leer una frase y charlar un poco.
- **Desde el móvil o desde un dispositivo de un botón,** para quien no tiene smartphone o internet.
- **Cada paciente se compara consigo mismo,** con su propia línea base.
- **El neurólogo recibe una alerta y un informe de una página** cuando la voz se desvía de forma sostenida.
- **"We measure; doctors decide."** No diagnosticamos.

### La ciencia que lo respalda (tarjetas que flotan sobre la onda)

| Tarjeta | Qué dice | Fuente |
|---|---|---|
| **La voz es de lo primero que cambia** | En personas de alto riesgo, los cambios de voz y expresión facial se estiman unos **≈ 10 años** antes del diagnóstico; son los signos motores más tempranos | [V] Postuma et al., *Brain* 2012 (estimación con 20 pacientes) |
| **Es un biomarcador validado** | Estudio multicéntrico, **5 idiomas y 448 participantes**: el análisis automático del habla detecta la enfermedad e incluso su fase previa, y mide la progresión en 12 meses | [V] Rusz et al., *Annals of Neurology* 2021 |
| **Funciona en la vida real** | Con las llamadas normales del móvil: **AUC 0,85** frente a controles sanos con ≈ 18 minutos de habla, tan bueno como un micrófono de laboratorio | [V] Illner et al., *Movement Disorders* 2024 |
| **Las medidas de la voz clasifican** | 91,4 % de acierto con 4 medidas de disfonía (2009); ≈ 99 % con 10 (2012) | [V] Little 2009; Tsanas 2012, *IEEE TBME* |
| **Se puede seguir a distancia** | Grabaciones de voz hechas en casa estiman la escala clínica UPDRS a pocos puntos de lo que mide el médico | [V] Tsanas et al., *IEEE TBME* 2010 |
| **Hay datos en castellano** | El Gregorio Marañón y la UPM grabaron **NeuroVoz**, un corpus público de habla parkinsoniana en castellano: 54 pacientes y 58 controles | [V] NeuroVoz (arXiv 2024) |

### Con quién trabajamos

`Head of Neurology, Hospital General Universitario Gregorio Marañón · [Nombre exacto de la asociación de Parkinson] · Private clinics in Madrid`

**Tres cosas que hay que confirmar antes de ponerlo en pantalla:**

1. **La fórmula exacta de la relación.** No es lo mismo "in collaboration with", "advised by" o "in conversation with". Usad la que cada uno firmaría, y **pedid permiso antes de citar el nombre o el cargo del jefe de Neurología y antes de usar logos.** Si no hay permiso, solo el nombre de la institución en texto.
2. **El nombre exacto de la asociación:** ¿la Federación Española de Párkinson o una asociación concreta?
3. **NeuroVoz:** si el contacto con el hospital pasa por ese corpus, decidlo así. Si no, como plan: *"we'll validate on NeuroVoz"*.

### Se dice (Martin, ≈ 110 palabras)

> VoxWave turns the voice into a daily health signal. Three minutes a day: hold an "aah", read a line, chat a little. From a phone, or from a one-button device, for patients without a smartphone or internet.
>
> Why the voice? Because it's one of the first things Parkinson's touches, up to a decade before diagnosis. A multicentre study in five languages showed that automated speech analysis tracks the disease and its progression.
>
> We're building it with **[the head of neurology at Gregorio Marañón Hospital in Madrid, the X Parkinson's association and private clinics]**.
>
> Each patient is compared only with themselves. When their voice drifts, the neurologist gets an alert and a one-page report. **We measure. Doctors decide.**

---

## 4. Sección 3 · Demo en directo (2:00–2:45) · criterios 3.1, 4.1 y 5.2 · diapositiva S07

**Objetivo:** demostrar en 45 segundos que el producto existe de verdad: **voz → dispositivo → plataforma desplegada**. Es lo más memorable del pitch y también la prueba del avance del fin de semana. **El dispositivo es el de María.**

### Antes de empezar el pitch

- **Dispositivo:** encendido con la powerbank, en la pantalla de inicio.
- **Portátil:** con la plataforma desplegada abierta en Chrome, en dos ventanas: `/patient` y `/clinic`. La ficha de **María** ya preparada, con su historial, su línea base y la desviación de los últimos días. Hay que cambiar los pacientes de ejemplo del MVP: ver la sección 12.
- **Plan B:** el vídeo de la demo, a una tecla de distancia.
- **Sin depender del wifi:** si la plataforma necesita red, llevad el hotspot del móvil probado.

### El guion de la demo

| Tiempo | Qué pasa | Quién |
|---|---|---|
| 0–8 s | Javier pulsa el botón. La pantalla dice `Hold an "aah"`. **Opción creativa:** pedirle a un miembro del jurado que diga la "aah" | Javier |
| 8–18 s | La grabación de 5 s: el LED pulsa en coral y la sesión termina con ✓ | Javier o el jurado |
| 18–28 s | Se conecta el dispositivo por USB al portátil. Aparece la unidad **VOXWAVE** y la plataforma importa la sesión | Martin |
| 28–40 s | En `/clinic`, la ficha de María se actualiza con la nueva sesión. **Se reproduce la voz que se acaba de grabar** y se ve su onda | Martin |
| 40–45 s | Se ve su tendencia de las últimas semanas: la franja de su línea base y la alerta | Martin |

### Se dice (Javier, ≈ 80 palabras)

> This is María's device. One button, a screen, a microphone. No app, no internet. *[press]* Every morning it asks her for an "aah"… *[record]* … three minutes, session saved.
>
> At her next checkup, or whenever the clinic needs it, they plug it in. *[USB]* Her sessions land on the platform. That's the voice we just recorded.
>
> And behind it, María's trend over the last weeks.

### Honestidad sobre la demo (importante)

**El análisis del prototipo es simulado.** Hay dos maneras de llevarlo bien, y conviene hacer las dos:

1. **Decirlo en una línea al final del algoritmo:** *"In today's prototype the scoring is simulated; the pipeline is what we'll validate on clinical data."* Reconocer los límites puntúa en las preguntas (5.3). Que el jurado lo descubra preguntando resta.
2. **Mejora opcional que da mucho por poco trabajo:** calcular en la plataforma **unas pocas medidas reales** de la grabación que se acaba de hacer: tono medio (F0), variabilidad del tono, intensidad y duración de la vocal. Son unas 100 líneas de JS con autocorrelación sobre el WAV. Así, lo que se ve de la grabación es real, y solo el historial de María está preparado. Además, cuenta como avance del fin de semana (4.1).

---

## 5. Sección 4 · El algoritmo (2:45–3:15) · criterios 3.1 y 3.2 · diapositiva S08

**Objetivo:** demostrar en 30 segundos que detrás hay rigor matemático, no una caja negra. **En pantalla aparecen las fórmulas; en voz alta, solo la idea.** El detalle queda para las preguntas.

### El proceso en 4 pasos

```
1 · QUALITY GATE  →  2 · ACOUSTIC FEATURES  →  3 · PERSONAL BASELINE  →  4 · CHANGE DETECTION
   SNR, clipping,       F0, jitter, shimmer,       z-scores vs. the         CUSUM on a composite
   duration             HNR, pauses, MFCC          patient's own history    drift score → alert
```

### Las fórmulas

Están ordenadas de la más visual a la más técnica. Para la landing, elegid las 4–6 que mejor queden; todas están en la diapositiva de reserva del algoritmo.

**1. Control de calidad.** Una sesión se descarta si no llega a cierta calidad:

$$\mathrm{SNR} = 10\log_{10}\frac{P_{\text{voice}}}{P_{\text{noise}}} \geq 20\ \mathrm{dB}$$

**2. Tono fundamental (F0)** por autocorrelación:

$$r(\tau)=\sum_{n} x[n]\,x[n+\tau], \qquad F_0=\frac{f_s}{\arg\max_{\tau} r(\tau)}$$

**3. Monotonía (monopitch),** el marcador más temprano según Rusz 2021: desviación del tono en semitonos.

$$s_t = 12\log_2\frac{F_{0,t}}{F_{\text{ref}}}, \qquad \text{monopitch} = \sigma(s_t)$$

**4. Jitter y shimmer:** la inestabilidad del ciclo vocal en tiempo ($T_i$) y en amplitud ($A_i$).

$$\text{Jitter}=\frac{\frac{1}{N-1}\sum_{i=1}^{N-1}\lvert T_i-T_{i+1}\rvert}{\frac{1}{N}\sum_{i=1}^{N}T_i}
\qquad
\text{Shimmer}=\frac{\frac{1}{N-1}\sum_{i=1}^{N-1}\lvert A_i-A_{i+1}\rvert}{\frac{1}{N}\sum_{i=1}^{N}A_i}$$

**5. Relación armónicos-ruido (HNR):**

$$\mathrm{HNR}=10\log_{10}\frac{r'(\tau_{\max})}{1-r'(\tau_{\max})}$$

**6. Entropía del periodo del tono (PPE)** (Little 2009), robusta al ruido de casa:

$$\mathrm{PPE}=-\sum_{i} p_i \log_2 p_i$$

**7. Coeficientes cepstrales en escala Mel (MFCC):** el "timbre" de la voz.

$$c_n=\sum_{m=1}^{M}\log(S_m)\cos\!\left[\frac{\pi n}{M}\left(m-\tfrac12\right)\right]$$

**8. Línea base personal (z robusto).** Cada medida $k$ se compara con la historia del propio paciente, usando la mediana y la MAD de sus primeras sesiones:

$$z_{k,t}=\frac{x_{k,t}-\tilde{x}_k}{1.4826\cdot \mathrm{MAD}_k}$$

**9. Desviación conjunta (distancia de Mahalanobis)** frente a su propia línea base:

$$D_t^2=(\mathbf{x}_t-\boldsymbol{\mu})^{\top}\,\Sigma^{-1}\,(\mathbf{x}_t-\boldsymbol{\mu})$$

**10. Detección de cambio sostenido (CUSUM).** Solo alerta si la desviación se acumula varios días:

$$C_t=\max\bigl(0,\; C_{t-1}+D_t-k\bigr), \qquad \text{alert if } C_t>h$$

**11. Control de falsas alarmas.** $h$ se ajusta para que el tiempo medio hasta una falsa alarma sea de al menos un año:

$$\mathrm{ARL}_0(h,k)\ \geq\ 365 \text{ days} \;\Rightarrow\; \leq 1 \text{ false alarm per patient-year}$$

**12. Futuro: estimar la escala clínica** a partir de la voz, como Tsanas 2010:

$$\widehat{\mathrm{UPDRS}}_t = f_{\theta}(\mathbf{x}_t), \qquad f_\theta = \text{random forest / gradient boosting}$$

### Se dice (Martin, ≈ 75 palabras)

> Behind every session there are four steps. A quality gate rejects bad recordings. Then we extract the acoustic features the literature validates: pitch variability, jitter, shimmer, harmonics-to-noise, pauses. Each one is compared with the patient's own baseline, not a population average. And a change detector only raises an alert when the drift is sustained, tuned to less than one false alarm per patient per year. In today's prototype, the scoring is simulated: this is the pipeline we'll validate on clinical data.

### Por qué es innovador (3.2)

- **Cada paciente se compara consigo mismo, cada día.** Casi todos los trabajos publicados comparan pacientes con controles sanos. Comparar con la propia historia elimina las diferencias entre personas (edad, sexo, acento) y convierte un clasificador en un **monitor longitudinal**.
- **El ejercicio principal no depende del idioma.** Sostener una "aah" (y la prueba "pa-ta-ka") suena igual en cualquier lengua. Por eso el sistema escala al mundo, aunque la lectura y la conversación necesiten un modelo por idioma. Empezamos por el castellano.

---

## 6. Sección 5 · Impacto esperado y cómo lo medimos (3:15–4:30) · criterio 1.2 (15 p, el que más vale) · diapositivas S09–S10

**Objetivo:** que el jurado vea exactamente **qué cambia, cómo se mide y a qué escala**. Aquí no basta con "mejoramos vidas": hacen falta indicadores con línea de partida, objetivo y fuente.

### La cadena del impacto (un diagrama en pantalla)

```
Daily 3-min sessions → objective data between visits → early alert + 1-page report
→ earlier clinical action (medication, therapy, check-up) → fewer emergencies, better quality of life
```

### Cuántos más datos (la imagen fuerte de la sección)

| | Hoy | Con VoxWave |
|---|---|---|
| Datos sobre la voz del paciente al año | 2–4 visitas, valoración subjetiva | ≈ 255 sesiones objetivas (365 días × 70 % de cumplimiento) |
| Proporción | 1× | **≈ 60–125× más observaciones** [C] |

### Los indicadores

| Resultado | Indicador | Línea de partida | Objetivo en el piloto | Objetivo en el año 3 | Fuente del dato |
|---|---|---|---|---|---|
| **Detectar antes** | Días desde el primer cambio sostenido en la voz hasta que lo revisa el neurólogo | 90–180 días: la siguiente visita [S] | **< 14 días** [H] | < 7 días [H] | Registro de alertas de la plataforma |
| **Actuar antes** | % de alertas que acaban en una acción clínica (ajuste de medicación, logopedia, cita adelantada) | No existe | ≥ 30 % [H] | ≥ 40 % [H] | Respuesta del médico en el panel |
| **Menos urgencias** | Ingresos urgentes por cada 100 pacientes y año, frente a un grupo de control | Se mide en el grupo de control | Medido [H] | −15 % [H] | Historia clínica del hospital colaborador |
| **Que se use** | % de sesiones diarias completadas | — | ≥ 70 % [H] | ≥ 70 % [H] | Plataforma |
| **Llegar a todos** | % de pacientes que usan el dispositivo (sin smartphone o sin internet) | — | ≥ 25 % [H] | ≥ 30 % [H] | Plataforma |
| **Calidad de vida** | Cambio en el PDQ-8 (cuestionario de calidad de vida en Parkinson) | Al empezar | Medido [H] | Mejora significativa [H] | Cuestionario cada 3 meses |
| **Carga del cuidador** | Escala de Zarit | Al empezar | Medido [H] | Mejora [H] | Cuestionario cada 3 meses |
| **Tiempo del médico** | Minutos para revisar el informe de un paciente | — | < 2 min [H] | < 2 min [H] | Medido en el piloto |
| **Seguridad** | Falsas alarmas por paciente y año | — | ≤ 1 [H] | ≤ 1 [H] | Alertas que el médico marca como no relevantes |

### Cómo se mide: el piloto en Madrid

| | |
|---|---|
| **Diseño** | Estudio prospectivo con un grupo de control emparejado (pacientes con su atención habitual) |
| **Dónde** | Con el Gregorio Marañón y 1–2 clínicas privadas de Madrid [S] |
| **Tamaño** | ≈ 60 pacientes, 6 meses [S] |
| **Variable principal** | Días entre el primer cambio sostenido y la acción clínica |
| **Variables secundarias** | Ingresos urgentes, cumplimiento, PDQ-8, carga del cuidador, falsas alarmas y tiempo del médico |
| **Ética** | Aprobación de un comité de ética y consentimiento informado |
| **Después** | Los datos del piloto sirven también para la evaluación clínica del marcado CE |

### La escala del impacto

| Fase | Pacientes | Dónde |
|---|---|---|
| Piloto | ≈ 60 | Madrid |
| Año 2 | ≈ 300 (punto de equilibrio, **≈ 0,15 % de España**) | Madrid y primeras comunidades |
| Año 3 | **1.000** (≈ 0,5 % de España) | España |
| Después | ≈ 2,3 M de hispanohablantes con Parkinson | Hispanos de EE. UU. y Latinoamérica |
| Horizonte | 11,8 M | El mundo |

### Se dice (Martin, ≈ 175 palabras)

> Day nine: María's voice drifts from her own baseline. Her neurologist sees it that day, not in four months.
>
> That's our main indicator: the days from the first sustained change in the voice to the moment a neurologist reviews it. Today, that's the next visit, three to six months away. Our target is under fourteen days. And instead of two to four visits a year, a neurologist gets around two hundred and fifty data points: over sixty times more information.
>
> Then we track what that early warning leads to: the share of alerts that end in a clinical action, emergency admissions against a control group, quality of life with the PDQ-8, caregiver burden, and false alarms: no more than one per patient per year.
>
> We'll measure it in a six-month pilot in Madrid, with around sixty patients and a matched control group. Those data also become the clinical evidence for CE marking.
>
> From there: three hundred patients, then a thousand in Spain by year three.

---

## 7. Sección 6 · Sostenibilidad y efectos negativos (4:30–5:10) · criterio 1.3 (10 p) · diapositiva S11

**Objetivo:** demostrar que el impacto dura sin depender de subvenciones, y que **conocemos los riesgos y tenemos un plan para cada uno**. Mucha gente se salta esta parte; por eso puntúa.

### Por qué dura

| Dimensión | Cómo |
|---|---|
| **Económica** | Pagan las clínicas, las aseguradoras y la sanidad pública; no dependemos de subvenciones. Margen de ≈ 80 % y punto de equilibrio con ≈ 300 pacientes (ver sección 8) |
| **Clínica** | Encaja en el trabajo que el médico ya hace: un informe de una página y una alerta, sin trabajo extra para el personal |
| **De uso** | Un hábito de 3 minutos al día, con racha de días seguidos y una pantalla que da instrucciones claras |
| **Ambiental** | El dispositivo se presta, se recupera y se reacondiciona. Gasta poco y procesa en local, sin servidores pesados |
| **Social** | Funciona sin internet y sin smartphone, y en castellano, la lengua de una población que hoy recibe menos atención especializada en EE. UU. |

### Efectos negativos y qué hacemos con cada uno

| Riesgo | Mitigación | Cómo lo vigilamos |
|---|---|---|
| **Falsas alarmas y ansiedad del paciente** | El paciente nunca recibe un diagnóstico. Las alertas van al médico y el CUSUM está ajustado a ≤ 1 falsa alarma por paciente y año | Falsas alarmas por paciente y año |
| **Privacidad de datos de salud** | Procesamiento en el dispositivo, consentimiento explícito, RGPD (art. 9) y datos alojados en la UE | Auditorías e incidentes |
| **Brecha digital** | El dispositivo de un botón funciona sin internet | % de pacientes con dispositivo |
| **Que el médico confíe de más en la herramienta** | Complementa las visitas, no las sustituye. Avisos de calidad en cada informe | % de alertas revisadas sin acción |
| **Sesgo del modelo** (acento, variedad del español, sexo) | Línea base personal y validación por subgrupo y por variedad del español | Rendimiento por subgrupo |
| **Residuos electrónicos** | Préstamo, recuperación y reacondicionamiento | % de dispositivos reutilizados |

### Se dice (Victor, ≈ 95 palabras)

> For the impact to last, it has to pay for itself. Clinics, insurers and public health pay, not grants, and the habit takes three minutes a day.
>
> We also know what could go wrong. False alarms: patients never get a diagnosis from us, and alerts are tuned to one false alarm per year at most. Privacy: voices are processed on the device, only with consent, under GDPR. The digital divide: a device that works offline. E-waste: devices are lent, recovered and refurbished. And it never replaces the doctor.

---

## 8. Sección 7 · Negocio (5:10–6:50) · criterios 2.1–2.5 (35 p) · diapositivas S12–S16

**Objetivo:** una pantalla por subcriterio, con su etiqueta visible. La economía por paciente es la del vídeo final; el mercado y la salida al mercado, los nuevos.

### 2.1 · Clientes y demanda (≈ 20 s)

| | |
|---|---|
| **Quién paga, en España** | Primero, **clínicas privadas, grupos hospitalarios y aseguradoras de salud**, que compran más rápido. Después, la **sanidad pública**, empezando por la Comunidad de Madrid |
| **Socio clínico** | El **Gregorio Marañón** (hospital público): validación clínica y piloto. No es el primer cliente que paga, sino quien da la credibilidad |
| **Quién lo usa** | Pacientes con Parkinson y, con ellos, sus cuidadores |
| **Quién se beneficia** | El neurólogo, que ve primero al paciente que lo necesita; y el sistema de salud, con menos urgencias |
| **Qué necesitan** | Capacidad: la espera media para una primera consulta de neurología es de 111 días. Y triaje: saber a quién atender antes |
| **Pruebas de demanda** | **[PENDIENTE: lo que digan este fin de semana el jefe de Neurología, la asociación y las clínicas privadas]** |

### 2.2 · Ingresos y disposición a pagar (≈ 20 s)

| | |
|---|---|
| **Precio** | **40 € al mes por paciente** (480 €/año), que paga la institución [H]. **Hay que validarlo con las clínicas privadas este fin de semana** |
| **Para el paciente** | 0 €, con el dispositivo incluido si lo necesita |
| **Por qué pagarían** | Un solo ingreso por Parkinson evitado (≈ 4.400 € en España [V]) cubre **≈ 9 pacientes durante un año** [C]. **Basta con evitar 1 ingreso por cada 9 pacientes al año** para que salga gratis |
| **Además** | Tiempo del neurólogo y triaje: el paciente adecuado, antes (la balanza del vídeo) |
| **Cómo validamos el precio** | Pilotos de 3 meses gratis que pasan a ser de pago; la conversión mide la disposición a pagar |
| **En otros mercados** | En EE. UU., probablemente un precio más alto; en Latinoamérica, precios por país [S] |

### 2.3 · Costes y operación (≈ 20 s)

| Concepto | Valor | Etiqueta |
|---|---|---|
| Coste variable por paciente y año | **≈ 100 €** | [S] |
| Desglose orientativo | Nube y base de datos ≈ 15 €, procesamiento de sesiones ≈ 10 €, dispositivo prestado y amortizado ≈ 15 €, soporte y alta del paciente ≈ 40 €, administración ≈ 20 € | [S] *sustituir por presupuestos reales* |
| Contribución por paciente | **≈ 380 €/año** (480 − 100) | [C] |
| Margen de contribución | **≈ 80 %**. Referencias del sector: Hinge Health 77 % de margen bruto, Omada 61 % | [C], [V] |
| Marcado CE (clase IIa) | **50.000–110.000 €, una sola vez.** Escenario prudente: ≈ 100.000 € | [S] |
| Costes fijos del primer año | ≈ 15.000 €: sistema de calidad, auditorías, alojamiento y seguro | [S] |
| **Punto de equilibrio** | (100.000 + 15.000) ÷ 380 ≈ **300 pacientes ≈ 0,15 % de España** | [C] |
| Operación | Sistema de calidad ISO 13485, ciclo de vida del software IEC 62304, gestión de riesgos ISO 14971. Dispositivo de producción con un coste de materiales objetivo < 35 € | [S] |
| Más adelante | La autorización de la FDA para EE. UU. es otra inversión, aún por estimar | [S] |

### 2.4 · Cómo llegamos a los clientes (≈ 20 s)

| Paso | Qué |
|---|---|
| **1 · Validación clínica** | Piloto con el Gregorio Marañón y datos en castellano (NeuroVoz) |
| **2 · Primeros ingresos** | Clínicas privadas, grupos hospitalarios y aseguradoras de Madrid: un piloto gratis de 3 meses que pasa a ser de pago |
| **3 · Sanidad pública** | Comunidad de Madrid y después otras comunidades, con los datos del piloto como prueba |
| **Prescriptores y canal** | El jefe de Neurología y los neurólogos que lo recomiendan; la asociación, como canal hacia los pacientes |
| **Coste de captar una clínica** | ≈ 2.000 €. Una clínica con 10 pacientes deja ≈ 3.800 €/año: se recupera en ≈ 6 meses [H] |
| **Ciclo de venta** | Privado, 3–6 meses; sanidad pública, 12–24 meses [S] |

### 2.5 · Crecimiento y barreras (≈ 20 s)

**El mercado en tres círculos:**

| | Quién | Pacientes | Mercado (480 €/año) |
|---|---|---|---|
| **TAM · el mundo** | Todas las personas con Parkinson. El ejercicio principal no depende del idioma | 11,8 M → 25,2 M en 2050 [V] | ≈ 5.700 M€/año [C] |
| **SAM · la comunidad hispanohablante** | España ≈ 200.000 [V] + Latinoamérica hispanohablante ≈ 2 M [C] + hispanos de EE. UU. ≈ 100.000 [C] | **≈ 2,3 M** [C] | **≈ 1.100 M€/año** [C] |
| **SOM · España a 3 años** | Empezando por Madrid | **1.000** (≈ 0,5 % de España) | ≈ 480.000 €/año de ingresos, ≈ 380.000 € de contribución [C] |

**De dónde salen los números del SAM:**

- **Latinoamérica:** una prevalencia de 472 por cada 100.000 habitantes (metaanálisis de 2023, con un intervalo de 271 a 820), aplicada a ≈ 430 M de habitantes hispanohablantes. El rango va de ≈ 1,2 a 3,5 M.
- **Hispanos de EE. UU.:** ≈ 1,1 M de pacientes en EE. UU. (Marras 2018) × **9 %**, que es la proporción de personas de origen hispano entre los mayores de 65 años (4,6 M de 2019, según el perfil oficial de la ACL [V]). Uso ese grupo de edad porque el Parkinson aparece sobre todo a partir de los 60; si usara el 19 % de hispanos en el total de la población, inflaría la cifra. Es una estimación conservadora: la incidencia en hispanos es algo mayor que la media.
- **En el pitch,** decidlo con "≈" o como "over two million".

**EE. UU., el dato que más gusta:**

- **Incidencia:** los hispanos tienen la incidencia de Parkinson más alta de todos los grupos estudiados: 16,6 por cada 100.000, frente a 13,6 en blancos (Van Den Eeden 2003, un único estudio en California) [V].
- **Acceso al especialista:** solo **≈ 5 %** llega a un especialista en trastornos del movimiento, frente a ≈ 10 % de los blancos [V].
- **Acceso al neurólogo:** el **40 %** de los pacientes de Medicare no vio a ningún neurólogo en todo 2019 [V].

| | |
|---|---|
| **Orden de expansión** | España → **comunidad hispana de EE. UU.** (Texas, Florida, California) → Latinoamérica (México, Colombia, Chile, Argentina) → el mundo |
| **Palanca** | **Un solo modelo en castellano llega a más de 20 países** y a la mayor minoría de EE. UU. El español tiene ≈ 520 M de hablantes nativos [V] |
| **Barreras** | Marcado CE y FDA; reembolso distinto en cada país; reguladores y precios en Latinoamérica; validación clínica por variedad del español |
| **Cómo las convertimos en ventaja** | La regulación es cara y lenta para todos: una vez cruzada, **protege el negocio** frente a copias (la "puerta" del vídeo) |

### Hitos

| Cuándo | Hito |
|---|---|
| Año 0 | Piloto en Madrid, validación clínica y sistema de calidad |
| Año 1 | Marcado CE (clase IIa) y primeras clínicas de pago |
| Año 2 | ≈ 300 pacientes: punto de equilibrio |
| Año 3 | 1.000 pacientes en España. Preparar la FDA y la entrada en la comunidad hispana de EE. UU. |

### Se dice (Marco, ≈ 235 palabras)

> **Customers.** In Spain we sell to private clinics, hospital groups and health insurers first, because they buy faster. Then to public health, starting with Madrid. Gregorio Marañón is our clinical partner, the one that validates it. What they all lack is neurologist time, and knowing who to see first.
>
> **Revenue.** Forty euros per patient per month; free for the patient. Why would they pay? One avoided emergency stay costs about four thousand four hundred euros, enough to pay for nine patients for a whole year.
>
> **Costs.** Each patient costs us about a hundred euros a year: an eighty percent contribution margin, in line with digital health companies like Hinge Health. The big one-off cost is CE marking: up to a hundred thousand euros. About three hundred patients pay it back: zero point one five percent of Spain.
>
> **Go-to-market.** A clinical pilot with Gregorio Marañón, then free three-month pilots in private clinics that turn into paid contracts, with neurologists and the patient association as our champions.
>
> **Growth.** Our first market is Spain. Our serviceable market is the Spanish-speaking world: over two million patients, a billion-euro market a year, including the US Hispanic community, which has the highest incidence of Parkinson's in the US and half the access to specialists. And our horizon is the whole world: twelve million patients.

---

## 9. Sección 8 · Qué hemos mejorado y qué hemos aprendido (6:50–7:25) · criterios 4.1 y 4.2 (10 p) · diapositiva S17

**Objetivo:** demostrar avance real **durante el fin de semana**, con pruebas. Estos 10 puntos solo se ganan si se trabajan ahora. **El cambio de mercado tras la sesión con los mentores es la mejor prueba que tenéis:** contadlo.

### 4.1 · Antes y después (una pantalla partida: viernes | domingo)

| | Viernes (llegada) | Domingo (pitch) |
|---|---|---|
| Mercado | Lituania y los Bálticos (≈ 16.000 pacientes) | **España → comunidad hispanohablante (≈ 2,3 M) → el mundo** |
| Relato | Cifras | Cifras con una cara: María |
| Producto | Vídeo, diseño de la caja y documento del MVP | **[PENDIENTE]** Dispositivo funcionando + plataforma desplegada |
| Dispositivo | Piezas sueltas | **[PENDIENTE]** Caja impresa, graba y sincroniza por USB |
| Análisis | Solo concepto | **[PENDIENTE]** Proceso definido (+ medidas reales de F0 si da tiempo) |
| Medición del impacto | No existía | Indicadores y diseño del piloto (sección 6) |

**Haced hoy fotos y capturas con hora** de cómo está todo, y repetidlas el domingo.

### 4.2 · Pruebas de este fin de semana

| Prueba | Cómo | Qué medimos | Resultado |
|---|---|---|---|
| **Sesión con los mentores** | Revisión del modelo de negocio | Qué cambiamos y por qué | Mercado → España e hispanohablantes; relato con María |
| **Jefe de Neurología del Gregorio Marañón** | Mensaje o llamada corta | ¿Es real el problema entre visitas? ¿Haría un piloto? ¿Podemos citarle? | **[PENDIENTE]** |
| **Asociación de Parkinson** | Mensaje o llamada | Una frase de apoyo; cuántos socios; ¿ayudarían a encontrar pacientes para el piloto? | **[PENDIENTE]** |
| **Clínicas privadas** | Mensaje o llamada | *"¿Pagaríais ≈ 40 € al mes por paciente?"*; quién firma la compra; ¿lo pondrían por escrito? | **[PENDIENTE]** |
| **Prueba de uso del dispositivo** | ≥ 10 asistentes hacen una sesión sin ayuda | % que la completan, tiempo, dudas y puntuación SUS (escala de usabilidad de 10 preguntas) | **[PENDIENTE]** |
| **Calidad de grabación** | 10 grabaciones en una sala con ruido | SNR medio y % de sesiones que pasan el control de calidad | **[PENDIENTE]** |
| **Sincronización** | 10 conexiones USB seguidas | % de sesiones importadas sin error | **[PENDIENTE]** |

### "Descubrimos X → cambiamos Y"

| Descubrimos | Cambiamos |
|---|---|
| Somos españoles, nuestros socios clínicos y nuestros datos están en Madrid, y el castellano llega a más de 20 países y a la mayor minoría de EE. UU. | **De Lituania a España**, con la comunidad hispanohablante como mercado |
| Las cifras no se recuerdan; las personas, sí | **María**, en cuatro momentos del pitch |
| Una sesión semanal se queda corta para notar cambios sostenidos | **Sesiones diarias** de 3 minutos |
| Muchos pacientes mayores no tienen smartphone ni internet | **Un dispositivo de un botón** que funciona sin conexión |
| Un margen del 90 % no era creíble frente a empresas reales | Lo bajamos a **≈ 80 %**, comparado con Hinge y Omada |
| Los neurólogos no tienen tiempo para paneles complejos | **Informe de una página** + una sola alerta |
| **[PENDIENTE]** Lo que salga de los contactos y las pruebas | **[PENDIENTE]** |

### Se dice (Javier, ≈ 85 palabras)

> We arrived on Friday with a video, a box of parts and a market in the Baltics. Our mentors challenged it: we're Spanish, our clinical partners are in Madrid, our model speaks Spanish. So we moved to Spain and the Spanish-speaking world.
>
> Today you've seen a working device and a live platform. **[N]** people here completed a session on their own, in **[X]** seconds on average. And **[the head of neurology / a private clinic]** told us **[insight]**, so we **[change]**.

---

## 10. Sección 9 · Cierre (7:25–8:00) · criterios 2.5, 5.1 y 5.2 · diapositivas S18–S20

**Objetivo:** cerrar el arco de María, volver una vez más a la escala del mercado y terminar con lo más fuerte: **la misma tecnología de voz sirve para otras enfermedades neurológicas, empezando por el ictus.**

### Por qué el ictus, y por qué con la voz

| Dato | Etiqueta |
|---|---|
| **≈ 12 millones de ictus nuevos al año** en el mundo | [V] World Stroke Organization 2022 |
| **Entre el 20 % y el 42 %** de los supervivientes de un ictus tienen disartria (dificultad para articular el habla) | [V] citado en una revisión sistemática de 2022 |
| **El habla ya es uno de los signos clásicos del ictus:** es la "S" del test FAST (*Face, Arm, Speech, Time*) | Conocimiento clínico estándar |
| **La IA ya detecta el ictus en el habla:** en un estudio piloto con iPhone, modelos de voz distinguieron el ictus por oclusión de un gran vaso con un **AUC de 0,89–0,97** | [V] arXiv 2025 (piloto con 10 pacientes y 10 controles: preliminar) |
| **Hay datos a gran escala:** la base SONIVA (Imperial College) reúne grabaciones de ≈ 1.000 supervivientes de ictus y ≈ 7.000 controles | [V] medRxiv 2025 |
| **La afasia se detecta en el habla natural:** un clasificador alcanzó un 86,6 % de acierto por paciente | [V] estudio neerlandés, citado en la literatura de SONIVA |
| **Es un hueco sin cubrir:** una revisión no encontró herramientas digitales de habla pensadas específicamente para la disartria tras un ictus | [V] revisión citada en la literatura de SONIVA |
| **Encaje con VoxWave:** la misma lógica (sesión diaria + línea base personal + detección de cambio) sirve para **seguir la recuperación del habla tras un ictus y avisar si empeora** | [H] **en desarrollo** |

**Cómo decirlo sin exagerar:** "next", "the same engine", "research already shows". Nunca "we detect strokes": es la siguiente línea de trabajo, respaldada por la literatura, pero aún hay que desarrollarla y validarla.

### Texto en pantalla

`María isn't one person.` → círculos que se expanden: `Spain · 200,000+` → `Spanish-speaking world · 2.3M` → `World · 11.8M` → de la onda sale una segunda onda: `Next: stroke · 12M new cases a year` → `What if the answer was there all along?` → logo de VoxWave, `FdiProtocol` y los cuatro nombres con su rol.

### Se dice (Victor, ≈ 95 palabras)

> María isn't one person. She's more than two hundred thousand people in Spain, over two million Spanish speakers from Madrid to Mexico City to Miami, and twelve million people worldwide, because an "aah" sounds the same in every language.
>
> And Parkinson's is only the beginning. Every year, twelve million people have a stroke, and up to four in ten survivors lose part of their speech. Research already shows that AI can hear a stroke in the voice. Same voice, same baseline, next disease.
>
> VoxWave makes sure someone is listening. What if the answer was there all along? We're FdiProtocol. Thank you.

---

# Parte C · Preguntas, tareas y fuentes

## 11. Preguntas y respuestas (8 minutos) · diapositivas de reserva A1–A9

### Cómo responder

1. **Cada tema tiene su dueño.** Contesta esa persona; los demás no la interrumpen.
   - IA y algoritmo → **Martin**
   - Finanzas y costes → **Marco**
   - Mercado, clientes e impacto → **Victor**
   - Dispositivo y regulación del hardware → **Javier**
2. **Fórmula:** respuesta directa en una frase → un dato o un razonamiento → la limitación y el siguiente paso.
3. **Máximo 30–40 segundos por respuesta.** Caben más preguntas, y eso suma.
4. **Si no lo sabéis, decidlo:** *"We don't know yet; here's how we'll find out."* Reconocer límites puntúa en 5.3.

### Preguntas previsibles

| # | Pregunta | Respuesta | Quién |
|---|---|---|---|
| 1 | ¿El análisis de la demo es real? | No: en el prototipo, la puntuación está simulada (**+ "the pitch and loudness you saw are real"**, si hacéis la mejora). El proceso se basa en medidas validadas; el siguiente paso es validarlo con NeuroVoz y en el piloto | Martin |
| 2 | ¿Qué precisión tiene? | Aún no tenemos una cifra propia. La literatura da AUC de 0,85 con llamadas reales (Illner 2024) y 91–99 % de acierto con vocales (Little 2009, Tsanas 2012). Nosotros medimos otra cosa: los cambios en el mismo paciente a lo largo del tiempo. Nuestro objetivo es ≤ 1 falsa alarma por paciente y año | Martin |
| 3 | ¿Diagnosticáis Parkinson? | No. Hacemos seguimiento de pacientes ya diagnosticados. El diagnóstico precoz es una posibilidad futura y necesitaría otra validación | Martin |
| 4 | ¿Qué pasa con una falsa alarma? | El paciente nunca la ve: la recibe el médico, junto con los avisos de calidad. El CUSUM exige una desviación sostenida y el umbral está ajustado a ≤ 1 por año | Martin |
| 5 | ¿Y si el paciente está resfriado o cansado? | El control de calidad y el contexto de la sesión lo marcan, y el CUSUM ignora un mal día suelto: solo cuenta lo que se mantiene | Martin |
| 6 | ¿Funciona en otros idiomas? | El ejercicio principal, la "aah" sostenida, no depende del idioma, y Rusz 2021 validó el análisis en 5 idiomas. La lectura y la conversación necesitan un modelo por idioma: empezamos por el castellano, que cubre más de 20 países | Martin |
| 7 | ¿María es real? | Es un perfil compuesto, construido con lo que nos han contado la asociación y los neurólogos. Su situación (meses entre visitas, nadie midiendo nada) es la de cientos de miles de pacientes | Victor |
| 8 | ¿Por qué presentáis un mercado español en Vilna? | *"Because that's where our partners, our data and our language are. And Spanish reaches 20+ countries and the largest minority in the US."* Europa sigue siendo la expansión natural | Victor |
| 9 | ¿Por qué empezar por España y no por EE. UU.? | En España tenemos los socios clínicos, los datos en castellano y una vía regulatoria (marcado CE) más asequible. EE. UU. necesita la FDA, que llega después, con los datos del piloto | Victor / Marco |
| 10 | ¿Cómo entraríais en EE. UU.? | A través de sistemas de salud con mucha población hispana (Texas, Florida, California), tras la autorización de la FDA. El precio probablemente sería más alto | Victor |
| 11 | ¿Cómo encaja el precio en Latinoamérica? | Precios por país, y probablemente más centrados en el móvil que en el dispositivo. Está por validar | Marco |
| 12 | ¿Qué tenéis del ictus? | Hoy, la literatura: la IA ya distingue el ictus en el habla (AUC 0,89–0,97 en un piloto pequeño) y hay bases de datos de ≈ 1.000 supervivientes (SONIVA). Nuestro uso sería seguir la recuperación del habla tras un ictus y avisar si empeora, con el mismo motor de línea base personal. Es la siguiente línea de trabajo: aún hay que desarrollarla y validarla | Martin |
| 13 | ¿Qué clasificación regulatoria tiene? | Software sanitario de clase IIa según el MDR (regla 11), con organismo notificado. Por eso también es IA de alto riesgo en el AI Act (aplicable desde agosto de 2027, posiblemente agosto de 2028). Datos de salud sujetos al RGPD. En EE. UU., la vía de la FDA | Javier / Marco |
| 14 | ¿Cuánto cuesta el marcado CE y cuánto tarda? | Estimamos 50.000–110.000 € y 12–18 meses. Está incluido en el punto de equilibrio de 300 pacientes | Marco |
| 15 | ¿Por qué 40 €? ¿Lo pagaría alguien en España? | Un ingreso evitado paga 9 pacientes un año. **[PENDIENTE: lo que os digan las clínicas privadas este fin de semana]** | Marco |
| 16 | ¿El 80 % es beneficio? | No: es margen de contribución por paciente, antes de los costes fijos | Marco |
| 17 | ¿Cuánto cuesta captar una clínica? | Estimamos ≈ 2.000 €, que se recuperan en unos 6 meses con 10 pacientes. Es una hipótesis que medirán los primeros pilotos | Marco |
| 18 | ¿Cuánta financiación necesitáis? | Para el piloto y el marcado CE, ≈ 150.000–200.000 € [S]. Ajustadlo al plan real del equipo | Marco |
| 19 | ¿Quiénes son los competidores? | Canary Speech (API en la nube) y Aural Analytics, ahora parte de Linus Health, orientados a ensayos clínicos. Los sensores de muñeca miden el temblor, no la voz. Nadie combina un hábito diario, una línea base personal, un dispositivo sin conexión, un informe para el médico y un modelo en castellano | Victor |
| 20 | ¿Y si el paciente deja de usarlo? | Sesiones de 3 minutos, racha de días seguidos y avisos. Si no hay sesiones, la clínica lo ve: el abandono también es una señal útil. Objetivo: ≥ 70 % | Victor |
| 21 | ¿Qué hace exactamente el Gregorio Marañón? | **[Respuesta exacta y honesta sobre la relación actual con el jefe de Neurología]** | Victor |
| 22 | ¿Por qué un dispositivo y no solo una app? | Muchos pacientes mayores no tienen smartphone o no lo usan con soltura. El dispositivo funciona sin conexión y se sincroniza en cada revisión | Javier |
| 23 | ¿Cuánto cuesta el dispositivo? | El prototipo, con una Raspberry Pi, ronda los [X] €. El de producción tiene un objetivo < 35 €, se presta y se reacondiciona | Javier |
| 24 | ¿Dónde se guardan los datos? | En el dispositivo hasta la sincronización, y después en servidores de la UE, cifrados y con consentimiento. El paciente puede pedir que se borren | Javier |
| 25 | ¿Cómo sabréis que ha funcionado? | La variable principal del piloto: días desde el cambio hasta la revisión, comparados con un grupo de control. Más los ingresos urgentes y la calidad de vida | Martin |

### Diapositivas de reserva (`#appendix`)

1. El algoritmo completo: las 12 fórmulas y el diagrama del proceso.
2. Las tarjetas de los estudios con su referencia completa.
3. **El mercado:** TAM / SAM / SOM con el cálculo de cada cifra y los datos de EE. UU.
4. La regulación: MDR (regla 11, clase IIa), AI Act, RGPD, ISO 13485 / IEC 62304 / ISO 14971 y la FDA.
5. El modelo financiero: el desglose de costes, la curva de repago y la sensibilidad (con un coste de 150 €, el margen sigue en ≈ 69 % y el equilibrio llega con ≈ 350 pacientes [C]).
6. Los competidores (tabla de abajo).
7. El diseño del piloto completo.
8. **El ictus y otras enfermedades:** los estudios que respaldan la voz en el ictus y la hoja de ruta.
9. El hardware: el despiece de la caja, los componentes y el esquema de conexiones.

### Competidores y alternativas (diapositiva de reserva 6, y apoyo para 3.2)

| | Seguimiento diario | Compara con el propio paciente | Funciona sin conexión o sin smartphone | Llega al médico con un informe | Pensado para la atención habitual |
|---|---|---|---|---|---|
| Visitas periódicas al neurólogo | ✗ | Parcial | ✓ | ✓ | ✓ |
| Sensores de muñeca para el temblor | ✓ | Parcial | ✗ | ✓ | Parcial |
| Apps genéricas de voz o logopedia | Parcial | ✗ | ✗ | ✗ | ✗ |
| Canary Speech / Aural Analytics | ✗ | ✗ | ✗ | Parcial | ✗ (ensayos clínicos, API) |
| **VoxWave** | **✓** | **✓** | **✓** | **✓** | **✓** |

---

## 12. Lista de tareas para este fin de semana

| Tarea | Para qué criterio | Quién | Hecho |
|---|---|---|---|
| Fotos y capturas con hora del estado actual (viernes) | 4.1 | Javier | ☐ |
| Mensaje al jefe de Neurología del Gregorio Marañón: problema, piloto y permiso para citarle | 1.1, 3.1, 4.2 | Victor | ☐ |
| Mensaje a la asociación: frase de apoyo, número de socios, ayuda con el piloto y **su nombre exacto** | 2.4, 4.2 | Victor | ☐ |
| Preguntar el precio a las clínicas privadas (≈ 40 €/mes) y pedir un correo de interés | 2.1, 2.2, 4.2 | Marco | ☐ |
| Confirmar cómo nombrar a cada socio y si se pueden usar logos | 1.1, 3.1 | Victor | ☐ |
| (Opcional) Actualizar el coste del ingreso con las tablas de costes por GRD del Ministerio de Sanidad | 2.2 | Marco | ☐ |
| **MVP:** cambiar los pacientes de ejemplo por **María** (dispositivo, historial, línea base y alerta) | 3.1 | Martin | ☐ |
| **Kling P1:** hoja de personaje de María + las 20 imágenes fijas (ver 1.4 y 1.5) | 5.2 | Victor | ☐ |
| **Kling P2 y P3:** bucles y transiciones prioritarias (ver la tabla de prioridades de 1.4) | 5.2 | Victor | ☐ |
| Foto real del dispositivo en una mesa de cocina (S05) y fotos del equipo para el antes y el después (S17) | 4.1, 5.2 | Javier | ☐ |
| Leer los estudios del ictus (sección 13) para defenderlo en las preguntas | 2.5, 5.3 | Martin | ☐ |
| Prueba de uso del dispositivo con ≥ 10 asistentes (tiempo, ayuda, SUS) | 4.2 | Javier | ☐ |
| 10 grabaciones con ruido: SNR y control de calidad | 4.2 | Martin | ☐ |
| (Opcional) Medidas reales de F0 e intensidad en la plataforma | 3.1, 4.1 | Martin | ☐ |
| Grabar el vídeo de reserva de la demo | 5.1 | Martin | ☐ |
| Montar la landing: las 20 diapositivas, los controles y las de reserva, hasta cumplir los criterios de aceptación de 1.7 | 5.1, 5.2 | Todos | ☐ |
| Probar la landing sin wifi en el portátil del pitch | 5.1 | Martin | ☐ |
| Fotos del domingo y rellenar todos los [PENDIENTE] | 4.1, 4.2 | Javier | ☐ |
| Dos ensayos completos cronometrados (objetivo: 7:30) y uno de preguntas | 5.1, 5.3 | Todos | ☐ |

---

## 13. Fuentes

**Magnitud del problema**
- GBD 2021, 11,8 M de personas con Parkinson en el mundo, citado en Su et al. (abajo).
- Su D. et al. *Projections for prevalence of Parkinson's disease and its driving factors in 195 countries and territories to 2050*. BMJ 2025. doi:10.1136/bmj-2024-080952 · [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11881235/) · [Nota de prensa de BMJ](https://bmjgroup.com/cases-of-parkinsons-disease-set-to-reach-25-million-worldwide-by-2050)
- OMS. *Parkinson disease, fact sheet* (2023) · [who.int](https://www.who.int/news-room/fact-sheets/detail/parkinson-disease) · *Technical brief* (2022) · [who.int](https://www.who.int/news/item/14-06-2022-launch-of-who-s-parkinson-disease-technical-brief)
- Coste en Europa: 22.800 M€ en 2019 y 28.800 M€ a precios de 2025, con 2,2 M de pacientes; España, 1.900 M€ en 2019 (EAN, COIN-Eu, *Movement Disorders* 2026) · [News-Medical](https://www.news-medical.net/news/20260827/Parkinsone28099s-disease-imposes-e282ac228-billion-economic-burden-across-Europe.aspx) · [Healio](https://www.healio.com/news/neurology/20260909/parkinsons-disease-costs-total-265-billion-in-europe)
- España: SEN, más de 200.000 personas y ≈ 10.000 diagnósticos nuevos al año · [The Objective, abril de 2026](https://theobjective.com/sociedad/ciencia/2026-04-10/diagnosticos-parkinson-espana-duplican-2012/) · Proyección hasta 2050 · [Redacción Médica](https://www.redaccionmedica.com/ultimas-noticias/20240410/la-sociedad-espanola-de-neurologia-estima-que-los-afectados-parkinson-se-triplicaran-en-proximos-anos/116967_0.html)
- Listas de espera: 111 días para una primera consulta de neurología en junio de 2025 · [Ministerio de Sanidad, SISLE](https://www.sanidad.gob.es/fr/estadEstudios/estadisticas/inforRecopilaciones/docs/Nota_Resumen_SISLE__jun25.pdf)
- Coste de un ingreso por Parkinson en España: *Measuring the burden of hospitalization in patients with Parkinson's disease in Spain*, PLOS ONE 2016. Media de 4.378 € por ingreso, 10 días de estancia y ≈ 120 M€ al año para el SNS; datos de 1997–2012 y estudio financiado por AbbVie · [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4792469) · Coste medio por alta en los hospitales del SNS, 6.005 € en 2024 · [Ministerio de Sanidad](https://www.sanidad.gob.es/va/estadEstudios/estadisticas/docs/CMBD/2024_nota_metodologica_costes.pdf)
- Ingresos hospitalarios: Low V. et al. *BMC Health Services Research* 2019, Inglaterra: 72 % no programados · [link](https://link.springer.com/article/10.1186/s12913-019-4092-3) · Coste medio ≈ 4.650 € · [UCB](https://ucb.com/our-science/magazine/detail/article/We-must-do-better-for-Parkinson-s-patients)

**Mercado**
- Instituto Cervantes, *El español en el mundo 2025*: ≈ 520 M de hablantes nativos y ≈ 636 M en total · [Euronews](https://es.euronews.com/2025/10/28/el-espanol-suma-30-millones-de-hablantes-y-alcanza-los-635-millones-en-el-mundo)
- Prevalencia en Latinoamérica: metaanálisis de 2023 (*Movement Disorders*), 472 por cada 100.000 (271–820) · [WashU](https://profiles.wustl.edu/en/publications/prevalence-and-incidence-of-parkinsons-disease-in-latin-america-a/)
- Marras C. et al. *Prevalence of Parkinson's disease across North America*. npj Parkinson's Disease 2018: 930.000 casos en EE. UU. en 2020 y 1,24 M en 2030 · [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6039505/)
- Van Den Eeden S.K. et al. *Incidence of Parkinson's disease: variation by age, gender, and race/ethnicity*. Am J Epidemiol 2003 · [PubMed](https://pubmed.ncbi.nlm.nih.gov/12777365/)
- Pearson C. et al. *Care access and utilization among Medicare beneficiaries living with Parkinson's disease*. npj Parkinson's Disease 2023 · [Nature](https://www.nature.com/articles/s41531-023-00523-y.pdf) · Cifras por grupo · [STAT](https://www.statnews.com/2023/07/10/parkinsons-diagnosis-neurologist-referral-medicare-patients/)
- Población hispana de EE. UU., 65,2 M en 2023 · [U.S. Census Bureau](https://content.govdelivery.com/accounts/USCENSUS/bulletins/3a5430f)
- Hispanos entre los mayores de 65 años: 9 % en 2019, 4,6 M de personas (ACL, *Profile of Older Americans* 2020 y *Profile of Hispanic Americans Age 65 and Older*) · [ACL 2020](https://acl.gov/sites/default/files/aging%20and%20Disability%20In%20America/2020Profileolderamericans.final_.pdf) · [ACL, perfil hispano](https://acl.gov/sites/default/files/Profile%20of%20OA/HispanicProfileReport2021.pdf)

**La voz como biomarcador**
- Logemann J.A. et al. *Frequency and cooccurrence of vocal tract dysfunctions in the speech of a large sample of Parkinson patients*. J Speech Hear Disord 1978; 43:47–57 (89 % de 200 pacientes) · [ASHA](https://pubs.asha.org/doi/abs/10.1044/jshd.4301.47)
- Ho A.K. et al. *Speech impairment in a large sample of patients with Parkinson's disease*. Behav Neurol 1998; 11:131–137 · [IOS Press](https://content.iospress.com/articles/behavioural-neurology/ben00019)
- Postuma R.B. et al. *How does parkinsonism start? Prodromal parkinsonism motor changes in idiopathic REM sleep behaviour disorder*. Brain 2012 · [PubMed](https://pubmed.ncbi.nlm.nih.gov/22561644/)
- Rusz J. et al. *Speech biomarkers in REM sleep behavior disorder and Parkinson disease*. Ann Neurol 2021; 90:62–75 · [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8252762)
- Illner V. et al. *Smartphone voice calls provide early biomarkers of parkinsonism in REM sleep behavior disorder*. Mov Disord 2024; 39:1752–1762 · [PDF](https://boris.unibe.ch/198982/1/Movement_Disorders_-_2024_-_Illner_-_Smartphone_Voice_Calls_Provide_Early_Biomarkers_of_Parkinsonism_in_Rapid_Eye_Movement.pdf)
- Little M.A. et al. *Suitability of dysphonia measurements for telemonitoring of Parkinson's disease*. IEEE TBME 2009; 56:1015–1022 · [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3051371)
- Tsanas A. et al. *Accurate telemonitoring of Parkinson's disease progression by noninvasive speech tests*. IEEE TBME 2010; 57:884–893 · [Aston](https://publications.aston.ac.uk/id/eprint/18332)
- Tsanas A. et al. *Novel speech signal processing algorithms for high-accuracy classification of Parkinson's disease*. IEEE TBME 2012; 59:1264–1271 · [Aston](https://research.aston.ac.uk/en/publications/novel-speech-signal-processing-algorithms-for-high-accuracy-class/)
- *NeuroVoz: a Castillian Spanish corpus of parkinsonian speech*, preprint arXiv:2403.02371 (Gregorio Marañón + UPM) · [arXiv](https://arxiv.org/html/2403.02371v3)
- Boersma P. *Accurate short-term analysis of the fundamental frequency and the harmonics-to-noise ratio of a sampled sound*. IFA Proceedings 1993 (base de la fórmula de HNR).

**Ictus**
- World Stroke Organization, *Global Stroke Fact Sheet 2022*: ≈ 12,2 M de ictus nuevos al año · [WSO](https://www.world-stroke.org/assets/downloads/WSO_Global_Stroke_Fact_Sheet_1.pdf) · Hay una edición de 2025 en el *International Journal of Stroke*: actualizad la cifra si cambia · [PubMed](https://pubmed.ncbi.nlm.nih.gov/39635884/)
- Disartria tras un ictus, 20–42 % de los supervivientes (citado en una revisión sistemática) · *BMC Neurology* 2022 · [link](https://link.springer.com/10.1186/s12883-022-02877-x)
- Detección del ictus por oclusión de un gran vaso a partir de tareas de habla grabadas con iPhone: AUC 0,89–0,97 (piloto con 10 pacientes y 10 controles) · [arXiv 2503.04802](https://arxiv.org/html/2503.04802v1)
- SONIVA: habla de ≈ 1.000 supervivientes de ictus y ≈ 7.000 controles (Imperial College London) · [medRxiv 2025](https://www.medrxiv.org/content/10.1101/2025.06.03.25328889.full.pdf) · Rasgos glóticos para detectar el deterioro temprano del habla · [Interspeech 2025](https://www.isca-archive.org/interspeech_2025/sanguedolce25_interspeech.pdf)
- Evaluación automática del habla tras un ictus con Whisper · [arXiv 2507.17326](https://arxiv.org/html/2507.17326v1)

**Regulación**
- MDR (UE) 2017/745, anexo VIII, regla 11: el software que informa decisiones clínicas es, como mínimo, de clase IIa.
- AI Act: los productos sanitarios con IA de clase IIa o superior se consideran de alto riesgo · [Taylor Wessing](https://www.taylorwessing.com/en/international-life-sciences-newsletter/life-sciences-legal-lens-vol-2/update-ai-enabled-medical-devices-and-ivds-confirmed-as-high-risk) · [IBA](https://www.ibanet.org/ai-based-medical-devices). La fecha de aplicación era agosto de 2027 y hay una propuesta de aplazarla a agosto de 2028: confirmar en qué quedó antes de citarla.

**Por verificar antes de decirlo:**
- **Los márgenes de Hinge Health (77 %) y Omada (61 %).** Vienen de sus resultados públicos.
- **Los datos del ictus.** Los estudios de voz en el ictus son pilotos y preprints; decidlo como "research shows", no como algo demostrado a gran escala.
