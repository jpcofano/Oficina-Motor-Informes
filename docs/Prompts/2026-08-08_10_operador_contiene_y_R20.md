# Asentar lo validado: el operador `CONTIENE`, `R-20`, y las láminas que cierran

**Modelo:** Opus, effort alto. **Subagentes:** `verificador` antes de la Parte 0.

**Un objetivo.** Que lo que se validó contra dos informes publicados quede escrito donde el motor
lo lee, y no en una conversación. **Toca `.gs`, `MARCADORES` y `REGLAS_NEGOCIO.md`.**

---

## De dónde sale

Validación de dos semanas —24/07–31/07 y 31/07–06/08— con sus bases contra los decks publicados.
Los casos están en `docs/casos_validacion_2026-08-09_addendum.csv`, numerados `V-38`+, `C-01`+,
`X-10`+. **Este prompt no re-mide nada de eso.**

**Lo que ya está escrito y no se toca:** `R-15` y su Addendum 1 ya declaran el corte JM/GCBA por
canal —`Mail remitente` para mail, `Figura` para `rdv`, GCBA por resta, SMS sin columna—. La
validación **lo confirma con los valores publicados**, que es lo que la regla pedía en su sección
*«cómo se verifica»* y hasta hoy sólo se había hecho contra la partición de filas.

---

## Parte 0 — tres premisas cortas (sólo lectura, reportar y parar)

`0.1` · **¿`mail_remitente` está en el `MAPEO` vivo?** `R-15` da por hecho que el cableado usa
`mail_remitente!=jorge.macri@…`, pero el campo **no aparece en el snapshot del 01/08**. Si no está
mapeado, la regla no se puede aplicar aunque esté escrita. Reportar también si están `mail_tipo` y
`figura`.

`0.2` · **El vocabulario de `estado_evento`, completo y en las dos solapas.** En la ventana medida
sólo aparecen `Realizada` y `en agenda`; `RDV_otros_ministros` usa además `Programado`. **Reportar
todos los valores históricos de las dos solapas, con frecuencia y grafía exacta** — mayúsculas y
acentos incluidos. `R-20` depende de que el catálogo esté cerrado.

`0.3` · **El caso de prueba del `_11` ya no existe.** Su `0.5` usa las notas del orador de
`SECCO` 8 y 25 para probar que anexar no pisa, y **esas notas se borraron el 08/08**. El usuario
las declaró irrelevantes, así que **no hay que recuperarlas** — pero el `_11` frena en la Parte 0
si las busca. **Reportarlo y proponer el reemplazo**: una nota puesta a mano en una copia
desechable. No tocar el `_11` acá.

`0.4` · **Qué rompería un operador nuevo.** `parsearFiltro_` hoy parte por `!=` y si no por `=`.
Reportar **todos** los filtros escritos hoy en `MARCADORES` y `SECCIONES`, y si alguno contiene el
texto que se elija como operador. **Un filtro existente que empiece a parsearse distinto es una
regresión silenciosa.**

**Reportar `0.1`–`0.4` y parar.**

---

## Parte A — el operador `CONTIENE`

**Decisión del usuario, 09/08:** el clasificador de M2 es *`Tipo de mail` **contiene** `M2`*, y
hoy no es expresable: `parsearFiltro_` soporta `=` y `!=`, no la pertenencia parcial.

Agregar el operador a `parsearFiltro_` y a `aplicarFiltroDeMarcador_`. **Requisitos:**

- **Se busca antes que `=` y que `!=`**, por la misma razón que `!=` se busca antes que `=`: el
  operador más largo primero, o el corto lo parte mal.
- **Los dos lados pasan por `normalizarValorDeclarado_`**, el canónico de `R-10`. No se inventa
  una comparación nueva.
- **Un filtro mal escrito falla con motivo**, como los otros dos, y el mensaje nombra los tres
  operadores disponibles.
- **La negación también:** si existe `CONTIENE`, tiene que existir su negado, o la primera vez que
  haga falta se agrega mal y a las apuradas.

**El símbolo lo elige Code y lo justifica**, mirando `0.3`. Lo único no negociable es que
**sobreviva a exportar la hoja** — `R-15` ya se quemó con `≠`, que el símbolo matemático se rompe
al exportar. Un operador que no aguanta un round-trip de la planilla no sirve.

**Con eso, la sección `m2` queda cableable**: hoy tiene cero marcadores, y `SECCIONES` la declara
(orden 12, `agregado`, `familia_tokens = m2_`). **No cablear los tokens acá** — es otro prompt.

---

## Parte B — `R-20`: un encuentro pasado que sigue "en agenda" es un encuentro que pasó

**Decisión del usuario, 09/08.** Va a `REGLAS_NEGOCIO.md` con el formato de sus hermanas:
enunciado, origen, lo medido, consecuencias, cómo se verifica, qué hacer si falla.

**Enunciado.** Para fechas **en el pasado**, el estado del evento no distingue: `Realizada` y
`en agenda` cuentan igual. **La hoja no siempre se actualiza**, así que un encuentro cuya fecha ya
pasó y sigue "en agenda" es un encuentro que ocurrió y nadie tocó la celda. Para fechas
**futuras** la regla no aplica: ahí el estado sí informa.

**Lo medido, 09/08 —y es lo que obliga a que la regla tenga una segunda mitad.** Incluir
`en agenda` **suma filas y no suma ningún número**, porque esas filas traen las celdas vacías:

| ventana | solo `Realizada` | `Realizada` + `en agenda` |
|---|---|---|
| 23–31/07 | 5 encuentros · 2445 insc · 497 asist | **6** · 2445 · 497 |
| 31/07–06/08 | 2 encuentros · 217 · 23 | **3** · 217 · 23 |

**Entonces `ecv_encuentros` sube, las sumas no, y se publica una lámina de encuentro en blanco.**

**La segunda mitad, que es la que evita ese resultado.** Antes de dar por vacío un encuentro
incluido por esta regla, **se busca el dato en la otra solapa**. El caso real: Sánchez Zinny del
05/08 figura `en agenda` en `RVD JM-CM - ES` y **`Realizada` con 119 inscriptos y 43 asistentes**
en `RDV_otros_ministros`. La cascada entre las dos solapas ya está escrita en
`DISENO_match_temario.md` §5bis; **`R-20` la vuelve obligatoria para este caso.**

**Y si ninguna de las dos tiene el dato: va a `REVISAR`, no a cero.** Un encuentro pasado sin
números no es un encuentro con cero inscriptos: es una fila que nadie completó. Es `R-19` aplicado
a `rdv` — **antes de calcular mal, no leer**.

**Cómo se verifica:** el conteo de encuentros con la regla tiene que ser mayor o igual que sin
ella, y **toda fila que entre por `en agenda` sin datos propios tiene que aparecer en `REVISAR` o
haber resuelto por cascada.** Ninguna puede publicar cero en silencio.

**Y una consecuencia que no se deriva sola:** 4 de los 8 encuentros de ministros del deck del
07/08 se publicaron con estado `en agenda` o `Programado` (`C-08`). **La regla describe lo que el
equipo ya hace**, no lo cambia.

---

## Parte B-bis — `R-15 Addendum 2`: Call Center e IVR son **un canal con dos etapas**

**Decisión del usuario, 09/08.** No son dos canales y tampoco son lo mismo: es **una sola
operación telefónica** que dos tablas registran en momentos distintos. La tabla de `R-15` declara
la señal de IVR y nunca declaró la de la otra etapa.

| etapa | qué mide | dónde se lee | señal de JM |
|---|---|---|---|
| **barrido y contacto** | `Base barrida`, `Contactados`, `Efectivos` | `looker/CC` × `looker/Cuentas` | **`nombre_campaña` CONTIENE `JM`** — nueva |
| **llamado y escucha** | `Llamados`, `Atendidos`, `Escucharon +75%` | `digital/Directa IVR` | `Vocero` = `JM` — ya estaba |

GCBA por resta en las dos, igual que el resto de la tabla.

**La consecuencia que hace falta escribir: las dos etapas NO comparten población.** Una cuenta
puede estar en una y no en la otra, así que **ni la señal ni el universo se propagan entre
ellas**. Y `cc_campanias` e `ivr_campanias` **cuentan cosas distintas y no se suman**: un total
único de “campañas telefónicas” sacado de las dos tablas cuenta dos veces las cuentas que
están en ambas.

**El efecto medido, que es lo que vuelve útil la fila.** La lámina 2 publica *2 campañas de Call
Center*, base discada 6.011, contactados 1.878 (31 %). Cruzando `looker/CC` con `looker/Cuentas`
por `id_cuentas`, tomando las campañas cuya ventana solapa con la del informe y cuyo nombre
contiene `JM`: **`Base barrida` 4726 + 1285 = 6.011** y **contactados 1380 + 498 = 1.878**, las
dos exactas, sobre la cuenta `3289-JUNJDGAG`.

**Dos cosas que no se derivan solas:**

1. **`cc_base` es `Base barrida`, no `Base enviada`.** Era la pregunta abierta de la nocturna y
   queda contestada con el número publicado. `Base enviada` da 6673 sobre la misma cuenta.
2. **"2 campañas" son las dos filas de CC de una cuenta**, no dos cuentas. La otra cuenta JM con
   CC en la ventana —`3387-JULJDGGC`, Orden Público— **no entra al resumen ejecutivo**. Reportar
   por qué antes de cablear: puede ser que su CC pertenezca a la lámina del encuentro.

**⚠ La señal de CC NO se hereda de IVR, y está medido.** `digital/Directa IVR` tiene `Vocero` con
`JM`/`GCBA`, y `3387-JULJDGGC` figura ahí con `Vocero = JM`. Pero **`3289-JUNJDGAG` —la cuenta que
produce los 6.011 y los 1.878 publicados— no está en `Directa IVR` en absoluto.** Heredar la señal
de IVR deja la base discada de la lámina 2 en cero. **Son dos poblaciones distintas: una cuenta
puede tener CC sin IVR y viceversa**, y las dos tablas miden cosas distintas — barrido y
contactados una, llamados y escucha la otra.

**Y es el segundo uso de `CONTIENE` antes de que exista.** El primero es M2; éste es CC. Un
operador con dos usos medidos no es una comodidad.

⚠ **`Base enviada` llega corrupta en el export**: la columna se lee como fecha —serial de Excel
mal formateado— y hay que reconstruirla para compararla. Si el motor la lee como fecha, falla.

---

## Parte C — asentar lo validado donde el motor lo lee

**Nada de esto se re-mide: ya está en el CSV con su caso numerado.**

`C.1` · **Los casos entran al repo.** Copiar `casos_validacion_2026-08-09_addendum.csv` a `docs/`.

`C.2` · **Las filas de `MARCADORES` que quedan definidas**, con su caso al lado en `notas`:

| bloque | base · solapa | filtro | casos |
|---|---|---|---|
| lámina 2, mail JM | `digital · Directa Mail` | `mail_remitente=jorge.macri@buenosaires.gob.ar` | `V-53`–`V-55` |
| lámina 3, mail GCBA | `digital · Directa Mail` | `mail_remitente!=jorge.macri@buenosaires.gob.ar` | `V-56`–`V-58` |
| lámina 3, SMS | `digital · Directa SMS` | sin filtro de figura | `V-61`–`V-63` |
| lámina 5, agregado | `rdv · RVD JM-CM - ES` | `figura=Jorge Macri` | `V-38`–`V-45` |
| ministros | `rdv`, unión de las dos solapas | `figura!=Jorge Macri` | `V-49`–`V-52` |
| lámina 2, call center | `looker · CC` × `looker · Cuentas` | `nombre_campaña CONTIENE JM` | Parte B-bis |

**`ecv_insc_digital` sale de la columna `RRSS`**, no de la fuente digital (`V-40`, confirma `V-09`).

`C.3` · **`imp_prog` incluye las plataformas sueltas — decisión del usuario, 09/08.** TikTok,
Mercado Libre, Twitter, Twitch y Uber **entran a Programmatic**. No van a tokens propios y no
quedan afuera. **Excepción:** las 5 filas de Uber con 0,58 impresiones son dato sucio y van a
`REVISAR`, no a la suma — un valor decimal donde se esperan impresiones enteras no es una
impresión chica.

`C.4` · **Los derivados no llevan fuente.** `imp_total` es la suma de las tres plataformas y
`contenidos_total` la de las tres de pauta, en las dos láminas. Verificado al peso (`X-10`, `X-11`,
`V-59`, `V-60`). **Si hoy tienen fila con fuente propia, sobra.**

`C.5` · **`LAMINAS.estado` y `LAMINAS.falta`** son donde vive el estado por lámina. **Depende del
`_11`, que crea la hoja.** Si todavía no corrió, **anotar el mapeo propuesto en `PENDIENTES` y no
crear ningún registro paralelo** — un `.md` que repita lo que la hoja va a decir se desincroniza
el primer día.

---

## Anexo — lo que queda anotado y no se toca acá

- **`C-01` a `C-04`: el agregado usa un universo distinto del deck.** El motor filtró por ventana
  y publicó 4 encuentros que no son los 4 publicados — excluyó San Cristóbal 23/07, incluyó
  Caballito 29/07. **Contradice a `R-17`**, que ya dice que el temario selecciona y la ventana
  sólo acota. Es un defecto contra una regla escrita, no una regla que falte.
- **`C-07`: error publicado.** La lámina 17 del deck del 07/08 dice *Quirós*; las dos solapas de
  `rdv` dicen **Francisco Quintana**, misma fecha y dirección.
- **`C-06`: el panel `M2 periodo DIRECTA` del equipo pisa por `Id Cuentas`** y pierde el par
  `Pre`/`Post` de `1942-SEPEPHGC`. Es el mismo bug que `Union.gs:143`, **en la planilla**.
- **Looker está mal declarado.** Ninguna solapa de canal tiene columna de fecha; sólo `Cuentas` y
  `resumen_metricas_dinamico`. **No puede ser `modo_periodo=filtrar`.**
