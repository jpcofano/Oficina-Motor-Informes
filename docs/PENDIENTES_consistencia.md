
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

---

## 🟡 Ítem 31 · FRONT — el botón único de `D-57` necesita progreso sin cambiar de pestaña (03/09/2026)

⛔ **Diseño, sin implementar.** Se coordina con `B.2` y `B.3`: **es el mismo archivo** (`Panel.html`),
y `B.3` ya está en curso.

### ⭐⭐ La recomendación: **(b) el asistente muestra el avance, sin cambiar de pestaña**

Y **no está peleada**: (b) es más barata **en las dos dimensiones a la vez**, que es lo que la hace
la respuesta y no una preferencia.

#### 1 · Por qué (b) es más barata — la mitad del trabajo YA EXISTE

⭐ **Medido en `Panel.html`: los dos caminos ya comparten `generarDesdeAsistente(desatendida)`.**
Los dos setean `S.estado = 'generando'`, `S.tab = 'generar'`, arrancan `S.tick` y pintan
`vistaEsperando()`. **La divergencia es UNA línea del `withSuccessHandler`:**

```js
if (desatendida){ S.estado='form'; S.desArranque=r; S.des=null; S.tab='desatendida'; pintar(); return; }
S.estado = 'listo'; S.resultado = r; pintar(); cargarCorridas();
```

⇒ Y eso parte el caso en dos, con costos **muy** distintos:

| caso | qué hace falta | costo |
|---|---|---|
| `r.terminada` — entró de una | ⭐ **caer en la rama que ya existe**: `S.estado='listo'` | ⭐⭐ **cero UI nueva** — es la línea de al lado |
| `r.continua` — cortó y sigue | mantener `generando`, seguir el timer, y **poll** | una función de sondeo |

⭐ **El backend no se toca: `panel_estadoDesatendida()` ya devuelve exactamente lo que un
progreso necesita** — `hechas`, `pendientes`, `plan`, `deck`, `en_curso`, `leido`. **Cero backend
nuevo.**

#### 2 · Por qué (a) es más cara **y además no resuelve el problema**

⛔ **Ésta es la razón de fondo, y es más fuerte que el costo.** El usuario no se queja de que el
dato esté viejo: se queja de *«generé y tengo que mirar otra pantalla»*. ⭐ **Refrescar la pestaña
«Corrida» arregla el dato viejo y deja intacta la desorientación** — sigue siendo otra pantalla, y
encima una **de diagnóstico**: tiene el freno, el plano del plan, el invariante roto, `ejecucion`.
**Es la pantalla del que investiga, no la del que acaba de apretar Generar.**

⚠ Y cuesta más: un `setInterval` sobre una pestaña que el usuario puede abandonar necesita
**arrancar y frenar con el cambio de pestaña** — un sondeo huérfano contra `CORRIDAS` cada N
segundos es la clase de fuga que nadie mira.

#### 3 · El diseño de (b), concreto

1. **`terminada` → `S.estado = 'listo'`.** Mismo `vistaListo()` de siempre. ⭐ *«Generé y ya
   está»* **se conserva exactamente** en el caso que hoy ya funciona así.
2. **`continua` → `S.estado` se queda en `'generando'`**, el timer sigue, y `vistaEsperando()`
   gana **un bloque de avance** alimentado por `panel_estadoDesatendida()`:
   - `hechas / (hechas + pendientes)` secciones, y **la sección en curso por nombre**;
   - una línea que diga *«cortó por presupuesto y sigue sola; la próxima arranca en un minuto»*,
     que es información **tranquilizadora** y hoy sólo está en la otra pestaña.
3. **El sondeo va cada ~15 s**, no cada segundo: el reloj de `S.tick` ya da la sensación de
   movimiento **sin costar una llamada**, así que el poll sólo tiene que traer el conteo.
   ⚠ Se frena en `terminada`, en `fallo` y si el usuario aprieta **Empezar de nuevo**.
4. ⭐ **La pestaña «Corrida» NO se toca y sigue siendo el lugar del diagnóstico.** Se le agrega un
   enlace desde el avance —*«ver el plan completo»*— para el que quiera entrar. **Nadie es obligado
   a entrar.**

#### 4 · ⚠ Los dos bordes que hay que resolver al implementar, no después

- ⛔ **`vistaEsperando` dibuja la regla contra `TECHO_S`, que es el techo de UNA ejecución.** Con
  varias ejecuciones el reloj pasa el techo **sin que eso signifique nada malo** — y hoy la regla
  se pondría en rojo (`is-danger`) mintiendo. ⭐ Es **la misma familia** que el `var TECHO_S = 350`
  del HTML contra el `150` de la hoja: **un techo que miente justo en el lugar que la persona
  mira**. En la desatendida la escala tiene que ser **el plan**, no el reloj.
- ⚠ **Si se cierra el panel, la corrida sigue** — eso ya lo dice `vistaEsperando` y **sigue siendo
  cierto y más importante ahora**. Al reabrir, el avance tiene que **poder retomarse** desde
  `panel_estadoDesatendida()` en vez de mostrar una pantalla en blanco.

#### 5 · Lo que este ítem **no** decide

⛔ No toca el mecanismo desatendido, ni el presupuesto, ni el trigger. **Es front.** Y `D-57` queda
decidido igual: lo que está gated es **el botón único**, no la decisión.

---

## ⛔⛔ P0 · `emin_encuentros` dio **6** y se esperaban **7** — y hay DOS causas que dan el mismo 6 (03/09/2026)

**Corrida real del usuario.** Las siete filas de `reuniones / Agenda funcionarios` al 03/09:

| ID | Funcionario | Barrio / Comuna | Fecha (D) | Fecha de envío (E) |
|---|---|---|---|---|
| `3593-AGOVINVC` | Ezequiel Sabor | Comuna 2 | 31/08 | **27/08** |
| `3594-AGOJDGVC` | Gabriel Sánchez Zinny | Comuna 11 | 31/08 | 28/08 |
| `3597-AGOSEGVC` | Gabino Tapia | Comuna 1 Norte | 03/09 | 01/09 |
| `3598-AGOSEGVC` | Seguridad en tu barrio | Comuna 1 Sur | 03/09 | 31/08 |
| `3599-AGOSEGVC` | Seguridad en tu barrio | Comuna 2 | 03/09 | 31/08 |
| `3600-AGOSEGVC` | Seguridad en tu barrio | Comuna 3 | 03/09 | 31/08 |
| `3608-AGODHHVC` | Gabriel Mraida | Comuna 9 | **04/09** | 01/09 |

### ⛔⛔ Las dos causas dan 6 y descartan filas DISTINTAS

Medido sobre la ventana del deck, **28/08–03/09**:

| criterio | resultado | qué fila cae |
|---|---|---|
| **`Fecha de envío` (E)** — lo que está configurado | **6** | ⛔ **Sabor** — envío 27/08, un día antes de la ventana |
| **`Fecha` (D)** — el encuentro | **6** | ⛔ **Mraida** — encuentro 04/09, un día después |

⇒ ⭐⭐ **El número no distingue las dos hipótesis: sólo la fila que falta lo hace.** Es el número
plausible en su forma más pura — dos causas opuestas, el mismo 6, y ninguna falla.

### ⭐⭐ El argumento que decide, y sale del dato

⛔ **Cortar por envío mete en el deck de esta semana un encuentro que TODAVÍA NO PASÓ.** Mraida
tiene envío 01/09 (dentro) y **encuentro el 04/09** — después del cierre de la ventana. Y a la vez
**saca a Sabor, cuyo encuentro (31/08) sí cae adentro**.

⭐ **La causa es estructural, no de estos datos:** el envío va **~3 días antes** del encuentro
(regla del usuario), así que cortar por envío **corre el universo ~3 días hacia atrás** — pierde
sistemáticamente los encuentros del **arranque** de la semana y suma los del arranque de la
**siguiente**. **No es un error de borde: es un desplazamiento sistemático.**

⚠ Y `emin_encuentros` cuenta **encuentros**. Un encuentro pertenece a la semana **en que ocurre**.

### ⚠ Y el «7» no lo reproduce NINGUNA ventana semanal sobre la ventana del deck

Medido: para que entren las siete hace falta

- por **envío**: `27/08 – 02/09` → 7
- por **fecha**: `31/08 – 06/09` → 7

⇒ ⛔ **Con la ventana 28/08–03/09 no hay columna que dé 7.** Así que **el 7 y la ventana del deck
son incompatibles**, y eso es una decisión, no un bug a parchear. ⛔ **No se ajusta el número
esperado** (`CLAUDE.md` §1): si el caso vale, el paso falló.

### ⇒ La decisión que hace falta, y es del usuario

1. ⭐ **Cortar por `Fecha` (D)** — el encuentro. Es lo que hace que la lámina cuente *«los
   encuentros de esta semana»*, y lo que evita publicar uno futuro. **Recomendado.**
2. Cortar por `Fecha de envío` (E) y **correr la ventana** ~3 días. ⚠ Ata el universo a un plazo
   operativo que el propio usuario describió como *«en general»* — **variable**, así que el
   universo deja de ser reproducible.

⚠ **Cambiarlo es una celda**: `MAPEO.fecha_periodo` pasaría de la columna `E` a la `D`. **No se
tocó nada**: el motor publica hoy por envío y eso está registrado, no descubierto.

⚠ **Y afecta a los nueve `emin_*`, no sólo al conteo**: los ocho de métricas suman sobre el mismo
universo. Un cambio de columna los mueve a los nueve **a la vez**, lo que es bueno —se atribuye a
un solo cambio— y hay que decirlo antes.

---

## ⭐⭐ El `−3` NO está implementado — no estamos eligiendo entre dos criterios (03/09/2026)

**Medido, grepeando el repo entero.** El desplazamiento `−3` existe en **un solo lugar**:
`VENTANA_ENVIO_CONTROL_` en `Auditoria.gs`, dentro de un **diagnóstico** — y su propio comentario
ya lo decía: *«No es configuración del motor: es el caso que se está midiendo»*.

⛔ **El motor corta con `SOLAPAS.ventana_ref = 'propia'`, que usa la ventana del informe SIN
desplazar.** ⇒ ⭐⭐ **Las dos cosas que se estaban comparando —«por envío» y «por fecha»— son dos
versiones incompletas del MISMO criterio**, no dos criterios. Por eso lo configurado da 6.

### ⭐ El patrón de los desvíos confirma la hipótesis por un camino independiente del conteo

Contra el deck del equipo del 04/09: los tres de mail (**G, H, J**) el motor da **de menos** y los
dos de Meta (**Q, R**) **de más**. ⇒ **falta Sabor con sus mails, sobra Mraida con sus
impresiones** — exactamente lo que predice el corte por envío. ⭐ **Es un discriminador que no
depende del conteo**, y por eso vale: dos criterios que dan el mismo 6 **no** dan el mismo patrón
de signos.

### ⛔⛔ Y la pregunta que queda abierta, que NO se resuelve calibrando

**El 7 del equipo tiene a Sabor (encuentro 31/08, envío 27/08) Y a Mraida (encuentro 04/09, envío
01/09) a la vez.** Medido: **ningún corte simple sobre una sola columna los tiene juntos** —

| ventana | resultado |
|---|---|
| envío `28/08–03/09` (lo configurado) | **6** — cae Sabor |
| envío `25/08–31/08` (el −3 dictado) | ⛔ **a medir en la solapa viva** |
| fecha `28/08–03/09` | **6** — cae Mraida |

⇒ ⛔ **Si ninguna da siete, no se ajusta el desplazamiento hasta que cuadre.** El equipo incluye
**un encuentro que todavía no pasó** junto con **uno cuyo envío es de la semana anterior**: eso es
una **definición de negocio** y la decide el usuario.

⭐ **El instrumento ya está**: `diagAgendaFuncionarios()` compara **las tres ventanas sobre el mismo
parseo** —para que una diferencia de lectura no se confunda con una de criterio— y lista **las
filas que entran y las que caen**, con el motivo y marcando las **vecinas del borde**, que son las
que deciden. ⚠ **`MAPEO.fecha_periodo` NO se tocó**: sigue en `E`.

---

## ⭐ Una afirmación que depende de una coma no está afirmando lo que dice (03/09/2026)

**El caso:** `probar-lista-cruda.js` exigía `/^\s*LISTA_CRUDA:\s*opLISTA_CRUDA\s*$/m` — sin coma
final. ⇒ **En los hechos exigía que `LISTA_CRUDA` fuera la ÚLTIMA entrada de `OPERACIONES_`**, algo
que **nunca quiso afirmar**. Se puso roja al nacer `LISTA_TEXTO`, la decimocuarta.

⭐ **Lo accionable, y es la forma correcta de arreglarlo: subirle la exigencia, no permitirle
menos.** Se aceptó la coma **y** se agregó que la entrada esté **dentro del bloque `OPERACIONES_`**
— porque la versión vieja la satisfacía un `LISTA_CRUDA:` suelto **en cualquier parte del archivo**.

⚠ **Es de la familia del control que mide algo distinto de lo que dice medir**, con la variante más
barata de cometer: el criterio se escribió mirando el estado de hoy —*«hoy es la última»*— y
**nadie escribió esa dependencia porque nadie la eligió**. ⛔ **Un ancla de fin de línea en una
lista que crece es una fecha de vencimiento diferida**, igual que un fallback justificado por el
cableado actual.

---

## ⚠ Un `clasp push` que corrió antes de terminar es indistinguible de uno que no corrió (03/09/2026)

**El caso, propio:** el 03/09 se corrió `clasp push` **en el mismo comando** que las suites, y las
suites salieron con **dos rojos nuevos** causados por ese mismo cambio. ⇒ **El proyecto de Apps
Script quedó, por unos minutos, con una regresión que el repo local ya sabía que existía.**

⭐ **Es la lección del 16/08 con el orden invertido**, y por eso vale escribirla: aquella vez el
push corrió **antes de la edición**; ésta corrió **antes de la verificación**. ⛔ **Las dos
producen el mismo estado —el proyecto no tiene lo que uno cree— y ninguna falla.**

⭐ **Lo accionable, y cuesta nada:** `clasp push` va **después** del verde, **en su propio
comando**. Encadenarlo con la verificación en un `&&` no protege: `&&` sólo mira el código de
salida del `grep`, no el veredicto de las suites.

⚠ **Y el corolario: se dice.** El push malo duró minutos y se corrigió con otro push, pero **un
reporte que no lo menciona deja creer que el proyecto nunca tuvo la regresión**.

---

## ⛔⛔ P0 · Ítem 9 — **por qué el arreglo es el DESDOBLE POR ÍTEM y no un parche a `camp_titulo`** (03/09/2026)

### ⭐⭐ La consecuencia general, que es lo que convierte esto en repetible

**Mientras `camp_titulo` se resuelva SIN ítem, CUALQUIER lámina que quede fuera del bloque modelo
va a publicar la última campaña de la ventana en vez de un hueco.**

El mecanismo, completo y verificado en el código:

1. `camp_titulo` es `ULTIMO` sobre `digital/Seguimiento digital · sd_campana_cuentas`, **sin
   `filtro` y sin `dimensiones`** ⇒ depende **enteramente** de `opciones.id_cuenta`.
2. En la etapa 4 **no hay ítem**, así que **no hay `id_cuenta`** ⇒ `ULTIMO` corre sobre la
   **solapa entera recortada por la ventana** y devuelve **la última campaña de esa ventana**.
3. `agruparTokensPorLamina_` no lo desdobla —todas sus láminas declaran el mismo universo,
   `ventana`— ⇒ `presentacion.replaceAllText` lo pinta **en todo el deck**.

⛔ **Y ésa es la razón por la que no alcanza un parche.** El dato del 03/09 lo muestra:
`L-016` publica **«Jornada de adopción de perros y gatos»**, que **no es ninguna de las tres
campañas destacadas del equipo**. No es «la primera del temario mal elegida»: es **una campaña que
no está en el deck**.

⭐⭐ **Un hueco se ve; una campaña equivocada se lee como un dato.** Ésa es toda la diferencia: si
el token cayera en `/////`, alguien iría a cablearlo. Como cae en un nombre plausible, **nadie
pregunta**. Es el modo de falla más caro de este repo, y acá está garantizado por construcción —
no depende de qué lámina falle, sino de que **alguna** quede fuera del bloque.

⇒ **El arreglo es que `camp_titulo` se resuelva POR ÍTEM.** Un parche que corrija `L-016` deja el
mecanismo intacto para la próxima lámina que quede afuera.

### ⚠ Lo que el desdoble NO cubre, nombrado y NO arreglado de paso

**`L-023` está escondida y aun así recibe el pintado por presentación.** Con el desdoble va a
recibir **el valor correcto de su ítem** — pero sigue siendo **un token pintado en una lámina que
el motor declara que no mira**.

⛔ **Es otro objetivo.** Las dos funciones que consultan visibilidad —`tokensDeSlide_` en la
etapa 3 y `tokensVisiblesDe_` en la etapa 4— deciden **qué se resuelve**; **ninguna decide dónde se
pinta**, y `replaceAllText` no consulta visibilidad en absoluto. ⚠ **Va nombrado acá para que no se
cierre creyendo que el desdoble lo tapa**, y no se arregla en el mismo movimiento.

### ⚠ CORRECCIÓN sobre `L-016`: la reasignación de anclas NO es la explicación

⛔ **`L-016` no estuvo en el movimiento de anclas de esta sesión** (usuario, 03/09). Las que
cambiaron son **`L-054` y `L-055`** —las dos que tomaron ids nuevos— y **`L-004`…`L-007`**, las
cuatro que quedaron sin fila.

⇒ **Las dos salidas de `verLaminas()` son resultado, y ninguna se da por descontada:**

- Si reporta `L-016` en **`filas_sin_ancla`** ⇒ la hipótesis se sostiene **pero la causa NO es la
  reasignación**, y hay que buscarla en otro lado.
- Si **NO** la reporta ⇒ **la hipótesis se cae** y hay una **tercera causa** — candidatas:
  `seccion_id` distinto en la hoja viva, o la guarda de **contigüidad** del bloque.

⭐ **No se da la reasignación por explicación antes de ver cuál sale.** Es la misma disciplina que
el 6 contra 7: dos causas que producen el mismo síntoma y **sólo el detalle las separa**.

---

## ⛔⛔ P1 · `verificarLaminas()` corre y NO IMPRIME NADA (03/09/2026)

**Medido: tiene CERO `Logger.log`.** Sólo `return`, y **el editor de Apps Script no muestra el valor
de retorno**. El usuario la corrió el 03/09 y el log salió vacío.

⚠ **Es el peor caso de la regla de `CLAUDE.md` §2, no un caso más.** La función cumple las dos
condiciones del desplegable —sin `_`, sin parámetros— así que **aparece en la lista, se puede
correr, corre bien y no dice nada**.

⭐⭐ **Y la diferencia con los tres casos que fundaron la regla es lo que la hace peor:** aquéllos
eran *«no la encuentro»*, que **manda a buscar**. Éste es *«corrió y no dijo nada»*, que **se lee
como “no encontró nada”** — o sea **como una respuesta**, y falsa.

⇒ **Arreglado con `verLaminas()`** (`Sellador.gs`): llama a la de siempre —**no reimplementa
nada**— y la imprime, con `filas_sin_ancla` **primero** porque es la pregunta de `L-016`, el
veredicto arriba, y **el cero dicho en cada bloque** en vez de callado.

⚠ **Falta el barrido:** `verificarLaminas()` no tiene por qué ser la única función pública sin
`Logger.log`. **Un cero medido y un cero no buscado no se distinguen** — el barrido no se corrió, y
eso se dice en vez de omitirse.

---

## ⛔⛔ P0 · El `−3 en las dos puntas` da **5**, no 7 — medido, y frena el paso (03/09/2026)

**Parte 0, sólo lectura. No se implementó el desplazamiento.**

### 1 · La premisa, contra la corrida real (576 filas, solapa viva)

| ventana de envío | n | ¿son las siete del usuario? |
|---|---|---|
| `28/08–03/09` — **lo configurado, sin desplazar** | **7** | ⛔ **NO** — sobra **Fernán Quirós** (encuentro `08/09`), falta **Ezequiel Sabor** |
| `25/08–31/08` — **el −3 en las dos puntas** | ⛔ **5** | ⛔ **NO** — faltan **Tapia** y **Mraida**, los dos con envío `01/09` |
| `28/08–03/09` por `Fecha` | 6 | ⛔ NO — falta Mraida |
| ⭐ `25/08–01/09` — **inicio −3, fin −2** | **7** | ✅ **SÍ, exactamente las siete** |

⛔⛔ **El caso más peligroso está arriba de todo: lo configurado YA DA 7 y son otras siete.** Dos
diferencias que **se cancelan en el total**. ⭐ Un control que compara `length` **da verde sobre
eso** — que es exactamente lo que el usuario anticipó: *«si da 7 con otras filas, no cerró»*.

### 2 · ⭐⭐ Por qué el −3 simétrico no puede funcionar: el lead time NO es constante

Medido sobre las siete filas: **2, 3, 3, 3, 3, 4 y 5 días** entre envío y encuentro. ⇒ **Ningún
desplazamiento simétrico reproduce «los encuentros de la semana»**, porque la relación entre las
dos fechas **no es un número**.

⭐ **Y el barrido de todas las combinaciones (0..−4 × 0..−4) lo acota:** las que traen exactamente
las siete son **inicio −1…−3 con fin −1…−2**. **El fin −3 nunca funciona.** ⇒ **El mínimo cambio
sobre la regla dictada es UNA punta: el fin pasa de −3 a −2.**

⚠ **No se ajustó nada.** El desplazamiento lo decide el usuario; acá está medido cuál reproduce su
lista y cuál no.

### 3 · ⭐ El control ya no es un juez de conteo

`diagAgendaFuncionarios()` compara ahora **por identidad** contra `ROSTER_CONTROL_` —las siete
filas, con funcionario, fecha y barrio— y dice **qué sobra y qué falta** en cada ventana. Cuando el
conteo coincide y las filas no, lo marca: *«⛔⛔ EL CONTEO COINCIDE Y LAS FILAS NO — el número
miente»*. ⚠ `ROSTER_CONTROL_` es **evidencia fechada** y no se edita para que cuadre.

---

## ⭐ Parte 0 · Cómo se declara hoy una ventana por solapa, y qué falta (03/09/2026)

### `ventana_ref` YA admite más que `'propia'` — y hay precedente

**Medido en `SOLAPAS` viva y en el seed.** La columna tiene **dos formas**, no una:

| valor | significa | quién lo usa hoy |
|---|---|---|
| `propia` | la solapa corta por **su propio** `fecha_periodo` | `digital / CAMPAÑAS_DESGLOCE_DIGITAL` · ⭐ `reuniones / Agenda funcionarios` |
| **un nombre de solapa** | toma la ventana **prestada** de esa otra solapa | `looker / CC` → `Cuentas` · `looker / DIGITAL` → `Cuentas` |

⚠ La referencia es **de un solo nivel** —`referenciaDeVentana_` lo verifica y falla con
`«FALTA:ventana_ref@…»` si hay cadena— y el ciclo de largo uno también está atajado.

⛔⛔ **Pero NO hay ningún precedente de una ventana DESPLAZADA.** Las dos formas contestan *«¿de
dónde sale la ventana?»*; **ninguna contesta *«¿corrida cuántos días?»***. El único `−3` del repo
vive en `VENTANA_ENVIO_CONTROL_`, **dentro de un diagnóstico**, y su propio comentario dice *«no es
configuración del motor»*.

### ⇒ El mínimo que falta, y dónde vive

⭐ **Una columna nueva en `SOLAPAS`, no un valor compuesto en `ventana_ref`.** Dos motivos, y el
segundo es el que decide:

1. `ventana_ref` responde **de dónde** sale la ventana; el desplazamiento es **cuánto se corre**.
   **Son dos preguntas** y meterlas en una celda obliga a parsear `propia-3/-2`, que es la clase de
   valor compuesto que después nadie sabe leer.
2. ⛔⛔ **El desplazamiento tiene DOS puntas y la medición demuestra que son distintas** (−3 / −2).
   Un solo número no alcanza ⇒ un valor compuesto necesitaría **dos** campos igual.

⇒ **`ventana_desde_dias` y `ventana_hasta_dias`**, enteros con signo, vacío = 0. Y el lector es
**uno solo**: donde hoy se arma la ventana efectiva de la solapa.

⚠ **Es CÓDIGO**, no configuración: hoy no existe quien lea esas columnas. ⇒ **`R-20`, prompt
propio**, como el usuario ya declaró.

### ⚠ A quién más le pega — medido, y hoy el radio es 1

⭐ **Si el desplazamiento se declara POR SOLAPA, afecta a TODO lo que lea `Agenda funcionarios`.**
Medido contra `MARCADORES`: hoy son **los nueve `emin_*` y nada más** — la solapa no tenía ninguna
fila antes del 03/09.

⛔ **Pero eso es un estado, no una condición**, y es exactamente la figura de la fecha de
vencimiento diferida: **el día que alguien cablee un décimo marcador sobre esta solapa, hereda el
desplazamiento sin pedirlo y sin enterarse.**

⭐ **La condición que lo invalida, escrita para que un censo la pueda mirar:** *«deja de ser
inofensivo cuando `MARCADORES` tenga una fila sobre `reuniones / Agenda funcionarios` que no sea
`emin_*`»*. ⚠ Y la alternativa —declarar el desplazamiento **por marcador**— **no se descarta acá**:
es más granular y más caro, y la decisión es del prompt de `R-20`.

---

## ⛔ Ítem 9 · La hipótesis de `L-016` está MUERTA — medida (03/09/2026)

`verLaminas()`: **`filas_sin_ancla` = 0**. ⇒ ⛔ **`L-016` SÍ tiene su ancla en la plantilla**, así
que **no** cae a `sinSlide` y mi hipótesis se cae entera. ⭐ Y el usuario ya lo había anticipado:
*«si NO la reporta, tu hipótesis se cae y hay una tercera causa»*.

**Lo que el mismo log deja en pie como candidatas:**

1. **`seccion_id` en la hoja viva** ≠ `campana` para `L-016`. El snapshot del 31/08 dice `campana`,
   pero **es un snapshot** y `LAMINAS` se escribió después.
2. **La guarda de CONTIGÜIDAD.** `duplicarBloquesRepetibles_` exige que las láminas modelo sean
   **consecutivas**; si no lo son, **no expande y lo reporta**. ⚠ Habría que ver el reporte de la
   corrida, no la plantilla.

⚠ **Y un dato nuevo del log que no es de `secco` pero conviene no perder:** **17 desajustes de
`orden_plantilla`**, todos de `L-035`…`L-051` (`jm`), con la hoja **1 o 2 posiciones atrás**. ⇒ Se
insertaron slides en `jm` y el registro no se refrescó. **No afecta a la expansión** —el bloque se
resuelve por ancla, no por `orden_plantilla`— pero **sí a todo reporte que ordene por esa columna**.

---

## ⭐⭐ Un desplazamiento que compensa una ventana mal cortada es un RODEO, no un mecanismo (03/09/2026)

**Decisión del usuario.** El corte de `reuniones / Agenda funcionarios` pasa de `E` (`Fecha de
envío`) a **`D` (`Fecha`, el encuentro)**, con la ventana **viernes a viernes, `28/08–04/09`**.

### ⛔ Lo que se CAE — no se pospone

| se cae | por qué |
|---|---|
| el desplazamiento `−3` **y** el `−3/−2` medido | no hay nada que desplazar |
| las columnas `ventana_desde_dias` / `ventana_hasta_dias` en `SOLAPAS` | no hacen falta |
| **`R-20` y su prompt propio** | queda **sin objeto** |
| la decisión abierta *«el fin pasa de −3 a −2»* | **sin objeto** |

### ⭐ La lección, y es lo que hay que llevarse

**El `−3` era un rodeo para compensar que la ventana estaba cortada un día antes de tiempo.
Corregida la ventana, el rodeo desaparece.**

⭐⭐ **La forma general, que es lo citable:** cuando un mecanismo nuevo aparece para **compensar**
el resultado de otro, la primera pregunta no es *«cuánto hay que compensar»* sino **«¿qué está mal
en lo que estoy compensando?»**. Un desplazamiento calibrado es **más caro y más frágil** que el
corte correcto: hay que elegir dos números, mantenerlos, y **cada uno puede quedar viejo solo**.

⚠ **Y el trabajo de medirlo NO se perdió, que es la otra mitad.** El barrido de las **25
combinaciones** (0…−4 × 0…−4) es **lo que demostró que ninguna simetría podía funcionar** —el lead
time real es **2, 3, 3, 3, 3, 4 y 5 días**, no un número— y **por eso se buscó en otro lado**.
⭐ **Una medición que cierra una rama entera vale aunque la rama se abandone.**

### ✅ Verificado ANTES de escribir, y por identidad

Sobre las **576 filas de la corrida viva del 03/09**: `Fecha` en `28/08–04/09` trae **exactamente
las siete de `ROSTER_CONTROL_`**, ni una más ni una menos.

⛔⛔ **Y el conteo solo no habría alcanzado:** la ventana anterior **también daba 7**, con **otras**
siete — sobraba `Fernán Quirós` (encuentro `08/09`) y faltaba `Ezequiel Sabor`. **Dos diferencias
que se cancelan en el total.** ⭐ **`ROSTER_CONTROL_` se queda como control permanente**: es lo
mejor que salió de esta vuelta, y sin él esto habría pasado por bueno.

⭐ **Y el cambio de columna cierra un hueco de paso:** cortando por envío, **12 filas sin `Fecha de
envío`** caían afuera **en silencio**; cortando por `Fecha` las que caen son **0** (medido).

### ✅ La dependencia con el ítem 19 del front: **NO bloquea**

**Medido en `PERIODOS`:** ya existe `2026_agosto_21_28` = `2026-08-21` a `2026-08-28` — **ocho
días, viernes a viernes**, creado por *«Asistente · paso 1 (personalizado)»*. ⇒ ⭐ **El corte
vie→vie ya se puede expresar hoy con un período personalizado. Ministros NO espera al `_4`.**

⚠ Lo que **sí** queda para el ítem 19 es el **botón**: hoy hay que armar el período a mano en el
paso 1. Eso es comodidad, no bloqueo.

---

## ✅ Ítem 30 CERRADO — los dos bancos dados vuelta con la exigencia MAYOR (03/09/2026)

**⭐⭐ Los 91 bancos en verde, por primera vez en cuatro días.**

Los dos rojos **decían la verdad**: el `2026-08-30_2` movió el corte de ámbito **del NOMBRE de la
campaña al `Id cuentas`** y nadie los dio vuelta. ⛔ **No se aflojaron: se les subió la exigencia.**

| antes (constante de una lectura anterior) | ahora (identidad, no caduca) |
|---|---|
| `gcba` sobre `looker\|DIGITAL` **es** `nombre_campaña!~=JM` | ⭐ **`jm` y `gcba` son COMPLEMENTARIOS** sobre el mismo campo |
| `jm` sobre el desglose usa **dos columnas con `\|\|`** | ⭐ **`gcba` es el complemento exacto de `jm`** |
| `gcba` es **el AND de las negaciones** (De Morgan) | ⚠ y ya **no necesita** De Morgan: con una columna la negación es directa |

⭐⭐ **Por qué la nueva es más fuerte, y no sólo distinta:** la constante **sólo miraba `gcba`**. Un
cambio que tocara `jm` y se olvidara de `gcba` —**que es exactamente cómo se rompe una
partición**— **pasaba en verde**. La identidad los mira a los dos.

⭐ **Y ganaron una identidad CRUZADA que ninguno tenía:** `looker` y el desglose usan **el mismo
operador y el mismo valor** (`JDGAG`), así que **la única variable es la solapa**. Eso es lo que
hace **atribuible** el cambio de fuente del 28/08: si las dos traen la misma información, `L-031`
tiene que publicar el mismo número.

⛔ **Más las negativas, sin las cuales volver atrás no rompería nada:** que no quede resto del corte
por nombre (`des_campana_2/3`, `nombre_campaña`) en ninguno de los dos ámbitos.

### ⚠ Y la guarda de mutación se pagó sola por tercera vez

Al cambiar las afirmaciones, el control negativo del desglose informó **«la mutación NO matcheó»**
—su patrón apuntaba al texto viejo—. ⭐ **Sin esa guarda habría corrido sobre el código intacto y
dado verde sin probar nada.** Es `CLAUDE.md` §4 funcionando, no una anécdota.

---

## ⭐⭐ `emin_lista` no salió — y el deck dice que el token NO ES DEL MOTOR (03/09/2026)

**La corrida del 03/09 cerró el control: `emin_encuentros` publicó `-7-`.** ✅

⛔ **Pero la caja «Encuentros contempladas» trae `-`, con UN solo guión.** Y el sufijo `_revisar`
envuelve el valor en **DOS** —`-7-`, `-893351-`, `-491344-`—.

⇒ ⭐⭐ **Ese guión no lo puso el motor.** Es `C-75` en su forma pura: el `-` que tipea el equipo y
lo que publica el motor **se ven parecido y no son lo mismo**.

**La hipótesis, que es el modo de falla mudo:** `{{emin_lista}}` **no existe en la plantilla**. Un
marcador cuyo token no está en ninguna lámina **no falla** — resuelve, no encuentra dónde pintarse,
**no entra a `FALTANTES`**, y la caja queda con lo que el equipo haya tipeado.

⭐ **Se mide con `diagTokensEmin()`** (`Auditoria.gs`, sólo lectura): cruza las diez filas de
`MARCADORES` contra los tokens de la plantilla viva, **en los dos sentidos** —filas sin token y
tokens sin fila, que es donde aparecería uno mal tipeado—. ⚠ **Con control positivo:**
`emin_encuentros` **tiene** que aparecer, porque se lo vio publicado; si no, **aborta**.

⚠ **Y un dato del mismo deck que conviene no perder:** la caja **«Alcance» está VACÍA, sin guiones**
— o sea que su token tampoco es de los diez. Es coherente con lo que el usuario ya había dicho:
`emin_alcance` **es** Impresiones (`-893351-`) y `emin_alcance_semanal` **es** Mails entregados
(`-491344-`). **La caja «Alcance» espera un token que nadie cableó.**

---

## ⛔⛔ P0 · P1 REFUTADA — un guión solo **SÍ** es del motor, y eso cambia el diagnóstico entero (04/09/2026)

**El prompt `2026-09-04_1` P1 pedía verificar el orden de dos guardas y, si la de vacío iba
primero, escribir como afirmación citable:**

> *«un marcador con formato `texto_revisar` publica `-valor-` o nada. **Un guión solo es imposible
> por construcción.**»*

### ✅ La mitad del orden: CIERTA

`formatearValorMarcador_` (`Generador.gs`):

```
148    if (valor === '' || valor === null || valor === undefined) return '';   ← la guarda de vacío
149    var f = String(formato || '').trim().toLowerCase();
159    if (f.length > 8 && f.slice(-8) === '_revisar') {                        ← el envoltorio
160      return '-' + formatearValorMarcador_(valor, f.slice(0, -8)) + '-';
```

⇒ La guarda corre **once líneas antes**. ⭐ **Un valor vacío devuelve `''`, no `--`.** Esa mitad
queda demostrada por código y ya no depende de los tres ejemplos observados.

### ⛔⛔ La conclusión: FALSA — y la refuta OTRA función

`textoFaltante_` (`Generador.gs`), que es **el otro camino de pintado**:

```
1931   if (!resultado) return '/////';
1934   if (estado === 'error' || estado === 'REVISAR') return '---';
1935   if (estado === 'sin_datos') return '-';        ← ⛔⛔ UN GUIÓN SOLO
```

⇒ ⭐⭐ **Un guión solo no es imposible: es exactamente el símbolo de `sin_datos`.**

⚠ **Por qué la refutación estaba fuera del alcance de P1, y es la lección:** P1 miraba
`formatearValorMarcador_`, que **sólo se usa cuando `estado === 'ok'`**. Todo lo demás lo pinta
`textoFaltante_`, **otra función, otro archivo del mismo módulo, y ningún comentario las conecta**.
⭐ **Es la regla de §4 en su forma más literal: la función que estás leyendo no es el camino
completo.**

### ⇒ Lo que esto CAMBIA, y es todo

**La explicación más simple ya no necesita ninguna hipótesis sobre cajas:**

| observación del deck | explicación |
|---|---|
| «Encuentros contempladas: **`-`**» | ⭐ **el motor**, pintando `emin_lista` con `estado = sin_datos` |
| «Alcance» **vacía, sin guiones** | esa caja **no tiene token** — ninguno de los diez |

⭐⭐ **Una sola causa, y es del motor, no de la plantilla.** `diagTokensEmin()` ya midió que
`{{emin_lista}}` **está en slide 14 con los otros nueve** ⇒ **el token existe, se resolvió, y volvió
vacío.**

⛔ **Y por eso NO se ejecutó P3.** Su hipótesis —*«`{{emin_lista}}` vive en la caja que el usuario
lee como Alcance»*— **estaba construida sobre la conclusión falsa**: se la inventó para explicar un
guión que el motor no podía producir. **Ese guión sí lo produce.** Medir la caja ahora mediría una
pregunta que dejó de existir.

⚠ **Y la dicotomía de P4 también se corrige:** no es *«resolvió vacío»* contra *«resolvió bien y se
pintó en otra caja»*. **El deck ya dice que resolvió vacío.** La pregunta que queda es **por qué**,
y ésa sí necesita la traza — `LISTA_TEXTO` devuelve `valor: ''` si le falta `ctx.plantilla` o si no
recibe filas, y `Generador.gs:1391` baja un texto vacío a `sin_datos`.

⇒ ⛔ **Arreglo del lado de la operación o del cableado, NO de la plantilla del equipo.**

### ⚠ Qué queda vivo del ítem 34

- ✅ **El hecho del deck** —`-` con un solo guión— **sigue en pie**, y ahora **está explicado**.
- ⛔ **La hipótesis muere dos veces:** primero por `diagTokensEmin()` (el token existe), y ahora
  también la de la caja. **El defecto sigue abierto**; lo que se cayó es la explicación.

---

## ⭐⭐ Parte B · El 349 y la contradicción del log — resuelta contra el código (04/09/2026)

**Las dos líneas del log de `censarNoExclusivosEnRepetibles()`:**

| línea | afirma |
|---|---|
| veredicto | *«Cada uno publica **UN SOLO VALOR** en todos sus bloques y en sus escondidas»* |
| caveat | *«Nada sobre los tokens que la etapa 3 **SÍ pinta por ítem** — ésos están bien»* |

### ⇒ Gana el CAVEAT. El veredicto es falso para los expandidos.

**La prueba está en el código, y en un comentario que ya estaba escrito** (`Generador.gs:5417`):

> *«4 · Los tokens fijos, sobre todo lo que quedó. **Los de las slides emitidas ya no están: la
> pasada anterior los reemplazó por valor o por `«FALTA»`**.»*

⭐⭐ **La etapa 3 gana siempre que la lámina se haya expandido**, y no por precedencia declarada
sino **por agotamiento**: cuando la etapa 4 corre, esos `{{token}}` **ya no existen en el deck**,
así que `presentacion.replaceAllText` **no encuentra nada que pintar**.

### ⭐ La condición exacta: un token cae en la etapa 4 sólo si SOBREVIVIÓ a la 3

Y sobrevive en **tres** casos, que son los que hay que mirar:

1. ⛔ **Su lámina está ESCONDIDA** — `tokensDeSlide_` devuelve `[]`, así que la etapa 3 no la toca.
   Es el caso de `L-023`.
2. ⛔ **Su lámina NO se expandió** — la sección no tuvo ítems, no se la eligió en el panel, se cortó
   por presupuesto, o **la lámina no entró al bloque modelo**. Es el caso de `L-016`.
3. **También vive en una lámina no repetible**, que nunca pasa por la etapa 3.

⭐ **`camp_titulo` cae del lado que la lectura predice, y por eso sirve de control:** `L-016` no se
expandió (aparece una sola vez en el deck) ⇒ su `camp_titulo` sobrevive a la etapa 3 ⇒ lo pinta la
etapa 4 **sobre todo el deck**, con el `ULTIMO` de la ventana entera. ✅ **La lectura elegida lo
predice.**

### ⚠ 349 NO son 349 defectos

**Es la EXPOSICIÓN de un camino, no su ejercicio.** La cifra que importa —cuántos publican
efectivamente un solo valor— **depende de los ítems de cada corrida**, y el censo lo dice él mismo.
⛔ **Un 349 suelto se cita como defectos en la primera relectura**, y eso ya pasó en este repo con
otros números.

### ⭐⭐ El criterio que le faltaba al censo para servir la próxima vez

**Un token no exclusivo de una sección repetible está BIEN si TODAS sus láminas se expanden y se
pintan por ítem. Publica MAL si al menos una de sus láminas sobrevive a la etapa 3** — por
escondida, por no ser modelo, o porque su sección no expandió.

⇒ **El censo tiene que clasificar, no contar.** Tres columnas por token, y son las tres condiciones
de arriba:

| ¿alguna lámina suya está escondida? | ¿alguna no es modelo de su sección? | ¿alguna es de sección no repetible? |
|---|---|---|

⭐ **Con eso, el que tiene las tres en «no» está bien y sale de la lista**; el que tiene alguna en
«sí» **es candidato real**, y el número accionable es ése. ⚠ **Sin esa clasificación el instrumento
devuelve 349 números todos iguales y ninguno accionable**, que es exactamente lo que devolvió.

---

## ✅ Los siete `ivr_*` — la sospecha está CERRADA, no reabrir (03/09/2026)

`diagDondeVivenLosIvr()`, **con control positivo**: **0 huérfanos · 0 escondidas · 0 sin ancla**.
Están en láminas **visibles que no iteran**. ⇒ ⭐ **El `/////` de los siete es un hueco normal de
cableado**, no un síntoma de nada. **Queda escrito para que no se vuelva a abrir.**

---

## ⚠ Censo de tokens SIN fila en `jm` — registro, sin arreglar nada (03/09/2026)

**102 tokens distintos · 107 apariciones sobre 359 · 12 láminas.**

⭐ **Dos láminas ESCONDIDAS concentran 44 y están enteras** — `L-039` 23/23 y `L-050` 21/21, que es
el frente `rrss_*`. El resto se reparte en bloques con forma propia: `camp_bench_*`,
`camp_env*_rem`, `post_formato*`, `cc_*` y sus gemelos `gcba_cc_*`.

⛔ **«Sin fila» NO es «publica `FALTA`»**, y el propio log lo dice: para saber qué publica `FALTA`
**hace falta una corrida**. Son dos preguntas y sólo una está contestada.

⛔⛔ **Y el censo NO contestó lo que el log de `cablearGcbaIvr()` le pidió.** Los tres `gcba_ivr_*`
no aparecen en `L-032`, pero **el censo calla por dos motivos distintos y no los distingue**: *«el
token tiene fila»* y *«el token no está en la plantilla»* **se ven igual**. ⭐ Es exactamente la
ambigüedad del ítem 34, **del otro lado del cruce** — y por eso hace falta `censarIvrEnPlantillaJm()`,
que pregunta por la plantilla y no por el registro.

---

## ⛔⛔ P0 · `emin_lista` — **la causa está en el código y es mía**: `ctx.plantilla` nunca llega (04/09/2026)

**No hizo falta el reporte de la corrida.** La respuesta a P1 —*«cuál de las dos guardas actuó»*—
sale del despachador, y es **`«FALTA:@plantilla_sin_resolver»`**.

### El bug, con su línea

`Generador.gs` — el bloque que arma `ctx.plantilla`:

```
1695   if (['FILA', 'FILA_TEXTO', 'GRUPO_TEXTO'].indexOf(nombreOp) !== -1) {
1696     ctx.separador = fila.separador;
         …
1719     if (esPlantilla) {
1720       ctx.plantilla = resolverPlantillaTexto_(fila, solapa.solapa, datos.filas);
1721     }
1722   }
```

⛔⛔ **`LISTA_TEXTO` no está en esa lista.** La guarda interna `if (esPlantilla)` **sí** lo incluye
—se la actualizó al crear la operación— pero **está anidada dentro de un `if` que ya lo dejó
afuera**. ⇒ `emin_lista` llega a `opLISTA_TEXTO` **sin `ctx.plantilla`**, la operación devuelve
`valor: ''` con `«FALTA:@plantilla_sin_resolver»`, el despachador lo baja a `sin_datos` y
`textoFaltante_` pinta **`-`**. ✅ **Cierra con el deck, exactamente.**

### ⛔ Es el error que este repo ya tiene escrito, aplicado a una OPERACIÓN

`CLAUDE.md` §2 lo dice para una **columna**: *«entra al `SEED_*` y a UN consumidor, y los demás
lectores quedan atrás SIN FALLAR»*. ⭐ **Acá fue igual con una operación nueva:** se agregó
`LISTA_TEXTO` a `esPlantilla` **y no a la lista de arriba**, que es **el otro lector del mismo
hecho**. ⚠ **Y el síntoma fue el descrito: no falló, publicó un `-`.**

⭐ **La checklist que faltó, y es la misma:** al agregar una operación, greparla y mirar **todos**
los sitios que enumeran operaciones por nombre. Hoy son **tres** —`OPERACIONES_`, `esPlantilla`, y
esta lista literal— y **sólo dos se actualizaron**.

⚠ **Y un detalle que salvó la mitad por casualidad, que conviene no leer como diseño:** `ctx.separador`
se asigna **en ese mismo `if`**, así que `LISTA_TEXTO` tampoco lo recibe. **No rompió nada** porque
`opLISTA_TEXTO` usa salto de línea cuando el separador viene vacío o `undefined`. ⛔ **Fue suerte,
no previsión.**

⛔ **NO se arregló** — el prompt es sólo lectura. El arreglo es **un nombre en una lista**, y lo
decide el usuario.

### ⭐ P3 · El desempate por comparación, que confirma el diagnóstico

| campo | `emin_encuentros` | `emin_lista` |
|---|---|---|
| `base_id` / `solapa` | `reuniones` / `Agenda funcionarios` | **idénticos** |
| `campo_logico` | `figura` | `{figura=Seguridad en tu barrio?barrio} {fecha:dd/MM}` |
| `operacion` | `CONTEO` | **`LISTA_TEXTO`** |
| `dimensiones` / `filtro` / `periodo_ref` | vacíos | **idénticos** |
| ⭐ **`campoOverride`** | `figura` | ⭐ **`figura`** — medido corriendo `primerCampoDePlantilla_` |

⇒ ⭐⭐ **Los dos piden los datos con el MISMO campo, sobre la misma solapa y la misma ventana.** El
`campoOverride` era el candidato natural y **queda descartado por medición**: `camposDePlantilla_`
sobre esa plantilla devuelve `["figura","barrio","fecha"]` y el primero es `figura`.

⇒ **La única diferencia que puede producir 7 contra 0 es `ctx.plantilla`**, y es justamente la que
no llega. **La comparación y el código dicen lo mismo.**

### ✅ P4 · Los tres campos están mapeados — no es eso

`figura` → **B**, `barrio` → **C**, `fecha` → **D**, los tres sobre `reuniones / Agenda funcionarios`.
⭐ Y aunque faltara alguno **no sería la causa**: un campo sin mapeo produce el hueco visible
`«?campo»`, **no vacío**. Queda descartado y separado.

### ⚠ P2 · La distinción sobrevive en la traza y muere en el deck

**El despachador NO lee `ambiguo`.** El estado sale **sólo del valor vacío** (`Generador.gs`):

```
var vacio = (salida.valor === '' || salida.valor === null || salida.valor === undefined);
base.estado = vacio ? (huboRechazos ? 'REVISAR' : 'sin_datos') : 'ok';
```

⇒ Las **dos** salidas vacías de `opLISTA_TEXTO` —`plantilla_sin_resolver` y `lista_sin_filas`—
bajan al **mismo** `sin_datos` y publican el **mismo** `-`. ⭐ **La lámina dice «no hubo
encuentros» para un universo vacío y también para una plantilla sin resolver**, que son dos
trabajos opuestos.

⚠ **`ambiguo` se lee entre operaciones** —`opFILA_TEXTO` mira el de `opFILA`— y en `Union.gs`, pero
**el despachador no lo mira nunca**. ⛔ **Reportado, no arreglado:** qué se publica lo decide el
usuario.

---

## ⭐⭐ Una afirmación de IMPOSIBILIDAD exige el camino completo (04/09/2026)

**La refutación de P1, entera y con sus dos mitades:**

| | |
|---|---|
| ✅ **demostrado** | la guarda de vacío corre en `Generador.gs:148`, **once líneas antes** del envoltorio `_revisar` (159) ⇒ un valor vacío devuelve `''`, **nunca `--`** |
| ⛔ **falso** | *«un guión solo es imposible por construcción»*. `textoFaltante_:1935` devuelve **`-` para `sin_datos`** y `---` para `error`/`REVISAR` |

⭐⭐ **El motivo, y es la forma general:** `formatearValorMarcador_` **sólo corre cuando
`estado === 'ok'`**. Todo lo demás lo pinta `textoFaltante_` — **otra función, y ningún comentario
las conecta**. Una afirmación *«X es imposible»* mirando sólo la función donde X **se formatea**
deja afuera todos los caminos donde X **se escribe por otro motivo**.

⇒ **Antes de escribir «imposible por construcción», enumerar los caminos que llegan al mismo
lugar.** Si no se pueden enumerar, la afirmación correcta es *«esta función no lo produce»*, que es
más débil y verdadera. ⚠ Es `CLAUDE.md` §4 —*la función que estás leyendo no es el camino
completo*— **aplicada a una afirmación negativa**, que es donde más engaña: una negación se cita
como cierre, y cierra la búsqueda.

⭐ **Y el costo real fue bajo por una sola razón:** la afirmación se estaba **escribiendo**, no
usando. Si hubiera entrado a `PENDIENTES` como hecho, la hipótesis de la caja habría mandado a
medir la plantilla del equipo **para un bug del motor**.

---

## ✅ La caja «Alcance» sale de la lista de sospechas del ítem 34 (04/09/2026)

**No tiene token.** Ninguno de los diez `emin_*` — `diagTokensEmin()` los ubicó a todos en slide 14
y ninguno cae ahí. ⇒ **Queda como lo que es: una caja que espera un token que nadie cableó**, y
**no tiene nada que ver con `emin_lista`**. Su vacío sin guiones es coherente: sin token, el motor
no escribe nada.

---

## ⛔⛔ P0 · `2026-09-04_4` PARA en P3 — la rama `listo` NO se puede reusar, y la premisa que lo decía es mía (04/09/2026)

**Parte 0 completa. ⛔ No se ejecutaron las Partes B ni C.**

### La condición de parada se cumplió

P3 pedía: *«qué campos usa la rama `listo`, cuáles puede darle `panel_estadoDesatendida()`, y
cuáles faltarían. ⛔ Si falta alguno que la pantalla necesita, reportar y parar: el diseño cambia y
no es una línea.»*

| campo que usa `vistaListo()` | ¿lo tiene `panel_estadoDesatendida()`? |
|---|---|
| `deck` | ✅ **sí** — vía `panel_deckDeId_` |
| `corrida_id` | ✅ sí |
| `periodo` · `periodo_nivel` · `periodo_desde` · `periodo_hasta` | ⛔ **no** — sólo hay `periodo_id` |
| ⛔⛔ **`conteos`** | ⛔ **NO, y no hay de dónde leerlo** |
| `escondidas` · `cableados_sin_caja` · `secciones` · `tiempos_por_seccion` · los tres avisos | ⛔ no |

⛔⛔ **`conteos` es el que decide.** Sale de `r.tokens.*` — **el objeto de retorno de
`generarInforme`**, que sólo existe en la corrida **síncrona**. **No está en `CORRIDAS` ni en
`PLAN_CORRIDA`**, así que no hay de dónde reconstruirlo sin inventar un campo.

⚠ **Y el modo de falla es el peor de este repo, no un hueco visible:** `vistaListo` hace
`var c = r.conteos || {}`. Con el estado desatendido eso **no rompe: renderiza CEROS**. La pantalla
diría *«0 impresiones con valor, 0 filas en faltantes»* sobre un deck completo. ⭐ **Un número
plausible y falso, exactamente donde el usuario mira para saber si la corrida salió bien.**

### ⭐⭐ Y la premisa que se cae es MÍA

El ítem 31 lo escribí yo, el 03/09, y decía:

> *«el caso `terminada` cae en la rama `listo` **que ya existe** ⇒ ⭐⭐ **cero UI nueva** — es la
> línea de al lado»* · *«`panel_estadoDesatendida()` ya devuelve lo que un progreso necesita ⇒
> **cero backend nuevo**»*

⛔ **La segunda mitad sigue siendo cierta para el AVANCE** —`hechas`, `pendientes`, `plan`,
`ejecucion`, `tope` alcanzan de sobra—. ⛔⛔ **La primera es falsa para el FINAL**: la rama `listo`
no muestra sólo el deck, muestra **el resumen de la corrida**, y ocho de sus campos no existen del
lado desatendido.

⭐ **Por qué me equivoqué, y es la lección:** miré `deckCard(r.deck, …)` —la primera línea de
`vistaListo`— y **concluí sobre la función entera**. Es la misma figura que acabo de registrar
ayer: *una afirmación sobre un camino exige el camino completo, no la primera función que se lee*.
⚠ **Dos veces en dos días, y la segunda sobre mi propio diseño.**

### Las dos salidas, sin elegir — es del usuario

1. ⭐ **El final desatendido tiene su propia vista**, más chica: deck + qué se hizo, **sin los
   conteos que no existen**. No inventa nada y **no publica ceros**.
2. **`panel_estadoDesatendida()` gana los conteos**, lo que exige que la corrida los **persista**
   al cerrar — eso es tocar el mecanismo desatendido, que el prompt declara fuera de alcance.

⛔ **Lo que NO es una salida: caer en `listo` con `conteos` vacío.** Es publicar ceros donde va un
resumen.

### ⚠ Lo que sí quedó medido y no depende de esto

- **Son CUATRO caminos, no tres** — el testigo los lista. El que faltaba es el botón desatendido de
  «Detalles».
- ⛔ **El que cortó el 03/09 es el camino 1**, `panel_generar`, **síncrono**.
- **El ritmo:** tope **6** continuaciones, **60 s** entre ejecuciones ⇒ consultar el estado más
  seguido que ~15 s no aporta nada.
- `panel_generarSemanaEnCurso` y `panel_generarPeriodoPersonalizado` **crean períodos**, no
  corridas — declarado para que el próximo censo no los cuente.

---

## ⭐⭐ Un `|| {}` sobre un objeto que la vista despliega campo por campo NO es una guarda: es un generador de ceros (04/09/2026)

**El caso, y por eso `vistaListo` no se reusó:** `var c = r.conteos || {}`. Con el estado
desatendido —que no tiene `conteos`— **no rompe: renderiza CEROS**. La pantalla diría *«0
impresiones con valor»* sobre un deck completo, **justo donde se mira para saber si salió bien**.

⭐ **La forma general:** `|| {}` protege contra el `TypeError` y **no** contra la lectura falsa.
Un objeto ausente y un objeto vacío **son cosas distintas** y el operador los junta. ⇒ **Cuando la
vista despliega campo por campo, la guarda tiene que distinguir «no vino» de «vino en cero»** — y
decir la primera, no pintar la segunda.

⚠ **Y su gemelo, que apareció el mismo día y lo encontró un banco:** `resumenDeCorrida_` leía
`CORRIDAS` **sin `try/catch` dentro de `panel_estadoDesatendida`**, así que una lectura fallida
**mataba toda la pantalla de avance** por no poder mostrar dos conteos. ⭐ **El orden de importancia
tiene que estar en el código:** el resumen es secundario, el avance **es** la pantalla.

---

## ⭐ P5 · Cómo se lee el resumen de una corrida desatendida en `CORRIDAS` (04/09/2026)

**Medido leyendo quién escribe las columnas**, que es más fuerte que mirar una fila.

| | |
|---|---|
| **cuántas filas** | **N, una por `ejecucion`** — `abrirCorrida_` corre una vez por invocación de `generarInforme` |
| **`tokens_reemplazados`** | ⭐ **PARCIAL de esa ejecución** — `escribirCorrida_` **completa esa misma fila** (por `numeroFila`), no acumula |
| **cómo se llega al total** | ⭐ **SUMANDO**, y es correcto: los reemplazos son **disjuntos por construcción** — un token reemplazado deja de ser `{{token}}`, así que la ejecución siguiente no lo vuelve a contar |
| ⛔ **`faltantes`** | ⛔⛔ **NO es un número: es un campo de ESTADO que empieza con el número.** `avisosDeLaFila_` devuelve el conteo pelado **o** `conteo + ' · ' + avisos`, y el cierre le pega `' · gasto: …'`. Una fila abierta trae `'(corrida en curso — …)'` |

⭐ **Por eso se lee el primer segmento y `null` significa «esa ejecución no cerró»**, que es un dato
y no un cero. ⚠ **Los dos modos de equivocarse dan un número plausible:** sumar acumulados daría el
doble, tomar la última daría sólo el último tramo, **y ninguno rompe**.

### P6 · Lo que NO está en `CORRIDAS` ni en `PLAN_CORRIDA`

`escondidas`, `cableados_sin_caja`, `secciones`, `tiempos_por_seccion`, los **tres avisos**, y
`periodo_desde` / `periodo_hasta` / `periodo_nivel` / `periodo_calculado` / `periodo_traza`.
⇒ **La vista final los nombra y dice por qué no están** — *hoy no se persisten*. ⛔ Sin esa línea,
**un resumen más corto se lee como un deck más limpio**, que es la lectura opuesta a la verdadera.

---

## ⛔⛔ P0 · El `_revisar` se puso DESPUÉS de que el caso validara — el cruce va en una sola dirección (04/09/2026)

**El hallazgo de proceso del `2026-09-04_5 Addendum 1`, y es el más importante de la tanda.**

| lectura | qué dice |
|---|---|
| `MARCADORES_2026-08-31.tsv` | los **siete `m2_*`** tienen `miles` y `porcentaje_sin_signo` — ⭐ **limpios** |
| deck del motor del 04/09, `L-038` | los publica **entre guiones**: `-23-`, `-1.348.720-`, `-32.4-`… |
| `V-124` | los **validó el 02/09** |

⇒ ⭐⭐ **A seis marcadores se les puso la marca de «no validado» DESPUÉS de que un caso del CSV los
validara**, y **nada avisó**. Lo detectó el usuario **leyendo el deck**.

⭐ **La causa es estructural, no un descuido:** el cruce marcador ↔ caso **es manual y va en una
sola dirección** — se revisa **al levantar** el `_revisar`, nunca **al ponerlo**. ⇒ Un marcador
validado puede volver a marcarse como dudoso y **el sistema no tiene cómo notarlo**.

⇒ ⛔ **Lo accionable: el cruce tiene que correr también al revés** — *caso `exacto` cuyo marcador
sigue con `_revisar`*. Va como **ítem 36**.

⚠ **Y el costo no es cosmético:** un dato validado que sigue entre guiones **le enseña al lector
que los guiones no significan nada**. Es la misma familia que *«una marca que está en todos lados
no distingue nada»*.

---

## ⭐ Un censo sobre un snapshot mide el snapshot — segunda instancia (04/09/2026)

El censo de `_revisar` de la Parte 0 salió del snapshot del 31/08 **con su límite declarado**
—*«puede quedarse corto, nunca largo»*—. ⛔ **Se quedó corto, y el resultado se iba a usar como si
fuera la hoja.**

⭐ **Lo que hace cara a esta figura: declarar el límite NO evita el error.** El número queda escrito,
la advertencia queda dos líneas abajo, y **lo que sobrevive es el número**. ⇒ **Cuando la pregunta
es sobre el estado de HOY, el instrumento tiene que leer la hoja viva** — el snapshot contesta otra
pregunta, la de su fecha.

⇒ Escrito `censarRevisarVivos()` (`Instalar.gs`, sólo lectura), con el mismo control positivo que
cazó el error del cruce: la columna del CSV se llama **`token_propuesto`**, no `token`. ⛔ **Mi
primer censo dio `0/0/32` por leer la columna equivocada** — un cero que era artefacto del lector,
no del dato.

---

## ⭐⭐ P2 · `porcentaje_sin_signo` y NO `fraccion` — la diferencia es 100× (04/09/2026)

**Medido corriendo `opPCT` y `formatearValorMarcador_` reales** sobre los tres pares del deck
`secco-20260903-234123`, en vez de deducirlo del deck:

| marcador | crudo `opPCT` | `porcentaje` | ⭐ `porcentaje_sin_signo` | ⛔ `fraccion` |
|---|---|---|---|---|
| `emin_or` | 18.3218 | `-18.3%-` | **`-18.3-`** | ⛔ **`-1832.2-`** |
| `emin_ctor` | 1.8873 | `-1.9%-` | **`-1.9-`** | ⛔ `-188.7-` |
| `emin_ctr` | 0.2953 | `-0.3%-` | **`-0.3-`** | ⛔ `-29.5-` |

⭐ **`porcentaje` reproduce el deck byte a byte** ⇒ el crudo **ya viene en unidades de porcentaje**
y **los tres números son correctos**. Lo único mal era el signo repetido.

⛔⛔ **`fraccion` era la trampa**, y suena a la respuesta: *«la caja pone el `%`, entonces
fracción»*. Publicaría **1832 donde va 18,3** — un error de **orden de magnitud**, el modo de falla
más caro de este repo. ⭐ Y el motor **ya usa `porcentaje_sin_signo`** en `ivr_at_pct`, `ivr_75_pct`
y `camp_meta_ctr`: **es el mismo caso, resuelto antes.**

---

## ⭐ `L-038` CERRADA por decisión del usuario, con su condición de invalidación (04/09/2026)

**`C-87`.** El equipo **adapta** las campañas al armar la lámina —agrupa, unifica y renombra—, así
que su conteo y el del motor **cuentan cosas distintas por construcción**: envíos 23 contra 22,
campañas 21 contra los 15 «Proyectos». ⇒ ⛔ **No hay número final automático y no se vuelve sobre
esto.** Se publica el conteo del motor, que es el de su fuente, **sin `_revisar`**.

⭐ **Y cierra además la pregunta que `V-124` había dejado abierta** sobre qué marcador mide
«proyectos»: ya no hay que elegir entre `m2_campanias` y la columna literal `Proyecto`, **porque
ninguna puede reproducir un número que se arma a mano**.

⭐⭐ **La condición de invalidación, que es un EVENTO y no una fecha: que el equipo deje de adaptar
las campañas.** Escrita así a propósito — un estado hay que ir a mirarlo, **una condición se puede
vigilar**.

⚠ **`imp_total` y `gcba_imp_total` se levantan por caso exacto Y son dos de los números que el deck
del equipo desmiente. No es contradicción:** el caso `V-` certifica que **el motor lee bien su
fuente**; que la fuente no tenga el grano semanal **es otra cosa y sigue abierta**.

---

## ⚠ Dos cosas que la comparación de decks destapa y este prompt NO toca (04/09/2026)

- ⛔ **`pauta_*` publica `1` en Meta, Google y Programmatic, en las DOS láminas**, contra 7/8/8 y
  95/73/125 del equipo. Defecto de magnitud **ya diagnosticado**, y **sigue sin ámbito**: el prompt
  `2026-08-31_2` **nunca se ejecutó**.
- ⭐ **`ivr_llamados` y `gcba_ivr_llamados` ya publican distinto** (JM `-`, GCBA `170.473`): **el
  cableado del 03/09 llegó**. ✅ **Control positivo del ítem 11, cumplido** — el token existe en la
  plantilla y el ámbito discrimina.

---

## ⛔⛔ P0 · Los `_revisar` puestos después no son 7: son **54** — pero **ninguno pisa un caso `exacto`** (04/09/2026)

**El censo sobre la hoja viva dio 90** contra los **32** del snapshot del 31/08. ⭐ **El snapshot no
vio 58**, y el corte que importa no es ése:

| grupo | n | qué significa |
|---|---|---|
| **A** · no existían el 31/08 | **10** | los `emin_*` — **nacieron con la marca, es normal** |
| **B** · ya la tenían el 31/08 | **26** | sin novedad |
| ⛔ **C** · **existían y estaban LIMPIOS** | **54** | ⛔⛔ **la marca se puso DESPUÉS** |

⇒ **Los siete `m2_*` del addendum eran la punta.** El grupo C son **familias enteras**: los 10
`enc_*`, los 10 `u1_post_*`, los 28 `post_*`, más `camp_alcance`, `camp_ctor`, `camp_titulo`,
`camp_enviados`, `camp_or`, `camp_mail_clics`.

### ⭐⭐ El reencuadre: no fue un descuido, fue una operación

**54 marcadores no se marcan de a uno por error.** Es la aplicación masiva de `_revisar` del 01/09
—**76 aplicados, 18 levantados**—. ⇒ **Lo que falló no es que alguien marcara de más: es que esa
aplicación NO cruzó contra el CSV**, y por eso pisó marcadores ya validados.

### ✅ Y la buena noticia, medida y no supuesta

**De los 54 que siguen marcados, NINGUNO tiene caso `exacto`.** Cruzado en disco contra los cuatro
CSV por `token_propuesto`, con control positivo (169 tokens encontrados):

- **45 sin ningún caso**;
- **9 con caso de otro estado** — `enc_alcance` (`C-23`/`C-27`/`C-40`/`A-09` cerrados), los cuatro
  `enc_*` de `D-01`…`D-04` (`deriva`), y los cuatro `u1_post_*` de **`X-42` `contradice`**.

⭐ En los `u1_post_*` **el `_revisar` está bien puesto**: hay un caso que **contradice**.

⇒ ⭐⭐ **Los siete `m2_*` eran los ÚNICOS que pisaban una validación `exacto`, y ya se corrigieron.**
El ítem 36 pasa de *«hay N sin detectar»* a *«hubo 7, se corrigieron, y ahora se sabe detectarlos»*.

---

## ⭐⭐ `porcentaje_sin_signo` contra `fraccion`: la regla es de dónde VIENE el número (04/09/2026)

**Medido sobre los siete que hoy usan `fraccion_revisar`** — `enc_ll_contactados_pct`,
`enc_ll_efectivos_pct`, `enc_alcance_pct` y los cuatro `post_vtr*`:

| origen del valor | operación | formato correcto |
|---|---|---|
| ⭐ **el MOTOR lo calcula** | `PCT` — `opPCT` devuelve `ratio × 100` | **`porcentaje_sin_signo`** |
| ⭐ **la FUENTE lo trae calculado** | `ULTIMO` / `FILA` sobre una columna `*_pct` | **`fraccion`** |

⇒ ✅ **Los siete están BIEN**: son `ULTIMO` y `FILA` sobre `cc_contactados_pct`,
`cc_efectivos_pct`, `alc_cobertura_pct` y `vis_vtr_pct` — **valores que la base ya calculó**, que
llegan como fracción 0–1. **`fraccion` es su formato correcto.**

⚠ **Es el caso OPUESTO al de los `emin_*`**, y por eso conviene tenerlos escritos juntos: elegir mal
en cualquiera de las dos direcciones es **exactamente 100×**, y **no falla — publica un número
plausible**. ⭐ **La pregunta que decide no es «¿la caja tiene `%`?» sino «¿quién calculó el
número?»**.

⭐ **Un cero medido que también se escribe:** se buscó un defecto en esos siete y **no lo hay**.

---

## ⚠ El testigo del censo se gastó con el propio cambio (04/09/2026)

`censarRevisarVivos()` usaba `imp_total` como control positivo — y **el mismo cambio que el censo
vino a verificar le sacó el `_revisar`**. ⇒ El control respondió *«no (ya levantado)»* y **siguió
sin discriminar nada**.

⭐ **Es `CLAUDE.md` §4 en su forma más literal:** *un instrumento que mide un cambio no puede
depender de lo que el cambio modifica*. ⚠ Y acá el instrumento **se escribió el mismo día que el
cambio**, así que el testigo nació ya condenado.

⇒ Agregado un segundo testigo —**`imp_prog`, que el cambio NO tocó**— y ahora **aborta** si no
aparece.

⛔ **Y el otro límite del instrumento, declarado en su propio log:** Apps Script **no puede leer los
CSV**, así que sus listas 1 y 2 son una **transcripción fechada** del cruce en disco. ⇒ **su lista 3
significa «no está en la transcripción», NO «no tiene caso»** — y sin esa línea el `0` de la lista 1
se lee como un hallazgo.

---

## ✅ Ítem 11 · Los tres `gcba_ivr_*` **SÍ están** en la plantilla de `jm` — la hipótesis se cae (04/09/2026)

**Corrido `censarIvrEnPlantillaJm()`, con control positivo en la misma corrida.**

```
gcba_ivr_llamados : lámina 3     gcba_ivr_atendidos: lámina 3
gcba_ivr_at_pct   : lámina 3     gcba_cc_base      : lámina 3   ← control positivo ✅
```

⇒ ⛔ **La hipótesis (1) del `2026-08-31_2` —*«la plantilla de `L-032` no usa el token»*— queda
DESCARTADA.** Los cuatro están en la misma lámina.

⇒ ⭐ **El ítem 11 sigue siendo un CABLEADO, no `C-01`.** No hay que hablar con el equipo: el token
existe y el `✅` de `cablearGcbaIvr()` **sí medía algo que se va a publicar**.

⭐ **Y confirmado por el deck del 04/09**, que es evidencia independiente: `ivr_llamados` y
`gcba_ivr_llamados` **ya publican distinto** (JM `-`, GCBA `170.473`).

### ⚠ Cuál de los dos documentos quedó viejo

`TOKENS.md` §178 registraba esa lámina como *«sin `gcba_ivr_*`»*, medido contra la plantilla el
**16/08**. `HANDOFF_CODE` decía que **sumó cuatro tokens el 29/08**.

⇒ ⛔ **`TOKENS.md` §178 está VIEJO; el handoff tenía razón.** ⭐ Y no es que estuviera mal: **era
cierto el 16/08 y la plantilla cambió después** — evidencia fechada haciendo lo que hace la
evidencia fechada.

### ⚠ Y un defecto propio, del mismo log

Mi veredicto salió **mudo**: *«no pude leer el detalle por token del retorno»*. **Adiviné el nombre
del campo** —`encontrados`/`por_token`— cuando `censarTokensEnPlantilla` devuelve **`donde`**.
⭐ **Avisó bien, que es lo que se le había pedido**, pero un veredicto que no puede opinar **deja el
cruce a ojo del que lee**, que es justo lo que el control positivo viene a evitar. Corregido.

---

## ⛔ CONGELADO por decisión del usuario, 04/09/2026

### 1 · Los Resúmenes Ejecutivos

**Se congelan hasta validar con los equipos de dónde sale la información.** ⭐ **No es una pausa de
prioridad: es que el dato no tiene origen declarado.** Cablear contra una fuente sin confirmar es
exactamente cómo nace un número plausible — y un Resumen Ejecutivo es la lámina donde más caro sale.

⚠ **El evento que lo destraba** —no una fecha—: **que los equipos confirmen el origen de cada
número del Resumen.**

### 2 · Los `*_bench_*` y todo lo que vive sólo en láminas escondidas

**Salen de la cola de cableado.** Los dos motivos son distintos y conviene no mezclarlos:

| qué | por qué |
|---|---|
| **`*_bench_*`** | son **valores de referencia del EQUIPO**, no medidas de la fuente. ⛔ **Cablear un benchmark contra una base es inventarle un origen que no tiene** |
| **sólo en láminas escondidas** | `tokensDeSlide_` devuelve `[]` para ellas ⇒ **el motor no las pinta**. Cablear un token que nadie resuelve **no publica nada** |

⛔ **Congelar NO es descartar:** el token sigue existiendo y la lámina también. Lo que se declara es
que **no entran a la cola**.

⚠ **Y el borde que hay que mirar, porque parece congelable y no lo es:** un token escondido en
**una** plantilla y visible en **la otra** **sigue vivo** — es compartido, y el lado que lo pinta lo
necesita. `listarCompartidosSinFila()` los reporta **aparte**, como `mixtos`.

---

## ⛔⛔ P0 · Una corrida se declaró TERMINADA dejando trabajo sin hacer — y sin forma de retomarlo (04/09/2026)

**Medido con `diagCorridaEnCurso()` sobre `secco-20260904-153514`:**

```
estado entre ejecuciones : NO HAY
triggers de continuación : 0
el plan                  : 2 filas — 1 hecha, 1 PENDIENTE
```

⇒ ⛔⛔ **Terminó, no hay nada corriendo, y queda una sección sin hacer.** Es el invariante
`corte ⇒ pendientes ≥ 1` **en su forma simétrica**, que nadie estaba mirando: **«sin corte»
⇒ pendientes = 0**.

### La causa, y es una asimetría entre dos ramas de la misma función

`arrancarCorridaDesatendida_` marca las secciones de dos maneras:

| rama | qué hacía |
|---|---|
| **cortó** | ⭐ `if (marcarSeccionPlan_(...)) hechas++;` — **mira el retorno** |
| ⛔ **NO cortó** | `marcarSeccionPlan_(...); hechas++;` — **lo ignora** |

`marcarSeccionPlan_` devuelve **`false`** cuando no encuentra la fila. ⇒ En la rama sin corte, una
sección que **no se pudo marcar** se contaba como hecha, la corrida devolvía **`terminada: true`**,
**no guardaba estado y no creaba trigger** — y el plan se quedaba con su fila `pendiente` **para
siempre**.

⭐ **El arreglo no inventa comportamiento: restaura la simetría que ya estaba del otro lado**, más
el invariante que faltaba. **Sin corte, todo tiene que quedar marcado**; si no, **no se declara
terminada** y el deck conserva el sello, que es lo que corresponde.

### ⚠ Lo que fue mío, y hay que separarlo

⭐ **El defecto de fondo es PREEXISTENTE** — la desatendida ya venía así, y sólo se nota cuando
`marcarSeccionPlan_` falla. **Mi cambio del 04/09 no lo causó.**

⛔ **Pero mi sondeo lo convirtió en un CUELGUE en vez de en un aviso.** Pedía
`!en_curso && pendientes === 0`, y acá `pendientes` era **1** ⇒ la condición **no se cumplía nunca**
y el contador corrió **20 minutos**. ⚠ **Un contador que sube para siempre no dice «terminó
incompleta»: no dice nada.**

⇒ **Tres arreglos, y conviene tenerlos separados:**

1. ⭐ **El bug real** — la rama sin corte mira el retorno y **no se declara terminada** si algo no
   se marcó.
2. **El sondeo** — termina cuando **no hay corrida viva**, tenga o no pendientes.
3. ⭐⭐ **La vista final DISTINGUE los dos finales.** «Terminó» y «terminó **completa**» son dos
   cosas: con pendientes ahora sale en rojo —*«Terminó INCOMPLETA … no la des por buena»*— en vez
   de un «Listo» verde sobre un deck al que le falta contenido. **Un aviso que no distingue el
   final bueno del malo no es un aviso: es un adorno.**

### ⚠ Y un defecto de mi propio diagnóstico, del mismo log

Imprimió **`pendiente: ?`** — **adiviné el nombre del campo** (`seccion`/`item`) cuando es
**`seccion_id`**, justo cuando saber **cuál** era el dato que faltaba. ⭐ Es la segunda vez en el día
que adivino un nombre de campo en vez de mirarlo (la otra fue `encontrados` por `donde`). Corregido,
más el invariante simétrico que al diagnóstico también le faltaba.

⛔ **Lo que sigue sin saberse: QUÉ sección quedó pendiente y por qué `marcarSeccionPlan_` no la
encontró.** El diagnóstico corregido lo dice en la próxima corrida.

---

## ⛔⛔ P0 · ÍTEM 33 — CAUSA RAÍZ: el bloque modelo se tomaba por POSICIÓN sobre un deck que ya se había movido (04/09/2026)

**La tercera causa, y es la que explica todo.** Las dos anteriores estaban descartadas —`L-016`
declara `campana` en la hoja viva, y `filas_sin_ancla = 0`—.

### La evidencia, cruzada

| fuente | qué dice |
|---|---|
| `LAMINAS` | `secco/campana` = **`L-016`…`L-023`** |
| deck del 03/09 | duplicó **`L-017`…`L-024`**, tres veces |
| ⭐ `LAMINAS`, otra vez | **`L-024` es `analisis_datos`**, no `campana` |

⇒ ⛔⛔ **El bloque está corrido exactamente un lugar: dejó afuera `L-016`, que SÍ es de la sección, y
metió `L-024`, que es de otra.** Y **no falló** — duplicó lo que no era, tres veces.

### La causa, en dos líneas de `Generador.gs`

```
3407   var indiceLaminas = indiceDeLaminasPorAncla_(presentacion);   ← UNA vez, antes de duplicar
…
3645     var slidesAhora = presentacion.getSlides();                 ← POR SECCIÓN, ya movido
3646     var modelosSlides = ordenados.map(i => slidesAhora[i]);     ← índice viejo, deck nuevo
```

⭐ **Calcular el índice una sola vez es CORRECTO** — es lo que mata la N², y su comentario lo
explica bien. ⛔ **Lo que estaba mal es usarlo como POSICIÓN en un deck que las secciones anteriores
ya cambiaron**: cada una duplica y remueve, con neto `M × (N−1)`.

⇒ **La sección que expande primero corre a todas las que siguen.**

### ⭐⭐ La distinción que faltaba

**El índice sirve para saber QUÉ láminas son modelo (identidad), no DÓNDE están (posición).** La
identidad no caduca; **la posición caduca en cuanto alguien inserta una slide**.

⇒ **Se resuelve por `objectId`**, tomado antes de la primera duplicación. ⭐ **Y el `objectId` es lo
único que sirve:** el ancla **NO**, porque `slide.duplicate()` copia las notas del orador —medido el
21/08— así que **una copia hereda el ancla de su modelo**. El `objectId`, no. **Es el mismo patrón
que la etapa 3 ya usa con `asignacion.objectIdSlide`.**

### ⚠ Por qué sobrevivió tanto, y es lo que lo hace instructivo

⭐ **Con una sola sección repetible, posición y `objectId` dan lo MISMO.** El defecto **sólo aparece
a partir de la segunda**, y sólo si la primera cambia el largo del deck. ⇒ **La mayoría de las
corridas nunca lo tocaron.**

⚠ **Y el error ESCALA con el neto**: con +1 corre un lugar, con +2 corre dos. **No es un ±1 que uno
pueda compensar mentalmente al leer un deck.**

### La guarda que va con el arreglo

⛔ **Una lámina modelo que ya no está en el deck FRENA la sección**, con su motivo. **Duplicar la de
al lado es peor que no duplicar**: publica contenido de otra sección **sin fallar**, que es
exactamente lo que venía pasando.

### ⚠ Lo que este arreglo NO cierra

⭐ **`camp_titulo` sigue necesitando el desdoble por ítem.** Con el bloque corregido, `L-016` **sí**
se va a expandir ⇒ su `camp_titulo` lo va a pintar la etapa 3, por ítem. **Pero `L-023` está
escondida** y sigue recibiendo el pintado por presentación. ⚠ **El arreglo cambia el síntoma, no la
causa de aquél.**

⛔ **Y el control real es una corrida**: el banco prueba la resolución de posición sobre un deck de
juguete. Lo que hay que ver es que `campana` duplique **`L-016`…`L-023`** y no `L-017`…`L-024`.

---

## ⛔⛔ P0 · La conclusión del `2026-09-04_6 Addendum 1` está REFUTADA por una lectura de hoja (04/09/2026)

**El addendum concluye:** *«los guiones de M2 en `jm` NO vienen del `_revisar`. Al 31/08 no había
`_revisar` que sacar y los guiones salieron igual.»*

⭐ **Su premisa es correcta y su conclusión no se sigue** — y el propio addendum lo anticipa:
*«el snapshot está vencido … esa es la hipótesis simple y hay que medirla primero, no descartarla»*.

### La medición que la decide, y ya existía

**El log de `aplicarCambios0409()` del 04/09 a las 14:05** leyó la **hoja viva** e imprimió el valor
**de origen** de cada celda:

```
m2_mails_enviados     miles_revisar                 → miles
m2_mails_entregados   miles_revisar                 → miles
m2_aperturas          miles_revisar                 → miles
m2_clics              miles_revisar                 → miles
m2_envios             miles_revisar                 → miles
m2_or                 porcentaje_sin_signo_revisar  → porcentaje_sin_signo
m2_ctor               porcentaje_sin_signo_revisar  → porcentaje_sin_signo
```

⇒ ⭐⭐ **A las 14:05 los siete TENÍAN `_revisar`.** El deck de `jm` es de las **11:42**, *anterior*
al cambio. ⇒ **A las 11:42 también lo tenían, y los guiones SÍ vienen del `_revisar`.**

⇒ **Gana la RAMA 2 del addendum** —se marcaron después del 31/08— y **con evidencia de lectura, no
por descarte**. ⭐ El marcado es la **aplicación masiva del 01/09** (76 puestos, 18 levantados), que
es la misma que ya está registrada como el ítem 36.

### ⚠ Pero el control del par `jm`/`secco` sigue abierto, y es bueno

⭐ **Que la conclusión se caiga no invalida el control**: sigue siendo la pregunta correcta. Lo que
cambia es que **su respuesta depende de un dato que el snapshot no puede dar.**

⛔⛔ **El snapshot del 31/08 tiene 220 filas y las 220 dicen `informe_id = jm`.** ⇒ **Es anterior a
la migración de 168 marcadores a `*`** del `2026-08-31_6`. ⭐ **Preguntarle cuántos informes lee una
fila es preguntarle por algo que todavía no existía.**

⇒ Y ésa es **exactamente** la bifurcación del addendum, así que el snapshot **no puede decidirla**.
Escrito `censarM2Vivo()` (`Instalar.gs`, sólo lectura, con control positivo: nueve filas o aborta).

### ⭐ Y la hipótesis barata que hay que descartar antes de buscar un mecanismo oculto

Si el censo da **rama 1** —una sola fila `*` para los dos informes— la conclusión *«hay un segundo
mecanismo que envuelve en guiones»* **todavía no se sigue**: ⚠ **falta verificar que los dos decks
comparados sean posteriores al marcado del 01/09.** Un deck de `secco` **anterior** explica la
diferencia **sin ningún mecanismo nuevo**.

⛔ **Es la misma figura que este prompt acaba de cometer:** comparar una foto vieja contra una nueva
y atribuir la diferencia a un mecanismo en vez de al tiempo.

⚠ **Y un dato del addendum del `_5` que empuja en contra de la rama 1:** el deck de `secco` **sí
trae guiones** en `L-034`, `L-052`, `L-053`, `L-036` y `L-045`. ⇒ **El `_revisar` funciona en
`secco`**, así que si `L-014` sale limpio no es porque el mecanismo no llegue a ese informe.

---

## ✅ Parte 0.2 del `2026-09-04_6` — CERRADA: los guiones vienen del `_revisar`, y una decisión del usuario fue deshecha (04/09/2026)

### Las dos mitades, medidas

**1 · ¿De dónde salen los guiones?** ⭐ Del `_revisar`. El log de `aplicarCambios0409()` (14:05) leyó
la hoja viva e imprimió `miles_revisar → miles` en los cinco absolutos de M2 y
`porcentaje_sin_signo_revisar → porcentaje_sin_signo` en los dos `%`. **El deck es de las 11:42,
anterior.** ⇒ **Rama 2**, y con lectura de hoja, no por descarte.

**2 · ¿Cuántas filas?** ⭐⭐ `censarM2Vivo()` dio **nueve filas, TODAS `informe_id = *`** y **cero con
`_revisar` hoy**. ⇒ **Rama 1 del addendum 1: una sola fila gobierna a los dos informes.**

### ⇒ Y las dos juntas dejan una sola explicación para el `secco` limpio

⛔ **Una sola fila con un solo `formato` no puede producir dos salidas a la vez** ⇒ ⭐ **la
diferencia `jm`/`secco` es TEMPORAL, no mecánica**: los decks se corrieron en momentos distintos
respecto del marcado del 01/09 y de la limpieza del 04/09 a las 14:05.

⇒ ⭐⭐ **No hay ningún mecanismo oculto que envuelva en guiones.** La rama (3) de la Parte A queda
**descartada con evidencia**, que es lo que el addendum pedía. ⚠ Y era la hipótesis cara: habría
significado un segundo camino sin documentar.

---

## ⛔⛔ P0 · Una decisión del usuario del 26/08 fue DESHECHA por la aplicación masiva del 01/09, y vivió ocho días (04/09/2026)

**Medido cruzando `FORMATOS_SIN_REVISAR_L053_` contra el snapshot del 31/08 y el censo vivo:**

| marcador | formato 31/08 | ¿`_revisar` hoy? |
|---|---|---|
| `u1_post_meta_impresiones` · `_vistas` · `_vtr` | `miles` / `porcentaje_sin_signo` | ⛔ **SÍ** |
| `u1_post_google_impresiones` · `_vistas` · `_vtr` | ídem | ⛔ **SÍ** |
| `u1_post_prog_impresiones` · `_vistas` · `_vtr` | ídem | ⛔ **SÍ** |
| `u1_fecha_fin` | `fecha` | ⛔ **SÍ** |
| los `u1_pre_*` y `u1_total_*` | `miles` / `porcentaje_sin_signo` | ✅ no |

⇒ ⭐⭐ **DIEZ repuestas.** `confirmarNumerosDeUnoAUno()` las limpió el **26/08**; la aplicación
masiva del **01/09** —76 marcados mirando `MARCADORES.notas` sola— **se las llevó puestas**.

⭐ **Y `u1_fecha_fin` es el testigo que el addendum citó** (`-11/09-` en el deck): **está en la
lista de la función Y está re-marcado.** El caso cierra exactamente donde el addendum lo predijo.

⚠ **Sólo se repusieron los `u1_post_*`, no los `u1_pre_*` ni los `u1_total_*`.** ⭐ Coherente con un
cruce que decidió **por lo que decía `notas`**, no por familia ni por lámina.

### ⛔ El deck lo mostró ocho días y se leyó como lo esperado

**Del 26/08 al 04/09.** ⭐ **Lo encontró el usuario comparando contra el deck del equipo** — no lo
detectó ningún control, porque **no había ninguno mirando esa dirección**.

⇒ La regla quedó escrita en `CLAUDE.md` §4: **una celda de `MARCADORES` no tiene dueño único**, y
una aplicación masiva **declara qué filas toca y las compara contra las decisiones puntuales ya
aplicadas ANTES de escribir**. ⭐ El registro de esas decisiones **ya existe** —las `confirmar*()` y
los CSV fechados—, así que no hay que inventar dónde mirar.

### ⚠ El corolario que aplica HOY

**Las catorce celdas que se escribieron el 04/09 a las 14:05 corren el mismo riesgo.** ⇒
**Verificar que sigan limpias después de la próxima aplicación masiva** es el único control que
distingue **una limpieza que duró de una que se deshizo**.

### ⚠ Y la aritmética que NO cuadra, dicha en vez de forzada

| | |
|---|---|
| `BITACORA` del 01/09 | **76** puestos − **18** revertidos = **58** netos |
| censo del 04/09 | **54** marcados hoy que estaban limpios el 31/08 |
| ⭐ + los **7** `m2_*` que limpié a las 14:05 (estaban en ese conjunto) | ⇒ **61** |

⇒ ⛔ **61 contra 58: no cuadra por 3.** Candidatos —**ninguno verificado**—: marcadores creados
entre el 31/08 y el 01/09 que entraron al cruce, o que las cifras 76/18 sean aproximadas.
**Se deja abierto en vez de elegir una explicación.**

---

## ⚠ CORRECCIÓN · `L-023` no publica el título **porque la lámina no declara el token** (04/09/2026)

**Dato del usuario**, del control del ítem 33 sobre el deck de dos campañas: en el XML de `L-023`
**hay runs vacíos donde iría el token** — y pasa igual en `jm` (`L-048`) **y en los dos bloques por
igual**.

⇒ ⛔ **NO es el pintado por presentación**, que es lo que quedó escrito acá el 03/09. ⭐ **Es más
barato de lo que se anotó**: la lámina simplemente **no tiene el `{{camp_titulo}}`**.

⚠ **Lo que esto NO deroga:** el mecanismo del pintado por presentación **existe y está medido** —
`camp_titulo` no es exclusivo y `presentacion.replaceAllText` pinta el deck entero. Lo que se cae es
**que ése fuera el motivo de lo que se veía en `L-023`**. ⭐ Es la diferencia entre *«el mecanismo
existe»* y *«el mecanismo explica este caso»*, y se confundieron.

---

## ⭐⭐ P0 · Parte 0 del `2026-09-04_7` — la tabla de las diez, y un hallazgo que da vuelta el marco (04/09/2026)

**Cruce sobre los CUATRO CSV (278 casos), por tokenización de `token_propuesto` — no por igualdad
de nombre.** ✅ **Control del lector:** los cuatro de `X-42` caen, así que el cruce ve lo que cree.

| marcador | grupo | caso que lo decide |
|---|---|---|
| `u1_post_meta_impresiones` | ⭐ **A** | `X-42` `contradice` @28/08 |
| `u1_post_meta_vistas` | ⭐ **A** | `X-42` |
| `u1_post_google_impresiones` | ⭐ **A** | `X-42` |
| `u1_post_google_vistas` | ⭐ **A** | `X-42` |
| `u1_post_meta_vtr` | **B** | *(ninguno)* |
| `u1_post_google_vtr` | **B** | *(ninguno)* |
| `u1_post_prog_impresiones` | **B** | *(ninguno)* |
| `u1_post_prog_vistas` | **B** | *(ninguno)* |
| `u1_post_prog_vtr` | **B** | *(ninguno)* |
| ⚠ `u1_fecha_fin` | **B** | *(ninguno)* — pero **es una fecha**, ver abajo |

⇒ **4 en A · 6 en B · 0 en C.**

### ⛔⛔ El control positivo encontró lo que venía a buscar, y no era lo esperado

El prompt pide que **los CINCO** de `X-42`/`X-43` caigan en A. ⭐ **Caen los cuatro de `X-42`. El
quinto —`u1_post_meta_alcance`, de `X-43`— NO ESTÁ ENTRE LAS DIEZ: nunca se re-marcó.**

**Verificado:** formato `miles` el 31/08 y **sin `_revisar` hoy**.

⇒ ⭐⭐ **Eso no es un fallo del cruce: es el hallazgo.** `u1_post_meta_alcance` **tiene un caso
`contradice` del 28/08 y está publicando SIN marca de revisión.** Y es **el peor de los dos** según
el propio prompt: la celda está en cero, el equipo publica **26.033**, y un `ULTIMO` sobre un cero
**escrito** devuelve cero — ⛔ **el deck publica un cero que se lee como «no alcanzamos a nadie»**.

⭐ **El cruce masivo del 01/09 marcó a cuatro de los cinco contradichos y se salteó al quinto.**

### ⚠ Y eso corrige el marco del prompt, no sólo un dato

El prompt dice *«para esos cinco, la marca que repuso el 01/09 es la correcta»*. ⇒ **Es cierto para
cuatro.** El quinto muestra **la falla en la dirección opuesta**: no que se marque de más, sino que
**falte marcar**. ⭐ **Las dos direcciones fallan, y hasta hoy sólo se estaba mirando una.**

### ⚠ `u1_fecha_fin` — la pregunta que el prompt manda hacer antes de clasificarla

Cae en **B** por ausencia de caso, **pero es una FECHA, no una métrica**. ⛔ Y `_revisar` significa
*«hay un número que alguien puso en duda»*. Sobre una fecha, **la duda no es del mismo tipo**: una
fecha no difiere del deck por drift de la fuente, difiere por estar mal leída o mal declarada.
⇒ **No se limpia con el resto sin decidir eso.**

---

## ⛔ Parte C · Los tres que faltan — NO se pueden cuadrar desde disco (04/09/2026)

`BITACORA` da 76 − 18 = **58** netos; el censo da 54 + los 7 `m2_*` limpiados = **61**. Diferencia
de **3**.

⛔ **La medición que el prompt pide —comparar el backup `_BACKUP_MARCADORES_2026-09-01_1130_levantar`
contra el snapshot— exige leer una hoja del libro vivo, y eso no se puede desde disco.**

⚠ **Y la hipótesis que el propio prompt ofrece —«son marcadores creados después del 31/08»— NO
explica estos tres:** los únicos creados después son los **10 `emin_*`** (03/09) y los **3
`gcba_ivr_*`**, y **ninguno entra en el conteo de «limpios el 31/08»** porque no existían.
⇒ **Queda abierto, y con la explicación barata ya descartada.**

---

## ⭐ Parte A del `2026-09-04_7` — el grupo A llegó a un resultado correcto por un camino equivocado (04/09/2026)

**Grupo A (4) — NO se tocan:** `u1_post_meta_impresiones`, `u1_post_meta_vistas`,
`u1_post_google_impresiones`, `u1_post_google_vistas`. Los cuatro tienen `X-42` `contradice` @28/08.

⭐⭐ **La marca que puso el cruce masivo del 01/09 es la CORRECTA** — y **llegó por un camino
equivocado a un resultado correcto**. ⛔ **Eso hay que escribirlo, no sólo el resultado**: el cruce
miró `MARCADORES.notas`, **no** el CSV, así que **acertó sin saber que acertaba**. Si sólo se
registra *«la marca está bien»*, la próxima vez se confía en un mecanismo que **no mira lo que
debería**.

**Grupo B (6) — se limpian**, con `limpiarGrupoB()`: una función **nueva**, no la del 26/08.

⛔ **`confirmarNumerosDeUnoAUno()` NO se re-aplica**, y ése es el punto del prompt: su lista está
**congelada el 26/08** y re-correrla limpiaría **los cuatro contradichos**.

⭐ **Y el wrapper tiene un control de alcance que la vieja no podía tener:** verifica **antes de
escribir** que los cuatro del grupo A **sigan marcados**, y **relee los dos grupos** al final. ⚠ La
garantía no es *«no los toqué»* sino ***«siguen como estaban»*** — que es lo único verificable
desde afuera.

### ⭐ `u1_fecha_fin` — limpiado por FORMA, no por comparación

**Decisión del usuario 04/09**: sale **directo de la fila POST, campo fecha fin**. Sin agregación,
sin ventana, sin criterio de corte — **no hay dónde equivocarse.**

⚠ **Y va escrito como decisión, no como validación.** `D-56` dice que la fuente de verdad es el
CSV, y **`u1_fecha_fin` no tiene caso**. Lo que sostiene su limpieza es un argumento sobre **la
forma del marcador**, que es **una razón distinta y buena, pero distinta**. ⛔ **Si alguna vez se
audita por qué está limpio, la respuesta tiene que ser la verdadera.**

---

## ⭐⭐ La pregunta que `u1_fecha_fin` deja abierta, y vale más que él (04/09/2026)

> **¿Un marcador de LECTURA DIRECTA necesita `_revisar` alguna vez?**

`_revisar` significa *«hay un número que alguien puso en duda»*. ⚠ Pero un marcador que **lee un
campo sin operar** —sin agregar, sin recortar por ventana, sin criterio de corte— **no tiene dónde
equivocarse por su cuenta**: si difiere, difiere **la fuente**, y eso es otra cosa.

⛔ **No se resuelve acá.** ⭐ **Pero si la respuesta fuera «no», una parte de las 90 marcas de hoy se
cae sola** — y ése es el motivo de anotarla: no es una curiosidad, **es un criterio que podría
achicar el problema entero.**

---

## ⛔⛔ P0 · `u1_post_meta_alcance` está LIMPIO y tiene un caso `contradice` — el fracaso caro en su forma exacta (05/09/2026)

**Medido:** `ULTIMO` sobre `alc_real`, formato **`miles`** en el snapshot del 31/08, y **NO aparece
entre los 90 con `_revisar`** del censo vivo del 04/09. ⇒ ⛔⛔ **Está limpio hoy.**

Y `X-43` (28/08) lo declara **`contradice`**: **la celda está en cero y el equipo publica 26.033.**

⇒ ⭐⭐ **Y la operación medida confirma la mecánica que `X-43` describe:** es **`ULTIMO`**, y un
`ULTIMO` sobre un cero **escrito** devuelve **cero**, no `sin_dato`. ⛔ **El deck publica un cero
limpio, sin marca de revisión, que se lee como «no alcanzamos a nadie».**

⇒ ⛔ **PARADO acá**, como el addendum manda. **No se limpia nada más hasta que se decida qué hacer
con éste** — y la decisión es del usuario, porque poner la marca cambia lo que publica una lámina.

⚠ **Por qué el cruce masivo del 01/09 no lo agarró: nunca había sido limpiado.** No está entre los
que `confirmarNumerosDeUnoAUno()` tocó, así que **no había nada que reponer** — está limpio **desde
antes**, y por eso ningún mecanismo lo miró. ⭐ **Es la falla en la dirección opuesta: no que se
marque de más, sino que FALTE marcar**, y el cruce masivo sólo puede reponer lo que alguien limpió.

---

## ⭐⭐ Un derivado no puede estar más validado que sus insumos (05/09/2026)

**Medido, y no es parecido: es identidad.**

| marcador | operación | `campo_logico` |
|---|---|---|
| `u1_post_meta_vtr` | **`PCT`** | `des_visualizaciones/des_impresiones` |
| `u1_post_meta_vistas` | `SUMA` | **`des_visualizaciones`** ⛔ `X-42` |
| `u1_post_meta_impresiones` | `SUMA` | **`des_impresiones`** ⛔ `X-42` |

⇒ ⭐ **El motor SÍ calcula el VTR**, y los tres VTR comparten el `campo_logico` **literal** —sólo
difieren en `dimensiones`—, así que **el VTR de Meta agrega exactamente las mismas filas que sus
dos operandos marcados.**

⇒ ⛔ **`u1_post_meta_vtr` y `u1_post_google_vtr` se FRENAN.** Limpiarlos publicaría sin marca **un
número construido enteramente con dos que un caso fechado dice que difieren en las dos
direcciones**.

⭐ **Es la misma forma que `L-046` con la conclusión INVERSA, y hay que aplicarla igual:** allá **un
operando malo explicaba tres números** —había un defecto, no tres—; acá **si el operando está
marcado, el derivado también**. ⚠ **La misma estructura sostiene las dos**: un derivado no tiene
vida propia respecto de sus insumos, ni para bien ni para mal.

---

## ⚠ `X-42` NO cubrió Programmatic POST — los tres `u1_post_prog_*` se limpian por AUSENCIA de medición (05/09/2026)

Los tres se limpian, y ⭐ **conviene decir por qué eso no es una inconsistencia**: `X-42` midió
**Meta y Google**, **no midió Programmatic**. ⇒ *«sin caso que la justifique»* es **literal: nadie
lo comparó.** ⛔ **No es que se haya comparado y dado bien.**

⭐ **Eso es a la vez una razón para limpiarlos** —restaura la decisión del 26/08, que es lo que el
01/09 pisó— **y un hueco declarado**: ⚠ **si Meta y Google POST se recalculan en el lugar, no hay
motivo para suponer que Programmatic no.**

⇒ **La limpieza de los tres descansa en ausencia de medición, no en una medición.** Escrito así
para que el día que alguien mida Programmatic POST **sepa que esto lo estaba esperando.**

---

## ⛔⛔ P0 · `entero` NO EXISTE como formato — y por eso no falla (05/09/2026)

**Parte 0.3 del `2026-09-04_8`, medida corriendo `formatearValorMarcador_` real sobre `541526`:**

| formato | devuelve | |
|---|---|---|
| `entero` | `541526` | ⛔ **reproduce el deck** |
| `entero_revisar` | `-541526-` | ⛔ **byte a byte** |
| `miles` | `541.526` | ⭐ |
| `miles_revisar` | `-541.526-` | ⭐ |

`formatearValorMarcador_` conoce **`porcentaje`, `porcentaje_sin_signo`, `fraccion`, `miles`,
`numero`, `texto` y `fecha`**. ⛔ **`entero` no está**, así que cae al `return String(valor)` final
(`Generador.gs:217`).

⭐⭐ **Y eso es lo grave, más que el separador: un formato inexistente NO FALLA.** Devuelve el crudo
y publica **un número correcto sin formato** — plausible, y nada en el camino lo señala. ⚠ **Es la
misma familia que el `''` de `camp_titulo` y que el `-` que no distinguía sus causas: el default
silencioso.**

⚠ **Y lo escribí yo:** al cablear ministros puse `entero_revisar` **sin verificar que `entero`
existiera**. El nombre suena bien y el motor no protesta.

⇒ **Arreglado con `formatoEmin()`** — los seis numéricos a `miles`, **conservando el sufijo que
tengan**. ⛔ El `_revisar` **no se toca**: esto es presentación, no validación, y la relectura lo
verifica explícitamente.

### ⚠ Lo que esto deja abierto y NO se arregla acá

**Un `formato` que nadie implementó debería ser visible.** Hoy cualquier nombre inventado publica el
crudo. ⭐ Un aviso en el log cuando el formato no se reconoce cuesta una línea — **pero es un cambio
de comportamiento del motor y va por su cuenta**, no colgado de un cambio de configuración.

---

## ⚠ Parte 0.1 · Las siete familias de tokens crudos — CERO filas en el snapshot (05/09/2026)

| familia | únicos en el deck | filas en `MARCADORES_2026-08-31` |
|---|---|---|
| `camp_resp_*` + `camp_tasa_resp` | 13 | **0** |
| `conv_*` | 13 | **0** |
| `rep_*` | 11 | **0** |
| `et_*` | 11 | **0** |
| `rrss_*` | 9 | **0** |
| `u1_bench_*` | 3 | **0** |
| `ecv_comuna` · `ecv_minutos` | 2 | **0** |

⇒ ⭐ **Las siete familias son «sin fila» — cableado pendiente, NO un bug de resolución.**

⚠ **Con su límite, que acá importa doble:** el snapshot es del **31/08**, tiene **220 filas y todas
`jm`**, y es **anterior a la migración a `*`**. ⇒ **Puede quedarse corto y nunca largo**: si alguna
familia ganó filas después, este cero es viejo. ⛔ **Para el número de hoy hace falta la hoja viva.**

⭐ **Y la distinción que el prompt pide no mezclar sigue en pie:** *sin fila* (13+13+11+11+9+3+2) es
**trabajo de cableado**; **`camp_titulo` en `L-023`** es **otra cosa** —tiene fila, resolvió, y
publicó `''`— y **ningún censo de crudos lo puede ver, porque no es crudo**.

⛔⛔ **Es el mismo hueco que `camp_env4_fecha}}`, dos veces:** un detector que busca `{{` no ve un
token al que le faltan las llaves de apertura, ni ve una caja que quedó vacía. ⭐ **El detector
encuentra lo que se parece a lo que ya conoce.**
