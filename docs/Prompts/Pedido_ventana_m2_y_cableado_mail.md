# Pedido (v2) — La ventana de los `m2_*`, el cableado de `digital` y `MAPEO`

**Estado:** vivo · **Fecha:** 2026-08-03 · **Ubicación:** `docs/Prompts/Pedido_ventana_m2_y_cableado_mail.md`

> **Reemplaza a la v1 del mismo nombre**, que no llegó a ejecutarse. Sobrescribir el archivo,
> no crear uno nuevo. Lo que cambia: se agrega la **Parte D**, el cableado de `MARCADORES`
> contra `digital`, que la v1 dejaba para después.
>
> **Documentación y configuración, no código.** Nada de esto toca un `.gs`. Va suelto, como
> `D-21`, porque es cableado y regla de negocio.
>
> **De dónde sale:** decisiones del usuario del 03/08/2026.

---

## Parte 0 — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

**0.1 · `digital/Directa Mail` y su espejo.** `SOLAPAS` registra `m2/Directa mail` como
`derivada`, con la nota "espejo de `digital/Directa Mail`". El usuario decidió cablear contra
la **original**. Confirmar que `digital/Directa Mail` sigue `uso = fuente` y que
`m2/Directa mail` sigue `derivada`. **No reclasificar ninguna.**

**0.2 · La columna F.** `MAPEO` la tiene como `digital/Directa Mail/mail_fecha` → `F`. El
contrato de fecha es `fecha_periodo` (`S-02`) y `leerFuente` sólo busca ese `campo_logico`.
Confirmar que hoy no existe `digital/Directa Mail/fecha_periodo`.

**0.3 · El año tipeado.** `R-03` marcó `rango_plausible = no` en esa columna por un año
`20206`. El usuario dice que ya lo corrigieron en la base. Verificar contra la base viva
cuántas filas tienen fecha fuera de rango plausible hoy. Reportar el número.

**0.4 · El filtro de estado.** `MAPEO` tiene `digital/Directa Mail/mail_estado` → `D` con
`valores_incluidos = "Implementado, En curso"`. Confirmarlo y reportar cuántas filas excluye
hoy, con desglose por valor.

**0.5 · `digital` es `snapshot`.** Por decisión del `Paso-2.3`: el recorte por período lo
hace el agregador vía link campaña↔encuentro, no por ventana de fecha cruda. Confirmar que
sigue así. **No cambiarlo.**

**0.6 · El inventario de `MAPEO` para `digital`.** Listar, **desde la hoja viva y no desde el
seed**, todos los `campo_logico` mapeados por solapa `uso = fuente` de `digital`, con su
columna. Es la base de la Parte D, y el seed está desactualizado respecto de las filas que
agregaron los pasos `2.3`/`2.4`.

**Reportar 0.1–0.6 y PARAR.**

---

## Parte A — La regla de la ventana, en `REGLAS_NEGOCIO.md`

Una `R-NN` nueva —el número lo asigna el archivo— con este contenido:

- **La ventana de los `m2_*` es la de `R-11`: siete días, viernes a jueves, extremos
  inclusive.** No lleva `periodo_ref` propio: cae al eslabón 4 (`CONFIG`) o al 5.
- **El equipo hoy trabaja de viernes a viernes**, ocho días. Es una diferencia conocida y
  deliberada: el usuario decidió el 03/08/2026 que el motor use siete. **Los números del
  motor van a diferir de los publicados** por las filas del viernes de cierre. Cuando la
  diferencia aparezca, **no es un bug** — está escrito antes de que pase.
- **El default es todo lo que tenga `Implementado` o `En curso` en la ventana**, y el equipo
  saca o pone lo que necesite (`R-11` Addendum 1 punto 2).

Referenciar `R-11` y `D-21`, no repetirlos.

---

## Parte B — La fila que falta en `MAPEO`

Agregar `digital/Directa Mail/fecha_periodo` → columna `F`, con nota que diga que es la
misma columna que `mail_fecha` y que el contrato vivo es `fecha_periodo` (`S-02`).

**Va al seed, no sólo a la hoja** — `upsertPorClave_` reescribe la fila entera desde el seed
y una celda cargada sola se borra en la corrida siguiente. Misma trampa que
`INFORMES.plantilla_id`.

**No cambia ningún número hoy:** mientras `digital` sea `snapshot`, `leerFuente` devuelve
antes de mirar la fecha. Se carga igual, porque la columna elegida es una decisión y sin la
fila no queda registrada en ningún lado.

---

## Parte D — Cablear `MARCADORES` contra `digital`

Decisión del usuario, 03/08/2026: **se cablea ahora**, aunque todavía no devuelva números.

**Qué va a pasar, y es lo esperado:** cada fila va a fallar con
`«FALTA:<token>@digital_sin_cuenta»`. `digital` se lee por `filasDigitalDeEncuentro()`, que
necesita el `id_cuenta` del ítem que se emite, y el despachador lo recibe recién en el
Paso 5. El cableado queda correcto y listo; el número llega después.

**Cómo armar las filas.** Derivarlas del inventario de `0.6` cruzado con el diccionario
canónico de `docs/TOKENS.md` §1. **No inventar nombres de marcador.** Para cada
`campo_logico` de `digital` que tenga token canónico:

- `marcador` = el token canónico de `TOKENS.md`, no el `campo_logico`;
- `base_id = digital`, `solapa` = la solapa real — `digital` tiene seis `fuente`, así que no
  hay inferencia y la solapa nunca va vacía;
- `operacion` = la que corresponda. Los `*_pct`, `*_or`, `*_ctr`, `*_ctor` **ya vienen
  calculados en la base**: son `ULTIMO` o `SUMA` según cómo estén cargados, **no** `PCT`
  recalculado. Los que queden en duda se reportan, no se deciden solos;
- `informe_id = jm`.

**Los que no tengan token canónico no se cablean:** se listan en el reporte. Casos conocidos
sin familia declarada: los `camp1..camp4` de la slide 7 de JM (no tienen guión bajo) y los
`post_*` de SECCO.

**Reportar el total de filas cargadas y las que quedaron afuera, con el motivo de cada
grupo.**

---

## Parte E — Los pendientes que esto abre

En `docs/PENDIENTES_consistencia.md`:

- **`P1` · `digital` no devuelve número hasta el Paso 5** — falta el `id_cuenta` del ítem. El
  cableado ya está hecho (Parte D): lo que falta es el iterador.
- **`P1` · La fecha de generación del informe no tiene con qué salir.** Ninguna de las seis
  operaciones produce "ahora": `TEXTO` lee un literal, no construye. Misma forma que el `P1`
  de la operación de lista. Y antes que eso, el token tiene que existir en la plantilla, que
  es del equipo (`C-01`).
- **`P2` · `m2/Directa mail` quedó sin usarse.** Espejo de la solapa que sí se usa; si se
  lee, hay doble conteo, como `digital/RDV`. Sigue `derivada` a propósito.

---

## Qué NO hacer

- No cambiar `modo_periodo` de `digital`.
- No reclasificar `m2/Directa mail`.
- No inventar nombres de marcador: salen de `TOKENS.md` §1.
- No tocar las filas `prueba_*` del corte vertical.
- No inventar el número de la `R-NN`: usar el siguiente libre.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.

---

## Addendum — 03/08/2026

> **`0.2` vencida y `Parte B` sin objeto.** La fila `digital/Directa Mail/fecha_periodo → F`
> **ya existía**: la promovió el `Paso-2.3.1`/`2.3.2` y la bitácora del `2.16` lo decía. El
> pedido la mandaba a agregar. La verificación de premisas hizo lo suyo y frenó antes de la
> primera edición.
>
> **Lo que la reemplaza:** derogar `mail_fecha`, la fila vieja sobre la misma columna y sin
> consumidor. Decisión del usuario, 03/08/2026. Dos filas apuntando a la misma columna es la
> ambigüedad que ya mordió con `SECCIONES.periodo_id` / `periodo_ref`.
