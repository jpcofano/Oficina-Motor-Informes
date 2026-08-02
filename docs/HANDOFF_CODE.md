# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-02 (cierre) · último commit al escribirlo: el de esta entrada

## Dónde estamos

**Tramo 1 con cuatro ítems abiertos. Nada bloqueado.**

Lo que se cerró hoy: el **Paso 1.8** (`✅`, las cuatro pruebas de aceptación), el **2.11
Parte E**, el **2.12** entero, el **DOC-6**, el **DOC-7** y el **2.14** con su addendum.

Dos cosas que cambian cómo se trabaja de acá en adelante:

- **El protocolo de configuración corre entero por API.** `Estado` y `Aplicar` se invocan por
  HTTP y devuelven lo mismo que el menú, carácter por carácter — verificado en los dos
  caminos. Ya no hace falta que una persona abra la planilla para verificar un paso.
- **El diff quedó sin ruido:** `cambiadas: 0 · agregadas: 0 · migraciones: 0 ·
  solo_en_hoja: 7 · protegidas (con diferencia): 0 · protegidas (sin diferencia): 8`.

Y los cinco controles positivos vuelven a proteger algo: **5 de 5**.

## Qué sigue — Tramo 1 (`docs/PLAN.md` §2)

Cuatro, sin orden entre sí:

1. Dar acceso de lectura a `reporteseinformesgcba` sobre las cuatro bases (`D-02`). **No
   depende de terceros**: son cuentas del usuario.
2. `periodo_id` en `CAMPANAS` y `REUNIONES` (`D-08`). No toca código.
3. Repuntar `carpeta_salida` a reportes (`D-03`).
4. **Registrar M2** — primera medición de `D-01`, con la predicción anotada *antes* de
   correrla y **en celdas, no en filas**.

**Desbloqueados hoy, pero son del Tramo 2:** `Paso-2.5` y `Paso-2.13`. `D-17` decidió que el
dueño de `MARCADORES` es la plantilla; `SEED_MARCADORES_` no se hace. El orden entre esos dos
no está decidido.

## Lo que hay que saber antes de tocar algo

- **La UI se pide con `ui_()`**, nunca con `SpreadsheetApp.getUi()`. Las tres excepciones son
  `onOpen`, `hayUi_` (la sonda) y el propio `ui_()`.
- **`prompt` sin UI tira; `alert` sin UI devuelve `null`** — un confirm degrada a *no
  confirmado*, nunca a "sí". Un dato que la función necesita entra **por parámetro**: el
  patrón está en `cargarTemario(texto)`.
- **Quien toca una función con control positivo corre los controles antes de cerrar**
  (`CLAUDE.md` §4). Ya dejó un control fallando un día entero.
- **La API falla de dos formas que se leen como motor roto**, y las dos están en el `RUNBOOK`
  Parte G: `/dev` devuelve **404 intermitente** (medido: 200, 404, 404, 200 en cuatro pedidos
  idénticos), y un **Bearer vencido devuelve HTML con HTTP 200**. Reintentar y renovar antes
  de sospechar del código.
- **`origen` en `SOLAPAS` hace dos trabajos** —procedencia y protección— y mientras sean la
  misma columna hay que elegir entre nota correcta y protección.

## Abierto

`docs/PENDIENTES_consistencia.md`. Lo que más pesa para lo que viene:

- **P1 · `promoverFechasElegidas()`** escribe siete filas de `MAPEO` que ningún `SEED_MAPEO_`
  conoce. Es el P1 original de `C.2-7` y sigue sin declarar.
- **P1 · la inferencia invertida** de `auditarFormulasResumenesLooker_`. Falta un estado
  `ambas_independientes`; hasta entonces sus dos funciones no vuelven al menú.
- **P1 · `H-2`** · `BASES.fila_encabezado` vestigial y leída directo por `Union.gs:36`/`:261`.
  **Sin paso asignado** desde que se archivó la Parte D del 2.11 — necesita uno propio.
- **P0 · R-06, R-09 y R-10** sin implementar en código.
- **P2** · `diagnosticoBases_()` lista solapas `ignorar` (precondición de `D-11`); las notas
  de las ocho protegidas de `rdv`; el designador de paso no es único.
