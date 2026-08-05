# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-10, antes de arrancar el prompt de la clave de match ·
último commit al escribirlo: `5025790`

## Dónde estamos

**El motor genera un informe de punta a punta. Los números de encuentro siguen siendo los de
la cuenta equivocada, y el arreglo del 09/08 no funcionó.**

**Lo que sí quedó funcionando estos días:**

1. **El filtro declarativo** (08/08). `MARCADORES.filtro` y `SECCIONES.filtro` existen y se
   aplican. Control positivo: sin filtro **3364** sobre 16 filas · `figura=Jorge Macri`
   **2307** sobre 4 · `figura!=Jorge Macri` **1057** sobre 12 · **2307 + 1057 = 3364**.
2. **La sección del alcance semanal `ecv_`** (05/08). Los agregados salen **una sola vez** y
   `ecv_encuentros` da **16**.
3. **El desempate temporal en `anclar_`** (09/08). Está implementado y **no rompe nada** —
   siguen 5 anclados con los mismos scores— pero **no arregló el caso que lo motivó**.

**El deck vigente sigue siendo el del 05/08:** `1cXrAhX3-GXs0dYeqwLxYqD1Nrr3ZJ2s1NJYRwz-llWo`,
corrida `jm-20260805-005053`, **26 slides · 18 tokens con valor · 304 faltantes**. Desde
entonces **no se generó ningún informe**.

## Trabado

1. **⚠ La cuenta homónima, que es el bloqueo principal.** Orden Público resuelve a
   **`3347-JULJDGAG`** y el encuentro es **`3387-JULJDGGC`**. **Once números del deck salen
   de ahí.** El desempate temporal del 09/08 no lo movió: **no hubo empate**, o sea que las
   dos no sacan el mismo score y **la premisa de ese prompt era falsa**.
   **La pista viva:** el nombre que compara el matcher **no es el de `Directa IVR`** —donde
   se vio el nombre repetido— sino **`sd_campana_digital` / `sd_campana_cuentas`**, de
   *Seguimiento digital*. Es plausible que ahí los nombres no sean idénticos, o que una de
   las dos tenga el nombre vacío y **no compita**. **Sin verificar.**
2. **Las mediciones caras no vuelven por `/dev`.** `anclarEncuentros` llamada directa
   devuelve **HTML 404** tras dos reintentos, y `unirDigitalPorCuenta` dentro de un `eval`
   **tampoco vuelve**, ni devolviendo cinco campos. El anclaje completo tarda **93 s**.
   Cualquier medición sobre la unión hay que pedirla **muy acotada**.
3. **`CAMPANAS` no tiene ninguna fila de `jm`.** La sección `campana` emite 0 ítems, y por
   eso la medición de envíos por campaña (`0.6` del `Pedido-3`) tuvo que agrupar por
   `id_cuenta` — **el proxy fue forzado, no elegido**.
4. **`REUNIONES` no es el temario.** Le faltan dos ítems del bloque Cercanía y M2:
   `Primera Persona con Pareto 27/07` —el encuentro más grande de la semana, 1344 · 267— y
   `M2 | Registro Civil`. Se sembró desde los comentarios del deck viejo.
5. **La lámina 18 tiene celdas combinadas.** Lo que se leyó como "faltan cinco tokens" son
   posiciones **sin celda propia**. Agregarlos exige descombinar, que es estructural. **La
   autorización del 07/08 murió con el punto.**

## Esperando decisión tuya

- **`ULTIMO` → `SUMA` en IVR: decidido que sí, pero no todavía.** Va junto con el arreglo de
  la cuenta, para medir los dos cambios por separado (decisión del 04/08).
- **Los cuatro `ecv_barrio*`**: `ecv_barrios` necesita una operación que no existe
  (`DISTINCT`); `ecv_barrio1-3` están declarados `[MANUAL]` en `CONFIG_INFORMES.md` §1.4,
  con una `[?]` de si salen por ranking. **Esa `[?]` resuelve los dos huecos a la vez.**
- **Falta un formato "unidades de porcentaje sin signo".** Los cinco `ecv_insc_*_pct` salen
  con `numero` porque la caja ya trae su `%`.
- **`camp_bench_*`** sigue abierto: ¿fijos, o del período anterior?
- El **dueño del deck** es `jpcofanogcba1@gmail.com`, no `reporteseinformesgcba` (`D-03`).

## En pausa, y no se vuelve sobre esto

> Las **tres preguntas sobre la lámina M2** (`PENDIENTES`, "Preguntas al equipo", 03/08).
> **Los tres remitentes sueltos** y **los once `camp_resp_*`**: diferidos el 07/08 y **no se
> vuelven a reportar**. El **`P1` del reintento de `tools/api.js`** queda en observación.

## Qué sigue

1. **La clave de match `Figura · Barrio · Fecha`** y el nombre de campaña por prioridad de
   canal (`Directa Mail` → `Directa IVR` → `Directa SMS`). Es el prompt del 10/08 y **es el
   camino para destrabar la cuenta homónima**.
2. **`ULTIMO` → `SUMA`**, después y por separado.
3. **`Pedido-3` Partes E, F y G** — la tabla de envíos, el call center y el desborde.
4. **`Pedido-1` Partes A, C y E** — el corte JM/GCBA. Ver el addendum al pie del prompt.
5. **La familia `m2_`** — tiene un `P1` abierto y **no es autocontenida**, contra lo que
   dijeron dos prompts.
6. **Tramo 3 — `secco`**, la medición de `D-01`.

## Qué mirar antes de tocar algo

- **Las bases no se leen desde node** (scope `drive.file`). Se mide por
  `tools/api.js llamar fn=eval` con snippets de sólo lectura. **⚠ `eval` es invocable por la
  API** y no está en `API_PROHIBIDAS_`.
- **`SECCIONES.filtro` y `MARCADORES.filtro` tienen la misma sintaxis y dominios distintos:**
  el de sección filtra **ítems de la iteración** (vocabulario de la fuente: `etapa`, `tipo`),
  el de marcador filtra **filas de la base** (vocabulario de `MAPEO`). El de sección se
  hereda al marcador **sólo si su campo está mapeado**; si no, se ignora y se dice en la
  traza. Sin esa guarda, `etapa=post` rompía todos los marcadores de `comunicaciones_post`.
- **`familia_tokens` es con qué se reconoce el bloque modelo en la plantilla.** Con `ecv_`
  adentro, `encuentro` reclamaba la lámina del alcance semanal y la duplicaba cinco veces.
- **`upsertPorClave_` reescribe la fila entera.** Una columna nueva va **primero a
  `COLUMNAS_DELTA_` y después a `headers`**, y al `SEED_*` con su valor real, nunca con `''`.
- **`curarMarcadores_` y `curarSecciones_`** son las puertas para curar filas puntuales.
  `sembrarSecciones_` **sólo agrega y nunca pisa**.
- **Nada que recorra una presentación puede usar `getShapes()`**: usar
  `piezasDeTextoDeSlide_`, que además **saltea las celdas combinadas no principales** — es lo
  que hizo leer "faltan tokens" donde faltaban celdas.
- **Una solapa `uso = 'ignorar'` no se lee, no se audita y no se menciona.** El `uso` se
  verifica **vivo**: `SOLAPAS` se movió 15 filas entre el 01 y el 04/08.
- **Tres significados distintos de una celda vacía**: `D-19`, `D-20`, `D-21`.

## Números de referencia

`MARCADORES` en **19** filas, con columna `filtro` (índice 9, entre `valor_fijo` y
`formato`). `MAPEO` en 120. `SECCIONES` con `ecv_alcance_semanal` agregada.
**Las 10 pruebas pasan.** Anclaje: **5 anclados · 0 sin link · 0 en baja confianza**, scores
0,82 (San Cristóbal) · 0,77 (Retiro) · 0,77 (Orden Público).
`rdv` en la ventana 24–30/07: **3364 inscriptos · 811 asistentes · 16 encuentros**, canales
**3344**, diferencia **−20** con una sola fila que la explica.
