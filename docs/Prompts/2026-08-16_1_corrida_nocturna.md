# 2026-08-16_1 — Corrida nocturna

> **Estado:** ejecutado el 16/08/2026 · **subagente:** ninguno
>
> **Objetivo único:** avanzar sin el usuario todo lo que no necesite ni la planilla ni una
> decisión, y dejar a la mañana una lista única de corridas.
>
> **Autorizado a ejecutar los cinco bloques sin preguntar.** No hay gate.

---

## Las reglas de esta corrida

1. **No decidir nada que sea del usuario.** Si un bloque llega a un punto donde hay que elegir,
   **anotarlo en el reporte y pasar al siguiente**. Un bloque saltado con el motivo escrito es
   un resultado; uno resuelto por criterio propio a las cuatro de la mañana es un problema que
   se descubre el martes.
2. **No escribir sobre ninguna hoja de registro.** Esta corrida es repo, no planilla.
3. **No tocar plantillas, no cablear, y no tocar los ocho del piloto** — quedan migrados,
   esperando que `looker` se estabilice.
4. **Un commit por bloque**, con el bloque nombrado.
5. **Si una premisa falla, el bloque para ahí.** No improvisar una vía alternativa.
6. **Un solo reporte al final.**

---

## Bloque 1 — cerrar el día · **Sonnet** · effort: normal

`BITACORA.md` y `PLAN.md`, con lo que cerró el 15/08 y su estado **real**:

- **`D-31`** — 154 filas de `MAPEO` con su `encabezado`; la letra manda, el título es testigo,
  nunca fallback. Con el límite que expuso `C-09`: el testigo documenta **el rótulo, no el
  contenido**.
- **`D-32`** — verificado punta a punta. Con `reuniones/Agenda funcionarios` puesta a mano en
  `fuente` contra un seed que decía `ignorar`, el sembrador no la revirtió.
- **`D-33`** y el alta de las 24 solapas de `reuniones` — 2 `fuente`, 5 `referencia`,
  17 `ignorar`.
- **El piloto: migrado y sin verificar.** Los ocho tienen `dimensiones` escritas y su `filtro`
  reducido a `estado=Activa`. **La Parte C quedó abierta** porque `looker` estaba
  recalculando — `gcba_frecuencia` en 0 es el canario. Que el estado diga eso y no "en curso":
  el que lea mañana tiene que saber que hay ocho marcadores migrados y sin confirmar.

Marcar los frentes 1, 2, 4 y 6 del *Próximo* como hechos, y el 5 como **migrado, pendiente de
verificación**.

---

## Bloque 2 — `C-61`, la mitad que no necesita planilla · **Opus** · effort: alto

El frente 7 bloquea el embudo de Call Center y su primera medición es **si el motor lee `CC` por
encabezado o por posición**. Buena parte se responde leyendo código y `MAPEO`.

1. **Recorrer el camino de lectura** desde `MARCADORES` hasta la celda, para un marcador de
   `looker/CC`, y decir **con qué se identifica la columna en cada paso**.
2. **Contra el snapshot `MAPEO_2026-08-15.tsv`** —o el más reciente que haya en
   `docs/_snapshots/`, **diciendo cuál se usó y su fecha**—: cuántas filas de `looker/CC` hay y
   si referencian por letra o por título.
3. **La consecuencia, escrita:** si es por letra, insertar una columna corre todas las letras a
   su derecha y el mapeo apunta una más allá **sin fallar**. `D-31` puso el testigo, así que
   **decir qué detectaría hoy ese testigo y qué no** — es lo que decide si `C-61` sigue siendo
   riesgoso.
4. **Qué falta medir con la planilla**, listado, para que entre en el bloque 5.

**No tocar `C-61`. No agregar ninguna columna.** Esto es el reporte previo.

---

## Bloque 3 — el prompt de los dos universos de Call Center · **Opus** · effort: alto

Frente 8. **Escribir el prompt, no ejecutarlo.**

La regla a documentar: `enc_*` filtra `Tipo de llamado IN (Convocatoria, IVR convocatoria)` y
`cc_*` no filtra. Dos universos conviviendo sin declarar es el modo de falla del número
plausible: los dos dan un número, ninguno falla, y sólo uno responde la pregunta que la lámina
hace.

El prompt lleva su Parte A de medición contra `looker/CC` y `reuniones/Call`, que **el usuario
corre a la mañana**. El censo del 14/08 ya midió que `Call` tiene `Tipo de llamado` con
`Convocatoria`, `Reconfirmación`, `IVR convocatoria` e `Informativo`, y que `Métricas EDVs`
separa CC JM de CC Funcionarios: **eso es insumo, no resultado** — la Parte A lo verifica contra
la fuente que el marcador usa hoy.

Dejar el instrumento de medición pusheado y **sin correr**, con nombre sin `_` final.

---

## Bloque 4 — el catálogo de tokens, primera versión · **Sonnet** · effort: alto

Frente 14, y es el objetivo declarado de toda la migración: que alguien del equipo arme una
filmina eligiendo tokens documentados que dicen **qué son y cómo se arman**.

**Generado, no escrito a mano.** Escribir el generador y correrlo **contra
`docs/_snapshots/MARCADORES_2026-08-15.tsv`**, que es la línea base y está en el repo.

- Una fila por marcador con **lo que `MARCADORES` ya tiene** — medida, base, solapa, operación,
  filtro, dimensiones, formato. **Sin inventar columnas ni categorías nuevas:** el formato del
  catálogo es una decisión y no se toma esta noche.
- **El archivo dice de qué snapshot salió y con qué fecha**, en la primera línea. Un catálogo
  sin esa línea se lee como el estado de hoy, y es el error que ya costó cuatro citas.
- **Los diez marcadores en error entran igual**, con su causa. Un catálogo que sólo lista lo que
  funciona miente por omisión: los nueve de `reuniones` son `D-30` funcionando y `enc_alcance`
  tiene su propia historia.

Si al generarlo aparece que falta información para que una fila sea comprensible, **anotarlo en
el reporte** — es material para decidir el formato definitivo, no para inventarlo ahora.

---

## Bloque 5 — la lista de la mañana · **Sonnet** · effort: normal

`docs/CORRIDAS_pendientes_<fecha>.md`, con **todas** las corridas de Apps Script pendientes en un
solo lugar, ordenadas **por lo que destraban**, y cada una con: nombre exacto de la función, qué
destraba, y si su resultado necesita una decisión del usuario.

Tiene que incluir, como mínimo:

- **`testigoDeImpresiones()`** — la Parte C del piloto. **Con el canario primero:** si
  `gcba_frecuencia` sigue en 0, `looker` no está lista y no se lee nada.
- **La Parte A de `R-26`** — el prompt está escrito desde el 13/08 y nunca corrió. Es
  independiente de todo lo demás.
- **El instrumento del bloque 3.**
- **Lo que el bloque 2 no pudo medir sin planilla.**

`HANDOFF_CODE.md` arranca con esa lista.

---

## Lo que esta corrida **no** hace

- **No revierte ni re-verifica el piloto.** Necesita `looker` estable.
- **No corre `R-26`.** Su Parte A mide contra `rdv`.
- **No toca `C-61`** más allá del reporte previo.
- **No decide el formato del catálogo**, ni mueve `DIMENSIONES_` a hoja, ni define `-` y `---`.
  Las tres son decisiones del usuario y están anotadas como tales.
