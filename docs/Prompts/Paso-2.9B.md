# Paso 2.9B — Arreglar el colapso por clave

> **Precondición: el Paso 2.9A confirmó la hipótesis.** Si `DIAG_COLAPSO` no muestra
> `valores_distintos_clave == filas_devueltas`, no corras este paso.
> Trabajamos en español.

## Qué hay que lograr

`leerFuente` tiene que devolver **todas las filas de datos** de la solapa, no una por
valor de `clave`.

La `clave` sirve para **agrupar y anclar después**, en `Marcadores.gs`. No es un filtro
de lectura. Un lector que colapsa está tomando una decisión de negocio que no le
corresponde.

## Tarea

### 1. El fix

Sacá el colapso de `leerFuente`. La firma y el resto del contrato no cambian: los
consumidores tienen que seguir andando.

Si algún consumidor dependía de recibir una fila por clave, **no lo arregles
silenciosamente compensando en el lector.** Identificá cuál es, anotalo, y movemos esa
agrupación a `Marcadores.gs` donde corresponde.

### 2. El guardarraíl, bien calibrado

El guardarraíl actual dejó pasar 960/1297 y 720/1362 sin avisar. Está mal calibrado.

Reemplazalo por: **reportar siempre el porcentaje de cobertura** (`filas_devueltas` /
`SOLAPAS.filas_datos`) y **marcar `⚠` cuando baje de 90%**. Siempre visible, no sólo
cuando falla.

### 3. Las filas "sin clave"

`digital` descartaba 337 filas por no tener clave. Con el fix esas filas deberían
entrar. Si seguís descartando filas por algún motivo, tiene que quedar registrado
**cuántas y por qué**, no en silencio.

## Restricciones

- **La aritmética vive sólo en `Marcadores.gs`.** El lector lee, no agrupa ni suma.
- `SOLAPAS` manda. Ignorá `uso=ignorar`.
- Un token que no resuelve escribe `«FALTA:token»`. No rompe la corrida.
- Nada hardcodeado: nombres de base y solapa salen de los registros.

## Test de aceptación

Volvé a correr `diagnosticarColapso_()`. En `DIAG_COLAPSO`:

- `rdv`: `filas_devueltas` ≈ **1362** (no 720)
- `digital`: `filas_devueltas` ≈ **1297** (no 960)
- cobertura ≥ 90% en ambas, sin `⚠`

Si `digital` no llega, reportá cuántas filas se descartan y por qué motivo.

## Commit

`fix: leerFuente devolvía una fila por clave en vez de todas las filas`
