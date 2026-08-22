# Addendum · 2026-08-22 · Paso `2026-08-22_25` — tras la Parte 0

**Addendum a:** `docs/Prompts/2026-08-22_25_agregado_por_temario.md` — **que no se edita.**

---

## 0 · La Parte 0 está bien medida. La conclusión del `0.1` no.

Todo lo que el reporte midió es correcto y se acepta: el temario de `julio_24_30` tiene cuatro
encuentros distintos, `V-38` declara una clave de ventana de nueve días sobre `rdv`, y el fixture
no repone el temario. **Nada de eso se discute.**

⛔ **Lo que no se sostiene es que C.1 sea incumplible.** El cruce se hizo contra `V-38`…`V-44` y
paró ahí. **Hay un caso más en el mismo bloque, y ése sí mide el universo del temario:**

```
V-71 · agregado_semana_jm · ecv_inscriptos · 2333 · SUMA · exacto
clave: "los 4 encuentros que el deck publica individualmente"
nota:  138 San Cristóbal + 98 Retiro + 1344 Villa Urquiza + …
```

**El cuarto sumando es 753, que es `V-05` → `et_orden_publico_2807`.** La suma cierra exacta:
`138 + 98 + 1344 + 753 = 2333`. **Son los cuatro encuentros que el `0.1` encontró en el temario.**

⭐ **Y lo que explica la discrepancia de nombres:** `V-44` nombra por **barrio** —*"Belgrano
28/07"*— y el temario nombra por **tema** —*"Orden Público 28/07"*—. **Misma fecha.** El reporte
los contó como dos cosas distintas y por eso midió *"faltan Belgrano y Caballito"*.

**Entonces al temario de julio no le falta nada, y no se completa.** Caballito 29/07 no tiene que
estar: se publicó en el informe del **07/08**, y eso es exactamente el caso testigo con el que
`R-21` se escribió — *"el encuentro se informa con un informe de retraso, dos veces… No es un caso
raro: es cómo trabaja el equipo"*. Un temario al que le falta Caballito **es un temario correcto**.

---

## 1 · La medición de una línea que habilita todo lo demás · **Sonnet**

**Antes de tocar nada:** el barrio de la fila de `rdv` del encuentro del **28/07** del temario
(`Figura=Jorge Macri`, `EVENTO = Encuentro Temático "Orden Público"`, 753 inscriptos).

- **Si dice Belgrano** → `V-44` y el temario nombran lo mismo, la aritmética de `V-71` cierra, y
  siguen las Partes A, B y C con lo de abajo.
- **Si dice otra cosa** → **reportar y parar**. La suma de `V-71` se apoyaría en un encuentro que no
  es el del temario y todo el control de valores se cae de nuevo.

---

## 2 · C.1 se reemplaza — **Opus** · effort alto

**No se completa el temario de julio.** Es curaduría histórica retroactiva de una semana cerrada:
cuesta una decisión editorial y no aporta nada al cierre de fase.

**El control de valores pasa a ser, sobre `julio_24_30`:**

| qué | esperado | de dónde |
|---|---|---|
| `ecv_inscriptos` | **2333** | `V-71`, `exacto` |
| `ecv_encuentros` | **4** | el conjunto que `V-71` declara |
| identidad | la suma tiene que dar los cuatro sumandos individuales | `V-01` 138 · `V-03` 98 · Villa Urquiza 1344 · `V-05` 753 |

⭐ **La tercera fila es el control fuerte y es el que hay que mirar:** el agregado por temario tiene
que ser **la suma de partes que ya están validadas una por una**. Si el total da 2333 pero un
sumando no es el suyo, el número está bien por el camino equivocado — que es el modo de falla de
los `855/186`.

**Y `V-38`…`V-44` no se retractan ni se tocan.** Miden `rdv` recortada por ventana de nueve días y
figura, están bien medidos y siguen `exacto`. Lo que se agrega es **una nota en el CSV** que diga
que ese bloque **no mide el universo del temario**, para que el próximo que lo lea no repita este
cruce. La nota de `V-38` que dice *"universo del TEMARIO (5 encuentros)"* describe lo que el equipo
publicó, no la clave del caso — **y es lo que hizo caer a este prompt**.

⛔ **Sin renumerar ni reusar casos.** Nota, no edición del valor ni del estado.

---

## 3 · Parte B — confirmada como el reporte la replantea · **Opus** · effort alto

**Sí: el filtro no se agrega, se extiende.** `itemsDeSeccion_` llega al temario vía
`anclarEncuentros`, y ahí el recorte por `periodo_id` **ya existe** — su límite medido es que sólo
actúa cuando el origen empieza con `periodo_ref:`.

**Lo que falta es que actúe también con la ventana calculada.** Es el P1 anotado ayer, y es el
mismo hueco: hoy, con ventana calculada, **toda fila con `mostrar = sí` entra a todo informe**, que
es lo que `R-21` llama *"una omisión, no un diseño"*.

⛔ **No agregar un segundo filtro en `itemsDeSeccion_`.** Dos recortes por lo mismo en dos lugares
es la forma de que se separen.

---

## 4 · Los ocho sin caso — qué hace cada uno · decisión del usuario, 22/08

- **Los cinco `ecv_insc_*_pct`:** el reporte tiene razón, derivable no es validado. **Se calculan,
  se publican y se reportan con su cuenta a la vista** —`1170/2445`— **y nacen sin validar**. No se
  marcan dudosos: nadie declaró desconfianza sobre ellos.
- **`ecv_barrios`:** su único caso es `C-03`, `contradice`. El control es contra `REUNIONES`, como
  ya dice C.2.
- **`ecv_barrio1-3`:** el reporte corrige al prompt — **no están diferidos, no existen en
  `MARCADORES`**. Se anota en `PENDIENTES` y **salen de la familia declarada en el seed**, que hoy
  los nombra. Cablearlos no entra en este paso.
- **`ecv_barrio`, `ecv_poblacion`, `enc_evento`:** son los tres del punto 4 de la Parte A original
  —los que se emiten **también** dentro del bloque de encuentro—. Sin caso propio, su control es el
  **positivo por los dos caminos** que la Parte A ya pide: el camino por ítem no se mueve.

---

## 5 · Y las dos correcciones de método, porque el prompt las cometió

**El prompt afirmó una equivalencia que no midió** —que `V-38` mide el temario— **apoyándose en la
nota del caso en vez de en su clave**. Es la misma forma que `CLAUDE.md` ya previene: *"un
comentario que afirma un contrato no es un testigo"*, ahora aplicada a la nota de un caso de
validación. **La clave manda sobre la nota.**

**Y el cruce paró en el primer bloque que coincidía por nombre.** `V-71` estaba en el mismo bloque
`agregado_semana_jm` y no entró al reporte. **Cruzar un bloque entero, no los casos que el prompt
nombra** — el prompt nombra los que conoce, que es justamente el sesgo.
