# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-11, al cerrar el `_27` · demo el 12/08

## Lo primero, porque es de mañana

**El deck de la demo ya está generado y es éste:**

```
corrida jm-20260811-135342
deck    1EjZyuEQMJIo_i5MGdqpZvoRAh5M6SFSn6lS-8S2ttew
        226 s · sin corte · sin fallo · instrumento limpio
        92 impresiones con valor · 55 ok / 7 sin dato / 2 error
```

⚠ **Hay un deck huérfano en la misma carpeta y los dos ids empiezan parecido.** Es
`166MdMSmtkFJT18OOc_wqIWsycgOWG31LU5BQ4xJf1A8`, de la corrida `jm-20260811-132254`, que volvió
en HTML y murió antes del cierre: es la **única fila de `CORRIDAS` sin `fecha_generacion`**.
`panel_ultimasCorridas()` lo muestra como `[SIN CERRAR]`.

**Se muestra el deck ya generado.** Correrlo en vivo es una demostración del motor, no la forma
de tener el deck — `D-28`.

## Dónde estamos

**El `_27` construyó el panel que los Pasos 6-8 nunca hicieron**, y cableó nueve marcadores.

- **`abrirPanel()` ya no es un TODO.** `PanelBackend.gs` expone `panel_getEstado()`,
  `panel_generar()` y `panel_ultimasCorridas()`. El primer ítem del menú dejó de decir
  `'próximamente'`.
- **Selector de informe, de período, de secciones y de modo de presentación**, los cuatro en el
  panel. Antes pasar de `jm` a `secco` era **editar una celda de `CONFIG`**.
- **`opciones.secciones`** decide qué secciones repetibles entran (`D-27`).
- **`opciones.faltantes_como_raya`** rinde el hueco como `—` sin tocar el registro.

```
MARCADORES  64 filas (57 + los 7 de m2), las 64 de jm
marcadores  55 ok · 7 sin dato · 2 error  (eran 46/7/4)
pruebas     13/13 · verificarLaminas VERDE 51/51/51 · partición delta 0
```

## Los 2 errores que quedan, y son uno solo

`enc_impresiones` y `enc_alcance` apuntan a `digital/Digital`, que es `ignorar` por `R-22`.
Fallan en **los cinco** encuentros, no en cuatro. Necesitan la rama por cuenta (`C-23`) y **eso
es trabajo de código**: `datosDeMarcador_` tiene esa rama adentro del `if` que pregunta si la
base es `digital`, así que re-apuntarlos a `looker` sin tocar código haría que los cinco
encuentros publiquen el mismo agregado.

## Lo que hay que saber antes de tocar algo

- **`CAMPANAS` no tiene ni una fila de `jm`.** Las 3 que hay son del seed y `informe_id = secco`:
  dos con `periodo_id` vacío (`D-19`) y una con `mostrar = no`. Por eso `campana` emite cero y
  cuesta 0 s. **No es un bug**, y cargarla es decidir contenido.
- **`secco` tiene cero marcadores cableados.** Su deck sale con 289 huecos y un valor. El panel
  lo marca **"· a desarrollar"** contando `MARCADORES` por informe, no con una etiqueta escrita.
- **El reporte de corrida numera las láminas sobre el DECK EXPANDIDO.** Las escondidas «15 y 24»
  son, en la plantilla, la **10 y la 19**. Cuesta una hora si no se sabe.
- **`m2_*` vive en dos láminas de `jm` y no hay un solo token repetido**: la 9 (visible, 8
  tokens, cableados) y la 10 (escondida, 23 tokens distintos, más granular).
- **`m2/M2 periodo DIRECTA` es `referencia`, no `fuente`**, y `buscarMapeo` exige `fuente`.
  Cablear ahí devuelve `solapa_no_fuente`. La ruta buena es `digital/Directa Mail`.
- **`X-12` está vencida**: decía que `Tipo de mail CONTIENE M2` no era expresable. El `_24` trajo
  `~=` y ahora sí lo es.
- **`FALTANTES` cuenta por ítem y la plantilla por token.** Por eso 207 puede ser mayor que 159
  sin que nada esté roto. El reporte ahora lo dice; no volver a mezclarlos en una sola frase.

## Los nueve cableados de ayer están SIN VALIDAR y hay que levantarlos

Los siete `m2_*` y las dos `frecuencia` llevan `SIN VALIDAR — demo 12/08` en `MARCADORES.notas`.
**Es deuda con fecha**, y la ventana de validación la levanta.

⚠ **`frecuencia` = 21,46 tiene un defecto conocido:** `alcance` viene vacío en 1 de las 4 filas
JM, así que el numerador incluye una campaña que el denominador no tiene. **El número se lee
perfectamente plausible.** Es el hallazgo que ya había dejado el `N2` y sigue abierto (`C-22`).

## Esperando decisión tuya

- **¿`m2_campanias` cómo se cuenta?** Es cantidad de campañas distintas y `OPERACIONES_` no tiene
  DISTINCT. Se dejó sin cablear a propósito: un `CONTEO` de filas daba un número plausible y
  equivocado. Sale como raya.
- **`pauta_*` sigue sin cablear** — era "sólo si sobra" en el `_27` y no sobró.
- **147 filas de `DIGITAL` son huérfanas y 40 son JM.** Sin cambios desde el `_24`.
- **`R-20` y `R-21` escritas y sin mecanismo.**
- **¿`upsertPorClave_` pasa a preservar por defecto**, o cada sembrador se hace cargo?

## Lo que sigue

**El mockup del Panel**, con badge "a desarrollar" en `secco`, `ministros` y `campana`. El de
informes ya está implementado y se calcula; el de `campana` **todavía no** — contar sus ítems sin
correr la sección exigiría reimplementar `D-19` fuera del motor, que es justo lo que `CLAUDE.md`
§4 desaconseja.

## El patrón que ya lleva cinco casos

**Cuando algo parece roto, medir primero cómo se está mirando** — con su borde: vale cuando el
instrumento propio reproduce lógica que el motor ya tiene, **no** cuando se compara la salida del
motor contra un hecho externo.

| se creyó | era |
|---|---|
| `looker` ilegible entero | ventana con fechas en texto; `formatearFecha_` exige `Date` |
| los `pauta_*` publican cero | `String(celda)` disfraza un booleano; `Number(true)===1` |
| `ignorar` bloquea la lectura | bloquea `buscarMapeo`, no `leerFuente` |
| `Cuentas` no tiene ni un id | el encabezado se llama distinto |
| **el `m2` visible está escondido** | **el reporte numera sobre el deck expandido, no la plantilla** |

Y el caso nuevo del `_27`, que es del otro lado del borde: **`leerFuente` por API tiró**
`formatDate(String,String,String)` porque un JSON no transporta `Date`. El instrumento estaba
mal, no el motor — y la salida correcta fue **cablear y dejar que el motor resolviera la
ventana**, no arreglar el instrumento.
