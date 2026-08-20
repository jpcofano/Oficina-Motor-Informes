# 2026-08-19_1 — Ordenar la rama de validación en el repo

> Destino: `docs/Prompts/2026-08-19_1_ordenar_rama_validacion.md`
> **Trabajamos en español.**
> No toca el motor. Sólo `docs/`. Ningún `.gs`, ningún seed, ninguna hoja de registro.
> Un commit por parte.

## Contexto

La rama de validación de números produce casos en un CSV y un handoff propio. Hoy los dos
viven fuera de git: el repo tiene el CSV del 14/08 con 214 casos, la rama va por 218, y
ningún `HANDOFF_validacion_*` entró nunca al repo. Este paso los incorpora y deja la
convención de nombre alineada con `CLAUDE.md` §7.

El usuario deja dos archivos en la raíz del repo antes de correr esto:
`casos_validacion_2026-08-19.csv` y `HANDOFF_validacion_2026-08-19.md`.

---

## Parte 0 — Verificación de premisas · sólo lectura

**Modelo: Sonnet. Effort: normal.**

No escribas nada en esta parte. Ni un archivo, ni un commit, ni un `mkdir`.

Verificá y reportá:

1. `git log -1` — hash y fecha del HEAD.
2. Que existe `docs/casos_validacion_CONSOLIDADO_2026-08-14.csv`. Contá sus filas de datos
   (sin encabezado) y decí cuántas son.
3. Que **no** existe ningún `docs/casos_validacion_2026-08-19.csv` ni ningún
   `docs/casos_validacion.csv` sin fecha.
4. Que los dos archivos que el usuario dejó en la raíz existen. Si falta alguno, **parás acá**.
5. Diff de casos entre el CSV del repo (14/08) y el que dejó el usuario (19/08), por
   `caso_id`. Reportá tres listas: casos sólo en el nuevo, casos sólo en el viejo, casos
   presentes en los dos cuyo `estado` o `nota` cambió.
   **Premisa a confirmar o desmentir:** los únicos casos nuevos son `C-67`, `C-68`, `V-102`
   y `X-27`; no falta ninguno del viejo; ninguno se modificó. Si el diff da otra cosa,
   reportalo y **parás**: significa que alguien editó el congelado del 14/08.
6. Que las cabeceras de los dos CSV son idénticas, columna por columna.
7. Que el CSV nuevo no tiene `caso_id` repetido.
8. Contenido de `docs/Sesiones/` y de `docs/Sesiones/_archivo/`. Decí si hay algún
   `HANDOFF_validacion_*` en cualquier parte del repo.
9. Si existe `docs/_fixtures/`.
10. Si `docs/PENDIENTES_consistencia.md` ya tiene una entrada sobre los fixtures de
    validación o sobre `C-21`. Citá la sección si la hay.
11. La fila de `CLAUDE.md` §7 que responde *"¿Qué número dio una medición y contra qué se
    verificó?"* — transcribila textual. **Premisa a confirmar:** ya declara el CSV de casos
    congelado y fechado, uno nuevo por corrida. Si dice otra cosa, reportalo: cambia el
    alcance de las partes siguientes.
12. Que los tres CSV viejos (`_2026-07-31`, `_2026-08-09_addendum`, `_2026-08-12_addendum`)
    están en `Plan Inicial/_archivo/docs/` y **no** en `docs/`.

**Reportá y pará.** No sigas a la Parte A sin confirmación del usuario.

---

## Parte A — El CSV fechado entra, el del 14/08 se archiva

**Modelo: Sonnet. Effort: normal.**

1. Mové `casos_validacion_2026-08-19.csv` de la raíz a `docs/`.
2. Mové `docs/casos_validacion_CONSOLIDADO_2026-08-14.csv` a
   `Plan Inicial/_archivo/docs/`, con `git mv`. **No lo borres**: es evidencia congelada, y
   ahí ya están los otros tres.
   Si el archivo de destino ya existe con ese nombre, pará y reportá — no pises nada.
3. Verificá después del movimiento: `docs/` tiene exactamente un `casos_validacion_*.csv`,
   y es el del 19/08 con 218 filas de datos.
4. Grepeá el repo por referencias a `casos_validacion_CONSOLIDADO_2026-08-14`. Si algún
   documento **vivo** (no `_archivo/`, no un prompt ya ejecutado, no un handoff archivado)
   lo cita como archivo actual, listá dónde. **No lo edites en esta parte** — reportá.

Commit: `docs — casos_validacion 19/08 (218 casos) entra fechado; el del 14/08 se archiva`

---

## Parte B — El handoff de la rama entra a `docs/Sesiones/`

**Modelo: Sonnet. Effort: normal.**

1. Mové `HANDOFF_validacion_2026-08-19.md` de la raíz a `docs/Sesiones/`.
2. **No edites una sola línea de su cuerpo.** Trae un `Addendum 1` al final que corrige la
   §1; ése es el mecanismo, no la edición.
3. Verificá que el addendum está presente y que la §1 quedó intacta.

Commit: `docs — handoff de la rama de validacion 19/08 entra a Sesiones`

---

## Parte C — `docs/_fixtures/` y su índice

**Modelo: Sonnet. Effort: normal.**

Esto atiende `C-21`, que es la única tarea de la rama de validación que no se resuelve
midiendo: los ocho fixtures viven sólo en la máquina del usuario y sin ellos los 104 casos
`exacto` dejan de ser reproducibles.

1. Creá `docs/_fixtures/` con un `README.md` que declare, en este orden:
   - Qué es la carpeta: exports congelados con fecha en el nombre, evidencia de los casos
     `exacto`. Nadie los edita.
   - La convención de nombre: `AAAA-MM-DD_<base>.<ext>`.
   - La tabla de los ocho fixtures que la rama usó, tomada de la §8 del handoff que entró
     en la Parte B — **copiala de ahí, no la reconstruyas**. Marcá cada uno como
     `[presente]` o `[falta]` según lo que haya en la carpeta.
   - Que los decks que sólo viven en Drive se listan por ID, no se bajan.
2. **No inventes archivos ni los busques en Drive.** Los sube el usuario. Esta parte crea el
   contenedor y la lista de lo que falta.
3. Si el repo tiene `.gitignore` que excluya `.xlsx` o `.zip`, decilo en el reporte — hace
   falta una excepción para esta carpeta y la decide el usuario.

Commit: `docs — _fixtures/ con su indice; C-21 deja de ser invisible`

---

## Parte D — Registro

**Modelo: Sonnet. Effort: normal.**

1. `docs/BITACORA.md` — entrada al final, con fecha, diciendo qué se movió y qué quedó
   pendiente. Append-only.
2. `docs/PENDIENTES_consistencia.md` — una entrada, si la Parte 0 confirmó que no está ya:
   los fixtures de validación no están en el repo; los casos `exacto` no son reproducibles
   por nadie más que el usuario; lo destraba subir los archivos listados en
   `docs/_fixtures/README.md`.
3. **No toques `CLAUDE.md`.** Si la Parte 0 encontró que su §7 ya declara la convención
   fechada, no hay nada que cambiar ahí. Si encontró lo contrario, reportá y pará sin editar.

Commit: `docs — bitacora y pendientes: rama de validacion ordenada`

---

## Reglas de este paso

- Sólo `docs/`, `Plan Inicial/_archivo/docs/` y la raíz para recoger los dos archivos.
- Ningún caso del CSV se edita, se renumera ni se reordena. Entra tal cual.
- Ningún archivo de `_archivo/` se borra.
- Si una parte encuentra que su premisa no se cumple, para y reporta. No compensa.

---

## Addendum 1 — 19/08/2026 · qué encontró la Parte 0 y en qué cambió el paso

Escrito por Code al ejecutar. **No altera una línea del cuerpo de arriba**: lo corrige desde acá,
que es el mecanismo que `CLAUDE.md` §7 declara para un prompt ya en ejecución.

**El archivo se llama `_3`, no `_1`.** El encabezado y la línea `> Destino:` dicen
`2026-08-19_1_ordenar_rama_validacion.md`, y ese número ya lo tenía
`2026-08-19_1_camp_del_temario_al_deck.md`; el `_2`, el panel por secciones. Este prompt es el
**tercero** del 19/08.

**Cuatro premisas de la Parte 0 estaban vencidas**, todas por la misma causa: el commit `ee1d9d5`
—de documentación sobre testigos— ya había movido el CSV, con el nombre mal y sin mencionarlo.

| punto | qué decía | qué había |
|---|---|---|
| 2 | `docs/…CONSOLIDADO_2026-08-14.csv` existe, 214 casos | ya no existe en `docs/`; en `HEAD~1` tenía exactamente esos 214 |
| 3 | no existe ningún CSV del 19/08 en `docs/` | existía, como `casos_validacion 2026-08-19.csv` — **con espacio** |
| 4 | los dos archivos están en la raíz | estaban en `~/Downloads`, y del handoff había **dos** versiones del mismo día |
| 12 | tres CSV viejos en `_archivo/docs/` | hay **cinco** |

**Y un hallazgo que el prompt no contemplaba:** existían **dos** archivos con el nombre
`casos_validacion_CONSOLIDADO_2026-08-14.csv` y contenidos distintos desde `f19f637` — 214 casos en
`docs/`, **193** en el archivado. El congelado llevaba cinco días atrasado respecto de la corrida
que decía congelar.

**La premisa 5 —la que más importaba— resistió intacta**, verificada contra `HEAD~1` y no contra el
disco: sólo `C-67`, `C-68`, `V-102` y `X-27` son nuevos; ninguno falta; ninguno se modificó.
Cabeceras idénticas, 218 ids únicos. Las premisas 6 a 11 también se confirmaron.

**En qué cambió la Parte A.** Como estaba escrita no se podía ejecutar —no había nada que mover de
la raíz ni que archivar de `docs/`—. Lo que se hizo, autorizado por el usuario: renombrar el CSV a
`casos_validacion_2026-08-19.csv` y reparar la copia archivada del 14/08 a sus 214 casos. **Partes
B, C y D corrieron tal cual**, con el handoff de las 23:46 —el único con `Addendum 1`— y sin subir
fixtures.

**Parte D punto 3, confirmado:** `CLAUDE.md` §7 ya declara la convención fechada
(*"congelados, uno nuevo por corrida de validación; nadie edita"*). **No se tocó `CLAUDE.md`.**

**Lo que quedó abierto:** los ocho fixtures no entran hasta que se decida el punto de privacidad —
`docs/_fixtures/README.md` y `docs/PENDIENTES_consistencia.md` tienen las tres salidas.
