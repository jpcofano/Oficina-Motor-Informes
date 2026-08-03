# Paso 2.13 — Una sola fuente de verdad por cosa

> Destino: `docs/Prompts/Paso-2.13_una_fuente_por_cosa.md`
> Corre **después** de `Paso-2.11` Partes C y D. Un commit por parte.
> **Trabajamos en español.**

---

## El principio

Cada hecho se escribe en **un** lugar. Lo que hoy lo repite pasa a narrativo o a archivo,
y lo dice explícitamente en su encabezado para que nadie lo edite creyendo que gobierna.

`Paso-2.11` Parte A resolvió esto para la configuración (`HOJAS_CONFIG_.ejemplos` contra
`SEED_*`). Este paso lo resuelve para el **mapeo**, que está repartido en cinco lugares y
uno de ellos no existe.

### El cuadro al que hay que llegar

| qué cosa | fuente única | se siembra desde |
|---|---|---|
| dónde está cada base | `BASES` | `SEED_BASES_` |
| qué solapas hay y para qué sirven | `SOLAPAS` | `SEED_SOLAPAS_` |
| `campo_logico` → columna | `MAPEO` | `SEED_MAPEO_` (114 filas al 03/08/2026; 121 en la hoja viva) |
| **token → base, solapa, campo, operación** | **`MARCADORES`** | **sembrado desde las plantillas (`Paso-2.5`)** — ver nota |
| **nombre canónico del token** | **`docs/TOKENS.md`** | prosa, normativo sólo para nombres |
| **valor verificado del token** | **`casos_validacion_2026-07-31.csv`** → hoja `VALIDACION` | ancla de corrección |
| secciones de cada informe | `SECCIONES` | `SEED_SECCIONES_` |
| qué campañas entran | `CAMPANAS` | curado a mano |

A archivo: `docs/MAPEO_completo.md`.

> ⚠ **Nota del 02/08/2026 — la Parte 1 de este prompt queda sin efecto. `SEED_MARCADORES_`
> no se hace.** Este documento nunca se ejecutó, así que se corrige **en el lugar** y no por
> addendum (`DOC-7`); el resto del prompt sigue vivo tal cual.
>
> Decidido en `docs/PLAN.md` `D-17`: **el dueño de `MARCADORES` es la plantilla**, y las
> filas se siembran leyendo los `{{token}}` de los Slides (`Paso-2.5`). Un seed en código
> haría que agregar un informe exija editar un `.gs`, que es el número que `D-01` mide; y
> sería una segunda copia de un dato que ya vive en la lámina. La idempotencia, que era el
> argumento a favor del seed, la da `upsertSoloVacias_`.
>
> **Lo que sigue en pie de la Parte 1** y hay que llevarse a donde corresponda: el hallazgo
> de que `MARCADORES` tiene tres filas contra las 43 trazas del CSV (`H-6`), y la tarea de
> exportar la hoja a `docs/_snapshots/` **antes** de que nada la escriba — sigue siendo la
> primera tarea, sólo que ahora el escritor es el `Paso-2.5` y no un seed.

---

## Parte 1 — `MARCADORES` no tiene sembrador

Los nueve `SEED_*` del repo son `INFORMES`, `BASES`, `MAPEO`, `PERIODOS`,
`CAMPANAS_EJEMPLO`, `REUNIONES_EJEMPLO`, `SOLAPAS`, `CONFIG_DEFAULTS` y `SECCIONES`.
**Ninguno es de `MARCADORES`.**

`MARCADORES` es la tabla que dice qué token sale de qué base, qué solapa, qué campo y con
qué operación. Sus filas existen **sólo en la planilla viva**. No están en el repo. Un
`instalar()` sobre una planilla nueva crea la hoja con encabezados y cero filas: el motor
se queda sin un solo token.

`Paso-2.11` Parte A lo dejó así sin que se notara. La regla era "hoja con `SEED_*` → borrar
`ejemplos`; hoja sin `SEED_*` → mover los `ejemplos` a un seed nuevo". `MARCADORES` caía en
la segunda rama —se le crearon `SEED_INFORMES_` y `SEED_PERIODOS_` a `INFORMES` y
`PERIODOS` por esa misma regla— pero a `MARCADORES` no. Sus tres filas de ejemplo
(`ecv_inscriptos`, `camp_alcance`, `m2_envios`) se borraron y no fueron a ningún lado.

### Tareas

1. Crear `SEED_MARCADORES_` con el contenido **actual de la planilla viva**, volcado tal
   cual. No inventar filas ni completar huecos: si un token tiene `solapa` vacía, va vacía.
2. Sembrarlo con `upsertPorClave_` por `['marcador', 'informe_id']` — ver Parte 3, la clave
   no puede ser sólo `marcador`.
3. Antes de volcar, **exportar la hoja tal como está** a `docs/_snapshots/MARCADORES_<fecha>.tsv`
   y commitearlo. Es el único respaldo de un dato que hoy vive en un solo lugar.

### Criterio de aceptación

Instalar en una planilla vacía y correr "Aplicar configuración" reproduce `MARCADORES`
completa. Hoy la deja vacía.

---

## Parte 2 — Reconciliar `MARCADORES` contra las 43 trazas verificadas

`casos_validacion_2026-07-31.csv` tiene 48 filas, **43 con traza completa**
(`base · solapa · clave · columna · operacion`), cada una verificada contra el informe
publicado del 31/07. Son lo único comprobado contra datos vivos en todo el sistema.

`MAPEO` tiene 113 filas, ninguna verificada. Se superponen y en varios puntos se
contradicen — `MAPEO` sigue apuntando `m2` a `M2 periodo DIRECTA`, que ya es `referencia`.

### La regla de reconciliación

1. Donde el CSV y `MARCADORES`/`MAPEO` difieren, **gana el CSV**. Está verificado; el otro
   no.
2. Un token de `MARCADORES` sin caso en el CSV queda **sin verificar**, no mal. Se marca,
   no se borra.
3. Un caso del CSV sin fila en `MARCADORES` es un **token que falta declarar**.

### Tareas

1. Agregar a `MARCADORES` una columna `verificado_por` — el `caso_id` que la respalda, o
   vacío.
2. `menuReconciliarMarcadores_()`: sólo lectura, reporta las tres listas de arriba con
   conteos. No escribe.
3. Corregir en `SEED_MARCADORES_` las filas que el CSV contradice, una por una, con el
   `caso_id` en `notas`.

### Criterio de aceptación

Las 43 filas con traza tienen su token declarado en `MARCADORES` con la misma
`base · solapa · columna · operacion`. Las diferencias que queden están listadas con motivo.

---

## Parte 3 — ⚠ `enc_mails_enviados` significa dos cosas distintas

Esto sale de `docs/TOKENS.md` y hay que resolverlo **antes** de sembrar `MARCADORES`,
porque define la clave de la tabla.

```
etiqueta "Mails enviados"   JM: enc_audiencia_pauta ⚠   SECCO: enc_mails_enviados
etiqueta "Audiencia" (IVR)  JM: enc_mails_enviados  ⚠   SECCO: enc_audiencia
```

**El mismo nombre de token apunta a mails enviados en SECCO y a audiencia de IVR en JM.**
Están cruzados. Un `SEED_MARCADORES_` con clave `marcador` a secas colapsa los dos en una
fila y uno de los dos informes queda con el número del otro — sin error visible, porque
las dos son cifras de seis dígitos perfectamente plausibles.

`MARCADORES` ya tiene columna `informe_id`, así que es expresable. Lo que hace falta es que
la clave del upsert sea `['marcador', 'informe_id']` y que **ningún token cruzado use
`informe_id = '*'`**.

Y hay una trampa que ya está documentada en `VALIDACION §3.3`, que conviene no perder al
declararlo: `enc_mails_enviados` es **un envío**, no la suma de la cuenta. Para
`3387-JULJDGGC` el envío del 25/07 da 44.043 y la suma de los cuatro envíos de la cuenta da
271.701 — un factor de 6,17. La `operacion` correcta es la fila única, no `SUMA`.

### Tareas

1. Clave del upsert de `MARCADORES`: `['marcador', 'informe_id']`.
2. Auditar los tokens cruzados de `TOKENS.md` §1 y declarar cada uno con su `informe_id`
   explícito, nunca `*`.
3. Guardarraíl: si un `marcador` aparece con `informe_id='*'` **y** con un `informe_id`
   concreto, ⚠ — es la firma de un cruce a medio resolver.

---

## Parte 4 — Archivar lo que quedó duplicado

### `docs/MAPEO_completo.md` → `docs/_archivo/`

122 líneas que describen en prosa lo mismo que `MAPEO`, y ya desactualizadas: su §M2
documenta el mapeo a `M2 periodo DIRECTA` y `M2 periodo DIGITAL`, las dos hoy `referencia`.

Encabezado al archivarlo: *"Archivado el <fecha>. La fuente del mapeo es la hoja `MAPEO`,
sembrada desde `SEED_MAPEO_`. Este documento queda como registro de cómo se pensó el mapeo
en el Paso 2.4."*

### `docs/TOKENS.md` — **NO se archiva**

No es duplicado. Es la única fuente de los **nombres canónicos**: el único lugar que dice
que `enc_mails_enviados` gana sobre `enc_audiencia_pauta`, y el único que registra los
cruces de la Parte 3. Agregarle un encabezado que diga qué gobierna y qué no:

> Normativo para: nombre canónico de cada token y equivalencias JM ↔ SECCO.
> No normativo para: de dónde sale el dato — eso es `MARCADORES`.

### Tarea

Agregar a `PROYECTO.md` §9 el cuadro de "una fuente por cosa" de arriba de este prompt, y
que cada `.md` normativo lleve en su encabezado la línea de qué gobierna. Un documento sin
esa línea es narrativo por defecto.

### Criterio de aceptación

Ningún `.md` de `docs/` describe de dónde sale un dato sin decir que la fuente es
`MARCADORES`/`MAPEO`. `docs/` baja de 23 a 22 archivos.
