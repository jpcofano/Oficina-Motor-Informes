# PENDIENTES de consistencia — `docs/*.md`

> Lista de trabajo, no material de referencia. Se recorta a medida que se cierra cada
> punto — el objetivo es que este archivo achique hasta desaparecer, no que crezca.
> Origen: revisión de consistencia del 29/07/2026 (`docs/REVISION_docs_2026-07-29.md`,
> archivada). Prioridad: **P0** = puede meter un número mal o hacer trabajo al pedo ·
> **P1** = confunde la próxima sesión · **P2** = higiene.

## Cerrado en esta pasada (DOC-1, 29/07/2026) — una línea cada uno

- **Looker vs. Seguimiento Digital, cuatro documentos con tres respuestas distintas** →
  decisión escrita una sola vez en `CONFIG_INFORMES.md` §4.1; los demás apuntan ahí.
- **`Paso-2.md` describía una función (`leerColumna()`) que nunca existió** → archivado.
- **Números de slide sin decir de qué archivo** → equivalencia completa en
  `PLANTILLAS_QA_y_armonizacion.md` §2; se ancla en sección + token, no en número.
- **`Paso-3-v2.md` decía "una sola base" para el corte vertical de la slide 5** →
  verificado que son dos (`ecv_*` + `mail_*`/`cc_*`/`ivr_*`); la corrección del archivo
  en sí queda para `Paso-2.4.md` (no tocarlo desde acá, ver nota abajo).
- **`VERIFICACION_Paso-2.md` §4 duplicaba la tabla V1–V6 de `HALLAZGOS_validacion_decks.md`
  §6** → vaciada, con puntero.
- **`enc_*` vs `et_*`, `camp_*` sin confirmar, QA de posiciones** → resueltos, ver
  `docs/TOKENS.md` y `docs/PLANTILLAS_QA_y_armonizacion.md`.
- **Paso 2: los ⚠ de la primera corrida parecían bugs del lector** → causas raíz
  resueltas (Paso 2.1: filas vacías fuera del diagnóstico; Paso 2.3: `digital` sembrado
  + diagnóstico honesto). Sigue abierto solo el punto 3 de abajo (verificación real).
- **`MAPEO_completo.md` divergía de lo que se fue descubriendo** → pasa a **congelado**
  (relevamiento original, fechado). La fuente de verdad es la hoja `MAPEO` viva; no se
  persigue más la sincronización a mano. Ver taxonomía en `PROYECTO.md` §9.
- **La convención de HANDOFF se rompía en el archivo que la seguía** (nombre `DDMMAAAA`
  sin sufijo `-N`) → renombrado a `HANDOFF 2026-07-29-2.md`; los handoffs anteriores al
  29/07 están en `docs/Sesiones/_archivo/`.

---

## Sigue abierto

### P0 · Datos personales reales en el historial público del repo

Desde el 27/07 (`75f510d`): muestras de las cuatro bases y informes publicados, en tres
rutas sucesivas del historial. `.gitignore` (31/07) frena lo nuevo pero no lo existente.
Borrado diferido: decidido por el equipo, fuera del alcance de Code — Code no toca
historial ni archivos de datos.

### ~~P0 · Paso 2.11 Parte C: el protocolo falla en los pasos 4 y 5~~ — CERRADO (01/08/2026)

Los dos bloqueantes se resolvieron y el protocolo pasó completo en su segunda corrida
(commit `2979f03`; evidencia y delta entre corridas en
`docs/PROTOCOLO_2.11-C_corrida_2026-07-31.md`). El bloqueante 2 **no tuvo arreglo propio**:
se cayó al resolver el 1. Se deja la entrada tachada, con el detalle original abajo, porque
el diagnóstico —y sobre todo el error de la hipótesis inicial— explica por qué el arreglo
fue retirar una migración y no reordenar los sembradores.

**Sigue abierto, y es lo que viene:** el diff **funciona pero no es auditable**. `C.2-2` a
`C.2-7` de `docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md` — sin marca de corrida (hay
que vaciar `DIFF_CONFIGURACION` y `ESTADO_CONFIGURACION` a mano), las migraciones escriben
por fuera del diff (S-01 aparece con cero celdas cambiadas y no se sabe si escribe), las 10
protegidas no dicen qué se habrían perdido, y no hay línea `solo_en_hoja` (la fila huérfana
de `MAPEO` no se reporta).

<details>
<summary>Detalle original del P0 (cerrado)</summary>

Corrida completa y evidencia: `docs/PROTOCOLO_2.11-C_corrida_2026-07-31.md`. Cinco de
siete pasos pasaron; los dos que fallan son el núcleo del criterio.

- **No idempotente (paso 4).** Cada corrida de "Aplicar configuración" reporta la misma
  celda: `SOLAPAS.digital||RDV JM 2 VECES`, columna `notas`. **Causa verificada contra el
  código el 01/08** — y con los roles al revés de la hipótesis inicial: `SEED_SOLAPAS_` ya
  traía la nota larga y correcta; la migración `corregirNotaControlAnclaje_` comparaba
  contra su propia constante vieja (corta) y la revertía en cada corrida, dentro de la
  misma corrida, antes de que el sembrador la volviera a escribir larga.
  **Arreglo aplicado en el working tree, sin commitear:** migración retirada entera (el
  seed ya es dueño del valor). **Falta re-correr los pasos 3, 4 y 5.**
- **"Estado de configuración" no coincide con "Aplicar" (paso 5).** Estado decía
  `✅ Sin discrepancias` y un "Aplicar" inmediatamente después cambiaba una celda. No era
  una mentira sobre el presente: la discrepancia la **fabricaba** el propio apply, vía la
  migración de arriba. Debería caerse solo con el arreglo — **se verifica en la próxima
  corrida, no se asume.**

</details>

### P2 · `BASES.fila_encabezado` tiene formato de fecha aplicado encima (cosmético)

El diff reportó `BASES m2 fila_encabezado: 31/12/1899 → 1900-01-02`. Son los enteros **1 y
3** renderizados como seriales de Sheets. **Diagnóstico corrido el 01/08: la columna es
`number` en las cinco filas, con `m2 = 3`** — el tipo está bien, `Union.gs` recibe un número
y `Number()` funciona. Queda solo lo cosmético: sacarle el formato de fecha a la columna
cuando se toque `BASES` por otra razón. Baja de P1 a P2.

### P1 · H-2 · `BASES.fila_encabezado` es vestigial y `Union.gs` la lee directo

**No es lo mismo que el punto anterior y no se resolvió con él.** El Paso 2.11 Parte B movió
`fila_encabezado` a `SOLAPAS`, por solapa, pero la columna sigue en `BASES` con valores que
**se contradicen**: `BASES.m2 = 3` mientras `SOLAPAS.m2/Cuentas M2 = 1` y
`SOLAPAS.m2/M2 periodo DIRECTA = 3`. Y `Union.gs:36` y `:261` leen `base.fila_encabezado`
directo, sin pasar por `resolverFilaEncabezado_()` — para `m2/Cuentas M2` leerían la fila 3
como encabezado, que ahí es una fila de datos. El tipo es correcto; el problema es que la
columna sigue existiendo y siendo leída. → **Paso 2.11 Parte D**, junto con los nombres de
solapa hardcodeados de `Fechas.gs:66` y `Auditoria.gs:348`.

### P0 · Tres reglas de negocio nuevas (R-06, R-09, R-10) sin implementar en código

Escritas en `docs/REGLAS_NEGOCIO.md` (31/07/2026, `docs/Prompts/REGLAS_R09_R10.md` +
`docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md`/`Paso-2.10_PartesBC_verificado.md`),
verificadas contra las cuatro bases del 31/07, pero la mitigación de cada una **todavía no
está en el código**:

- **R-06** (`id_cuenta` manda): falta el control de "filas con métricas y sin `id_cuenta`
  válido" en el diagnóstico, por base y por solapa.
- **R-09** (lo cancelado no entra): falta que el match por confianza (Paso 2.9 Parte F,
  `anclar_()`/`ANCLAJE_PENDIENTE` en `Union.gs`) nunca auto-seleccione un candidato cuyo
  último envío sea `Cancelación`/`Reprogramación`, lo marque visible en la lista, y registre
  el motivo en `REUNIONES.notas` si la persona lo elige igual.
- **R-10** (encabezados por espacios, no por mayúsculas): falta aplicar `normalizar()`
  (colapsar espacios/saltos de línea, preservar mayúsculas y acentos) en `Fuentes.gs` donde
  hoy se hace `trim()` sobre encabezados y en `buscarMapeo()`; guardar
  `SOLAPAS.firma_encabezado` con el encabezado crudo, no normalizado; y agregar al
  diagnóstico un control de encabezados duplicados tras normalizar, por solapa.

R-05, R-07 y R-08 son constataciones/decisiones de diseño (no piden código nuevo por sí
mismas, aunque R-07 hace que `Snapshot.gs` deje de ser opcional).

### P1 · Firma de encabezados (de `docs/RDV_otros_ministros_riesgo.md`, congelado)

**La firma de encabezados** — registrar la fila de encabezado de cada solapa mapeada, y
fallar ruidosamente si cambió — es la mitigación general al riesgo de encabezados no
confiables, pero **no está implementada**. Es su propio paso, con su propio test, antes
del `Paso-3-v2` (ver `PROYECTO.md` §7). `diagnosticarBases()` (`Fechas.gs`, DOC-3 Parte B)
ya lee la fila de encabezado de cada solapa mapeada para tipar columnas — la mitad del
trabajo (leer esa fila) queda hecha ahí; falta la otra mitad: guardar la firma y comparar
contra la corrida anterior. `firma_encabezado` ya existe como columna reservada en
`SOLAPAS` (Paso 2.6 Parte E), sin implementar.

### P1 · Pendientes de `DECISION-periodicidad-y-periodos.md` (archivado, DOC-4 31/07/2026)

La decisión de fondo quedó confirmada (`PROYECTO.md` §4: informes semanales por defecto,
ventana definida por la reunión, sin corte diario de datos — ver `VALORES`/
`VALORES_DIVERGENTES`, Paso 2.9H). Quedan sin resolver los detalles finos:

- Si la ventana semanal se deriva automáticamente de la fecha de la reunión (ej. los 7
  días previos) o se carga a mano en la hoja `REUNIONES`.
- Qué columna de fecha usa cada base para filtrar — cruzar con `docs/GRANO_TEMPORAL.md`,
  que ya sostiene que la fecha de la reunión no filtra las filas de canal.
- Si la ventana cierra el día anterior a la reunión o incluye el día parcial de la
  reunión misma.
- Nombre definitivo del token de estampa de actualización (tipo `{{fecha_actualizacion}}`)
  — pasa a `docs/TOKENS.md` cuando se decida.

### P0 · Verificación real del Paso 2

Los criterios **A1–A10** de `docs/Prompts/VERIFICACION_Paso-2.md` (sobre todo A3–A5:
que `filas_en_ventana` coincida con un filtro manual) no se probaron todavía contra la
planilla viva. Hasta que pasen, el Paso 2 (+2.1, +2.3) no está cerrado del todo.

### P1 · `RUNBOOK.md` describe un proyecto que ya no es este

- Parte A pide `clasp create` para crear el proyecto de cero — ya existe.
- Dice "las 6 hojas + PERIODOS"; `HOJAS_CONFIG_` define 7.
- La tabla de `BASES` no tiene `fila_encabezado` ni `modo_periodo`.
- Parte D manda a correr `Paso-1.6.md` (superado, archivado — ver `Paso-1.6-v2.md`).
- El mapa de archivos omite los prompts 1.6-v2, 1.7, 1.8, 1.8-B, 1.9, 2.1, 2.3 y no
  menciona el episodio de spam de Drive.

Es el único doc con instrucciones ejecutables paso a paso — si algo tiene que estar al
día, es este. No se tocó en `DOC-1` (fuera de alcance: ese prompt no toca código ni
`RUNBOOK.md`).

### P1 · Una instrucción emitida fuera del alcance de un paso desaparece sin dejar rastro

Descubierto en `DOC-5` Parte 2 (31/07/2026): en el mismo mensaje en que se pidió corregir
una línea de `docs/Prompts/DOC-5_orden_documental.md`, se acotó la tarea siguiente a
"D-1, y sólo D-1". La corrección, al quedar fuera del alcance declarado del paso, no se
aplicó — no por descuido de quien ejecutó (hizo lo correcto al no tocar nada fuera de
alcance), sino porque **no existe ningún lugar donde una instrucción así sobreviva entre
pasos.** No hay lista de pendientes-entre-turnos: lo único que persiste es lo que alguien
recuerda y repite en el mensaje siguiente. Sin decidir todavía cómo mitigarlo (¿toda
instrucción que quede fuera de alcance se anota acá mismo, como fila nueva, en vez de
perderse?) — queda registrado como el hallazgo, no la solución.

### P0 · API executable: se sirve la versión **desplegada**, no `HEAD`

Anotado antes de que se use (01/08/2026). Cuando el proyecto se despliegue como API
executable para poder correr diagnósticos desde afuera de la planilla, **un `clasp push`
sin redesplegar deja la API sirviendo código viejo**: un diagnóstico devolvería resultados
plausibles de una versión que ya no existe — exactamente el modo de falla caro de este
proyecto (el número que parece bien y no lo es).

Dos mitigaciones, ninguna implementada:

1. **Marca de versión en el retorno de cada función expuesta**, para poder comparar contra
   lo que hay en el repo. Hoy no existe ninguna marca de versión en el código: la cabecera
   de corrida de `DIFF_CONFIGURACION` escribe `version_codigo` con un literal que remite a
   esta nota, justamente porque no hay qué poner ahí.
2. **Lista blanca `EJECUTABLES_REMOTOS_` de sólo lectura**: que la API sólo pueda invocar
   funciones que no escriben. Un `menuAplicarConfiguracion_` disparado contra una versión
   vieja escribe en las hojas de registro.

### P2 · La convención `probar_<nombre>()` no está declarada en ningún lado

El lote del 01/08 la cita como "`CLAUDE.md` §5", pero §5 es **Handoffs — dos archivos, dos
dueños**: la convención no aparece ahí ni en ninguna otra sección. Existía sólo como
patrón de nombres suelto (`probarConexionBases`, `probarLecturaPeriodo`), y esos son
smoke tests manuales de menú, no controles positivos con afirmaciones.

Lo implementado en `Pruebas.gs` (una `probar_*()` por parte, que introduce una discrepancia
conocida, afirma que se detecta y no toca la planilla) **funciona y vale como convención**,
pero hay que escribirla donde corresponde: `Plan Inicial/PROYECTO.md` §9 es el dueño de
"convención de proceso o aprendizaje" (`CLAUDE.md` §7). Falta decidir además si se exige
para todo código nuevo o sólo para lo que un protocolo no puede distinguir.

### P2 · Acoplamiento no declarado: formato de escritura del seed ↔ `parsearFechaCelda_`

El sistema hoy funciona porque `parsearFechaCelda_` (`Fuentes.gs:222`) acepta justo los
formatos que los `SEED_*` escriben (ISO `'2026-06-01'`) y los que Sheets devuelve tras
reparsear (`Date`). Nadie declaró ese contrato: si un seed cambia de formato o el parser
se ajusta, la ventana deja de resolver sin que ningún test lo ate. Detectado en C.2-1
(31/07/2026, la hipótesis de degradación de tipo resultó falsa, pero el acoplamiento
quedó a la vista). Dónde declararlo: comentario cruzado en ambos lados o regla propia.

### P2 · El patrón `commit <pendiente>` en `BITACORA.md`

La bitácora se escribe antes del commit del paso, así que el hash queda `<pendiente>` y
depende de que alguien vuelva a completarlo (ya pasó dos veces: `5b72cf4`, `5c2be2e`).
Un `<pendiente>` olvidado deja una entrada sin ancla verificable. Mitigación barata a
decidir: chequeo al cerrar sesión (grep de `<pendiente>`), o completar el hash en el
mismo commit del paso siguiente.

### P2 · Code escribió un handoff en `docs/Sesiones/`, que la regla le prohíbe

`CLAUDE.md` §5 y §7 y `PROYECTO.md` §9 dicen que `docs/Sesiones/` es **solo de claude.ai**
y que "Code no escribe ahí nunca, ni crea archivos nuevos en ese directorio". El
01/08/2026, por pedido explícito del usuario al cerrar sesión, Code escribió
`docs/Sesiones/HANDOFF 2026-08-01.md` (autoría marcada dentro del propio archivo).

La regla existe porque un handoff con **dos autores** fue lo que generó el conflicto de
sincronización que partió el `HANDOFF.md` original — el problema no era el archivo único,
era el doble dueño. Con Code escribiendo ahí, esa propiedad se pierde. A decidir: o la
regla cambia y se escribe (por ejemplo, `docs/Sesiones/` pasa a ser "handoffs de sesión,
de cualquiera de las dos, con autoría declarada en el encabezado"), o los handoffs de Code
van a otro lado. Lo que no puede quedar es la regla diciendo una cosa y la práctica otra.

### P1 · Chequeo periódico: archivos en disco que no están en git

Tiene **dos motivos opuestos**, y el mismo chequeo cubre ambos:

1. **Visibilidad**: claude.ai solo ve lo pusheado. Un archivo sin trackear (o un commit
   sin pushear) es invisible para la otra herramienta — se razona sin tenerlo (caso
   `HANDOFF 2026-07-31-3.md`, que quedó en disco sin commitear).
2. **Fuga**: el repo es público. Un archivo con datos reales que entra al repo sin que
   nadie lo decida es el riesgo inverso y más caro (caso `samples/` — ver `.gitignore` y
   la auditoría G-1c).

Chequeo: `git status --porcelain --untracked-files=all` limpio al cerrar cada paso, y
todo lo commiteado, pusheado.

### P2 · Referencias rotas a `Plan Inicial/*.md` (movidos a `_archivo/` sin actualizar el prompt que los cita)

| doc que referencia | archivo | ubicación real |
|---|---|---|
| `Paso-0-v2`, `Paso-1`, `Paso-3` | `ARQUITECTURA_registros.md` | `Plan Inicial/_archivo/` |
| `Paso-0.5`, `Paso-2`, `Paso-5` | `Periodos_y_campanias.md` | `Plan Inicial/_archivo/` |
| `Paso-1.7` | `M2_mapeo_y_config.md` | `Plan Inicial/_archivo/` |
| `Paso-5` | `docs/CAMPANAS.md` | `Plan Inicial/_archivo/CAMPANAS.md` |
| `Paso-0` | `FUENTES.md`, `PLAN.md` | `_archivo/FUENTES.md` · `_archivo/PLAN .md` (con espacio) |

Plantillas y deck comentado: alcanza con poner los IDs de Drive al lado del nombre
(`1JrHvs_p…` JM · `1_ZKjWhL…` SECCO · `1yIlCIBG…` comentado) — no es un error, solo falta
la referencia.

### P2 · `Paso-2.5.md` se pisa con `Paso-3-v2.md`

- La tabla de columnas a escribir usa `calculo`, pero la Parte B de `Paso-2.5` cuenta
  como "completos" los que tienen `operacion` — columna que recién crea `Paso-3-v2`.
  Tampoco siembra `valor_fijo`.
- Con el bloque de encuentro repetible (`docs/TOKENS.md` §3), el 2.5 tiene que saber que
  un token de bloque repetible es **una** fila en `MARCADORES`, no una por instancia.

### P2 · Contadores que no cierran

- `DISENO_match_temario.md` §2 dice "ocho comentarios más dicen *a definir*" y lista
  diez; §7.4 dice "los 10 comentarios". Ninguna cifra coincide con el archivo real (8
  hilos, ninguno dice eso). **Asignado a `Paso-2.2.md` Parte D.4** — no se corrige acá.
- `MAPEO_completo.md` (ahora congelado) describe Looker como "31 columnas" y detalla 23.
  Queda como imprecisión del relevamiento original; no se corrige en un doc congelado.

---

## Preguntas al equipo — abiertas, esperando respuesta humana

> Dueña de la pregunta "¿qué se le preguntó al equipo y sigue sin respuesta?"
> (`CLAUDE.md` §7). No son inconsistencias documentales: son preguntas de dominio que
> nacieron en documentos hoy congelados y necesitan un lugar vivo. Al responderse, la
> respuesta va al documento dueño del hecho y la pregunta se tacha acá.

- Las siete preguntas de `docs/VALIDACION_2026-07-31.md` §7 ("Preguntas para el equipo")
  — siguen abiertas; el detalle está allá, esta línea existe para que no queden
  enterradas en un doc congelado.

## Nota sobre `Paso-3-v2.md`

Su bloque "Antes de empezar" todavía reabre la decisión Looker-vs-SD y el alcance del
corte vertical. **No se toca desde `DOC-1` ni desde este archivo** — está asignado como
Reconciliación 1 de `docs/Prompts/Paso-2.4.md`. Corregirlo acá duplicaría el trabajo y
dejaría a `Paso-2.4.md` describiendo un pendiente que ya no existe.
