# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.
> Los handoffs de `docs/Sesiones/` son de claude.ai — se leen, no se tocan.

**Última actualización:** 2026-07-31 · último commit al escribirlo: `dfe09bf`

## Dónde estamos

`DOC-4` completo (Partes A-D: taxonomía de 23 documentos, `HANDOFF_CODE.md`/`BITACORA.md`
revividos, handoffs de `docs/Sesiones/` reordenados, `CLAUDE.md` verificado). Después de
eso: `docs/REGLAS_NEGOCIO.md` con R-05 a R-10 nuevas (`docs/Prompts/REGLAS_R09_R10.md` +
las dos partes de `Paso-2.10` que R-06/R-07/R-08 necesitaban para no dejar un salto de
numeración) — **solo la documentación de las reglas, ninguna se implementó en código**.

## Qué sigue

1. **Verificar Paso 2.9 contra datos reales** — sigue siendo el pendiente más importante,
   señalado por `docs/Sesiones/HANDOFF 2026-07-31-2.md`. **Actualización importante:**
   `docs/Prompts/Paso-2.10_PartesBC_verificado.md` ya corrió esa verificación y **descartó
   la hipótesis del colapso**: `m2` devuelve 18 porque hay 18 filas reales (el resto es
   relleno de fórmula), y las brechas de `rdv`/`digital`/`looker` tienen tres causas
   distintas, todas medidas. Falta aplicar esas correcciones al código — es la Parte B/C
   de `Paso-2.10` (`filas_datos` vs `filas_crudas` en `SOLAPAS`, seis solapas `periodo` a
   `uso=referencia`, control de `columna_fecha` inexistente).
2. **Paso 2.10 completo** (`docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` +
   `Paso-2.10_PartesBC_verificado.md`, orden sugerido B→C→D→E→F→G→A): corregir
   `SOLAPAS.filas_datos`, bajar las seis solapas `periodo` a `referencia`, crear la hoja
   `VALIDACION` sembrada desde `docs/casos_validacion_2026-07-31.csv`, mover el corte
   vertical de Retiro a Orden Público 28/07 (12 tokens verificados al dígito), cargar el
   temario completo del 24–30/07 en `REUNIONES`. La Parte F (reglas de negocio) ya se hizo
   por separado, hoy, como R-05 a R-08.
3. **Implementar en código las tres reglas nuevas que quedaron solo documentadas:** R-06
   (control de filas sin `id_cuenta` válido), R-09 (nunca auto-seleccionar un candidato
   cancelado/reprogramado en el anclaje), R-10 (`normalizar()` de encabezados en
   `Fuentes.gs`/`buscarMapeo()`) — ver `docs/PENDIENTES_consistencia.md` P0.
4. Pendiente de DOC-2, todavía sin cerrar: correr el instalador dos veces y confirmar que
   `MARCADORES` no tiene la columna `calculo`.

## Trabado

Nada bloqueando. El orden natural es Paso 2.10 completo (destraba el resto con números
verificados) antes de seguir construyendo sobre `SECCIONES`/`VALORES` (Paso 2.9 G/H), que
siguen sin probarse contra la planilla real.
