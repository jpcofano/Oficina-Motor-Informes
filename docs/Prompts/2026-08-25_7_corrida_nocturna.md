# Corrida nocturna del 25/08 — todo lo que se pueda sin el usuario

**Siete frentes independientes.** Ninguno necesita una decisión nueva: todos están decididos y
escritos. El objetivo es que mañana haya resultados, no preguntas.

## Las reglas de la noche, y son las que hacen que esto sirva

1. ⛔ **No corras `jm`.** No hagas `clasp push` de código nuevo salvo lo que una parte necesite para
   correr su propio instrumento. **El deck lo genera el usuario.**
2. ⛔ **No toques la plantilla viva.** Ninguna parte lo pide. Si alguna parece pedirlo, es que la
   entendiste mal: pará.
3. ⭐ **Las partes son independientes a propósito. Si una se bloquea, anotá por qué y SEGUÍ con la
   siguiente.** Un bloqueo no cancela la noche. La única excepción es la Parte A, que va primero.
4. **Un commit por parte**, para que se pueda bisecar. Documentación separada del código.
5. ⛔ **Si una parte necesita una decisión que no está escrita, PARÁ ESA PARTE.** No la resuelvas por
   plausibilidad. Anotala en el reporte final como *«bloqueada, decide el usuario»* con la pregunta
   exacta.
6. ⭐ **Cada parte que mida lleva control positivo, y frena si el control no aparece.** Un
   instrumento que no ve lo conocido no vio nada. Ya pasó dos veces hoy.
7. ⛔ **Y una regla que hoy costó una vuelta entera: medir una función en aislamiento no es medir el
   camino.** El recorte de `digital` no estaba en `leerFuente` sino en su llamador. Antes de
   concluir que algo *«no existe»*, verificá quién llama a lo que estás leyendo.

---

## Parte A — commitear lo pendiente

**Modelo: Sonnet.** Va primero: son mediciones ya pagadas que hoy viven fuera de git.

**Dos tandas, dos commits separados** — parar antes de bundlear fue correcto:

1. `tools/medir-desempates-cc.py` + `docs/Prompts/2026-08-25_4_…md`
2. Las 617 líneas de `Auditoria.gs` (diagnósticos de bullets y de `Directa Mail`) +
   `tools/medir-asunto-directa-mail.py` + `docs/Prompts/2026-08-25_6_…md`

⚠ **El `Auditoria.gs` no lo escribiste vos**: revisalo antes de commitear y decilo en el mensaje.

---

## Parte B — `declararIteraDelAgregado()`

**Modelo: Sonnet.** Escribe en `SECCIONES`. **Medición antes y después, obligatoria.**

`ecv_alcance_semanal.itera_sobre` está vacía en la hoja y el valor correcto está en el repo desde el
22/08. ⛔ **`SECCIONES` es una de las dos hojas que sólo siembran lo ausente**, así que ni
`instalar()` ni *Aplicar configuración* la reparan y el diff no acusa nada. **Sólo el botón la
arregla.**

Si esa celda queda vacía, **los 16 `ecv_*` se van al universo ancho sin que nada avise**.

- Reportá el valor de la celda **antes**, corré el botón, reportá el valor **después**.
- ⭐ Y **releé lo que quedó en la celda**, no lo que se pidió escribir. Es `C-83`.
- Si ya estaba poblada, **decilo y no toques nada**: idempotencia, no rotura.

---

## Parte C — `L-038`, la lista cruda

**Modelo: Opus. Effort alto.**

⛔ **La Parte 1 del `_6` NO va**: `SOLAPAS.modo_periodo` quedó descartada. El recorte no es propiedad
de la solapa sino de **cómo se la lee**, y `Directa Mail` se lee de las dos formas —16 marcadores
como agregado, 47 por cuenta—. Es el caso de `looker/resumen_metricas_dinamico` de `D-30`.

⭐ **`m2_campanias` ya publica lo decidido** —campañas distintas de M2 de la ventana, 19 sobre 21
filas—, así que no hay nada que arreglar ahí.

1. **`m2_camp_lista`** — `opLISTA` sobre `mail_campana`, `dimensiones: tipo_envio=m2`, formato
   `texto`, `separador` = **salto de línea REAL**.
   ⚠ **Un banco lo afirma**, porque en un log un salto real y los caracteres `\` + `n` se ven iguales
   y hacen cosas opuestas: uno abre párrafo con bullet y el otro no. Los dos vuelven idénticos de
   Sheets.
2. **`m2_campanias` se deja y no se pinta** (usuario, 25/08): el banner de Campañas lo escribe el
   equipo. La fila queda; **su nota lo dice con fecha y por qué se conserva**.
   ⭐ Una fila que no pinta y no entra a `FALTANTES` es invisible: sin la nota, en seis semanas no se
   distingue de un olvido.
3. **`m2_envios` queda como está.**
4. **La caja**: `SHAPE_AUTOFIT`, 8 pt, alto 24 — **crece, no trunca**. Reportá qué pasa al pintarla y
   ⛔ **no decidas el tope**.

---

## Parte D — `X-28`, la regla provisoria en `_revisar`

**Modelo: Opus. Effort alto.** Publica cuatro números.

La Parte 0 del `2026-08-25_4` ya corrió. La regla decidida por el usuario es
**`JDGAG` + pertenencia + `duración ≤ 30 d`**, y el desempate no se eligió por acierto —los tres
aciertan igual— sino por **modo de falla**:

- ⛔ `estado = Finalizada` **falla por un día**: `3289` quedó excluido en agosto porque su `fecha_fin`
  derivó a exactamente el día del export. Corrido un día después, entra y publica 5 filas en vez
  de 3.
- ⭐ `duración` **se aleja del corte cuanto más deriva** — `3289` ya está en 34 d contra un tope
  de 30.

- Filas de `MARCADORES` para `cc_campanias`, `cc_base`, `cc_contactados`, `cc_contact_pct`, **las
  cuatro con formato `*_revisar`**.
- **El corte va en `dimensiones`**, no en `filtro`.
- **La nota dice la regla completa y por qué está en `_revisar`**: no porque el número sea dudoso,
  sino porque **la regla que elige la cuenta es provisoria**. Y que los tres desempates **son parches
  para deshacer un artefacto de la fuente**, no criterios de negocio.
- **El banco afirma tres cosas**: que elige `3289` en julio y `3488` en agosto; que julio reproduce
  `2 · 6.011 · 1.878 · 31`; y que **el formato lleva el sufijo**. Sin eso, un número provisorio se
  publica con cara de verificado.
- ⛔ **No afirmes que agosto reproduzca.** Registrá los dos números y el motivo: el Resumen y el
  iceberg del mismo deck salen de momentos distintos.
- ⛔ `X-28` **sigue abierto**. Esto no lo cierra.

---

## Parte E — el barrido de los 32 `exacto`

**Modelo: Sonnet. Effort alto. Sólo lectura.**

A la luz de la regla nueva de `CLAUDE.md` §4 —*un deck del equipo no es una foto*—. Clasificá cada
uno y decí contra qué lo decidiste:

- **(a)** no se midió contra un deck — la regla no aplica;
- **(b)** se midió y **reprodujo** — sigue valiendo, no se toca;
- **(c)** se midió, **no reprodujo**, y se atribuyó a un bug o a una definición — ⭐ **candidato**;
- **(d)** no clasificable con lo escrito — decilo, no lo fuerces.

⭐⭐ **La firma que separa (c) de un bug real:** dos láminas del **mismo archivo**, una que reproduce
al dígito y otra que no. Para cada (c), reportá si hay otra lámina del mismo deck con un caso que sí
reprodujo.

⛔ **No cambies ningún veredicto.** Esto produce una **lista**, no una corrección. Y **contá los
cuatro grupos**, incluida la (d): un barrido que sólo informa lo que encontró no distingue *«no
hay»* de *«no miré»*.

---

## Parte F — el censo de `L-042` y `L-044`

**Modelo: Sonnet. Effort alto. Sólo lectura.**

El usuario declaró que **las carga el equipo**, pero también que **hay tokens que sí se cablean** —
nombró `{{camp_titulo}}` en `L-044`—. Así que no se pueden declarar enteras.

Para cada una, la lista **completa** de tokens que aparecen en la lámina —no sólo los sin fila—, y
para cada token: si tiene fila en `MARCADORES`, con qué operación, y si está en `TOKENS_EQUIPO_JM_`.

- ⛔ **Contra la plantilla, no contra `docs/TOKENS.md` ni el censo del 22/08.** `TOKENS.md` ya
  envejeció sobre `L-036`. Y el censo del 22 lista **sólo los sin fila**: leerlo como *«la lámina no
  tiene tokens»* es confundir *«no está en la lista»* con *«no existe»*.
- ⚠ **`L-044` no figura en ninguna línea del censo del 22/08.** Decí cuál de las dos: no tiene
  tokens, o los tiene y todos tenían fila.
- ⚠ **`camp_titulo`**: el usuario lo ubica en `L-044`, el repo lo asocia a `L-048`. Un token puede
  estar en varias láminas — decí en cuáles, medido.
- ⛔ **No declares nada en `TOKENS_EQUIPO_JM_` todavía.** Esto es el insumo para que el usuario
  decida token por token. Declarar de más es peor que dejarlos contados.

---

## Parte G — documentación y handoff

**Modelo: Sonnet.** Rutear por `CLAUDE.md` §7.

- ⭐⭐ **`CLAUDE.md` §4 — el caso del instrumento que saltea un tramo.** Medir `leerFuente` en
  aislamiento sin mirar a su llamador dio 672 donde el camino real da 19. **La regla ya estaba
  escrita** —*la función que estás leyendo no es el camino completo*— y aun así se repitió, **desde
  el instrumento**, que es donde más caro sale: un instrumento que saltea un tramo no da un número
  más chico, **da otro número**.
- **`PENDIENTES_consistencia.md`** — ⛔ **`X-18` se reformula**: es agrupada, **reescrita y PODADA**.
  `Vacunación antirrábica` y `Repavimentación` ausentes del deck; cuatro de las ocho de `Vacaciones
  de Invierno 2026` ausentes; `Luminarias peatonales` ≠ `Luminarias`. **El 30 → 12 no se explica por
  colapso.**
  Y el **asunto descartado** como fuente de conteo, con las dos razones medidas: son **27 y no 26**
  —el 26 sale de excluir el `TEST`— y **fusiona campañas**: *«Espacio Público e Higiene Urbana»*
  cubre 6 filas y 5 nombres distintos. ⭐ Con la observación de método al lado: **el 26 satisfacía dos
  reglas a la vez** (27−TEST y 32−6), así que nunca podría haber elegido entre ellas.
  Y **`SOLAPAS.modo_periodo` evaluada y descartada**, con el motivo de `D-30`: el recorte es
  propiedad de cómo se lee la solapa, no de la solapa.
- **`CONFIG_INFORMES.md`** — los nombres crudos como decisión editorial, con fecha. La edición es
  trabajo del equipo, no hueco del motor. Y la regla provisoria de `X-28` con **condición de
  salida**.
- **`CIERRE_POR_LAMINA.md`** — `L-038` y el Call Center. ⛔ El ✅ lo pone el usuario, nunca vos.
- **`BITACORA.md`** y **`docs/HANDOFF_CODE.md`** — la noche entera.

---

## El reporte de la mañana

Una tabla, **una fila por parte**: hecha / bloqueada / no llegué. Para cada bloqueada, **la pregunta
exacta que decide el usuario**, en una línea.

Y al final, **lo único que importa que quede escrito**: qué está listo para la corrida de mañana y
en qué orden se aprieta. ⚠ Incluido el **paso 9 bis** —verificar `CONFIG.solapas_agregado_post` a
mano, porque `CONFIG` sólo siembra lo ausente y con la lista vacía los cuatro `post_periodo*` no
publican—.

⭐ **Y el veredicto de las suites por exit code**, no por glifo.
