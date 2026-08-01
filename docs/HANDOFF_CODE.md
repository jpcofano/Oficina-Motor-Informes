# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-01 · último commit al escribirlo: el de esta entrada

## Dónde estamos

**Paso 2.11 Parte C + C.2 cerrado y verificado en vivo. Sin nada trabado.**

El diff de configuración funciona **y ya es auditable**: dice qué auditó y qué no (bloque
ALCANCE, diez hojas), con cabecera de corrida, migraciones dentro del diff, protegidas que
declaran qué se habrían perdido, línea `solo_en_hoja` y resumen desagregado. Los dos P0 que
bloqueaban —idempotencia y "Estado no coincide con Aplicar"— están cerrados con evidencia
repetida (`docs/PROTOCOLO_2.11-C_corrida_2026-08-01.md`).

También quedó destrabado el Paso 1.8: el usuario cargó `API_TOKEN` y la API sobre `/dev`
responde. **Por primera vez Code corrió parte de un protocolo sin que nadie abriera la
planilla** — las cinco `probar*_()` por HTTP, 5 de 5 OK.

## Qué quedó hecho en C.2-7

| pieza | estado | nota |
|---|---|---|
| `tools/snapshot.js` + `docs/_snapshots/` | hecha | diez TSV, volcados **sin pasar por el motor** |
| `docs/RUNBOOK.md` Parte H | hecha | cuándo se corre, por qué no usa la API, el 429 |
| Addendum 1 a `Paso-2.11_una_sola_fuente_de_verdad.md` | hecha | la C.2 entera + el fix de `sembrarClasificacionSolapas()` |
| `docs/PROTOCOLO_2.11-C_corrida_2026-08-01.md` | hecha | congelado; **no** reemplaza al del 31/07 |
| `docs/PENDIENTES_consistencia.md` | hecha | 2 P0 tachados, el de la API reescrito, 3 hallazgos abiertos |

## Lo que se verificó y lo que no

**Verificado en vivo contra la planilla:** C.2-2, C.2-4, C.2-5 y C.2-6. Diez filas de
alcance, diez protegidas con su `habría cambiado`, siete `solo_en_hoja` reportadas y
todavía en la hoja, resumen desagregado. Dos "Aplicar configuración" seguidos, idénticos.

**Verificado sólo sintéticamente:** C.2-3 (`probarMigracionesEnDiff_`). `migraciones: 0` es
el resultado correcto, pero cero no distingue *no hay migraciones pendientes* de *ese camino
no se ejecuta*.

**No verificado:** el camino central del upsert. `cambiadas: 0 · agregadas: 0` en las dos
corridas porque el control positivo de cinco ediciones **no se repuso** — la planilla se
limpió antes (`zz_prueba` y la huérfana `ahhh` ya no están, confirmado en los snapshots).
Que el upsert detecte cambios lo sostienen la corrida del 31/07 y los controles positivos,
no ésta.

## Los tres hallazgos que este paso abrió y no arregló

Están en `docs/PENDIENTES_consistencia.md` con el detalle y las líneas de código:

1. **P1 · las siete filas huérfanas de `MAPEO` son columnas de fecha.** Las escribe
   `promoverFechasElegidas()` (`Fechas.gs:378`), no un sembrador: dos escritores, uno solo
   declarado. Se pidió como P0; **baja a P1 verificado contra el código** — `leerFuente()`
   corta con `«FALTA:fecha_periodo@…»`, las cinco de `digital` ni se consumen
   (`modo_periodo = snapshot`), y la fila 3 es el contrato viejo que el seed ya cubre. La
   única que un re-sembrado rompería es `rdv||RDV_otros_ministros`, y rompe fuerte.
2. **P1 · asimetría Estado / Aplicar en las protegidas.** Aplicar emite diez líneas,
   Estado ninguna: `menuEstadoConfiguracion_()` reimplementa la comparación de `SOLAPAS`
   (`Instalar.gs:2136-2153`) y saltea las `origen=manual` sin decir nada. Es el P0 recién
   cerrado en versión chica.
3. **P2 · `diagnosticoBases_()` lista solapas `uso = 'ignorar'`.** Preexistente del Paso
   1.8, no de acá.

## Trabado

Nada. El `API_TOKEN` que bloqueaba el Paso 1.8 está cargado.

Sobre el pendiente de la API: el punto 1 (código viejo) **no aplica sobre `/dev`**, que es
HEAD por definición, y revive cuando el Paso 6 publique `/exec`. El punto 2 —lista blanca
`EJECUTABLES_REMOTOS_` de sólo lectura para `llamar`— **se difiere al Paso 6 por decisión
del usuario del 01/08/2026**.

## Qué sigue

1. **`Paso-2.11` Parte D** — lo único que le falta a este paso: `BASES.fila_encabezado`
   vestigial (H-2), los dos accesos directos de `Union.gs:36` y `:261`, retirar
   `reclasificarSolapasM2Invertidas_`, y los nombres de solapa hardcodeados de
   `Fechas.gs:66` y `Auditoria.gs:348`.
2. **`Paso-2.12` Parte 2** — las 17 disposiciones de `SOLAPAS.uso` en `revisar`. Ahora se
   puede hacer con datos: las diez protegidas ya declaran qué se habrían perdido, que era
   justamente lo que faltaba para `rdv/RDV CONJUNTO` y `rdv/Comunas`.
3. **`Paso-2.13`** — `SEED_MARCADORES_`. `MARCADORES` sigue con tres filas contra las 43
   trazas del CSV y sin sembrador; el snapshot del 01/08 ya está tomado, que era su primera
   tarea.
4. Las cuatro pruebas de aceptación del Paso 1.8 §7 nunca corrieron como tales, aunque la
   API ya se usó en serio para las cinco `probar*_()` y para `bases`.

**Sin commitear, y de otro paso:** `docs/Prompts/AUD-3_inventario_codigo.md`. No se
bundlea (`CLAUDE.md` §4.5) — decidir a qué paso pertenece antes de meterlo.
