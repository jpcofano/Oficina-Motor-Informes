
---

## ⛔⛔ P0 · `camp_titulo` publica la campaña equivocada en `L-016` — **Parte 0, sólo lectura** (03/09/2026)

**El hecho a explicar**, medido por el usuario sobre el `.pptx` de `secco` 28/08–03/09:

| lámina | slide | visible | publica |
|---|---|---|---|
| **`L-016`** | 17 | ✅ **SÍ** | «-Alerta Amarilla - 2/9-» · ⚠ **una sola vez, no una por bloque** |
| `L-017`…`L-022` bloque 1 | | sí | «-Operativo Muro \| 25/8-» ✅ |
| `L-017`…`L-022` bloque 2 | | sí | «- Fin de las mafias…-» ✅ |
| **`L-023`** | 24 **y** 32 | ⛔ no | «-Alerta Amarilla - 2/9-» **en los dos** |

⇒ **Dos bloques, tres campañas nombradas, y la portada anuncia una que sus seis láminas siguientes
no muestran.**

### ⭐⭐ 1 · El camino que pinta `camp_titulo` **sin pasar por `tokensDeSlide_`** — CONFIRMADO en el código

`pintarTokensFijosDeLamina_` (`Generador.gs`) elige **dónde** pinta con una sola condición:

```js
var donde = (ctx.slide && ctx.exclusivos && ctx.exclusivos.indexOf(token) !== -1)
  ? ctx.slide : ctx.presentacion;
```

⛔ **`camp_titulo` NO es exclusivo de ninguna lámina** — `Instalar.gs` ya lo dice con todas las
letras y con su número: *«un token fijo se pinta con `replaceAllText` sobre la presentación entera:
`camp_titulo` aparece en **14 láminas** y publica **un solo valor** en todas»*.

⇒ **`donde = ctx.presentacion`**, y `presentacion.replaceAllText` **pinta todas las slides del deck,
las escondidas incluidas** — no consulta visibilidad, no sabe de qué lámina salió el token y no
sabe de qué ítem se trata.

⭐ **Eso responde exactamente la pista del usuario.** La visibilidad se consulta en **dos** lugares y
**ninguno de los dos gobierna el pintado**:

| función | qué decide | ¿mira si está escondida? |
|---|---|---|
| `tokensDeSlide_` (etapa 3) | qué resolver **por ítem** | ✅ sí — devuelve `[]` |
| `tokensVisiblesDe_` (etapa 4) | **qué tokens** resolver | ✅ sí — los excluye |
| ⛔ **`presentacion.replaceAllText`** | ⛔ **DÓNDE pintar** | ⛔ **NO. Pinta el deck entero** |

⇒ ⭐ **Por eso `L-023` está escondida, sus `camp_resp_*` quedaron crudos con las llaves puestas
—`tokensDeSlide_` cortó— y `camp_titulo` igual se pintó.** Son dos mecanismos distintos: uno decide
**qué se resuelve** y el otro **dónde se pinta**, y sólo el primero mira la visibilidad.

⇒ ⭐⭐ **Y explica por qué las dos copias de `L-023` dicen lo MISMO: un pintado de deck entero no
puede producir dos valores.** No es que eligió mal dos veces — es que hay **un** valor.

### ⚠ 2 · La hipótesis de los dos caminos: **confirmada, con una corrección**

La hipótesis del prompt —*«uno por ítem y otro por lámina, y en `L-016`/`L-023` sólo actúa el
segundo»*— **es correcta en la conclusión y le falta una pieza en el medio**: el segundo camino no
es *«por lámina»*. **La etapa 4 se parte por lámina para el PRESUPUESTO, pero pinta por
presentación** cuando el token no es exclusivo. **Son dos ejes distintos** —cuánto entra en el
techo, y dónde cae la tinta— y sólo el primero es por lámina.

### ✅ 3 · El precedente de `L-040` **NO aplica** — mirado primero, como se pidió

| | `informe_id` | `seccion_id` | `rol` |
|---|---|---|---|
| `L-040` (`jm`, el precedente) | `jm` | `campana` | ⭐ **`equipo`** |
| ⛔ **`L-016` (`secco`)** | `secco` | `campana` | ⛔ **`motor`** |

⇒ **`L-016` está declarada como lámina del motor.** No es una lámina del equipo con un token del
motor adentro: **el motor la reclama**. El trabajo NO es el otro.

⚠ Y las ocho de `secco/campana` —`L-016`…`L-023`— **declaran exactamente lo mismo**: `filtro`
vacío, `modo` vacío, `rol = motor`. **La única que se diferencia es `L-023`, por `escondida`.**

### ⛔ 4 · Lo que NO se pudo medir, y por qué — **declarado, no omitido**

1. ⛔ **Si `L-016` se expandió o no.** El usuario mide *«aparece una sola vez, no una por bloque»*.
   Con `filtro` vacío **debería** entrar para los dos ítems, así que si de verdad aparece una sola
   vez **hay una segunda causa** — la más probable es que su ancla no esté en el índice y caiga a
   `sinSlide`. **No se puede resolver desde disco:** exige la plantilla viva o el `reporte` de la
   corrida, que publica `slides_modelo` y `laminas_modelo`.
2. ⛔ **Cuántas campañas tiene el temario de esa corrida.** ⚠ **El snapshot de `CAMPANAS` está
   vencido para esta pregunta:** el del 31/08 tiene **2 filas y las dos son de `jm`** (`3512-AGOSEGGJ`,
   períodos `21_27` y `21_28`). La carga de `secco` es **posterior**. Si son tres y se expandieron
   dos, ésa es la otra mitad — **y sigue abierta**.

⚠ **Las dos se contestan con el mismo dato: el reporte de la corrida** (`slides_modelo`,
`porItemLaminas`, `excluidos`) más `CAMPANAS` vivo. **Un snapshot del 31/08 no responde por un deck
del 03/09**, y `LAMINAS` se escribió en el medio.

### ⇒ Estado: **mecanismo explicado, causa raíz NO cerrada**

⭐ **Lo que sí queda firme, porque sale del código y no de una foto:** mientras `camp_titulo` no sea
**exclusivo de una lámina**, `presentacion.replaceAllText` le va a publicar **un solo valor en las
14**, escondidas incluidas. **`L-023` no puede publicar bien por ningún arreglo que no toque eso.**

⛔ **No se arregla acá.** Es un título publicado en una lámina visible.

---

## ⛔ P1 · Dos bancos en rojo **diciendo la verdad** — el corte de ámbito cambió y nadie los dio vuelta (03/09/2026)

**`tools/suites.js`: 90 bancos, ~1226 afirmaciones, ⛔ 2 en rojo.**

| banco | afirmación que cae | qué exige |
|---|---|---|
| `probar-ambito-ivr.js` | `looker\|DIGITAL · ambito=gcba → ldig_id_cuenta!~=JDGAG` | 1 |
| `probar-desglose-como-fuente.js` | *«`jm` busca en las DOS columnas con `\|\|`»* · *«`gcba` es el AND de las negaciones»* | 2 |

### ⭐ No son un bug: son controles haciendo su trabajo

⛔ **La causa está documentada y es deliberada.** El `2026-08-30_2` movió el corte de ámbito **del
NOMBRE de la campaña al `Id cuentas`**, y su propio comentario lo dice con los conteos al lado:

> *«**EL CORTE PASA DEL NOMBRE AL `Id cuentas`.** Reemplaza a `nombre_campaña~=JM` (15/08), a
> `des_campana_2~=JM \|\| des_campana_3~=JM` (28/08) en el desglose y a `campana~=JM` en
> `resumen_metricas_dinamico`. […] el corte por nombre **pierde 5 de las 29 implementaciones JM**;
> el corte por `Id cuentas` **pierde 1**.»*

⇒ Hoy `DIMENSIONES_.ambito.jm` dice `'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_id_cuenta~=JDGAG'`.
**Los dos bancos siguen exigiendo la forma anterior.** ⭐ **Están señalando correctamente que el
estado cambió** — es exactamente la figura que `CLAUDE.md` §4 ya nombra: *«un banco que se pone
rojo cuando el estado cambia está haciendo su trabajo, aunque el cambio sea el correcto»*.

### ⚠ Lo que hay que hacer, y lo que NO

⛔ **No se aflojan.** La salida escrita es **darlos vuelta con el motivo**, y **si se puede,
subirles la exigencia** — que es lo que se hizo con los dos casos análogos del 25/08 (pasaron de
pedir *«que no estén»* a pedir que estén **y que declaren `por_posicion`**).

⭐ **Acá la exigencia mayor está disponible y es concreta:** en vez de *«`jm` usa `||` sobre dos
columnas»*, pedir que **`jm` y `gcba` sean complementarios sobre `des_id_cuenta`** —una identidad
interna, que **no caduca**— en lugar de una constante de la lectura anterior, que es justo lo que
acaba de caducar.

### ⛔ Y lo que este hallazgo dice del método, que es lo caro

⚠ **El cambio del 30/08 se hizo, se documentó bien y NO se corrieron las suites** — o se corrieron
y el rojo no se atendió. `CLAUDE.md` §4 ya lo pide con todas las letras: *«quien toca una función
con control positivo corre los controles antes de cerrar»*. ⭐ **Los dos rojos vivieron cuatro
días**, y en el medio se citó el verde de las suites como evidencia.

⚠ **Verificado por aislamiento el 03/09**: siguen rojos con `Instalar.gs` del último commit, así
que **no los causó el cableado de ministros**. Se dice porque un rojo sin esa verificación se
atribuye al último que tocó algo.

---

## ⛔⛔ P0 · La premisa vencida del ítem 9, con su nombre: *«`camp_titulo` está en 8 láminas y es el mismo hecho en las 8»* (03/09/2026)

**Dónde vive:** el comentario de `agruparTokensPorLamina_`, `Generador.gs`. Dice hoy:

> *«El desdoble se paga sólo donde puede haber diferencia: un token que vive en UNA lámina no
> consulta nada, y uno que vive en varias **del mismo universo** sigue resolviéndose una vez y
> pintándose de una pasada. **`camp_titulo` está en 8 láminas y es el mismo hecho en las 8.**»*

⭐ **Era cierto el 27/08** —cuando se escribió, `campana` no expandía— **y es falso desde que
`campana` es repetible**: las 8 láminas pasaron a ser 8 × N, y **cada bloque es una campaña
distinta**. Ya no es «el mismo hecho».

### ⚠ Es la fecha de vencimiento diferida, otra vez — y la tercera con la misma forma

| fecha | la justificación decía | qué la invalidó |
|---|---|---|
| 18/08 | *«las tres filas de `CAMPANAS` son de `secco` y tienen `periodo_id` vacío»* | **cargar `CAMPANAS`** — el trabajo previsto |
| 25/08 | *«los `post_*` caen entonces por donde caían: `/////`»* | **cablear los 20** — el trabajo previsto |
| ⭐ **27/08** | *«`camp_titulo` es el mismo hecho en las 8»* | **que `campana` expandiera** — el trabajo previsto |

⛔ **Las tres describen un ESTADO y no una CONDICIÓN**, que es exactamente lo que `CLAUDE.md` §4 ya
manda evitar: *«un hueco justificado por el estado actual tiene que nombrar EL EVENTO que lo
invalida, no la fecha»*. ⭐ Escrito como condición sería *«deja de ser el mismo hecho cuando
`campana` pase a `repetible`»*, y **eso un censo lo puede mirar**.

### ⭐⭐ Y la causa técnica exacta, que es más ancha que `camp_titulo`

`agruparTokensPorLamina_` desdobla comparando el **universo** de cada lámina, y `universoDeSlide`
devuelve **sólo tres cosas**: `desconocido`, `temario:<X>` o `ventana`.

⇒ ⛔ **Dos bloques de la misma sección repetible devuelven los DOS `ventana`.** La clave **no tiene
ninguna noción de ítem**, así que **ningún token de una sección repetible puede resultar exclusivo
por este criterio**. Todos los que lleguen a la etapa 4 publican **un solo valor** en todos los
bloques y en las escondidas.

⚠ **Por eso `camp_titulo` no puede ser el único, y por eso el arreglo es más grande de lo que
parecía.** El censo que lo mide es `censarNoExclusivosEnRepetibles()` (`Auditoria.gs`, sólo
lectura), con **control positivo**: si no encuentra `camp_titulo` **aborta**, porque un cero es
indistinguible de un detector que no mira nada.

---

## ⚠ P1 · Un banco rojo conocido deja de ser información al día siguiente (03/09/2026)

**El caso:** los dos rojos del ítem 30 —`probar-ambito-ivr` y `probar-desglose-como-fuente`—
vivieron **cuatro días**, del 30/08 al 03/09. ⛔ **Y en el medio se citó el verde de las suites como
evidencia.**

⭐ **La regla, que es lo accionable:** un rojo **conocido y no atendido** es peor que uno nuevo. El
primer día es un hallazgo; a partir del segundo es **ruido de fondo que enseña a saltear la
sección de rojos**, y entonces el runner deja de informar — no porque falle, sino porque nadie lo
lee entero. **Un rojo que sobrevive un día se convierte en parte del paisaje.**

⚠ **Y hace daño hacia atrás:** mientras el rojo está, **ninguna corrida de las suites es citable
como verde**, ni siquiera para los otros 88 bancos — porque *«las suites pasan»* y *«las suites
pasan salvo dos que ya sabemos»* son dos afirmaciones distintas y **sólo la primera se dice**. Es
la misma familia que el `⚠` en medio de un reporte que termina en `✅`.

⭐ **Lo concreto:** un rojo se **da vuelta con el motivo escrito** en la misma tanda que lo produjo,
o se anota como pendiente **con fecha** el mismo día. Lo que no se puede es dejarlo rojo y seguir
citando el verde.
