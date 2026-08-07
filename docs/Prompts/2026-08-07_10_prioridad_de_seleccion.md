# La contradicción semana-primero contra temario-solo, cerrada

**Un objetivo.** Documentación. **Cero `.gs`.** Deja escrita la prioridad de selección en un
solo dueño y apunta el resto ahí. No cambia ningún número: ninguna corrida ejecutó todavía la
versión perdedora sobre la sección `campana`.

**La decisión del usuario (07/08/2026), textual y en orden:**

1. **El temario selecciona.** `mostrar` + `orden` en `CAMPANAS`. Si hay temario, manda, y se
   busca **en toda la base, sin filtro de ventana**.
2. **Los filtros del usuario acotan** lo que el temario eligió: `Mail remitente =
   jorge.macri@buenosaires.gob.ar` y `GCBA Resto`; en IVR, `Vocero`.
3. **La semana es el default, no un filtro previo.** Decide **sólo cuando no hay temario**.

Esto invierte el orden de `A.1` del prompt `2026-08-07_4_once_respuestas.md` y confirma la
versión de `CONFIG_INFORMES.md` §1.1, que tiene el caso testigo medido (San Cristóbal 23/07
con ventana 24–30/07, §1.7). `A.1` **no se edita** —vive en un prompt ejecutado—: se lo cita
desde donde quede escrita la regla.

---

## Parte 0 — dónde está escrita cada versión (sólo lectura, reportar y parar)

`0.1` · **Todas las apariciones de la versión perdedora.** Buscar en `docs/PLAN.md`,
`docs/REGLAS_NEGOCIO.md`, `docs/CONFIG_INFORMES.md` y `docs/PENDIENTES_consistencia.md` cada
lugar donde esté escrito que la semana filtra antes del temario, o que el default editorial
son las campañas del período. La lectura de afuera dice que `R-16` quedó escrita con esa
versión y con la advertencia al lado; confirmarlo y listar el resto.

`0.2` · **Todas las apariciones de la versión ganadora**, incluida la regla *"la ventana
agrega, el temario selecciona"* y el caso testigo de §1.7.

`0.3` · **Dónde manda `CLAUDE.md` §7 que viva esta regla.** Es un régimen de selección, no una
decisión editorial de un informe: puede ser una `D-NN` nueva, un addendum a `D-09` —que ya
declara el régimen por sección— o `R-NN`. **Reportar lo que dice el ruteo, no elegir por
gusto.** Y decir cuál es el próximo `D-NN` y el próximo `R-NN` libres.

`0.4` · **Si los tres filtros del nivel 2 están escritos en algún lado.** `A.1` los dio por
probablemente no escritos. Confirmar: si no están, esta corrida es la que los deja.

`0.5` · **Si alguna corrida ejecutó la versión perdedora sobre `campana`.** La lectura de
afuera dice que no —lo único ejecutado el 07/08 es el solape sobre los agregados, donde las
dos versiones coinciden—. Si resulta que sí, **hay números publicados a revisar** y eso cambia
el alcance de esta corrida: reportarlo antes de escribir nada.

**Reportar `0.1`–`0.5` y parar.**

---

## Parte A — la regla, en su dueño

`A.1` · Escribir la prioridad de tres niveles **en el dueño que confirme `0.3`**, con:

- Los tres niveles en orden, con el tercero dicho como **fallback y no como filtro previo**:
  la semana decide **sólo si no hay temario**. Es la diferencia que generó la contradicción.
- **Los tres filtros del nivel 2** nombrados con su valor exacto.
- **El caso testigo**, que es lo que la sostiene: San Cristóbal 23/07 entra con ventana
  24–30/07. Una regla con un hecho medido al lado envejece mejor que una regla sola.
- **Qué versión queda derogada y dónde vivía**: `A.1` del prompt `_4`, citado, no editado.
- **Qué NO cambia**: la ventana sigue rigiendo los agregados (`ecv_*`, ministros, `m2`). Las
  dos versiones coincidían ahí, y `R-16` no se toca por esto.

`A.2` · **El resto de los lugares apunta ahí, no repite.** Donde `0.1` haya encontrado la
versión perdedora: si es texto vivo, se corrige apuntando al dueño; si es un prompt ejecutado,
**no se toca** y se lo cita desde el dueño como versión derogada.

`A.3` · **`CONFIG_INFORMES.md` §1.1**: el bloque `⚠ CONTRADICCIÓN ABIERTA` se reemplaza por la
resolución, con fecha y apuntando al dueño. La pregunta `[?]` de la lista de abiertas se cierra
con la misma referencia. **La otra `[?]` de §1.1 —campaña que cruza dos semanas— no se toca.**

`A.4` · **`R-16`**, si `0.1` confirma que quedó escrita con la versión perdedora: corregirla
por la vía que corresponda a una `R-NN` según `CLAUDE.md` §7, **sin editar decisiones viejas
si el ruteo lo prohíbe** — en ese caso, addendum fechado.

## Commits

Uno por archivo tocado, documentación, sin `—`. `git push` después de cada uno.

## Verificación

Se cierra cuando un `grep` por la versión perdedora devuelve **sólo** citas marcadas como
derogadas. **Ningún `.gs`, ninguna hoja, ninguna corrida.**
