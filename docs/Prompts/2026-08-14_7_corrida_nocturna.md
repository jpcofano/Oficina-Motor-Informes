# 2026-08-14_7 — Corrida nocturna

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Objetivo único:** avanzar sin el usuario todo lo que no necesite la planilla, y dejar a la
> mañana **una sola lista de corridas** en vez de que aparezcan de a una.
>
> **Autorizado a ejecutar los cuatro bloques sin preguntar.** No hay gate.

---

## Las reglas de esta corrida, que valen más que los bloques

1. **No decidir nada que sea del usuario.** Si un bloque llega a un punto donde hay que elegir,
   **anotarlo en el reporte y pasar al siguiente**. Un bloque saltado con el motivo escrito es
   un resultado; un bloque resuelto por criterio propio a las tres de la mañana es un problema
   que se descubre el martes.
2. **No escribir sobre `SOLAPAS`, `BASES`, `MAPEO`, `MARCADORES` ni ninguna hoja de registro.**
   Esta corrida es repo, no planilla.
3. **No tocar plantillas ni cablear ningún token.**
4. **Un commit por bloque**, con el bloque nombrado en el mensaje. Si algo hay que revertir a
   la mañana, que se pueda revertir solo.
5. **Si una premisa falla, el bloque para ahí.** No improvisar una vía alternativa.
6. **Un solo reporte al final**, con los cuatro bloques y su estado. Los reportes intermedios
   no los va a leer nadie a las cuatro de la mañana.

---

## Bloque 1 — cerrar el `_6` con `C-09` · **Sonnet** · effort: normal

Lo pedido esta noche sobre `rdv/RDV_otros_ministros/fecha_periodo → E`, que está bien y ya
tenía caso:

1. **Poblar su testigo** con `hora_cita_evento`, el encabezado real, y en `notas` que el rótulo
   está corrido en origen, citando `C-09`. Baja de 7 a 6 las filas sin testigo, y las 6 que
   quedan son las de `promoverFechasElegidas()`, ya contadas.
2. **Retirar de `PENDIENTES_consistencia.md` la corrección propuesta a `D`.** No borrar la
   entrada: que diga que se redescubrió y se cerró contra `C-09`.
3. **Agregar a `D-31` el límite que el caso expone:** el testigo documenta **el rótulo, no el
   contenido**. En una solapa con encabezados corridos coincide siempre y no delata nada. Sin
   esto escrito, alguien va a leer *"coincide"* como *"está bien"*.
4. **Advertencia donde se vaya a usar esa solapa:** `DISENO_match_temario.md` la propone como
   fuente de anclaje, así que se va a mapear más de ella, y cualquier mapeo hecho mirando el
   encabezado va a apuntar una columna al lado. Anotarlo ahí. **No resolverlo.**

---

## Bloque 2 — el censo estático del `_2` · **Opus** · effort: alto

La Parte A del `_2` pide cosas que necesitan hojas vivas y cosas que no. **Hacer las que no**, y
dejar las otras para la lista de la mañana.

Lo que sale del repo, sin planilla:

1. **Los duplicados por dimensión**, sobre `SEED_MARCADORES_`: todo par cuya definición —base,
   solapa, `campo_logico`, `operacion`— sea idéntica y sólo difiera en `filtro`, y todo par que
   no difiera en nada. Los nueve `gcba_*` son el caso conocido; el censo dice si hay más y
   **cuál de cada par está bien**, o que no se puede saber sin medir.
2. **El inventario de `filtro`**, clasificado en **dimensión de negocio** y **restricción
   técnica**. Sobre el seed, y marcando que es el seed y no la hoja. La dimensión ámbito
   JM/GCBA aparecía escrita de cuatro formas según la base — `figura=`, `mail_remitente=`,
   `dig_jm_gcba=`, `campana~=` —: confirmar si son cuatro y si hay otras dimensiones igual de
   dispersas.
3. **Agrupar por dimensión lógica** y **proponer el vocabulario**: nombre, valores posibles, y
   la expresión física por base. **Propuesta, en el reporte. No escribir ninguna.**
4. **Las colisiones entre `jm` y `secco`** sobre `TOKENS.md` y lo que haya de las plantillas en
   el repo, en los tres montones: mismo hecho, hecho distinto con el mismo nombre, nombre
   distinto para el mismo hecho. Los siete `ecv_*` ambiguos deberían caer en el segundo.

**No escribir la `D-NN` del `_2`.** Su gate es del usuario y sigue abierto.

---

## Bloque 3 — la parte estática del `_3` · **Opus** · effort: alto

1. **Mapear en el código todos los caminos** por los que una fila de `SOLAPAS`, `BASES` o
   `MAPEO` puede cambiar de valor en una corrida: el sembrador, las migraciones, y cualquier
   otro. Para cada uno, si respeta `origen = 'manual'` y si puede degradar un `uso`.
2. **Escribir el instrumento de diff sin aplicar** — que reporte toda fila donde el seed diga
   algo distinto de la hoja, **marcando cuáles serían degradaciones de `uso`**. Sólo lectura.
   Queda pusheado y sin correr.
3. **Implementar el gate ya resuelto**: la hoja manda, el sembrador **nunca pisa un `uso`
   existente**, las diferencias van al diff. Con la razón escrita en el código —el **por qué**,
   con la fecha del caso de `CAMPAÑAS_DESGLOCE_DIGITAL` que lo originó—, que es justo lo que le
   faltó a la línea del seed que causó esto.
4. **La `D-NN`**, con lo que significa `origen`: hoy no distingue *"lo decidió el seed"* de
   *"lo decidió una persona y el seed no se enteró"*, y esa ambigüedad es la causa y no el
   síntoma.
5. **La prueba se escribe pero no se corre**: dejar preparado el caso de reversión —una solapa
   en `fuente` contra un seed que diga `ignorar`— listo para ejecutar a la mañana. Un cambio de
   este tipo sin probar contra el caso que lo originó no está verificado, y esa verificación
   necesita la planilla.

---

## Bloque 4 — la lista de la mañana · **Sonnet** · effort: normal

El entregable que hace que la corrida valga la pena. Un documento corto, fechado, en `docs/`,
con **todas las corridas de Apps Script pendientes en un solo lugar**, y por cada una:

- el nombre exacto de la función;
- **qué destraba** — cuál prompt, cuál punto, qué queda escrito después;
- si su resultado necesita una decisión del usuario o si Code sigue solo.

Tiene que incluir, como mínimo: la envoltura de cobertura de las tres excepciones contra los 25
ids —lo último que le falta al alta del `_4`—, la prueba de reversión del bloque 3, el diff sin
aplicar, y lo que el bloque 2 no pudo medir sin hojas vivas.

**Ordenada por lo que destraba**, no por el orden en que aparecieron.

---

## Bloque 5 — cierre · **Sonnet** · effort: normal

`tools/listas.js`, `BITACORA.md` y `HANDOFF_CODE.md`. El `HANDOFF` arranca con la lista del
bloque 4: es lo primero que hay que ver a la mañana.

---

## Lo que esta corrida **no** hace, y conviene que no se intente

- **El alta de las 20 solapas.** Necesita una corrida que no se puede hacer de noche, y la
  confirmación del usuario.
- **`R-26`.** Su Parte A mide contra `rdv`; sin planilla no se puede sostener ni falsar la
  premisa, y escribir la regla sin eso es exactamente lo que el prompt prohíbe.
- **La Parte B del `_2`.** Su gate es del usuario.
- **Cablear cualquier token**, sellar la lámina del "1 a 1", o crearle fila en `LAMINAS`.
