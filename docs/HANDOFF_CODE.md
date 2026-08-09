# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-09, tras la corrida nocturna `_9`, el `_10` + `10.1`, el `_12`
y los tres addenda del `2026-08-09_1` · último commit al escribirlo: `738ed6d`

## Dónde estamos

**Nada de cableado todavía.** Se midió estructura, se escribieron reglas y se prepararon cuatro
prompts. **El único cambio de código del día son 57 líneas de `Union.gs`** (`N4`+`N5`), que no
cambian el comportamiento del motor: hacen visible lo que la unión descartaba en silencio.

**El orden está fijado y no se cambia: `_11` → `_10` → `2026-08-09_1` → `_8`.**

| prompt | qué hace | estado |
|---|---|---|
| **`_11`** `2026-08-07_11_fase2_sellador.md` | crea `LAMINAS` (con `estado` y `falta`) | **siguiente.** Corre despierto, nunca de noche |
| **`_10`** + `10.1` | el operador `CONTIENE`, `R-15 Add 2`, filas de `MARCADORES` | puntos 1–5 del `10.1` hechos; falta la Parte B |
| **`2026-08-09_1`** + `1.1` `1.2` `1.3` | cablear láminas 2 y 3, declarar solapas congeladas | los tres addenda leídos y medidos; **la Parte A no arrancó** |
| **`_8`** | cerrar láminas 1 a 6 de `JM` | último |

**El `_10` va antes del `2026-08-09_1` sí o sí:** su Parte B agrega el operador `CONTIENE`, y la
señal de la Parte B del `_1` es *`nombre_campaña` contiene `JM`*, hoy inexpresable. Y los dos
escriben en `MARCADORES`.

## Dos cosas que se pierden si no quedan escritas

### 1 · `ignorar` protege lo que se publica, no lo que se mide

**Primera vez que queda escrito.** El corte de `uso = ignorar` está en **un solo lugar**:
`Config.gs:244-247`, dentro de **`buscarMapeo`**. Ni `abrirHoja` (`Fuentes.gs:78`) ni
`leerFuente` (`:613`) consultan `usoSolapa_`, y **está declarado a propósito** en
`Fuentes.gs:623-625`.

- **Sí apaga los marcadores** que leen de esa solapa → `«FALTA:…@solapa_no_fuente(base/solapa)»`,
  visible y con motivo.
- **No apaga la solapa.** Diagnósticos, auditorías y cualquier llamada directa la siguen leyendo.

**El hueco que abre y que no tiene mecanismo:** si aparece una solapa congelada que **además** se
lee por camino directo, `ignorar` no alcanza. **Hoy no pasa** —por eso `digital.hoja_default` se
mueve a `Seguimiento digital`— pero el hueco existe y queda en `PENDIENTES`.

### 2 · Tres veces el mismo patrón, y las tres se corrigieron midiendo

**Cuando algo parece roto en los datos, medir primero cómo se está mirando.** Ya está en
`CLAUDE.md` §4 como aprendizaje; acá van los tres casos juntos, que es lo que lo hace evidente:

| lo que se creyó | lo que era | qué lo destapó |
|---|---|---|
| *"`looker` es ilegible entero"* | una llamada mal construida — ventana con fechas en texto, y `formatearFecha_` exige `Date` | `contarLecturaBase_('looker')`: 949 filas, 26 en ventana |
| *"los seis `pauta_*` publican un cero falso"* | `String(celda)` antes de mirar el tipo **disfraza un booleano de texto**; `Number(true)===1`, así que `SUMA` sobre booleano **es** el conteo de `true` | `resolverMarcadores('jm')`: `estado=ok`, `valor=1` |
| *"`ignorar` bloquea la lectura"* | bloquea `buscarMapeo`, no `leerFuente` | `buscarMapeo("looker","Cuentas",…)` contra el control |

**Las tres: la premisa era del instrumento, no del dato.**

## Con qué entra la Parte A del `2026-08-09_1`

Confirmado por los tres addenda:

- **`R-22`** (no `R-21`, que está tomado por *Prioridad de selección de encuentros*,
  `REGLAS_NEGOCIO.md:1063`), **con el párrafo literal del `1.3` §1** sobre qué apaga `ignorar` y
  qué no. Sin ese párrafo nacería prometiendo protección que el mecanismo no da — el defecto que
  obligó a marcar `R-20` como `SIN MECANISMO`.
- **`looker/Cuentas` vuelve a `fuente`**, con la acotación de dimensión en `notas`: se usa para
  `id_cuentas`, `nombre_campaña` y los cortes; **ningún marcador toma un número de ahí**.
- **`digital/Digital` y `CAMPAÑAS_DESGLOCE_DIGITAL` a `ignorar`.**
- **`BASES.digital.hoja_default` → `Seguimiento digital`, en commit aparte**, por el precedente
  `alineoHojaDefaultLooker` (`Instalar.gs:627-644`). **Control:** el conteo de
  `contarLecturaBase_('digital')` tiene que cambiar; si no cambia, el default no se movió.
- **`gcba_imp_total` y `gcba_frecuencia` como provisorios** en `PENDIENTES`: la congelación se
  midió sobre filas `JM` y esos dos filtran `dig_jm_gcba!=JM`. **Nadie midió su universo.**
- **`enc_impresiones` y `enc_alcance` a `LAMINAS.falta`**, lámina 6 en **`parcial`**, no `cerrada`.
- **La poda de `imp_total`/`contenidos_total` va última**, después de que existan `imp_meta`,
  `imp_google` e `imp_prog`. Al revés borra la única fila que produce el número.

## Esperando decisión tuya

- **`pauta_*` no tiene señal de figura.** Los seis no tienen filtro, así que `pauta_*` y
  `gcba_pauta_*` **publican el mismo número**. La Parte B fija `CONTIENE JM` + resta para
  impresiones; para `pauta` no lo dice nadie. Si no se resuelve, va a `PENDIENTES` y sigue.
- **Las láminas 2 y 3 descansan en una sola observación** (`C-16`): el deck del 07/08 es SECCO y
  no tiene resumen ejecutivo. La aproximación de impresiones **no se distingue de una regla
  equivocada** hasta que aparezca un segundo deck `JM`. Que `LAMINAS.notas` lo diga.
- **`R-20` y `R-21` están escritas y sin mecanismo.** `R-20` necesita una segunda ruta de lectura
  de `rdv` que no pase por la lista blanca; `R-21` necesita que `leerReuniones_` filtre por
  `periodo_id` y que `resolverVentana` llegue a `hoy()`.
- **`X-16`** — de qué fuente salen los `imp_*` del deck del 31/07 sigue sin saberse.
  `CAMPAÑAS_DESGLOCE_DIGITAL` quedó **descartada por medición**.

## Qué mirar antes de tocar algo

- **`MARCADORES` no tiene columna `estado`.** `REVISAR` lo calcula el motor en runtime
  (`Generador.gs:752`) y su disparador sólo lo puebla `LISTA`. No se puede "poner un marcador en
  `REVISAR`" escribiendo una celda.
- **`parsearFiltro_` tiene UN parser y TRES consumidores**: `Generador.gs:428`, `:1180` y
  `:1241-1245` (este último inline). Agregar `CONTIENE` en uno solo deja dos filtrando mal **en
  silencio**. Verificar las tres líneas contra `HEAD` — los números envejecen.
- **`normalizarValorDeclarado_` no pliega case ni acentos** (`Fuentes.gs:385-388`), así que
  `CONTIENE JM` sería case-sensitive.
- **`rdv/RDV_otros_ministros` tiene un solo campo en `MAPEO`** y su `fecha_periodo` resuelve a
  `hora_cita_evento` — funciona **porque los encabezados están corridos** (`C-09`). Arreglar
  `C-09` obliga a rehacer ese `MAPEO` **en el mismo commit**, o ministros se rompe en silencio.
- **`leerFuente` con ventana armada a mano falla** si las fechas van como texto.
- **Los números no se validan acá.** Alcance cambiado el 09/08: la validación contra decks
  publicados vive en la otra conversación. Acá se mide **estructura** — qué solapas y columnas
  existen, si un campo está en `MAPEO`, qué rompe un cambio de código.

## Números de referencia — remedidos el 09/08

`MARCADORES` **51 filas**, 14 columnas. `SECCIONES` 36. `MAPEO` 140. `REUNIONES` 7. `CAMPANAS` 3.
Plantilla `jm`: 22 láminas, 172 tokens. Operaciones del motor: **siete**.

Unión digital (`2026-07-24 → 2026-07-30`): maestra 979 filas / 840 con id / **763 cuentas** / 77
pisadas. Anclaje: **5 anclados, 0 sinLink, 0 baja confianza**. Huérfanas: `Digital` 922 de 1297
(71,1 %), `Directa Mail` 631 de 2162 (29,2 %).

`STATUS REUNIÓN` en `rdv/RVD JM-CM - ES` (1362 filas): `Realizada` 662 · `Suspendida` 58 ·
**`en agenda` 7** · `Reprogramada` 2 · `Se modifico el barrio` 1 · vacío 632.
