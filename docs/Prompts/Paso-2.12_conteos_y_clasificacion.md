# Paso 2.12 — Conteos coherentes y clasificación cerrada

> Destino: `docs/Prompts/Paso-2.12_conteos_y_clasificacion.md`
> Corre **después** de `Paso-2.11` Parte B (ya commiteada) y **antes** de `Paso-2.11`
> Partes C y D. Cierra lo que quedó abierto de `Paso-2.10` Parte B.
> Un commit por parte. **Trabajamos en español.**

---

## Parte 1 — `filas_crudas` deja de restar el encabezado

### El hecho

De las 84 filas de `SOLAPAS`, **65 tienen `filas_datos = filas_crudas + 1`**, exactamente
+1, sin una sola excepción. Catorce de esas son `uso=fuente`, entre ellas
`digital/Directa Mail` (2114/2113), `looker/MAIL` (5759/5758) y
`digital/Directa IVR` (58/57).

Un subconjunto no puede ser mayor que el conjunto. Las dos columnas cuentan el encabezado
de forma distinta:

- `filas_datos` = filas no vacías, **incluye** el encabezado (definición elegida en
  `Paso-2.10_PartesBC_verificado.md`, Parte B)
- `filas_crudas` = quedó con el `getLastRow() - 1` viejo de `Solapas.gs`, que lo **resta**

### Consecuencia

**El guardarraíl del 90% no puede dispararse.** El cociente da más de 100% en 65 de 84
filas. Ese guardarraíl es el entregable central de `Paso-2.10` Parte B, así que hoy esa
parte está a medias aunque el código esté escrito.

### Tarea

`filas_crudas = hojaSheet.getLastRow()`, sin el `- 1`. Nada más.

### Criterio de aceptación

1. **Invariante:** `filas_datos <= filas_crudas` en las 84 filas. Si alguna lo viola, hay
   otra definición desalineada y hay que encontrarla, no ajustar el número.
2. El guardarraíl se aplica **sólo a `uso=fuente`** — un `ignorar` con 4% de filas llenas
   no es un problema, es una hoja muerta.
3. Con la clasificación de la Parte 2 aplicada, **exactamente dos `fuente` disparan ⚠**, y
   las dos están explicadas:

   | solapa | ratio | por qué |
   |---|---|---|
   | `rdv/RVD JM-CM - ES` | 721 / 1363 = **53%** | relleno de fórmula; 720 encuentros reales |
   | `digital/Cuentas` | 3459 / 4399 = **79%** | relleno de fórmula al final de la hoja |

   Si dispara una tercera, es un hallazgo. Si no dispara ninguna, el guardarraíl sigue roto.
4. `m2/M2 periodo DIRECTA` reporta **22 / 29.534 = 0,07%**. Ese número cierra la hipótesis
   del colapso del lector medido sobre la planilla viva, no sobre un archivo descargado.

---

## Parte 2 — Clasificación cerrada: las 17 filas en `revisar`

Decidido en conversación el 31/07 contra la firma de encabezados y los conteos reales.
**Ninguna fila queda en `revisar`.** Criterio general: ante la duda, `ignorar` — si más
adelante hace falta, se cambia.

### A `fuente` (2)

| solapa | filas | por qué |
|---|---|---|
| `digital/CAMPAÑAS_DESGLOCE_DIGITAL` | 4580 | tabla original con encabezados en fila 1, sin recorte por período. Los casos V-21 a V-26 de `VALIDACION` la usan y resuelven |
| `digital/Cuentas` | 3459 | catálogo maestro. `ID Cuentas` es **clave única real**: 3.453 filas, 3.453 valores distintos, cero vacíos — la única columna así en las cuatro bases |

### A `referencia` (3)

| solapa | filas | por qué |
|---|---|---|
| `digital/EDV` | 291 | funcionarios/figuras por fecha (confirmado por el usuario) |
| `rdv/Comunas` | 68 | barrio → población; es el origen de la columna `Poblacion` de RDV |
| `looker/Audiencias` | 304 | catálogo de segmentaciones |

### A `ignorar` (12)

| solapa | filas | por qué |
|---|---|---|
| `m2/CAMPAÑAS_DESGLOCE_DIGITAL` | 4580 | copia exacta de la de `digital` (mismo conteo) |
| `m2/Alcance` | 738 | copia exacta de `digital/Alcance` y `looker/ALCANCE` |
| `m2/Seguimiento digital` | 980 | copia exacta de `digital/Seguimiento digital` |
| `m2/Cuentas` | 3458 | mismo universo que `digital/Cuentas` (3459), que queda como fuente |
| `looker/Cuentas` | 966 | es el origen de `resumen_metricas_dinamico`, que ya es fuente |
| `looker/URLs` | 2114 | links a piezas creativas; además tiene `id_cuentas` y `nombre_campaña` duplicados en el encabezado |
| `looker/Desglose Alcance` | 270 | `looker/ALCANCE` ya da el alcance por cuenta |
| `looker/Audiencias Conectadas` | 2 | 1 fila de datos |
| `digital/Filter unificado` | 80 | la fila 1 son dos fechas — no tiene encabezados |
| `rdv/RDV CONJUNTO` | 753 | no entra al informe (confirmado por el usuario) |
| `m2/M2 Directa` | 34 | `m2` quedó `sin_fuente` en `Paso-2.10` Parte C |
| `m2/M2 digital` | 68 | ídem |

> `m2/M2 Directa` y `M2 digital` se ignoran **porque hoy no hay a qué engancharlas**, no
> porque no sirvan. Si la lista curada de campañas M2 termina viviendo en `CAMPANAS`,
> `M2 Directa` es el detalle que corresponde. Dejarlo escrito en `notas`.

### ⚠ Dos de las 17 tienen `origen=manual` y el sembrador NO las va a tocar

```
rdv/RDV CONJUNTO   revisar  manual  → ignorar
rdv/Comunas        revisar  manual  → referencia
```

`sembrarClasificacionSolapas()` protege `origen=manual` a propósito, así que editar
`SEED_SOLAPAS_` **no alcanza** para estas dos. Hace falta una de dos cosas, y hay que
elegir explícitamente:

- una migración idempotente puntual, con la condición de vencimiento escrita (el patrón de
  `reclasificarSolapasM2Invertidas_`); o
- dejarlas para edición a mano en la planilla, y decirlo en el reporte del paso.

**Lo que no puede pasar es que el paso reporte "17 actualizadas" y en la hoja hayan cambiado
15.** Ese es exactamente el modo de falla que el proyecto viene persiguiendo.

### Criterio de aceptación

Cero filas en `uso=revisar`. El reporte dice cuántas cambió y cuántas quedaron pendientes
por ser `manual`, por separado.

---

## Parte 3 — Retirar `reclasificarSolapasM2Invertidas_`

Esa migración fuerza `m2/M2 Directa` y `m2/M2 digital` a `uso=revisar` con
`NOTA_M2_INVERTIDA_` **en cada `instalar()`**. Con la Parte 2 aplicada, va a revertir las
dos a `revisar` en la próxima corrida.

Además su premisa ya no vale: la nota dice "clasificación invertida, pendiente de confirmar
(Paso 2.9 Parte C.5)", y `Paso-2.10` Parte C descartó que fuera una inversión —
`M2 periodo DIRECTA` es un `GROUP BY id_cuenta` sobre `M2 Directa`, verificado con
intersección exacta de los 18 ids.

### Tarea

Borrar `reclasificarSolapasM2Invertidas_`, `SOLAPAS_M2_INVERTIDAS_` y `NOTA_M2_INVERTIDA_`,
y su llamada en `instalar()`. Dejar constancia en `BITACORA.md` de por qué se retira, con
el commit que la introdujo.

Es el primer caso concreto de la regla que la Parte D del `Paso-2.11` va a generalizar:
**una migración con la premisa vencida no se deja "por las dudas"**.

### Criterio de aceptación

Correr "Aplicar" y después "Instalar / reparar hojas": `m2/M2 Directa` y `M2 digital`
siguen en `ignorar`. Hoy volverían a `revisar`.

---

## Nota sobre R-08 y R-09 — no se implementa acá, pero cambia lo escrito

`digital/Cuentas` como fuente afecta dos reglas de `REGLAS_NEGOCIO.md`. No corresponde
tocarlas en este paso, pero conviene registrarlo antes de que alguien implemente la versión
vieja:

**R-09 pasa de indirecta a directa.** La regla dice hoy que la cancelación sólo se detecta
mirando si el último envío es de tipo `Cancelación`. `Cuentas` la marca explícitamente:

```
3347-JULJDGAG   TE CUENTO BS AS JM | 21/7 ORDEN PÚBLICO EJE NORTE   Estado campaña = Cancelada
3387-JULJDGGC   TE CUENTO BS AS JM | 28/7 ORDEN PÚBLICO EJE NORTE   Estado campaña = Implementación total
```

218 canceladas sobre 3.453. Vocabulario completo de `Estado campaña`, para la tabla de R-09:

```
entra:     Finalizada (3096) · Implementación total (43) · Implementación parcial (40)
no entra:  Cancelada (218)
a decidir: Pausada (17) · Pendiente material (24) · Pendiente implementación (7)
           Pendiente PM (6) · Testeando (1)
```

**R-08 se ablanda pero sigue siendo curada.** `Cuentas.Campaña` trae el nombre **corregido
con el 28/7**, mientras `Directa Mail` seguía diciendo 21/7 — o sea que el match contra
`Cuentas` funciona donde el match contra la solapa de envíos fallaba. Pero el join duro no
se puede usar todavía: `Funcionario`, `Fecha` y `Barrio` están cargados en **725 de 3.453
filas (21%)**, y justo al revés de lo conveniente — la cancelada `3347` los tiene, la
activa `3387` los tiene vacíos.

La conclusión cambia de "el dato no existe" a **"el dato existe como columna y está sin
cargar"**. Si el equipo completa esas tres columnas en las cuentas de reunión, el anclaje
deja de necesitar similitud. Vale como pregunta para el equipo, junto a las siete de
`VALIDACION §7`.

Dato menor: `Cuentas` tiene una columna `Validación Estado` con 52 filas en `Revisar` —
una marca humana de "esto hay que mirarlo". `3387-JULJDGGC`, la cuenta del corte vertical
de la Parte E, es una de las 52.
