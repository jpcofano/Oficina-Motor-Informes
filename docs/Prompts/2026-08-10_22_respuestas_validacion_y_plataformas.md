# `_22` · Las cuatro respuestas de validación, incorporadas — y el `_18` que sobra

> **Modelo por parte.** `A` Sonnet · `B` Sonnet · `C` **Opus** · `D` Sonnet · `E` Sonnet.
> El criterio: si equivocarse cuesta una re-corrida, Sonnet; si cuesta un número mal en un deck,
> Opus. **Opus se pide, no se hereda.**
>
> **Code no re-mide nada de esto.** Los cinco casos salieron de la rama de validación, medidos con
> `openpyxl` sobre `Base Looker.xlsx`. Acá se incorpora y se cablea la conclusión; se audita
> **forma**, no valores.

---

## 0 · Lo que las respuestas cambian

**Cinco casos nuevos: `V-67`, `C-19`, `C-20`, `A-04`, `X-16`.** Y tres consecuencias, en orden de
urgencia:

1. **`A-04` corrige a `A-03`.** `imp_prog` **no** es `Plataforma = DV360`. Son seis plataformas,
   no tres, y las tres chicas —TikTok 51, Mercado Libre 19, Twitter 12— **no aparecían en la
   ventana que `A-03` midió**. Cableado como `= DV360` pierde 82 filas **en silencio**.
2. **`C-19` acota el join**, y el motivo cambia la forma de la capacidad: el corte JM y el filtro
   `estado` se resuelven **dentro de `DIGITAL`**, columnas `F` e `I`. Lo único que exige cruzar es
   **la ventana**, porque `DIGITAL` no tiene ninguna columna temporal.
3. **`C-20` deja 22 filas sin decidir.** `estado` vacío: no son `Activa` ni dejan de serlo, y hoy
   caen afuera **por omisión**.

**Y una consecuencia sobre el `_18`: se cancela.** Su `0.0`, `0.1`, `0.2` y `0.4` preguntaban
exactamente lo que `V-67`, `C-19` y `C-20` acaban de contestar, con más precisión de la que una
lectura desde Apps Script iba a dar. **Correrlo ahora sería medir dos veces lo mismo.** Lo único
suyo que sobrevive es la disyuntiva de período de `0.3`, y va a la Parte C de este prompt.

---

## A · Verificación de forma — Sonnet, sólo lectura

**A.1** El CSV del repo tiene 56 líneas y **no** contiene `V-67`, `C-19`, `C-20`, `A-04` ni
`X-16`. **Contar filas de datos, no líneas** — el `_20` paró por confundirlas.

**A.2** Las tres columnas que `V-67` declara existen y están donde dice: `DIGITAL` con nueve
encabezados, `nombre_campaña` en `F`, `estado` en `I`. **Verificar la forma contra la solapa viva,
no los valores.** Si los encabezados no coinciden, **parar**: el fixture del 31/07 y la solapa
viva habrían divergido, y eso es más importante que este prompt.

**A.3** Estado del cableado de `imp_prog`, `imp_meta` e `imp_google` hoy: si existen filas en
`MARCADORES`, a qué base y solapa apuntan, y con qué filtro. **`A-04` sólo es urgente si alguna ya
dice `DV360`.**

**A.4** Confirmar que `imp_total` y `gcba_imp_total` siguen como los dejó el `P0` —cableados sobre
`resumen_metricas_dinamico`, que no es su fuente— y que **nadie los tocó desde entonces**.

**Si A.1 a A.4 confirman, seguir sin volver a preguntar.** Parar sólo si una se cae.

---

## B · Incorporar — Sonnet

- **`docs/casos_validacion_2026-08-09_addendum.csv`** — las cinco filas al final. **Ninguna previa
  se edita**, incluida `A-03`: se corrige por `A-04`, no por reescritura. El histórico de que se
  midió sobre una ventana incompleta **es el dato que evita repetir el error**.
- **`docs/VALIDACION_2026-08-09.md`** — los cinco casos, y el encabezado de conteo actualizado.
- **`docs/RESPUESTA_pedido_validacion_2026-08-10.md`** — entra tal cual como par del pedido.
- **`PENDIENTES_consistencia.md`** — dos filas nuevas: las 22 de `estado` vacío (§D) y `X-16`.

---

## C · La regla de plataformas — **Opus**

Es Opus porque define de qué universo sale un número que va a un deck.

**La regla, que reemplaza a la de `A-03`:**

> **`imp_prog` es todo lo que no es Meta ni Google ads.** Por resta, no por enumeración.

**Por resta y no por lista, y el motivo está medido:** una lista explícita —`DV360`, `TikTok`,
`Mercado Libre`, `Twitter`— es correcta hoy y **falla en silencio** el día que aparezca una
séptima plataforma. Es la misma falla que `A-03` acaba de cometer: enumeró lo que había en una
ventana. La resta absorbe lo que no existe todavía. **Y hay un caso ya conocido**: la decisión del
usuario del 09/08 nombraba Twitch y Uber, que **no están en `looker/DIGITAL`** —estaban en
`CAMPAÑAS_DESGLOCE_DIGITAL`, hoy en `uso = ignorar`—. Si algún día aparecen, la resta ya las
cubre.

Escribir como regla numerada en `REGLAS_NEGOCIO.md`, con: las seis plataformas medidas y sus
conteos, la fecha de la medición, **y que el conteo es del universo completo y no de una ventana**
— que es lo que `A-03` no dijo y por eso envejeció mal.

**El contrapunto que la regla necesita al lado:** por resta, una plataforma **mal escrita** —un
`Meta ` con espacio, un `Google Ads` con mayúscula— cae en `imp_prog` en vez de fallar. `R-23` ya
midió que en `nombre_campaña` no hay variantes de mayúsculas, **pero eso se midió en `F`, no en
`B`**. Reportar los valores distintos de `Plataforma` **exactamente como vienen**, y si hay dos
que difieren sólo en espacios o mayúsculas, eso es hallazgo y va antes que el cableado.

**No cablear `imp_prog` todavía**: sigue esperando la ventana, que es §D.

---

## D · Las 22 filas sin `estado` — Sonnet, y la decisión ya está tomada

**Decisión del coordinador, y sigue el precedente en vez de inventar uno:** las 22 quedan
**afuera**, porque `estado = Activa` es una **inclusión positiva** y una fila sin estado no
cumple la condición. **Lo que cambia es que dejan de caer afuera por omisión: la traza las cuenta
y las nombra.**

Es `R-20` aplicado: **un vacío no es un valor.** La diferencia entre «no entró porque no es
`Activa`» y «no entró porque no dice nada» tiene que estar escrita, o dentro de tres meses alguien
va a mirar un número corto y no va a tener por dónde empezar.

- La traza del filtro reporta, junto al conteo de descartadas, **cuántas se descartaron por
  `estado` vacío**.
- **Medir cuántas de las 22 son JM y caerían en una ventana típica.** Si son cero, el pendiente
  queda con el número al lado y eso es lo que lo hace útil — igual que el desvío de las campañas
  mixtas: cero hoy, no cero por definición.
- Va a `PENDIENTES` como decisión reversible: si alguna vez una campaña JM grande aparece sin
  estado, se revisa. **No se revisa sola.**

---

## E · Documentación — Sonnet

- **`BITACORA.md`** — los cinco casos, la regla de §C con su contrapunto, y la decisión de §D.
  Con fecha y hora de lectura.
- **El `_18` se marca como cancelado en su propio archivo**, con el motivo y los casos que lo
  reemplazan. **No se borra.** Un prompt cancelado con su motivo escrito evita que alguien lo
  vuelva a escribir en tres semanas.
- **La disyuntiva de período de `looker`** —`0.3` del `_18`, lo único que sobrevive— pasa a
  `PENDIENTES` con lo que ya se sabe: la dinámica tiene su `fecha_periodo`; `DIGITAL` no tiene
  ninguna columna temporal; `Cuentas` tiene el par completo, **951 filas, cero sin
  `fecha_inicio`, cero sin `fecha_fin`**.

### Criterios de aceptación

1. El CSV tiene cinco filas más y **ninguna previa cambió**. Diff limpio.
2. Ninguna fila de `MARCADORES` dice `Plataforma = DV360`.
3. La regla de plataformas está escrita **por resta** y con la fecha de la medición.
4. Ningún marcador nuevo cableado, ninguna plantilla tocada, `LAMINAS` intacta.

---

## Lo que sigue, y no está en este prompt

**El join queda como la única capacidad faltante, y `C-19` cambió su forma:** no es un join para
saber de quién es la campaña —eso sale de `F`—, es **un join para saber cuándo corrió**. Un filtro
de pertenencia: `id_cuenta` dentro del conjunto que `Cuentas` deja en la ventana. Eso puede ser
bastante más chico que un join general, y **el prompt de diseño empieza por ahí y no por el caso
general**.
