# PROTOCOLO 2.11-C — corrida del 31/07/2026

> **Documento congelado.** Es evidencia de una verificación puntual: qué se corrió, con
> qué ediciones de control, y qué devolvió. No se edita — si el protocolo se vuelve a
> correr, se escribe un archivo nuevo. Los addenda fechados sí valen (`CLAUDE.md` §7).
>
> Protocolo: `docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md`, siete pasos.
> Código bajo prueba: Paso 2.11 Parte C + C.2-1, **sin commitear** al momento de la corrida.
> Corrido por el usuario desde la planilla; Code no ve la planilla y transcribe lo reportado.
> **Trabajamos en español.**

---

## Preparación

- **Snapshot de las nueve hojas de registro tomado antes de correr** (paso 0 del protocolo).
- Las dos hojas de reporte (`DIFF_CONFIGURACION`, `ESTADO_CONFIGURACION`) **se vaciaron a
  mano**, porque traían el output de la primera corrida de la Parte C y no hay forma de
  distinguir una corrida de otra: no existe cabecera de corrida. Es **C.2-2**, sigue
  abierto — y esta preparación manual es justamente el síntoma de que hace falta.

## Las cinco ediciones del control positivo

Hechas a mano **antes** de correr nada. Las tres primeras son ediciones sobre filas
existentes (tienen que salir reportadas); las dos últimas son claves inventadas (tienen
que sobrevivir y, cuando C.2-5 esté, salir como `solo_en_hoja`).

| # | hoja | qué se editó |
|---|---|---|
| 1 | `BASES` | `m2.hoja_default` → `Cuentas M2` |
| 2 | `MAPEO` | fila `m2 \| M2 periodo DIRECTA \| or \| M2 periodo DIRECTA \| G`: `solapa` → `ahhh`, `hoja` → `cc`, `notas` → `cdcdd` |
| 3 | `SOLAPAS` | `rdv\|\|RDV CONJUNTO`, `uso`: `revisar` → `ignorar` (fila `origen=manual`) |
| 4 | `MAPEO` | fila nueva `zz_prueba \| hoja inventada \| zz_borrar \| … \| A \| texto` |
| 5 | `SOLAPAS` | fila nueva `zz_prueba \| hoja inventada \| revisar \| seed` |

## Corrida 1 — "Aplicar configuración"

Resumen: **`Filas nuevas: 1 · celdas cambiadas: 3 · protegidas (origen=manual): 10`**

Hojas actualizadas: `CONFIG`, `INFORMES`, `PERIODOS`, `REUNIONES`, `SECCIONES`, `VALORES`,
`VALORES_DIVERGENTES`.

```
BASES    cambio  m2                        hoja_default     Cuentas M2  → (vacío)
BASES    cambio  m2                        fila_encabezado  31/12/1899  → 1900-01-02
MAPEO    nueva   m2||M2 periodo DIRECTA||or
SOLAPAS  cambio  digital||RDV JM 2 VECES   notas            (corta) → (larga, con ref. a DISENO_match_temario.md §9)
SOLAPAS  protegida (origen=manual)  × 10
```

## Corrida 2 — "Estado de configuración" (sólo lectura, inmediatamente después)

```
BASES — 5 filas, 0 pendientes, 0 discrepancias
MAPEO — 122 filas, 0 pendientes, 0 discrepancias
INFORMES — 2 filas · PERIODOS — 2 filas · CONFIG — 6 filas
SOLAPAS — 85 filas [manual: 10, seed: 75], 0 discrepancias
SECCIONES — 35 filas
✅ Sin discrepancias entre el código y la planilla.
```

## Corrida 3 — "Aplicar configuración" otra vez, sin tocar nada

Resumen: **`Filas nuevas: 0 · celdas cambiadas: 1 · protegidas: 10`**

La única línea es la misma nota de `digital||RDV JM 2 VECES`.

## Resultado por paso

| paso | criterio | resultado |
|---|---|---|
| 1 | tipos de fecha | ✅ hecho antes — 12 celdas `Date` |
| 2 | control positivo | ✅ las 3 ediciones reportadas |
| 3 | aplicar | ✅ corrió |
| 4 | idempotencia | ❌ **falla** — 1 celda cambiada |
| 5 | estado sin discrepancias | ❌ **falla** — dice ✅ y el apply cambia algo |
| 6 | inventariar solapas | ✅ hecho antes — 84 filas con datos reales |
| 7 | `filas_datos ≤ filas_crudas` | ✅ hecho antes — 84/84 |

## Lo que el control positivo cerró

**`BASES` y `MAPEO` sí se auditan.** El "cero líneas" de la primera corrida de la Parte C
era ausencia de cambios, no ceguera del diff: con las ediciones puestas, `BASES` reportó
`m2.hoja_default: Cuentas M2 → (vacío)` y `MAPEO` repuso `m2||M2 periodo DIRECTA||or` como
nueva. La duda venía abierta desde el 31/07 y queda resuelta con evidencia.

## Lo que sobrevivió

- La fila `zz_prueba` de `SOLAPAS` está en las 85 después de las dos corridas de apply:
  **el upsert no borra en silencio.**
- La fila huérfana de `MAPEO` (la de `ahhh`) sigue en la hoja y **no se reporta** — es
  **C.2-5**, esperado, todavía sin implementar.

## Nota de honestidad

Los conteos (85 filas de `SOLAPAS`, 122 de `MAPEO`) valen **para esta corrida** y no son
criterio de aceptación reutilizable: las bases se mueven. Los invariantes son los otros
—idempotencia, `filas_datos ≤ filas_crudas`, que el control positivo se reporte—, no los
números.

---

> ⚠ **Addendum (01/08/2026) — la hipótesis del bloqueante 1 se verificó, y tenía los roles
> invertidos.** Al momento de escribir el cuerpo de arriba, la causa del paso 4 figuraba
> como hipótesis sin verificar: "la migración escribe la nota larga y
> `sembrarClasificacionSolapas()` la pisa con la corta del seed". Verificada contra el
> código, es al revés:
>
> - `SEED_SOLAPAS_` (`Instalar.gs`, fila `digital/RDV JM 2 VECES`) **ya traía la nota larga
>   y correcta**, con la referencia a `docs/DISENO_match_temario.md` §9.
> - La migración `corregirNotaControlAnclaje_` comparaba contra su propia constante
>   congelada (`NOTA_CONTROL_ANCLAJE_CORREGIDA_`, la versión vieja y **corta**) y, como la
>   celda ya no coincidía con esa constante, la "corregía" a la corta en cada corrida.
>
> Ciclo real, dentro de una misma corrida de "Aplicar configuración": `instalar()` (primero)
> → la migración pisa larga→corta · `sembrarClasificacionSolapas` (tercero) → el diff ve
> corta ≠ seed, reporta `corta → larga` y escribe la larga. **Estado final de cada corrida:
> larga.** La corrida siguiente repite el ciclo idéntico, y por eso la línea reaparecía para
> siempre. Consistente con la corrida 3, que reportó `anterior = corta`.
>
> **Arreglo aplicado (working tree, sin commitear):** la migración se retiró entera —
> llamada, campo de resultado, línea de resumen, constante y función—, porque el seed ya es
> dueño del valor correcto. Es el criterio de migraciones con vencimiento: una migración que
> corrige un valor que el seed vuelve a escribir bien no es una migración, es un parche
> permanente.
>
> **Pendiente:** re-correr el núcleo del protocolo (pasos 3, 4 y 5) con el arreglo puesto.
> El bloqueante 2 debería caerse solo: "Estado" no mentía sobre el presente — cuando se
> corrió, la celda tenía la larga y coincidía con el seed—, lo que no podía ver es que el
> próximo "Aplicar" iba a **fabricar** la discrepancia él mismo. Sin migración que la
> fabrique, las dos vistas quedan sobre el mismo cálculo. Se verifica, no se asume.
