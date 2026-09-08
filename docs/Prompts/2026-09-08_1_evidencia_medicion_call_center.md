# 2026-09-08_1 — La medición de Call Center: evidencia, casos y la contradicción resuelta

**Objetivo único:** dejar escrita como evidencia citable la medición que ya corrió, y **resolver
con ella la contradicción documental `7.096` vs `6.851`**.
⛔ **No cablear. No dar de alta la base. No escribir `BASES`, `SOLAPAS`, `MAPEO` ni
`MARCADORES`.** El alta y el cableado son el prompt siguiente.

**Subagente: ninguno.**

| parte | modelo | effort | escribe |
|---|---|---|---|
| **A** | Sonnet | normal | ⛔ nada — sólo lectura, reportar y parar |
| **B** | Sonnet | normal | `docs/MEDICION_universo_call_center_2026-09-08.md` + el censo del `_1` |
| **C** | **Opus** | **alto** | `docs/casos_validacion_2026-09-08.csv` — casos nuevos y estados |

**C va en Opus:** resuelve una contradicción documental entre casos **cerrados** y declara
`exacto` sobre números que van a decidir un cableado publicable. **B es volcado de un log** y no
decide nada.

**Sacrificabilidad:** A imprescindible. Si falta presupuesto se sacrifica **B**, no C: el log
está en la conversación y se puede volcar después, pero los casos sin escribir dejan la
medición sin testigo y el prompt siguiente sin número esperado.

---

## Lo medido — corrida del 2026-09-08, `medirUniversoCallCenterBaseNueva`

Sobre `Call Center - Métricas` de `1f8Jy9S09EjWhXo-RF6llXnk8alQCJxWSZAdnfp3WR60`, 1980 filas.

**`Fecha` (K): `Date` en las 1980. Cero texto, cero vacías.** No hay ambigüedad de formato ni
período tipeado a mano — `R-02` no se activa.

**`Remitente` (Q), toda la solapa:** `GCBA` 1400 · `JM` 476 · `ANUNCIO` 88 · vacía 10 ·
`#N/A` 5 · `No se activó` 1. Seis valores distintos.

⭐ **El criterio ganador, y reproduce las DOS ventanas:**

| criterio | 24–31/07 | 14–20/08 |
|---|---|---|
| `Fecha` en ventana, sin otro corte | 20 filas · 13 cuentas · **29.739** | 13 filas · 9 cuentas · **20.175** |
| **`Fecha` en ventana + `Remitente = JM`** | 3 filas · **1 cuenta** · **6.011** ✅ | 3 filas · **1 cuenta** · **6.851** ✅ |
| `Fecha` en ventana + `Remitente = GCBA` | 17 · 12 · 23.728 | 10 · 8 · 13.324 |
| **residuo** (ni `JM` ni `GCBA`) | **0** | **0** |

**La identidad de control cerró en las dos ventanas**, en filas y en `Base Barrida`.
`6.011` es `V-105`; `6.851` es lo que `C-80` registra como publicado por el equipo.

⚠ **`ANUNCIO`, las vacías y `#N/A` existen en la solapa pero NO caen en estas dos ventanas.**
El residuo da cero **acá**, no siempre. El corte positivo por los dos lados es lo que hace que
esas filas se vuelvan visibles el día que caigan dentro.

---

## La contradicción, resuelta por la sonda

⭐⭐ **`3488-AGOJDGAG` tiene CUATRO filas, no tres.** La sonda las imprimió sin ventana:

```
Convocatoria      Fecha 2026-08-14   Base Barrida 6000
Confirmación      Fecha 2026-08-14   Base Barrida  802
IVR Convocatoria  Fecha 2026-08-14   Base Barrida   49
IVR Convocatoria  Fecha 2026-08-13   Base Barrida  245   ← FUERA de 14–20/08
```

```
6.000 + 802 + 49        = 6.851   ·  las filas con Fecha EN la ventana  → el deck
6.000 + 802 + 49 + 245  = 7.096   ·  las cuatro filas de la CUENTA      → C-69
```

⛔ **No era una contradicción: `C-69` midió por CUENTA y el deck publica por FECHA.** Los dos
son correctos sobre preguntas distintas. `looker/CC` no podía distinguirlas —no tiene columna
temporal propia— y por eso el repo guardó los dos números sin poder desempatarlos.

**Del lado de contactados la diferencia es `94`, y es la misma fila:** `V-97` la midió en
`245`/`94` sobre la ventana anterior.

⚠ **`C-69` no se retracta.** Su medición sigue siendo correcta y su hallazgo central —que la
cuenta de la ventana es `3488` y no `3289`— no se toca. Lo que se agrega es **de qué universo
es cada número**.

---

## ⭐ Y lo que esto le hace a `C-80`, que es la parte que decide

`C-80` está **abierto** y afirma que *«el Resumen Ejecutivo mezcla dos universos: mail e
impresiones publican todo JM de la semana, Call Center publica UNA cuenta»*. `X-28` fue
**reformulado** alrededor de esa afirmación, y `CONFIG_INFORMES.md` §4.7 escribió una regla
provisoria con `_revisar` esperando *«una frase del equipo»*.

**Lo medido dice otra cosa:** con `Fecha` propia, *«todo JM de la semana»* **es** una sola
cuenta — 3 filas de 20 en julio, 3 de 13 en agosto. El bloque **no mira un universo más
angosto**: mira el mismo que el resto de su lámina, y da una cuenta porque en esas dos ventanas
hubo una sola cuenta de JM con call center.

⛔ **La premisa que sostenía a `C-80` era un artefacto de la fuente vieja:** el recorte por
pertenencia sobre `looker/CC` traía 18 y 21 cuentas —el gabinete entero— y de ese factor 16 se
dedujo *«dos universos»*. El factor no era del negocio: era **la falta de una columna de
fecha**.

**Opus decide, contra el repo y no contra este prompt:** si `C-80` se cierra, si `X-28` se
cierra, y qué pasa con la regla provisoria de §4.7. ⛔ **Si decide cerrarlos, NO edita
`CONFIG_INFORMES.md` ni `PLAN.md` en este prompt** — lo declara en el reporte y lo deja para el
prompt del alta, que es donde se toca la configuración. Un caso se escribe acá; una decisión
editorial se escribe allá.

---

## Parte A — Premisas

**Sonnet · normal · SÓLO LECTURA · «reportar y parar».** ⛔ Cero ediciones.

1. **Máximos de ID vigentes**, con el grep que los reproduce, sobre `.md`, `.gs` **y `.csv`**:
   `V-`, `C-`, `X-`, `D-`, `R-`, `S-`. (Al escribir esto daban `V-125`, `C-106`, `X-43`,
   `D-60`, `R-34`, `S-06`.) ⛔ **Los números nuevos salen de esta medición, no de este prompt.**
2. **Los casos que este prompt va a tocar**, leídos del CSV más nuevo que los nombre:
   `C-69`, `C-80`, `X-28`, `X-37`, `V-97`, `V-105`. Reportar estado y clave.
   ⚠ **Cruzar el bloque `resumen_ejecutivo_jm` entero**, no sólo estos seis.
3. **El esquema del CSV de casos**: encabezado exacto y el vocabulario de `estado` admitido.
   ⛔ **No inventar un estado nuevo.**
4. **`D-56`, `D-58`, `D-60`** — transcribir qué mandan sobre casos con fecha, casos en
   conflicto y publicación sin `_revisar`. Son las que gobiernan lo que escribe la Parte C.
5. **La fila de `CLAUDE.md` §7 que declara dueño a `MEDICION_*` y a `CENSO_solapas_*`** —
   confirmar el patrón de nombre y que son **congelados, uno nuevo por corrida**.

**Reportar y parar** si 3 o 4 sale desmentida.

---

## Parte B — La evidencia

**Sonnet · normal.**

**B.1 — `docs/MEDICION_universo_call_center_2026-09-08.md`**, congelado.

Vuelca la corrida entera: fecha de lectura **declarada arriba**, la matriz de los nueve
criterios con sus cuatro salidas por ventana, las listas de cuentas, el censo de `Remitente`,
el formato de `Fecha`, la sonda de las dos cuentas fila por fila, y la identidad de control.

⭐ **Y declara los dos límites que el propio log declara**, sin suavizarlos:

- Mide **definiciones de negocio**, no el motor: la base no está de alta y ningún marcador la
  toca.
- **El criterio 6 es media definición** — la pertenencia no es reproducible sobre esta solapa.
- ⭐⭐ **El control positivo NO pasó, y por qué eso NO invalida la matriz.** El criterio 6 tenía
  que traer `3289` en agosto según `C-69`; no lo trajo, y **no puede**: `C-69` describe una
  entrada **por pertenencia**, y con `Fecha` propia una cuenta de julio nunca cae en la ventana
  de agosto. **Es un control cuyo positivo era un defecto de la fuente vieja, y quedó inerte
  cuando el defecto dejó de existir.** ⛔ Esto se escribe como hallazgo de método, no como una
  disculpa: un control inerte que se lee como «falla» manda a buscar un bug que no está.

**B.2 — el censo del `2026-09-07_1`**, que corrió y **no quedó en el repo**.

Crear `docs/CENSO_solapas_directa_acumulado_2026-09-07.md` con el log de esa corrida: nombre
del archivo (`DGPLES - Directa acumulado`), las **38** solapas con su forma, y el detalle de
las tres de interés con los encabezados celda por celda —**incluidos los seis de `IVR` con
`\n`**— y los conteos por columna.

⚠ **El log está en la conversación, no en el repo.** Si no se puede recuperar entero, **escribir
lo que haya y declarar qué falta** — un censo parcial declarado sirve; uno completado de
memoria, no.

⛔ **No crear ningún otro `.md`.** ⛔ **No editar `CONFIG_INFORMES.md`, `PLAN.md`,
`REGLAS_NEGOCIO.md` ni `PENDIENTES_consistencia.md`.**

---

## Parte C — Los casos

**Opus · effort alto.**

Crear `docs/casos_validacion_2026-09-08.csv` con el **mismo encabezado exacto** que el CSV
anterior. ⛔ **Los `caso_id` no se reusan nunca**; salen del máximo medido en A.

**Lo que tiene que quedar escrito** —Opus decide el `estado` de cada uno y **el reparto entre
series `V` y `C`**, contra el vocabulario que midió en A:

1. **`cc_base` = `6.011`** con clave `Remitente=JM` + `Fecha en 24–31/07` sobre
   `Call Center - Métricas`. Reproduce `V-105` **por otro camino y sobre otra fuente**.
2. **`cc_base` = `6.851`** con la misma clave sobre `14–20/08`. ⭐ Es el número que hasta hoy
   **ninguna regla escrita reproducía**.
3. **La reconciliación `7.096` = `6.851` + `245`**, con la cuarta fila y su fecha `13/08`.
   Es lo que cierra el conflicto entre `C-69`/`X-37` y `C-80`/`X-28`.
4. **El residuo cero y su alcance**: `JM` y `GCBA` particionan **estas dos ventanas**, y en la
   solapa entera hay 104 filas que no son ninguno de los dos.
5. **El control inerte** de B.1, como caso de método.

⚠ **`V-105`, `V-97` y `C-69` no se retractan ni se editan** — son de otra fuente y siguen
siendo ciertos. Si Opus cree que alguno tiene que cambiar de estado, **lo reporta y no lo
cambia**: retractar un `exacto` es decisión del usuario.

⛔ **No escribir `_revisar` ni tocar `formato` de ninguna fila.** Eso vive en `MARCADORES` y en
§4.7, y es el prompt siguiente.

---

## Reporte

```
PARTE A
  1 máximos ................ V-__ C-__ X-__ D-__ R-__ S-__   [comando]
  2 los seis casos + bloque entero ...
  3 esquema CSV y vocabulario de estado ...
  4 D-56 / D-58 / D-60 ...
  5 §7: MEDICION_* y CENSO_solapas_* ...

PARTE B
  MEDICION_..._2026-09-08.md ......... creado / no
  CENSO_solapas_..._2026-09-07.md .... creado / parcial (qué falta) / no

PARTE C
  casos_validacion_2026-09-08.csv .... creado / no
  ids asignados ...................... …
  C-80 y X-28: qué corresponde ....... cerrar / no  ⛔ DECLARADO, NO EJECUTADO
  casos que cambiarían de estado ..... … ⛔ reportados, no cambiados

BLOQUEANTES
FUERA DE ALCANCE  —  anotar, no arreglar
```

⛔ **No inventar el faltante.** Si el prompt no alcanza, se reporta como falta.
