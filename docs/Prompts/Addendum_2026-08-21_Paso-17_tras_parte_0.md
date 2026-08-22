# Addendum · 2026-08-21 · Paso `2026-08-21_17` — después de la Parte 0

**Fecha del addendum:** 2026-08-21, con la Parte 0 ya corrida.
**Addendum a:** `docs/Prompts/2026-08-21_17_ordenar_plan.md` — **que no se edita.**

La Parte 0 pasó y nada hace parar. Las Partes A y B siguen como están, **con estos cinco
agregados**. Cuatro salieron de lo que la Parte 0 encontró y el prompt no anticipaba.

---

## 1 · El frente 9 se mide antes de clasificar · **afecta la Parte A**

La Parte 0 lo mandó a *"no se puede decidir desde el documento"*, y eso está bien: desde
`PLAN.md` no se sabe si `R-26` quedó escrita o quedó como hueco.

**Pero sí se puede decidir yendo al dueño.** `REGLAS_NEGOCIO.md` es el dueño de *"¿qué dice una
regla del dominio?"* (`CLAUDE.md` §7), y ahí están las dos cosas: la sección `R-26` escrita y la
nota que dice que estaba reservada. **Leer las dos, con sus fechas, y decidir cuál manda por el
desempate de §7** —gana la fecha escrita más reciente, nunca la de commit—. Si aun así empatan o
la nota es posterior y no la deroga, entonces sí: queda en la tercera categoría y **se reporta
como pregunta al usuario**, no se clasifica por inferencia.

---

## 2 · Un prompt sin ejecutar que el `_17` no conocía · **afecta la Parte A**

`2026-08-19_1.1_addendum_gate_y_autorizacion` está en `docs/Prompts/`, sin ejecutar, y **no está
en el plan**. Entra a `PLAN.md` como ítem, con la prueba de la frontera aplicada: si se puede
decir qué lo destraba, va a §2 o §3; **si no, a Backlog** — como el `_12`.

Leerlo antes de ubicarlo. Un prompt sin correr que no está en el plan no lo encuentra nadie, y
eso ya es dos veces.

---

## 3 · Doce prompts con commit y sin bitácora · **parte nueva**

**Parte C · Sonnet.** La Parte 0 midió, sin que se lo pidieran, que **12 prompts tienen commit y
ninguna entrada de `BITACORA.md`** —cinco de los últimos tres días— y que hay **89 archivos sin
designador** que no ubican ni bitácora ni commit, casi todos de agosto temprano.

Escribirlo en `docs/PENDIENTES_consistencia.md` como hallazgo fechado, con las dos cifras
separadas: son dos problemas de distinto tamaño y distinta urgencia.

⚠ **Y el límite, explícito:** esto **anota**, no arregla. No se escriben las 12 entradas de
bitácora faltantes ni se censan los 89 — `BITACORA.md` es append-only y tuya, y rellenar
retroactivamente entradas que nadie escribió en su momento es inventar historia. Lo que hace
falta primero es decidir qué se hace, y eso es del usuario.

**Lo que sí importa decir en el hallazgo:** el cruce válido para saber si un prompt corrió es
**el designador contra los encabezados de `BITACORA.md`**, no el nombre de archivo — está en
`CLAUDE.md` §3 y la Parte 0 lo confirmó cobrando 113 falsos positivos al intentarlo por nombre.
Si 12 pasos no tienen entrada, **ese cruce está perdiendo cobertura** y es el único que hay.

---

## 4 · La trampa del censo, escrita donde se va a leer · **parte nueva**

**Parte D · Sonnet.** `node tools/escritores.js` **emite sólo la matriz**. Redirigirlo sobre
`docs/ESCRITORES.md` borró 334 líneas de prosa escrita a mano; se revirtió con `git checkout` y
se reemplazó sólo la ficha.

Eso es un aprendizaje de proceso, no un pendiente: va a **`CLAUDE.md` §4**, que es donde §7 pone
las convenciones *"justo antes de que alguien repita el error"*. Una línea, con la forma correcta
de aplicarlo —regenerar y reemplazar la sección, no el archivo— y el costo que tuvo.

Vale para los otros generadores de `tools/` que escriben sobre un `.md` con prosa. **Verificar
cuáles antes de generalizar**: si sólo aplica a `escritores.js`, decirlo de ese uno.

---

## 5 · Lo que sigue fuera de alcance

- **Los tres huecos de prompt (`_7`, `_13`, `_14`).** La Parte 0 los reportó: ni archivo ni
  bitácora, sólo commits. **No se reconstruyen y no se les inventa puntero acá** — qué hacer con
  el `_7` es una decisión del usuario, pendiente.
- **Reordenar por criterio propio.** Sigue valiendo: donde el orden entre dos ítems no salga de
  una dependencia escrita, se deja como está y se reporta.
