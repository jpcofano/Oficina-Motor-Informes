# Paso 4 — Motor de reemplazo en Slides

**Estado:** vivo · **Actualizado:** 2026-08-02 · **Reemplaza:** el texto anterior de este
mismo archivo (nunca ejecutado, se edita en el lugar — no lleva addendum).

> Requiere Pasos 0–3. Abre la plantilla de un informe, la copia, y reemplaza los
> `{{tokens}}` por los valores calculados. Trabaja sobre Google Slides.
> **NO toca `Marcadores.gs`.** El reemplazo va en `Generador.gs`.

## Qué cambió respecto de la versión anterior

Se escribió antes de las decisiones del 02/08. Cuatro cosas lo desactualizaron, y todas
están en `docs/PLAN.md §1`:

- **`D-06` — generación en dos etapas.** Este paso es la **etapa 1** (copia + reemplazo),
  y eso no cambia. Lo que se agrega es que **la etapa 1 registra el mapa
  `token → objectId`**, que es el único insumo que hace posible la etapa 2. Recolectarlo
  después es imposible: cuando `{{ecv_total}}` pasa a ser "1.234", el token deja de existir.
- **`D-07` — la configuración de una corrida es un insumo editable, no un log.** El
  original guardaba trazabilidad sólo para el `alert` final. Tiene que persistir.
- **`D-12` — hoja `FALTANTES`.** Los `«FALTA:token»` ya no viven sólo en la lámina.
- **`D-03` — la salida es de reportes.** ~~`carpeta_salida` apunta hoy a una carpeta de
  `jpcofanogcba1`.~~ **Resuelto el 02/08/2026** por el `Paso-2.15` Parte A — ver `A.2`.

---

## Parte A — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

Un prompt no ejecutado es una hipótesis. Antes de la primera edición:

**A.1** — `INFORMES.plantilla_id`. El texto anterior afirmaba que ya apunta a la plantilla
canónica de cada informe. **`SEED_INFORMES_` (`Instalar.gs`, buscar por nombre) los tiene
vacíos**, y Estado reporta `INFORMES — 2 filas, 0 discrepancias`, lo que sólo cierra si el
upsert saltea valores vacíos del seed o si la hoja también está vacía. **Verificar contra la
planilla viva** cuáles de las dos cosas es. Si están vacíos, este paso no puede correr y el
bloqueo es cargarlos.

> **Verificado el 03/08/2026 (auditoría de premisas): la hoja viva también los tiene
> vacíos.** Es la segunda opción, y el bloqueo está confirmado: cargar los dos
> `plantilla_id` es precondición de este paso y del `Paso-2.5`.

**A.2** — ~~`CONFIG.carpeta_salida` sigue apuntando a `1EyTlfg…`, de `jpcofanogcba1`~~ —
**ya no: se repuntó el 02/08/2026** (`Paso-2.15` Parte A, commit `aca39bf`). Hoy apunta a
`1LAEVlWZXoGjon2cnaMjGksV0THz3Ejlz` ("Salidas Reportes", de `reporteseinformesgcba`), con
permiso de escritura verificado. **La precondición dura de `D-03` está cumplida**; el ID
viejo quedó como `CONFIG.carpeta_motor`, sin lector. Ver la tabla "Las carpetas de Drive"
en `docs/RUNBOOK.md`, y su advertencia: **nada del motor escribe dentro de la carpeta Motor
ni la recorre recursivamente** — ahí viven la planilla de control y los respaldos.

**A.3** — `resolverMarcadores(informe_id, periodo)` existe y tiene esa firma (viene del
`Paso-3-v2`, no `calcularMarcador`, que quedó del `Paso-3.md` viejo). Si el Paso 3 cerró con
otra firma, manda la real.

**A.4** — El Paso 2.14 (`hayUi_()` generalizado) cerró. Este paso emite un reporte de
corrida: tiene que poder devolverse por HTTP, no sólo por `alert`.

**A.5** — **Propuesta de esquema para el registro de corrida, para confirmar antes de
implementar.** `INFORMES` es registro de plantillas, no de corridas: meterle el nivel de
instancia lo conflaría. Propuesta: hoja `CORRIDAS` con
`corrida_id · informe_id · periodo_id · deck_id · fecha_generacion · tokens_reemplazados ·
faltantes · mapa_tokens`, donde `mapa_tokens` es el `token → objectId` serializado en la
celda. Alternativa si crece: hoja aparte a nivel token.
**Proponer, no crear.** La decisión es del usuario.

**A.6** — Reportar y parar.

---

## Parte B — Implementación (con A confirmado)

### B.1 · Copia de la plantilla — `Generador.gs`

`generarInforme(informe_id, periodo_id)`:

a. Lee la fila de `INFORMES` → `plantilla_id`, `nombre`, `periodicidad`.
b. Copia el Slides a `CONFIG.carpeta_salida`, con nombre `{nombre} — {periodo}`.
c. Devuelve el ID de la copia.

> **No modificar la plantilla original. Y no copiarla "para ordenarla" o probar algo:**
> copiar un archivo de Drive genera un ID nuevo, y ese ID no es el que está en
> `INFORMES.plantilla_id` — un cambio hecho sobre la copia no se ve nunca. Cualquier
> edición de diseño va sobre el archivo cuyo ID está en `INFORMES`, punto.
> (Regla **C-01**, `docs/REGLAS_NEGOCIO.md`.)

### B.2 · Recolección de valores

- Filtrar `MARCADORES` por `informe_id` = el informe + los `*` (compartidos).
- Para cada uno, `resolverMarcadores(...)` → mapa `{ '{{token}}': valor_formateado }`.
- Guardar la trazabilidad de cada token: de qué base, solapa y ventana salió.

### B.3 · Registrar el mapa `token → objectId` — **antes de reemplazar**

Recorrer las shapes de la copia y registrar, para cada token encontrado, el `objectId` de
la caja que lo contiene y el índice de slide. **Este barrido va primero**: después del
reemplazo el token ya no está y el mapa no se puede reconstruir.

El `objectId` es estable y sobrevive a que cambie el contenido de la caja — es lo que
permite que la etapa 2 (`D-06`) escriba por identidad de elemento en vez de por búsqueda de
texto, y por lo tanto que respete lo que el equipo escribió a mano.

### B.4 · Reemplazo

- `replaceAllText('{{token}}', valor)` por cada entrada del mapa.
- Token sin valor: reemplazar por `«FALTA:token»`, **no** dejar el `{{token}}` crudo.
- Contar reemplazos hechos contra tokens presentes en la plantilla.

### B.5 · Persistir la corrida (`D-07`)

Escribir la fila en el registro confirmado en A.5: informe, período, `deck_id`, fecha,
conteos, y el mapa de B.3. **Es un insumo, no un log**: tiene que poder leerse de vuelta
para re-correr.

### B.6 · Hoja `FALTANTES` (`D-12`)

Se **pisa** en cada corrida. Una fila por token faltante, con base, solapa y campo, para
poder atacarlos de a uno. Sin historial por ahora — si más adelante hace falta,
`tools/snapshot.js` ya lo archivaría.

### B.7 · Reporte de corrida

Informe, período, link a la copia, tokens reemplazados, y la lista de faltantes.
**Devuelto en la respuesta**, no sólo por `alert` — headless tiene que funcionar igual.

---

## Alcance

- **No** manejar campañas repetibles: es el Paso 5. Si la plantilla trae el bloque de
  campaña, sus tokens quedan como `«FALTA»`.
- **No** implementar la etapa 2 de `D-06` (actualizar el deck en sitio). Este paso sólo
  **registra el insumo** que la habilita.
- **No** tocar `Marcadores.gs`. Toda la aritmética vive ahí y este paso sólo pinta.
- **JM únicamente.** SECCO se guarda como prueba de `D-01` (Tramo 3 de `PLAN.md`):
  construir los dos en paralelo impide después distinguir qué necesitó código y qué salió
  solo.

---

## Prueba del usuario

"Generar informe" para `jm` → se crea una copia del Slides en la carpeta de salida **de
reportes**, con los tokens fijos reemplazados por valores reales, un reporte de qué quedó
pendiente, la hoja `FALTANTES` poblada, y la fila de corrida escrita con el mapa de
`objectId`.

**Control de la etapa 2:** tomar un `objectId` del mapa y verificar a mano que apunta a la
caja correcta del deck generado. Si el mapa no es utilizable, `D-06` etapa 2 queda sin
insumo y hay que saberlo ahora, no en tres meses.

---

## Al cerrar

Commit `Paso 4 ✅ — motor de reemplazo (tokens fijos) + registro de corrida`.

Sin trailer `Co-Authored-By`.

---

# Addendum 1 al `Paso-4` — 03/08/2026

**Escrito por claude.ai.** Se anexa al final de `docs/Prompts/Paso-4.md`. **No altera
ninguna línea del texto original**: lo que sigue lo corrige y manda sobre él donde
difieran.

> **Por qué:** el `Paso-4` se escribió antes de `D-19`, `D-20`, `R-11` y del `Paso-5-v2`.
> Su firma no coincide con la que el `Paso-5-v2` asume, y no dice nada sobre imprimir el
> período en la lámina, que es lo que el usuario ve.

---

## 1 · La firma

El original declara `generarInforme(informe_id, periodo_id)`. El `Paso-5-v2` extiende
`generarInforme(informe_id)` y resuelve el período por la cadena de `D-20`.

**Manda la cadena, no el parámetro.** Con cinco eslabones —campaña, marcador, sección,
`CONFIG`, semana de `R-11`— un `periodo_id` en la firma es un sexto origen que compite con
los otros cinco y no está en la decisión.

**Qué hacer:** `periodo_id` queda como parámetro **opcional**. Si viene, se usa como
override explícito del eslabón `CONFIG` y **la traza tiene que decirlo**. Si no viene —el
caso normal, y el que usa el `Paso-5-v2`— la cadena resuelve sola. Documentarlo en el
encabezado de la función: es la única puerta por la que alguien puede pisar la cadena, y
tiene que ser visible.

## 2 · Imprimir el período en la lámina

El original no lo menciona y es lo primero que mira quien recibe el informe.

- El período se imprime en el formato que el equipo ya usa en el temario: **inclusive en
  los dos extremos**, siete días, viernes a jueves (`R-11` Addendum 1). `vie 24/07 — jue
  30/07`, no `24/07 — 31/07`.
- La lámina imprime **el período que efectivamente se usó**, no el de `CONFIG`. Si una
  sección o una campaña tienen ventana propia, es la suya la que va — de lo contrario el
  encabezado dice una cosa y los números otra.
- Si el período salió del cálculo de `R-11` y no de una celda cargada, **eso también se
  registra** en el reporte de corrida. No en la lámina: en el reporte. Un número calculado
  y uno cargado a mano se leen igual en el deck y no deberían auditarse igual.

## 3 · `D-19` en el reemplazo de tokens fijos

Los tokens fijos no iteran `CAMPANAS` ni `REUNIONES` —eso es del Paso 5— pero cualquier
marcador que lea esas hojas tiene que respetar `D-19`: **una fila sin `periodo_id` no
entra**. No se asume el período vigente. Si un token queda sin datos por eso, sale
`«FALTA:token»` con el motivo en el reporte, no un cero.

## 4 · Dónde queda el archivo

En la carpeta de salidas. **Nada de este paso escribe dentro de la carpeta del motor ni la
recorre recursivamente** — ahí viven la planilla de control y una subcarpeta
`_Back up archivo` con respaldos manuales.

Y una pieza abierta de `D-03` que este paso **no** resuelve y que conviene no dar por
cerrada: un deck creado por la cuenta que ejecuta queda con **esa cuenta** como dueño,
aunque esté dentro de una carpeta de reportes. Drive no transfiere propiedad por
ubicación. Reportar quién queda como dueño del primer deck generado; si no es reportes,
es trabajo, y hay que decir cuánto.

## 5 · Qué NO cubre este addendum

`R-12`, los dos valores de ventana de candidatos a `CONFIG` y el empate técnico del match
son del **matcher** (`Union.gs`), no del Paso 4 ni del Paso 3. Están anotados en
`PLAN.md` §2 y van en un paso propio. `D-21` —migrar `status = Realizada` a
`MAPEO.valores_incluidos`— es configuración y va suelto, no acá.
