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
