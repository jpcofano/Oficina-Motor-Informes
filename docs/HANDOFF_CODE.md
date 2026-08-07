# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-07, al cerrar el `_9` y su addendum `9.2` · último commit al
escribirlo: `42bbcfe`

## Dónde estamos

**Día entero de documentación, cero `.gs` tocados.** `D-23` se escribió a la mañana y su
**Addendum 1** lo corrigió a la tarde, en catorce puntos. Lo que quedó decidido:

- **La identidad de una lámina vive en las notas del orador, en un solo campo:
  `#lamina: L-NNN`** — global, opaco, **nunca reasignado**. El `#seccion:` se descartó: la
  clasificación se declara en la hoja `LAMINAS` y el registro es dueño de la configuración.
- **El contador vive en la hoja `LAMINAS`**, es **uno solo para las dos plantillas**, y **no se
  deriva de las notas** — derivarlo haría retroceder el contador al retirar una lámina.
- **Sellar y sembrar son una sola operación.** No hay Fase 3 ni segundo sellado.
- **La copia generada conserva el ancla y se limpia a demanda**; **la plantilla nunca**.
- **Una lámina no se borra: se esconde.**

**El estado del deck no cambió.** Sigue valiendo `jm-20260807-083557`: 31 de 43 marcadores
`ok`, 38 tokens reemplazados, 265 faltantes, 7 ítems, **298 s contra 350 de techo**.

## Pendiente de verificación humana

**Lo de hoy a la tarde es documental y se cierra leyendo:** el `Addendum 1 a D-23`, los dos
addenda de `C-01` y la sección del RUNBOOK. **No implementé nada**, como pedían los prompts.

Y sigue pendiente **todo lo de las dos noches anteriores**, que sí cambia números publicados:
los nueve porcentajes sin signo, el solape de `R-16` (quince marcadores), `claveDeFila_` (las
seis `pauta_*`) y el renombre de la lámina 7 (con backup). **Se prueba corriendo
`generarInforme` y mirando la lámina 6 de IVR y el Resumen Ejecutivo.**

## Lo medido, y no hay que volver a medirlo

**Acceso:** las dos plantillas dan `EDIT` a `jpcofanogcba1@gmail.com` (dueñas:
`reporteseinformesgcba`). No hay bloqueo de Drive para el sellador.

| | número |
|---|---|
| láminas totales (`jm` 22 + `secco` 29) | **51** |
| clasificadas bien hoy por `familia_tokens` | **20 — el 39 %** |
| ambiguas | **5** |
| huérfanas | **26** — 13 sin ningún token, 13 con tokens |

**Cinco hechos de plataforma sobre Slides:**

1. **`presentacion.replaceAllText` alcanza las notas del orador; `slide.replaceAllText` no.**
   Por eso el ancla **no usa `{{…}}`**: la barrida de faltantes lo volvería `«FALTA:lamina»`.
2. **`piezasDeTextoDeSlide_` no baja a las notas.** El ancla no contamina `tokensPorSlide_`,
   `MARCADORES` ni `FALTANTES`.
3. **`TableCell` no expone `setDescription` ni `setTitle`.**
4. **`makeCopy` y `duplicate()` arrastran las notas**, y **copiar una lámina entre
   presentaciones también**. De ahí: la copia hereda las notas del equipo, N copias de una
   lámina modelo comparten id, y el transporte de identidad entre plantillas sale gratis.
5. **`CORRIDAS` tiene `deck_id` cargado en sus 27 filas**, y `verificarObjectIdDeCorrida_`
   (`Generador.gs`) ya hace el patrón "buscar fila → abrir deck por id → trabajar sobre él".

**Del registro:** el único lugar que lee `SECCIONES.modo` es `seccionesRepetiblesDe_`,
comparando contra `repetible` —`agregado`, `unica` y `manual` no tienen código detrás—; y
`sembrarSecciones_` **sólo agrega filas nuevas, jamás pisa una existente**.

**Solape `jm`↔`secco`, criterio grueso:** **nueve pares** con el primer texto idéntico, **seis
de ellos** con el conjunto de tokens idéntico (`secco` 17=`jm` 13, 18=14, 20=16, 21=17, 22=18,
23=19 — todos `camp_*`), más cinco con solape parcial, el más fuerte `secco` 8 ~ `jm` 6 con
**28 tokens en común**. **No se decidió cuáles son "la misma".**

## Qué sigue

1. **Que leas el `Addendum 1 a D-23` y confirmes.** Es la condición de cierre.
2. **`T2.11` · el cableado lámina por lámina.** Donde está el 90 % del trabajo que queda.
   Empezar por los cinco `ecv_insc_*`.
3. **Medir el presupuesto.** 298 de 350 y sin causa establecida. Una serie, no una corrida.
4. **`T2.3` · reanudar**, que volvió al camino crítico por el margen.
5. **Fase 2 de `D-23`** — sellar y sembrar. **No arrancó y no arranca sin luz verde.**

## Esperando decisión tuya

- **⚠ La contradicción semana-primero contra temario-solo.** `A.1` de las once respuestas
  contra `CONFIG_INFORMES.md` §1.1, las dos "decisión del usuario, 07/08". §1.1 tiene caso
  testigo medido (San Cristóbal) y consecuencia en `D-19`. **No se eligió ninguna.** Se
  resuelve con una aclaración: **¿la semana es un filtro previo al temario, o el temario manda
  solo?**
- **Las 26 celdas de `seccion_id`.** Trabajo humano contado; la mesa está en el reporte del
  `_8`. Se llenan en `LAMINAS`, **después** de la Fase 2.
- **Las dos láminas de `secco` sin tokens que quizá no son estáticas** (15 y 26) — `P2`.
- **El VTR de la lámina 7: ¿se deriva?** `acum_views / acum_impresiones`. **No cableado.**
- **`ecv_barrios` es una lista** (decidido). Faltan separador, orden, deduplicación —`R-10` no
  pliega mayúsculas— y qué pasa si no entra en la caja.
- **`camp_bench_*`: ¿fijos o del período anterior?** Si son constantes,
  `MARCADORES.valor_fijo` los resuelve sin código.
- **`ventana_candidatos_anclaje_ampliada_dias` está vacía** = no ampliar.
- **`T2.10`** —una lámina cada N ítems— escrito y **no aprobado**.

## Trabado

1. **`Digital` no tiene datos de la ventana** — 897 fechas de 2024-08-29 a 2026-01-02. **Ni por
   solape entra nada.** Por eso la lámina 7 lee `Digital 2026 acumulado`.
2. **La lámina 7 tiene cuatro ranuras y una sola columna con token.** Las otras seis son 24 de
   los 28 de `CONFIG_INFORMES.md` §1.8 y no existen.
3. **`secco` a 4 ranuras está decidido y no se puede ejecutar**: `D-22`.
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
> plantilla. El **objetivo B** —score de anclaje saturado en 1,00— anotado como `P1`.

## Qué mirar antes de tocar algo

- **⚠ Dos cosas que se llaman igual no son la misma cosa.** `"Seguimiento Digital"` es el
  **nombre de la base**; `Seguimiento digital` es **una solapa**; `Digital` es **otra**; y
  `Digital 2026 acumulado` es una cuarta. `CLAUDE.md` §4.
- **`familia_tokens` está congelado hasta la Fase 4.** No escribir ninguno nuevo: `rrss_` ya
  demuestra que sale mal —vive en dos secciones distintas de dos informes—.
- **Toda entrada de renombre envuelve el token en llaves.** Uno que pase texto pelado **puede
  corromper el ancla**, y no se vería hasta mirar las notas del deck publicado.
- **`ecv_alcance_semanal` fabricó dos láminas huérfanas** (`secco` 4 y 5): `ecv_comuna` y
  `ecv_fecha` no están en su enumeración de diez tokens exactos.
- **El recorte por ventana se decide en dos lugares** —`leerFuente` rama `filtrar` y el
  agregado global de `Generador.gs`— y los dos llaman a **`entraPorSolape_`**.
- **`MAPEO.fecha_fin_periodo` es lo que enciende el solape.** Mail, SMS y `rdv` **no la llevan
  a propósito**.
- **`claveDeFila_` elige por lo que la fila tiene**, no por el nombre de la solapa.
- **⚠ Cuidado con los defaults vacíos pero truthy** — `{}` engaña a `tokensDelMapa ? … : null`.
- **El cierre de la corrida corre siempre** y **el instrumento se reporta a sí mismo**.
- **`SECCIONES` tiene 36 filas curadas a mano**: toda columna nueva entra por `COLUMNAS_DELTA_`.
- **`MARCADORES` tiene tres escritores declarados** (`ESCRITORES.md`).
- **Los cuatro formatos son un 2×2** de unidad de entrada × lleva el signo.
- **`SUMA` sobre cero filas devuelve `sin_datos`; `CONTEO` devuelve `0`.**
- **`ULTIMO` elige por fecha**; empate con valores distintos → **no elige**.
- **Seis láminas están escondidas**: la 10 de `jm`; la 23, 25, 26, 27 y 28 de `secco`.
- **`tools/api.js` no reintenta por defecto, a propósito.** Si el transporte pierde el body,
  **verificar en Drive/`CORRIDAS` si llegó a correr** antes de repetir. Pasó hoy.
- **Los decks se llaman todos igual**: tomar el `deck_id` de `CORRIDAS`.

## Números de referencia

`MARCADORES` en **43** filas · **31 `ok` / 12 `sin_datos` / 0 `error`**. `MAPEO` en **140**.
`SECCIONES` en **36 filas y 16 columnas**, **9 declaran `familia_tokens`** y **4 de esas 9 son
candidatas a colapsar**. `CORRIDAS` en **27 filas, las 27 con `deck_id`**. Plantillas: `jm` 22
láminas y 172 tokens visibles, `secco` 29 láminas. **Las 10 pruebas pasan.** `FALTANTES` en
**265**. Una corrida completa costó **298 s** y emitió **7 ítems**.

El deck de `jm-20260807-083557` **se conserva**. En la papelera: los cuatro decks de control de
las dos noches y las cuatro presentaciones temporales que midieron `replaceAllText`,
`duplicate()`, el copiado entre presentaciones y la herencia de notas en `makeCopy`.
