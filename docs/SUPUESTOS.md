# SUPUESTOS

> **Cambio de marcha (Paso 2.9).** Hasta acá se resolvía cada duda antes de avanzar. A
> partir de acá se **asume lo más probable, se registra el supuesto con ID, y se sigue**.
> Cuando un número no cierre, se busca acá el supuesto que lo explica en vez de reabrir
> todo desde cero.
>
> Mismo criterio de `docs/REGLAS_NEGOCIO.md`: ID estable, nunca se reutiliza. Si un
> supuesto se cae, se marca **derogado** con fecha — no se borra la fila.

| ID | supuesto | evidencia | síntoma que lo desmiente | cómo se revierte |
|---|---|---|---|---|
| **S-01** | La fuente de `looker` es **`resumen_metricas_dinamico`** | es una `QUERY` viva sobre `Cuentas` (`=QUERY(Cuentas!A2:G; "SELECT * WHERE Col1 is not null AND Col7 <> 'Pendiente'"; 0)`); `resumen_metricas` es un pegado de valores que hoy coincide y devolvió 899 de 903 filas sin fecha | los totales de Looker quedan quietos entre semanas (`_dinamico` dejaría de crecer con `Cuentas`) | `SOLAPAS`: `resumen_metricas` → `fuente`, `resumen_metricas_dinamico` → `derivada`; mover los 25 `MAPEO` de vuelta; `BASES.hoja_default` → `resumen_metricas` |
| **S-02** | El contrato de fecha es **`fecha_periodo`**; el `campo_logico` `fecha` queda derogado | la selección congelada del 30/07 (`docs/FECHAS_seleccion.md`) usa `fecha_periodo`; `leerFuente()` ya solo busca ese campo (verificado, Paso 2.9 Parte D) | una base filtra por una columna que nadie eligió en `DIAG_FECHAS` | volver a permitir que `leerFuente()` caiga a `campo_logico='fecha'` cuando falte `fecha_periodo` |
| **S-03** | Las 337 filas "sin clave" de `digital` son campañas sin `id_cuenta` asignado, no un error de columna | 26% del total; Parte E del Paso 2.8 no llegó a confirmarlo con las filas reales | una campaña del temario no aparece en el informe por esto | volcar las filas descartadas (`diagnosticoFilasSinClaveDigital_`, Auditoria.gs) y, si hay patrón, corregir la columna clave en `MAPEO` |

## Derogados

- **"`m2` no tiene fuente cruda"** (implícito desde Paso 2.6/2.7, nunca tuvo ID propio) —
  **derogado, Paso 2.9 Parte B, 31/07/2026.** La hipótesis previa era que `M2 periodo
  DIRECTA`/`DIGITAL` violaban R-02 por el banner de período en fila 1-2. La explicación
  real del conteo bajo (18 de 29.533) era que `leerFuente()` descartaba en silencio las
  filas sin clave en vez de devolverlas — ver Parte B. No se vuelve a abrir la pregunta
  de `fila_encabezado=3` sin evidencia nueva.

## Cómo se usa esto

Cuando un número del informe no cierre:
1. Mirar acá antes de reabrir una investigación desde cero — puede ser un supuesto ya
   conocido, no un bug nuevo.
2. Si el síntoma de la columna 4 aparece, es señal de que el supuesto se cayó: revertir
   con la columna 5 y marcar la fila derogada con fecha.
3. Si no hay supuesto que lo explique, es un caso nuevo — recién ahí se investiga a fondo
   y, si corresponde, se agrega una fila acá.
