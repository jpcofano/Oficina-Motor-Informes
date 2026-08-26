# CAMINOS DE UNIVERSO — de qué filas sale un marcador · 25/08/2026

> **Estado: congelado.** Evidencia fechada, uno nuevo por relevamiento. Para saber qué hay hoy se
> **vuelve a leer `datosDeMarcador_`**, no se edita esto.
>
> **Relevamiento del 25/08/2026**, de sólo lectura, sobre `Generador.gs`, `Fuentes.gs`, `Union.gs`
> y los snapshots del 21/08 de `MARCADORES`, `SOLAPAS`, `SECCIONES` y `CONFIG`.
>
> ⚠ **Envejece con cada rama nueva.** Una rama agregada a `datosDeMarcador_` deja esta tabla
> incompleta **sin que nada falle** — es un mapa de un `if/else` ordenado, no un mapa explícito
> como `OPERACIONES_`, así que no se puede autodocumentar.

---

## Por qué existe

**Ningún documento del repo contestaba esta pregunta**, y la fila de `CLAUDE.md` §7 que más se le
parece —`tools/catalogo.js`, *«qué mide cada token, de dónde sale y con qué operación y filtro»*—
**declara explícitamente que no la contesta**: su nota dice que la columna `config` *«dice sólo que
la configuración resuelve — no que el token publique bien, y menos que el número salga de las filas
correctas»*.

⭐ **Y es la pregunta que `CLAUDE.md` §4 llama la más cara del proyecto:** *un número correcto puede
salir de las filas equivocadas, y ninguna verificación del proyecto lo miraba*. El síntoma es el
número plausible.

## ⭐ Control positivo de este relevamiento

Se leyó la cadena de la **lámina 6** (`L-035`/`L-052`, Benchmarks/Iceberg), la única ✅ del tablero,
por su camino real —la rama por cuenta: base entera, sin recorte por ventana, filtrada por el
`id_cuenta` del ítem anclado— contra el fixture del **31/07**, donde el deck y la base son del mismo
día.

| | Audiencia | Llamados | Atendidos | E+75 % | Marque 1 |
|---|---|---|---|---|---|
| deck del equipo, iceberg Orden Público 28/07 | 78.637 | 78.637 | 71.234 | 27.599 | 256 |
| **medido, `3387-JULJDGGC`** | **78.637** | **78.637** | **71.234** | **27.599** | **256** |

**5 de 5 exactos.**

⚠ **El primer intento —el mismo control sobre agosto— falló 4 de 5, y no por la lectura:**
`3488-AGOJDGAG` da Audiencia 107.194 ✓ y Atendidos 20.322 contra 96.549, porque el export del 20/08
tiene la campaña **a mitad de discado** (11.000 llamados de 54.107 de audiencia por fila) y el deck
se armó después. Es `R-31`.

⭐ **Y por eso el control necesitaba los cinco valores y no uno:** `3347-JULJDGAG` **también** da
Audiencia 78.637 y no acierta ningún otro. Un control de un solo número habría dado verde sobre la
cuenta equivocada.

---

## Las tres capas — el universo no lo decide una función

| capa | quién | qué decide |
|---|---|---|
| **A · la ventana** | `resolverVentana` (`Fuentes.gs`) | entre qué dos fechas |
| **B · qué encuentros** | `anclarEncuentrosSinCache_` (`Union.gs`) | qué filas de `REUNIONES` entran |
| **C · qué filas lee cada marcador** | `datosDeMarcador_` (`Generador.gs`) | **la tabla de abajo** |

⚠ **Antes de la capa B corre un filtro que no se ve:** `leerReuniones_` descarta por `eje` y por
`mostrar` **antes** de que el anclaje mire nada, y su conteo no aparece en el mensaje de descarte por
período. Es el caso del 25/08 en `CLAUDE.md` §4 — *un filtro que descarta antes y no cuenta es
invisible*.

### Capa A — cinco eslabones, dos que nunca corren

| # | eslabón | `origen` que emite | ¿corre hoy? |
|---|---|---|---|
| 1 | `CAMPANAS` por `campana` + `periodo_id` | `campana:<id>` | sí, sólo en ítems de campaña |
| 2 | `MARCADORES.periodo_ref` / override del panel | `periodo_ref:<id>` | **sí**, vía el selector — ⚠ **cero marcadores** lo declaran |
| 3 | `SECCIONES.periodo_ref` | `seccion:<id>` a `<ref>` | ⛔ **nunca** — cero filas lo tienen cargado |
| 4 | `CONFIG.periodo_desde` / `periodo_hasta` | `config` | ⛔ **nunca** — vacías en el seed **y** en la hoja |
| 5 | `ultimaSemanaCerradaR11_` | `R-11 (calculado)`, con `calculado: true` | **sí**, es el default real |

⭐ **No hay término medio: o la persona elige un período (2) o el motor calcula (5).**

⚠ **Y `R-11` propone la última semana CERRADA, no la semana en curso** (decisión del 20/08).
Difieren un día por semana, **el viernes**, que es el día en que se genera `jm`.

---

## ⛔ Capa C — las ocho ramas de `datosDeMarcador_`, en orden

**El orden es el algoritmo:** la primera que matchea resuelve, y las de abajo no se evalúan.

| # | rama | cuándo dispara | universo que devuelve | ¿cae a la solapa entera? |
|---|---|---|---|---|
| 1 | `fila_rdv` singular | `base_id = rdv` **y** el ítem trae su fila **y** la solapa coincide | **1 fila**, la del encuentro | **no** |
| 2 | `filas_rdv` — agregado por temario (`_25`) | `base_id = rdv` **y** `filas_rdv` no vacío **y** la solapa coincide | las filas de `rdv` de los encuentros del **temario**, deduplicadas por nombre + fecha | ⛔ **sí, EN SILENCIO** — ver abajo |
| 3 | `filas_temario` — solapa POST (`D-42`) | la solapa está **declarada** en `CONFIG` | las filas de la solapa POST de los encuentros del temario | **no** — `2026-08-25_3` lo cerró: `@post_sin_temario` |
| 4 | `digital` **sin** `id_cuenta` | `base_id = digital` y no hay cuenta en el contexto | agregado global de la solapa **+ recorte por ventana** | ⛔ **sí, por diseño** (15/08) |
| 5 | `digital` **con** cuenta, solapa maestra | ídem, solapa maestra de la unión | el registro unido de esa cuenta | **no** |
| 6 | `digital` **con** cuenta, solapa de canal | ídem, una de las cinco de canal | las filas de esa cuenta en ese canal | **no** |
| 7 | rama por cuenta declarativa (`D-30`) | la solapa declara `campo_id_cuenta` en `SOLAPAS` | las filas de esa cuenta, **base entera sin recorte por ventana** (`R-17`) | ⛔ **sí si no hay cuenta** — la guarda se aflojó el 19/08, y está escrito en el código |
| 8 | general — `leerFuente` | todo lo demás | la solapa recortada por ventana y por `dimensiones` | ⛔ **es la solapa entera** |

⚠ **Hay una novena salida que no es rama:** cuando la solapa es de `digital`, no es de canal y
**declara** `campo_id_cuenta`, la rama de `digital` **cede** —no resuelve— y deja seguir hasta la 7.
Si no declara nada, **falla** con `@solapa_digital_desconocida`. Ceder y fallar son dos caminos
distintos y los dos existen.

### ⛔ La rama 2 tiene el mismo fallback que la rama 3 cerró

```
Generador.gs, etapa 4
  var temario = filasRdvDelTemario_(informeId, ventana);
  if (temario.filas.length) {          // si da cero, `filas_rdv` no se setea
    opcionesEtapa4.filas_rdv = temario.filas;
```

Sin `filas_rdv` la rama 2 no dispara; y como **`rdv/RVD JM-CM - ES` no declara `campo_id_cuenta`**
—medido en `SOLAPAS`—, tampoco la atrapa la rama 7: cae a la **8**, o sea `rdv` entera recortada por
`figura=Jorge Macri` y la ventana.

⛔ **`filasRdvDelTemario_` devuelve vacío por cinco causas, y ninguna se distingue de «esta semana no
hay encuentros»:** `SECCIONES` ilegible · la sección no resuelta · `itera_sobre` que no apunta a
`REUNIONES` · `itemsDeSeccion_` que tira excepción · `!ok`.

**Está abierto en `docs/PENDIENTES_consistencia.md` (25/08)**, junto con la asimetría contra la rama
3, que ante la misma condición **falla**.

---

## ⭐ El nivel de ventana viaja; el universo NO

| dónde | ¿guarda de qué eslabón salió la ventana? |
|---|---|
| `resolverVentana` | ✅ `origen` + `calculado` + `motivo_calculo` |
| **traza de cada marcador** | ✅ termina en `2026-07-24–2026-07-30 (periodo_ref:julio_24_30)` |
| `CORRIDAS.periodo_id` | ✅ el `periodo_id` elegido, y con el selector vacío escribe `R-11 (calculado)` |
| `FALTANTES.motivo` | ✅ hereda la traza — `estado + ': ' + traza` |
| resultado de `generarInforme` | ✅ `periodo.origen`, `periodo.calculado`, `periodo.traza` |
| reporte de texto de la corrida | ✅ `Período: … (R-11 (calculado), calculado)` |
| panel · cuadro de sección suelta | ✅ `Ventana: … (origen)` |
| ⛔ panel · cuadro de **temario** | **no** — muestra filas cargadas, no la ventana |
| ⛔ panel · pantalla de «listo» tras la corrida | **no** |

⛔ **El corte del panel está en una sola línea, y el propio código lo documenta:** el adaptador de
`PanelBackend.gs` colapsa el objeto a `periodo: (r.periodo && r.periodo.lamina) || ''`, y su
comentario dice *«Se pierden `desde`, `hasta`, `calculado` y `traza`, y hoy no los lee nadie… El día
que el panel quiera marcar una ventana calculada, el campo vuelve como uno propio»*. **El motor
calcula el nivel, lo manda, y el adaptador lo tira una línea antes del front.**

### ⛔⛔ Y el universo se calcula, con el texto correcto, y se descarta

Las **ocho** ramas construyen un `origen` largo y preciso:

- *«las 4 fila(s) de rdv/RVD JM-CM - ES de los encuentros del TEMARIO … sin recorte por ventana ni
  por `dimensiones`: el temario ya seleccionó»*
- *«agregado global de digital/Directa IVR (sin id_cuenta; 59 fila(s) antes del recorte por
  ventana)»*
- *«rama por cuenta declarativa (…, `des_id_cuenta` = "3488-AGOJDGAG": 2 de 503 fila(s), sin recorte
  por ventana — el temario ya seleccionó, R-17)»*
- *«leerFuente(rdv/RVD JM-CM - ES)»*

**Y nadie lo lee.** Grepeado el 25/08: `datos` se asigna una sola vez en `Generador.gs` y
`datos.origen` **no aparece en ningún otro lugar del repo**.

⭐ **Es la evidencia que separa una cascada declarada de un fallback silencioso, ya calculada y
tirada a la basura.** Un campo más en `base.traza` la pone donde hace falta.

---

## ⚠ Lo que este relevamiento NO contesta

- **Qué publica cada marcador.** Esto dice **de qué filas sale**, no si el número es correcto.
- **Qué dicen las hojas hoy.** Los snapshots son del **21/08**; `MARCADORES` se movió después.
- **Si la rama que corre es la que corresponde.** Un marcador puede entrar por la rama correcta y
  tener mal el `campo_logico`, y al revés.
