# `ULTIMO` tiene que ser determinista. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-12 · **Ubicación:** `docs/Prompts/2026-08-12_ultimo_determinista.md`

> **Quinto prompt del formato nuevo: un objetivo, nada más.**
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit. **La documentación
> completa al final.**

---

## Antes de empezar — dos deudas cortas

**1 · Documentar la forma de trabajo en `CLAUDE.md`.** El usuario lo pidió el 08/08 y no entró en
ninguno de los cuatro prompts posteriores. Va en `CLAUDE.md`, que es el dueño de las convenciones, no
en un prompt del día que envejece.

Qué decir, breve:

- **Un prompt, un objetivo.** No se mezclan objetivos en una corrida, por barato que parezca el
  segundo.
- **El dato que lo justifica:** con el formato anterior —corridas de cinco puntos que mezclaban
  documentación barata con código caro, la documentación primero— se produjeron **dieciocho commits y
  un solo cambio de código** entre el 04 y el 07/08. La documentación salía siempre; el código,
  nunca. Con un objetivo por prompt, las cuatro corridas siguientes produjeron código en las cuatro.
- **Documentación mínima durante, completa al final.** Una línea de bitácora por commit mientras se
  trabaja; el resto —bitácora larga, `HANDOFF_CODE.md`, `PLAN.md`— cuando el código funciona. **Si el
  código no llega, se documenta lo que se hizo, no lo que se planeaba.**
- **Toda premisa del prompt se verifica antes de aplicarla.** Van cuatro prompts seguidos con una
  premisa central falsa detectada por la medición. Frenar sobre una premisa vencida y seguir por otro
  lado es el comportamiento correcto, no una desviación.

**2 · `HANDOFF_CODE.md`**, que quedó pendiente otra vez tras la corrida del 11/08.

---

## El objetivo

**Que `ULTIMO` elija por fecha y no por orden de filas en la hoja.**

La corrida del 11/08 cerró los once números, y en el mismo reporte dejó anotado el riesgo que creó:
el filtro `mail_tipo=Convocatoria` deja **tres** filas —22/07 ×2 y 25/07— y `ULTIMO` toma la última
**por posición en la hoja**. Las dos del 22/07 son **201.515** y **25.560**.

**Si alguien reordena la hoja, `enc_mails_enviados` pasa de 44.043 a 201.515 y no salta nada.** Es un
número grande, plausible, con el rótulo correcto al lado. **Es el mismo modo de falla que `3347`**,
que sobrevivió tres semanas exactamente por eso.

---

## ⚠ Lo que NO es la solución

**Filtrar por ventana no sirve, y hay que no intentarlo.** `digital` es `modo_periodo = snapshot` y
**por diseño ignora la ventana**: `Fuentes.gs` devuelve todas las filas, y la nota de `BASES` explica
por qué — *sus solapas usan fecha de inicio de campaña (lead 3-7 días), el recorte por período lo
hace el agregador vía link campaña↔encuentro, no ventana de fecha cruda*.

Una convocatoria del 22/07 para un encuentro del 27/07 es legítima y tiene que seguir entrando.
**Recortar por ventana ahí rompe el diseño de la base.**

---

## Parte 0 — Qué hace `ULTIMO` hoy. Sólo lectura. Reportar y seguir.

- **0.1 · ¿Cómo elige `ULTIMO` hoy, exactamente?** La línea que lo resuelve. Si es la última posición
  del array de filas leídas, decirlo así.
- **0.2 · ¿Cuántos marcadores usan `ULTIMO`?** Cuáles, de qué solapas, y cuáles quedarían afectados
  por el cambio. **Cambiar la semántica de `ULTIMO` toca a todos, no sólo a los seis de mail.**
- **0.3 · ¿Hay campo de fecha mapeado en cada solapa que usan esos marcadores?** Si alguna no tiene
  fecha, `ULTIMO` por fecha no se puede aplicar ahí y hace falta un camino de respaldo. **Reportar
  cuáles sí y cuáles no.**
- **0.4 · ¿Qué pasa con `alcance` y `frecuencia`?** `CONFIG_INFORMES.md` §4.1 dice que **no son
  sumables** y van por `ULTIMO`/lookup. Verificar si están entre los afectados y si el cambio los
  mejora o los rompe.
- **0.5 · La foto previa.** Los once números de Orden Público como están hoy, para comparar después.

Reportar los cinco y **seguir**.

---

## Parte A — `ULTIMO` ordena por fecha

- **`ULTIMO` pasa a ser "la fila con la fecha más alta"**, no la última posición.
- **Si la solapa no tiene fecha mapeada**, `ULTIMO` cae al comportamiento actual **y lo dice en la
  traza**. No falla: hay marcadores que hoy funcionan así y no se rompen por esto.
- **Si dos filas empatan en la fecha más alta, el marcador falla con motivo propio** —
  `«FALTA:...@ultimo_ambiguo»` o equivalente— **y no elige**. Misma razón de siempre: un número
  plausible de la fila equivocada es peor que un hueco. **Este es el punto del prompt**; si se
  resuelve eligiendo una, no se arregló nada.
- **La traza dice qué fila se eligió y con qué fecha.**

---

## Parte B — Verificar que los once siguen cerrando

Comparar contra la foto de `0.5` y contra `VALIDACION_2026-07-31.md` §3.2 y §3.3.

**Los seis de mail tienen que seguir dando 44.043 / 43.439 / 4.652 / 145**, ahora **porque el 25/07
es la fecha más alta de las tres convocatorias**, no porque esté último en la hoja.

**La prueba real del arreglo:** reordenar mentalmente —o en una copia, nunca en la hoja viva— y
verificar que el número no cambia. Si no hay forma de probarlo sin tocar la base, decirlo y explicar
con qué se verificó.

**Reportar también los marcadores de `0.2` que no son de mail:** cuáles cambiaron de valor. Cualquier
cambio ahí es un hallazgo, no un daño colateral aceptable.

---

## Al cierre — dos cosas a anotar, sin trabajo asociado

En `PENDIENTES_consistencia.md`:

- **`3354` (San Cristóbal) y `3346` (Retiro) tienen cero filas de mail**, aunque `rdv` registra un
  inscripto por mail en cada uno. Es **inconsistencia de datos, no de motor**, y es lo que impidió
  validar la regla de convocatoria fuera de `3387`. `P2`, y es pregunta para el equipo.
- **`enc_e75_pct` da 38,74 contra 39% publicado.** Es el mismo número: 27.599/71.234 = 38,74%, y el
  informe redondea a entero. **No es un error y no se ajusta** — queda anotado para que nadie lo
  "arregle" más adelante.

---

## Los límites

1. **No se edita ninguna celda de las cuatro bases.** Ni para probar el reordenamiento.
2. **No se edita ninguna plantilla `.pptx`.**
3. **No se filtra `digital` por ventana.** Es snapshot por diseño.
4. **No se toca el score de anclaje ni el desempate temporal.** Sigue siendo el objetivo B, anotado.
5. **No se agrega `seccion_id` a `MARCADORES`**, no se tocan los 7 `ecv_` ambiguos, ni los tres
   remitentes sueltos, ni `camp_bench_*`, ni `m2_`.
6. **No se deroga ni se reescribe una `R-NN`, `D-NN`, `S-NN` ni `C-01`.**
7. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git**.

---

## Cuándo está hecho

- **`ULTIMO` elige por fecha** y la traza lo dice.
- **Los once siguen cerrando**, ahora por una razón estable.
- **Un empate de fecha falla con motivo**, no elige.
- **Ningún marcador de `0.2` cambió de valor sin explicación.**

---

## El reporte

1. **Las cinco mediciones de la Parte 0**, cortas.
2. **Los once números**: siguen cerrando, sí o no.
3. **Qué otros marcadores cambiaron de valor** y por qué.
4. **Cómo verificaste que el orden de la hoja ya no importa.**
5. **Qué decisiones tomaste solo y por qué.**
6. **Qué premisa de este prompt resultó falsa**, si alguna.
7. **Los números que salieron raros.** Sin analizarlos.

**Recién después, la documentación completa.** Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
