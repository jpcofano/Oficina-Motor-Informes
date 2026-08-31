# Medición — Parte C del `2026-08-30_2`: el corte anda, la solapa no

⭐⭐ **El titular, porque cambia qué es lo próximo que hay que hacer: el cableado del corte funciona,
y lo que separa a `L-031` del tablero NO es el corte ni la ventana ni el filtro de estado — es la
SOLAPA.** El mismo corte, sobre la misma ventana, medido en `digital|CAMPAÑAS_DESGLOCE_DIGITAL` en
vez de en `looker|DIGITAL`, pasa de **44,8 %** a **86,0 %** del tablero.

**Estado:** congelado. **Fecha:** 2026-08-30.
**Es la Parte C del** `docs/Prompts/2026-08-30_2_cablear_corte_id_cuentas.md`.
**Referencia externa:** `docs/_fixtures/Tablero_carga_21-28ago_lectura_2026-08-30_1800.png`, ventana
**21–28/08**, lectura consolidada.

---

## 0 · ⛔ La ventana es 21–28, y eso corrige lo que este repo escribió dos veces

**Decisión del usuario, 30/08:** `2026_agosto_21_28` es **lo que hizo el equipo el viernes pasado y
lo que muestra el tablero**. La corrida `jm-20260828-193948` usó esa ventana y **está bien**.

⛔ **Lo que NO coincide es `R-11`**, que calcula **vie–jue** y da `21–27`.

⭐ **Eso disuelve una contradicción que parecía real:** `gcba_frecuencia` dio **6,265** en el testigo
y **10,08** en el deck. **No eran dos valores del mismo número: eran dos ventanas.**

⚠ **Y la cuarta causa de `MEDICION_corte_id_cuentas` §7 quater quedó escrita al revés.** No es
«`21_28` no es una semana». Es: **`R-11` calcula una ventana que no coincide con la que el equipo
publica, y cuando el usuario elige explícitamente el motor la honra bien.** Si algo hay que revisar
es **el default de `R-11`**, no la elección. Corregido allá.

⛔ **También se cae la explicación retroactiva** que se había aceptado —*«que 21–27 puntuara mejor
contra el tablero, 12 de error contra 20, se explica porque era la ventana correcta»*—. **No era la
ventana correcta.** Vuelve a ser lo que era antes de darlo por resuelto: **un ajuste mejor sin causa
conocida**, y probablemente sobreajuste.

---

## 1 · El deck contra el tablero — ventana 21–28, corte `JDGAG`

| | Meta | Google | DV360 | **total** |
|---|---|---|---|---|
| **JM** — `L-031` sobre el tablero | 30,6 % | 41,7 % | 50,0 % | **44,8 %** |
| **GCBA** — `L-032` sobre el tablero | 107,1 % | 142,8 % | 145,8 % | **136,4 %** |

**JM se queda corto por más de la mitad. GCBA se pasa.** Y el sesgo de JM **no es parejo**: 30,6 %
contra 50,0 % entre plataformas.

---

## 2 · ⭐⭐ El mismo corte y la misma ventana, sobre el DESGLOSE

`digital|CAMPAÑAS_DESGLOCE_DIGITAL`, mismo corte `JDGAG`, misma ventana 21–28, `estado = ACTIVA`:

| JM | motor | tablero | |
|---|---|---|---|
| Meta | 1.921.633 | 2.254.346 | **85,2 %** |
| Google | 1.096.840 | 1.219.244 | **90,0 %** |
| DV360 | 5.911.534 | 6.907.699 | **85,6 %** |
| **TOTAL** | **8.930.007** | **10.381.289** | **86,0 %** |

⭐⭐ **86 % uniforme en las tres plataformas, contra el 44,8 % que publica el deck.**

**Y lo uniforme es el dato, no el 86.** Un sesgo **parejo en tres plataformas** no es ruido: si
faltara una campaña, o el corte agarrara mal, el faltante se concentraría en una celda. Repartido en
las tres por igual, lo que falta es **lo mismo en todos lados** — un rezago general de la fuente,
no un error de selección.

⇒ ⛔ **La diferencia no es el corte, ni la ventana, ni el filtro de estado. Es la SOLAPA.**
`looker/DIGITAL` es la **copia rezagada** —medido: **24 %** de atraso el 28/08, resuelto el 30— y
**los ocho `imp_*` leen de ahí**.

---

## 3 · Qué queda validado, y con qué evidencia

| pregunta | respuesta | de dónde sale |
|---|---|---|
| ¿El corte `JDGAG` selecciona bien? | ✅ **Sí** | el **diferencial**: 6 filas de 343, las seis `AGOJDGAG`, las seis POST del «1 a 1» y de RDV, y el corte acierta las seis |
| ¿El cambio conservó las filas? | ✅ **Exacto** | testigo ANTES/DESPUÉS: **+8 / −8** filas, **±4.166.021** impresiones, 197 en las dos tomas |
| ¿La brecha contra el tablero es del corte? | ⛔ **No** | mismo corte + misma ventana sobre otra solapa → **86 %** contra 44,8 % |
| ¿Es de la ventana? | ⛔ **No** | las dos mediciones de arriba usan **21–28**, la del tablero |
| ¿Es del filtro de estado? | ⛔ **No** | la del desglose lleva `estado = ACTIVA` igual |

---

## 4 · ⭐⭐ Lo que esto cambia en la lista de pendientes

**«La mudanza a medias de los ocho `imp_*`» deja de ser higiene documental.** Es **la mejora grande
que queda, y está medio construida**: `DIMENSIONES_` declara
`digital|CAMPAÑAS_DESGLOCE_DIGITAL` desde el 28/08 y `MARCADORES` **nunca se movió**.

⭐ **Mover esas ocho filas lleva `L-031` de 45 % a 86 % del tablero.** Es una edición de
configuración —ocho celdas de `base_id`/`solapa`—, no código.

⛔ **Y ojo con lo que NO arregla, para que nadie lo lea como que sí:** **GCBA se queda en ~209 %
sobre el desglose**, porque ahí sí pesa el **acumulado de campañas largas**. Eso es el **grano
temporal**, y ya está decidido: **la lámina publica acumulado y lo rotula** (decisión del usuario,
30/08). No es un defecto a corregir con un corte ni con una ventana.

---

## 5 · Lo que sigue

1. ⭐⭐ **La mudanza de los ocho `imp_*` al desglose** — prompt propio. **Vuelve a mover los dos
   números publicados**, así que va solo y con su testigo.
2. ⚠ **El default de `R-11`** — calcula vie–jue y el equipo publica vie–vie. No es un bug de la
   elección explícita, que funciona; es qué propone el motor cuando nadie elige.
3. ⚠ **El testigo no acepta período** y mide siempre el default de `R-11`, así que testigo y
   corrida pueden quedar en ventanas distintas **sin que nada avise**. Va a `PENDIENTES`.
4. ⛔ **El grano temporal** sigue siendo el límite de la fuente, no una causa de error.
5. ⛔ **`looker/DIGITAL` como copia rezagada** sigue abierta como causa de discrepancia en decks ya
   publicados — y la mudanza del punto 1 la esquiva sin resolverla.
