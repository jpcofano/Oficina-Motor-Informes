# MEDICIÓN — universo de Call Center sobre la base nueva · 2026-09-08

> **CONGELADO.** Evidencia fechada, uno nuevo por medición (`CLAUDE.md` §7). Nadie lo edita;
> si hace falta otra medición, se crea otro archivo.
>
> **Qué pregunta contesta:** qué universo de filas produce cada criterio de corte candidato sobre
> `Call Center - Métricas`, y cuánto se aleja de los dos números que el equipo ya publicó.
> **No dice cuál gana** — esa decisión es del usuario.

| | |
|---|---|
| **instrumento** | `medirUniversoCallCenterBaseNueva()` (`Auditoria.gs`), escrito por el `2026-09-07_2` |
| **fecha de LECTURA de la base** | **2026-09-08** |
| **fecha de lectura de la REFERENCIA externa** | **22/08/2026** — los dos números publicados vienen de `V-105` (deck del 31/07) y de `C-80` (deck de agosto), los dos medidos ese día. ⚠ No se releyó ningún deck para esta medición |
| **planilla** | `1f8Jy9S09EjWhXo-RF6llXnk8alQCJxWSZAdnfp3WR60`, solapa `Call Center - Métricas` |
| **filas de datos** | **1980** |

---

## ⛔ Alcance de este documento — leer antes que cualquier número

> ⭐ **AGREGADO EL 08/09, con el log completo en mano — leer esto ANTES de la tabla:** los
> **seis huecos que esta sección declara YA ESTÁN COMPLETOS**, en el **`ADDENDUM 1`, al final
> del documento**. La tabla de abajo **no se corrige y se deja como está**: es el registro de lo
> que se perdió cuando el log vivió sólo en una conversación, y borrarla borraría la evidencia
> de por qué existe este documento.

**Este `.md` es un volcado PARCIAL del log de la corrida.** El log completo quedó en la
conversación de claude.ai y **no llegó entero al repo**. Lo que sigue está declarado fila por
fila: lo volcado es lo que hay, y lo que falta se nombra.

| bloque del log | acá |
|---|---|
| forma de la solapa, censo de `Remitente`, formato de `Fecha` | ✅ completo |
| criterios **1, 2, 3 y 4** en las dos ventanas | ✅ completo |
| **criterios 5, 6, 7, 8 y 9** | ⛔ **NO ESTÁN** — se corrieron y sus cifras no llegaron al repo |
| **listas de cuentas por criterio** | ⛔ **NO ESTÁN**, salvo el conteo de cuentas distintas de 1–4 |
| sonda de `3488-AGOJDGAG`, fila por fila | ✅ completo |
| **sonda de `3289-JUNJDGAG`** | ⛔ **NO ESTÁ** |
| identidad de control `2+3+4 = 1` | ✅ completo, y **reverificada aritméticamente acá** |
| control positivo | ✅ su veredicto y su causa |

⚠ **Nada de lo que falta se completó de memoria ni se dedujo del prompt que encargó la corrida.**
Un censo parcial declarado sirve; uno completado de memoria es una estimación con formato de dato.

---

## 1 · Formato de `Fecha` (columna K)

**`Date` en las 1980 filas. Cero texto, cero vacías, cero que no parsee.**

⭐ Es la condición que `looker/CC` no cumplía y que cambia todo lo demás: esta solapa tiene
**columna temporal propia**, así que no necesita tomar la ventana prestada por pertenencia.

⚠ Y `R-02` **no se activa**: no hay período tipeado a mano ni ambigüedad de formato.

---

## 2 · Censo de `Remitente` (columna Q) — toda la solapa

| valor | filas |
|---|---|
| `GCBA` | 1400 |
| `JM` | 476 |
| `ANUNCIO` | 88 |
| *(vacía)* | 10 |
| `#N/A` | 5 |
| `No se activó` | 1 |
| **total** | **1980** ✅ |

**Seis valores distintos, no dos.** ⇒ **104 filas de la solapa no son `JM` ni `GCBA`.**

⭐ Esto es lo que justifica el corte **positivo por los dos lados** que decidió el usuario el
07/09: con `gcba = Remitente != JM`, esas 104 filas —incluidas las 5 de `#N/A` y las 10 vacías—
**caerían en GCBA y sumarían en silencio**. Con `= GCBA` quedan fuera de los dos ámbitos y se ven.

---

## 3 · La matriz — criterios 1 a 4, las dos ventanas

La ventana se aplica **por punto** sobre `Fecha` (`desde ≤ Fecha ≤ hasta`): con una sola columna
temporal no hay dos fechas que solapar, así que `R-16` no interviene.

### Ventana 24–31/07/2026

| # | criterio | filas | cuentas | `Base Barrida` |
|---|---|---|---|---|
| 1 | `Fecha` en ventana, sin otro corte | 20 | 13 | 29.739 |
| **2** | **`Fecha` en ventana + `Remitente = JM`** | **3** | **1** | **6.011** ⭐ |
| 3 | `Fecha` en ventana + `Remitente = GCBA` | 17 | 12 | 23.728 |
| 4 | **residuo** — ni `JM` ni `GCBA` | **0** | 0 | — |

### Ventana 14–20/08/2026

| # | criterio | filas | cuentas | `Base Barrida` |
|---|---|---|---|---|
| 1 | `Fecha` en ventana, sin otro corte | 13 | 9 | 20.175 |
| **2** | **`Fecha` en ventana + `Remitente = JM`** | **3** | **1** | **6.851** ⭐ |
| 3 | `Fecha` en ventana + `Remitente = GCBA` | 10 | 8 | 13.324 |
| 4 | **residuo** — ni `JM` ni `GCBA` | **0** | 0 | — |

### La identidad de control — `2 + 3 + 4 = 1`

**Cierra en las dos ventanas, en filas y en `Base Barrida`.** Reverificada sobre estos mismos
números al escribir este documento:

```
julio   filas:  3 + 17 + 0 =  20   vs criterio 1 =  20   ✅
julio   BB   :  6.011 + 23.728 + 0 = 29.739   vs 29.739  ✅
agosto  filas:  3 + 10 + 0 =  13   vs criterio 1 =  13   ✅
agosto  BB   :  6.851 + 13.324 + 0 = 20.175   vs 20.175  ✅
```

⚠ **El residuo da cero ACÁ, no siempre.** Las 104 filas que no son `JM` ni `GCBA` existen en la
solapa y simplemente **no caen en estas dos ventanas**. El corte positivo por los dos lados es lo
que las va a hacer visibles el día que caigan dentro — no es una precaución teórica.

### Contra la referencia externa

| ventana | publicado por el equipo | criterio 2 | |
|---|---|---|---|
| 24–31/07 | **6.011** (`V-105`, deck del 31/07) | **6.011** | ✅ reproduce |
| 14–20/08 | **6.851** (`C-80`) | **6.851** | ✅ reproduce |

⭐ **`6.851` es el número que hasta hoy ninguna regla escrita del repo reproducía.**

---

## 4 · La sonda — `3488-AGOJDGAG`, sin ventana

**Cuatro filas, no tres.**

```
Convocatoria       Fecha 2026-08-14   Base Barrida 6000
Confirmación       Fecha 2026-08-14   Base Barrida  802
IVR Convocatoria   Fecha 2026-08-14   Base Barrida   49
IVR Convocatoria   Fecha 2026-08-13   Base Barrida  245   ← FUERA de 14–20/08
```

```
6.000 + 802 + 49        = 6.851   ·  las filas con Fecha EN la ventana   → el deck
6.000 + 802 + 49 + 245  = 7.096   ·  las cuatro filas de la CUENTA       → C-69
```

⭐⭐ **La contradicción documental `7.096` vs `6.851` no era una contradicción: son dos preguntas
distintas.** `C-69` midió **por cuenta**; el deck publica **por fecha**. Los dos números son
correctos sobre su propio universo.

⛔ **`looker/CC` no podía distinguirlas** —no tiene columna temporal propia—, y por eso el repo
guardó los dos valores sin poder desempatarlos: `7.096` en `C-69` y `X-37` (cerrados), `6.851` en
`C-80` y `X-28` (no cerrados).

⚠ **`C-69` no se retracta.** Su medición sigue siendo correcta y su hallazgo central —que la cuenta
de la ventana de agosto es `3488` y no `3289`— no se toca. Lo que se agrega es **de qué universo es
cada número**.

⛔ **La sonda de `3289-JUNJDGAG` no llegó al repo**, así que la reconciliación equivalente del lado
de julio **no está medida acá**.

---

## 5 · El control positivo NO pasó — y por qué eso no invalida la matriz

El instrumento llevaba un control positivo: **el criterio 6 —el de los `imp_*`, por nombre— tenía
que traer `3289-JUNJDGAG` en la ventana de agosto**, porque eso es lo que `C-69` midió como el modo
de falla del corte por nombre.

**No lo trajo. Y no puede.**

⭐⭐ **`C-69` describe una entrada por PERTENENCIA:** `3289` es una cuenta de junio que caía en la
ventana de agosto porque su `fecha_fin` se extendía —es la deriva que midió `X-29` y que motivó
`R-30`—. Con **`Fecha` propia**, una fila del 27/07 no cae en `14–20/08` **por construcción**.

⇒ **El control positivo era un defecto de la fuente vieja usado como caso conocido, y quedó inerte
en cuanto el defecto dejó de existir.** Es exactamente la QUINTA lección de `CLAUDE.md` §4 —*el
control positivo de un detector no puede ser un defecto presente en los datos reales*— y esta vez
se cumplió el pronóstico: **el control se apagó justo cuando el sistema se arregló.**

⚠ **Esto se escribe como hallazgo de método, no como una disculpa.** Un control inerte que se lee
como *«falla»* manda a buscar un bug que no está — y el costo de eso ya está medido en este repo.

⛔ **Lo que queda abierto y no se resuelve acá:** este instrumento se quedó **sin control positivo
válido**. El sustituto tiene que ser **sintético** —darle al criterio un caso que no dependa del
estado de los datos— y eso es trabajo de otro prompt.

---

## 6 · Qué NO prueba esta medición

- ⛔ **Mide DEFINICIONES DE NEGOCIO, no el motor.** La base no está dada de alta y ningún marcador
  la toca. Que el criterio seleccione estas filas **no prueba que el motor las leería así**.
- ⛔ **El criterio 6 es MEDIA definición.** La pertenencia no es reproducible sobre esta solapa —no
  hay `fecha_inicio`/`fecha_fin` por cuenta ni solapa de cuentas de la que tomar la ventana
  prestada—, así que `R-30` no interviene y sólo se midió la mitad por nombre.
- ⛔ **Dos ventanas no discriminan entre criterios que en las dos coinciden.** En julio y en agosto
  hubo **una sola** cuenta de JM con call center, así que *«todo JM de la semana»* y *«la cuenta del
  encuentro»* **producen exactamente las mismas filas**. Es el mismo límite que el barrido de `X-28`
  ya había encontrado con 13 propiedades: *dos períodos no separan criterios que aciertan los dos*.
- ⛔ **`cc_campanias` NO queda validado por esta medición.** El criterio 2 da **3 filas** en julio y
  el deck publicó *«2 campañas»* (`V-105`). `C-62` dice que el conteo son **las filas con valores
  distintos de cero**, lo que reconciliaría — pero **el desglose fila por fila de julio no llegó al
  repo**, así que acá eso queda **sin medir**. Lo validado es `cc_base`, y sólo `cc_base`.
- ⛔ **Es una FOTO del 2026-09-08.** Responde por ese día. La solapa acumula.

---

# ⭐ ADDENDUM 1 — 2026-09-08, con el log entero de la corrida de las 05:57

> **Ni una línea del texto de arriba se altera.** Esto es un **addendum fechado**, la salida que
> `CLAUDE.md` §7 autoriza para un congelado — *«"No se edita" significa no alterar una línea del
> texto original, no que el documento quede mudo»*.
>
> **Qué completa:** los seis huecos que la tabla de alcance de arriba declaraba. Esa tabla **se deja
> como estaba a propósito**: es el registro de lo que se perdió cuando el log vivió sólo en una
> conversación, y borrarla borraría la evidencia de por qué existe este documento.

## ⭐⭐ Dos lecturas de la misma base con el mismo instrumento — y qué prueban exactamente

La medición corrió a las **00:26** y otra vez a las **05:57** del 08/09. **Salieron idénticas**:
mismas 1980 filas, mismo censo de `Remitente` en los seis valores, misma matriz en las dos
ventanas, misma sonda.

⛔ **Lo que eso NO prueba: que la base sea estable.** Cinco horas de la misma madrugada dicen que no
se movió **en esa ventana**, nada más. Y ya sabemos que **esta base se mueve**: la cuarta fila de
`3488` con fecha `13/08` no estaba en la lectura del 22/08 sobre `looker/CC`.

⭐ **Lo que sí prueban, y era la duda real: el instrumento es DETERMINISTA.** Dos corridas sobre la
misma entrada dan lo mismo ⇒ **una diferencia futura será de la base y no del método.** Es la
condición sin la cual comparar dos lecturas no significa nada.

## Resolución de columnas — las diez, por encabezado

Las diez columnas se resolvieron **por encabezado**, y **las diez cayeron en la letra que el prompt
`2026-09-07_1` declaraba**, sin una sola discrepancia:

```
✅ Campaña → A   ✅ Base Barrida → C   ✅ Tipo → I           ✅ Fecha → K
✅ Estado  → M   ✅ Área         → O   ✅ ID cuentas → P     ✅ Remitente → Q
✅ Tipo de llamado → R            ✅ Herramienta → V
```

⚠ **Eso valida las letras declaradas, no las convierte en el mecanismo.** El instrumento resuelve
por encabezado justamente para que un cambio de columna aparezca como aviso y no como número
movido.

## La matriz completa — los nueve criterios, las dos ventanas

### 24–31/07/2026 · 20 filas en ventana

| n | filas | cuentas | `Base Barrida` | criterio |
|---|---|---|---|---|
| 1 | 20 | 13 | 29.739 | `Fecha` en ventana, sin otro corte |
| **2** | **3** | **1** | **6.011** | **`Fecha` + `Remitente = JM`** |
| 3 | 17 | 12 | 23.728 | `Fecha` + `Remitente = GCBA` |
| 4 | 0 | 0 | *(sin_datos)* | residuo — ni `JM` ni `GCBA` |
| **5** | **3** | **1** | **6.011** | `Fecha` + `Remitente = JM` + `ID cuentas ~= JDGAG` |
| **6** | **3** | **1** | **6.011** | `Fecha` + `Campaña ~= JM` ⚠ *media definición* |
| **7** | **3** | **1** | **6.011** | `Fecha` + `ID cuentas ~= JDGAG` **solo** |
| 8 | 0 | 0 | *(sin_datos)* | `JDGAG` + residuo |
| 9 | 0 | 0 | *(sin_datos)* | `Remitente = JM` + `Campaña !~= JM` |

### 14–20/08/2026 · 13 filas en ventana

| n | filas | cuentas | `Base Barrida` | criterio |
|---|---|---|---|---|
| 1 | 13 | 9 | 20.175 | línea de base |
| **2** | **3** | **1** | **6.851** | **`Fecha` + `Remitente = JM`** |
| 3 | 10 | 8 | 13.324 | `Fecha` + `Remitente = GCBA` |
| 4 | 0 | 0 | *(sin_datos)* | residuo |
| **5** | **3** | **1** | **6.851** | `+ JDGAG` |
| **6** | **0** | **0** | *(sin_datos)* | `Campaña ~= JM` ⛔ **cero** |
| **7** | **3** | **1** | **6.851** | `JDGAG` **solo** |
| 8 | 0 | 0 | *(sin_datos)* | `JDGAG` + residuo |
| **9** | **3** | **1** | **6.851** | `Remitente = JM` + `Campaña !~= JM` |

### Las cuentas de cada criterio

**Julio** — criterio 1: `3144-JUNSALGC×3 · 3289-JUNJDGAG×3 · 3356-JULDHHGC×1 · 3380-JULJDGVC×1 ·
3387-JULJDGGC×4 · 3407-JULSALVC×1 · 3408-JULINFVC×1 · 3413-JULSEGVC×1 · 3414-JULSEGVC×1 ·
3415-JULSEGVC×1 · 3416-JULSEGVC×1 · 3418-JULDECVC×1 · 3425-JULJDGVC×1`.
Criterios **2, 5, 6 y 7**: `3289-JUNJDGAG×3`. Criterio 3: el resto. Criterios 4, 8 y 9: ninguna.

**Agosto** — criterio 1: `3426-JULFESGC×3 · 3488-AGOJDGAG×3 · 3524-AGODHHVC×1 · 3525-AGOJDGVC×1 ·
3526-AGOVINVC×1 · 3528-AGOSEGVC×1 · 3529-AGOSEGVC×1 · 3530-AGOSEGVC×1 · 3531-AGOSEGVC×1`.
Criterios **2, 5, 7 y 9**: `3488-AGOJDGAG×3`. Criterio 3: el resto. Criterios 4, 6 y 8: ninguna.

⭐ Y una que conviene mirar: `3387-JULJDGGC×4` está en julio con **cuatro** filas y **no es JM** —
es la cuenta que `C-15` dejó afuera por temario. El corte por `Remitente` la excluye sola.

## ⛔⛔ El hallazgo que la matriz completa agrega, y cambia lo que se puede afirmar

**Los criterios 2, 5 y 7 dan EXACTAMENTE lo mismo en las DOS ventanas.** O sea:

```
Remitente = JM                 ≡  Remitente = JM + JDGAG  ≡  JDGAG SOLO
3 filas · 1 cuenta · 6.011  (julio)        3 filas · 1 cuenta · 6.851  (agosto)
```

⇒ ⛔ **`ID cuentas ~= JDGAG`, SIN ningún `Remitente`, reproduce los dos números publicados.** Estas
dos ventanas **no prueban que el corte por `Remitente` sea necesario**: prueban que es *suficiente*,
y que hay al menos otro que también lo es.

⚠ **Esto no toca `V-126` ni `V-127`** —el criterio reproduce, y eso es lo que dicen—, pero **sí
acota lo que se puede decir de él**: hoy hay **tres criterios indistinguibles** sobre la evidencia
disponible, no un ganador.

⭐ **Los argumentos a favor de `Remitente` que sobreviven a esto son ajenos a estas dos ventanas**, y
conviene tenerlos escritos porque son los que decidirían:

- `R-15` — *el corte JM/GCBA es **una señal por canal***, y `Remitente` es una **columna explícita
  de ámbito**; `JDGAG` es una subcadena de un identificador.
- `X-28` ya lo advirtió: *«hay **124 cuentas JDGAG** con filas en CC; no señala al encuentro, lo
  recorta la ventana»* — o sea que `JDGAG` acierta acá por la ventana, no por sí mismo.
- El corte por `Remitente` da **`GCBA` positivo** y por lo tanto un **residuo visible**; `JDGAG` no
  tiene contraparte y su negación sería *«todo lo demás»*.

⛔ **La decisión es del usuario y este documento no la toma.**

## ⭐⭐ El corte por NOMBRE, medido en las dos direcciones

| | julio | agosto |
|---|---|---|
| criterio 6 · `Campaña ~= JM` | **3 filas · 6.011** ✅ | **0 filas** ⛔ |
| criterio 9 · `Remitente = JM` **y** `Campaña !~= JM` | **0 filas** | **3 filas · 6.851** |

**Son complementarios exactos**, y eso es `C-69` y `C-78` reproducidos sobre la fuente nueva: el
nombre de `3289` es `"Convocatoria: RDV - **JM** - Primera Persona + Paula"` y el de `3488` es
`"Convocatoria: RDV - Encuentro Temático \"Salud\""`, que **no dice JM**.

⇒ **El criterio 9 no está vacío en agosto, que es lo que había que verificar**: es exactamente lo
que el corte por nombre perdía, y es lo que el corte por `Remitente` gana.

## La sonda — las dos cuentas, fila por fila, sin ventana

```
3289-JUNJDGAG: 3 fila(s) · Base Barrida = 6011
   "Convocatoria: RDV - JM - Primera Persona + Paula   Fecha=2026-07-24  Remitente="JM"  BB=3000
   "Convocatoria: RDV - JM - Primera Persona + Paula   Fecha=2026-07-27  Remitente="JM"  BB=1726
   "Confirmación: RDV - JM - Primera Persona + Paula   Fecha=2026-07-27  Remitente="JM"  BB=1285

3488-AGOJDGAG: 4 fila(s) · Base Barrida = 7096
   "Convocatoria:     RDV - Encuentro Temático "Salud"  Fecha=2026-08-14  Remitente="JM"  BB=6000
   "IVR Convocatoria: RDV - Encuentro Temático "Salu    Fecha=2026-08-13  Remitente="JM"  BB= 245  ← FUERA
   "Confirmación:     RDV - Encuentro Temático "Salud"  Fecha=2026-08-14  Remitente="JM"  BB= 802
   "IVR Convocatoria: RDV - Encuentro Temático "Salu    Fecha=2026-08-14  Remitente="JM"  BB=  49
```

### ⭐⭐ La sonda de julio reconcilia el conteo de filas contra `looker/CC` — y al dígito

`V-105` midió sobre `looker/CC` que `3289` tiene **DOS** filas: `4726 + 1285 = 6011`.
La base nueva tiene **TRES**: `3000 + 1726 + 1285 = 6011`.

```
3.000 + 1.726 = 4.726        ← la «Convocatoria» única de looker/CC
```

⇒ ⭐ **`looker/CC` agrega por CAMPAÑA; la base nueva tiene una fila por FECHA DE ENVÍO.** Mismo
total, **otro grano**. No es una discrepancia: es la misma información a dos niveles, y explica sin
residuo por qué el conteo de filas difiere entre las dos fuentes.

⚠ **Y de ahí sale una consecuencia directa para `cc_campanias`, que el reporte anterior dejó como
falta:** un `CONTEO` de filas sobre la base nueva **NO puede reproducir** las *«2 campañas»* de
julio, porque hay tres filas. **Lo que la base nueva partió en dos, el deck lo cuenta como una.**

## ⚠ Una limitación del propio instrumento, que hay que decir antes de que alguien cuente sobre esto

**La sonda TRUNCA el nombre de campaña a 50 caracteres** (`…slice(0, 50)` en el código). En julio
las dos primeras filas se imprimen idénticas, pero **eso no prueba que sus valores completos lo
sean**: dos campañas que difieran después del carácter 50 se ven iguales acá.

⛔ **Por lo tanto, contar valores distintos de `Campaña` LEYENDO ESTA SONDA no es una medición.**
Lo que sugiere —2 distintos en julio, 3 en agosto, que serían exactamente los publicados— es una
**hipótesis**, y se mide aparte con el criterio corriendo sobre el valor completo.

## El control positivo — ahora con la causa medida, no inferida

El instrumento exigía que el criterio 6 trajera `3289` en **agosto**. **No lo trajo**, y el log
muestra por qué con todas las letras: **las tres filas de `3289` están fechadas `2026-07-24` y
`2026-07-27`**, así que no pueden caer en `14–20/08` bajo ningún corte por `Fecha`.

⭐ **Y el criterio 6 funciona perfecto donde puede: en julio trae `3289` con sus 3 filas y sus
6.011.** ⇒ Lo que falló no fue el criterio ni el instrumento: **la afirmación del control pedía un
artefacto que sólo la PERTENENCIA podía producir** —`3289` entraba a agosto por la deriva de
`fecha_fin` (`X-29`, `R-30`)— y con `Fecha` propia esa entrada no existe.

Es lo que ya quedó escrito en `C-109` y en la §5 de arriba; el log lo confirma en vez de deducirlo.

---

## Qué sigue faltando después de este addendum

- ⛔ **`cc_campanias`, `cc_contactados` y `cc_contact_pct` NO están medidos acá.** Esta corrida sólo
  midió `Base Barrida`. Los tres se miden con `medirCampaniasCallCenterBaseNueva()`.
- ⛔ **El valor completo de `Campaña` y de `Tipo de llamado`** — la sonda trunca y esta corrida no
  contó valores distintos de ninguna columna.
- ⛔ **Sigue sin control positivo válido.** El sustituto tiene que ser **sintético**.
