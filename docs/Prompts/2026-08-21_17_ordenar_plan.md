# Paso 2026-08-21_17 — `PLAN.md §2` vuelve a decir qué sigue, y tres decisiones se asientan

**Estado:** no ejecutado.
**Reemplaza:** nada.
**Toca:** `docs/PLAN.md`, `docs/CONFIG_INFORMES.md`, `docs/PENDIENTES_consistencia.md`, y el
documento que `CLAUDE.md` §7 declare dueño de `ecv_*`.

---

## Contexto — por qué esto es un paso y no una limpieza

`PLAN.md` es el dueño de *"¿qué sigue y en qué orden?"* (`CLAUDE.md` §7). Su §2 *Próximo* está
fechado entre el 14 y el 18/08: la tabla de catorce frentes, el estado *"al 16/08"*, la
secuencia *"Parte C del piloto → 12 bis → tanda 1"*. **El trabajo del 19 al 21/08 no entró** —
láminas declaradas, la auditoría de tiempos, el cableado de los `u1_`, el corte por presupuesto,
la condición del 1 a 1.

Hoy, para saber qué sigue, hay que leer `HANDOFF_CODE.md` y los últimos commits. Eso es
exactamente lo que §7 pone en `PLAN.md` y lo que el handoff **no** responde: el handoff dice
*dónde estamos*, el plan dice *hacia dónde*.

⚠ **Y el archivo está incumpliendo su propia regla de apertura:** *"una entrada es una línea o un
párrafo corto; si necesita más, el detalle va a `BITACORA.md` y acá queda el puntero"*. Varias
filas de la tabla de frentes son párrafos largos con mediciones adentro. **Eso se corrige
moviendo, no borrando.**

---

## Parte 0 — el censo · **Sonnet** · sólo lectura · reportar y parar

**0.1 · Qué de §2 ya está cerrado.** Recorrer la tabla de catorce frentes y clasificar cada uno
en: **cerrado** (tachado o con ✅ y evidencia citada), **abierto**, o **no se puede decidir desde
el documento**. Reportar la lista con el motivo de cada clasificación. **No cerrar nada por
inferencia**: si el frente no declara su cierre, va a la tercera categoría.

**0.2 · Qué pasó y no está en §2.** Sacar los encabezados de `docs/BITACORA.md` del 19, 20 y
21/08 y listar el trabajo cerrado que **ninguna** fila de §2 menciona. La bitácora es la fuente
—es append-only y es la dueña de *"qué se hizo y cuándo"*—, no los commits.

**0.3 · Los prompts sin ejecutar.** Listar los archivos de `docs/Prompts/` **sin ningún commit
que los nombre**. Se sabe de `2026-08-21_12` (anotado en Backlog, correcto), `2026-08-21_16` y
el `Addendum_2026-08-21_Paso-15_hueco_alcance`. Reportar si hay otros. **Un prompt escrito y sin
correr que no está en el plan no lo encuentra nadie** — es la línea que se agregó por el `_12`.

**0.4 · Los tres huecos de prompt.** `2026-08-21_7`, `_13` y `_14` se ejecutaron sin archivo en
`docs/Prompts/`. Reportar su estado actual — si ya hay puntero, addendum, o nada. **No los
reconstruyas.**

**0.5 · Las entradas que violan la regla de longitud.** Contar cuántas filas de la tabla de
frentes pasan de un párrafo corto, y de cada una decir **a qué documento iría su detalle** según
§7. No mover nada todavía.

**Reportar y parar.**

---

## Parte A — reordenar `§2 Próximo` · **Opus** · effort alto

**La prueba de la frontera es la que ya está escrita en la apertura del archivo**, y se aplica a
cada ítem: *Próximo* es lista **ordenada con dependencias dichas**; *Planificado y bloqueado*
exige nombrar **qué lo destraba y de quién depende**; *Backlog* es sin orden y sin fecha. **Si no
podés decir qué lo desbloquea, es backlog.**

Reglas del reordenamiento:

1. **Lo cerrado sale de §2.** No se borra: queda su rastro donde corresponda (`BITACORA.md` ya lo
   tiene) y §2 deja de listarlo. Una lista de catorce ítems donde nueve están tachados no ordena
   nada.
2. **Los `T<tramo>.<n>` no se retiran ni se renumeran** — está escrito en la apertura de §2 y
   sigue valiendo. Son la estructura del corte vertical; lo que se reordena es el orden de
   frentes, no ellos.
3. **Lo del 19 al 21/08 entra, con su dependencia dicha.** Sale de 0.2.
4. **Los prompts sin correr entran como ítems**, cada uno con lo que destraba. Sale de 0.3.
5. **Cada ítem que se mueva a §3 tiene que nombrar quién lo destraba.** Si no se puede, va a
   Backlog — no a §3 con un destrabe inventado.
6. **El detalle largo se mueve, no se borra.** Cada párrafo con mediciones adentro va al documento
   que §7 declara dueño, y en §2 queda el puntero. Sale de 0.5.

⚠ **Lo que este paso NO decide.** No inventa prioridades nuevas ni reordena por criterio propio
más allá de las dependencias que los ítems ya declaran. Donde el orden entre dos ítems no salga
de una dependencia escrita, **dejarlo como está y reportarlo** — el orden es del usuario.

---

## Parte B — las tres decisiones del 21/08, asentadas · **Sonnet**

Cada una va **al documento que `CLAUDE.md` §7 declara dueño**, no a `PLAN.md`. Greppear antes de
escribir: si ya está dicho en algún lado, el resultado correcto es cero ediciones y se registra
el cero.

**B.1 · `ecv_*` es genérico entre tipos de encuentro.** Es la **D3** de *"Preguntas al equipo"*
en `PENDIENTES_consistencia.md`. Respuesta del usuario, 21/08: **sí, es genérico** — y ya estaba
documentado (`TOKENS.md` lista la lámina 4 de `secco` como `ecv_comuna`, `ecv_fecha` *"reusa
JM"*). Es la misma conclusión que `SECCIONES.md` Corrección 5 ya había sacado para `enc_*`: la
familia es reusable y **no hay que renombrar nada**. Consecuencia: **el 1 a 1 no necesita
marcadores propios equivalentes** — reusa los `ecv_*`.

Tres cosas: la respuesta va al documento dueño del hecho; la pregunta **se tacha** en la sección
de preguntas, que es el ciclo que esa sección declara; y se vacía ese motivo en
`SECCIONES.encuentro_iceberg.falta`, que hoy sigue diciendo *"definir si es genérico"*.

⚠ **Y el límite, que hay que escribir porque el "sí" no lo cubre.** *Genérico entre tipos de
encuentro* **no** es *genérico entre informes*. `TOKENS.md` deja un contraejemplo vivo:
`ecv_poblacion` es *"Habitantes del Barrio"* en `jm` y *"Habitantes del eje"* en `secco`, y anota
que un eje agrupa varios barrios, así que **no puede ser el mismo cálculo**. Esa pregunta está
marcada como sin cerrar y **D3 no la contesta**. Dejarla explícitamente viva con su puntero, para
que el `ecv_poblacion` no se lleve puesta una pregunta distinta que comparte prefijo.

**B.2 · La lámina de plataforma de `secco`.** `CONFIG_INFORMES.md` §1.9 dejó tres salidas y
ninguna elegida. Decisión del usuario, 21/08: **la 2 — se cablea con los mismos tokens que `jm`**,
porque `secco` es prácticamente el mismo informe. ⏸ **Diferida**: se hace más adelante, no ahora.
Escribirla en §1.9 con las dos partes —cuál se eligió y que está diferida—, y **dejar las otras
dos salidas escritas** como estaban: sirven para entender por qué se eligió ésta.

**B.3 · Las láminas escondidas.** Los 49 crudos permanentes de las láminas 12, 21 y 29.
Decisión del usuario, 21/08: **⏸ sin ninguna prioridad. Cuando se activen, se ve.** Marcarlo así
en `PENDIENTES_consistencia.md`, donde ya está documentado con sus dos opciones, y **no volver
sobre esto**. Las dos opciones quedan escritas, sin elegir, y el pendiente deja de aparecer como
algo a resolver.

⚠ **B.2 y B.3 son diferimientos, no cierres.** El pendiente no se tacha ni se archiva: cambia de
estado a ⏸ con la fecha y el dueño de la decisión. Un pendiente borrado vuelve a descubrirse
dentro de dos meses.

---

## Fuera de alcance

- **Reconstruir los prompts `_7`, `_13` y `_14`.** 0.4 los reporta; qué hacer con ellos es otra
  decisión.
- **Tocar `HANDOFF_CODE.md`.** Se reescribe solo, y es tuyo.
- **Cualquier cambio de código.** Este paso no toca un `.gs`.
