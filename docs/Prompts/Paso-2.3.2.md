# Paso 2.3.2 — `solapa` entra en la clave de `MAPEO`

> Corrige una decisión de diseño tomada dentro del Paso 2.3.1. **Correr antes de
> ejecutar el test de verificación del 2.3.1** — si no, se cargan filas con la clave
> vieja y después hay que migrarlas.
> **Trabajamos en español.** Un paso = un test verificado = un commit.

---

## Problema

`MAPEO` tiene clave única `(base_id, campo_logico)`. La solapa **no está en la clave**,
pero sí es parte de la identidad de un mapeo: `digital` tiene 6 solapas y cada una tiene
sus propias columnas.

El 2.3.1 lo esquivó con un prefijo condicional: `<solapa>_fecha_periodo` si la base tiene
más de una solapa mapeada, `fecha_periodo` plano si tiene una sola. **Eso no se sostiene**
por dos razones:

1. **El nombre depende del estado de `MAPEO` al momento de escribirlo.** Hoy `rdv` tiene
   una solapa y queda plano. El día que alguien mapee una segunda solapa de `rdv`, la
   regla pasa a decir prefijado, pero la fila vieja sigue guardada plana. El lector
   calcula un nombre, `MAPEO` tiene otro, y sale `«FALTA:fecha_periodo@rdv/…»` sin que
   nadie haya tocado nada relacionado.
2. **La lógica vive en dos lados** (el que escribe y el que lee). Divergen con un cambio
   de código en uno solo.

`dig_*` / `mail_*` / `sms_*` **es el mismo parche aplicado antes**: no es una convención
de nombres, es la solapa metida a mano adentro del nombre porque la clave no la admite.
El esquema venía goteando desde antes; las fechas solo lo hicieron visible.

**Solución: clave `(base_id, solapa, campo_logico)`.** Con eso `campo_logico` vuelve a ser
`fecha_periodo` literal en todos lados, como pedía el prompt original. Se cae el prefijo,
se cae la regla condicional.

Se hace ahora porque `MAPEO` es chico. Cada fila con la clave vieja encarece la migración.

---

## A) Columna `solapa` en `MAPEO`

Agregar la columna. Backfill de las filas existentes:

- **Regla general:** `solapa = hoja_default` de esa base según `BASES`.
- **Excepción — `dig_*` / `mail_*` / `sms_*`:** a estas **no** les corresponde
  `hoja_default`, sino su solapa real. Completarlas desde una tabla explícita en el
  código o a mano. **Si una de estas filas no tiene solapa determinable, frenar el
  backfill y reportarla.** No asignar `hoja_default` por descarte: eso deja una fila que
  apunta a la solapa equivocada y lee columnas de otra hoja sin fallar.

## B) `buscarMapeo(base_id, solapa, campo_logico)` — helper único

- Es **la única** vía de resolución de `MAPEO`. Si hay lógica de búsqueda duplicada en
  otro módulo, se elimina y se llama a esta.
- **`solapa` es obligatoria.** Si viene vacía o `null`, error explícito. **Nada de
  default a `hoja_default`**: un default silencioso acá devuelve la fila de otra solapa
  sin avisar, que es exactamente el modo de falla que se está corrigiendo.
- Actualizar todos los llamadores de dos argumentos.

## C) Sacar el prefijo condicional de `promoverFechasElegidas()`

- Escribe siempre `campo_logico = 'fecha_periodo'` y la solapa en su columna.
- **Borrar la rama condicional, no dejarla como fallback.** Una rama muerta que nadie
  ejecuta es una rama que diverge.
- **Guarda de migración:** si `MAPEO` ya tiene filas `<algo>_fecha_periodo` de una
  corrida previa, reescribirlas al formato nuevo y reportar cuántas. Si no hay ninguna,
  decirlo también.

## D) Consumo en `leerFuente`

Resolver con `buscarMapeo(base_id, solapa, 'fecha_periodo')`. El mensaje de falla no
cambia: `«FALTA:fecha_periodo@{base_id}/{solapa}»`.

## E) Validador de duplicados

Detectar y reportar tríos `(base_id, solapa, campo_logico)` repetidos. Sumarlo a la
validación de registros que ya corre.

## F) Observabilidad del filtro de fecha

Cuando `leerFuente` descarta filas por fecha vacía o ilegible, **reportar el conteo**.
Hoy, si RDV tiene 40 filas sin fecha cargada, desaparecen del informe en silencio y el
total sale bajo sin ningún error.

---

## Fuera de alcance

**No renombrar `dig_*` / `mail_*` / `sms_*`.** Con la solapa en la clave esos prefijos
quedan redundantes, pero un renombre es un concepto en dos lugares — es literalmente lo
que rompió `enc_audiencia`. Backfillear la solapa dejando los nombres como están. El
renombre es limpieza aparte, con su propio test.

**Commits separados.** El diagnóstico de Looker (Tarea 5 del 2.3) sigue sin commitear y
quedó mezclado en el working tree. Separarlo (`git add -p` o `git stash`) antes de
commitear esto: si el test falla y hay que revertir, no puede llevarse puesto trabajo del
2.3 que no tiene relación.

---

## Test de verificación

1. Backfill: toda fila de `MAPEO` tiene `solapa`. Las `dig_*` apuntan cada una a su hoja
   real, no todas a la misma.
2. Llamar a `buscarMapeo()` sin solapa → error explícito, no resultado.
3. Duplicar un trío a propósito → el validador lo reporta. Deshacer.
4. Recién ahí, el test completo del 2.3.1: detectar → elegir a mano → promover.
5. Verificar en `MAPEO`: `campo_logico = fecha_periodo` plano en **todas**, incluidas las
   6 de `digital`, diferenciadas por `solapa`.
6. Leer con ventana conocida y contar contra la base. Probar un registro **exactamente en
   cada borde**: los dos entran.
7. Borrar la fila de `fecha_periodo` de una base → `«FALTA:…»`, no la base entera.
8. **Chequeo de R-01:** agrupar RDV por (columna A `Figura`, columna de `fecha_periodo`) y
   contar grupos con más de una fila. Tiene que dar **cero**. Si da violaciones, lo más
   probable es que la columna elegida sea de sistema (`fecha_carga`) y no la del
   encuentro — la regla funciona como test de la elección.
