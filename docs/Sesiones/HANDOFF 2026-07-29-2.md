# HANDOFF — Motor de Informes (GCBA) · v2 · 29/07/2026

> Para arrancar una conversación nueva con contexto completo. **Trabajamos en español.**
> Reemplaza a la v1 del 29/07/2026. Versión anterior → `Plan Inicial/_archivo/`.

---

## Qué es

Motor **Google Sheets → Apps Script → Google Slides** que genera presentaciones
configurables sin tocar código. Diseño **por registros**: agregar una base o plantilla =
agregar una fila, no código.

**Regla de oro:** toda la aritmética vive solo en `Marcadores.gs`. El resto lee config,
lee datos, parsea texto o pinta Slides.

**Framing institucional:** *el sistema arma el informe; las conclusiones las sigue
escribiendo el equipo.* Extensión validada en esta sesión: *el sistema propone el match;
el equipo lo confirma.*

---

## Repo y entorno

- **GitHub:** `https://github.com/jpcofano/Oficina-Motor-Informes`
- **Local:** `C:\Users\20243359679\OneDrive\Documentos\AppsScript\Oficina\Motor Informes` (Windows)
- **Cuentas:** `jpcofanogcba1` = robot (dueño del script y de la planilla de control) ·
  `reporteseinformesgcba` = usuario (dueño de bases, plantillas y salidas)
- **Arq. 1:** script **bound** a la planilla de control. `onOpen` (sidebar) = admin;
  web app (`doGet`, corre como robot) = usuario final. Todo se accede **por ID**.

**Carpetas de Drive:**
- Plantillas: `1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi`
- Salida: `1EyTlfg16vpyrftpUXgacShFk8iSbX_fJ` — la consume `Generador.gs` en el Paso 4

---

## Estado real del código (verificado clonando el repo)

**Último commit:** `9899c14 — Paso 1.8-B ✅`

**Hecho:** Pasos 0, 0.5, 1, 1.5, 1.6, 1.7, **1.8-B**.

- `Instalar.gs` (~400 líneas): 7 hojas registro, `seedConfiguracion()`,
  `registrarPlantillasDesdeCarpeta()`, `upsertPorClave_()`, `asegurarColumna_()`
- `Config.gs`: `leerBases()`, `leerInformes()`, `leerRegistro_()`
- `Fuentes.gs`: `abrirBase()`, `abrirHoja()` (caché por corrida), `probarConexionBases()`
- `Codigo.gs`: menú
- `appsscript.json`: **`timeZone` en America/Argentina/Buenos_Aires y 5 `oauthScopes`
  explícitos** — el Paso 1.8-B ya está aplicado
- Plantillas registradas OK — `INFORMES.plantilla_id` cargado en `jm` y `secco`

**Stubs vacíos:** `Marcadores.gs`, `Generador.gs`, `PanelBackend.gs`, `Snapshot.gs`,
`Automatizacion.gs`.

**Pendiente inmediato:** `Paso-1.9` — `SEED_BASES_` todavía no tiene `fila_encabezado`
ni `modo_periodo`. **Bloquea el Paso 2.**

⚠ **Dos prompts que el HANDOFF v1 daba por generados NO están en el repo:**
`Paso-2.5.md` y `Paso-3-v2.md`. Hay que regenerarlos. Si se corre `Paso-3.md` tal como
está, se vuelve al diseño de una función por marcador (~200) que ya fue descartado.

⚠ **Housekeeping:** `claspignore` sigue sin el punto inicial. Mientras siga así, clasp
intenta subir todo `docs/` al proyecto de Apps Script.

---

## Prompts pendientes de correr

| # | Archivo | Qué hace | Prioridad |
|---|---|---|---|
| 1 | `Paso-1.9.md` | MAPEO completo + `fila_encabezado`/`modo_periodo` en BASES | **alta — bloquea el Paso 2** |
| 2 | `Paso-1.8.md` (A y C) | convención commit-por-paso + plantilla de bitácora | media |
| 3 | `Paso-1.6-v2.md` | saca los IDs de carpeta hardcodeados a CONFIG | media |
| 4 | `Paso-2.md` | lectura con ventana de fechas | — |
| 5 | `Paso-2.5.md` | **hay que regenerarlo** — siembra MARCADORES desde los tokens | — |
| 6 | `Paso-3-v2.md` | **hay que regenerarlo** — `Marcadores.gs` con operaciones genéricas | — |

`Paso-3-v2.md` reemplaza a `Paso-3.md` · `Paso-1.6-v2.md` reemplaza a `Paso-1.6.md`.

**Cambio de orden recomendado:** subir `Snapshot.gs` antes de la capa de panel. Ver
"Aprendizajes" § acumulación.

---

## Bases vivas

| base_id | sheet_id | hoja | modo |
|---|---|---|---|
| rdv | `1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo` | RVD JM-CM - ES | filtrar |
| digital | `1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY` | Digital | filtrar |
| looker | `1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ` | resumen_metricas | filtrar |
| m2 | `1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY` | M2 periodo DIRECTA | **snapshot**, encabezado fila 3 |
| miba | *(parqueada)* | | `activo=no` |

**Solapas adicionales que hay que registrar** (misma planilla, distinta hoja → fila
propia en BASES):

| base_id sugerido | planilla | hoja | para qué |
|---|---|---|---|
| rdv_ministros | rdv | `RDV_otros_ministros` | encuentros de ministros (respaldo de la ancla) |
| rdv_comunas | rdv | `Comunas` | catálogo barrio→comuna, 48 filas |
| digital_desglose | digital | `CAMPAÑAS_DESGLOCE_DIGITAL` | desglose por plataforma y `Id cuentas` |
| digital_mail | digital | `Directa Mail` | una fila por envío |

⚠ `RDV_otros_ministros` tiene **los encabezados corridos una columna** respecto de los
datos: el header dice `Inscriptos` donde el dato trae el estado. Hay que mapearla por
posición, no por nombre. Y usa otro vocabulario de estado: `Realizada`/`Programado`,
no `en agenda`/`Suspendida`.

Mapeo completo de columnas: `docs/MAPEO_completo.md`.

---

## Hechos confirmados esta sesión

**Período: de viernes a jueves.** Semana de referencia: vie 24/07 → jue 30/07.

**`Id cuentas` es la clave de join.** Se obtiene en `CAMPAÑAS_DESGLOCE_DIGITAL` y filtra
`Directa Mail`, IVR y Call Center. El tipo de mail de convocatoria es `convocatoria`.

**PRE y POST comparten `Id cuentas`.** La única diferencia es la palabra "Post" en el
nombre de la campaña: la que no dice nada es la PRE.

**Looker es el rollup de Seguimiento Digital**, no una fuente en competencia. Verificado
en dos campañas: los totales de `resumen_metricas` son la suma exacta de las filas de
`Directa Mail`. La decisión #1 del v1 estaba mal planteada — la pregunta es granularidad,
no cuál es verdad. **Recomendación: Seguimiento Digital como fuente de fila**, porque el
desagregado por envío que piden las slides 16 y 25 solo existe ahí.

**Anclaje en RDV — regla fijada:**
1. Hoja ancla: `RVD JM-CM - ES`.
2. Se filtra por `STATUS REUNIÓN = Realizada` **primero**; después se elige la solapa.
3. `FECHA` de esa hoja es la fecha definitiva y **le gana** a la del nombre de campaña.
4. Si no hay fila Realizada en la ancla, se cae a `RDV_otros_ministros`.
5. El resto de las solapas se ignora, incluida `Funcionarios  Ministros` (congelada en
   agosto 2025).
6. Deduplicación entre solapas: **fecha + persona canónica**.
7. Si la ancla dice `en agenda` y la otra dice `Realizada` con datos, **el motor lo
   reporta en el diagnóstico**: es falta de actualización de RDV y tiene que verse.

**`Realizada` no garantiza dato completo.** Orden Público del 28/07 está Realizada con
753 inscriptos y `Asistentes` vacío → `«FALTA:ecv_asistentes»` sin abortar la slide.

---

## Decisiones abiertas

1. ~~Looker vs Seguimiento Digital~~ → **resuelta**, ver arriba.
2. **`conv_*`, `rep_*`, `rrss_*`, `camp_resp_*` de SECCO.** Más cerca: el archivo de RDV
   tiene tres solapas con la estructura exacta de la tabla de respuestas moderadas
   (`Respuestas JM 📩`, `Visualiz_respuestas_JM`, `Visualiz_respuestas_GCBA`), pero
   **sin las campañas de los informes de muestra**. Falta saber si el sample es viejo o
   si esas respuestas se cargan en otro lado.
3. ~~Encuentro temático: cómo decirle al motor cuál es~~ → **resuelta**: lo dice el
   temario. Ver `docs/DISENO_match_temario.md`.
4. ~~Campañas que cruzan semanas: acumulado o tramo~~ → **resuelta: acumulado**, y no por
   decisión sino porque la base no permite otra cosa (una fila por campaña, sin
   desagregado diario).
5. **MiBA:** sin fuente. Los `miba_*` salen `«FALTA:token»`.
6. **Tercer informe:** sin identificar. No bloquea.
7. **Programmatic/DV360:** en "personas mayores" la fila de julio repite las métricas de
   junio (mismas impresiones y clics) pese a tener otro consumo. Looker suma las dos y
   el 87% de las impresiones de esa campaña queda duplicado. **Pendiente de la fuente**,
   el motor no lo puede resolver.
8. **Diez slides del SECCO marcado dicen "a definir"** en su comentario: 8, 19, 21, 22,
   23, 27, 29, 30, 31, 32.

---

## Aprendizajes

**Los decks de muestra no son ground truth exacto.** Tres causas distintas y con
soluciones distintas: métricas que siguen acumulando después del corte, errores
aritméticos en el deck, y slides snapshoteadas en momentos distintos dentro del mismo
archivo. Detalle en `docs/HALLAZGOS_validacion_decks.md`.

**Criterio de aceptación revisado:** el motor reproduce **la base**, no el deck. Cada
diferencia se clasifica en (a) creció desde el corte, (b) error del deck, (c) bug del
motor. Solo (c) frena el commit.

**Acumulación → `Snapshot.gs` es obligatorio.** Looker tiene una fila por campaña con el
acumulado y sin desagregado diario. El motor no puede calcular "el tramo de la semana":
solo puede leer el acumulado al momento de correr. Correr hoy para un período viejo
devuelve los números de hoy. Sin congelar al cierre no hay reproducibilidad ni auditoría.

**`Fecha inicio` no es la fecha del encuentro.** Es el arranque de la pauta de
convocatoria, entre 3 y 7 días antes. La fecha del encuentro está adentro del string del
nombre. Por eso se ancla en RDV, que tiene columna `FECHA` real.

**Ni el nombre ni la fecha alcanzan solos para matchear.** San Cristóbal y Retiro tienen
las fechas cruzadas entre temario y base (se movieron las reuniones y el nombre quedó
viejo) → ahí manda el nombre. Hay dos campañas de Orden Público con el mismo nombre y
distinta fecha → ahí manda la fecha. Por eso el score con confirmación humana.

**El temario de WhatsApp es la selección.** La ventana de fechas sirve para calcular
métricas, no para elegir qué entra al informe: San Cristóbal del 23/07 cae fuera de la
ventana vie 24 → jue 30 y está igual en el temario.

**Nombres de personas: 17 personas en 34 escrituras.** Normalizando acentos y mayúsculas
y comparando como conjunto de palabras (`JORGE MACRI` = `MACRI JORGE`). Umbral: dos
palabras en común. **Una sola palabra nunca une automáticamente** — `GABRIEL MRAIDA` y
`GABRIEL SANCHEZ ZINNY` no son la misma persona. Dos casos eran errores de tipeo, ya
resueltos: `FERMIN QUIROS` → `FERNAN QUIROS`, `RUTH LANDRECHE` → `RUTH LANDERRECHE`.

**El catálogo de barrios no se hardcodea.** La solapa `Comunas` de RDV tiene las 48 filas
barrio→comuna. Coincide 48/48 con la lista que estaba en código, salvo dos escrituras
(`Monserrat`/`Montserrat`, `Villa Gral. Mitre`/`Villa General Mitre`).

**Los vacíos no se silencian.** Todo parseo devuelve un flag de reconocido y el
diagnóstico lista lo que falló. Un vacío silencioso es como se pierde un encuentro entero
sin que nadie se entere.

**⚠ El episodio de Drive (sigue vigente).** "Registrar plantillas" veía la carpeta vacía
pese a permisos correctos. La causa: Google marcó las dos plantillas como **spam**. Un
archivo en spam sigue existiendo y compartido, pero no aparece en `getFiles()`. **Si algo
en Drive "no aparece" pese a permisos correctos, revisar spam antes que el código.**

**`upsertPorClave_` es destructivo.** Arma la fila con
`headers.map(h => (h in obj) ? obj[h] : '')`: escribe vacío cualquier columna que el
objeto semilla no traiga. Al agregar columnas hay que actualizar los arrays `SEED_*`, y
al resembrar `MARCADORES` usar una variante que solo complete celdas vacías.

**Convención de `campo_logico`.** El prefijo de familia vive en `marcador`, no en
`campo_logico`: `marcador='ecv_inscriptos'`, `familia='ecv'`, `campo_logico='inscriptos'`.

**Operaciones genéricas, no función por marcador.** `SUMA/CONTEO/RATIO/ULTIMO/TEXTO`.
Y ojo: **`alcance` y `frecuencia` no son SUMA** — el alcance no es aditivo entre
plataformas, se toma de la hoja `ALCANCE` con `ULTIMO`.

**Método para el Paso 3: corte vertical.** JM slide 5 (Uno a uno), verificada contra RDV:
`ecv_inscriptos` = 83 y `ecv_asistentes` = 12 salen exactos. El filtro necesita tres
condiciones, no solo la fecha: `EVENTO = "1 a 1"` + `STATUS = Realizada` + figura. El
token "minutos promedio" **no tiene fuente** en RDV.

---

## Documentos de referencia

| archivo | qué contiene |
|---|---|
| `docs/HALLAZGOS_validacion_decks.md` | cruce deck vs. base, número por número |
| `docs/DISENO_match_temario.md` | match por confianza, anclaje en RDV, equivalencias |
| `docs/PERSONAS_equivalencias.csv` | 17 personas, 34 variantes — semilla de la solapa |
| `docs/PREGUNTAS_equipo.md` | 6 preguntas pendientes con el equipo |
| `docs/VERIFICACION_Paso-2.md` | criterios de aceptación del Paso 2 |
| `docs/MAPEO_completo.md` | mapeo de columnas por base |
| `docs/CONFIG_INFORMES.md` | inventario que termina siendo el manual de operación |
| `Parseo.gs` | fecha, barrio, comuna, eje, tipo, pre/post |

---

## Método de trabajo

- **Un paso = un prompt para Code = una prueba del usuario = un commit.** No se avanza
  hasta que el paso actual pasa.
- Los commits de documentación van **aparte** de los de código.
- Code documenta en `HANDOFF.md` y commitea **recién después** de que el usuario confirma.
- **Ubicación:** prompts → `docs/Prompts/Paso-*.md` · doc maestro →
  `Plan Inicial/PROYECTO.md` · operación → `docs/RUNBOOK.md` · superados →
  `Plan Inicial/_archivo/` · código (`.gs`, `.html`, `appsscript.json`) → raíz.
- Todo lo que se conversa se entrega **como archivo para el repo**, no suelto en el chat.
- **Preguntar antes de asumir.** Lo que define el negocio se valida contra los informes
  de muestra y con el equipo, no por criterio técnico.

---

## Próximo paso

1. Correr **Paso 1.9** (bloquea el 2).
2. Regenerar `Paso-2.5.md` y `Paso-3-v2.md`.
3. Arreglar `claspignore` → `.claspignore`.
4. Probar `Parseo.gs` y commitearlo.
5. Correr el **Paso 2** contra `docs/VERIFICACION_Paso-2.md`.
