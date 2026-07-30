# DOC-3 — Correcciones verificadas contra las bases vivas + R-02

> **Qué es:** una tanda de correcciones de configuración que salieron de **leer las
> bases reales**, no de revisar código. Las bases quedaron compartidas el 30/07 y se
> pudieron inspeccionar por primera vez desde `claude.ai`.
>
> Incluye además la respuesta del usuario a la pregunta de campañas, que estaba
> bloqueando el Paso 2.4.
>
> **No toca Slides, no siembra `MARCADORES`, no calcula marcadores.** Config, un
> diagnóstico nuevo y documentación.
>
> **Un commit por parte. Trabajamos en español.**
>
> ⚠ **Namespace (`PROYECTO.md` §9):** antes de nombrar cualquier función nueva,
> `grep -rn "function nombre" *.gs`.

---

## Cómo se verificó (y hasta dónde llega)

Se leyó la metadata de Drive de dos bases:

| base | `sheet_id` | dueño | primera solapa |
|---|---|---|---|
| `looker` | `1t6Ji4Cd5lTe…` | `dgples.comunicacion@gmail.com` | `resumen_metricas_dinamico` |
| `m2` | `1_GS01-TXrhe…` | `tarnowski.jp@gmail.com` | `Cuentas` |

**Límite importante:** la metadata expone **solo la primera solapa** de cada archivo.
No se pudo enumerar el resto. Por eso la Parte B existe: el motor tiene que poder
listar solapas por sí mismo en vez de depender de esto.

**Segundo límite:** el orden de los encabezados es confiable; **las letras de columna
derivadas de ese orden, no** — el volcado de texto colapsa celdas vacías y parte los
valores que tienen comas. Cada letra que este prompt afirma **hay que verificarla
leyendo la fila 1 de la hoja viva** antes de escribirla en `MAPEO`.

---

## Parte A — `looker`: la solapa es `resumen_metricas_dinamico`

Encabezados reales, en orden: `id_cuentas`, `nombre_campaña`, `fecha_inicio`,
`fecha_fin`, `eje`, `area`, `estado`, `digital_impresiones`, `digital_visualizaciones`,
`digital_clics`, `meta_alcance`, `meta_frecuencia`, `frecuencia_total`, `mails_enviados`,
`mails_entregados`, `mails_aperturas`, `mails_clics`, `call_enviado`, `call_discado`,
`call_contactados`, `call_efectivos`, `ivr_audiencia`, `ivr_realizados`, `ivr_atendidos`,
`ivr_escucha75`, `ivr_marque1`, `sms_enviados`, `sms_entregados`, `sms_clics`,
`pieza_meta`, `pieza_mail`.

Ese orden pone `nombre_campaña` en B, `fecha_inicio` en C, `digital_impresiones` en H,
`mails_enviados` en N, `cc_contactados` en T, `ivr_audiencia` en V — **las mismas letras
que ya tiene `SEED_MAPEO_`**. El mapeo se armó contra esta hoja; lo único desactualizado
es el nombre.

1. `SEED_BASES_`: `looker.hoja_default` → `resumen_metricas_dinamico`. Sacá la nota
   `VERIFICAR` que dejó DOC-2 y reemplazala por: *"confirmado 30/07 contra la base viva
   (metadata de Drive)"*.
2. Las filas de `SEED_MAPEO_` de `looker`: `hoja`/`solapa` → `resumen_metricas_dinamico`.
3. **Antes de commitear, corré la Parte B** y confirmá que la solapa existe con ese
   nombre exacto y que la fila 1 coincide con la lista de arriba. **Si además existe una
   `resumen_metricas` vieja, no la borres ni la mapees: reportala.** Dos hojas con datos
   parecidos y una sola mapeada es exactamente el escenario de "devuelve otra cosa sin
   fallar".

→ **Commit A:** `DOC-3 ✅ — looker: solapa resumen_metricas_dinamico confirmada contra la base viva`

---

## Parte B — Diagnóstico: listar solapas y tipar las columnas mapeadas

Función nueva en `Fechas.gs` (o módulo de diagnóstico equivalente; **no** en
`Marcadores.gs`) + ítem de menú **"Listar solapas y tipos"**.

Es clasificación de tipos, no aritmética de negocio — mismo criterio que se usó para
`detectarColumnasFecha()`. La regla de oro queda intacta.

1. **Solapas.** Por cada base activa de `BASES`, abrir por `sheet_id` y listar
   `getSheets().map(h => h.getName())`. Marcar:
   - si `hoja_default` **no existe** entre ellas → ⚠ (la base se lee vacía o lee otra
     cosa);
   - si hay solapas mapeadas en `MAPEO` que **no existen** en el archivo → ⚠;
   - si hay solapas del archivo **sin mapear** → informativo, no error.

2. **Tipo de las columnas mapeadas.** Por cada fila de `MAPEO`, leer las primeras ~20
   celdas no vacías de esa columna y clasificar: `numero` / `texto` / `fecha` / `mixto`.
   **Motivo concreto:** los números de `looker` vienen formateados con punto de miles
   (`201.273.767`). Si en la hoja son **texto**, `SUMA` va a devolver `0` o a concatenar,
   sin lanzar error. Marcar ⚠ toda columna que un marcador vaya a sumar y esté tipada
   `texto` o `mixto`.

3. Salida a hoja `DIAG_BASES` (misma forma que `DIAG_FECHAS`) + resumen en alert.

Esto reemplaza para siempre la necesidad de mirar la base desde afuera, y es el chequeo
que también agarra el día que alguien renombre una solapa.

**Test:** correrlo con `looker.hoja_default` **mal escrito a propósito** → tiene que
salir ⚠. Corregirlo → tiene que salir limpio.

→ **Commit B:** `DOC-3 ✅ — DIAG_BASES: solapas existentes y tipo de las columnas mapeadas`

---

## Parte C — Dos huecos en el `MAPEO` de `looker`

1. **Falta `id_cuentas` (columna A).** Es la clave de join con Seguimiento Digital — la
   que el Paso 2.4 necesita para todo. Agregá la fila:
   `base_id=looker`, `solapa=resumen_metricas_dinamico`, `campo_logico=id_cuenta`,
   `columna=A`. **Usá el mismo `campo_logico` que ya usan las otras bases** para la
   clave de join: greppealo antes (`grep -rn "id_cuenta" Instalar.gs`), no inventes un
   nombre nuevo.
2. **`frecuencia` es ambiguo.** La hoja tiene `meta_frecuencia` (L) y `frecuencia_total`
   (M); el seed apunta a **M**. Puede estar bien, pero nadie registró la elección.
   Dejá `notas: 'M=frecuencia_total; existe también meta_frecuencia en L — elección sin
   confirmar con el equipo'` y sumalo a las preguntas abiertas.

→ **Commit C:** `DOC-3 ✅ — looker: id_cuenta mapeado + ambigüedad de frecuencia registrada`

---

## Parte D — `m2`: la solapa `Cuentas` es cruda, pero es dimensión

Primera solapa de la base `m2`: **`Cuentas`**, encabezado en **fila 1**, sin banner de
período, una fila por campaña. **Pasa el criterio de fuente cruda** fijado el 30/07.

Encabezados, en orden: `ID Cuentas`, `Fecha de alta`, `Tipo de pedido`, `Campaña`,
`Tipo de Campaña`, `Ejecutiva`, `Fecha de inicio`, `Fecha de fin`, `Mes de alta`,
`Estado campaña`, `Eje`, `Área`, `Proyecto`, `Mes de inicio`, `Comentarios`, `Brief`,
`Estrategia`, `PM`, `URL`, `Reporte`, `Remitente`, `Estado`.

⚠ **No resuelve la pregunta abierta de `m2`.** `Cuentas` no tiene ninguna métrica: no
hay `m2_clics` ni `m2_vis`. Es la tabla de atributos de campaña, no la fuente de los
tokens `m2_*`. `M2 periodo DIGITAL` / `M2 periodo DIRECTA` siguen sin confirmarse.

1. Registrá `m2` / `Cuentas` en `MAPEO` con los campos de dimensión que sirvan
   (`id_cuenta` col A, `campana` col D, `estado` col J, `eje` col K, `area` col L) —
   **verificando las letras contra la fila 1 viva**, por lo que dice el encabezado de
   este prompt.
2. `fila_encabezado` de `m2` está en **3** en `BASES`, que corresponde a las vistas con
   banner. Para `Cuentas` es **1**. Como `fila_encabezado` es por base y no por solapa,
   **esto es un conflicto real**: anotalo y no lo resuelvas por tu cuenta — la salida
   probable es mover `fila_encabezado` a `MAPEO` o a una fila por solapa, y eso es
   decisión del usuario.
3. `Estado campaña` (J) y `Estado` (V) coexisten. Mapear una sola y decir cuál en
   `notas`.

→ **Commit D:** `DOC-3 ✅ — m2/Cuentas registrada como dimensión + conflicto de fila_encabezado`

---

## Parte E — R-02: el temario define el universo, no la fecha

**Respuesta del usuario, 30/07:** una campaña está activa todos los días de su tramo,
pero **el proceso arranca seleccionando las reuniones del temario**, así que el recorte
por fecha no decide qué entra al informe. La fecha de inicio se usa **solo para el
match** campaña↔encuentro.

Escribila en `docs/REGLAS_NEGOCIO.md` con ID estable:

> **R-02 — el temario define el universo, no la fecha.** Qué campañas entran al informe
> lo decide la selección humana de encuentros (temario). La fecha de inicio de campaña
> se usa únicamente para resolver el match campaña↔encuentro. **Ninguna base digital se
> filtra por ventana para decidir contenido.** Corolario: `digital` y `looker` se leen en
> modo `snapshot`; sus columnas de fecha elegidas el 30/07 sirven para acotar lectura y
> diagnóstico, no para seleccionar filas del informe.

Consecuencias a aplicar:

1. **`Paso-2.4.md`:** borrá el bloque "Precondición de negocio sin resolver" que agregó
   DOC-2 y reemplazalo por el link a **R-02**. La pregunta está contestada y el diseño
   actual del 2.4 queda confirmado, no invalidado.
2. **`docs/FECHAS_seleccion.md`:** las seis elecciones de `digital`/`looker` dejan de
   estar marcadas como **provisorias**. Pasan a "no críticas — diagnóstico y acotado de
   lectura, por R-02".
3. **`PROYECTO.md` §5:** una línea con la regla.

→ **Commit E:** `DOC-3 ✅ — R-02 en REGLAS_NEGOCIO.md + Paso-2.4 y FECHAS_seleccion alineados`

---

## Parte F — Dos tokens huérfanos tienen fuente

De la lista de preguntas heredadas:

1. **El `135` literal de la caja "Marque 1"** (plantilla JM): la columna existe en
   `looker` como **`ivr_marque1`** (posición 26 → verificar letra, ~Z).
2. **Los `post_camp1-3` dinámicos**: `looker` tiene **`pieza_meta`** (anteúltima
   columna), que trae la **URL del posteo de Facebook** de la campaña. Es el candidato
   directo. También hay `pieza_mail`.

Registralos en `MAPEO` (`campo_logico=ivr_marque1`, `campo_logico=post_meta`) y anotá el
hallazgo en `docs/CONFIG_INFORMES.md`, donde están listados los tokens sin fuente.
**No los cablees en `MARCADORES`** — esa hoja todavía no está sembrada y el cableado es
del Paso 3.

→ **Commit F:** `DOC-3 ✅ — ivr_marque1 y pieza_meta: fuente encontrada para dos tokens huérfanos`

---

## Parte G — La firma de encabezados deja de ser un caso especial

`Base Looker` es de `dgples.comunicacion@gmail.com`. `M2` es de `tarnowski.jp@gmail.com`.
**Ninguna base es propia**, y las cuatro están mapeadas por letra de columna.

El riesgo que estaba anotado como específico de `RDV_otros_ministros` —el dueño inserta
una columna, el mapeo sigue funcionando y devuelve la de al lado— **aplica a todo el
motor**. No hay ninguna base donde no aplique.

1. Reescribí `docs/RDV_otros_ministros_riesgo.md` para que el riesgo sea general, con
   `RDV_otros_ministros` como el caso peor (dos columnas numéricas a dos posiciones de su
   etiqueta), no como el único.
2. Anotá en `PROYECTO.md` §7 que la **firma de encabezados** pasa a ser un paso propio
   **antes del 3-v2**: guardar la fila 1 de cada solapa mapeada en una columna de
   `MAPEO` (o una hoja `FIRMAS`) y fallar ruidosamente si cambió. La Parte B de este
   prompt ya lee la fila 1 de cada solapa, así que la mitad del trabajo queda hecha.
3. **No lo implementes acá.** Es su propio prompt con su propio test.

→ **Commit G:** `DOC-3 ✅ — firma de encabezados: riesgo generalizado a las cuatro bases`

---

## Lo que este prompt NO decide

Al reporte final, sin resolver:

- **¿Los números de una campaña que ya salió la semana pasada van acumulados desde el
  inicio, o solo lo de esa semana?** Las filas de `looker`/SD traen totales acumulados
  hasta el último refresh. Si algún cuadro **suma varias campañas del período**, ese
  total infla con lo ya reportado. Es lo que define si `Snapshot.gs` (hoy vacío) es
  obligatorio o no. **Pregunta al equipo.**
- **¿Cuál es la solapa de métricas de `m2`?** `Cuentas` es dimensión.
- **`frecuencia`: L (`meta_frecuencia`) o M (`frecuencia_total`)?**
- **`fila_encabezado` por base vs. por solapa** (Parte D punto 2).
- **¿Existe todavía una solapa `resumen_metricas` vieja en la base Looker?**
- Heredadas: `hoja` vs. `solapa` conviviendo en `MAPEO`; solapa `Alcance` y solapa `RDV`
  duplicada en `digital` (bloquean el 2.4).

---

## Prueba del usuario

1. Menú → **"Listar solapas y tipos"**. `looker` tiene que aparecer sin ⚠, con
   `resumen_metricas_dinamico`; `m2` tiene que mostrar `Cuentas` entre sus solapas.
2. En `DIAG_BASES`: revisar las columnas de `looker` que van a sumarse
   (`digital_impresiones`, `mails_*`). Si salen `texto`, avisar — cambia el Paso 3.
3. `MAPEO`: existe la fila `looker` / `id_cuenta` / `A`.
4. `docs/REGLAS_NEGOCIO.md`: están R-01, R-02 y C-01, cada una con ID.
5. `grep -n "Precondición de negocio" docs/Prompts/Paso-2.4.md` → sin resultados.
