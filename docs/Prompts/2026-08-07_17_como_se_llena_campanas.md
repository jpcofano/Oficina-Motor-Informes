# Cómo se llena una fila de `CAMPANAS` — medir antes de que el usuario cargue

**Un objetivo.** **Medir, probar un camino con la caja de tiempo puesta, y dejar el instructivo.** **Ningún `.gs` y ninguna plantilla.** Toca `SOLAPAS` sólo para la prueba de la Parte A, y con reversión declarada. El usuario va a
cargar a mano las filas de `jm` en `CAMPANAS` —los 53 tokens `camp_*` dependen de eso— y hay
**dos columnas cuyo valor correcto no está escrito en ninguna parte**. Cargar cinco filas con el
vocabulario equivocado produce 53 huecos y una tarde perdida.

**Termina en un instructivo de una página, no en un diagnóstico.**

---

## Parte 0 — las cinco mediciones (sólo lectura, reportar y parar)

`0.1` · **Las columnas reales de `CAMPANAS` hoy**, en orden, de la hoja viva. El snapshot del
01/08 tiene nueve y no incluye `periodo_id`; el seed del código tiene diez y sí. **Decir cuál
es cierto hoy.**

`0.2` · **El vocabulario de `tipo`.** La hoja viva del 01/08 trae `destacada`,
`encuentro_ministros` y `proveedor`; `SEED_CAMPANAS_EJEMPLO_` trae `campana`, `ministros` y
`proveedor`. **Buscar quién lee esa columna** —`SECCIONES.filtro`, `itemsDeSeccion_`, cualquier
consumidor— y reportar **qué valores espera**. Si nadie la lee, decirlo: entonces es
documentación y no configuración, y eso también hay que saberlo.

`0.3` · **Las tres solapas con las que se arma la campaña, que el usuario nombró.** Todas en
`digital`: **`Buscador por periodo digital`**, **`Buscador por periodo directa`** y
**`Alcance`**. La regla que dio el usuario es que **no hay clave de join fija**: se matchea por
**el filtro que tenga prioridad** —la cadena de `R-17`, temario primero—. Medir, sobre las hojas
vivas:

- **Dónde empieza la tabla real de las dos primeras.** `SOLAPAS` las registra con encabezado
  `Periodo · Desde · Hasta`, tres columnas: eso **no es una tabla de datos**, parece un panel
  donde alguien fija un período y una fórmula devuelve las campañas más abajo. Reportar la fila
  de encabezado verdadera, si hay `QUERY` o fórmula, y qué columnas trae la tabla de resultados.
- **`Alcance`**, que sí está registrada como `fuente` y trae `ID Cuentas` y `nombre_campaña`:
  confirmar si es la que engancha con el nombre del temario.
- **Las dos primeras están registradas como `referencia`, y `buscarMapeo` exige
  `uso = 'fuente'`.** Es la misma trampa que `Comunas`: si un marcador tiene que leerlas, hoy no
  puede. Confirmarlo con el error real, no por lectura del código.

`0.3 bis` · **⚠ El filtro de la hoja, que es el hallazgo que el usuario marcó al pasar.** Esas
dos solapas **tienen un filtro puesto**: la persona ve un subconjunto y **el motor lee todo**.
Medir, para cada una: **filas visibles contra filas totales**, y si el filtro es una vista de
filtro, un filtro de rango o filas escondidas. **Es el mismo modo de falla que las láminas
escondidas** —lo que el equipo mira y lo que el motor cuenta no son el mismo conjunto— y ya nos
costó una vez. Si la diferencia no es cero, **va a `PENDIENTES` con el número**, aunque hoy
ningún marcador las lea.

`0.4` · **Qué `periodo_id` corresponde.** Qué filas tiene `PERIODOS` hoy, si alguna cubre la
semana del informe, y **de dónde saca el motor la semana si no hay ninguna**. Recordar el
contrato: `periodo_id` es **el informe en el que la campaña aparece**, no el período de sus
fechas.

`0.5` · **Una fila de ejemplo, completa y realista.** Tomar **una** campaña destacada real de la
semana 24–30/07 —de las que ya están en la base, no inventada— y escribir cómo quedaría su fila
con las diez columnas llenas. **Es el entregable que más le sirve al usuario:** un ejemplo bien
hecho vale más que la descripción de cada columna.

**Reportar `0.1`–`0.5`, con el `0.3 bis`, y parar.**

---

## Parte A — probar el camino, con la caja de tiempo puesta

**Decisión del usuario, 07/08/2026:** el motor lee **filas totales**, no lo que muestra el
filtro de la hoja. Y para probar si esas solapas sirven como fuente, **se pueden pasar a
`uso = fuente`** y correr las pruebas. **Si no se resuelve en una vuelta, se marca y se avanza
con otra cosa.**

`A.1` · **Pasar a `fuente` las dos solapas de `Buscador por periodo`** —digital y directa— en
`SOLAPAS`, y probar si un marcador puede leerlas por el camino normal. **Anotar el valor
anterior antes de tocarlo.**

`A.2` · **La caja de tiempo, dicha como criterio y no como sensación:** **una sola vuelta de
prueba.** Si después de esa vuelta el marcador no resuelve, **no se insiste**: se revierte el
`uso` al valor anotado en `A.1`, se anota en `PENDIENTES` qué se probó y con qué falló, y la
corrida sigue con la Parte B. **Una solapa marcada `fuente` que no es fuente es peor que una
marcada `referencia`**, porque el próximo que la vea va a creer que se puede leer.

`A.3` · **Si el camino de `A.1` no sirve, la alternativa es `CAMPAÑAS_DESGLOCE_DIGITAL`, y
tiene una advertencia escrita.** Está registrada como `revisar`, y **ya fue descartada una vez**
—para la lámina 7— por dos razones medidas: no trae alcance, y **da una fila por campaña *y*
plataforma**, así que sumar sin agrupar cuenta la misma campaña varias veces. **Si se prueba
acá, la primera medición es cuántas filas devuelve por campaña.** Si da más de una, el problema
no es la fuente: es que hace falta agrupar, y eso es otro prompt.

`A.4` · **Lo que NO se hace en esta corrida:** no se cablea ningún `camp_*`, no se escribe
ninguna fila de `CAMPANAS`, y no se toca `MAPEO`. Esto prueba si el camino existe. Cablear es
después y con las filas cargadas.

## Parte B — el instructivo

`B.1` · Con lo que midieron la Parte 0 y la Parte A, escribir en el documento que `CLAUDE.md` §7 señale como
dueño —probablemente `docs/RUNBOOK.md`, porque es operatoria— **cómo se carga una fila de
`CAMPANAS`**: columna por columna, con el ejemplo de `0.5` al lado y **los tres errores que
dejan la fila muda**:

- `periodo_id` vacío → la fila existe y no entra a ningún informe;
- `mostrar` distinto de `sí`;
- `tipo` con el vocabulario equivocado, si `0.2` confirma que alguien la lee.

`B.2` · **Sin repetir lo que ya está escrito.** El régimen de selección es `R-17` y la decisión
editorial es `CONFIG_INFORMES.md` §1.1: el instructivo **apunta**, no los recopia. Lo que agrega
es **cómo se llena la celda**, que hoy no está en ninguna parte.

`B.3` · **Si la Parte A quedó marcada y no resuelta, o si `0.3` reporta que el enganche a la base no existe**, el instructivo lo dice arriba
de todo: se puede cargar, pero los `camp_*` no van a resolver hasta que exista, y eso es otro
prompt.

## Commits

Uno por parte. `git push` después de cada uno. El cambio de `uso` de la Parte A no es un commit:
se anota en la bitácora con lo que dio la prueba y con el valor al que se revirtió, si se
revirtió.

## Verificación

Se cierra cuando una persona que no trabajó en el motor puede cargar una fila de `CAMPANAS`
leyendo un solo documento — **y cuando ninguna solapa quedó marcada `fuente` sin serlo.**
