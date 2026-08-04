# Paso 4 — Motor de reemplazo en Slides

**Estado:** vivo · **Actualizado:** 2026-08-04 · **Reemplaza:** el texto anterior de este mismo
archivo y sus Addenda 1 y 2, que quedan **fusionados acá**. Nunca se ejecutó, así que se edita en
el lugar y no lleva addendum nuevo.

> Requiere Pasos 0–3. Abre la plantilla de un informe, la copia, y reemplaza los `{{tokens}}` por
> los valores calculados. Trabaja sobre Google Slides.
> **NO toca `Marcadores.gs`.** El reemplazo va en `Generador.gs`.

---

## Parte A — Verificación de premisas

**Se verifica y se anota. No se para.** Los tres bloqueos que este paso declaraba se cerraron el
03/08/2026; lo que queda es confirmar que siguen cerrados. Si alguno reapareció, se anota y se
busca la vuelta más simple antes de abandonar el paso.

**A.1 · `INFORMES.plantilla_id`.** Estuvo vacío y fue el bloqueo duro de este paso. **Se cargó el
03/08/2026, en la hoja y en el seed** — `jm` → `117I0qn1…` (22 slides), `secco` → `1_ZKjWhL…`
(29 slides), las dos nativas. Fue al seed a propósito: `upsertPorClave_` reescribe la fila entera
y una celda cargada sola se borraba en la corrida siguiente. **Verificar que los dos IDs sigan
ahí.**

**A.2 · `CONFIG.carpeta_salida`.** Repuntada el 02/08/2026 (`Paso-2.15` Parte A) a
`1LAEVlWZXoGjon2cnaMjGksV0THz3Ejlz` — *Salidas Reportes*, de `reporteseinformesgcba`, con permiso
de escritura verificado. La precondición dura de `D-03` está cumplida. El ID viejo quedó como
`CONFIG.carpeta_motor`, sin lector.

> **Nada de este paso escribe dentro de la carpeta Motor ni la recorre recursivamente.** Ahí
> viven la planilla de control y una subcarpeta de respaldos manuales. Ver la tabla de carpetas
> en `docs/RUNBOOK.md`.

**A.3 · La firma y el retorno de `resolverMarcadores`.** **La manda el código, no este prompt.**
Leerla antes de escribir `B.2`.

Lo importante es qué devuelve, porque el texto viejo de este paso lo tenía mal: **no** devuelve
un mapa `{ '{{token}}': valor }`. Devuelve **una fila por marcador**, con `marcador`, `valor`,
`valor_formateado`, `estado` (`ok` / `sin_datos` / `error`) y `traza`. El mapa de reemplazo se
arma desde ahí, y **el `estado` es lo que decide qué se escribe**.

**A.4 · Reporte por HTTP.** El `Paso-2.14` generalizó `hayUi_()` y el protocolo entero corre por
API. El reporte de corrida de `B.7` tiene que poder devolverse en la respuesta, no sólo por
`alert`.

**A.5 · El registro de corrida — decidido, no a proponer.** `INFORMES` es registro de plantillas,
no de corridas: meterle el nivel de instancia lo conflaría.

**Se crea la hoja `CORRIDAS`**, con este esquema:

```
corrida_id · informe_id · periodo_id · deck_id · fecha_generacion ·
tokens_reemplazados · faltantes · mapa_tokens
```

`mapa_tokens` va serializado en la celda. **Si no entra**, partirlo a una hoja aparte a nivel
token y anotar cuál de las dos quedó y por qué.

**A.6 · Los `prueba_*` se retiran antes de generar.** Los once marcadores del corte vertical
están cargados con `informe_id = jm` y **no existen en la plantilla**. Si quedan, ensucian los
conteos de `B.4` y llenan `FALTANTES` de tokens que nunca fueron del informe. Correr
`retirarMarcadoresDePrueba_()` **antes** de la primera generación y anotar cuántas filas retiró.

---

## Parte B — Implementación

### B.1 · Copia de la plantilla — `Generador.gs`

`generarInforme(informe_id, periodo_id)`:

a. Lee la fila de `INFORMES` → `plantilla_id`, `nombre`, `periodicidad`.
b. Copia el Slides a `CONFIG.carpeta_salida`, con nombre `{nombre} — {periodo}`.
c. Devuelve el ID de la copia.

**`periodo_id` es opcional.** Si viene, se usa como override explícito del eslabón `CONFIG` y
**la traza tiene que decirlo**. Si no viene —el caso normal, y el que usa el `Paso-5-v2`— la
cadena de `D-20` resuelve sola, con sus cinco eslabones. Documentarlo en el encabezado de la
función: es la única puerta por la que alguien puede pisar la cadena, y tiene que ser visible.

> **No modificar la plantilla original. Y no copiarla "para ordenarla" o probar algo:** copiar un
> archivo de Drive genera un ID nuevo, y ese ID no es el que está en `INFORMES.plantilla_id` — un
> cambio hecho sobre la copia no se ve nunca. Cualquier edición de diseño va sobre el archivo
> cuyo ID está en `INFORMES`, punto. (Regla **`C-01`**: la plantilla es del equipo.)

### B.2 · Recolección de valores

- Filtrar `MARCADORES` por `informe_id` = el informe, más los `*` (compartidos).
- Llamar a `resolverMarcadores` con la firma real y armar el mapa de reemplazo desde lo que
  devuelve.
- **`estado = ok`** → va su `valor_formateado`.
- **`estado = sin_datos` o `error`** → va `«FALTA:token»`, y el motivo de la traza va a
  `FALTANTES`.
- Guardar la trazabilidad de cada token: de qué base, solapa y ventana salió.

**`D-19` vale también acá.** Los tokens fijos no iteran `CAMPANAS` ni `REUNIONES` —eso es el
Paso 5— pero cualquier marcador que lea esas hojas tiene que respetarlo: **una fila sin
`periodo_id` no entra**, y no se asume el período vigente. Si un token queda sin datos por eso,
sale `«FALTA:token»` con el motivo, **no un cero**.

### B.3 · Registrar el mapa `token → objectId` — **antes de reemplazar**

Recorrer las shapes de la copia y registrar, para cada token encontrado, el `objectId` de la caja
que lo contiene y el índice de slide.

**Este barrido va primero y es irreversible:** cuando `{{ecv_total}}` pasa a ser "1.234", el
token deja de existir y el mapa no se puede reconstruir.

El `objectId` es estable y sobrevive a que cambie el contenido de la caja. Es lo que permite que
la etapa 2 de `D-06` escriba por identidad de elemento en vez de por búsqueda de texto, y por lo
tanto que respete lo que el equipo escribió a mano.

### B.4 · Reemplazo

- `replaceAllText('{{token}}', valor)` por cada entrada del mapa.
- Token sin valor: `«FALTA:token»`. **No** dejar el `{{token}}` crudo ni borrar la caja.
- Contar reemplazos hechos contra tokens presentes en la plantilla.

### B.5 · Imprimir el período en la lámina

Es lo primero que mira quien recibe el informe, y el texto viejo de este paso no lo mencionaba.

- Formato: **inclusive en los dos extremos**, siete días, viernes a jueves (`R-11`).
  `vie 24/07 — jue 30/07`, no `24/07 — 31/07`.
- Se imprime **el período que efectivamente se usó**, no el de `CONFIG`. Si una sección o una
  campaña tienen ventana propia, va la suya — de lo contrario el encabezado dice una cosa y los
  números otra.
- Si el período salió del **cálculo** de `R-11` y no de una celda cargada, eso se registra **en
  el reporte de corrida, no en la lámina**. Un número calculado y uno cargado a mano se leen
  igual en el deck y no deberían auditarse igual.

### B.6 · Persistir la corrida (`D-07`)

Escribir la fila en `CORRIDAS` (esquema en `A.5`): informe, período, `deck_id`, fecha, conteos y
el mapa de `B.3`.

**Es un insumo, no un log:** tiene que poder leerse de vuelta para re-correr.

### B.7 · Hoja `FALTANTES` (`D-12`)

Se **pisa** en cada corrida. Una fila por token faltante, con base, solapa, campo y motivo, para
poder atacarlos de a uno. Sin historial por ahora — si más adelante hace falta,
`tools/snapshot.js` ya lo archivaría.

### B.8 · Reporte de corrida

Informe, período —y si fue calculado o cargado—, link a la copia, tokens reemplazados sobre el
total, y la lista de faltantes. **Devuelto en la respuesta**, no sólo por `alert`: headless tiene
que funcionar igual.

Y una pieza abierta de `D-03` que este paso **no** resuelve: un deck creado por la cuenta que
ejecuta queda con **esa cuenta** como dueño, aunque esté dentro de una carpeta de reportes. Drive
no transfiere propiedad por ubicación. **Reportar quién queda como dueño del primer deck
generado.** Si no es reportes, es trabajo, y hay que decir cuánto.

---

## Alcance

- **No** manejar campañas repetibles: es el Paso 5. Si la plantilla trae el bloque de campaña,
  sus tokens quedan como `«FALTA»`.
- **No** implementar la etapa 2 de `D-06` (actualizar el deck en sitio). Este paso sólo **registra
  el insumo** que la habilita.
- **No** tocar `Marcadores.gs`. Toda la aritmética vive ahí y este paso sólo pinta.
- **JM únicamente.** SECCO se guarda como prueba de `D-01` (Tramo 3): construir los dos en
  paralelo impide después distinguir qué necesitó código y qué salió solo.
- **No** cubre `R-12`, los dos valores de ventana de candidatos a `CONFIG` ni el empate técnico
  del match: son del matcher (`Union.gs`) y van en un paso propio.

---

## Prueba del usuario

"Generar informe" para `jm` → se crea una copia del Slides en la carpeta de salida de reportes,
con los tokens fijos reemplazados por valores reales, el período impreso en la lámina, un reporte
de qué quedó pendiente, la hoja `FALTANTES` poblada, y la fila de `CORRIDAS` escrita con el mapa
de `objectId`.

**Control de la etapa 2:** tomar un `objectId` del mapa y verificar a mano que apunta a la caja
correcta del deck generado. Si el mapa no es utilizable, `D-06` etapa 2 queda sin insumo, y hay
que saberlo ahora y no en tres meses.

---

## Al cerrar

Commit `Paso 4 ✅ — motor de reemplazo (tokens fijos) + registro de corrida`.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
