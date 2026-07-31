# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.
> Los handoffs de `docs/Sesiones/` son de claude.ai — se leen, no se tocan.

**Última actualización:** 2026-07-31 · último commit al escribirlo: `429a719`

## Dónde estamos

`Paso 2.11` (`docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md`) — consolidación,
sin agregar funcionalidad. Partes A y B hechas y probadas contra la planilla en vivo:

- **A:** `HOJAS_CONFIG_` es solo esquema (sin `ejemplos`); `instalar()` ya no escribe
  filas de datos. `INFORMES`/`PERIODOS` cableados a `seedConfiguracion()`;
  `CAMPANAS`/`REUNIONES` movidos a `SEED_*_EJEMPLO_` sin sembrador automático.
- **B:** `SOLAPAS.fila_encabezado` es la fuente (`resolverFilaEncabezado_()`,
  Fuentes.gs), `BASES.fila_encabezado` solo default. Siete solapas de `m2` corregidas
  de 3→1, `Mail per` (×2) a `0` ("sin fila de títulos"). `firma_encabezado` implementada
  por fin: `inventariarSolapas()` vuelca la fila real que señala `fila_encabezado`.

**Reordenamiento en curso (pedido del usuario):** antes de seguir con la Parte C de
2.11, se abrió `Paso-2.12` (`docs/Prompts/Paso-2.12_conteos_y_clasificacion.md`) porque
el análisis de cobertura post-Parte B encontró un bug bloqueante: en `Solapas.gs`
(`inventariarSolapas()`), `filas_crudas = Math.max(getLastRow()-1, 0)` restaba un
encabezado que `filas_datos` (Paso 2.10 Parte B) ya incluye — 65 de las 84 filas de
`SOLAPAS` daban `filas_datos = filas_crudas + 1` exactamente, así que el cociente de
cobertura pasaba de 100%, el guardarraíl del 90% (`UMBRAL_COBERTURA_LECTURA_`,
Fuentes.gs) nunca se disparaba, y cualquier diff que arme la Parte C de 2.11 iba a
mostrar números incoherentes sin poder distinguir si era el diff o el dato de base.

**`Paso-2.12` Parte 1 — commiteada (`filas_crudas = hojaSheet.getLastRow()`, sin el
`- 1`), falta la prueba en la planilla.** Con la clasificación actual (sin la Parte 2 de
2.12), el criterio de aceptación es que dispare **una sola** ⚠ de cobertura
(`rdv/RVD JM-CM - ES`, 721/1363 ≈ 53%, relleno de fórmula sobre 720 encuentros reales) —
la segunda (`digital/Cuentas`, 79%) aparece recién con la Parte 2. Falta verificar el
invariante `filas_datos <= filas_crudas` en las 84 filas antes de dar la Parte 1 por
cerrada. Ver `docs/BITACORA.md` "Paso 2.11 Parte A", "Parte B" y "Paso 2.12 Parte 1".

## Qué sigue

Orden confirmado por el usuario:

1. **Probar `Paso-2.12` Parte 1** en la planilla — correr "Inventariar solapas",
   confirmar la única ⚠ esperada y el invariante `filas_datos <= filas_crudas` en las
   84 filas de `SOLAPAS`.
2. **`Paso-2.11` Parte C** — un solo "Aplicar configuración" (`menuAplicarConfiguracion_`,
   corre los cuatro sembradores en orden fijo, reporta diff real de valor a valor, no
   conteo) + `menuEstadoConfiguracion_()` de solo lectura (discrepancias código↔planilla).
3. **`Paso-2.11` Parte D** — menú por función (no por número de paso), submenús
   (`Configuración`/`Correr`/`Verificar`/`Diagnósticos`/`Avanzado`), retirar diagnósticos
   de hipótesis cerradas, `docs/RUNBOOK.md` con la tabla ítem→qué hace→cuándo. **Dentro
   de esta parte va también `Paso-2.12` Parte 3** (retirar
   `reclasificarSolapasM2Invertidas_()` — caso de ejemplo de "migración con premisa
   vencida", ya no puede dispararse desde que `SOLAPAS_M2_INVERTIDAS_` perdió las dos
   `M2 periodo *` en el Paso 2.10 Parte C).
4. **`Paso-2.12` Parte 2** — las 17 disposiciones de cobertura (qué hacer con cada ⚠ de
   `SOLAPAS`/`filas_datos` vs `filas_crudas`), al final, cuando el diff de la Parte C de
   2.11 ya exista para apoyarse en él.

Después de cerrar todo lo anterior, retoma el orden lineal de `Paso-2.10`: Parte B
(verificar contra la tabla de doce valores medidos, ahora que `filas_datos`/
`filas_crudas` están corregidas de punta a punta), `Paso-2.10_ParteD_con_R10` (R-10 +
hoja `VALIDACION`), Parte E (corte vertical a Orden Público), Partes G y A (`REUNIONES` +
handoff). R-06 y R-09 (anclaje) quedan fuera, son Paso 3.

## Trabado

Nada bloqueando. `Paso-2.12` Parte 1 ya está commiteada; retomar pidiendo al usuario que
corra "Inventariar solapas" y confirme la única ⚠ esperada + el invariante
`filas_datos <= filas_crudas`.
