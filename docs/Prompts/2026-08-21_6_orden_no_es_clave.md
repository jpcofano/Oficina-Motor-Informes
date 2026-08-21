# 2026-08-21_6 — `orden_plantilla` deja de ser clave: la identidad es el `lamina_id`

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Objetivo único:** que ninguna decisión del motor cuelgue de `orden_plantilla`.
>
> Sale de la inconsistencia **3** del 21/08 en `docs/PENDIENTES_consistencia.md`.

---

## La regla ya estaba escrita, y en el seed

`Instalar.gs`, sobre `LAMINAS`:

> ⚠ **`orden_plantilla` es reportado, NUNCA autoritativo.** Está para que una persona ubique la
> lámina en el deck. **Nada del motor puede decidir en base a ese número**: insertar una lámina
> antes corre todos los de abajo, y es exactamente lo que rompió `LAMINAS_CONGELADAS_` cuando
> guardaba números. **La identidad es `lamina_id`.**

**Y hay un sitio que la viola:** `censarTokensSinMarcador_` (`Auditoria.gs`) indexa su mapa `iteran`
por `orden_plantilla`. **Con dos láminas del mismo número, una pisa a la otra en silencio.**

## El caso no es hipotético — ya existe

Medido el 21/08 con `verificarLaminas()`: **`L-052` se insertó en la posición 6 de la plantilla de
`jm` y corrió a `L-035` a la 7**, pero la hoja sigue diciendo `orden_plantilla = 6` para las dos.
Diecisiete filas quedaron con el orden viejo.

⭐ **Eso es lo esperado y no hay nada que arreglar ahí:** el `lamina_id` existe justamente para que
el orden no importe (decisión del usuario, 21/08). **El problema es sólo donde alguien decide por
ese número.**

⚠ **No se disparaba** porque `itera_sobre` está vacío en las 52 filas, así que el `if` nunca entra.
**Era un bug esperando la primera fila que lo declarara.**

---

## Parte 0 — medir. Sólo lectura. **Reportar y seguir.**

1. **Todos los sitios que usan `orden_plantilla`** en los `.gs`, separando los que **reportan** de
   los que **deciden**. Reportar la lista completa aunque esté vacía.
2. **Si el generador depende del orden** en algún lado.

---

## Parte A — la identidad es el id

1. ⭐ **El mapa se indexa por `lamina_id`.**
2. ⭐ **La identidad de una lámina del deck sale de su ancla** (`anclaDeLamina_`), que es
   exactamente para lo que se selló — no de su posición.
3. ⚠ **Una lámina sin ancla no se adivina por posición: se cuenta aparte y el resumen la nombra.**
   Antes, buscarle el `itera_sobre` por su número se lo asignaba a la lámina equivocada. El caso
   está medido: la lámina 8 de `jm` no tiene ancla ni fila.
4. **El aviso va al final del resumen**, después del veredicto (`CLAUDE.md` §4).

⛔ **No se toca `LAMINAS`, ni las plantillas, ni el generador** — que nunca dependió del orden.

---

## Parte B — el control

1. ⭐ **Ningún `.gs` indexa por `orden_plantilla`.** Sobre el **código**, no sobre el texto: los
   comentarios citan el patrón viejo para explicarlo.
2. **La colisión real de `L-035` y `L-052`**, sobre el snapshot vivo y no sobre un fixture
   inventado (`CLAUDE.md` §4). Afirmar que **indexar por orden pierde filas** y por id no.
3. ⚠ **Romper a propósito:** volver el índice a `orden_plantilla` y verificar que el detector lo
   encuentre.

---

## Parte C — la documentación

1. `docs/PENDIENTES_consistencia.md` — cerrar la inconsistencia 3.
2. `docs/BITACORA.md` · `docs/HANDOFF_CODE.md`.

## Lo que este prompt **no** hace

- ⛔ No sella la lámina 8 ni ninguna otra.
- ⛔ No corrige el `orden_plantilla` de las 17 filas: es reportado, y estar viejo es inofensivo.
- ⛔ No escribe `seccion_id`.
