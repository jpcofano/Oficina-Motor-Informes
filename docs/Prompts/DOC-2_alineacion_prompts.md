# DOC-2 — Alinear prompts y esquema con la clave `(base_id, solapa, campo_logico)`

> **Qué es:** una pasada de consolidación sobre los prompts que **todavía no se
> ejecutaron** (`Paso-2.4`, `Paso-2.5`, `Paso-3-v2`, `Paso-4`, `Paso-5`) y sobre el
> esquema de `MARCADORES`, para que reflejen las decisiones tomadas en las sesiones del
> 30/07. Hoy varios de esos prompts dan instrucciones que **ya no compilan** contra el
> código vivo.
>
> **No toca Slides, no calcula nada, no siembra `MARCADORES`.** Es corrección de
> contratos y de documentación, más un cambio de esquema acotado.
>
> **Un commit por parte. Trabajamos en español.**
>
> ⚠ **Namespace (`PROYECTO.md` §9):** antes de nombrar cualquier función nueva,
> `grep -rn "function nombre" *.gs`.

---

## Por qué ahora

El 2.3.2 cambió la clave de `MAPEO` de `(base_id, campo_logico)` a
**`(base_id, solapa, campo_logico)`** y eliminó `resolverCampo()`. Ese cambio no se
propagó a los prompts que vienen después. Concretamente:

- `Paso-2.4.md` línea 37 declara `resolverCampo` como parte de la API disponible.
  **Ya no existe.**
- `Paso-2.5.md` y `Paso-3-v2.md` cablean marcadores con `base_id` + `campo_logico`
  **sin solapa**. Con la clave nueva eso ya no identifica una fila de `MAPEO`: `digital`
  tiene seis solapas. Es el mismo agujero que motivó el 2.3.2, un nivel más arriba.
- `Paso-2.5.md` escribe la columna `calculo` y su reporte de cobertura cuenta
  `operacion` — columna que recién crea `Paso-3-v2` Parte A.
- `Paso-4.md` y `Paso-5.md` apuntan a cuatro documentos que DOC-1 movió a
  `Plan Inicial/_archivo/`.

**El modo de falla es el caro:** ninguna de estas cosas rompe en tiempo de escritura.
Rompen cuando alguien corre el paso y obtiene un número plausible de la solapa
equivocada.

---

## Parte 0 — Verificar supuestos contra el código vivo (sin commit)

Este prompt se escribió leyendo el repo **sin** los commits del 2.3.1/2.3.2, que no
estaban pusheados. Antes de editar nada, confirmá el estado real y **adaptá los nombres
si difieren** — no inventes una API que no existe:

```bash
grep -rn "function buscarMapeo\|function resolverCampo\|function resolverClave_" *.gs
grep -rn "solapa" Fuentes.gs Fechas.gs Instalar.gs | head -40
grep -rn "'fecha'\|fecha_periodo" Fuentes.gs Instalar.gs
```

Tres preguntas que la respuesta de esos greps tiene que contestar, y que cambian lo que
escribís abajo:

1. ¿La columna nueva de `MAPEO` se llama `solapa`, o se reusó la columna `hoja` que ya
   existía en el esquema (`['base_id','campo_logico','hoja','columna','notas']`)?
   **Si conviven `hoja` y `solapa` con el mismo dato, decilo en el reporte y no las
   unifiques por tu cuenta** — es una decisión del usuario.
2. ¿`leerFuente()` pasa como solapa el `nombreHojaOverride` efectivo
   (`hoja.getName()`), o sigue resolviendo contra la base? **Este es el bug con más
   probabilidad de estar vivo:** `resolverClave_(baseId)` no recibía solapa, así que
   `leerFuente('digital', v, 'Directa Mail')` puede estar resolviendo la columna clave
   de otra solapa. Si es así, reportalo — se arregla en el 2.3.x, no acá.
3. ¿Convive `campo_logico='fecha'` (el que consume `leerFuente`) con
   `fecha_periodo` (el del 2.3.x)? Si sí, hay **dos contratos de fecha** y el filtrado
   por ventana está usando el viejo.

Escribí los hallazgos en el reporte final de este paso. **No los arregles acá.**

---

## Parte A — Esquema de `MARCADORES`: `operacion`, `valor_fijo`, `solapa`

El conflicto `calculo` / `operacion` se resuelve sacándolo de los dos prompts: **el dueño
del esquema es `Instalar.gs`**, no `Paso-2.5` ni `Paso-3-v2`. Los dos pasan a asumirlo
hecho.

En `Instalar.gs`, encabezados de `MARCADORES` (hoy línea ~81):

```js
['marcador','familia','informe_id','base_id','solapa','campo_logico',
 'periodo_ref','operacion','valor_fijo','formato','notas']
```

1. **Renombrá `calculo` → `operacion`** con una migración idempotente al estilo de
   `asegurarColumna_`: si la hoja viva tiene `calculo`, se renombra el encabezado **en
   su lugar**, conservando los valores. Si ya dice `operacion`, no hace nada. **No
   crear una columna nueva y dejar la vieja al lado** — quedan dos verdades.
2. **Agregá `valor_fijo`** (para `operacion=TEXTO`) y **`solapa`** (ver Parte B).
3. Actualizá las 3 filas de ejemplo de `MARCADORES` para el esquema nuevo.
4. `seedConfiguracion` tiene que poder correrse dos veces seguidas sin duplicar
   columnas ni pisar valores cargados.

**Test:** correr el instalador sobre la planilla viva. La columna `calculo` no existe
más, `operacion` conserva lo que hubiera, y aparecen `solapa` y `valor_fijo` vacías.
Correr de nuevo: sin cambios.

→ **Commit A:** `DOC-2 ✅ — MARCADORES: operacion + valor_fijo + solapa (migración idempotente)`

---

## Parte B — `solapa` en `MARCADORES` y regla de resolución

**El problema:** un marcador declara `base_id=digital`, `campo_logico=mail_enviados`.
Con la clave nueva eso no alcanza para encontrar la fila de `MAPEO`. Los prefijos
`dig_*`/`mail_*`/`sms_*` hoy tapan el agujero, pero el 2.3.2 ya estableció que esos
prefijos **son la solapa metida adentro del nombre**, no una convención — y quedaron
marcados para limpieza. Si `MARCADORES` depende de ellos, la limpieza rompe 200 filas.

Regla a implementar en el resolvedor (Parte C del `Paso-3-v2`, **acá solo se documenta**):

| caso | qué hace |
|---|---|
| `solapa` cargada | se usa tal cual |
| `solapa` vacía y la base tiene **exactamente una** solapa en `MAPEO` | se usa esa, y **la traza dice que fue inferida** |
| `solapa` vacía y la base tiene **más de una** | error → `«FALTA:token@sin_solapa»` |

Es deliberadamente distinto del default silencioso que el 2.3.2 rechazó: acá la
inferencia **queda escrita en la traza**, y el caso ambiguo falla ruidosamente en vez de
devolver la fila de al lado. Ojo que **`rdv` ya tiene dos solapas mapeadas**
(`RVD JM-CM - ES` y `RDV_otros_ministros`), así que la fila 2 de esa tabla aplica a menos
bases de las que parece.

Documentalo en `docs/TOKENS.md` (sección de esquema de `MARCADORES`) y en
`PROYECTO.md` §3.

→ **Commit B:** `DOC-2 ✅ — regla de resolución de solapa en MARCADORES (TOKENS.md, PROYECTO §3)`

---

## Parte C — `SEED_MAPEO_` y `SEED_BASES_` quedaron en la clave vieja

`Instalar.gs` línea ~208: las ~40 filas de `SEED_MAPEO_` se escriben con
`{ base_id, campo_logico, hoja, columna, notas }` y **sin `solapa`**. Si alguien vuelve a
correr `seedConfiguracion` después del 2.3.2, siembra filas que `buscarMapeo()` no va a
encontrar nunca, o duplica las existentes según cómo esté armado el `upsert`.

1. Reescribí `SEED_MAPEO_` con la clave nueva (o con `hoja` cumpliendo ese rol, según lo
   que haya devuelto la Parte 0).
2. **`rdv/fecha` → `fecha_periodo`, columna E** — alinearlo con la selección congelada en
   `docs/FECHAS_seleccion.md`. Si `leerFuente` todavía busca `'fecha'`, dejá la fila
   vieja marcada como derogada en `notas` en vez de borrarla, y anotalo en el reporte.
3. **`looker`: `hoja_default` y las filas de `MAPEO` dicen `resumen_metricas`;
   `DIAG_FECHAS` detectó `resumen_metricas_dinamico`.** No adivines cuál es: dejá el
   valor actual, agregá `notas: 'VERIFICAR — DIAG_FECHAS detectó resumen_metricas_dinamico'`
   y ponelo primero en el reporte final. Si el nombre está mal, la base entera se lee
   vacía o se lee otra cosa.
4. **No agregues** las filas de `BASES` con `base_id` sufijado (`rdv_ministros`,
   `digital_mail`, …) que planeaba una sesión anterior: ese modelo quedó descartado a
   favor de `solapa` en la clave. Si aparecen en algún doc, marcalas derogadas.

**Test:** `seedConfiguracion` dos veces seguidas sobre la planilla viva → `MAPEO` no
gana filas en la segunda corrida, y ninguna fila nueva queda con solapa vacía.

→ **Commit C:** `DOC-2 ✅ — SEED_MAPEO_/SEED_BASES_ a la clave nueva + marcas de verificación`

---

## Parte D — `docs/Prompts/Paso-2.4.md`

Editá el archivo (no lo reescribas de cero; conservá la estructura A/B/C/D):

1. **Línea ~37:** sacá `resolverCampo` de la lista de API disponible. Reemplazalo por
   `buscarMapeo(base_id, solapa, campo_logico)` con la firma real que devolvió la
   Parte 0, y agregá: *"exige `solapa`, no tiene default"*.
2. **Tabla de solapas (líneas 27–34):** incluye una solapa **`Alcance`** que no aparece
   en el `DIAG_FECHAS` del 30/07. Marcala `⚠ verificar que exista` en vez de darla por
   sentada. Sumá la advertencia de que **`digital` tiene además una solapa `RDV` con el
   mismo contenido que la base `rdv`**: si el join la levanta, hay **doble conteo**.
3. **Punto 2 de la Parte A** dice que los prefijos por solapa evitan que los campos se
   pisen. Reformulalo: la que separa es **la solapa en la clave de `MAPEO`**; los
   prefijos son residuales y están marcados para limpieza. El join no debe depender de
   ellos.
4. **Parte B punto 1** asume que `leerFuente('rdv', ventana)` viene ventaneado por la
   `FECHA` real. Agregá la precondición explícita: *"requiere `rdv/RVD JM-CM - ES/
   fecha_periodo = E` cargado en `MAPEO` y verificado con R-01. Si no está, este paso no
   corre."*
5. **Bloque nuevo al inicio, "Precondición de negocio sin resolver":** `digital` está
   registrada como `modo_periodo=snapshot`, así que hoy **las cinco columnas de fecha
   elegidas para sus solapas no las usa nadie**. Eso está bien mientras el recorte lo
   haga el link campaña↔encuentro, y deja de estarlo si el equipo responde que **una
   campaña se reporta en todos los períodos en que estuvo activa** — en ese caso hace
   falta `fecha_desde`/`fecha_hasta` y una condición de solapamiento, y las seis
   elecciones de `digital`/`looker` se quedan cortas. **Anotar que la respuesta del
   equipo puede invalidar el diseño de esta parte.**
6. **Reconciliación 4** (usar `upsertSoloVacias_`) está bien y se mantiene: es la que
   evita que 2.5 rompa `seedConfiguracion`.

→ **Commit D:** `DOC-2 ✅ — Paso-2.4 alineado con la clave nueva de MAPEO`

---

## Parte E — `docs/Prompts/Paso-2.5.md`

1. **Tabla de columnas de la Parte A:** `calculo` → `operacion`; agregá `solapa` y
   `valor_fijo`, las tres **vacías a propósito** (son criterio humano, igual que
   `base_id`).
2. **Sacá el pedido de modificar `upsertPorClave_`** (punto 3, el bloque ⚠). Reemplazalo
   por: *"usá `upsertSoloVacias_`, variante nueva. **No modifiques `upsertPorClave_`**:
   `seedConfiguracion` depende de que pise la fila entera."* Esto ya estaba anotado en
   `Paso-2.4` Reconciliación 4 y hay que trasladarlo al archivo que lo va a ejecutar.
3. **Parte B (cobertura):** ahora es coherente contar `base_id` + `campo_logico` +
   `operacion`. Sumá `solapa` a la condición de "completo" **solo cuando la base tenga
   más de una solapa mapeada** (regla de la Parte B de este prompt).
4. **Bloque de bloqueo, arriba de todo:** *"Este paso no se corre hasta que la
   armonización de plantillas (`2.2.2 Parte D`, JM canónica) esté verificada. Sembrar
   antes es sembrar ~200 filas de tokens rotos, y deshacerlo es a mano."*

→ **Commit E:** `DOC-2 ✅ — Paso-2.5: operacion/solapa/valor_fijo, upsertSoloVacias_ y bloqueo por armonización`

---

## Parte F — `docs/Prompts/Paso-3-v2.md`

1. **Parte A entera queda obsoleta** (el rename y `valor_fijo` los hace la Parte A de
   este prompt). Reemplazala por una nota corta: *"El esquema ya trae `operacion`,
   `valor_fijo` y `solapa` desde DOC-2. Verificá y seguí."* Conservá la tabla de
   operaciones, que sigue siendo el contrato.
2. **"Antes de empezar" reabre Looker vs. Seguimiento Digital y recomienda Looker.**
   Está cerrado a favor de **SD primaria, Looker = rollup** (`PROYECTO §5`,
   `HALLAZGOS §4`, y el 2.3 ya sembró `digital`). Reescribilo como decisión tomada, con
   el link a la evidencia. **No es una pregunta al usuario.**
3. **Parte C punto 3:** para `base_id=digital`, los datos se piden al proveedor del
   2.4 (`filasDigitalDeEncuentro`), **no** a `leerFuente` directo — `ctx.filas` plano no
   sirve para seis solapas unidas.
4. **Parte C punto 2:** agregá la resolución de solapa (Parte B de este prompt) como
   paso previo a pedir los datos, y que la traza diga de qué solapa salió el número.
   `"SUMA de 'inscriptos' (col K)"` no alcanza cuando la base tiene seis hojas.
5. **Caché:** la clave es `(base_id, solapa, desde, hasta)`. Hoy dice
   `(base_id, hoja, …)` — que es lo mismo si `hoja` es la solapa, pero conviene que el
   nombre sea uno solo en todo el repo.
6. **Precedencia RDV→SD→Looker:** aclarar que es **criterio de cableado** (qué `base_id`
   se escribe en cada fila de `MARCADORES`), no un motor de merge automático.

→ **Commit F:** `DOC-2 ✅ — Paso-3-v2: sin Parte A, decisión SD cerrada, proveedor de 2.4 y solapa en la traza`

---

## Parte G — `Paso-4.md` y `Paso-5.md`: referencias rotas

DOC-1 movió documentos a `Plan Inicial/_archivo/` y estos dos prompts quedaron
apuntando a rutas que no existen. Code no va a fallar: va a seguir sin leerlas.

| prompt | referencia rota | dónde está ahora |
|---|---|---|
| `Paso-4.md` | `docs/JM_tokens_marcados.md` | `Plan Inicial/_archivo/JM_tokens_marcados.md` |
| `Paso-4.md` | `docs/SECCO_tokens_marcados.md` | `Plan Inicial/_archivo/SECCO_tokens_marcados.md` |
| `Paso-5.md` | `docs/CAMPANAS.md` | `Plan Inicial/_archivo/CAMPANAS.md` |
| `Paso-5.md` | `Plan Inicial/Periodos_y_campanias.md` | `Plan Inicial/_archivo/Periodos_y_campanias.md` |

Corregí las rutas **y agregá la advertencia de que son documentos archivados**: si
contradicen `docs/TOKENS.md` o `PROYECTO.md`, manda el vivo.

Dos correcciones más en `Paso-4.md`:

5. La nota de que *"las plantillas que te entregué están como `.pptx` y hay que
   subirlas"* está superada por el 2.2.2: `INFORMES` ya apunta a la plantilla canónica en
   `Sistema Informes en Slides` (regla **C-01**). Reemplazá la nota por el estado actual,
   incluyendo **"no copiar para ordenar: copiar genera un ID nuevo"**.
6. El punto 2 llama a **`calcularMarcador` (Paso 3)**; `Paso-3-v2` expone
   **`resolverMarcadores(informe_id, periodoGlobal)`**. Unificá al nombre de 3-v2.

→ **Commit G:** `DOC-2 ✅ — Paso-4/Paso-5: rutas de docs archivados y nombres de función`

---

## Parte H — Higiene arrastrada

1. `.claspignore` **ya está trackeado con el punto** en el repo. Si en el working tree
   local hay además un `claspignore` sin punto, borralo — el pendiente del handoff puede
   estar resuelto y arrastrándose de gusto. Confirmalo en el reporte.
2. Los commits del 2.3.1/2.3.2/2.3.3, `Fechas.gs`, `preseleccion_fechas.gs` y los
   `HANDOFF 2026-07-30-2/-3.md` **no están pusheados**. Pushear antes de tocar nada, o
   este prompt va a editar archivos que difieren de los locales.
3. Pendientes de sesiones anteriores, si siguen abiertos: agregar
   `docs/INFORMES_relacion.md` al repo, archivar `docs/Prompts/Paso-2.md`, y separar del
   working tree el diagnóstico de Looker (Tarea 5 del 2.3).
4. Crear `docs/REGLAS_NEGOCIO.md` con **R-01** y **C-01** si todavía no existe, con ID
   estable: una regla que se cae se marca derogada con fecha, no se borra.

→ **Commit H:** `DOC-2 ✅ — higiene: claspignore, REGLAS_NEGOCIO.md y pendientes de repo`

---

## Lo que este prompt NO decide

Dejar explícito en el reporte final, sin resolverlo:

- **¿Una campaña se reporta en el período en que arranca, o en todos aquellos en que
  estuvo activa?** Condiciona el 2.4 entero y las seis elecciones de fecha de
  `digital`/`looker`, que hasta entonces son provisorias.
- **¿`MAPEO` usa `hoja` o `solapa`?** Si conviven las dos, es un dato por dos caminos.
- **¿Cuál es la solapa cruda de `m2`?** `M2 periodo DIGITAL` / `M2 periodo DIRECTA`
  siguen sin confirmarse como fuentes crudas según el criterio del 30/07.
- **Firma de encabezados para `RDV_otros_ministros`** — mapeo por letra sobre base ajena,
  con `Inscriptos` y `Asistentes` a dos posiciones de su etiqueta. Sin implementar.

---

## Prueba del usuario

1. `MARCADORES` en la planilla viva: encabezados nuevos, `calculo` ya no existe, los
   valores que hubiera en `calculo` están ahora bajo `operacion`.
2. Correr el instalador **dos veces**: la segunda no cambia nada.
3. `grep -rn "resolverCampo\|calculo" docs/Prompts/*.md` → sin resultados vigentes.
4. `grep -rn "docs/JM_tokens_marcados\|docs/CAMPANAS.md" docs/Prompts/*.md` → sin
   resultados.
5. Leer el reporte final: los tres hallazgos de la Parte 0, el nombre de la solapa de
   Looker, y las cuatro preguntas abiertas.
