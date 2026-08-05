# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-12, antes de arrancar el objetivo de `ULTIMO` determinista ·
último commit al escribirlo: `613b4c9`

## Dónde estamos

**Los once números de Orden Público cierran contra el informe publicado.** Era el bloqueo
principal desde el 04/08 y se cerró el 11/08, en dos pasos: la cuenta (10/08) y la operación
(11/08).

**El deck vigente:** `14_QBHSTHu9lxinvemh7CMVwCct51ItzpmzzY3Wmr0Oo`, corrida
`jm-20260805-125133`. En su slide 7 —Orden Público— están los once verificados caja por caja:
**71.234 · 78.637 · 256 · 27.599 (38,74%) · 44.043 · 43.439 · 4.652 (10,7%) · 145 (3,1%)**.

**Cómo se llegó, que importa para lo que sigue:**

1. **La cuenta** (10/08). El matcher elegía `3347` porque **la fecha no entraba al score** —
   se usaba sólo como prefiltro de ±14 días. Ahora pesa 0,5, igual que el barrio.
2. **IVR a `SUMA`** (11/08), verificado dígito a dígito contra `VALIDACION` §3.2.
3. **Mail no es `SUMA` ni `ULTIMO`: selecciona el envío de convocatoria.** La columna
   `Tipo de mail` existía y no estaba mapeada. Con `mail_tipo=Convocatoria` quedan tres filas
   y `ULTIMO` toma la del 25/07, que es la publicada.

## Trabado

1. **⚠ `SUMA` sobre cero filas devuelve `0`, no `sin_datos` — regresión del 11/08.** Las
   cuatro slides de encuentro que no tienen filas de IVR (San Cristóbal y Retiro) muestran
   **`0`** en `enc_atendidos`, `enc_audiencia`, `enc_marque1` y `enc_e75`. **Son 16 ceros
   falsos**, y son los que hicieron subir "tokens con valor" de 18 a **34**: el conteo mejoró
   por un artefacto. **Un cero de audiencia se lee como "no llamamos a nadie", no como "no hay
   dato".** Los de mail no lo tienen: `ULTIMO` sobre cero filas sigue dando `sin_datos`.
   **No se arregló a propósito**: tocar `opSUMA` cambia el comportamiento de todos los
   marcadores que suman y merece su propia medición.
2. **⚠ `ULTIMO` elige por posición en la hoja, no por fecha.** El filtro
   `mail_tipo=Convocatoria` deja tres filas —22/07 ×2 y 25/07— y `ULTIMO` toma la última **por
   posición**. Las del 22/07 son **201.515** y **25.560**: si alguien reordena la hoja,
   `enc_mails_enviados` pasa de 44.043 a 201.515 **y no salta nada**. **Es el objetivo del
   prompt del 12/08.**
3. **El score de anclaje saturó en `1,00`** y el circuito de `ANCLAJE_PENDIENTE` nunca corrió
   de punta a punta. Es el **objetivo B**, anotado como `P1` en `PENDIENTES` el 11/08.
4. **`CAMPANAS` no tiene ninguna fila de `jm`.** La sección `campana` emite 0 ítems.
5. **`REUNIONES` no es el temario**: le faltan `Primera Persona con Pareto 27/07` —el
   encuentro más grande de la semana— y `M2 | Registro Civil`.
6. **`3354` y `3346` tienen cero filas de mail**, aunque `rdv` registra un inscripto por mail
   en cada uno. Es **inconsistencia de datos**, y es lo que impidió validar la regla de
   convocatoria fuera de `3387`.

## Esperando decisión tuya

- **Los cuatro `ecv_barrio*`**: `ecv_barrios` necesita una operación que no existe
  (`DISTINCT`); `ecv_barrio1-3` están `[MANUAL]` en `CONFIG_INFORMES.md` §1.4 con una `[?]`
  que **resuelve los dos huecos a la vez**.
- **Falta un formato "unidades de porcentaje sin signo"**; hoy se usa `numero`.
- **`camp_bench_*`**: ¿fijos, o del período anterior?
- El **dueño del deck** es `jpcofanogcba1@gmail.com` (`D-03`).

## En pausa, y no se vuelve sobre esto

> Las tres preguntas sobre la lámina M2. **Los tres remitentes sueltos** y los **once
> `camp_resp_*`**: diferidos el 07/08 y **no se vuelven a reportar**. El `P1` del reintento de
> `tools/api.js`, en observación. **`enc_e75_pct` da 38,74 contra 39% publicado: es el mismo
> número redondeado, no es un error y no se ajusta.**

## Qué sigue

1. **`ULTIMO` por fecha** — el prompt del 12/08.
2. **`SUMA` sobre cero filas** — la regresión del punto 1 de "Trabado".
3. **Objetivo B** — que el score ordene y el circuito de confianza se pruebe.
4. **`Pedido-3` Partes E, F y G**; **`Pedido-1` Partes A, C y E**; **`m2_`** (tiene `P1`
   abierto y **no es autocontenido**).
5. **Tramo 3 — `secco`**, la medición de `D-01`.

## Qué mirar antes de tocar algo

- **Las bases no se leen desde node** (scope `drive.file`): se mide por
  `tools/api.js llamar fn=eval`. **⚠ `eval` es invocable por la API.**
- **`generarInforme` corta con `ECONNRESET` casi siempre**, incluso en segundo plano. **La
  corrida sí ejecuta del lado del motor**: verificar contra `CORRIDAS` en vez de reintentar.
  `unirDigitalPorCuenta` y `anclarEncuentros` directos **no vuelven** por `/dev`.
- **`digital` es `snapshot` por diseño y no se filtra por ventana.** Sus solapas usan fecha de
  inicio de campaña con lead de 3–7 días; el recorte lo hace el link campaña↔encuentro
  (`R-04`). Una convocatoria del 22/07 para un encuentro del 27/07 es legítima.
- **`SECCIONES.filtro` filtra ítems de la iteración; `MARCADORES.filtro` filtra filas de la
  base.** El de sección se hereda al marcador **sólo si su campo está mapeado**.
- **`mail_tipo` entró a `MAPEO` sin `valores_incluidos` a propósito**: filtrar ahí sacaría las
  filas de confirmación y agradecimiento para toda la corrida.
- **Un porcentaje no se suma.** `enc_e75_pct` es `PCT` sobre `ivr_e75/ivr_atendidos`; sumarlo
  daba 77,6% donde el valor es 38,7%.
- **`upsertPorClave_` reescribe la fila entera.** Columna nueva: primero `COLUMNAS_DELTA_`,
  después `headers`, y al `SEED_*` con su valor real.
- **`curarMarcadores_` y `curarSecciones_`** son las puertas de curación. `sembrarSecciones_`
  sólo agrega.
- **Nada que recorra una presentación puede usar `getShapes()`.** `piezasDeTextoDeSlide_`
  **saltea las celdas combinadas no principales** — es lo que hizo leer "faltan tokens" donde
  faltaban celdas.
- **Tres significados distintos de una celda vacía**: `D-19`, `D-20`, `D-21`.

## Números de referencia

`MARCADORES` en 19 filas, con columna `filtro`. `MAPEO` en 121 (entró `mail_tipo`).
**Las 10 pruebas pasan.** Anclaje: **5 anclados · 0 sin link · 0 baja confianza**, los cinco
con score **1,00** (saturado — ver objetivo B).
Deck vigente: **34 tokens con valor y 288 faltantes**, pero **16 de esos 34 son los ceros
falsos** de la regresión de `SUMA`: los útiles son **18**.
`rdv` en la ventana 24–30/07: **3364 inscriptos · 811 asistentes · 16 encuentros**.
