# DOC-4 — Cerrar la taxonomía y recuperar la bitácora por paso

> **Este prompt no toca código.** Solo declara estados de documentos, crea un archivo de
> bitácora, renombra y archiva. Todos sus commits son de documentación.
>
> **No consume número de paso.** Prefijo `DOC-N`, como el `DOC-1`.
>
> **Un commit por parte.** Push después de cada uno.

---

## Estado de partida — verificar antes de empezar

Este prompt se escribió contra un repo verificado. Si algo de esto no coincide, **parar y
avisar** en vez de improvisar:

- `CLAUDE.md` está en la **raíz** del repo. (El usuario lo movió a mano desde `docs/`
  antes de correr este prompt. Si todavía está en `docs/`, avisá y no sigas: la Parte D
  depende de eso.)
- `docs/` tiene 20 archivos y dos directorios (`Prompts/`, `Sesiones/`).
- `docs/Sesiones/_archivo/` y `Plan Inicial/_archivo/` ya existen. No hay que crearlos.

```bash
ls -1 CLAUDE.md
ls -p docs/ | grep -v / | wc -l    # esperado: 20
ls -d docs/Sesiones/_archivo "Plan Inicial/_archivo"
```

**Al terminar el prompt, `docs/` tiene 21 archivos:** se van `CLAUDE.md` (ya movido) y
`DECISION-periodicidad-y-periodos.md` (se archiva en la Parte A), y entran `BITACORA.md`
y `HANDOFF_CODE.md`.

---

## El problema

El `DOC-1` (29/07) declaró una taxonomía de tres estados —vivo, congelado, archivado— y
clasificó 9 documentos. El 30/07 `docs/` tenía 8 archivos. **Hoy tiene 20 más dos
directorios.** Los que nacieron después no están declarados en ningún lado.

Eso no es un problema de desorden, es un problema de contrato: cuando llega información
nueva y ningún documento está declarado como el lugar donde va, lo más barato es crear un
archivo nuevo. Así se llegó de 8 a 20 en dos días.

**La corrección no es archivar.** Se verificó con `grep`: la mayoría están citados desde
otros documentos, y varios se autodeclaran congelados en su propio encabezado. Archivarlos
rompería referencias y perdería trabajo bueno. Lo que falta es **declararlos**.

---

## Parte A — Declarar todos los documentos y cerrar la decisión de períodos

### A.1 — Reemplazar el inventario de `PROYECTO.md` §9

En `Plan Inicial/PROYECTO.md` §9, reemplazá la lista de la sección "Taxonomía de
documentos" por estas tablas. Mantené el texto explicativo de los tres estados que ya
está; lo que cambia es el inventario.

**Vivos — se editan cuando cambia lo que describen**

| documento | qué contiene | quién lo edita |
|---|---|---|
| `CLAUDE.md` (raíz) | convenciones de repo y ruteo documental para las herramientas | ambas |
| `Plan Inicial/PROYECTO.md` | maestro: arquitectura, decisiones, estado, convenciones | ambas |
| `docs/RUNBOOK.md` | cómo se opera y se corre | ambas |
| `docs/TOKENS.md` | diccionario de tokens | ambas |
| `docs/PENDIENTES_consistencia.md` | inconsistencias abiertas, sin resolver | ambas |
| `docs/REGLAS_NEGOCIO.md` | reglas del dominio con ID estable `R-NN` | ambas |
| `docs/SUPUESTOS.md` | supuestos asumidos con ID estable `S-NN` | ambas |
| `docs/OBJETIVO_lamina_nueva.md` | objetivo de láminas por prompt; se refina | ambas |
| `docs/BITACORA.md` | qué hizo cada paso, append-only (Parte B) | **solo Code** |
| `docs/HANDOFF_CODE.md` | estado actual del trabajo, se reescribe (Parte B) | **solo Code** |

**Congelados — se leen, no se editan**

Son relevamientos, auditorías y hallazgos fechados: describen un momento, no el estado
actual. Si uno necesita cambiar, el cambio va a `PROYECTO.md`, o el documento pasa a vivo
explícitamente anotándolo acá.

| documento | qué relevó |
|---|---|
| `docs/MAPEO_completo.md` | relevamiento original del mapeo; la verdad viva es la hoja `MAPEO` |
| `docs/HALLAZGOS_validacion_decks.md` | validación contra decks publicados |
| `docs/DISENO_match_temario.md` | diseño del match de temario |
| `docs/CONFIG_INFORMES.md` | decisiones de configuración por informe |
| `docs/PLANTILLAS_QA_y_armonizacion.md` | QA y equivalencia de slides entre plantillas |
| `docs/FECHAS_seleccion.md` | 30/07 — ya se autodeclara congelado |
| `docs/AUD-2_union_digital_clave.md` | 30/07 — auditoría de solo lectura |
| `docs/RDV_otros_ministros_riesgo.md` | 30/07 — hallazgo + generalización DOC-3 |
| `docs/SECCIONES.md` | inventario verificado contra informes publicados |
| `docs/INFORMES_relacion.md` | verificación token por token de ambas plantillas |
| `docs/GRANO_TEMPORAL.md` | doctrina: por qué la fecha de reunión no filtra canales |
| `docs/TEMARIO_Y_PLANTILLA_2026-07-31.md` | 31/07 — temario y diff de plantilla |

**Tablas de referencia — ni vivas ni congeladas**

| archivo | qué es |
|---|---|
| `docs/PERSONAS_equivalencias.csv` | tabla de equivalencias. Se actualiza cuando cambia el padrón, no es prosa y no lleva estado |

**Directorios**

| directorio | quién escribe | regla |
|---|---|---|
| `docs/Prompts/` | ambas | un archivo por paso, auditoría o trabajo documental: `Paso-N.md`, `AUD-N_*.md`, `DOC-N_*.md`. No se editan una vez ejecutados |
| `docs/Sesiones/` | **solo claude.ai** | buzón donde el usuario deja los handoffs que baja de sus conversaciones. Code lee de ahí y **no escribe nunca**. Solo queda el más reciente; el resto en `_archivo/` |
| `Plan Inicial/_archivo/` | ambas | historial: documentos superados, plantillas espejo |

`docs/Sesiones/` queda anotado con esas palabras porque hasta ahora la convención no
distinguía quién era el autor, y eso fue lo que hizo colapsar el `HANDOFF.md` único.

`REGLAS_NEGOCIO` y `SUPUESTOS` son **append-only**: se agregan filas, nunca se reutiliza un
ID, y una regla o supuesto que se cae se marca **derogado con fecha** en vez de borrarse.

**Nota sobre `RDV_otros_ministros_riesgo.md`:** el documento queda congelado, pero su
sección "Qué falta" (el mecanismo de firma de encabezados, todavía sin implementar) tiene
que quedar registrada en `docs/PENDIENTES_consistencia.md`. Un pendiente vivo no puede
vivir dentro de un documento congelado. Copiala allá con una línea que apunte al origen.

### A.2 — Reescribir las otras dos subsecciones de §9

§9 tiene, después de la taxonomía, dos subsecciones más: "Convención de trabajo: un commit
por paso" y "Convención de HANDOFF: un archivo nuevo por sesión, fechado". **Las dos
quedan contradiciendo a `CLAUDE.md` §4 y §5 apenas se aplique la Parte B.** Si se toca
solo el inventario, el maestro queda diciendo una cosa y el `CLAUDE.md` otra sobre dónde
escribe Code — que es exactamente el tipo de divergencia que este prompt viene a cerrar.

- En **"un commit por paso"**, el punto 3 dice hoy que la doc se actualiza en
  `docs/Sesiones/HANDOFF AAAA-MM-DD.md`. Reemplazalo por: *entrada en `docs/BITACORA.md`
  siempre, `docs/HANDOFF_CODE.md` reescrito, y `PROYECTO.md` si el paso cambió algo
  estructural.* Los otros puntos quedan como están.
- **"Convención de HANDOFF"** pasa a describir el régimen de dos dueños de la Parte B.
  Conservá el párrafo que explica el conflicto de sincronización de OneDrive: es la razón
  de ser de la convención y sin él la regla parece arbitraria. Lo que cambia es la
  conclusión: el problema no era el archivo único, eran los dos autores.

### A.3 — Cerrar `DECISION-periodicidad-y-periodos.md`

**El usuario confirmó la decisión** (31/07): los informes son **semanales**, se eligen las
reuniones de la semana, y el informe se arma a partir de un **listado de reuniones** —
coherente con la hoja `REUNIONES` que ya existe desde el commit `12afd0e`.

El contenido va a `PROYECTO.md` §4, que hoy solo tiene las tres capas de resolución. Falta
incorporar:

1. **Los dos informes son semanales por defecto**, y la periodicidad sale de configuración,
   no del código ni de la plantilla.
2. **La ventana por defecto la define la reunión** cargada al inicio del ciclo. Cargar la
   reunión es la única acción manual para mover el informe de una semana a la siguiente.
3. **No hay corte diario de datos.** El motor lee en vivo al momento de la corrida; no
   consume snapshot. De ahí se desprende que dos corridas del mismo `id_periodo` pueden
   dar números distintos —no es un bug— y que el informe necesita estampa de actualización.
4. El esquema de la hoja **`PERIODOS`** (`id_periodo`, `tipo`, `fecha_desde`,
   `fecha_hasta`, `etiqueta`, `reunion`).

Después: `git mv docs/DECISION-periodicidad-y-periodos.md "Plan Inicial/_archivo/"`.
Verificá antes que no lo cite ningún documento fuera de `docs/Prompts/` — al 31/07 no lo
citaba nadie.

**Los pendientes del documento no se archivan con él.** Su sección "Pendiente de confirmar"
tiene cinco ítems. Uno ya está resuelto y se cierra; los otros cuatro van a
`docs/PENDIENTES_consistencia.md` respetando el formato de prioridades que ese archivo ya
usa:

| ítem | destino |
|---|---|
| Si "reunión" es entidad propia o columna de `PERIODOS` | **cerrado** — la hoja `REUNIONES` existe (commit `12afd0e`) |
| Si la ventana semanal se deriva de la fecha de la reunión o se carga a mano | → PENDIENTES |
| Qué columna de fecha usa cada base para filtrar | → PENDIENTES (cruzarlo con `GRANO_TEMPORAL.md`, que ya sostiene que la fecha de reunión no filtra canales) |
| Si la ventana cierra el día anterior a la reunión o incluye el día parcial | → PENDIENTES |
| Nombre definitivo del token de estampa de actualización | → PENDIENTES (y a `docs/TOKENS.md` cuando se decida) |

→ **Commit A:** `Doc: taxonomía completa en PROYECTO.md §9 + decisión de períodos confirmada`

---

## Parte B — Revivir el handoff de Code y recuperar la bitácora

El `HANDOFF.md` único se abandonó el 29/07 por un conflicto de sincronización: lo editaban
las dos herramientas y quedaban dos versiones simultáneas. La convención que lo reemplazó
—un archivo nuevo fechado por sesión— resolvió el conflicto pero produjo dos daños. Se
perdió la bitácora por paso que había instaurado el Paso 1.8 Parte C, y Code se quedó sin
ningún archivo propio donde decir dónde quedó el trabajo.

**El conflicto no lo causaba el archivo único: lo causaba que tuviera dos autores.** Con un
solo dueño, un archivo único es seguro. Entonces Code recupera el suyo, y se separan por
función:

| archivo | dueño | cómo se escribe | para qué |
|---|---|---|---|
| `docs/HANDOFF_CODE.md` | solo Code | **se reescribe entero** | dónde quedó el trabajo, ahora |
| `docs/BITACORA.md` | solo Code | **append-only** | qué hizo cada paso, para siempre |
| `docs/Sesiones/HANDOFF AAAA-MM-DD.md` | solo claude.ai | archivo nuevo, nunca se edita | qué se verificó y decidió en esa conversación |

La distinción entre los dos primeros es la que evita que se dupliquen: el handoff es un
**puntero al presente** y no acumula; la bitácora es **historia** y no se toca. Si al
actualizar el handoff sentís que estás borrando algo que vale la pena conservar, eso va a
la bitácora, no abajo en el handoff.

### B.1 — `docs/HANDOFF_CODE.md`

Crealo con el estado real de hoy, leído de `git log` y del handoff del 31/07. Estructura
fija, corta, sin narrativa:

```markdown
# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.
> Los handoffs de `docs/Sesiones/` son de claude.ai — se leen, no se tocan.

**Última actualización:** <AAAA-MM-DD> · último commit al escribirlo: `<hash>`

## Dónde estamos
<último paso cerrado y su resultado, 2–3 líneas>

## Qué sigue
<el próximo paso y su prompt en docs/Prompts/>

## Trabado
<qué espera decisión del usuario, o "nada">
```

El hash es el del **último commit existente** al momento de escribir el archivo (`git rev-parse --short HEAD`),
no el del commit que está por hacerse — ese todavía no existe.

### B.2 — `docs/BITACORA.md`

Crealo con este encabezado, y la plantilla **dentro de un bloque de código** para que no se
lea como una entrada más:

````markdown
# BITÁCORA — qué hizo cada paso

> Una entrada por paso, en orden cronológico, **append-only**: nunca se edita ni se borra
> una entrada anterior. Se escribe *antes* del commit del paso, no después.
>
> **Este archivo lo escribe solo Claude Code.** Un solo autor, por eso puede ser un archivo
> único sin repetir el conflicto de sincronización que partió el `HANDOFF.md` original.
>
> Diferencia con los handoffs: `HANDOFF_CODE.md` dice **dónde estamos** y se reescribe;
> los de `docs/Sesiones/` narran una **conversación de claude.ai**. Esta bitácora registra
> un **paso** y es un formulario. Si buscás "qué cambió en el Paso 2.7", se busca acá.

## Plantilla

```markdown
## Paso <N> — <nombre corto> (<AAAA-MM-DD>) — commit `<hash>`
- **Qué pedía el prompt:** 1–2 líneas, el objetivo.
- **Qué se hizo:** archivos y funciones editados, hojas/columnas/menús tocados.
- **Prueba:** cómo se probó y con qué resultado.
- **Pendientes/decisiones:** si quedó algo abierto → también a `PENDIENTES_consistencia.md`.
  Si no, "ninguno".
```

## Entradas
````

**Sobre el hash de cada entrada:** la entrada se escribe antes del commit que la contiene,
así que su hash todavía no existe. Escribí `pendiente` y completalo con
`git commit --amend` inmediatamente después, o dejá el hash del commit anterior y aclaralo.
Elegí una de las dos y usá siempre la misma — lo que no puede pasar es inventar un hash.

Después, **reconstruí hacia atrás las entradas de los pasos ya ejecutados** leyendo
`git log` y los handoffs de `docs/Sesiones/`. Son 113 commits al 31/07, con mensajes del
tipo `Paso 2.9 ✅ — <resumen>`: agrupá por paso, no una entrada por commit. No inventes lo
que no puedas verificar: si un campo no surge de la evidencia, escribí `sin registro`. El
valor está en tener la serie completa, no en rellenarla.

→ **Commit B:** `Doc: HANDOFF_CODE.md revivido + bitácora por paso recuperada del Paso 1.8`

---

## Parte C — Higiene de los handoffs de claude.ai

Son los de `docs/Sesiones/`. Tres derivas contra la convención de `PROYECTO.md` §9:

```bash
git mv "docs/Sesiones/HANDOFF_2026-07-31.md" "docs/Sesiones/HANDOFF 2026-07-31.md"
git mv "docs/Sesiones/HANDOFF 2026-07-29.md"   docs/Sesiones/_archivo/
git mv "docs/Sesiones/HANDOFF 2026-07-29-2.md" docs/Sesiones/_archivo/
git mv "docs/Sesiones/HANDOFF 2026-07-30.md"   docs/Sesiones/_archivo/
git mv "docs/Sesiones/HANDOFF 2026-07-30-2.md" docs/Sesiones/_archivo/
```

El nombre con guión bajo rompe el patrón `HANDOFF AAAA-MM-DD.md`; los otros cuatro son
historial y la regla ya dice que solo el más reciente es punto de partida. En
`docs/Sesiones/` queda **uno solo**: el del 31/07.

`docs/TEMARIO_Y_PLANTILLA_2026-07-31.md` línea 3 cita a `HANDOFF_2026-07-31.md` con el
nombre viejo — corregí esa referencia. Es un documento congelado, pero arreglar un link
roto no es editar contenido.

→ **Commit C:** `Chore: convención de handoffs — renombre y archivado`

---

## Parte D — Verificar `CLAUDE.md`, no reescribirlo

`CLAUDE.md` (raíz) **ya trae aplicado** todo lo que este prompt necesita: §3 tiene las
cuatro filas de ruteo (`BITACORA.md`, `HANDOFF_CODE.md`, `REGLAS_NEGOCIO.md`,
`SUPUESTOS.md`), §4 punto 3 ya dice *entrada en `docs/BITACORA.md` siempre*, y §5 ya
describe los dos handoffs con sus dueños.

Entonces esta parte es **de verificación, no de edición**. Comprobá que siga así después
de las Partes A–C y que no haya quedado desfasado respecto de `PROYECTO.md` §9. Dos cosas
que sí pueden necesitar toque, porque cambiaron con la mudanza a la raíz:

- El mapa del repo (§6) tiene que listar `CLAUDE.md` en la raíz, y `docs/` sin él.
- Si `PROYECTO.md` §9 quedó con alguna palabra distinta a `CLAUDE.md` §5 sobre quién
  escribe dónde, alineá las dos.

**Si no hay nada que cambiar, no hagas un commit vacío.** Reportá "CLAUDE.md verificado,
sin cambios" y seguí. Un commit sin diff no es un registro, es ruido.

→ **Commit D (solo si hubo cambios):** `Doc: CLAUDE.md alineado con la taxonomía de §9`

---

## Prueba del usuario

1. `ls -p docs/ | grep -v / | wc -l` → **21**. Y `ls docs/Sesiones/` → un solo handoff,
   `HANDOFF 2026-07-31.md`.
2. Abrir `PROYECTO.md` §9 → los 21 archivos de `docs/`, más `CLAUDE.md` y `PROYECTO.md`,
   aparecen en alguna tabla. Ninguno queda afuera. Los dos directorios también tienen
   renglón.
3. §9 no se contradice con `CLAUDE.md` §4–§5: los dos dicen que Code escribe en
   `BITACORA.md` + `HANDOFF_CODE.md` y no en `docs/Sesiones/`.
4. `docs/BITACORA.md` → plantilla al inicio (en bloque de código, no como entrada) y una
   entrada por cada paso ejecutado. `docs/HANDOFF_CODE.md` → dice en qué paso estamos y
   qué sigue, en menos de una pantalla.
5. `grep -rn "HANDOFF_2026" docs/ --exclude-dir=Prompts` → sin resultados.
   *(La exclusión es necesaria: este prompt se cita a sí mismo tres veces.)*
6. `PROYECTO.md` §4 dice que los informes son semanales y que la ventana la define la
   reunión. `docs/DECISION-periodicidad-y-periodos.md` ya no está en `docs/`, y sus cuatro
   pendientes abiertos están en `PENDIENTES_consistencia.md`.
7. Pedirle a Code algo que normalmente terminaría en un archivo nuevo (por ejemplo:
   "documentá el criterio de la columna de fecha de M2"). Tiene que preguntar dónde
   ponerlo o elegir un archivo de la tabla — no crear `docs/M2_fechas.md`.
