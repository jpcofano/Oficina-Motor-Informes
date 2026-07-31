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

**No crear archivos `.md` nuevos.** Si algo hay que documentar, va en uno de los archivos
de esta tabla. Si de verdad no entra en ninguno, **preguntar antes de crearlo** y, si se
crea, declararlo en la taxonomía de `PROYECTO.md` §9 en el mismo commit. Esta es la regla
que más importa: el repo ya acumuló una docena de documentos que nacieron sueltos y
divergieron entre sí.

| Qué estás por escribir | Dónde va |
|---|---|
| Decisión de arquitectura, esquema o negocio | `Plan Inicial/PROYECTO.md` (sección que corresponda) |
| Estado del proyecto, paso terminado, pendiente resuelto | `Plan Inicial/PROYECTO.md` §7 |
| Convención nueva o aprendizaje de proceso | `Plan Inicial/PROYECTO.md` §9 |
| Cómo se opera / se corre algo | `docs/RUNBOOK.md` |
| Token nuevo, renombrado o eliminado | `docs/TOKENS.md` |
| Inconsistencia detectada y no resuelta | `docs/PENDIENTES_consistencia.md` |
| Qué hizo un paso | `docs/BITACORA.md` — entrada nueva, siempre |
| Dónde quedó el trabajo | `docs/HANDOFF_CODE.md` — se reescribe |
| Regla del dominio que el motor da por cierta | `docs/REGLAS_NEGOCIO.md`, ID `R-NN` nuevo |
| Supuesto asumido para poder avanzar | `docs/SUPUESTOS.md`, ID `S-NN` nuevo |
| Prompt de un paso del motor | `docs/Prompts/Paso-N.md` |
| Prompt de trabajo documental | `docs/Prompts/DOC-N_*.md` (no consume número de paso) |
| Prompt de auditoría | `docs/Prompts/AUD-N_*.md` |
| Relevamiento o hallazgo fechado | **Ninguno nuevo** — la conclusión va al PROYECTO |

**Los tres estados de un documento** (§9): *vivos* se editan; *congelados* se leen y no se
editan (si un congelado necesita cambiar, el cambio va al PROYECTO o el doc pasa a vivo
explícitamente); *archivados* en `Plan Inicial/_archivo/` o `docs/Sesiones/_archivo/`.
Editar un congelado en silencio es exactamente lo que costó la mitad del `DOC-1`.

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

Si el push es rechazado porque el remoto avanzó, **parar y preguntar.** Nunca `--force`:
este repo se edita desde dos herramientas y un force-push pisa trabajo que no se ve.

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

## 7. Idioma

Todo en español: código, comentarios, documentación, commits y conversación.
