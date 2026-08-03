# DOC-8 — Punteo de avance: fuente versionada y parada diaria

**Estado:** vivo · **Fecha:** 2026-08-02 · **Ubicación:** `docs/Prompts/DOC-8_punteo_de_avance.md`

> Existe un documento de Google que le cuenta el avance al equipo y a la conducción:
> *"Motor de Informes — Punteo de avance"*, última edición **30/07/2026**. Está tres días
> atrás y no tiene un lugar en el proceso: nadie es responsable de actualizarlo y no se
> deriva de nada.
>
> Este paso le da fuente única y momento de actualización. **No lo automatiza**: el punteo
> tiene juicio editorial —qué frena, quién lo resuelve— que no sale de un `.gs`.
>
> **Un commit por parte. Se para y se avisa al final de cada una.**

---

## Parte A — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

**A.1 · El documento.** Está en Drive, fuera del repo:
`1MBNAzxeWsF1k5OIpcgMy-H5Nio5GwqlyJr-WNG5HbAw`. Confirmar que la cuenta que ejecuta pueda
leerlo, y reportar quién es el dueño. **No escribirle nada** en este paso.

**A.2 · Qué dice hoy y qué de eso venció.** Sus cuatro secciones vivas son *Qué vamos a
lograr · Qué hicimos hasta ahora · Qué nos frena hoy · Qué necesitamos para desbloquear*,
más un anexo con el caso de consistencia y una copia de la v1 al final. Contrastar
**"Qué hicimos"** y **"Qué nos frena"** contra `PLAN.md` §2 y §3 y contra `BITACORA.md`, y
reportar renglón por renglón: sigue vigente / venció / falta. Ejemplos a chequear, no a
asumir: el tercer informe figura como freno y `PLAN.md` §3 lo tiene como no prioritario;
el acceso de la cuenta de reportes ya se resolvió. **No corregir el documento todavía.**

**A.3 · La regla de derivación, que es lo que hace que esto no sea una segunda fuente de
verdad.** Verificar que se sostiene contra `PLAN.md` §3 tal como está escrito hoy:

```
"Qué nos frena hoy"  =  filas de PLAN.md §3 con  depende de ∈ {equipo, tercero}
"Qué necesitamos"    =  las mismas filas, con nombre y plazo
"Qué hicimos"        =  lo que cerró en BITACORA.md desde la última actualización,
                        filtrado por: ¿lo notaría alguien que no lee código?
```

Reportar cuántas filas de §3 caen de cada lado hoy, y si alguna no encaja en ninguna
categoría. Si la regla no se sostiene, decirlo — es preferible cambiarla acá que descubrirlo
al tercer día.

**A.4 · Dónde vive la fuente.** `docs/AVANCE.md`, versionado. Confirmar que el nombre esté
libre y que `CLAUDE.md` §7 no tenga ya una fila que reclame la pregunta *"¿qué le contamos
al equipo sobre el avance?"*.

**A.5 · El momento.** Ubicar la sección de `CLAUDE.md` que define qué se actualiza al cerrar
un paso (hoy: `BITACORA.md`, `HANDOFF_CODE.md`, y `PLAN.md` si cambió algo estructural) y
reportar dónde entraría el renglón nuevo.

**Reportar y PARAR.**

---

## Parte B — `docs/AVANCE.md`

Crear el archivo con el contenido vigente del documento de Drive, **corregido** con lo que
A.2 haya encontrado vencido, y con la regla de derivación de A.3 escrita en el encabezado.

Estructura: las cuatro secciones vivas. **El anexo del caso de consistencia y la copia de la
v1 no se traen** — son evidencia congelada y no se actualizan; quedan sólo en el Doc.

Encabezado del archivo, además del estado y la fecha: **este documento es derivado**. Nada
nace acá. Si algo del punteo no tiene origen en `PLAN.md`, `BITACORA.md` o
`PENDIENTES_consistencia.md`, es que falta registrarlo en el lugar que corresponde, y se
registra allá primero.

---

## Parte C — La parada diaria

**C.1 · `CLAUDE.md`, en la sección que devolvió A.5**, un renglón:

> Al cerrar el último paso del día, revisar `docs/AVANCE.md` contra lo que cerró. Si ninguna
> de sus cuatro secciones cambió, no se toca — pero se dice en el reporte de cierre que se
> revisó. La mayoría de los pasos no lo mueven, y un punteo que se actualiza por obligación
> se llena de ruido y deja de leerse.

**C.2 · `CLAUDE.md` §7**, fila nueva:

> ¿Qué le contamos al equipo sobre el avance? → `docs/AVANCE.md` — derivado de `PLAN.md`,
> `BITACORA.md` y `PENDIENTES_consistencia.md`; el Google Doc es su copia publicada. | los dos

**C.3 · El Doc de Drive no se edita a mano.** Cuando `AVANCE.md` cambia, el texto para el
Doc lo redacta claude.ai y lo pega el usuario. Dejarlo escrito en `RUNBOOK.md`, con el ID
del documento apuntando a la tabla de carpetas si ya existe. Si alguien edita el Doc
directo, esa edición se pierde en la próxima actualización: decirlo ahí, no en un comentario.

---

## Qué NO hacer

- No escribirle al Google Doc desde el motor. Es trabajo que no le sirve al motor y el
  contenido tiene juicio editorial.
- No traer el anexo ni la v1 al repo.
- No inventar frenos: si no está en `PLAN.md` §3, no va al punteo. Se registra allá primero.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
