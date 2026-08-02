# CLAUDE.md — Motor de Informes (GCBA)

Motor en Google Apps Script que arma informes en Google Slides leyendo datos de Google
Sheets. **Es un motor, no un informe:** agregar un informe nuevo = plantilla nueva +
filas de config. Nunca requiere tocar código.

Contexto profundo → `Plan Inicial/PROYECTO.md`. Operación → `docs/RUNBOOK.md`.
Punto de partida de cada sesión → `docs/HANDOFF_CODE.md` (estado actual) + el handoff más
reciente de `docs/Sesiones/` (verificaciones de claude.ai). Ver §5.

---

## 1. Antes de escribir una línea

**Greppear el nombre de toda función o `var` global nueva.** Apps Script concatena todos
los `.gs` en un único scope global: dos definiciones con el mismo nombre no dan error,
una pisa a la otra en silencio. Este repo se edita desde dos herramientas que no se ven
entre sí (esta sesión con git, y claude.ai directo sobre la carpeta), así que la colisión
es un riesgo real, no teórico — ya pasó con `parsearFecha_`.

```
grep -rn "function nombreNuevo_" *.gs
```

---

## 2. Reglas de código — invariantes

- **Regla de oro: toda la aritmética vive en `Marcadores.gs` y en ningún otro lado.**
  Los demás módulos solo leen config, leen datos o pintan Slides. Si un cálculo aparece
  fuera de `Marcadores.gs`, es un bug de arquitectura aunque el número dé bien.
- **Nada de nombres hardcodeados.** Bases y plantillas se descubren leyendo las hojas de
  registro (`CONFIG`, `BASES`, `INFORMES`, `MARCADORES`, `MAPEO`, `CAMPANAS`,
  `PERIODOS`). Si aparece un nombre de base o de plantilla literal en el código, está mal.
- **Un token que falla escribe `«FALTA:token»`, no rompe la corrida.** Resiliencia sobre
  fragilidad: el informe sale con los huecos marcados y visibles.
- **La plantilla es del equipo, el motor se adapta** (§6 del PROYECTO). Nunca al revés.
  Toda migración que escriba sobre una plantilla crea backup antes.
- **Los renombres de tokens son por `informe_id`, nunca globales.** El mismo nombre puede
  ser correcto en una plantilla e incorrecto en otra — lo demostró la regresión de
  `enc_audiencia`.
- **Una solapa con `uso = 'ignorar'` en la hoja `SOLAPAS` no se toca nunca.** Ni se lee,
  ni se audita, ni se mapea, ni se diagnostica, ni se la menciona en un reporte de
  hallazgos. Consultar con `usoSolapa_(base_id, solapa)` antes de recorrer solapas y
  saltear las ignoradas de entrada. No son un pendiente ni algo a revisar: ya se
  decidieron. Son pivots, backups, copias de trabajo y duplicados — el caso `digital/RDV`
  duplica la base `rdv` y leerla produce doble conteo. Auditarlas es tiempo perdido y,
  peor, reabre discusiones cerradas.
  (`revisar` es un estado distinto y sí requiere atención; no confundirlos.)
- Las bases se abren por ID con `SpreadsheetApp.openById()`, una sola vez por corrida,
  vía el caché de módulo en `Fuentes.gs`.
- Archivos `.gs` en PascalCase (`Fuentes.gs`, `Marcadores.gs`). Funciones privadas con
  sufijo `_`.

---

## 3. Dónde va cada cosa — ruteo obligatorio

**No crear archivos `.md` nuevos.** Si algo hay que documentar, va en el documento que la
tabla de §7 declara dueño de esa pregunta. Si de verdad no entra en ninguno, **preguntar
antes de crearlo** y, si se crea, agregarle su fila en §7 y en la taxonomía de
`PROYECTO.md` §9 en el mismo commit. Esta es la regla que más importa: el repo ya acumuló
una docena de documentos que nacieron sueltos y divergieron entre sí. Los prompts nuevos
van a `docs/Prompts/` (`Paso-N.md` para pasos del motor, `DOC-N_*.md` para trabajo
documental — no consume número de paso —, `AUD-N_*.md` para auditorías). Relevamientos o
hallazgos fechados: **ninguno nuevo** — la conclusión va al PROYECTO.

**Los tres estados de un documento**: *vivos* se editan; *congelados* se leen y no se
editan (si un congelado necesita cambiar, el cambio va al PROYECTO o el doc pasa a vivo
explícitamente); *archivados* en `Plan Inicial/_archivo/`, `docs/Prompts/_archivo/` o
`docs/Sesiones/_archivo/`. El estado lo declara **cada documento en su propio
encabezado**, no un índice central. Editar un congelado en silencio es exactamente lo que
costó la mitad del `DOC-1`.

**Antes de pedir que se corrija algo en un archivo existente, grepearlo primero.**
Un pedido de corregir algo que no está ahí empuja a editar de más, y a meter en un archivo
contenido que tiene dueño en otro. Si el grep da cero, el resultado correcto es cero
ediciones y se registra el cero. Aplica a los tres lados: al que escribe el prompt, al que
lo pasa y a Code. Origen: 01/08, `AUD-3` Tarea 1 — se pidieron tres correcciones sobre una
sospecha no verificada; las tres premisas no estaban en el archivo.

---

## 4. Flujo de trabajo — un paso, un test, un commit

1. Se termina un paso → **se avisa y se para.** No se avanza al siguiente por cuenta
   propia.
2. El usuario prueba y confirma.
3. Recién ahí se documenta y se commitea: **entrada en `docs/BITACORA.md` siempre**,
   `docs/HANDOFF_CODE.md` reescrito, y `PROYECTO.md` si el paso cambió algo estructural.
4. Mensaje: `Paso N ✅ — <resumen corto>`. Un paso por commit, sin bundles.
5. Si el working tree tiene cambios de más de un paso al momento de commitear: **parar y
   preguntar**, no bundlear.
6. Commits de documentación separados de commits de código.
7. Excepción: un prompt puede pedir varios commits internos (Partes A/B/C) si lo indica.

**`git push` después de cada commit, sin preguntar.** El remoto no es un canal de
release: es el backup del trabajo y la única forma que tiene la sesión de claude.ai de ver
el estado real del repo. Un commit sin pushear es invisible. Pushear al terminar cada
paso, no acumular al final de la sesión.

Si el push es rechazado porque el remoto avanzó, **parar y preguntar.** `--force` **no se
usa por cuenta propia: requiere confirmación explícita del usuario**, pedida en el momento.
No está vetado —el repo es backup y canal de contexto, no un historial compartido con
terceros— pero sigue siendo la última opción: este repo se edita desde dos herramientas que
no se ven entre sí, y un force-push pisa trabajo que no está a la vista. Antes de pedir la
confirmación, mirar qué commits se estarían tirando.

Quien implementa no se autoverifica. Los errores del Paso 2.2 se cazaron verificando
archivos vivos, no leyendo los reportes de las funciones. Reportar lo que se hizo, no
declarar que funciona.

---

## 5. Handoffs — dos archivos, dos dueños

El repo se edita desde dos herramientas que no se ven entre sí. Cada una tiene su handoff
y **nunca escribe en el del otro.** Así se evita el conflicto de sincronización de OneDrive
que partió el `HANDOFF.md` único original.

**`docs/HANDOFF_CODE.md` — de Code. Se reescribe.**
Solo estado actual: en qué paso estamos, qué sigue, qué está trabado y por qué. Es un
puntero al presente, no un historial: al actualizarlo se **reemplaza** el contenido, no se
agrega abajo. La historia ya vive en `docs/BITACORA.md`. Se actualiza al cerrar cada paso,
antes del commit.

**`docs/Sesiones/HANDOFF AAAA-MM-DD.md` — de claude.ai. Son snapshots.**
Los baja el usuario de sus conversaciones y los deja en la carpeta. **Code no escribe ahí
nunca**, ni crea archivos nuevos en ese directorio. Solo los lee: el más reciente por fecha
es contexto valioso para arrancar, porque suele traer verificaciones hechas contra los
archivos vivos. Los anteriores se archivan en `docs/Sesiones/_archivo/`.

Al arrancar una sesión, leer los dos: `HANDOFF_CODE.md` dice dónde quedó el trabajo, el
handoff de claude.ai más reciente dice qué se verificó y qué se decidió.

---

## 6. Mapa del repo

```
CLAUDE.md                           este archivo — convenciones y ruteo, raíz del repo
*.gs, Panel.html, appsscript.json   código Apps Script (raíz — así lo espera clasp)
Plan Inicial/PROYECTO.md            documento maestro
Plan Inicial/_archivo/              historial: docs superados, plantillas .pptx espejo
docs/RUNBOOK.md                     guía de operación
docs/TOKENS.md                      diccionario de tokens
docs/PENDIENTES_consistencia.md     inconsistencias abiertas
docs/Prompts/                       Paso-N / DOC-N / AUD-N
docs/BITACORA.md                    qué hizo cada paso (append-only, solo Code)
docs/HANDOFF_CODE.md                estado actual (se reescribe, solo Code)
docs/REGLAS_NEGOCIO.md              reglas del dominio, ID R-NN
docs/SUPUESTOS.md                   supuestos asumidos, ID S-NN
docs/Sesiones/                      handoffs bajados de claude.ai — Code no escribe acá
```

`.claspignore` ya está configurado para pushear solo `appsscript.json`, `*.gs` y `*.html`.
Al agregar un tipo de archivo nuevo, verificar que no se cuele al push.

---

## 7. Quién es dueño de qué — una pregunta, un dueño único

Instalada por `DOC-5` (31/07/2026). No es un ranking: dos documentos con preguntas
distintas nunca compiten. La precedencia entra solo como desempate, al final.

| pregunta | dueño único | quién escribe |
|---|---|---|
| ¿Cómo se trabaja en este proyecto? (método, regla de parada, invariantes) | `CLAUDE.md` (raíz) | los dos |
| ¿Arquitectura, esquema, decisión estructural? | `Plan Inicial/PROYECTO.md` §1–§6, §8 — vale solo la sección o fila que **lleve su propia fecha escrita** (git versiona archivos, no secciones; la fecha de commit no sirve para esto) | los dos |
| ¿Convención de proceso o aprendizaje? | `Plan Inicial/PROYECTO.md` §9 | los dos |
| ¿Dónde estamos ahora mismo (qué paso, qué falta)? | `docs/HANDOFF_CODE.md` — se reescribe entero | solo Code |
| ¿Qué sigue y en qué orden? ¿Qué decisión de arquitectura ya está tomada? | `docs/PLAN.md` — decisiones `D-NN` (estables, se superseden), Próximo / Planificado y bloqueado / Backlog. Distinto del handoff: éste dice **hacia dónde**, el handoff dice **dónde estamos** | los dos |
| ¿Qué se hizo y cuándo, historial completo? | `docs/BITACORA.md` — append-only. Si discrepa con `HANDOFF_CODE.md` sobre un hecho histórico, **gana la bitácora**: no puede perder una entrada al reescribirse; el handoff es un resumen que puede quedar atrás y se reconstruye desde ella | solo Code |
| ¿Qué se verificó/decidió en la última sesión de claude.ai? | El handoff de `docs/Sesiones/` **vigente por cadena de reemplazo** (ver abajo), no por ubicación de carpeta | solo claude.ai |
| ¿Qué se construyó en un paso puntual y cómo se verifica? | El prompt vigente de su cadena en `docs/Prompts/`. No dice si ya corrió ni si sigue siendo cierto hoy — eso es de la bitácora y el handoff | los dos; no se edita una vez ejecutado (addenda fechados sí, ver abajo) |
| ¿Qué dice una regla del dominio? | `docs/REGLAS_NEGOCIO.md`, ID `R-NN`, append-only, derogación con fecha | los dos |
| ¿Qué supuesto se está asumiendo? | `docs/SUPUESTOS.md`, ID `S-NN`, ídem | los dos |
| ¿Cómo se llama este token? | `docs/TOKENS.md` | los dos |
| ¿Qué inconsistencia documental sigue abierta? | `docs/PENDIENTES_consistencia.md` | los dos |
| ¿Qué se le preguntó al equipo y sigue sin respuesta? | `docs/PENDIENTES_consistencia.md`, sección propia "Preguntas al equipo" (nacen en docs congelados como `VALIDACION` §7; al congelarse el doc, la pregunta viva se copia ahí) | los dos |
| ¿Qué número dio una medición y contra qué se verificó? | `docs/VALIDACION_*.md` + su CSV de casos — congelados, uno nuevo por corrida de validación | nadie edita; se crea uno nuevo |
| ¿Qué dio una corrida de protocolo de prueba y contra qué se verificó? | `docs/PROTOCOLO_*_corrida_*.md` — congelados, uno nuevo por corrida. Distinto de `VALIDACION_*`: eso mide números del informe contra las bases, esto verifica el comportamiento del motor contra un protocolo escrito | nadie edita; se crea uno nuevo |
| ¿Cómo se opera / se corre algo? | `docs/RUNBOOK.md` | los dos |
| ¿A qué URL le pego, con qué cuenta, y dónde vive esa credencial? | `docs/ENTORNO.local.md` — **fuera de git** (Paso 1.8). Ningún otro documento repite una URL o una cuenta: el RUNBOOK explica la operatoria y apunta acá | los dos |
| ¿Qué decisión editorial lleva cada informe? (qué campañas, qué va a mano) | `docs/CONFIG_INFORMES.md` | los dos |
| ¿Qué debe cumplir una lámina nueva pedida en lenguaje natural? | `docs/OBJETIVO_lamina_nueva.md` | los dos |
| ¿Qué va a hacer el motor si corro ahora? | Las **hojas de registro** vivas (`CONFIG`, `BASES`, `INFORMES`, `MARCADORES`, `MAPEO`, `CAMPANAS`, `PERIODOS`, `SOLAPAS`, `SECCIONES`). Autoridad total sobre el comportamiento — y sobre nada más (nota abajo) | humano y motor, vía menú |
| ¿Qué *debería* decir esa configuración? | Los `SEED_*` de `Instalar.gs` (el valor) y `docs/ESCRITORES.md` (quién puede escribirlo y por qué camino — existe desde AUD-3, 01/08/2026; matriz regenerable con `tools/escritores.js`) | los dos |
| ¿Cuáles son los datos? | Las cuatro bases (`rdv`, `digital`, `looker`, `m2`) — dueños ajenos, el motor solo lee. No divergen de nada: **son** el dato; la nota de abajo no les aplica | el equipo y dueños externos |
| ¿Qué versión vale si el disco local y git divergen? | **El disco local.** Git atrasado es una falla de respaldo a corregir, no una contradicción a dirimir. Corolario: lo que claude.ai tenga que ver, tiene que estar pusheado — un archivo sin pushear no está en la conversación | — |

**Hojas de registro: estado, no verdad.** Si lo que hace el motor y lo que dice el
sembrador no coinciden, ninguno "gana": es un **hallazgo**, va a
`docs/PENDIENTES_consistencia.md` (pasó con `BASES.m2.hoja_default`, y este cuadro existe
por eso). Aplica solo a las hojas de registro, no a las cuatro bases.

**Cadena de reemplazo — un solo campo, `reemplaza:`.** El documento nuevo declara en su
encabezado a cuál(es) reemplaza; el viejo no se edita y por eso no puede apuntar a nada.
Mismo campo en prompts y en handoffs. Un documento puede ser reemplazado por **varios**
(`Paso-2.10` quedó partido en dos addenda) — para saber qué está vigente hay que seguir
todas las declaraciones, no la primera. Vigente = lo que ninguna declaración cubre.

**Addenda fechados.** "No se edita" significa no alterar una línea del texto original —
no que el documento quede mudo ante un error propio: un addendum fechado y marcado que
corrige una premisa es válido (ejemplos: `docs/DISENO_match_temario.md` §9,
`docs/Prompts/DOC-5_orden_documental.md`).

**Todo lo demás es evidencia congelada, no dueño de ninguna pregunta:** los relevamientos
y hallazgos fechados de `docs/` (`AUD-2`, `HALLAZGOS_validacion_decks`,
`DISENO_match_temario`, `FECHAS_seleccion`, `GRANO_TEMPORAL`, `INFORMES_relacion`,
`MAPEO_completo`, `PLANTILLAS_QA_y_armonizacion`, `RDV_otros_ministros_riesgo`,
`SECCIONES`, `TEMARIO_Y_PLANTILLA_*`, `INVENTARIO_CODIGO` — foto del código del
01/08/2026, AUD-3; para saber qué es cierto hoy se re-corren sus scripts), los prompts ya
ejecutados, los handoffs archivados y todo `_archivo/`. Explican cómo se llegó; nunca qué
es cierto hoy.

**Desempate**, para el caso raro en que dos documentos reclamen la misma pregunta: gana
el que **esta tabla** declara dueño; si ninguno lo es, gana el que lleve la **fecha
escrita** más reciente — nunca la fecha de commit, nunca la ubicación de carpeta (la
ubicación fue justo lo que falló con los handoffs del 31/07).

---

## 8. Idioma

Todo en español: código, comentarios, documentación, commits y conversación.
