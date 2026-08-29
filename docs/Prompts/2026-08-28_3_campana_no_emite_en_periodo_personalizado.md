# `2026-08-28_3` — Una campaña cargada no emite en un período personalizado

**Subagente:** ninguno.
**Destino:** `docs/Prompts/`.
**Estado:** no ejecutado.

---

## El hecho a explicar (dicho por el usuario, sin medir)

Se corrió `jm` sobre un **período normal** y la campaña salió. Después se creó un **período
personalizado**, se cargaron **las mismas campañas y reuniones**, y **la campaña no sale**.

La fila que el usuario ve en `CAMPANAS`, pegada tal cual (10 valores):

```
2026_agosto_21_28	3512-AGOSEGGJ	Operativo Movilidad Más Segura	jm	digital	destacada	14/08/2026	31/08/2026	sí	3512-AGOSEGGJ
```

⚠ **Nada de esto está verificado contra la planilla ni contra una corrida.** Es el reporte de una
persona mirando una hoja, y el prompt entero existe para no tratarlo como medición.

⚠ **Y una premisa del prompt que hay que verificar antes que nada:** `CAMPANAS` declara
`['periodo_id','campana_id','nombre','informe_id','base_id','tipo','desde','hasta','mostrar','orden','id_cuenta']`
más lo que agregue `COLUMNAS_DELTA_`. La fila pegada trae **diez** valores y el décimo es un
`Id cuentas`. **Eso es compatible con dos estados distintos**: `orden` vacío y `id_cuenta` cargado
(pegado colapsado), o `id_cuenta` **vacío** y el id caído en `orden` (fila corrida). Los dos se ven
igual en un chat y **mandan a trabajos opuestos**.

---

## Parte 0 — sólo lectura: el árbol de causas, contra el código de hoy

**Modelo: Sonnet. Effort: alto** (leer con cuidado, no decidir).

⛔ **No editar nada. No pushear. Termina en «reportar y parar».**

Lo que se pide es **una lista cerrada de los lugares donde un ítem de la sección `campana` puede
desaparecer entre la fila de `CAMPANAS` y la lámina**, cada uno con **(a)** el reproductor que lo
muestra —`grep` con nombre de función, nunca `archivo:línea` como dato—, **(b)** qué imprime el
reporte de corrida cuando la causa es ésa, y **(c)** si distingue esa causa de las demás o las
confunde.

Verificar puntualmente estas seis, que son las que este prompt asume y **ninguna está medida**:

1. **La rama `CAMPANAS` de `itemsDeSeccion_` no compara el `periodo_id` de la fila contra el de la
   corrida.** El comentario que está ahí lo declara —dice que la selección semanal *no está
   implementada* y que `itemsDeSeccion_` ni siquiera recibe el `periodo_id`—. **Un comentario que
   afirma un contrato es una premisa sin testigo** (`CLAUDE.md` §4): confirmar o desmentir leyendo
   el código, y decir cuál de las dos.
   - Si es cierto, entonces **el período no puede ser la causa**, y eso cambia hacia dónde mira
     todo el resto del reporte.
2. **La asimetría con `REUNIONES`.** `anclarEncuentrosSinCache_` **sí** recorta por período —usa
   `periodosQueDescribenLaVentana_` y, con override, el `periodo_ref` de la ventana—. Confirmar
   que ese recorte **no toca campañas**, y dejar dicho el contraste: mismo temario, dos
   comportamientos.
3. **El comparador de `mostrar`.** Con qué normalización se compara, y qué pasa con `si` sin tilde,
   `Sí`, `SÍ`, ` sí `. Decir si una fila con `si` cae con motivo visible o en silencio.
4. **Dos filas de la misma campaña con `periodo_id` distinto.** Cuántos ítems produce, cuántas
   asignaciones, y qué hace `resolverVentana` con `filasDeCampana_` cuando recibe el `periodo_id`
   del ítem y cuando no lo recibe. **Interesa el caso «emite dos veces» tanto como «no emite»**: el
   usuario reporta el segundo y hay que poder descartar el primero.
5. **Las tres formas de que la sección entera no corra**, y cómo se distinguen en el reporte:
   sección **no tildada** en `opciones.secciones`, **corte por presupuesto** antes de llegar a ella,
   y **`LAMINAS` sin ancla** para su bloque. ⚠ `CLAUDE.md` §4 ya tiene el caso de los 269 `/////`
   de los que 264 eran del corte: si dos de estas tres se ven igual en el reporte, **eso es el
   hallazgo**.
6. **Qué queda escrito y dónde.** Si el detalle por sección —`campana: N emitido(s)` y las
   exclusiones con motivo— sobrevive en la fila de `CORRIDAS` después del cierre, o si sólo existe
   en el reporte que el panel muestra una vez. De eso depende si el diagnóstico se puede hacer
   **sobre la corrida que ya pasó** o hace falta correr de nuevo.

Además, dos cruces documentales, y **citando el texto que se encuentre, no el que se recuerde**:

- `docs/CONFIG_INFORMES.md` §1.4 dice, para este caso exacto: *si una fila cargada no emite, la
  causa a mirar primero es `periodo_id` vacío o `mostrar` distinto de `sí`, **nunca la fecha***.
  Verificar que sigue vigente y que ningún `D-NN` posterior la superseda.
- `docs/PENDIENTES_consistencia.md`: buscar si el hueco *«las campañas no se recortan por el período
  de la corrida»* ya está anotado. **Si no está, decirlo** — no anotarlo todavía.

**Reportar y parar.** Sin conclusión sobre cuál es la causa: eso es la Parte A.

---

## Parte A — el diagnóstico y lo que le falta

**Modelo: Opus. Effort: alto.**

Sólo con lo medido en la Parte 0: decir **qué causas del árbol siguen en pie** para el hecho
reportado y **cuál es la observación mínima que las separa**. Para cada una: qué dato hace falta
—una línea del reporte de corrida, una celda de la hoja, una corrida nueva— y **quién puede
conseguirlo** (el usuario, no Code).

⛔ **No escribir código en esta parte.** Si la Parte 0 muestra que el reporte de la corrida ya
contesta, la respuesta correcta es *«pedir el reporte»* y no *«escribir un diagnóstico»*.

**Reportar y parar.**

---

## Parte B — sólo si la Parte A concluye que el reporte no alcanza

**Modelo: Sonnet.**

Una función de **sólo lectura**, sin parámetros y sin `_` final —así aparece en el desplegable del
editor (`CLAUDE.md` §2)—, que devuelva por `Logger.log`, para **cada fila de `CAMPANAS`**: el
`periodo_id`, el `mostrar` **tal cual está en la celda** (entre delimitadores, para que un espacio
o una tilde faltante se vean), el `id_cuenta`, el `orden`, y **si entraría como ítem hoy**.

⛔ **Llamando a las funciones reales del motor**, no reproduciendo sus filtros: un instrumento que
reimplementa la lógica que audita es el error que este repo ya cometió cuatro veces.
⛔ **No escribe en ninguna hoja.** Commit propio, y `docs/BITACORA.md` en una línea.

---

## Lo que este prompt NO hace

- No toca `CAMPANAS`, `PERIODOS` ni ninguna hoja.
- No cambia el comportamiento de la selección de campañas. Si la Parte 0 confirma que el período
  no las recorta, **eso es una decisión pendiente del usuario** (`D-NN`), no un arreglo a hacer de
  paso: `docs/CONFIG_INFORMES.md` §1.4 declara hoy que **la ventana agrega y el temario
  selecciona**, y cablear un recorte por período la derogaría.
