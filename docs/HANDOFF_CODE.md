# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-07, al cerrar `T2.4` + la corrida nocturna `N1`–`N7` · último
commit al escribirlo: `4a8ccff`

## Dónde estamos

**El Tramo 2 se movió de verdad.** En la noche del 06 al 07/08 cerraron, pendientes de
verificación humana: `T2.1.2`, `T2.2.3`, `T2.4`, `T2.5` (la parte medida), `T2.6`, `T2.7`,
`T2.9.2` y `T2.9.4`.

**La corrida completa y el deck se verificaron.** `T2.4` midió los cuatro objetivos contra el
deck de `jm-20260806-222554` — evidencia en `docs/PROTOCOLO_T2.4_corrida_2026-08-07.md`:

- **`SUMA` sobre cero filas da `sin_datos`, no `0`** — y el control negativo salió en la misma
  corrida: `ivr_campanias` es un `CONTEO` sobre **las mismas cero filas** y devuelve `0`.
- **El agregado global de `digital` anda** donde hay filas: `Directa Mail` (7 JM, 80 GCBA) y
  `Directa SMS` (1).
- **El Resumen Ejecutivo está pintado en el deck**: `838.571 envíos de Mail`,
  `Aperturas: 211.357 (25.42%)`, `3.839.688`, `54.552 envíos de SMS`, `15` encuentros.
- **`ULTIMO` funciona y el número esperado no sale.** `enc_mails_enviados` no da 44.043: dentro
  de la ventana hay un **empate real al 28/07** con dos valores distintos (85935 / 104362) y el
  motor está construido para no elegir. Los seis `enc_*` de `Directa Mail` caen igual.

**Corrida de cierre de la noche** (`jm-20260807-023839`), con los cinco cambios de código
adentro: `corte: null`, `fallo: null`, `instrumento.fallos: []`, barrida en **0** tokens crudos.
**35 tokens reemplazados** (eran 29) y **264 faltantes** (eran 270) — exactamente los seis
`pauta_*` que `N3` destrabó.

**⚠ El presupuesto se apretó y no está explicado.** Esa corrida gastó **231 s** contra 350 de
techo; la del 06/08 gastó **120**. Los seis `pauta_*` ahora leen 979 filas donde antes cortaban
en cero, así que hay una causa candidata — **pero no está medida, y una corrida no es una
serie.** Se nombra como candidato, no como causa.

## Pendiente de verificación humana

Nada de esto lo puede cerrar Code. Todo lo de código de las dos noches:

1. **`T2.1.2` · el cierre se escribe siempre**, también ante una excepción inesperada.
2. **`T2.6` · el arreglo de `claveDeFila_`** — las seis `pauta_*` pasaron de `sin_datos` a `0`
   sobre 16 filas. Es el único cambio de la noche que **cambia números del deck**.
3. **`T2.7` · el instrumento** — las cinco marcas de etapa se acumulan en vez de pisarse, y un
   fallo del instrumento se publica en `instrumento.fallos`, en la celda de `CORRIDAS` y arriba
   de todo en el reporte del menú.
4. **`T2.9.4` · retirado `VALOR_STATUS_REALIZADA_`** — control: los cinco anclajes idénticos.
5. **`T2.9.2` · las dos ventanas del anclaje a `CONFIG`** — sin cambio de comportamiento.
6. **`T2.5` · el formato `porcentaje_sin_signo`** — existe y **nadie lo usa todavía**.
7. **`N8` del 06/08** · `excluida <nombre>` en vez de `excluida undefined`, y el aviso de
   láminas escondidas diciendo que numera sobre el deck expandido.

**Cómo se prueba lo grueso:** correr `generarInforme` desde el menú y mirar que el deck no
cambió salvo los seis `pauta_*`, que ahora dicen `0` en vez de `«FALTA:…»`. **Las 10 pruebas
pasan** después de los siete cambios.

## Dónde está el trabajo que falta, contado

De los **172** tokens visibles de la plantilla de `jm`: **18** tienen valor en todas sus cajas,
**11** en una sola (las cinco ranuras de encuentro, y sólo `Orden Público` resuelve), y **143**
no tienen valor en ninguna. Los 143, por causa:

| causa | tokens | qué destraba |
|---|---|---|
| sección sin ítems | **53** | **cargar `CAMPANAS`**: tiene 3 filas y las tres son de `secco` |
| sin fila en `MARCADORES` | **72** | 21 `rrss_*` sin fuente, 16 del bloque `cc_*`/`imp_*`, 12 `ecv_*`, 8 `m2_*`, 4 `camp1-4`, más otros |
| fuente con cero filas | **15** | ver abajo: dos de los tres grupos son **datos**, no motor |
| declarado `[MANUAL]` | **3** | nada: `ecv_barrio1-3` son editoriales |
| **sin clasificar** | **0** | — |

## Trabado

1. **`Digital` no tiene datos de la ventana.** 1297 filas, 897 con fecha, y **el rango va de
   2024-08-29 a 2026-01-02**. La ventana del informe es julio de 2026. Es la solapa que
   `N1.b` declaró fuente de la lámina 7, así que **esto bloquea la lámina 7 entera**, no los
   tokens.
2. **IVR entra por un día.** Las dos campañas de Orden Público arrancan el **22 y 23/07** y la
   ventana empieza el **24**. Es literalmente el caso de `R-14` —*"no es 'empieza en la
   ventana'"*— y `ivr_fin` está mapeado, así que el solape es computable. **Falta la decisión**
   de cambiar qué fecha gobierna el recorte del agregado global.
3. **`CAMPANAS` sin filas de `jm`** — 53 de los 143 tokens sin valor dependen de esto, y es
   carga de datos.
4. **Cuatro de los cinco encuentros pintan cero.** Los cinco están anclados; las cuentas
   `3354-JULJDGAG` y `3346-JULJDGAG` **no tienen filas en las solapas de canal para esta
   ventana** y `3387-JULJDGGC` sí.
5. **La lámina 5 publica un porcentaje sin su numerador**: `Mail: «FALTA:ecv_insc_mail»(59.9%)`.
   El `_pct` está cableado y el número que lo genera no tiene fila en `MARCADORES`. Los cinco
   pares `ecv_insc_*` están igual. **Es el arreglo más barato y más visible que queda.**
6. **16 tokens del Resumen Ejecutivo sin fuente**: los ocho de Call Center (`cc_base` no existe
   en ninguna base), los seis de impresiones por plataforma, y `contenidos_total`.
7. **`REUNIONES` no es el temario** — le faltan Primera Persona y Registro Civil.

## Esperando decisión tuya

- **Las nueve celdas de `MARCADORES` que deberían pasar a `porcentaje_sin_signo`** —
  `ecv_insc_{mail,cc,ivr,digital,dif}_pct`, `enc_e75_pct`, `mail_or`, `gcba_mail_or`,
  `ivr_at_pct`. **Cambia números publicados** (`25.42` → `25.4`). Las nueve verificadas caja
  por caja: las nueve traen su propio `%`.
- **`ecv_barrios`: ¿es el conteo de barrios distintos o la lista de nombres?** De esa respuesta
  dependen las otras cuatro decisiones de `DISTINCT` (qué devuelve con cero filas, separador,
  orden, deduplicación). Detalle en el `P2` de `PENDIENTES_consistencia.md`.
- **La lámina 7: cuál de las tres salidas** del `P2` de `comunicaciones_post`. Adoptar las 28
  de `CONFIG_INFORMES.md` §1.8 **es elegir la A**.
- **`Estado` de la lámina 7 no está en `MAPEO`** — columna `G` de `digital/Digital`. Es la única
  de las siete columnas que falta.
- **`ventana_candidatos_anclaje_ampliada_dias` está vacía** y vacía significa "no ampliar".
  Cargar un número es la mitad que falta de `R-12`; **nadie la consume todavía**.
- **`secco` tiene 3 ranuras y las decisiones de la lámina 7 fijan 4.** Sin decidir.
- **`T2.10`** —una lámina cada N ítems— escrito y **no aprobado**. Necesita decidir dónde se
  declara el tamaño de página (lo natural, `SECCIONES.items_por_lamina`).
- **Los `m2_*` de la lámina 10 de `jm` siguen con sufijos `_a`…`_e`** y `TOKENS.md` §1 declara
  que no los tienen. Más cinco discrepancias menores en §2.0.
- **`camp_bench_*`**: ¿fijos o del período anterior?
- **La fila `resumen_ejecutivo` de `SECCIONES`** sigue `repetible` + `manual`, y está medido que
  **no puede ser repetible**. Es una línea.

## En pausa, y no se vuelve sobre esto

> Las tres preguntas sobre la lámina M2. **Los tres remitentes sueltos** y los **once
> `camp_resp_*`**. **`enc_e75_pct` da 38,74 contra 39 % publicado: es el mismo número
> redondeado, no es un error y no se ajusta.** El **objetivo B** —score de anclaje saturado en
> 1,00 y circuito de confianza sin probar— anotado como `P1`.

## Qué sigue

1. **Medir el presupuesto otra vez.** 231 s contra 120 la noche anterior, sin causa
   establecida. Una serie corta, no una corrida.
2. **Cablear los cinco `ecv_insc_*`** — el porcentaje sin numerador de la lámina 5.
3. **`T2.1.3`** — la fila guarda hasta qué ítem llegó.
4. **`T2.3` · reanudar** sigue sin ser urgente, pero el margen se achicó: 231 de 350.

## Qué mirar antes de tocar algo

- **⚠ Dos cosas que se llaman igual no son la misma cosa.** `"Seguimiento Digital"` es el
  **nombre de la base** `digital`; `Seguimiento digital` es **una solapa**; `Digital` es **otra
  solapa** y además `hoja_default`. Confundirlas costó una noche entera y una premisa falsa que
  llegó a cuatro documentos. La regla está en `CLAUDE.md` §4.
- **La maestra de `digital` llega por dos caminos con filas de forma distinta**: por
  `Union.gs` con claves `campo_logico`, por `leerFuente` con **el encabezado real**. `claveDeFila_`
  elige por lo que la fila tiene. **Cualquier código nuevo que lea un campo de esa solapa pasa
  por ahí.**
- **⚠ Cuidado con los defaults vacíos pero truthy.** `barrerTokensNoAlcanzados_` decide
  re-escanear por `tokensDelMapa ? … : null`, y un `{}` lo engaña.
- **El cierre de la corrida corre siempre**, incluida la vía de excepción. El estado que
  necesita se declara **afuera del `try`**, con valores vacíos usables.
- **El instrumento se reporta a sí mismo** (`instrumento.fallos`). Si esa lista no está vacía,
  **el rastro de etapas no sirve para diagnosticar** y el reporte lo dice antes que nada.
- **`FALTANTES` se pisa entera en cada corrida.** Es la foto de la última, no un histórico.
- **`MAPEO.rdv/status.valores_incluidos` es el único filtro de status.** El matcher ya no
  filtra por su cuenta.
- **Los cuatro formatos son un 2×2** de unidad de entrada × lleva el signo. Antes de elegirle
  formato a un `PCT` nuevo, **mirar si la caja de la plantilla trae su propio `%`**.
- **El volcado de una hoja grande no entra en una línea de comandos de Windows** (~32 KB).
- **Tres numeraciones de lámina conviven**: el `.pptx` archivado, la presentación viva, y el
  **deck expandido**. `TOKENS.md` §2.0 lo deja escrito.
- **Seis láminas están escondidas**: la 10 de `jm`; la 23, 25, 26, 27 y 28 de `secco`.
- **`tokenEsDeFamilia_` matchea por prefijo.** `camp_` no toma `camp1`, y `camp` tomaría también
  `camp_titulo`.
- **`SUMA` sobre cero filas devuelve `sin_datos`; `CONTEO` devuelve `0`.** Y `SUMA` sobre 16
  filas de ceros devuelve **`0`**, que es un dato.
- **`ULTIMO` elige por fecha**, no por posición; empate con valores distintos → **no elige**.
- **Las bases no se leen desde node** (scope `drive.file`): se mide por `fn=eval`. **⚠ `eval` es
  invocable por la API**, y con `globalThis.<fn> = …` se inyecta una excepción para probar el
  cierre — así corrieron los controles de `T2.1.2` y `T2.7`.
- **Los decks se llaman todos igual**: para verificar, tomar el `deck_id` de `CORRIDAS`, nunca
  la fecha de modificación.

## Números de referencia

`MARCADORES` en **43** filas · **23 `ok` / 20 `sin_datos` / 0 `error`** (eran 17/26). `MAPEO` en
**124**. `CONFIG` con dos claves nuevas. Plantilla `jm`: **172 tokens** visibles en 22 láminas;
`secco`, 29. **Las 10 pruebas pasan**, con **cinco afirmaciones nuevas** en
`probarFormatoMarcador_`. `CORRIDAS` en **26 filas**. `FALTANTES` en **264**. Carpeta de
salidas: **16 presentaciones, cero huérfanas**. **Una corrida completa costó 231 s** contra 350
de techo y 30 de reserva.

Los decks de control de las dos noches están **en la papelera** (cuatro). El de
`jm-20260807-023839` **se conserva**: es la corrida de cierre con los cinco cambios adentro y el
único deck que muestra los seis `pauta_*` resueltos.
