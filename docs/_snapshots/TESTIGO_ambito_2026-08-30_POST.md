# TESTIGO de `DIMENSIONES_.ambito` — toma **DESPUÉS** (Parte B del `2026-08-30_2`)

**Estado:** congelado. **Fecha:** 2026-08-30.
**Par de** [`TESTIGO_ambito_2026-08-30_PRE.md`](TESTIGO_ambito_2026-08-30_PRE.md) — misma sesión,
mismo día, misma ventana calculada por `R-11` (**2026-08-21 → 2026-08-27**).

⚠ **Esta página se armó del reporte de la corrida, no del log crudo.** Los valores del par
`imp_total`/`gcba_imp_total`, los deltas por plataforma y los canarios están verificados; **el
detalle por plataforma en impresiones no está en mano** y queda pendiente de pegar el log.

---

## 1 · El criterio nuevo

| solapa | `jm` | `gcba` |
|---|---|---|
| `looker\|DIGITAL` | `ldig_id_cuenta~=JDGAG` | `ldig_id_cuenta!~=JDGAG` |
| `digital\|CAMPAÑAS_DESGLOCE_DIGITAL` | `des_id_cuenta~=JDGAG` | `des_id_cuenta!~=JDGAG` |
| `looker\|resumen_metricas_dinamico` | `id_cuenta~=JDGAG` | `id_cuenta!~=JDGAG` |

Las otras tres entradas, sin tocar.

---

## 2 · ⭐⭐ El resultado principal: CONSERVACIÓN EXACTA

| | ANTES | DESPUÉS | Δ |
|---|---|---|---|
| `imp_total` | 486.982 · **6** filas | **4.653.003** · **14** filas | **+4.166.021** · **+8** |
| `gcba_imp_total` | 147.753.414 · **191** filas | **143.587.393** · **183** filas | **−4.166.021** · **−8** |
| **total de filas** | **197** | **197** | **0** |

**Por plataforma, el mismo signo y la misma cuenta:** meta **+3 / −3** · google **+2 / −2** ·
prog **+3 / −3**. Suman los ocho.

⭐⭐ **Ninguna fila se creó ni se perdió, y las impresiones se movieron al dígito: `+4.166.021` a
JM son exactamente `−4.166.021` de GCBA.** Es **lo único que una negación puede hacer** —`gcba` es
`!jm`, así que una fila que entra a JM tiene que salir de GCBA— y es lo que la **regla 5** del
testigo pedía comprobar.

⭐ **Y esto no depende de que la fuente esté quieta**, que es lo que lo vuelve el resultado
principal: los dos lados se miden **dentro de la misma toma**. Es la forma que `CLAUDE.md` §4
prefiere —*dos marcadores que comparten camino y difieren sólo en el corte*— usada acá para probar
que el corte nuevo **no inventó ni perdió filas**.

**Reglas 1 a 4 y 6:** los cuatro `imp_*` suben, los cuatro `gcba_imp_*` bajan, la identidad
`meta + google + prog = total` cierra en las **dos** tomas, y los `RATIO` se comportan como se
esperaba.

---

## 3 · ⛔ Un canario SÍ se movió — y qué invalida y qué no

| canario | ANTES | DESPUÉS | |
|---|---|---|---|
| `u1_total_impresiones` | 302.528.441 | **303.000.546** | ⛔ **+472.105 · +0,156 %** |
| los otros cinco | — | idénticos al dígito | ✅ |

**No es «los seis canarios quietos».** `u1_total_impresiones` se movió.

✅ **Lo que NO invalida, y es casi todo:** la conservación de §2 es una identidad **interna a la
toma DESPUÉS** —compara JM contra GCBA del mismo momento—, así que la deriva de la fuente **no la
toca**. El resultado principal se sostiene entero.

⭐ **Lo que sí dice:** el desglose se movió entre las dos tomas. Es exactamente lo que `R-31` mide
para esa solapa —**inestable por CAMBIO**— y por eso el par se corrió en la misma sesión.

⛔⛔ **Y lo que corrige, que es un defecto de diseño MÍO en el testigo.** El PRE dice:
*«`u1_total_impresiones` además prueba que la entrada del DESGLOSE es inerte. Si se mueve,
PARAR.»* **Eso está mal y la instrucción de parar no corresponde.**

- `u1_total_impresiones` tiene `dimensiones` **vacío**: no usa `ambito`. **El cambio no lo podía
  mover ni aunque la entrada del desglose estuviera activa.** Es **insensible por construcción** a
  la pregunta que le pedí contestar.
- ⭐ Es la familia que `CLAUDE.md` §4 ya nombra: ***un testigo que no mide el cambio no es testigo
  del cambio, por más que dé verde*** — y acá ni siquiera dio verde, dio movimiento, que es lo que
  destapó el error de diseño.
- ✅ **La inertness de la entrada del desglose sigue en pie, pero apoyada en la MEDICIÓN DE
  CONFIGURACIÓN, no en este canario:** de los **42** marcadores que usan `ambito`, **cero** están
  sobre `digital|CAMPAÑAS_DESGLOCE_DIGITAL`. Eso se mide en `MARCADORES`, no en una corrida.
- ⚠ **Para medirlo con un testigo haría falta un marcador CON `ambito` sobre esa solapa, y no
  existe ninguno.** La pregunta es **estructuralmente incontestable** desde una corrida hasta que
  los ocho `imp_*` se muden.

---

## 4 · ⭐ El control positivo dio NEGATIVO, y eso CIERRA la pregunta de `frecuencia`

| | ANTES | DESPUÉS |
|---|---|---|
| `gcba_frecuencia` | 6,265164242375123 · 26/26 | **6,265164242375123** · 26/26 |
| `camp_frecuencia` | 6,265164242375123 | **6,265164242375123** |
| `frecuencia` | `sin_datos` · `campana~=JM` → 0/26 | **`sin_datos`** · `id_cuenta~=JDGAG` → **0/26** |

**Los dos siguen idénticos al dígito, y `frecuencia` sigue vacía.**

⭐⭐ **Eso no es un resultado nulo: es la respuesta.** El control estaba escrito así —*si el criterio
nuevo mueve una sola fila a JM, tienen que separarse*—, y **no se separaron**. Con **dos criterios
independientes** —el nombre y el `Id cuentas`— dando **cero sobre las mismas 26 filas**, la
conclusión ya no es una hipótesis: **el cero es del DATO, no del criterio.** No hay campaña de JM en
esa ventana de `resumen_metricas_dinamico`.

**Y las dos observaciones se confirman entre sí:** `frecuencia` en `sin_datos` y los dos `RATIO`
idénticos dicen lo mismo por caminos distintos.

⛔ **Pero deja una pregunta NUEVA, y se anota en vez de absorberse.** En la **misma ventana**:

| solapa (misma base `looker`) | filas de JM |
|---|---|
| `DIGITAL` | **14** |
| `resumen_metricas_dinamico` | **0** de 26 |

**Son dos solapas de la misma base.** O **no cubren el mismo universo**, o **una de las dos no se
está actualizando**. Va a `PENDIENTES` como pregunta propia: **no bloquea el cableado**, pero
`frecuencia` va a seguir vacía hasta que se conteste.

---

## 5 · ⚠ Lo que estos conteos NO son

**Los conteos de esta toma —6/4/4 y luego 14 sobre `looker/DIGITAL` con `estado=Activa`— NO son
los que se comparan con el tablero.** Son otro universo: otra solapa que la del desglose, y con
filtro de estado.

⛔ **La comparación que vale es la de la Parte C**, con la corrida del informe sobre
`2026_agosto_21_27` y contra la lectura **consolidada** del tablero
(`Tablero_carga_21-28ago_lectura_2026-08-30_1800.png`). Ningún número de esta página es citable
como «lo que publica la lámina».
