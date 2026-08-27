# TEMARIOS REALES — el tercero, y no se parece a ninguno de los dos anteriores · 27/08/2026

> **Estado: congelado.** Evidencia fechada. No se edita; si llega otro temario, entra uno nuevo.
>
> **Reemplaza a:** ninguno. `docs/TEMARIOS_reales_2026-08-25.md` sigue vigente — son los dos
> primeros y **no se contradicen**: se suman.
>
> ⛔⛔ **Por qué existe, y es el mismo motivo de método que fundó el del 25/08:** todo lo que el
> repo supone sobre el temario tiene que salir de **lo que llega**, no de lo que quedó cargado en
> la hoja `REUNIONES` — que es el **resultado de una adaptación manual**.

---

## ⭐⭐ El hecho de método, que vale más que los dos textos

**Llegó el tercer temario real y no tiene la forma de ninguno de los dos anteriores:**

| | forma |
|---|---|
| **25/08 · dos semanas** | `1) JM \| Uno a uno en Parque Avellaneda 12/08 (pre + post)` |
| **27/08 · ejemplo** | `> Status Cercanía y M2` · `1) JM \| …` · `> Campañas destacadas` · `> Otros temas` |
| **27/08 · REAL** | `Uno a uno en Coghlan (21/08)` · `Campaña Destacada` · `Operativo Movilidad Más Segura` |

⇒ **Ni `>`, ni `N)`, ni `|`, ni el plural son obligatorios.** Cualquier regla que exija uno de los
cuatro **falla el lunes siguiente**, y falla **escribiendo filas**, que es el modo caro.

---

## Los dos textos del 27/08, marcados

### ⭐ El temario REAL recibido

> **Esto es lo que llegó.** Es lo que se pegó en el asistente y lo que produjo el fallo.

```
Uno a uno en Coghlan (21/08)
Campaña Destacada 
Operativo Movilidad Más Segura
```

⚠ **Tres líneas, y ninguna trae marca de ningún tipo.** El título dice **`Campaña Destacada`** —
singular, y con un espacio al final.

### Un EJEMPLO que pasó el usuario

> ⚠ **No es un temario recibido: es una muestra de la forma que el usuario esperaría.** Se guarda
> marcado como ejemplo para que nadie lo cite como evidencia de qué llega.

```
> Status Cercanía y M2
1) JM | Uno a uno en Coghlan 21/08
2) JM | Encuentro Temático: Salud 25/08
4) M2 | Campañas y enviados de la semana
> Campañas destacadas
1) Operativo Movilidad Más Segura
> Otros temas
Reunión de gabinete
Varios
```

---

## Lo medido el 27/08 contra el código de ese día

### A.1 · El partidor se comía el contenido

`partirTemarioEnBloques_` decidía que una línea **sin `>`, sin `N)` y sin `|`, de menos de 60
caracteres, es un encabezado de bloque**. Contra el temario real:

```
bloques: 3
  [0] titulo="Uno a uno en Coghlan (21/08)"    con_marca=false  lineas=[]
  [1] titulo="Campaña Destacada"                con_marca=false  lineas=[]
  [2] titulo="Operativo Movilidad Más Segura"   con_marca=false  lineas=[]
```

⛔⛔ **Las tres líneas son títulos y ninguna es contenido.**

### A.2 · Y el bloque de campañas no se reconocía en singular

```
normalizar_('Campaña Destacada')   →  "campana destacada"
normalizar_(BLOQUE_CAMPANAS_)      →  "campanas destacadas"
esBloqueDeCampanas_({titulo: 'Campaña Destacada'})  →  false
```

⇒ El comparador pedía **igualdad**, así que el temario real **no traía campañas** para el motor.

### ⭐ A.3 · El separador ingenuo se dispara sobre una reunión

`4) M2 | Campañas y enviados de la semana` **es una reunión** —`Campañas y enviados de la semana`
está en `TIPOS_REUNION_CONOCIDOS_`— **y contiene «Campañas»**. Sin el `N) M2 |` adelante, su
normalizado empieza con `campan`.

⇒ Es lo que funda que, en el partidor nuevo, **una línea con `|` nunca sea separador**.

### A.4 · La fecha entre paréntesis se perdía

| línea | `nombre` | `fecha` | `notas` |
|---|---|---|---|
| `JM \| Uno a uno en Coghlan (21/08)` | `"en Coghlan"` | **vacía** | `"21/08 \| no se encontró fecha"` |
| `JM \| Uno a uno en Coghlan 21/08` | `"Coghlan"` | `2026-08-21` | (vacía) |
| `JM \| Uno a uno en Coghlan (21/08) (pre + post)` | **`"Coghlan ("`** | `2026-08-21` | (vacía) |
| ⭐ `Uno a uno en Coghlan (21/08)` | **vacío** | **vacía** | **`"no se pudo parsear"`** |

⇒ El paréntesis final se extraía **antes** de buscar la fecha, se miraba **uno solo**, y el recorte
del nombre vivía **dentro** de la rama `if (fecha)`. **La última fila es el temario real, y explica
el fallo entero.**

### ⛔⛔ El hallazgo que no se estaba buscando: las tres líneas colapsaban en UNA

Las tres líneas del temario real dan **la misma `claveReunion_`** —todos los campos vacíos:

```
"2026_agosto_21_27||||||||"   ×3
```

⇒ El dedupe de `separarReunionesNuevas_` colapsaba **tres líneas en una fila**: `agregadas: 1`,
`sinParsear: 3`. **Dos líneas se perdían como «ya estaba».**

⚠ **La colisión existía con `eje` adentro de la clave**, así que **no la causa** habérselo sacado
(`D-46`). Quien lea el gate `A.7` tiene que saberlo o va a atribuir al cambio una colisión anterior.

---

## Los dos gates, contra la hoja VIVA · 27/08 16:55

> ⭐ Corridos con `verificarGatesDelTemario()` (`Auditoria.gs`), **sólo lectura**. El snapshot más
> reciente en disco era del **26/08** — anterior a las filas que causaron el fallo — así que un
> gate contra esa foto habría sido otra medición.

| gate | resultado |
|---|---|
| **A.7** · la clave sin `eje` no colisiona | ✅ **11 claves con `eje` · 11 sin `eje` · sobre 11 filas.** Cero colisiones |
| **A.8** · `texto_original` sirve de filtro | ✅ **0 filas con `texto_original` vacío**, y 0 de ésas con `mostrar` |
| **A.9** · estado de la hoja | **0 filas con `eje` vacío.** `junio_sem2` 5·0·4 · `agosto_14_20` 2·0·2 · `julio_24_30` 4·0·4 |

⚠ **Y un dato que conviene tener escrito:** las 11 filas son **exactamente** las del snapshot del
26/08 — **no hay ninguna fila del período `2026_agosto_21_27`**. Las que el asistente escribió el
27 ya no están en la hoja.

---

## Cómo se usa esta evidencia

**Se cita, no se interpreta de nuevo.** Cualquier afirmación sobre *«qué trae el temario»* se
verifica contra este archivo y contra el del 25/08, **no** contra `REUNIONES`.

⚠ **Y envejece como cualquier medición:** son **tres** semanas. Que ninguna de las tres tenga la
misma forma no prueba que no exista una cuarta forma — prueba que **exigir cualquiera de las cuatro
marcas es exigir algo que un temario real ya incumplió**.
