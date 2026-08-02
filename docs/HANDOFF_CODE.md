# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-02 · último commit al escribirlo: el de esta entrada

## Dónde estamos

**Tramo 1 casi cerrado. El protocolo de configuración ya corre entero por API.**

Desde el `Paso-2.14`, `Estado` y `Aplicar` se invocan por HTTP y devuelven **lo mismo que el
menú, carácter por carácter** — verificado en los dos caminos el 02/08. Ya no hace falta que
una persona abra la planilla y copie números a mano para verificar un paso.

Y el diff sigue sin ruido: `cambiadas: 0 · agregadas: 0 · migraciones: 0 · solo_en_hoja: 7 ·
protegidas (con diferencia): 0 · protegidas (sin diferencia): 8 · sin cambios: sí`.

## Qué sigue — `docs/PLAN.md` §2, Tramo 1

Quedan cuatro, sin orden entre sí:

1. Dar acceso de lectura a `reporteseinformesgcba` sobre las cuatro bases (`D-02`). **No
   depende de terceros**: son cuentas del usuario.
2. `periodo_id` en `CAMPANAS` y `REUNIONES` (`D-08`). No toca código.
3. Repuntar `carpeta_salida` a reportes (`D-03`).
4. **Registrar M2** — primera medición de `D-01`, con la predicción anotada *antes* de
   correrla, y **en celdas, no en filas** (nota de método 3 de `PLAN.md`).

## Lo que hay que saber antes de tocar algo

- **La UI se pide con `ui_()`, nunca con `SpreadsheetApp.getUi()`.** Las únicas tres
  excepciones son `onOpen` (necesita `createMenu`), `hayUi_` (la sonda) y el propio `ui_()`.
  Un `try { getUi() }` suelto rompe la garantía de que hay **un solo lugar** donde esa
  excepción significa algo.
- **`prompt` sin UI tira; `alert` sin UI devuelve `null`.** Un confirm degrada a *no
  confirmado*, nunca a "sí". Si una función necesita un dato de la persona, ese dato entra
  **por parámetro** — el patrón está en `cargarTemario(texto)`.
- **Quien toca una función con control positivo corre los controles antes de cerrar**
  (`CLAUDE.md` §4). El protocolo desde el menú pasa igual aunque los cinco estén mal; eso ya
  dejó un control fallando un día entero.
- **Un Bearer vencido devuelve HTML con HTTP 200** y se lee como motor roto. Antes de
  diagnosticar: `node tools/token.js --forzar` (`RUNBOOK` Parte G).
- **`origen` en `SOLAPAS` hace dos trabajos** —procedencia y protección— y mientras sean la
  misma columna hay que elegir entre nota correcta y protección.

## Abierto

`docs/PENDIENTES_consistencia.md`. Lo más cercano a lo que viene:

- **P1 · `probarMigracionesEnDiff_` está vencido.** Prueba, no código: afirma el contrato
  previo a la Parte E del 2.11. Los casos 1, 2 y 4 tienen el mismo problema. **Es lo primero
  a saldar si se toca `Instalar.gs`**, porque hoy el control de `C.2-3` no protege nada.
- **P1 · la inferencia invertida** de `auditarFormulasResumenesLooker_`.
- **P1 · `promoverFechasElegidas()`** escribe siete filas de `MAPEO` que ningún `SEED_MAPEO_`
  conoce.
- **P1 · `H-2`** · `BASES.fila_encabezado` vestigial, **sin paso asignado** desde que se
  archivó la Parte D del 2.11. Necesita uno propio.
- **P2 · `diagnosticoBases_()` lista solapas `ignorar`** — precondición de `D-11`.
- **P2** · las notas de las ocho protegidas de `rdv`; el designador de paso no es único.
