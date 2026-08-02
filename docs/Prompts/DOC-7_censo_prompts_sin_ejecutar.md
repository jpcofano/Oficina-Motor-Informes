# DOC-7 — Prompts sin ejecutar: censo y regla de premisas

**Estado:** vivo · **Fecha:** 2026-08-02 · **Ubicación:** `docs/Prompts/DOC-7_censo_prompts_sin_ejecutar.md`

> **No toca código.** Es un censo, una regla y una decisión de archivado.
> Dos partes, un commit cada una. Se para y se avisa al final de cada una.

---

## Por qué

Un prompt escrito y no ejecutado envejece. La pregunta que lo originó fue si convenía
repasarlos periódicamente. **No conviene:** la mitad vuelve a envejecer antes de correrse, y
una pasada de mantenimiento sobre hipótesis es trabajo que no rinde.

Lo que sí sirve es verificar las premisas **en el momento de ejecutar**, contra el estado de
ese día. Ya pasó dos veces, y la diferencia entre los dos casos es lo que gobierna esta
regla:

- **Inofensivo:** el `Paso-2.14` cita `Instalar.gs:2052` y `:1819`; hoy son `:2140` y
  `:1908`. La Parte A las ubica igual porque busca por nombre.
- **Caro:** el `Paso-2.12` hablaba de 17 filas y de dos casos difíciles que ya estaban
  resueltos en la planilla. Eso **no se detecta releyendo el prompt** — se detectó cruzando
  contra los datos al ejecutar.

El riesgo no son los números de línea. Son las premisas sobre el estado del sistema.

---

## Parte A — Censo

**A.1** — Listar todos los `Paso-N` / `DOC-N` / `AUD-N` de `docs/Prompts/` (excluir
`_archivo/`) con su estado declarado en el encabezado y si se ejecutó o no.

**A.2** — Para cada **no ejecutado**, una línea con:

| prompt | qué se propone hacer | ¿sigue teniendo sentido? |
|---|---|---|

La tercera columna es la única que pide juicio, y sólo admite tres valores: **sí**,
**no** (el trabajo ya se hizo por otro camino, o la decisión que lo motivaba se dio vuelta),
o **no se puede saber sin cruzar datos** — que es una respuesta legítima y probablemente la
más frecuente.

**No verificar premisas una por una.** Eso es trabajo de la ejecución, no de este censo. Acá
alcanza con detectar los que ya no van a correrse nunca.

**A.3** — Reportar y **parar**. No archivar nada todavía: qué se archiva lo decide el
usuario sobre la lista.

---

## Parte B — La regla

En `CLAUDE.md`, junto a las reglas de prompts (§3 o §4, donde encaje mejor — decidilo y
decí por qué):

> **Un prompt no ejecutado es una hipótesis, no un plan.** Antes de ejecutarlo se verifican
> sus premisas contra el estado de hoy; si alguna venció, se reporta y **se para antes de la
> primera edición**. Las citas a `archivo:línea` se resuelven **por nombre**, no por número:
> una línea corrida es inofensiva, una premisa vencida no.
>
> En los prompts nuevos, no escribir números de línea como dato. Si se citan, es como
> referencia — envejecen con cualquier commit.

Origen: 02/08. Los dos casos de arriba, con nombre.

**B.1** — Si `CLAUDE.md` supera las 275 líneas actuales, reportar el número. No recortar
nada para compensar.

---

## Después

Con la Parte B commiteada, **arrancar el `Paso-2.14`** (`docs/Prompts/Paso-2.14_generalizar_hayUi.md`)
por su Parte A, que es sólo lectura, y parar ahí como pide ese prompt.

Confirmar antes que el número `2.14` esté libre. Si está tomado, renombrar el archivo y
avisar cuál quedó.

---

## Qué NO hacer

- No archivar ningún prompt sin decisión del usuario.
- No editar prompts congelados.
- No verificar premisas prompt por prompt — eso es trabajo de cada ejecución.
- No tocar `.gs` en este paso.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
