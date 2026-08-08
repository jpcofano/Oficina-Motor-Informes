# El cargador de temario de campañas

**Subagentes:** `verificador` antes de la Parte 0, sobre este archivo.

**Un objetivo.** Que cargar las campañas del temario deje de ser trabajo manual. **Toca `.gs`.**

**De dónde sale.** El usuario preguntó por qué tiene que escribir las filas de `CAMPANAS` a mano
si ya le pasa el temario al sistema. Tiene razón y **la mitad del trabajo ya está hecha**:
`cargarTemarioReuniones_` toma el texto pegado y un `periodo_id` y escribe `REUNIONES`. Para
campañas no existe, aunque el comentario del módulo diga *"mismo patrón que `CAMPANAS`"*.

**Lo que lo hace distinto de las reuniones, y es todo el problema.** Una reunión se describe con
lo que el temario dice. Una campaña **tiene que engancharse con la base**, y el temario la nombra
en castellano mientras la base la identifica con `ID Cuentas`. **Ese salto es el prompt.**

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **`cargarTemarioReuniones_` entera:** qué formato de texto acepta, cómo parsea, qué hace
con una fila que ya existe —pisa, duplica, saltea—, qué escribe y qué deja vacío. **Es el patrón
a seguir**, y si tiene una decisión rara, se hereda o se aparta con motivo, pero no se ignora.

`0.2` · **El temario real, que el usuario ya pasó.** Va completo al final de este archivo y
**queda documentado como el temario de ese informe**, además de servir de insumo. Lo que hay que
medir sobre él:

- **Tiene cuatro bloques marcados con `>`**, y **sólo uno va a `CAMPANAS`**: *Campañas
  destacadas*. El primero —*Status Cercanía y M2*— son reuniones y secciones, y su formato es
  `TIPO | descripción fecha`. **El mismo texto alimenta dos cargadores distintos**, y el parser
  tiene que saber dónde termina uno y empieza el otro.
- **`DGAYD` es de otro equipo** y no lleva `>`. Reportar si eso es una convención o un descuido
  del tipeo, porque de eso depende si el bloque se puede detectar por la marca o hay que
  detectarlo por el nombre.
- **El formato real es sucio y va a seguir siéndolo:** `1)Semana JM` sin espacio, *"Recuparación
  de Propiedade"* con dos errores, espacios de más al final. **El parser tolera esto o no sirve**
  — lo escribe una persona apurada, no un sistema.

`0.2 bis` · **⚠ Dos de las cuatro campañas son condicionales, y ninguna columna lo contempla.**
*"(en caso de que llegue el material)"* y *"(estrategia; métricas en caso de que llegue el
material)"*. **Eso no es parte del nombre y no se puede tirar.** Reportar qué haría hoy el
cargador con ese texto y **proponer dónde vive esa condición** — `mostrar = no` más una nota es
la vía barata, y hay que decir si alcanza. Una campaña condicional cargada como definitiva
publica números de algo que no salió.

`0.2 ter` · **Los dos ajustes de formato que el usuario acordó pedirle al temario.** No son
requisitos: **el parser tolera el formato viejo y aprovecha el nuevo.** Un temario que llega sin
ellos un lunes a las ocho tiene que cargarse igual.

- **El `>` en todos los bloques, `DGAYD` incluido.** Con la marca, un bloque nuevo entra solo;
  sin ella, hay que reconocerlo por el nombre. **Si un bloque llega sin `>`, el cargador lo
  reporta y sigue** — no lo descarta.
- **`[?]` al final de la línea para lo condicional.** Hoy los paréntesis hacen dos trabajos
  distintos —*"(actualización: nuevo mail + video)"* es una nota, *"(en caso de que llegue el
  material)"* decide si la campaña se publica— y **distinguirlas por el texto es frágil**: mañana
  alguien escribe *"si llega el video"* o *"a confirmar"*. Con `[?]` es un carácter fijo.
  **Mientras tanto, el cargador sigue reconociendo las frases del ejemplo real**, y cuando dude
  marca la fila en vez de decidir.

`0.3` · **Cómo se pasa del nombre al `ID Cuentas`, y la solapa que lo va a resolver.** Ya está medido que las tres solapas usan el
mismo identificador y que cruzan. Lo que falta: **con qué columna se busca por nombre**, en cuál
de las tres, y **cuántos nombres del temario matchean exactamente** contra cuántos necesitan algo
más que igualdad de texto. Reportar los casos que no matchean, con los dos textos al lado.

**Y medir si ya existe una solapa de equivalencias parecida** —`PERSONAS_equivalencias` es el
precedente— para seguir su forma en vez de inventar una. **Al temario no se le va a pedir que
nombre las campañas como las nombra la base:** quien escribe el temario no tiene por qué conocer
los `ID Cuentas`, y pedírselo garantiza el error. **Se resuelve de este lado.**

`0.4` · **Qué columnas de `CAMPANAS` puede llenar el cargador y cuáles no.** `periodo_id`,
`informe_id` y `mostrar` salen del contexto de la carga; `orden` sale del temario; `desde` y
`hasta` **salen de la base, no del temario**. Decir cuáles quedarían vacías y qué pasa con la
fila si lo están.

`0.5` · **Dónde iría en el menú** y qué convención siguen los ítems existentes. La tabla del menú
es declarativa: agregar una fila, no tocar `onOpen`.

**Reportar `0.1`–`0.5` y parar.**

---

## Parte A — el cargador

`A.1` · **Mismo patrón que el de reuniones.** Recibe el texto pegado y el `periodo_id`, y escribe
filas de `CAMPANAS`. **Lo que ya está resuelto ahí no se rediseña.**

`A.2` · **Una campaña condicional entra con `mostrar = no` y su condición anotada.** El usuario
la habilita cuando llega el material. **No se decide por ella y no se descarta**: el temario ya
dijo que puede ir.

`A.3` · **La regla que gobierna todo el cargador: un nombre que no resuelve a un `ID Cuentas` NO
se inventa.** La fila se escribe igual, con el nombre tal como vino, **`mostrar` de modo que no
emita**, y una marca visible de que le falta el id. **El usuario la completa mirando una fila
concreta**, que es mucho más fácil que descubrir después por qué un token salió vacío. Cargar
diez campañas y que tres queden marcadas es un buen resultado; cargar diez y que tres apunten a
la campaña equivocada es el modo de falla que este proyecto persigue.

`A.4` · **`desde` y `hasta` salen de la base**, de las columnas de inicio y fin de
`Seguimiento digital`, no del texto del temario. El temario dice **cuáles** van; la base dice
**cuándo** fueron. Es la misma división que `R-17` ya tiene escrita para la selección.

`A.5` · **No pisar filas existentes.** Si el `campana_id` ya está para ese `periodo_id`, se
reporta y se saltea. Recargar un temario corregido no puede duplicar ni borrar.

`A.6` · **El reporte al terminar dice qué pasó, no que salió bien:** cuántas se escribieron,
cuántas quedaron sin id y con qué nombre, cuántas se saltearon por existir, y cuáles del temario
no se pudieron interpretar.

## Parte B — la solapa de equivalencias

`B.1` · **Una solapa que recuerde `nombre del temario → ID Cuentas`.** Es lo que convierte al
cargador en algo que mejora solo: **la primera semana el usuario marca cuatro filas a mano; a
partir de ahí el cargador las resuelve y sólo pregunta por las campañas nuevas.** Es el único de
los tres cambios que no depende de que otra persona cambie un hábito.

`B.2` · **La escribe el usuario, no el cargador.** El cargador **lee** la equivalencia y **nunca
la inventa**: si resolviera solo y escribiera lo que adivinó, el error quedaría guardado y se
repetiría cada semana con más confianza. Lo que sí puede hacer es **dejar la fila lista con el
nombre y el id vacío**, para que completar sea escribir una celda.

`B.3` · **La comparación es por valor normalizado**, con `R-18` ya escrita: un temario que
escribe *"Desalojo 900"* una semana y *"desalojo 900 "* la otra es la misma campaña.

`B.4` · **Sigue el precedente de forma que reporte `0.3`**, en vez de inventar una convención
nueva para la tercera tabla de equivalencias del proyecto.

## Parte C — el menú y el runbook

`C.1` · Una fila en la tabla del menú, al lado de *Cargar temario de reuniones*.

`C.2` · La sección del `RUNBOOK` que hoy explica cómo llenar `CAMPANAS` a mano **pasa a explicar
las dos formas**, con la manual marcada como lo que se hace cuando el cargador deja una fila sin
resolver. **No borrar el instructivo manual**: es lo que se usa para arreglar lo que el cargador
no pudo.

## Verificación

Se cierra cuando el usuario pega un temario real y las filas quedan escritas, con las que no
resolvieron marcadas y ninguna apuntando a la campaña equivocada.

## Commits

Código y documentación separados. `git push` después de cada uno.

---

## El temario real — informe de la semana del 24 al 30/07/2026

Pasado por el usuario el 08/08/2026. **Se transcribe tal cual, con sus erratas**, porque el
parser tiene que habérselas con esto y no con una versión limpia.

```
> Status Cercanía y M2
1) JM | Uno a uno en San Cristóbal 23/07 (pre + post)
2) JM | Uno a uno en Retiro 24/07 (pre + post)
3) JM | Primera Persona con Pareto 27/07
4) JM | Encuentro Temático Orden Público 28/07
5) Ministros | Reuniones de la semana
6) M2 | Campañas y enviados de la semana
7) M2 | Registro Civil: nuevas piezas  + métricas 
> Campañas destacadas
1) Egreso de cadetes (actualización: nuevo mail + video "tolerancia cero")
2) Operativo de saturación en 1-11-14
3) Desalojo 900 (estrategia; métricas en caso de que llegue el material)
4) Video de obras de salud (en caso de que llegue el material)
DGAYD
1)Semana JM 
2)Análisis conversación digital Operativo 900
3)Comparativo de Recuparación de Propiedade
> Otros temas
Status reunión con PC
```

**Los dos ajustes acordados**, para que queden con el ejemplo al lado: `>` en todos los bloques
—`DGAYD` hoy no lo tiene— y `[?]` al final de las líneas condicionales, que en este temario son
la 3 y la 4 de *Campañas destacadas*. **El parser no los exige.**

**Lo que este ejemplo confirma y conviene tener escrito:** los nombres del temario son
descripciones en castellano —*"Egreso de cadetes"*, *"Desalojo 900"*— y la base identifica con
`ID Cuentas` en formato `NNNN-XXXYYYZZ`. **Es muy probable que la mayoría no matchee por igualdad
de texto**, y eso **no es un fallo del cargador**: es la razón por la que la fila se escribe
marcada en vez de adivinada.
