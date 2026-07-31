# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.
> Los handoffs de `docs/Sesiones/` son de claude.ai — se leen, no se tocan.

**Última actualización:** 2026-07-31 · último commit al escribirlo: `5b72cf4`

## Dónde estamos

`Paso 2.10` en curso, ejecutándose parte por parte sobre `docs/Prompts/Paso-2.10_PartesBC_verificado.md`
(reemplaza a las Partes B/C del prompt original `Paso-2.10_anclar_a_numeros_verificados.md`)
y `docs/Prompts/Paso-2.10_ParteD_con_R10.md`. **Parte B hecha y probada contra la planilla
en vivo:** `SOLAPAS.filas_datos` dejó de contar relleno de fórmula (contaba
`getLastRow()-1`, que en `m2/M2 periodo DIRECTA` daba 29.533 en vez de ~18-20 reales);
ahora cuenta filas con alguna celda no vacía tras `trim()` sobre todo `getDataRange()`.
`filas_crudas` (columna nueva) conserva el valor viejo al lado, para que la diferencia
entre las dos siga siendo diagnóstico visible. Código en `Instalar.gs`/`Solapas.gs`/
`Config.gs`, ver `docs/BITACORA.md` "Paso 2.10 Parte B".

## Qué sigue

Orden sugerido por el prompt: B → C → D → E → F → G → A. B ✅. F (reglas de negocio)
ya se había hecho antes, por separado, como R-05 a R-10 (`docs/REGLAS_NEGOCIO.md`).
Quedan:

1. **Parte C** (`Paso-2.10_PartesBC_verificado.md` §"Parte C"): bajar **seis** solapas
   `periodo` a `uso=referencia` en `SEED_SOLAPAS_` (no cuatro — hay dos más en `digital`:
   `Buscador por periodo digital` y `Buscador por periodo directa`, con el período en la
   fila 2 en vez de la fila 1). Sacar `M2 periodo DIRECTA`/`M2 periodo DIGITAL` de
   `SOLAPAS_M2_INVERTIDAS_` o cambiar su destino a `referencia`. Declarar
   `digital/Directa Mail` como `fuente` y `m2/Directa mail` como `derivada` (son espejo).
   **No reapuntar `MAPEO` de `m2`** — queda `sin_fuente`, con nota, y `BASES.m2.hoja_default`
   se vacía o la base pasa a `activo=no` con nota (para que el fallo sea visible).
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

Nada bloqueando. Antes de la Parte C conviene correr "Inventariar solapas" una vez más
sobre la planilla en vivo con el `filas_datos` ya corregido, para tener los números frescos
de la tabla de aceptación de la Parte B (`m2`/`rdv`/`digital`/`looker`) a mano si hace
falta compararlos.
