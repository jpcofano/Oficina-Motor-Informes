# 2026-08-23_1 — El front: que el motor pueda declarar qué NO hizo

> **Estado:** no ejecutado · **corrida nocturna, sin usuario disponible** · **subagente:** ninguno
>
> ⭐ **Por qué esta tanda se puede hacer de noche y las anteriores no:** nada de acá mueve un
> número publicado. Todo lo que se toca es **cómo se muestra** lo que el motor ya calculó. El
> criterio de reversión de `V-110` no aplica, y ninguna parte necesita que alguien mire un deck.
>
> ⚠ **Y por eso mismo, la regla dura de esta corrida:** si en algún punto el trabajo pide tocar
> `Marcadores.gs`, `MARCADORES`, `MAPEO`, `SOLAPAS` o cualquier cosa que cambie un valor,
> **anotarlo y saltear la parte**. No hay nadie para verificar un número esta noche.

---

## El problema, en una línea

**Los tres P1 abiertos son la misma cosa: el motor no sabe declarar qué NO hizo.**

`FALTANTES` no tiene lector fuera del editor y se pisa entera en cada corrida. El aviso de crudos
no distingue *"nadie lo cableó"* de *"se cableó y el escritor no lo pisó"*. Y `sinLink` no deja
rastro, así que no se distingue *"no corrió"* de *"corrió y nadie cayó bajo el umbral"*.

⭐ **Y hoy 23/08 los tres se cobraron en la misma jornada:** `X-40` se diagnosticó copiando
`FALTANTES` a mano antes de que la próxima corrida la pisara; `camp_remitente` y `camp_titulo`
salieron *"quedó crudo sin corte por tiempo"* teniendo fila los dos, y el aviso no dijo por qué; y
medio día se fue persiguiendo un `/////` que era un deck viejo, porque el símbolo no dice de qué
corrida es.

---

## Parte A — leer el estado. Sólo lectura. **Reportar y seguir** · Sonnet · effort alto

⚠ **Bifurcación, no freno:** esto corre de noche, así que la Parte A **no para** salvo que
encuentre algo que invalide el plan. Reportar y continuar.

1. **`Panel.html` y `PanelBackend.gs`** — las trece `panel_*` que existen, qué devuelve cada una, y
   cómo está armada la página hoy: secciones, estilos, si hay hoja de estilo propia o todo inline.
2. **`escribirFaltantes_` y `D-12`** — la forma exacta de la hoja `FALTANTES`: columnas, cuándo se
   escribe, y en qué punto de la corrida se pisa.
3. **Los símbolos**: `textoFaltante_` y quién decide cada uno. Al 23/08 se conocen `/////`, `---`,
   `-` y el valor entre guiones; **confirmar que son cuatro y no más**.
4. **`ANCLAJE_PENDIENTE` y `sinLink`** — dónde se decide que un encuentro no ancla, y qué se
   escribe hoy cuando eso pasa.
5. **El `_19`** — el prompt del desatendido al panel, que está escrito y sin correr. Leerlo y decir
   si esta tanda lo supersede, lo complementa o lo contradice.

---

## Parte B — `FALTANTES` con lector · **Opus** · effort alto

**Es el instrumento del cierre de fase (`D-38`)**, no una mejora: el criterio es que el usuario
mire un deck y declare que los faltantes que quedan no son relevantes. Hoy esa declaración se
haría de memoria.

**Lo que tiene que resolver, en orden de importancia:**

1. **Que se lea sin abrir el editor de planillas.** Una vista en el panel, agrupada por lámina y
   por causa.
2. ⚠ **Que no se pierda.** Hoy se pisa entera en cada corrida. Como mínimo, que la vista pueda
   mostrar la corrida anterior; idealmente que `FALTANTES` deje de pisarse y se acumule por
   `corrida_id`. **Si acumular obliga a cambiar `escribirFaltantes_`, medí primero cuántas filas
   genera una corrida** —hoy son del orden de 190— y decidí con ese número a la vista.
3. **Que la fila diga de qué corrida es.** La columna ya existe; que se vea.

⭐ **Y el agrupamiento por causa es lo que la vuelve útil**, porque cada causa manda a un trabajo
distinto:

| causa | a qué manda |
|---|---|
| sin fila en `MARCADORES` | cablear |
| falló al resolver | mirar la traza |
| sin datos | mirar la fuente o la ventana |
| fuera de alcance | nada — no es un faltante |
| texto del equipo | nada — no lo escribe el motor |

⚠ **Las dos últimas hoy se cuentan como faltantes y no lo son.** El tablero ya las distingue; la
vista tiene que hacerlo también, o el conteo va a mentir en el momento exacto en que se usa para
declarar el cierre.

---

## Parte C — el aviso de crudos, con causa · **Opus** · effort alto

Hoy *"nadie lo cableó"* y *"se cableó y el escritor no lo pisó"* caen en el mismo texto.

**El caso real de hoy, para probar contra él:** `camp_remitente` y `camp_titulo` salieron
*"quedó crudo en el deck sin que hubiera corte por tiempo — revisar"*, **y los dos tenían fila**.
El aviso era correcto para los dos y seguía sin decir por qué.

**Tres estados distintos y un texto para cada uno:**

- **no tiene fila** → cablear
- **tiene fila y resolvió, pero el escritor no lo pisó** → ⚠ es un bug del escritor y hoy es
  invisible
- **tiene fila y falló al resolver** → mirar la traza

⭐ **El del medio es el que no existe hoy y es el que importa**, porque un token que resuelve y no
se escribe **no aparece en `FALTANTES`** —resolvió— **ni se distingue en el deck**. Es el único de
los tres modos de falla que no deja rastro en ningún lado.

---

## Parte D — `sinLink` visible · **Opus** · effort alto

*"Un instrumento que no declara cuánto midió contamina toda conclusión que se apoye en él."*

**Lo mínimo:** que cada corrida deje escrito **cuántos encuentros se intentaron anclar, cuántos
ancló y cuántos no**, y que los que no ancló queden nombrados. Hoy leer `ANCLAJE_PENDIENTE` vacío
no distingue *"no corrió"* de *"corrió y nadie cayó bajo el umbral"*.

⚠ **Y con lo de hoy hay un motivo nuevo para que el nombre viaje limpio:** el sufijo `@ítem` de
`FALTANTES` fue la herramienta con la que se diagnosticó `X-40` — se vio qué tokens lo tenían y
cuáles no. `enc_alcance_pct @: Salud` muestra el nombre con el separador crudo. **Un nombre mal
parseado degrada el instrumento con el que se diagnostica todo lo demás.**

⚠ **No arregles el parseo esta noche** — cambia la clave de anclajes ya tomados y eso necesita a
alguien mirando. Pero que la vista **muestre el nombre tal cual llega**, sin limpiarlo: si está
sucio, hay que verlo.

---

## Parte E — el diseño · **Opus** · effort alto

**Leer `/mnt/skills/public/frontend-design/SKILL.md` antes de tocar una línea de estilo.**

**Quién lo usa y para qué**, que es lo que debería mandar sobre cualquier decisión estética: una
persona que acaba de generar un deck y necesita saber, en diez segundos, **si puede publicarlo**.
No es un dashboard de monitoreo ni una herramienta de análisis.

**Tres reglas que salen de eso:**

1. **Lo que frena la publicación va arriba y se ve sin hacer scroll.** Un número viejo publicado
   sin marca es peor que un `/////`, así que lo que hay que destacar no es la cantidad de
   faltantes: es **si algo salió mal en silencio**.
2. **Los cuatro símbolos necesitan leyenda en la interfaz.** Hasta hoy la premisa escrita era que
   el deck sólo lo miraba el desarrollador, y eso está por dejar de ser cierto —hay un deploy
   pendiente para que entre otra persona—. Un símbolo que no se explica es un número que alguien
   va a interpretar mal.
3. ⚠ **Sin `localStorage` ni `sessionStorage`.** Y sin dependencias nuevas que no estén ya en el
   proyecto: esto corre en Apps Script, no en un bundler.

**Y una restricción de forma:** el panel ya existe y tiene trece funciones vivas. **Esto es una
sección nueva y un pase de estilo, no un rediseño.** Si el pase de estilo obliga a tocar la lógica
de una `panel_*` existente, **anotalo y no lo hagas**.

---

## Orden de sacrificabilidad — importa, porque nadie va a estar mirando

`A` → `B` es lo mínimo que justifica la noche. `B` sola ya cierra el P1 que bloquea `D-38`.

`C` y `D` en ese orden. `E` es la única que puede caer entera sin costo.

⚠ **Si algo se rompe, parar y dejarlo escrito. No improvisar a las tres de la mañana con nadie
para preguntar.** Un `HANDOFF` con "llegué hasta acá y esto es lo que no cerró" vale más que una
parte terminada a medias que haya que auditar mañana.

---

## Lo que NO se toca esta noche

- Ningún número publicado ni publicable.
- `X-41` — el universo ancho de las láminas fijas. Está marcado y espera mecanismo.
- El parseo del nombre del ítem (P2).
- `L-036`, los 32 `post_` — es cableado y necesita verificación contra deck.
- La frecuencia, `X-32`, `X-19`.

## Commits

Uno por parte. Sin `Co-Authored-By`.

**Y al final: un `HANDOFF` corto** con qué quedó hecho, qué no, y qué necesita una corrida de `jm`
para verificarse. Es lo primero que se va a leer mañana.
