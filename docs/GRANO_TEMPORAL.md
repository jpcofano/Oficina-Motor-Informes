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
