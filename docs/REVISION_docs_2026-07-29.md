# REVISIÓN de consistencia — `docs/*.md` · 29/07/2026 · v2

> Revisados los 25 `.md` de `docs/` (incluye `docs/Prompts/` y `docs/Sesiones/`).
> **No** se revisó `Plan Inicial/_archivo/`.
> v2: incorpora la lectura de las plantillas reales de Drive, del deck comentado, y el
> estado del repo después del Paso 2 (`67884cb` + doc `a6c8098`).
>
> Nada de esto es un bug del motor: son contradicciones entre documentos que, si no se
> resuelven, terminan cableadas en `MARCADORES`.

Prioridad: **P0** = puede meter un número mal o hacer trabajo al pedo esta semana ·
**P1** = confunde la próxima sesión · **P2** = higiene.

Estado: ✅ resuelto en esta pasada · 🔧 pendiente.

---

## ✅ P0 · 1. `Paso-2.md` y `VERIFICACION_Paso-2.md` pedían contratos distintos

`Paso-2.md` pedía `leerColumna()` orientado a columnas y no mencionaba
`fila_encabezado` ni `modo_periodo`. La verificación pedía un lector de filas con
diagnóstico completo.

**Resuelto por los hechos:** el código siguió la verificación. `Fuentes.gs` tiene
`leerFuente()` con el contrato de diagnóstico completo, `resolverCampo`, `resolverVentana`
y las tres capas de período.

🔧 **Falta:** archivar `Paso-2.md` en `Plan Inicial/_archivo/`. Mientras siga en
`docs/Prompts/` describiendo una función que no existe, es una trampa para el que lo lea.

---

## 🔧 P0 · 2. Looker vs. Seguimiento Digital: cuatro documentos, tres respuestas

| documento | qué dice |
|---|---|
| `MAPEO_completo.md` (§ Resumen y § SD) | ⚠ *decisión pendiente*, recomienda **Looker** |
| `CONFIG_INFORMES.md` §4.1 | *DECISIÓN PENDIENTE*, recomienda **Looker** |
| `Prompts/Paso-1.9.md` (cierre) | *no la resuelvas vos*, argumento a favor de **Looker** |
| `Prompts/Paso-3-v2.md` ("Antes de empezar") | *preguntale al usuario*, argumento a favor de **Looker** |
| `HALLAZGOS_validacion_decks.md` §4 + HANDOFF v2 | **resuelta**: Looker es el *rollup* de SD → **SD como fuente de fila** |

La pregunta ya no es "cuál es verdad" sino "a qué granularidad", y está verificada número
por número en dos campañas. Pero cuatro archivos siguen diciendo que hay que decidir, y
los cuatro empujan para el lado contrario al que se decidió.

**Acción:** dejar la decisión escrita en **un solo lugar** (`CONFIG_INFORMES §4.1`, que es
el que va a terminar siendo el manual) y que los otros tres apunten ahí en una línea.

**Ya está costando plata:** la corrida del Paso 2 devolvió `⚠ digital` y `⚠ looker` sin
columna de fecha mapeada. No es un bug del lector — es esta decisión sin tomar, que dejó a
`MAPEO` sembrado solo con Looker y sin fila de fecha para ninguna de las dos.

---

## ✅ P0 · 3. Números de slide sin decir de qué archivo

**Resuelto.** El deck comentado (`1yIlCIBG…`) tiene tres bloques que la plantilla marcada
no tiene: una segunda slide de uno a uno, y las tres de Primera persona. De ahí el
corrimiento. Las "slides 29 a 32" son las de Análisis, que en `SECCO_marcada` son 25 a 28.
La equivalencia completa está en `PLANTILLAS_QA_y_armonizacion.md §2`.

**Corolario que conviene adoptar:** dejar de anclar en números de slide. Ya se movieron una
vez en un solo día, cuando se borró una hoja. El ancla estable es **sección + token**.

**Corrección importante:** los comentarios de hoy **no dicen "a definir"**. Son 8 hilos,
todos sustantivos, uno ya resuelto, y dos huérfanos apuntando a la hoja borrada. Hay que
corregir `DISENO §2` (que además dice "ocho" y lista diez) y sacar el punto #8 de
"Decisiones abiertas" del HANDOFF.

---

## ✅ P0 · 4. `Paso-3-v2.md`: el corte vertical propuesto no es de una sola base

Dice que la slide 5 de JM "usa una sola base (RDV)". No: también tiene `mail_*`, `cc_*`,
`ivr_*`, `clics` e `imp_total`. Lo verificado en `HALLAZGOS §3` son **dos** tokens.

Y hay algo peor, que apareció al mirar las coordenadas: **en esa slide los tokens están
rotados un grupo completo** — los nueve valores de métricas tienen el token equivocado.
Detalle en `PLANTILLAS_QA_y_armonizacion.md §4`.

**Acción:** el corte vertical se limita a los `ecv_*` de esa slide, y se dice explícitamente
en el prompt. Los `mail_*`/`cc_*`/`ivr_*` de la slide 5 dependen de la decisión del punto 2.

---

## 🔧 P1 · 5. Decisiones ya resueltas que siguen figurando como abiertas

| pregunta | dónde sigue abierta | dónde está resuelta |
|---|---|---|
| acumulado vs. tramo del período | `CONFIG_INFORMES §1.1`, `VERIFICACION §4 V1` | `HALLAZGOS §6 V1` — **acumulado**, por limitación de la base |
| cómo se sabe cuál es el encuentro temático | `CONFIG_INFORMES §2.2`, `VERIFICACION §4 V5` | `DISENO_match_temario.md` — lo dice el **temario** |
| fuente de `camp_resp_*` | `CONFIG_INFORMES §2.5` | `HALLAZGOS §5` — 3 hojas del archivo RDV |
| columna de fecha por base | `VERIFICACION §4 V2` | `HALLAZGOS §6 V2` |
| Looker vs SD | ver punto 2 | `HALLAZGOS §4` |

`VERIFICACION §4` y `HALLAZGOS §6` son **la misma tabla V1–V6**, una en blanco y la otra
contestada. Van a divergir. **Acción:** vaciar `VERIFICACION §4` y dejar un puntero.

**Y al revés — pendientes que se cayeron del HANDOFF v2:** `enc_*` vs `et_*` (ya resuelto,
ver `TOKENS_diccionario_canonico.md`), confirmar los nombres `camp_*` (✅ verificado: 53
tokens idénticos entre las dos plantillas, cero diferencias) y el QA de posiciones (✅
hecho, ver `PLANTILLAS_QA_y_armonizacion.md §4–6`).

---

## 🔧 P1 · 6. `MAPEO_completo.md` quedó atrás de lo que se descubrió después

- Se titula **"las 4 bases"**; hay 5 registradas y 4 solapas más por registrar
  (`rdv_ministros`, `rdv_comunas`, `digital_desglose`, `digital_mail`).
- **No figura `Id cuentas`**, que es *la clave de join* declarada en `DISENO §2`. Sin esa
  fila, el join no se puede resolver.
- **Falta la hoja `ALCANCE` de Looker**, de donde sale `camp_alcance` con `ULTIMO`
  (`HALLAZGOS §4.2`). No está ni en `MAPEO` ni en `BASES`.
- **Falta `RDV_otros_ministros`** con su advertencia de encabezados corridos, y
  `Respuestas JM 📩` con encabezado en fila 3.
- Dice que `Comunas` *"cruza barrio→población"* y el HANDOFF dice *"barrio→comuna"*.
  Verificado: trae **las dos cosas** (`barrio · comuna · Poblacion · superficie · densidad
  · Zona`). Ojo: `ecv_poblacion` puede salir de ahí **o** de la columna AB de la ancla.
- Escribe los `campo_logico` **con prefijo** (`ecv_inscriptos`) y `Paso-1.9` aclara que van
  **sin prefijo**. El prompt lo advierte; el MAPEO no.

**Confirmado y sin cambios:** las columnas de RDV son
`K Inscriptos · L Mail · M Call Center · N IVR · O RRSS · P Difusión · Q Asistentes`,
exactamente como dice el mapeo. `ecv_insc_digital` = **O (RRSS)**.

---

## 🔧 P1 · 7. `RUNBOOK.md` describe un proyecto que ya no es este

- **Parte A** pide `clasp create` para crear el proyecto de cero — ya existe.
- Dice **"las 6 hojas + PERIODOS"**; `HOJAS_CONFIG_` define **7**.
- La tabla de `BASES` **no tiene `fila_encabezado` ni `modo_periodo`**, y M2 figura con
  `hoja_default` *(verificar)* cuando ya está confirmado: `M2 periodo DIRECTA`, fila 3,
  snapshot.
- **Parte D** manda a correr `Paso-1.6.md`, superado por `Paso-1.6-v2.md`.
- El **mapa de archivos** lista `PLAN_v3_reanalizado.md` (no existe), `docs/Plantillas/`
  (están en `Plan Inicial/_archivo/Plantillas/`) y omite los prompts 1.6-v2, 1.7, 1.8,
  1.8-B, 1.9, 2.5 y 3-v2.
- **No menciona el episodio de spam de Drive**, que es justo el aprendizaje que hace falta
  cuando "Registrar plantillas" ve la carpeta vacía.

Es el único documento con instrucciones ejecutables paso a paso: si algo tiene que estar al
día, es este.

---

## 🔧 P0 · 8. El Paso 2 no está verificado, y los ⚠ de la corrida engañan

Los tres ⚠ y el ✅ de m2 de la primera corrida **no son bugs del lector ni del seed**.
`SEED_MAPEO_` ya tiene las 14 filas de `rdv` con `fecha` → E y las 24 de `looker`;
`SEED_BASES_` ya tiene `m2` con `fila_encabezado: 3` y `modo_periodo: 'snapshot'`. Lo que
faltaba era **correr el seed sobre la planilla** después de que se aplicó en el código.

Aprendizaje, más que error: cuando el seed cambia, la planilla queda vieja hasta que alguien
corre el menú. El diagnóstico no distingue "mal configurado" de "configuración vieja", y eso
manda a leer el código cuando el problema estaba en la hoja. Vale la pena que "Probar
lectura" muestre **cuándo fue la última carga de config**.

Lo que sí queda pendiente después de correr el seed:

| síntoma | causa real |
|---|---|
| `⚠ looker` sin columna de fecha | Looker **no tiene** una columna `fecha`: tiene `fecha_inicio` (C) y `fecha_fin` (D). `leerFuente` busca `campo_logico='fecha'` fijo. Hay que elegir cuál cumple ese rol y sembrar la fila |
| `⚠ digital` | no está sembrado **a propósito** — depende del punto 2 |
| `m2`: 29.533 totales / 29.514 sin fecha | el lector cuenta las filas vacías de la hoja como "sin fecha", y así `filas_sin_fecha` deja de servir para lo que existe |

Los criterios **A3–A5** (que `filas_en_ventana` coincida con el filtro manual) siguen sin
probarse. Hasta que pasen, el Paso 2 no está cerrado.

---

## 🔧 P2 · 9. Referencias rotas (reclasificado)

Un doc puede referenciar algo que vive en Drive; eso no es un error, alcanza con anotar el
**ID** al lado del nombre. Lo que sí hay que arreglar:

| doc | referencia | dónde está |
|---|---|---|
| `Paso-0-v2`, `Paso-1`, `Paso-3` | `Plan Inicial/ARQUITECTURA_registros.md` | `Plan Inicial/_archivo/` |
| `Paso-0.5`, `Paso-2`, `Paso-5` | `Plan Inicial/Periodos_y_campanias.md` | `Plan Inicial/_archivo/` |
| `Paso-1.7` | `Plan Inicial/M2_mapeo_y_config.md` | `Plan Inicial/_archivo/` |
| `Paso-5` | `docs/CAMPANAS.md` | `Plan Inicial/_archivo/CAMPANAS.md` |
| `Paso-0` | `FUENTES.md`, `PLAN.md` | `_archivo/FUENTES.md` · `_archivo/PLAN .md` (con espacio) |
| `Paso-1.8` | `docs/Sesiones/HANDOFF.md` | no existe con ese nombre |
| HANDOFF v2 | `docs/PREGUNTAS_equipo.md` | no existe — las 6 preguntas están en `HALLAZGOS §8` |
| HANDOFF v2 | `docs/VERIFICACION_Paso-2.md` | `docs/Prompts/VERIFICACION_Paso-2.md` |
| `VERIFICACION_Paso-2` línea 3 | *"Ubicación: `docs/VERIFICACION_Paso-2.md`"* | se contradice a sí mismo |

Plantillas y deck comentado: alcanza con poner los IDs de Drive
(`1JrHvs_p…` JM · `1_ZKjWhL…` SECCO · `1yIlCIBG…` comentado).

---

## 🔧 P2 · 10. `Paso-2.5.md` se pisa con `Paso-3-v2.md`

- La tabla de columnas a escribir usa **`calculo`**, pero la Parte B cuenta como
  "completos" los que tienen **`operacion`** — columna que recién crea `Paso-3-v2`.
- Tampoco siembra `valor_fijo`.

**Acción:** que `Paso-2.5` haga el rename `calculo → operacion` + `valor_fijo` (es un
`asegurarColumna_`) y que 3-v2 lo dé por hecho.

**Se suma ahora:** con el bloque de encuentro repetible, el 2.5 tiene que saber que un
token de bloque repetible es **una** fila en `MARCADORES`, no una por instancia.

---

## 🔧 P2 · 11. Contadores internos que no cierran

- `DISENO §2` dice **"Ocho comentarios más dicen *a definir*"** y lista **diez**; en §7.4
  dice **"los 10 comentarios"**. Y ninguna de las dos cifras coincide con el archivo de
  hoy, que tiene 8 hilos y ninguno dice eso.
- `MAPEO_completo` describe Looker como "31 columnas" y detalla 23. Conviene aclarar que
  el resto no se mapea a propósito.

---

## 🔧 P2 · 12. La convención de HANDOFF se rompe en el archivo que la sigue

`HANDOFF 2026-07-29.md` fija: un archivo nuevo por sesión, `HANDOFF AAAA-MM-DD.md`, `-N` si
hay más de uno el mismo día, y no se edita un HANDOFF anterior.

- El v2 se llama `HANDOFF — Motor de Informes (GCBA) · v2 · 29072026.md`: fecha en
  `DDMMAAAA` (no ordena) y sin sufijo `-2`. Debería ser `HANDOFF 2026-07-29-2.md`.
- `HANDOFF 2026-07-28.md` dice *"Última actualización: 29/07/2026"*.
- El v2 dice *"Versión anterior → `Plan Inicial/_archivo/`"*, pero `HANDOFF 2026-07-29.md`
  sigue en `docs/Sesiones/`.

---

## Lo que revisé y está consistente

- **`camp_*`: 53 tokens, cero diferencias** entre JM 12–19 y SECCO 16–23. Verificado token
  por token. Se cablea una vez.
- `m2_*` idénticos entre plantillas, salvo `m2_implementaciones` (solo SECCO).
- Los `.pptx` del repo son espejo fiel de las Slides de Drive: sirven para el QA sin abrir
  Drive.
- La regla de anclaje en RDV está contada igual en `DISENO §5 bis` y en el HANDOFF.
- La regla de oro (aritmética solo en `Marcadores.gs`) está repetida sin variantes en todos
  los prompts.
- `Paso-1.9` es el único doc que anticipa el conflicto de `campo_logico` con prefijo.
- `HALLAZGOS §4.2` (alcance y frecuencia no son `SUMA`) llegó a `Paso-3-v2` y al HANDOFF.

---

## Aprendizaje nuevo del Paso 2 (para `PROYECTO.md`)

**Apps Script tiene un solo namespace.** Code encontró que `Parseo.gs` (escrito desde
claude.ai) ya definía un `parsearFecha_` global con otra firma; la función nueva lo hubiera
pisado en silencio. Se renombró a `parsearFechaCelda_`.

Como hay **dos herramientas escribiendo sobre el mismo repo**, la regla queda: greppear el
nombre antes de agregar cualquier función global. Vale también al revés — lo que se genera
desde el chat tiene que respetar los nombres que ya puso Code.

---

## Orden sugerido

1. **Ahora:** correr el seed sobre la planilla y cerrar los dos pendientes del punto 8
   (`looker/fecha` y las filas vacías). Sin eso el Paso 2 no se puede dar por cerrado.
   En paralelo, el punto 2: la decisión de fuente es lo que traba sembrar `digital`.
2. **Antes del Paso 2.5:** aplicar `TOKENS_diccionario_canonico.md` a las plantillas. Si el
   2.5 corre antes, siembra los tokens rotos y hay que deshacerlo sobre 200 filas.
3. **Después:** 5, 6, 7, 10.
4. **Cuando haya un rato:** 9, 11, 12.
