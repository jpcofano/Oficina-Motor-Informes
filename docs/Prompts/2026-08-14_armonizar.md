# Retirar la lámina M2 y correr la armonización. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-14 · **Ubicación:** `docs/Prompts/2026-08-14_armonizar.md`

> **Séptimo prompt del formato nuevo: un objetivo, nada más.**
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit. **La documentación
> completa al final.**

---

## El objetivo

**Que la plantilla canónica de JM quede armonizada**, que es lo que hoy bloquea el sembrado de
`MARCADORES` y, por lo tanto, el 88% de los números que faltan en el informe.

La cadena, para que se entienda por qué este prompt importa más que los seis anteriores:

**el `P1` de `{{m2_salud_camp}}` bloquea la armonización → la armonización bloquea el sembrado de las
~200 filas de `MARCADORES` (decisión del Paso 2.10, escrita en `Instalar.gs`) → el sembrado es el 88%
de los faltantes.**

---

## Las dos decisiones del usuario del 14/08 que lo destraban

**1 · La lámina de Status semanal de M2 no se usa más.** Es la slide 10 de la plantilla canónica de
JM (`117I0qn1XP1JCiz2mU32hUY1iiMUmrAAvHOsczd7u6jI`), la que tiene la grilla de cinco ejes —Subtes,
Desalojos, Tránsito, Salud, Seguridad— con Impresiones, Audiencia, Clics, Visualizaciones y campañas,
y la caja ancha `{{m2_salud_camp}} campañas` abajo.

**Con esa lámina fuera, el `P1` deja de ser un bloqueante**: la colisión que impedía armonizar vivía
ahí. (Y de paso queda confirmada la inferencia del relevamiento del 03/08: en la lámina se ven las
líneas que van de las cinco cajas de campañas a la caja ancha — **es un total**, no un eje. Anotarlo
al cerrar el `P1`, porque explica el nombre equivocado.)

**2 · Durante el desarrollo, la plantilla es del motor.** Autorización expresa del usuario, 14/08.
**Esto excede a `C-01` y hay que registrarlo bien, no aplicarlo en silencio:**

- **Armonizar NO necesitaba esta autorización.** `C-01` ya permite que el motor escriba sobre la
  plantilla *"en una migración explícita (una armonización de tokens)"*, con backup previo. Eso sigue
  igual.
- **Lo que la autorización agrega es retirar una lámina**, que no es armonización. **Registrarla en
  `REGLAS_NEGOCIO.md` junto a `C-01`, como suspensión acotada y con fecha** — no derogar `C-01`, que
  vuelve a regir en producción.

---

## Parte 0 — Medir el alcance antes de tocar. Sólo lectura. Reportar y seguir.

- **0.1 · Confirmar cuál es la lámina.** Que la slide 10 de la plantilla canónica sea la de la imagen
  —grilla de cinco ejes con la caja ancha abajo—. **Si la numeración no coincide, reportar y parar
  este punto**: retirar la lámina equivocada no se deshace fácil.
- **0.2 · ¿Cuántos tokens se van con ella?** Listarlos. Y **cuántos quedan en la plantilla después**:
  hoy son 195, y hay ~31 `m2_*`. El número que quede es la nueva base contra la que se mide todo.
- **0.3 · ¿Hay `m2_*` en otras láminas?** El temario tiene dos ítems de M2 —*Campañas y enviados de
  la semana* y *Registro Civil*—. **Si hay tokens `m2_*` fuera de la slide 10, no se van con ella** y
  hay que decir cuáles quedan huérfanos.
- **0.4 · ¿Qué renombres tiene pendientes la armonización?** `RENOMBRES_ARMONIZACION_POR_INFORME_`,
  entero, y cuáles siguen sin aplicar. **Cuántos de esos renombres eran sólo de la slide 10** y por
  lo tanto dejan de hacer falta.
- **0.5 · ¿Queda alguna otra colisión?** El `P1` era una. **Correr el relevamiento de `mapaDeTokens_`
  sobre la plantilla entera y reportar si dos cajas comparten token, o si un renombre haría que lo
  compartieran.** Si aparece otra colisión, ése es el nuevo bloqueante y hay que decirlo antes de
  escribir nada.

Reportar los cinco y **seguir**.

---

## Parte A — Retirar la lámina

- **Backup completo de la plantilla antes de tocarla.** No negociable: es archivo compartido y
  editado por personas.
- **Preferir esconder sobre borrar.** Google Slides permite marcar una lámina como omitida
  (`skipped`), que es reversible y deja la evidencia a la vista. **Borrar sólo si esconder no es
  posible**, y en ese caso decirlo en el reporte.
- **Registrar en `PLANTILLAS_QA_y_armonizacion.md`** qué lámina se retiró, cuándo, con qué
  autorización y cómo se revierte.

---

## Parte B — Armonizar

Correr la armonización de tokens sobre la plantilla canónica
(`117I0qn1XP1JCiz2mU32hUY1iiMUmrAAvHOsczd7u6jI`), que **sigue sin armonizar** — la corrida del 29/07
se aplicó por error sobre `1JrHvs_p…`, hoy marcada `[OBSOLETA — no usar]`.

- **Backup antes**, y **diff después**: qué token cambió a qué, caja por caja.
- **Si algún renombre produce una colisión, no se aplica ese renombre**: se reporta y se sigue con
  los demás. Dos cajas con el mismo token es la regresión de `enc_audiencia`, ya conocida.
- **No renombrar nada que no esté en el diccionario.** Si aparece un token que parece mal nombrado y
  no está en la lista, es un hallazgo para reportar, no una corrección para hacer.

---

## Parte C — Cerrar el `P1`

Con la lámina fuera, el `P1` de `{{m2_salud_camp}}` deja de bloquear. **Cerrarlo en
`PENDIENTES_consistencia.md`** —tachado, con fecha y motivo, como se cerraron los otros— y anotar
que la lectura correcta era la tercera opción: **una caja de total con nombre de eje**, confirmada
por las líneas que van de las cinco cajas de campañas a la caja ancha.

**No borrar la entrada.** El razonamiento de cómo se llegó ahí vale para el próximo caso parecido.

---

## Lo que NO entra en este prompt

**El sembrado de `MARCADORES` no se hace acá.** Son ~200 filas y es el objetivo del prompt
siguiente. Este destraba; el que viene siembra. Mezclarlos hace que si la armonización sale mal, el
sembrado se lleve el error a doscientas filas.

**Y no se cablea ningún token nuevo**, por barato que parezca.

---

## Los límites

1. **No se edita ninguna celda de las cuatro bases.**
2. **La plantilla: sólo retirar la slide 10 y aplicar los renombres del diccionario.** Nada más.
   **Ninguna caja se mueve, se redimensiona ni se reescribe.**
3. **Backup antes de cada escritura sobre la plantilla.** Las dos: la de retirar y la de armonizar.
4. **`C-01` no se deroga.** Se anota una suspensión acotada y con fecha, que vuelve a regir en
   producción.
5. **No se toca el score de anclaje** (objetivo B, anotado), ni los 7 `ecv_` ambiguos, ni los tres
   remitentes sueltos, ni `camp_bench_*`.
6. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git**.

---

## Cuándo está hecho

- **La lámina está fuera** y se sabe cómo volver atrás.
- **La plantilla canónica está armonizada**, con el diff caja por caja.
- **No queda ninguna colisión de tokens** — o si queda, está identificada y es el nuevo bloqueante.
- **El `P1` está cerrado** con su explicación.
- **Se sabe cuántos tokens tiene ahora la plantilla**, que es la base para el sembrado.

---

## El reporte

1. **Las cinco mediciones de la Parte 0.** En especial `0.5`: ¿queda otra colisión?
2. **Cuántos tokens tiene la plantilla ahora** y cuántos se fueron con la lámina.
3. **El diff de la armonización**: qué token cambió a qué.
4. **Qué renombres no se aplicaron** y por qué.
5. **Qué decisiones tomaste solo y por qué.**
6. **Qué premisa de este prompt resultó falsa**, si alguna.
7. **Los números que salieron raros.** Sin analizarlos.

**Recién después, la documentación completa.** Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
