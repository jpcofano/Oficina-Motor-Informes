# Addendum — `2026-08-18_reintento_relanza_corrida.md`

**Por qué.** La Parte 0 dejó una contradicción que hay que cerrar antes de la
Parte A, y que además toca la Parte C.

---

## La contradicción

`0.1` reporta que la respuesta fue **JSON con una excepción**, no HTML. Pero el
loop de `tools/api.js` corta así:

```
if (!esHtml && !cuerpoPerdido) break;
```

Un JSON con excepción **no es** `esHtml`, y sólo cuenta como `cuerpoPerdido` si su
`traza` contiene `accion: (vacía)`. Con esa respuesta, el reintento **no dispara**.

Y sin embargo hay dos filas. Entonces una de estas dos es verdad, y no las dos:

- **A** · La primera respuesta sí fue HTML, disparó el reintento, y lo que `0.1`
  midió es la respuesta **del reintento** —la segunda corrida, la que murió rápido
  en `abrirCorrida_` por contención—. La premisa del prompt se sostiene.
- **B** · No hubo reintento, y la segunda corrida la lanzó **otra cosa**. Entonces
  el hallazgo "el reintento relanza la generación entera" es falso, y la Parte A
  arreglaría algo que no es la causa.

**No elegir la Parte A hasta saber cuál.**

---

## Parte 0-bis — quién lanzó la segunda corrida (sólo lectura, reportar y parar)

`0.6` · **La línea de stderr.** Si el reintento disparó, el cliente imprimió
`Transporte: la respuesta vino en HTML (HTTP …) — reintento 1/2`. Buscarla en el
log de esa invocación. **Está o no está, y eso decide entre A y B.** Si el log no
se guardó, decirlo: entonces hay que reproducirlo, no deducirlo.

`0.7` · **La respuesta que se midió, cuál fue.** Si el cliente reintentó, `0.1`
midió la última respuesta, no la primera. Reportar si lo que se leyó fue la
respuesta final del cliente o la primera del transporte.

**Reportar `0.6`–`0.7` y parar.**

---

## Lo que esto le hace al resto

**Los 324 s ya no prueban el límite de 6 minutos.** Corregiste bien que `232018`
murió por contención de Sheets, no por los 6 minutos. Pero entonces `231421`
tampoco está probado: la segunda corrida arrancó unos treinta segundos después de
que la primera entrara en la etapa 4, sobre la misma planilla. Puede haberla
volteado. **Dos corridas concurrentes y una causa de muerte atribuida al reloj es
justo el error que este proyecto viene cazando.** No repetir el número como causa
hasta que haya una corrida sola.

**`abrirCorrida_` y `marcarEtapa_` son parte de la escena.** Tenés razón: la
instrumentación agrega una escritura al abrir y cinco `flush()` sobre la misma
planilla que está en disputa. Medirlo puede estar empeorándolo. **No sacarla
todavía** —es lo único que hace visible la muerte—, pero anotarlo, y considerarlo
cuando haya una sola corrida por invocación.

**La Parte C se posterga, menos `C.1`.** Los 22 decks son hoy la única evidencia
física de cuántas corridas se lanzaron de verdad. Mientras la contradicción esté
abierta, **no se borra ninguno**. El inventario sí se hace ahora: es lo que
permite borrar después sin perder el dato, y además es insumo de `0.6` —si los
decks son tres por invocación y no dos, eso solo ya dice algo.

---

## Parte C.1 — el inventario, en esta misma corrida

Sólo escribe en el repo. **No borra nada en Drive.**

`C.1.a` · **El lado de los decks.** Listar la carpeta de salidas: id, nombre,
fecha y hora de creación. Ordenado por fecha.

`C.1.b` · **El lado de `CORRIDAS`.** `0.3` dice que `CORRIDAS` no está en
`API_LECTORES_`, así que puede que no se pueda leer desde el cliente. Dos caminos,
y **reportar cuál tomaste**:
  - Si agregar la entrada a `API_LECTORES_` alcanza —es sólo lectura y es una
    línea en esa tabla—, agregarla y leer. Queda hecha para la salida "por
    testigo" de la Parte A.
  - Si no alcanza, entregar el inventario con la columna de correspondencia
    vacía y decir qué falta. **Un inventario incompleto sirve; uno inventado, no.**

`C.1.c` · **La tabla, a `BITACORA.md`.** Una fila por deck: nombre, fecha,
`corrida_id` correspondiente o `(sin fila)`. Commit.

`C.1.d` · **Los agrupamientos.** Cuántos decks caen dentro de la misma ventana de
minutos —los que serían de una sola invocación—. Sin interpretarlos: el número,
nada más.

---

## Sobre la Parte A, para cuando toque

`0.2` descartó la salida por tiempo, como el prompt preveía.

`0.3` dice que `CORRIDAS` no está en `API_LECTORES_`. Eso es una entrada en esa
tabla; no hay motor nuevo.

La tercera salida —**no reintentar las acciones que escriben**— tiene una
propiedad que las otras no: **funciona en el escenario A y es inofensiva en el
B**. Si el reintento es el culpable, lo corta; si no lo es, no rompe nada y deja
el problema donde estaba, a la vista. Es la única que no depende de resolver la
contradicción primero.

No la elijo yo. Queda dicho para cuando `0.6` cierre.

---

## El reporte

1. `0.6` y `0.7`: la línea de stderr está o no está, y cuál respuesta se midió.
2. Si quedó A o B, o si no se pudo cerrar y hay que reproducirlo.
3. El inventario `C.1`, y por qué camino resolviste `C.1.b`.
4. Qué decisiones tomaste solo.
5. Qué premisa de este addendum resultó falsa, si alguna.
6. Los números raros, sin analizarlos.

**No se borra ningún deck en esta corrida. No se elige la Parte A.**

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
