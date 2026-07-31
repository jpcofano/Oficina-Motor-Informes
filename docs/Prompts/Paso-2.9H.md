# Paso 2.9H — Reusar o actualizar: la decisión visible

> Qué pasa cuando un token ya se calculó para otro informe del mismo período.
> Leer antes: `docs/SECCIONES.md` §"JM es un subconjunto de SECCO".
> Trabajamos en español.

## El problema

JM y SECCO comparten bloques enteros. Verificado en la semana 26/06–03/07: Uno a uno,
Comunicaciones Post, M2, servicios esenciales y personas mayores aparecen en los dos
informes con **los mismos números**.

Pero los informes no se arman el mismo día, y **las campañas siguen corriendo**. Si SECCO
sale una semana después, el alcance de una campaña abierta creció. Entonces:

- **Recalcular callado** → los dos informes dicen distinto y nadie sabe por qué. Es el
  desvío de 867 vs 1.026 clics ya documentado en el punteo del 30/07.
- **Congelar callado** → SECCO publica números viejos de una campaña que siguió.

**Las dos son válidas según el caso. Ninguna puede ser automática.**

## Lo que hay que construir

### 1. Hoja `VALORES` — la foto de cada cálculo

| columna | ejemplo |
|---|---|
| `periodo` | `2026-W27` |
| `informe_id` | `JM` |
| `seccion_id` | `campana` |
| `item` | `Declaración de servicios esenciales` |
| `token` | `camp_clics` |
| `valor` | `867` |
| `fecha_calculo` | `2026-07-03 14:22` |
| `origen_valor` | `nuevo` / `reusado` |
| `parcial` | `sí` |

Una fila por token calculado. **Nunca se pisa**: cada corrida agrega. Así un informe
pasado se puede reproducir, que es el pedido explícito del punteo del 30/07.

### 2. Al calcular, comparar contra lo anterior

Para cada token, buscar si existe un valor previo del **mismo `periodo` y mismo `item`**,
sin importar de qué informe.

- **No existe** → calcular, escribir con `origen_valor = nuevo`.
- **Existe y da igual** → reusar, sin molestar a nadie.
- **Existe y da distinto** → **preguntar**.

### 3. La pregunta

Hoja `VALORES_DIVERGENTES`, una fila por token que cambió:

| columna | contenido |
|---|---|
| `item` | `Declaración de servicios esenciales` |
| `token` | `camp_clics` |
| `valor_anterior` | `867` |
| `fecha_anterior` | `2026-07-03` |
| `valor_nuevo` | `1026` |
| `diferencia` | `+18,3%` |
| `parcial` | `sí` |
| `decision` | **vacío — lo completa la persona** (`reusar` / `actualizar`) |

Con acciones en bloque: **actualizar todos** / **mantener todos**. Si son cuarenta
tokens, pedir cuarenta decisiones garantiza que nadie mire ninguna.

### 4. `parcial` cambia el significado del cambio

- Campaña **parcial** (sigue corriendo): que el número suba es **esperado**. Ordenar
  estas al final, sugerir `actualizar`.
- Campaña **cerrada**: que el número cambie es **una señal**. Puede ser un cambio de
  fuente, una corrección aguas arriba, o un bug. Ordenar al principio, marcar `⚠`, no
  sugerir nada.

Un dato que cambia cuando no debería cambiar es más importante que uno que cambia como
corresponde.

### 5. La decisión va a la traza

`VISTA_PREVIA` suma dos columnas: `origen_valor` (`nuevo` / `reusado`) y `fecha_calculo`.

Poder decir "este número es del 3 de julio, se decidió no actualizarlo" es tan importante
como el número.

## Restricciones

- Toda la aritmética vive sólo en `Marcadores.gs`.
- `SOLAPAS` manda. Ignorá `uso=ignorar`.
- **Ninguna decisión automática cuando hay divergencia.** Sin decisión, el token va a
  `VISTA_PREVIA` con el valor anterior y marcado como pendiente. Nunca se elige solo.
- Nada hardcodeado.

## Test de aceptación

1. Correr JM para un período. `VALORES` se llena con `origen_valor = nuevo`.
2. Correr SECCO para el mismo período sin tocar las bases. **No aparece ninguna
   divergencia** y los tokens compartidos salen `reusado`.
3. Cambiar un valor en una base y volver a correr SECCO. El token aparece en
   `VALORES_DIVERGENTES` con anterior, nuevo y diferencia.
4. Completar `decision = reusar`. El informe sale con el valor viejo y `VISTA_PREVIA` lo
   registra con su fecha.
5. `VALORES` conserva las dos filas — la de JM y la de SECCO. Nada se pisó.

## Commit

`feat: snapshot de valores + decisión explícita de reusar o actualizar`
