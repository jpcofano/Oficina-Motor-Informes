# Paso 3 — Primer cálculo real en `Marcadores.gs`

> Requiere Pasos 0–2. AHORA SÍ se toca `Marcadores.gs`: es el único lugar donde vive
> la aritmética (regla de oro). El motor lee la fila del marcador, obtiene los datos
> vía `Fuentes.gs` (Paso 2) y llama a la función de cálculo indicada en la columna
> `calculo`.

Contexto: cada fila de `MARCADORES` declara `base_id`, `campo_logico`, `periodo_ref`
y `calculo` (nombre de función). Ver `ARQUITECTURA_registros.md`.

1. **Contrato de las funciones de cálculo** (en `Marcadores.gs`):
   - Firma uniforme, ej.: `function calcXXX(ctx) { ... return valor }` donde `ctx`
     trae todo lo necesario: `{ base_id, campo_logico, ventana, leer }`, siendo `leer`
     un acceso a las funciones de lectura del Paso 2 (`leerColumna`, etc.).
   - Las funciones NO abren bases ni resuelven MAPEO por su cuenta: reciben datos ya
     leídos o el helper `leer`. Así la aritmética queda aislada del acceso a datos.

2. **Implementá 2–3 cálculos reales** para los ejemplos del registro:
   - `calcInscriptos(ctx)` → suma/valor de la columna `inscriptos` de RDV en la ventana.
   - `calcAlcance(ctx)` → valor de `alcance` de Looker.
   - `calcEnvios(ctx)` → valor de `envios` de M2.
   (Ajustá a lo que realmente devuelvan las bases; si un campo es un total ya calculado,
   el `calc` puede ser tomar la última fila / el valor único, no necesariamente sumar.)

3. **Despachador** (en `Generador.gs` o donde indique el contrato — NO en `Marcadores.gs`):
   - `calcularMarcador(fila_marcador)`:
     a. Resuelve la ventana (Paso 2) según `periodo_ref` / campaña.
     b. Arma el `ctx` y llama por nombre a la función de `calculo`
        (ej. mapa `{ calcInscriptos, calcAlcance, calcEnvios }` o `this[nombre]`).
     c. Aplica `formato` (numero / miles / porcentaje / fecha) al resultado.
     d. Devuelve `{ marcador, valor, valor_formateado, trazabilidad }` donde
        trazabilidad = `{ base_id, hoja, columna, desde, hasta, calculo }`.
   - Si algo falla (sin mapeo, base caída, función inexistente) → `valor=null` +
     estado ⚠️ con motivo; NO cortar toda la corrida por un token.

4. **Prueba** (ítem de menú "Calcular marcador de prueba"):
   - Calcular `ecv_inscriptos` para el período de CONFIG y mostrar en alert/log:
     valor, valor formateado, y la trazabilidad completa ("salió de RDV, hoja X,
     columna Y, del DD/MM al DD/MM, vía calcInscriptos").

Mantené la regla de oro: solo `Marcadores.gs` hace aritmética; el despacho, la
resolución de ventana y el formateo van fuera.

Prueba del usuario: "Calcular marcador de prueba" → devuelve un número real de RDV con
su trazabilidad. Cambiar el período en CONFIG cambia el número.
Al cerrar: commit `Paso 3 ✅ — primer cálculo real + trazabilidad`.
