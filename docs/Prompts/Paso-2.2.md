# Paso 2.2 — Armonizar las plantillas antes de sembrar `MARCADORES`

> **Regla de oro:** este paso NO calcula nada. Renombra tokens en las Slides y agrega tipos
> de encuentro a `CAMPANAS`.
>
> **Orden:** va después de **DOC-1** (que fusiona los docs de tokens) y **antes del Paso
> 2.5**. Si `sembrarMarcadoresDesdePlantillas()` corre primero, siembra ~200 filas con los
> tokens rotos y hay que deshacerlo a mano.
>
> Se puede correr en paralelo al 2.4: son vías separadas (plantillas vs. datos) y no se
> tocan.
>
> Referencia obligatoria: **`docs/TOKENS.md`** (si DOC-1 todavía no corrió, es
> `docs/TOKENS_diccionario_canonico.md`) y **`docs/PLANTILLAS_QA_y_armonizacion.md`**. Este
> prompt no repite las tablas: las aplica.
>
> ⚠ **Namespace (PROYECTO §9):** antes de nombrar cualquier función o `var` global nueva,
> `grep -rn "function nombre" *.gs`. Dos herramientas escriben en esta carpeta.
>
> **Un commit por parte.**

---

## Contexto

Las plantillas vivas son Google Slides:

- **JM** → `1JrHvs_pdvdwWGZ1CQNmuJr9Bi3XvqyOMJhRweeJAzbE` (22 slides)
- **SECCO** → `1_ZKjWhL-bhCP8yHQ8PJ33ymyjSXu3thh7MKMOxB4-n8` (29 slides)
- Comentada (referencia, **no se toca**) → `1yIlCIBGJHsJBNLaMDqBNf75b2gzyMVnlwB5JJArNZv0`

Los `.pptx` de `Plan Inicial/_archivo/Plantillas/` son espejo del estado anterior y sirven
para comparar.

⚠ **Verificado el 29/07 leyendo la plantilla JM viva: ninguno de los cambios de este paso
está aplicado.** Sigue el literal `135`, siguen `enc_audiencia`, `enc_audiencia_ivr`,
`enc_audiencia_pauta`, `enc_clics`, `rrss_prom`, los `m2_*` con sufijos `_a`…`_e`, y no
existen `ecv_insc_ivr`, `ivr_marque1` ni `alcance`. Si en algún momento se corrió una
armonización, fue sobre otra copia.

Cuatro clases de problema, y **ninguno falla ruidosamente**: la slide sale "bien" con el
número equivocado.

1. **`enc_audiencia` alimenta dos números distintos** — alcance digital en JM, audiencia de
   IVR en SECCO. Una fila en `MARCADORES`, dos slides, un número correcto y otro plausible.
2. **En JM slide 5 los nueve tokens de métricas están rotados un grupo completo**, más un
   literal `135` sin tokenizar en la caja de "Marque 1".
3. **En JM slide 6 hay dos tokens dados vuelta** entre "Mails Enviados" y "Audiencia".
4. **En JM slide 10** los sufijos `_a`…`_e` no siguen el orden de las columnas: `m2_vis_e`
   está en Desalojos y `m2_camp1`/`m2_camp2` están invertidos.

---

## Parte A — `armonizarPlantillas()`

Archivo nuevo **`Armonizar.gs`**. No la metas en `Instalar.gs`: es una migración de una sola
vez, no parte del ciclo de instalación. Ítem de menú **"Armonizar tokens de plantillas"** en
el submenú de mantenimiento.

Mecánica: por cada fila de `INFORMES` con `activo=sí` y `plantilla_id` cargado, abrir con
`SlidesApp.openById()` y aplicar `presentation.replaceAllText(viejo, nuevo, true)`
(matchCase) recorriendo la lista **en orden**.

⚠ **El orden no es negociable.** En JM, `{{enc_audiencia}}` → `{{enc_alcance}}` tiene que
correr **antes** de escribir `{{enc_audiencia}}` en la caja de IVR (Parte B.2). Al revés, el
segundo renombre se lleva puesto al primero. Definí la lista como un array ordenado; no la
reordenes "alfabéticamente" ni la conviertas en un objeto.

⚠ **Reemplazá siempre con las llaves incluidas** (`{{enc_clics}}` → `{{enc_clics_ctor}}`),
nunca el nombre pelado: `enc_clics` es prefijo de `enc_clics_ctor` y sin las llaves te comés
medio diccionario en cascada.

Las tablas están en `docs/TOKENS.md`: familias `enc_*` y `rrss_*`, y los 25 tokens de M2 por
categoría.

**Reporte al final** (alert + log): por plantilla, cuántos reemplazos se aplicaron y
**cuáles dieron cero**. Un renombre con 0 ocurrencias es una señal, no un detalle: o ya se
aplicó, o el token no era el que creíamos, o se está tocando la plantilla equivocada.
Incluí en el reporte el **ID y el nombre** de cada presentación abierta.

→ **Commit A:** `Paso 2.2 ✅ — armonizarPlantillas(): renombres del diccionario canónico`

---

## Parte B — Correcciones que NO son renombres

Estas no salen con `replaceAllText`: cambian el contenido de una caja concreta, no el nombre
de un token. Van con `getSlides()[n].getShapes()`, ubicando la caja por su texto actual
exacto.

### B.1 JM slide 5 — los nueve tokens rotados

Tabla completa en `PLANTILLAS_QA_y_armonizacion.md §4`. Cada caja de valor comparte `x` e
`y` con su etiqueta; hoy los valores de mail están en el grupo de call center, los de call
center en el de IVR y los de IVR en el de mail.

Dos casos especiales dentro de esta slide:

- el literal **`135`** pasa a `{{ivr_marque1}}` (token nuevo);
- la caja **"*Audiencia Alcanzada"** tiene hoy `{{imp_total}}` y le corresponde un token que
  no existe: creá **`{{alcance}}`**. No es sumable (`HALLAZGOS §4.2`): en el Paso 3 va con
  `ULTIMO` contra la hoja `Alcance`, no con `SUMA`. Dejalo anotado.

### B.2 JM slide 6 — dos cajas cruzadas

"Mails Enviados" → `{{enc_mails_enviados}}` · "Audiencia" (columna IVR) →
`{{enc_audiencia}}`.

### B.3 Inscriptos por IVR

En JM 5, JM 6 y SECCO 8 los cuatro canales viven en **una sola caja de texto** con cuatro
líneas. Agregá una quinta:

| slide | línea a agregar |
|---|---|
| JM 5 | `IVR: {{ecv_insc_ivr}}({{ecv_insc_ivr_pct}}%)` |
| JM 6 | `IVR: {{ecv_insc_ivr}}` |
| SECCO 8 | `IVR: {{ecv_insc_ivr}} ({{ecv_insc_ivr_pct}}%)` |

`MAPEO` ya tiene `rdv/insc_ivr` → columna N, así que del lado de datos no hay trabajo.
Respetá el formato de las líneas vecinas: el espacio antes del paréntesis difiere entre
plantillas.

### B.4 JM slide 10 — limpieza

Los 14 números hardcodeados están **fuera del área visible** (coordenadas `y` negativas,
parkeados arriba del canvas). No se imprimen, pero ensucian cualquier búsqueda de texto y
cualquier QA futuro: borralos.

→ **Commit B:** `Paso 2.2 ✅ — correcciones de caja: JM 5, JM 6, IVR y limpieza de JM 10`

---

## Parte C — `CAMPANAS`: el bloque de encuentro es repetible

El deck comentado tiene **dos** slides de uno a uno (una por encuentro de la semana) y un
bloque entero de **Primera persona** que la plantilla marcada no tiene. Son la misma
estructura: separador + estrategia + iceberg, con distinto encuentro adentro.

1. La columna `tipo` de `CAMPANAS` acepta ahora: `campana`, `uno_a_uno`, `tematico`,
   `primera_persona`, `ministros`, `proveedor`.
2. Documentá en `PROYECTO.md` que hay **dos clases de bloque repetible** — encuentro y
   campaña — con la misma mecánica: iterar `CAMPANAS` filtrando `mostrar=sí`, ordenar por
   `orden`, y emitir el bloque de slides del tipo correspondiente usando la ventana propia de
   cada fila.
3. **`emin_*` (ministros) no se toca:** su slide es un agregado semanal de varios
   encuentros, no un bloque por encuentro.

**No implementes la emisión acá.** Eso es el Paso 5. Este paso deja el registro y la
documentación listos.

→ **Commit C:** `Paso 2.2 ✅ — CAMPANAS: tipos de encuentro y bloque repetible documentado`

---

## Parte D — Sacar la advertencia de `docs/TOKENS.md`

Una sola cosa, y va al final, **después de que el usuario confirme la prueba**:

`docs/TOKENS.md` tiene arriba una advertencia que dice que el diccionario describe el estado
objetivo y que los renombres **no están aplicados**. Una vez confirmados, borrala y dejá en
su lugar la fecha de aplicación.

Si queda después de armonizar, la mentira va en la dirección contraria y es peor: alguien no
va a sembrar `MARCADORES` creyendo que falta un paso que ya se hizo.

> La higiene documental que este prompt pedía en versiones anteriores (rutas rotas,
> `VERIFICACION §4`, `DISENO §2`, punto #8 del HANDOFF, `MAPEO_completo`) **ya la hace
> `DOC-1_consolidacion.md`**. No la repitas.

→ **Commit D:** `Doc: TOKENS.md — renombres aplicados`

---

## Prueba del usuario

**Verificá contra la plantilla viva, no contra el reporte de la función.** El reporte puede
decir "30 reemplazos aplicados" habiendo trabajado sobre la copia equivocada. Confirmá
primero que el ID que informa es `1JrHvs_p…` / `1_ZKjWhL…`.

Cuatro búsquedas que tienen que dar el resultado esperado o el resto no importa:

1. `135` → **ningún resultado** en JM.
2. `enc_audiencia` → en JM, **solo** en la caja de IVR de la slide 6; en SECCO, solo en la de
   IVR de la slide 8.
3. `ecv_insc_ivr` → tres resultados (JM 5, JM 6, SECCO 8).
4. `m2_clics_a` → ningún resultado; en su lugar `m2_subtes_clics` y compañía.

Después:

5. JM slide 10: cinco columnas con tokens por categoría y sin los números viejos arriba del
   canvas.
6. Correr la armonización **dos veces**: la segunda tiene que reportar 0 reemplazos en todo y
   no cambiar nada. Si algo cambia, hay un renombre que se pisa a sí mismo.

⚠ **La Parte B.1 no se puede verificar leyendo texto.** Los nueve tokens rotados de JM 5 se
ven perfectos en cualquier volcado: el token existe, está bien escrito, y está en la caja de
al lado. Hay que **abrir la slide y mirar que cada etiqueta tenga su número debajo**:
Impresiones ↔ `imp_total`, Clics ↔ `clics`, Audiencia Alcanzada ↔ `alcance`, Mails
entregados ↔ `mail_entregados`, Aperturas ↔ `mail_aperturas`, Base llamada ↔ `cc_base`,
Contactados ↔ `cc_contactados`, Atendidos ↔ `ivr_atendidos`, Escucharon +75% ↔ `ivr_75`,
Marque 1 ↔ `ivr_marque1`. Es la única parte de este paso que no se puede automatizar.

---

## Lo que este paso deja anotado y no resuelve

- **Primera persona sigue sin marcar**: tres slides en `xx` en el deck comentado, que no
  están en la plantilla base. Hay que decidir si se incorporan.
- **Visualizaciones de M2**: solo Subtes y Desalojos tienen caja. Las otras tres categorías
  no tienen dónde poner el dato, así que esos cuatro tokens no se crean.
- **`ecv_poblacion`**: "Habitantes del Barrio" en JM y "Habitantes del eje" en SECCO. Un eje
  agrupa varios barrios, así que no puede ser el mismo cálculo con la misma fuente. Pregunta
  para el equipo.
- **El bloque de post** tiene 3 filas fijas y el comentario del equipo dice que esa semana
  había 2. `post_camp1-3` debería emitirse dinámicamente (Paso 5).
