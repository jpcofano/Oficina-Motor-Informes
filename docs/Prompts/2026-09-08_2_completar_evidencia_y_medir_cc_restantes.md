# 2026-09-08_2 — Completar la evidencia de Call Center y medir los tres `cc_*` que faltan

**Objetivo único:** dejar `cc_*` medido y documentado entero.
⛔ **No cablear. No dar de alta la base. No escribir `BASES`, `SOLAPAS`, `MAPEO` ni
`MARCADORES`.** El alta y el cableado son el prompt siguiente, y no arrancan con un marcador
sin medir.

**Subagente: ninguno.**

| parte | modelo | effort | escribe |
|---|---|---|---|
| **A** | Sonnet | normal | ⛔ nada — sólo lectura, reportar y parar |
| **B** | Sonnet | normal | completa los dos `.md` parciales + el fixture |
| **C** | **Opus** | **alto** | el instrumento para `cc_campanias`, `cc_contactados`, `cc_contact_pct` |

**C va en Opus** porque diseña la matriz de una medición cuyo resultado va a decidir tres
números publicables, y **una hipótesis metida como criterio único se confirma sola**.
**B es volcado de un log** y no decide nada.

**Sacrificabilidad:** A imprescindible. Si falta presupuesto se sacrifica **B**: los logs están
pegados y no se pierden. ⛔ Nunca sacrificar C dejando B a medias — un documento completo sobre
un marcador y nada sobre los otros tres es peor que dos documentos parciales declarados.

---

## ⭐ Los dos logs van PEGADOS por el usuario en el mismo mensaje que este prompt

⛔ **No transcribirlos de ningún reporte anterior y no reconstruirlos de memoria.** Son la
segunda corrida de `censarBaseNuevaCallCenterIVR` y `medirUniversoCallCenterBaseNueva`, las dos
del **08/09/2026 a las 05:56–05:57**.

⛔ **Si los logs NO están en el mensaje, PARAR** y reportar que faltan. La Parte B existe
justamente porque la vez anterior el log vivió sólo en una conversación.

---

## ⭐⭐ Lo que la segunda corrida agrega, y es un dato nuevo

Es la **primera vez que hay dos lecturas de la misma base con el mismo instrumento**: la
medición corrió a las **00:26** y otra vez a las **05:57** del mismo día.

**Salieron idénticas.** Mismas 1980 filas, mismo censo de `Remitente` en los seis valores,
misma matriz de nueve criterios en las dos ventanas, misma sonda con las cuatro filas de
`3488`. El censo también: 38 solapas, mismas formas.

⛔ **Y hay que escribir el límite junto al dato, o el dato miente:** cinco horas de la misma
madrugada **no dicen** que la base sea estable. Dicen que no se movió en esa ventana. Lo que sí
prueban es lo otro, que era la duda real: **el instrumento es determinista** — dos corridas
sobre la misma entrada dan lo mismo, así que una diferencia futura será de la base y no del
método.

⚠ **Y ya sabemos que esta base se mueve:** la cuarta fila de `3488` con fecha `13/08` no estaba
en la lectura del 22/08 sobre `looker/CC`. Eso no lo contradice esta doble lectura.

---

## Parte A — Premisas

**Sonnet · normal · SÓLO LECTURA · «reportar y parar».** ⛔ Cero ediciones.

1. **Los dos logs están pegados en el mensaje** — sí / no. ⛔ Si no, parar acá.
2. **Los dos `.md` de la Parte B existen y están declarados parciales.** Reportar
   `docs/MEDICION_universo_call_center_2026-09-08.md` y
   `docs/CENSO_solapas_directa_acumulado_2026-09-07.md`: qué declara cada uno como faltante.
   ⭐ **Y decir si `§7` permite completarlos o si un «congelado» sólo admite un archivo nuevo.**
   ⛔ Si `§7` dice que nadie los edita, **parar y reportar**: la salida sería un archivo nuevo
   con la fecha de la segunda corrida, y eso es una decisión, no un detalle.
3. **`docs/_fixtures/README.md`** — leerlo entero y reportar el formato que declara, si declara
   alguno. ⛔ **Si no declara formato, no inventar uno**: reportar y dejar el fixture para un
   prompt que lo defina.
4. **`C-62`** — la clave y la nota completas, del CSV más nuevo que lo nombre. Es el caso que
   el reporte anterior propuso para reconciliar `cc_campanias`, y **la Parte C tiene que saber
   si dice lo que se le atribuye**.
5. **Los casos de `cc_contactados` y `cc_contact_pct`** en el bloque `resumen_ejecutivo_jm`
   entero: qué números publicados hay, con qué ventana y qué estado. ⭐ **Ése es el número
   esperado de la Parte C, y sale del repo, no de este prompt.**
6. **Máximos de ID** con el grep que los reproduce. (Al escribir esto: `V-127`, `C-111`,
   `X-43`, `D-60`, `R-34`, `S-06`.)

---

## Parte B — Completar la evidencia

**Sonnet · normal.** Según lo que A haya resuelto en la premisa 2 sobre editar vs. crear nuevo.

**B.1 — la medición.** Volcar del log pegado lo que faltaba: **los criterios 5 a 9**, **las
listas de cuentas de los nueve** en las dos ventanas, y **la sonda de `3289` y `3488` fila por
fila**. Agregar la doble lectura y su límite, tal como está escrito arriba.

**B.2 — el censo.** Volcar **las 38 solapas con su forma** y los **encabezados celda por celda**
de las tres de interés, con los seis `\n` de `IVR` y los conteos por columna.

⭐ **Ahora sí se escriben los encabezados como medidos**, porque salen del log. ⛔ Lo que no se
puede hacer es lo de la vez pasada: copiar los que el prompt `_1` traía **declarados**.

**B.3 — el fixture**, sólo si la premisa 3 encontró un formato declarado.
Congelar las **filas que la sonda imprimió** de `3289-JUNJDGAG` (3 filas) y `3488-AGOJDGAG`
(4 filas), con su fecha de lectura.

⛔ **Declararlo PARCIAL con todas las letras:** son las filas de dos cuentas, no la solapa. Sirve
para reproducir `V-126` y `V-127` y para nada más. Un fixture que se cree completo es peor que
no tenerlo.

⛔ **No crear ningún otro `.md`.** ⛔ **No tocar `CONFIG_INFORMES.md`, `PLAN.md`,
`REGLAS_NEGOCIO.md`, `PENDIENTES_consistencia.md` ni ningún CSV de casos.**

---

## Parte C — Los tres marcadores que faltan

**Opus · effort alto.**

`V-126` y `V-127` validaron **`cc_base` y sólo `cc_base`**. Faltan **`cc_campanias`**,
**`cc_contactados`** y **`cc_contact_pct`**.

Escribir un **wrapper público sin `_` y SIN PARÁMETROS**, greppeando el nombre antes. Reusar
`valorPasaFiltro_`, `normalizarValorDeclarado_`, `parsearFechaCelda_` y `opSUMA` — ⛔ **no
reimplementar el comparador ni la aritmética**. Y declarar en el encabezado **qué mitad es del
motor y cuál es definición de negocio**.

**El criterio de recorte ya está decidido y no se vuelve a barrer:** `Fecha` en ventana +
`Remitente = JM`. Lo validaron `V-126` y `V-127` en las dos ventanas. ⛔ **Medir sobre ese
recorte, no buscar uno nuevo.**

**`cc_contactados` y `cc_contact_pct`** son directos: `Contactados U` (col D) sobre el mismo
recorte, y el cociente contra `Base Barrida`. ⭐ Contrastar contra **los números que la premisa
5 haya encontrado en el repo** — ⛔ y si el repo no tiene un contactados publicado para alguna
de las dos ventanas, **eso se reporta como falta y no se inventa un esperado**.

**`cc_campanias` es el que no es obvio, y acá está la trampa.** El deck publicó **2** en julio
y **3** en agosto, y el recorte trae **3 filas en las dos**.

⚠ **Hay una hipótesis en danza y va como UNA candidata más, nunca como la única:** que
`cc_campanias` sea la cantidad de **`Tipo de llamado` (col R) distintos** en la ventana. En
julio las tres filas se llaman `Convocatoria`, `Convocatoria`, `Confirmación` → 2; en agosto
`Convocatoria`, `Confirmación`, `IVR Convocatoria` → 3.

⛔⛔ **Y el motivo por el que no alcanza:** eso se leyó de la columna **`Campaña` (A)**, que es
la que la sonda imprime, **no de `Tipo de llamado` (R)**. Coinciden porque el nombre de la
campaña arranca con el tipo. **Son dos columnas distintas y la hipótesis se apoya en la que no
es.** Medir las dos por separado y reportarlas por separado.

Candidatas a medir, **y Opus completa la lista y declara qué agregó y por qué**:

| # | candidata |
|---|---|
| 1 | filas del recorte (la línea de base — da 3 y 3, falla en julio) |
| 2 | `Tipo de llamado` (R) **distintos** |
| 3 | `Campaña` (A) **distintos** |
| 4 | filas con `Base Barrida` ≠ 0 (lo que se le atribuye a `C-62` — ⚠ contra lo que A midió que `C-62` dice de verdad) |
| 5 | `ID BASE` (L) distintos |

⭐ **Salida por candidata: el número Y el desglose que lo produce**, en las dos ventanas. Un
conteo sin desglose no deja ver si acertó por la razón correcta — y **dos ventanas que dan 2 y
3 las acierta cualquier cosa con la forma parecida**.

⛔ **No elegir ganador.** Si dos candidatas aciertan las dos ventanas, **eso es el hallazgo**:
significa que estas dos ventanas no las discriminan, y hace falta una tercera. Decirlo, no
desempatar.

`clasp push` como comando **separado**, nunca encadenado con `&&` a través de un pipe.
Después **avisar y parar**: la corrida es del usuario.

---

## Reporte

```
PARTE A
  1 logs pegados ................ sí / no ⛔
  2 los dos .md y §7 ............ completar / archivo nuevo   [qué dice §7]
  3 _fixtures/README formato .... declara / NO declara ⛔
  4 C-62 dice de verdad ......... …
  5 esperados de contactados .... julio: __  agosto: __  (o: no hay)
  6 máximos ..................... V-__ C-__ X-__ D-__ R-__ S-__

PARTE B
  medición completada .......... sí / archivo nuevo / no
  censo completado ............. sí / archivo nuevo / no
  fixture ...................... creado PARCIAL / no se hizo (sin formato)

PARTE C
  wrapper escrito .............. sí / no    nombre grepeado antes: sí / no
  candidatas ................... las 5 + las que agregué: …  (por qué)
  clasp push ................... sí / no

BLOQUEANTES
FUERA DE ALCANCE  —  anotar, no arreglar
```

⛔ **No inventar el faltante.** Si el prompt no alcanza, se reporta como falta.
