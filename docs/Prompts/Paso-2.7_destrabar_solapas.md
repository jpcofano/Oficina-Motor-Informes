# Paso 2.7 — Destrabar la siembra de `SOLAPAS` + tres mapeos sospechosos

> **Estado actual: el motor está caído.** `buscarMapeo()` exige `uso=fuente` y quedaron
> 82 de 84 solapas en `revisar`, incluidas las nueve que el motor necesita.
> **La Parte A lo destraba y se puede correr sola.** Las Partes B–F son independientes
> entre sí; si hay poco tiempo, A primero y el resto después.
>
> **No toca Slides, no siembra `MARCADORES`.** Un commit por parte.
> **Trabajamos en español.**
>
> ⚠ **Namespace (`PROYECTO.md` §9):** antes de nombrar cualquier función nueva,
> `grep -rn "function nombre" *.gs`.

---

## Parte A — La siembra no puede distinguir `revisar` automático de `revisar` humano

**Qué pasó.** Se corrió `inventariarSolapas()` antes de `SEED_SOLAPAS_`. El inventario
dejó las 84 filas con `uso=revisar`, y para la siembra eso ya era "valor cargado", así
que la regla *"nunca pisar una decisión humana"* la protegió. Resultado: solo entraron
las dos filas de `rdv` que el inventario no había tocado, y las otras 82 quedaron en
`revisar`.

La regla es correcta. Lo que falta es el discriminador, y está a mano: el inventario
escribe `notas='detectada <fecha>'`.

1. **Marca explícita de origen.** Agregá una columna `origen` a `SOLAPAS` con valores
   `auto` (lo escribió `inventariarSolapas`) / `seed` / `manual`. No dependas del texto
   de `notas`: es un campo libre que alguien va a editar.
2. **Regla de la siembra:** `SEED_SOLAPAS_` pisa las filas con `origen=auto` y **nunca**
   las que tengan `origen=manual`. Al escribir, deja `origen=seed`.
3. **Regla del inventario:** al hacer upsert, si la fila existe **no toca `uso` ni
   `origen`**, pase lo que pase. Solo actualiza `filas_datos`.
4. **Regla de la edición a mano:** cualquier fila cuyo `uso` alguien cambie a mano
   debería quedar `origen=manual`. Como Apps Script no lo detecta solo sin un
   `onEdit`, la salida simple es: **`origen=seed` también se pisa en una re-siembra**, y
   `manual` se pone a mano. Documentá esa asimetría en la cabecera de la hoja — quien
   quiera blindar una fila, escribe `manual`.
5. Volvé a correr la siembra y verificá que las 84 quedan con la clasificación de la
   Parte D del Paso 2.6.

**Test:** poner `origen=manual` y `uso=ignorar` en una fila cualquiera, re-sembrar, y
confirmar que esa fila **no cambió** mientras el resto sí.

**Salida esperada:** las nueve solapas que el motor necesita vuelven a `fuente`
(`rdv/RVD JM-CM - ES`, `rdv/RDV_otros_ministros`, las seis de `digital`, y la de `looker`
que decida la Parte D de este prompt).

→ **Commit A:** `Paso 2.7 ✅ — SOLAPAS: columna origen y siembra que pisa lo automático`

---

## Parte B — `digital/Digital/alcance` apunta a una columna de fechas

`DIAG_BASES` tipó `digital/Digital/alcance` (**columna E**) como `mixto`, con ejemplo
`"Thu Aug 29 2024 00:00:00 GMT-0300"`. Las otras dos filas de `MAPEO` que apuntan a la
misma columna E son `dig_fecha_inicio` y `fecha_periodo` — coherentes entre sí.
`alcance` no.

Sumar fechas **no lanza error**: devuelve un entero grande y plausible como cantidad de
alcance. Es el modo de falla caro.

1. Volcá el encabezado real de la columna E de `digital/Digital` y de las columnas
   vecinas.
2. Buscá dónde está el alcance de verdad en esa solapa. **Ojo:** ya existe
   `digital/Alcance/alc_alcance` mapeado aparte, así que la salida más probable es que
   la fila `digital/Digital/alcance` **sobre**.
3. **No la corrijas por tu cuenta.** Reportá el encabezado y la recomendación
   (corregir columna / eliminar la fila), y que decida el usuario.

→ **Commit B:** `Paso 2.7 ✅ — auditoría de digital/Digital/alcance (col E)`

---

## Parte C — ¿Por qué campo une `unirDigitalPorCuenta`?

`digital/Digital/clave` está mapeado a la **columna A**, y el ejemplo es
`"Ciudad Bilingue"` — un nombre de campaña. `dig_id_cuenta` está en la **T**, con
`"0637-OCTEDUCG"`. En las otras cinco solapas, el `id_cuenta` está en la **columna A**.

```bash
grep -n "resolverClave_\|clave\|id_cuenta" Union.gs Fuentes.gs
```

Contestar, sin corregir nada:

1. ¿`unirDigitalPorCuenta` une por `clave`, por `dig_id_cuenta`, o por otra cosa?
2. Si une por `clave` en `Digital` contra `*_id_cuenta` en las demás, **está comparando
   nombre de campaña contra código de cuenta**: nunca matchea, o matchea por casualidad.
   Eso explicaría un `sinLink` alto y encaja con el timeout de seis minutos —
   comparar cadenas largas 979 × 1297 veces es caro, y los nombres inconsistentes entre
   fuentes son justo lo que motivó la hoja `CAMPANAS`.
3. ¿`resolverClave_` usa el `campo_logico` literal `clave`? Si es así, las cinco solapas
   que tienen `*_id_cuenta` y no `clave` **no tienen clave resoluble** — verificá qué
   hace en ese caso.

**Reportá, no arregles.** El diagnóstico del timeout (Tarea 7 de AUD-1) sigue pendiente y
esto puede ser la causa; conviene resolverlos juntos.

→ **Commit C:** `Paso 2.7 ✅ — auditoría del campo de unión de digital (clave vs id_cuenta)`

---

## Parte D — `looker`: los 25 mapeos están partidos entre las dos solapas

En `MAPEO`, los 24 campos de `looker` cuelgan de **`resumen_metricas`** y `fecha_periodo`
cuelga de **`resumen_metricas_dinamico`**. Como los encabezados y los conteos son
idénticos (903 filas, mismo orden de columnas), no hay riesgo de leer la columna
equivocada — pero obliga a declarar `fuente` a las dos, que es exactamente lo que el
registro busca evitar.

1. **Test para decidir cuál:** `getFormulas()` sobre la fila 2 de cada una. La que tiene
   fórmulas es la derivada; la que tiene valores es la fuente.
   - Si **las dos** tienen valores planos, no hay vínculo entre ellas: la que no se
     refresque queda vieja **sin cambiar de forma ni de conteo**. En ese caso no lo
     decidas: hay que preguntarle al dueño (`dgples.comunicacion@gmail.com`) cuál
     actualiza. Reportalo y frená acá.
   - Chequeo barato de apoyo: comparar los valores de 3 o 4 `id_cuentas` entre las dos.
     Si ya difieren hoy, la pregunta es urgente.
2. Con la respuesta, mover las **25 filas** de `MAPEO` a esa solapa y marcar la otra
   `uso=derivada` en `SOLAPAS`.
3. Alinear `BASES.hoja_default` de `looker` con la elegida.
4. **Cerrar DOC-3 Parte A** dejando escrito el porqué: si gana `resumen_metricas`, la
   corrección que pedía DOC-3 se cancela y hay que decir por qué, o en dos meses vuelve
   a abrirse como pendiente.

→ **Commit D:** `Paso 2.7 ✅ — looker: mapeos consolidados en una sola solapa`

---

## Parte E — Los contadores no cierran

El resumen dice **"Solapas revisadas: 85"** y la línea de control **"84 vs. 84"**.
`SOLAPAS` tiene 84 filas. Uno de los dos contadores suma algo de más — probablemente el
encabezado, o una base contada dos veces.

Es menor, pero **la línea de control existe para detectar omisiones silenciosas**: si sus
propios números no cierran, deja de servir para lo que se creó. Arreglar y que los tres
totales coincidan.

→ **Commit E:** `Paso 2.7 ✅ — DIAG_BASES: contadores consistentes`

---

## Parte F — `tipo_esperado` en `MAPEO`

De los 35 avisos de tipo, la mayoría son correctos: `figura`, `barrio`, `status`,
`*_id_cuenta` **son** texto y así tienen que ser. Un aviso que salta 35 veces y casi
siempre no es nada entrena a la gente a ignorarlo — y el día que salte por algo real, no
lo va a ver nadie.

1. Columna nueva en `MAPEO`: `tipo_esperado` con valores `numero` / `texto` / `fecha` /
   vacío (= sin declarar, no se chequea).
2. `DIAG_BASES` avisa **solo cuando el tipo real difiere del declarado**. Lo no
   declarado sale en una sección informativa aparte, sin ⚠.
3. Sembrá `tipo_esperado` en las filas obvias: todo `*_id_cuenta`, `campana`, `figura`,
   `barrio`, `evento`, `status`, `eje`, `area` → `texto`; todo `fecha*` → `fecha`; todo
   lo que un marcador vaya a sumar (`*_enviados`, `*_clics`, `impresiones`, `alcance`,
   `inscriptos`, `asistentes`, …) → `numero`.

Con esto, el aviso de la Parte B —`alcance` tipado `mixto` cuando debería ser `numero`—
pasa a ser un ⚠ real en vez de uno entre treinta y cinco.

→ **Commit F:** `Paso 2.7 ✅ — tipo_esperado en MAPEO: avisos de tipo con señal`

---

## Prueba del usuario

1. **Parte A primero.** Re-sembrar y confirmar que `SOLAPAS` tiene la clasificación
   completa y que las nueve solapas del motor están en `fuente`.
2. Probar lectura por ventana → tiene que volver a funcionar (hoy da
   `«FALTA:…@solapa_no_fuente»`).
3. Poner una fila en `origen=manual`, re-sembrar, confirmar que no se pisó.
4. `DIAG_BASES`: los tres totales coinciden, y los ⚠ de tipo bajan de 35 a los que de
   verdad difieren de `tipo_esperado`.
5. Leer el reporte de las Partes B, C y D: son tres decisiones que quedan pendientes de
   tu confirmación, no correcciones aplicadas.

---

## Lo que sigue abierto

- **Timeout de `menuProbarUnionYAnclaje_`** (6 min, 30/07) — sin diagnosticar. Cruza con
  la Parte C.
- **¿Los números de una campaña que repite semana van acumulados?** Define si
  `Snapshot.gs` es obligatorio.
- **`m2`: cuál es la solapa de métricas.** Las dos `M2 periodo *` violan el criterio de
  fuente cruda y quedan en `revisar`; mientras tanto todos los tokens `m2_*` dan `FALTA`.
- **`m2` repite cinco nombres de solapa de `digital`** — cuál manda.
- **`firma_encabezado`** — columna reservada, sin implementar, va antes del 3-v2.
