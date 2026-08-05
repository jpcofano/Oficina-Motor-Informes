# `SUMA` sobre cero filas no puede devolver cero. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-13 · **Ubicación:** `docs/Prompts/2026-08-13_suma_cero_filas.md`

> **Sexto prompt del formato nuevo: un objetivo, nada más.** La convención ya está en `CLAUDE.md`.
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit. **La documentación
> completa al final.**

---

## Antes de empezar — las dos anotaciones que arrastra el prompt anterior

Cortas, y van a `PENDIENTES_consistencia.md`, que es donde el prompt del 12/08 las pedía. Una quedó
en el handoff y la otra en "Trabado", pero **el handoff se reescribe entero cada corrida y ahí se
pierden**.

- **`3354` (San Cristóbal) y `3346` (Retiro) tienen cero filas de mail**, aunque `rdv` registra un
  inscripto por mail en cada uno. Es **inconsistencia de datos, no de motor**, y es lo que impidió
  validar la regla de convocatoria fuera de `3387`. `P2`, pregunta para el equipo.
- **`enc_e75_pct` da 38,74 contra 39% publicado.** Es el mismo número —27.599/71.234 = 38,74%— y el
  informe redondea a entero. **No es un error y no se ajusta.** Se anota para que nadie lo "arregle"
  más adelante.

---

## El objetivo

**Que un agregado sin filas diga que no hay dato, en vez de decir cero.**

Está medido en el deck: `SUMA` sobre cero filas devuelve `0` y no `sin_datos`. Las cuatro slides de
encuentro que no tienen filas de IVR —San Cristóbal y Retiro— muestran **`0`** en `enc_atendidos`,
`enc_audiencia`, `enc_marque1` y `enc_e75`, donde con `ULTIMO` salía `«FALTA»`.

**Son 16 ceros falsos.** Y son los que hicieron subir "tokens con valor" de 18 a 34: **el conteo
mejoró por un artefacto, no por datos.**

**Es el modo de falla que el proyecto viene combatiendo desde `3347`:** un número plausible y
equivocado es peor que un hueco. Un cero de audiencia se lee como *"no llamamos a nadie"*, no como
*"no hay dato"*.

`ULTIMO` no tiene el problema: sobre cero filas sigue dando `sin_datos`, y esas mismas slides
muestran `«FALTA:enc_mails_enviados»`, que es lo correcto.

---

## Parte 0 — Qué operaciones tienen el problema. Sólo lectura. Reportar y seguir.

- **0.1 · ¿Cuáles de las seis operaciones devuelven un valor sobre cero filas?** Las seis son `SUMA`
  · `CONTEO` · `ULTIMO` · `RATIO` · `PCT` · `TEXTO`. **Probar cada una contra cero filas y reportar
  qué devuelve.** `SUMA` da `0` y `ULTIMO` da `sin_datos`; las otras cuatro no están medidas.
- **0.2 · ⚠ `CONTEO` es el caso que hay que pensar, no el que hay que arreglar.** Para `CONTEO`,
  **cero puede ser la respuesta correcta**: "cuántos encuentros hubo" con cero filas es
  legítimamente cero. Para `SUMA` no: "cuánta audiencia" con cero filas es *no sé*, no *ninguna*.
  **Reportar la distinción antes de tocar nada** — si el arreglo trata a las seis igual, rompe
  `CONTEO`.
- **0.3 · ¿Cuántos marcadores usan cada operación?** El cambio toca a todos los que suman, no sólo a
  los cuatro de IVR. Listar cuáles y en qué secciones.
- **0.4 · La foto previa.** Tokens con valor y faltantes del deck actual (34 / 288, corrida
  `jm-20260805-133836`), y los once de Orden Público. **Después del arreglo, "tokens con valor" tiene
  que BAJAR**, y eso es el éxito, no una regresión.
- **0.5 · ¿Hay alguna sección donde hoy se dependa de que `SUMA` devuelva cero?** Si un porcentaje o
  un ratio divide por un `SUMA` que hoy da `0`, cambiarlo a `sin_datos` puede propagarse. Reportar
  dónde.

Reportar los cinco y **seguir**.

---

## Parte A — El arreglo

- **`SUMA` sobre cero filas devuelve `sin_datos`**, con el motivo, igual que `ULTIMO`.
- **`CONTEO` sigue devolviendo `0`**, salvo que `0.2` muestre lo contrario. **Cero encuentros es un
  dato; cero audiencia es la ausencia de uno.**
- **Las otras cuatro, según lo que mida `0.1`**, con el mismo criterio: si el cero es una respuesta
  posible del negocio, se queda; si es el resultado de no tener nada que operar, es `sin_datos`.
- **Dejar el criterio escrito en el código**, en una frase, donde se lea. Es la clase de decisión que
  alguien va a querer revertir dentro de tres meses sin saber por qué se tomó.
- **Distinguir cero filas de filas con valores vacíos.** No son lo mismo, y si hoy el código los
  mezcla, decirlo.

---

## Parte B — Medir

Generar el informe y comparar contra la foto de `0.4`.

- **Los 16 ceros falsos tienen que desaparecer** y volver a `«FALTA»`.
- **"Tokens con valor" tiene que bajar de 34 a ~18.** Es el resultado buscado: el conteo vuelve a
  medir datos y no artefactos.
- **Los once de Orden Público tienen que seguir cerrando** — esa slide sí tiene filas de IVR y no la
  toca el cambio. `78.637 · 71.234 · 27.599 · 256 · 44.043`.
- **Reportar cualquier otro marcador que haya cambiado de valor.** Es hallazgo, no daño colateral.

---

## Los límites

1. **No se edita ninguna celda de las cuatro bases.**
2. **No se edita ninguna plantilla `.pptx`.**
3. **No se toca el score de anclaje ni el desempate temporal.** Sigue siendo el objetivo B, anotado.
4. **No se filtra `digital` por ventana.** Es snapshot por diseño.
5. **No se agrega `seccion_id` a `MARCADORES`**, no se tocan los 7 `ecv_` ambiguos, ni los tres
   remitentes sueltos, ni `camp_bench_*`, ni `m2_`.
6. **No se deroga ni se reescribe una `R-NN`, `D-NN`, `S-NN` ni `C-01`.**
7. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git**.

---

## Cuándo está hecho

- **Los 16 ceros falsos volvieron a `«FALTA»`.**
- **`CONTEO` sigue devolviendo cero** donde cero es la respuesta.
- **Los once de Orden Público siguen cerrando.**
- **El criterio quedó escrito donde se lee**, no sólo en la bitácora.

---

## El reporte

1. **Las cinco mediciones de la Parte 0.** En especial `0.1`: qué devuelve cada operación sobre cero
   filas.
2. **Tokens con valor, antes y después.** Tiene que bajar.
3. **Los once de Orden Público**: siguen cerrando, sí o no.
4. **Qué otros marcadores cambiaron de valor** y por qué.
5. **Qué decisiones tomaste solo y por qué.** En especial las de `0.2`: qué operaciones dejaste
   devolviendo cero y con qué criterio.
6. **Qué premisa de este prompt resultó falsa**, si alguna.
7. **Los números que salieron raros.** Sin analizarlos.

**Recién después, la documentación completa.** Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
