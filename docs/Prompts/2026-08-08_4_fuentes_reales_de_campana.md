# Las fuentes reales de una campaña — leer lo que el panel lee

**Subagentes:** `verificador` antes de la Parte 0, sobre este mismo archivo. Ninguno en las
partes siguientes.

**Un objetivo.** Dejar establecido **de dónde sale cada `camp_*`**. **Sólo medir y documentar.**
Ningún `.gs`, ninguna fila de `MARCADORES`, ninguna corrida completa.

**El bloque que destraba.** Los `camp_*` son el grupo más grande que queda sin resolver, y hoy
están frenados por dos cosas distintas que conviene no confundir: **faltan filas de `jm` en
`CAMPANAS`** —tarea del usuario, con su instructivo ya escrito— y **no está establecido por qué
camino se leen los datos**. Esto último es lo que resuelve esta corrida. Sin ello, cargar las
filas no alcanza.

**El hallazgo del que parte.** Las dos solapas `Buscador por periodo` **no son fuentes**: son
paneles con el período tipeado a mano y los datos generados por un `FILTER`. `R-02` las veta, y
el 07/08 estaban apuntando a una semana distinta de la del informe. **Pero sus fórmulas nombran
las fuentes reales**: `Seguimiento digital`, `Mail per` y `Alcance`. **No hay que leer el panel:
hay que leer lo que el panel lee.**

---

## Parte 0 — las cinco mediciones (sólo lectura, reportar y parar)

`0.1` · **Las fórmulas de los dos paneles, transcriptas.** Qué solapa lee cada una, con qué
condiciones y contra qué celdas. **Es el mapa que ya existe y nadie escribió** — el equipo lleva
meses usando esos paneles, así que las condiciones que están ahí adentro **son el criterio
editorial vigente**, no una propuesta.

`0.2` · **Las tres fuentes reales, cada una con su ficha:** `Seguimiento digital` y `Alcance`
están registradas como `fuente`; **`Mail per` está como `referencia`**. Para cada una: fila de
encabezado real, columnas, cuántas filas tiene, y **si `Mail per` es una fuente mal registrada o
es otro panel** — no asumir que porque el `FILTER` la nombra es una tabla.

`0.3` · **Con qué se identifica una campaña en cada una de las tres.** `Alcance` trae
`ID Cuentas` y `nombre_campaña`. Reportar **qué columna cumple ese papel en las otras dos** y **si
los valores coinciden entre las tres** —tomar dos o tres campañas reales y seguirlas por las tres
solapas—. **Si no coinciden, ése es el hallazgo**, y todo lo demás depende de él.

`0.4` · **Los `camp_*` contra sus fuentes.** Para cada token `camp_*` del informe `jm`, decir de
cuál de las tres saldría y con qué campo. **Los que no salgan de ninguna, listarlos aparte**: son
los que van a necesitar otra fuente o una decisión, y conviene saber cuántos son antes de empezar
y no a mitad de camino. **`camp_bench_*` está fuera de alcance por decisión del usuario: no
entra al inventario ni se menciona.**

`0.5` · **Qué tendría que existir en `MAPEO`** para que esos tokens se puedan leer, contra lo que
ya existe. Ya está anotado que `nombre_campaña` de `digital/Alcance` no está mapeado. **Proponer
las filas, no escribirlas.**

**Reportar `0.1`–`0.5` y parar.**

---

## Parte A — dejarlo escrito

`A.1` · **La cadena completa, en una página:** de una fila de `CAMPANAS` a los números de la
lámina. Qué la identifica, qué solapa se lee para cada grupo de tokens, y **con qué se enganchan**.
Va donde `CLAUDE.md` §7 mande.

`A.2` · **Y el veto de los paneles, con su motivo**, para que nadie los vuelva a proponer: son
`R-02`, tienen el período a mano, y **el modo de falla es silencioso** — leerlos habría traído las
campañas de otra semana **sin que ningún token fallara**. Es el caso más limpio de número
plausible y mal que tiene el proyecto, y merece quedar contado.

`A.3` · **Lo que `0.3` haya encontrado sobre los identificadores.** Si coinciden, se dice y queda
cerrado. **Si no coinciden, se escribe la diferencia y no se resuelve acá**: elegir un
identificador es decisión del usuario y probablemente del equipo.

`A.4` · **La lista de `0.4` que no sale de ninguna fuente**, en `PENDIENTES`, agrupada por lo que
les falta. **Un token sin fuente no es un token pendiente de cablear: es una pregunta**, y hay que
poder distinguirlos de un vistazo.

## Lo que esta corrida NO hace

No cablea ningún `camp_*`, no escribe filas en `CAMPANAS`, no toca `MAPEO`, no cambia el `uso` de
ninguna solapa. **Si aparece la tentación de arreglar algo chico mientras se mide, se anota y se
sigue.**

## Commits

Uno por parte. Documentación. `git push` después de cada uno.

## Verificación

Se cierra cuando alguien puede decir, para cualquier `camp_*`, de qué solapa sale y con qué se
engancha — o que todavía no se sabe, con la pregunta escrita.
