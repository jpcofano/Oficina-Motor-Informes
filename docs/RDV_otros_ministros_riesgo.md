# Riesgo de firma de encabezados — generalizado a las cuatro bases (DOC-3)

> **Estado:** el riesgo está documentado y el mecanismo de firma **todavía no está
> implementado**. Es su propio paso, con su propio test — ver "Qué falta" al final.
> Referenciado desde `docs/FECHAS_seleccion.md`, `docs/REGLAS_NEGOCIO.md` (R-02) y
> `docs/Prompts/DOC-3_verificacion_bases_vivas.md` Parte G.

---

## El riesgo, en general

`MAPEO` referencia cada columna **por letra** (`A`, `B`, `Z`, …), no por nombre de
encabezado. Eso funciona mientras la estructura de la hoja no cambie. El día que el
dueño del archivo **inserta o borra una columna**, el mapeo sigue corriendo sin fallar:
sencillamente empieza a leer la columna de al lado. El motor no tiene forma de
distinguir "la columna correcta" de "una columna cualquiera que tiene datos parecidos"
— por eso el riesgo no produce un error, produce **un número plausible pero equivocado**,
el mismo tipo de falla cara que motivó `R-02` y `R-03`.

Este riesgo se documentó primero como específico de `RDV_otros_ministros`, porque ahí
ya se manifestó (ver abajo). La verificación de bases vivas del 30/07 (DOC-3) mostró que
**no es un caso especial: aplica a las cuatro bases**.

| base | dueño | ¿mapeada por letra? |
|---|---|---|
| `rdv` | ajeno | sí |
| `digital` (Seguimiento Digital) | ajeno (`dgples.comunicacion@gmail.com` según metadata de Drive del 30/07, para `looker` — a confirmar el dueño exacto de `digital`/`rdv`/`m2` uno por uno) | sí |
| `looker` | `dgples.comunicacion@gmail.com` | sí |
| `m2` | `tarnowski.jp@gmail.com` | sí |

**Ninguna base es propia del robot ni de este proyecto.** No hay ninguna base donde el
riesgo no aplique.

---

## El caso peor: `RDV_otros_ministros`

Dentro de la base `rdv`, la solapa `RDV_otros_ministros` (encuentros de ministros, usada
como respaldo de la ancla `RVD JM-CM - ES`) tiene los **encabezados corridos una
posición** respecto de los datos:

- La columna que dice **`Inscriptos`** en el encabezado trae en realidad el **estado**
  del encuentro.
- La columna de fecha se llama `hora_cita_evento` en el encabezado, pero la columna E
  es la **fecha del evento** (no una hora) — ver `docs/FECHAS_seleccion.md`
  ("⚠ encabezados corridos").
- Usa además **otro vocabulario de estado** que la hoja ancla: `Realizada`/`Programado`,
  no `en agenda`/`Suspendida` (`RVD JM-CM - ES`).

Es el caso peor porque el corrimiento no es de una columna al final (fácil de notar),
sino **dos columnas numéricas a dos posiciones de su etiqueta** — el tipo de error que
un vistazo rápido a la hoja no detecta.

**Mapeo actual:** por posición (letra), no por nombre — es la única forma de leer esta
hoja hoy. `docs/FECHAS_seleccion.md` ya documenta la columna E como la fecha real pese
al nombre del encabezado.

---

## Qué falta (fuera de alcance de este documento)

**La firma de encabezados** — registrar la fila 1 (o la fila de encabezado que
corresponda) de cada solapa mapeada, y fallar ruidosamente si cambió — es la mitigación,
pero **no se implementa acá**. Es su propio paso, con su propio test, antes del
`Paso-3-v2` (ver `PROYECTO.md` §7).

`diagnosticarBases()` (`Fechas.gs`, DOC-3 Parte B) ya lee la fila de encabezado de cada
solapa mapeada para tipar columnas — la mitad del trabajo de la firma (leer y comparar
esa fila) queda hecha ahí; falta la otra mitad: guardar esa firma y comparar contra la
corrida anterior.
