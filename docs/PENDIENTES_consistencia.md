
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
