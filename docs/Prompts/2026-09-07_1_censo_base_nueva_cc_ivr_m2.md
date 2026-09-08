# 2026-09-07_1 — Censo de la base nueva de Call Center / IVR / M2

**Objetivo único:** producir la evidencia para decidir el alta de una base nueva.
⛔ **No cablear. No escribir `MARCADORES`. No escribir `BASES`, `SOLAPAS` ni `MAPEO`.**
El alta es otro prompt, y no se escribe sin el reporte de la corrida.

**Subagente: ninguno.**

| parte | modelo | effort | escribe |
|---|---|---|---|
| **A** | Sonnet | normal | ⛔ nada — sólo lectura, reportar y parar |
| **B** | Sonnet | normal | un wrapper de censo en `Auditoria.gs` + `clasp push` |

**Sacrificabilidad, en este orden:** si no alcanza el presupuesto, **A es lo imprescindible**.
B se puede entregar sin `clasp push` (se reporta y lo corre el usuario). ⛔ Nunca al revés:
B sin A es escribir un instrumento contra premisas sin verificar.

---

## Contexto — de dónde salen los datos de este prompt

La planilla es nueva y **la trajo el usuario en la conversación**. Todo lo que este prompt
dice sobre **su contenido** es **declarado, no medido**: llega de un pegado de encabezados,
no de una lectura. Las letras de columna son **conteo sobre el orden pegado**, hechas en
claude.ai, y **no las verificó nadie contra la planilla**.

⚠ **Ese es exactamente el material que la Parte 0 existe para no creer.** El repo lleva
cuatro prompts seguidos con una premisa central falsa, y en los cuatro la cazó una medición
previa. Acá la medición contra la planilla **no la puede hacer Code** —no tiene acceso a las
bases— así que se parte en dos: **A verifica contra el repo**, y **B escribe el instrumento
para que el usuario mida**.

**Lo declarado por el usuario, para que quede citable y con su origen:**

- `sheet_id` = `1f8Jy9S09EjWhXo-RF6llXnk8alQCJxWSZAdnfp3WR60`
- Tres solapas de interés: **`Call Center - Métricas`**, **`IVR`**, **`M2 - Gráficos2`**.
- La base **convive con `looker/CC`; no la reemplaza.** Lo ya validado en `looker/CC` queda
  vigente (decisión del usuario, 07/09/2026).
- La base trae además **`Mail`** y **`SMS`**, y **no se dan de alta ahora**.
- El corte **JM / GCBA** de Call Center es la columna **`Remitente`**; el de IVR sigue
  siendo **`Vocero`**.
- La solapa `IVR` de esta base es **acumulado**.
- `M2 - Gráficos2` es una solapa que **el usuario creó hoy** con encabezados pensados para el
  motor, alimentada por dos fórmulas sobre `M2 - Gráficos`: un bloque `A:G` filtrado a 2026 y
  cuatro columnas **sin filtrar**, de largo distinto.

**Encabezados declarados** (⚠ letras = conteo sin verificar):

| solapa | columnas declaradas |
|---|---|
| `Call Center - Métricas` | A `Campaña` · B `Base total` · C `Base Barrida` · D `Contactados U` · E `Efectivos` · F `Positiva` · G `Neutral` · H `Negativa` · I `Tipo` · J `Operadores` · K `Fecha` · L `ID BASE` · M `Estado` · N `Audiencia` · O `Área` · P `ID cuentas` · Q `Remitente` · R `Tipo de llamado` · S `Año` · T `Mes` · U `Semana` · V `Herramienta` |
| `IVR` | A `ID cuentas` · B `Estado` · C `Implementador` · D `Inicio` · E `Fin` · F `Dias` · G `Vocero` · H `Telefono` · I `Nombre campaña \| Directa` · J `Audiencia` · K `Llamados⏎Realizados` · L `Llamados⏎Atendidos` · M `%⏎Atendidos` · N `Escucharon⏎ +75%` · O `%⏎+75%` · P `Marque 1` · Q `%⏎Marque 1` · R `Segmentacion` · S `Área` · T `Eje` · U `Audio` · V `Nomenclatura` · W `semana` · X `semana_año` · Y `mes_nro` · Z `mes_nro_año` · AA `mes_texto` · AB `año` · AC `Nombre campaña Mail` · AD `Nombre campaña \| Cuentas` · AE `Herramienta` |
| `M2 - Gráficos2` | recién creada — forma **no declarada**, la mide B |

⚠ **Seis encabezados de `IVR` traen salto de línea adentro**, y uno (`Escucharon⏎ +75%`) además
un espacio antes del `+`. `MAPEO.encabezado` es **testigo textual**: si el alta lo escribe
tipeado en vez de copiado del censo, el testigo nace desalineado y **no falla nada**.

---

## Parte A — Verificación de premisas contra el repo

**Sonnet · effort normal · SÓLO LECTURA · termina en «reportar y parar».**

⛔ **No editar ningún archivo en esta parte, ni siquiera para «dejar anotado» un hallazgo.**

Verificar, cada una con el comando que la reproduce, y reportar **verificada / desmentida /
no se pudo**:

1. **`BASES` no conoce esta planilla.** Que `1f8Jy9S09EjWhXo-RF6llXnk8alQCJxWSZAdnfp3WR60` no
   aparezca en `SEED_BASES_` ni en ningún `.gs` ni `.md` del repo.
   ⛔ **Si aparece, PARAR y reportar**: no es un alta, es una base ya registrada y este prompt
   está mal planteado.
2. **`DIMENSIONES_.ambito` (en `Fuentes.gs`) no tiene entrada para `looker|CC`** — ni bajo `jm`
   ni bajo `gcba`. Reportar la lista completa de claves `base|solapa` que sí tiene, en las dos.
3. **`looker/CC`** está en `SEED_SOLAPAS_` como `fuente`, con `ventana_ref: 'Cuentas'`, y
   **sin columna temporal propia**. Reportar sus filas de `SEED_MAPEO_` con letra y encabezado.
4. **`looker/IVR`** está en `uso = 'ignorar'`. Reportar el motivo declarado y su `R-NN`.
5. **Los casos de validación que nombran Call Center.** Leer el **CSV más nuevo que los nombre**
   y reportar estado y clave de `X-28`, `X-37`, `V-64`, `V-66`, `V-90`, `V-91`, `V-105`.
   ⚠ **Cruzar el BLOQUE `resumen_ejecutivo_jm` entero**, no sólo los casos que este prompt
   nombra — un prompt nombra los casos que conoce, que es el sesgo a compensar.
   ⚠ **Manda la clave del caso, no su nota.**
6. **`digital/Directa IVR`**: confirmar que `ivr_vocero` está mapeado en la columna **G** y
   reportar su encabezado declarado, y las filas de `SEED_MAPEO_` de esa solapa con letra y
   encabezado — es el candidato a «misma tabla» que B va a poder desmentir o no.
7. **Máximos de ID vigentes**, con el grep que los reproduce, sobre `.md` **y** `.gs`:
   `D-`, `R-`, `S-`, `X-`, `C-`. (Al escribir este prompt daban `D-60`, `R-34`, `S-06`,
   `X-43`; si no coinciden, gana la medición.)
8. **Qué D-NN / R-NN / S-NN podría estar derogando un alta de esta base.** Buscar y reportar
   —**no resolver**— cualquier decisión sobre bases nuevas, sobre `looker/CC` o sobre el corte
   de ámbito de Call Center. Si el alta derogaría alguna, **decirlo y parar**.

**Reportar y parar.** No seguir a B por cuenta propia si alguna de 1, 5 u 8 salió desmentida.

---

## Parte B — El instrumento de censo

**Sonnet · effort normal.** Sólo si A terminó sin desmentidos bloqueantes.

Escribir en `Auditoria.gs` un **wrapper público, sin `_` final y SIN PARÁMETROS** —las dos
condiciones, o no aparece en el desplegable de Apps Script—, con el motivo escrito arriba:

```
function censarBaseNuevaCallCenterIVR() { … }
```

**Antes de escribirlo, greppear el nombre** (`grep -rn "function censarBaseNuevaCallCenterIVR" *.gs`):
Apps Script concatena todos los `.gs` en un scope global y una colisión pisa en silencio.

**Qué hace, y nada más:**

- Llama a **`diagPlanillaExterna_`** con el `sheet_id` de arriba. ⛔ **No reimplementar la
  lectura**: la función ya existe y es la que hay que usar.
- Para **cada** solapa de la planilla —no sólo las tres de interés—, vuelca nombre, filas ×
  columnas.
- Para **`Call Center - Métricas`**, **`IVR`** y **`M2 - Gráficos2`**, además:
  - la fila de encabezados **celda por celda, con `JSON.stringify` de cada valor y su letra de
    columna**. ⭐ El `JSON.stringify` no es adorno: es lo único que hace **visibles** los `\n`
    y los espacios de borde, que son el modo de falla que este censo viene a atrapar.
  - el conteo de **filas con dato** por columna (para `M2 - Gráficos2`, que tiene dos bloques
    de **largo distinto** y donde un conteo único mentiría).
- Devuelve por **`Logger.log`** además de por `return` — el editor no muestra el valor de
  retorno.

⛔ **No escribe ninguna hoja de registro. No toca `BASES`, `SOLAPAS`, `MAPEO` ni `MARCADORES`.**
⛔ **`reuniones/Call` tiene `uso = 'ignorar'`: no se lee, no se audita, no se mapea y no se
menciona en el reporte.**

⚠ **El `sheet_id` va escrito en el wrapper y eso está bien acá**, porque el wrapper es un
instrumento de medición de un solo uso y no configuración del motor. ⛔ Si termina en un
`SEED_*`, eso ya es el alta y no es este prompt.

**`clasp push` como comando separado, nunca encadenado con `&&` a través de un pipe** — el
exit code sería el del filtro, no el del push.

Después: **avisar y parar.** La corrida la hace el usuario.

---

## Lo que este prompt NO contesta, y hay que decirlo

- **Si `IVR` es la misma tabla que `digital/Directa IVR`.** El censo da encabezados y
  conteos; el veredicto es del prompt siguiente. ⚠ El usuario ya declaró que esta es
  **acumulado**, lo cual las separa — pero eso es una declaración, no una medición.
- **Si `Fecha` (col K) de `Call Center - Métricas` destraba `X-28`.** Que exista una columna
  temporal propia es condición necesaria y no suficiente: `X-28` pregunta **por qué el bloque
  mira otro universo que el resto de su lámina**, y eso lo contesta el equipo.
- **Si `Remitente` reproduce el corte JM/GCBA.** Está declarado por el usuario y **no medido
  contra ningún deck**.
- **Nada sobre `L-015`.** Esa lámina tiene `rol = equipo` y su gate está en `SEGURIDAD.md` §2.6.

---

## Reporte

```
PARTE A — premisas
  1 BASES no conoce la planilla ......... verificada / desmentida / no se pudo   [comando]
  2 DIMENSIONES_.ambito sin looker|CC ... …
  3 looker/CC forma y MAPEO ............. …
  4 looker/IVR uso=ignorar .............. …
  5 casos del bloque resumen_ejecutivo_jm …   (bloque entero, no sólo los nombrados)
  6 digital/Directa IVR · ivr_vocero col G …
  7 máximos de ID ....................... D-__ R-__ S-__ X-__ C-__   [comando]
  8 D/R/S que un alta derogaría ......... …

PARTE B
  wrapper escrito ....... sí / no      nombre grepeado antes: sí / no
  clasp push ............ sí / no / no se corrió
  (si no se corrió: qué falta para correrlo)

BLOQUEANTES  —  lo que impide seguir, o "ninguno"
FUERA DE ALCANCE  —  lo que apareció y merece prompt propio (anotar, no arreglar)
```

⛔ **No inventar el faltante.** Si el prompt no alcanza para saber qué hacer, eso se reporta
como falta. Un supuesto razonable metido en silencio es indistinguible de una instrucción y
sobrevive a la corrida.
