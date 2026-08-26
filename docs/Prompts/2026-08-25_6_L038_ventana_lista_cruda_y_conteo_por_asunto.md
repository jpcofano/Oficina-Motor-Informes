# `L-038` — `Directa Mail` recorta por semana, la lista sale cruda y el conteo sale del asunto

**Decisiones del usuario, 25/08:**

1. **La lista publica los nombres distintos de la semana, crudos.** El equipo edita en su deck.
2. **El conteo sale del `Asunto`**, que es el que cierra: 26 asuntos distintos contra los **26
   envíos** que el deck publica.

⭐ **Y la comparación contra el deck decidió de qué columna sale la lista: del NOMBRE, no del
asunto.** Donde las dos difieren, el deck sigue al nombre — *«Inauguración Centro de Diagnóstico
Porteño en Palermo»* y no *«Nuevo centro de diagnóstico en Palermo»*; *«Cortes y desvíos en AU
Dellepiane…»* y no *«Desvíos por obras en AU Dellepiane»*.

⛔⛔ **Y destapó algo que `X-18` no decía: el deck no sólo agrupa, PODA.** `Vacunación antirrábica` y
`Repavimentación` están en la base y **no están en el deck**; de las ocho de `Vacaciones de Invierno
2026` publica *«en plazas (Comuna 5 y 7)»* y pierde Comuna 11, Parque de Invierno, Estación de
vacaciones y Parque de la Ciudad. Y lo que queda está **reescrito a mano** —`Luminarias peatonales` →
`Luminarias`, `Poda pre` + `Poda post` → `Poda (pre y post)`—.

> **Ninguna transformación automática produce esa lista, y una que se acercara INVENTARÍA las
> campañas que el equipo decidió no publicar.** Por eso se publica crudo: es la única salida que no
> miente.

---

## Parte 0 — medir antes de tocar nada

**Modelo: Sonnet. Effort alto. Sólo lectura.** Reportar y parar.

Actualizá el clon. Leé `CLAUDE.md` —el árbol, el ruteo, §2 y §4—, `docs/PLAN.md`,
`docs/CONFIG_INFORMES.md`, `docs/PENDIENTES_consistencia.md` y `docs/GRANO_TEMPORAL.md`, que es el
dueño de por qué `digital` se lee en modo `snapshot`.

### 0.1 · Quién más lee `digital/Directa Mail`

⛔⛔ **`leerFuente` retorna en la rama `snapshot` antes del mecanismo de ventana, así que hoy ninguno
de esos marcadores recorta.** Listalos todos, con su lámina y su valor actual.
⚠ **`mail_entregados` está entre ellos y hoy REPRODUCE en el Resumen.** Cambiar la ventana lo mueve.
**Íse es el riesgo de este prompt, no un detalle.**

### 0.2 · Qué mecanismo de ventana corresponde

`SOLAPAS.ventana_ref` nació en el `_23` como tercera rama de la decisión de ventana y **gana sobre la
fecha propia cuando está declarada**, con la traza diciendo cuál de las tres se usó. Decí si sirve
acá, o si hace falta que **la solapa declare su propio `modo_periodo`** — hoy el modo es de la
**base**, y `digital` tiene 22 solapas.

⛔ **No propongas una vía nueva de recorte para un caso.** `D-31` ya decidió que una regla que vale en
un solo lugar es una trampa con fecha. **Si ninguno de los mecanismos existentes sirve, decilo y
pará.**

⚠ Y confirmá que `fecha_periodo` de esta solapa es la col. **F, `Fecha envio`** —la del envío, no la
de inicio de campaña con lead, que es el motivo por el que `digital` es `snapshot`—, y cuántas de las
2.332 filas la traen vacía o no-fecha.

### 0.3 · ⭐ La columna `Asunto`, que el repo no conoce

**No está en `MAPEO`, ni en `PENDIENTES`, ni en el tablero: el motor no la conoce.** Reportá su letra
y su encabezado exacto, y para la ventana `24-31/07` con `Tipo de mail` conteniendo `M2`:

- cuántos **asuntos distintos** hay. **Lo esperado es 26**, contra las **32 filas** y los **30
  nombres distintos**;
- ⚠ **qué pasa con los tokens sin resolver** — `[barriolum]`, `[barriopluviales]`, `[barrioantirrab]`
  aparecen literalmente en los asuntos. Un asunto plantilla puede cubrir varios envíos, y eso corta
  **en dirección contraria** al 26 = 26. Decí cuál gana, medido;
- ⚠ **si `TEST Festival para toda la familia` entra al conteo.** Si entra, hay un envío de prueba
  contándose como campaña. **No lo excluyas por tu cuenta**: reportalo.

### 0.4 · El salto de línea por Sheets

Si Sheets **acepta y devuelve** una celda cuyo contenido es un salto de línea. Es la familia del
`valor_fijo = '1/3'` que se guardó como fecha: **se verifica releyendo lo que quedó, no escribiendo a
ciegas.** Hace falta para poder usar `separador: '\n'` en `opLISTA`.

⭐ **Control positivo, y frená si no aparece:** un marcador de otra solapa que hoy recorta bien por
ventana, leído por el mismo camino. Si no reproduce, el instrumento no está viendo la cadena real y
**no hay hallazgo**.

**Reportá y pará.**

---

## Parte 1 — la ventana de `Directa Mail`

**Modelo: Opus. Effort alto.** Mueve números que hoy reproducen, en más de una lámina.

**Sólo si la Parte 0 identificó un mecanismo existente.**

⛔⛔ **Testigo antes y después, y va SOLO en su deck.** Los marcadores que la Parte 0 listó cambian
todos a la vez. **Dos cambios en el mismo deck no se pueden separar:** si un número se mueve, no hay
forma de saber cuál de los dos lo movió, y las dos causas mandan a trabajos opuestos.
**No cablees nada de la Parte 2 acá.**

- La declaración va en la hoja de registro, no en el código, y el seed **sólo siembra lo ausente**.
- ⭐ **La traza dice por qué rama recortó.** Un número que no dice de qué ventana salió es
  indistinguible de uno mal.
- El banco afirma **las dos direcciones**: que con ventana da lo medido, y que **sin ventana daba
  672 distintos**. Un banco que sólo prueba el estado nuevo no detecta que la rama dejó de aplicarse.

Un commit.

---

## Parte 2 — la lista, el conteo y el `MAPEO` del asunto

**Modelo: Opus. Effort alto.** **Sólo después de que la Parte 1 corrió y su testigo está leído.**

1. **`MAPEO` para el `Asunto`** de `digital/Directa Mail`, con su `encabezado` como testigo de
   integridad (`D-31`).
2. **`m2_camp_lista`** — `opLISTA` sobre `mail_campana` (col. H), `dimensiones: tipo_envio=m2`,
   formato `texto`. **Los distintos crudos, sin agrupar ni normalizar.**
   ⭐ **Bullets con `separador: '\n'`** — medido: `replaceAllText` con `\n` abre párrafo y cada uno
   hereda bullet, nivel, sangría y **el mismo `list_id`**. ⚠ **Sólo si la Parte 0.4 confirmó que la
   celda sobrevive el viaje por Sheets.** Si no, `separador: ' · '`, que es lo que ya hace
   `ecv_barrios`.
3. **El conteo de ENVÉOS sale del asunto**: `CUENTA_DISTINTOS` sobre el campo nuevo, mismo universo y
   mismo filtro que la lista. Es `m2_envios`, y **es el único conteo que publica el motor en esta
   lámina**.
4. **La nota de cada fila** dice que se publica crudo, por qué, y `X-18` al lado.

⛔⛔ **Las dos ranuras de conteo NO son las dos del motor, y la plantilla las tiene cruzadas.**
Medido contra el deck del equipo: el pill oscuro dice **«26 envíos»** y el banner verde **«12
Campañas»**.

> **El banner lo escribe el EQUIPO** (decisión del usuario, 25/08). El motor publica **un solo
> conteo**: el de envíos.

⛔ Tres consecuencias, y ninguna es opcional:

- **`{{m2_envios}}` va al pill de envíos** y sale del **asunto**. Hoy está en el banner verde, que es
  el cruce que hay que deshacer.
- **El banner de Campañas se declara texto del equipo** — va a `TOKENS_EQUIPO_JM_`, cruzado **uno por
  uno contra el censo**, nunca por prefijo. ⭐ Así **sale del conteo de faltantes**, que es el
  instrumento con el que se declara `D-38`.
- ⛔ **`m2_campanias` se DEJA y no se pinta** (decisión del usuario, 25/08). La fila queda en
  `MARCADORES`; el token sale de la plantilla, así que no tiene dónde pintar y **no entra a
  `FALTANTES`** —es el caso *«con fila y no en FALTANTES: el token no está en la plantilla»*—.
  ⚠ **Su nota tiene que decir eso con todas las letras**, con fecha: *conteo de campañas distintas,
  sin ranura porque el banner lo escribe el equipo; se conserva por si vuelve a ser automático*.
  ⭐ **Una fila que no pinta y no falta es invisible**, y dentro de seis semanas nadie va a poder
  distinguirla de un olvido. Es el mismo argumento por el que `MARCADORES_POST_L036_TODOS_` crece y
  no se poda. **No la retires y no la dejes muda.**

⚠ **La caja: medido, `autofit = SHAPE_AUTOFIT`, 8 pt, alto 24.** Autofit de forma significa que la
caja **crece**, no que achique la letra: 30 bullets dan ~290 pt sobre una caja de 24 y **se comen la
lámina**. Reportá qué pasa al pintarla y **no decidas el tope**: si hace falta uno, es del usuario.

⛔ Los cambios de plantilla los hace el usuario, no vos.

Corré `node tools/suites.js`, veredicto por **exit code**. Un commit.

---

## Parte 3 — documentación

**Modelo: Sonnet.** Rutear por `CLAUDE.md` §7.

- **`docs/CONFIG_INFORMES.md`** — publicar los nombres crudos como **decisión editorial**, con fecha
  y motivo medido. ⭐ La edición de la lista queda declarada como **trabajo del equipo**, no como
  hueco del motor.
- **`docs/PENDIENTES_consistencia.md`** — ⛔ **`X-18` se reformula**: hoy dice *«la lista publicada
  está agrupada a mano»* y es **agrupada, reescrita y PODADA**. Escribí las tres, con los ejemplos:
  `Vacunación antirrábica` y `Repavimentación` ausentes del deck; cuatro de las ocho de `Vacaciones
  de Invierno 2026` ausentes; `Luminarias peatonales` → `Luminarias`. **El 30 → 12 no se explica por
  colapso.**
  Y `digital` leyéndose `snapshot` cuando una de sus solapas sí tiene fecha de envío propia.
- **`docs/GRANO_TEMPORAL.md`** — es el dueño de por qué `digital` es `snapshot`. Si esta vuelta lo
  matiza, se matiza **ahí**.
- **`docs/CIERRE_POR_LAMINA.md`** — `L-038`. ⛔ El ✅ lo pone el usuario.
- **`docs/BITACORA.md`** y **`docs/HANDOFF_CODE.md`** — la vuelta, con dos hallazgos escritos:
  **un token en la ranura de otro no falla, publica**; y **el asunto era una columna que el motor no
  conocía y es la que cierra el conteo de envíos**.

Commit separado.
