# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-08, al cerrar la corrida nocturna de cuatro prompts · último
commit al escribirlo: `89dce1b`

## Dónde estamos

**La lámina 5 quedó bien.** Es el cambio grande de la noche: publicaba los encuentros de **doce
figuras** y ahora publica los de Jorge Macri, y además **publica los barrios**.

| | antes | ahora |
|---|---|---|
| `ecv_encuentros` | 15 | **4** |
| `ecv_insc_mail_pct` | 59.9 | **50.7** |
| `ecv_insc_cc_pct` | 8.1 | **11.8** |
| `ecv_insc_ivr_pct` | 1.3 | **1.9** |
| `ecv_insc_digital_pct` | 29.3 | **35.7** |
| `ecv_insc_dif_pct` | 2.1 | **0** *(es un dato, no `sin_datos`)* |
| `ecv_barrios` | *(no existía)* | **Belgrano, Caballito, Retiro, Villa Urquiza** |

Corrida de verificación `jm-20260808-012643`: **39 tokens reemplazados** (era 38), `FALTANTES`
en **264** (era 265).

## Pendiente de verificación humana

**Lo que cambia números publicados y hay que mirar en el deck:** los seis marcadores de la
lámina 5 con el filtro `figura=Jorge Macri`, y la lista de barrios. **El deck de la corrida está
en `CORRIDAS`.**

Y sigue pendiente todo lo de las noches anteriores: los nueve porcentajes sin signo, el solape
de `R-16`, `claveDeFila_` y el renombre de la lámina 7.

## Qué se decidió y dónde quedó

- **`R-15` addendum 1** — `rdv` es el quinto canal; su señal es la columna `Figura`.
- **`R-17`** — el temario selecciona, los filtros acotan, la semana es el fallback.
- **`R-18` + addendum 1** — una lista `DISTINCT` publica el canon del catálogo; cuatro estados.
- **`S-04`** — el catálogo de barrios y sus variantes son estables.
- **`D-23` + addendum 1** — la identidad de una lámina va a las notas del orador, un solo campo.
- **`C-01`** tiene dos addenda: el motor puede escribir las notas, acotado a `#lamina:`.

## Qué sigue

1. **`T2.11` · el cableado lámina por lámina.** **206 de las 264 filas de `FALTANTES` son
   cableado puro** (sin fila en `MARCADORES`); 58 fallan por datos. **Los nueve `ecv_*` que
   estaban bloqueados por el universo ya se pueden cablear** — el filtro existe desde hoy.
2. **`_11` · Fase 2, el sellador.** **No se corrió a propósito**: es la primera corrida que
   escribe sobre una plantilla y la querés mirar despierto.
3. **`_14` Partes A–C · los subagentes.** Su Parte 0 ya corrió y tiene un hallazgo que cambia
   el diseño (abajo).
4. **Medir el presupuesto.** Sigue sin causa establecida.

## Esperando decisión tuya

- **`REVISAR` no existe como estado del motor** y `R-18` lo pide. Hoy un valor rechazado **no
  llega al deck** —queda en la traza y en `FALTANTES`—, pero si **todas** las filas se rechazan
  el estado dice `sin_datos`, que es lo que el addendum prohíbe. **Crear el estado es un prompt
  propio.**
- **`CLAUDE.md` §7 no tiene dueño** para "¿qué operaciones tiene el motor?" ni para la
  configuración de herramientas (`.claude/`, subagentes). **No toqué §7**: cambiar el ruteo es
  tuyo.
- **Las dos solapas `Buscador por periodo` no se pasaron a `fuente`** — ver abajo.
- **`digital/Alcance` es fuente y su `nombre_campaña` no está en `MAPEO`.** Es la que engancha
  el nombre del temario con el id de cuenta.
- **Tres ranuras `[MANUAL]` para cuatro barrios** en la lámina 5. Es plantilla, no motor.
- **La forma "una caja por barrio" se pospuso**, no se cayó: `D-22` y sin desborde.

## Lo medido esta noche, y no hay que volver a medirlo

- **Un subagente NO ve el `CLAUDE.md` del proyecto.** Medido lanzando uno sin herramientas:
  devolvió *"NO TENGO INSTRUCCIONES DE PROYECTO EN CONTEXTO"*. Cada archivo de subagente tiene
  que decir **qué abrir, con la ruta**.
- **Claude Code `2.1.220`** — `/agents` ya no crea nada; los archivos se editan a mano.
- **Las dos solapas `Buscador por periodo` son paneles, no tablas**: fila 1 rótulos, **fila 2 el
  período tipeado a mano**, fila 3 encabezados que son fórmulas, y los datos generados por un
  `FILTER` contra esas celdas. **`R-02` las veta.** Y hoy están en `31/07 → 07/08` mientras el
  informe corre `24–30/07`: leerlas traería otra semana **sin que ningún token falle**.
- **`CAMPANAS` tiene 10 columnas** (el seed es el correcto) y su `tipo` **diverge del seed**:
  la hoja dice `destacada`, el seed dice `campana`. **Nadie lee esa columna hoy.**
- **`PERIODOS` no cubre la semana del informe** y no molesta: la ventana sale de `CONFIG`.
- **67 campañas** estuvieron activas en la ventana 24–30/07.

## Qué mirar antes de tocar algo

- **`LISTA` es la séptima operación y es genérica.** El catálogo (`base/solapa`) y el separador
  salen de **dos columnas nuevas de `MARCADORES`**, no del código.
- **Catálogo vacío es `error`, no rechazo masivo.** Sin esa guarda, un fallo de acceso se leería
  como *"todos los valores están mal"*.
- **Antes de escribir un filtro, verificar que su campo esté en `MAPEO`** — un filtro propio con
  campo no mapeado **no filtra: falla**. Y el heredado con campo ausente **se ignora en
  silencio**: el mismo texto se comporta distinto según dónde se escriba.
- **Un número correcto puede salir de las filas equivocadas.** `CLAUDE.md` §4.
- **⚠ Dos cosas que se llaman igual no son la misma cosa.** Ahora hay un caso más: **`REVISAR`**
  existe en `Fechas.gs` como origen de una columna de fecha, y **no es** un estado de marcador.
- **`familia_tokens` está congelado** hasta la Fase 4.
- **`tools/api.js` no reintenta por defecto.** Si el transporte devuelve HTML, **verificar si
  llegó a correr** antes de repetir. Y un bucle `isRowHiddenByFilter` fila por fila sobre mil
  filas **cuelga la llamada**: medir el filtro por su rango, no iterando.
- **Seis láminas están escondidas**; los decks se llaman todos igual, tomar el `deck_id` de
  `CORRIDAS`.

## Números de referencia

`MARCADORES` en **44 filas** y **14 columnas** (entraron `catalogo` y `separador`). `SECCIONES`
en 36 filas. `MAPEO` en 140. `CAMPANAS` en 3 filas, **las tres de `secco`**. `FALTANTES` en
**264**. Plantilla `jm`: 22 láminas, 172 tokens. **Las operaciones del motor son siete.**
