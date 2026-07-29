# HALLAZGOS — validación de decks de muestra contra las bases

> Repo: `docs/HALLAZGOS_validacion_decks.md` · 29/07/2026
> Método: se clonó el repo, se extrajo el texto de `Informe semanal JM 26_06 AL 03_07.pptx`
> y se intentó reproducir cada número publicado desde `Base Looker.xlsx`,
> `Seguimiento Digital (1).xlsx` y `RDV JM CM ES + funcionarios.xlsx`.

---

## 0. Resumen en una línea

**Los decks de muestra no sirven como ground truth exacto.** Contienen números que
siguen creciendo, al menos un error aritmético que cambia un titular, y slides
snapshoteadas en momentos distintos. El motor bien hecho **no** va a reproducirlos — y
eso hay que decidirlo antes, no cuando alguien diga "el motor está mal".

Lo que sí quedó verificado: **las bases reproducen exactamente el detalle fila por fila**.
Donde no coinciden, el problema está del lado del deck o de la base, no del criterio.

---

## 1. Estado real del código (verificado)

| Paso | Estado |
|---|---|
| 1.8-B | ✅ **hecho** — `appsscript.json` ya tiene `timeZone: America/Argentina/Buenos_Aires` y los 5 `oauthScopes` |
| 1.9 | ❌ **pendiente** — `SEED_BASES_` no tiene `fila_encabezado` ni `modo_periodo` |

Último commit: `9899c14 Paso 1.8-B`. O sea: **P1 y P2 de la checklist pasan; P3 y P4 no.**
El Paso 2 sigue bloqueado por 1.9, como estaba previsto.

**Además faltan dos prompts en el repo:** `docs/Prompts/` tiene `Paso-3.md` pero **no**
`Paso-3-v2.md`, y **no** existe `Paso-2.5.md`. El HANDOFF los da por generados. Si se
corre `Paso-3.md` tal como está, se vuelve al diseño de una función por marcador (~200)
que el propio HANDOFF descartó. **Hay que regenerar los dos antes de llegar ahí.**

---

## 2. El hallazgo central: por qué el deck no se puede reproducir

Tres causas distintas, que conviene no mezclar porque tienen soluciones distintas.

### 2.1 Acumulación (esperable, es lo que vos anticipaste)

Campaña **Decreto: Declaración de servicios esenciales** (24/06 → 08/07), corte del deck 03/07:

| métrica | deck (03/07) | base (hoy) | Δ |
|---|---|---|---|
| impresiones digital | 678.365 | 901.395 | +33% |
| alcance | 488.151 | 568.282 | +16% |
| frecuencia | 1,3 | 1,59 | |
| aperturas mail | 157.968 | 157.968 | **=** |
| clics mail | 1.026 | 1.026 | **=** |

Campaña **Programas y actividades para personas mayores** (19/06 → 17/07):

| métrica | deck (03/07) | base (hoy) | Δ |
|---|---|---|---|
| mails enviados | 321.439 | 321.439 | **=** |
| entregados | 320.412 | 320.390 | −22 |
| aperturas | 112.066 | 114.626 | +2.560 |
| clics mail | 7.332 | 8.597 | +1.265 |
| impresiones digital | 1.944.817 | 9.117.501 | ×4,7 |

**Lo que se aprende de esto:** no todas las métricas se congelan igual.

- `enviados` **se congela** en el momento del envío → siempre reproducible.
- `entregados` **se mueve un poco** después (reproceso de rebotes) → ±20-30.
- `aperturas` y `clics de mail` **siguen creciendo semanas después** — la gente abre
  mails viejos. En esenciales quedaron iguales sólo porque para el 03/07 esa campaña ya
  no sumaba; en mayores crecieron 2,3%.
- `impresiones` y `alcance` **crecen todo lo que dure la pauta**.

### 2.2 La base no tiene granularidad diaria (esto es lo grave)

`Looker/resumen_metricas` tiene **una fila por campaña con el total acumulado**. No hay
desagregado por día. `CAMPAÑAS_DESGLOCE_DIGITAL` desagrega por plataforma **y por mes**,
no por día.

Consecuencia directa: **el motor no puede calcular "el tramo del período"**. Puede
calcular sólo "el acumulado al momento en que lee". Y por lo tanto:

> Correr el motor hoy para el período 26/06–03/07 **no** devuelve el informe del 03/07.
> Devuelve los números de hoy.

Esto convierte a **`Snapshot.gs` (hoy un stub vacío) en una pieza obligatoria, no
opcional**: sin congelar los valores al cierre de cada período, el motor no es
reproducible hacia atrás y no hay forma de auditar un informe pasado.

**Recomendación:** subir Snapshot antes que la capa de panel. Es más barato ahora que
después de tener 200 marcadores cableados.

### 2.3 Errores en el deck (esto hay que conversarlo con el equipo)

**a) La fila GLOBAL de mails de "servicios esenciales" está mal.**

La base tiene 4 envíos; el deck los presenta en 3 filas (fusiona los dos del 29/06).
Las 3 filas del deck son correctas. La fila GLOBAL no:

| | enviados | entregados | aperturas | OR |
|---|---|---|---|---|
| deck GLOBAL | 427.902 | 422.461 | 157.968 | **37%** |
| suma real (4 envíos) | 787.284 | 776.455 | 157.968 | **20,3%** |

El GLOBAL sumó `enviados`/`entregados` de **sólo los 2 envíos de JM**, pero
`aperturas`/`clics` de **los 3**. Dividir aperturas de todos por entregados de dos da
37% en vez de 20,3%.

No es un detalle de formato: el insight escrito debajo dice que el envío de GCBA *"fue
clave para maximizar las aperturas y elevar el rendimiento global de la campaña (37%
OR)"*. **La conclusión está apoyada en el número mal calculado.** El benchmark que cita
la misma slide es 25–30% OR, así que el error convierte un resultado por debajo del
benchmark en uno por encima.

**b) Total de impresiones de "personas mayores": 1.994.817 vs 1.944.817.**

Las tres plataformas de la slide 24 suman **1.944.817**. El total impreso dice
**1.994.817**, en las slides 23 y 24. Que la frecuencia publicada (8,2) dé exactamente
`1.944.817 / 235.704` confirma que el 1.994.817 es un error de tipeo que se propagó.

**c) Slides del mismo deck snapshoteadas en momentos distintos.**

Slide 15 dice 867 clics de mail; slide 16, para la misma campaña, dice 1.026. Las dos
están en el mismo archivo. Consistente con que se armaron con horas o días de
diferencia.

---

## 3. Verificación slide 5 del JM (el corte vertical propuesto)

Es la slide sugerida para el Paso 3. **Se reprodujo desde RDV sin ambigüedad.**

Fila en `RVD JM-CM - ES`, fecha 24/06/2026:

`Jorge Macri | Floresta | "1 a 1" | Realizada | Inscriptos 83 | Mail 1 | RRSS 82 | Asistentes 12 | Comuna 10`

| token | deck | base | ✓ |
|---|---|---|---|
| `ecv_inscriptos` | 83 | 83 (K) | ✅ |
| `ecv_asistentes` | 12 | 12 (Q) | ✅ |
| minutos promedio | 6 | **no existe en RDV** | ❌ |

**El filtro necesario es de tres condiciones**, no sólo la fecha: ese mismo día hay otras
dos filas (Lombardi/Villa Urquiza, Mraida/Retiro) que son `Encuentro con Vecinos` y no
entran al informe. El filtro es `FECHA` en ventana **+** `EVENTO = "1 a 1"` **+**
`STATUS REUNIÓN = Realizada`. Probablemente también `Figura = Jorge Macri`.

Chequeo de consistencia que confirma el mapeo de canales: `Mail(1) + RRSS(82) = 83 =
Inscriptos`. Confirma que `ecv_insc_digital` = columna O (RRSS), como decía el MAPEO.

**Pendiente:** "Minutos promedio" no está en ninguna columna de RDV. Es un token sin
fuente en la slide elegida para el corte vertical. Hay que resolverlo o sacarlo del
corte.

---

## 4. Decisión #1 (Looker vs Seguimiento Digital): estaba mal planteada

**No son dos verdades en competencia. Looker es el rollup de Seguimiento Digital.**

Verificado en las dos campañas: los totales de `Looker/resumen_metricas` son la suma
exacta de las filas de `Seguimiento Digital/Directa Mail`.

- Esenciales: 4 envíos suman 787.284 / 776.455 / 157.968 / 1.026 → **idéntico** a Looker.
- Mayores: 2 envíos suman 321.439 / 320.390 / 114.626 / 8.597 → **idéntico** a Looker.

Entonces la pregunta no es *cuál es verdad* sino **a qué granularidad**. Y el deck
necesita las dos:

| necesidad del deck | fuente única posible |
|---|---|
| totales por campaña (slides 15, 23) | Looker (o suma de SD) |
| tabla desagregada por envío (slides 16, 25) | **sólo Seguimiento Digital** — Looker no la puede producir |

**Recomendación revisada:** `Seguimiento Digital` como fuente de fila, y los `camp_*`
totales calculados **sumando** esas filas en `Marcadores.gs`. Así hay una sola verdad y
el desagregado sale gratis. Looker queda como control cruzado.

⚠ Con una excepción importante, abajo.

### 4.1 El total digital de Looker está inflado por doble conteo

En "personas mayores", `Looker/DIGITAL` tiene **dos filas de DV360 con el mismo valor**
(3.985.697 cada una). El total de `resumen_metricas` (9.117.501) las suma a las dos:
`1.108.827 (Meta) + 37.280 (Google) + 3.985.697 × 2 = 9.117.501`. **El 87% de las
impresiones de esa campaña son una cifra duplicada.**

El patrón sugiere que las filas mensuales de DV360 son **acumuladas a la fecha**, no
incrementos del mes — y al sumarlas se cuenta dos veces. Además `Seguimiento
Digital/CAMPAÑAS_DESGLOCE_DIGITAL` da otro número para DV360 (4.282.853, también
repetido en junio y julio). **Las dos fuentes se contradicen entre sí en Programmatic.**

Esto no lo puede resolver el motor. Es un tema para quien mantiene esas planillas.

### 4.2 `alcance` no es sumable

En la slide 24 el TOTAL de alcance (235.704) es **el de Meta solo**; Google y Programmatic
figuran como "-". Looker tiene una hoja `ALCANCE` aparte con un valor único por campaña
(439.429).

**Regla de diseño para `Marcadores.gs`:** `camp_alcance` y `camp_frecuencia` **no** son
`SUMA`. Son `ULTIMO`/lookup contra la hoja de alcance. Si se cablean como SUMA el número
sale mal y parece bien.

---

## 5. Decisión #2 (`camp_resp_*`): más cerca, no cerrada

El HANDOFF decía que no estaban en ninguna de las 4 bases. **No es exacto:** el archivo
de RDV tiene tres hojas con exactamente la estructura de la tabla de respuestas
moderadas (slides 17, 18, 26):

`Respuestas JM 📩` · `Visualiz_respuestas_JM` (12.592 filas) · `Visualiz_respuestas_GCBA` (18.189 filas)

Columnas: `Estado · Fecha · Moderador · Respuesta del vecino · Respuesta de GCBA · Tipo
respuesta · Campaña · Asunto · Eje · Sub Eje`.

**Pero** las campañas del deck (esenciales, mayores) **no aparecen** en esas hojas en
este sample. Las hojas cubren otras campañas.

Dos hipótesis, y hay que preguntar cuál es:
1. El sample es un extracto viejo y la planilla viva sí las tiene.
2. Las respuestas de estas campañas se cargan en otro lado.

`Respuestas JM 📩` **tiene el encabezado en la fila 3** (dos filas de agrupación arriba).
Igual que M2 con la fila 3 — refuerza que `fila_encabezado` del Paso 1.9 tiene que ser
por **hoja**, no por base. Y que una misma planilla va a necesitar **varias filas en
BASES** (mismo `sheet_id`, distinta `hoja`). El diseño por registros lo soporta; hay que
hacerlo explícito.

---

## 6. Respuestas a las preguntas de validación

| # | Pregunta | Respuesta con evidencia |
|---|---|---|
| V1 | ¿acumulado o tramo del período? | **Acumulado, y no por decisión sino porque la base no permite otra cosa** (§2.2). Las campañas activas se reportan como "parciales" con fecha de fin futura (slide 5: "Fecha de fin: 10/7"; slide 7: "Activa, 23/06 al 03/07" = inicio de campaña → corte del informe). |
| V2 | ¿qué columna de fecha? | Mail: `Fecha envio` (SD/Directa Mail) — reproduce el desagregado exacto. RDV: `FECHA` (col E) + filtros de EVENTO y STATUS. Digital: no hay fecha de métrica, sólo `fecha_inicio`/`fecha_fin` de campaña. |
| V3 | ¿Looker o Seguimiento Digital? | **Pregunta mal planteada** — Looker es el rollup de SD (§4). Recomendación: SD como fuente de fila. |
| V4 | fuente de `camp_resp_*` | Estructura encontrada en 3 hojas del archivo RDV, pero sin las campañas del deck (§5). **Falta preguntar.** |
| V5 | encuentro temático | No abordado en esta pasada. |
| V6 | ¿filas sin fecha cuentan? | No se detectaron filas sin fecha en los cortes verificados. Igual hay que instrumentar el contador. |

---

## 7. Consecuencia práctica: cambia el criterio de aceptación

El criterio "el motor reproduce el deck" **no se puede cumplir** y no conviene intentarlo.
Propuesta de reemplazo:

1. El motor reproduce **la base**, no el deck.
2. Para cada número del deck que no coincida, se clasifica en una de tres:
   **(a)** creció desde el corte · **(b)** el deck tiene un error · **(c)** el motor tiene un bug.
3. Sólo (c) es motivo para no commitear.

Y una recomendación de encuadre, dado que el motor va a exponer errores del proceso
manual: presentarlo como beneficio, no como auditoría. El caso del 37% vs 20,3% es
justamente el argumento — el motor evita ese tipo de error, no lo denuncia.

---

## 8. Preguntas para llevar al equipo

1. El OR de 37% en esenciales, ¿se publicó así? ¿Y el insight que se apoya en ese número?
2. Cuando una campaña sigue activa al cierre, ¿el número que quieren ver es el acumulado
   a la fecha de corte o el tramo de la semana? (Hoy es acumulado por limitación de la base.)
3. ¿Por qué se fusionan envíos en la tabla desagregada (2 filas del 29/06 → 1; 2 del 23/06 → 1)?
   ¿Regla fija o criterio del que arma?
4. "Minutos promedio" de la slide 5, ¿de dónde sale?
5. Las respuestas moderadas de estas dos campañas, ¿dónde están cargadas?
6. DV360 en junio y julio con el mismo valor, ¿es acumulado o hay doble carga?

---

## 9. Próximo paso concreto

1. Correr **Paso 1.9** (bloquea el 2).
2. Regenerar **`Paso-2.5.md`** y **`Paso-3-v2.md`**, que no están en el repo.
3. Reordenar **`Snapshot.gs`** hacia adelante en la secuencia (§2.2).
4. Llevar las 6 preguntas de §8 al equipo.
