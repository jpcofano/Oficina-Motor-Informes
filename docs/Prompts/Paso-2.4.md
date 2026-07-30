# Paso 2.4 — Unir `digital` por `id_cuenta` y anclar en RDV (capa de ensamblado)

> **Regla de oro:** este paso NO calcula nada (ni SUMA, ni promedios, ni merge con
> precedencia). Solo **ensambla filas**: une las solapas de `digital` en un registro
> por cuenta, y linkea cada encuentro de RDV con su(s) cuenta(s) digital(es). La
> aritmética y el merge RDV→SD→Looker son del Paso 3 (`Marcadores.gs`).
>
> **Dónde encaja:** es la vía de datos, en paralelo a la vía de plantillas
> (2.2 → 2.5). No toca Slides ni MARCADORES. **Debe estar antes del Paso 3**, que hoy
> asume `filas` planas por base y no tiene con qué armar lo digital (ver
> "Reconciliaciones" al final).
>
> **Un commit por parte.**
>
> ⚠ **Namespace (PROYECTO §9):** los `.gs` comparten un scope global y dos
> herramientas escriben en esta carpeta. **Antes de nombrar cualquier función/`var`
> nueva, `grep -rn "function nombre" *.gs`.** `Parseo.gs` ya tiene
> `parsearTipoEncuentro_` (de claude.ai): **reusalo, no lo dupliques.**

---

## R-04 — el temario define el universo, no la fecha (diseño confirmado)

`digital` está registrada como `modo_periodo=snapshot` (ver `SEED_BASES_` en
`Instalar.gs`): las cinco columnas de fecha elegidas para sus solapas
(`docs/FECHAS_seleccion.md`) no seleccionan contenido — el recorte lo hace el link
campaña↔encuentro de este mismo paso (Parte B). **`R-04` (`docs/REGLAS_NEGOCIO.md`,
DOC-3) confirma que este diseño es correcto:** el temario define el universo de
campañas (selección humana de encuentros), no una ventana de fecha; la fecha de inicio
de campaña solo sirve para el match campaña↔encuentro. El diseño de este paso queda
**confirmado, no invalidado** — las seis elecciones de fecha de `digital`/`looker`
siguen siendo útiles como diagnóstico y acotado de lectura, no como filtro de
contenido.

## Contexto (lo que dejó 2.3)

- `digital` quedó en `modo_periodo=snapshot`, con 6 solapas mapeadas en `MAPEO`,
  cada una con su columna de join sembrada:

  | solapa (hoja) | campo_logico id | col | rol |
  |---|---|---|---|
  | Seguimiento digital *(maestra)* | `sd_id_cuenta` | A | **dimensión** (nombre campaña B/C, pauta T/U/V) |
  | Digital | `dig_id_cuenta` | T | hechos digital |
  | Directa Mail | `mail_id_cuenta` | A | hechos mail |
  | Directa SMS | `sms_id_cuenta` | A | hechos SMS |
  | Directa IVR | `ivr_id_cuenta` | A | hechos IVR |
  | Alcance | `alc_id_cuenta` | A | alcance/frecuencia — ⚠ **verificar que exista**: no aparece en el `DIAG_FECHAS` del 30/07 (`docs/FECHAS_seleccion.md`), a diferencia de las otras cinco. |

  ⚠ **`digital` tiene además una solapa `RDV`** con el mismo contenido que la base
  `rdv` (ver `docs/FECHAS_seleccion.md`, "sin decidir"). Si el join de este paso la
  levanta además de la base `rdv`, hay **doble conteo** — verificar cuál es la buena
  antes de sumar nada en el Paso 3.

- `Fuentes.gs` expone `leerFuente(baseId, ventana, nombreHojaOverride)` y
  `resolverClave_(baseId, solapa)`. La resolución de columnas de `MAPEO` (fecha, clave)
  pasa por **`buscarMapeo(base_id, solapa, campo_logico)`** (`Config.gs`, Paso 2.3.2) —
  **`resolverCampo` ya no existe**, se eliminó a favor de `buscarMapeo`. `solapa` es
  obligatoria: `buscarMapeo` no tiene default a `hoja_default`, un default silencioso
  ahí devuelve la fila de otra solapa sin avisar. `leerFuente` lee **una** hoja por
  llamada — este paso lo llama una vez por solapa y arma el join encima.
- Regla de anclaje ya fijada en `docs/DISENO_match_temario.md §5 bis` (leerla, es
  corta y es el contrato): **la hoja ancla es `RVD JM-CM - ES`, se filtra
  `STATUS REUNIÓN = Realizada`, y la columna `FECHA` de RDV le gana a la fecha del
  nombre de campaña.** El nombre de la campaña digital se usa **solo** para llegar
  al `Id cuentas`; la similitud se puntúa contra `EVENTO` + `Barrio` de RDV.

Archivo nuevo sugerido: **`Union.gs`** (mantiene `Fuentes.gs` enfocado en "abrir +
leer + ventanear una hoja"; el ensamblado entre hojas vive aparte). Es capa de datos,
no de aritmética.

---

## Parte A — `unirDigitalPorCuenta(ventana)`

En `Union.gs`. Arma **un registro por `Id Cuentas`** uniendo las 6 solapas.

1. Partí de la **maestra** `Seguimiento digital` (una fila por cuenta): leela con
   `leerFuente('digital', ventana, 'Seguimiento digital')` (snapshot ⇒ trae todo).
   Indexá por `sd_id_cuenta` (col A). Esa es la dimensión: nombre de campaña
   (`sd_campana_digital` C, `sd_campana_cuentas` B) y pauta (`sd_pauta_google/prog/meta`).
2. Para cada una de las otras 5 solapas: `leerFuente('digital', ventana, '<hoja>')`,
   indexá por su `*_id_cuenta` y **left-join** contra la dimensión. Los `campo_logico`
   ya vienen prefijados por canal (`dig_*`, `mail_*`, …) desde el Paso 2.3, pero **lo
   que evita que se pisen entre solapas es la `solapa` en la clave de `MAPEO`** (Paso
   2.3.2), no el prefijo — el prefijo es residual y está marcado para limpieza (ver
   `docs/Prompts/Paso-2.3.2.md`, "Fuera de alcance"). El join no debe depender de que
   el prefijo exista.
3. Normalizá la clave de join: `String(id).trim()`. Si una solapa trae **varias filas
   por cuenta** (p. ej. Mail: varios envíos de una misma campaña), **NO sumes** —
   guardá el arreglo de filas crudas bajo `mail_filas: [...]`. Sumar es Paso 3; acá
   solo se junta.
4. Devolvé `{ porCuenta: { <idCuenta>: {…} }, diagnostico }`, donde `diagnostico`
   cuenta, por solapa: filas leídas, cuentas que matchearon contra la dimensión, y
   **huérfanas** (id en la solapa que no está en la maestra, y viceversa). Las
   huérfanas no se descartan en silencio: se reportan.

No hay ninguna operación aritmética en esta función.

→ **Commit A:** `Paso 2.4 ✅ — unirDigitalPorCuenta(): join de las 6 solapas por id_cuenta`

---

## Parte B — `anclarEncuentros(ventana)`

En `Union.gs`. Implementa la regla de `DISENO §5 bis`.

1. Leé RDV con `leerFuente('rdv', ventana)` (rdv es `filtrar`: ya viene ventaneado por
   `FECHA` real). Filtrá `status === 'Realizada'` (campo `rdv/status`, col I).
   **Precondición explícita:** requiere `rdv/RVD JM-CM - ES/fecha_periodo = E` cargado
   en `MAPEO` y verificado con **R-01** (`docs/REGLAS_NEGOCIO.md`) — agrupar por
   (columna A `Figura`, columna E) y contar grupos con más de una fila, tiene que dar
   cero. **Si no está cargado o R-01 no se verificó, este paso no corre.**
2. Traé el resultado de `unirDigitalPorCuenta(ventana)`.
3. Para cada encuentro de RDV, encontrá la(s) cuenta(s) digital cuyo **nombre de
   campaña** (`sd_campana_digital` / `sd_campana_cuentas`) mejor matchea contra
   `EVENTO` + `Barrio` del encuentro. Puntuá similitud: match de barrio (normalizado)
   + solapamiento de tokens del evento/tema. Reusá los parsers de `Parseo.gs`
   (`parsearTipoEncuentro_` y compañía) para normalizar; no reescribas parseo de fecha
   ni de tipo.
4. Devolvé `{ encuentros: [ { fecha, barrio, evento, idCuenta, score, registroDigital } ],
   sinLink: [...], bajaConfianza: [...] }`. **La fecha del encuentro sale de RDV**, nunca
   del nombre de la campaña (§5 bis).
5. Umbral de confianza: por debajo de X, no se asume el link — va a `bajaConfianza`
   para revisión humana. Elegí X y dejalo comentado; mejor un huérfano visible que un
   número pegado a la campaña equivocada.

Sin aritmética: esto devuelve el **mapa** encuentro↔cuenta, no totales.

→ **Commit B:** `Paso 2.4 ✅ — anclarEncuentros(): anclaje RDV + link por id_cuenta (DISENO §5bis)`

---

## Parte C — Diagnóstico + contrato para el Paso 3

1. Ítem de menú **"Probar unión y anclaje"** (submenú de diagnóstico, al lado de
   "Probar lectura por ventana"). Corre A y B sobre el período de CONFIG y muestra:
   - unión: por solapa, filas / cuentas matcheadas / huérfanas;
   - anclaje: encuentros del período, cuántos linkearon, `sinLink`, `bajaConfianza`
     (con nombre de campaña candidato y score, para que se vea por qué no cerró).
2. Dejá una función **proveedora** con contrato estable que el Paso 3 va a consumir en
   lugar de llamar `leerFuente` directo para digital:
   `filasDigitalDeEncuentro(idCuenta | encuentro)` → devuelve las filas planas ya
   unidas de esa cuenta, listas para que una operación de `Marcadores.gs` las sume.
   Documentá la firma arriba de la función; el Paso 3 se apoya en esto.

→ **Commit C:** `Paso 2.4 ✅ — menú de diagnóstico y proveedor para el Paso 3`

---

## Parte D — Doc (commit aparte)

Una línea en `PROYECTO.md`: 2.4 es la **capa de ensamblado** (Fuentes/Union → filas
unidas + link encuentro↔cuenta) que alimenta al Paso 3; el join `id_cuenta` y el
anclaje RDV **no son aritmética** y por eso no viven en `Marcadores.gs`. Actualizá el
estado del Bloque 2.

→ **Commit D:** `Doc: cerrar Paso 2.4 en PROYECTO.md`

---

## Prueba del usuario

1. Menú → **"Probar unión y anclaje"** con el período `2026-07-10 / 2026-07-17`.
2. Unión: la maestra debe traer ~1 fila por cuenta; las solapas de canal deben
   matchear una fracción alta contra la dimensión. Huérfanas: que sean pocas y con
   sentido (una cuenta sin envío de mail no es un error).
3. Anclaje: los encuentros `Realizada` del período deben linkear a una campaña con
   score razonable. Revisar `bajaConfianza` — si hay muchos, el umbral o el scoring
   necesitan ajuste.
4. Confirmar que **ninguna fecha de encuentro sale del nombre de la campaña**: todas
   coinciden con la columna `FECHA` de RDV.

---

## Reconciliaciones pendientes (detectadas al revisar los pasos que siguen)

No son de este paso, pero quedan anotadas para no perderlas:

1. **`Paso-3-v2.md` "Antes de empezar" está desactualizado.** Reabre "Looker vs SD"
   y recomienda Looker; 2.3 ya cerró a favor de **SD primaria** (Looker = rollup,
   `PROYECTO §5`, `HALLAZGOS §4`). Reescribir ese bloque para reflejar la decisión,
   no reabrirla, **antes** de correr el Paso 3.
2. **El Paso 3 debe pedir lo digital al proveedor de 2.4** (`filasDigitalDeEncuentro`),
   no a `leerFuente` directo — su `ctx.filas` plano no sirve para las 6 solapas.
   Agregar esa nota en `Paso-3-v2.md` Parte C.
3. **La precedencia RDV→SD→Looker es criterio de cableado, no un motor de merge.**
   3-v2 cablea cada marcador a un `base_id`. Aclararlo en `PROYECTO §5` para que nadie
   espere un merge automático.
4. **El Paso 2.5 debe usar `upsertSoloVacias_` (variante nueva), no modificar
   `upsertPorClave_`.** El seed de 2.3 depende de que `upsertPorClave_` pise la fila
   entera; si 2.5 lo cambia in situ, rompe `seedConfiguracion`.

## Lo que este paso NO hace

- No suma, no promedia, no mergea con precedencia (Paso 3).
- No toca plantillas ni MARCADORES (vía 2.2 → 2.5).
- No resuelve el misterio del Looker vivo (Tarea 5 de 2.3, necesita la Sheet real).
