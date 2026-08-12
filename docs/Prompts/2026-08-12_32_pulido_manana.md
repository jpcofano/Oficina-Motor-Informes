# `_32` · Pulido — cerrar lo que cierra, sin tocar el motor

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> **La demo es hoy a las 18 y el deck que se muestra ya existe** —`jm-20260811-234158`—. Nada de lo
> que sigue puede empeorarlo. Si una parte no cierra limpio, se deja como está y se reporta: **el
> costo de no cerrar un pendiente es cero; el de romper el deck de la demo es la demo.**
>
> **Decidido y fuera de discusión hoy:** el encuentro que no ancla lo resuelve **el usuario**, no el
> motor. **No se toca `umbral_anclaje_reunion` ni `scoreMatchDigitalRdv_`.** Es una `D-NN` nueva y
> se escribe en la Parte F.

---

## Parte A · Premisas — sólo lectura, reportar y parar

**Modelo: Sonnet, effort alto.**

**A.1 · `looker/CC x Cuentas`.** Los encabezados de la solapa, tal cual, y las filas de `MAPEO` que
existan para esa base. Es lo único que decide si los `cc_*` se pueden cablear hoy.

**A.2 · Las dos filas huérfanas de `CORRIDAS`.** Sus `corrida_id`, qué columnas tienen vacías, y
**cuál es el escritor declarado de `CORRIDAS`** — si tiene uno que pueda cerrar una fila existente
o sólo agrega.

**A.3 · La lámina 7.** Si el usuario ya la marcó *Omitir diapositiva*, confirmarlo por el conteo de
escondidas de la plantilla. Si no, reportarlo y **no tocar la plantilla**.

**Reportar y parar.**

---

## Parte B · Los `cc_*`, sólo si el mapeo es evidente

**Modelo: Opus, effort alto.** Publica números.

**La puerta:** que los encabezados de A.1 digan por sí solos qué columna es la base, cuál los
contactados y cuál el porcentaje. **Si hay que interpretar un encabezado, no se cablea.** Ésa es la
misma regla que dejó afuera a `alcance` y `clics` anoche, y no se afloja porque queden tres horas.

Si abre: filas de `MAPEO` para `looker/CC x Cuentas` y las tres filas de `MARCADORES` —`cc_base`,
`cc_contactados`, `cc_contact_pct`—, con `notas` = `SIN VALIDAR — demo 12/08`. `cc_contact_pct`
calca la forma de los porcentajes que ya existen: la etapa sobre la anterior, sin inventar
operación.

`V-64` 6011, `V-65` 1878 y `V-66` 31 % son referencia para **el usuario**, que valida en otra
ventana. **Code no compara.**

Si no abre: los tres siguen en `—` y se reporta qué encabezado fue el que obligó a interpretar.

---

## Parte C · Cerrar las dos filas huérfanas

**Modelo: Sonnet.**

Se ven en `panel_ultimasCorridas()`, que es parte del camino que se muestra hoy. Cerrarlas con
motivo —muerte de transporte, sin excepción— usando **el escritor declarado que A.2 haya
encontrado**.

**Si no hay escritor que pueda cerrar una fila existente, no se improvisa uno.** Se reporta y se
dejan. Dos filas abiertas en una hoja son menos costosas que un escritor nuevo sin declarar el día
de la demo.

---

## Parte D · El `_29` Parte B

**Modelo: Sonnet.**

El usuario adjunta la versión viva de `casos_validacion_2026-08-09_addendum.csv`, la de 95 casos
con `V-71` y `C-28`…`C-37`. Reemplazar la copia del repo, que tiene 74. Es reemplazo de archivo, no
fusión. Reportar el delta sin interpretarlo.

---

## Parte E · La corrida final

**Modelo: Sonnet.**

**Sólo si B o C cambiaron algo.** Una corrida de julio, con la casilla de `—` tildada, y leer del
deck la lámina 5 token por token.

**Si sale peor que `jm-20260811-234158`, ése sigue siendo el deck de la demo** y se dice en una
línea. No se investiga por qué: hoy no hay tiempo para eso y el deck bueno ya está.

---

## Parte F · La decisión que hay que escribir

**Modelo: Sonnet.**

Una `D-NN` nueva en `docs/PLAN.md`, con el usuario como dueño, fechada 12/08/2026:

> **Un encuentro que no alcanza el umbral de anclaje lo resuelve el usuario, no el motor.** El
> umbral no se baja para que un encuentro entre: bajarlo cambia el anclaje de todos los demás para
> arreglar uno, y publica una fila de `rdv` que el motor no está seguro de haber acertado. La
> salida es que el usuario confirme o corrija el anclaje, y **eso es una capacidad del front**, no
> del motor. Hasta que exista, el encuentro se lista en `excluidos` con su puntaje y el umbral —que
> es lo que la Parte G del `_31.3` dejó funcionando— y el usuario decide.

Anotar como caso vivo el de anoche: `Encuentro Temático Educación 16/06`, puntaje 0,54 contra
umbral 0,6.

---

## Lo que no se toca hoy

`CONFIG` · `scoreMatchDigitalRdv_` · la plantilla · `REUNIONES` · el deck `jm-20260811-234158`.
Cualquier hallazgo lateral se anota en el reporte y se deja.
