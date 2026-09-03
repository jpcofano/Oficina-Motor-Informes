
---

## ⛔⛔ P0 · `camp_titulo` publica la campaña equivocada en `L-016` — **Parte 0, sólo lectura** (03/09/2026)

**El hecho a explicar**, medido por el usuario sobre el `.pptx` de `secco` 28/08–03/09:

| lámina | slide | visible | publica |
|---|---|---|---|
| **`L-016`** | 17 | ✅ **SÍ** | «-Alerta Amarilla - 2/9-» · ⚠ **una sola vez, no una por bloque** |
| `L-017`…`L-022` bloque 1 | | sí | «-Operativo Muro \| 25/8-» ✅ |
| `L-017`…`L-022` bloque 2 | | sí | «- Fin de las mafias…-» ✅ |
| **`L-023`** | 24 **y** 32 | ⛔ no | «-Alerta Amarilla - 2/9-» **en los dos** |

⇒ **Dos bloques, tres campañas nombradas, y la portada anuncia una que sus seis láminas siguientes
no muestran.**

### ⭐⭐ 1 · El camino que pinta `camp_titulo` **sin pasar por `tokensDeSlide_`** — CONFIRMADO en el código

`pintarTokensFijosDeLamina_` (`Generador.gs`) elige **dónde** pinta con una sola condición:

```js
var donde = (ctx.slide && ctx.exclusivos && ctx.exclusivos.indexOf(token) !== -1)
  ? ctx.slide : ctx.presentacion;
```

⛔ **`camp_titulo` NO es exclusivo de ninguna lámina** — `Instalar.gs` ya lo dice con todas las
letras y con su número: *«un token fijo se pinta con `replaceAllText` sobre la presentación entera:
`camp_titulo` aparece en **14 láminas** y publica **un solo valor** en todas»*.

⇒ **`donde = ctx.presentacion`**, y `presentacion.replaceAllText` **pinta todas las slides del deck,
las escondidas incluidas** — no consulta visibilidad, no sabe de qué lámina salió el token y no
sabe de qué ítem se trata.

⭐ **Eso responde exactamente la pista del usuario.** La visibilidad se consulta en **dos** lugares y
**ninguno de los dos gobierna el pintado**:

| función | qué decide | ¿mira si está escondida? |
|---|---|---|
| `tokensDeSlide_` (etapa 3) | qué resolver **por ítem** | ✅ sí — devuelve `[]` |
| `tokensVisiblesDe_` (etapa 4) | **qué tokens** resolver | ✅ sí — los excluye |
| ⛔ **`presentacion.replaceAllText`** | ⛔ **DÓNDE pintar** | ⛔ **NO. Pinta el deck entero** |

⇒ ⭐ **Por eso `L-023` está escondida, sus `camp_resp_*` quedaron crudos con las llaves puestas
—`tokensDeSlide_` cortó— y `camp_titulo` igual se pintó.** Son dos mecanismos distintos: uno decide
**qué se resuelve** y el otro **dónde se pinta**, y sólo el primero mira la visibilidad.

⇒ ⭐⭐ **Y explica por qué las dos copias de `L-023` dicen lo MISMO: un pintado de deck entero no
puede producir dos valores.** No es que eligió mal dos veces — es que hay **un** valor.

### ⚠ 2 · La hipótesis de los dos caminos: **confirmada, con una corrección**

La hipótesis del prompt —*«uno por ítem y otro por lámina, y en `L-016`/`L-023` sólo actúa el
segundo»*— **es correcta en la conclusión y le falta una pieza en el medio**: el segundo camino no
es *«por lámina»*. **La etapa 4 se parte por lámina para el PRESUPUESTO, pero pinta por
presentación** cuando el token no es exclusivo. **Son dos ejes distintos** —cuánto entra en el
techo, y dónde cae la tinta— y sólo el primero es por lámina.

### ✅ 3 · El precedente de `L-040` **NO aplica** — mirado primero, como se pidió

| | `informe_id` | `seccion_id` | `rol` |
|---|---|---|---|
| `L-040` (`jm`, el precedente) | `jm` | `campana` | ⭐ **`equipo`** |
| ⛔ **`L-016` (`secco`)** | `secco` | `campana` | ⛔ **`motor`** |

⇒ **`L-016` está declarada como lámina del motor.** No es una lámina del equipo con un token del
motor adentro: **el motor la reclama**. El trabajo NO es el otro.

⚠ Y las ocho de `secco/campana` —`L-016`…`L-023`— **declaran exactamente lo mismo**: `filtro`
vacío, `modo` vacío, `rol = motor`. **La única que se diferencia es `L-023`, por `escondida`.**

### ⛔ 4 · Lo que NO se pudo medir, y por qué — **declarado, no omitido**

1. ⛔ **Si `L-016` se expandió o no.** El usuario mide *«aparece una sola vez, no una por bloque»*.
   Con `filtro` vacío **debería** entrar para los dos ítems, así que si de verdad aparece una sola
   vez **hay una segunda causa** — la más probable es que su ancla no esté en el índice y caiga a
   `sinSlide`. **No se puede resolver desde disco:** exige la plantilla viva o el `reporte` de la
   corrida, que publica `slides_modelo` y `laminas_modelo`.
2. ⛔ **Cuántas campañas tiene el temario de esa corrida.** ⚠ **El snapshot de `CAMPANAS` está
   vencido para esta pregunta:** el del 31/08 tiene **2 filas y las dos son de `jm`** (`3512-AGOSEGGJ`,
   períodos `21_27` y `21_28`). La carga de `secco` es **posterior**. Si son tres y se expandieron
   dos, ésa es la otra mitad — **y sigue abierta**.

⚠ **Las dos se contestan con el mismo dato: el reporte de la corrida** (`slides_modelo`,
`porItemLaminas`, `excluidos`) más `CAMPANAS` vivo. **Un snapshot del 31/08 no responde por un deck
del 03/09**, y `LAMINAS` se escribió en el medio.

### ⇒ Estado: **mecanismo explicado, causa raíz NO cerrada**

⭐ **Lo que sí queda firme, porque sale del código y no de una foto:** mientras `camp_titulo` no sea
**exclusivo de una lámina**, `presentacion.replaceAllText` le va a publicar **un solo valor en las
14**, escondidas incluidas. **`L-023` no puede publicar bien por ningún arreglo que no toque eso.**

⛔ **No se arregla acá.** Es un título publicado en una lámina visible.
