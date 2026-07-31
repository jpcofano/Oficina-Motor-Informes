# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.
> Los handoffs de `docs/Sesiones/` son de claude.ai — se leen, no se tocan.

**Última actualización:** 2026-07-31 · último commit al escribirlo: `fa1d595`

## Dónde estamos

`Paso 2.11` (`docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md`) — paso de
consolidación, **sin agregar funcionalidad**, que las Partes D/E/G de `Paso-2.10` esperan
mientras dura. Nació de un hecho concreto: el `Paso-2.10` Parte C se commiteó y pusheó,
pero `m2` seguía leyendo `M2 periodo DIRECTA` — no un bug de Code, sino que el mismo dato
(`BASES.m2.hoja_default`) estaba escrito dos veces en el repo (`HOJAS_CONFIG_.ejemplos` y
`SEED_BASES_`, con valores contradictorios) y cuál ganaba dependía de qué ítem de menú se
corría último.

**Parte A hecha y probada contra la planilla en vivo:** `HOJAS_CONFIG_` pasó a ser solo
esquema (`headers`, sin `ejemplos`); `instalar()` ya no escribe filas de datos. Los datos
reales que vivían en `ejemplos` de `INFORMES`/`PERIODOS` se cablearon a
`seedConfiguracion()` (misma categoría durable que `BASES`/`MAPEO`); los de
`CAMPANAS`/`REUNIONES` se movieron a `SEED_CAMPANAS_EJEMPLO_`/`SEED_REUNIONES_EJEMPLO_`
sin sembrador automático (son curados a mano, cambian cada semana — un upsert automático
podría pisar la campaña/reunión real). Test confirmado: "Instalar / reparar hojas" ya no
toca `BASES`/`MAPEO`/`MARCADORES`. Ver `docs/BITACORA.md` "Paso 2.11 Parte A".

## Qué sigue

Orden del prompt, un commit por parte, verificando en la planilla entre una y otra:

1. **Parte B — `fila_encabezado` es por solapa, no por base.** `BASES.m2.fila_encabezado
   = 3` se aplica hoy a toda la base, pero solo es correcto para las dos vistas
   `M2 periodo *`. Ocho solapas de `m2` (`Directa mail`, `M2 Directa`, `M2 digital`,
   `Seguimiento digital`, `CAMPAÑAS_DESGLOCE_DIGITAL`, `Alcance`, `Digital acumulado`)
   están mal en `SOLAPAS` (dicen 3, es 1) — leer con encabezado en la fila 3 toma datos
   de la fila 2 como títulos, sin fallar. Además `Mail per` (`m2` y `digital`) no tiene
   fila de títulos: `fila_encabezado = 0` con el significado "sin fila de títulos" —
   ninguna solapa `fuente` puede tener `0`. Tareas: corregir `SEED_SOLAPAS_` con la tabla
   del prompt §Parte B; `SOLAPAS.fila_encabezado` pasa a ser la fuente, `BASES.fila_encabezado`
   solo el default para solapas no declaradas; `leerFuente` usa `SOLAPAS.fila_encabezado`
   y cae a `BASES` solo si no encuentra fila.
2. **Parte C — un solo "Aplicar configuración", con diff.** `menuAplicarConfiguracion_()`
   corre los cuatro sembradores (`instalar`, `seedConfiguracion`,
   `sembrarClasificacionSolapas`, `menuSembrarSecciones_`) en orden fijo y reporta diff
   real (de qué valor a qué valor), no un conteo. `menuEstadoConfiguracion_()` de solo
   lectura: filas, distribución de `origen`, discrepancias código↔planilla. Nota de la
   Parte A: los sembradores existentes reportan "actualizada" aunque el valor no haya
   cambiado (no comparan antes de escribir) — es exactamente lo que esta parte corrige.
3. **Parte D — menú por función, migraciones con vencimiento.** Renombrar los 32 ítems
   de menú por lo que hacen (no por el paso que los pidió), agrupar en submenús
   (`Configuración`/`Correr`/`Verificar`/`Diagnósticos`/`Avanzado`), retirar diagnósticos
   de hipótesis ya cerradas (`menuDiagnosticarColapso_`), documentar en cada migración
   one-off en qué commit se introdujo y qué la vuelve innecesaria, borrar las que ya no
   pueden dispararse. `docs/RUNBOOK.md`: tabla ítem de menú → qué hace → cuándo se usa.

Después de cerrar Parte D, retoma el orden lineal de `Paso-2.10`: Parte B
(`filas_datos`/`filas_crudas`, verificar contra la tabla de doce valores medidos —
"quedó a medias: la columna existe pero ningún sembrador la llena" según el propio
`Paso-2.11`), `Paso-2.10_ParteD_con_R10` (R-10 + hoja `VALIDACION`), Parte E (corte
vertical a Orden Público), Partes G y A (`REUNIONES` + handoff). R-06 y R-09 (anclaje)
quedan fuera, son Paso 3 — ver `docs/PENDIENTES_consistencia.md`.

## Trabado

Nada bloqueando. Retomar por la Parte B del Paso 2.11.
