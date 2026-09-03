# `2026-09-03_1` — ¿El «Programmatic» del tablero es sólo DV360?

**Parte 0 — sólo lectura. Termina en reportar y parar.**

**Modelo: Sonnet. Effort: normal.** Es medir y reportar; no hay nada que elegir acá.

---

## Por qué existe este prompt

`R-24` define `programmatic` **por resta** — todo lo que no es `Meta` ni `Google ads` — y no por
lista. Está escrito en `docs/REGLAS_NEGOCIO.md`, medido en `docs/CONFIG_INFORMES.md` §1.17 y
cableado en el resolutor de `DIMENSIONES_` de `Fuentes.gs`.

Se propone la hipótesis contraria: **que el rótulo «Programmatic» del deck / tablero del equipo sea
sólo `DV360`**.

⚠ **Lo que §1.17 midió es qué hace el motor, no qué hace el equipo.** Que
`DV360 + Mercado Libre = camp_prog_impresiones` confirma que la resta funciona; **no** dice que el
equipo agrupe igual. Así que la hipótesis **no está refutada** — está sin medir.

⛔ **Parte 0 no cambia la definición.** No tocar `Fuentes.gs`, no escribir en `MARCADORES`, no
derogar `R-24`, no correr el motor para publicar. Si algo de lo pedido no se puede medir sin correr
el motor, **decirlo y no aproximar**.

---

## 0.1 · Censo de etiquetas físicas de plataforma

Sobre la **base viva**, para las dos solapas que declaran la dimensión `plataforma`:

- `looker | DIGITAL`
- `digital | CAMPAÑAS_DESGLOCE_DIGITAL`

Listar **todos** los valores distintos de la columna de plataforma, con **cantidad de filas** y
**suma de impresiones**, sin filtrar por ventana ni por ámbito.

Reportar, para cada libro: **fecha y hora de la lectura** y el **`modifiedTime`** de la planilla.

⚠ El comentario del resolutor en `Fuentes.gs` trae un censo del fixture del 20/08
(`Meta 1840 · DV360 1678 · Google ads 1417 · TikTok 55 · Mercado Libre 27 · Twitter 12 · Twitch 5 ·
Uber 5`). **Es un testigo con fecha, no el estado de hoy: re-medirlo, no copiarlo.** Si el censo de
hoy trae una etiqueta que ese comentario no tiene, decirlo aparte.

## 0.2 · Cuánto pesa lo que no es DV360

Repetir el censo **acotado a las dos ventanas testigo** — `2026_agosto_21_27` y
`2026_agosto_21_28` — y a los **dos ámbitos** (`jm`, `gcba`), usando **exactamente el mismo corte
que usan hoy** `imp_prog` y `gcba_imp_prog`: mismo `filtro`, misma resolución de `ambito`, misma
solapa. No inventar un corte propio.

Para cada combinación (ventana × ámbito), una fila con:

| programmatic por resta | sólo DV360 | delta absoluto | delta % | filas no-DV360 y su etiqueta |

## 0.3 · Contra el tablero

`docs/MEDICION_mudanza_imp_2026-08-31.md` §1 registra las cifras del tablero para
`2026_agosto_21_28`: **JM Programmatic 6.907.699**, **GCBA Programmatic 61.398.036**, con Meta y
Google al lado.

Armar una sola tabla con el **% motor / tablero** para cada plataforma, y para `programmatic` **las
dos definiciones en columnas distintas**. Meta y Google no se tocan: van para poder leer si el
desvío sigue siendo uniforme.

⛔ **No concluir.** Sólo la tabla.

## 0.4 · Alcance que tendría el cambio, si se hiciera

Listar desde `MARCADORES` **viva** todas las filas cuyo `dimensiones` contenga
`plataforma=programmatic`: `marcador`, `informe_id`, `base_id`, `solapa`, `operacion`, `formato`.

Para cada una, **en qué lámina vive**. Si hay un inventario de tokens por lámina que lo resuelva,
usarlo y decir cuál; si no lo hay, decir que no se puede sin correr y **no estimarlo**.

Cerrar con: cuántos marcadores son, cuántas láminas tocan, y cuántos de ésos están hoy en
`_revisar`.

## 0.5 · Testigos que hablan de la definición

Listar **todos** los lugares donde hoy está escrita la definición por resta: la regla, la sección de
configuración, los comentarios en `.gs`, los mensajes de log, los bancos de `tools/` y los casos de
`docs/casos_validacion_*.csv` que dependan de ella.

Sólo la lista, con archivo y una línea de qué afirma cada uno. Es el insumo para que, si algún día
la definición cambia, ninguno quede vencido.

---

**Reportar y parar.** Ninguna Parte B sale de este prompt hasta que el usuario lea 0.2 y 0.3.
