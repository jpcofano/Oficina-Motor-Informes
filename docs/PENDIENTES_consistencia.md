
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
