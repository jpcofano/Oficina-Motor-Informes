# TESTIGO — el ANTES de `X-39`, el cambio de esquema de `campo_id_cuenta`

> **Estado: congelado.** Evidencia fechada. **Nace VACÍO a propósito**, antes de la corrida, para
> que el «después» tenga contra qué compararse **sin depender de que alguien se acuerde**.
>
> ⚠ **Es el testigo de un cambio de ESQUEMA, no de un cableado.** Lo que se va a tocar:
> `SOLAPAS.campo_id_cuenta` en **`looker/DIGITAL`** y en **`digital/Directa Mail`**, más las filas
> de `MAPEO` de `Visualizaciones` (col D) y `Clics` (col E) de `looker/DIGITAL`. **Los diecisiete
> tokens NO entran en ese commit** — son huecos y van en otra tanda, después de que esto dé verde.

## Por qué esta corrida sirve de «antes»

**`cablearLosChicos()` corrió antes de la corrida**, y agregó `camp_desde`, `camp_hasta` y
`m2_campanias`. ⭐ **Ninguno de los tres toca `digital/Directa Mail` ni `looker/DIGITAL`** —los dos
primeros leen `looker/resumen_metricas_dinamico`, el tercero cuenta sobre `Directa Mail` pero
**sólo agrega un marcador nuevo, no cambia el esquema de la solapa**—. Así que los valores de esta
corrida son un **«antes» limpio**.

## ⛔⛔ Cómo se compara, y es lo que evita un falso positivo

**Se comparan VALORES, nunca trazas.**

⚠ **La traza VA A CAMBIAR y eso no es una regresión.** `C-81` lo midió: al declarar
`campo_id_cuenta`, los marcadores que se emiten **sin ítem** —que son todos los de una lámina
fija— pasan a llevar el aviso *"la solapa declara `campo_id_cuenta` … se lee como AGREGADO
GLOBAL"*. **El valor no cambia; el texto sí.** Un testigo que compare trazas byte a byte daría
distinto y sería **falso positivo**.

⭐ **Y el criterio de reversión es del usuario y es duro: si alguno se movió, se REVIERTE, no se
explica.**

## Los valores del ANTES

> ✅ **COMPLETO — corrida de `jm` sobre `agosto_14_20` del 22/08.** El cambio de esquema queda
> habilitado en cuanto se cierre el fallo de `ecv_barrio1-3`, que va antes.

### `looker/DIGITAL` — los ocho `imp_*`

| marcador | valor publicado |
|---|---|
| `imp_meta` | **-2.457.901-** |
| `imp_google` | **-1.011.829-** |
| `imp_prog` | **-9.794.231-** |
| `imp_total` | **-13.263.960-** ⚠ ver abajo |
| `gcba_imp_meta` | **-31.102.999-** |
| `gcba_imp_google` | **-36.689.459-** |
| `gcba_imp_prog` | **-89.037.219-** |
| `gcba_imp_total` | **-156.829.677-** |

⚠ **Van con el formato tal como sale**, envuelto en guiones: los ocho están en `miles_revisar`.

### `digital/Directa Mail`

| marcador | valor publicado |
|---|---|
| `mail_entregados` JM | **538.276** |
| `mail_entregados` GCBA | **2.334.767** |
| `mail_envios` JM | **6** |
| `gcba_mail_envios` | **63** |
| `gcba_sms_envios` | **4** |
| `m2_envios` | **33** |
| `m2_mails_enviados` | **687.457** |
| `m2_mails_entregados` | **679.897** |
| `m2_aperturas` · `m2_or` | **197.099** · **29 %** |
| `m2_clics` · `m2_ctor` | **3.676** · **1,9 %** |
| **`m2_campanias`** *(nuevo)* | **21** |

⭐ **`m2_campanias` = 21 contra `m2_envios` = 33** — el `CUENTA_DISTINTOS` funciona y la
diferencia es la que tiene que haber: **hay campañas con más de un envío**.

### ⚠⚠ Y un hallazgo que cambia el criterio del testigo

**`imp_total` JM dio `-13.263.960-` y en la corrida anterior `-13.263.961-`: UN PESO de diferencia,
sin que nada haya cambiado en su camino.**

⛔ **Entonces el testigo NO puede exigir igualdad al último dígito en los `imp_*`.** No se persigue
ahora —es del «antes», no del cambio— pero **queda escrito como criterio**: una diferencia de ±1 en
un agregado de millones no acusa al cambio de esquema.

⭐ **Y conviene saber qué NO explica:** no es `R-31` —el campo no cambió entre fotos, la corrida es
la misma base— ni el tope de `R-30`, que ya estaba activo en las dos. Lo más probable es
**redondeo en la suma**, y por eso el criterio correcto es una tolerancia declarada y no una
persecución.

⭐⭐ **`mail_entregados` es el que más importa y el motivo hay que tenerlo presente:** ya se miró
**dos veces** —los 15 de diferencia que resultaron ser **carga manual** (`X-31`, `R-31`)—. **Si
después del cambio se mueve otra vez, no se va a poder distinguir el esquema de la carga.** Por eso
el «antes» es de la corrida que ya existe y no de una posterior.

### Los que NO se miran, y por qué

- **`camp_desde`, `camp_hasta`** — leen `resumen_metricas_dinamico`, que **ya** tiene
  `campo_id_cuenta`. No los toca este cambio.
- **Los `cc_*`** — no están cableados (`C-80`, `X-28`).

## Qué dice el código que va a pasar — la predicción, escrita ANTES

⭐ **`C-81`, verificado greppeando los siete archivos que leen `campo_id_cuenta`:** el que decide es
`Generador.gs`, bloque *«A (19/08): `campo_id_cuenta` deja de ser todo-o-nada»*:

```js
if (campoCuenta && !idCuentaItem) { …aviso…; campoCuenta = null; }   // cae a la rama general
```

**Los ocho `imp_*` se emiten en una lámina fija, sin ítem** → `campoCuenta = null` → **rama general,
idéntica a hoy**. ⭐ **Y esa rama se escribió exactamente para este caso**: el 19/08, declararlo en
`resumen_metricas_dinamico` rompía `frecuencia` y `gcba_frecuencia`.

⭐⭐ **Para `digital/Directa Mail` la protección es todavía más fuerte:** el propio comentario mide
que **las solapas de `digital` nunca llegan a esa rama** — la de `digital` de más arriba las atrapa
y tiene su propio agregado global desde el 15/08.

⚠ **Que la predicción sea sólida no la vuelve prescindible.** El `_44` es el precedente donde una
predicción así falló: entró al seed y a **un** consumidor, no a `leerFilasSolapas_`, y el síntoma
—`"undefined"` como texto— llegó **un mes después**. **La predicción dice dónde mirar, no reemplaza
mirar.**

---

# ⭐⭐ ADDENDUM — 23/08/2026 · el criterio de este testigo estaba mal, y se corrige acá

> **El texto de arriba no se toca** (es evidencia fechada). Esto es un addendum: corrige **el
> criterio de comparación**, no los números del «antes».

## Qué pasó — la corrida del 23/08 con `X-39` aplicado

| grupo | resultado |
|---|---|
| `mail_entregados` JM **538.276** · GCBA **2.334.767** | ✅ **idénticos, los dos** |
| envíos **6 · 63 · 4** | ✅ idénticos |
| `imp_meta` · `imp_prog` · `imp_total` de **JM** | ✅ idénticos |
| `imp_google` JM **-1.011.828-** contra `-1.011.829-` | ✅ **±1**, dentro de la tolerancia que este mismo testigo declaró |
| ⛔ `gcba_imp_meta` | **-31.398.577-** contra `-31.102.999-` → **+295.578 (+0,95 %)** |
| ⛔ `gcba_imp_google` | **-36.928.932-** contra `-36.689.459-` → **+239.473 (+0,65 %)** |
| ⛔ `gcba_imp_prog` | **-89.083.922-** contra `-89.037.219-` → **+46.703 (+0,05 %)** |
| ⛔ `gcba_imp_total` | **-157.411.431-** contra `-156.829.677-` → **+581.754 (+0,37 %)** |

**`X-39` se revirtió**, por el criterio del usuario: *si alguno se movió, se revierte, no se
explica.* La reversión es del **seed**; las tres filas de `MAPEO` se quedan, porque sin
`campo_id_cuenta` ninguna se lee y sacarlas las dejaría huérfanas en la hoja.

## ⛔ Por qué el criterio estaba mal — este testigo no podía dar otro resultado

**Los ocho `imp_*` salen de `looker/DIGITAL`, y `R-31` la mide `inestable por CAMBIO`:
`dig_impresiones` se movió en `19/503` filas (3,8 %) entre los dos exports, con **cero altas y 19
cambios**, mínimo `−893`.** Recálculo en el lugar: mismas filas, otros valores.

⛔⛔ **Un campo que `R-31` clasifica `CAMBIO` no admite control por igualdad exacta, y este testigo
se lo exigió igual.** No es que la corrida haya salido mal: **el testigo estaba mal construido**, y
habría producido un «se movió» tarde o temprano sin que nada estuviera roto.

⚠ **Y la regla ya estaba escrita** — `CLAUDE.md` §4: *«la comparación no puede depender de lo que
se mueve solo»*. No es un aprendizaje nuevo: es uno que no se aplicó al armar el testigo.

## ⚠ La corrección que hay que leer con cuidado: `mail_entregados` TAMPOCO era de igualdad

Al revertir se dijo que *«`mail_entregados` sí admite igualdad porque es de evento»*. **`R-31` dice
que no:** `digital/Directa Mail · mail_entregados` está **en la lista de inestables** — `14/1687`
(0,8 %), **10 altas y 4 cambios**, mínimo `−27`. Y el propio cuerpo de este testigo ya lo decía con
otras palabras: *«ya se miró dos veces, los 15 de diferencia resultaron ser carga manual»*.

⭐ **Que haya salido idéntico dos veces es evidencia, no una propiedad.** Lo que lo hizo reproducible
no es la clase del campo: es que **el intervalo entre las dos tomas fue corto** — que es la pregunta
que `CLAUDE.md` §4 manda hacer, *«¿se mueve DENTRO del intervalo de la verificación?»*, y no
*«¿está quieta la base?»*.

## ✅ El criterio corregido — por marcador, y sale de `R-31`, no del autor del testigo

| clase (`R-31`) | qué control admite | quién cae acá, de los de este testigo |
|---|---|---|
| **estable** | ✅ **igualdad exacta**, y si no reproduce **es un bug** | `gcba_sms_envios` (`digital/Directa SMS`, cero movimientos sobre 28 filas) |
| **inestable por ALTA** | **dirección**: sube o queda, **nunca baja**; si baja es bug | — (ninguno de éstos es de `rdv`) |
| **inestable por CAMBIO** | ⛔ **ni igualdad ni dirección**: rango declarado o `_revisar` | **los ocho `imp_*`** (`looker/DIGITAL`) |
| **mixto** (alta + cambio) | igualdad **como evidencia**, nunca como exigencia | `mail_entregados` de los dos ámbitos, `mail_envios`, `gcba_mail_envios` |
| ⚠ **sin medir** | **no se le exige nada, y se dice que no se midió** | los seis `m2_*` y `m2_campanias` — `R-31` no midió la base `m2` |

⭐⭐ **La regla que sale de acá, y es la que hay que aplicar al próximo testigo: un testigo hereda
la estabilidad de sus campos, así que la clasificación se hace ANTES de tomarlo, no al leer el
resultado.** Este mezcló cinco clases bajo un solo criterio y llamó «movimiento» a lo que `R-31` ya
había medido como comportamiento normal de la fuente.

## ⭐⭐ Lo que faltaba y era barato: el canario, que además ya existía

**`gcba_frecuencia` pasó de `-6.1-` a `-6.25-` en la misma corrida — y lee
`looker/resumen_metricas_dinamico`, que `X-39` NO tocó** y que ya declaraba `campo_id_cuenta` desde
el 19/08. **Un marcador que se mueve sobre una solapa intacta sólo se explica por la fuente.**

⚠ **Su procedencia es más débil que la del resto y hay que decirlo:** el `-6.1-` **no está en la
tabla de arriba** — este testigo nunca lo guardó —, así que sale de otra corrida. Vale como
indicio fuerte, no como medición del par antes/después.

⭐ **Y el canario no hubo que inventarlo: `gcba_frecuencia` ya era EL canario del piloto de `D-33`**,
por el mismo motivo — vive en otra solapa y viene en el log de cada corrida. **Lo que faltó fue
declararlo en el testigo.** Todo testigo de un cambio de esquema lleva, desde hoy, **al menos un
valor que el cambio no puede tocar**, y lo dice por nombre.

## ⛔ El segundo argumento, que no necesita otra corrida

**`campo_id_cuenta` es por SOLAPA, no por marcador.** Los ocho `imp_*` —los cuatro de JM y los
cuatro de GCBA— leen **la misma solapa** con la **misma** operación (`SUMA` sobre `Impresiones`,
`filtro = estado=Activa`) y difieren **sólo** en `dimensiones` (`ambito=jm` / `ambito=gcba`).

⭐ **Un cambio de esquema de la solapa no puede mover un ámbito y dejar el otro idéntico al
dígito.** Los cuatro de JM salieron idénticos. Entonces la lectura no cambió, y lo que cambió es
**qué filas contiene cada universo** — y el de GCBA es mucho más grande, así que tiene mucha más
chance de contener alguna de las 19 filas que `looker` recalcula.

## ⚠ Y un límite de la prueba de reversión, que hay que saber ANTES de leer su resultado

La reversión se corre para separar *«fue el esquema»* de *«fue la base»*. **Pero si fue la base, la
base tampoco se queda quieta para la corrida de control**, así que hay **tres** desenlaces y no dos:

| qué sale | qué significa |
|---|---|
| los `gcba_*` vuelven **exactos** a los valores de arriba | **fue el esquema** |
| se quedan en los nuevos, **o siguen derivando** | **fue la base** — y la deriva extra lo confirma en vez de enturbiarlo |
| ⚠ vuelven **cerca pero no exactos** | **no decide nada por sí solo** → mirar el canario |

⭐ **Por eso el canario se mira en las dos corridas.** Si `gcba_frecuencia` se mueve **otra vez** con
`X-39` ya revertido, la fuente queda probada sin depender de los `gcba_*`.

**La predicción, escrita antes de la corrida** (que es como este repo la quiere): los `gcba_*`
**no** van a volver a los valores de arriba.

## ⛔ Qué haría falta para reponer `X-39`

**No alcanza con volver a escribir la línea.** Hace falta un testigo que la inestabilidad no
arruine, y las piezas ya están todas medidas:

1. **Criterio por marcador**, el de la tabla de arriba — nunca igualdad exacta sobre `looker/DIGITAL`.
2. **Un canario declarado por nombre**, en una solapa que el cambio no toque.
3. ⭐ **El control que sí discrimina, y es el más barato de los tres: comparar JM contra GCBA dentro
   de la MISMA corrida.** Los dos leen la misma solapa por el mismo camino; si el esquema cambiara
   la lectura, **los dos se moverían**. Eso no necesita un «antes» y por lo tanto **la
   inestabilidad de la fuente no lo puede arruinar**.

## ✅ CERRADO el 23/08 — sin la segunda corrida, y `X-39` queda repuesto

**La prueba de reversión no llegó a correrse, y no hizo falta.** El argumento de más arriba
—`campo_id_cuenta` es por **solapa**, los ocho `imp_*` la leen igual y sólo difieren en
`dimensiones`, y los cuatro de JM salieron **idénticos al dígito**— cierra el caso solo. El
canario lo confirma desde otra solapa.

**Lo que la reversión sí probó, y por eso valió la pena hacerla:** que el cambio **se deshace
limpio**. El seed emite `campo_id_cuenta` siempre —con `''` cuando no se declara—, así que
`upsertPorClave_` blanquea la celda y *"Aplicar configuración"* revierte de verdad. Eso ahora
tiene su afirmación en `tools/probar-id-cuenta-declarada.js`, escrita **sobre el mecanismo y no
sobre el valor de hoy**, para que siga valiendo con la declaración puesta.

⛔ **Y lo que NO queda cerrado: este testigo.** `V-110` no puede volver a usarse con criterio de
igualdad sobre los `imp_*`. Su reemplazo lleva las tres piezas de arriba —criterio por marcador,
canario declarado por nombre, y el control JM-contra-GCBA dentro de la misma corrida—, y esa
tercera es la que conviene mirar primero: **no necesita un «antes», así que la inestabilidad de la
fuente no la puede arruinar.**
