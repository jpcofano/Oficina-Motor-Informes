# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.
> Los handoffs de `docs/Sesiones/` son de claude.ai — se leen, no se tocan
> (excepción declarada: `HANDOFF 2026-08-01.md`, ver `docs/PENDIENTES_consistencia.md`).

**Última actualización:** 2026-08-01 · último commit al escribirlo: `0f05f7f`

## Dónde estamos

**`Paso 2.11` Parte C + C.2-1 cerradas y probadas.** El protocolo de siete pasos
(`docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md`) **pasó completo** en su segunda
corrida: apply ×2 con `nuevas: 0 · cambiadas: 0`, `DIFF_CONFIGURACION` con las 10
protegidas y ninguna línea de cambio, "Estado de configuración" en cero y **consistente**
con las dos corridas de apply. Evidencia de las dos corridas:
`docs/PROTOCOLO_2.11-C_corrida_2026-07-31.md`.

Qué quedó funcionando:

- **Un solo "Aplicar configuración"** que corre los cuatro sembradores en orden fijo y
  reporta un diff real (clave, columna, de qué valor a qué valor), no un conteo.
  `menuEstadoConfiguracion_()` hace el mismo cálculo sin escribir.
- **`normalizarParaComparar_()`** en `calcularDiffUpsert_()`: `Date` y string-fecha se
  comparan canonicalizados a ISO, así que el diff dejó de reportar como cambio lo que solo
  era diferencia de tipo. Nunca se escribe el valor normalizado.
- **Migración `corregirNotaControlAnclaje_()` retirada**: revertía en cada corrida la nota
  que `SEED_SOLAPAS_` ya traía bien. Era la causa del paso 4; el paso 5 se cayó solo con
  eso, sin arreglo propio.

**El diff funciona, pero todavía no es auditable.** Distinción importante: pasar el
protocolo no es estar terminado.

## Qué sigue

1. **Limpiar las filas de prueba del control positivo** en la planilla (pendiente del
   humano — Code no tiene acceso a Sheets). Ver la sección de abajo: **una de las tres
   instrucciones crearía un duplicado**, leerla antes de ejecutar.
2. **`C.2-2` a `C.2-7`** del prompt, que es donde el diff se vuelve auditable:
   - `C.2-2` cabecera de corrida + bloque de alcance (hoy hay que vaciar
     `DIFF_CONFIGURACION` y `ESTADO_CONFIGURACION` a mano para saber qué es de cuándo).
   - `C.2-3` las migraciones pasan por el diff (hoy S-01 aparece en el resumen con cero
     celdas cambiadas y no se puede saber si escribe o no).
   - `C.2-4` las 10 protegidas dicen qué se habrían perdido.
   - `C.2-5` línea `solo_en_hoja` (hoy la fila huérfana de `MAPEO` no se reporta).
   - `C.2-6` resumen desagregado · `C.2-7` documentación + snapshots.
3. Después, el orden lineal pendiente de `Paso-2.10`: Parte B (verificar contra la tabla de
   doce valores medidos), `Paso-2.10_ParteD_con_R10` (R-10 + hoja `VALIDACION`), Parte E
   (corte vertical a Orden Público), Partes G y A. `Paso-2.12` Parte 2 (las 17 disposiciones
   de `SOLAPAS.uso`) y Parte 3 (retirar `reclasificarSolapasM2Invertidas_`) siguen abiertas.

## Trabado

Nada bloqueando. Tres pendientes anotados en `docs/PENDIENTES_consistencia.md`, ninguno
urgente: `BASES.fila_encabezado` con formato de fecha (cosmético — es `number`, `m2 = 3`),
H-2 (que sigue en pie por otra razón: `BASES.m2 = 3` contra `SOLAPAS.m2/Cuentas M2 = 1` y
los dos accesos directos de `Union.gs:36`/`:261`), y el handoff que Code escribió en
`docs/Sesiones/`, que la regla le prohíbe.

## Limpieza de las filas de prueba — leer antes de ejecutar

Del control positivo quedaron tres cosas en la planilla. **Verificado contra
`SEED_MAPEO_`, no contra el snapshot: el snapshot del paso 0 no está en el repo** (se tomó,
pero `docs/_snapshots/` no existe acá — es parte de `C.2-7`).

| qué | acción |
|---|---|
| `SOLAPAS`, fila `zz_prueba` | **borrar** |
| `MAPEO`, fila `zz_prueba` | **borrar** |
| `MAPEO`, fila `ahhh / cc / cdcdd` | **borrar, NO restaurar** — ver abajo |

**La fila `ahhh` no hay que devolverla a `M2 periodo DIRECTA`: hay que borrarla.** La clave
de `MAPEO` es el trío `(base_id, solapa, campo_logico)`. Al editar `solapa` a `ahhh`, la
clave original `(m2, M2 periodo DIRECTA, or)` desapareció, y el seed **ya la volvió a
crear** en la corrida 1 (salió reportada como `nueva`). Restaurar la fila `ahhh` a esos
valores dejaría **dos filas con el mismo trío** — exactamente el duplicado que la clave
compuesta del Paso 2.3.2 existe para evitar, y que `validarMapeo()` marca.

Antes de borrar, confirmar que la fila re-creada por el seed está y es correcta:
`m2 | M2 periodo DIRECTA | or | M2 periodo DIRECTA | G | notas vacías` (`SEED_MAPEO_`,
`Instalar.gs:629`; `solapa` la completa `backfillSolapaMapeo_` desde `hoja`). Si por lo que
sea no está, entonces sí conviene restaurar la fila `ahhh` en vez de borrarla — pero una de
las dos, nunca las dos.

Después de limpiar: **"Estado de configuración"** una vez más, para confirmar que sigue en
cero.
