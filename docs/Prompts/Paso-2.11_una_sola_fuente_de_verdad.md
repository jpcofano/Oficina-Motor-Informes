# Paso 2.11 — Una sola fuente de verdad para la configuración

> Destino: `docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md`
> **Paso de consolidación. No agrega funcionalidad.** Las Partes D, E y G del `Paso-2.10`
> quedan en espera hasta que este cierre.
> Un commit por parte, con verificación en la planilla viva entre una y otra.
> **Trabajamos en español.**

---

## Por qué este paso

El proyecto no está en producción, así que se puede reordenar. Conviene hacerlo ahora,
porque el problema ya se manifestó: la Parte C se commiteó, se pusheó, y `m2` siguió
leyendo `M2 periodo DIRECTA` igual. No fue un error de Code — fue que **el mismo hecho está
escrito en tres lugares distintos del repo y en la planilla**, y cuál gana depende de qué
ítem de menú se corrió último.

### La evidencia

`BASES.m2.hoja_default` está definido dos veces, con valores contradictorios:

```
Instalar.gs:69    HOJAS_CONFIG_.BASES.ejemplos
                  ['m2', 'M2 Reporte 2026', '', 'M2 periodo DIRECTA', 3, 'snapshot', …]

Instalar.gs:566   SEED_BASES_
                  // Paso 2.10 Parte C: hoja_default vacío a propósito
```

Lo mismo con `MARCADORES`:

```
Instalar.gs:90    ['m2_envios', 'm2', 'jm', 'm2', 'M2 periodo DIRECTA', 'envios', …]
```

Y las dos se escriben por caminos distintos: `instalar()` siembra desde
`HOJAS_CONFIG_.ejemplos`, `seedConfiguracion()` desde `SEED_BASES_`. **Correr
"Instalar / reparar hojas" después de "Cargar config inicial" revierte la Parte C sin
avisar.**

Ese es el modo de falla caro otra vez, en la configuración en vez de en los números.

### Lo que este paso NO cuestiona

`reclasificarSolapasM2Invertidas_` está bien resuelto: `SOLAPAS_M2_INVERTIDAS_` quedó en
`['M2 Directa', 'M2 digital']` y las dos `periodo` salieron de la lista con el comentario
que explica por qué. Es el ejemplo de cómo debería quedar todo lo demás.

---

## Parte A — `HOJAS_CONFIG_.ejemplos` deja de ser configuración

`HOJAS_CONFIG_` define el **esquema** (los `headers`). Los `ejemplos` empezaron como
documentación de formato y terminaron sembrando datos reales.

### Tareas

1. Para cada hoja de `HOJAS_CONFIG_` que tenga un `SEED_*` correspondiente
   (`BASES`, `MAPEO`, `MARCADORES`, `CONFIG`, `SOLAPAS`, `SECCIONES`): **borrar `ejemplos`**.
   El esquema queda con `headers` solamente.
2. Para las hojas que **no** tienen `SEED_*` (si quedan), mover los `ejemplos` a un
   `SEED_*` nuevo, no dejarlos donde están.
3. `instalar()` crea hojas y encabezados. **No escribe filas de datos.** Si una hoja queda
   vacía después de instalar, es correcto: la llena el sembrador.
4. Grep de control: después del cambio, `'M2 periodo DIRECTA'` sólo puede aparecer en
   `SEED_SOLAPAS_` (como `referencia`) y en comentarios. En ningún `ejemplos`, ningún
   `hoja_default`, ninguna fila de `MARCADORES`.

### Criterio de aceptación

Correr "Instalar / reparar hojas" sobre la planilla actual **no cambia ni una celda de
`BASES`, `MAPEO` ni `MARCADORES`**. Hoy las revierte.

---

## Parte B — `fila_encabezado` es por solapa, no por base

`BASES.m2.fila_encabezado = 3` se aplica a toda la base. Medido contra el archivo del
31/07, es correcto sólo para las dos vistas que la Parte C acaba de sacar de circulación:

| solapa de `m2` | `SOLAPAS` dice | es | primeras celdas reales |
|---|---|---|---|
| `Directa mail` | 3 | **1** | `ID Cuentas · ID MailUp · Listado de Mail` |
| `M2 Directa` | 3 | **1** | `ID cuentas · ID MailUp · Listado de Mail` |
| `M2 digital` | 3 | **1** | `ID Cuentas · Nombre campaña…` |
| `Seguimiento digital` | 3 | **1** | `ID Cuentas · Nombre campaña…` |
| `CAMPAÑAS_DESGLOCE_DIGITAL` | 3 | **1** | `Id accion · Id cuentas · Año` |
| `Alcance` | 3 | **1** | `ID Cuentas · Alcance · Frecuencia` |
| `Digital acumulado` | 3 | **1** | `Id · Nombre de la campaña…` |
| `Mail per` | 3 | **sin encabezado** | la fila 2 ya es dato |
| `M2 periodo DIGITAL` | 3 | 3 ✓ | |
| `M2 periodo DIRECTA` | 3 | 3 ✓ | |

Leer `m2/Directa mail` con encabezado en la fila 3 toma como títulos los valores de la
segunda fila de datos. No falla: devuelve columnas con nombres raros y números plausibles.

### Tareas

1. `SOLAPAS.fila_encabezado` es la fuente. `BASES.fila_encabezado` pasa a ser sólo el
   **default** para solapas no declaradas en `SOLAPAS`.
2. Corregir `SEED_SOLAPAS_` con la tabla de arriba.
3. `Mail per` (las dos, `m2` y `digital`) lleva `fila_encabezado = 0` con el significado
   **"sin fila de títulos"**. Documentarlo en el comentario del seed. Ninguna solapa `fuente`
   puede tener `0`; es un valor válido sólo para `referencia`.
4. `leerFuente` usa `SOLAPAS.fila_encabezado` y cae al de `BASES` sólo si no encuentra fila.

### Criterio de aceptación

`menuInventariarSolapas_` sobre `m2` reporta encabezados legibles en las siete solapas
corregidas: `ID Cuentas`, `Id accion`, etc. Hoy devuelve valores de datos como títulos.

---

## Parte C — Un solo "Aplicar configuración", con diff

Hoy la configuración se aplica desde cuatro ítems de menú distintos, en un orden que no
está escrito en ningún lado:

```
instalar()                      → crea hojas + corre 8 migraciones
seedConfiguracion()             → BASES, MAPEO, CONFIG
sembrarClasificacionSolapas()   → SOLAPAS
menuSembrarSecciones_()         → SECCIONES
```

Preguntar "¿el cambio ya está aplicado?" tiene cuatro respuestas posibles y ninguna forma
de verificarlo. Eso fue exactamente lo que pasó con la Parte C.

### Tareas

1. **`menuAplicarConfiguracion_()`** — un ítem que corre los cuatro en orden fijo y
   documentado. Los cuatro individuales quedan (sirven para depurar) pero bajan a un
   submenú `Avanzado`.
2. El resultado es un **diff, no un conteo**: por hoja, qué filas se crearon, cuáles
   cambiaron y **de qué valor a qué valor**, y cuáles se respetaron por ser `origen=manual`.
   Un "BASES — actualizadas: 1" no dice si se aplicó lo que se quería.
3. **`menuEstadoConfiguracion_()`** — sólo lectura, no escribe nada. Por cada hoja de
   registro: filas, distribución de `origen` (`seed` / `manual` / `auto`), y **discrepancias
   entre el `SEED_*` del código y lo que hay en la planilla**. Es la respuesta a "¿en qué
   estado está esto?" sin tener que correr nada que modifique.

### Criterio de aceptación

Correr "Aplicar configuración" dos veces seguidas: la segunda no reporta ningún cambio.
`menuEstadoConfiguracion_()` reporta cero discrepancias entre código y planilla.

---

## Parte D — Menú por función, migraciones con vencimiento

32 ítems de menú, la mayoría nombrados por el prompt que los creó
(`Diagnosticar colapso del lector (Paso 2.9A)`, `Auditar digital/Digital/alcance (Parte B)`,
`Comparar resúmenes de looker (Parte G)`). Dentro de seis semanas nadie va a saber cuáles
siguen sirviendo.

Y ocho migraciones one-off corren en cada `instalar()` para siempre:
`backfillSolapaMapeo_`, `eliminarMapeoAlcanceDigitalObsoleto_`, `alinearMapeoLookerADinamico_`,
`alinearSolapasLookerADinamico_`, `corregirNotaControlAnclaje_`, `reclasificarSolapasM2Invertidas_`,
`alinearBasesHojaDefaultLooker_`, `migrarCalculoAOperacion_`.

### Tareas

1. Renombrar los ítems de menú por **lo que hacen**, no por el paso que los pidió. La
   referencia al paso va en el comentario de la función, no en la etiqueta.
2. Agrupar en submenús: `Configuración`, `Correr`, `Verificar`, `Diagnósticos`, `Avanzado`.
3. **Retirar los diagnósticos de hipótesis ya cerradas.** `menuDiagnosticarColapsoLector_`
   (Paso 2.9A) investigaba un colapso que `VALIDACION §1.1` descartó: `m2` devuelve 18
   porque hay 18 filas reales. Dejarlo en el menú invita a re-abrir algo resuelto.
4. Cada migración `alinear*_` / `corregir*_` / `migrar*_` lleva en su comentario **en qué
   commit se introdujo y qué condición la vuelve innecesaria**. Las que ya no pueden
   dispararse —porque `SEED_*` produce el estado correcto de entrada— se borran, no se
   dejan "por las dudas".
5. `docs/RUNBOOK.md`: una tabla de ítem de menú → qué hace → cuándo se usa.

### Criterio de aceptación

Ningún ítem de menú menciona un número de paso. `instalar()` corre las migraciones que
quedan y reporta cero cambios sobre una planilla ya aplicada.

---

## Lo que sigue después, y en qué orden

Con esto cerrado, el orden vuelve a ser lineal y cada paso tiene una sola forma de
aplicarse:

1. **`Paso-2.10` Parte B** — `filas_datos` / `filas_crudas`. Quedó a medias: la columna
   existe pero ningún sembrador la llena, así que el criterio de aceptación no se puede
   chequear. Verificar contra la tabla de doce valores medidos de
   `Paso-2.10_PartesBC_verificado.md`.
2. **`Paso-2.10_ParteD_con_R10`** — R-10 en código, después la hoja `VALIDACION`.
3. **`Paso-2.10` Parte E** — corte vertical a Orden Público 28/07.
4. **`Paso-2.10` Partes G y A** — `REUNIONES` y el handoff.

R-06 y R-09 siguen sin implementar y están anotadas en `PENDIENTES_consistencia.md`. No
entran acá: tocan el anclaje, que es Paso 3.
