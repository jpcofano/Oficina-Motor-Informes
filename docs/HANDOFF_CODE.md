# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-10, al cerrar el `_23` · último commit al escribirlo: `d55efdb`

## Dónde estamos

**`looker/DIGITAL` se puede leer.** Era la última pieza que faltaba para los tres `imp_*`: la
solapa tiene el corte, el filtro y el desglose pero **ninguna columna temporal** (`C-19`), y
ahora toma la ventana de `looker/Cuentas` por pertenencia — `R-25`, declarada en
`SOLAPAS.ventana_ref` + `MAPEO.clave_ventana` (`D-24`).

```
looker/DIGITAL   4896 filas · 966 en ventana 2026-07-24 → 2026-07-30
                 3765 fuera · 18 sin clave · 147 huérfanas (31 ids)
looker/Cuentas   1011 filas · 1011 ids distintos, cero repetidos · 92 en ventana
control          Cuentas por referencia contra sí misma = recorte directo (92 y 92)
pruebas del diff 11/11 verde · verificarLaminas() VERDE 51/51/51
```

**El siguiente es el cableado de los tres `imp_*`, y ya tiene todo:** fuente `looker/DIGITAL`,
corte `nombre_campaña~=JM`, filtro `estado=Activa`, plataformas por `R-24` (Meta, Google ads, y
el resto **por resta**), ventana por referencia. Medido el 10/08: **51 filas** cumplen JM +
Activa, repartidas `Meta` 16 · `Google ads` 14 · `DV360` 21.

**Y recién después se cierra el `P0`:** `imp_total` y `gcba_imp_total` son derivados (`X-10`,
`V-59`) y se les retira la fuente propia **cuando existan los tres sumandos**, nunca antes. El
orden está desde el `10.1` §3 y no cambió.

## Lo que hay que hacer antes de cablear, y no es opcional

**`looker/DIGITAL` tiene cuatro filas de `MAPEO` que faltan.** Hoy sólo tiene `clave_ventana`.
Sin `nombre_campaña`, `estado`, `Plataforma` e `Impresiones` mapeados, los marcadores fallan —
`aplicarFiltroDeMarcador_` resuelve el campo con `buscarMapeo` y **un filtro propio cuyo campo no
está mapeado no filtra: falla**. Es el corolario de `CLAUDE.md` §4, y son cuatro celdas que valen
una llamada a `buscarMapeo` antes de la primera.

Columnas medidas el 10/08 sobre la solapa viva: `A Id cuentas · B Plataforma · C Impresiones ·
D Visualizaciones · E Clics · F nombre_campaña · G eje · H area · I estado`.

## Lo que dejó el `_23` y conviene no perder

- **`SOLAPAS` tiene una columna nueva, `ventana_ref`**, antes de `notas`. Vacío = la solapa tiene
  su propia `fecha_periodo`, que es el estado de las 100 y pico. **La única con valor es
  `looker/DIGITAL`.**
- **La referencia es de un solo nivel** y el segundo falla con motivo propio. El control positivo
  vive en `Pruebas.gs` (`probarReferenciaVentanaUnNivel_`) y le pasa un mapa de solapas
  **sintético** — por eso `validarReferenciaVentana_` recibe el mapa por parámetro.
- **`controlVentanaPorReferencia_()` es el control corrible de la capacidad**: recorta
  `looker/Cuentas` por los dos caminos y compara. Se corre por API, no escribe nada. Si algún día
  difiere, la capacidad está rota y se ve sin tocar `DIGITAL`.
- **`leerFuente` devuelve `encabezados`** (la fila de títulos tal cual se leyó). No es cosmético:
  resolver el nombre de la columna por afuera con `encabezadoEnColumna_` usa
  `BASES.fila_encabezado` en vez de `resolverFilaEncabezado_`, y donde difieran todas las claves
  saldrían vacías **sin fallar**.
- **`upsertPorClave_` blanquea toda columna que el objeto no traiga.** Se arregló sólo en
  `aplicarClasificacionSolapas_`; el genérico quedó igual y está en `PENDIENTES`. Antes de tocar
  un seed de `BASES`, `MAPEO`, `INFORMES` o `PERIODOS`, mirar qué columnas no declara.

## Esperando decisión tuya

- **147 filas de `DIGITAL` son huérfanas y 40 de ellas son JM.** Hoy no restan impresiones porque
  ninguna está `Activa`, **y ese cero es de hoy**. Si son cuentas dadas de baja o si `Cuentas`
  está incompleta lo sabe el equipo dueño de la base, no el motor (`D-10`).
- **`looker/CC` sigue `fuente` y sin una fila en `MAPEO`** (1309 filas). Si su período tampoco
  está en la solapa, el camino ya existe: el mismo `ventana_ref` a `Cuentas`.
- **`pauta_*` no tiene señal de figura.** Los seis siguen sin filtro, así que `pauta_*` y
  `gcba_pauta_*` publican el mismo número.
- **`R-20` y `R-21` están escritas y sin mecanismo.**
- **¿`upsertPorClave_` pasa a preservar por defecto**, o cada sembrador se hace cargo como el de
  `SOLAPAS`? Lo primero es una línea con radio de cuatro hojas; lo segundo son cuatro cambios que
  se olvidan de a uno.

## Qué mirar antes de tocar algo

- **Los encabezados de `Cuentas` y `DIGITAL` no coinciden** — `id_cuentas` contra `Id cuentas`.
  Cualquier cruce entre las dos se resuelve por `MAPEO`, nunca por texto de encabezado. Es la
  trampa que ya se comió una medición de este mismo paso.
- **Verificar el camino del menú, no sólo el de la API.** Son dos caminos y hay que correr los
  dos: el bug del orden de sellado existía sólo en `menuSellarPlantillas_`.
- **`MARCADORES` no tiene columna `estado`.** `REVISAR` lo calcula el motor en runtime y su
  disparador sólo lo puebla `LISTA`.
- **`uso = ignorar` corta en `buscarMapeo` (`Config.gs`), no en `leerFuente`.** Apaga los
  marcadores, **no la solapa**.
- **`rdv/RDV_otros_ministros`** funciona **porque los encabezados están corridos** (`C-09`).
  Arreglar `C-09` obliga a rehacer ese `MAPEO` en el mismo commit.
- **Los números no se validan acá.** La validación contra decks publicados vive en la otra
  conversación. Acá se mide **estructura**.

## El patrón que ya lleva cuatro casos

**Cuando algo parece roto en los datos, medir primero cómo se está mirando** — `CLAUDE.md` §4,
con su borde: la regla vale cuando **el instrumento propio reproduce lógica que el motor ya
tiene** y la reproduce peor. **No vale cuando la medición es de la salida del motor contra un
hecho externo** — ahí el motor es el sospechoso.

| se creyó | era |
|---|---|
| `looker` ilegible entero | ventana con fechas en texto; `formatearFecha_` exige `Date` |
| los `pauta_*` publican cero | `String(celda)` disfraza un booleano; `Number(true)===1` |
| `ignorar` bloquea la lectura | bloquea `buscarMapeo`, no `leerFuente` |
| `Cuentas` no tiene ni un id | el encabezado se llama distinto; `datos[f][-1]` es `undefined` |

## Números de referencia — 10/08

`MARCADORES` **51 filas** · `LAMINAS` 51 · `SECCIONES` 36 · **`MAPEO` 144** (140 + las cuatro del
`_23`) · `SOLAPAS` 84 filas, **11 columnas**. Plantillas: `jm` 22 láminas / 172 tokens, `secco`
29. Operaciones del motor: siete. Pruebas del diff: **11**.

`looker`: `resumen_metricas_dinamico` 953 filas / 26 en ventana · `Cuentas` 1011 / 92 · `DIGITAL`
4896 / 966. `rdv` 1362 / 15 en ventana, 700 excluidas por lista blanca.
