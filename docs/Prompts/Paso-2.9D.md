# Paso 2.9D — La hoja `REUNIONES`

> El temario define el universo del informe (R-02). Llega por WhatsApp y hoy no tiene
> lugar en el motor. Este paso le da uno.
> Trabajamos en español.

## Contexto

El recorte por fecha **no decide** qué entra al informe. El proceso arranca
seleccionando las reuniones del temario. La fecha se usa sólo para el match.

El temario real del 24/07 al 30/07, rescatado de los comentarios de la plantilla:

```
   JM | Uno a uno en San Cristóbal 23/07 (pre)
2) JM | Uno a uno en Retiro 24/07 (pre)
   JM | Encuentro Temático Orden Público 28/07
   JM | Uno a uno en San Cristóbal 23/07 (POST)
   JM | Uno a uno en Retiro 24/07 (post)
   Ministros | Reuniones de la semana (24/07 al 30/07 inclusive - Acumulado)
6) M2 | Campañas y enviados de la semana del 24/07 al 30/07
```

Formato: `eje | tipo nombre fecha (etapa)`, con numeración de orden parcial.

## Tarea

### 1. Crear la hoja `REUNIONES`

| columna | ejemplo | notas |
|---|---|---|
| `orden` | `2` | orden en el informe |
| `eje` | `JM` | `JM` / `Ministros` / `M2` |
| `tipo` | `Uno a uno` | `Uno a uno` / `Encuentro Temático` / `ECV` / `Primera persona` / `Agregado` |
| `nombre` | `Retiro` | barrio, comuna o tema |
| `fecha` | `24/07/2026` | |
| `etapa` | `pre` | `pre` / `post` / vacío |
| `mostrar` | `sí` | filtro de emisión |
| `texto_original` | `2) JM \| Uno a uno en Retiro 24/07 (pre)` | la línea cruda |
| `notas` | | |

Mismo patrón que `CAMPANAS`: **curado a mano**. Sembrala con las 7 filas de arriba.

### 2. Carga desde texto pegado

Una función que tome el texto crudo del WhatsApp (pegado en una celda o en un prompt de
menú) y **proponga** el parseo, escribiendo las filas con `mostrar` vacío.

**La persona confirma.** El motor no parsea callado y no marca `mostrar=sí` solo.
`texto_original` se guarda siempre, aunque el parseo falle: si una línea no se puede
interpretar, entra igual con las demás columnas vacías y `notas = no se pudo parsear`.

Un parseo que falla ruidosamente cuesta un minuto. Uno que acierta mal produce un informe
plausible sobre la reunión equivocada.

### 3. Lector

`leerReuniones_()`: devuelve las filas con `mostrar=sí`, ordenadas por `orden`.
Mismo contrato que el lector de `CAMPANAS`.

## Lo que este paso NO hace

- No toca el anclaje ni el scoring.
- No emite slides.
- No calcula nada.

## Restricciones

- Toda la aritmética vive sólo en `Marcadores.gs`. Acá no se calcula nada.
- `SOLAPAS` manda para las bases. Ignorá `uso=ignorar`.
- Nada hardcodeado.

## Test de aceptación

- `REUNIONES` existe con las 7 filas sembradas.
- `leerReuniones_()` devuelve las que tienen `mostrar=sí`, en orden.
- Pegar una línea nueva la parsea y la deja con `mostrar` vacío, esperando confirmación.
- Pegar una línea malformada la registra con `texto_original` y la nota de error, sin
  romper.

## Commit

`feat: hoja REUNIONES + carga del temario desde texto pegado`
