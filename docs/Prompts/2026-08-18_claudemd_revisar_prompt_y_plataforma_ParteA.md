# Continuación — `2026-08-18_claudemd_revisar_prompt_y_plataforma.md`, Parte A

> **Estado:** ejecutado el 18/08/2026. **Reemplaza:** nada; continúa a
> `2026-08-18_claudemd_revisar_prompt_y_plataforma.md`, cuya Parte 0 ya había
> corrido en una conversación anterior.

La Parte 0 corrió y se reportó en una conversación que ya cerró. **Las dos
ubicaciones que propusiste van aprobadas**, con la fundamentación que diste:

- **Regla 1 — revisar el prompt antes de ejecutarlo:** §4, después del párrafo de
  apertura, antes del punto 1 de la lista numerada.
- **Regla 2 — conocimiento de plataforma:** §4, al final, después del párrafo de
  "Un test puede acertar el hecho y errar la inferencia".

Sin `D-NN` en `PLAN.md`: coincido, son convención de proceso y la §7 las rutea a
`CLAUDE.md`.

---

## Parte 0 — que los anclajes sigan estando (sólo lectura, reportar y parar)

Entre la Parte 0 y esto entraron commits. **Verificar por texto, no por número de
línea**, que los dos anclajes siguen donde estaban:

`0.1` · El párrafo de apertura de la §4 y el punto 1 de su lista.

`0.2` · El párrafo que cierra la §4, el de la etiqueta contra el dato crudo.

`0.3` · El párrafo de la §3 sobre grepear antes de pedir una corrección. La regla
1 lo generaliza: ese párrafo cubre un caso —el archivo que no dice lo que el
prompt supone— y la regla nueva cubre el movimiento entero. **Referenciarlo desde
la regla 1, no repetirlo.**

Si algún anclaje se movió o cambió, **reportar y parar**.

---

## Parte A — escribir las dos reglas

El contenido está en el prompt original. Redactar en el estilo del documento.

Tres cosas que salieron de tu Parte 0 y **entran en el texto**:

1. **El roce con `SUPUESTOS.md`.** Su encabezado manda asumir lo más probable,
   registrar el supuesto con ID y seguir. Leído rápido parece lo contrario de "no
   inventar el faltante". No lo es, y conviene decirlo en el texto: `SUPUESTOS`
   cubre huecos del dominio y **exige el registro con ID**, que es lo que deja el
   supuesto a la vista y reversible. Lo que la regla nueva prohíbe es el supuesto
   **silencioso sobre qué hay que hacer**. El mecanismo de `SUPUESTOS` es la forma
   correcta de cumplirla, no su excepción.

2. **`D-10` y `D-19`/`D-21` como antecedentes.** Citarlos: es el mismo principio
   —no fabricar lo que falta, no entrar ni excluir en silencio— aplicado a Code en
   vez de al motor. Refuerzo, no conflicto.

3. **"Mejorar no es ampliar" apoyado en "un prompt, un objetivo".** Es lo que
   impide que revisar el prompt se vuelva licencia para ampliar el alcance.
   Dejarlo explícito.

**El origen, en una línea dentro del texto.** Las dos corridas del 18/08: la
primera atribuyó la muerte al límite de 6 minutos sin evidencia que descartara la
contención de Sheets; la segunda lo corrigió. Y en ninguna se estaba aplicando
conocimiento de Apps Script como plataforma, que es donde estaba la respuesta.

---

## Parte B — el registro

Entrada en `docs/BITACORA.md` con el origen. Guardar el prompt original y esta
continuación en `docs/Prompts/`. Commit de documentación.

---

## Cuándo está hecho

- Las dos reglas están en la §4, en las ubicaciones aprobadas.
- La regla 1 referencia el párrafo de la §3 en vez de repetirlo.
- Los tres roces de `0.4` están nombrados en el texto, no sólo en el reporte.
- `BITACORA.md` tiene el origen.

## El reporte

1. `0.1`–`0.3`: si los anclajes seguían.
2. Qué escribiste y dónde.
3. Qué decisiones tomaste solo.
4. Qué premisa de esta continuación resultó falsa, si alguna.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
