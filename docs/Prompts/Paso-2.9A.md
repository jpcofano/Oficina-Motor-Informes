# Paso 2.9A — Diagnosticar el colapso por clave del lector

> **Este paso NO cambia el comportamiento del motor.** Sólo diagnostica.
> No modifiques `leerFuente` ni ningún lector en este paso.
> Trabajamos en español.

## Contexto

La corrida del 31/07 de "Probar lectura por ventana" dio:

| base | `SOLAPAS.filas_datos` | leídas |
|---|---|---|
| `rdv` | 1362 | 720 |
| `digital` | 1297 | 960 (337 descartadas "sin clave") |
| `looker` | 903 | 903 |
| `m2` | 29.533 | 18 |

**Hipótesis a verificar:** `leerFuente` devuelve **una fila por valor distinto de
`clave`**, en vez de todas las filas. Si es cierto, toda `SUMA` del informe da bajo
**sin ningún error visible**.

Este es el modo de falla que más importa del proyecto: el que devuelve un número
plausible. Por eso se verifica antes de construir nada encima.

## Tarea

### 1. Inspección del código

```
grep -n "clave\|Map\|Set\|dedup\|reduce\|indexOf\|has(" Fuentes.gs
```

Leé `leerFuente` completa y **explicá en prosa** qué hace con la columna `clave`:
¿agrupa, deduplica, indexa por clave, o devuelve todas las filas?

No adivines por el nombre de las variables. Seguí el flujo de datos.

### 2. Función de diagnóstico

Creá `diagnosticarColapso_()` en un archivo nuevo `Diagnostico.gs`
(o donde ya vivan las funciones de diagnóstico, si existe una).

Para cada base con `uso=fuente` en su solapa default, tiene que reportar:

| dato | cómo se obtiene |
|---|---|
| `filas_datos` | de `SOLAPAS` |
| `filas_crudas` | `getDataRange().getValues().length` menos encabezado |
| `filas_devueltas` | lo que devuelve `leerFuente` |
| `valores_distintos_clave` | cuántos valores únicos tiene la columna `clave` |

Escribí el resultado en una hoja `DIAG_COLAPSO` (creala si no existe), **no** en un
`alert` ni sólo en el log. La corrida anterior murió por timeout y se perdió todo
porque el `alert` era lo último.

Corré la función para **`rdv`** como mínimo.

### 3. El veredicto

La pregunta es una sola:

> ¿`valores_distintos_clave` de `rdv` es igual a **720**?

- **Si da 720** → hipótesis confirmada. Anotalo y **pará acá**. El fix es el Paso 2.9B.
- **Si no da 720** → la hipótesis es falsa. **No implementes ningún fix.** Reportá qué
  dio y esperá.

No sigas al fix por tu cuenta en ninguno de los dos casos.

## Restricciones

- `SOLAPAS` es la fuente de verdad de qué solapa se lee. **Ignorá toda fila con
  `uso=ignorar`.** No leas solapas que no estén registradas.
- Nada de nombres de solapa hardcodeados: todo sale de las hojas de registro.
- Toda la aritmética vive sólo en `Marcadores.gs`. Este paso no calcula nada del
  informe, así que no toques ese archivo.

## Test de aceptación

La hoja `DIAG_COLAPSO` existe y tiene al menos la fila de `rdv` con las cuatro
columnas completas.

## Commit

`diag: función de diagnóstico del colapso por clave en el lector`
