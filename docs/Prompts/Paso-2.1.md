# Paso 2.1 — Cerrar el lector: filas vacías y columna de fecha por base

> **Regla de oro:** este paso NO calcula nada. Ajusta el diagnóstico del lector y formaliza
> una convención de registro.
>
> **Va después del Paso 2 (`67884cb`).** El Paso 2 está implementado pero **no verificado**:
> los criterios A3–A5 de `VERIFICACION_Paso-2.md` no se pueden dar por buenos hasta que
> esto pase.
>
> **Un commit por parte.**

---

## Contexto — qué NO hay que hacer acá

El Paso 1.9 (Partes A y B) **ya está en el código**: `SEED_BASES_` trae `m2` con
`fila_encabezado: 3` y `modo_periodo: 'snapshot'`, y `SEED_MAPEO_` tiene las 14 filas de
`rdv` (con `fecha` → E) y las 23 de `looker`. Lo que faltaba era correr los ítems de menú
sobre la planilla; el usuario ya lo hizo.

**No vuelvas a tocar `SEED_BASES_` ni `SEED_MAPEO_`** salvo por la fila puntual de la
Parte B. Si algo de eso no aparece en la planilla, es un problema de ejecución del menú, no
de código.

Estado esperado de "Probar lectura por ventana" al arrancar este paso:

```
✅ rdv     — con ventana
✅ m2      — modo=snapshot, ventana_aplicada=null
⚠ looker  — sin columna de fecha        ← lo arregla la Parte B
⚠ digital — sin fila en MAPEO           ← esperado, ver "Decisión que este paso no resuelve"
```

---

## Parte A — Filas vacías fuera del diagnóstico

Síntoma: `m2` reportó **29.533 filas totales y 29.514 sin fecha**. Son las filas vacías de
la hoja contadas como datos. Con eso, `filas_sin_fecha` deja de servir para lo único que
tiene que servir: detectar **filas con datos pero sin fecha**, que es un hallazgo para
llevar al equipo (`VERIFICACION §3`).

En `leerFuente` (`Fuentes.gs`), antes de clasificar por fecha, descartá las filas
**completamente vacías** — todas las celdas `''`, `null`, `undefined` o solo espacios.
No las cuentes en `filas_totales` ni en `filas_sin_fecha`.

Agregá al diagnóstico `filas_vacias_descartadas`, para que quede a la vista y la regla de
cuadratura siga cerrando:

```
filas_en_ventana + filas_sin_fecha + filas_fecha_invalida + descartadas_fuera_de_ventana
= filas_totales
```

Ojo con dos cosas: el descarte va **después** de aplicar `fila_encabezado` (no antes, o se
corre el índice del header), y vale también en `modo=snapshot`, donde hoy todas las filas
se devuelven sin filtrar.

→ **Commit A:** `Paso 2.1 ✅ — filas vacías fuera del diagnóstico`

---

## Parte B — Convención de columna de fecha por base

`leerFuente` resuelve la columna de fecha con `resolverCampo(baseId, 'fecha')` fijo.
**Looker no tiene una columna `fecha`**: tiene `fecha_inicio` (C) y `fecha_fin` (D). Por eso
sale en ⚠ aunque esté sembrada completa. No es la decisión Looker-vs-Seguimiento-Digital:
es que la base tiene dos fechas y nadie declaró cuál cumple el rol.

Formalizá la convención:

1. La columna de fecha de una base es la fila de `MAPEO` con **`campo_logico = 'fecha'`**
   para ese `base_id`. Se mantiene lo que ya hace el lector.
2. Cuando una base tiene más de una fecha candidata, **se agrega igual una fila `fecha`**
   apuntando a la columna elegida, y la elección se explica en `notas`. No agregues un campo
   `columna_fecha` a `BASES`: el registro ya tiene dónde decirlo, y duplicar el dato en dos
   hojas es pedir que se desincronicen.
3. Si la base es `modo_periodo=snapshot`, **no se busca columna de fecha y no se emite
   advertencia**. Verificá que `leerFuente` cortocircuite antes de llamar a `resolverCampo`.
4. Si una base en modo `filtrar` no tiene fila `fecha`, el mensaje tiene que decir
   exactamente qué falta: **`falta MAPEO: <base_id>/fecha`**. Hoy dice "sin columna de fecha
   mapeada para filtrar", que no distingue entre "la fila no existe" y "existe con la
   columna vacía" — dos problemas con dos arreglos distintos.

### La fila que hay que agregar

Una sola, en `SEED_MAPEO_`, en el bloque de `looker`:

```js
{ base_id: 'looker', campo_logico: 'fecha', hoja: 'resumen_metricas', columna: 'C',
  notas: 'apunta a fecha_inicio. Es el arranque de la pauta de convocatoria, entre 3 y 7 días antes del encuentro (DISENO_match_temario.md §5). Sirve para acotar la lectura, NO para elegir qué campaña entra al informe.' },
```

**Esa nota no es decorativa.** `DISENO_match_temario.md §5` verificó tres campañas donde
`fecha_inicio` está entre 3 y 7 días antes del encuentro: filtrar la ventana del período por
esa columna devuelve la semana equivocada. La fila existe para que el lector pueda acotar,
no para seleccionar. Si alguien más adelante la usa como criterio de selección, el informe
sale con las campañas de la semana anterior.

Dejá la convención escrita en el encabezado de `Fuentes.gs` y en `docs/MAPEO_completo.md`.

→ **Commit B:** `Paso 2.1 ✅ — convención de columna de fecha por base (+ looker/fecha)`

---

## Decisión que este paso NO resuelve

**Looker vs. Seguimiento Digital como fuente de fila digital/directa.**
`HALLAZGOS_validacion_decks.md §4` la deja resuelta a favor de **Seguimiento Digital**
(Looker es su rollup exacto, verificado número por número en dos campañas; el desagregado
por envío que piden dos slides solo existe en SD). Pero `MAPEO_completo.md`,
`CONFIG_INFORMES §4.1`, `Paso-1.9.md` y `Paso-3-v2.md` siguen diciendo que está abierta, y
los cuatro recomiendan lo contrario.

**No la resuelvas vos.** `digital` queda en ⚠ a propósito: cuando la decisión esté escrita
en un solo lugar, sembrar las 5 hojas de SD es agregar filas, no tocar código.

---

## Prueba del usuario

1. `clasp push` → menú → **"Cargar config inicial"** (para que entre la fila
   `looker/fecha`).
2. Menú → **"Probar lectura por ventana"**:
   - `rdv` ✅ con un conteo verificable filtrando la planilla a mano — **este es el A3, el
     corazón del paso**.
   - `looker` ✅ con ventana aplicada y `columna_fecha` = el header real de C.
   - `m2` ✅ `modo=snapshot`, `ventana_aplicada=null`, y **sin las 29.514 filas sin fecha**.
   - `digital` ⚠ con el mensaje nuevo `falta MAPEO: digital/fecha`.
   - `miba` no aparece.
3. Correr con dos períodos distintos de `CONFIG` y ver que los conteos de `rdv` y `looker`
   cambian (A10).
4. Buscar en `rdv` una fila con día ≤ 12 y confirmar que cae en el mes correcto (trampa
   mm/dd de `VERIFICACION §3`).
5. Correr con `desde = hasta = <un día con datos>` y confirmar que no devuelve 0 (bordes
   inclusivos).

Con eso, marcá P3–P5 y A1–A10 en `VERIFICACION_Paso-2.md` y recién ahí se da el Paso 2 por
cerrado.

---

## Antes de cerrar

- Archivá **`docs/Prompts/Paso-2.md`** en `Plan Inicial/_archivo/`: pedía `leerColumna()`,
  una función que no existe, y no menciona `fila_encabezado` ni `modo_periodo`. El contrato
  que manda es el de `VERIFICACION_Paso-2.md`. Mientras siga en `docs/Prompts/` es una
  trampa para el que lo lea.
- **`docs/Prompts/VERIFICACION_Paso-2.md`** dice en su línea 3 que vive en
  `docs/VERIFICACION_Paso-2.md`, y el HANDOFF lo busca ahí. Movelo o corregí la línea. Una
  de las dos, no las dos.
