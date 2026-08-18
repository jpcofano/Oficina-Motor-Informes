# 2026-08-18_1 — El plan de cableado, después de medir

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** ordenar qué se cablea y en qué orden, **con las familias que la medición
> sacó de la lista**. No cablea nada: cada tanda es su propio prompt.

---

## ⚠ Lo que la medición del 18/08 cambió, y es casi todo

**La hipótesis era que `camp_*` y `post_*` eran una dimensión `campaña` y entraban como tanda 5 de
la migración. NO LO SON, y tampoco son cableado.**

### `camp_*` y `post_*` son **familias de secciones repetibles**, no marcadores

Medido sobre `SECCIONES_2026-08-18.tsv` y `Generador.gs`:

| sección | modo | itera sobre | filtro | familia | ítems/lámina |
|---|---|---|---|---|---|
| `campana` (orden 13) | **repetible** | **`CAMPANAS`** | — | `camp_` | 1 |
| `comunicaciones_post` (orden 9) | **repetible** | **`REUNIONES`** | `etapa=post` | `post_` | **4** |

**El corte de `camp_*` NO es un filtro ni un nombre: es la iteración misma.** Una campaña, una
emisión. **Ese mecanismo ya existe y ya funciona** — es el mismo que emite el bloque de encuentro.

⚠ **Y las cuatro ranuras de `post_*` no son cuatro campañas: son `items_por_lamina = 4`** sobre
`REUNIONES` filtrada por `etapa=post`. **Cuatro comunicaciones post-encuentro, no cuatro
campañas.** La intuición de que "huelen al mismo patrón" era correcta; la fuente, no.

### La respuesta a la pregunta de `D-20`: **la campaña ya es contexto, no corte**

`CAMPANAS` tiene `desde`/`hasta` y es **el primer eslabón de la cadena de ventana** (`D-20`). Y la
iteración la convierte en **el ítem**. Así que la campaña **ya está funcionando como contexto por
dos vías**, exactamente la alternativa que se planteó al pedir la medición.

**Convertirla en dimensión sería duplicarla**: un corte `campaña=X` sobre una sección que ya emite
una lámina por campaña daría el mismo recorte dos veces, por dos mecanismos distintos.

**Conclusión: `camp_*` y `post_*` NO entran como tanda 5. La migración sigue cerrada en 42 de 48.**

### ⛔ Por qué `camp_*` no publica hoy — **es un hueco de DATO, y no se arregla cableando**

`itemsDeSeccion_` filtra `CAMPANAS` por **`informe_id` + `mostrar = sí` + `periodo_id` no vacío**
(`D-19`). La hoja viva tiene **tres filas**:

| campana_id | informe_id | mostrar | periodo_id |
|---|---|---|---|
| `serv_esenciales` | **secco** | sí | **vacío** |
| `encuentros_min` | **secco** | sí | **vacío** |
| `prov_uber` | **secco** | no | **vacío** |

**Cero filas para `jm`, y las tres sin `periodo_id`.** Entonces la sección emite **cero ítems para
todos los informes** — `D-19` las excluye a las tres, y con razón: *sin `periodo_id` la fila no
entra a ningún informe*.

⚠ **Los ~55 tokens `camp_*` no publican porque NO HAY CAMPAÑAS CARGADAS, no porque falte
cablearlos.** Cablear marcadores contra una iteración vacía **no cambiaría un solo token** — y
peor: daría cero sin fallar, que es el modo de falla más caro del proyecto. **Lo que lo destraba es
que alguien cargue campañas con `periodo_id`.**

### Dos hallazgos laterales, que se reportan y no se resuelven acá

1. ⚠ **`itera_sobre` mezcla dos vocabularios.** `FUENTES_ITERACION_` sólo conoce `REUNIONES` y
   `CAMPANAS`; la hoja además dice `AUDIENCIAS`, `remitente (JM / GCBA)`, `red social`,
   `proveedor`, `tema`. **Las que no son de las dos no se expanden** —el motor lo reporta y no
   inventa fuente, que es correcto— pero **conviven nombres de registro con prosa** en la misma
   columna.
2. ⚠ **`campana_desag_respuestas` itera sobre `remitente (JM / GCBA)`, que ES `ambito`.** Un corte
   ya declarado en `D-33`, escrito como texto libre en otra columna. **Es candidato a dimensión de
   verdad** — al revés que `camp_*`. No se toca acá: la sección está en `revisar`.

---

## Lo que la medición NO cambió, y una corrección propia

- **El frente 10 quedó desbloqueado** y ya está corregido en `PLAN.md`: **cero marcadores apuntan a
  `digital/Digital`**. Faltan **dos** —`enc_visualizaciones`, `enc_clics`—, no tres:
  `enc_impresiones` ya existe.
- ⚠ **`periodo` NO necesita marcador, y es un falso positivo de mi propio censo.**
  `{{periodo}}` **lo produce la generación** (`Generador.gs`: *"es el encabezado de la lámina"*),
  no un marcador. **Cablearlo sería crear la segunda fuente** que la pregunta anticipaba. Sale de
  la lista de sueltos.
  - **Y es el límite del instrumento, dicho:** `censarTokensSinMarcador()` mide *"sin fila en
    `MARCADORES`"*, y hay tokens que **correctamente nunca la van a tener**. El censo está bien;
    la lectura *"sin fila ⇒ hay que cablearlo"* es la que está mal.

---

## El orden, corregido por la medición

| # | qué | cuántos | por qué acá |
|---|---|---|---|
| **1** | **Los sueltos** — `alcance`, `clics`, `contenidos_total`, `ecv_barrio1-3`, `m2_campanias` | ~9 | **Láminas que HOY publican** (1, 2, 5, 11): cada uno tapa un agujero visible. **Sin `periodo`** |
| **2** | **La lámina 8** — los 34 `u1_*` del "1 a 1" | 34 | Lámina entera, un solo tema, y el usuario ya puso las cajas |
| **3** | **`rrss_*`** (lámina 23) | 21 | Familia limpia, lámina propia |
| **4** | **Las dos escondidas** — 12 (`m2_*`) y 21 (`camp_resp_*`) | 38 | **No salen en ningún deck**: valor real cero hasta que se muestren |
| ⛔ | **`camp_*`** (láminas 14–20) | ~55 | **NO es cableado.** Bloqueado por `CAMPANAS` vacía — ver arriba |
| ⛔ | **`post_*`** (lámina 9) | 32 | **NO es cableado.** Sección repetible sobre `REUNIONES`/`etapa=post` |
| ⛔ | **`cc_*`** | 10 | Decidido: publican `—` por `_32.2`. No se reabre |

**El cambio respecto del orden propuesto: `camp_*` y `post_*` salían de la lista de cableado, así
que la primera tanda es más chica y más barata de lo que parecía** — y las dos familias más
grandes no eran trabajo de cableado sino de datos y de sección.

---

## La regla que gobierna todas las tandas

**Todo marcador nuevo nace con el corte en `dimensiones`. Nunca en `filtro`, nunca en el nombre.**
`CLAUDE.md` §2 y `D-33` addendum 2.

⚠ **La primera tanda es la prueba de que la regla se sostiene fuera de una migración**, y por eso
su reporte tiene que decir, marcador por marcador, **qué quedó en `dimensiones` y qué en `filtro`,
con el motivo**. Una guarda técnica en `filtro` **es correcta** —`enc_impresiones` lleva
`imp_totales!=0`— y confundirla con deuda sería el error simétrico.

---

## Antes de la tanda 1: lo que hay que medir de los nueve sueltos

**No cablear sobre un universo no declarado** (`CLAUDE.md` §4, el caso de la lámina 5). Por cada
uno, **antes** de escribir la fila:

1. **De qué filas sale** — base, solapa, y **quién declaró el recorte**.
2. **Que su campo esté en `MAPEO`** — `buscarMapeo(base, solapa, campo)` antes de la primera celda.
   Un filtro propio cuyo campo no mapea **no filtra: falla**.
3. **Si lleva corte**, va a `dimensiones`; si lleva guarda técnica, a `filtro`. **Decir cuál y por
   qué.**
4. ⚠ **`m2_campanias` espera una definición del usuario** (`LISTA + CUENTA(LISTA)`), así que
   **puede no entrar en la tanda 1**. Se reporta, no se inventa.

---

## Lo que este prompt **no** hace

- **No cablea ningún marcador.** Cada tanda es su propio prompt.
- **No toca `CAMPANAS`** — cargar campañas es del equipo, y `D-19` es explícita.
- **No convierte la campaña en dimensión.** Medido: ya es contexto.
- **No reabre `cc_*`.**
- **No toca `SECCIONES`** — los dos hallazgos laterales quedan reportados.
