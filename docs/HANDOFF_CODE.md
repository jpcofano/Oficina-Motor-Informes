# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.
> Los handoffs de `docs/Sesiones/` son de claude.ai — se leen, no se tocan.

**Última actualización:** 2026-07-31 · último commit al escribirlo: `c1081a6`

## Dónde estamos

`DOC-4` (taxonomía y bitácora) en curso — Parte A cerrada (taxonomía completa de 21
documentos en `PROYECTO.md` §9, decisión de periodicidad confirmada y archivada). Antes
de esto: Paso 2.9 completo (A-H) — lector corregido, looker revertido a
`resumen_metricas_dinamico`, higiene de `SOLAPAS`, hoja `REUNIONES`, corte vertical en
`Marcadores.gs`/`VISTA_PREVIA`, anclaje reescrito sobre `REUNIONES` con umbral en
`CONFIG`, hojas `SECCIONES` y `VALORES`/`VALORES_DIVERGENTES`.

**Ojo:** `docs/Sesiones/HANDOFF_2026-07-31-2.md` (segunda sesión de claude.ai del 31/07,
posterior a los commits de Paso 2.9) señala que buena parte de Paso 2.9 se ejecutó de
corrido sin verificar contra la planilla viva — ver "Qué sigue" abajo.

## Qué sigue

1. **Verificar Paso 2.9 contra datos reales** (no quedó registrado en la sesión que lo
   hizo): releer los conteos de "Probar lectura por ventana" (sobre todo `m2`: ¿da del
   orden de 29.533, o sigue en 18?); mirar `VISTA_PREVIA` (los diez tokens `ecv_*`, las
   tres verificaciones de control, columnas `filas` y `operacion`); correr el anclaje de
   verdad y confirmar que no hay timeout. Sin prompt propio todavía — es una verificación,
   no un paso nuevo.
2. Terminar `DOC-4`: Parte B (este mismo commit), Parte C (higiene de
   `docs/Sesiones/`), Parte D (verificar `CLAUDE.md`) — `docs/Prompts/DOC-4_taxonomia_y_bitacora.md`.
3. Pendiente de DOC-2, todavía sin cerrar: correr el instalador dos veces y confirmar que
   `MARCADORES` no tiene la columna `calculo`.

## Trabado

Nada bloqueando activamente. La verificación del punto 1 de "Qué sigue" es la que más
importa antes de seguir construyendo sobre el lector/anclaje/corte vertical.
