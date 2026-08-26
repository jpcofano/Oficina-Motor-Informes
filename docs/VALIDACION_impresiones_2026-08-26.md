# VALIDACIÓN — IMPRESIONES: por evento, en el Resumen Ejecutivo, y contra el deck del equipo

> **Congelado.** Nadie lo edita: si hay una medición nueva, se crea otro (`CLAUDE.md` §7).
>
> Sesión del **26/08/2026**. Material: los fixtures `Informe 2026-07-31.zip`
> (`sha256 97310e16f49d2726…`) y `Seguimiento Digital  2026-08-20.zip`
> (`sha256 f8ef3227fc6cc73e…`), **los dos verificados contra `docs/_fixtures/README.md`**, con los
> decks del equipo que viajan adentro de cada uno.
>
> Instrumentos: `tools/medir-impresiones-reuniones.py` y `tools/medir-impresiones-resumen.py`.
>
> **Reemplaza a nada.** Es el primero que mide impresiones **en los dos granos a la vez** —un
> encuentro y el agregado— y ésa es toda la razón de que exista: los defectos que encontró **sólo
> se ven cruzando los dos**.

---

## 0. Titular

⛔⛔ **El agregado `imp_*` de `agosto_14_20` está construido casi enteramente con campañas de
semanas anteriores, y NO incluye los dos encuentros de esa semana.** Tres cuentas entran, dos son
viejas y aportan el **98–100 %**; los dos encuentros del temario quedan afuera.

⭐ **Y el mecanismo de lectura está bien.** Eso está probado por separado y es lo que permite
localizar el defecto en el **universo** y no en el cálculo.

⚠ **La consecuencia que hay que leer antes que los números:** que `imp_meta` diera **+8,7 %** y
`imp_google` **+7,3 %** contra el deck **es una coincidencia de magnitud, no un acierto**. Son
acumulados de campañas equivocadas que por tamaño se parecen a lo que el equipo publica. Es *el
número correcto que sale de las filas equivocadas*, el modo de falla que `CLAUDE.md` §4 llama el
peor de este repo.

---

## 1. Lo que CIERRA

### 1.1 · Las tres fuentes registradas coinciden AL DÍGITO

Para `3487-AGOJDGAG` (Parque Avellaneda, encuentro del 12/08), export del 20/08:

| fuente | Meta | Google | Programmatic |
|---|---|---|---|
| `reuniones/Agenda JM` + `Agenda JM \| Post` | 140.193 | 132.310 | **122.177** |
| `digital/CAMPAÑAS_DESGLOCE_DIGITAL` | 140.193 | 132.310 | **122.177** |
| `looker/DIGITAL` | 140.193 | 132.310 | **122.177** |

⭐ **Las tres, idénticas en las tres plataformas.** `Agenda JM*` no es una fuente independiente: es
el mismo dato. Esto contesta la pregunta *«¿el número del desglose es el mismo para Programmatic?»*
— **sí, exactamente el mismo**.

### 1.2 · Las identidades internas cierran

- `Impresiones totales = Meta + Google + Programmatic` en `Agenda JM | Post`: **66 de 66** filas.
- `Visualizaciones totales = Meta + Google + Programmatic`: **66 de 66**.
- Para `3487`: PRE `65.554 + 0 + 86.572 = 152.126` · POST `74.639 + 132.310 + 35.605 = 242.554`.

### 1.3 · Por evento cierra contra el deck donde la campaña TERMINÓ

| `3487-AGOJDGAG` | fixture 20/08 | deck ~21/08 | |
|---|---|---|---|
| PRE Meta · impresiones | **65.554** | **65.554** | ✅ exacto |
| POST Meta · impresiones | 74.639 | 86.572 | +16 % |

El encuentro fue el **12/08**: la PRE ya estaba cerrada → cierra al dígito. La POST seguía corriendo
→ el deck, armado un día después, tiene más.

⭐ **La progresión de tres puntos lo confirma:** POST Meta va **74.639** (20/08) → **86.572**
(deck ~21/08) → **126.323** (hoja viva 26/08). Monotónica.

⚠ **Trampa descartada:** `86.572` es **también** `Impresiones Programmatic` de la fila PRE. Con dos
mediciones, *«el deck tomó la columna equivocada»* era indistinguible de *«creció»*. **Hizo falta la
tercera.**

### 1.4 · El instrumento reproduce los casos validados

Con `MARCADORES.filtro = estado=Activa` aplicado, el agregado de julio da
**679.647 · 614.140 · 5.992.841**, que son `A-01`, `A-06` y `A-07` **al dígito, 3 de 3**.

⇒ **La pertenencia, el tope de `R-30`, el corte `ambito` y la partición por plataforma hacen lo que
dicen.** El mecanismo no es el problema.

---

## 2. Lo que NO cierra, y por qué

### 2.1 · El universo del agregado: dos defectos que se suman

`agosto_14_20`, `ambito=jm`, filas `Activa` en la ventana. **Entran tres cuentas:**

| cuenta | encuentro | aporta | ¿es de la semana? |
|---|---|---|---|
| `3289-JUNJDGAG` | Primera Persona · Pareto · **27/07** | 7.814.527 | ⛔ **no** |
| `3440-JULJDGAG` | 1 a 1 · Almagro · **6/8** | 4.995.762 | ⛔ **no** |
| `3527-AGOJDGAG` | 1 a 1 · Coghlan · 18/8 | 43.142 | ✅ sí |

**Reparto del total por plataforma:**

| | total medido | de `3289`+`3440` | resto |
|---|---|---|---|
| Meta | 2.356.225 | 2.317.921 (**98,4 %**) | 38.304 |
| Google | 972.243 | 967.405 (**99,5 %**) | 4.838 |
| Programmatic | 9.524.963 | 9.524.963 (**100 %**) | 0 |

**Defecto A — entran campañas viejas con su acumulado entero.** `looker/DIGITAL` guarda el
acumulado de campaña; la ventana por **solape** trae la campaña completa si sigue corriendo durante
la semana. `3289` dura 34 d y `3440` 22 d: **el tope de `R-30` (90 d) no las toca**, porque se
diseñó para campañas genéricas de siete meses.

**Defecto B — NO entran los encuentros de la semana.** `ambito=jm` se resuelve por
`nombre_campaña ~= JM`, y el equipo escribe ese nombre a mano sin convención:

| cuenta | `nombre_campaña` | cae en |
|---|---|---|
| `3289-JUNJDGAG` | `PRIMERA PERSONA \| JM \| PAULA PARETTO 27/7` | jm ✅ |
| `3440-JULJDGAG` | `1 a 1 JM \| Almagro 6/8` | jm ✅ |
| `3527-AGOJDGAG` | `1 A 1 JM \| 18/8 COGHLAN` | jm ✅ |
| ⛔ `3487-AGOJDGAG` | `1 a 1 \| Parque Avellaneda Miércoles 12` | **GCBA** |
| ⛔ `3488-AGOJDGAG` | `TE CUENTO \| SALUD Eje Sur Viernes 14/8` | **GCBA** |

**Los dos encuentros del temario de `agosto_14_20` se clasifican como GCBA.** El ID de cuenta
(`JDGAG`) sí es consistente; el nombre no.

⚠ **Y resolver por ID NO arregla el número — lo empeora**, medido: pasa de +178,9 % a +207,9 % en
Programmatic. **Son dos defectos independientes** y el defecto A domina. Corregir sólo B publicaría
un número más grande y más equivocado.

### 2.2 · Los ocho `imp_*` contra el deck

| marcador | julio_24_30 | agosto_14_20 |
|---|---|---|
| `imp_meta` | −5,2 % | +8,7 % |
| `imp_google` | +15,6 % | +7,3 % |
| `imp_prog` | +15,4 % | **+178,9 %** |
| `imp_total` | +13,1 % | **+98,1 %** |
| `gcba_imp_meta` | +58,5 % | +2,3 % |
| `gcba_imp_google` | +208,5 % | +81,6 % |
| `gcba_imp_prog` | +92,4 % | +84,9 % |
| `gcba_imp_total` | +95,0 % | +59,2 % |

⛔ **Ninguno de estos porcentajes se puede leer como «se acerca» o «se aleja».** §2.1 muestra que
están calculados sobre **otras filas**, así que un desvío chico no es un acierto parcial.

### 2.3 · El Programmatic del deck no sale de ninguna fuente registrada

Para `3487`, el deck publica **377.997** impresiones Programmatic PRE+POST. Las tres fuentes dan
**122.177**. **Factor 3,1.** No es acumulación —las tres coinciden y están acotadas— así que el
`377.997` sale de un universo que el repo no tiene registrado. **Queda abierto.**

---

## 3. Lo que este informe corrige de lo escrito antes

⛔ **«Programmatic sigue acumulando» — impreciso, y en la parte que importa, falso.** A nivel de
cuenta las tres fuentes dan el número acotado y coinciden. Lo que acumula no es la columna: es que
**el agregado trae campañas viejas enteras**. Afecta a las **tres** plataformas (98 % / 99,5 % /
100 %); Programmatic sólo es donde más se nota por volumen.

⛔ **Y por eso la decisión de sacar el `_revisar` a `imp_meta` e `imp_google` quedó sin base.** Se
tomó con el criterio *«son los que dan»*, y §2.1 muestra que **dan por casualidad**: su universo es
el mismo universo equivocado que el de `imp_prog`. **Recomendación: volver a marcarlos** con
`marcarProgrammaticARevisar()`, que repone los ocho.

---

## 4. Qué haría falta para cerrar esto

1. **Que `ambito` deje de resolverse por el nombre de campaña.** El ID de cuenta es consistente y el
   nombre no. ⚠ Pero por sí solo **empeora** el número: hay que hacerlo junto con lo de abajo.
2. **Que la ventana no traiga el acumulado entero de una campaña vieja.** `R-30` acota por duración
   y estos casos duran 22 y 34 días: el tope no aplica. Hace falta otra cosa — recorte por fecha de
   la fila, o un grano temporal que `looker/DIGITAL` hoy no tiene.
3. **Averiguar de dónde sale el `377.997`** del deck, que no reproduce ninguna fuente registrada.

⚠ **Ninguna de las tres se puede hacer sin decisión del usuario**, y las dos primeras **mueven
números publicados en dos láminas**.

---

## 5. Lo que este informe NO contesta

- **Qué dice la base hoy.** Son los exports del 31/07 y del 20/08.
- **Qué ranuras tomó el deck del motor**: acá se filtró por fecha; el motor ancla por `id_cuenta`.
- **El detalle por evento de julio** sale del export del **20/08**, no del de su semana: ese `.zip`
  **no trae `reuniones`**. Lleva tres semanas más de acumulación encima.
- **Si el deck del equipo es correcto.** Un deck del equipo no es una foto de la base: el equipo
  poda y reescribe (`X-18`).
