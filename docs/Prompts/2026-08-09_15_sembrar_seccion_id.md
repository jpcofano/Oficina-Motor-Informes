# 15 · Sembrar `LAMINAS.seccion_id` desde lo que ya está documentado

> **Modelo: Opus, effort alto.** No bajar a Sonnet.
>
> **Un objetivo:** que las 51 filas de `LAMINAS` tengan `seccion_id` sin que nadie tipee 26
> celdas. **El mapeo ya existe** — está en `SECCIONES`, en la plantilla y en los docs. Esto lo
> deriva y lo siembra; no lo inventa.
>
> **Escribe una sola columna: `LAMINAS.seccion_id`.** Nada más.

---

## 1 · Por qué no es opcional

`LAMINAS` sin `seccion_id` bloquea tres cosas que ya están decididas:

- **La herencia de asignación del `11.2`** — *«la sección declara, la lámina se aparta»*. Sin
  `seccion_id`, una lámina no sabe de qué heredar.
- **La pantalla 4 del panel**, que es estado por lámina y necesita agruparlas.
- **`LAMINAS.cobertura`** por sección, que es como se va a leer el avance.

Y sembrarlo mal es peor que dejarlo vacío: una fila con `seccion_id` equivocado no se nota, se
hereda.

---

## 2 · Parte 0 — medir las tres vías, reportar y parar

**No escribir una sola celda hasta reportar esto.** Hay tres derivaciones candidatas y **ninguna
cubre las 51 sola**. Medir las tres por separado y decir qué cubre cada una.

**0.1 · Por `familia_tokens`.** `SECCIONES.familia_tokens` tiene prefijos (`emin_`, `m2_`,
`camp_`…). Para cada lámina, listar los prefijos de token que aparecen en ella y cruzar.

Reportar: cuántas láminas resuelven a **exactamente una** sección, cuántas a ninguna, cuántas a
más de una. **La ambigüedad es esperable y es el dato**: la lámina de Resumen Ejecutivo tiene
`mail_`, `imp_`, `cc_`, `ivr_` y `pauta_` a la vez. Y `familia_tokens` está vacío en varias filas
de `SECCIONES` — confirmar en cuáles y si el patrón es que sólo las `repetible`/`agregado` lo
tienen.

**0.2 · Por nombre.** `SECCIONES.nombre` contra el título de la lámina. Reportar cuántas
matchean exacto, cuántas por normalización razonable, cuántas no.

**0.3 · Por orden.** `SECCIONES` en su orden contra `LAMINAS.orden_plantilla`, sabiendo que **una
sección puede ocupar más de una lámina de plantilla** —el bloque de encuentro son dos— y que la
expansión de las `repetible` **no ocurre en la plantilla**, sólo en el deck generado. Por eso
`jm` tiene 22 láminas y su deck del 31/07 tiene 30.

Reportar si el recorrido en orden cierra sin sobrantes en cada plantilla.

**0.4 · Y el cruce de las tres.** La tabla que importa: **para cada una de las 51 láminas, qué
dice cada vía y si las tres coinciden.** Tres columnas y una de acuerdo.

**Reportar y parar.** No sembrar nada todavía.

---

## 3 · Parte A — sembrar sólo lo que las vías acuerdan

**Regla, y es la que gobierna el prompt: se siembra donde al menos dos vías coinciden y ninguna
contradice. Todo lo demás queda vacío y se lista.**

- **Acuerdo de dos o tres** → se siembra, con la vía en `notas`.
- **Una sola vía resuelve, las otras no dicen nada** → **no se siembra.** Se lista.
- **Dos vías se contradicen** → **no se siembra.** Se lista **primero**, porque una contradicción
  entre dos fuentes documentadas es un hallazgo sobre los documentos, no sobre la lámina.

**El resultado esperado no es 51 de 51.** Es "N sembradas y las otras listadas con por qué". Un
sembrador que llena todo es un sembrador que adivinó.

**Idempotente:** una celda con valor no se pisa. Si una fila ya tiene `seccion_id` distinto del
derivado, **no se toca y se reporta como divergencia** — el trabajo humano gana sobre la
derivación.

---

## 4 · Cómo se verifica

- **Las secciones `agregado` y `repetible` con `familia_tokens` poblado tienen que resolver por
  las tres vías.** Son el caso fácil; si alguna de esas falla, la derivación está mal y no se
  siembra nada.
- **Ninguna lámina puede quedar con un `seccion_id` que no exista en `SECCIONES`.**
- **`verificarLaminas()` sigue en verde después.** El sembrador toca una columna y no puede mover
  ids, orden ni conteo.

**Si falla:** si una lámina queda con la sección equivocada, se vacía la celda — no se corrige a
mano en la hoja sin corregir también la vía que la produjo. Una corrección manual sobre una
derivación mala deja la derivación mala.

---

## 5 · Lo que este prompt no autoriza

- **No escribir `#seccion:` en ninguna nota.** No existe como campo del ancla desde el
  `Addendum 2` de `C-01`.
- No tocar `SECCIONES`, `MARCADORES` ni las plantillas.
- No escribir ninguna otra columna de `LAMINAS`.
- **No agregar `LAMINAS.informes`.** La herencia del `11.2` se declara; la columna no se crea
  hasta que tenga consumidor.

**Un commit**, con su renglón en `CLAUDE.md` y el conteo de sembradas contra listadas.
