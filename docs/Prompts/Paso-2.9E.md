# Paso 2.9E — Corte vertical: 10 tokens con traza

> **Precondición: el Paso 2.9B verificado.** Con el lector colapsando, toda `SUMA` da
> bajo y este paso pinta diez números mal con traza prolija.
> Trabajamos en español.

## Por qué así

En vez de sembrar ~200 filas de `MARCADORES` (Paso 2.5, bloqueado por la armonización de
plantillas 2.2.2 Parte D), se cablean **diez tokens a mano** de un solo bloque y se hace
andar la cadena entera hasta una hoja `VISTA_PREVIA`.

El objetivo no es tener diez números. Es **tener la cadena completa funcionando** y poder
decir de dónde sale cada uno.

## El caso

**Uno a uno en Retiro, 24/07/2026, etapa `pre`.** Una fila de `REUNIONES`.

Los diez tokens son el bloque de alcance objetivo e inscriptos:

| token | qué es |
|---|---|
| `ecv_comuna` | comuna / barrio |
| `ecv_fecha` | fecha del encuentro |
| `ecv_insc_mail` | inscriptos por mail |
| `ecv_insc_digital` | inscriptos por digital |
| `ecv_insc_cc` | inscriptos por call center |
| `ecv_insc_dif` | inscriptos por difusión |
| `ecv_insc_ivr` | inscriptos por IVR |
| `ecv_inscriptos` | total de inscriptos |
| `ecv_asistentes` | asistentes |
| `ecv_poblacion` | habitantes del eje |

**Se eligieron porque se autovalidan.** Ver §"Validación" abajo.

## Fuentes permitidas

Sólo estas, todas con `uso=fuente` en `SOLAPAS`:

- `rdv/RVD JM-CM - ES` (verificar grafía — Paso 2.9C.2)
- `digital/Digital`
- `digital/Alcance`
- `digital/Directa Mail`
- `digital/Directa IVR`
- `looker/CC` — **Call Center existe sólo acá**, no tiene equivalente en `digital`

**No uses `m2`** (clasificación invertida, pendiente) ni `digital/RDV` (duplica `rdv`,
doble conteo).

## Grano temporal — leer `docs/GRANO_TEMPORAL.md` antes de empezar

Dos reglas que aplican a estos diez tokens:

**1. El filtro de fecha reduce candidatos; no selecciona las filas que se agregan.**
La reunión es de un día; la campaña que la sostiene dura varios. Se filtra por fecha (o
por semana, según el caso) **para achicar la lista de candidatos a matchear**, pero una
vez identificada la campaña sus valores acumulados se toman **completos**, aunque vengan
de días fuera de la ventana.

Para este corte vertical, **el match va cableado a mano**: escribí explícitamente qué
campaña / cuenta corresponde a Retiro 24/07 y dejalo comentado como provisorio. La
mecánica general es el Paso 2.9F.

**2. `SUMA` no es la operación por defecto.** Las bases de canal guardan valores **ya
acumulados**. Si hay varias filas por campaña, sumarlas cuenta la misma gente varias
veces.

Antes de calcular cualquier `ecv_insc_*`, para cada solapa que uses:

- contá filas totales y valores distintos de la columna de campaña / cuenta
- **si son iguales** → una fila por campaña, `SUMA` corresponde
- **si hay más filas que campañas** → averiguá **qué distingue a esas filas** antes de
  decidir. Puede ser una dimensión legítima (plataforma, formato, envío) y entonces
  `SUMA` está bien; o pueden ser cortes acumulados a distintas fechas, y entonces va
  `ÚLTIMO` por campaña.

**Reportá qué encontraste en cada solapa.** Si no podés determinarlo, poné
`«FALTA:token»` y anotá la duda — no elijas una operación al azar. Las dos devuelven un
número plausible; sólo una devuelve el correcto.

## Tarea

### 1. Los cálculos, en `Marcadores.gs`

Los diez, con su lógica. **Toda la aritmética vive acá y sólo acá.** Los otros módulos
leen config, leen datos o pintan Slides.

### 2. La hoja `VISTA_PREVIA` con traza obligatoria

Una fila por token, con estas columnas **todas obligatorias**:

| columna | ejemplo |
|---|---|
| `reunion` | `Retiro 24/07 pre` |
| `token` | `ecv_insc_mail` |
| `valor` | `412` |
| `base` | `digital` |
| `solapa` | `Directa Mail` |
| `columna` | `F` |
| `operacion` | `SUMA` / `ÚLTIMO por campaña` / `DIRECTO` |
| `filas` | `2103` |

**`filas` es el campo que importa.** Es lo que hace visible el bug del lector si vuelve:
si un token dice `filas=720` y `SOLAPAS` dice 1362, se ve de una. No lo omitas en ningún
token, ni siquiera en los de texto — ahí poné cuántas filas se miraron para encontrarlo.

`reunion` va en cada fila porque los bloques se van a emitir por reunión y hay que poder
distinguir de cuál salió cada número.

**`operacion` es el otro campo crítico**, por el grano temporal: ver un `SUMA` donde
correspondía `ÚLTIMO por campaña` es la única forma de detectar un total inflado sin
recalcular a mano. Escribí la operación real, no la que se esperaba.

### 3. Resiliencia

Un token que no resuelve escribe **`«FALTA:token»`** y sigue. No rompe la corrida. La
fila entra igual a `VISTA_PREVIA` con `valor = «FALTA:...»` y la traza que se haya podido
completar.

## Validación

Estos diez se eligieron porque **se controlan entre sí**, sin necesidad de una tabla
externa:

1. `ecv_insc_mail + ecv_insc_digital + ecv_insc_cc + ecv_insc_dif + ecv_insc_ivr`
   tiene que dar **`ecv_inscriptos`**
2. `ecv_asistentes` tiene que ser **menor** que `ecv_inscriptos`
3. `ecv_inscriptos` tiene que ser **mucho menor** que `ecv_poblacion`

Agregá esas tres verificaciones al final de `VISTA_PREVIA`, como filas de control con
✅ / ⚠. Si la suma no cierra, el corte vertical se delata solo.

**Si (1) no cierra, no lo "arregles" ajustando el total.** Reportá la diferencia. Un
descuadre acá es información, no un problema de presentación.

## Lo que este paso NO hace

- No pinta Slides todavía.
- No emite bloques dinámicos.
- No toca el anclaje.

## Restricciones

- `SOLAPAS` manda. Ignorá `uso=ignorar`.
- Nada hardcodeado: bases y solapas salen de los registros.
- Los diez tokens sí van cableados a mano — es el punto del corte vertical. Dejalo
  explícito en un comentario para que no se confunda con la siembra definitiva.

## Test de aceptación

`VISTA_PREVIA` tiene 10 filas de token + 3 de control. Cada fila de token tiene las 8
columnas completas, incluida `filas`. Las tres verificaciones muestran su resultado.

## Commit

`feat: corte vertical — 10 tokens de Retiro 24/07 con traza en VISTA_PREVIA`
