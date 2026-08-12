# `_40` · La base nueva — censo antes de decidir el costo

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> **Sólo lectura. Termina en reportar y parar.** No da de alta la base, no escribe `BASES`,
> `SOLAPAS` ni `MAPEO`, no toca un marcador.
>
> **Después de la demo.** Los dos decks vigentes son `jm-20260812-172902` (julio) y
> `jm-20260812-174147` (`junio_sem2`), y nada de esto los toca.

---

## Qué es la base

`Base reuniones - Digital - Call Center`, entregada por el usuario.

**El archivo vivo:** `12b0v67FbxjuIndK7DgVU3MYxx-k0yBIS9gtyV45rFaY`
(`https://docs.google.com/spreadsheets/d/12b0v67FbxjuIndK7DgVU3MYxx-k0yBIS9gtyV45rFaY/edit`).
**Abrir ése, no el `.xlsx` de la conversación** — el export puede diferir del vivo, que es
justamente lo que este censo tiene que establecer.

Cuatro solapas: `Barrios`, `Agenda JM`, `Agenda funcionarios`, `Agenda JM | Post`.

**Lo importante es `Agenda JM`:** **una fila por encuentro**, encabezado en la **fila 2** —la 1 es
una banda de grupos— y **`ID` es el mismo `id_cuenta` que produce el anclaje**. Medido desde afuera
sobre el archivo: 152 filas, `ID` sin duplicados, fechas de 05/07/2025 a 14/08/2026.

Sus 44 columnas cubren, en una sola fila, lo que hoy se arma cruzando tres bases: el embudo de Mail,
el de IVR, **el de Call Center completo** (`Base total`, `Base discada`, `Contactados`, `% Cont.`,
`Efectivos`, `% Efect.`), `Impresiones totales`, `Alcance manual`, `Alcance potencial`,
`% Cobertura`, `Frecuencia estimada`, y **las impresiones separadas por Meta, Google y Programmatic
en columnas propias**.

**Todo lo de arriba es medición desde afuera y vale como hipótesis.** La Parte A la reproduce contra
la copia viva.

---

## Parte A · Premisas — sólo lectura

**Modelo: Sonnet, effort alto.**

**A.1 — la forma.** `Agenda JM` en la copia viva: cuántas filas, en qué fila está el encabezado, si
`ID` es único, y el rango de fechas. **Cuántas filas tienen fecha futura**: hay encuentros que
todavía no ocurrieron y eso cambia qué significa "cobertura".

**A.2 — la cobertura contra el temario.** Para los **6 ítems de julio** y los **4 de `junio_sem2`**:
si el `id_cuenta` anclado tiene fila en `Agenda JM`. Los que no la tengan, listarlos.

**A.3 — el contraste columna por columna, y es el punto del prompt.** Para esos mismos ítems, poner
lado a lado **lo que publica el deck hoy** contra **lo que dice la base nueva**, por token. Al menos:
`enc_alcance`, `enc_impresiones`, `enc_audiencia`, `enc_75`, y los seis del embudo de Call Center.

Marcar cada celda como **coincide · difiere · sólo la base nueva lo tiene · sólo el motor lo tiene**.

⚠ **Hay al menos una diferencia ya detectada y es la que decide todo.** Para `3289-JUNJDGAG` la base
nueva da `Base discada 4726` y `Contactados 1380`; `looker/resumen_metricas_dinamico` da **6011 y
1878**, que son `V-64` y `V-65`, **validados contra deck publicado**. No es la base moviéndose: 4726
es *menor*. **Son dos definiciones distintas del mismo hecho.** Reportar cuántas celdas más caen en
ese caso.

**A.4 — los tres reemplazos que la base habilitaría, y si de verdad los habilita.**

- ¿`Alcance manual` de `3387` da **66345**? Es el valor que `D-06` valida y el que la guarda de
  `ULTIMO` no puede elegir entre las dos filas de `digital/Alcance`. Si da, esta base **resuelve esa
  ambigüedad por construcción**.
- ¿Las columnas `Impresiones Meta / Google / Programm` cubren lo que hoy `R-24` obtiene **por
  resta**? Si sí, es candidata a derogar `R-24` — **no derogarla acá**, sólo medirlo.
- ¿Hace falta una rama por cuenta para esta base, o alcanza con un filtro por `ID`? Es una fila por
  encuentro, así que debería alcanzar un filtro — **confirmarlo leyendo `datosDeMarcador_`**, no
  deducirlo.

**A.5 — lo que NO reemplaza.** `Barrio / Comuna` para `3289` y `3387` dice **"Eje Norte"**: trae el
eje de la campaña, no el barrio. Confirmar en cuántas filas pasa. **`rdv` sigue siendo la fuente de
barrio, fecha y estado**, y esta base no la toca.

**Reportar y parar.** Sin proponer altas ni cableados: la decisión vuelve con la tabla de A.3
delante.
