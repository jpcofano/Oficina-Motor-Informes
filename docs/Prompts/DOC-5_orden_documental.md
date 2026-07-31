# DOC-5 — Orden documental: un solo dueño por hecho

> **Tarea de sólo lectura y propuesta.** No movés, no borrás, no renombrás, no editás ningún
> archivo salvo el único que se te pide crear al final.
> **Trabajamos en español.**

---

## Por qué

El proyecto aplicó "una sola fuente de verdad" a la configuración —el Paso 2.11 existe por
eso— y **no** a la documentación. Hoy `docs/` tiene alrededor de 23 archivos, más
`docs/Prompts/`, más `Plan Inicial/`, más los archivos de raíz. El síntoma ya apareció: el fix
de `sembrarClasificacionSolapas()` se implementó en la Parte C del Paso 2.11 y no quedó escrito
en ningún documento.

> ⚠ **Corrección (DOC-5 Parte 2, 31/07/2026).** El síntoma de arriba está mal fundado: el fix
> de `sembrarClasificacionSolapas()` sí quedó escrito, en `docs/BITACORA.md` (entrada "Paso
> 2.11 Parte C") y en `docs/HANDOFF_CODE.md` — ver `docs/PROPUESTA_orden_documental.md`,
> Tarea 2 Caso 2. No se retira el párrafo (este prompt ya corrió con él adentro y no se edita
> en silencio); se marca. El corolario importa más que el error: **este prompt llevaba un
> hecho desactualizado y corrió igual** — es el mismo modo de falla que vino a buscar,
> aparecido en sí mismo.

Es el mismo modo de falla de siempre, en el otro dominio: **no el documento que falta, sino el
que dice algo razonable y desactualizado.** Alguien lo lee, le cree, y decide mal.

---

## Qué tenés que producir

Un solo archivo: **`docs/PROPUESTA_orden_documental.md`**. Nada más. Ni mover archivos, ni
crear carpetas, ni tocar `CLAUDE.md`. La propuesta se revisa arriba y recién después se aplica,
en un paso aparte.

---

## Tarea 1 — Inventario

Recorré `docs/`, `docs/Prompts/`, `Plan Inicial/` y la raíz del repo. Para **cada** archivo
`.md`:

| campo | qué poner |
|---|---|
| ruta | la ruta completa |
| tipo | `gobierno` / `prompt` / `referencia` / `estado` / `snapshot` / `no claro` |
| autoridad | de qué hecho o hechos es dueño, en una línea |
| última modificación | fecha del último commit que lo tocó |
| lo cita | qué otros archivos lo referencian |
| cita a | a qué otros archivos referencia |

Los tres tipos que ya existen en el proyecto, para que los clasifiques bien:

- **gobierno** — reglas que Code lee solo al empezar. Hoy: `CLAUDE.md` (raíz).
- **prompt** — una tarea con alcance y protocolo de prueba. Hoy: `docs/Prompts/Paso-*.md`.
- **referencia** — hechos consultables. `REGLAS_NEGOCIO.md`, `SUPUESTOS.md`, `TOKENS.md`.
- **estado** — foto de un momento. `HANDOFF_*.md`, `BITACORA.md`, `VALIDACION_*.md`.

Si un archivo no entra en ninguno, ponelo en `no claro` y decí por qué. Esa lista es
información, no un problema a resolver ahora.

---

## Tarea 2 — Duplicaciones

Para cada **hecho** que aparezca en más de un archivo, una fila con: el hecho, dónde aparece,
y **si las versiones coinciden o no**. Un hecho repetido y consistente es deuda; un hecho
repetido y contradictorio es una bomba.

Casos concretos que ya sabemos que hay que revisar — no son la lista completa, son el punto de
partida:

1. **`BASES.m2.hoja_default` sin fuente.** Aparece al menos en el handoff del 31/07, en el
   `Paso-2.10` Parte C, y en la columna `notas` de la propia hoja `BASES`. ¿Dicen lo mismo?
2. **El fix de `sembrarClasificacionSolapas()`** (dejó de pisar `filas_datos` /
   `firma_encabezado`). Se implementó en la Parte C del Paso 2.11. Buscalo en la
   documentación. Si no está en ningún lado, es el caso testigo del problema.
3. **`Paso-2.10_PartesBC_verificado.md`** — hay una versión commiteada que se considera vieja y
   una escrita después que la pisa. Verificá cuál está en el repo y si la vieja sigue viva.
4. **`CLAUDE.md`** — estuvo en `docs/` y se movió a la raíz. Confirmá que no quedó una copia.
5. **Los handoffs.** La regla es archivo nuevo por sesión, nunca se edita uno anterior, **un
   solo handoff vivo**. Verificá que se cumpla y decí cuáles están vivos.
6. **S-01** (`looker/resumen_metricas_dinamico` es la fuente, `resumen_metricas` es un pegado).
   Aparece en `SUPUESTOS.md`, en las `notas` de `BASES`, en las `notas` de `SOLAPAS` y en algún
   `Paso-2.9`. ¿Coinciden?

---

## Tarea 3 — Hechos sin respaldo documental

Al revés que la tarea anterior: **hechos que viven sólo en la planilla del motor y en ningún
documento del repo.** Si la planilla se pierde o se rehace, se pierden.

El caso conocido es la hoja `MARCADORES`: no tiene sembrador —los nueve `SEED_*` son de otras
hojas— así que sus filas existen únicamente en la planilla viva. Buscá si hay más.

---

## Tarea 4 — Documentos huérfanos y muertos

- **Huérfano:** nadie lo cita y él no cita a nadie.
- **Muerto:** describe algo que ya no existe en el código, o su última modificación es anterior
  a un cambio que lo invalida.

Para cada uno, la evidencia. No propongas borrar nada sin ella.

---

## Tarea 5 — La propuesta

Una tabla, un renglón por archivo, con una de estas cinco acciones y su justificación:

| acción | cuándo |
|---|---|
| `queda` | es el dueño único de su hecho |
| `se fusiona en X` | su contenido pertenece a otro archivo |
| `se vuelve puntero` | el hecho vive en otro lado; acá queda un enlace de una línea |
| `se archiva` | es estado histórico; va a `docs/_archivo/` |
| `se decide arriba` | no tenés elementos para decidir |

Y dos cosas más:

**a) El mapa resultante.** Una tabla `qué hecho` → `qué archivo lo posee` → `quién escribe ahí`
(humano / Code / los dos). Ese mapa es lo que después va a la §7 de `CLAUDE.md`, así que
escribilo en ese formato.

**b) La regla de precedencia.** Si dos documentos se contradicen y nadie los reconcilió
todavía, ¿cuál gana? Proponé un orden y justificalo. Sin esta regla, el mapa no sirve el día
que aparezca la primera contradicción nueva.

---

## Restricciones

- **No movés ni borrás nada.** El único archivo que creás es
  `docs/PROPUESTA_orden_documental.md`.
- **No arreglás las contradicciones que encuentres.** Las reportás con la evidencia. Elegir la
  versión correcta en silencio es exactamente el problema.
- **No inventás.** Si no podés determinar de qué es dueño un archivo, ponelo en
  `se decide arriba` y decí qué te falta.
- **Cada afirmación de tu propuesta lleva su evidencia**: ruta y, cuando corresponda, número de
  línea o fecha de commit. Una propuesta sin evidencia no se puede verificar, y una propuesta
  que no se puede verificar es otro documento razonable y posiblemente falso.

Cuando termines, cerrá con:

```
— PARADA —
Archivos inventariados: N
Duplicaciones encontradas: N (contradictorias: N)
Hechos sin respaldo: N
Huérfanos / muertos: N
Filas en `se decide arriba`: N
```

y esperá.
