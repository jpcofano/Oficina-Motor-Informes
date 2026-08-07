# `comunicaciones_post` — la lámina existe, y la regla de selección la dio el usuario

**Un objetivo.** Documentación. **No se toca código y no se cablea ningún token.**

**Qué cambia.** El `P2` de `PENDIENTES_consistencia.md` pregunta *"si la sección
`comunicaciones_post` sobra en `SECCIONES` para `jm`, o si a la plantilla le falta la
lámina"*. **Respuesta del usuario (06/08): la lámina existe** —"Digital | Comunicaciones
post", una tabla— y **lo que le falta son los tokens**. La sección no sobra.

Y con eso viene la regla de selección, que hasta hoy no estaba escrita en ningún lado:

> **Entra toda campaña cuyo rango de fechas se solape con la ventana del informe** — alguno
> de sus días entre inicio y fin cae dentro de la semana. **No** es "empieza en la ventana"
> ni "termina en la ventana". La fuente es `Seguimiento digital`.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **La regla puede estar escrita ya, con otro nombre.** Greppear `REGLAS_NEGOCIO.md` y
`SUPUESTOS.md` por una regla de **solape de rango contra ventana** — `CAMPANAS` tiene `desde`
y `hasta`, y `D-09` nombra el caso mixto. Si ya existe, **esta regla no nace: se cita**. Si no
existe, greppear el prefijo `R-` en todo el repo y decir **cuál es el próximo número libre**
(`PLAN.md` §1). **No asignarlo todavía.**

`0.2` · **La fuente, sin adivinar.** "Seguimiento digital" es dos cosas a la vez: el nombre de
la base `digital` y una **solapa** de esa base declarada `uso = fuente`. Reportar cuál de las
dos tiene columnas de campaña, estado y rango de fechas, y si `MAPEO` ya las tiene mapeadas.

`0.3` · **Qué número de lámina es.** El usuario la llamó la 7; `TOKENS.md` la tiene como la
**10** y `PENDIENTES` también. Reportar contra qué se numera cada una —plantilla o deck
generado— y **no cambiar ninguna** hasta saberlo.

`0.4` · **La tabla tiene más columnas y más filas que los tokens documentados.** Lo documentado
es `post_camp1-3` y `post_estado1-3`: dos atributos, tres filas. La lámina real tiene
**campaña, estado, período, alcance, impresiones, vistas y VTR**, más una línea de benchmarks,
y la cantidad de filas **varía por informe**. Verificar y reportar: **¿el motor tiene hoy
algún mecanismo para repetir filas dentro de una tabla?** `duplicarBloquesRepetibles_` duplica
**slides**. Si no lo tiene, decirlo — cambia qué significa esta sección y es trabajo de otro
paso.

**Reportar `0.1`–`0.4` y parar.**

---

## Parte A — dejarlo escrito donde va

`A.1` · **La regla de selección** — `REGLAS_NEGOCIO.md` como `R-NN` con el número que dio
`0.1`, fechada, con *decisión del usuario, 06/08/2026* como origen. Si `0.1` encontró que ya
existe, **no se crea ninguna**: se cita la que hay.

`A.2` · **La decisión editorial** — `CONFIG_INFORMES.md` §2.3, que es su dueño y hoy tiene
`post_camp1-3` como `[MANUAL]` y dos `[?]`. Queda dicho que la fuente es dinámica, cuál es, y
que la tabla real pide más atributos que los dos documentados. **Las `[?]` que la regla
responde se responden; las que no, se dejan.**

`A.3` · **El `P2` de `PENDIENTES`** deja de preguntar si la sección sobra —está respondido— y
pasa a decir qué falta: los tokens en la tabla de la lámina, y el mecanismo de `0.4` si no
existe. **Prioridad y estado no se tocan más allá de eso.**

`A.4` · Si `0.4` mostró que el motor no sabe repetir filas de una tabla, **eso es un hallazgo
propio** y va donde `CLAUDE.md` §7 mande, no metido adentro del `P2`.

**Nada de esto habilita a cablear un token.** El cableado es de otro paso y necesita la
lámina con sus `{{token}}` puestos, que es trabajo del equipo sobre la plantilla (`C-01`).

---

## El reporte

1. `0.1`–`0.4`, y en particular si la regla ya existía y si el motor sabe repetir filas.
2. Dónde quedó escrita cada cosa.
3. Qué decisiones tomaste solo.
4. Qué premisa de este prompt resultó falsa, si alguna.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
