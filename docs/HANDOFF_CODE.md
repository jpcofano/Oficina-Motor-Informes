# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-07, al cerrar `D-23` y las tres partes del flujo de lámina
nueva · último commit al escribirlo: `86bd5d0`

## Dónde estamos

**Se cerró una corrida de documentación pura: `D-23`.** La identidad de una lámina se declara
en el deck, en **las notas del orador**, y la escribe el motor: `#lamina: L-NNN` (global,
opaco) y `#seccion: <seccion_id>`. Tres commits, cero `.gs` tocados.

| parte | qué entró | dónde |
|---|---|---|
| **A** | `D-23` + las fases 2a/3/2b/4/5 con su precondición | `docs/PLAN.md` §1 y §2 |
| **B** | Addendum 1 a la suspensión de `C-01` + dos `P2` | `REGLAS_NEGOCIO.md`, `PENDIENTES_consistencia.md` |
| **C** | *"Marcar y clasificar una lámina"* | `docs/RUNBOOK.md` |

**El estado del deck no cambió.** Sigue valiendo la corrida `jm-20260807-083557`: 31 de 43
marcadores `ok`, 38 tokens reemplazados, 265 faltantes, 7 ítems, **298 s contra 350 de techo**.

## Pendiente de verificación humana

**Lo de esta corrida es documental y se cierra leyendo:** `D-23`, el addendum de `C-01` y la
sección del RUNBOOK. La pregunta es si describen lo que decidiste. **No seguí con la
implementación del sellador**, como pedía el prompt.

Y sigue pendiente **todo lo de las dos noches anteriores**, que cambia números publicados:
los nueve porcentajes sin signo (`B.1`), el solape de `R-16` (quince marcadores),
`claveDeFila_` (`T2.6`, las seis `pauta_*`) y el renombre de la lámina 7 (`B.5`, con backup).
**Se prueba corriendo `generarInforme` y mirando la lámina 6 de IVR y el Resumen Ejecutivo.**

## Lo que midió esta corrida, y no hay que volver a medir

**Las dos plantillas dan `EDIT`** a `jpcofanogcba1@gmail.com` (dueñas: `reporteseinformesgcba`).
No hay bloqueo de Drive para el sellador.

| | número |
|---|---|
| láminas totales (`jm` 22 + `secco` 29) | **51** |
| clasificadas bien hoy por `familia_tokens` | **20 — el 39 %** |
| ambiguas (más de una sección las reclama) | **5** |
| huérfanas | **26** — 13 sin ningún token, 13 con tokens |

**Tres hechos de plataforma medidos, que valen para cualquier cosa que toque Slides:**

1. **`presentacion.replaceAllText` alcanza las notas del orador; `slide.replaceAllText` no**
   (2 ocurrencias contra 1). Por eso el ancla **no puede usar `{{…}}`**: la barrida de
   faltantes lo convertiría en `«FALTA:lamina»` en el deck publicado.
2. **`piezasDeTextoDeSlide_` no baja a las notas.** Lado bueno: el ancla no contamina
   `tokensPorSlide_`, `MARCADORES` ni `FALTANTES`.
3. **`TableCell` no expone `setDescription` ni `setTitle`.** El alt text existe sólo en el
   `PageElement` tabla completa.

**Y dos del registro:** el único lugar del motor que lee `SECCIONES.modo` es
`seccionesRepetiblesDe_`, comparando contra `repetible` —`agregado`, `unica` y `manual` no
tienen código detrás—; y `sembrarSecciones_` **sólo agrega filas nuevas, jamás pisa una
existente**, así que corregir una fila viva pasa sí o sí por `curarSecciones_`.

## Qué sigue

1. **Que leas `D-23` y confirmes.** Es la condición de cierre del prompt.
2. **`T2.11` · el cableado lámina por lámina.** Sigue siendo donde está el 90 % del trabajo
   que queda. Empezar por los cinco `ecv_insc_*`.
3. **Medir el presupuesto.** 298 de 350 es poco margen y no hay causa establecida. Una serie
   corta, no una corrida.
4. **`T2.3` · reanudar**, que volvió al camino crítico por el margen.
5. **Fase 2a de `D-23`** — el sellador. **No arrancó y no arranca sin luz verde.**

## Esperando decisión tuya

- **⚠ La contradicción semana-primero contra temario-solo.** `A.1` de las once respuestas
  contra `CONFIG_INFORMES.md` §1.1, las dos "decisión del usuario, 07/08". §1.1 tiene caso
  testigo medido (San Cristóbal) y consecuencia en `D-19`. **No se eligió ninguna y la sección
  `campana` no se tocó.** Se resuelve con una aclaración: **¿la semana es un filtro previo al
  temario, o el temario manda solo?**
- **Las 26 celdas de `seccion_id`.** Es trabajo humano y está contado; la mesa de trabajo está
  en el reporte del prompt `_8`. **No se toman en `SECCIONES`**: van a la hoja `LAMINAS`,
  entre las fases 2a y 2b.
- **Las dos láminas de `secco` sin tokens que quizá no son estáticas** (15 y 26) — `P2` nuevo.
- **El VTR de la lámina 7: ¿se deriva?** `acum_views / acum_impresiones`. Propuesto y **no
  cableado**.
- **`ecv_barrios` es una lista** (decidido). Le quedan cuatro decisiones editoriales:
  separador, orden, deduplicación —`R-10` no pliega mayúsculas— y qué pasa si no entra.
- **`camp_bench_*`: ¿fijos o del período anterior?** Si son constantes,
  `MARCADORES.valor_fijo` los resuelve sin código.
- **`ventana_candidatos_anclaje_ampliada_dias` está vacía** y vacía significa "no ampliar".
- **`T2.10`** —una lámina cada N ítems— escrito y **no aprobado**.

## Trabado

1. **`Digital` no tiene datos de la ventana** — 897 fechas de 2024-08-29 a 2026-01-02. **Ni por
   solape entra nada.** Por eso la lámina 7 lee `Digital 2026 acumulado`.
2. **La lámina 7 tiene cuatro ranuras y una sola columna con token.** Las otras seis son 24 de
   los 28 de `CONFIG_INFORMES.md` §1.8 y no existen.
3. **`secco` a 4 ranuras está decidido y no se puede ejecutar**: es lo que `D-22` mide que el
   motor no sabe hacer.
4. **Cuatro de los cinco encuentros pintan cero.** `3354-` y `3346-` no tienen filas en las
   solapas de canal para esta ventana; `3387-` sí.
5. **La lámina 5 publica un porcentaje sin su numerador**: `Mail: «FALTA:ecv_insc_mail»(59.9%)`.
   Los cinco pares `ecv_insc_*` igual. **Es el arreglo más barato y más visible que queda.**
6. **16 tokens del Resumen Ejecutivo sin fuente** (Call Center, impresiones por plataforma,
   `contenidos_total`).
7. **`REUNIONES` no es el temario** — le faltan Primera Persona y Registro Civil.

## En pausa, y no se vuelve sobre esto

> Las tres preguntas sobre la lámina M2. Los tres remitentes sueltos y los once
> `camp_resp_*`. **Los `m2_*` con sufijos `_a`…`_e` se quedan como están** — manda la
> plantilla (`A.11`). El **objetivo B** —score de anclaje saturado en 1,00— anotado como `P1`.

## Qué mirar antes de tocar algo

- **⚠ Dos cosas que se llaman igual no son la misma cosa.** `"Seguimiento Digital"` es el
  **nombre de la base**; `Seguimiento digital` es **una solapa**; `Digital` es **otra**; y
  `Digital 2026 acumulado` es una cuarta, con prefijo propio `acum_`. `CLAUDE.md` §4.
- **`familia_tokens` está congelado hasta la Fase 4** (`D-23`). No escribir ninguno nuevo:
  llenar los 17 prefijos que hoy no declara nadie sería invertir en el mecanismo que se retira,
  y `rrss_` ya demuestra que sale mal —vive en dos secciones distintas de dos informes—.
- **Toda entrada de renombre envuelve el token en llaves.** Los tres llamadores de
  `replaceAllText` lo hacen hoy; uno que pase texto pelado **puede corromper el ancla** de
  `D-23`, y el daño no se vería hasta mirar las notas del deck publicado.
- **`ecv_alcance_semanal` fabricó dos láminas huérfanas** (`secco` 4 y 5): `ecv_comuna` y
  `ecv_fecha` no están en su enumeración de diez tokens exactos.
- **El recorte por ventana se decide en dos lugares** —`leerFuente` rama `filtrar` y el
  agregado global de `Generador.gs`— y los dos llaman a **`entraPorSolape_`**.
- **`MAPEO.fecha_fin_periodo` es lo que enciende el solape.** Cuatro solapas la tienen; mail,
  SMS y `rdv` **no la llevan a propósito**.
- **La maestra de `digital` llega por dos caminos con filas de forma distinta**; `claveDeFila_`
  elige por lo que la fila tiene, no por el nombre de la solapa.
- **⚠ Cuidado con los defaults vacíos pero truthy** — `{}` engaña a `tokensDelMapa ? … : null`.
- **El cierre de la corrida corre siempre** y **el instrumento se reporta a sí mismo**: si
  `instrumento.fallos` no está vacío, el rastro de etapas no sirve.
- **`SECCIONES` tiene 36 filas curadas a mano**: toda columna nueva entra por `COLUMNAS_DELTA_`.
- **`MARCADORES` tiene tres escritores declarados** (`ESCRITORES.md`).
- **Los cuatro formatos son un 2×2** de unidad de entrada × lleva el signo. Antes de elegirle
  formato a un `PCT` nuevo, mirar si la caja de la plantilla trae su propio `%`.
- **`SUMA` sobre cero filas devuelve `sin_datos`; `CONTEO` devuelve `0`.**
- **`ULTIMO` elige por fecha**; empate con valores distintos → **no elige**.
- **Seis láminas están escondidas**: la 10 de `jm`; la 23, 25, 26, 27 y 28 de `secco`.
- **`tools/api.js` no reintenta por defecto, a propósito.** Si el transporte pierde el body,
  **verificar en Drive/`CORRIDAS` si llegó a correr** antes de repetir. Pasó en esta corrida.
- **Los decks se llaman todos igual**: tomar el `deck_id` de `CORRIDAS`.

## Números de referencia

`MARCADORES` en **43** filas · **31 `ok` / 12 `sin_datos` / 0 `error`**. `MAPEO` en **140**.
`SECCIONES` en **36 filas y 16 columnas**, de las cuales **9 declaran `familia_tokens`** y
**4 de esas 9 son candidatas a colapsar** en la Fase 4. Plantillas: `jm` 22 láminas y 172
tokens visibles, `secco` 29 láminas. **Las 10 pruebas pasan.** `FALTANTES` en **265**. Una
corrida completa costó **298 s** contra 350 de techo y emitió **7 ítems**.

El deck de `jm-20260807-083557` **se conserva**. Los cuatro decks de control de las dos noches
están en la papelera, y también la presentación temporal que midió el alcance de
`replaceAllText`.
