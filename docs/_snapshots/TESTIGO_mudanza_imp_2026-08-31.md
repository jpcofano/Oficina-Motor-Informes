# TESTIGO de la mudanza de los ocho `imp_*` al desglose — toma DESPUÉS

**Estado:** congelado. **Fecha:** 2026-08-31. **Parte C del** `2026-08-31_1`.
**Ventana de la toma:** `2026-08-21 → 2026-08-27` — el **default de `R-11`**.

⚠ **La ventana del equipo es `21–28`, así que esta toma no es la comparación final.** Sirve para
los **controles** —que son internos y no dependen de la ventana— y para el orden de magnitud. La
comparación contra el tablero es la corrida con `2026_agosto_21_28`, todavía pendiente.

---

## 1 · ⭐⭐ El conteo cerró — que era el criterio

| JM | impresiones | filas | tablero |
|---|---|---|---|
| Meta | 3.709.430 | **10** | 10 |
| Google | 1.946.475 | **9** | 10 |
| Programmatic / DV360 | 10.608.520 | **9** | 9 |
| **TOTAL** | **16.264.425** | **28** | **29** |

⭐ **10/9/9 contra 10/10/9.** Falta **una fila de Google**, y es **la misma que falta desde la
primera medición del corte** el 30/08 — no es un efecto de la mudanza.

**Y las sumas dan de más, uniforme:** **165 % · 160 % · 154 %** contra el tablero.

⭐⭐ **Las dos cosas son lo que la decisión predice, y hay que leerlas juntas:**

- **Uniforme** es la señal buena — acumulado parejo en las tres plataformas, **no** error de
  selección, que se concentraría en una celda.
- **Que den de más** es exactamente lo que la decisión del 30/08 anticipa: la lámina publica
  **acumulado** porque la fuente no tiene grano semanal.
- ⛔ **Si hubieran cerrado al 100 % habría que haber parado** — significaría que la fuente tiene un
  grano que la medición no encontró.

---

## 2 · Los controles, todos pasan

| control | resultado |
|---|---|
| identidad `meta + google + prog = total` | ✅ cierra en los **dos ámbitos** y en las **dos tomas** |
| `camp_dig_impl` | ✅ **304**, quieto |
| `u1_total_impresiones` | ✅ **303.000.546**, quieto |
| `camp_google_impresiones` · `camp_prog_impresiones` | ⚠ **+276.694** y **+20.030** |
| `frecuencia` | ✅ sigue en `sin_datos` |
| `gcba_frecuencia` vs `camp_frecuencia` | ✅ **idénticos** (6,287895…) |
| las 2 filas con `Id cuentas` vacío | ✅ caen en **GCBA por negación**, visibles en la traza |

⭐ **Los dos `camp_*` que se movieron NO son una alarma: no llevan `ambito`**, así que el cambio no
los podía tocar. Es **deriva de la fuente**, que es lo que `R-31` mide para esa solapa.

⭐ **`frecuencia` y `gcba_frecuencia` quietos son el control de que la mudanza NO tocó
`resumen_metricas_dinamico`**, que es lo que correspondía: esa solapa no estaba en el cambio.

⭐⭐ **Y las dos filas sin `Id cuentas` cayendo en GCBA por negación es `D-33` funcionando y a la
vista.** No quedaron afuera de los dos ámbitos: cayeron en uno, **y la traza lo dice**. Es la
diferencia entre un caso borde absorbido y uno declarado.

---

## 3 · ⭐ La relectura de la hoja, y por qué hace citable este resultado

El wrapper informó **32 celdas escritas** y después **releyó `MARCADORES`** para verificar que las
ocho filas quedaran como se pidió, `filtro` vacío incluido.

⛔ **Sin esa relectura, «32 celdas escritas» y «las 8 quedaron» son la misma afirmación hecha dos
veces por el mismo camino** — el retorno del escritor no verifica la hoja, informa la intención.

⭐ **Escribir y releer por caminos distintos es el segundo lector aplicado a una escritura**, y acá
el riesgo concreto era el **vaciado**: una celda que conservara el `filtro` viejo **publicaría el
número anterior sin fallar**. La lección quedó en `CLAUDE.md` §4.

---

## 4 · Lo que falta para cerrar

**La corrida con `2026_agosto_21_28`** —la ventana del equipo— contra
`Tablero_carga_21-28ago_lectura_2026-08-30_1800.png`, con el conteo por plataforma.

**Si JM da cerca de 29 filas con las sumas por encima, cierra.**
