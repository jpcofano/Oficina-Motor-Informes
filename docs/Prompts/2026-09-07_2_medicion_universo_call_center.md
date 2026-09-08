# 2026-09-07_2 — Medición del universo de Call Center sobre la base nueva

**Objetivo único:** medir qué universo de filas produce cada criterio candidato sobre
`Call Center - Métricas`, y **compararlo contra los dos números que el equipo ya publicó**.
⛔ **No cablear. No dar de alta la base. No escribir `BASES`, `SOLAPAS`, `MAPEO` ni
`MARCADORES`.** El alta y el cableado son prompts posteriores y ninguno se escribe sin este
resultado.

**Subagente: ninguno.**

| parte | modelo | effort | escribe |
|---|---|---|---|
| **A** | Sonnet | normal | ⛔ nada — sólo lectura, reportar y parar |
| **B** | **Opus** | **alto** | el instrumento de medición en `Auditoria.gs` + `clasp push` |
| **C** | Sonnet | normal | el `.md` de la medición, **sólo con el log de la corrida en mano** |

**B va en Opus y el motivo es explícito:** no publica un número, pero **elige los criterios que
se van a medir**, y un criterio que falta en la matriz no aparece como error — aparece como un
criterio ganador entre los pocos que se probaron. Es la figura de `X-28`: se barrieron 13
propiedades de ventana para algo que no era de ventana, y **0 de 13 no significó «no hay
regla»**.

**Sacrificabilidad:** A imprescindible. Si B no llega, se entrega sin `clasp push`. **C se cae
entera sin la corrida** y eso no es una pérdida: un `.md` de medición sin log es una
estimación con formato de dato.

---

## Lo que ya está medido, y no se vuelve a medir

⛔ **`CLAUDE.md` §1: un caso `exacto` es un número ESPERADO y el control es REPRODUCIRLO.**
Volver a medirlos produce un número nuevo sin testigo.

| ventana | cuenta que el deck publicó | `Base barrida` publicada |
|---|---|---|
| 24–31/07/2026 | `3289-JUNJDGAG`, 2 filas | **6.011** (`V-105`: 4726 + 1285) |
| 14–20/08/2026 | `3488-AGOJDGAG`, 3 filas | **6.851** |

**Decidido y fuera de discusión:** *Base barrida* y no *Base enviada* (`V-64`, `V-66`);
**sin filtro por `Tipo de llamado`** en el Resumen (`V-92`); suma de todas las filas de la
cuenta. ⚠ El iceberg de `L-035` **sí** filtra por tipo (`V-91`) y **está cerrado** — no se toca.

**Y el contexto que hace que esta medición valga la pena, que es `C-78`:** el mecanismo de
recorte para una lámina fija **ya existe** —fecha propia + `ambito` sobre columna propia, que
es como recorta `mail_entregados`—; lo que faltaba era que la solapa tuviera **una columna
donde expresarlo**. `Call Center - Métricas` trae `Remitente` (Q) **y** `Fecha` (K).

⭐⭐ **Decisión del usuario, 07/09/2026 — el corte de ámbito de Call Center es POSITIVO POR LOS
DOS LADOS:** `jm` es `Remitente = JM` y **`gcba` es `Remitente = GCBA`**, ⛔ **no `!= JM`**.

- **Diverge a propósito del molde de `ivr_vocero`**, que sí es `!= JM`. Son dos solapas y
  `DIMENSIONES_` indexa por `base|solapa` justamente para eso — no hay nada que unificar acá.
- ⭐ **La consecuencia es que `jm` y `gcba` NO parten el universo, y eso es lo buscado:** las
  **10 filas sin `Remitente`** (1970 de 1980) y cualquier tercer valor **quedan fuera de los
  dos ámbitos** en vez de caer en GCBA por defecto. Una fila con el remitente vacío o mal
  tipeado se vuelve **visible** en lugar de sumarse en silencio del lado equivocado.
- ⚠ **Por eso la matriz mide el residuo**, abajo: si `JM + GCBA + residuo` no da el total de la
  ventana, la medición está mal, no los datos.
- ⛔ **Esto NO deroga `ivr_vocero != JM`** ni pide revisarlo. Si algún día se revisa, es otro
  prompt.

⛔ **`C-78` también midió el modo de falla que hay que reproducir a propósito:** con el recorte
de los `imp_*` —pertenencia + nombre contiene JM + duración— sobre 14–20/08 sale
`3289-JUNJDGAG`, **la cuenta de junio**. `3488-AGOJDGAG` se llama *«TE CUENTO | SALUD Eje Sur
Viernes 14/8»* y **no dice JM**. Es `C-69`. **Un criterio nuevo que no separe estas dos cuentas
no sirve, aunque acierte el total.**

---

## Parte A — Premisas contra el repo

**Sonnet · normal · SÓLO LECTURA · termina en «reportar y parar».** ⛔ Cero ediciones.

1. **El censo del `2026-09-07_1` está en el repo o no.** Si su `.md` de resultado no existe,
   decirlo — este prompt se apoya en un log que puede no haber quedado escrito en ningún lado.
2. **`R-30`** — el tope por duración: transcribir su texto y decir si es **global** o por
   marcador, y si sigue vigente.
3. **`ventana_ref`** — `D-24` y `D-52`: qué valores admite, **si `'propia'` está entre ellos**,
   y qué hace el motor con una solapa que tiene columna de fecha propia. Citar el lector real,
   no el seed.
4. **`DIMENSIONES_.ambito`** — confirmar que **es expresable un corte positivo por los dos
   lados** (`= JM` / `= GCBA`), que es lo que decidió el usuario. Leer el **comparador real**
   —no el seed— y reportar: qué operadores admite un valor de `DIMENSIONES_`, y **qué hace con
   una celda VACÍA** bajo `=` (tiene que quedar fuera de los dos ámbitos, no caer en uno).
   ⛔ **Si el mecanismo no permite `=` por ambos lados, PARAR y reportar**: la decisión del
   usuario no sería implementable como está y eso se dice antes de medir, no después.
5. **Los casos del bloque `resumen_ejecutivo_jm` que nombran `cc_*`**, del CSV más nuevo que
   los nombre. ⚠ **El bloque entero, no los que este prompt nombra.** Manda la clave, no la
   nota.
6. **Máximos de ID** (`D-`, `R-`, `S-`, `X-`, `C-`) con el grep que los reproduce.

**Reportar y parar** si 2, 3 o 5 sale desmentida.

---

## Parte B — El instrumento

**Opus · effort alto.** Sólo si A pasó.

Escribir en `Auditoria.gs` un **wrapper público, sin `_` y SIN PARÁMETROS** —las dos
condiciones—, con el motivo arriba. **Greppear el nombre antes** (scope global de Apps Script).

```
function medirUniversoCallCenterBaseNueva() { … }
```

⛔ **No reimplementar la lectura:** usar `diagPlanillaExterna_` / los lectores que ya existen.
⛔ **No usar la aritmética del motor a mano:** esto mide **definiciones de negocio**, no el
motor, y **el reporte tiene que decir cuál de las dos cosas hizo** (`CLAUDE.md` §4, regla 2 y
regla 4).

**Qué mide, para cada una de las DOS ventanas** (24–31/07 y 14–20/08), sobre
`Call Center - Métricas` de `1f8Jy9S09EjWhXo-RF6llXnk8alQCJxWSZAdnfp3WR60`:

Por cada criterio candidato, devolver **cuatro cosas y no un veredicto**: cuántas filas
selecciona, **cuántas cuentas distintas** (`ID cuentas`, col P), la suma de `Base Barrida`
(col C), y **la lista de las cuentas** — la lista es lo que permite ver si `3289` entró donde
no debía.

Criterios a medir, **y la matriz no la cierra este prompt**: Opus la completa y **declara en el
reporte qué agregó y por qué**.

| # | criterio |
|---|---|
| 1 | `Fecha` (K) en ventana, **sin ningún otro corte** — la línea de base |
| 2 | `Fecha` en ventana + `Remitente` (Q) `= JM` |
| 3 | `Fecha` en ventana + `Remitente` **`= GCBA`** (el otro ámbito, positivo — ⛔ **no** `!= JM`) |
| 4 | ⭐ **el residuo**: `Fecha` en ventana y `Remitente` **ni `JM` ni `GCBA`** — con la **lista de valores crudos** de esas filas, las vacías incluidas |
| 5 | `Fecha` en ventana + `Remitente = JM` + `ID cuentas` (P) `~= JDGAG` |
| 6 | ⭐ el criterio de los `imp_*` trasladado: pertenencia + nombre `~= JM` — **el control negativo**, tiene que traer `3289` en agosto |

⭐ **La identidad que controla la medición, y falla en vez de informar:** `2 + 3 + 4` tiene que
dar **exactamente** el criterio `1`, en filas y en suma de `Base Barrida`, en **las dos**
ventanas. ⛔ Si no cierra, **eso es el hallazgo y la medición para acá** — no se reporta una
matriz cuyos números no se suman entre sí.

⭐ **Y dos mediciones que no son criterios y hacen falta igual:**

- **El censo de valores distintos de `Remitente`** en toda la solapa, con su conteo. `JM` /
  `GCBA` / `PC` es lo que se espera; cualquier otra cosa —y las **10 vacías**— cambia qué
  significa `!= JM`.
- **Qué formato tiene `Fecha` (K)** celda por celda en una muestra: la fila 2 se ve como
  `11/12/2023` pero **una columna con fechas tipeadas a mano está vetada por `R-02`**. ⛔ Si
  hay mezcla de `Date` y texto, **eso es el hallazgo** y hay que reportarlo antes que cualquier
  total: un formato desconocido **falla duro, no devuelve el valor crudo**.

⛔ **No decidir el ganador.** El instrumento mide; **quién gana es del usuario**, con la matriz
delante. Si un criterio reproduce los dos números, decirlo como observación y **no escribir
ninguna fila en ningún lado**.

`clasp push` como comando **separado**, nunca encadenado con `&&` a través de un pipe.
Después: **avisar y parar.** La corrida es del usuario.

---

## Parte C — El documento

**Sonnet · normal.** ⛔ **Sólo con el log de la corrida pegado.** Sin log, esta parte no se hace
y se reporta que no se hizo.

Crear `docs/MEDICION_universo_call_center_2026-09-XX.md` (fecha real de la corrida), **congelado,
uno nuevo por medición**, según la fila de `CLAUDE.md` §7 que declara dueño a `MEDICION_*`.

⛔ **No crear ningún otro `.md`.** ⛔ **No editar `CONFIG_INFORMES.md` §4.7 ni `PLAN.md`**: la
regla provisoria de `X-28` sigue vigente hasta que el usuario decida, y una medición no la
deroga.

Declara: la fecha de lectura de la base, la matriz completa con las cuatro salidas por criterio
y ventana, los dos números esperados y **cuáles criterios los reproducen y cuáles no** — los que
fallan **con su lista de cuentas**, que es la mitad que explica por qué.

---

## Reporte

```
PARTE A — premisas
  1 log del censo 09-07_1 en el repo ... sí / no
  2 R-30 vigente y alcance ............. global / por marcador   [cita]
  3 ventana_ref admite 'propia' ........ sí / no   [lector real, no el seed]
  4 ambito admite '=' por ambos lados .. sí / no ⛔   celda VACÍA: qué hace   [comparador real]
  5 casos del bloque entero ............ …
  6 máximos de ID ...................... D-__ R-__ S-__ X-__ C-__

PARTE B
  wrapper escrito .......... sí / no    nombre grepeado antes: sí / no
  criterios medidos ........ los 6 + los que agregué: …  (por qué)
  identidad 2+3+4 = 1 ...... cierra / NO CIERRA ⛔   (filas y Base Barrida, las dos ventanas)
  formato de Fecha (K) ..... Date / texto / MEZCLA ⛔
  valores de Remitente ..... …  (con conteos, y las vacías)
  clasp push ............... sí / no

PARTE C
  .md creado ............... sí / no se hizo (sin log)

BLOQUEANTES
FUERA DE ALCANCE  —  anotar, no arreglar
```

⛔ **No inventar el faltante.** Si el prompt no alcanza, se reporta como falta: un supuesto
razonable metido en silencio es indistinguible de una instrucción y sobrevive a la corrida.
