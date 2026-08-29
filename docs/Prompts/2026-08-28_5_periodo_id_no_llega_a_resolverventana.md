# `2026-08-28_5` — El `periodo_id` no llega a `resolverVentana`, y por eso la campaña falla entera

**Subagente:** ninguno.
**Destino:** `docs/Prompts/`.
**Estado:** Parte 0 ejecutada el 28/08/2026 — ver el reporte al pie. Partes A y B **no ejecutadas**.
**Continúa** `2026-08-28_3`, ya ejecutado. ⛔ **Aquél no se edita: lo que sigue lo corrige acá.**

---

## El hallazgo, y sale de una coletilla que NO está

`FALTANTES` de la corrida `jm-20260828-193948` trae, en ~130 tokens `camp_*`, exactamente este
motivo:

> `error: ventana no resuelta: La campaña "3512-AGOSEGGJ" tiene 2 filas en CAMPANAS — ambigua.`

⭐⭐ **Lo que prueba ese texto no es que haya dos filas: es que el `periodo_id` llegó VACÍO.** El
mensaje se arma así en `resolverVentana`:

```
'… tiene ' + filas.length + ' filas en CAMPANAS' +
  (opciones.periodo_id ? ' para el período "' + opciones.periodo_id + '"' : '') + ' — ambigua…'
```

**La coletilla `para el período "…"` es condicional, y no aparece.** → `opciones.periodo_id` estaba
vacío cuando el consumidor lo leyó.

**Y ahí cierra la cadena, porque `filasDeCampana_` (`Config.gs`) filtra así:**

```
return per === '' || normalizarValorDeclarado_(c.periodo_id) === per;
```

⛔ **Con el período vacío no filtra nada**, devuelve las dos filas, y `resolverVentana` hace lo
correcto: **se niega a elegir** y falla. El motor no tiene un bug de decisión — tiene un dato que se
pierde en el camino.

⛔⛔ **Es el mismo modo de falla que el `2026-08-22_20`, y la comparación importa porque aquél ya
costó una corrida publicada:** *el productor llenaba un campo y el consumidor leía otro, y ninguno
de los dos fallaba*. `itemsDeSeccion_` arma `opcionesCampana = { campana, periodo_id, seccion_id,
filtro_seccion }` con el `periodo_id` adentro — y el comentario que está ahí **declara que es
obligatorio**, con este motivo textual: *«con la lista, `campana_id` solo ya no identifica una fila.
Sin esto `resolverVentana` no puede saber de qué semana es la ventana y falla por ambigua — que es
el comportamiento correcto, pero acá tenemos el dato y hay que pasarlo»*. **El dato se pone y no
llega.**

⚠ **Y por eso hasta hoy nadie lo vio: con UNA sola fila por campaña, `per === ''` da el mismo
resultado que filtrar bien.** El defecto estuvo siempre y **la segunda fila sólo lo destapó**. La
corrida del período de la semana no es el caso feliz: es el mismo defecto sin síntoma.

**Lo que el deck confirma, para que la Parte 0 no lo tenga que medir de nuevo:** la sección **se
expandió, dos veces** (slides 13–20 y 22–29), y los dos bloques salieron en `---` — que
`textoFaltante_` emite para `error` o `REVISAR`, **no** para «sin cablear». ⛔ **Las causas 1 a 5 y
la D del `_3` quedan todas descartadas.**

---

## Parte 0 — sólo lectura: dónde se pierde el `periodo_id`

**Modelo: Sonnet. Effort: alto.** ⛔ **No editar. Reportar y parar.**

Rastrear el `periodo_id` desde donde se pone hasta donde se lee, **nombrando cada salto y diciendo
en cuál desaparece**:

`itemsDeSeccion_` (rama `CAMPANAS`, arma `opcionesCampana`) → el ítem → la asignación →
`opcionesItem` / lo que copia el despachador → `resolverMarcadores` → `datosDeMarcador_` →
`resolverVentana`.

Para cada salto: **qué campos copia y cuáles descarta**, con el reproductor. ⚠ **Sospecha declarada
para que se confirme o se desmienta, no para que se asuma:** en el `_20` el problema fue que
`opcionesItem` copiaba **sólo** un subconjunto. Si acá pasa lo mismo, hay que decir **qué
subconjunto** y **desde cuándo**.

⭐ **Y una pregunta que va con la anterior, porque la respuesta cambia el arreglo:** ¿hay **más de un
camino** por el que un marcador de campaña llega a `resolverVentana` —la rama por cuenta, la
declarativa de `D-30`, la general—? Si el `periodo_id` se pierde en uno solo, **arreglar ése deja
los otros rotos y sin síntoma hasta la próxima campaña duplicada.**

⚠ **No inventar el faltante:** si el rastreo no alcanza para saber en qué salto se cae, eso se
reporta como falta. Un supuesto razonable metido en silencio sobrevive a la corrida.

**Reportar y parar.**

---

## Parte A — el arreglo, y una decisión que no es de Code

**Modelo: Opus. Effort: alto.** Mueve un número que hoy no se publica y mañana sí.

1. **El arreglo mecánico:** que el `periodo_id` llegue. Proponerlo con su alcance —qué firmas toca,
   qué otros consumidores leen esas mismas `opciones`— y **sin aplicarlo todavía**.
2. ⭐ **La decisión que le corresponde al usuario, planteada con sus dos opciones y su costo:**
   *¿dos filas de la misma campaña, de dos períodos distintos, deben producir **dos bloques** en un
   mismo deck?* Con el `periodo_id` viajando, hoy producirían **dos bloques idénticos** —misma
   cuenta, mismas fechas propias, mismos números—, uno por período. Las salidas son distintas:
   - **Sí, dos bloques:** el arreglo del punto 1 alcanza y el deck sale con la campaña repetida.
   - **No, una sola:** hace falta además decidir **cuál** entra, y eso es criterio editorial —lo
     natural es *la del período de la corrida*, pero **eso hoy no existe**: `itemsDeSeccion_` ni
     siquiera recibe el período de la corrida, y está anotado en `docs/PLAN.md` como *la pieza que
     falta*.

   ⛔ **No elegir por el usuario, y no cablear la segunda salida de paso.**
3. **El control que tiene que quedar escrito antes del arreglo**, porque después no se puede
   distinguir: con **una** fila, `per === ''` y el filtro correcto dan **el mismo resultado**. Un
   banco que sólo pruebe el caso de una fila **pasa en verde con el bug puesto**. El caso de dos
   filas con períodos distintos es el único que discrimina.

**Reportar y parar.**

---

## Parte B — implementar, si el usuario aprueba la Parte A

**Modelo: Sonnet.**

El arreglo del punto 1, con banco: **control positivo** (una fila resuelve como hoy), **control
negativo con mutación verificada** (dos filas de períodos distintos resuelven a una cada una, y si
el parche no aplica el caso **falla** en vez de dar verde). Commit propio, `docs/BITACORA.md`, y el
`D-NN` si la Parte A concluye que hay decisión estructural — **a partir de `D-53`**, verificando
antes qué números están tomados.

---

## Anexo — tres cosas que este `FALTANTES` destapó y NO van en este prompt

Se anotan para que no se pierdan, cada una con prompt propio:

1. ⛔ **`sección \`undefined\`` en el texto de universo de `L-036`** — *«(sección `undefined`,
   resuelta por `seccion_id` explícito)»*. Es un `undefined` **impreso como texto**, exactamente el
   síntoma que `CLAUDE.md` §2 describe para una columna que no llegó a un lector. El número puede
   estar bien; el diagnóstico está roto.
2. **`frecuencia` (`L-031`)**: el filtro `campana~=JM` sobre `looker/resumen_metricas_dinamico` da
   **0 de 37 filas**. Ningún nombre de campaña de esa solapa contiene `JM`. Es la misma familia que
   el ámbito de IVR del `2026-08-28_6`: **el corte no discrimina porque el dato no lo soporta.**
3. **`mail_*` de JM**: *«el filtro … → 0 de **0** filas»*. **Cero filas de entrada**, no cero que
   pasan el filtro. Un filtro sobre un conjunto vacío no dice nada del filtro, y el mensaje los
   presenta igual.

---

## Reporte de la Parte 0 — 28/08/2026

**Ejecutada por Claude Code, sólo lectura. Ninguna edición.**

### La premisa: ✅ se sostiene, literal

`Fuentes.gs:266-272`, dentro de `if (opciones.campana)`:

```
motivo: 'La campaña "' + opciones.campana + '" tiene ' + filas.length + ' filas en ' +
  'CAMPANAS' + (opciones.periodo_id ? ' para el período "' + opciones.periodo_id + '"' : '') +
  ' — ambigua. La clave real es (campana_id, periodo_id): …'
```

⚠ La cadena está **partida en dos líneas** (`'filas en ' + 'CAMPANAS'`), así que un `grep "filas en
CAMPANAS"` da **cero** y parece que el mensaje no existe. No es evidencia en contra: es el grep.

### El rastreo, salto por salto

| # | salto | qué pasa con `periodo_id` |
|---|---|---|
| 1 | `itemsDeSeccion_`, rama `CAMPANAS` — `Generador.gs:3164` | **se pone**: `periodo_id: String(c.periodo_id \|\| '').trim()` |
| 2 | el ítem — `Generador.gs:3203` | `opciones: opcionesCampana` — el objeto entero |
| 3 | la asignación — `Generador.gs:3547` | `item: item` — el ítem entero |
| 4 | `opcionesItem` — `Generador.gs:5205-5209` | ✅ **sobrevive**: copia **todas** las claves con `Object.keys(...).forEach` |
| 5 | **`resolverMarcadores` — `Generador.gs:1299`** | ⛔⛔ **SE PIERDE ACÁ** |
| 6 | `resolverVentana` — `Fuentes.gs:257` | recibe `opciones.periodo_id === undefined` |
| 7 | `filasDeCampana_` — `Config.gs:141` | `per === ''` → no filtra → devuelve las **2** filas |
| 8 | `resolverVentana` — `Fuentes.gs:267` | `filas.length > 1` → falla, **sin la coletilla** |

**El salto 5, textual:**

```
var ventana = opciones.ventana || resolverVentana({
  campana: opciones.campana,
  periodo_ref: String(fila.periodo_ref || '').trim() || undefined,
  seccion_id: opciones.seccion_id
});
```

**No copia `opciones`: construye un literal nuevo con TRES claves**, y `periodo_id` no es una de
ellas. Todo lo que viajó ocho saltos se descarta en la línea que lo iba a usar.

### ⛔ La sospecha declarada del prompt queda DESMENTIDA

El prompt sospecha que *«`opcionesItem` copiaba sólo un subconjunto»*, como en el `_20`. **No es
así, y la diferencia importa para el arreglo:** `opcionesItem` copia **todo** —el `_20` lo arregló
justamente ahí— y la pérdida está **una capa más abajo**, en un literal que se escribió antes de
que `periodo_id` existiera.

### Desde cuándo — es una migración a medias, no una omisión

| pieza | commit | fecha |
|---|---|---|
| el literal de tres claves (`Generador.gs:1299`) | `6991e4c` · *Paso 3 (v3) Parte C* | **03/08** |
| el productor pone `periodo_id` (`Generador.gs:3164`) | `cd5bc99` · *CAMPANAS se lee como lista* | **18/08** |
| `filasDeCampana_(campanaId, periodoId)` (`Config.gs:141`) | `cd5bc99` — **el mismo commit** | **18/08** |

⭐⭐ **El commit del 18/08 tocó el productor y la hoja final, y no tocó el intermediario.** El literal
de 1299 es del 03/08, cuando `periodo_id` no existía como concepto ahí: nunca lo omitió a propósito
— **dejó de estar completo el día que la clave cambió.** Es la forma exacta de *«un instrumento que
mide un cambio no puede depender de lo que el cambio modifica»*, aplicada a un consumidor.

### ¿Más de un camino? — **No. Uno solo.**

- **`Generador.gs:1300` es el ÚNICO sitio del motor que le pasa `campana` a `resolverVentana`.** Los
  otros ~24 llamadores pasan `{}`, `{periodo_ref}` o nada, y `resolverVentana` **sólo lee
  `opciones.periodo_id` dentro de la rama `if (opciones.campana)`** (`Fuentes.gs:257`, `262`, `269`).
- **`datosDeMarcador_` no resuelve ventana**: la **recibe** como tercer parámetro
  (`Generador.gs:242`, llamada en `1363`). La rama por cuenta y la declarativa de `D-30` cuelgan de
  esa misma resolución única — **no son caminos alternativos**.
- ⭐ Corolario para la Parte A: **el arreglo es un punto**, no un barrido. Pero conviene mirar si
  copiar `opciones` entero en vez de agregar una cuarta clave, porque el próximo campo que se sume
  al ítem va a caer en la misma trampa.

### ⚠ Dos cosas que la Parte 0 encontró de paso y hay que saber antes de escribir el banco

1. ⛔ **`opciones.ventana` cortocircuita `resolverVentana`.** `resolverMarcadores(informeId,
   { ventana: … })` **nunca llega** a la línea 1299 — lo hace `Auditoria.gs:1737`, entre otros. Un
   instrumento que pase la ventana ya resuelta **no reproduce el bug y da verde**.
2. **La rama `REUNIONES` también pone `periodo_id`** (`Generador.gs:3102`) y **también se pierde en
   el mismo salto**. Hoy es inofensivo porque `resolverVentana` sólo lo mira con `campana`, pero es
   el mismo dato perdido por el mismo sitio: si algún día el eslabón de reuniones lo necesita, ya
   está roto y sin síntoma.
