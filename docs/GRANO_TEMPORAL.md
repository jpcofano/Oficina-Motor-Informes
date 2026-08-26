# GRANO TEMPORAL — Motor de Informes (GCBA)

> Por qué la fecha de la reunión **no** filtra las filas de canal, y por qué `SUMA` no
> es la operación por defecto.
> Trabajamos en español.

## La regla

**Una reunión ocurre un día. La campaña que la sostiene dura varios.**

Un Uno a uno del 24/07 tiene una convocatoria por mail, digital, call center e IVR que
corrió durante días previos. Los canales tienen su propia ventana, que no coincide con
la fecha del encuentro y casi nunca la incluye.

**Estamos trabajando con información ya procesada, no con dato crudo.** Las bases de
canal guardan **valores acumulados** de la campaña, no eventos por día.

## Consecuencia 1 — el filtro de fecha reduce candidatos, no selecciona filas

La distinción es fina y es la que más fácil se pierde:

- **Sí se filtra por fecha** — para achicar la lista de campañas o encuentros candidatos
  antes de matchear por nombre. Reunión → por fecha del encuentro. Campaña → por semana
  del período.
- **No se filtra por fecha** — las filas que se agregan una vez identificada la campaña.
  Sus valores acumulados se toman **completos**, aunque vengan de días fuera de la
  ventana.

Filtrar `digital`, `looker/CC` o `Directa Mail` por la fecha del encuentro para calcular
el valor devuelve cero filas, o filas equivocadas. El vínculo reunión ↔ canal es **por
campaña / cuenta**.

Esto ya estaba registrado como R-02 —el temario define el universo, no la fecha— y como
la decisión de leer `digital` y `looker` en modo `snapshot`. Acá está la razón de fondo.

Las seis columnas de fecha elegidas el 30/07 sirven para **acotar lectura, diagnóstico y
candidatos**, no para seleccionar las filas que se agregan.

## Consecuencia 2 — `SUMA` no es la operación por defecto

Si el valor ya viene acumulado, sumar filas puede contar la misma gente varias veces.

Hay dos escenarios posibles y **no están resueltos**:

| escenario | qué hay en la base | operación correcta |
|---|---|---|
| **A** | una fila por campaña, con el total | `SUMA` entre campañas |
| **B** | varias filas por campaña, cada una acumulada a esa fecha | `ÚLTIMO` por campaña, después `SUMA` |

**Los dos devuelven un número plausible. Sólo uno devuelve el correcto.**

En el escenario B, `SUMA` infla — y la inflación es proporcional a cuántas veces se
reportó la campaña, así que las campañas más largas quedan más infladas. No hay ningún
error visible.

### Cómo determinarlo, por base

Para cada solapa de canal con `uso=fuente`: contar filas totales y valores distintos de
la columna de campaña/cuenta.

- **iguales** → escenario A
- **más filas que campañas** → escenario B, o hay una dimensión adicional (plataforma,
  formato, envío) que hay que identificar antes de decidir

Ojo con el tercer caso: en `looker/DIGITAL` (4563 filas) es esperable que haya varias
filas por campaña **por plataforma**, y ahí `SUMA` sí corresponde. La pregunta no es
"¿hay más de una fila?" sino "**¿qué distingue a estas filas entre sí?**".

## Consecuencia 3 — `operacion` tiene que estar en la traza

Por eso `VISTA_PREVIA` registra `operacion` además de `valor`. Ver un `SUMA` donde
correspondía `ÚLTIMO` es la única forma de detectar esto sin recalcular a mano.

Junto con `filas`, son los dos campos que hacen auditable el número.

## Consecuencia 4 — `IMPORTRANGE` no es un archivo, es una FÓRMULA (26/08/2026)

**Nace con `reuniones/Agenda JM | Post`**, que el 26/08 se reemplazó por una copia con
`IMPORTRANGE` para darle títulos únicos por bloque. El arreglo es correcto y resolvió un bug real —
`Visualizaciones` y `% VTR` publicaban Programmatic—. Lo que sigue **no lo discute**: declara lo que
esa forma de traer el dato cambia, **antes de que muerda**.

⛔⛔ **Una solapa con `IMPORTRANGE` no es una foto: es una consulta que se re-evalúa.** El dato no
vive en la planilla, vive en el origen, y lo que hay del lado de acá es el resultado de la última
evaluación. De ahí salen tres cosas que ninguna regla anterior cubría.

### 4.1 · Si el origen cae, la solapa queda VACÍA — y eso no es un error, es un `sin_datos`

Si el archivo de origen se borra, se mueve, o alguien **revoca el permiso** del `IMPORTRANGE`, la
solapa no falla: **devuelve `#REF!` o nada**. Y el motor **no lo distingue de «esta semana no hubo
POST»**.

⚠ **Es el modo de falla más caro de este repo**, otra vez: no publica un número equivocado, publica
**una ausencia que apunta al lugar equivocado**. Quien mire el deck va a buscar el temario, la
ventana o el cableado — y el problema va a estar en un permiso de Drive.

⭐ **Lo accionable, y ya existe la mitad:** `SOLAPAS.firma_encabezado` guarda el encabezado que
`inventariarSolapas()` encontró. **Si el `IMPORTRANGE` no resolvió, la firma se guarda con el
error** — y ahí el testigo de `D-31` deja de avisar **sin fallar**, porque valida contra una firma
rota. **Por eso la Parte 0 del 26/08 chequeó explícitamente que la firma no contuviera `#REF!`**, y
por eso ese chequeo tiene que quedar como paso y no como corazonada.

### 4.2 · `R-31` se agrava: ahora la fuente también se mueve **a mitad de una corrida**

`R-31` ya medía que estas bases cambian cuando un tercero las edita. Con `IMPORTRANGE` cambian
**además cuando Google re-evalúa la fórmula**, que ocurre por su cuenta y **puede caer entre dos
lecturas de la misma corrida**.

⛔ **Y eso choca con un supuesto que las cachés dan por cierto:** `cacheDatosHoja_` guarda el dato
crudo por `base‖hoja` justamente porque *dos lecturas de la misma corrida dan lo mismo*. Con una
fórmula que se refresca sola, **esa premisa deja de ser un hecho y pasa a ser una probabilidad**.

⭐ **Lo medido el 26/08, que es el caso testigo:** entre dos lecturas separadas por horas,
`Agenda JM | Post` se movió `+52` impresiones, `+2` clics y `+44` visualizaciones **enteramente
dentro del bloque Programmatic**, con Meta y Google **idénticos al dígito**, y pasó de 103 a 104
filas. La caché no lo vio porque las dos lecturas fueron de corridas distintas — **pero nada
garantiza que la próxima no parta una corrida al medio**.

⚠ **La caché no es el problema: es lo que hace que el efecto sea INVISIBLE.** Sin ella se verían dos
números distintos y alguien preguntaría; con ella la corrida es internamente consistente y publica
una foto que no corresponde a ningún instante.

### 4.3 · El `sha256` deja de servir como huella para esta solapa

`C-21` y `CLAUDE.md` §4 apoyan el camino del fixture en una huella: **un archivo con su `sha256`**,
para que un número medido sea reproducible seis semanas después. Con `IMPORTRANGE`
**no hay archivo estable que fotografiar**: el `.xlsx` que se exporte es la evaluación de ese
minuto, y dos exports del mismo día pueden diferir sin que nada lo declare.

⭐ **Lo accionable, y no es abandonar el fixture:** para esta solapa, **el export sigue sirviendo
como foto fechada, pero su huella ya no prueba que el ORIGEN no se movió** — prueba que el archivo
no se tocó. Son dos afirmaciones y sólo la segunda sigue en pie. Un caso de validación sobre esta
solapa tiene que decir **la hora**, no sólo el día.

⚠ **Y la firma de solapas de `C-21`** —*«para saber qué base es un fixture, la firma es su lista de
SOLAPAS»*— **no se ve afectada**: la lista de solapas no depende de que las fórmulas hayan resuelto.

## Qué explica esto de lo ya observado

- **`M2 Directa` (26 filas) y `M2 digital` (67 filas)** están anotadas como "acumulados"
  en `SOLAPAS`. Encajan con el escenario A: pocas filas, una por campaña, ya totalizadas.
- **El comentario de M2 en la plantilla** —"el día del cierre que sería 30/07 tenemos
  campañas que llevamos y campañas que no"— es exactamente el problema de una campaña
  que cruza el borde del período. Con dato acumulado, incluirla o no es una decisión
  humana, no un filtro.
- **La pregunta abierta del handoff** —"¿los números de una campaña que repite semana van
  acumulados desde el inicio? Si algún cuadro suma varias campañas del período, ese total
  infla con lo ya reportado"— queda respondida en su primera mitad: **sí, van
  acumulados**. La segunda mitad es el escenario A/B de arriba.
- **`Snapshot.gs` (hoy vacío)** deja de ser opcional si estamos en el escenario B.

## Pendiente

- [ ] Determinar A o B para cada solapa de canal con `uso=fuente`
- [ ] Para las que tengan varias filas por campaña: identificar qué las distingue
- [ ] Definir si `Snapshot.gs` es necesario
- [ ] Decidir el criterio de borde: campaña que empieza antes o termina después del
      período, ¿entra? (hoy: decisión humana vía `mostrar=sí`)
