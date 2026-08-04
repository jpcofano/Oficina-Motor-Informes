# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-04 (corrida nocturna: anclaje destrabado, JM armonizada,
Pasos 4 y 5 implementados y corridos) · último commit al escribirlo: el de esta entrada

## Dónde estamos

**El motor genera un informe de punta a punta.** El Tramo 2 está cerrado: los Pasos 3, 4 y
5 corrieron y el archivo existe.

**El deck vigente:** `1AU0tkyRQo0kGccnUGJqz0MoEqtiDpy5awYGy8VjTtH8` — *Informe semanal JM —
vie 24/07 — jue 30/07*, corrida `jm-20260804-180308`, ventana `24/07 → 30/07` (`config`).
Quedaron **cinco decks** en la carpeta de salidas, uno por generación de la noche: sirve el
último y los otros cuatro se pueden borrar.

**El número de la noche: los tokens con valor pasaron de 1 a 17**, y los distintos con
número real de 0 a 11. Los 11 son los `enc_*` del encuentro **Orden Público**, que resuelve
contra la cuenta digital `3347-JULJDGAG`.

**Lo que se destrabó, en una línea cada uno:**

1. **El anclaje corre.** `verificarPrecondicionAnclaje_` filtra por
   `MAPEO.valores_incluidos` y ya no cuenta duplicados sobre filas que el emparejador nunca
   mira: **653 consideradas, 709 excluidas, 0 grupos duplicados**. `anclarEncuentros()` da
   **5 anclados, 0 sin link, 0 en baja confianza**.
2. **La plantilla de JM está armonizada**, con backup y con la slide 10 intacta.
3. **El Paso 4 escribe el deck** y registra la corrida con el mapa `token → objectId`.
4. **El Paso 5 expande las secciones repetibles** y le pasa el `id_cuenta` al despachador,
   que es lo que hace que `digital` devuelva número.

## Trabado

1. **Cuatro de los cinco encuentros anclados no tienen ninguna fila en los canales de
   `digital`.** San Cristóbal (pre y post) y Retiro (pre y post) anclan con score alto
   —0,82 y 0,77— pero sus cuentas no aportan filas, así que sus 13 `enc_*` salen
   `sin_datos`. **El número que falta es de la base, no del cálculo.** Es lo primero para
   mirar con el informe en la mano.
2. **`CAMPANAS` no tiene ninguna fila de `jm`.** Las tres son de `secco` y las tres siguen
   sin `periodo_id`. La sección `campana` de JM queda sin ítems y sus 8 slides modelo
   (20–27) quedan como están. **Curar esas filas es tarea tuya**, y hasta que exista una
   fila de `jm` la expansión por campaña **no se probó contra datos**.
3. **`comunicaciones_post` es una sección activa con 5 ítems y ninguna slide con tokens
   `post_` en la plantilla de JM.** Sale con ⚠ en cada corrida. Es una sección curada
   contra una plantilla que no la contempla: o entra el bloque a la plantilla, o la sección
   se marca de otro modo.

## Esperando decisión tuya

- **El dueño del deck generado es `jpcofanogcba1@gmail.com`**, la cuenta que ejecuta, y no
  `reporteseinformesgcba`, aunque el archivo caiga dentro de la carpeta de reportes. Drive
  no transfiere propiedad por ubicación. Es la pieza abierta de `D-03`.
- **`enc_alcance` se cableó a `digital/Digital/dig_alcance`** y no a `Alcance/alc_alcance`.
  `TOKENS.md` no dice cuál va; se eligió por coherencia con `enc_impresiones`, que sale de
  esa misma solapa y de la misma fila. **Es reversible: una celda.** Si el número no cierra
  con el informe publicado, ahí está la primera sospecha.
- **Entró el formato `fraccion`** y tres filas pasaron a usarlo (`enc_or`, `enc_ctor`,
  `enc_e75_pct`): esas columnas de `digital` vienen como `0.2818`, no como `28.18`, y con
  `porcentaje` el deck decía **0,3% donde el número es 28,2%**. `fraccion` convierte la
  unidad y **no** pone el signo, porque las cajas de JM traen el suyo. **Si algún `*_pct` de
  otra base ya viene en unidades de porcentaje, va con `porcentaje`** — la distinción vive
  en la fila de `MARCADORES`, no en el código.
- **Los números de Orden Público, para mirar juntos.** Son los únicos 11 con valor real:
  `enc_mails_enviados` **110** y `enc_mails_entregados` **110** (idénticos), `enc_aperturas`
  **31** (28,2%), `enc_clics_ctor` **1** (3,2%), `enc_atendidos` **6161**, `enc_e75` **2229**
  (36,2%), `enc_marque1` **67**, `enc_audiencia` **37.763**. Los de IVR salen de **2 filas**
  de la cuenta y la operación es `ULTIMO`, así que toman la última y **no** suman: si esas
  dos filas son dos envíos del mismo encuentro, la operación correcta sería `SUMA`. **No se
  cambió**: es una decisión de negocio y hay que mirarla con el informe publicado al lado.
- **`rdv` compartida como `anyoneWithLink = writer`** (sigue abierto del 03/08). El permiso
  explícito de las cuentas del motor es `reader` y está bien puesto; el link lo pisa.
- **`CAMPANAS.tipo` no tiene ningún lector en el repo**, y sus valores vivos
  (`destacada`, `encuentro_ministros`, `proveedor`) no coinciden con la lista que declara el
  comentario de `Instalar.gs`. Nadie decide nada con esa columna hoy.

## En pausa, y no se vuelve sobre esto

> Siguen en `docs/PENDIENTES_consistencia.md` → "Preguntas al equipo", del 03/08: las **tres
> preguntas sobre la lámina M2** (si la grilla por ejes se dejó de usar; qué mide la línea
> ancha; si el cruce de nombres de JM se corrige en la plantilla o se registra como está).
> **No se re-preguntan y no cuentan como bloqueo.** La cuarta —la autorización para
> armonizar JM— **se cerró el 04/08**: la diste y se ejecutó.

El **`Paso-2.5`** deja de estar en pausa por la armonización, que ya corrió. Lo que sí sigue
abierto para él es el recorrido: si copia el barrido viejo por `getShapes()`, sembraría de
menos — `mapaDeTokens_` tiene el correcto.

## Esperando permiso

**Ninguno.**

## Qué sigue

- **Mirar el informe generado con vos**, que es para lo que se hizo. Los números a discutir
  están arriba en "Trabado" y en "Esperando decisión".
- **Curar una fila de `CAMPANAS` de `jm` con `periodo_id`**, y recién ahí la expansión por
  campaña queda probada contra datos.
- **Tramo 3 — `secco`**, que es la medición de `D-01`: cuántas líneas de `.gs` hace falta
  tocar para el segundo informe. Nada de esta noche se escribió para `jm` en particular, así
  que el conteo debería ser bajo; hay que medirlo, no declararlo.
- **Paso del matcher (`Union.gs`), sin escribir.** Sigue juntando `R-12`, los dos valores de
  ventana a `CONFIG` y el empate técnico del match. **Se le fue una pieza**: la asimetría de
  `verificarPrecondicionAnclaje_` se resolvió anoche. Queda el retiro de
  `VALOR_STATUS_REALIZADA_`, que hoy filtra dos veces por lo mismo.

## Qué mirar antes de tocar algo

- **`buscarMapeo` no cachea, y cuesta caro.** Cada llamada relee `SOLAPAS` y `MAPEO`
  enteras con `getDataRange()`. Con cinco llamadas por fila sobre ~1300 cuentas eran ~13.000
  lecturas y `unirDigitalPorCuenta` **no volvía nunca**. Se arregló **hoisteando fuera del
  bucle**, no cacheando: `Instalar.gs` escribe esas dos hojas y las relee en la misma
  corrida, así que un caché sin invalidación rompería el sembrador. **Si escribís un bucle
  que llama a `buscarMapeo`, resolvé la columna afuera.**
- **`anclarEncuentros` y `unirDigitalPorCuenta` sí cachean por ventana**, a nivel módulo, o
  sea por ejecución. Es seguro porque las cuatro bases son de sólo lectura para el motor.
- **`abrirHoja` devuelve un sobre `{ ok, base, libro, hoja }`, no la hoja.** Costó un
  `getDataRange is not a function` en `catalogoBarriosDesdeBase_` que estaba ahí desde
  siempre, invisible porque el anclaje moría antes de llegar.
- **Nada que recorra una presentación puede usar `slide.getShapes()`.** No ve dentro de
  tablas ni de grupos: son **33 tokens de JM** y 48 de SECCO. El recorrido correcto es
  `piezasDeTextoDeSlide_` (`Armonizar.gs`), que ahora además devuelve `objectId`. Lo pagó
  hoy `eliminarCajaHuerfanaM2Salud_`, que buscó su caja con `getShapes()` y encontró cero.
- **`upsertPorClave_` reescribe la fila entera** (sigue abierto, `P0` en `PENDIENTES`).
  `SOLAPAS` está expuesta: `firma_encabezado`, `filas_datos` y `filas_crudas` no están en
  los objetos del sembrador y **65 de 84 filas** las tienen pobladas. Regla mientras tanto:
  **una columna nueva se agrega al `SEED_*` con su valor real, nunca con `''`.**
- **`tools/api.js` reintenta el transporte hasta dos veces**, porque el frontend de Google
  devuelve de a ratos un 404 en HTML o pierde el body del POST. **El caso HTML no se
  distingue de una corrida que sí ejecutó**, así que una llamada que escribe puede escribir
  dos veces — está escrito en el código, arriba del reintento.
- **Una respuesta grande no vuelve por `/dev`**, y el tope de ejecución de Apps Script son
  **6 minutos**. `generarInforme` sobre `jm` tarda ~240 s: está adentro, pero no sobra tanto.
- **Tres significados distintos de una celda vacía**, a propósito: `D-19` (la fila no
  entra), `D-20` (usa el eslabón siguiente), `D-21` (no hay filtro).

## Números de referencia, verificados hoy

`MARCADORES` en **13** filas (los 11 `prueba_*` se retiraron; entraron 4 `enc_*` nuevos).
`MAPEO` en 121. **Las 10 pruebas de `Pruebas.gs` pasan**, corridas seis veces a lo largo de
la noche: después del anclaje, de la armonización, del Paso 4, del Paso 5 y dos veces al
tocar los formatos. La plantilla de JM quedó en **195 tokens distintos** (191 antes de
armonizar), 22 slides.

**Qué falta cablear, por token distinto** (`tokensSinCablear_('jm')`): **195 en la plantilla
· 13 cableados y presentes · 0 cableados sin caja · 181 sin cablear** — `camp_` 53, `m2_`
31, `rrss_` 21, `ecv_` 19, `gcba_` 19, `enc_` 8, sin prefijo 7, `ivr_` 7, y menos de cinco
cada uno en `cc_`, `imp_`, `mail_`, `pauta_`, `contenidos_`. `FALTANTES` responde lo mismo
pero **por instancia emitida** (438 filas para esos 181 tokens): sirve para atacar una
corrida, no para dimensionar el trabajo.

## Estado de los prompts sin ejecutar

| prompt | estado al 04/08 |
|---|---|
| `Corrida_nocturna_2026-08-04` | **ejecutada.** Puntos 1 a 5 hechos; el 6 quedó cubierto por `FALTANTES` |
| `Paso-4` | **ejecutado** |
| `Paso-5-v2` | **ejecutado**, con su Parte 0 anotada y no ejecutada como parada. La expansión por campaña quedó **sin probar contra datos**: no hay ninguna fila de `jm` en `CAMPANAS` |
| `Paso-2.5` | **destrabado** — la armonización que esperaba ya corrió. Al ejecutarlo, usar el recorrido de `mapaDeTokens_`, no `getShapes()` |
| `Paso-2.13` | sirve como está, auditado el 03/08 |
| `Paso-3-v3` | ejecutado hasta `D.1` Parte D |
| `DOC-8` | sirve como está |
