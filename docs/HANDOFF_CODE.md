# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-09, al cerrar el `_11` (Fase 2 de `D-23`) · último commit al
escribirlo: `ddeda60`

## Dónde estamos

**Las 51 láminas están selladas.** Es la primera vez que el motor escribe sobre las plantillas
vivas, y quedó verificado con un control corrible.

```
SECCO_marcada   29 láminas · L-001 … L-029
JM_marcada      22 láminas · L-030 … L-051
LAMINAS         51 filas · 7 escondidas marcadas · seccion_id vacío en las 51
verificarLaminas()  VERDE — 51/51/51, sin huecos, repetidos ni desajustes
```

**El orden que sigue, y no cambia: `_10` → `2026-08-09_1` → `_8`.**

| prompt | qué falta |
|---|---|
| **`_10`** + `10.1` | **siguiente.** Puntos 1–5 del `10.1` hechos; falta la **Parte B**: el operador `CONTIENE`, `R-15 Addendum 2` y las filas de `MARCADORES` |
| **`2026-08-09_1`** + `1.1` `1.2` `1.3` | los tres addenda leídos y medidos; la Parte A no arrancó |
| **`_8`** | último |

**El `_10` va antes sí o sí:** su Parte B agrega `CONTIENE`, y la señal de la Parte B del `_1` es
*`nombre_campaña` contiene `JM`*, hoy inexpresable. Y los dos escriben en `MARCADORES`.

## Con qué entra el `_10`

- **`R-20` acotada y marcada `SIN MECANISMO`** — ya escrita en `REGLAS_NEGOCIO.md`. No se toca.
- **`C.4` retirado** — la poda de derivados no corre: borraría `imp_total`, la única fila que
  produce ese número, y `imp_meta`/`imp_google`/`imp_prog` no existen en `MARCADORES`.
- **⚠ `parsearFiltro_` tiene UN parser y TRES consumidores**: `Generador.gs:428`, `:1180` y
  **`:1241-1245` (inline, en la rama `CAMPANAS` de `itemsDeSeccion_`)**. Agregar el operador en
  uno solo deja dos filtrando mal **en silencio** — `f.negado` sería `false` y caerían a igualdad
  exacta. **Verificar las tres líneas contra `HEAD`: los números envejecen.**
- **`normalizarValorDeclarado_` no pliega case ni acentos** (`Fuentes.gs:385-388`), así que
  `CONTIENE JM` sería case-sensitive.
- **El símbolo propuesto es `~=`** (y `!~=` para el negado): ASCII, sobrevive al round-trip de la
  planilla, mantiene la forma `campo<op>valor`. Medido: **ninguno de los 7 filtros que existen
  hoy** contiene `~`, `CONTIENE`, `~=`, `%`, `*=` ni `::`.
- **`R-15 Addendum 2` está bloqueado** y no por tiempo: `looker/CC` no tiene `fecha_periodo` ni
  filas en `MAPEO`, `nombre_campaña` no existe como campo lógico en ninguna base, y esa solapa no
  tiene esa columna. Si se escribe, va marcado `SIN MECANISMO` como `R-20`.

## Lo que dejó el `_11` y conviene no perder

- **`verificarLaminas()`** — control de cierre corrible, en el menú *Plantillas*. Compara
  plantilla contra hoja. **La plantilla es autoritativa**: si divergen, se repara la fila.
- **`ORDEN_SELLADO_` es fijo, no derivado.** No puede salir de `leerInformes()`: ese orden es el
  de las filas de una hoja que se edita a mano, y **un `lamina_id` asignado no se reusa nunca**.
- **`seccion_id` quedó vacío en las 51 filas**, a propósito (`B.4`): el sellador no deduce nada.
  ⚠️ **Pero NO son trabajo humano** —así lo había escrito y está mal—: **el mapeo se deriva**, y
  ya está documentado en tres lugares. Lo siembra el **`2026-08-09_15`**, que va **después del
  `2026-08-09_1` y antes del `_8`**.
  - Tres vías —por `familia_tokens`, por nombre, por orden— **medidas por separado**, y la tabla
    que importa es **el cruce**: qué dice cada vía para cada una de las 51 y si coinciden.
  - **Se siembra donde al menos dos coinciden y ninguna contradice.** Una sola vía no alcanza.
  - **Las contradicciones se listan primero: son un hallazgo sobre los documentos, no sobre la
    lámina.** Y la ambigüedad es el dato — Resumen Ejecutivo tiene `mail_`, `imp_`, `cc_`, `ivr_`
    y `pauta_` a la vez, y `familia_tokens` está vacío en varias filas de `SECCIONES`.
  - **El resultado esperado NO es 51 de 51.** Un sembrador que llena todo es un sembrador que
    adivinó.
- **`borrarNotasDeLamina`** es la única función que llama `setText` sobre notas de una plantilla
  viva, autorizada sólo por `C-01` addendum 4, con las tres guardas adentro.

## Esperando decisión tuya

- **`pauta_*` no tiene señal de figura.** Los seis no tienen filtro, así que `pauta_*` y
  `gcba_pauta_*` **publican el mismo número**.
- **`looker/Cuentas` vuelve a `fuente`** con la acotación de dimensión — pendiente de la Parte A
  del `2026-08-09_1`.
- **`X-16`** — de qué fuente salen los `imp_*` del deck del 31/07. `CAMPAÑAS_DESGLOCE_DIGITAL`
  quedó **descartada por medición**.
- **`R-20` y `R-21` están escritas y sin mecanismo.**
- **¿El registro fila por fila?** Hoy `sellarPlantilla` escribe el bloque de filas **después** de
  anexar todas las anclas de esa plantilla, así que **una fila sin ancla es imposible**. El caso
  inverso —anclas sin fila si algo corta en el medio— es recuperable por la reparación. Cambiarlo
  a fila por fila cuesta 51 escrituras en vez de 2.

## Qué mirar antes de tocar algo

- **Verificar el camino del menú, no sólo el de la API.** El bug del orden de sellado existía sólo
  en `menuSellarPlantillas_`; `C.1` no lo atrapó porque probó llamando desde el CLI en orden
  explícito. **Son dos caminos y hay que correr los dos.**
- **`MARCADORES` no tiene columna `estado`.** `REVISAR` lo calcula el motor en runtime
  (`Generador.gs:752`) y su disparador sólo lo puebla `LISTA`.
- **`uso = ignorar` corta en `buscarMapeo` (`Config.gs:244-247`), no en `leerFuente`.** Apaga los
  marcadores, **no la solapa**: los caminos que no pasan por `MAPEO` la siguen leyendo.
- **`rdv/RDV_otros_ministros`** tiene un solo campo en `MAPEO` y su `fecha_periodo` resuelve a
  `hora_cita_evento` — funciona **porque los encabezados están corridos** (`C-09`). Arreglar
  `C-09` obliga a rehacer ese `MAPEO` en el mismo commit.
- **Los números no se validan acá.** La validación contra decks publicados vive en la otra
  conversación. Acá se mide **estructura**.

## El patrón que ya lleva tres casos

**Cuando algo parece roto en los datos, medir primero cómo se está mirando.** `CLAUDE.md` §4, con
su borde: la regla vale cuando **el instrumento propio reproduce lógica que el motor ya tiene** y
la reproduce peor. **No vale cuando la medición es de la salida del motor contra un hecho
externo** — ahí el motor es el sospechoso, y así se encontraron `parsearFiltro_` sin `contiene`,
`leerReuniones_` sin filtro por `periodo_id` y los seis `pauta_*` sin `filtro`.

| se creyó | era |
|---|---|
| `looker` ilegible entero | ventana con fechas en texto; `formatearFecha_` exige `Date` |
| los `pauta_*` publican cero | `String(celda)` disfraza un booleano; `Number(true)===1` |
| `ignorar` bloquea la lectura | bloquea `buscarMapeo`, no `leerFuente` |

## Números de referencia — 09/08

`MARCADORES` **51 filas**, 14 columnas. **`LAMINAS` 51 filas, 13 columnas** (decimosexta hoja de
`HOJAS_CONFIG_`, cuarta `auditada: false`). `SECCIONES` 36. `MAPEO` 140. `REUNIONES` 7.
`CAMPANAS` 3. Plantillas: `jm` 22 láminas / 172 tokens, `secco` 29. Operaciones del motor: siete.

Unión digital (`2026-07-24 → 2026-07-30`): maestra 979 filas / 840 con id / **763 cuentas** / 77
pisadas. Anclaje: 5 anclados, 0 sinLink, 0 baja confianza. Huérfanas: `Digital` 922 de 1297,
`Directa Mail` 631 de 2162.
