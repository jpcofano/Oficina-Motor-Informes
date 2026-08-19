# 2026-08-19_2 — El panel por secciones: un cuadrado por fuente, temario o ventana

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que el panel muestre **el estado de carga por sección** y permita **pegar el
> temario desde ahí**, con un botón **Proponer** que precarga lo de la ventana del período.
>
> ⛔ **No cablea marcadores, no toca `MARCADORES`, no genera decks distintos.** Es el camino de
> entrada del usuario, no el motor.
>
> ⚠ **Corre en paralelo con `2026-08-19_1` y no lo pisa:** aquél toca `Campanas.gs` (una columna
> más en la fila), `SEED_SOLAPAS_`, el formateador y `MARCADORES`. **Éste toca `PanelBackend.gs`,
> `Panel.html` y `Reuniones.gs`.** Si los dos están en vuelo, **este prompt se ejecuta después** —
> la Parte 0 verifica si el `_1` ya entró.

---

## Las decisiones del usuario, 19/08 — el enunciado del que sale todo

1. **Se decide cada sección.** Un cuadrado por sección, con su título.
2. **La sección que se carga por temario tiene su caja de texto.**
3. ⭐ **Un solo cuadrado alimenta `encuentro` y `comunicaciones_post`** — comparten `REUNIONES`.
4. ⭐ **El cuadrado nace VACÍO**, con un botón **Proponer** que trae lo de la ventana del período.
5. **Lo que no tiene temario va por ventana**, y el default es la semana.

### Lo que el punto 3 implica, y conviene decirlo antes de escribir código

**La unidad del cuadrado NO es la sección: es la fuente de temario.** `encuentro` y
`comunicaciones_post` son dos secciones, iteran las dos sobre `REUNIONES`, y lo que las separa es
el **filtro** (`etapa=post`), no la carga. **Un temario, dos secciones.**

Entonces: **un cuadrado por `itera_sobre` distinto**, y el cuadrado **nombra las secciones que
alimenta**. Las secciones sin temario siguen teniendo su cuadrado propio, que muestra la ventana.

⚠ **Y por qué esto no es una licencia sino la regla:** el día que aparezca una tercera sección
sobre `REUNIONES`, con un cuadrado por sección habría **tres cajas escribiendo en la misma hoja** —
y `cargarTemarioReuniones_` hace **append ciego**, así que serían **tres copias de cada fila**.

---

## Parte 0 — medir. Sólo lectura. **Reportar y parar.**

> **Modelo: Sonnet · effort medio.**

1. **¿Entró el `2026-08-19_1`?** Reportar si `cargarTemarioCampanas_` ya escribe `id_cuenta` y si
   `SEED_SOLAPAS_` declara `campo_id_cuenta` en `looker/resumen_metricas_dinamico`. **No es
   bloqueante**, pero el reporte tiene que decirlo.
2. **El panel hoy.** Qué funciones `panel_*` existen (`PanelBackend.gs`) y qué devuelve
   `panel_getEstado`. Al 19/08: `informes`, `informe_activo`, `periodos`, `por_defecto` — y
   **ninguna función de carga de temario**.
3. **`Panel.html`** — cuántas líneas, qué secciones de UI tiene, y **si hay algún lugar donde hoy
   se pegue texto**. Reportar, sin rediseñar.
4. **El mapa de cuadrados de `jm`**, derivado de `SECCIONES` y no escrito a mano. Al 18/08:

   | fuente | secciones que alimenta |
   |---|---|
   | `REUNIONES` | `encuentro` (8), `comunicaciones_post` (9, `etapa=post`) |
   | `CAMPANAS` | `campana` (13) |
   | *(sin temario)* | `portada`, `portada_digital_directa`, `cierre`, `m2`, `ecv_alcance_semanal` |
   | *(manual)* | `resumen_ejecutivo` — es redacción, no dato |

   ⚠ **Reportar también el mapa de `secco`**, que tiene 29 secciones y varias `itera_sobre` que
   **no son fuentes de iteración** —`AUDIENCIAS`, `red social`, `proveedor`, `tema`,
   `remitente (JM / GCBA)`—. **El panel no puede ofrecer una caja de temario para ésas**: no hay
   hoja donde escribir.
5. ⭐ **El append ciego de `REUNIONES`, confirmado y con su clave.** Verificar que
   `cargarTemarioReuniones_` escribe con `getRange(getLastRow() + 1, …)` sin mirar lo existente, y
   **reportar qué combinación de columnas identificaría una fila repetida** —candidatas:
   `periodo_id` + `eje` + `nombre` + `fecha`—. **Medir cuántas filas de `REUNIONES` colisionarían
   hoy con esa clave** (al 18/08 la hoja tenía 13 filas de datos).
   ⛔ **Gate: si la clave candidata ya tiene colisiones legítimas en la hoja actual, parar y
   reportar cuáles.** Una clave que declara duplicado algo que no lo es sería peor que el append.
6. **Los dos cargadores, comparados.** `mostrar` de cada uno: `parsearLineaReunion_` **nunca** marca
   `mostrar = 'sí'` sola —la persona confirma—; `cargarTemarioCampanas_` **sí** lo pone (`AJ-1`,
   *ante la duda entra*). **Son dos criterios distintos para el mismo gesto**, y el panel los va a
   poner uno al lado del otro. **Reportar, no unificar.**
7. **`SECCIONES.periodo_ref`** — confirmar que sigue vacía en las 36 secciones. Es el eslabón 3 de
   `D-20` y **nunca se disparó**.
8. **Las fuentes de la propuesta**, sólo para confirmar que existen:
   - `rdv/RVD JM-CM - ES` mapea `fecha` (E), `figura` (A), `barrio` (B), `evento` (C), `status` (I);
   - `catalogoDeCampanas_()` devuelve `{ id, nombre, desde, hasta }` desde
     `digital/Seguimiento digital`.

**Reportar todo junto y parar.**

---

## Parte A — el modelo de cuadrado, en el backend

> **Modelo: Opus · effort alto.** Define la forma que el HTML va a consumir y que va a costar
> cambiar después.

`panel_getEstado` gana un bloque **`cuadrados`** por informe. Cada cuadrado:

```
{
  clave,            // 'REUNIONES' | 'CAMPANAS' | 'seccion:portada' | …
  titulo,           // el nombre que ve la persona
  modo,             // 'temario' | 'ventana' | 'manual'
  secciones: [ { id, nombre, filtro } ],   // las que alimenta
  temario: {        // sólo si modo = 'temario'
    filas_cargadas,             // para el periodo elegido
    sin_confirmar,              // ids por similitud, o `mostrar` vacío
    puede_proponer              // si hay proponedor para esa fuente
  },
  ventana: {        // sólo si modo = 'ventana'
    etiqueta, desde, hasta, origen
  }
}
```

**Tres reglas de derivación, y ninguna se escribe a mano:**

1. **`modo = 'temario'`** cuando la sección es `repetible` **y** su `itera_sobre` está en
   `FUENTES_ITERACION_`. **Las secciones se agrupan por `itera_sobre`**: un cuadrado por fuente.
2. **`modo = 'manual'`** cuando `SECCIONES.estado = 'manual'`. **No se ofrece caja ni ventana** —
   `resumen_ejecutivo` es redacción y `analisis_comparativo` no está marcado en la plantilla.
3. **`modo = 'ventana'`** en el resto.

⚠ **Y el caso que NO puede caer en la 1 por descuido:** una sección `repetible` cuyo `itera_sobre`
**no** es fuente de iteración —`AUDIENCIAS`, `tema`, `proveedor`, `red social`— **no tiene hoja
donde escribir**. Va con `modo = 'ventana'` **y un motivo declarado**: *"itera sobre `X`, que no es
un registro del motor"*. **Ofrecerle una caja de temario sería una caja que no escribe en ningún
lado**, y eso es peor que no ofrecerla.

**`ventana` se muestra y NO se edita en este prompt.** Se reporta la que `resolverVentana` resuelve
hoy, **con su `origen`**. ⛔ **Escribir en `SECCIONES.periodo_ref` queda fuera**: es el eslabón 3 de
`D-20` y toca la pieza faltante —`informe_id` y el `periodo_id` de la corrida en la cadena—, que
está en `PLAN.md` §3 y **se resuelve entera o no se toca**.

---

## Parte B — **Proponer**

> **Modelo: Opus · effort alto.** Es donde el diseño se puede romper solo.

**Dos proponedores, uno por fuente. Sólo lectura.**

### ⭐ La regla que gobierna los dos: **Proponer devuelve TEXTO, no filas**

**El proponedor arma el texto del temario y lo pone en la caja. No escribe una sola fila.** La
persona lo lee, lo edita, y recién entonces aprieta cargar — **el mismo cargador, la misma
confirmación**.

⚠ **Por qué, y es `R-02` literal:** *el temario define el universo del informe, no la fecha*. Si
Proponer escribiera filas, **la ventana estaría eligiendo qué entra al deck**, que es exactamente
lo que `R-02` prohíbe. Con texto en una caja vacía, **lo que entra sigue siendo lo que una persona
pegó** — y el botón es una comodidad de tipeo, no una fuente de verdad.

**Segunda consecuencia, del mismo lado:** el texto propuesto **es editable, y va a hacer falta**.
Un encuentro puede estar en `rdv` y no ir al informe, o ir con otro nombre.

### B.1 · Proponer reuniones ← `rdv/RVD JM-CM - ES`

Filas cuyo `fecha` (col E) cae en la ventana. Una línea por fila, en el formato que
`parsearLineaReunion_` **ya sabe leer** —con `|`, que ese parser exige—, con `figura`, `evento`,
`barrio` y la fecha.

⚠ **`status` (col I) NO filtra: se muestra.** `rdv` es la fuente de verdad de fecha y estado, y un
encuentro cancelado o reprogramado **tiene que verse en la propuesta para que la persona lo saque**
— sacarlo automáticamente sería la ventana eligiendo otra vez. Va como texto entre paréntesis, que
es donde el parser lo manda a `notas`.

### B.2 · Proponer campañas ← `catalogoDeCampanas_()`

Campañas cuyo `desde`/`hasta` **solapa** la ventana. Formato `N) Nombre`, que es lo que
`parsearLineaCampana_` lee, **con el encabezado `> Campañas destacadas`** — sin ese encabezado el
cargador no encuentra el bloque y falla con motivo.

⚠ **El nombre que se propone es el de la base** (`Nombre campaña | Cuentas`), no el del deck. Así
la resolución nombre → id **acierta sola** y no hay `SIN CONFIRMAR` que revisar. Es la diferencia
entre proponer y adivinar: **se propone el texto que ya se sabe que resuelve.**

⚠ **Solape, no contención.** Los períodos declarados abarcan varias semanas —*24/06 al 08/07*,
*19/06 al 17/07*— así que exigir que la campaña **empiece** dentro de la ventana dejaría afuera
justo las largas, que son las destacadas.

### B.3 · Lo que los dos reportan

**Cuántas filas propusieron y cuántas quedaron afuera, con el motivo.** Una propuesta vacía **dice
por qué** —ventana sin filas, o base ilegible— en vez de devolver una caja vacía indistinguible de
*"no hay nada esta semana"*.

---

## Parte C — que `REUNIONES` deje de duplicar

> **Modelo: Opus · effort alto.** Toca un escritor de hoja de registro.

`cargarTemarioReuniones_` pasa a **saltear lo que ya existe**, copiando el comportamiento que
`cargarTemarioCampanas_` ya tiene: fila existente **se reporta y no se escribe**.

**La clave sale de la Parte 0 punto 5, medida contra la hoja. No se elige acá.**

⚠ **Por qué entra en este prompt y no queda para después:** el panel va a poner el botón de cargar
a un clic, **y el append ciego convierte un doble clic en trece filas duplicadas**. Hoy el gesto
está detrás de un menú y un prompt de texto; el panel lo abarata, y **abaratar un gesto destructivo
sin arreglarlo primero es lo que lo hace pasar**.

**No se toca `parsearLineaReunion_`, ni el criterio de `mostrar`.** El punto 6 de la Parte 0 queda
**reportado y sin unificar**: que los dos cargadores difieran en `mostrar` es una decisión del
usuario, no de este prompt.

---

## Parte D — el HTML

> **Modelo: Sonnet · effort medio.** Consume lo que la Parte A ya definió.

Un cuadrado por entrada de `cuadrados`, con su título y las secciones que alimenta. Los de
`modo = 'temario'`: **caja vacía**, botón **Proponer**, botón **Cargar**, y debajo lo que hay
cargado para ese período. Los de `modo = 'ventana'`: la ventana y su origen, sin controles. Los de
`modo = 'manual'`: el motivo.

**Usar `design/` —tokens y componentes— y no inventar estilos.** ⚠ **Nada de lógica de negocio en
el HTML:** qué secciones alimenta un cuadrado y qué modo tiene **lo decide el backend**; si el HTML
lo deriva, hay dos definiciones del mismo mapa y **la del HTML no tiene prueba**.

---

## Parte E — verificar

> **Modelo: Sonnet · effort medio.**

1. **El mapa de cuadrados de `jm`**: `REUNIONES` (2 secciones), `CAMPANAS` (1), y los de ventana.
   **`encuentro` y `comunicaciones_post` en UN cuadrado**, no dos.
2. **`secco` no ofrece caja para `AUDIENCIAS`, `tema`, `proveedor`, `red social` ni
   `remitente (JM / GCBA)`** — van a ventana con motivo.
3. ⭐ **Cargar dos veces el mismo temario de reuniones NO duplica.** Control positivo, en `tools/`,
   sin planilla. **Y el control negativo: un temario con una fila nueva SÍ la agrega** — sin él,
   un cargador que no escriba nunca pasaría el control principal.
4. **Proponer no escribe.** Después de apretarlo, `REUNIONES` y `CAMPANAS` tienen **exactamente las
   mismas filas** que antes. Verificado contra snapshot, no contra el reporte.
5. **Proponer campañas devuelve nombres que resuelven**: pegar la propuesta tal cual y cargar da
   **cero `SIN CONFIRMAR`**.
6. **`node tools/listas.js` pasa**; snapshots versionados antes y después.

---

## Lo que este prompt **no** hace

- ⛔ **No escribe en `SECCIONES.periodo_ref`.** El eslabón 3 de `D-20` se resuelve entero o no se
  toca — arrastra la pieza faltante de `PLAN.md` §3.
- ⛔ **No unifica el criterio de `mostrar`** entre los dos cargadores. Se reporta.
- ⛔ **No hace que Proponer escriba filas.** `R-02`: el temario elige, la ventana calcula.
- **No toca `MARCADORES`, ni el motor de generación, ni `panel_generar`.**
- **No cambia `resolverIdDeCampana_`, umbrales ni `CAMPANAS_equivalencias`.**
- **No agrega fuentes de iteración.** `AUDIENCIAS` y las demás siguen sin hoja, y eso queda visible
  en el panel en vez de escondido.
