# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-07, al cerrar las once respuestas y `R-16` · último commit al
escribirlo: `c6898f3`

## ⚠ Lo primero: hay una contradicción sin resolver, y es tuya

**`A.1` de las once respuestas contradice `CONFIG_INFORMES.md` §1.1, y las dos son "decisión
del usuario, 07/08/2026".**

| | qué dice |
|---|---|
| §1.1 | *"El temario elige qué campañas destacadas van, y se buscan en toda la base. El período **no** es el criterio… **la ventana agrega, el temario selecciona**"* |
| `A.1` | *"Por defecto **la semana**… **si no**, por temario"* |

§1.1 tiene además **un caso testigo medido** (San Cristóbal 23/07 entrando con ventana
24–30/07) y una consecuencia escrita en `D-19`.

**No se eligió ninguna y la sección `campana` no se tocó.** Lo que sí se aplicó es el solape
sobre **los agregados**, que es donde las dos versiones coinciden. Está marcado en los dos
lados, cada uno apuntando al otro. **Se resuelve con una aclaración: ¿la semana es un filtro
previo al temario, o el temario manda solo?**

## Dónde estamos

**El deck se llenó de verdad.** Corrida de cierre `jm-20260807-083557`: `corte: null`,
`fallo: null`, `instrumento.fallos: []`, barrida en **0** tokens crudos.

| | 06/08 | 07/08 madrugada | **07/08 cierre** |
|---|---|---|---|
| marcadores `ok` | 17 | 23 | **31** de 43 |
| tokens reemplazados | 29 | 35 | **38** |
| faltantes | 270 | 264 | **265** |
| ítems emitidos | 5 | 5 | **7** |
| gastado | 120 s | 231 s | **298 s** |

**⚠ El presupuesto está en 298 s contra 350 de techo. El margen bajó a 15 %.** Es la
consecuencia directa del solape: `Directa IVR` pasó de 0 a 2 filas y `Seguimiento digital` de
16 a 72, así que las lecturas devuelven mucho más. Hay **causa candidata**, no medida — y con
este margen, **`T2.3` (reanudar) vuelve al camino crítico**.

**`R-16` — la ventana entra por solape, y IVR dejó de dar cero.** Quince marcadores cambiaron:
los nueve de IVR (`enc_audiencia` 78.637, `enc_e75_pct` **38.7**, `ivr_at_pct` 90.6…) y los seis
`pauta_*`. **Nada se movió en `Directa Mail`, `Directa SMS` ni `rdv`** — no declaran
`fecha_fin_periodo` y siguen entrando por punto.

**`comunicaciones_post` emite.** El renombre a `post_camp*` (salida A) hizo que
`slidesModeloDe_(['post_'])` pase de `[]` a la lámina 7: la sección emite sus **2 ítems** y el
deck tiene dos láminas de comunicaciones post. **Pintan cero tokens** — los cuatro
`post_camp1..4` no tienen fila en `MARCADORES` todavía.

## Pendiente de verificación humana

Todo lo de las dos noches. Lo que **cambia números publicados**:

1. **`B.1` · los nueve porcentajes sin signo** — `25.42` → `25.4`. Seis valores visibles se
   movieron.
2. **`R-16` · el solape** — quince marcadores, todos de `sin_datos`/`0` a un número.
3. **`T2.6` · `claveDeFila_`** — las seis `pauta_*`.
4. **`B.5` · el renombre de la lámina 7** — la plantilla se tocó, con backup
   (`JM_marcada — backup 2026-08-07 08:25`).

Lo que **no** cambia números: `T2.1.2`, `T2.7`, `T2.9.4`, `T2.9.2`, `B.2`, `B.3`, `B.4`, y el
formato nuevo.

**Cómo se prueba:** correr `generarInforme` desde el menú y mirar la lámina 6 de IVR y el
Resumen Ejecutivo. **Las 10 pruebas pasan**, con cinco afirmaciones nuevas.

## Dónde está el trabajo que falta

De los **172** tokens visibles: **143 sin valor en ninguna caja**, y **125 de esos 143 son
cableado o datos, no motor**. Es `T2.11` — recorrer el cableado lámina por lámina.

| causa | tokens | qué lo destraba |
|---|---|---|
| sección sin ítems | **53** | **cargar `CAMPANAS`**: tiene 3 filas y las tres son de `secco` |
| sin fila en `MARCADORES` | **72** | `T2.11`. Adentro: 21 `rrss_*`, 16 del bloque `cc_*`/`imp_*`, 12 `ecv_*`, 8 `m2_*`, los 4 `post_camp*` recién renombrados |
| fuente con cero filas | 15 | bajó con `R-16`; lo que queda es `Digital` |
| `[MANUAL]` | 3 | nada |

## Trabado

1. **`Digital` no tiene datos de la ventana** — 897 fechas de 2024-08-29 a 2026-01-02. **Ni por
   solape entra nada.** Por eso la lámina 7 pasó a leer `Digital 2026 acumulado`, que sí llega:
   **66 campañas por solape, cero repetidas, cero sin fecha de fin**.
2. **La lámina 7 tiene cuatro ranuras y una sola columna con token.** Las otras seis —Estado,
   Período, Alcance, Impresiones, Vistas, VTR— son **24 de los 28** de `CONFIG_INFORMES.md`
   §1.8 y no existen. Renombrar cuatro tokens no llena una tabla.
3. **`secco` a 4 ranuras está decidido y no se puede ejecutar**: agregar una fila a la tabla es
   lo que `D-22` mide que el motor no sabe hacer.
4. **Cuatro de los cinco encuentros pintan cero.** Las cuentas `3354-` y `3346-` no tienen filas
   en las solapas de canal para esta ventana; `3387-` sí.
5. **La lámina 5 publica un porcentaje sin su numerador**: `Mail: «FALTA:ecv_insc_mail»(59.9%)`.
   Los cinco pares `ecv_insc_*` están igual, y `A.4` ya fijó que salen de `rdv`. **Es el arreglo
   más barato y más visible que queda.**
6. **16 tokens del Resumen Ejecutivo sin fuente**: los ocho de Call Center, los seis de
   impresiones por plataforma, y `contenidos_total`.
7. **`REUNIONES` no es el temario** — le faltan Primera Persona y Registro Civil.

## Esperando decisión tuya

- **⚠ La contradicción de arriba** — semana-primero contra temario-solo.
- **El VTR de la lámina 7: ¿se deriva?** `acum_views / acum_impresiones`. Propuesto y **no
  cableado**.
- **`ecv_barrios` es una lista** (decidido). Le quedan **cuatro decisiones editoriales**:
  separador, orden, deduplicación —`R-10` no pliega mayúsculas, así que `Palermo` y `palermo`
  serían dos— y qué pasa si no entra en la caja.
- **`camp_bench_*`: ¿fijos o del período anterior?** Se buscó resolverla con `A.1`/`A.5` y
  **ninguna la toca**. Si son constantes, `MARCADORES.valor_fijo` los resuelve sin código.
- **`ventana_candidatos_anclaje_ampliada_dias` está vacía** y vacía significa "no ampliar".
- **`T2.10`** —una lámina cada N ítems— escrito y **no aprobado**. Ya tiene su entrada:
  `SECCIONES.items_por_lamina`, cargada con 4 para `comunicaciones_post`.
- **Los cuatro `ecv_barrio*`** y el resto de `T2.11`.

## En pausa, y no se vuelve sobre esto

> Las tres preguntas sobre la lámina M2. **Los tres remitentes sueltos** y los once
> `camp_resp_*`. **Los `m2_*` con sufijos `_a`…`_e` se quedan como están** — manda la plantilla
> (`A.11`), y los dieciséis renombres se retiraron del diccionario de armonización. El
> **objetivo B** —score de anclaje saturado en 1,00— anotado como `P1`.

## Qué sigue

1. **Medir el presupuesto.** 298 de 350 es poco margen y no hay causa establecida. Una serie
   corta, no una corrida.
2. **`T2.11` · el cableado lámina por lámina.** Es el paso que sigue al Tramo 2 y donde está el
   90 % del trabajo que queda. Empezar por los cinco `ecv_insc_*`.
3. **`T2.3` · reanudar** vuelve al camino crítico por el margen.
4. **`T2.1.3`** — la fila guarda hasta qué ítem llegó.

## Qué mirar antes de tocar algo

- **⚠ Dos cosas que se llaman igual no son la misma cosa.** `"Seguimiento Digital"` es el
  **nombre de la base**; `Seguimiento digital` es **una solapa**; `Digital` es **otra**. Y ahora
  hay una cuarta: `Digital 2026 acumulado`, con prefijo propio `acum_` justamente por esto.
  La regla está en `CLAUDE.md` §4.
- **El recorte por ventana se decide en dos lugares** —`leerFuente` rama `filtrar` y el
  agregado global de `Generador.gs`— y los dos llaman a **`entraPorSolape_`**. Si agregás un
  tercero, tiene que llamar a la misma.
- **`MAPEO.fecha_fin_periodo` es lo que enciende el solape.** Sin esa fila, la solapa entra por
  punto y **la traza lo dice**. Cuatro solapas la tienen; mail, SMS y `rdv` **no la llevan a
  propósito**.
- **La maestra de `digital` llega por dos caminos con filas de forma distinta**; `claveDeFila_`
  elige por lo que la fila tiene, no por el nombre de la solapa.
- **⚠ Cuidado con los defaults vacíos pero truthy** — `{}` engaña a `tokensDelMapa ? … : null`.
- **El cierre de la corrida corre siempre**, incluida la vía de excepción, y **el instrumento se
  reporta a sí mismo**: si `instrumento.fallos` no está vacío, el rastro de etapas no sirve.
- **`SECCIONES` tiene 36 filas curadas a mano**: toda columna nueva entra por `COLUMNAS_DELTA_`,
  nunca por la rama que reescribe la fila 1.
- **`MARCADORES` tiene tres escritores declarados** (`ESCRITORES.md`): la plantilla vía
  `Paso-2.5`, `curarMarcadores_` para filas enteras, y **`curarCamposMarcadores_` para un campo**.
- **Los cuatro formatos son un 2×2** de unidad de entrada × lleva el signo. Antes de elegirle
  formato a un `PCT` nuevo, **mirar si la caja de la plantilla trae su propio `%`**.
- **`tokenEsDeFamilia_` matchea por prefijo.**
- **`SUMA` sobre cero filas devuelve `sin_datos`; `CONTEO` devuelve `0`.** `SUMA` sobre filas de
  ceros devuelve `0`, que es un dato.
- **`ULTIMO` elige por fecha**; empate con valores distintos → **no elige**.
- **Seis láminas están escondidas**: la 10 de `jm`; la 23, 25, 26, 27 y 28 de `secco`.
- **Las bases no se leen desde node**: se mide por `fn=eval`, y con `globalThis.<fn> = …` se
  inyecta una excepción para probar el cierre.
- **Los decks se llaman todos igual**: tomar el `deck_id` de `CORRIDAS`.

## Números de referencia

`MARCADORES` en **43** filas · **31 `ok` / 12 `sin_datos` / 0 `error`**. `MAPEO` en **140**
(122 + `sd_*` + 12 `acum_*` + 4 `fecha_fin_periodo`). `SECCIONES` en 36 filas y **16 columnas**.
`CONFIG` con cuatro claves nuevas de las dos noches. Plantilla `jm`: **172 tokens** visibles.
**Las 10 pruebas pasan.** `FALTANTES` en **265**. **Una corrida completa costó 298 s** contra
350 de techo y 30 de reserva, y emitió **7 ítems**.

El deck de `jm-20260807-083557` **se conserva**: es el único con el solape, los formatos nuevos
y la lámina de comunicaciones post emitida. Los cuatro decks de control de las dos noches están
en la papelera.
