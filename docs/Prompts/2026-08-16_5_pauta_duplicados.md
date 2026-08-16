# 2026-08-16_5 — Los tres pares `pauta_*`: un número publicado dos veces

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único: medir qué publica cada uno de los seis y en qué lámina, y determinar cuál de
> las tres explicaciones es la correcta.** Nada más.
>
> ⚠ **NO es un prompt de migración, y confundirlo es el error caro.** No se toca `dimensiones`,
> no se toca ningún nombre, y **no se propone el arreglo**: se mide y se reporta.

---

## Por qué esto NO va a la migración, que es lo único que hay que entender antes de empezar

Los seis, medidos contra `docs/_snapshots/MARCADORES_2026-08-15.tsv`:

| grupo | marcadores | base / solapa | medida | operación | filtro |
|---|---|---|---|---|---|
| 1 | `pauta_google` · `gcba_pauta_google` | `digital/Seguimiento digital` | `sd_pauta_google` | `SUMA` | **vacío en los dos** |
| 2 | `pauta_meta` · `gcba_pauta_meta` | `digital/Seguimiento digital` | `sd_pauta_meta` | `SUMA` | **vacío en los dos** |
| 3 | `pauta_prog` · `gcba_pauta_prog` | `digital/Seguimiento digital` | `sd_pauta_prog` | `SUMA` | **vacío en los dos** |

**Definición idéntica y filtro vacío en los dos lados.** No difieren en nada: misma base, misma
solapa, mismo campo, misma operación, mismo (no) filtro. Y el log del 15/08 los muestra **dando
el mismo valor**.

**Un par que sólo difiere en el `filtro` es una medida con una dimensión.** Un par que **no
difiere en nada** no es eso: **es el mismo número publicado dos veces.**

⚠ **Y acá está el riesgo que justifica que este prompt exista aparte:** si estos seis entraran a
una tanda de migración, el `gcba_` dejaría de estar en el nombre y pasaría a `dimensiones` como
`ambito=gcba` — **y ahí el error se volvería invisible**. Hoy dos tokens con el mismo valor y
nombres distintos se ven raros; migrados, se verían como una medida bien cortada por ámbito que
casualmente da lo mismo en las dos ramas. **Migrarlos convertiría un error en un error
estructurado.**

Es el caso que **más se parece** a una migración y el que **menos lo es**.

---

## Parte 0 — verificar que las premisas de arriba siguen vigentes

**Antes de medir nada.** Todo lo de arriba sale de un snapshot del 15/08, y `MARCADORES` se
escribe desde dos herramientas que no se ven entre sí.

1. **Contra la hoja viva**, no contra el TSV: ¿los seis siguen con el filtro vacío? ¿siguen en
   `Seguimiento digital`? ¿alguno tiene `dimensiones` escrita?
2. **Si alguna cambió, el prompt para acá y se reporta.** Una premisa vencida no se parchea al
   pasar.

---

## Parte A — medición, **sólo lectura**

**No editar nada. Termina en reportar y parar.**

### A.1 · Qué publica cada uno

`testigoDeImpresiones()` — que **no es de impresiones**: agrupa todos los marcadores por medida y
emite todo grupo de dos o más, así que **los tres pares ya salen en su log hoy**. Registrar, por
cada uno de los seis: **valor, estado, y la cuenta de filas de la traza**.

**La cuenta de filas es la que decide**, no el valor: si los dos leen las mismas filas y dan el
mismo número, es literalmente la misma cuenta hecha dos veces.

### A.2 · En qué lámina se publica cada uno

`censarTokensEnPlantilla('jm', 'pauta_google, gcba_pauta_google, pauta_meta, gcba_pauta_meta, pauta_prog, gcba_pauta_prog')`

⚠ **Es la mitad que convierte esto en una decisión posible.** Un número duplicado no se entiende
sin saber **dónde se publica cada copia**: si los seis están en la misma lámina, alguien ve dos
veces el mismo dato; si están en láminas distintas, una de las dos lo está mostrando como si
fuera otra cosa. **Son dos problemas distintos y se arreglan distinto.**

Correrlo también sobre **`secco`**, y decirlo aunque dé cero: *"no aparece"* es un resultado.

### A.3 · Qué tiene realmente la solapa

**La pregunta de fondo: ¿`Seguimiento digital` distingue JM de GCBA de alguna forma?**

- Qué columnas tiene, con sus títulos, y **si alguna podría servir de corte** —un remitente, un
  nombre de campaña, un ámbito—.
- Si **no hay ninguna**, eso **es el hallazgo**: los dos son idénticos porque **no hay con qué
  distinguirlos en esa solapa**, y ninguna de las dos ramas podría estar bien.
- ⚠ **Nombrar el ámbito exacto de la búsqueda** — base, solapa, columna. Un *"no está"* a secas
  no se puede verificar y se propaga solo: ya pasó con `Seguimiento digital` contra `Digital`,
  que son **dos solapas distintas de la misma base** y el error llegó a cuatro documentos en una
  noche.

### A.4 · Qué dice `C-64`, que probablemente ya lo explica

**`C-64` — las dos capas de la base: filas contra agregado.** Es el mismo patrón que se resolvió
en call center (`C-62`), IVR (`V-98`) y mail (`V-99`), y `PLAN.md` deja escrito que **lo que queda
es aplicárselo a `pauta_*` y Alerta Naranja**.

**Así que la respuesta puede estar escrita hace días.** Leerlo **antes** de proponer nada: si
`pauta_*` sale de la capa agregada, el par duplicado puede ser el síntoma conocido y no un
hallazgo nuevo.

---

## Las tres explicaciones — y el reporte tiene que elegir una, con la evidencia al lado

El prompt **no** decide qué se hace. Sí tiene que decir **cuál de estas tres es**, porque cada una
lleva a un arreglo distinto y elegir mal cuesta caro:

| # | explicación | qué la confirmaría | a qué lleva |
|---|---|---|---|
| 1 | **A los dos les falta el filtro** | la solapa **sí** tiene columna de ámbito, y nadie la puso en el `filtro` | es un bug de configuración: se cablean los dos filtros. **Los dos números de hoy están mal** |
| 2 | **`gcba_pauta_*` nunca debió existir** | la solapa **no** distingue ámbito, y la lámina de GCBA muestra el total como si fuera de GCBA | se retiran tres marcadores y se decide qué publica esa lámina. Toca plantilla → `C-01` |
| 3 | **Es `C-64`: se está leyendo la capa equivocada** | el valor cierra contra el agregado y no contra la suma de filas | se cambia de capa, y el par duplicado desaparece solo |

**Si la evidencia no alcanza para elegir, eso es el resultado** — y se dice qué falta medir. **No
se elige la más probable para no volver con las manos vacías:** un supuesto razonable metido en
silencio es indistinguible de una medición.

---

## Lo que este prompt **no** hace

- **No propone el arreglo ni lo aplica.** Mide y reporta.
- **No toca `MARCADORES`**, ni `dimensiones`, ni ningún filtro.
- **No migra nada.** Los `pauta_*` **no entran a ninguna tanda** hasta que esto se resuelva —
  está en `D-33` y es el motivo de este prompt.
- **No toca plantillas.**
- **No decide qué publica la lámina de GCBA.** Eso es del usuario y toca `C-01`.
