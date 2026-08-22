# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-22 — al cerrar el `2026-08-22_23` (las dos fases del proyecto).
Lo de más abajo viene de la madrugada, al cerrar el `2026-08-21_19` y la validación deck contra
deck, y **sigue vigente**: no se reescribió lo que no cambió.

---

## ⭐ Lo primero, porque cambia cómo se lee todo lo demás: el proyecto tiene dos fases

**`D-38`, aprobada por el usuario el 22/08.** **`informe semanal`** —el motor genera el deck y cada
número publicado está verificado— **y después `informe actualizable`** —un deck ya publicado
refresca sus números en el lugar sin tirar el trabajo del equipo—. La segunda **no empieza hasta que
cierre la primera**, y el motivo va escrito con la decisión: refrescar un número que todavía no está
validado es **automatizar la publicación de un número mal**.

**Todo lo que está en `PLAN.md` §2 es fase `informe semanal`.** El prompt de la otra está escrito,
sin correr y en el Backlog.

### Cómo cierra, y qué destraba eso

**Cierra cuando vos, mirando un deck completo, declarás que los faltantes que quedan no son
relevantes.** No hay umbral ni conteo: **es revisión humana**. Con dos consecuencias que van con el
criterio:

1. ⭐ **No es que no haya faltantes: es que estén a la vista para poder juzgarlos.** Por eso el P1 de
   `FALTANTES` —**se pisa en cada corrida y no tiene lector fuera del editor**— dejó de ser un
   pendiente más: **es el instrumento del cierre de la fase**. Hoy esa declaración **no se puede
   hacer**, y esto es lo que la destraba.
2. **La declaración va pegada a un `corrida_id`.** Sin corrida es una frase, no un cierre.

### ⛔ Y una regla que salió de equivocarme: el testigo es `jm-20260821-234927`

Puse una condición del criterio en ⛔ citando *"la misma lámina tres veces con tres juegos de
cifras"*. **Esa evidencia es de `230048`** —la del temario de 12 encuentros—, y §4.3/§4.4 son de
`194602`. **Sobre el testigo nadie la midió**, y lo que vos revisaste a mano **da bien**: *Eje Sur*
es el nombre y *Parque Patricios* el barrio.

**Es la tercera conclusión sobre el producto sacada de `230048`.** La regla quedó registrada con las
tres: ninguna conclusión sale de otra corrida sin decir por qué. **`230048` engaña porque es más
grande, y más grande se lee como más completo.**

⚠ **Lo único medido sobre el testigo es la condición 1.** Las demás salen de otras corridas, y el
criterio pide que se cumplan **todas sobre la misma**.

---

## ⛔ Lo primero, y es lo más valioso de la noche: hay un mapa de qué publica bien el motor

`docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md` compara **lámina por lámina** el deck que
generó el motor contra el que publicó el equipo, **la misma semana**. Es el primero de la serie que
mide producto terminado contra producto terminado, y cambia qué conviene hacer primero.

**Lo que reproduce exacto, y no se toca:**

| bloque | |
|---|---|
| Alcance del encuentro | **las seis cifras** — 619 · 96 · 10 · 855 · 186, y el equipo publica `Call + IVR: 130` donde el motor publica **101 + 29** |
| Mails entregados JM | 538.290 contra 538.291 — **difiere en uno** |
| Aperturas M2 | **0,16 %** |
| Aritmética de los resúmenes | **cierra en los dos decks**: el motor no se equivoca sumando |

**Lo que no cierra, y qué trabajo manda cada uno:**

| qué | tamaño | qué es |
|---|---|---|
| ⭐⭐ **IVR y Call Center del iceberg** | **chico y de alto rendimiento** | los cuatro números del equipo —96.549 · 304 · 33.139 · 107.194— **el motor los publica EXACTOS**, en la copia equivocada de la lámina. **El cableado existe: lo que falla es qué ítem le llega** |
| ⛔ `N envíos de Mail` / `de SMS` | chico | mide **piezas**, no envíos: 541.002 contra **6**. El número es correcto para otra pregunta |
| ⛔ los seis `pauta_*` | chico | publican **`1`** contra 28 y 270 |
| ⛔ Programmatic 3,6–7,2× | mediano | Meta y Google están en 1,3–3×. **Los ratios difieren por plataforma**, así que no es la ventana |
| ⛔ M2 −9,6 % | mediano | **numerador quieto, denominador corrido** — no salen del mismo conjunto de filas |
| ⛔ RRSS | ⚠ **peligroso** | publica **la semana pasada sin marcarlo**: su primer bloque no tiene tokens, el motor no lo toca, y sale intacto |
| ⛔⛔ el reparto de ítems entre copias | grande | la misma lámina sale **tres veces con tres juegos de cifras** |

⚠ **Antes de perseguir Programmatic, medir una cosa barata:** el equipo titula *"14_08 al 21_08"* —
**ocho días** — y `R-11` son siete. No se descartó como causa de las diferencias de volumen.

---

## ⏸ Lo que espera de tu lado, en orden

| # | qué | por qué |
|---|---|---|
| 1 | ⭐ **`clasp push`** | los cambios del `_19` están commiteados y **no pusheados al proyecto de Apps Script**. Nada de abajo se puede probar sin esto |
| 2 | ⭐ **Abrir el panel y mirar la pestaña «Corrida»** | es nueva. Con el estado vacío tiene que decir *«no hay ninguna corrida desatendida»* y no romperse |
| 3 | **Probar «Generar y que siga sola»** en una semana que venga cortando | ⛔ **el desatendido nunca corrió de punta a punta con más de una continuación** |
| 4 | **Archivar `almagro\|2026-06-16\|`** en la pestaña Anclajes | es la huérfana real. La primera vez crea la columna `archivada` sola |
| 5 | **Aplicar configuración** | siguen faltando las **8 filas `REVISAR`** del `MAPEO` |

---

## Qué cambió en el panel

**Dos botones donde había uno**, y la pantalla dice cuál conviene:

- **Generar informe** — corre de una vez y devuelve el deck. **Sigue siendo el caso normal**: el
  arranque cuesta 70–80 s **por ejecución**, así que partir una corrida en tres lo paga tres veces.
- **Generar y que siga sola** — arranca la corrida desatendida. Si corta, se reanuda sola.

⚠ **El botón viejo NO se retiró a propósito.** Hasta que el desatendido esté probado punta a punta,
sacarte la única forma que funciona hoy va para el lado equivocado.

**Pestaña «Corrida»** — sólo lectura: `corrida_id`, ejecución N de 6, el plan por sección, y el
**freno** con confirmación. ⭐ Contesta *«¿está listo?»* con el **sello del nombre del deck**, no con
los tokens: las láminas escondidas dejan **49 crudos permanentes** en toda corrida. **No se refresca
sola y dice a qué hora leyó** — una pantalla que se actualiza sola parece siempre actual aunque el
backend haya dejado de responder.

**Pestaña «Anclajes»** — las filas *«ninguna reunión vigente la reclama»* ahora se pueden
**archivar**. No se borran: vuelven solas si la reunión vuelve a `mostrar = sí`, y el contador de
huérfanas **no baja** al archivar.

**Y el enlace al deck ya no dice `[object Object]`.** Estaba en `Panel.html`, no en el adaptador —
el comentario que decía lo contrario era falso y mandaba al archivo equivocado.

---

## ⛔ Dos cosas que hay que saber antes de leer un número

**1 · El período elegido y el calculado dan la misma ventana y distinto temario.** `agosto_14_20` y
`R-11 (calculado)` resuelven **los dos** vie 14/08 → jue 20/08. Pero `anclarEncuentros` recorta
`REUNIONES` por período **sólo si la ventana vino por `periodo_ref`**, así que sin período entran
**12 encuentros en vez de 2**, con junio y julio adentro. El deck `jm-20260821-230048` es eso, y
salió **sin que nada fallara**.

⚠ Hay aviso en el panel desde el 20/08 (`avisosDeVentanaPropuesta_`), pero es **preventivo y no
forense**: un deck ya generado **no se puede auditar**, porque ningún reporte lleva el `periodo_id`.
Y el camino desatendido del editor **no pasa por el panel**, así que no ve el aviso. Está como
**P1** en `PENDIENTES_consistencia.md`, con su corrección del 22/08 al lado.

**2 · `corte` no se persiste en ninguna hoja.** El único rastro forense de que una corrida cortó es
**el sello en el nombre del deck** — `FALTANTES` se pisa en cada corrida y `CORRIDAS` no tiene
columna de corte. La celda `faltantes` sí conserva el `· gasto:` con el rastro de etapas, que es de
donde salió el cierre de la Parte 0.

---

## Las suites, todas en verde

**23 bancos**, corridos enteros al cerrar. Dos nuevos o ampliados hoy:

- `probar-desatendida-en-el-panel.js` — **33 afirmaciones**. Carga `Desatendida.gs` y
  `PanelBackend.gs` **en el mismo contexto**, que es como corren de verdad. Fija que `continuable`
  de afuera se ignora, que el período y las secciones viajan, y que **los dos botones mandan lo
  mismo**.
- `probar-confirmar-anclaje.js` — cinco secciones nuevas que **ejecutan** el lector en vez de
  mirarle el fuente. Una regex habría pasado igual con la condición al revés.

⚠ **Y la lección de la noche, que vale para el próximo banco:** el primer «romper a propósito» falló
porque el parche era una cadena con `\n` y **los `.gs` están en CRLF**. Falló **ruidosamente**
gracias a la guarda que exige que el parche matchee. **Sin esa guarda, la sección habría quedado en
verde sin haber roto nada.**

---

## ⛔ Evidencia que no se puede perder

- **Los tres decks del 21/08**, con lo que cada uno prueba:
  `1_krz_dTgwVqFm8BbAIhxKl6VAvD3zMy1MYx9BUGlMnI` (194602, temario correcto, cerró) ·
  `10omnlzVY6nrwg6CX-EqyBIypTgQ6sY7XRB15JNkugC4` (224727, **sigue sellado** — es la prueba del corte) ·
  `1lg-FcqM5VlDAo4HaFI_0AuKEQ6H1hx4s_nmVWdqhPO0` (230048, el del temario de 12 encuentros).
- **Los tres fixtures**, con su huella en `docs/_fixtures/README.md`. El del 20/08 trae la base
  **y los dos decks del mismo día**, y de ahí salió la validación.
- ⚠ **Dos `.pptx` de decks reales quedaron en el historial de git** (commit `7e48725`). Riesgo
  asumido por decisión tuya.

---

## Cómo leer esto desde afuera

- **Qué se hizo y qué se midió** → `docs/BITACORA.md`, entradas del 2026-08-22.
- **Qué publica bien el motor y qué no** → `docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md`.
- **Qué sigue abierto** → `docs/PENDIENTES_consistencia.md`.
- **Qué hace una persona para sacar el informe** → `docs/PROCESO_SEMANAL.md`, addendum del 22/08.
- **Lo que quedó fuera de alcance y va antes que cualquier frente del plan** → el encabezado de
  `digital/Directa IVR`: las 12 desalineadas que encontró `verificarEncabezadosDeMapeo()` **no son
  columnas corridas** — los rótulos son datos (`2450-ENEJDGAG`, `12049`, fechas), o sea que está
  leyendo la fila equivocada como encabezado. Y **las columnas J y K devuelven el mismo rótulo
  falso**, así que `ivr_audiencia` e `ivr_llamados` podrían estar leyendo la misma columna con
  números plausibles. Va en el `_20`.
