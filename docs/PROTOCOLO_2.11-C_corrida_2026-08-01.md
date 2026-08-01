# PROTOCOLO 2.11-C — corrida del 01/08/2026 (C.2-2 a C.2-6 en vivo)

> **Documento congelado.** Es evidencia de una verificación puntual: qué se corrió, con
> qué instrumento, y qué devolvió. No se edita — si el protocolo se vuelve a correr, se
> escribe un archivo nuevo. Los addenda fechados sí valen (`CLAUDE.md` §7).
>
> **`reemplaza:` nada.** No reemplaza a `docs/PROTOCOLO_2.11-C_corrida_2026-07-31.md`: ese
> documento cubre otras dos corridas, con otro código y otro control positivo, y sigue
> siendo la evidencia de cómo se cerraron los pasos 4 y 5. Éste cubre lo que aquél
> declaraba abierto (`C.2-2` a `C.2-7`).
>
> Protocolo: `docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md`, siete pasos.
> Código bajo prueba: Paso 2.11 Parte C + C.2-1 a C.2-6, commits `63095d9`, `3401861`,
> `f0d12ea`, `d561b6d`, `45fe14e`.
> **Trabajamos en español.**

---

## Lo que cambió respecto de las dos corridas anteriores: el instrumento

Las corridas del 31/07 y la segunda del 01/08 las hizo el usuario desde el menú de la
planilla y Code transcribió lo reportado. Acá, por primera vez, **una parte del protocolo
la corrió Code por su cuenta**: la API de pruebas sobre `/dev` del Paso 1.8 quedó operativa
cuando el usuario cargó la propiedad de script `API_TOKEN`, y los cinco controles positivos
se invocaron por HTTP contra HEAD sin que nadie abriera la planilla.

Lo que sigue exigiendo un humano: los dos ítems de menú (`Estado de configuración`,
`Aplicar configuración`), porque escriben.

## Parte 1 — Los cinco controles positivos, por la API

`node tools/api.js llamar fn=<nombre>` sobre `/dev`. **5 de 5 OK.**

| control | qué parte prueba |
|---|---|
| `probarBloqueDeAlcance_` | C.2-2 |
| `probarMigracionesEnDiff_` | C.2-3 |
| `probarProtegidasConDiferencia_` | C.2-4 |
| `probarSoloEnHoja_` | C.2-5 |
| `probarResumenDesagregado_` | C.2-6 |

Los cinco alimentan las funciones con hojas sintéticas (`hojaFalsa_`, `Pruebas.gs`) y
afirman que la discrepancia conocida se detecta. **No tocan la planilla**, así que no hay
nada que revertir y no compiten con el estado real.

Existen porque **el protocolo de siete pasos pasa igual aunque las cinco partes estén
mal**: cero cambios sigue siendo cero cambios. Que discriminan se verificó por mutación en
el lote del 01/08 (18 de 18 roturas cazadas), no acá.

## Parte 2 — El protocolo desde el menú

Corrido por el usuario. Tres invocaciones:

| hora | ítem | qué es |
|---|---|---|
| 16:06 | `menuEstadoConfiguracion_` | sólo lectura |
| 16:29:14 | `menuAplicarConfiguracion_` | escribe |
| 16:30:56 | `menuAplicarConfiguracion_` | escribe — segunda vez, sin tocar nada en el medio |

**Las dos corridas de apply son idénticas**, con el resumen desagregado de C.2-6:

```
cambiadas: 0 · agregadas: 0 · migraciones: 0 · solo_en_hoja: 7
· protegidas (con diferencia): 10 · protegidas (sin diferencia): 0 · sin cambios: sí
```

**Estado y Aplicar coinciden.**

## Resultado por paso

| paso | criterio | resultado |
|---|---|---|
| 1 | tipos de fecha | ✅ vigente de la corrida del 31/07 — 12 celdas `Date` |
| 2 | control positivo | ⚠️ **no se repuso** — ver abajo |
| 3 | aplicar | ✅ corrió, con cabecera de corrida y bloque de alcance |
| 4 | idempotencia | ✅ dos apply idénticos, `cambiadas: 0 · agregadas: 0` |
| 5 | estado sin discrepancias | ✅ y **consistente** con los dos apply |
| 6 | inventariar solapas | ✅ vigente — 84 filas con datos reales |
| 7 | `filas_datos ≤ filas_crudas` | ✅ vigente — 84/84 |

**Los dos P0 se cierran**: el de idempotencia (paso 4) y el de "Estado no coincide con
Aplicar" (paso 5).

## Lo que esta corrida NO probó — y hay que decirlo, porque el número es cero

`cero` no distingue *no hay nada que hacer* de *ese camino no se ejecuta*. Es exactamente el
modo de falla que este paso existe para eliminar, así que no puede quedar implícito:

- **C.2-2, C.2-4, C.2-5 y C.2-6 se probaron en vivo contra la planilla.** El bloque de
  alcance emitió sus diez filas, las diez protegidas salieron con su `habría cambiado`, las
  siete `solo_en_hoja` se reportaron y siguen en la hoja, y el resumen salió desagregado.
  Esos números son distintos de cero: la corrida los ejercitó.
- **C.2-3 sólo está probado sintéticamente** (`probarMigracionesEnDiff_`). `migraciones: 0`
  es el resultado correcto —no quedan migraciones pendientes—, pero **no ejercita** el
  camino de una migración que escribe y emite su línea.
- **`cambiadas` y `agregadas` en cero significan que el camino central del upsert no se
  ejecutó en ninguna de las dos corridas.** Lo que probaría eso es el control positivo de
  cinco ediciones del paso 2, que en el 31/07 sí se puso y acá **no se repuso**: la
  planilla se limpió (filas `zz_prueba` y la huérfana `ahhh`) antes de esta corrida.
- Por lo tanto, **el paso 4 pasa sobre un diff que no reportó ningún cambio real.** Es la
  evidencia de idempotencia, no de que el upsert detecte cambios — eso lo sostienen la
  corrida del 31/07 (donde las tres ediciones sí se reportaron) y los controles positivos.

## Nota de honestidad

Los conteos (7 `solo_en_hoja`, 10 protegidas) valen **para esta corrida**. Los invariantes
son los otros —idempotencia, que Estado y Aplicar digan lo mismo, que las `solo_en_hoja`
sigan en la hoja después de aplicar—, no los números.

## Hallazgos que salieron de mirar esta corrida

Tres, anotados en `docs/PENDIENTES_consistencia.md` y **no arreglados acá**:

1. Las **siete filas `solo_en_hoja` de `MAPEO` son columnas de fecha** que ningún `SEED_*`
   conoce. Verificado contra el código: no rompen en silencio, pero la respuesta a "qué
   columna de fecha filtra cada base" vive sólo en la planilla.
2. **Asimetría Estado / Aplicar en las protegidas**: Aplicar emite diez líneas
   `protegida (habría cambiado)`; Estado, sobre la misma planilla, ninguna.
3. **`diagnosticoBases_()` lista solapas `uso = 'ignorar'`.** Preexistente, no de este
   paso.
