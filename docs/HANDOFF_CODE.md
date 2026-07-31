# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.
> Los handoffs de `docs/Sesiones/` son de claude.ai — se leen, no se tocan.

**Última actualización:** 2026-07-31 · último commit al escribirlo: `7dcc564`

## Dónde estamos

`Paso 2.10` en curso, sobre `docs/Prompts/Paso-2.10_PartesBC_verificado.md` (reemplaza a
las Partes B/C del prompt original) y `docs/Prompts/Paso-2.10_ParteD_con_R10.md`.
**Partes B y C con código hecho:**

- **B** (probada contra la planilla en vivo): `SOLAPAS.filas_datos` dejó de contar
  relleno de fórmula; cuenta filas con alguna celda no vacía tras `trim()` sobre todo
  `getDataRange()`. `filas_crudas` (columna nueva) conserva el valor viejo al lado.
- **C** (código hecho, **falta la vuelta de prueba**): las seis solapas "periodo" pasan
  a `uso=referencia` en `SEED_SOLAPAS_`; `m2/Directa mail` → `derivada` (espejo de
  `digital/Directa Mail`); `SOLAPAS_M2_INVERTIDAS_` ya no incluye `M2 periodo *`;
  `SEED_BASES_.m2.hoja_default` → `''` (antes apuntaba a una solapa que ahora es
  `referencia` y, en `modo_periodo=snapshot`, `leerFuente` no pasa por `buscarMapeo()` —
  sin este cambio seguiría leyendo esa vista entera sin avisar). `MAPEO` de `m2` no se
  tocó a propósito.

Ver `docs/BITACORA.md` "Paso 2.10 Parte B" y "Paso 2.10 Parte C".

**Pendiente inmediato:** el usuario corrió "Probar lectura por ventana" antes de
sembrar los cambios de la Parte C (`SEED_BASES_`/`SEED_SOLAPAS_` no se aplican solos con
"Instalar / reparar hojas" — hacen falta, aparte, "Cargar config inicial" y "Sembrar
clasificación inicial de solapas"). `rdv`/`digital`/`looker` salieron ✅; `m2` todavía
leía `M2 periodo DIRECTA` (29.531 filas) porque el `hoja_default` vacío no se había
sembrado. Falta la vuelta de prueba después de sembrar, y confirmar que las 9 solapas en
`revisar` bajan a 3.

## Qué sigue

Orden del prompt: B → C → D → E → F → G → A. B ✅, C con código hecho (confirmar
prueba). F ya se había hecho antes, por separado, como R-05 a R-10
(`docs/REGLAS_NEGOCIO.md`). Quedan:

1. **Confirmar la Parte C** contra la planilla en vivo (ver "Pendiente inmediato").
2. **`docs/Prompts/Paso-2.10_ParteD_con_R10.md`**, en dos partes, en orden — corre
   *después* de C:
   - **R-10** primero: `normalizar_()` en `Fuentes.gs` (colapsa espacios/saltos de línea,
     preserva mayúsculas/acentos/guiones bajos — plegar case colisiona columnas reales,
     ver el prompt). Aplicar en `leerFuente` y `buscarMapeo()`, reemplazando los `trim()`
     actuales sobre encabezados. `SOLAPAS.firma_encabezado` guarda el encabezado CRUDO,
     no el normalizado. Agregar control de encabezados duplicados tras normalizar.
   - **Parte D**: hoja `VALIDACION`, sembrada desde `docs/casos_validacion_2026-07-31.csv`
     (falta copiar ese CSV y `docs/VALIDACION_2026-07-31.md` al repo — es la Parte A,
     al final). `menuCorrerValidacion_()` resuelve la traza de cada caso y reporta
     ✅/⚠/❌ según la semántica `exacto`/`deriva`/`sin_fuente` del prompt.
3. **Parte E**: corte vertical pasa de Retiro a **Orden Público 28/07** (12 tokens
   verificados al dígito, cuatro caminos de lectura distintos — RDV directo, Mail por fila
   única, IVR por SUMA de 2 filas, Looker de control). Reemplaza a
   `menuCorteVerticalRetiro2407_` (`Codigo.gs`).
4. **Parte G**: `REUNIONES` necesita `bloque`, `orden_informe` y `mostrar=pendiente` —
   cargar el temario completo del 24-30/07 como caso de prueba del parser.
5. **Parte A**: al final — copiar `VALIDACION_2026-07-31.md` y
   `casos_validacion_2026-07-31.csv` a `docs/`, y archivo nuevo en `docs/Sesiones/`
   (`HANDOFF_2026-07-31-2.md`) con las tres conclusiones (validación contra el informe
   publicado, hipótesis del colapso descartada, corte vertical a Orden Público).
6. **Implementar en código** R-06 (control de filas sin `id_cuenta` válido) y R-09
   (nunca auto-seleccionar un candidato cancelado/reprogramado en el anclaje) —
   `docs/PENDIENTES_consistencia.md` P0. R-10 se resuelve como parte del punto 2 de acá.
7. Pendiente de DOC-2, todavía sin cerrar: correr el instalador dos veces y confirmar que
   `MARCADORES` no tiene la columna `calculo`.

## Trabado

Nada bloqueando. La Parte C quedó commiteada con el código hecho pero sin la vuelta de
prueba confirmada — es lo primero para retomar la próxima sesión.
