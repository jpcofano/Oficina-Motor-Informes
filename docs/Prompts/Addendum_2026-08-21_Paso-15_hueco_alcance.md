# Addendum · 2026-08-21 · Paso `2026-08-21_15` — el hueco de `alcance` del 1 a 1

**Fecha del addendum:** 2026-08-21, después de ejecutado el `_15`.
**Addendum a:** `docs/Prompts/2026-08-21_15_digital_cede_a_D-30.md` — **que no se edita.**
**Modelo:** Sonnet. Es escritura de un hueco ya medido, no una decisión.

---

## Por qué existe este archivo

El `_15` se ejecutó con su Parte C en dos puntos, `C.1` y `C.2`. Se le agregó un `C.3`
**después** de que corriera, en claude.ai, y se lo mandó como reemplazo del prompt. **Eso estuvo
mal**: un prompt ejecutado sólo lleva addendum (`CLAUDE.md` §7). El contenido de aquel `C.3` va
acá y el `_15` queda como corrió.

**Lo único que falta hacer es escribir un hueco.** No cambia código, no toca `MARCADORES`, no
toca `MAPEO`. La medición que lo cerraría necesita ver la base y **Code no tiene acceso** — no
busques rodeos.

---

## Lo único que hace este addendum

En `docs/PENDIENTES_consistencia.md`, entrada nueva fechada 2026-08-21, con lo que ya midió la
Parte A.5 del `_15`. El enunciado:

> **Los dos `u1_*_alcance` del 1 a 1 publicarían el mismo número en PRE y en POST.**
>
> `u1_pre_meta_alcance` y `u1_post_meta_alcance` son **idénticos** en `MARCADORES`:
> `digital/Alcance`, `alc_alcance`, `ULTIMO`, `dimensiones` vacío y `filtro` vacío en los dos
> (medido, `_15` A.5). El deck publica **dos** alcances distintos para el 1 a 1 —uno PRE y uno
> POST—, así que hoy no hay nada que los separe.
>
> **El hueco es doble.** `digital/Alcance` tiene tres campos mapeados —`alc_id_cuenta`,
> `alc_alcance`, `alc_frecuencia`— y ninguno separa las etapas; y `DIMENSIONES_.etapa` sabe
> expresarse **sólo** sobre `digital|CAMPAÑAS_DESGLOCE_DIGITAL`, no sobre `Alcance`. Falta la
> columna **y** falta la dimensión.
>
> **Hoy los dos tokens salen `-`, y eso es benigno.** Las dos filas ya llevan
> `formato = miles_revisar`, así que el día que resuelvan publican `-val-` (`CONFIG_INFORMES.md`
> §4.5 bis) — pero el `-val-` avisa que el número no está validado, **no** que los dos
> casilleros muestren el mismo. Son dos cosas distintas y ésta no está cubierta por ningún
> símbolo.
>
> **La pista, dada por el usuario el 21/08.** El alcance por etapa probablemente **no salga de
> `digital/Alcance`**: en la base `reuniones` el par pre/post está separado **por solapa** —
> `Agenda JM` y `Agenda JM | Post`, las dos `uso = fuente`—, y ahí ya lee
> `enc_alcance_potencial`. Es la misma forma que `D-30` punto 1 cita de `C-50`: el par comparte
> `ID` en dos solapas distintas, así que la clave es `(ID, solapa)` y **no hace falta ninguna
> dimensión nueva** — son dos filas de `MARCADORES` apuntando a dos solapas.
>
> ⏸ **Sin prioridad, por decisión del usuario (21/08).** Queda escrito para no volver a
> preguntarlo.
>
> **Qué lo destrabaría, si algún día sube:** confirmar qué campo de esas dos solapas es el
> alcance del 1 a 1, y si `Call Center` entra en la cuenta. **Requiere ver la base.**

Commit propio. Nada más en este addendum.
