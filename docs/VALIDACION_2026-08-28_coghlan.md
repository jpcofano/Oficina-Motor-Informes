# VALIDACIÓN 2026-08-28 — `L-053` (1 a 1, Coghlan) contra el deck del equipo

> **Congelado.** Uno nuevo por corrida de validación; éste no se edita. Los casos están en
> `docs/casos_validacion_2026-08-28.csv` (`V-114`…`V-123`, `X-42`, `X-43`, `C-84`…`C-86`).

**Qué se cruzó.** El fixture `Seguimiento Digital 2026-08-28.zip`, `sha256`
`0ce0086d…fa81ac79` — **verificado antes de citar un solo número** —, que trae **las cinco bases y
el deck del equipo de la MISMA ventana** (`Informe semanal JM - (21_08 al 28_08) Equipo parcial.pptx`,
lámina 5). Es el primer fixture del proyecto donde las bases y el deck del equipo son del mismo día
**y de la semana que el motor está generando**.

⚠ **Qué clase de verificación es ésta, dicho antes que los números.** Verifica **la DEFINICIÓN del
negocio sobre un fixture**: de qué filas sale cada valor. **No corre el motor**, no resuelve
`MARCADORES` y no prueba que `datosDeMarcador_` lea así — eso lo dice una corrida. Y es una **foto
del 28/08**: `digital/CAMPAÑAS_DESGLOCE_DIGITAL` es inestable por CAMBIO (`R-31`).

⭐ **Las condiciones de `etapa` y `plataforma` se LEYERON de `DIMENSIONES_` en `Fuentes.gs`**, no se
reescribieron — `tools/medir-desglose-por-cuenta.py` las extrae por texto. Reescribirlas habría sido
el instrumento que reproduce lógica del motor y la reproduce peor.

⚠ **Y no había caso previo para Coghlan.** Las familias `u1_*` tienen casos de otras semanas
(`V-21`…`V-26`, San Cristóbal y Retiro), así que **la definición ya estaba validada y lo nuevo era
la semana**. Estos números **nacen validados hoy**; no estaban validados antes.

---

## 1 · El bloque PRE cierra por TRES rutas independientes

| marcador | equipo | fixture | |
|---|---|---|---|
| `u1_pre_meta_impresiones` | 38.304 | **38.304** | ⭐ exacto |
| `u1_pre_meta_clics` | 538 | **538** | ⭐ exacto |
| `u1_pre_meta_ctr` | 1,40 % | 538/38.304 = 1,4046 % | ⭐ exacto |
| `u1_pre_google_impresiones` | 4.838 | **4.838** | ⭐ exacto |
| `u1_pre_google_clics` | 166 | **166** | ⭐ exacto |
| `u1_pre_google_ctr` | 3,43 % | 166/4.838 = 3,4312 % | ⭐ exacto |
| `u1_pre_prog_*` | el equipo no lo publica | **cero filas** | ✅ coinciden en la ausencia |

⭐⭐ **La tercera ruta es la que lo vuelve fuerte:** `reuniones/Agenda JM` col **AA** —un total
precalculado, de **otra base**— da **43.142**, que es exactamente `38.304 + 4.838` y exactamente lo
que el equipo publica sumando sus dos plataformas. **Tres caminos, un número.** Ninguno de los tres,
por separado, dice lo que dicen los tres juntos.

---

## 2 · El bloque POST no admite control exacto, y se sabe POR QUÉ

| | equipo | fixture | Δ |
|---|---|---|---|
| `u1_post_meta_impresiones` | 33.591 | 34.368 | **+777** |
| `u1_post_meta_vistas` | 5.307 | 5.433 | +126 |
| `u1_post_google_impresiones` | 1.470 | 1.452 | **−18** |
| `u1_post_google_vistas` | 888 | 876 | −12 |

⭐⭐ **Que Google BAJE es el dato que cierra el diagnóstico.** Si fuera sólo *«la campaña sigue
corriendo»*, los cuatro subirían; bajar es **recálculo en el lugar** — `R-31` inestabilidad por
CAMBIO, la misma forma que `X-31` midió para `mail_entregados`, donde los valores también bajaron.

⭐ **Y el discriminador que lo separa de un error de criterio ya estaba en la misma medición:** las
**tres filas PRE de la misma cuenta salieron idénticas al dígito**. Un error de lectura o de
condición no puede dejar PRE exacto y mover POST. Es la forma de *«dos que comparten camino y
difieren sólo en el corte»*.

El equipo rotula la lámina **«Resultados parciales»** y cierra con **«Parciales»**. El sufijo
`_revisar` de estos cuatro **está bien puesto** (`X-42`).

⭐ **Segunda identidad entre bases, y confirma el POST igual que la de arriba confirmó el PRE:**
`Agenda JM | Post` col **J** = 35.820 = la suma POST del desglose, y col **M** = 6.309 = la suma de
visualizaciones. **Las dos exactas.** Así que las dos bases están de acuerdo *entre ellas* y las dos
difieren del deck **por lo mismo**: el deck es de un momento anterior.

---

## 3 · Alcance — uno aproximado, uno que no reproduce, y dos preguntas abiertas

| marcador | fuente | mide | equipo | |
|---|---|---|---|---|
| `u1_pre_meta_alcance` | `Agenda JM` AF | 17.013 | 16.538 | ⚠ +2,9 %, `V-123` |
| `u1_post_meta_alcance` | `Agenda JM \| Post` G | **0** | 26.033 | ⛔ `X-43` |

⛔ **El POST no es un bug del motor: la celda está en cero.** `ULTIMO` sobre un **0 escrito**
devuelve `0` —no `sin_dato`—, así que el deck publicaría un cero que se lee como *«no alcanzamos a
nadie»*. Lo que falta es que alguien cargue la columna.

⚠ **El PRE no es exacto pero está corroborado:** `Agenda JM.AF` y `digital/Alcance` dan **los dos
17.013**. Dos bases coincidiendo entre sí y difiriendo del deck en la misma cantidad dice que la
diferencia es **deriva del dato**, no del criterio.

### ⛔ `C-84` — `digital/Alcance` tiene DOS filas por cuenta

`17.013` y `0`. El criterio declarado es *«no se suma, se pone la primera»*, y eso es **elegir por
el orden de la hoja** — lo mismo que el `_39` le sacó a `ULTIMO`. Hoy acierta; el día que el orden
cambie, publica el cero.

⭐ **Salida medida y mejor:** `reuniones/Agenda JM` col `AF` da el **mismo** 17.013 y tiene **una
sola fila** por cuenta. Sin elección, no hay orden que pueda fallar.

### ⛔ `C-85` — el alcance del conjunto no se puede reproducir

El equipo publica **46.316**, y sus dos parciales suman **42.571**. **El total no es la suma**: es un
alcance **deduplicado** —quien vio PRE y POST cuenta una vez—. En la base no hay fuente para ese
deduplicado. `u1_total_alcance` sigue **sin fila**, y está bien que siga así.

### ⛔ `C-86` — la frecuencia se calcula, pero depende del alcance

Decisión del usuario: **frecuencia se calcula**, no se lee. Pero `RATIO impresiones/alcance` necesita
un alcance, y ése es `C-85`.

- Con los números del equipo: `78.203 / 46.316 = 1,688` y publican **1,6**.
- Con lo que hay en la base: `Agenda JM` tiene los **dos operandos en la misma solapa** —`AA`
  43.142 y `AF` 17.013— y da **2,536**, porque su universo es **PRE** y el del equipo es PRE+POST.

**No se cablea hasta resolver `C-85`.** Un `RATIO` sobre el alcance equivocado publica un número
plausible, que es el modo de falla más caro de este repo.

---

## Saldo

**6 exactos · 1 aproximado · 4 que no admiten control exacto, con la causa medida · 1 que no
reproduce por falta de dato · 3 preguntas abiertas · 3 identidades entre bases confirmadas.**

**Los instrumentos quedan en el repo** y verifican la huella antes de medir:
`tools/medir-desglose-por-cuenta.py` y `tools/medir-fila-de-cuenta.py`.
