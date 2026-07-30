# Paso 2.6 — Registro `SOLAPAS`: qué se lee, qué se ignora y con qué encabezado

> **Qué es:** una hoja de registro nueva, `SOLAPAS`, que declara **el uso de cada solapa
> de cada base**. Hoy el motor solo sabe de las solapas que aparecen en `MAPEO`; las otras
> ~70 son invisibles, y entre ellas hay backups, tablas dinámicas, vistas con período
> tipeado a mano y **una copia de la base `rdv` adentro de `digital`**.
>
> Incluye la corrección de un bug del diagnóstico que causó una falsa alarma el 30/07.
>
> **No toca Slides, no siembra `MARCADORES`, no cambia `Union.gs`.**
> **Un commit por parte. Trabajamos en español.**
>
> ⚠ **Namespace (`PROYECTO.md` §9):** antes de nombrar cualquier función nueva,
> `grep -rn "function nombre" *.gs`.

---

## Parte A — Primero, el bug del diagnóstico

La auditoría AUD-1 dio vuelta la conclusión anterior: **los `sheet_id` son correctos, los
títulos de Drive son los esperados, y las ocho solapas congeladas en
`docs/FECHAS_seleccion.md` existen todas.** No hay archivos cruzados. `Union.gs` busca
nombres que sí existen.

Lo que falló fue el reporte. `DIAG_BASES` emitía dos categorías —`hoja_default ok` y
`sin mapear (informativo)`— y **las solapas mapeadas en `MAPEO` que no son
`hoja_default` no caían en ninguna: desaparecían de la salida.** Por eso faltaban
exactamente `RDV_otros_ministros`, `Directa Mail`, `Directa IVR`, `Directa SMS`,
`Seguimiento digital`, `Alcance`, `resumen_metricas_dinamico` y `M2 periodo DIGITAL` —
que son, una por una, las mapeadas no-default.

**Es el modo de falla de siempre, esta vez en la herramienta de diagnóstico:** no lanzó
error, devolvió una lista plausible a la que le faltaban filas, y esa lista casi provoca
que se "corrigieran" nombres que estaban bien.

1. Arreglá la clasificación para que sea **exhaustiva**: toda solapa del archivo tiene
   que salir en el reporte con exactamente una etiqueta. Agregá la categoría faltante
   (`mapeada`).
2. Agregá al final del reporte una línea de control:
   `total de solapas del archivo` vs. `total de filas emitidas`. **Si no coinciden, ⚠.**
   Un diagnóstico que puede omitir filas en silencio no sirve para lo que se usa.

→ **Commit A:** `Paso 2.6 ✅ — DIAG_BASES: clasificación exhaustiva + control de totales`

---

## Parte B — La hoja `SOLAPAS`

Registro nuevo, misma lógica que el resto: **el motor descubre, no cablea**.

| columna | contenido |
|---|---|
| `base_id` | de `BASES` |
| `solapa` | nombre exacto, tal cual `getName()` |
| `uso` | `fuente` / `derivada` / `referencia` / `ignorar` / `revisar` |
| `fila_encabezado` | número de fila del encabezado **de esta solapa** |
| `firma_encabezado` | reservada, vacía por ahora (ver Parte E) |
| `filas_datos` | último conteo observado, informativo |
| `notas` | motivo de la clasificación |

Valores de `uso`:

- **`fuente`** — cruda y mapeable. El motor puede leerla. Criterio del 30/07: encabezado
  en su fila declarada y **sin período escrito a mano arriba de los datos**.
- **`derivada`** — pivot, acumulado o vista del propio equipo. **No se lee.** Existe para
  que nadie la mapee por error.
- **`referencia`** — no se lee para producir el informe, pero sirve para **validar** o
  como catálogo.
- **`ignorar`** — backup, copia, tabla dinámica, hoja suelta. Ruido.
- **`revisar`** — sin decidir. **Es el default de todo lo que aparezca nuevo.**

Reglas de comportamiento, las tres importantes:

1. **`uso=fuente` es requisito para mapear.** `buscarMapeo()` sobre una solapa que no
   esté declarada `fuente` tiene que fallar con `«FALTA:…@solapa_no_fuente»`, no
   devolver el dato igual.
2. **`fila_encabezado` vive acá, no en `BASES`.** Esto resuelve el conflicto que quedó
   abierto en DOC-3 Parte D: `m2` tiene `fila_encabezado=3` a nivel base, pero
   `Cuentas` y `Cuentas M2` tienen el encabezado en la fila 1. Es un atributo de la
   solapa, no de la base. Si `BASES.fila_encabezado` sigue existiendo, que quede como
   default y `SOLAPAS` mande.
3. **`revisar` no se lee.** Igual que `ignorar` a efectos prácticos, pero visible como
   pendiente en el reporte.

→ **Commit B:** `Paso 2.6 ✅ — hoja SOLAPAS: esquema y reglas de uso`

---

## Parte C — `inventariarSolapas()` + ítem de menú

Función que recorre las bases activas y **hace upsert** en `SOLAPAS` por
`(base_id, solapa)`:

- solapa que **no estaba** → se agrega con `uso=revisar` y `notas='detectada <fecha>'`;
- solapa que **ya estaba** → se actualiza `filas_datos`, **y nada más**. El `uso`
  cargado por una persona no se pisa nunca;
- solapa registrada que **ya no existe** en el archivo → **no se borra**: se marca
  `notas='NO ENCONTRADA <fecha>'` y sale ⚠ en el reporte. Que alguien haya borrado o
  renombrado una solapa es justo lo que hay que ver, no lo que hay que limpiar.

El default `revisar` es lo que hace al registro seguro: el día que el dueño de una base
ajena agregue una hoja, aparece como pendiente. No se lee sola ni se ignora sola.

**Test:** correr dos veces → la segunda no cambia ningún `uso`. Renombrar una solapa a
mano en una base y volver a correr → sale ⚠ `NO ENCONTRADA` y la nueva entra como
`revisar`.

→ **Commit C:** `Paso 2.6 ✅ — inventariarSolapas() con upsert que no pisa decisiones humanas`

---

## Parte D — Clasificación propuesta

Sembrala como valores iniciales. **Es una propuesta, no una decisión**: todo lo que dice
`revisar` lo confirma el usuario, y cualquier fila se puede cambiar a mano después.

### `rdv` — "RDV JM CM ES + funcionarios"

| solapa | uso | motivo |
|---|---|---|
| `RVD JM-CM - ES` | fuente | base de encuentros, `hoja_default` |
| `RDV_otros_ministros` | fuente | mapeada; base ajena, ojo con la firma |
| `RVD JM-CM - ES Back Up` | ignorar | backup |
| `RDV_JM_CM_ES` | revisar | nombre casi idéntico al default — ¿duplicado? |
| `Para Revisar`, `Copia de Para Revisar`, `Copia de Para Revisar 1` | ignorar | copias de trabajo |
| `Tabla dinámica 4/14/16/18/19/20/23` | ignorar | pivots |
| `Hoja 56/59/68/78` | ignorar | hojas sueltas |
| `Aux_Maximos`, `Datos_Unpivot` | derivada | auxiliares de cálculo |
| `Visualiz_respuestas_GCBA`, `Visualiz_respuestas_JM`, `Visualiz_mail`, `Visualiz_SMS` | derivada | vistas |
| `Cantidad de reuniones por franja horaria` | derivada | agregado |
| `Desplegables`, `Organigrama`, `Mail propuesta` | ignorar | validaciones y material suelto |
| `Backup respuestas` | ignorar | backup |
| `Funcionarios / Ministros` | revisar | posible catálogo de personas — cruzar con `PERSONAS_equivalencias.csv` |
| `PPTS`, `RDV CONJUNTO`, `Agenda`, `Comunas`, `Seguimiento`, `Respuestas JM 📩` | revisar | sin decidir |

### `digital` — "Seguimiento Digital"

| solapa | uso | motivo |
|---|---|---|
| `Digital` | fuente | `hoja_default` |
| `Directa Mail`, `Directa IVR`, `Directa SMS` | fuente | canales de directa |
| `Seguimiento digital` | fuente | maestra de la unión del Paso 2.4 |
| `Alcance` | fuente | usada por `Union.gs` |
| **`RDV`** | **ignorar** | ⚠ **duplica la base `rdv`** — si se lee, hay doble conteo |
| `Buscador por periodo digital`, `Buscador por periodo directa` | ignorar | período tipeado a mano: violan el criterio de fuente cruda |
| `Digital 2026 acumulado`, `m2 digital` | derivada | acumulados |
| `RDV JM 2 VECES` | referencia | ⭐ ver Parte F |
| `Metricas informe`, `INFORME` | referencia | el informe manual actual |
| `Nomalización de barrios`, `Barrio Hab`, `Limpia Fun` | referencia | catálogos de normalización — útiles para el scoring del anclaje |
| `Cuentas`, `Filter unificado`, `EDV`, `CAMPAÑAS_DESGLOCE_DIGITAL`, `Mail per` | revisar | sin decidir |

### `looker` — "Base Looker"

| solapa | uso | motivo |
|---|---|---|
| `resumen_metricas_dinamico` | revisar | ⚠ ver Parte G — `hoja_default` apunta a la otra |
| `resumen_metricas` | revisar | ⚠ ídem |
| `MAIL`, `IVR`, `SMS`, `CC`, `DIGITAL`, `ALCANCE` | fuente | detalle por canal, con `ID cuentas` |
| `Desglose Alcance`, `Audiencias`, `Audiencias Conectadas`, `URLs`, `Cuentas` | revisar | sin decidir |
| `Desplegables` | ignorar | validaciones |

### `m2` — "M2 Reporte para Fede 2026"

| solapa | uso | motivo |
|---|---|---|
| `Cuentas M2` | fuente | 353 filas, encabezado fila 1 — dimensión de campañas M2 |
| `Cuentas` | revisar | 3453 filas, mismo encabezado — parece el universo completo, no solo M2 |
| `M2 periodo DIGITAL`, `M2 periodo DIRECTA` | revisar | el nombre sugiere vista por período; sin confirmar |
| `Directa mail`, `Seguimiento digital`, `Alcance`, `CAMPAÑAS_DESGLOCE_DIGITAL`, `Mail per` | revisar | ⚠ **mismos nombres que solapas de `digital`** — hay que saber cuál manda antes de mapear ninguna |
| `Digital acumulado`, `M2 Directa`, `M2 digital` | derivada | acumulados |

→ **Commit D:** `Paso 2.6 ✅ — clasificación inicial de las 86 solapas`

---

## Parte E — `firma_encabezado` (columna reservada, sin implementar)

Dejá la columna creada y vacía. La implementación es su propio paso: guardar la fila de
encabezado de cada solapa `fuente` y **fallar si cambió**. `inventariarSolapas()` ya
abre cada solapa, así que la mitad del trabajo va a estar hecha.

Vale para las cuatro bases: **ninguna es propia** (`rdv` y `digital` del equipo,
`Base Looker` de `dgples.comunicacion@gmail.com`, `M2` de `tarnowski.jp@gmail.com`).

Anotar en `PROYECTO.md` §7 que va **antes del 3-v2**.

→ **Commit E:** `Paso 2.6 ✅ — firma_encabezado reservada + nota de alcance`

---

## Parte F — `digital / RDV JM 2 VECES` es el conjunto de control

37 filas. Encabezado: `Funcionario | Barrio | Fecha | Estado | Enviados | Entregados |
Aperturas | % OR | Clics | % CTOR | Habitantes | Alcance manual | Alcance potencial |
% Cobertura | Frecuencia Meta | Impresiones Totales | Impresiones Social | Impresiones
Google | Impresiones Programm | Clics | % CTR | Base total | Base discada | Contactados |
% Cont. | Efectivos | % Efect. | Audiencia | Llamados realizados | Llamados atendidos |
% Atendidos | Escucharon +75% | % Escucha +75% | Marque 1`.

Eso es **exactamente la salida que el Paso 2.4 intenta construir**: un encuentro con
todos sus canales al lado. Alguien ya lo armó a mano.

Dos cosas que se sacan de ahí, y ninguna requiere mapearla:

1. **Es el test del anclaje.** Correr `anclarEncuentros` sobre esos 37 encuentros y
   comparar contra el link humano. Es la única validación real que existe hoy del
   scoring y del umbral 0.6 — mucho mejor que mirar cuántos caen en `bajaConfianza`.
2. **La clave del match humano es `(Funcionario, Barrio, Fecha)`**, no `Id Cuentas`: la
   tabla no tiene columna de cuenta. Si el scoring de `Union.gs` usa otras señales, vale
   contrastar.

Documentalo en `docs/DISENO_match_temario.md` y en `SOLAPAS.notas`. **No la mapees.**

→ **Commit F:** `Paso 2.6 ✅ — RDV JM 2 VECES registrada como conjunto de control del anclaje`

---

## Parte G — `looker`: existen las dos, y hay detalle por canal

**Las dos solapas existen en el mismo archivo:** `resumen_metricas_dinamico` y
`resumen_metricas`. `hoja_default` apunta a **`resumen_metricas`**; el `DIAG_FECHAS` del
30/07 y la metadata de Drive vieron `_dinamico` como primera solapa, y las letras de
columna que tiene cargadas `MAPEO` corresponden a **`_dinamico`**.

**No apliques DOC-3 Parte A todavía.** Antes:

1. Volcá la **fila 1 y el conteo de filas de las dos**. Si `resumen_metricas` tiene otro
   orden de columnas, entonces `MAPEO` está apuntando por letra a la solapa equivocada y
   **todo lo leído de `looker` hasta hoy salió de la columna de al lado** — sin fallar.
2. Recién con eso decide el usuario cuál queda como `fuente` y cuál como `derivada`.

**Y el hallazgo grande:** `looker` tiene el desglose por canal como solapas propias, todas
con `ID cuentas`: `MAIL` (5748 filas), `DIGITAL` (4563), `CC` (1299), `ALCANCE` (727),
`IVR` (190), `SMS` (86). Es decir, **el detalle por canal ya existe unido por cuenta
dentro de Looker**, que es parte de lo que `unirDigitalPorCuenta` está armando desde seis
solapas de `digital`.

Eso **no** cambia la decisión de `PROYECTO §5` (SD primaria, Looker rollup) —
pero sí abre la pregunta de si el Paso 2.4 está reconstruyendo algo que ya viene hecho, y
puede explicar el timeout: unir seis solapas cuando el join ya existe río arriba.
**Anotalo como pregunta, no lo resuelvas acá.**

→ **Commit G:** `Paso 2.6 ✅ — looker: dos resúmenes conviviendo + detalle por canal documentado`

---

## Lo que sigue abierto

- **¿`resumen_metricas` o `resumen_metricas_dinamico`?** Bloquea DOC-3 Parte A.
- **¿El Paso 2.4 rehace un join que Looker ya tiene?** Cruza con el timeout de 6 minutos
  de `menuProbarUnionYAnclaje_`, todavía sin diagnosticar (Tarea 7 de AUD-1).
- **`m2` repite cinco nombres de solapa de `digital`.** Cuál manda, sin decidir.
- **`Cuentas` (3453) vs. `Cuentas M2` (353)** en `m2`, mismo encabezado.
- **¿Los números de una campaña que repite semana van acumulados?** Define si
  `Snapshot.gs` es obligatorio.

---

## Prueba del usuario

1. Menú → **"Inventariar solapas"**. `SOLAPAS` tiene ~86 filas, una por solapa real.
2. La línea de control de `DIAG_BASES` da totales iguales, sin ⚠.
3. Cambiar un `uso` a mano, correr de nuevo: **no se pisa**.
4. Intentar leer una solapa con `uso=revisar` → `«FALTA:…@solapa_no_fuente»`, no un dato.
5. Revisar las filas en `revisar`: son las decisiones que quedan pendientes.
