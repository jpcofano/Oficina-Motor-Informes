# TESTIGO de `DIMENSIONES_.ambito` — toma **ANTES** (Parte A del `2026-08-30_2`)

**Estado:** congelado. **Fecha:** 2026-08-30.
⚠ **Este archivo tiene DOS mitades y responden a preguntas distintas.** La §2 es una predicción
sobre disco; la §3 es la toma real y **la llena el usuario corriendo `testigoDeAmbito()`**.

⛔ **La toma que vale para comparar es la §3.** La §2 no la reemplaza: se mide sobre el fixture del
30/08, y `CLAUDE.md` §4 ya fija que un fixture responde *«¿esta definición produce este número?»* y
nunca *«qué dice la base hoy»*.

---

## 1 · El criterio vigente en el momento de la toma ANTES

Las seis entradas de `DIMENSIONES_.ambito` tal como están en `Fuentes.gs` antes de la Parte B:

| solapa | `jm` | `gcba` | |
|---|---|---|---|
| `looker\|DIGITAL` | `nombre_campaña~=JM` | `nombre_campaña!~=JM` | ⭐ **cambia** |
| `digital\|CAMPAÑAS_DESGLOCE_DIGITAL` | `des_campana_2~=JM \|\| des_campana_3~=JM` | `des_campana_2!~=JM && des_campana_3!~=JM` | ⭐ **cambia** |
| `looker\|resumen_metricas_dinamico` | `campana~=JM` | `campana!~=JM` | ⭐ **cambia** |
| `digital\|Directa IVR` | `ivr_vocero=JM` | `ivr_vocero!=JM` | no se toca |
| `digital\|Directa Mail` | `mail_remitente=jorge.macri@buenosaires.gob.ar` | `mail_remitente!=…` | no se toca |
| `rdv\|RVD JM-CM - ES` | `figura=Jorge Macri` | `figura!=Jorge Macri` | no se toca |

---

## 2 · ⭐⭐ El radio del cambio, MEDIDO — y una entrada que no mueve nada

Sobre `Motor_de_Informes_2026-08-30.xlsx` (`404cb943…2bdaddbc4`), hoja `MARCADORES`, 220 filas:

| | cuántos |
|---|---|
| marcadores que usan `ambito` en `dimensiones` | **42** |
| …de ellos, sobre las **tres solapas que cambian** | **10** |
| …sobre `looker\|DIGITAL` | 8 — los `imp_*` |
| …sobre `looker\|resumen_metricas_dinamico` | 2 — `frecuencia`, `gcba_frecuencia` |
| ⚠ …sobre `digital\|CAMPAÑAS_DESGLOCE_DIGITAL` | **0** |
| los otros 32, sobre solapas que **no** se tocan | `Directa IVR` 3 · `Directa Mail` 8 · `rdv` 21 |

⚠⚠ **La tercera entrada de la tabla del §1 del prompt no mueve un solo número hoy.** Es
**preparatoria**: se activa el día que los ocho `imp_*` terminen la mudanza al desglose que
`DIMENSIONES_` ya declara y `MARCADORES` todavía no. **Si algo del desglose se moviera con este
cambio, es un efecto no previsto y hay que parar** — para eso está `u1_total_impresiones` entre los
canarios.

### ⛔⛔ La predicción sobre disco falló, y el motivo es una premisa mía sobre el motor

**Escribí que, con `periodo_ref` vacío, los ocho `imp_*` leen la solapa entera con
`estado=Activa` — 720 filas de 5.149— y predije `jm 16.176.264` y `gcba 547.767.099`.**

⛔ **Falso. `periodo_ref` vacío NO significa «sin ventana».** La traza de la corrida real lo dice
en cada uno de los ocho: `2026-08-21–2026-08-27 (R-11 (calculado))`. **El motor calcula la ventana
igual** y recorta antes de filtrar: el universo son **304 filas**, no 720 ni 5.149.

| | predicho (disco) | real (corrida) | |
|---|---|---|---|
| universo | 720 filas | **304 filas** | `camp_dig_impl` = 304 |
| `imp_total` | 16.176.264 · 17 filas | **486.982 · 6 filas** | |
| `gcba_imp_total` | 547.767.099 · 703 filas | **147.753.414 · 191 filas** | |

⭐ **Es la forma exacta del error que `CLAUDE.md` §4 ya nombra —*«quién llama a lo que estoy
midiendo, y hace algo entre su retorno y el valor que se publica»*—** y esta vez el tramo salteado
no fue un llamador: fue **una premisa sobre el significado de una celda vacía**. Un `periodo_ref`
vacío se lee como *«este marcador no tiene período»* y significa *«usá el período de la corrida»*.

⚠ **Y no da un número más chico: da otro número.** 16 M y 487 K no se parecen, y los dos son
publicables. Por eso la §3 es la toma que vale y esta predicción **no la reemplazaba**.

---

## 3 · La toma real — `testigoDeAmbito()`, 2026-08-30T22:44:23Z

**Corrida completa en ~110 s** (18:22 murió en el muro; con el preámbulo de cachés copiado, entra).
`resolverMarcadores(jm) → 220 · ok=188 · sin_datos=31 · error=1`.

⚠ **Ventana efectiva: `2026-08-21 – 2026-08-27`**, calculada por `R-11` — **no** es
`2026_agosto_21_28`. Ver §5.

| marcador | valor | filas | nota |
|---|---|---|---|
| `imp_total` | **486.982** | 6/304 | |
| `imp_meta` | 125.176 | 3/304 | |
| `imp_google` | 19.483 | 2/304 | |
| `imp_prog` | 342.323 | 1/304 | |
| `gcba_imp_total` | **147.753.414** | 191/304 | |
| `gcba_imp_meta` | 26.411.030 | 55/304 | |
| `gcba_imp_google` | 28.694.520 | 47/304 | |
| `gcba_imp_prog` | 92.647.864 | 89/304 | |
| ⛔ `frecuencia` | **`sin_datos`** | **0/26** | el filtro `campana~=JM` no matchea ninguna fila |
| `gcba_frecuencia` | 6,265164242375123 | 26/26 | RATIO 13.682.724 / 2.183.937 |
| 🐤 `camp_dig_impl` | **304** | — | CONTEO de todas las filas de la ventana |
| 🐤 `camp_frecuencia` | 6,265164242375123 | — | RATIO 13.682.724 / 2.183.937 |
| 🐤 `u1_total_impresiones` | 302.528.441 | 317/317 | desglose |
| 🐤 `camp_meta_impresiones` | 43.904.278 | 96/304 | |
| 🐤 `camp_google_impresiones` | 38.873.525 | 77/304 | |
| 🐤 `camp_prog_impresiones` | 147.375.635 | 131/304 | |

✅ **La identidad interna cierra en los dos ámbitos**, al dígito:
`125.176 + 19.483 + 342.323 = 486.982` y `26.411.030 + 28.694.520 + 92.647.864 = 147.753.414`.

✅ **Y la decisión de NO exigir `jm + gcba = camp_*` queda confirmada con los números vivos:**
`125.176 + 26.411.030 = 26.536.206` contra `camp_meta_impresiones` **43.904.278** — porque son
**58 filas contra 96**: los `imp_*` llevan `estado=Activa` y los `camp_*` no. Escrita como
identidad, habría dado ⛔ en las dos tomas.

---

## 3 bis · ⛔⛔ Tres hallazgos de la toma que no estaban previstos

**1 · `frecuencia` publica `sin_datos` hoy, y no es culpa del criterio.** El filtro `campana~=JM`
sobre `nombre_campaña` (col B) da **0 de 26 filas** en la ventana. ⚠ **El cambio probablemente NO
lo arregle:** medido sobre `Base_Looker_2026-08-30.xlsx`, en la solapa entera los dos criterios se
solapan casi enteros —**75** filas con «JM» en el nombre, **67** con `JDGAG` en el id, **65** en
ambos—, así que **el cero es de la VENTANA, no del criterio**. Es una pregunta abierta propia:
*¿por qué no hay ninguna campaña de JM en la ventana de `resumen_metricas_dinamico`?*

**2 · `gcba_frecuencia` y `camp_frecuencia` valen exactamente lo mismo** —6,265164242375123— porque
`gcba` se lleva **26 de 26** filas. ⭐ **Eso los vuelve un discriminador fino para la segunda toma:**
si el criterio nuevo mueve aunque sea una fila a JM, `gcba_frecuencia` **tiene que separarse** de
`camp_frecuencia`, que no puede moverse. Si siguen idénticos, el cambio no tocó esa solapa.

**3 · `camp_dig_impl` y `camp_frecuencia` salen con «sin cuenta de filas legible»** — el helper no
sabe leer conteos de una traza de `CONTEO` ni de `RATIO` sin filtro. **No invalida sus valores**,
que están, pero el aviso aparece en el log y conviene no leerlo como un problema del cambio.

⚠ Y `resolverMarcadores` informa **`error=1`** sobre 220 marcadores. No es de los 16 del testigo
—los 16 resolvieron— pero **queda anotado**: es un marcador del informe que hoy falla y nadie lo
nombra.

---

## 4 · Cómo se lee la segunda toma

1. ⭐ **Canarios primero** — `camp_dig_impl`, `camp_frecuencia`, `u1_total_impresiones` y los tres
   `camp_*_impresiones` no llevan `ambito`. **Si alguno se movió, no fue el cambio: fue la fuente**,
   y nada de lo demás se puede leer.
2. ⚠ `u1_total_impresiones` además prueba que la entrada del **desglose es inerte**. Si se mueve,
   **parar**.
3. Los cuatro `imp_*` de JM **suben o quedan**. Si alguno baja, es un bug.
4. Los cuatro `gcba_imp_*` **bajan o quedan**. Si alguno sube, es un bug.
5. ⭐ **El par se mueve junto:** `gcba` es la **negación** de `jm`, así que una fila que entra a JM
   **sale** de GCBA. Un `imp_*` que sube con su `gcba_imp_*` hermano quieto significa que la fila
   entró sin salir de ningún lado.
6. `frecuencia` y `gcba_frecuencia` son `RATIO`: pueden moverse en cualquier dirección, porque
   cambian numerador y denominador a la vez.

⚠ **Lo que este testigo NO contesta:** si los valores nuevos son los **correctos**. Dice qué se
movió y hacia dónde. Que el corte agarre las campañas que corresponde lo dice el **conteo** contra
el tablero (Parte C) — y **las sumas no son criterio**: la lámina publica **acumulado** por decisión
del usuario del 30/08.

---

## 5 · ⚠⚠ La ventana de la toma NO es la de la Parte C

La corrida resolvió **`2026-08-21 – 2026-08-27`** por cálculo de `R-11`, mientras que la Parte C
manda correr con **`periodo_id = 2026_agosto_21_28`**, que es la ventana de la captura del tablero.

- ✅ **Para el par ANTES/DESPUÉS no es un problema:** la segunda toma va a resolver la misma ventana
  por el mismo camino, el mismo día, así que **las dos son comparables entre sí**.
- ⛔ **Pero los valores de esta toma NO son los que va a publicar la corrida de la Parte C**, que
  usa un día más. **No se pueden cruzar contra el tablero desde acá**, y ningún número de esta
  página es citable como «lo que publica la lámina».
