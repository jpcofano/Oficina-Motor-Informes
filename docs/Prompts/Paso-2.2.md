# Paso 2.2 — Armonizar las plantillas antes de sembrar `MARCADORES`

> **Regla de oro:** este paso NO calcula nada. Renombra tokens en las Slides y agrega tipos
> a `CAMPANAS`.
>
> **Va después del Paso 2.1 y ANTES del 2.5.** Si `sembrarMarcadoresDesdePlantillas()`
> corre primero, siembra ~200 filas con los tokens rotos y hay que deshacerlo a mano.
>
> Referencia obligatoria: **`docs/TOKENS_diccionario_canonico.md`** y
> **`docs/PLANTILLAS_QA_y_armonizacion.md`**. Este prompt no repite las tablas: las aplica.
>
> **Un commit por parte.**

---

## Contexto

Las plantillas vivas son Google Slides:

- **JM** → `1JrHvs_pdvdwWGZ1CQNmuJr9Bi3XvqyOMJhRweeJAzbE` (22 slides)
- **SECCO** → `1_ZKjWhL-bhCP8yHQ8PJ33ymyjSXu3thh7MKMOxB4-n8` (29 slides)
- Comentada (referencia, no se toca) → `1yIlCIBGJHsJBNLaMDqBNf75b2gzyMVnlwB5JJArNZv0`

Los `.pptx` de `Plan Inicial/_archivo/Plantillas/` son espejo fiel y sirven para verificar.

Se detectaron cuatro clases de problema, y **ninguno falla ruidosamente**: la slide sale
"bien" con el número equivocado.

1. **`enc_audiencia` alimenta dos números distintos** (alcance digital en JM, audiencia de
   IVR en SECCO).
2. **En JM slide 5 los nueve tokens de métricas están rotados un grupo completo**, y hay un
   literal `135` sin tokenizar en la caja de "Marque 1".
3. **En JM slide 6 hay dos tokens dados vuelta** entre "Mails Enviados" y "Audiencia".
4. **En JM slide 10** los sufijos `_a`…`_e` no siguen el orden de las columnas.

---

## Parte A — `armonizarPlantillas()`

Función nueva en un archivo propio **`Armonizar.gs`** (no la metas en `Instalar.gs`: es una
migración de una sola vez, no parte del ciclo de instalación). Ítem de menú
**"Armonizar tokens de plantillas"**, en un submenú "Mantenimiento".

Mecánica: por cada fila de `INFORMES` con `activo=sí` y `plantilla_id` cargado, abrir con
`SlidesApp.openById()` y aplicar `presentation.replaceAllText(viejo, nuevo, true)`
(matchCase) recorriendo la lista **en orden**.

⚠ **El orden no es negociable.** En JM, `enc_audiencia` → `enc_alcance` tiene que correr
**antes** de escribir `enc_audiencia` en la caja de IVR. Al revés, el segundo renombre se
lleva puesto al primero. Definí la lista como un array ordenado y no la reordenes
"alfabéticamente" ni la conviertas en un objeto.

⚠ **Reemplazá siempre con las llaves incluidas** (`{{enc_audiencia}}` → `{{enc_alcance}}`),
nunca el nombre pelado: `enc_clics` es prefijo de `enc_clics_ctor` y sin las llaves te
comés medio diccionario.

Las tablas de renombres están en `TOKENS_diccionario_canonico.md §3` (familias `enc_*` y
`rrss_*`) y **§4** (los 25 tokens de M2 por categoría).

**Reporte al final** (alert + log): por plantilla, cuántos reemplazos se aplicaron y
**cuáles no encontraron nada**. Un renombre con 0 ocurrencias es una señal: o ya se aplicó,
o el token no era el que creíamos.

→ **Commit A:** `Paso 2.2 ✅ — armonizarPlantillas(): renombres del diccionario canónico`

---

## Parte B — Correcciones que NO son renombres

Estas no se pueden hacer con `replaceAllText` porque cambian el contenido de una caja
concreta, no el nombre de un token. Van con `getSlides()[n].getShapes()`, buscando la caja
por su texto actual exacto.

### B.1 JM slide 5 — los nueve tokens rotados

Tabla completa en `PLANTILLAS_QA_y_armonizacion.md §4`. Resumen: cada caja de valor
comparte `x` e `y` con su etiqueta; hoy los valores de mail están en el grupo de call
center, los de call center en el de IVR y los de IVR en el de mail.

Incluye dos casos especiales:
- el literal **`135`** pasa a `{{ivr_marque1}}` (token nuevo);
- la caja **"*Audiencia Alcanzada"** hoy tiene `{{imp_total}}` y le corresponde un token
  que no existe: creá **`{{alcance}}`**. No es sumable (`HALLAZGOS §4.2`): en el Paso 3 va
  con `ULTIMO` contra la hoja de alcance, no con `SUMA`. Dejalo anotado en `notas`.

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

`MAPEO` ya tiene `rdv/insc_ivr` → columna N (Paso 2.1), así que del lado de datos no hay
trabajo. Respetá el formato de las líneas vecinas (con o sin espacio antes del paréntesis:
difiere entre plantillas).

### B.4 JM slide 10 — limpieza

Los 14 números hardcodeados están **fuera del área visible** (coordenadas `y` negativas,
parkeados arriba del canvas). No se imprimen, pero ensucian cualquier búsqueda de texto:
borralos.

→ **Commit B:** `Paso 2.2 ✅ — correcciones de caja: JM 5, JM 6, IVR y limpieza de JM 10`

---

## Parte C — `CAMPANAS`: el bloque de encuentro es repetible

El deck comentado tiene **dos** slides de uno a uno (una por encuentro de la semana) y un
bloque entero de **Primera persona** que la plantilla marcada no tiene. Son la misma
estructura: separador + estrategia + iceberg, con distinto encuentro adentro.

1. La columna `tipo` de `CAMPANAS` acepta ahora: `campana`, `uno_a_uno`, `tematico`,
   `primera_persona`, `ministros`, `proveedor`.
2. Documentá en `Plan Inicial/PROYECTO.md` que hay **dos clases de bloque repetible** —
   encuentro y campaña — con la misma mecánica: iterar `CAMPANAS` filtrando `mostrar=sí`,
   ordenar por `orden`, y emitir el bloque de slides del tipo correspondiente usando la
   ventana propia de cada fila.
3. **`emin_*` (ministros) no se toca:** su slide es un agregado semanal de varios
   encuentros, no un bloque por encuentro.

**No implementes la emisión acá.** Eso es el Paso 5. Este paso solo deja el registro y la
documentación listos.

→ **Commit C:** `Paso 2.2 ✅ — CAMPANAS: tipos de encuentro y bloque repetible documentado`

---

## Parte D — Higiene documental

Commit **aparte** del de código, como marca el método.

1. Arreglar las rutas rotas: cinco prompts apuntan a `Plan Inicial/<archivo>.md` y el
   archivo está en `Plan Inicial/_archivo/`. Lista en
   `docs/REVISION_docs_2026-07-29.md §9`.
2. Anotar los **IDs de Drive** al lado de los nombres de las plantillas y del deck
   comentado donde se los mencione.
3. Vaciar `VERIFICACION §4` (V1–V6) y dejar un puntero a `HALLAZGOS §6`, que es la misma
   tabla ya contestada.
4. Corregir `DISENO_match_temario.md §2`: los comentarios de hoy son **8, ninguno dice "a
   definir"**, uno está resuelto y dos quedaron huérfanos. Y §7.4 dice "los 10
   comentarios".
5. Sacar el punto **#8** de "Decisiones abiertas" del HANDOFF.
6. Actualizar `docs/MAPEO_completo.md`: ya no son "las 4 bases", falta `Id cuentas`, falta
   la hoja `ALCANCE` de Looker, y aclarar que los `campo_logico` de ese doc están escritos
   **con** prefijo pero en `MAPEO` van **sin**.

→ **Commit D:** `Doc: higiene de referencias y correcciones de DISENO/MAPEO/HANDOFF`

---

## Prueba del usuario

1. Menú → **"Armonizar tokens de plantillas"**. Leer el reporte: **ningún renombre debería
   dar 0 ocurrencias** salvo los que ya se hayan aplicado.
2. Abrir JM slide 5 y verificar que cada etiqueta tenga su token: Impresiones ↔
   `imp_total`, Clics ↔ `clics`, Audiencia Alcanzada ↔ `alcance`, Mails entregados ↔
   `mail_entregados`, Aperturas ↔ `mail_aperturas`, Base llamada ↔ `cc_base`, Contactados
   ↔ `cc_contactados`, Atendidos ↔ `ivr_atendidos`, Escucharon +75% ↔ `ivr_75`, Marque 1 ↔
   `ivr_marque1`. **No debe quedar ningún `135`.**
3. JM slide 6: "Mails Enviados" y "Audiencia" con los tokens correctos.
4. Buscar `enc_audiencia` en las dos plantillas: en JM tiene que aparecer **solo** en la
   caja de IVR de la slide 6; en SECCO, solo en la de IVR de la slide 8.
5. JM slide 10: cinco columnas con tokens por categoría, sin sufijos `_a`…`_e`, y sin los
   números viejos arriba del canvas.
6. Correr **la armonización dos veces**: la segunda tiene que reportar 0 reemplazos en todo
   y no romper nada. Si algo cambia en la segunda corrida, hay un renombre que se pisa a sí
   mismo.

---

## Lo que este paso deja anotado y no resuelve

- **Primera persona sigue sin marcar**: tres slides en `xx` en el deck comentado, que no
  están en la plantilla base. Hay que decidir si se incorporan.
- **Visualizaciones de M2**: solo Subtes y Desalojos tienen caja. Las otras tres categorías
  no tienen dónde poner el dato.
- **`ecv_poblacion`**: "Habitantes del Barrio" en JM y "Habitantes del eje" en SECCO. Un eje
  agrupa varios barrios, así que no puede ser el mismo cálculo. Pregunta para el equipo.
- **El bloque de post** tiene 3 filas fijas y el comentario del equipo dice que esa semana
  había 2. `post_camp1-3` debería emitirse dinámicamente (Paso 5).
