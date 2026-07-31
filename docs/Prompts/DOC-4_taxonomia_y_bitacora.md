# DOC-4 — Cerrar la taxonomía y recuperar la bitácora por paso

> **Este prompt no toca código.** Solo declara estados de documentos, crea un archivo de
> bitácora, renombra y archiva. Todos sus commits son de documentación.
>
> **No consume número de paso.** Prefijo `DOC-N`, como el `DOC-1`.
>
> **Un commit por parte.** Push después de cada uno.

---

## El problema

El `DOC-1` (29/07) declaró una taxonomía de tres estados —vivo, congelado, archivado— y
clasificó 9 documentos. El 30/07 `docs/` tenía 8 archivos. **Hoy tiene 22.** Los 13 que
nacieron después no están declarados en ningún lado.

Eso no es un problema de desorden, es un problema de contrato: cuando llega información
nueva y ningún documento está declarado como el lugar donde va, lo más barato es crear un
archivo nuevo. Así se llegó de 8 a 22 en dos días.

**La corrección no es archivar.** Se verificó con `grep`: 16 de los 22 están citados desde
otros documentos, y varios se autodeclaran congelados en su propio encabezado. Archivarlos
rompería referencias y perdería trabajo bueno. Lo que falta es **declararlos**.

---

## Parte A — Declarar los 22 documentos

En `Plan Inicial/PROYECTO.md` §9, reemplazá la lista de la sección "Taxonomía de
documentos" por esta tabla completa. Mantené el texto explicativo de los tres estados que
ya está; lo que cambia es el inventario.

### Vivos — se editan cuando cambia lo que describen

| documento | qué contiene | quién lo edita |
|---|---|---|
| `Plan Inicial/PROYECTO.md` | maestro: arquitectura, decisiones, estado, convenciones | ambas herramientas |
| `docs/RUNBOOK.md` | cómo se opera y se corre | ambas |
| `docs/TOKENS.md` | diccionario de tokens | ambas |
| `docs/PENDIENTES_consistencia.md` | inconsistencias abiertas, sin resolver | ambas |
| `docs/REGLAS_NEGOCIO.md` | reglas del dominio con ID estable `R-NN` | ambas |
| `docs/SUPUESTOS.md` | supuestos asumidos con ID estable `S-NN` | ambas |
| `docs/BITACORA.md` | qué hizo cada paso, append-only (Parte B) | **solo Code** |
| `docs/HANDOFF_CODE.md` | estado actual del trabajo, se reescribe (Parte B) | **solo Code** |
| `docs/OBJETIVO_lamina_nueva.md` | objetivo de láminas por prompt; se refina | ambas |

`docs/Sesiones/` **no** es un directorio de documentos vivos: es el buzón donde el usuario
deja los handoffs que baja de sus conversaciones de claude.ai. Code lee de ahí y no escribe
nunca. Queda anotado en §9 con esas palabras, porque hasta ahora la convención no distinguía
quién era el autor y eso fue lo que hizo colapsar el `HANDOFF.md` único.

`REGLAS_NEGOCIO` y `SUPUESTOS` son **append-only**: se agregan filas, nunca se reutiliza un
ID, y una regla o supuesto que se cae se marca **derogado con fecha** en vez de borrarse.

### Congelados — se leen, no se editan

Son relevamientos, auditorías y hallazgos fechados: describen un momento, no el estado
actual. Si uno necesita cambiar, el cambio va a `PROYECTO.md`, o el documento pasa a vivo
explícitamente anotándolo acá.

| documento | fecha del relevamiento |
|---|---|
| `docs/MAPEO_completo.md` | — |
| `docs/HALLAZGOS_validacion_decks.md` | — |
| `docs/DISENO_match_temario.md` | — |
| `docs/CONFIG_INFORMES.md` | — |
| `docs/PLANTILLAS_QA_y_armonizacion.md` | — |
| `docs/FECHAS_seleccion.md` | 30/07 (ya se autodeclara congelado) |
| `docs/AUD-2_union_digital_clave.md` | 30/07, auditoría de solo lectura |
| `docs/RDV_otros_ministros_riesgo.md` | 30/07, hallazgo + generalización DOC-3 |
| `docs/SECCIONES.md` | inventario verificado contra informes publicados |
| `docs/INFORMES_relacion.md` | verificación token por token de ambas plantillas |
| `docs/GRANO_TEMPORAL.md` | doctrina: por qué la fecha de reunión no filtra canales |
| `docs/TEMARIO_Y_PLANTILLA_2026-07-31.md` | 31/07 |
| `docs/PERSONAS_equivalencias.csv` | tabla de referencia, no documento |

**Nota sobre `RDV_otros_ministros_riesgo.md`:** el documento queda congelado, pero su
sección "Qué falta" (el mecanismo de firma de encabezados, todavía sin implementar) tiene
que quedar registrada en `docs/PENDIENTES_consistencia.md`. Un pendiente vivo no puede
vivir dentro de un documento congelado. Copiala allá con una línea que apunte al origen.

### A resolver — un solo documento

`docs/DECISION-periodicidad-y-periodos.md` está marcado **"Estado: propuesta (a
confirmar)"** desde que se escribió. No lo clasifiques por tu cuenta: **preguntá al
usuario si la decisión está confirmada.**

- Si está confirmada → su contenido va a `PROYECTO.md` §4 (períodos) y el archivo se mueve
  a `Plan Inicial/_archivo/`.
- Si sigue abierta → queda **vivo** y se agrega a `PENDIENTES_consistencia.md` como
  decisión pendiente, para que no se olvide otra vez.

→ **Commit A:** `Doc: taxonomía completa de los 22 documentos en PROYECTO.md §9`

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

**Última actualización:** <AAAA-MM-DD> · commit `<hash>`

## Dónde estamos
<último paso cerrado y su resultado, 2–3 líneas>

## Qué sigue
<el próximo paso y su prompt en docs/Prompts/>

## Trabado
<qué espera decisión del usuario, o "nada">
```

### B.2 — `docs/BITACORA.md`

Crealo con este encabezado y esta plantilla:

```markdown
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

## Paso <N> — <nombre corto> (<AAAA-MM-DD>) — commit `<hash>`
- **Qué pedía el prompt:** 1–2 líneas, el objetivo.
- **Qué se hizo:** archivos y funciones editados, hojas/columnas/menús tocados.
- **Prueba:** cómo se probó y con qué resultado.
- **Pendientes/decisiones:** si quedó algo abierto → también a `PENDIENTES_consistencia.md`.
  Si no, "ninguno".
```

Después, **reconstruí hacia atrás las entradas de los pasos ya ejecutados** leyendo
`git log` y los handoffs de `docs/Sesiones/`. No inventes lo que no puedas verificar: si
un campo no surge de la evidencia, escribí `sin registro`. El valor está en tener la serie
completa, no en rellenarla.

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

`docs/TEMARIO_Y_PLANTILLA_2026-07-31.md` cita a `HANDOFF_2026-07-31.md` con el nombre
viejo — corregí esa referencia. Es un documento congelado, pero arreglar un link roto no
es editar contenido.

→ **Commit C:** `Chore: convención de handoffs — renombre y archivado`

---

## Parte D — Cerrar el ciclo en `CLAUDE.md`

En la raíz hay un `CLAUDE.md` con la tabla de ruteo documental. Agregale dos filas:

| Qué estás por escribir | Dónde va |
|---|---|
| Regla del dominio que el motor da por cierta | `docs/REGLAS_NEGOCIO.md`, ID `R-NN` nuevo |
| Supuesto asumido para poder avanzar | `docs/SUPUESTOS.md`, ID `S-NN` nuevo |
| Qué hizo un paso | `docs/BITACORA.md` — entrada nueva |
| Dónde quedó el trabajo | `docs/HANDOFF_CODE.md` — se reescribe |

Y en la sección 4 (flujo de trabajo), el paso 3 queda:

> 3. Recién ahí se documenta y se commitea: **entrada en `docs/BITACORA.md` siempre**,
>    `docs/HANDOFF_CODE.md` reescrito, y `PROYECTO.md` si el paso cambió algo estructural.

El `CLAUDE.md` que está en la raíz ya trae estos cambios aplicados — verificá que coincida
antes de editarlo, y si coincide este commit solo confirma que no quedó desfasado.

→ **Commit D:** `Doc: ruteo de reglas, supuestos y bitácora en CLAUDE.md`

---

## Prueba del usuario

1. `ls docs/Sesiones/` → un solo handoff, `HANDOFF 2026-07-31.md`.
2. Abrir `PROYECTO.md` §9 → los 22 documentos de `docs/` aparecen en alguna de las tres
   tablas. Ninguno queda afuera.
3. Abrir `docs/BITACORA.md` → plantilla al inicio y una entrada por cada paso ejecutado.
   Abrir `docs/HANDOFF_CODE.md` → dice en qué paso estamos y qué sigue, en menos de una
   pantalla.
4. `grep -rn "HANDOFF_2026" docs/` → sin resultados.
5. Pedirle a Code algo que normalmente terminaría en un archivo nuevo (por ejemplo:
   "documentá el criterio de la columna de fecha de M2"). Tiene que preguntar dónde
   ponerlo o elegir un archivo de la tabla — no crear `docs/M2_fechas.md`.
