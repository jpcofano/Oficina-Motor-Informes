# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-01 · último commit al escribirlo: el de esta entrada

## Dónde estamos

**Paso 1.8 implementado y pusheado. Trabado en un paso manual de una sola vez.**

La API de pruebas sobre `/dev` está construida y el endpoint ya responde JSON. Falta que
el humano cargue la propiedad de script `API_TOKEN` con el valor que está en `.env`
(línea `MOTOR_API_TOKEN=`), en el editor → ⚙ Configuración del proyecto → Propiedades de
la secuencia de comandos. Sin eso la Barrera 2 rechaza **por diseño** ("nunca dejar pasar
por ausencia"), así que las cuatro pruebas de aceptación no pueden correr.

Hecho esto, Code puede invocar cualquier función del motor contra HEAD sin que nadie
abra la planilla. Eso es lo que destraba el protocolo del Paso 2.11 C.2, que sigue sin
correrse porque hasta hoy exigía un humano apretando ítems de menú.

## Qué quedó hecho y qué no

| pieza | estado | nota |
|---|---|---|
| `Api.gs` — dos barreras, 5 acciones, traza siempre | hecha | `ping`, `version`, `registros`, `bases`, `llamar` |
| `tools/token.js` — Bearer desde `~/.clasprc.json` | hecha | `--info` imprime cuenta y scopes, nunca el token |
| `tools/api.js` — cliente | hecha | **no lo pedía el prompt**: `curl` habría dejado las dos credenciales en el historial del shell |
| `appsscript.json` — bloque `webapp` | hecha | `ANYONE_ANONYMOUS` no abre nada: `/dev` exige permiso de edición |
| `docs/ENTORNO.local.md` — URLs y cuentas | hecha | **fuera de git**; con su fila en `CLAUDE.md` §7 y `PROYECTO.md` §9 |
| `.gitignore` / `.claspignore` | hecha | verificado con `git status`: `.env` y `ENTORNO.local.md` no entran |
| `docs/RUNBOOK.md` Parte G | hecha | operatoria sin un solo valor concreto |
| **Las 4 pruebas de aceptación** | **NO corridas** | dependen del `API_TOKEN` |

## Los tres desvíos respecto del prompt

Ninguno es una decisión de gusto: los tres salieron de un hecho verificado.

1. **La URL `/dev` no se arma con el `scriptId`.** El prompt lo afirmaba en dos lugares.
   Probado: da **404 en HTML**. El id correcto es el de la implementación `@HEAD`, que
   sale de `clasp list-deployments`. Corregido en `ENTORNO.local.md` y en el RUNBOOK.
2. **Se tocó `Fuentes.gs`, que el prompt declaraba intacto.** La prueba de aceptación nº 3
   del propio prompt (`llamar` a `probarConexionBases`) era imposible: la función alertaba
   con `SpreadsheetApp.getUi()`, que sobre HTTP tira excepción. Se extrajo
   `diagnosticoBases_()` y la de menú alerta sólo si `hayUi_()`. Cero aritmética tocada.
3. **No se actualizó el estado del paso en `PROYECTO.md`.** DOC-5 le sacó el estado de
   avance a ese documento (§7 lo dice explícito). Vive acá.

## Lo que se verificó y lo que no

Verificado contra la planilla real: **una** llamada, la primera. Devolvió JSON (no HTML)
con `barrera 1: ok` y `barrera 2: API_TOKEN no está seteado`. Eso confirma las dos cosas
que el prompt daba por supuestas y podían no ser ciertas: que el Bearer derivado de
`.clasprc.json` alcanza para `/dev` (scope `script.webapp.deploy`, verificado con
`tools/token.js --info`) y que `Session.getActiveUser()` devuelve el mail ahí. No hicieron
falta ni el Plan B ni el Plan C del prompt.

Verificado fuera de la planilla, con node: `serializar_` y la comparación de longitud fija,
12 afirmaciones, 12 pasadas. Es lógica pura y no necesitaba la planilla.

**Nada más está verificado.** `registros`, `bases` y `llamar` no se ejercitaron todavía —
en particular está sin probar si `getActiveSpreadsheet()` devuelve algo sobre HTTP. Si
devuelve `null`, hay que cargar también la propiedad `HOJA_CONTROL_ID` con el `parentId`
de `.clasp.json`; `apiHojaControl_()` ya contempla las dos ramas y dice cuál usó en la
traza.

## Trabado

Sólo el `API_TOKEN` de arriba. Los pendientes abiertos están en
`docs/PENDIENTES_consistencia.md`. Sobre el **P0** (una API que sirve código viejo): el
punto 1 queda cerrado *para `/dev`*, que es HEAD por definición, y revive cuando el Paso 6
publique `/exec`. El punto 2 —lista blanca de sólo lectura para `llamar`— sigue **abierto**
y hoy no lo impide nada más que la convención.

## Qué sigue

1. Cargar `API_TOKEN` y correr las cuatro pruebas de aceptación del Paso 1.8 §7.
2. Con la API andando, **el protocolo de siete pasos del 2.11 C.2** —que sigue sin
   correrse— pasa a ser ejecutable desde acá. El paso 0 de ese protocolo (limpiar las
   filas `zz_prueba` y la huérfana `ahhh`) está detallado en la bitácora del lote C.2 y en
   el prompt `Paso-2.11_ParteC2_diff_auditable.md`.
3. **C.2-7** — documentación y `docs/_snapshots/`, lo único que queda de ese prompt.
4. `Paso-2.12` Parte 2 (las 17 disposiciones de `SOLAPAS.uso`).
5. `Paso-2.11` Parte D — `BASES.fila_encabezado` vestigial, los dos accesos directos de
   `Union.gs` (H-2) y retirar `reclasificarSolapasM2Invertidas_`.
