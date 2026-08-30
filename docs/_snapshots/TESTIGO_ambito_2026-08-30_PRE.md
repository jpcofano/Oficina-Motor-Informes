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

### Predicción sobre disco — `Base_Looker_2026-08-30.xlsx` (`7272b383…40ae5b2`)

Universo de los ocho `imp_*`: `looker/DIGITAL`, **`filtro = estado=Activa`**, `periodo_ref` vacío
—o sea **sin ventana**—. De **5.149** filas, **720** tienen `estado=Activa`.

| | filas | meta | google | prog | **total** |
|---|---|---|---|---|---|
| **jm** (criterio actual, «JM» en el nombre) | 17 | 650.707 | 433.074 | 15.092.483 | **16.176.264** |
| **gcba** | 703 | 70.648.778 | 193.921.963 | 283.196.358 | **547.767.099** |

✅ **La identidad `meta + google + prog = total` cierra al dígito en los dos ámbitos.**

⛔ **Y una identidad que NO se puede exigir, con el motivo medido:**
`imp_meta + gcba_imp_meta = camp_meta_impresiones` **es falsa por diseño** — los `imp_*` llevan
`filtro = estado=Activa` y los `camp_*` **no llevan filtro**: 720 filas contra 5.149, un factor 13.
Escribirla habría dado ⛔ en las dos tomas y **habría parecido que el cambio rompió algo**. Los tres
`camp_*_impresiones` quedan como **canarios**, no como identidad.

---

## 3 · La toma real — **la llena el usuario**

Correr **`testigoDeAmbito()`** desde el editor de Apps Script y pegar el log acá **antes** de
aplicar la Parte B. Después de la Parte B se corre de nuevo, **en la misma sesión**, y va a
`TESTIGO_ambito_2026-08-30_POST.md`.

```
(pegar acá la salida de testigoDeAmbito() — toma ANTES)
```

⚠ **El intervalo corto es lo que hace que la comparación signifique algo:** `looker/DIGITAL` y el
desglose son **inestables por CAMBIO** (`R-31`), así que dos tomas separadas por horas no se pueden
restar. Por eso las dos van en la misma sesión.

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
