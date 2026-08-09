# Cablear las láminas 2 y 3, y declarar las solapas que no sirven

**Modelo:** Opus, effort alto. **Subagentes:** `verificador` antes de la Parte 0.

**Un objetivo.** Que las láminas 2 y 3 publiquen. **Toca `MARCADORES`, `SOLAPAS` y
`REGLAS_NEGOCIO.md`.**

**Decisión del usuario, 09/08, y gobierna todo el prompt: se cablea contra las reglas de acá, sin
volver a validar contra las bases vivas.** Las bases avanzan y el informe se fija en un momento;
re-medir hoy contra un deck de julio produce diferencias que no son errores. **La validación ya
se hizo contra los dos informes publicados y está en `docs/casos_validacion_2026-08-09_addendum.csv`.**

---

## Parte A — las solapas que no sirven se declaran, no se descubren

**Van a `SOLAPAS` con `uso = ignorar` y motivo, y el motivo va a `REGLAS_NEGOCIO.md` como
`R-21`.** Hoy el motor las puede leer y devolver números viejos sin que nada falle — que es el
peor modo de falla del proyecto.

| solapa | por qué se ignora | medido |
|---|---|---|
| `digital / Digital` | **congelada**: sus 205 filas JM llegan a **diciembre de 2025**. Cero datos de 2026 | 09/08 |
| `digital / CAMPAÑAS_DESGLOCE_DIGITAL` | JM llega hasta el **17/04/2026**, tres meses antes del informe | 09/08 |
| `digital / Mail per` | tercer panel con período **tipeado a mano**; en el export del 31/07 apuntaba a 10–11/07 | 08/08 |
| `digital / Buscador por periodo directa` | ídem, 10–11/07 | 08/08 |
| `digital / Buscador por periodo digital` | ídem, 10–17/07 | 08/08 |
| `digital / Metricas informe` | **`#REF!`** — fórmula rota que llega como texto | 09/08 |
| `digital / INFORME` | **`#REF!`** | 09/08 |
| `looker / MAIL`, `IVR`, `SMS`, `DIGITAL`*, `ALCANCE`, `resumen_metricas` | **sin columna de fecha y sin fila en `MAPEO`** (12.684 filas) | 08–09/08 |

\* **`looker / DIGITAL` es la excepción y no se ignora:** no tiene fecha propia, pero **se recorta
joineando `looker/Cuentas` por `id_cuentas`**, que sí las tiene. Es la fuente de la Parte B.

**⚠ Verificar antes de escribir nada:** Code midió que los 24 tokens ya cableados de las láminas 2
y 3 **leen todos de `digital`**. Si alguno apunta a `Digital` o a `CAMPAÑAS_DESGLOCE_DIGITAL`,
**está leyendo una tabla congelada y publicando números viejos hoy**. Reportarlo primero.

**Y `R-21` dice el principio, no la lista:** una solapa cuyo dato dejó de actualizarse **es peor
que una que falla**, porque devuelve un número plausible. Se declara `ignorar` en cuanto se
detecta; la lista de arriba es el estado al 09/08, no la regla.

---

## Parte B — impresiones y pauta, con la aproximación declarada como tal

**Fuente:** `looker / DIGITAL` × `looker / Cuentas` por `id_cuentas`.
**Ventana:** las campañas cuya ejecución **solapa** con la del informe (`R-16`).
**Señal de JM:** `nombre_campaña` **CONTIENE** `JM`. **GCBA por resta** (`R-15`).
**Filtro adicional:** `estado = Activa`.
**Plataformas:** `Meta`, `Google ads`, `DV360`. **`imp_prog` es `DV360`** — no por interpretación:
es la única tercera plataforma que existe en esa solapa.

**Lo medido contra el deck del 31/07, y se cablea así aunque no cierre:**

| token | publicado | medido | dif |
|---|---|---|---|
| `imp_meta` | 716.650 | 679.647 | **−5,2 %** |
| `imp_google` | 531.403 | 614.140 | **+15,6 %** |
| `imp_prog` | 5.194.898 | 5.992.841 | **+15,4 %** |

**Los datos de Looker son acumulados de campaña y el deck se armó en un momento distinto del
export**, así que una diferencia de ese orden es esperable. **Cualquier otro recorte se va a
+175 % o más**, así que la regla es ésta y no hay una segunda candidata razonable.

⚠ **El conteo de contenidos no reproduce — 6 / 5 / 10 contra 9 / 7 / 14 — y no traba nada.** Se
cablea igual, con la nota en `PENDIENTES`. **Un conteo de filas no es acumulado**, así que la
diferencia no se explica por la fecha del export; queda como pregunta abierta y **no se
investiga acá**.

⚠ **Y el límite de esta validación, que hay que escribir para que nadie lo olvide: las láminas 2
y 3 sólo existen en un deck.** El del 07/08 es de SECCO y **no tiene resumen ejecutivo**. Así que
toda esta lámina descansa en **una sola observación**. El bloque de mail aguanta porque dio
exacto; **la aproximación de impresiones no se distingue de una regla equivocada** hasta que
aparezca un segundo deck JM. **No es motivo para frenar: es motivo para que `LAMINAS.notas` lo
diga.**

**`imp_total` y `contenidos_total` no se cablean con fuente:** son sumas de sus tres partes,
verificadas al peso en las dos láminas (`X-10`, `X-11`, `V-59`, `V-60`). **Si hoy tienen fila con
fuente propia, sobra.**

`frecuencia` queda **abierta**. No se adivina.

---

## Parte C — lo que ya está cerrado, cableado tal cual

**Todo esto reprodujo exacto contra el deck publicado. No se re-mide.**

| bloque | base · solapa | filtro | casos |
|---|---|---|---|
| l. 2 mail JM | `digital · Directa Mail` | `mail_remitente=jorge.macri@buenosaires.gob.ar` | `V-53`–`V-55` |
| l. 3 mail GCBA | `digital · Directa Mail` | `mail_remitente!=jorge.macri@buenosaires.gob.ar` | `V-56`–`V-58` |
| l. 3 SMS | `digital · Directa SMS` | sin filtro de figura | `V-61`–`V-63` |
| l. 2 call center | `looker · CC` × `looker · Cuentas` | `nombre_campaña CONTIENE JM` | `R-15 Add. 2` |

**`cc_base` es `Base barrida`**, no `Base enviada`: 4726 + 1285 = 6.011, y contactados
1380 + 498 = 1.878. Exactos, sobre `3289-JUNJDGAG`.

**La cuenta `3387-JULJDGGC` queda afuera por temario — decisión del usuario, 09/08.** Tiene tres
filas de CC con datos completos y fecha en la ventana (barrida 7.954, contactados 2.169), y **el
temario no la nombra en este bloque**. Es `R-17` operando: **el temario selecciona, los filtros
acotan**. Si entrara, `cc_base` publicaría 13.965 en vez de 6.011.

**Consecuencia para el cableado:** el universo de los `cc_*` **no es "todas las cuentas JM de la
ventana"**, es el que el temario nombra. Cablear por ventana sola publica de más.

**⚠ `Base enviada` de `looker/CC` llega como fecha** —serial de Excel mal formateado—. Si el motor
la lee como fecha, falla.

**Los `ivr_*` no se cablean acá.** Ninguno de los dos decks publica el bloque IVR en el resumen
ejecutivo, así que no hay contra qué validarlos. `digital/Directa IVR` **sí** quedó confirmada
como fuente de `Llamados atendidos` y `Escucharon +75%`, pero contra una lámina de campaña.

---

## Parte D — el estado queda escrito donde vive

`LAMINAS.estado` y `LAMINAS.falta`. **Depende del `_11`**; si todavía no corrió, va a `PENDIENTES`
y **no se crea ningún registro paralelo**.

Estado esperado al terminar: **lámina 2 y 3 en `parcial`**, con `falta = frecuencia, ivr_*` y la
nota de que las impresiones se cablearon con la aproximación de la Parte B.
