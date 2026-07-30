# DOC-1 — Consolidar, renombrar y reducir la documentación

> **Este prompt no toca código.** Solo mueve, renombra, fusiona y borra documentos, y
> escribe decisiones que ya están tomadas. Todos sus commits son de documentación.
>
> **No consume número de paso.** Los `Paso-N.md` son pasos del motor; el trabajo
> documental va con prefijo `DOC-N`. Dejalo asentado en `PROYECTO.md` §9, porque hasta
> ahora la doc competía por números con el código y eso desordena el plan.
>
> **Se puede correr en cualquier momento**, incluso entre el 2.4 y el 2.5. No bloquea nada
> y nada lo bloquea.
>
> **Un commit por parte.**

---

## Estado de partida

`docs/` tiene **13 `.md` vivos (~2.100 líneas)** más 4 handoffs (~900) y 16 prompts.
`PROYECTO.md` §9 declara que *"este PROYECTO.md es el único doc que se actualiza"*, y eso
hoy no es cierto: hay al menos seis docs que se siguen editando. La regla es buena; lo que
falta es decir de cada archivo **si está vivo, congelado o archivado**.

Objetivo: **de 13 a 8 docs vivos**, sin perder nada que no esté en otro lado.

---

## Parte A — Renombres y archivado

### A.1 El handoff de hoy

```
git mv "docs/Sesiones/HANDOFF — Motor de Informes (GCBA) · v2 · 29072026.md" \
       "docs/Sesiones/HANDOFF 2026-07-29-2.md"
```

La convención de `PROYECTO.md` §9 es `HANDOFF AAAA-MM-DD.md` con `-N` para el segundo del
día. El nombre largo usa `DDMMAAAA`, que además no ordena alfabéticamente. **Manda la
convención escrita, no el archivo que llegó después.**

### A.2 Prompts superados

A `Plan Inicial/_archivo/Prompts/`:

| archivo | reemplazado por |
|---|---|
| `docs/Prompts/Paso-1.6.md` | `Paso-1.6-v2.md` |
| `docs/Prompts/Paso-3.md` | `Paso-3-v2.md` |

`Paso-2.md` ya se archivó en `6a68346`. **No renombres los `-v2` a nombre pelado:** están
citados por número en tres handoffs y en `PROYECTO.md` §7.

### A.3 Handoffs viejos

`HANDOFF 2026-07-27.md` y `HANDOFF 2026-07-28.md` → `docs/Sesiones/_archivo/`. La regla ya
dice que el más reciente es el punto de partida; los anteriores son historial y no hace
falta que compitan por atención en el mismo directorio.

→ **Commit A:** `Doc: renombrar handoff a la convención ISO y archivar prompts superados`

---

## Parte B — Escribir la decisión de fuente (esto es lo único urgente)

El Paso 2.3 sembró `digital` y el usuario confirmó: **la decisión quedó tomada a favor de
Seguimiento Digital como fuente de fila**, con Looker como rollup verificado. Pero los docs
siguen diciendo lo contrario:

| archivo | qué dice hoy |
|---|---|
| `docs/CONFIG_INFORMES.md:140` | *"[?] DECISIÓN PENDIENTE… se define en…"*, recomienda **Looker** |
| `docs/MAPEO_completo.md:68` | *"⚠ Decisión pendiente clave"*, recomienda **Looker** |
| `docs/MAPEO_completo.md:117` | *"elegir una como fuente"* |

Código y documentación se contradicen, que es peor que tener la decisión abierta.

1. En **`CONFIG_INFORMES.md §4.1`** escribí la decisión como **resuelta**: SD es la fuente
   de fila; Looker es su rollup exacto (verificado en dos campañas, `HALLAZGOS §4`); el
   desagregado por envío que piden dos slides solo existe en SD. Este es el **único lugar**
   donde vive el detalle.
2. En **`MAPEO_completo.md`** reemplazá los dos bloques por una línea que apunte a
   `CONFIG_INFORMES §4.1`. No repitas el argumento.
3. **No toques `Paso-3-v2.md`.** Su bloque "Antes de empezar" también reabre esta decisión,
   pero ya está asignado como **Reconciliación 1 de `Paso-2.4.md`**. Si lo arreglás acá se
   duplica el trabajo y el otro prompt queda mintiendo sobre lo que falta.

→ **Commit B:** `Doc: escribir la decisión SD-primaria como resuelta (CONFIG_INFORMES §4.1)`

---

## Parte C — Fusionar los tres docs de tokens en uno

Hoy hay tres, y los dos primeros quedaron desactualizados:

| archivo | estado |
|---|---|
| `docs/JM_tokens_marcados.md` (61 líneas) | inventario por slide; lista como pendientes cosas ya resueltas (`enc_*` vs `et_*`, confirmar `camp_*`) |
| `docs/SECCO_tokens_marcados.md` (74) | ídem |
| `docs/TOKENS_diccionario_canonico.md` (178) | el diccionario canónico, vigente |

Fusionalos en **`docs/TOKENS.md`**, con esta estructura:

1. **Diccionario canónico** — tal cual está hoy en `TOKENS_diccionario_canonico.md` §3 y
   §4. Es la parte que consultan el 2.5 y el 3.
2. **Inventario por slide** — las tablas de los dos docs de tokens, en una sola sección con
   subtítulo por plantilla, **sacando los pendientes ya resueltos**: `camp_*` está
   verificado (53 tokens idénticos entre plantillas, cero diferencias) y `enc_*` está
   resuelto por el diccionario.
3. **Bloque de encuentro repetible** — el §5 del diccionario.

Los tres originales van a `Plan Inicial/_archivo/`.

⚠ **Dejá una advertencia arriba de `docs/TOKENS.md`:** el diccionario describe el estado
**objetivo**. Verificado el 29/07 contra la plantilla JM viva (`1JrHvs_p…`): los renombres
**todavía no están aplicados**. Mientras diga eso, nadie va a sembrar `MARCADORES` creyendo
que las plantillas ya están armonizadas.

→ **Commit C:** `Doc: fusionar los tres docs de tokens en docs/TOKENS.md`

---

## Parte D — Reducir la revisión y la duplicación

### D.1 `docs/REVISION_docs_2026-07-29.md` (267 líneas)

Es una lista de trabajo, no material de referencia: tiene que **encogerse hasta desaparecer**.
Recortá a los puntos que siguen abiertos, marcá con ✅ y una línea los que se cerraron
(puntos 1, 3, 4, 8 y la mitad del 5 ya están), y renombralo a
**`docs/PENDIENTES_consistencia.md`** — el nombre con fecha invita a dejarlo viejo, el
nombre sin fecha invita a mantenerlo o borrarlo.

### D.2 `VERIFICACION §4` vs `HALLAZGOS §6`

Son la misma tabla V1–V6, una en blanco y la otra contestada. Vaciá `VERIFICACION §4` y
dejá un puntero a `HALLAZGOS §6`.

### D.3 `docs/MAPEO_completo.md` se congela

La verdad del mapeo es **la hoja `MAPEO`**, que ya tiene 14 filas de `rdv`, 24 de `looker`,
15 de `m2` y las 6 solapas de `digital`. El doc es el relevamiento que dio origen a esas
filas, y mantener los dos sincronizados a mano es garantía de divergencia.

Poné arriba: *"Relevamiento original — **congelado**. La fuente de verdad es la hoja
`MAPEO` de la planilla de control. Los `campo_logico` de este documento están escritos con
prefijo de familia; en la hoja van **sin** prefijo."*

### D.4 `docs/PLANTILLAS_QA_y_armonizacion.md` — **no lo archives**

Sus §4–§6 son el QA posicional que **todavía no se aplicó** (verificado contra la plantilla
viva). Se archiva recién cuando el 2.2 haya corrido y se confirme. Lo que sí conviene: mover
su **§2 (equivalencia de slides entre el deck comentado y la plantilla)** y su **§3
(hallazgos de diseño: uno a uno repetible, Primera persona, post dinámico)** a
`PROYECTO.md §6`, que es donde alguien los va a buscar.

→ **Commit D:** `Doc: reducir la revisión, congelar MAPEO_completo y sacar la tabla duplicada`

---

## Parte E — `PROYECTO.md` §9: taxonomía y un aprendizaje

### E.1 Taxonomía de documentos

La regla *"PROYECTO.md es el único doc que se actualiza"* es buena pero hoy no se cumple.
Hacela explícita con tres estados, y una tabla de una línea por archivo:

- **vivos** — se editan: `PROYECTO.md`, `RUNBOOK.md`, `TOKENS.md`,
  `PENDIENTES_consistencia.md`.
- **congelados** — se leen y no se editan; son relevamientos o hallazgos fechados:
  `MAPEO_completo.md`, `HALLAZGOS_validacion_decks.md`, `DISENO_match_temario.md`,
  `CONFIG_INFORMES.md`, `PLANTILLAS_QA_y_armonizacion.md`.
- **archivados** — `Plan Inicial/_archivo/`.

Si un congelado necesita cambiar, o el cambio va a `PROYECTO.md`, o el doc pasa a vivo
explícitamente. Lo que no puede pasar es que se edite en silencio y quede contradiciendo a
otro.

### E.2 Aprendizaje: el diagnóstico no distingue config vieja de config mal armada

En el Paso 2.1, tres ⚠ y un ✅ engañoso llevaron a diagnosticar un bug de seed que no
existía: el código estaba bien y lo que estaba viejo era **la planilla**, porque nadie había
corrido "Cargar config inicial" después del push. Se leyó el código buscando un problema que
estaba en la hoja.

Anotalo, y agregá la mejora concreta: que **"Probar lectura por ventana" muestre la fecha de
la última carga de config** (guardá un `ultima_carga` en `CONFIG` al correr
`seedConfiguracion()`). Cuesta tres líneas y evita repetir el diagnóstico equivocado cada
vez que cambie un seed.

→ **Commit E:** `Doc: taxonomía de documentos y aprendizaje de config vieja vs mal armada`

---

## Resultado esperado

`docs/` queda con **8 `.md` vivos o congelados**: `TOKENS.md`, `RUNBOOK.md`,
`CONFIG_INFORMES.md`, `MAPEO_completo.md`, `HALLAZGOS_validacion_decks.md`,
`DISENO_match_temario.md`, `PLANTILLAS_QA_y_armonizacion.md`,
`PENDIENTES_consistencia.md`. Más `PERSONAS_equivalencias.csv`, los prompts en
`docs/Prompts/` y los handoffs en `docs/Sesiones/`.

## Prueba del usuario

1. `ls docs/*.md` → ocho archivos.
2. `grep -rn "DECISIÓN PENDIENTE\|Decisión pendiente" docs/` → sin resultados salvo en
   `PLANTILLAS_QA` (donde son preguntas para el equipo, no decisiones de arquitectura).
3. `ls docs/Sesiones/` → dos handoffs, los dos con nombre `HANDOFF AAAA-MM-DD*.md`.
4. Abrir `docs/TOKENS.md` y confirmar que la advertencia de "renombres no aplicados" está
   arriba y se ve sin scrollear.

## Lo que este prompt NO hace

- No corre la armonización de las plantillas (es el Paso 2.2, y **sigue pendiente**).
- No toca `Paso-3-v2.md` (Reconciliación 1 del Paso 2.4).
- No reescribe `PROYECTO.md` §7 (estado del plan): eso lo actualiza cada paso al cerrar.
