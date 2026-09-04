# PLAN — decisiones, próximo, bloqueado, backlog

**Estado:** vivo · **Creado:** 2026-08-01 (`DOC-6` Parte C) · **Ubicación:** `docs/PLAN.md`

> **Regla de este archivo: una entrada es una línea o un párrafo corto.** Si necesita más,
> el detalle va a `docs/BITACORA.md` y acá queda el puntero. Un plan que hay que leer
> entero para saber qué sigue deja de usarse.
>
> **Dónde va cada cosa** — la frontera entre las tres secciones de futuro es lo que hace
> que el archivo sirva:
>
> | sección | qué la define |
> |---|---|
> | **Próximo** | lista **ordenada**, con las dependencias dichas |
> | **Planificado y bloqueado** | cada ítem nombra **qué lo destraba y de quién depende** |
> | **Backlog** | sin orden y sin fecha |
>
> La prueba para saber en cuál va algo: **si no podés decir qué lo desbloquea, es backlog.**

### Cuatro notas de método, antes de escribir acá

**1 · Las cifras que aporta claude.ai desde afuera del repo son estimaciones hasta que un
script las reproduzca.** Casos: 18 huérfanas eran **20**, ~8.100 líneas eran **8.410**, ~34
ítems de menú eran **36**, 37 `getUi()` eran **40**, ~20 citas en `BITACORA.md` eran **34**.
Ninguna estuvo mal por mucho: estuvieron **presentadas con más precisión de la que tenían**.
Una cifra con tilde de aproximación se puede usar; una redonda que se lee como medida, no.

**2 · Toda cita a un `D-`, `R-`, `S-` o `archivo:línea` se verifica contra el destino antes
de escribirla.** La advertencia de greppear el prefijo (§1) cubre **asignar** un ID nuevo;
ésta cubre el otro lado, que es **citar** uno existente. Casos: `D-05`→`D-09` (era `D-11`) y
`D-09`→`R-02` (era `R-04`), los dos en el texto de origen de la Parte C — y el segundo,
un commit después de que la Parte B cerrara las otras tres apariciones de esa misma
numeración vieja.

**3 · Una predicción numérica declara su unidad.** El `Paso-2.12` Parte 2 se predijo en
`cambiadas: 15` y la corrida dio **30**: son las mismas 15 filas × 2 columnas
(`uso` + `notas`). La predicción contaba **filas**, el diff cuenta **celdas**. No fue
desviación —el resultado era el esperado— pero una predicción y una medición en unidades
distintas no se pueden comparar, que es para lo que sirve predecir. **El diff de
configuración cuenta celdas**: predecir en celdas, o decir explícitamente "N filas × M
columnas".

**4 · Una nota nunca nombra un ID que todavía no se asignó.** Escribir "sería un `D-15` que
cite a ésta" promete que ese número va a seguir libre hasta que alguien lo necesite para
eso. No lo estuvo ni un día: la nota bajo `D-02` lo escribió el 02/08/2026 y `D-15` se
asignó esa misma tarde a la autenticación del panel, que no supersede nada. Un ID futuro se
nombra por lo que sería —"una decisión nueva que cite a ésta"— y recién lleva número cuando
se escribe. Cubre el hueco entre las otras dos: la nota 2 cubre **citar** un ID existente y
`§1` cubre **asignar** uno nuevo; ninguna cubría **anunciar** uno.

---

## 1 · Decisiones de arquitectura

> **Dueño de "¿arquitectura, esquema, decisión estructural?"** (`CLAUDE.md` §7) desde el
> 01/08/2026: heredó la pregunta de `Plan Inicial/PROYECTO.md` §1–§6/§8 al congelarlo
> (`DOC-6` Parte E). Una decisión estructural nueva **nace como `D-NN`**; no se edita un
> documento maestro.

IDs `D-NN`, **estables, nunca se reutilizan**. Una decisión no se edita: se **supersede**
con una nueva que la cita. Mismo criterio que `R-` de `docs/REGLAS_NEGOCIO.md` y `S-` de
`docs/SUPUESTOS.md` — y misma advertencia: antes de asignar un `D-NN` nuevo, greppear el
prefijo en todo el repo, que es exactamente lo que no se hizo con los `R-` y costó tres
notas de equivalencia (`REGLAS_NEGOCIO.md`, nota de renumeración). Para **citar** un ID ya
existente, ver la nota de método 2 del encabezado.

**`D-01` — La extensibilidad es una métrica, no una puerta.**
El objetivo final es agregar un informe o una base sin tocar `.gs`. No es criterio de
aceptación hoy. Cada vez que se agrega uno, se anota **qué código hubo que tocar y por
qué**; esa lista de "por qué" es la hoja de ruta hacia el objetivo. El número baja o no
baja, y eso se ve.

> **Nota del 03/08/2026 — decisión del usuario. No altera el texto de arriba: lo
> confirma y lo cierra.** No tocar código al agregar un informe o una base es un
> **deseable, no un requisito**. Se mide y se anota, y con eso alcanza: **no bloquea un
> paso, no obliga a rediseñar y no es motivo para reabrir un diseño ya elegido**. Se
> escribe porque la lectura contraria apareció en la práctica —un paso que se detiene a
> discutir arquitectura porque la medición dio distinta de cero—, y porque `D-01` decía
> *"no es criterio de aceptación **hoy**"*, lo que dejaba abierto que algún día sí. No lo
> va a ser. El `Paso-3-v3` ya lo dice con estas palabras en "Decisiones ya tomadas".

**`D-02` — Dos cuentas, dos roles.**
`reporteseinformesgcba` ejecuta el motor; `jpcofanogcba1` es dueño del script y de la
planilla de control. **Consecuencia dura:** un script *bound* corre con la identidad de
quien toca el menú, así que `reporteseinformesgcba` necesita lectura sobre las cuatro
bases. Hoy la cuenta que pasa esa barrera es `jpcofanogcba1` (`BITACORA.md:708`). Dos bases
son de terceros, así que el pedido tiene demora y arranca ya.

> **Premisa corregida (02/08/2026), la decisión no cambia.** *"Dos bases son de terceros,
> así que el pedido tiene demora"* es falso: **las cuatro son cuentas del usuario** y se
> comparten sin depender de nadie. Lo que se decide en `D-02` —qué cuenta ejecuta y qué
> cuenta es dueña— sigue igual; lo que se cae es que el acceso sea un bloqueo externo. Se
> corrige con nota y no editando el texto, que es el criterio de `D-NN`: una decisión no se
> reescribe. Si además hiciera falta cambiar *la decisión*, haría falta una decisión nueva
> que cite a ésta.
>
> *(Addendum 02/08/2026, mismo día: esta nota decía "sería un `D-15` que cite a ésta". `D-15`
> se asignó horas después a la autenticación del panel, que no supersede nada. Nombrar un ID
> futuro es prometer que va a seguir libre — ver la nota de método 4 del encabezado.)*

**`D-03` — Reportes es dueño de todo lo que un humano abre.**
Plantillas (ya lo es) y salidas. `carpeta_salida` apunta hoy a una carpeta de
`jpcofanogcba1` y está sin usar: se repunta antes de que el Paso 4 genere el primer deck.
`jpcofanogcba1` es dueño del motor, nada más.

**`D-04` — El panel es web app (`doGet`), no barra lateral.**
Un script bound a la planilla de control no puede abrir una barra lateral dentro de una
presentación. Una sola superficie HTML, alcanzable desde un link en cualquier lado,
incluida la lámina.

**`D-05` — Corridas a demanda.**
No hay generación programada del informe. Lo único que tiene sentido programado es el
chequeo previo de `D-11`.

**`D-06` — Generación en dos etapas.**
*Etapa 1 (ahora):* copia de plantilla, reemplazo de tokens, deck nuevo por corrida, **y se
guarda la configuración con la que se armó**. *Etapa 2 (bloqueada):* actualizar el mismo
deck respetando lo escrito a mano. Reemplazar por búsqueda de texto sólo funciona una vez
—cuando `{{ecv_total}}` pasa a ser "1.234", el token deja de existir—, así que la etapa 2
exige escribir por `objectId` y por lo tanto el mapa `token → objectId` que la etapa 1
registra al crear el deck.

**`D-07` — La configuración de una corrida es un insumo editable, no un log.**
Se abre, se agrega una reunión, se vuelve a correr. El registro de qué valores tomó cada
token es otra cosa (traza) y se deriva de ésta, no al revés.

**`D-08` — La curaduría se guarda por período.**
`CAMPANAS` y `REUNIONES` ganan `periodo_id` como clave foránea a `PERIODOS`. Hoy no la
tienen y el propio código las declara *"curada a mano, cambia cada semana"*
(`Instalar.gs:1965`): sin clave de período, la curaduría de esta semana pisa la anterior y
volver a correr un período pasado devuelve otro resultado, sin fallar y sin avisar.
`ESCRITORES.md` confirma que `CAMPANAS` tiene **cero escritores**, así que el cambio no
toca código.

**`D-09` — Régimen de selección declarado por sección, no por informe.**
Hay dos regímenes conviviendo: **por período** (la fila entra si su fecha cae en la
ventana) y **por temario** (el universo lo define una lista curada y la fecha no decide —
`R-04`). JM tiene los dos: reuniones por temario, `m2_*` por ventana. El régimen se deriva
de `SECCIONES.itera` — si la sección itera sobre una hoja curada, su universo sale de ahí.
El caso **mixto** (curada y además con ventana propia, que es lo que hace `CAMPANAS` con
`desde`/`hasta`) queda nombrado, no como excepción tácita. `MAPEO`/`modo_periodo` sólo
aplica a las secciones de período.

**`D-10` — Cuando al motor le falta una definición, pregunta, guarda la respuesta y no
vuelve a preguntar.**
Es viable porque no hay corridas desatendidas (`D-05`). La respuesta se persiste en
`SECCIONES`; si vive sólo en el momento de la corrida, la misma sección puede salir por
temario esta semana y por período la próxima sin dejar rastro. Mismo criterio que
`«FALTA»` —no romper, exponer— pero para configuración en vez de datos.

**`D-11` — Chequeo previo de estructura antes de correr.**
Cada fila de `MAPEO` tiene que resolver contra una columna que existe hoy en la base viva.
Las bases son de terceros y cambian sin aviso. Precondición: arreglar antes el P2 de
`Fuentes.gs:117` (`getSheets()` crudo sin `usoSolapa_()`), o el chequeo va a avisar sobre
solapas marcadas `ignorar`.

**`D-12` — Hoja `FALTANTES`, se pisa en cada corrida.**
Los `«FALTA:token»` quedan hoy en la lámina y nadie los agrega. Hoja en la planilla de
control con base, solapa y campo, para atacarlos de a uno. Sin historial por ahora.

**`D-13` — Los números congelados se comparan contra un período cerrado, no contra la
semana viva.**
Las métricas derivan legítimamente: en M2, aperturas y clics siguen creciendo después del
envío y sólo `Enviados` se congela. Un control que grita todas las semanas se ignora en
tres. Se construye en el Paso 4, y el insumo es la configuración guardada de `D-06`.

**`D-14` — Orden del plan: motor → panel → automatización.**
La dependencia es dura, no heredada: la selección de campañas es curada a mano porque los
nombres son inconsistentes entre fuentes, así que una corrida programada no puede decidir
qué campañas entran. La automatización depende del panel; el panel no depende de la
automatización.

> **Dos correcciones de referencia al transcribir (`DOC-6` Parte C, 01/08/2026).** El texto
> de origen citaba `D-09` en `D-05` donde corresponde `D-11` (el chequeo previo), y `R-02`
> en `D-09` donde corresponde **`R-04`** ("El temario define el universo, no la fecha";
> `R-02` es "Criterio de fuente cruda"). La segunda es la **cuarta aparición** de la
> numeración vieja de `R-04`, que se documentó primero como `R-02` en su prompt de origen —
> las otras tres las cerró la Parte B de este mismo prompt. Se escriben acá los IDs del
> canon; el enunciado de las decisiones no cambió.

**`D-15` — El panel se despliega como "ejecuta el usuario que accede".**
La web app de `D-04` va con *Ejecutar como: el usuario que accede* y acceso a cualquiera
con cuenta de Google. Google exige login antes de que corra el código, así que
`Session.getActiveUser().getEmail()` devuelve identidad confiable y se filtra contra lista
blanca. De las tres opciones evaluadas es la única que combina **identidad con lista
blanca**: con *ejecutar como: yo* sobre cuentas Gmail personales, `getActiveUser()` suele
volver vacío y el filtro deja de servir. Consistente con `D-02` —el motor corre con la
identidad de quien lo dispara, que es por qué las bases se comparten con
`reporteseinformesgcba`— y **acoplada** a ella: si alguna vez se pasara a *ejecutar como:
yo*, las bases dejarían de necesitar compartirse y `D-02` cambiaría de sentido. No son
decisiones independientes.
Esta decisión tiene una **precondición verificable, y vive en `§2` Tramo 4** como primer
ítem, no acá: una precondición escondida adentro de la decisión que la motiva no se
ejecuta.

**`D-16` — Cada usuario accede sólo a sus informes y a sus datos.**
Distintos grupos ven distintas selecciones de informes desde la **misma** web app: el
permiso es por informe, no por URL — URLs distintas por grupo serían apps que divergen.
Tres piezas, y la tercera es la que hay que resolver:
1. La lista de accesos sale de una **hoja**, no del código. Hoy `API_AUTORIZADOS_` está
   cableada en `Api.gs:29` y editarla exige tocar `.gs`, que es lo contrario de `D-01`. Va
   a una hoja (mail × `informe_id` × rol) que el motor lee como lee el resto.
2. El panel filtra qué informes ofrece según esa hoja.
3. **Sin resolver — el acceso al dato, no al panel.** Filtrar la selección del panel no
   alcanza: un informe generado es un archivo de Slides con permisos propios de Drive, y
   las bases son planillas con los suyos. Si el usuario abre el deck directo, o si el motor
   corre con su identidad (`D-15`) y necesita leer bases que él no debería ver, el control
   del panel no interviene. Hay que definir cómo se sostiene la restricción end-to-end:
   quién comparte cada salida y con quién, si el motor lo hace según la hoja de accesos, y
   qué pasa cuando alguien puede ver un informe pero no la base de la que sale. **No hay
   solución elegida — es trabajo de diseño, no de implementación.**

**`D-17` — El dueño de `MARCADORES` es la plantilla, no el código.**
Las filas se siembran leyendo los `{{token}}` de las plantillas de Slides
(`sembrarMarcadoresDesdePlantillas` + `upsertSoloVacias_`, `Paso-2.5`). **`SEED_MARCADORES_`
no se hace**, y con eso se cierra la Parte 1 del `Paso-2.13`.

**Por qué, y es `D-01` en su forma más directa:** con el seed en código, agregar un informe
exige editar un `.gs`. Ese es exactamente el número que `D-01` mide y quiere bajar, y acá se
podía evitar antes de contraerlo. La plantilla **ya es** la fuente de verdad de qué tokens
existen —si un token no está en la lámina no hay nada que reemplazar—, así que un seed en
código sería una segunda copia de un dato que ya vive en otro lado, con el ciclo de
divergencia que este proyecto conoce de memoria.

**La idempotencia no se pierde:** la da `upsertSoloVacias_`, que sólo completa celdas
vacías y nunca pisa lo que una persona configuró. Era el argumento fuerte a favor del seed
—"el seed es reproducible"— y queda cubierto sin el seed.

Cierra el `P1` de `docs/PENDIENTES_consistencia.md` sobre los dos dueños de `MARCADORES`,
que era el bloqueo del `Paso-2.5` y del `Paso-2.13`.

> **Nota — `upsertSoloVacias_` da idempotencia, no auditabilidad.** Un seed permite un diff
> contra un **estado declarado**; `upsertSoloVacias_` sólo garantiza **no pisar**. La
> pregunta *"¿qué debería decir `MARCADORES` hoy?"* se responde con la plantilla, no con una
> tabla en código — coherente con esta decisión, pero **la auditoría toma otra forma**:
> re-correr el helper y mirar el reporte de huérfanas, no comparar contra un `SEED_`.
> Consecuencia a resolver cuando `MARCADORES` tenga filas reales.

**`D-18` — Los terceros acceden por el panel, nunca por la planilla de control.**
El motor es **invisible** para el usuario final. `reporteseinformesgcba` ejecuta el motor y
tiene compartidas las cuatro bases (`D-02`); cualquier otra persona accede **únicamente** por
la web app del panel (`D-15`), nunca abriendo la planilla de control. La cuenta de prueba
externa está registrada en `docs/ENTORNO.local.md`, que es el dueño de "con qué cuenta"
(`CLAUDE.md` §7) y vive fuera de git.

**Razón:** la planilla de control **es la superficie de configuración**. Compartirla da acceso
de edición a `BASES`, `MAPEO`, `CONFIG` y el resto de los registros. Y el motor **no puede
generarle una planilla de control propia a cada usuario**: el script está *bound* a esa
planilla, así que una copia sería un **segundo script que diverge** — contra la regla de que
el código vive en un solo lugar.

**Lo que sí se comparte con terceros son las salidas.** El motor crea el deck en la carpeta
de reportes (`D-03`) y lo comparte con quien corresponda según la hoja de accesos (`D-16`).
Un tercero abre su informe **sin tener acceso a ninguna base**.

**Corolario — no se copia código a mano a ninguna cuenta.** Si el panel necesita algo nuevo,
va al script del motor —versionado con `clasp` y git— y se expone por la web app. Un `.gs`
copiado a otra cuenta es un **segundo script sin versionar**, que es el mismo problema que
`D-15`/`D-16` resuelven del lado del acceso.

**`D-19` — Una fila sin `periodo_id` no entra a ningún informe.**
En `CAMPANAS` y `REUNIONES`, `periodo_id` vacío significa **"no está asignada a ningún
período"**, no "asignada al vigente". El motor **no completa el período faltante**: ni lo
asume, ni lo deduce de la fecha de la fila. Vale para las diez filas que ya existían al
02/08/2026 —quedaron vacías a propósito— y para toda fila futura.

**Razón, y es la que hace que no haya alternativa:** con `R-11` Addendum 1, las ventanas de
período **pueden solaparse o dejar hueco**. Entonces la fecha de una fila **no determina** a
qué período pertenece: dos períodos pueden contenerla, o ninguno. Deducirlo sería inventar.
Es el mismo principio que `D-10` — cuando falta una definición, el motor no la fabrica.

**Corolario en el escritor:** `cargarTemario(texto, periodoId)` **falla explícito** si el
período falta o no existe en `PERIODOS`, en vez de escribir la fila con la celda vacía. Una
fila vacía escrita por descuido es indistinguible de una vacía a propósito, y ésa es
justamente la ambigüedad que `D-08` vino a cerrar.

**Lo que esta decisión NO define:** qué hace el motor al *leer* — filtrar por período es de
los Pasos 3 y 5 (`Paso-2.15` B.5). Acá sólo queda establecido el significado del vacío.

> **Nota del 02/08/2026, agregada al escribir `D-20`** (no altera nada de arriba): **el
> vacío de `D-19` y el de `D-20` son opuestos y no se unifican.** Una **fila** de
> `CAMPANAS`/`REUNIONES` sin `periodo_id` **no entra a ningún informe**. Una **sección** sin
> período **sí entra**: usa el default. La diferencia no es un descuido — una fila sin
> período es un dato del que no se sabe a qué semana pertenece; una sección sin período es
> una sección que no necesita ventana propia, que es el caso normal.

**`D-20` — El período se configura por sección.**
Cada sección de un informe puede tener **su propia ventana**. Si no la tiene, se usa el
default de `R-11` —la semana, siete días de viernes a jueves— o lo que el usuario haya
cargado. Decisión del usuario, 02/08/2026.

Es **un escalón más en la cadena que ya resuelve `resolverVentana()`**, no un mecanismo
nuevo: `campaña > sección > periodo_ref > CONFIG`. Hoy esa cadena existe sin el eslabón del
medio (`Fuentes.gs`), y el período sólo se puede declarar por marcador
(`MARCADORES.periodo_ref`) o por campaña.

**Consecuencia estructural, y hay que respetarla en ese orden:** `SECCIONES` gana una
columna de período, y le aplica lo mismo que a `CAMPANAS` y `REUNIONES` en el `Paso-2.15`.
Está entre las **siete hojas sin `COLUMNAS_DELTA_`**, así que **entra al delta antes de que
nadie le toque los `headers`**. Al revés, la rama sin delta reescribe la fila 1 con los
encabezados nuevos sin mover los datos, sobre una hoja de 35 filas curadas: mismo modo de
falla que midió el `Paso-2.15` en su punto 0.2.

**Relación con `D-19` — son opuestas a propósito.** Una sección sin período **no** es una
sección sin datos: es una sección que usa el default. Es la regla **contraria** a la de las
filas de `CAMPANAS`/`REUNIONES` sin `periodo_id`, que no entran a ningún informe. Está dicho
en las dos decisiones para que nadie las unifique por parecerse.

**Lo que esta decisión NO cierra, y es diseño del Paso 3:**

- **Dónde entra exactamente la sección respecto de la campaña.**
- La cadena como está escrita pone la sección **por encima de
  `MARCADORES.periodo_ref`**, que hoy es el mecanismo más fino que existe. Si se confirma
  así, una sección con ventana propia le gana a un marcador que declare la suya. Conviene
  resolverlo explícito en el Paso 3 y no descubrirlo con un número raro.
- **No se implementa acá.** Es del Paso 3, junto con el cálculo del default de `R-11`, que
  hoy tampoco existe: si `CONFIG` está vacío, `resolverVentana()` devuelve error, no una
  semana.

> **Addendum 1 a `D-20` — 02/08/2026, decisión del usuario.** El texto de arriba no se
> altera; esto lo corrige y lo completa el mismo día.
>
> **1 · La cadena de arriba quedó incompleta y con un eslabón fuera de lugar.** La correcta
> tiene **cinco** eslabones:
>
> ```
> campaña > marcador (periodo_ref) > SECCIONES.periodo_ref > CONFIG > semana R-11
>    ya      ya                       falta la columna       ya      falta el cálculo
> ```
>
> Dos correcciones concretas sobre lo escrito arriba:
>
> - **`MARCADORES.periodo_ref` va POR ENCIMA de la sección, no por debajo.** El criterio es
>   **de más específico a más general**, y un marcador puntual es más específico que la
>   sección que lo contiene. La cadena de cuatro eslabones del texto original lo tenía al
>   revés.
> - **El default de `R-11` es el último eslabón de la cadena, no una nota al margen.** Es lo
>   que `resolverVentana()` **responde** cuando no encontró nada cargado, no un
>   comportamiento aparte que viva en otro lado. Hoy, en ese lugar, la función devuelve
>   error.
>
> **2 · Quedan cerradas las dos posiciones que el texto de arriba mandaba al Paso 3.**
> Marcador vs. sección: **gana el marcador**. Sección vs. campaña: **la campaña va primero**,
> como ya está en el código y en la cadena. **El Paso 3 no decide ninguna de las dos: las
> implementa.**
>
> **3 · El único caso que la cadena no cubre con un criterio explícito, anotado y no
> resuelto:** un marcador con `periodo_ref` propio **dentro de un bloque de campaña**. Hoy
> **gana la campaña**, porque es como está escrito el código —`resolverVentana()` mira
> `opciones.campana` primero y devuelve sin evaluar el resto—, no porque se haya decidido.
> Se deja así. Si alguna vez molesta, va a aparecer como **un número que no cierra**, y ahí
> se decide con un caso real a la vista en vez de en abstracto.

> **Nota del 20/08/2026 — el eslabón 5 cambió de contenido, no de lugar.** `D-20` **no se edita**
> y esto no la supersede: la cadena sigue teniendo los mismos cinco eslabones, en el mismo orden,
> y el quinto sigue siendo *la semana de `R-11`*. Lo que cambió es **cuál** semana devuelve — pasa
> de la que **contiene** a la fecha de corrida a **la última cerrada** (decisión del usuario,
> `2026-08-20_2`). **Eso no es una decisión de arquitectura y por eso no vive acá**: es una regla
> del dominio, y su dueño es `docs/REGLAS_NEGOCIO.md`, `R-11` **Addendum 2** (`CLAUDE.md` §7).
> Esta nota es el puntero, no el contenido.

> ⚠ **Y el eslabón 5 dejó de ser teórico el 20/08**, que es lo que hay que saber para leer el resto
> del plan: `CONFIG.periodo_desde`/`periodo_hasta` **se vaciaron** ese día por decisión del usuario,
> así que el eslabón 4 ya no corta antes y **la cadena llega al 5 en cada corrida sin `periodo_id`**.
> El texto de arriba dice *"hoy, en ese lugar, la función devuelve error"*: eso dejó de ser cierto el
> 17/08, cuando el eslabón 5 se implementó.

**`D-21` — Las filas se excluyen por lista blanca declarada, nunca por exclusión.**
Una columna puede declarar en `MAPEO.valores_incluidos` **qué valores entran**; toda fila
cuyo valor no esté en esa lista queda afuera. Decisión del usuario, 02/08/2026, aplicada
por primera vez en el `Paso-2.16` sobre `digital/Directa Mail` (entran `Implementado` y
`En curso`).

**Por qué lista blanca y no exclusión:** con "todo lo que no sea `Proyectado`", un estado
nuevo en la base **entra solo y en silencio**. Con lista blanca, un valor nuevo **queda
afuera y visible** — es la misma dirección que el resto del motor, donde lo que no está
declarado no se usa.

**Forma:** valores separados por coma (misma convención que `INFORMES.familias` y
`SECCIONES.informes`), comparados con espacios colapsados y **sin plegar mayúsculas ni
acentos** (`R-10`). Varias columnas con lista blanca en la misma solapa se combinan con Y.
Si la coma parece parte de un valor y no un separador —la celda entera coincide con un
valor real de la columna y alguno de los pedazos no—, **el motor para y avisa** en vez de
filtrar de menos.

**Nada se excluye en silencio.** La lectura reporta `filas_excluidas_por_valor`, el desglose
`excluidas_por_valor` y `valores_declarados_sin_filas` — este último caza el tipeo
(`Implementadoo`), que si no se manifiesta como filas que faltan en el informe.

**Tercer significado del vacío, y no se unifica con los otros dos.** Ya hay tres reglas
distintas sobre una celda vacía, a propósito:

| dónde | vacío significa |
|---|---|
| `CAMPANAS`/`REUNIONES`.`periodo_id` (`D-19`) | la fila **no entra** a ningún informe |
| `SECCIONES`.período (`D-20`) | la sección **usa el default** de `R-11` |
| `MAPEO`.`valores_incluidos` (`D-21`) | **no hay filtro**: entran todas las filas |

Son tres respuestas distintas porque son tres preguntas distintas. Unificarlas rompería
las tres.

**Lo que esta decisión deja abierto, y es del Paso 3:** con este diseño **declarar es
conectar** — `leerFuente` aplica toda lista blanca que encuentre. Por eso el plan de
declarar `rdv/status = Realizada` "sin consumidor" **no se pudo ejecutar**: cargarlo
cambiaría en el acto lo que ve *cualquier* lectura de `rdv`, no sólo el matcher de
`Union.gs` —que ya filtra por su cuenta con `VALOR_STATUS_REALIZADA_` hardcodeado—. La
celda quedó **vacía** y la migración del filtro de `Union.gs` sigue siendo del Paso 3, con
sus controles a mano.

**Prueba disponible ya, antes del panel:** compartirle un deck de salida a la cuenta de
prueba y confirmar que lo abre **sin acceso a ninguna base**. Es **la mitad de `D-16` que no
depende del panel**, y se puede correr en cuanto el Paso 4 genere el primer deck.

> **Addendum 1 a `D-21` — 03/08/2026, decisión del usuario.** El texto de arriba no se
> altera. Lo que cambia es el estado del último párrafo: **`rdv/status = Realizada` quedó
> declarado**, y esta vez con el impacto medido de los dos lados.
>
> **1 · Se pudo medir, y el instrumento faltaba.** El `Paso-2.16` reportó que no se podía
> medir por API porque `leerFuente` no acepta una ventana por JSON —espera dos `Date` y
> `Utilities.formatDate` rechaza strings—. El diagnóstico era correcto y la conclusión no:
> `probarLecturaPeriodo()` ya resolvía la ventana adentro. Lo que fallaba era **el tamaño de
> la respuesta**: recorre las cuatro bases y devuelve `filas` completo, y sobre `/dev` esa
> respuesta no vuelve —contesta 404 o la página de login con HTTP 200, el mismo síntoma que
> un token vencido—. `contarLecturaBase_(baseId)` (`Fuentes.gs`) devuelve los mismos conteos
> de **una** base y sin las filas, y responde en cinco segundos.
>
> **2 · Los números, ventana de `CONFIG` 26/06 → 03/07.** Antes: `filas_totales` **1362**,
> `filas_en_ventana` **16**, `filas_excluidas_por_valor` **0**. Después: `filas_totales`
> **1362** —el invariante del `Paso-2.9` Parte B se sostiene—, `filas_en_ventana` **13**,
> `filas_excluidas_por_valor` **709**: vacío 642, `Suspendida` 58, `en agenda` 6,
> `Reprogramada` 2, `Se modifico el barrio` 1. Entran **653 de 1362**.
> `valores_declarados_sin_filas` vacío, así que `Realizada` no es un tipeo.
>
> **3 · Un efecto de segundo orden que conviene no confundir con un arreglo:**
> `filas_sin_fecha` pasó de **642 a 0**. No se llenó ninguna fecha — las 642 filas vacías
> ahora quedan afuera por valor **antes** de llegar al bucle de fechas, así que dejan de
> contarse ahí. `filas_vacias` sigue en 642, que es donde se siguen viendo.
>
> **4 · Quién ve la lista y quién no.** Por `leerFuente` la ven el matcher
> (`buscarEncuentroDelDia_`, `Union.gs`) —que **ya filtraba por su cuenta** con
> `VALOR_STATUS_REALIZADA_` cableado, así que ahora filtra dos veces por lo mismo y el
> resultado no cambia— y dos diagnósticos. **No la ve `verificarPrecondicionAnclaje_`**, que
> lee la solapa con `getDataRange()` directo: cuenta duplicados de `R-01` sobre filas que el
> matcher nunca va a mirar. Es la asimetría a resolver en el paso del matcher, junto con el
> retiro de `VALOR_STATUS_REALIZADA_`.
>
> **5 · El valor puede estar desactualizado y se revisa después** (decisión del usuario). Si
> alguna vez hay que sumar `En agenda`, ojo con cómo está escrito: en la base vivo aparece
> como **`en agenda`, en minúscula**, y `R-10` compara **sin plegar mayúsculas**. Declararlo
> con la capitalización equivocada excluiría esas 6 filas en silencio — el caso que
> `valores_declarados_sin_filas` está para cazar.

---

**`D-22` — Toda tabla de una plantilla es de filas fijas: el motor lee tablas y no sabe
agregarles filas.** (07/08/2026)

El motor **lee** tablas: `piezasDeTextoDeSlide_` (`Armonizar.gs`) baja a `TABLE` celda por
celda, y por eso los tokens de adentro de una tabla se mapean y se pintan igual que los de
una caja suelta. **Escribir estructura es otra cosa, y no existe:** no hay una sola llamada
de inserción de filas de Slides en el repo —`appendRow` e `insertColumnBefore` aparecen
cuatro veces y las cuatro son de **Sheets**—. El único verbo que el motor le aplica a una
tabla es `getCell(f, c).getText()`.

**Lo medido, 07/08/2026, sobre las dos plantillas vivas:**

| plantilla | láminas con tabla | tablas | la más grande |
|---|---|---|---|
| `jm` | 6 de 22 (5, 7, 17, 18, 19, 21) | 7 | 7×9 en la 18 |
| `secco` | 5 de 29 (5, 10, 21, 22, 23) | 5 | 7×9 en la 22 |

Y las ranuras están **cableadas por índice en el nombre del token**: `camp1`…`camp4` en la
lámina 7 de `jm`, `camp_env1_*`…`camp_env5_*` en la 18, `post_camp1`…`post_camp3` en la 10
de `secco`. El índice no es decorativo: **es** la fila.

**La consecuencia, de los dos lados:** una fila de más **no entra** —el quinto ítem no tiene
dónde escribirse y desaparece en silencio— y una de menos **queda como `«FALTA:token»`** en
el deck, con su fila en `FALTANTES`. El segundo caso es ruidoso y se ve; **el primero es el
caro**, porque un deck con cuatro campañas de cinco se lee como un deck correcto.

**Qué NO decide esta decisión:** no dice que haya que implementar inserción de filas. Dice
que hoy no existe, que toda tabla es de filas fijas, y que cualquier lámina que prometa "y si
hay más, se repite" está prometiendo una capacidad que el motor no tiene. El sub-paso que la
construiría es `T2.10` (§2), y **no está aprobado**.

---

**`D-23` — La identidad de una lámina se declara en el deck, en las notas del orador, y la
escribe el motor.** (07/08/2026)

Dos campos, anexados a las notas del orador de cada lámina de la plantilla:

- **`#seccion: <seccion_id>`** — a qué sección pertenece.
- **`#lamina: L-NNN`** — **id global, opaco, asignado una vez y nunca reasignado.** Global y
  no derivado de la sección **a propósito**: el sistema existe para poder **reclasificar** una
  lámina, y un id que contiene el `seccion_id` queda mintiendo el día que la lámina cambia de
  sección — y entonces alguien lo edita, y un id que se edita deja de ser un id. Misma regla
  que los `D-NN` y `R-NN` de este repo.

**El segundo campo se escribe, y hay número que lo obliga:** `campana` reclama **ocho**
láminas en las dos plantillas (12–19 en `jm`, 16–23 en `secco`) y `m2` reclama dos en `jm`
(9 y 10). Con una sola sección por lámina no alcanza para distinguirlas.

**Anexar, nunca reemplazar.** Dos láminas de `secco` ya tienen notas escritas por el equipo
—la 8 (285 caracteres de antecedentes de una temática) y la 25 (267 sobre conversación en
X)—, y la 8 es además una de las ambiguas. El motor **agrega una línea**; jamás hace `setText`
sobre las notas. El día que el equipo deje de usarlas, esto sigue siendo correcto.

**La unidad de emisión pasa a ser la lámina; la sección queda como agrupación conceptual.**
Hoy una sección conceptual puede tener **una lámina agregada y otras que repiten**, y
expresarlo obligó a partir `encuentro` en dos filas, enumerar diez tokens exactos en
`familia_tokens` y agregar `curarSecciones_` para poder corregir un campo. Entonces:

- La lámina puede declarar `modo`, `itera_sobre` y `filtro` propios.
- **Precedencia, y es herencia, no conflicto**: celda vacía en la lámina = hereda de su
  sección; celda con valor = manda la lámina. Vale la misma convención que ya usa
  `MARCADORES.solapa`, donde vacío significa inferir. **No es el caso de "hojas de registro:
  estado, no verdad"**: ahí dos fuentes describen lo mismo y discrepar es un hallazgo; acá la
  sección declara el default y la lámina la excepción, y sólo una de las dos habla por celda.
- **Identidad y estado propio no se heredan nunca**: `seccion_id`, `escondida` y `origen` son
  de la lámina y de nadie más.

**Las tres columnas no se pisan, y el régimen de selección ya está decidido en `D-09` — esta
decisión lo cita, no lo reescribe:**

| columna | qué decide |
|---|---|
| `itera_sobre` | **qué universo** se recorre — es donde vive el régimen de `D-09`, por período o por temario |
| `filtro` | **qué se acota adentro** de ese universo (hoy el único caso es `etapa=post`) |
| `modo` | **cuántas veces** se emite la lámina |

La herencia por celda vacía vale para las tres igual.

**Por qué no contradice `D-01`.** Lo que va al deck es **identidad**, no un valor de negocio.
`modo`, `itera_sobre` y `filtro` siguen viviendo en hojas de registro — cambian de fila, no de
lugar. Cambiar qué muestra una lámina sigue sin exigir tocar el Slides.

**Qué cierra de `Paso-5-v2`, sin superseder nada.** Ese prompt dejó una condicional —*preferir
la hoja de registro sobre la marca en la plantilla, salvo que se muestre que ya hay marcas
puestas*—. Esta decisión **cierra esa condicional** con los números de abajo. Un prompt
ejecutado no se edita y no es dueño de una decisión de arquitectura (`CLAUDE.md` §7): se lo
cita, no se lo supersede.

**Qué se descarta, con la razón medida al lado:**

| descartado | por qué |
|---|---|
| la sintaxis `{{…}}` para el ancla | **`presentacion.replaceAllText` alcanza las notas del orador** (medido 07/08: 2 ocurrencias contra 1 de `slide.replaceAllText`, que sólo llega al cuerpo). La barrida de faltantes de `Generador.gs` convertiría un `{{lamina}}` de las notas en `«FALTA:lamina»` **en el deck publicado**. Por eso el ancla usa `#campo:` y no llaves |
| alt text para identidad de **elemento** | **`TableCell` no expone `setDescription` ni `setTitle`** (medido sobre la plantilla viva): la propiedad existe sólo en el `PageElement` tabla completa, y los tokens viven dentro de celdas. Además `D-17` siembra `MARCADORES` leyendo los `{{token}}` de la plantilla: mover la identidad al alt text cortaría esa cadena |
| caja de texto invisible en la lámina | el equipo la arrastra o la borra y el síntoma aparece lejos |
| un ID único **global por elemento** replicado en copias | `duplicate()` lo replica en cada copia de una sección repetible. El `#lamina:` no cae en esto: las copias **son** la misma lámina modelo instanciada por ítem, y heredarlo es correcto |
| `objectId` como ancla persistente | **no hay garantía documentada**: Google documenta la preservación de `objectId` al copiar el archivo entero con la Drive API, no como propiedad general de una presentación editada. La razón **no** es que el equipo edite la plantilla — bajo esta decisión ya no la edita |
| guardar el **número** de lámina | es lo que hoy hace `LAMINAS_CONGELADAS_` y lo que se rompe al insertar una lámina antes. El número se **reporta** en cada corrida; no se guarda |

**Regla que sale del primer descarte, y es regla y no hecho:** toda entrada de renombre pasa
el token **envuelto en llaves**. Hoy los tres llamadores de `replaceAllText` lo hacen
—`RENOMBRES_ARMONIZACION_`, `RENOMBRES_COMUNICACIONES_POST_` y la barrida— y por eso el ancla
sobrevive. Un renombre futuro que pase texto pelado **puede corromper el ancla**, y el daño
sería invisible hasta que alguien mire las notas del deck publicado.

**Taxonomía: `modo` es de la máquina, `rol` es de las personas.**

- **`modo` sigue siendo comportamiento**, y se le agrega el valor que falta: **`estatica`** —
  la lámina **no lleva datos nunca**.
- **`rol` entra como columna editorial, explícitamente sin comportamiento**, con el
  vocabulario de bandas de la industria: `caratula`, `indice`, `resumen`, `detalle`,
  `agregado`, `cierre`. **En el modelo de bandas (JasperReports, BIRT, Crystal) la banda
  *es* el comportamiento** —`detail` se imprime por cada registro, `summary` una vez al
  final—; **acá no**, porque las láminas ya existen maquetadas y el comportamiento lo decide
  `modo`. Si `rol` empieza a decidir algo, hay dos columnas mandando sobre lo mismo.
- **`getLayout()` es pista, no clasificación.** Medido: `BLANK` aparece en los dos bloques
  (láminas sin tokens y láminas con veintiún tokens) y `SECTION_HEADER` también. Sólo `TITLE`
  salió limpio. Sirve para **proponer**, nunca para decidir solo.
- **`estatica` nace como etiqueta, igual que las otras tres.** Medido: el único lugar del
  motor que lee `SECCIONES.modo` es `seccionesRepetiblesDe_` (`Generador.gs`), comparando
  contra `repetible`. **`agregado`, `unica` y `manual` no tienen código detrás.** Decirlo
  ahora evita que la taxonomía prometa comportamiento que no existe.
- **"Sin tokens" no es lo mismo que "estática", y confundirlas congela deuda.** Trece láminas
  no tienen ningún token, pero dos de ellas no son carátulas: **`secco` 15** (rótulos de datos
  en una tabla y cero tokens: es una lámina de datos **sin cablear**) y **`secco` 26**
  (escondida, con `xx` de relleno). `estatica` significa *no lleva datos nunca*, **no** *hoy
  no tiene tokens*. Las dos dudosas quedan anotadas en `docs/PENDIENTES_consistencia.md` y se
  revisan antes de clasificarlas.

**El tamaño real, medido el 07/08 sobre las dos plantillas vivas y la hoja `SECCIONES` viva:**

| | número |
|---|---|
| láminas totales (`jm` 22 + `secco` 29) | **51** |
| clasificadas bien hoy por `familia_tokens` | **20 — el 39 %** |
| ambiguas (más de una sección las reclama) | **5** |
| huérfanas (ninguna sección las reclama) | **26** — 13 sin ningún token, 13 con tokens |

**El primer sellado deja 26 láminas sin clasificar, y eso es trabajo humano, no una operación
automática.** Está escrito acá para que nadie empiece la Fase 2 creyendo que es un botón.

**Identidad y clasificación se separan, y eso rompe la circularidad:**

| paso | qué hace | qué necesita |
|---|---|---|
| **2a** | sella `#lamina: L-NNN` en las 51 | nada: asignar un id no requiere clasificar |
| **3** | siembra `LAMINAS`, una fila por lámina, `seccion_id` vacío donde no se dedujo | la clave que escribió 2a |
| **—** | el usuario llena **26 celdas** de `seccion_id` en la hoja | — |
| **2b** | segundo sellado: escribe `#seccion:` leyendo la hoja | las celdas llenas |

`#seccion:` **sólo se escribe donde se deduce**: ahí sigue rigiendo default-deny, como
`buscarMapeo` ante una solapa no declarada. Y **el reporte es por lote** — el sellador recorre
todo, informa las 26 juntas y para; parar en la primera serían 26 rondas.

**La clasificación NO pasa por `familia_tokens`, y esto es parte de la decisión.** Llenar los
17 prefijos que hoy no declara nadie sería invertir en el mecanismo que la Fase 4 retira, y
hay un caso concreto de que sale mal: **`rrss_` vive en `jm` 21 (Resumen Ejecutivo ·
Sentiment) y en `secco` 28 (Interacción positiva en RRSS)**, que son secciones distintas —
declararlo en una fila `informes = JM,SECCO` reclama las dos. Es el patrón del `P2` de
`comunicaciones_post`, otra vez. **`familia_tokens` queda congelado donde está** hasta que la
Fase 4 lo retire: no se escribe ninguno nuevo y no hace falta `curarSecciones_` sobre 27
filas. (Que el seed las dejara clasificadas nunca fue posible: `sembrarSecciones_` sólo agrega
filas nuevas y **jamás pisa una existente**.)

**Qué se destraba, y es todo en la Fase 4, no con esta decisión:**

- `LAMINAS_CONGELADAS_` sale del `.gs` y agregar una lámina deja de frenar la armonización.
- **`familia_tokens` deja de ser el mecanismo de pertenencia.** Es el pago grande: hoy es
  simultáneamente *"con qué se reconoce el bloque modelo"* y *"qué tokens son de esta
  sección"*, y esa doble carga ya se cobró dos veces. **Medido: 4 de las 9 filas que declaran
  `familia_tokens` son candidatas a colapsar** — `encuentro_iceberg`, `m2_status` y
  `m2_caudal` (las tres `modo = unica`, compartiendo prefijo con su padre) y
  `ecv_alcance_semanal` (diez tokens exactos). Candidatas, no tarea: alguna puede ser un
  concepto legítimo.
- **Y el pago no es conceptual: `ecv_alcance_semanal` fabricó dos láminas huérfanas.**
  `ecv_comuna` y `ecv_fecha` no están en su enumeración de diez, así que las láminas 4 y 5 de
  `secco` quedaron sin identidad posible. La solución al bug del alcance semanal duplicado
  produjo el problema siguiente. La Fase 4 arregla dos huérfanas medidas, no una molestia.

**Dirección de `C-01`, dicha acá.** Durante el desarrollo la relación se invierte: **la
plantilla es artefacto del motor** y el equipo no la edita. `C-01` **no se deroga ni se
suspende en bloque**; la dirección queda escrita en esta decisión y las autorizaciones
concretas siguen creciendo **de a una operación** en `docs/REGLAS_NEGOCIO.md`, que es lo que
las hace verificables. En producción `C-01` vuelve a regir entero.

> **Addendum 1 a `D-23` — 07/08/2026, decisión del usuario.** El texto de arriba no se
> altera; esto lo corrige y lo completa el mismo día.
>
> **1 · El ancla tiene un campo, no dos: `#lamina: L-NNN` y nada más.** El `#seccion:` se
> diseñó cuando el sellador deducía la sección y la escribía en el deck. **La decisión que lo
> dejó sin función está en el propio texto de arriba**: la clasificación se declara en la hoja
> `LAMINAS`, así que el `seccion_id` pasaría a vivir en dos lados a la vez y el registro es
> dueño de la configuración (`D-01`). La copia en el deck no aporta nada y sí puede quedar
> vieja. **El segundo campo no se descarta por malo: queda sin función por una decisión
> posterior del mismo día.**
>
> **2 · Lo que el `#seccion:` justificaba sigue resuelto.** El argumento era que `m2` reclama
> las láminas 9 y 10 de `jm` y `campana` reclama ocho. **Un id único por lámina las distingue
> mejor que un `seccion_id` compartido** — la necesidad era identidad **por lámina**, y eso es
> exactamente lo que hace el campo que queda.
>
> **3 · La Fase 2 deja de estar partida.** Sin `#seccion:` no hay segundo sellado: **un solo
> sellado escribe ids en las 51 láminas, no deduce nada y no se traba nunca.** El default-deny
> sale del sellador y pasa a la hoja — **una lámina sin fila en `LAMINAS` se reporta, no se
> adivina**, igual que `SOLAPAS`. Las 26 huérfanas dejan de ser un problema de sellado: son 26
> celdas vacías de `seccion_id`. La tabla de fases de §2 queda actualizada en consecuencia.
>
> **4 · La herencia no es sincronización, y conviene decirlo porque se prestó a confusión.**
> `SECCIONES` y `LAMINAS` son **las dos configuración**: celda vacía = hereda, celda con valor
> = manda la lámina. Es **un solo valor resuelto al leer**, nunca dos copias del mismo dato.
> Lo que sí habría sido sincronización —y por eso se quita— era el `seccion_id` viviendo a la
> vez en la hoja y en el deck.
>
> **5 · El deck deja de ser autodescriptivo. Riesgo asumido, con mitigación.** Con sólo un id,
> si alguien borra la fila de `LAMINAS` el id queda huérfano y no significa nada. **La defensa
> es que la hoja se siembra leyendo el deck**: una lámina sin fila se reporta. Está escrito acá
> como riesgo, no como si no existiera.
>
> **6 · N copias, un id.** Las copias de una lámina modelo repetible salen **todas con el
> mismo `#lamina:`**, porque `duplicate()` arrastra las notas —medido el 07/08: tres slides,
> el mismo `#lamina:` en las tres— y porque **son** la misma lámina instanciada por ítem.
> **No es un bug.**
>
> **7 · El ancla en la copia generada, que reemplaza a la decisión de conservarla siempre:**
>
> - El deck generado **conserva el ancla**. Es lo que permite decir de qué modelo salió cada
>   lámina justo cuando un número sale mal.
> - **Una función lo limpia, y la corre el usuario cuando quiere.** Sin automatismo y **sin
>   concepto de "informe cerrado"**: el motor no decide cuándo un deck dejó de trabajarse.
> - **Actúa sólo sobre el informe generado.** Correrla contra una plantilla es un error, y la
>   función **tiene que negarse** — no confiar en que nadie lo intente.
> - **Limpiar es borrar la línea del ancla, nunca `setText` sobre las notas.** Medido el
>   07/08: **la copia hereda las notas del equipo** —las dos de `SECCO_marcada`, láminas 8 y
>   25, llegan íntegras a la copia—. Limpiarlas de un saque destruiría trabajo humano que
>   nadie tiene copiado.
> - **No necesita autorización de `C-01`.** `C-01` protege la **plantilla**; la copia es
>   salida del motor y el motor ya la escribe entera. Dicho para que nadie lo lea como una
>   ampliación de la suspensión.
>
> **8 · La plantilla no se limpia nunca, y eso es una decisión, no un olvido.** El ancla es su
> historia: una lámina retirada del uso queda marcada ahí con su id, y **como los ids no se
> reasignan, esa historia no se pisa**. Queda escrito para que ninguna implementación futura
> la incluya "por simetría" con la copia.
>
> **9 · El contador de `L-NNN` vive en la hoja `LAMINAS`.** Es donde están todas las láminas,
> y por eso es el único lugar que sabe cuál fue el último id asignado. **No se deriva leyendo
> las notas de las plantillas**: si se derivara, retirar una lámina haría **retroceder el
> contador** y un id se reasignaría — exactamente lo que el punto 8 y el texto de arriba
> prohíben.
>
> **10 · Consecuencia: sellar y sembrar son una sola operación, y las fases 2 y 3 se funden.**
> Por cada lámina sin ancla: **tomar el siguiente id de la hoja, escribir la fila, anexar el
> ancla.** Con el contador en la hoja, la Fase 2 necesitaba la hoja y la Fase 3 necesitaba la
> clave que escribe la Fase 2; **no se ordenan, se hacen juntas**. Es la misma circularidad
> que ya apareció dos veces en esta decisión, resuelta de la misma forma: **separando lo que
> no depende de nada de lo que sí.** La tabla de §2 queda con una sola fase.
>
> **11 · Una lámina no se borra: se esconde.** Las láminas son de la plantilla y del motor;
> retirarla del uso es **esconderla**, y su ancla y su fila quedan como histórico. Por eso los
> ids no se reciclan y por eso esta decisión **no necesita un caso "lámina borrada"**.
>
> **El contraste con `SOLAPAS` es deliberado, no un olvido:** ahí sí existe
> `NO ENCONTRADA <fecha>`, porque las pestañas de bases de terceros **sí desaparecen** y el
> motor no manda sobre ellas. Las láminas son nuestras; las solapas, no.
>
> **12 · Un solo contador para todas las plantillas.** `L-NNN` es **global entre `jm` y
> `secco`**, no por informe. Buena parte de `jm` está también en `secco`, y un espacio de ids
> compartido permite que una misma lámina llegue a tener una sola identidad en las dos.
>
> **13 · Que una misma lámina comparta id entre plantillas es implementación futura, y hoy no
> se construye.** La frontera, escrita: **numeración común hoy, identidad compartida después.**
> El contador común garantiza que no haya dos `L-014` distintos **y nada más**; que la misma
> lámina en dos plantillas lleve el mismo id requiere que **alguien las reconozca como la
> misma**, y el sellador no puede deducirlo. El contador compartido se decide ahora porque es
> gratis y porque cambiarlo después obligaría a re-sellar; el mecanismo de reconocimiento, no.
>
> **Mientras tanto la regla es de trabajo, no de código: al cablear `secco`, no repetir lo que
> ya está en `jm` si se puede evitar.** Y hay lista, medida el 07/08 con criterio grueso —
> **nueve pares con el primer texto idéntico**, de los cuales seis tienen además **el conjunto
> de tokens idéntico**: `secco` 17=`jm` 13, 18=14, 20=16, 21=17, 22=18, 23=19, todos del
> bloque `camp_*`. Más cinco pares con solape parcial, el más fuerte `secco` 8 ~ `jm` 6, con
> **28 tokens en común**. No se decidió cuáles son "la misma": es la lista de dónde mirar.
>
> **Lo que esa implementación futura no va a tener que resolver:** medido el 07/08, **copiar
> una lámina de una presentación a otra arrastra las notas del orador** — el ancla viaja con
> la lámina. El transporte sale gratis; lo que falta es el reconocimiento humano.
>
> **14 · Una pregunta queda abierta, anotada y sin decidir.** El día que se implemente el
> punto 13: si `L-014` vive en las dos plantillas, ¿es **una fila** de `LAMINAS` con una
> columna `informes` plural —como `SECCIONES`—, o **una fila por (`lamina_id`, `informe_id`)**
> con identidad compartida y configuración propia? **No es cosmético:** el repo ya tiene
> medido el modo de falla de la primera forma — `comunicaciones_post` declara
> `familia_tokens = post_` para `JM,SECCO` y es correcto para uno y equivocado para el otro.
> Queda en `docs/PENDIENTES_consistencia.md` con las dos formas nombradas. **No se decide acá.**

---

**`D-24` — Una solapa declara de dónde saca la ventana en `SOLAPAS`, y con qué clave se cruza
en `MAPEO`. Dos hojas, porque son dos preguntas de grano distinto.** (10/08/2026)

La capacidad y su justificación de dominio son `R-25`. Acá va **dónde se declara**, que es lo
único de esto que es una decisión de arquitectura.

| pregunta | dónde | por qué |
|---|---|---|
| ¿De qué solapa saca la fecha ésta? | **`SOLAPAS.ventana_ref`** | no es una columna de la solapa: es una propiedad **de la solapa**, del mismo grano que `uso` y `fila_encabezado` |
| ¿Cuál es la columna de la clave? | **`MAPEO`, campo lógico `clave_ventana`**, una fila de cada lado | es literalmente una columna, que es lo que `MAPEO` registra |

**Lo descartado, con el motivo — es la parte que hace falta conservar:**

- **Las dos cosas en `MAPEO`**, con campos lógicos `ventana_ref_solapa` y `ventana_ref_clave`.
  Obliga a poner un **nombre de solapa** en la columna `columna`, que en esa hoja significa una
  letra: `columnaLetraAIndice_` haría cualquier cosa con ese string, `tipo_esperado` dejaría de
  aplicar, y `backfillSolapaMapeo_` y las auditorías leerían una fila que **miente sobre su
  propio grano**. Descartada por eso, no por estilo.
- **Las dos cosas en `SOLAPAS`**, con la letra de la clave en una segunda columna nueva. Pone
  *"qué columna es qué"* en un segundo lugar además de `MAPEO` — la divergencia que la tabla de
  dueños de `CLAUDE.md` §7 existe para evitar.

**El campo lógico se llama `clave_ventana` y no `id_cuenta`, a propósito.** El mecanismo no sabe
de cuentas: el próximo par de solapas puede cruzarse por otra cosa. Es la dirección de `D-01` —
un nombre de negocio adentro del mecanismo es una línea de `.gs` que después hay que tocar.

**Y resuelve gratis un problema medido:** los encabezados reales de las dos solapas **no
coinciden** (`Cuentas` titula `id_cuentas`, `DIGITAL` titula `Id cuentas`), así que la clave
nunca podría haberse resuelto por texto. Un campo lógico con una fila de cada lado es la única
forma que ya existía en el repo para decir *"esto de acá es lo mismo que aquello de allá"*.

**Un solo nivel de referencia**, con motivo propio para el segundo — sin ese tope una cadena
circular cuelga la corrida en vez de fallar. `validarReferenciaVentana_` recibe el mapa de
solapas **por parámetro** justamente para que el control positivo pueda armar el ciclo sin
escribirlo en la planilla.

---

**`D-25` — El filtro admite varias condiciones unidas por `&&`. Sólo conjunción: no hay `OR`, y
no es una etapa pendiente.** (10/08/2026)

La sintaxis vive en `docs/TOKENS.md` §6 y el argumento medido en el comentario de
`OPERADORES_FILTRO_`. Acá van las dos decisiones.

**1 · Sólo `AND`.** `OR` exige precedencia, paréntesis y una gramática de verdad. **No hay un
solo caso medido que lo pida:** los 33 textos de filtro vivos son de una condición y las nueve
demandas nuevas —tres `imp_*`, seis `pauta_*`— son todas conjunciones. Y el caso que *parece*
`OR` no lo es: `imp_prog` es «todo lo que no es Meta ni Google ads» (`R-24`) y se escribe
`Plataforma!=Meta && Plataforma!=Google ads`. **La regla por resta ya evitó el `OR` sin
proponérselo.** Si aparece una demanda real, entra con su caso y su medición; no se construye
por si acaso.

**2 · El separador es `&&`, y la elección enseña más que el resultado.** El barrido del 10/08
midió **dos** universos, y ahí está todo: contra los **33 textos de filtro** quedaban doce
candidatos libres; contra los **valores reales de las 31 columnas** que un filtro puede
direccionar, sólo seis.

**El caso que justifica haber medido los datos es `|`.** Sale limpio contra los textos —igual
que `~` en su momento— y aparece en **447 de 709 valores** de `looker/DIGITAL.nombre_campaña`,
la columna exacta que los `imp_*` van a filtrar: `RDV JM | Villa Devoto 15/12`. Adoptarlo habría
partido más de la mitad de los nombres de campaña **sin fallar**. El precedente de `~=` midió
sólo los textos y le alcanzó; **acá no alcanzaba, y no había forma de saberlo sin medir**.

| descartado | por qué |
|---|---|
| `AND` | una palabra aparecería dentro del valor de un filtro sobre texto libre — el mismo motivo por el que `CONTIENE` perdió contra `~=` |
| `&` simple | dos URLs de `post_meta` lo contienen. **`&&` no**, y el doble carácter es justo lo que los separa |
| `;` | separador de campos de CSV en es-AR, y el requisito no negociable de `~=` era sobrevivir a exportar la hoja |
| `^` y `::` | sobreviven todo y no dicen nada. Entre equivalentes gana el que se entiende sin abrir la documentación |
| `\|`, `,`, `/`, `+`, ` Y ` | **ocupados en los datos**, aunque libres en los textos |

**3 · Lo que esta decisión NO cambia, y es deliberado.** El filtro propio del marcador sigue
**reemplazando** al de la sección, no sumándose (`Generador.gs`, `filtroPropio || filtro_seccion`).
Cambiarlo movería el resultado de los 33 filtros vivos, y esta decisión no mueve ningún número:
los nueve textos distintos dieron **idéntico conteo de filas antes y después**. Si sumar resulta
lo correcto, es otra decisión con su propia medición del antes y el después.

**4 · Nunca se aplica un subconjunto de condiciones.** Todas se resuelven contra `MAPEO` antes
de filtrar una sola fila, y si una falla, falla el filtro entero nombrando cuál. Dos de tres
condiciones dan un número plausible sacado del universo equivocado — el modo de falla que este
repo persigue. **La misma regla vale para el filtro heredado**: si una de sus condiciones no
mapea, se ignora el filtro entero, nunca las otras sueltas. Con `n = 1` las dos opciones
coinciden, así que es la generalización estricta del comportamiento anterior.

---

**`D-26` — Un token «derivado» se cierra apuntándolo a la fuente de sus sumandos, no construyendo
una operación de derivación.** (10/08/2026)

El caso: `imp_total` y `gcba_imp_total`. `X-10` y `V-59` los declaran **derivados** —
`imp_meta + imp_google + imp_prog`— y el pendiente `P0` pedía retirarles la fuente propia.

**Lo descartado: construir la derivación.** Las siete operaciones de `OPERACIONES_` agregan filas
de una solapa; **ninguna suma otros tokens**. Habría que inventar una octava, con dependencias
entre marcadores, orden de resolución y detección de ciclos. Y retirarle la fuente a `imp_total`
antes de eso lo dejaba publicando `«FALTA»` para siempre.

**Lo elegido:** `imp_total` es `SUMA` sobre **la misma solapa y el mismo corte que sus tres
sumandos, sin la condición de plataforma**. Porque lo que el `P0` objetaba **no era que tuviera
fuente**: era que tuviera **otra** fuente —`resumen_metricas_dinamico`— y que eso fuera un segundo
camino al mismo número, destinado a divergir.

**Y el argumento fuerte es lo que la decisión regala.** Por `R-24` las tres plataformas
**particionan** el universo —dos igualdades exactas y su negación conjunta—, así que

```
imp_total  ==  imp_meta + imp_google + imp_prog
```

**tiene que dar exacto en cada corrida.** No son dos caminos que *deberían* coincidir: son dos
recorridos de la misma fuente que **no pueden diferir salvo por un bug**. Un derivado de verdad no
habría dado esa red — habría tenido un solo camino y ninguna forma de contradecirse.

**El contrapunto, que es el punto:** si alguien convirtiera `imp_prog` en una lista explícita de
plataformas, la partición se rompería y la igualdad dejaría de cerrar. **Que se rompa es lo que se
quiere**, y por eso vive como control corrible —`controlParticionImpresiones_`, que lee los
filtros tal como están cableados en `MARCADORES`— y no como comentario. Medido el 10/08: delta
**0** en importes y en filas, de los dos lados.

**Alcance.** Esto no dice que ningún token pueda ser derivado nunca. Dice que **antes de construir
la derivación hay que mirar si el «derivado» y sus sumandos no salen del mismo lugar**: cuando
salen, la suma es un control y no una operación.

---

**`D-27` — Qué secciones repetibles entran es una opción de la corrida, y una sección que queda
afuera se reporta.** (11/08/2026)

`generarInforme` toma un tercer parámetro `opciones`, y `opciones.secciones` dice cuáles de las
secciones repetibles se expanden. **Ausente = todas; una lista = exactamente ésas; la lista vacía
= ninguna.**

**La distinción entre `undefined` y `[]` es la decisión, no un detalle de firma.** Con "lista
vacía = todas", destildar todas las secciones en el panel habría pedido **lo contrario** de lo que
hacía — un default silencioso invirtiendo una elección explícita, que es justo lo que `D-19` y
`D-21` prohíben en el otro extremo del motor. Un llamador que no conoce la opción no la pasa y no
cambia nada: el ítem de menú y la API siguen llamando igual.

**Una sección omitida no desaparece:** entra al reporte con `omitida: true` y su motivo, y sus
slides modelo quedan como están, con los tokens cayendo a la pasada de tokens fijos. Es el mismo
camino que ya recorría una sección sin ítems — no se inventó un estado nuevo.

**Y el motivo por el que nació no es el que terminó justificándola.** Se pidió para que la corrida
entrara en el techo, sospechando de `campana`. Medido, `campana` cuesta **0 s** porque tiene 0
ítems (`CAMPANAS` no tiene ni una fila de `jm`). Lo que la opción sí da es el seguro para el día
que los tenga, y —de paso— la primera pantalla donde se ve que el motor **se configura**. El
riesgo de timeout real es otro y es `D-28`.

---

**`D-28` — El presupuesto de corrida se dimensiona contra la varianza de la plataforma, no contra
el costo del trabajo.** (11/08/2026)

Cuatro corridas de `jm` del 11/08, **con el mismo output exacto** —159 tokens distintos, 83
impresiones con valor, 207 filas de `FALTANTES`— dieron:

```
316 s   las tres secciones
204 s   las tres secciones
220 s   sólo encuentro   ← menos trabajo, más tiempo que la de 204
```

**Rango 112 s sobre un techo de 350: un tercio del presupuesto, con el trabajo constante.** La
corrida con **menos** secciones tardó **más** que una con todas. El costo de las secciones,
medido, es chico y estable —`encuentro` 72-114 s, `comunicaciones_post` 33-45 s, `campana` 0— y
el resto es latencia de Sheets y Slides, que no se controla desde acá.

**La consecuencia operativa:** ningún selector de secciones alcanza contra esa varianza. Para una
presentación, **el deck se genera antes y se muestra generado**; correrlo en vivo es una
demostración del motor, no la forma de tener el deck.

**Y la consecuencia para el techo, que es por lo que esto es una decisión y no una anécdota:**
`CONFIG.presupuesto_corrida_seg` está en 350 y **no se puede subir mucho** — Apps Script corta la
invocación a los 6 minutos, así que el margen real son ~10 s. El día que alguien quiera tocar ese
número, el dato que necesita es este rango: no alcanza con medir una corrida, porque una sola
corrida no dice nada sobre la próxima. El corte por tiempo del motor (`T2.1.1`) no es una
precaución teórica: es la única red que queda.

---

**`D-29` — Un encuentro que no alcanza el umbral de anclaje lo resuelve el usuario, no el motor.**
(12/08/2026 · **decisión del usuario**, y por eso se escribe con su dueño puesto)

**El umbral no se baja para que un encuentro entre.** Bajarlo cambia el anclaje de **todos** los
demás para arreglar **uno**, y lo que hace entrar es una fila de `rdv` que el motor **no está seguro
de haber acertado** — el ancla es lo que decide qué fila se lee, así que un ancla flojo publica
barrio, inscriptos y población posiblemente de otro encuentro. Es el número plausible en su forma
más cara: una lámina entera coherente y equivocada.

**La salida es que el usuario confirme o corrija el anclaje, y eso es una capacidad del front**, no
del motor. El motor ya hace su parte: `ANCLAJE_PENDIENTE` registra los candidatos con sus tres
mejores opciones y una columna `elegido`.

**Hasta que el front exista**, el encuentro se lista en `excluidos` con su puntaje y el umbral —lo
que dejó funcionando la Parte G del `_31.3` (`c0b58b5`)— y el usuario decide. **Lo que se cerró ahí
no fue la exclusión sino el silencio:** antes desaparecía del deck sin una línea, que es la misma
clase de falla que `D-19` y `D-21` cierran en los otros caminos.

**Caso vivo, 11/08/2026:** `Encuentro Temático Educación 16/06` (Almagro), **puntaje 0,54 contra
umbral 0,6**. Recargado una vez para anclar por `evento` —como Orden Público→Belgrano— y volvió a
caer. No se insistió y no se tocó `CONFIG.umbral_anclaje_reunion`.

**Corolario, y es lo que hace operativa la decisión:** `scoreMatchDigitalRdv_` tampoco se toca por
un caso. Si el matcher hay que mejorarlo, se mide sobre los encuentros de varias semanas y se
decide con esa medición, no con el que falló hoy.

**Addendum al `D-29` — 21/08/2026. El front existe, y la decisión de dónde saca los datos, con
sus tres límites.** (`2026-08-21_16` Parte A. El texto de arriba no se edita — `CLAUDE.md` §7.)

**La cláusula *"hasta que el front exista"* deja de aplicar.** El panel tiene la pestaña
`Anclajes`: lista lo pendiente de confirmar con sus tres candidatos y sus puntajes, y escribe
`elegido`. El listado en `excluidos` **se conserva** — no era un sustituto del front sino el
cierre del silencio, y sigue siendo el registro de la corrida.

**La decisión de la Parte A: la pantalla lee `ANCLAJE_PENDIENTE`, no corre `anclarEncuentros`.**
Las dos formas no son equivalentes y la elección tiene un motivo cada mitad:

- **El costo.** `anclarEncuentros` tarda **~50 s** (medido, `Union.gs` y `Generador.gs`) y
  `cacheAnclaje_` es una global de módulo: en Apps Script eso **se reinicia entre invocaciones**,
  así que **cada apertura de la pestaña lo pagaría entero**. Una pantalla que tarda 50 s en
  pintar no se usa.
- ⭐ **Y el motivo que no es de costo, que es el que de verdad decide: la hoja no es un caché.**
  Es el registro que el propio motor consulta con `anclajeYaConfirmado_` **antes** de anclar.
  Confirmar ahí es confirmar **exactamente lo que la próxima corrida va a leer**, no una foto de
  algo que después se recalcula.

⚠ **Límite 1 — falta por abajo.** Un encuentro que todavía no pasó por ninguna corrida **no está
en la hoja**, y por lo tanto no aparece. La pestaña muestra **lo pendiente de confirmar, no todo
lo anclable**.

⛔ **Límite 2 — y sobra por arriba, que es el que no estaba previsto y salió de mirar las filas
reales.** `registrarAnclajePendiente_` **nunca borra**: la hoja **acumula**. De las dos filas que
tiene hoy, una —`almagro|2026-06-16|`— corresponde a una fila de `REUNIONES` con **`mostrar =
no`**, y `leerReuniones_` filtra por `mostrar`: **hoy esa fila no podría escribirse**. Quedó de
una corrida anterior. **Así que la pantalla puede ofrecer confirmar un encuentro que ya no va al
deck**, y nada en la hoja lo distingue de uno vigente.

- **La contención, y es barata:** la pantalla **cruza contra `REUNIONES`** y marca las filas que
  ninguna reunión vigente reclama. **No las borra** —borrar una decisión que alguien tomó es lo
  que `CLAUDE.md` §4 prohíbe— y **no las esconde**: las muestra aparte, dichas como viejas.
- ⚠ **Y el cruce se hace por la clave, no por el nombre**, porque la clave es
  `normalizar_(nombre)|fecha|etapa` y el nombre solo no alcanza.

⛔ **Límite 3 — el hueco que esta pantalla NO tapa, y hay que decirlo para que nadie lea la
pestaña nueva como que el circuito quedó cerrado.** Son **dos** huecos:

| caso | ¿pasa por `ANCLAJE_PENDIENTE`? | ¿lo cubre esta pantalla? |
|---|---|---|
| **cae bajo el umbral** | sí | **sí** — es lo que este paso construye |
| **empata arriba del umbral** | **no** | **no** |

Los cinco anclajes que dan `1,00` exacto **empatan en el techo**, y ahí actúa el desempate
temporal y **el motor elige solo** — que es el modo de falla del `3347`. Eso es del motor
(`scoreMatchDigitalRdv_`), sigue **remitido a este mismo `D-29`** —*"no se toca por un caso"*— y
está fuera del alcance del `2026-08-21_16`.

**Lo que queda fuera y por qué:** un botón *"recalcular"* que sí pague los 50 s. No se construye
acá. ⓘ Anotado para cuando exista: `cacheAnclaje_` **sí** ahorra **dentro** de una ejecución, así
que ese botón, si además pinta la pantalla, paga los ~50 s **una vez y no dos**.

---

**`D-30` — Una solapa declara en `SOLAPAS.campo_id_cuenta` qué campo suyo lleva la cuenta, y con
eso el motor le da a cada lámina la fila de su encuentro. El recorte por ventana se suprime **en
esa lectura**, no en la solapa.** (12/08/2026)

**El problema.** `datosDeMarcador_` tenía **dos ramas por cuenta y las dos cableadas a un `base_id`
literal**: `rdv` por `opciones.fila_rdv` y `digital` por `filasDigitalDeEncuentro`. Cualquier otra
base cae a `leerFuente`, que devuelve la solapa entera sin el contexto del ítem — **el mismo
agregado publicado en las seis láminas**. Es el bug que el `_28` arregló para `rdv`, esperando a la
tercera base para repetirse, y hoy bloquea de una sola vez los cuatro `enc_*` de Call Center, el
embudo del iceberg y las impresiones por plataforma.

**Descartado: una tercera rama cableada.** Habría servido a la base nueva y **no** a `looker`, que
necesita lo mismo, así que la cuarta base pedía una cuarta rama. Es la medición de `D-01` yendo para
el lado que no es: un informe nuevo exigiendo un `.gs`.

**Lo que se decidió, y son tres cosas.**

**1 · La declaración es por solapa, no por base.** No es simetría con `BASES`: `C-50` midió que el
par PRE/POST **comparte el mismo `ID` en dos solapas distintas** de la misma base —152 ids en
`Agenda JM`, 102 en `Agenda JM | Post`, 98 compartidos—, así que la clave del par es
`(ID, solapa)` y una declaración por base no podría distinguirlas. Guarda el **campo lógico**, no la
letra de columna: la letra tiene dueño y es `MAPEO`. Es la forma exacta de `ventana_ref` (`D-24`),
que declara la solapa de referencia y deja la clave del cruce en `MAPEO.clave_ventana`.

**2 · La supresión del recorte por ventana es del llamador, no de la solapa** — y ésta es la parte
que no era obvia. Cuando el ítem trae `id_cuenta`, **la cuenta es el recorte**, y volver a recortar
por fecha vacía láminas: San Cristóbal es del 23/07 y la ventana de julio arranca el 24 (`R-17`, el
temario ya seleccionó). Pero declararlo **en la solapa** lo apagaría para todos sus lectores, y
`looker/resumen_metricas_dinamico` se lee de las dos formas: por cuenta para los `enc_*` y como
**agregado de la semana** para `frecuencia` y `gcba_frecuencia`. Apagárselo al agregado le daría la
suma de todos los períodos — grande, plausible y equivocada. **El recorte no es propiedad de la
solapa: es propiedad de cómo se la está leyendo**, y por eso viaja como opción de `leerFuente` y la
pide sólo esta rama.

**3 · Sin `id_cuenta`, falla; no cae a leer la solapa entera.** Es la decisión que evita el modo de
falla de siempre. Una solapa que declara `campo_id_cuenta` **afirma que su grano es la cuenta**:
leerla sin cuenta no es una lectura más amplia, **es otra pregunta**. Devuelve
`«FALTA:<token>@sin_id_cuenta»` nombrando la solapa y el campo declarado. Mismo criterio que `D-19`
y `D-21`: nada entra ni se excluye en silencio.

**La guarda que la acompaña.** Si el campo lógico declarado no está en `MAPEO` para esa solapa, la
rama falla con `@campo_id_cuenta_no_mapeado` en vez de filtrar contra una columna inexistente —
donde el filtro dejaría pasar **todas** las filas y el marcador publicaría el agregado creyendo que
publicó la cuenta.

**Qué NO cambia.** Las dos ramas cableadas siguen primero y sin tocar: están medidas y validadas, y
la de `digital` además no es un filtro sino una unión de seis solapas (`Union.gs`) que esta rama no
sabría reproducir. **Vacío es el default en las 100 y pico de filas de `SOLAPAS`**, y vacío
significa «esta solapa no se selecciona por cuenta» — el estado de todas hasta hoy.

**Control positivo:** `probarRamaPorCuentaDeclarativa_` (`Pruebas.gs`), sobre las dos funciones
puras. El fixture del filtro es `[3387, 3289, 3387]` buscando `3289` a propósito: el resultado —una
fila, la del medio— **no coincide** con "la primera", ni con "la última", ni con "todas", así que
distingue las cuatro implementaciones. Uno de dos filas con la buscada adelante habría pasado con
todas.

**Addendum al `D-30` — 21/08/2026. Dos derogaciones: la rama de `digital` cede, y «sin `id_cuenta`
falla» dejó de ser cierto el 19/08 sin que nadie lo escribiera.**

El texto de arriba no se edita (`CLAUDE.md` §7). Esto corrige dos de sus afirmaciones, con la
fecha en que cada una dejó de valer.

**C.1 · «Qué NO cambia» ya no es cierto para `digital`.** Decía que las dos ramas cableadas siguen
primero y sin tocar. La de `rdv` sí; la de `digital` **cede** desde el `2026-08-21_15`, y la
condición exacta que la hace ceder son **tres cosas a la vez**:

> la solapa **no** está en `SOLAPAS_CANAL_DIGITAL_`, **no** es `SOLAPA_MAESTRA_DIGITAL_`, y
> **declara** `SOLAPAS.campo_id_cuenta`.

Cumplidas las tres, la rama de `digital` no resuelve: deja seguir, y la atiende la rama declarativa.
**Fuera de esas tres, todo queda como estaba** — incluido el fallo `@solapa_digital_desconocida`,
que se conserva para las solapas que no declaran nada y es el que avisa de una solapa que nadie
configuró. **Ceder y fallar son dos caminos distintos y los dos siguen existiendo.**

**El orden entre las otras dos no cambia, y el motivo es que no comparten el caso.** La rama de
`rdv` se activa por `opciones.fila_rdv` —una fila que ya eligió el temario, no una solapa que se
lee—, así que no hay solapa de `rdv` que pueda declarar `campo_id_cuenta` y llegar a competir. La
de `digital` sí compartía el caso, y por eso es la que cede.

**Lo que motivó el cambio, medido:** los 24 `u1_` salieron `---` en la corrida `194602` con
`«FALTA:u1_total_impresiones@solapa_digital_desconocida»`. `CAMPAÑAS_DESGLOCE_DIGITAL` declara
`campo_id_cuenta = des_id_cuenta` desde el `2026-08-19_1`, **y nunca llegaba a la rama que lo lee**.
El propio comentario de la rama declarativa lo decía —*"las solapas de `digital` nunca llegan hasta
acá"*— y era **una descripción del problema, no una decisión**; es la misma familia que
`Reuniones.gs` afirmando un contrato que el código no cumplía.

⚠ **Se descartó el atajo**, que era agregarla a `SOLAPAS_CANAL_DIGITAL_`: eso la metería en la
**unión** del Paso 2.4, que responde otra pregunta —unir canales **por cuenta**— y esta solapa tiene
grano **campaña × plataforma**.

**Alcance, medido antes de escribir el `if`:** exactamente **una** solapa de `digital` declara
`campo_id_cuenta`, y **ninguna** de las cinco de canal ni la maestra lo declaran. El cambio no le
mueve el camino a ningún marcador que hoy publique.

**C.2 · El punto 3 está derogado desde el 19/08/2026, y esto es lo primero que lo escribe.** Decía
*"Sin `id_cuenta`, falla; no cae a leer la solapa entera"*. El código hace lo contrario desde el
`2026-08-19_1`, donde el usuario eligió que `campo_id_cuenta` **dejara de ser todo-o-nada**: un
marcador de una solapa que declara, emitido sin ítem, **no falla** — cae al agregado. Esa decisión
**vivía sólo en un comentario de `Generador.gs`**: grepeada, no estaba en `PLAN.md`, ni en
`PENDIENTES_consistencia.md`, ni en `BITACORA.md`.

La contención que se declaró en su lugar es un aviso en `origen`:

> `⚠ la solapa declara `campo_id_cuenta = <campo>` y este marcador se emite SIN ítem: se lee como
> AGREGADO GLOBAL de todas las cuentas (A, 19/08)`

**Se evaluó declararlo por marcador** —una columna en `MARCADORES`— en vez de inferirlo de la
ausencia; el usuario eligió esta vía.

⛔ **Y la consecuencia nueva, que es de este paso y no del 19/08.** Después de C.1,
`CAMPAÑAS_DESGLOCE_DIGITAL` es **la primera solapa que llega a esta rama y además puede emitirse
sin ítem**. Un `u1_` fuera de una lámina de encuentro publicaría la suma de todas las cuentas de la
solapa — **grande, plausible y equivocada**, que es el modo de falla de siempre.

⛔ **Con un agravante que no estaba previsto y salió de un rojo del control de la Parte B: para las
solapas de `digital` el aviso NO se emite.** `avisoAgregadoDeclarado` vive en la rama declarativa, y
la rama de `digital` atrapa el caso sin `id_cuenta` **antes**, con su propio `if`, devolviendo un
`origen` sin aviso. Así que el riesgo del párrafo anterior **no tiene la contención que la Parte A
daba por existente**. Queda anotado en `docs/PENDIENTES_consistencia.md`; no se arregla acá porque
tocar el agregado global de `digital` estaba explícitamente fuera del alcance del paso.


---

**`D-31` — `MAPEO` referencia la columna **por letra**, y documenta en `encabezado` qué título hay
en esa letra. El encabezado es **testigo, nunca fallback**.** (14/08/2026)

**Por qué la letra sigue mandando.** Los títulos se repiten dentro de una misma solapa: `Agenda JM
| Post` tiene **cuatro** `% CTR`, `Base_Digital` **ocho** `ID Cuentas`, `Desglose impresiones`
**tres** claves. Buscar por título elegiría siempre el primero, en silencio y con un número
plausible. La letra es la única referencia que distingue.

**Qué agrega el testigo.** La letra sola deja un modo de falla sin red: **insertar una columna
corre todas las letras a su derecha**, y el mapeo pasa a apuntar una más allá. Un `SUMA` sobre la
columna de al lado **devuelve un número, no un error**. Con el encabezado documentado, ese
desalineamiento es visible.

**Dónde vive, y por qué no es un detalle.** En `ENCABEZADO_POR_MAPEO_` (`Instalar.gs`), o sea **en
el seed**, no sólo en la hoja. `upsertPorClave_` reescribe la fila entera con `(h in obj) ? obj[h]
: ''` cuando cambia **cualquier otra** columna: un valor que el seed no conoce se borra al primer
cambio de una nota. Y hay un segundo motivo, mejor: con el testigo en el seed, **el diff de
`instalar()` muestra el desalineamiento solo**, antes de que exista la función que compara.

**Qué se hace cuando no coinciden — definido acá aunque todavía nada lo ejecute**, para que la
función posterior no invente la política:

1. **No se corrige la letra automáticamente, nunca.** Un desalineamiento puede ser una columna
   insertada *o* un mapeo mal escrito de origen, y la reparación es distinta en cada caso.
2. **Se reporta con los dos valores** —el esperado y el encontrado— y con la letra, que es lo que
   permite decidir cuál de los dos casos es.
3. **No se bloquea la corrida.** Es la misma decisión que `R-19` toma con una fuente que dejó de
   traer: se avisa fuerte y se sigue, porque un deck a medias con la falla listada sirve más que
   ninguno.

**La validación automática está diferida** (usuario, 14/08/2026) porque **nadie insertó columnas
todavía**. Eso es un **supuesto sobre bases de terceros** —`looker` es de `dgples`, `m2` de
`tarnowski`— y por lo tanto **puede vencer sin aviso**: ver `PENDIENTES_consistencia.md`.

### El límite, y es lo que más hay que saber: **el testigo documenta el rótulo, no el contenido**

`encabezado` dice **qué título hay** en esa letra. **No dice que ese título describa el dato que
la columna contiene.** Son cosas distintas y el proyecto ya tiene el caso que las separa.

**`rdv/RDV_otros_ministros` tiene los encabezados corridos una columna en origen** (`C-09`). Su
`fecha_periodo` apunta a `E`, cuyo rótulo dice `hora_cita_evento` y cuyo **contenido es la
fecha** — medido: 514 filas, 10 en ventana, 0 sin fecha. La letra está bien; el rótulo, no. Su
testigo es `hora_cita_evento`, el rótulo real.

**En esa solapa el testigo coincide siempre y no delata nada.** Va a decir *"esperaba
`hora_cita_evento`, encontré `hora_cita_evento`"* mientras el corrimiento siga ahí. **Si no queda
escrito, alguien va a leer «coincide» como «está bien».**

Y tiene una lectura invertida que conviene tener presente: **el día que el testigo de esa solapa
deje de coincidir, será porque alguien arregló los rótulos** — no porque algo se rompió. Ahí lo
que hay que revisar es la **letra**, no restaurar el testigo. La bitácora ya lo había anticipado:
*"es un acierto por compensación de dos errores; el día que `C-09` se arregle, esta lectura no va
a fallar, va a leer otra columna"*.

**Qué NO cubre el testigo, dicho de una vez:** una columna cuyo rótulo miente, una columna
renombrada sin mover el dato, y dos columnas intercambiadas con sus rótulos. Cubre exactamente
una cosa —**que la letra siga apuntando donde el rótulo dice**— y ésa es su utilidad entera.

**Medición que lo funda**, `censarEncabezadosDeMapeo()` sobre las 161 filas vivas (14/08/2026):
cero letras sin encabezado y cero títulos repetidos dentro de una misma solapa.


#### ⛔⛔ ADDENDUM 25/08/2026 — la letra manda para ESCRIBIR el mapeo y **no para LEER el dato**

**`D-31` no se deroga, pero su frase más citada —*«la letra es la referencia, el encabezado sólo
testigo»*— no se sostiene en el camino de lectura, y el 25/08 costó una lámina.**

**El hecho, medido en el código:** `leerFuente` arma cada fila **indexando por título**:

```js
headers.forEach(function (h, i) { if (h) obj[h] = fila[i]; });
```

⇒ **Con títulos repetidos, gana el último** — y `MAPEO.columna` no participa de esa búsqueda. La
letra decide **qué columna se declara**; el lector después va a buscar **por nombre**.

**El caso:** `vis_totales` (M) y `vis_vtr_pct` (N) se mapearon el 24/08 sobre
`reuniones/Agenda JM | Post`, con la letra correcta. Sus títulos —`Visualizaciones` y `% VTR`—
**aparecen cuatro veces cada uno** (M/R/W/AB y N/S/X/AC), así que el lector devolvía **la columna
de Programmatic**, que en las filas de encuentro vale `-` y `0`. `L-036` publicó exactamente eso.

⚠ **Y lo escribió el propio `D-31` como argumento a favor de la letra:** *«`Agenda JM | Post` tiene
cuatro `% CTR`… buscar por título elegiría siempre el primero»*. **El diagnóstico era correcto y la
conclusión no llegó hasta el lector.** Es un contrato afirmado en un lugar y no implementado en el
otro.

##### ⭐ Medido: es UN caso, no un agujero

Sobre el fixture del 20/08, las solapas `fuente` de las cinco bases:

| | |
|---|---|
| solapas `fuente` leídas | **12** |
| con títulos repetidos | ⚠ **1** — `reuniones/Agenda JM | Post` |
| filas de `MAPEO` que apuntan a una letra que **no** es la primera de su título | ⭐ **0** |

**En esa única solapa hay cinco títulos repetidos:** `Clics` ×4, `% CTR` ×4, `Visualizaciones` ×4,
`% VTR` ×4 e `Impresiones` ×3. Los cuatro campos que quedan mapeados ahí —`id_cuenta` (A),
`alc_real` (G), `poblacion` (F), `imp_totales` (J), `fecha_periodo` (E)— **tienen título único**, y
por eso funcionan.

##### Qué se hizo y qué NO

- **Se hizo:** retirar las dos filas de `MAPEO` y sus ocho marcadores. `L-036` queda con **tres
  columnas de cinco** — decisión del usuario: *preferible a publicar las de Programmatic
  disfrazadas de totales*.
- ⛔ **NO se hizo:** una excepción de lectura por letra para esa solapa. **Nadie la va a recordar en
  un mes**, y una regla que vale en un solo lugar es una trampa con fecha.
- ⏸ **Queda abierto, y el número dice que no urge:** que el lector pueda resolver por letra cuando
  el título es ambiguo. Con **1 de 12** solapas afectadas y **cero** mapeos rotos hoy, es un
  pendiente, no un incendio. **Lo que lo volvería urgente es mapear cualquiera de los otros cuatro
  títulos repetidos de esa solapa.**

⚠ **Y la regla operativa mientras tanto, que es lo accionable:** **antes de mapear una columna,
mirar si su título se repite en la solapa.** Si se repite, la letra no alcanza — o el campo sale de
otra base, o no se mapea.

#### ⭐⭐ ADDENDUM 2 — 25/08/2026 (tarde) · **la lectura POR POSICIÓN, y el testigo que la acompaña**

**Decisión del usuario: se leen por posición.** El addendum de arriba dejaba el pendiente abierto —
*«que el lector pueda resolver por letra cuando el título es ambiguo»*—. **Se cierra, y con la regla
escrita en vez de con una excepción suelta**, que es exactamente lo que el `ADDENDUM 1` se negó a
hacer y con razón.

##### La regla, con su borde

> **Cuando el título de una columna se repite en la solapa, la letra manda y el encabezado deja de
> ser testigo** — porque no puede distinguir cuál de las repetidas es. **La lectura por posición se
> declara en el `MAPEO`, no en el código.**

⭐ **`D-31` no se deroga y su primera mitad se refuerza:** *«el encabezado es testigo, nunca
fallback»* sigue entero. Lo que este addendum agrega es **qué pasa cuando el testigo no puede
testificar**.

⚠ **El borde importa tanto como la regla:** esto vale **sólo** para títulos repetidos. Para los
títulos únicos —que son la enorme mayoría: **11 de 12 solapas `fuente`** no tienen ninguno
repetido— el encabezado sigue siendo el testigo y no cambia nada.

##### Cómo se implementa — una columna, un resolvedor, cero listas en el código

| pieza | qué hace |
|---|---|
| **`MAPEO.por_posicion`** | `sí` = leer por índice. Vacío = por título, el comportamiento de siempre. **La decisión es configuración**, no código (`D-01`) |
| **`leerFuente`** | agrega a cada fila una clave por posición **además** de las de título. ⭐ **Se agrega, no reemplaza:** ningún consumidor cambia |
| **`claveDeLecturaEnColumna_`** | el único punto que decide. Los **16** puntos de `Generador.gs` lo heredan sin tocarlos, y el próximo que se agregue **no se tiene que acordar** |

⚠ **Y la colisión del prefijo se mide, no se supone:** si una solapa tuviera una columna titulada
como el prefijo posicional, pisaría la celda. `leerFuente` lo verifica y avisa.

##### ⛔⛔ Lo que esto ROMPE, y hay que decirlo: el testigo de integridad de `D-31`

**El testigo era el encabezado.** Si la columna se corre, el título deja de coincidir y salta el
aviso. **Con títulos repetidos no puede saltar**, porque el título de al lado es el mismo: si
alguien inserta una columna entre L y M, `vis_totales` pasa a leer `% Cobertura` **y nadie se
entera**.

⭐⭐ **El reemplazo es la IDENTIDAD DE LOS BLOQUES, y es más fuerte que un encabezado:**

```
M (acumulado)  =  R (Meta)  +  W (Google)  +  AB (Programmatic)
```

**Verifica la POSICIÓN y la SEMÁNTICA a la vez.** Un encabezado sólo dice *«el título de esta letra
es el esperado»* —y puede coincidir con la columna equivocada cuando el título se repite—; **la suma
sólo cierra si las cuatro posiciones son las cuatro que se creen**. Lo corre
`verificarBloquesPostReuniones()`.

⭐ **Y de paso confirma el ORDEN de los bloques**, que es la otra decisión del usuario del 25/08:
**el primero es el ACUMULADO**, después Meta, Google y Programmatic. Si el equipo reordenara, la
suma no cerraría y el testigo lo diría.

**Medido sobre el fixture del 20/08: 66 de 66 filas evaluables cierran.** Las otras 36 traen `-` en
**las tres** plataformas y no se pueden evaluar — **se informan aparte y no cuentan como fallo**,
porque si no el testigo daría rojo por una carga incompleta y dejaría de distinguir una columna
corrida.

⚠ **Cero evaluables FALLA**, y es deliberado: *«no se probó nada»* no puede leerse como *«todo
bien»*. Una columna corrida que dejara las cuatro fuera de rango daría verde sin esa guarda.

##### ⭐ Lo que se recupera: `L-036` vuelve a tener identidad interna

Con `Visualizaciones` de vuelta, **`%VTR = Visualizaciones / Impresiones` cierra exacta en 98 de
98**. Eso pone a `L-036` **al nivel de `V-111` y `V-113`**: las tres láminas con un control que **no
depende del deck del equipo ni de una foto de la base**, así que **se puede exigir en cada corrida**.

---

**`D-32` — El sembrador **nunca pisa un `uso` que ya existe en `SOLAPAS`**. La hoja manda; la
diferencia se reporta.** (14/08/2026)

**El caso, con fecha.** El 14/08 la Parte B del `2026-08-14_1` corrió
`aplicarClasificacionSolapas_()` y cambió `digital/CAMPAÑAS_DESGLOCE_DIGITAL` de `uso = fuente`
—como la había dejado el usuario ese mismo día— a `ignorar`, porque el seed seguía declarando
`ignorar` por una medición de `R-22` del 09/08 **que ya había vencido**. Esa solapa es la fuente
de los seis `u1_*` del "1 a 1": con `ignorar`, el motor deja de leerla y los seis salen vacíos
**sin que ninguna verificación del proyecto lo señale**. La corrida no falla, **publica menos**.

**La causa no era el valor del seed: era que `origen = 'manual'` no se alcanza por el camino que
la gente usa.** El escape existía —una fila `manual` nunca se pisa— pero **editar la hoja a mano
no pone `manual`**, así que toda decisión humana quedaba indistinguible de una fila sembrada.
Un escape que sólo se activa escribiendo una columna que nadie sabe que hay que escribir no es un
escape.

**Qué cambia.** Si la fila existe y su `uso` difiere del seed, **gana el de la hoja**. La
diferencia sale por `usosConservados`, y el resumen marca aparte las que **habrían sacado la
solapa de `fuente`**.

**Qué NO cambia**, y hay que decirlo porque es la mitad que hace que siga sirviendo:

- una solapa **nueva** —sin fila en la hoja— toma el `uso` del seed. Así nace toda clasificación;
- **las demás columnas se siguen sembrando**: `notas`, `fila_encabezado`, `ventana_ref`,
  `campo_id_cuenta`. El gate es sobre `uso`, no sobre la fila;
- `origen = 'manual'` **sigue existiendo** y sigue protegiendo la fila entera. `D-32` no lo
  reemplaza: cubre el caso en que nadie lo puso.

**Sólo `fuente` cuenta como degradación**, y es a propósito. `buscarMapeo` acepta únicamente
`fuente`, así que salir de `fuente` **apaga la lectura** y todo lo demás sólo cambia la etiqueta.
Marcar cualquier cambio de `uso` como degradación habría hecho el aviso ruidoso, y un aviso
ruidoso se ignora — que es exactamente cómo se pierde el próximo caso.

**Lo que queda abierto, y es la causa de fondo:** `origen` **sigue sin distinguir** *"esto lo
decidió el seed"* de *"esto lo decidió una persona y el seed no se enteró"*. `D-32` cubre `uso`
en `SOLAPAS`; **la ambigüedad de `origen` sigue igual para las demás columnas y para las demás
hojas.** Resolverla es decidir si una edición manual debe marcar `origen = manual` sola, o si el
seed tiene que fallar ruidoso cuando difiere del vivo en vez de pisarlo. **No se decide acá.**

**Instrumento:** `diffSolapasSinAplicar_()` (`Auditoria.gs`), sólo lectura — responde *"¿qué me
va a pisar?"* **antes** de sembrar. Hasta ahora la única forma de saberlo era dejarlo correr y
leer el reporte después, que es como el caso del 14/08 se descubrió cuando ya estaba hecho.

**Control positivo:** `probarGateDeUsoDeSolapas_` (`Pruebas.gs`), sobre la parte pura. Sus
fixtures incluyen `revisar → ignorar` **a propósito, esperando `false`**: sin ese caso, una
implementación que marcara todo cambio de `uso` pasaría igual. Y
`probarGateDeUsoContraLaHoja_`, de punta a punta, que **se abstiene en vez de dar verde** si no
encuentra ningún caso que verificar.

---

**`D-33` — El vocabulario se estructura como **medida + dimensiones**. El corte deja de ser parte
de la identidad del token.** (15/08/2026)

**La simetría que lo funda, y es el argumento entero:** el motor **ya sabe** que una medida se
llama distinto en cada base — para eso está `MAPEO`, que traduce `campo_logico` a columna física.
**Del lado de los cortes no existe nada equivalente**: `filtro` es texto libre, distinto por base,
y el corte además vive **metido en el nombre del token**. `D-33` le da a las dimensiones lo que
`MAPEO` ya le daba a las medidas.

**Medición que lo funda** — `MARCADORES` al 15/08/2026, **78 marcadores, todos `informe_id = jm`**:

| dimensión | valores | expresión física, medida base por base |
|---|---|---|
| **`ambito`** | `jm` · `gcba` | `rdv/RVD JM-CM - ES`: `figura=Jorge Macri` / el resto · `digital/Directa Mail`: `mail_remitente=jorge.macri@…` / `!=` · `looker/DIGITAL`: `nombre_campaña~=JM` / `!~=JM` · `looker/resumen_metricas_dinamico`: `campana~=JM` / `!~=JM` |
| **`plataforma`** | `meta` · `google` · `programmatic` | `Plataforma=Meta` / `=Google ads` / `!=Meta && !=Google ads` — el tercero **por resta**, que es `R-24` |
| **`tipo_envio`** | `convocatoria` · `m2` | `mail_tipo=Convocatoria` / `mail_tipo~=M2` |

**`ambito` aplica también en `rdv`**, con el mismo criterio que en las otras tres: `Jorge Macri`
es `jm`, todo lo demás —ministros incluidos— es `gcba`.

### `gcba` es *todo lo que no es `jm`*, y eso se declara en voz alta

**La negación se conserva como implementación**, porque es lo que las cuatro bases ya hacen. Pero
deja de ser un accidente heredado y pasa a ser una decisión con su nombre, **y con su límite
escrito**:

⚠ **Una fila sin `figura`, sin remitente o sin nombre de campaña cae en `gcba`** — no queda
afuera de las dos. Hoy funciona así en las cuatro bases. **El día que haga falta distinguir *"es
GCBA"* de *"no está clasificado"*, esto se rompe**, y ése es el síntoma que hay que buscar: un
`gcba_*` que crece sin que nadie haya cargado campañas nuevas.

### Qué **no** es dimensión, y por qué la frontera importa

**Las guardas `!=0` (nueve) y `estado=Activa` quedan como `filtro` y no migran.**

**Una dimensión es un corte que alguien del equipo pediría** —*"sólo Meta"*, *"sólo Jorge
Macri"*—. **Una restricción técnica es una regla de validez de la fila.** Las nueve `!=0` son la
contracara de `R-18`: descartan filas donde el cero es un *"Revisar"* disfrazado, no un valor. Y
`estado=Activa` **nunca aparece sola** — siempre acompaña a un corte de ámbito.

Confundirlas convertiría cada guarda en un valor de dimensión que nadie va a pedir nunca, y el
vocabulario dejaría de ser legible, que es lo único que lo justifica.

### La ventana no entra: `periodo_ref` está vacío en los 78

Medido. **La ventana se resuelve entera por la cadena de `D-20`**, así que el desfasaje de un día
de SECCO —el argumento más fuerte a favor de globalizar— **no toca el vocabulario**: es la misma
medida con otra ventana, y la ventana ya se resuelve por informe. `periodo_ref` es una columna
disponible y sin consumidores.

### La línea base de la migración

**`docs/_snapshots/MARCADORES_2026-08-15.tsv`** — el estado del cableado que funciona, tomado
**antes** de tocar nada. **Cada tanda se compara contra ese archivo, no contra la corrida
anterior**, para que los errores no se acumulen de tanda en tanda sin que nadie los vea.

**No se crea ningún mecanismo de backup aparte**, y es deliberado: sería una segunda copia de lo
mismo, y la gracia del snapshot es justamente que **no sale del código que se está migrando**.

### Precedencia entre `informe_id = '*'` y un informe concreto: **se cae**

No hace falta un régimen de dos sistemas. `S-05` está vivo —hay un solo lector— y estamos en
desarrollo. Si alguna vez se quiere un override explícito por informe, se decide entonces.

### ✅ El piloto de `D-33` PASÓ — 16/08/2026 · y el criterio que lo decidió

**Los ocho marcadores de `looker/DIGITAL/Impresiones` quedan migrados y verificados. Esto
autoriza el frente 13, la migración por tandas.**

**Ventana:** la que el motor resuelve por defecto, **24–30/07/2026** (`CONFIG`, origen `config`).
La misma en las dos tomas.

| toma | cuándo | estado |
|---|---|---|
| **testigo** | **15/08/2026 21:26** | antes de migrar · `docs/_snapshots/TESTIGO_impresiones_2026-08-15_2126.md` |
| *(la migración)* | 15/08 22:40 | `migrarPilotoDeImpresiones()` |
| **Parte C** | **16/08/2026 11:58** | después de migrar |

*(Hubo dos intentos de Parte C fallidos el 15/08 — no por la migración, sino porque `looker`
estaba recalculando. El canario los detectó.)*

#### El criterio que lo decidió, y es lo que hay que reusar en cada tanda

**Mismas filas y otro número es la fuente. Otras filas sería la migración.**

| # | qué se miró | resultado |
|---|---|---|
| 0 | **el canario `gcba_frecuencia`**, sin migrar | **volvió de `0` a `1,6409`** → `looker` estable, el log se puede leer |
| 1 | **las ocho cuentas de filas** de la traza | **idénticas**: 46, 313, 14, 12, 20, 82, 84, 147. **La dimensión lee exactamente las mismas filas que leía el filtro** |
| 2 | los valores | subieron **entre 0,3% y 2,1%, todos en la misma dirección** |
| 3 | **el descuadre** `total = suma de partes` | **cero exacto en los dos ámbitos** |
| 4 | **la prueba independiente**: `frecuencia`, **sin migrar** | subió de **12,63 a 13,20**. Se movió **la base**, no el motor |

**El paso 1 es el que decide y el 4 es el que lo confirma desde afuera.** Si la dimensión
tradujera mal la condición, **cambiaría la cuenta de filas** —no sólo la suma—, y no cambió. Y un
marcador que la migración **no tocó** se movió en la misma dirección, que es lo que descarta al
motor como causa del movimiento.

#### ⚠ El límite honesto: **esto NO se verificó por igualdad de valores**

**Y no se podía.** Con `looker` recibiendo datos de una ventana ya cerrada —el 15/08 movió
**138.427 impresiones en 1h45**— **el valor absoluto no es un testigo estable**, y exigir igualdad
habría dado un rojo falso.

**Se verificó por identidad de filas + descuadre en cero + canario.** Que quede dicho con todas
las letras, **no vaya a leerse como una comparación exacta que nunca hubo**: los ocho números de
hoy **son distintos** a los del testigo, y eso está bien.

#### Dos reservas que no cambian el veredicto, y que la próxima tanda tiene que evitar

- **El testigo NO guardó las cuentas de filas**, que son **el criterio principal**.
  `TESTIGO_impresiones_2026-08-15_2126.md` tiene los ocho valores y el descuadre, y las ocho
  cuentas sobrevivieron sólo porque quedaron citadas en `BITACORA.md` y en el Addendum 3 del
  prompt. **El artefacto diseñado para comparar omitió justo el número contra el que se compara.**
  → El prompt de la tanda 1 lo exige explícitamente.
- **Tres de los ocho valores base están inferidos, no confirmados.** El propio testigo lo dice:
  los `gcba_imp_{meta,google,prog}` traen el valor pero **su asignación a cada token se dedujo del
  orden de la suma**. **No afecta al cierre** —el descuadre usa la suma, que es la misma en
  cualquier orden, y el criterio es la cuenta de filas— pero **la comparación uno a uno de esos
  tres no es firme**, y no debe citarse como si lo fuera.

### ✅ Tanda 1 CERRADA — 16/08/2026 · y acá el criterio fue **más fuerte** que en el piloto

**Los ocho `mail_*`/`gcba_mail_*` de `digital/Directa Mail` quedan migrados a `ambito` y
verificados. 16 de 78 marcadores migrados.**

**Ventana:** la misma en las dos tomas. **Parte A: 16/08 22:20**
(`docs/_snapshots/TESTIGO_mail_2026-08-16_2220.md`). **Parte C: 16/08, después de migrar**
(`TESTIGO_mail_2026-08-16_ParteC.md`).

| control | resultado |
|---|---|
| **0 · canario** `enc_atendidos`/`ivr_atendidos` | **71.234**, 2 de 60 — **igual en las dos tomas** |
| **1 · filas** | **7 de 311** (`jm`) · **80 de 1.928** (`gcba`) — **idénticas** |
| **2 · valores** | los ocho, **idénticos dígito por dígito** |
| **3 · partición** | **311 + 1.928 = 2.239** ✔ |

#### ⚠ Reprodujo por **igualdad exacta**, y eso NO significa que siempre se pueda

**La ventana de julio de `digital` no se movió**, así que admitió la comparación exacta — la que
el prompt del piloto pedía originalmente y **allá no se pudo**. El piloto se cerró por *identidad
de filas + descuadre + canario*, con los ocho números **distintos**.

> ⚠ **Corrección del 17/08/2026 — no es que `digital` esté quieta.** Entre el testigo de la tanda
> 1 (16/08 23:31) y una corrida del 17/08 12:54, **`digital/Directa Mail` creció**: universo
> **2.239 → 2.241**, `convocatoria` **359 → 361**, `m2` **745 = 745**. **Las dos filas nuevas caen
> FUERA de la ventana**: en ventana sigue dando 11 de 361 y 25 de 745, y los siete valores de
> `m2_*` son idénticos.
>
> **Lo que sostuvo la verificación de la tanda 1 no fue que la base esté quieta, sino que la
> ventana cerrada de julio no se mueve.** Son dos cosas distintas, y la segunda es más chica y más
> verdadera.
>
> **Es la misma distinción que el prompt de `rdv` ya tenía escrita** —*"un «no se movió» en una
> ventana cerrada no prueba que nunca se mueva"*— **y que no se había aplicado a `digital`.**

**Lo que admite cada base depende de qué se compara, no sólo de qué base es:**

| base | qué se midió | criterio que admite |
|---|---|---|
| `digital`, **en ventana cerrada** | 11 de 361 y 25 de 745, estables | **igualdad exacta de valores** |
| `digital`, **universo completo** | 2.239 → 2.241 en 13 horas | **se mueve: no admite igualdad** |
| `looker`, en ventana cerrada | 138.427 impresiones en 1h45 | **identidad de filas + invariante + canario** |

**Y está medido, no supuesto:** en la misma hora, `looker` movió `imp_total` de **34.289.779 a
34.293.287** mientras los ocho de mail no cambiaron ni un dígito. **El instrumento distingue una
base viva de una quieta**, que era la duda de fondo del piloto. ⚠ **Con la precisión del 17/08: lo
que estaba quieto era la ventana, no la base** — `looker` movía datos **dentro** de una ventana
cerrada y `digital` sólo **fuera** de ella.

#### El control fue la partición, y `mail_or` no lo era

**`mail_or` se cumple por construcción**: comparte filtro con `mail_aperturas` y
`mail_entregados`, así que el `PCT` es el ratio de dos sumas **sobre las mismas filas** y un corte
mal traducido lo dejaría igual. Lo reemplazó la **partición de ámbito**, que es **disjunta y
exhaustiva** y vive en la **cuenta de filas**. ⚠ Los `m2_*` **no entran** en esa suma: cortan la
misma solapa por `tipo_envio` y toman 745 de las 2.239, **superpuestas con las dos ramas**.

#### Los consumidores, y una diferencia con el piloto

**Tres tokens están en dos láminas** —`mail_entregados`, `mail_aperturas` y `mail_or`, en la 2 y
la 5—, contra **uno solo** en el piloto. **El mismo token en dos láminas tiene que dar el mismo
número en las dos**; si difiere **no es la migración**, es la lámina 5 (`R-15` addendum 1).

**Y la partición de láminas ya no coincide con la de ámbito.** En el piloto era limpia —los `jm`
en la 2, los `gcba` en la 3—; acá los `jm` se reparten entre la 2 y la 5.

### ✅ Tandas 2 y 3 CERRADAS — 17/08/2026 · **40 de 48 migrados**

**Las dos por igualdad exacta de valores**, y las dos con **verificación en la misma sesión**.
Evidencia: `docs/_snapshots/TESTIGO_tandas_2_y_3_2026-08-17.md`.

| tanda | qué | testigo | migración | verificación | intervalo |
|---|---|---|---|---|---|
| **2** | los siete `m2_*` → `tipo_envio=m2` | **13:59** | **14:04** | **14:10** | 11 min |
| **3** | los 17 de `rdv` → `ambito=jm` | **14:19:06** | **14:19:39** | **14:24:58** | 5 min 52 s |

**Tanda 2 · controles:** canario `enc_atendidos`/`ivr_atendidos` en **71.234** · los siete
**idénticos** · cobertura **`361 + 745 + 1.136 = 2.242`** · **universo sin moverse entre tomas**.

**Tanda 3 · controles:** los 17 **idénticos** · **las 17 cuentas de filas iguales entre sí, 4 de
15** · **identidad de canales exacta en 2.307**. **Sin canario y sin necesitarlo:** los 17
comparten filtro, así que no existe ninguno posible en `rdv`, y los dos controles estructurales
**no dependen del drift**. ⚠ Los cinco `_pct` **no cuentan**: se cumplen por construcción.

#### Lo que estas dos tandas probaron sobre el método, y es reutilizable

**La verificación en la misma sesión funciona, y es lo que destrabó `rdv` sin esperar días.** Con
**minutos** entre tomas el drift no alcanza a intervenir, y si interviniera **las cuentas de filas
lo delatarían antes que los valores**.

**Vale aunque la base se mueva:** `digital` crece de a una o dos filas por hora —2.239 → 2.241 →
2.242 en un día— y aun así los siete `m2_*` dieron idénticos, **porque en once minutos no se
movió**. **La pregunta no es si la base está quieta, es si se mueve dentro del intervalo**
(`CLAUDE.md` §4).

⚠ **El universo estable entre tomas es lo que hizo legible la cobertura**, y no estaba
garantizado. Si hubiera crecido, el `RESTO` habría cambiado **sin que la migración tuviera nada
que ver** — por eso el orden de lectura empieza por *"¿creció el universo?"*.

### Addendum 2 a `D-33` — 17/08/2026 · **el alta también, no sólo la migración**

> El cuerpo de `D-33` no se edita. Esto cierra el hueco que dejó: la decisión se escribió para
> **reordenar lo que ya existía**, y no decía nada sobre **lo que se da de alta a partir de ahora**.

**Todo marcador nuevo nace con el corte en `dimensiones`. Nunca en `filtro`, nunca en el nombre.**

`filtro` queda **sólo** para **restricciones técnicas** —`estado=Activa`, las nueve guardas
`!=0`—, que son reglas de validez de la fila y no cortes que alguien del equipo pediría. **Es la
misma frontera que `D-33` trazó para migrar**, aplicada en la otra dirección.

**Por qué hace falta decirlo aparte, habiendo migrado 42 marcadores:** una migración **ordena el
pasado y no obliga al futuro**. La forma vieja siguió siendo la más fácil de escribir —un texto en
`filtro` y listo— y **no falla**: publica un número correcto con el corte en el lugar equivocado,
que es exactamente cómo llegaron a ser 42. **El primer cableado con apuro reinstala el problema**,
de a un marcador por vez y sin que nada lo señale.

⚠ **Y el error simétrico, que ya tiene un caso vivo:** `enc_impresiones` lleva
`filtro = imp_totales!=0` con `dimensiones` vacío, **y está bien**. No tiene corte: tiene una
guarda. Vaciarle el `filtro` "para ser consistente con los 42" sería romperlo. **Un marcador sin
corte lleva `dimensiones` vacío**, y ausente significa **«todas»** — no se inventa un valor `todas`.

**La forma operativa está en `CLAUDE.md` §2**, que es donde lo lee quien está por escribir la fila.

### Addendum 1 a `D-33` — 16/08/2026 · **la ventana pertenece al informe, no al token**

> El cuerpo de `D-33` no se edita. Esto agrega una propiedad del vocabulario global que no
> estaba dicha y que, sin decirla, se lee como un error.

**Un token compartido entre `jm` y `secco` va a dar números distintos, y los dos van a estar
bien.**

El motivo es que **la ventana es una propiedad del informe y no del token**: el mismo
`imp_total`, con la misma medida, la misma base y las mismas dimensiones, resuelve una ventana
distinta según para qué informe se esté corriendo. No hay nada que corregir cuando eso pasa.

**Por qué esto tiene que estar escrito acá y no en otro lado.** Es el lugar donde va a buscar
quien dude, porque la duda nace justo del vocabulario global: **compartir el token es lo que hace
que los dos números sean comparables a simple vista**, y por eso mismo invita a compararlos. La
primera vez que alguien mire los dos decks al lado, la diferencia va a parecer un bug —y
"corregirla" sería romper dos informes correctos para que coincidan.

**El caso concreto que lo motivó, medido el 16/08:** `secco` se genera el **jueves a la noche** y
`jm` el **viernes al mediodía**. Son unas **15 horas** de diferencia, y no es un redondeo — el
15/08 medimos que `looker` movió **138.427 impresiones en 1h45**, o sea que la ventana de drift
en juego es **ocho veces** ésa.

⚠ **Y la contracara, que hay que decir junto o la propiedad se lee como permiso:** esto **no**
significa que cualquier diferencia entre los dos informes sea legítima. Significa que **la
ventana se descarta primero**. Si las dos corridas usaron la misma ventana y el número difiere,
eso sí es un hallazgo.

⚠ **Estado real del mecanismo al 16/08, para que la propiedad no se lea como ya implementada:**
la cadena de `D-20` **no tiene eslabón de informe** —sus cinco eslabones son campaña →
`periodo_ref` del marcador → sección → `CONFIG` → `R-11` calculado, y `resolverVentana` **ni
siquiera recibe `informe_id`**—. Hoy `jm` y `secco` resuelven **exactamente la misma ventana**,
porque caen los dos en `CONFIG`, que es **un único par de celdas global**. La ventana por informe
se puede forzar **a mano**, pasando `periodoId` a `generarInforme` —el panel ya lo expone—, pero
**no se resuelve sola**. La propiedad de arriba describe cómo tiene que comportarse el motor, y
el eslabón que falta es prompt propio.

### Estado de `D-33` al 26/08/2026 — **quedó a medias, y lo que falta tiene nombre**

> **Esto NO es una `D-NN` nueva: no hay decisión todavía, hay un diagnóstico.** Va acá, al lado de
> `D-33`, porque es su estado. El cuerpo de `D-33` y sus dos addenda **no se editan**.
>
> ⛔ **Existe porque este análisis se hizo dos veces** —el 14/08 al fundamentar `D-33` y el 26/08— y
> las dos veces hubo que reconstruir desde cero por qué `imp_*` funciona y `cc_*` no. Medido por
> `docs/Prompts/2026-08-26_1_D33_a_medias_medir_corte_por_lamina.md`.

**Qué resolvió `D-33`, y el argumento sigue siendo el correcto.** La dimensión «ámbito JM/GCBA»
estaba escrita de **cuatro formas físicas** según la base —`figura=Jorge Macri`,
`mail_remitente=…`, `dig_jm_gcba=JM`, `campana~=JM`— en un `filtro` de texto libre, y el corte
además vivía **metido en el nombre del token**. El motor ya sabía que una medida se llama distinto
en cada base —para eso está `MAPEO`—; del lado de los cortes no había nada equivalente. **`D-33` les
dio a las dimensiones lo que `MAPEO` ya le daba a las medidas.**

⛔ **Qué NO resolvió: la unidad de cableado sigue siendo *un token = una fila = un número*.**

| | un semantic layer (dbt · LookML · Cube) | el motor hoy |
|---|---|---|
| la **medida** | se define una vez | ✅ `campo_logico` + `MAPEO` |
| la **dimensión** | se define una vez, con sus valores | ✅ `DIMENSIONES_` |
| **la combinación** | **la produce la CONSULTA al pedirla** | ⛔ **una fila y un nombre por cada una** |

⭐ **Por qué `imp_*` funciona y `cc_*` no — es la misma arquitectura, y el caso que la rompe es que
la CONSULTA no puede aportar el corte.** `imp_meta` · `imp_google` · `imp_prog` son tres celdas del
cubo con **tres filas y tres nombres**, y eso funciona **mientras cada combinación tenga nombre
propio**. Se rompe cuando **dos láminas quieren la misma medida con universos distintos**, porque el
nombre es uno solo y la plantilla —que es la consulta— **no puede llevar contexto**: `{{cc_base}}`
es el mismo texto en las dos.

**La evidencia, medida el 26/08 y no citada:**

- **`MARCADORES` no tiene `lamina_id`.** Sus 15 columnas son `marcador · familia · informe_id ·
  base_id · solapa · campo_logico · periodo_ref · operacion · valor_fijo · filtro · dimensiones ·
  formato · catalogo · separador · notas` (snapshot `MARCADORES_2026-08-26.tsv`).
- **`resolverMarcadores` filtra sólo por informe** — `suyo === informeId || suyo === '*'`
  (`Generador.gs:1105`). **Una fila pinta las dos láminas con el mismo número.**
- ⚠ **La migración `2026-08-20_7` no resuelve esto:** `aplicarAsteriscoCompartidos()` pone
  `informe_id = '*'` para compartir entre **informes** (`jm` y `secco`). **Es el eje opuesto.**

---

#### ⭐⭐ Lo que la medición del 26/08 agrega, y cambia el tamaño del problema

**1 · El eje por lámina YA EXISTE y está en producción — pero sólo dentro de secciones con ítems.**
La etapa 3 resuelve **por lámina** (`opciones.solo_marcadores = tokensDeSlide_(slide)`) y pinta
**por lámina** (`slide.replaceAllText`, `Generador.gs:4697`), con contexto propio del ítem. La
etapa 4, en cambio, resuelve **por informe** y pinta con **`ctx.presentacion.replaceAllText`** —
**la presentación entera** (`Generador.gs:4007`). ⛔ **No es que falte el mecanismo: es que las
láminas que no cuelgan de una sección con ítems no lo alcanzan.**

**2 · Y eso está verificado con una identidad interna, en el deck del 22/08** (corrida de las 14:02
sobre `agosto_14_20`, sha `cd6f0050…fcd353b3`): `ecv_inscriptos` publica **983** en `L-034` y
**855** + **128** en las dos láminas de encuentro — **855 + 128 = 983**; `ecv_asistentes`,
**186 + 10 = 196**. **Las partes suman el total: el corte por ítem no sólo existe, es correcto.**

**3 · ⛔⛔ El problema NO es prospectivo: cinco tokens YA publican el universo equivocado.** El
análisis previo nombraba tres `cc_*`; medido contra la plantilla, `L-031` y `L-034` comparten
**ocho** tokens, y **cinco tienen fila y ya se publican**:

| token | `L-031` (Resumen Ejecutivo, semana entera de JM) | `L-034` (universo declarado: agregado del temario, `ENCUENTROS: 2`) |
|---|---|---|
| `imp_total` | 28.988.260 | ⛔ **28.988.260** |
| `mail_entregados` | 538.276 | ⛔ **538.276** |
| `mail_aperturas` | 210.707 (39.1 %) | ⛔ **210.707 (39.1 %)** |
| `mail_or` | 39.1 % | ⛔ **39.1 %** |
| `ivr_atendidos` | `-` | `-` |
| `cc_base` · `cc_contactados` · `cc_contact_pct` | `/////` | `/////` — **sin fila al 26/08** |

⚠ **Y el contraste que lo vuelve visible está DENTRO de `L-034`:** publica «INSCRIPTOS 983 ·
ASISTENTES 196 · ENCUENTROS 2» —universo del temario— **al lado de** «Mails entregados 538.276» —
universo de la semana entera—. **Dos cajas contiguas, mismo formato, que se leen como si
respondieran la misma pregunta.** Es `C-80`, y es el modo de falla más caro de este repo: *un
universo más ancho nunca es una degradación aceptable de un universo recortado*.

⭐ **El contrapunto que lo prueba:** la lámina de encuentro publica **17.472** mails entregados —
no 538.276— porque usa **`enc_mails_entregados`**, un token **con otro nombre**. **El proyecto ya
resolvió este mismo problema por renombre tres veces** (`enc_*` frente a `mail_*`, el prefijo
`gcba_` de `L-032`, los `u1_*`). La pregunta abierta es si la cuarta vez se hace igual o con motor.

**4 · El reparto de los tokens compartidos.** ⚠ **El «27» que circulaba no se pudo reproducir:
ningún censo de tokens-por-lámina del 26/08 existe en el repo, y la única plantilla en disco
—`Plan Inicial/_archivo/Plantillas/JM_marcada.pptx`, 22 láminas y 191 tokens contra 24 y 343 vivos—
está declarada vieja por `docs/CENSO_tokens_sin_fila_2026-08-22.md`.** Lo medido contra fuentes
vivas:

| montón | cuántos | cuáles |
|---|---|---|
| **A · mismo hecho** | ≥ 9 | `camp_titulo` (8 láminas, mismo texto en las 7 de cada campaña — **control positivo**), `camp_remitente`, `periodo` |
| **B · corte distinto, YA RESUELTO por sección** | 6 | los `ecv_*` de `L-034`/`L-035` — verificados por la identidad de arriba |
| **B · corte distinto, ABIERTO** | **8** | los cinco publicados + los tres `cc_*` sin fila |
| **C · no clasificable** | 0 | — |

**5 · Qué costaría que `LAMINAS` declare dimensiones.** ✅ La hoja ya está en las tres listas
duplicadas (`tools/listas.js` verde, 11 de 11), así que **una columna nueva no las toca**: entra por
`COLUMNAS_DELTA_.LAMINAS` sin recrear la hoja —recrearla borraría el sellado, irreproducible sin
volver a tocar las notas de las plantillas—. ⚠ **Dos correcciones al camino que parecía obvio:**

- **El punto de inyección NO es `datosDeMarcador_`.** `opciones` viaja hasta ahí, pero el corte se
  compone **después**, en `resolverMarcadores` (`Generador.gs:1223-1250`), donde `filtro_seccion` y
  `condicionesDeDimensiones_` se suman. Ése es el lugar.
- **`LAMINAS.filtro` no es «la mitad que ya existe» para este caso.** Se evalúa **por ítem**
  (`laminaEntraParaItem_`, `Generador.gs:5623`), dentro de una sección repetible. `L-031` cuelga de
  `resumen_ejecutivo`, que es `modo = unica` y **no tiene ítems**: ahí ese filtro nunca corre.
- ⛔ **Y el pintado es el trabajo real, no un detalle:** mientras la etapa 4 use
  `presentacion.replaceAllText`, resolver por lámina no alcanza — **la segunda lámina pisaría a la
  primera en todo el deck**. `agruparTokensPorLamina_` (`D-41`) hoy **evita** el problema asignando
  cada token compartido a **su primera lámina**, con el motivo escrito: *«podría resolverlo en otra
  tanda y publicar dos valores distintos del mismo token en el mismo deck»*. **Esa guarda es
  justamente lo que habría que dar vuelta.**

**6 · La alternativa barata, para poder compararlas.** Renombrar en la plantilla los **8** tokens
del montón B abierto, en **`L-034`** (`L-031` conserva los suyos). Es lo que el proyecto ya hace
—`L-032` publica *«los mismos de la 2 con prefijo `gcba_`»*— y no necesita motor: 8 tokens en 1
lámina, 8 filas nuevas en `MARCADORES`. ⚠ **Su costo no es hoy sino la próxima vez**: es la cuarta
aplicación del mismo parche, y cada una vuelve a poner el corte en el nombre, que es exactamente lo
que `D-33` sacó de ahí.

⚠ **Y `L-034` no se puede cerrar sin resolver esto** —aunque los resúmenes queden para después—:
**comparte ocho tokens con `L-031` y cinco ya publican el universo de la otra.** La lámina parece
independiente y no lo es. Lo relacionado que ya estaba escrito, disperso: los siete `ecv_*`
ambiguos «entre la lámina 5 y la 6» y los pares `enc_*`/`ivr_*` «que las láminas 2 y 5 usan», los
dos en Backlog — **son este mismo problema, visto de a una familia por vez.**

**`D-34` — Un número que existe y no está validado se publica ENTRE GUIONES. No se retiene.**
Decisión del usuario, 20/08/2026, ejecutada por `docs/Prompts/2026-08-20_7_cerrar_para_generar.md`.

| situación | qué sale en el deck |
|---|---|
| hay número y está validado | **el número** |
| **hay número y no está validado** | **`-1.234-`** — sufijo `_revisar` en `MARCADORES.formato` |
| no hay fuente para el token | `/////` — sin fila en `MARCADORES` |
| hay fila y falló | `---` |
| se preguntó y no había dato | `-` |

**Por qué esto NO contradice el principio de siempre.** *Plausible pero equivocado* sigue siendo el
enemigo del proyecto — y **un número entre guiones ya no es plausible**: se declara sospechoso en
la cara del deck, delante de quien lo lee. Retenerlo no lo vuelve más verdadero; sólo lo vuelve
invisible, y un hueco donde había un dato es **otra** afirmación falsa.

⭐ **La frontera, escrita con las dos palabras que la separan: desconfiar de un número no es lo
mismo que inventar uno.**

- **Se publica entre guiones** lo que el motor calculó y nadie validó. Hay número; falta el aval.
- **NO se publica** lo que no tiene fuente. `m2_campanias` es el caso: ninguna columna reproduce el
  `12` del deck, y la candidata **cambió de grano entre dos exports** —11 valores de proyecto el
  31/07, 18 de envío el 06/08, sobre las mismas 25 filas de una ventana cerrada—. **Ahí no hay
  número del que desconfiar.** Sale `/////`, que es la verdad: nadie lo cableó porque no hay de
  dónde.

**Qué gobierna esto de acá en adelante:** todo el cableado que falta. Un token nuevo que produce un
número **entra con `_revisar`** y sale de ahí cuando un caso `V-` lo valide, no antes. Es lo que
permite que el deck avance sin que ninguna corrida publique una certeza que nadie tiene.

**La medición que la hizo urgente, del 20/08:** `MARCADORES` tenía **32 filas con `SIN VALIDAR` en
`notas` y sólo 3 con formato `_revisar`**. El mecanismo existía desde el 19/08 y estaba usado en 3
de 87 filas — o sea que **29 números se publicaban con la misma cara que los validados**.

⚠ **Supersede en la práctica a la lectura restrictiva de `S-05` punto 3**, sin derogarla: aquélla
difería los símbolos hasta que hubiera lector externo, y el `2026-08-20_1` ya los metió como modo
sin retirar el crudo. `D-34` es el paso siguiente — no cambia **cómo** se rinde un hueco, cambia
**qué se hace con un número dudoso**. Los dos mecanismos conviven y son independientes.

### El cruce `jm` / `secco`, medido el 20/08/2026

Los dos censos son **autoritativos** —`censarTokensSinMarcador()` y `censarTokensSinMarcadorSecco()`,
corridos a las 13:02 y 13:11— y el instrumento **calibró**: la lectura independiente por el conector
de Drive coincidió lámina por lámina, 19 de 19, sin un token perdido.

| cruce | tokens | reparto |
|---|---|---|
| **secco con fila `jm` ya escrita** | **49** | `enc_` 20 · `ecv_` 13 · `camp_` 9 · `m2_` 7 |
| ⭐ **sin fila en las DOS plantillas** | **56** | **44 son `camp_`** |
| sólo secco | 62 | `conv_` 13 · `rep_` 11 · `emin_` 10 · `et_` 9 |
| sólo jm | 203 | `camp_` 50 · `u1_` 32 · `post_` 29 · `m2_` 23 · `gcba_` 19 |

⭐ **Los 56 compartidos sin fila son el lote más rentable que queda**, y por eso el número está acá y
no en un reporte: **cablear uno sirve para los dos informes a la vez**, y 44 de los 56 son de una
sola familia. Es el frente que conviene tomar antes que cualquier otro cableado.

**Las dos afirmaciones del usuario quedaron confirmadas con instrumento:** `gcba_*` son **19 y
ninguno está en secco** —son los agregados del principio que `secco` no tiene—; `emin_*` son **10 y
sólo están en secco**.

⚠ **Pero «casi iguales» no es lo que dicen los números, y hay que verlo antes de armonizar:** 203
sólo en `jm` contra 62 sólo en `secco`. La diferencia **no es de láminas, es de granularidad** — la
lámina de comunicaciones post tiene en `jm` 4 campañas × 8 campos y en `secco` 3 × 2, con la misma
tabla de 7 columnas y sólo dos marcadas. **Armonizar no es poner `*`: es decidir si `secco` sube al
detalle de `jm`**, y eso toca las plantillas — `C-01`, del equipo.

⚠ **Y el censo es evidencia fechada, con un caso que lo prueba:** entre las 12:06 y las 13:02 del
mismo 20/08, las láminas 19 y 20 de `jm` pasaron de 9 y 14 tokens a **31 y 50**. La plantilla se
movió mientras se la medía. Vale el censo de las 13:02.

**`D-35` — Mientras la corrida se corte, ningún deck es evidencia.** El corte va por encima del
cableado en el orden de trabajo. Decisión del usuario, 20/08/2026 (`2026-08-20_9`).

**El dato que lo funda:** la corrida de `jm` del 20/08 a las 15:45 gastó **321 s de un techo de
350** y publicó **9 números limpios sobre 343 tokens**. No es un problema de cobertura: son ~15 s
por valor impreso, y el trabajo no está donde se creía.

⭐ **La consecuencia práctica, y es la que ordena la cola:** cablear un token más no se puede
verificar mientras la corrida no llegue hasta él. Un deck cortado **no prueba ni que el cableado
ande ni que no ande** — sus huecos son de tiempo, no de configuración. Por eso el frente del corte
va antes que cualquier cableado, incluidos los 56 compartidos que `D-34` señala como el lote más
rentable.

⚠ **Y lo que NO autoriza esta decisión: subir el techo.** Apps Script corta a los 6 minutos y el
techo de 350 s existe para cortar antes **con dignidad** — con barrida, con `FALTANTES` escrito y
con la fila de `CORRIDAS` cerrada. Subirlo mueve el problema al límite duro, donde no hay nada de
eso.

### El costo por ítem, y qué pasa con el `2026-08-20_10` — 20/08/2026

El `2026-08-20_11` atacó los 200 s de la pasada por ítem: `leerFuente` no cacheaba el dato y hacía
**304 lecturas completas de solapa por corrida**, que con caché son **40**.

⚠ **Pero el `_10` NO deja de ser urgente, y conviene escribirlo con el número delante.** La corrida
posterior al caché **volvió a cortar**: `jm-20260820-175132`, 311 s de 350, **26 ítems emitidos y 10
sin emitir**. La corrida creció —más ítems, no más costo por ítem— y **el techo sigue quedando
corto**.

⭐ **Lo que cambió es la razón por la que hace falta**, y eso ordena la cola: antes el `_10` habría
sostenido un motor que releía la misma solapa 38 veces por ítem; ahora sostendría uno que
**tiene más trabajo del que entra en seis minutos**, que es el problema que el `_10` viene a
resolver de verdad. **Bajar el costo no volvió innecesario al mecanismo — lo dejó apuntando a la
causa correcta.**

**Y el orden se sostiene igual:** las 49 `*` de `secco` todavía no entraron. Cuando entren, el
deck de `secco` suma sus propios ítems. `D-35` sigue en pie — mientras la corrida se corte, ningún
deck es evidencia.

**`D-36` — La corrida que no entra en seis minutos termina sola, en varias ejecuciones.**
Decisión del usuario, 20/08/2026 (`2026-08-20_10` `v2` + `10.1`). Tres pilares:

1. **La unidad de trabajo es la sección**, y el estado —qué falta— vive en una **hoja**, no en
   `PropertiesService`: tiene que poder **mirarse mientras corre**. Los 9 KB alcanzaban de sobra;
   **la legibilidad es la razón, no el tamaño.**
2. **El deck es el checkpoint.** ⚠ **Y los crudos NO dicen qué falta** — lo dice el plan. Los crudos
   sólo garantizan que **repintar es inocuo**, y las láminas escondidas dejan **49 permanentes**.
3. **Lo caro se persiste y se reusa dentro de la misma corrida.**

⭐ **La condición que hace segura la tercera, y no es negociable: el estado caro se ata al
`corrida_id` y NUNCA se reusa entre corridas.** Dentro de una corrida partida en cuatro ejecuciones
reusarlo es lo correcto —las cuatro tienen que ser coherentes entre sí—; **entre corridas distintas
sería publicar el anclaje del jueves en el informe del viernes, sin fallar.**

⚠ **Y la corrección del `10.1`, medida: el planificador cuenta ASIGNACIONES** —ítem × lámina
modelo—, no secciones ni ítems. **16 ítems lógicos dan 36 asignaciones.** Contar mal la unidad se
equivoca por más del doble.

**Estado al 20/08: Partes A, B y D construidas; la C —persistir el anclaje— NO.** Sin ella cada
ejecución vuelve a pagar 70–80 s de arranque, así que el mecanismo **funciona y todavía no rinde**.

---

**`D-37` — La pertenencia de una lámina a una sección se **declara** en `LAMINAS.seccion_id`, no se
infiere de los tokens que la lámina lleva.** Decisión del usuario, 21/08/2026 (`2026-08-21_10`
Parte B; la implementa el `2026-08-21_11`).

1. **`LAMINAS.seccion_id` es la fuente de la pertenencia.** El generador deja de deducirla con
   `slidesModeloDe_(familia_tokens)`.
2. ⭐ **Las 53 láminas la declaran. No existe una lámina sin sección** — si una no encaja en ninguna
   de las que hay, **se agrega la sección que falta**, no se deja la celda vacía.
3. **La celda vacía deja de significar «hereda».** Pasa a significar *"nadie la clasificó"*: se
   reporta con su `lamina_id` y **no entra a ningún bloque repetible**.
   ⚠ **Esto supersede el comentario del seed de `LAMINAS`** (`Instalar.gs`), que hoy dice lo
   contrario. **La corrección es sólo sobre `seccion_id`**: `modo`, `itera_sobre` y `filtro`
   **siguen heredando**. Y `D-23` ya lo decía — *"identidad y estado propio no se heredan nunca"*—,
   así que esto es aplicarlo, no cambiarlo.
4. **La condición por lámina vive en `LAMINAS.filtro`**, que existe en el esquema desde el `_11` y
   **nunca tuvo lector**. Se evalúa **por ítem**, con la misma sintaxis de `SECCIONES.filtro`.
5. ⛔ **Un ítem que se queda sin ninguna lámina es un invariante roto, no un caso a manejar**
   (decisión del usuario: *"eso no puede pasar"*). Se reporta nombrando sección e ítem y **no se
   emite un deck a medias**.

**Por qué, y conviene decirlo sin exagerar.** El argumento del ahorro existe —deja de escanearse
cada lámina y cada caja de texto una vez por sección repetible— pero ⚠ **no está medido**, y el
usuario decidió avanzar sin medirlo. **La razón verificada es otra: el motor deja de adivinar.**

**Los dos casos que lo fuerzan son el mismo error con dos caras**, y los dos están medidos:

- **La lámina que no pertenece a nada.** `L-053` —el 1 a 1 de `jm`, sellada el 21/08— lleva 32
  tokens `u1_` y **ninguna sección declara `u1_`**, así que hoy no entra a ningún bloque y nadie
  lo reporta. Lo mismo en `secco` con `L-005`.
- **La copia indistinguible del modelo.** `slidesModeloDe_` identifica un modelo **porque lleva
  tokens crudos**, y una copia sin pintar también los lleva — la N² del `2026-08-20_13`.
  ⚠ **Medido el 21/08: `slide.duplicate()` copia las notas del orador**, así que la copia **hereda
  el ancla**. Resolver el modelo por `lamina_id` **no mata la N² por sí solo**; la salida es
  calcular el conjunto de modelos **una sola vez por corrida, antes de duplicar**. ⛔ Borrarle las
  notas a cada copia —0,013 s, medido— **se descarta**: destruiría notas del orador legítimas, y
  hay un documento entero del repo dedicado a rescatar las de `secco` 8 y 25.

**Y lo que `D-37` NO hace:** no retira `familia_tokens`. La columna queda; deja de ser el mecanismo
de pertenencia. Retirarla es la Fase 4 de `D-23` y tiene su propio costo.

> **✅ IMPLEMENTADA el 21/08/2026** (`2026-08-21_11` Partes A–D). `slidesModeloDe_` **dejó de tener
> llamadores**: el bloque de una sección sale de las filas de `LAMINAS`, resueltas por el ancla, y
> `LAMINAS.filtro` se evalúa por ítem. Las 53 láminas declaran `seccion_id` y `rol`; siete declaran
> `filtro`. Control: `tools/probar-laminas-declaradas.js`, 24 afirmaciones con la rotura a propósito.
>
> **Con esto `D-23` cierra su Fase 2 del lado del consumo.** El sello existía desde el `_11` del
> 09/08 y **nadie lo leía**: los únicos lectores de `LAMINAS` eran el censo y el sellador. Ahora la
> hoja gobierna la expansión. ⚠ **La Fase 4 —retirar `familia_tokens`— sigue abierta.**
>
> ⚠ **Y dos cosas que cambiaron en el deck y hay que saber**, porque no son regresiones sino
> consecuencias declaradas: `jm campana` pasó de **8 a 9** láminas modelo y `secco
> comunicaciones_post` de **1 a 2**, las dos por la portada del bloque, que hasta hoy salía una vez
> para todos los ítems. El conteo de `encuentro` **no** cambia —dos por ítem antes y después—;
> cambia **cuál** lámina le toca a cada uno.

---

**`D-38` — El proyecto tiene dos fases y son secuenciales: `informe semanal` primero,
`informe actualizable` después.** Decisión del usuario, 22/08/2026 (`2026-08-22_23` Parte A y su
addendum del mismo día).

1. **`informe semanal`** — el motor genera el deck de `jm` de la semana y **cada número publicado
   está verificado** contra el fixture o contra el deck del equipo. Cuando cierra, la fase **queda
   así**: el motor produce un deck y ahí termina su relación con él.
2. **`informe actualizable`** — un deck ya publicado, sobre el que el equipo trabajó —editó textos,
   agregó láminas, reordenó—, **refresca sus números en el lugar** sin tirar el trabajo humano. Hoy
   volver a generar produce un deck nuevo y pierde todo lo que el equipo hizo encima.

**El motivo del orden, que es lo único que lo hace no negociable:** refrescar en el lugar un número
que todavía no está validado es **automatizar la publicación de un número mal**. La segunda fase
multiplica lo que produce la primera — si eso está mal, lo multiplica igual.

⚠ **Se nombran por su nombre, y el número puede acompañar pero nunca ir solo.** `D-23` ya usa
*"Fase 1 / Fase 2 / Fase 3"* para el sellado de láminas: dos juegos de "Fase N" conviviendo le
piden al lector que recuerde cuál es cuál, y **renombrar cuesta menos que una nota al lado**.

#### ✅ Cómo cierra la fase `informe semanal` — aprobado por el usuario, 22/08/2026

**Cierra cuando el usuario, mirando un deck completo, declara que los faltantes que quedan no son
relevantes.**

⚠ **No hay umbral, no hay conteo, no hay lista de familias obligatorias.** El criterio es de
**revisión humana**: no es una condición que el motor pueda evaluar solo, y no se le inventa una
métrica para que lo parezca.

**Las dos consecuencias que lo vuelven verificable, y van con él:**

1. ⭐ **El criterio no es que no haya faltantes: es que estén a la vista para poder juzgarlos.** Una
   declaración sobre faltantes que no se pueden leer se hace a ciegas — y hoy `FALTANTES` **se pisa
   en cada corrida y no tiene lector fuera del editor**. Eso deja de ser un pendiente más: es **el
   instrumento del cierre de esta fase** (anotado así en `docs/PENDIENTES_consistencia.md`).
2. **La declaración se hace sobre una corrida nombrada**, pegada a un `corrida_id`. *"Estos
   faltantes no son relevantes"* sin corrida **es una frase, no un cierre**.

**Y cinco condiciones más**, que son las que hacen que ese deck sea un deck que se puede juzgar.
Salen de lo ya medido: el testigo `jm-20260821-234927`,
`docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md` y `docs/casos_validacion_2026-08-19.csv`
—**220 filas de caso**, contadas el 22/08.

**Por qué hace falta un criterio y no alcanza con *"el informe sale"*:** el deck de `230048`
**salió**, con seis encuentros de más y **sin que nada fallara**.

⛔ **Y todo se mide contra el testigo, que es `jm-20260821-234927`** —período elegido, temario
correcto, sin corte—. Ninguna conclusión sobre el producto sale de otra corrida sin decir por qué;
la regla y las tres veces que se incumplió están en `docs/PENDIENTES_consistencia.md`.

| # | condición | cómo se verifica | hoy |
|---|---|---|---|
| 1 | **Una corrida entera y nombrada** — un solo deck de `jm` que llegó al final: el archivo **no** conserva el sello `[en proceso]` | el nombre del archivo en Drive y su fila de `CORRIDAS` | ✅ **ya pasó**: `jm-20260821-234927`, sin corte |
| 2 | **El universo correcto** — los encuentros que publica el deck son los del deck del equipo de esa semana, **ni uno más** | contar portadas e icebergs contra el deck del equipo | ⚠ **medido sobre `194602`**, no sobre el testigo: ahí salen los dos, los mismos. Con período calculado, `230048` publicó **seis de más** — es el P1 del 21/08 |
| 3 | **Cada número en su lámina** — ninguna copia con cifras de otro ítem, ninguna portada delante de contenido ajeno, ninguna lámina multiplicada por los ítems de otra sección | recorrer el deck del testigo | ⚠ **sin medir sobre el testigo, y lo que se revisó dio bien.** Ver la nota de abajo |
| 4 | **El usuario declara que los faltantes que quedan no son relevantes** — arriba, con sus dos consecuencias. ⚠ **Reemplaza** a la condición que decía *"cero `/////` que no esté declarado"*: era la misma idea en una forma más exigente y mecánica, y ponía al motor a decidir algo que decide el usuario | revisión humana de un deck completo, sobre una corrida nombrada | ⛔ **hoy no se puede hacer**: los faltantes no se pueden leer fuera del editor. En el testigo son **127 impresos y 277 faltantes** sobre 404 |
| 5 | **Nada que el motor no escribió se lee como de esta semana** — el caso RRSS: un bloque sin tokens sale intacto, con los datos de la semana pasada y **sin marca** | listar las láminas sin tokens y declarar una por una si es intencional | ⛔ abierto (§3.6 del reporte) |
| 6 | **Cada número publicado tiene su caso en estado terminal** —`exacto`, `cerrado`, o `aproximado` con la tolerancia escrita— y **cero `contradice` sobre un número que el deck publica** | cruce del CSV contra los tokens impresos de la corrida testigo | 104 `exacto` · 54 `cerrado` · 20 `contradice` · 13 `abierto` (22/08) |

**7 · Y las seis valen sobre la MISMA corrida.** Un criterio que se satisface eligiendo la mejor
corrida para cada condición no mide el producto: mide el archivo de corridas. ⚠ **Hoy sólo la 1
está medida sobre el testigo** — la 2 sale de `194602` y la 3 salía de `230048`. El reporte dice
que `194602` y `234927` comparten período **y temario**, pero **heredar el temario no es haber
medido el deck**.

⛔ **La condición 3 estaba evaluada contra la corrida equivocada, y se corrige acá.** Las *"tres
copias con tres juegos de cifras"* son de `230048` (§4.1), y las duplicaciones de §4.3 y §4.4 son
de `194602`. **Sobre el testigo nadie la midió.** Lo único que hay es la revisión a mano del
usuario, y **da bien**: la portada dice *Encuentro Temático Salud - Eje Sur* y el iceberg dice
*Parque Patricios* porque **uno es el nombre y el otro el barrio** — no es una portada cruzada.

⭐ **Una dependencia que esta decisión destapa:** la condición 6 **no se puede aplicar hoy**,
porque los estados del CSV **no están declarados en ningún lado** — es lo que mide
`docs/Prompts/2026-08-21_20_estados_del_csv.md`, que hoy se declara ⏸ diferido con la nota *"no
bloquea nada"*. **Con la condición 6 aprobada, bloquea** — no se puede exigir un estado terminal
cuando el vocabulario de estados no está escrito en ningún lado. Sacarle esa nota es trabajo de la
Parte B del `2026-08-22_23`.

⛔ **Lo que el criterio NO exige, y hay que decirlo o se vuelve inalcanzable:** que el motor
reproduzca contra el fixture volúmenes que el fixture no puede sostener. El addendum **A.1** del
reporte del 22/08 ya lo plantea: si las bases de ese zip se bajaron el jueves, **un fixture
desactualizado es un límite del fixture y no un bug del motor**, y esos marcadores quedan sin
resolver **por esa razón dicha** — no con un veredicto que la evidencia no sostiene.

**La fase `informe actualizable` ya tiene su prompt escrito y sin correr:**
`docs/Prompts/2026-08-22_24_refresco_de_deck_publicado.md` — **sólo Parte A, sólo lectura**, un
censo de viabilidad sin diseño. Su §A.1 punto 3 —*¿una lámina repetida conserva algo que diga de
qué ítem es?*— puede cerrar el tema antes de empezar. ⏸ Diferido en su propio encabezado; **no se
agarra hasta que la otra fase cierre**.

**`D-39` — Una lámina puede quedar FUERA DE ALCANCE de la fase `informe semanal`, y eso no es ni
un pendiente ni un cierre: es un tercer estado que saca sus tokens del conteo de faltantes.**
Decisión del usuario, 22/08/2026. Cita a `D-38` y **no la supersede**: le declara el alcance.

**Las tres primeras, y por ahora las únicas:** `L-039` (M2, escondida), `L-048` (Desagregados ·
Respuestas, escondida) y `L-050` (Resumen Ejecutivo RRSS, **que el usuario escondió ese día**).

**Por qué es estructural y no sólo editorial:** `D-38` cierra la fase cuando el usuario, mirando un
deck completo, declara que los faltantes que quedan no son relevantes. **Eso exige que el conjunto
de faltantes sea decible**, y hasta hoy incluía tokens sobre los que **ya se había decidido que no
se hace nada**. Un faltante sobre el que no hay trabajo pendiente no es un faltante: es ruido en el
único instrumento que la fase usa para cerrar.

| dónde vive | qué |
|---|---|
| **la decisión** | `docs/CONFIG_INFORMES.md` §1.11 — es editorial: *qué lleva el informe* |
| **el conteo** | `docs/CIERRE_POR_LAMINA.md`, estado **🚫** — **57 de 192 tokens del censo dejan de ser faltantes; quedan 135**, y cada lámina declara **cuántos tokens le quedan dormidos** |
| **la lista de tokens** | `docs/CENSO_tokens_sin_fila_2026-08-22.md`, que **los sigue listando y está bien**: mide la plantilla, no el alcance |

⭐ **El mecanismo es el de siempre y no se toca: `LAMINAS.escondida` se refleja, no se decide.**
Esconder una lámina lo hace **una persona en la plantilla** (`C-01` addendum 1); el motor la saltea
porque `laminasEscondidas_` lee `isSkipped()` de la plantilla viva. **Ninguna línea de código
cambia con esta decisión** — lo único que cambia es qué se cuenta.

⚠ **Y lo que `D-39` NO hace:** no cierra la **condición 5** de `D-38` —*«nada que el motor no
escribió se lee como de esta semana»*—. Cierra **el caso RRSS**, que era el único medido y el peor:
su primer bloque, sin tokens, publicaba los datos de la semana pasada **sin marca**. La condición
sigue pidiendo el censo de láminas sin tokens, una por una. ⛔ **Y esconder no es arreglar: si
alguien vuelve a mostrar `L-050` sin cablear los 21 tokens, el problema vuelve entero.**

---


**`D-40` — Un faltante declara su CAUSA, y la causa nombra el oficio que lo cierra. Y una hoja de
salida puede ganar columnas sin que nadie recree la hoja.** (23/08/2026, `2026-08-23_1`.)

Cita a `D-12` y **no la supersede**: `FALTANTES` **sigue pisándose** en cada corrida y sigue siendo
la lista de trabajo de la última, no un historial. Lo que se agrega es qué dice cada fila y una
corrida de profundidad.

**Por qué es estructural y no una mejora de reporte.** `D-38` cierra la fase cuando el usuario mira
un deck y **declara que lo que falta no es relevante**. Esa declaración necesita saber **qué** falta
y **por qué**, y hasta hoy los cuatro modos de falla —nadie lo cableó, falló al resolver, no había
dato, la corrida no llegó— **llegaban al mismo texto libre** en una hoja que no tenía más lector que
el editor de planillas. El criterio de cierre de la fase se estaba apoyando en un instrumento que
no distinguía nada.

⭐ **El criterio de qué es una causa, que es lo que evita que la lista crezca por matices: una causa
nombra un OFICIO.** Si dos situaciones mandan a la misma persona a hacer lo mismo, son una sola
causa. Es la misma pregunta que fundó los cuatro símbolos del `2026-08-20_1` —*¿qué trabajo manda a
hacer este glifo, y hay más de una causa que lleve a él?*— movida de la capa de presentación a la
del registro.

⛔ **Y una causa que el motor NO puede probar no se inventa.** *Fuera de alcance* y *texto del
equipo* son decisiones del usuario que **no viven en ninguna hoja de registro** —`LAMINAS` no tiene
columna de alcance— así que el panel **declara que su conteo no las descuenta** en vez de fabricar
una clasificación que parecería medida. Un conteo que suma cuatro cosas distintas y lo dice vale
más que uno que las separa adivinando.

**Lo que la decisión fija, y aplica a toda hoja de salida futura:**

1. **Toda fila de `FALTANTES` lleva `causa`**, escrita por el punto que la empuja —el que sabe por
   qué falta— y nunca deducida leyendo el `motivo` río abajo.
2. ⭐ **Una hoja de SALIDA reconcilia sus headers antes de escribir** (`reconciliarHeadersDeSalida_`).
   `hojaDeSalida_` sólo escribe encabezados cuando la hoja **no existe**, así que sin esto una
   columna nueva entra al esquema y **la celda no se escribe nunca, sin error** — el modo de falla
   de `CLAUDE.md` §2. Sólo **agrega al final**: nunca reordena ni renombra, porque mover una columna
   cambia el significado de las filas ya escritas.
   ⚠ **No sirve para una hoja de registro**, y la frontera importa: allá está `COLUMNAS_DELTA_`, que
   además siembra y respeta lo escrito a mano. Esto vale **porque** la hoja se pisa entera igual.
3. **Una corrida de profundidad, y ni una más.** `FALTANTES_PREVIO` contesta *«¿este faltante ya
   estaba antes de mi cambio?»* — la única pregunta que se hizo hasta hoy, y la que el 23/08 se
   contestó **copiando la hoja a mano antes de que la próxima corrida la pisara**. Acumular por
   `corrida_id` daría ~10.000 filas en cincuenta corridas y volvería a `FALTANTES` un log, que es lo
   que `D-12` decidió que no fuera.
4. ⭐ **Un instrumento que mide una etapa deja su medición escrita, con el denominador.**
   `ANCLAJE_MEDICION` nace de esto: `ANCLAJE_PENDIENTE` vacío significaba **dos cosas opuestas**
   —*«no corrió»* y *«corrió y nadie cayó bajo el umbral»*— y las dos eran la misma pantalla en
   blanco. **Cero sobre un denominador es un resultado; cero sin denominador es un silencio.**

⚠ **Lo que `D-40` NO hace:** no dice en qué **lámina** falta cada token. `FALTANTES` no la guarda y
el `mapa_tokens` de `CORRIDAS` guarda el índice de slide del **deck expandido**, que no es un
`lamina_id`. Queda en `PENDIENTES` con el mecanismo escrito.

---

**`D-41` — Cuando una etapa se parte para que entre en el presupuesto, la unidad de partición es
la LÁMINA, nunca el marcador.** Decisión del usuario, 24/08/2026. **No supersede a nadie**: es una
decisión nueva sobre cómo se corta una corrida.

**El motivo es del dato, no de comodidad.** Dos tandas del mismo deck están separadas en el tiempo,
así que **cada unidad de partición es una foto de un momento distinto**. Si la unidad es más chica
que la lámina, **dos cajas de la misma lámina pueden venir de dos momentos** — y eso es `C-80`:
cajas una al lado de la otra, con el mismo formato, que se leen como si respondieran la misma
pregunta y no lo hacen.

⭐ **La etapa 3 nunca tuvo el problema, y por eso no se veía:** parte por **ítem**, y un ítem **es**
una lámina entera. La etapa 4 resuelve los tokens **fijos** —el Resumen Ejecutivo entre ellos—, así
que partirla por marcador dejaría `mail_entregados` de la tanda 1 al lado de `imp_meta` de la
tanda 2, en la misma caja.

**Lo que se sigue de la decisión:**

1. **El presupuesto decide cuántas LÁMINAS entran, nunca cuántos marcadores.** El tamaño se mide y
   se adapta —`costo_lamina_etapa4_seg` es sólo la semilla de la primera—; un número fijo de
   unidades por lote sería otra constante de las que nadie vuelve a mirar.
2. **`CORRIDAS.ejecucion` declara qué tanda escribió cada fila.** Era derivable cruzando los
   `mapa_tokens` de las N filas del mismo `corrida_id`, pero a mano, y nadie lo hace.
3. **La pregunta que la vuelve accionable, y se hace al elegir la unidad:** *¿dos unidades
   distintas pueden terminar en la misma lámina?* Si sí, la unidad es demasiado chica.

⚠ **Lo que `D-41` NO hace, y va declarado en vez de descubierto:** partir por lámina acota la
inconsistencia a **entre** láminas y **no la elimina**. Con una fuente inestable por CAMBIO
(`R-31`), la lámina 2 puede resolverse en una tanda y la 3 en otra y publicar números de dos
momentos. **Es un límite conocido del deck en tandas, no un problema a resolver** — y por eso la
columna existe: para que se **vea** cuál vino de dónde.

⚠ **Y la constante honesta no se puede separar del particionado.** Con `costo_resolucion_etapa4_seg`
recalibrado a su valor real y **sin** partir, la etapa **no entraba nunca**: el desatendido la
tomaría, no la terminaría, y la guarda de progreso informaría *«no avanza»* **cuando la verdad es
«la unidad es demasiado grande»**.

---

**`D-42` — Cuando una tabla cruza DOS fuentes, el `n` de sus tokens es una RANURA del universo, no
una posición dentro de cada fuente. La ranura se calcula una vez, sobre una lista única, y viaja
sellada en cada fila.** (25/08/2026, `2026-08-25_3` + su `ADDENDUM 1`.)

`L-036` publica cuatro filas de encuentro con ocho columnas. Seis salen de
`reuniones/Agenda JM | Post` y una —`Período`— de `digital/CAMPAÑAS_DESGLOCE_DIGITAL`, porque
**ninguna de las 29 columnas de la primera trae fecha de inicio ni de fin**: sólo `Fecha`, la del
encuentro. Los tokens de la fila 2 se indexan **todos con `valor_fijo = 2`**.

⛔⛔ **El modo de falla que esta decisión cierra no produce ningún error.** Si cada fuente numerara
sus propias filas, un encuentro presente en una y ausente en la otra **correría todas las ranuras
siguientes**: la fila 3 del deck mostraría el período de un encuentro al lado de los números del que
sigue, con formato perfecto. **Y ya se sabe que pueden diferir** — San Cristóbal tiene 0 filas POST
en el desglose y cae por `campos_metrica_post` del otro lado. **Hoy coinciden por dos caminos que
nadie coordinó**, y coincidir por casualidad no es un contrato.

**Qué se decidió, en tres piezas:**

1. **La lista de encuentros es UNA.** La arma `temarioPorSolapas_` desde la solapa que **CALIFICA**
   —la primera de `CONFIG.solapas_agregado_post`—, y **cada otra solapa se joinea a ella por
   `id_cuenta`**, nunca por posición ni por su propio orden.
2. **La ranura se sella en la fila** (`__temario_slot__`), calculada **antes de que ninguna solapa se
   recorte**. Un encuentro ausente en una fuente deja **un hueco en su ranura** y no mueve ninguna
   otra: el casillero sale `sin_datos` **en su lugar**.
3. ⭐⭐ **El orden no se reimplementa: se llama a `filasOrdenadas_`**, el comparador real de
   `Marcadores.gs` que usan las seis columnas numéricas vía `opFILA`. **Coinciden por construcción,
   no por parecerse.**

⚠ **El desempate está declarado** porque el caso es real: dentro de `julio_24_30` hay **dos
encuentros el 29/07** —`3389` Nueva Pompeya y `3420` Caballito—. Con la misma `fecha_periodo` gana
**el orden de origen en la lista única, que es el orden del TEMARIO** — el `a.i - b.i` de
`filasOrdenadas_`, el mismo que ya usaban las columnas numéricas. `R-32` sigue valiendo: con empate,
la ranura publica una **posición**, no una cosa; lo que esto garantiza es que **las ocho columnas de
esa ranura hablen del mismo encuentro**.

⛔⛔ **Y la identidad del grupo es `id_cuenta`, no `fecha_periodo`.** Son dos campos con dos oficios:
`id_cuenta` es la **identidad** de la fila (`D-30`), `fecha_periodo` es el campo de **orden**.
Agrupados por fecha, Nueva Pompeya y Caballito caerían en **un solo grupo** y el período publicado
abarcaría los dos — un rango más ancho, plausible, y de dos encuentros.

### Las tres opciones que se evaluaron para el `n`

| opción | por qué se descartó |
|---|---|
| **la n-ésima fila presente en cada fuente** | es el bug: dos fuentes que descartan distinto corren las ranuras y **nada falla** |
| **rellenar la fuente corta con filas sintéticas** | una fila fantasma es indistinguible de una real para cualquier otro consumidor — un `CONTEO` la sumaría |
| ⭐ **sellar la ranura en la fila** *(elegida)* | no inventa filas, el hueco queda donde corresponde, y el orden lo fija el comparador que ya existe |

⚠ **Lo que `D-42` NO hace, y va declarado en vez de descubierto:** **quién califica lo decide la
primera solapa de la lista.** Es `Agenda JM | Post` porque es la única con **una fila por encuentro
aunque esté en ceros**. Si algún día un encuentro tuviera filas en el desglose y ceros ahí, **queda
afuera de la lista entera** — no sólo de esa columna. Lo detectaría la identidad interna del bloque
`G` de `probar-grupo-texto.js`, que dejaría de cerrar.

⚠ **Y el límite de `D-41` sigue en pie, ampliado:** una lámina que cruza dos fuentes puede publicar
filas de **dos momentos distintos** si la corrida se parte en el medio. Con `R-31` midiendo
`digital` como inestable por CAMBIO, eso no es hipotético. **Es un límite conocido, no un problema a
resolver.**

### La excepción a la regla de oro: evaluada y DESCARTADA

⭐ El prompt anticipaba una tensión —*agregar filas es aritmética, y toda la aritmética vive en
`Marcadores.gs`*— y pedía registrarla como decisión. **No hizo falta, y el motivo se escribe porque
la lectura fácil es la contraria:**

- **`temarioPorSolapas_` no agrega nada.** Joinea por `id_cuenta`, copia la fecha del encuentro y
  sella la ranura. **Ninguna suma, ningún `min`, ningún `max`.** Es preparación de filas, el mismo
  rol que `unirDigitalPorCuenta` —que **pisa** campos de dimensión, no calcula—.
- **La agregación entera vive en `opGRUPO_TEXTO`**, en `Marcadores.gs`, que es donde corresponde.
- **Lo único que `Generador.gs` toma de `Marcadores.gs` es `filasOrdenadas_`**, y eso es lo mismo
  que ya hacía al armar `ctx.ordenPor`: resolver estructura para que la operación calcule.

⛔ **Registrar una excepción que no se ejerce sería peor que no tenerla:** dejaría escrito un permiso
para poner aritmética en `Generador.gs` **que este diseño no necesitó**, y la próxima vez alguien lo
citaría como precedente.

---


**`D-43` — El panel puede CREAR el período, y «semana en curso» deroga parcialmente el Addendum 2
de `R-11`.** (26/08/2026, `2026-08-26_2` Parte F. Decisión del usuario.)

⭐ **Lo que se decide, en una línea:** dar de alta un período deja de ser *editar `SEED_PERIODOS_` y
hacer `clasp push`* y pasa a ser **apretar un botón**. El escritor nuevo es `crearPeriodos_`
(`Instalar.gs`), con su fila en `docs/ESCRITORES.md`.

**Por qué es una decisión de arquitectura y no un botón más:** `PERIODOS` tenía **un solo escritor
declarado**, el seed, y agregarle otro es exactamente lo que `docs/ESCRITORES.md` exige declarar. El
comentario de `agosto_14_20` en el propio seed ya lo había anticipado con todas las letras — *«una
fila de seed por semana significa `clasp push` cada viernes, que es exactamente la línea de `.gs`
que `D-01` mide. Lo que corresponde es que el panel cree el período — y eso es un escritor nuevo de
hoja de registro»*. Esto es ese escritor, y baja el número que `D-01` mide.

### ⛔⛔ La derogación, con su alcance exacto

**`R-11` Addendum 2 (20/08) decidió que el motor propone la última semana CERRADA.** El botón
«semana en curso» crea la semana que **contiene a hoy**, que el viernes es otra.

**Lo que se deroga es sólo esto:** *«el motor nunca ofrece la semana sin cerrar»*.

**Lo que NO se deroga, y sigue gobernando:** la **propuesta por defecto**. El eslabón 5 de la cadena
de `D-20`, el selector del panel y `resolverVentana` siguen proponiendo la última cerrada, sin
cambios. `ultimaSemanaCerradaR11_` no se toca.

⭐ **La diferencia es quién decide.** El Addendum 2 resuelve *«¿qué propone el motor cuando nadie
eligió nada?»* y su respuesta sigue siendo la buena: el motor no adivina hacia adelante. Lo que se
agrega es un camino donde **una persona pide explícitamente** la semana en curso — que es un pedido
distinto, no el motor adivinando.

### ⭐⭐ Y el aviso va al ELEGIRLA, no al terminar

Una semana sin cerrar trae datos **parciales**, y el caso está medido: `3488-AGOJDGAG`, en el export
del 20/08, tenía **11.000 de 54.107 llamados** por fila, y el deck del equipo se armó después.

⛔ **Un número parcial no se distingue de uno completo mirándolo.** Es la familia del número
plausible: no falla, no avisa, y se publica. Por eso el panel pide una previa
(`panel_previaSemanaEnCurso`) **antes** de dibujar el botón y pinta la advertencia ahí. Decirlo en un
pie de página cuando el deck ya salió no sirve de nada.

### Lo que `D-43` NO hace, declarado en vez de descubierto

- ⛔ **No deduplica ni renombra nada.** Las dos filas rotas de `PERIODOS` —`julio_24_30` duplicada,
  clave referenciada en 119 líneas, y `'vie 14/08 -- jue 20/08 (por defecto)'`, que es una **etiqueta
  de origen usada como clave primaria**— **no se tocan, por decisión del usuario**. El generador las
  **reporta** en `claves_repetidas` en cada corrida. Anotadas en `docs/PENDIENTES_consistencia.md`.
- ⛔ **No pisa jamás.** Es insert-only, y no por precaución genérica: está medido que
  `upsertPorClave_` reescribió `agosto_14_20` en silencio (`{escritas: 0, actualizadas: 1}`).
- ⛔ **La convención `<AAAA>_<mes_del_INICIO>_<dd_inicio>_<dd_fin>` rige SÓLO hacia adelante.**
  `julio_24_30`, `agosto_14_20` y las tres de junio son claves con 68 líneas en `.gs`/`.js`/`.html`
  y 43 en `docs/` apuntándoles.
- ⚠ **Y no arregla que `leerPeriodos()` colapse las repetidas** — hoy ve 8 donde la hoja tiene 9.
  El generador lo esquiva leyendo las **filas crudas**; el lector sigue como estaba y eso es un
  pendiente, no parte de esta decisión.

---


**`D-44` — El proceso del usuario es un ASISTENTE LINEAL de cuatro pasos, y supersede
PARCIALMENTE a `D-43`.** (27/08/2026, `2026-08-27_1`. Decisión del usuario.)

⭐ **Lo que se decide, en una línea:** los cuatro pasos —período, temario, confirmar, generar— se
hacen **en orden**, y **cambiar el período es empezar de nuevo**.

⭐⭐ **Y eso no es una limitación de la UI: es lo que previene el problema.** Si el período se
pudiera cambiar después de cargar el temario, las reuniones quedarían atadas al `periodo_id` viejo.
**El diseño lineal lo hace imposible en vez de tener que detectarlo** — que es la misma forma que
`D-37` eligió para la identidad de una lámina: declarar en vez de deducir.

### ⛔⛔ Qué de `D-43` cae y qué sobrevive — la supersesión es PARCIAL

⚠ **El prompt pedía anotar `D-43` como «derogada por el flujo», y eso se corrigió con el código
delante:** `D-43` tiene dos mitades y **el asistente necesita una de ellas**.

| mitad de `D-43` | estado |
|---|---|
| **El escritor `crearPeriodos_`** — insert-only, relee lo que quedó, un solo camino de escritura | ✅ **vigente, y ahora con tres llamadores.** El paso 1 delega en él |
| **«Semana en curso» deroga parcialmente `R-11` Add. 2**, con el aviso de datos parciales al elegirla | ✅ **vigente.** Es la opción «en curso» del paso 1 |
| **Generar N semanas por adelantado** (`generarPeriodosSemanales_`, `generarProximasSemanas()`) | ⛔ **cae.** Con este flujo no hace falta ninguna semana por adelantado: el paso 1 crea **la** que la persona elige |

⭐ **Marcar `D-43` entera como derogada habría borrado el escritor que este flujo usa**, y habría
contradicho al propio prompt, que pedía **no** borrar su ficha de `ESCRITORES.md`. Una decisión no
se edita: se supersede con otra que la cita (§7), y la cita tiene que decir **qué** parte.

### ⭐⭐ La guarda es de HECHOS, nunca de una bandera del front

`guardaDelAsistente_` es **pura** y mira tres cosas leídas de las hojas vivas, **en cascada**:

1. **existe la fila de `PERIODOS`** — sin eso no hay sobre qué cargar (`D-19`);
2. **hay filas de temario para ese período** — sin eso el paso 3 no tiene qué confirmar;
3. **ninguna reunión con `mostrar` vacío** — sin eso `leerReuniones_` la descarta y el deck sale
   sin ese encuentro, **sin que nada falle**.

⛔ **La cascada es la mitad del control.** Si el paso 4 sólo mirara *«¿confirmaron?»*, saltear
**dos** pasos pasaría: sobre un temario vacío *«nadie sin confirmar»* es cierto **por vacuidad**.

⛔ **Un `paso: 3` que viaja en el estado del HTML es una afirmación del front sobre sí mismo**, y el
front puede mentir — es el `TECHO_S = 350` del `2026-08-21_1` y el `|| S.faltantesComoRaya` del
20/08, otra vez.

### ⛔⛔ La premisa del paso 3 que se corrigió con medición

**El anclaje NO puede correr al ENTRAR al paso 3.** `anclarEncuentrosSinCache_` ancla sobre
`leerReuniones_()`, que filtra `esVerdadero_(mostrar)` **antes de que el anclaje vea nada**, y
`cargarTemarioReuniones_` deja `mostrar` vacío a propósito. Un temario recién cargado tiene **cero**
filas anclables: anclar al entrar devuelve tres listas vacías, **que se leen como «ningún encuentro
tiene problema»**.

⭐ **Es el caso del 25/08 que ya está en `CLAUDE.md` §4** — *«REUNIONES no tiene filas para anclar en
`julio_24_30`»*, con las cuatro filas de julio en `mostrar` vacío. *El filtro que faltaba estaba un
nivel arriba, en quien le pasa los datos.*

⇒ **El paso 3 es una pantalla con dos momentos:** se marcan los checks, se aprieta *Confirmar y
anclar*, y **en la misma respuesta** vuelven las tres listas. Las dos preguntas quedan juntas, que
es lo que el paso pide.

⛔ **No se cambió el criterio de `mostrar` de `cargarTemarioReuniones_` para esquivarlo.** El propio
cargador declara que unificarlo con el de `CAMPANAS` **es decisión del usuario, no del código**.

### Lo que `D-44` NO hace, declarado en vez de descubierto

- ⛔ **No permite elegir cuenta para un `sin link` sin fila en `ANCLAJE_PENDIENTE`.** El motor sólo
  deja fila cuando el score queda **bajo el umbral**, así que `panel_confirmarAnclaje` no tiene
  dónde escribir — y **no inventa filas**. La pantalla lo **dice** en vez de ofrecer un botón que
  falla. Registrar filas para los `sin link` cambiaría qué significa esa hoja, y el prompt pedía
  explícitamente que eso **no** cambie.
- ⚠ **La guarda no cubre un temario de SÓLO campañas.** `cargarTemarioCampanas_` las escribe con
  `mostrar = 'sí'` de entrada (`AJ-1`, *ante la duda entra*), así que **nacen confirmadas** y no hay
  hecho que pruebe que alguien las miró. No se inventó una columna para taparlo: está afirmado en
  el banco.
- ⚠ **Un encabezado legítimo sin `>`** —`DGAYD`— vuelve a la lista de reuniones y produce una fila
  `no se pudo parsear`. **Elegido a sabiendas:** una fila de más se ve en el paso 3 y se destilda;
  una línea perdida en silencio publica un informe al que le falta un encuentro.
- ⛔ **No toca las dos filas rotas de `PERIODOS`** —`julio_24_30` duplicada y
  `'vie 14/08 -- jue 20/08 (por defecto)'`—. Se **reportan** en cada corrida del paso 1.
- ⚠ **La pestaña «Generar» no se retira.** Es el camino libre, y sigue haciendo falta para
  regenerar un deck de un período ya armado sin volver a pasar por los cuatro pasos.

---


**`D-45` — El temario se parte en UN CORTE POSICIONAL. Una línea, un ítem.** (27/08/2026,
`2026-08-27_2`. Decisión del usuario.)

⭐ **Lo que se decide, en una línea:** las líneas de arriba son reuniones; **la línea que anuncia
las campañas corta**; las de abajo son campañas. No hay bloques, no hay títulos que agrupen, no hay
heurística de contenido: hay un **estado** y dos líneas que lo mueven.

### ⭐⭐ El hecho que la funda: llegó el tercer temario real y no se parece a ninguno

| | forma |
|---|---|
| **25/08** | `1) JM \| Uno a uno en Parque Avellaneda 12/08 (pre + post)` |
| **27/08 ejemplo** | `> Status Cercanía y M2` · `> Campañas destacadas` · `> Otros temas` |
| **27/08 REAL** | `Uno a uno en Coghlan (21/08)` · `Campaña Destacada` · `Operativo Movilidad …` |

⇒ **Ni `>`, ni `N)`, ni `|`, ni el plural son obligatorios.** Cualquier regla que exija uno de los
cuatro **falla el lunes siguiente**, y falla **escribiendo filas**. Evidencia congelada en
`docs/TEMARIOS_reales_2026-08-27.md`.

### ⛔⛔ Qué reemplaza, y por qué había DOS

`partirTemarioEnBloques_` decidía que una línea sin `>`, sin `N)` y sin `|`, de menos de 60
caracteres, **es un encabezado**. Contra el temario real devolvía **3 bloques con `lineas: []`** —
las tres líneas eran títulos y **ninguna era contenido**.

Y había **dos formas de decidir cuál es el bloque de campañas** —la de `cargarTemarioCampanas_` y
la del asistente—, **y la primera ya fallaba**: comparaba por igualdad contra `campañas destacadas`
y el temario real dice **`Campaña Destacada`**, en singular. *Dos formas de decidir lo mismo no
fallan el día que difieren: **cargan otra cosa**.*

⇒ Hoy hay **una**: `partirTemario_` (`Campanas.gs`), y la usan los **tres** llamadores — los dos
cargadores y el asistente. **Los dos cargadores siguen recibiendo el texto entero**, sin recortes
armados por el llamador.

### Los tres separadores, y el tercero es un agregado con motivo

Una línea es separador **sólo si NO tiene `|`**:

| separador | condición | efecto |
|---|---|---|
| campañas | el cuerpo —sin `>` y sin `N)`— empieza con `campan` | el estado pasa a `campanas` |
| otros temas | el cuerpo empieza con `otros tema` | el estado pasa a `descartar` |
| ⭐ encabezado | arranca con `>` y no es ninguno de los dos | **no mueve el estado** |

⭐ **La tercera fila no estaba en el prompt y va con su motivo:** sin ella, `> Status Cercanía y M2`
—una línea que el usuario **marcó explícitamente como encabezado**— caería como ítem y escribiría
una fila `no se pudo parsear`. **Reconocer el `>` no es adivinar: es leer una marca que la persona
escribió**, y es la convención que este repo ya tenía declarada. No mueve el estado, así que no
inventa dónde termina un bloque.

### Los costos, declarados en vez de descubiertos

- ⚠ **Si un día llega `Campañas y enviados de la semana` SIN el `|`, corta.** Se acepta y **se ve**:
  la línea queda en `ignoradas` y el paso 3 la muestra.
- ⚠ **Sin la línea «Otros temas», las de abajo caen en campañas** — y `cargarTemarioCampanas_` las
  escribe con `mostrar = 'sí'` (`AJ-1`), o sea que **nacen confirmadas**. Se acepta y se dice:
  **no se inventa una heurística de contenido** para adivinar dónde termina el bloque.
- ⛔⛔ **Y hay DOS cerrojos contra el separador ingenuo, medidos:** `cuerpoDeLineaDeTemario_` **no
  saca el `eje |`**, así que `4) M2 | Campañas…` da `m2 | campanas…` y ni siquiera empieza con
  `campan` — **ése es el que aguanta hoy**. La guarda del `|` es el segundo, e independiente. Se
  midió sacando la guarda: **el resultado no cambia**. El banco lo aísla con un fixture propio.

### ⭐ El control es una IDENTIDAD, no una constante

**`líneas no vacías del pegado = reuniones + campañas + ignoradas`.** Ninguna línea puede
desaparecer del retorno. No caduca cuando cambie el temario, que es exactamente lo que le pasaría a
un *«da 3 reuniones»*.

---


**`D-46` — `eje` no decide qué entra al informe. El universo lo declara el TEMARIO.** (27/08/2026,
`2026-08-27_2`. Decisión del usuario.)

⭐ **Lo que se decide, en una línea:** `eje` deja de ser obligatorio y **sale de la clave**. Ahí
puede ir cualquier reunión — es **`R-04`** aplicado al filtro: *el temario define el universo, no
la fecha*.

⚠ **Es `R-04` y NO `R-02`**, aunque medio repo la cite mal: `R-02` es *«criterio de fuente cruda»*.
La colisión está explicada en la nota de numeración del propio `R-04` — se documentó primero como
`R-02` en su prompt de origen y el ID ya estaba tomado. **Censo del 27/08: 17 citas equivocadas en
`.gs`/`.html` contra 7 correctas.** Anotado en `docs/PENDIENTES_consistencia.md`; **no se corrigen
acá** porque no es el objetivo de este prompt.

### ⛔⛔ El costo que ya se pagó

`leerReuniones_` filtraba `fila[eje] && esVerdadero_(mostrar)` — **las dos condiciones**. Una línea
de temario que el parser no interpretaba quedaba con `eje` vacío, **se podía tildar**, se le
escribía `mostrar = 'sí'` y **nunca llegaba al anclaje**. El mensaje de fallo culpaba al **período**,
que era inocente.

⛔ Y el único diagnóstico que existía para explicarlo —`reunionesOcultasPorMostrar_`— abría con
`if (!fila[idx.eje]) return;`: **descartaba sin contar exactamente la fila que causó el fallo.**

### Qué cambia, y qué NO

| | |
|---|---|
| `leerReuniones_` | `fila[eje]` → **`fila[texto_original]`** |
| `reunionesOcultasPorMostrar_` | ídem — su comentario ya declaraba *«si allá cambia, acá también»*, **y esta vez se cumplió** |
| `claveReunion_` | `periodo_id + eje + nombre + fecha + etapa` → **sin `eje`** |
| ⚠ la columna `eje` | **NO se borra.** Sigue en la hoja, en los `headers` y en los seeds; se escribe cuando el temario la trae, la muestra el panel y la lee `TIPO_AGREGADO_POR_EJE_` |

⭐ **Por qué `texto_original` y no otra cosa:** es lo único que **toda** fila de temario tiene por
construcción —el parser lo conserva siempre, incluso cuando no interpreta nada— y es exactamente lo
que hace de clave de curación en el paso 3 del asistente. No es un campo nuevo ni una columna
inventada: es **el registro de la línea que originó la fila**.

⛔ **`eje` conserva UN uso, y es de descarte, no de selección:** `TIPO_AGREGADO_POR_EJE_` saca
`Ministros | …` y `M2 | …`, que son bloques agregados de período y no encuentros (`R-21`). **`eje`
decide qué NO entra, nunca qué entra.**

### ⭐⭐ Los dos gates, corridos contra la hoja VIVA antes de tocar nada

| gate | resultado (27/08 16:55) |
|---|---|
| **A.7** · sacar `eje` de la clave no puede colisionar | ✅ **11 claves con `eje` · 11 sin `eje` · sobre 11 filas** |
| **A.8** · `texto_original` sirve de reemplazo | ✅ **0 filas con `texto_original` vacío** |

⚠ **El snapshot más reciente en disco era del 26/08** —anterior a las filas que causaron el fallo—
así que se escribió `verificarGatesDelTemario()` (`Auditoria.gs`, sólo lectura) y **lo corrió el
usuario**. Un gate contra una foto vieja no es el gate: es la medición del día de la foto.

⚠ **Y la colisión que YA existía**, con `eje` adentro: tres líneas sin parsear dan la misma clave,
así que el dedupe colapsaba **tres líneas en una fila**. **No la causa este cambio** — con `D-45` y
las tres correcciones del parser, esas tres líneas dejan de existir como filas rotas.

### ⭐ Y el filtro nuevo NACE CONTÁNDOSE

`reunionesSinTextoOriginal_` junta y **nombra** las filas que el criterio nuevo descarta, con la
misma forma que ya usaba el de `mostrar`: conteo, nombres hasta seis, **y una frase para el caso en
que no haya ninguna** — sin esa segunda mitad, *«no hay»* y *«no miré»* se ven igual.

⛔ **Es la tercera vez en dos semanas que la misma figura cuesta una vuelta:** un filtro que
descarta antes y no cuenta es invisible, y el que sí cuenta **se lleva la culpa**.

### Lo que `D-46` NO hace

- ⛔ **No limpia `REUNIONES`.** Al 27/08 la hoja viva tiene **0 filas con `eje` vacío**, así que hoy
  no hay nada que borrar. ⚠ **Pero la consecuencia queda declarada:** una fila con `eje` vacío que
  alguien haya tildado **pasa de inerte a poder ENTRAR** al informe.
- ⛔ **No supersede a `D-44`.** El asistente lineal no cambia; lo que cambia es qué escribe su paso 2
  y qué filas deja pasar el filtro del paso 4.
- ⛔ **No cambia el criterio de `mostrar`** de ninguno de los dos cargadores.

---

**`D-47` — El universo de un marcador SIN ÍTEM es de la LÁMINA, no del informe. Se lee de
`LAMINAS.seccion_id`, y un token compartido entre láminas de universos distintos se resuelve una
vez por lámina.** (27/08/2026, decisión del usuario. **Cita y modifica a `D-41`**, no lo supersede.)

**El problema, medido y publicado.** `L-031` (Resumen Ejecutivo, universo = toda la comunicación de
JM de la semana) y `L-034` (agregado del temario) **comparten ocho tokens**, y **cinco ya
publicaban**: en el deck del 27/08, `L-034` decía **«Mails entregados 872.669»** al lado de
**«ENCUENTROS: 1»**. Dos cajas contiguas, mismo formato, dos universos — `C-80`.

**Por qué la etapa 4 no podía separarlos.** Resolvía **por informe** y `agruparTokensPorLamina_`
asignaba cada token a **su primera lámina**; el pintado era `presentacion.replaceAllText`, o sea el
deck entero. Un token, un valor, todas las cajas.

⭐⭐ **Y el hallazgo que ahorró una columna: la identidad ya estaba declarada.** Se iba a agregar
`LAMINAS.universo` con su delta, su seed y un botón. **No hizo falta.** `LAMINAS.seccion_id` la puso
`D-37`, y `CONFIG` ya nombra las dos secciones de agregado. Medido el 27/08: `L-034` →
`ecv_alcance_semanal`, `L-036` → `comunicaciones_post`, `L-031`/`L-032` → `resumen_ejecutivo`.
**La pregunta ya tenía dueño en el registro; faltaba que alguien la leyera.**

⚠ **No es inferir identidad por contenido** —lo que `D-37` prohíbe y lo que costó la N² de las
copias—: se lee una **declaración**, no los tokens que la lámina lleva adentro.

**Las tres piezas, y ninguna sirve sola:**

| pieza | qué hace |
|---|---|
| **el gateo** | las claves del temario se pasan **sólo** a las láminas que cuelgan de una sección de agregado |
| **el desdoble** | un token cuyas láminas declaran universos distintos se resuelve **una vez por lámina** y se pinta con `slide.replaceAllText` |
| **las solapas** | una lámina gobernada arma sus `claves_temario` desde las solapas de **sus** marcadores que declaran `SOLAPAS.campo_id_cuenta` |

⛔ **La tercera es la que mueve el número, y su ausencia era invisible.** El universo del temario se
activa por `claves_temario[base|solapa]`, y esa lista salía de `CONFIG.solapas_agregado_post` —
**escrita para la sección post y atada a ella**. Con el token ya desdoblado, las dos mitades
resolvían igual porque `digital|Directa Mail` no estaba en la lista. **Un mecanismo correcto y sin
efecto es indistinguible de uno que anda**, hasta que alguien mira el número.

⭐ **Se autoconfigura en vez de agregar otra lista a mantener.** Una lista escrita a mano se
desincroniza con la plantilla en el primer cableado; las solapas salen de los marcadores que la
lámina realmente lleva.

**Qué modifica de `D-41`, con precisión.** `D-41` fijó que **la unidad de partición es la lámina** y
eso **no cambia**. Lo que se da vuelta es su guarda de agrupamiento —*«un token que aparece en varias
láminas se asigna a la PRIMERA … podría resolverlo en otra tanda y publicar dos valores distintos
del mismo token en el mismo deck»*—, y **con su mismo argumento**: aquélla evitaba **dos respuestas
a la misma pregunta**; acá son **dos preguntas distintas** —cuánto mail hubo esta semana, y cuánto
en los encuentros del temario— y son exactamente las dos cajas que `C-80` describe leyéndose como
una. **El desdoble se paga sólo donde puede haber diferencia:** `camp_titulo` está en 8 láminas y
es el mismo hecho en las 8, así que se sigue resolviendo una vez.

⚠ **Los dos defaults que NO se eligieron, y el motivo es el mismo:**

- **Una lámina sin ancla conserva el comportamiento anterior y lo avisa.** *«No sé»* no puede
  convertirse en *«no gobernada»*: eso le sacaría las claves a `L-034` y sus `ecv_*` se irían al
  universo ancho, deshaciendo `D-48`. **Un default que rompe en silencio es peor que no gatear.**
- **Y «desconocido» no se agrupa con «ventana»**, así que un token compartido entre una lámina sin
  ancla y una de ventana **se desdobla** — cada una resuelve la suya en vez de heredar la de la
  vecina.

⚠ **Lo que queda declarado y NO resuelto:** una solapa de una lámina gobernada que **no** declara
`campo_id_cuenta` no se recorta y **publica el universo de la ventana**. No frena la corrida —en una
lámina gobernada conviven marcadores que sí se recortan y otros que legítimamente no— pero **va al
log con nombre**. Callarlo sería `X-41` otra vez.

---

**`D-48` — Cuando el temario no trae filas hay TRES salidas, no dos.** (27/08/2026, decisión del
usuario. Cierra el P0 que `docs/PENDIENTES_consistencia.md` abrió el 25/08 y que declaraba
explícitamente *«no la decide Code»*.)

Las dos ramas de `datosDeMarcador_` que leen «las filas del TEMARIO» resolvían la **misma
condición al revés**: la de `post_*` fallaba con `«FALTA»` y la de `rdv` **se caía a la cadena
general** — `rdv` entera recortada por `figura=Jorge Macri` y la ventana, o sea el universo de la
semana con forma de acierto, sin fallar y sin avisar.

**Gana la que falla.** Pero fallar **siempre** es tan malo como caerse, y eso lo impuso un dato del
dominio: **el encuentro del temario del 27/08 no tuvo mail**. Con la regla de `post_*` aplicada al
pie, una caja sin mail publicaría `«FALTA»` sobre un hecho perfectamente normal — la marca que
grita cuando no hay nada que arreglar.

| caso | qué es | qué sale |
|---|---|---|
| `items === 0` | el temario no resolvió ni un encuentro | ⛔ `«FALTA:…@sin_temario»`, con el motivo adentro |
| `items > 0`, sin filas | hubo encuentros y **ninguno** tiene fila en esa solapa | **sin dato** — es un dato |
| con filas | el universo del temario | el número |

⭐ **El discriminador ya existía y ya viajaba: `items`.** Las dos ramas lo tenían en el resultado y
ninguna lo miraba.

**Y `filasRdvDelTemario_` deja de ser mudo.** Devolvía el mismo vacío por **cinco causas distintas**
—`SECCIONES` ilegible, la sección sin resolver, `itera_sobre` que no apunta a `REUNIONES`,
`itemsDeSeccion_` que tira excepción, o `!ok`— y **ninguna se distinguía de «esta semana no hay
encuentros»**. Ahora trae `aplica` y `motivo`, y **el motivo viaja al `FALTANTES`**, no al log.

⚠ **`aplica` sale de `CONFIG`, no del resultado**, y es lo que sostiene todo: *declarada y sin
filas* **no** es lo mismo que *no declarada*, y **sólo la segunda** puede caer a la cadena general.

⭐ **De paso cierra el P1 de al lado:** si `ecv_alcance_semanal.itera_sobre` queda vacío, los 21
marcadores de `rdv` se iban al universo ancho en silencio. Ahora falla con el motivo literal — que
es *«lo único que convierte esa celda en un error visible en vez de un número plausible»*.

---

**`D-49` — La cuenta digital de un encuentro se DECLARA en `REUNIONES.id_cuenta`. Vacío significa
«que la deduzca el anclaje».** (27/08/2026, decisión del usuario.)

**El hueco, medido sobre las cuatro hojas operativas y las once de registro:** un encuentro que
**anclaba bien no dejaba rastro en ninguna hoja**. La cuenta vivía en el `Logger.log` de la corrida
y en el `porItem` en memoria, y las dos cosas mueren con la ejecución. **La asimetría estaba al
revés de lo útil:** un `sinLink` queda con nombre y motivo en `ANCLAJE_MEDICION.sin_link_detalle`,
uno de baja confianza queda con sus tres candidatos en `ANCLAJE_PENDIENTE`, **y el que acierta no
quedaba en ningún lado**.

⭐ **El precedente es `CAMPANAS.id_cuenta`** —ahí la cuenta se declara en la fila y no hay anclaje
que correr—, y el mecanismo de «declarado gana» **ya existía** para reuniones
(`anclajeYaConfirmado_`), sólo que llaveado contra `ANCLAJE_PENDIENTE`: **alcanzaba a las dudosas y
no a las que anclaban bien.**

**Lo que gana además de la trazabilidad:** la corrida deja de ser no-determinista. Hoy dos corridas
de la misma semana podían anclar distinto porque `digital` se movió en el medio (`R-31`) **y nada lo
mostraría**.

⚠ **Los tres límites, escritos porque son reales:**

- **Los de baja confianza NO se escriben.** Declarar una cuenta que el propio motor considera
  dudosa convertiría una duda en un hecho. Siguen yendo a `ANCLAJE_PENDIENTE`.
- **Una cuenta mal anclada que se escribe queda congelada** — es el caso `3347` del 04/08, once
  números plausibles de la cuenta equivocada. Lo que cambia es que ahora está **en una celda que se
  ve y se corrige**, en vez de estar mal y ser invisible.
- **El anclaje escribe sólo si la celda está vacía.** Si tiene valor, lo reporta y no lo toca.

---

**`D-50` — Un encuentro con ancla DIGITAL floja entra igual al temario, sin su cuenta.**
(27/08/2026.)

`itemsDeSeccion_` armaba los ítems con `encuentros.concat(sinLink)`: los de `bajaConfianza`
**quedaban afuera**. El comentario que lo justificaba decía *«el ancla decide qué fila de `rdv` se
lee»* — **y era falso, una premisa sin testigo de las que `CLAUDE.md` §4 nombra**. La fila de `rdv`
la resuelve `encontrarFilaRdvDeReunion_` por **nombre y fecha** y se sella **antes** del reparto en
las tres listas; el score que manda a `bajaConfianza` mide el match **digital**.

⭐ **La asimetría lo prueba:** un `sinLink` con score **0** entraba y uno con score **0,4** no, con
la misma fila de `rdv` y la misma procedencia.

**Lo que costaba:** los `ecv_*` leen **sólo** `rdv`, así que cada encuentro excluido se perdía del
agregado del temario **sin avisar** — `ecv_encuentros` podía publicar 3 sobre un temario de 4, y la
traza del marcador no lo decía.

**Entran con `idCuenta` vaciado**, sobre una copia —`anclarEncuentros` está cacheado por corrida—,
así que los `ecv_*` salen bien y los `enc_*` salen `«FALTA»` en vez de un número de la cuenta
equivocada. **El precedente es del mismo `if`:** el caso `ambiguo` ya entra a `sinLink` con
`mejor = null`.

⚠ **Cambia el deck, no sólo el agregado:** ese encuentro ahora **emite su lámina**. Es exactamente
lo que ya hacía un `sinLink`, así que no es un régimen nuevo — pero es visible.

---

**`D-51` — El lenguaje de filtros gana `||`. Un corte puede vivir en más de una columna.**
(28/08/2026.)

`parsearFiltro_` sólo conocía `&&`. Alcanzaba mientras cada corte tuviera **una** columna que lo
declarara — y `digital/CAMPAÑAS_DESGLOCE_DIGITAL` no la tiene: el nombre de campaña está **partido
en dos columnas** que no se solapan. `des_campana_2` (col V) trae **372** filas con `JM`,
`des_campana_3` (col U, rotulada `Prioridad`) trae **248**, **disjuntas**, y la unión da **620** —
exactamente lo que `looker/DIGITAL` ve con su columna única.

⛔ **Lo que costaba, y es el modo de falla caro de este repo: no fallaba.** Con una sola columna,
**un tercio de las filas quedaba clasificado como `gcba`** — entre ellas las de Coghlan. El corte
publicaba un número plausible del universo equivocado.

**La forma:** `&&` separa **grupos** y `||` separa **alternativas dentro de un grupo**. Un grupo
pasa si **alguna** alternativa pasa. `ambito=jm` sobre el desglose es
`des_campana_2~=JM || des_campana_3~=JM`, y `gcba` es el AND de las negaciones —De Morgan, *«ni en
una ni en la otra»*, sin `||`.

⚠ **El detalle que rompía y no se ve leyendo el parser:** `leerDeFila_` resuelve la columna por
`cond.campo`, así que `aplicarFiltroDeMarcador_` tiene que resolver una `resuelta` **por cada
alternativa**, no sólo por el principal. Una alternativa sin resolver no filtra: falla.

⭐ **Y el operador se conserva a propósito.** Sigue siendo `~=`, igual que looker. Lo que cambia es
**sobre cuántas columnas se busca**, y eso es una propiedad del dato, no del criterio — así que el
cambio de fuente sigue siendo atribuible.

---

**`D-52` — `SOLAPAS.ventana_ref = 'propia'`: una solapa puede recortar por SUS fechas aunque su
base sea `snapshot`.** (28/08/2026.)

`BASES.digital.modo_periodo = 'snapshot'` **corta en `leerFuente` antes de toda la lógica de
fechas** y devuelve todas las filas. Por eso `digital/CAMPAÑAS_DESGLOCE_DIGITAL` no llegaba nunca
al solape de `R-16`, y el Resumen Ejecutivo publicaba el universo entero.

⭐ **El mecanismo de solape no se escribió: ya existía.** `R-16` (07/08) lo decide con
`MAPEO.fecha_fin_periodo` y `entraPorSolape_`. Lo único que faltaba era que la solapa **llegara**
hasta ahí. Lo que se agrega es un valor reservado en una celda: con `propia`, el modo pasa a
`filtrar` **para esa solapa sola**.

**Las dos salidas que se descartaron, con el motivo:**

- **Cambiar `BASES.digital.modo_periodo` a `filtrar`** toca **todas** sus solapas, incluida
  `Directa Mail`, de donde salen los `mail_*` con casos validados.
- **Inferirlo de que la solapa mapee las dos fechas** le cambiaría el universo a **tres solapas
  vivas** sin que nadie lo pidiera: `Digital`, `Directa IVR`, `Seguimiento digital` y
  `Digital 2026 acumulado` **ya declaran `fecha_fin_periodo`**.

⚠ **El orden de aplicación es parte de la decisión, no un detalle:** `propia` se aplica **antes**
que `sin_recorte_por_ventana`, así que **el parámetro sigue ganando**. La lectura por cuenta —los
`u1_*`, el temario— pide explícitamente no recortar y lo sigue teniendo. Al revés, `propia` le
sacaría el «sin recorte» a quien lo pidió por nombre.

⭐ **Amplía `D-24` sin superseder** — `ventana_ref` sigue contestando *«de dónde saca la fecha
ésta»*: lo que se agrega es una respuesta más, *«de sí misma»*. Y por eso el valor es **reservado**:
una solapa que se llamara `propia` colisionaría, y no existe ninguna.

⚠ **Y `propia` no es un nombre de solapa**, así que el camino de **pertenencia** se saltea —si no,
buscaría una solapa llamada así— y el barrido de `ventana_ref` de `Auditoria.gs` lleva la misma
guarda, o reportaría un cruce roto inexistente.

**Lo que esto NO cierra**, y va declarado: qué número publica el Resumen Ejecutivo. La medición
contra el dashboard de Looker del 28/08 dice que el criterio de solape reproduce **8 campañas**
para JM —y 4 o 5 con cualquier otro—, pero **el valor pide una corrida**. El testigo es
`Meta 1.921.695 · Google 1.023.101 · DV360 5.330.034`.

**`D-53` — `periodo_id` identifica una VERSIÓN DEL INFORME, no una semana del calendario. Y de
ahí se sigue que el escritor del temario tiene que poder SACAR, no sólo agregar.** (31/08/2026,
**decisión del usuario dada en conversación** — no está deducida del código, y sin este apunte
dentro de seis meses lo parecería.)

Son **dos mitades de una sola regla** y por eso van juntas.

**1 · El vocabulario.** `periodo_id` no nombra una ventana del calendario: nombra **una versión del
informe, con su temario**. Textual del usuario: *«cada informe es particular y va con su temario.
Yo podría hacer el de un período y después rehacerlo con otro temario, por ejemplo si agregan una
campaña»*.

⇒ **Dos filas con la misma ventana son dos versiones, no un duplicado ni un error de carga.**

**2 · La obligación del escritor, que se sigue de la 1.** Recargar un temario sobre un `periodo_id`
**que ya existe** tiene que poder **quitar** campañas y reuniones, no sólo agregarlas. El flujo que
el usuario declara:

- **`periodo_id` nuevo** → temario nuevo, con lo que el usuario cargue.
- **`periodo_id` ya usado** → el front **precarga** el temario existente; el usuario lo acepta o lo
  **modifica**, y entonces *«el motor tiene que modificar el temario sacando o poniendo campañas y
  reuniones»*.

### Las tres consecuencias, todas medidas el 31/08 — para que esto no quede como enunciado suelto

1. **Dos ids de `PERIODOS` con la misma ventana son NORMALES.** `agosto_14_20` y
   `'vie 14/08 -- jue 20/08 (por defecto)'` cubren las dos `2026-08-14 → 2026-08-20`, y **eso no es
   una ambigüedad a resolver**: son dos versiones de la misma semana.
2. ⭐ **Por eso `periodosQueDescribenLaVentana_` tiene que DECLARAR el conjunto, y cambia el
   motivo por el que ya lo hacía.** No es *«hay un empate que no sé desempatar»* —lo que haría
   buscar el id correcto— sino *«puede haber varias versiones del mismo informe y hay que decir
   cuál se tomó»*. **No hay un id correcto que elegir.** Con override explícito manda el id de
   `ventana.origen`, que ya es la versión nombrada por quien corre.
3. ⛔ **El `P0` del escritor —«una campaña que el usuario sacó del temario se sigue publicando»— es
   el INCUMPLIMIENTO del punto 2, no un defecto independiente.** `cargarTemarioCampanas_` dedupea
   por `campana_id || periodo_id` y **saltea lo que ya existe**: sabe agregar y no sabe quitar.
   Vive en `PENDIENTES_consistencia.md` (31/08) y **cuelga de esta decisión**.

### ✅ Y en el mismo acto se CONFIRMA `D-19`, con su argumento

`D-19` —*una fila sin `periodo_id` no entra a ningún informe*— **se confirma y no se supersede**.
El motivo importa porque es lo que la sostiene: **fija el vocabulario, y no depende de que hoy
haya filas que la ejerciten** — que justamente **no las hay**: `CAMPANAS` viva al 31/08 tiene dos
filas y las dos traen `periodo_id` cargado.

⚠ **La justificación que se había escrito para confirmarla envejeció entre el 26 y el 31/08.** Era
*«las filas de `secco` con `periodo_id` vacío ya están excluidas por la propia `D-19`»* — cierto
contra el snapshot del 26/08, y **hoy vacuamente cierto**, porque esas filas ya no existen. **La
decisión se sostiene igual; lo que se cayó fue la evidencia que se citaba, no la regla.**

⭐ **Es la forma inversa de la justificación vencida del 18/08**, y las dos juntas son el
aprendizaje: allá **el texto envejeció más rápido que el mecanismo** (el comentario decía «hoy es
un no-op» y el mecanismo seguía sin implementarse); acá **el dato envejeció más rápido que el
texto**. **Un argumento se cae cuando envejece cualquiera de sus dos mitades, y hay que mirar las
dos.**

**`D-54` — Un token que está en las DOS plantillas publica el MISMO número. No hay versión propia
de `secco`.** (31/08/2026, **decisión del usuario dada en conversación**, textual: *«no hay otro
recorte, son los mismos»*.)

Si `{{enc_inscriptos}}` aparece en la plantilla de `jm` y en la de `secco`, **las dos cajas
publican el mismo valor**: misma fuente, mismo corte, misma operación. No existe una definición de
`secco` que compita con la de `jm`.

⇒ **Consecuencia directa, y es lo que vuelve accionable a la decisión:** todo token compartido que
hoy tenga **una sola fila `jm`** es **candidato a `informe_id = '*'`**. No es una migración de
conveniencia: es la única forma de **expresar** la decisión, porque una fila `jm` **no la puede
leer `secco`**.

⭐ **El mecanismo ya existe y no hace falta código.** `resolverMarcadores` filtra con
`suyo === informeId || suyo === '*'`, y ese comodín está implementado en **cinco** puntos del
camino (`Generador.gs` ×3, `Auditoria.gs` ×2). **La migración es cambiar celdas, no programar.**

⚠ **Y el estado de hoy, medido:** `MARCADORES` tiene **220 filas y las 220 dicen `jm`** — cero
`*`, cero `secco` (`MARCADORES_2026-08-31.tsv`). **Hoy no hay ni una fila compartida**, así que
`secco` sale entero en hueco.

### ⛔ El límite, y va adentro de la decisión para que no se la use de más

**Esto dice que el NÚMERO es el mismo. No dice que la GRANULARIDAD lo sea.** Son dos cosas
distintas y sólo una la resuelve compartir marcadores:

- Si las dos plantillas tienen una caja para *«inscriptos del encuentro»*, `*` la resuelve.
- Si `secco` tiene **3 ranuras** donde `jm` tiene **4**, o **2 campos** donde `jm` tiene **8**
  —medido el 20/08 en la lámina de comunicaciones post: `jm` 4 campañas × 8 campos contra `secco`
  3 × 2—, **eso sigue abierto y `*` no lo toca**. Son tokens **distintos**, no el mismo token con
  dos definiciones.

**La pregunta de granularidad queda sin decidir**, y decidirla toca las plantillas, que son del
equipo (`C-01`).

⚠ **Segundo límite, heredado y no resuelto:** las validaciones que existen son **de `jm`**. Un
marcador que pase a `*` publica en `secco` un número **validado para otra ventana y otro corte** —
el `SELLO_VALIDACION_` de `Instalar.gs` ya lo dice fila por fila. **Compartir la definición no
comparte la validación.**

**`D-55` — Una columna que describe un HECHO MECÁNICO se autocorrige; una que describe una
DECISIÓN EDITORIAL se reporta y se corrige a mano.** (31/08/2026, **decisión del usuario dada en
conversación**.)

Las hojas de registro tienen columnas que son **fotos** de la plantilla, pobladas al sellar y que
nadie refresca. Ante un desajuste, **no todas se tratan igual**, y el criterio no es cuánto
molesta sino **qué describe la columna**:

| clase | ejemplo | qué se hace |
|---|---|---|
| **hecho mecánico** — nadie decidió nada | `orden_plantilla`: dónde quedó la slide después de reordenar | ✅ **se alinea solo**, y es gratis |
| **decisión editorial** — alguien eligió | `escondida`: el equipo decidió no publicar esa lámina | ⛔ **se REPORTA como desajuste y se corrige a mano** |

⛔ **El motivo, y es lo que hace que la asimetría sea correcta en vez de una inconsistencia:**
alinear `escondida` sola **le saca el testigo a una decisión**. El equipo esconde una lámina, el
motor deja de publicarla, **y el registro se actualiza diciendo que todo está bien** — la decisión
ocurrió y no quedó rastro de que ocurriera. Con `orden_plantilla` no hay nada que atestiguar:
reordenar slides no es una decisión sobre el informe.

⭐ **La consecuencia de implementación, ya medida:** las dos salen de **la misma pasada** —
`verificarLaminas()` recorre las slides y ya calcula `i + 1`; leer `esLaminaEscondida_(slide)` en
ese mismo `forEach` no cuesta un recorrido más. **La pasada se comparte y las salidas se separan:**
`orden_plantilla` va a `desajustes` y se corrige; `escondida` va a **una lista aparte que se
reporta y no se toca**.

⚠ **Y esto NO cierra el pendiente de las columnas-foto, es su mitad:** `escondida` sigue siendo una
foto del sellado. **Lo que cambia es que la foto vieja se vería** — hoy no la mira nadie.

⭐ **Se escribe como decisión y no como nota porque el criterio vale para la próxima columna**, no
sólo para estas dos: ante una columna-foto nueva, la pregunta es *«¿esto describe algo que alguien
decidió?»*, y la respuesta elige el tratamiento.

**`D-56` — `docs/casos_validacion_*.csv` es la fuente de verdad de si un marcador está validado.
`MARCADORES.notas` no lo es.** (01/09/2026, **decisión del usuario dada en conversación**.)

**Cuando los dos difieren, manda el CSV.**

⭐ **El motivo, con las palabras del usuario:** *validar contra la base viva da un resultado
distinto cada vez, porque **acumula y crece**. El CSV es un **registro fechado de una comparación
que ya se hizo**; la base no.*

⇒ Se levanta el `_revisar` de **todo marcador con un caso registrado como validado en el CSV**. No
hay revisión token por token: **la lista sale del cruce**, no del criterio de quien la aplica.

### Lo que se hizo, y el número al que se llegó

**18 marcadores** perdieron el `_revisar` el 01/09/2026 (backup
`_BACKUP_MARCADORES_2026-09-01_1130_levantar`), sobre los **82** que llevaban `SIN VALIDAR`.

⚠ **El cruce NO es por igualdad de nombre.** `token_propuesto` es una **expresión**: trae listas
con `/` y ` vs `, rangos `camp_env1-5`, llaves `{a,b}` y familias `pref_*`. **Por nombre exacto
daban 11; el cruce completo dio 64 con algún caso**, y 18 con caso válido.

### ⭐ Los dos hallazgos que cambiaron el número — son criterio, no anécdota

**1 · Los prefijos de `caso_id` son FAMILIAS distintas, y el campo `estado` no las distingue.**

| prefijo | qué es |
|---|---|
| **`V-`** | **validaciones** — 117 `exacto` |
| `C-` | contradicciones / hallazgos — 60 `cerrado` |
| `D-` | derivaciones · `A-`, `X-`, `S-` mixtos |

⇒ **Un `cerrado` en un `C-` significa «el hallazgo se cerró», NO «el marcador está validado».**
Distinguirlo bajó el cruce de 19 a 18 y sacó `enc_alcance` y cuatro `enc_*`, que tenían **cinco
`cerrado` y ninguna validación**.

**2 · `contradice` no dice A QUIÉN contradice.**

`frecuencia` tiene **cuatro `V-` `exacto`** y dos `contradice`:

- **`X-19`** → *«**error en el deck, no en el motor**»* — contradice al **equipo**.
- **`X-32`** → *«`V-72` **NO ESTÁ IMPLEMENTADO**: el motor REDONDEA y el equipo TRUNCA»* —
  contradice al **motor**.

⇒ **Sólo el segundo bloquea**, y por eso `frecuencia` **no se levantó**. ⚠ Con los dos tratados
igual, el resultado habría sido el mismo **por el motivo equivocado** — y en el caso simétrico
(sólo un `X-19`) habría bloqueado un levantamiento correcto.

### Las TRES clases de evidencia — y dos de ellas no son reproducir una cifra

| clase | n | qué significa |
|---|---|---|
| **deck del equipo** | 10 | se reprodujo la cifra que el equipo publica |
| ⚠ **identidad interna** | 5 | las partes suman el total. **Medido sobre el deck GENERADO, no sobre el del equipo** — lo dicen `V-111` y `V-113` en su propia nota |
| ⚠ **ausencia acordada** | 3 | `V-120`: *«CERO FILAS, y el equipo TAMPOCO publica… coinciden en la AUSENCIA»*. **El motor no publica nada y el equipo tampoco: no hay cifra que reproducir** |

⛔ **La clase va escrita en `notas` de cada fila**, y no es prolijidad: dentro de tres meses
`validado` se lee como la primera de las tres.

### ⛔⛔ La regla que faltaba, y es el motivo por el que hubo que revertir 18 filas 12 horas después

**Antes de aplicar algo que cambia lo que se publica, hay que cruzar TODOS los registros que
hablan del mismo hecho.**

**El caso, y es de este mismo trabajo:** la mitad 1 —los `_revisar`— se decidió **mirando
`MARCADORES.notas` sola**, y marcó **76 filas**. El CSV decía lo contrario para **18** de ellas.
**Con el cruce hecho antes, habrían sido 58**, y no habría hecho falta escribir 18 filas para
revertirlas medio día después.

⭐ **Lo accionable, y se pregunta antes de escribir la primera celda:** *¿qué OTRO registro habla
de este mismo hecho?* Acá eran dos —`notas` y el CSV— y **cada uno era suficiente para decidir por
sí mismo**, que es justo lo que hace fácil no mirar el otro.

⚠ **Y el corolario que lo vuelve barato:** el cruce **no cuesta una corrida**. Los dos registros
estaban en disco; lo que faltó fue preguntarse si había un segundo. **Un trabajo que se puede
deshacer con un backup igual costó dos escrituras y dos verificaciones.**

### ⚠ Lo que `D-56` NO dice

**No dice que los números sean correctos hoy.** Un caso del CSV es una comparación **fechada** y la
base **acumula**: `D-56` afirma que **la validación ocurrió**, no que su resultado siga valiendo.
Es exactamente por eso que el CSV manda —un registro fechado no cambia solo— y **no es un
sustituto de volver a medir cuando el número importa**.

### `D-57` · La corrida DESATENDIDA es el default y el único camino — 03/09/2026

**Decisión del usuario, con sus palabras:** *«prefiero que tarde más y que nunca se corte para que
el usuario no se maree»*.

⇒ **Un solo botón**, que siempre va por la desatendida. **Sin elección.**

#### ⛔ Lo que esto cierra, y por qué NO hay que medir nada

⭐ **No hay que medir el costo del arranque doble.** La decisión **no es de rendimiento**: es que
un corte a mitad de camino le cuesta al usuario más que unos segundos, **y elegir entre dos botones
ya es parte del problema**. Una medición del arranque contestaría una pregunta que dejó de estar
abierta.

#### ⛔ Qué deroga

La frase del panel: *«Para una semana así, el botón **Generar informe** es más barato: no paga el
arranque dos veces»*. ⭐ **Sigue siendo cierta y deja de gobernar** — describe un costo real que el
usuario decidió pagar. Queda **tachada con su motivo** en `Panel.html`, no borrada. ⚠ La
recomendación se sacó **el mismo día**, antes que el botón único: mientras el texto estuviera, la
pantalla seguía empujando al camino derogado.

#### ⚠ Lo que NO se puede hacer sin resolver antes el ítem 31

**El cambio, solo, empeora la experiencia que viene a mejorar.** Medido sobre el código:

1. Hoy la corrida de una vez muestra `vistaEsperando` → `vistaListo`. La desatendida hace
   `S.tab = 'desatendida'` ⇒ *«generé y ya está»* pasa a ser *«generé y tengo que mirar otra
   pantalla»*.
2. ⛔ **Y esa pantalla no se actualiza sola — lo dice ella misma**, dos veces: *«Esta pantalla no
   se actualiza sola»* y *«Esta pantalla no se refresca sola»*. El usuario quedaría mirando un plan
   viejo apretando **Actualizar** a mano. **Eso es exactamente marearlo.**

⇒ `D-57` **queda decidido y su implementación gated por el ítem 31.**

---

## 2 · Próximo (ordenado, con dependencias)

### ⭐⭐ LA COLA — 28 ítems, con casilla de resuelto (03/09/2026)

> **Acá vive «qué falta hacer y en qué orden», y por eso está en `PLAN.md`:** §7 declara a este
> documento dueño de *«¿Qué sigue y en qué orden?»* — distinto de `HANDOFF_CODE.md`, que dice
> **dónde estamos**, de `PENDIENTES_consistencia.md`, que registra **inconsistencias abiertas**, y
> de `CIERRE_POR_LAMINA.md`, que se organiza **por lámina**. **No se creó un documento nuevo.**
>
> ⭐ **Cada fila que ya tiene entrada en otro lado APUNTA, no repite.** Lo que se busca es **una**
> cola; el detalle vive donde su dueño lo declara y acá está el orden.
>
> **Se tacha a medida que se cierra.** `[x]` con la fecha; el detalle del cierre va a `BITACORA`.

**⛔ Lo que traba más: `9` y `10` — publican mal HOY.
⭐ Lo más barato con más efecto: `7`.**

#### MINISTROS

| | | dónde vive el detalle |
|---|---|---|
| `[x]` **1** | ministros: 9 filas + `MAPEO` + `ventana_ref` | ✅ **Completo el 03/09** — `cablearMinistros()` escribe las 9 de `MARCADORES`, las **11** de `MAPEO` (con `A ID`, `C Barrio / Comuna`, `F Enviados`) **y** `SOLAPAS.ventana_ref = propia`, todo en el **mismo wrapper**: separarlo crearía el estado intermedio que rompe —filas cableadas sin su ventana, universo más ancho, sin fallar—. ⭐ Las tres `%` (I, K, S) **no se mapean** y el motivo está **en la fila** de cada `PCT`, no sólo en el reporte. Banco `probar-ministros.js` en verde, con las 11 letras cruzadas contra la firma real. ⛔ **Falta correrlo**; control: `emin_encuentros` = **7** |
| `[x]` **30** | ✅ **Los dos bancos rojos, DADOS VUELTA con la exigencia mayor** | ⭐⭐ **Los 91 bancos en verde, primera vez en cuatro días** (03/09). Las constantes —`nombre_campaña!~=JM`, las dos columnas con `||`, De Morgan— se reemplazan por la **identidad**: `jm` y `gcba` **complementarios** sobre el mismo campo, más la **identidad cruzada** looker↔desglose (mismo operador, mismo valor `JDGAG`), más las **negativas** que impiden volver al corte por nombre. ⭐ Más fuerte que la vieja: aquélla **sólo miraba `gcba`**, así que un cambio que tocara `jm` y se olvidara de `gcba` —**cómo se rompe una partición**— pasaba en verde |
| `[ ]` **34** | ⛔ **`emin_lista` publica `-`** — ⭐⭐ **CAUSA ENCONTRADA el 04/09, en el código** | ⛔⛔ **`ctx.plantilla` nunca llega.** Se asigna dentro de `if (['FILA','FILA_TEXTO','GRUPO_TEXTO'].indexOf(nombreOp) !== -1)` (`Generador.gs:1695`) y **`LISTA_TEXTO` no está en esa lista** — la guarda interna `if (esPlantilla)` sí lo incluye, pero está **anidada dentro del `if` que ya lo dejó afuera**. ⇒ `opLISTA_TEXTO` devuelve `''` con `«FALTA:@plantilla_sin_resolver»` → `sin_datos` → `textoFaltante_` pinta `-`. ⭐ **Confirmado por comparación:** `emin_encuentros` y `emin_lista` piden datos con el **mismo `campoOverride` (`figura`)**, misma solapa y misma ventana ⇒ la única diferencia posible es `ctx.plantilla`. ⛔ **NO se arregló** (prompt de sólo lectura): el arreglo es **un nombre en una lista** |
| `[ ]` **35** | ⭐ **El censo de no exclusivos tiene que CLASIFICAR, no contar** | Declarado el 04/09, **sin implementar**. Tres columnas por token —**¿alguna lámina escondida? ¿alguna no-modelo? ¿alguna de sección no repetible?**— que son las **tres formas de sobrevivir a la etapa 3**. ⭐ El que tiene las tres en «no» **está bien y sale de la lista**; el número accionable son los otros. ⚠ Sin eso el instrumento devolvió **349 números todos iguales**, y su propio veredicto se contradecía con su caveat |
| `[ ]` **36** | ⛔⛔ **El cruce marcador ↔ caso corre en UNA sola dirección** | ⭐⭐ **Medido el 04/09 sobre la hoja viva: 90 con `_revisar`, y 54 estaban LIMPIOS el 31/08** ⇒ la marca se puso después. ⭐ **No fue un descuido: fue la aplicación masiva del 01/09** (76 puestos, 18 levantados) **que no cruzó contra el CSV**. ✅ **Y de los 54, NINGUNO tiene caso `exacto`** — los siete `m2_*` eran los únicos que pisaban una validación, y **ya se corrigieron el 04/09**. ⇒ Falta el cruce **al revés** —*caso `exacto` cuyo marcador sigue con `_revisar`*— para que la próxima aplicación masiva no lo repita |
| `[ ]` **31** | ⭐ **FRONT — `D-57`: el botón único necesita progreso SIN cambiar de pestaña** | ⛔ **Gatea a `D-57`**: el cambio solo **empeora** la experiencia que viene a mejorar — hoy la desatendida salta a la pestaña «Corrida», **que no se actualiza sola y lo dice ella misma**. ⭐ **Recomendado (b): el asistente muestra el avance**, y es más barato **en las dos dimensiones** — la mitad ya existe (los dos caminos comparten `generarDesdeAsistente`, divergen en **una línea**), `panel_estadoDesatendida()` ya devuelve `hechas`/`pendientes` ⇒ **cero backend nuevo**, y el caso `terminada` cae en la rama `listo` **que ya existe**. ⛔ (a) refrescar la pestaña arregla el dato viejo y **deja intacta la desorientación**. Diseño completo en `PENDIENTES` (03/09) · ⚠ **Mismo archivo que `B.2` y `B.3`** — se coordina |
| `[ ]` **32** | ⚠ **17 desajustes de `orden_plantilla` en `L-035`…`L-051` (`jm`)** — la hoja 1-2 posiciones atrás | ⭐ **No hacía falta generalizar nada**: `refrescarOrdenPlantilla_` ya toma el informe por parámetro. Faltaban **los dos wrappers**, y sin ellos Apps Script no la lista para `jm`. Escritos el 03/09: `diagOrdenPlantillaJm()` (no escribe) y `refrescarOrdenPlantillaJm()`. ⚠ **No mueve ningún número** — la expansión resuelve por **ancla**—, ensucia los reportes que ordenan por esa columna · ⛔ `escondida` **no se refresca sola** |
| `[ ]` **33** | ⛔ **Ítem 9 — por qué `L-016` no se duplica** | ✅ **Las DOS candidatas descartadas** (03/09): la **1** contra la **hoja viva** —`L-016` declara `campana`— y la **2** **sobre la plantilla** —slides 18…25, contiguo—. ⛔ **El veredicto real sigue pendiente del REPORTE DE LA CORRIDA**: el log de `diagBloqueCampana()` ya dejó el orden de lectura —`slides_modelo` → `motivo` → `excluidos`— y que si `L-016` sale por `LAMINAS.filtro` es una **tercera** causa. Puntero, no copia |
| `[ ]` **2** | `emin_lista` — operación con **plantilla sobre todas las filas**. `LISTA_CRUDA` toma un campo, deduplica y no acepta plantilla | ⛔ `R-20`: prompt propio |
| `[ ]` **3** | El condicional del barrio **DECLARATIVO**, no un `if` con literal — la propuesta usa `valor_fijo` (condición) + una plantilla alternativa | va con **2** |
| `[ ]` **4** | Corrida de `secco`: el control **son 7** y la lista literal | **usuario** · `diagAgendaFuncionarios()` |

#### SECCO

| | | |
|---|---|---|
| `[ ]` **5** | `fecha_dia`, `fecha_mes`, `m2_implementaciones` | prompt `_2`, **escrito y sin pasar** |
| `[ ]` **6** | `m2_camp_lista` → re-correr `aplicarAsteriscoCompartidos()` | **usuario** · idempotente |
| `[ ]` **7** | ⭐ **Los 45 compartidos sin fila** — sirven a los **dos** informes | *el lote más rentable* |
| `[ ]` **8** | `m2_envios` (16) y «proyectos» (11): falta la corrida que los reproduzca | nota de `V-124` — ⚠ **el marcador de «proyectos» no está determinado**: dos candidatos |

#### PUBLICA MAL HOY

| | | |
|---|---|---|
| `[ ]` **9** | ⛔ `camp_titulo` en `L-016`/`L-023`: título de **otra** campaña | ⭐ **Parte 0 hecha el 03/09 — mecanismo EXPLICADO, causa raíz NO cerrada** (`PENDIENTES` `P0`). `camp_titulo` **no es exclusivo de ninguna lámina** ⇒ `pintarTokensFijosDeLamina_` usa `presentacion.replaceAllText`, que **pinta el deck entero, escondidas incluidas**, con **un solo valor**. ⭐⭐ Eso explica que `L-023` publique con las llaves de sus `camp_resp_*` todavía crudas, y que sus dos copias digan lo mismo. ✅ El precedente `L-040`/`rol=equipo` **NO aplica**: `L-016` es `rol = motor`. ⛔ **Falta**: si `L-016` se expandió, y cuántas campañas tenía el temario — las dos exigen el **reporte de la corrida** y `CAMPANAS` **vivo** (el snapshot del 31/08 tiene 2 filas y las dos son de `jm`) |
| `[ ]` **10** | ⭐ **Un caso `V-` para `frecuencia` de esa campaña** | lo único que quedó del 10 retirado: se contesta *«¿32,76 es correcto?»* con un caso contra el deck, como `V-68` y `V-69` para las suyas · ⚠ y el **matiz de `camp_frecuencia`** queda **NO MEDIDO** —`C-22` mide agregados y ése opera sobre una fila—: ni bueno ni descartado |
| `[ ]` **11** | IVR: `ambito=gcba` da **63** donde deberían ser **8** · ⛔ **¿cableado o `C-01`?** | `PENDIENTES` · `P0` del 31/08 (`L-031`) · ⛔ **NO se decide antes de medirlo.** `censarIvrEnPlantillaJm()` (04/09, sólo lectura, **con control positivo `gcba_cc_base`**) contesta la hipótesis (1) del `2026-08-31_2`: *«la plantilla de `L-032` no usa el token»*. ⚠ **Si los tres no están, escribirles filas no publica nada** — el ítem cambia de objeto a `C-01` y el `✅` de `cablearGcbaIvr()` midió **la escritura, no la publicación** |
| `[ ]` **12** | Implementaciones cruzadas Directa/Digital (`A1`) | **usuario**, plantilla |
| `[ ]` **13** | Encabezado vencido en layout/master (`A2`) | barrer `slideLayout*`/`slideMaster*` |
| `[ ]` **14** | Filas fantasma y desborde en `L-047` (`A3`/`D5`) | `PENDIENTES` |
| `[ ]` **15** | Remitente sin normalizar (`A5`) | ⚠ **SIN DECISIÓN del usuario** |
| `[ ]` **16** | Pie de `L-034`: dice que el alcance se unifica y no (`D9`) | **usuario**, una línea |

#### FRONT

| | | |
|---|---|---|
| `[ ]` **17** | `B.2` — dos niveles | *en curso* |
| `[ ]` **18** | `B.3` — informe primero, período sin trámite, `a.informeId` | |
| `[ ]` **19** | `_4` — cortes libres y secciones configurables | ⚠ **deroga** *«los modos son tres»* |

#### INSTRUMENTOS

| | | |
|---|---|---|
| `[x]` **20** | ~~`escritores.js` / `inventario.js` roto~~ **CERRADO 03/09** | el limpiador no reconocía regex literales · `BITACORA` |
| `[ ]` **29** | ⛔ **`caso_id` repetido entre CSV** — `C-84` y `C-85`: la clave del cruce de `D-56` **no es única** | `PENDIENTES` `P1` (03/09) · ⚠ **ya costó una lectura equivocada**, y el instrumento le da verde igual · ⭐⭐ **La numeración tiene que ser continua ENTRE archivos, no por archivo** (usuario, 03/09): los dos repetidos tienen **la misma forma** —el CSV del 28/08 reinició la serie `C-`—, así que **no es un tipeo: es sistemático, y el próximo CSV lo repite**. El id nuevo sale del **máximo global de los tres**, que es lo que `V-124` hizo por casualidad |
| `[~]` **21** | Los **2 bancos en rojo**, defectos reales | `probar-ambito-ivr` · `probar-desglose-como-fuente` · ✅ ~~`probar-asistente-periodo`~~ **CERRADO 03/09**: no era el reuso — el banco medía con la fecha del día. **46 afirmaciones en verde** |
| `[x]` **23** | ✅ **Tokens SIN llaves — CERRADO el 03/09: `0` en las dos plantillas** | ⭐ **Con su límite en la misma línea, que el propio log declara:** un nombre que no esté en `MARCADORES` ni en la otra plantilla **no se reporta**, así que **un token inventado y sin llaves tampoco se ve**. ⚠ Un cero sin su límite se cita como «no hay», y **no es lo que se midió** — se midió sobre **376 nombres conocidos** |
| `[ ]` **24** | Invariante **agregado = suma del desagregado** | ver `V-111`/`V-113` |

#### DORMIDOS — no se tocan, se vigilan

> ⭐ **Están acá y no en el backlog porque tienen su condición de despertar escrita.** Un dormido
> sin evento nombrado es deuda olvidada; con él, es algo que un censo puede mirar (`D-55`).

| | | condición que lo despierta |
|---|---|---|
| `[ ]` **22** | `CORRIDAS` al `snapshot.js` — **BAJADO A DORMIDO 03/09** | ⛔ **el costo supera al beneficio**: agregarlo a las tres listas **cambia `instalar()`**, y a una sola rompe `listas.js`. ⚠ **Consecuencia ya medida mientras siga así:** *«cuántas corridas cerraron sin `deck_id`»* sólo se puede contestar **sobre las últimas 10** · `PENDIENTES` `P2` (02/09) |
| `[ ]` **25** | `figura` no llega al ítem | **cargar un ministro al temario** · `PENDIENTES` `P1` (01/09) |
| `[ ]` **26** | `CAMPANAS.informe_id` write-only | `PENDIENTES` `P1` (02/09) |
| `[ ]` **27** | Opción 4 — la expansión saltea escondidas | pospuesto **con número**: 2 copias muertas · `PENDIENTES` `P2` (01/09) |
| `[ ]` **28** | `V-49` describe una fuente que ya no se usa | ⚠ decide el usuario: ¿caso nuevo que lo supersede? |

⚠ **Dos que NO estaban en la lista y quedan acá para que no se pierdan**, los dos con entrada
propia en `PENDIENTES`: **el `P0` del escritor del temario** —una campaña que el usuario sacó **se
sigue publicando**— y **los 8 lectores de `LAMINAS`** que indexan por `lamina_id` solo.

---

### El encuadre: todo lo de abajo es la fase `informe semanal` — `D-38`

> **Puntero, no copia.** La decisión —las dos fases, el motivo del orden y el criterio de cierre
> con sus seis condiciones— vive en **`D-38`** (§1), **aprobada por el usuario el 22/08/2026**. Acá
> queda sólo lo que hace falta para leer la lista.
>
> **Todos los frentes de abajo son de la fase `informe semanal`.** La fase `informe actualizable`
> **no empieza hasta que ésa cierre**, y no es preferencia de orden: refrescar en el lugar un
> número que todavía no está validado es automatizar la publicación de un número mal. Su prompt
> está escrito y sin correr —`docs/Prompts/2026-08-22_24_refresco_de_deck_publicado.md`, ⏸ diferido.
>
> ⚠ **El criterio de cierre es de revisión humana**, no una condición que el motor evalúe solo:
> cierra cuando el usuario, mirando un deck completo, declara que los faltantes que quedan no son
> relevantes (`D-38`). **No ordena la lista de abajo** — el orden dentro de la fase sigue siendo
> del usuario.

### Las tres sub-etapas — decididas por el usuario el 22/08/2026

> **Reemplaza a la lista de siete frentes del 21/08** (`2026-08-21_17` Parte A), que quedó vieja:
> **dos de sus siete estaban cerrados** y otros dos, a medias. Se midió antes de reescribir; el
> resultado está en la tabla de abajo.
>
> ⛔ **Lo cerrado no se borró: salió de acá.** Su rastro está en `BITACORA.md`, dueño de *"qué se
> hizo y cuándo"* (`CLAUDE.md` §7), y el texto completo de cada frente cerrado queda en el
> historial de este archivo. Es el mismo criterio con el que la lista de siete reemplazó a la de
> catorce.
>
> ⭐ **`A`, `B` y `C` son sub-etapas DE la fase `informe semanal`, no una fase nueva.** `D-38` sigue
> teniendo dos fases y sólo dos. Lo que se ordena acá es **el camino hasta su criterio de cierre**.

#### Lo que se midió antes de reescribir (22/08/2026)

| # | frente del 21/08 | medido hoy |
|---|---|---|
| 1 | verificar la tanda de los nueve `camp_*` | ✅ **cerrado** — el arreglo es `c50984b`, *"la cuenta de la campaña entra donde el consumidor la busca"*, y la lámina de campaña reproduce por plataforma |
| 2 | `12 bis` — testigo de `D-31` contra la planilla | ✅ **cerrado** — `verificarEncabezadosDeMapeo()` corrió el 22/08, después del arreglo del IVR |
| 3 | `C-64` aplicado a los seis `pauta_*` | 🟡 **a medias** — los seis `pauta_*` están medidos (las columnas son **flags 0/1** y publican `1·1·1`); falta aplicarles el criterio de `C-64`. ⛔ **Alerta Naranja SALIÓ de este frente** — ver abajo |
| 4 | `13 bis` — `DIMENSIONES_` a hoja de registro | ⛔ **abierto** — sigue siendo una `var` en `Instalar.gs` y `SOLAPAS` no tiene ninguna fila `DIMENSIONES` |
| 5 | `enc_visualizaciones` y `enc_clics` | ⛔ **abierto** — no están en `MARCADORES`; el único de la familia es `enc_impresiones` |
| 6 | `alcance`/`clics` de campaña + `m2_campanias` | 🟡 **a medias** — `camp_alcance` y `camp_clics` **ya están cableados**; queda **sólo `m2_campanias`**, que espera una definición del usuario |
| 7 | regenerar `CATALOGO_tokens.md` | ⛔ **desactualizado** — salió del snapshot del **18/08** y `MARCADORES` se tocó el 22 |

**Los que siguen abiertos —3 (lo que queda), 4, 5, 6 (lo que queda) y 7— no desaparecen: pasan a
`Higiene`**, más abajo, porque ninguno bloquea el cierre de `D-38` y ninguno tiene dependencia
escrita contra otro. **El orden entre ellos es del usuario.**

#### ⛔ Alerta Naranja salió del frente 3 — decisión del usuario, 22/08/2026

**Entró por error.** No se descartó por costo ni por prioridad: **nunca tuvo que estar ahí.** El
frente 3 queda **sólo con los seis `pauta_*` y `C-64`**.

⭐ **Se escribe en vez de borrarse en silencio, y el motivo es concreto:** si más adelante aparece
un token o una lámina de Alerta Naranja, **tiene que saberse que esto ya se decidió y no volver a
discutirse**. Un ítem que desaparece sin dejar rastro vuelve a la lista en la próxima
reorganización, y entonces nadie sabe si salió por decisión o por olvido.

⚠ **Y hay que saber que la formulación vieja sigue en pie donde no se puede editar:**
`docs/BITACORA.md` dice *"lo que queda es aplicar el mismo criterio a `pauta_*` y Alerta Naranja"*
— es **append-only** y no se toca (`CLAUDE.md` §7). Por el desempate de §7 **gana esta línea, que
es la más reciente**. Mismo caso que la nota vencida de `R-27`.

---

### A · Cerrar el informe

**Qué lo ordena: es lo único que produce el deck que `C` necesita mirar.**

| | qué | quién |
|---|---|---|
| **A.1** | **La corrida de `agosto_14_20`** que confirma los 🟡 del tablero — los tres «N envíos» (6 · 73 · 3) y los ocho `imp_*` en `_revisar`. ⚠ **Ninguna escritura en `MARCADORES` prueba que el deck salga con el número esperado**: eso lo dice una corrida y nada más | usuario |
| ~~**A.2**~~ | ✅ **CERRADO el 22/08 por la corrida.** El iceberg publicó los cuatro de IVR exactos —Audiencia 107.194 · Atendidos 96.549 · +75 % 33.139 · Marque 1 304— y **`X-30` se cerró solo: el ítem llegó con `3488-AGOJDGAG`**. No hizo falta tocar nada | — |
| ~~**A.3**~~ | ✅ **CERRADO el 22/08, y sin medir**: el deck mostró la tabla de `L-036` con **4 filas × 8 columnas = 32 casilleros**. Los 32 `post_` de `Auditoria.gs` eran correctos; el tablero estaba mal y se corrigió | — |
| **A.5** | ⛔ **El tope de `R-30` NO actuó en la corrida del 22/08** — `imp_prog` salió 24.783.992, el total con `2976-MAYPCCVC` adentro. Sospecha medida: `CONFIG` **sólo siembra lo ausente** y su sembrador es el ítem **«Aplicar configuración»**, no `instalar()`; un `clasp push` no escribe una celda. Lo confirma `diagTopeDeVentana()` | usuario |
| **A.6** | ⛔ **`X-31` — `mail_entregados` bajó 15** (538.276 contra 538.291 del fixture). Descartados el cambio de operación y `R-30`; **queda que la base se movió, y hacia abajo**, que es lo que `R-29` dice que no pasa con un evento | Code + usuario |
| **A.4** | **`X-29` — decidido el 22/08: va la salida (b), tope de duración**, con el tope en `CONFIG` y la regla en `REGLAS_NEGOCIO.md`. ⛔ **No cierra `X-28`** — ver abajo | Code |

⚠ **`X-28` no está acá y es a propósito: no lo destraba el trabajo, lo destraba un archivo.** Espera
un tercer `.zip` del equipo —**deck publicado** + `Base Looker` del mismo día— que consigue el
usuario. **No bloquea a `A`**: es qué cuenta de Call Center publica el Resumen, y el iceberg es IVR.
Son láminas distintas.

⛔⛔ **Y `X-29` NO se cierra con `X-28`, aunque un tope de 30 días tocara a los dos.** Son preguntas
distintas y se cierran por separado: **`X-29` sólo necesita las ventanas**, que ya están medidas
sobre los dos exports; **`X-28` necesita un tercer DECK publicado**. Que `duración ≤ 30 d` fuera uno
de los tres desempates que `X-28` no pudo separar **no es evidencia de que 30 sea el número correcto
para aquéllo**.

#### ⛔⛔ `L-036` — la resolución del 22/08 (mañana) ERA FALSA, y se corrige acá

**Lo que se escribió a la mañana:** *"el deck mostró 4×8 = 32 casilleros; los 32 `post_` de
`Auditoria.gs` eran correctos y el tablero estaba mal"*.

⛔ **Es al revés.** El tablero decía bien —`camp1-4`— y **`Auditoria.gs` está mal redactado**:
confundió el `seccion_id = comunicaciones_post` de la fila con **una familia de tokens `post_`**.

**Tres fuentes lo desmienten, y una está medida sobre la plantilla VIVA:**

| fuente | qué dice |
|---|---|
| `TOKENS.md` §2.1 | lámina **7** de `jm` = **`camp1-4`**, *"numera bien y describe bien"*. Y explícito: ***"`jm` no tiene ninguna lámina `post_`, y no tiene por qué tenerla con esos nombres"*** |
| `P2` de `PENDIENTES`, **06/08, plantilla viva** | `slidesModeloDe_(presentacion, ['post_'])` devuelve **la lista vacía** — *"ninguna lámina de la plantilla lleva tokens de la familia `post_`"*. Verificado en una corrida real |
| el espejo `JM_marcada.pptx` | slide 7: **`camp1..camp4`** en la primera columna, filas 3-6. **Cero `post_` en todo el archivo** |

⭐ **`post_camp1-3` y `post_estado1-3` existen, pero son de `secco`** —su lámina 10, tabla 4×7—.
`TOKENS.md` ya había reconciliado esto y lo dejó escrito: *"la confusión venía de mezclar las dos
plantillas"*. **Yo volví a mezclarlas.**

⚠⚠ **El error de método, y es uno que este archivo ya nombra:** *un test puede acertar el hecho y
errar la inferencia*. **El hecho era correcto** —el deck mostró 32 casilleros— y de ahí salté a
*"entonces `Auditoria.gs` tenía razón"*, **sin abrir la fuente que lo contradecía**. `CLAUDE.md` §4
lo pide con todas las letras: *cuando un instrumento devuelve una etiqueta, verificar el dato crudo
del que salió, no la etiqueta*. Y §1 pide **buscar el caso antes de tratar algo como pregunta
abierta** — el `P2` estaba escrito desde el 06/08.

**Lo que queda abierto, y ahora sí está bien planteado:** la tabla es **4×8** y `camp1-4` ocupa
**una** columna. **Qué hay en las otras siete no se puede saber desde el espejo** (`C-76`: sirve
para afirmar lo que hay, no lo que falta). Se resuelve con el censo contra la **plantilla viva**.

#### ⛔⛔ ADDENDUM 24/08/2026 — el bloque de arriba es la **segunda** retractación, y también está vencido

**No se edita una línea de lo de arriba** (`CLAUDE.md` §7); esto lo corrige y queda fechado.

**La secuencia entera, que es el valor del addendum:**

| # | cuándo | qué se dijo | contra qué se midió |
|---|---|---|---|
| 1 | 22/08 mañana | *«el deck mostró 32 casilleros → `Auditoria.gs` tenía razón»* | el deck, sin abrir la fuente que lo contradecía |
| 2 | 22/08 tarde — **el bloque de arriba** | *«es al revés: `jm` no tiene tokens `post_`, son de `secco`»* | `TOKENS.md` §2.1 + el `P2` del 06/08 + el espejo |
| ⭐ 3 | 22/08 **22:39** | **`L-036` tiene 32 tokens `post_`, ocho columnas × cuatro filas** | ⭐ **el censo contra la PLANTILLA VIVA** — `docs/CENSO_tokens_sin_fila_2026-08-22.md` |

**Manda la 3**, y `docs/CIERRE_POR_LAMINA.md` ya la refleja desde el 22/08.

⭐⭐ **Por qué la 2 se equivocó teniendo tres fuentes de acuerdo, y es la lección que sobrevive:**
**no eran independientes, eran la misma foto contada tres veces.** `TOKENS.md`, el `P2` y el espejo
descienden todos del mismo relevamiento viejo. **La concordancia entre fuentes viejas se parece a
una corroboración y no lo es** — y **tres documentos de acuerdo pesan menos que una medición contra
la cosa viva**, que es el orden que `CLAUDE.md` §7 ya declara.

⚠ **Y por qué este addendum hace falta aunque el tablero esté bien:** quien abre `PLAN.md` primero
—que es lo normal, es el dueño del plan— **se come la retractación vencida y no llega al censo**.
Costó el arranque de `L-036` el 24/08. Una corrección que vive sólo en el documento correcto no
protege a quien entra por el otro.

**Lo que sigue abierto de `L-036` no es esto**: es de dónde salen sus cuatro filas —
`items_por_lamina` **no tiene consumidor** — y las tres columnas sin fuente, que son pregunta al
equipo sin prioridad. Todo eso está en `docs/CIERRE_POR_LAMINA.md` y en `PENDIENTES`.

---

### B · Mejorar el front

⭐⭐ **El motivo del orden, que es lo que hay que dejar escrito: los tres P1 de instrumento SON el
front.** No son tres pendientes técnicos que casualmente van juntos — **son las tres cosas que el
panel tendría que mostrar y no muestra**: qué falta, por qué falta, y qué encuentro se cayó.

| | qué | por qué en este lugar |
|---|---|---|
| **B.1** | **`FALTANTES` no tiene lector** fuera del editor | ⭐ **Primero porque es el instrumento del cierre de `D-38`.** El criterio es que el usuario mire un deck y declare que lo que falta no es relevante — **y hoy no hay dónde leer qué falta** |
| **B.2** | **El aviso «quedó crudo sin corte» no distingue «nadie lo cableó» de «se cableó y no se pisó»** | ⭐ **Segundo aunque `sinLink` sea más grave**, y el motivo es de uso: **una lista de faltantes que no dice la causa no se puede repartir en trabajos**. Sin esto, `B.1` entrega una lista que no se puede accionar |
| **B.3** | **Un encuentro que no ancla a ninguna cuenta no queda anotado en ningún lado** (`sinLink`) | Es **el más grave de los tres** y va tercero por lo de arriba: sin `B.1` y `B.2` no hay dónde mostrarlo |
| **B.4** | **El `_19` — el desatendido al panel**, lo que quedó de él | Al final: es comodidad de operación, no instrumento de cierre |

---

### C · La declaración de `D-38`

**El usuario mira el deck completo y declara que los faltantes que quedan no son relevantes.**

⛔ **Va después de `A` y `B`, y el motivo es concreto: se hace mirando el deck con la lista de
faltantes legible al lado.** Sin `A` no hay deck que mirar; **sin `B` la declaración se haría de
memoria**, que es exactamente lo que `D-38` no quiere — su criterio es de revisión humana, y una
revisión humana sin el instrumento delante no es una revisión.

---

### Después de `C` — la fase `informe actualizable`

**Sin cambios.** `docs/Prompts/2026-08-22_24_refresco_de_deck_publicado.md`, escrito y **⏸ sin
correr**. No empieza hasta que `C` cierre, y no es preferencia de orden: refrescar en el lugar un
número que todavía no está validado es **automatizar la publicación de un número mal**.

---

#### Lo del 19 al 22/08 que entró al plan y no estaba

Se listan para que el plan deje de ignorarlas; **no van como ítems porque están cerradas**:

`camp_*` del temario al deck · el panel por secciones · la rama de validación · `C-21` cerrada por
huella · el reloj por etapas y el límite duro · el `TypeError` de continuación · los cuatro símbolos
de faltante · la semana por defecto · el fixture como verificación · el anclaje en dos pasos · el
corte por presupuesto · **`LAMINAS` declaradas y `D-37`** · la cesión de `digital` a `D-30` · el
panel de anclajes y el addendum a `D-29` · **`R-21` nivel 1** · **el agregado por temario, que
reproduce `V-71`** · **las dos cachés y el P0 de tiempo cerrado como falso positivo** · **el tablero
`CIERRE_POR_LAMINA.md`** · **el `MAPEO` de `looker/CC`** · **el veredicto idempotente de
`curarCamposMarcadores_`**.

### ✅ Tanda 4 CERRADA — 17/08/2026 · **la migración está completa sobre lo migrable: 42 de 48**

**El par `frecuencia`/`gcba_frecuencia` de `looker/resumen_metricas_dinamico` declara su
`ambito` en `dimensiones`, con `filtro` vacío en los dos.**

| toma | cuándo | `dimensiones` |
|---|---|---|
| **pre** | 16/08 22:20 · 17/08 11:58 | vacío en los dos |
| **post** | **17/08 22:21** | `ambito=jm` / `ambito=gcba` |

⚠ **El testigo pre no se tomó para esta tanda: se reconstruyó de dos corridas anteriores** que
registran los dos marcadores con `dimensiones: (vacío)` explícito. **El orden previsto no se
cumplió** — la migración ya estaba aplicada cuando se fue a correr la Parte A.

| # | control | resultado |
|---|---|---|
| **1** | **la partición** ⭐ | **`4 + 22 = 26` en las tres tomas** |
| 2 | cuentas de filas | `4/26` y `22/26`, idénticas |
| 3 | valores | **numerador movido, denominadores quietos** — ver abajo |

**El criterio NO fue la igualdad de valores, y es la única tanda donde no podía serlo.** `looker`
se mueve **dentro** de ventanas cerradas mientras `digital` crecía **fuera**; el prompt lo dejó
escrito **antes** de correr para que un valor distinto no se leyera como falla.

#### ⭐ El control 3 resolvió la pregunta que la tanda tenía abierta desde que se escribió

**Los dos denominadores —475.723 y 1.249.387— idénticos en las tres tomas**, con el numerador de
`frecuencia` moviéndose (6.399.346 → 6.282.424 → 6.763.034). **Denominador quieto y numerador
moviéndose es `looker` acumulando, no la dimensión leyendo otras filas:** si el corte se hubiera
traducido mal, el alcance habría cambiado también — es la misma lectura, sobre las mismas filas,
en la misma corrida.

⚠ **Ese control existió recién esa noche**, después de arreglar `operandosDeRatio_` —que **nunca**
había matcheado la traza real—, y **en su primera lectura útil cerró la tanda**. Detalle en
`docs/_snapshots/TESTIGO_frecuencia_2026-08-17_2221.md`.

#### El hueco de trazabilidad: no se sabe en qué corrida se aplicó

**Entre las 11:58 y las 19:08 del 17/08**, y **ninguna corrida la reclama**. `CORRIDAS` no lo puede
responder y no es falla suya: registra **generaciones de informe** y es un **insumo, no un log**
(`D-07`). **Ninguna hoja de registro fecha una escritura sobre `MARCADORES`.** Lo único que acota
la ventana son los snapshots —**40** el 17/08, **42** el 18/08—, que dan el día y no la hora.
Menor acá porque los controles cerraron igual; anotado en `PENDIENTES` porque un cambio de
configuración sin corrida que lo reclame es justo el caso donde hace falta poder decir cuándo pasó.

### Los seis que quedan — **un hueco de dato, no una tanda** — 17/08/2026

| qué | cuántos | por qué no están migrados | qué lo destraba |
|---|---|---|---|
| **Los seis `enc_mails_*`** (`digital/Directa Mail`) | **6** | ⚠ **NO es un problema de migración. No publican:** dan `sin_datos` con `«FALTA:@ultimo_ambiguo»`, así que **no hay contra qué verificar** — se compararía `sin_datos` contra `sin_datos` | **una decisión del usuario sobre el dato**: cuál de las dos filas del 28/07 vale cuando comparten la fecha más alta. `PENDIENTES`, 17/08 |

**La distinción importa para leer el avance:** **42 de 48 no es "faltan seis", es "está
completo"** sobre todo lo que hoy se puede migrar y verificar. Su corte sigue en `filtro` mientras
tanto, y **eso es correcto**: migrar un marcador que no publica sería escribir sin poder comprobar.

⚠ **Consecuencia ya conocida: `tipo_envio` queda migrada a medias** —`m2` en `dimensiones`,
`convocatoria` en `filtro`— y un censo de dimensiones que no lo espere lo va a leer como
inconsistencia.

### El alcance real de la migración son **48**, no 78 — y de dónde salió el 78

**Medido el 17/08/2026 sobre `MARCADORES_2026-08-15.tsv`:** de los 78 marcadores de la hoja,
**30 no tienen ninguna dimensión en su `filtro`**. No es que falte migrarlos: **no tienen corte
que mover.** Son los `pauta_*` (filtro vacío en los dos lados, que es el problema de duplicación
de `2026-08-16_5`), los cuatro pares `enc_*`/`ivr_*` de `Directa IVR` (filtro vacío, unificación
bloqueada por `C-01`), los nueve de `reuniones/Agenda JM` (guardas `!=0`, que `D-33` clasificó
como **restricción técnica y no dimensión**), y sueltos como `enc_alcance` y los `gcba_sms_*`.

**De dónde salió el 78, que es lo que hay que no repetir: era el total de la hoja, no el conjunto
migrable.** Se contó *"cuántos marcadores hay"* y se usó como respuesta a *"cuántos hay que
migrar"* — dos preguntas distintas que el mismo número parecía contestar.

| | |
|---|---|
| **78** | marcadores en `MARCADORES` |
| **48** | tienen una dimensión en el `filtro` → **el alcance de la migración** |
| **30** | no tienen ninguna → **no se migran nunca**, tienen otros destinos |
| **16** | ya migrados (piloto + tanda 1) |
| **32** | quedan |

### ⚠ Tres cifras corregidas midiendo, y ya es un patrón

| cifra | decía | era | qué la corrigió |
|---|---|---|---|
| marcadores totales | 51 | **78** | el snapshot del 11/08 estaba viejo (medido 15/08) |
| la tanda inicial | *"los nueve pares `gcba_*`"* | `mail_*` y `frecuencia`, **los `pauta_*` no entran** | medir el `filtro`, no el nombre (15/08) |
| alcance de la migración | 78 | **48** | contar los que tienen dimensión, no los que hay (17/08) |

**El patrón, que es lo accionable:** las tres veces la cifra vieja salía de **contar el conjunto
más grande y fácil de contar** —todas las filas, todos los prefijos `gcba_`— y usarlo como
respuesta a una pregunta más chica. **Antes de citar un número del plan, preguntar de qué conjunto
sale**, que es la misma disciplina que `CLAUDE.md` §4 ya pide para un número publicado: *un número
correcto puede salir de las filas equivocadas.*

### El canario, y por qué `frecuencia`/`gcba_frecuencia` salen de la tanda 1

**El pedido era elegir un canario sucesor** —*"uno sin migrar, de otra solapa, y que ya salga en el
log"*— **y la medición dice que no existe.** Contra `MARCADORES_2026-08-15.tsv`:

**`looker` tiene exactamente diez marcadores: los ocho del piloto (`DIGITAL/Impresiones`, ya
migrados) y `frecuencia`/`gcba_frecuencia` (`resumen_metricas_dinamico`).** No hay un tercer grupo.
Si la tanda 1 se lleva el par, **quedan cero marcadores de `looker` sin migrar** y el proyecto se
queda sin forma barata de saber si la base está en tránsito — justo la base que **demostró
moverse**: 138.427 impresiones en 1h45 sobre una ventana ya cerrada, y un numerador en cero.

**Por eso el par sale de la tanda 1.** La tanda 1 queda en `mail_*`/`gcba_mail_*` **y nada más**.

**Y hay una razón independiente que llegó a la misma conclusión:** los `mail_*` viven en
**`digital/Directa Mail`**, no en `looker`. **La tanda 1 nunca necesitó un canario de `looker`: necesita uno
de `digital`.** Confundir las dos preguntas es lo que hizo parecer que había un problema de canario
donde había dos.

**El canario de la tanda 1, entonces, y sale de la misma medición:** cualquiera de los cuatro
grupos de **`digital/Directa IVR`** —`enc_atendidos`/`ivr_atendidos`, `enc_e75`/`ivr_75`,
`enc_e75_pct`/`ivr_75_pct`, `enc_marque1`/`ivr_marque1`—. Tienen **`filtro` vacío**, así que **no
son candidatos a migración de dimensión en ninguna tanda**, están en otra solapa de la misma base,
y **ya salen en el log**: el testigo agrupa por medida y emite todo grupo de dos o más. *(Sí son
candidatos a la unificación `enc_*`/`ivr_*` de §3, que es otra cosa y está bloqueada por `C-01`.)*

**Lo que generaliza, y conviene escribirlo una vez:** la propiedad que hace a un canario no es
*"nunca migrado"* — es **"no lo toca el cambio que estoy midiendo"**. Escrita así, el canary de cada
tanda se elige solo: uno de la misma base, de otra solapa, que esa tanda no toque.

**Cuándo migra el par, entonces.** En la **última** tanda de `looker`, después de que la Parte C
cierre. Su propia verificación no va a poder apoyarse en un marcador sin migrar de esa base —no va
a quedar ninguno— y eso hay que saberlo **antes** de escribir esa tanda, no descubrirlo ahí.

### `rdv` tiene el mismo problema y es más grande — se resuelve una vez para las dos

**Los 17 marcadores de `rdv` comparten el filtro `figura=Jorge Macri` y ninguno lo tiene vacío**
(medido 17/08). Así que **no hay canario posible**: migrar `ambito` los toca a todos a la vez y no
queda un decimoctavo afuera. Son **17 de 48 — más de un tercio de lo que queda**.

**Es el mismo problema que el par de `looker`, y aparece dos veces**, así que **se resuelve una
sola vez y las dos tandas heredan la respuesta**: `docs/Prompts/2026-08-17_2_contra_que_se_verifica_rdv.md`,
que **no migra nada** y mide tres salidas — ¿está quieta `rdv`? ¿hay una medida legible por dos
caminos? ¿sirve la toma doble?

✅ **CERRADO el 17/08: `rdv` se verifica SIN canario y no hay que esperar ninguna toma.** La
pregunta estaba mal planteada — la verificación corre **testigo → migración → testigo en la misma
sesión**, con minutos entre tomas, así que el drift no alcanza a intervenir. Dos lecturas a 12
horas dieron idénticas, y `rdv` tiene **dos invariantes que no dependen del drift**: las 17
cuentas de filas iguales y la identidad de canales en 2.307. **El criterio corregido está en
`CLAUDE.md` §4** y vale para todas las tandas: la pregunta no es *"¿está quieta la base?"* sino
**"¿se mueve dentro del intervalo de la verificación?"**.

⚠ **Y hay una asimetría que conviene esperar:** la **ventana cerrada** de `digital` resultó
estable y la de `looker` no (17/08: `digital` sí crece, pero **fuera** de la ventana). Es
probable que la respuesta **no sea la misma para las dos bases**, y el prompt dice explícitamente
que no se fuerce una respuesta única.

**Dónde se cruza con lo que ya estaba listado, para que nadie lo trabaje dos veces.** Los frentes
7 y 11 tocan Call Center, y §3 tiene una fila de *"16 tokens del Resumen Ejecutivo sin fuente"*
que incluye ocho de Call Center. **No son lo mismo:** aquélla dice que el dato **no está en
ninguna de las cuatro bases**; `C-61` es sobre `looker/CC`, que sí lo tiene, y sobre el costo de
agregarle una columna. Se cruzan al llegar al 11.

---

**IDs `T<tramo>.<n>`.** La palabra "Paso" queda para la serie histórica y no se reusa: `Paso 5`
ya se ejecutó, y `Paso 6` significa *"cuando se publique `/exec`"* en `PENDIENTES`, `BITACORA` y
`RUNBOOK`. Cada sub-ítem de acá es **un prompt y un commit**.

**Tramo 1 — cerrar configuración: hecho.** Los siete ítems (acceso a las bases, tercer escritor
de `MAPEO`, disposición de `SOLAPAS`, `hayUi_()`, `periodo_id`, `carpeta_salida`, activar `m2`)
cerraron entre el 02 y el 03/08. Detalle en `BITACORA.md`; los dos punteros finos son
[`carpeta_motor`](BITACORA.md) —una sola aparición, en la entrada del `Paso 2.15` Parte A— y el
rol `reader` de las cuatro bases —una sola, en la del 03/08 sobre permisos de Drive—.

---

### Tramo 2 — corte vertical, JM solo · *acá estamos*

> **Criterio del tramo (03/08):** las solapas y el mapeo que falten se ajustan **después** de la
> primera prueba de punta a punta, no antes. El corte vertical es el que dice cuáles hacen falta
> de verdad, y lo dice barato: un token sin cablear sale `«FALTA:token»` y queda listado. Lo
> midió el `Paso-2.16`, que fue a activar `m2` y encontró que no había nada que activar.

**`T2.1` · la corrida siempre cierra. Es el MVP.** Hoy una corrida sin tiempo muere sin decir qué
hizo. El objetivo no es que termine: es que deje siempre un deck usable y la lista de lo que
faltó. **No depende del anclaje.**
- ~~`T2.1.1` — el motor mira el reloj y corta antes del límite~~ — **hecho 06/08**, cerrado por
  verificación humana (`BITACORA.md`)
- ~~`T2.1.2` — el cierre se escribe siempre: fecha, tokens puestos, faltantes~~ — **hecho 07/08**
  (`N2`), también cuando algo explota
- `T2.1.3` — la fila guarda hasta qué ítem llegó

**`T2.2` · bajar el costo por ítem.** Mejora, no requisito.
- ~~`T2.2.1` — medir el presupuesto de una corrida~~ — **hecho 06/08.** ~661 s contra 360
  disponibles; `resolverMarcadores` cuesta ~50 s y se llama seis veces. Detalle en `BITACORA.md`.
- `T2.2.2` — sacar lo repetido por ítem. **La medición ya descartó las tres candidatas
  obvias:** `leerMarcadores_()` es el 0,7% de la llamada que lo contiene, `getSlides()` 13 ms,
  `replaceAllText` 7 ms por token. El costo está adentro de `resolverMarcadores`
- `T2.2.3` — comprobar que ningún valor cambió

**`T2.3` · reanudar.** Depende de `T2.1.3`. **Decidido (usuario, 06/08):** la llamada vuelve
enseguida con el `corrida_id` y el cliente consulta la fila hasta que cierre. Que la llamada
espere el ciclo completo **no es una opción**: el `doPost` que la atiende es él mismo una
ejecución de Apps Script y se muere antes que la continuación que estaría esperando.
- `T2.3.1` — continuar desde el índice guardado, invocado a mano
- `T2.3.2` — la continuación se dispara sola. **Verificar antes la cuota de disparadores** — 90
  min/día en cuentas gratuitas, 6 h en Workspace, y un deck de tres ejecuciones son 18 min por
  corrida
- `T2.3.3` — `LockService`, para que dos continuaciones no se pisen
- `T2.3.4` — el cliente consulta la fila hasta el cierre, en vez de retener la llamada

~~**`T2.4` · los cuatro objetivos contra un deck real.**~~ — **hecho el 07/08.** `SUMA` sobre cero
filas, `ULTIMO` por fecha, el agregado global de `digital`, el sembrado del Resumen Ejecutivo,
contra una corrida real. Evidencia en `docs/PROTOCOLO_T2.4_corrida_2026-08-07.md`. **El texto
anterior decía *"sale apenas exista `T2.1`"* mientras `T2.11`, doce líneas más abajo, ya lo daba
por corrido** — la contradicción se resuelve acá a favor de la bitácora (`CLAUDE.md` §7).

**`T2.5` · las operaciones que faltan.** Una que devuelva **lista** y no número (`P1`),
`DISTINCT` para `ecv_barrios` (`P2`), y un formato de porcentaje sin signo (`P2`). Cada token sin
operación es un `«FALTA:»` garantizado. → `PENDIENTES_consistencia.md`.

**`T2.6` · los tres grupos que recortan a cero filas.** IVR (0 de 57 sobre `Inicio`),
`sd_pauta_*` y `Digital`. **Ya no es pregunta al equipo (usuario, 06/08):** los agregados van por
la ventana del informe, viernes a jueves. Lo que hay que medir es **por qué esa ventana da cero**.

**`T2.7` · el instrumento.** `marcarEtapa_` traga sus excepciones **y las cinco marcas se pisan
en la misma celda**, así que una fila puede decir que una corrida no arrancó cuando llegó a la
etapa 4. Hoy es lo único que nos dice qué pasa.

**`T2.8` · el score de anclaje.** Saturó en 1,00 y el circuito de `ANCLAJE_PENDIENTE` nunca se
probó de punta a punta. → `PENDIENTES_consistencia.md`, `P1`.

**`T2.9` · el matcher (`Union.gs`).** Cuatro cosas que tocan la misma función.
- `T2.9.1` — `R-12`: ampliar la búsqueda de candidatos antes de declarar `sin_link`
- ~~`T2.9.2` — los dos valores de ventana a `CONFIG`: la corta (hoy constante de módulo) y la
  ampliada (no existe)~~ — ✅ **CERRADO 20/08/2026** (`2026-08-20_8`). Las dos claves están en
  `CONFIG` desde el 07/08 y **la mitad ampliada ya se consume**: `anclarEnDosPasos_` busca acotado
  primero y amplía sólo si no encontró, con la regla de corte *lo que el paso 1 resuelve queda
  resuelto* sosteniendo el determinismo. ⚠ **Entra con la ampliada vacía**, y eso no es que falte
  el número: la medición mostró que **ninguno de los dos recortes pierde el candidato** —`digital`
  es `snapshot` y la cercanía es ±14 simétrica— y que **el que lo pierde es el score**, que da cero
  más allá de 2 días. **Queda propuesto y sin aplicar** el reparto de puntaje por fecha, que es
  decisión del usuario: mueve qué cuenta se ancla a qué encuentro. Ver `R-12` Addendum 1
- `T2.9.3` — el empate técnico que `DISENO_match_temario.md` §6.4 declara y ningún código
  implementa
- `T2.9.4` — retirar `VALOR_STATUS_REALIZADA_` (`Union.gs:219`), que hoy filtra dos veces por lo
  mismo
- ~~`T2.9.5` — que la precondición devuelva **cuáles** son los grupos en violación~~ — **medido
  el 06/08: no hay ninguno.** `verificarPrecondicionAnclaje_()` devuelve `ok`, con 660 filas
  consideradas y 702 excluidas por lista blanca, y ya guarda el contexto para nombrar los grupos
  si volviera a haberlos

> **La dependencia del anclaje está vencida, medida el 06/08.** El ítem de `R-01` (03/08) dice
> que *"el matcher está bloqueado y con él la parte del Tramo 2 que depende de encuentros
> anclados"*. **No lo está:** la precondición pasa, y `itemsDeSeccion_('encuentro')` devuelve los
> cinco encuentros anclados con su `id_cuenta`. Lo que lo destrabó ya estaba hecho —
> `verificarPrecondicionAnclaje_` **pasa por la lista blanca de `D-21`** desde la corrida
> nocturna del 04/08, que es exactamente la mitad de `T2.9.4` que el plan seguía reclamando.
> El pendiente **no se cierra acá**: se reporta que su consecuencia dura no aplica.

**`T2.10` · paginar una sección repetible: una lámina cada N ítems.** *(escrito el 07/08; **no
implementado**, y **no aprobado** — entra a la lista, no al trabajo en curso)*

Hoy `duplicarBloquesRepetibles_` duplica **una lámina por ítem**: `resultado.items.forEach` y
un `modelo.duplicate()` por vuelta. Cinco encuentros, cinco láminas. Lo que hace falta para la
lámina 7 de `jm` es lo otro: **una lámina cada cuatro ítems**, con las ranuras sobrantes de la
última en blanco.

- No es un caso raro de lo que ya existe: es **otro modo**. Hoy la lámina modelo tiene los
  tokens de **un** ítem y se duplica; ahí la lámina modelo tiene **N ranuras** y hay que
  repartir los ítems entre ellas y **vaciar las que sobran**.
- **De qué depende:** de nada del motor — se puede construir cuando se quiera. Depende de una
  **decisión**: qué declara el tamaño de página. Lo natural es una columna nueva en
  `SECCIONES` (`items_por_lamina`, vacío = el comportamiento de hoy), y eso es esquema, así que
  hay que decidirlo antes de escribir código.
- **De qué depende que valga la pena:** de las siete decisiones del 06/08 sobre la lámina 7
  (`CONFIG_INFORMES.md` §1.8). **Sin esto, la lámina 7 no puede funcionar como se decidió: con
  cinco campañas, la quinta no entra** — y no entra **en silencio**, que es la mitad cara de
  `D-22`.
- **Lo que ya está medido y no hace falta volver a medir:** `D-22` — el motor lee tablas y no
  sabe agregarles filas. `T2.10` **no** levanta esa limitación: reparte ítems entre ranuras
  fijas. Agregar filas a una tabla es otro trabajo y no está pedido.

**`T2.11` · recorrer el cableado lámina por lámina.** *(decisión del usuario, 07/08/2026 — es
el paso que sigue al Tramo 2)*

**El número que lo justifica:** de los 143 tokens de `jm` sin valor en ninguna caja, **125 son
cableado o datos, no motor** — 72 sin fila en `MARCADORES`, 53 de la sección `campana` que no
tiene ítems porque `CAMPANAS` no tiene filas de `jm`. Los 18 restantes se reparten entre 15 de
fuentes con cero filas y 3 `[MANUAL]`. **El motor dejó de ser el cuello de botella.**

- Se recorre **lámina por lámina**, no token por token ni familia por familia: la lámina es la
  unidad que una persona puede mirar y decir *"esto está bien"*.
- **No es un paso de código.** Cada lámina puede terminar en una fila de `MARCADORES`, en una
  fila de `MAPEO`, en una carga de datos, o en una pregunta al equipo. Si aparece algo que
  necesita motor, ése es un sub-paso propio y no se hace acá.
- **Depende de `T2.4`**, que ya corrió: hay un deck completo contra el cual mirar cada lámina.

---

### Sellado y clasificación de láminas (`D-23`)

Ordenado, y **cada fase nombra su precondición**. La Fase 1 fue la decisión misma: `D-23`,
escrita el 07/08/2026. Ninguna de estas fases toca `familia_tokens` — queda congelado hasta
la Fase 4.

| fase | qué | precondición |
|---|---|---|
| ~~**2**~~ **hecha 09/08** (el `_11`, **51 láminas selladas**; `seccion_id` quedó vacío en las 51 por diseño — el sellador no deduce) | `sellarPlantilla(informe_id)` **crea la hoja `LAMINAS` y sella, en una sola operación.** Por cada lámina sin ancla: toma el siguiente id de la hoja, escribe la fila y **anexa `#lamina: L-NNN`** a las notas del orador. No toca las que ya tienen ancla. Nunca `setText`: anexa. Columnas: `lamina_id`, `informe_id`, `seccion_id`, `orden_plantilla` (reportado, **no** autoritativo), `escondida`, `origen`, `modo`, `itera_sobre`, `filtro` (los tres vacíos = heredan), `rol`, **`cobertura`** (renombrada desde `estado` el 09/08 por el `11.1` §1 — `SECCIONES.estado` ya existe y responde otra pregunta: aquélla es de ejecución, ésta es de cobertura; valores `cerrada` · `parcial` · `abierta`), `falta` (**se queda así**: significa lo mismo que `SECCIONES.falta`), `notas`. Es `SOLAPAS` del lado del deck, y es `D-17` aplicado a láminas | **la autorización de `C-01` para escribir las notas** (`REGLAS_NEGOCIO.md`, suspensión acotada + sus dos addenda). El acceso ya está: las dos plantillas dan `EDIT` a la cuenta del script |
| **—** | **El usuario llena 26 celdas de `seccion_id`** en la hoja. Es trabajo humano y está contado: 26 de 51 láminas no tienen sección deducible | Fase 2 |
| **4** | Los consumidores migran al ancla: `LAMINAS_CONGELADAS_` sale del `.gs`, la emisión deja de derivar la pertenencia por prefijo, esconder/mostrar desde el menú, y se resuelven las 4 candidatas a colapsar | las celdas llenas, **y una autorización nueva de `C-01`** para `setSkipped` |
| **5** | El cableado de la lámina nueva, y después la capa de panel de `docs/OBJETIVO_lamina_nueva.md` | Fase 4. **Sin definir: no inventarlo** |

**Por qué la Fase 2 y la 3 se fundieron, y no hay Fase 3.** El contador de `L-NNN` vive en la
hoja `LAMINAS` (`D-23`, addendum 1, punto 9): **no se deriva de las notas de las plantillas**,
porque derivarlo haría retroceder el contador al retirar una lámina y un id se reasignaría.
Con el contador ahí, sellar necesitaba la hoja y la hoja necesitaba la clave que escribe el
sellado. **No se ordenan: se hacen juntas.** El número de fase 3 no se reutiliza — la
numeración es histórica, como los `D-NN`.

**Y no hay segundo sellado.** El ancla tiene un solo campo, así que el sellador **no deduce
nada y no se traba nunca**. El default-deny no está en él: está en la hoja — **una lámina sin
fila se reporta, no se adivina**, igual que una solapa no declarada en `SOLAPAS`.

**`T-limpieza` · limpiar el ancla de un informe generado.** Función a demanda, que corre el
usuario cuando quiere; **sin automatismo y sin concepto de "informe cerrado"**. Borra la línea
del ancla, **nunca `setText`** sobre las notas — la copia hereda las del equipo. Actúa **sólo
sobre el informe generado** y **se niega** si el archivo es una plantilla: la plantilla no se
limpia nunca.

- **Recibe una corrida, no un archivo señalado a mano.** Está medido: `CORRIDAS` tiene
  `deck_id` cargado **en sus 27 filas**, y `verificarObjectIdDeCorrida_` (`Generador.gs`) ya
  hace el patrón entero — busca la fila, abre el deck por id y trabaja sobre él.
- **Lo que sigue sin definirse:** cómo se elige **cuál** corrida cuando hay varias. Se decide
  al implementarla, no acá.
- **Precondición:** la Fase 2 — sin ancla no hay nada que limpiar. **No necesita autorización
  de `C-01`**: actúa sobre la copia, que es salida del motor.

---

### Tramo 3 — prueba de motor (SECCO)

- `T3.1` — correr SECCO **midiendo líneas de `.gs` tocadas**. Es el paso que valida la tesis del
  proyecto (`D-01`); si falla, lo que salga es el trabajo del tramo siguiente.
- `T3.2` — revisión de exposición del repo público, programada para este hito: 14 IDs internos,
  datos personales en el historial, `.clasp.json` trackeado, `PLANTILLA_JM_CANONICA_`
  hardcodeada. Los cuatro son `P0` en `PENDIENTES_consistencia.md`.

### Tramo 4 — panel (`D-04`)

- ✅ **Revisar y confirmar anclajes desde el panel** — **hecho el 21/08/2026**
  (`2026-08-21_16` + su addendum; bitácora del día). La pestaña `Anclajes` lista lo pendiente con
  sus candidatos y puntajes y escribe `elegido`. `D-29` tiene su addendum: la cláusula *"hasta que
  el front exista"* dejó de aplicar.
  ⛔ **Lo que sigue abierto y no es esto:** los anclajes que **empatan arriba** del umbral no pasan
  por `ANCLAJE_PENDIENTE`, así que **esta pantalla no los ve** — el modo de falla del `3347`. Es
  del motor (`scoreMatchDigitalRdv_`), remitido a `D-29`. Y **el circuito completo sigue sin
  correr de punta a punta**: falta ver que un `elegido` cargado haga anclar.
- `T4.1` — **primero:** qué devuelve `getActiveUser()` con el despliegue *"ejecuta el usuario que
  accede"*. Si vuelve vacío, `D-15` se revisa **antes** de escribir código de panel.
- `T4.2` — `doGet`, selección de informes, corrida a demanda
- `T4.3` — `D-16`: acceso por usuario. La pieza 3 sigue sin resolver (§3)

### Tramo 5 — chequeo previo programado (`D-11`)

- `T5.1` — todo lo que queda de lo que antes eran los Pasos 10-12

---

### Higiene — sin orden, cada uno un prompt cuando toque

Los `P0` y `P1` de `docs/PENDIENTES_consistencia.md` que no son de ningún tramo. **No se listan
de nuevo acá:** ese archivo es su dueño y lleva su prioridad. Los dos que son **acción del
usuario y no de Code**:
- `rdv` compartida como `anyoneWithLink = writer`, que pisa el `reader` explícito (`P0`)
- el registro automático de plantillas no ve la de JM y sí ve los backups (`P0`)

### A revisar a futuro, no bloqueante

**Los 33 tokens que el motor no ve** — ningún `.gs` recorre `getTables()` ni `getGroups()`
(`PENDIENTES`, `P1`). **Decisión del usuario (06/08): no bloquea el tramo.** Son tokens sin
información y se revisan más adelante.

### Dato del terreno, no problema

**El límite de ejecución de Apps Script son 6 minutos**, iguales para cuentas gratuitas y
Workspace, y **no se puede extender**. Una línea, para que nadie vuelva a proponer agrandarlo.

**El alcance de Meta no se vuelve a medir** (decisión del usuario, 14/08/2026). `alc_real` ya
está mapeado en las dos solapas de `reuniones` y **su nota de `MAPEO` dice de qué columna de
`Base_Digital` se copió**; el porqué vive en `R-27`. **No entra al plan** — está acá por el mismo
motivo que la línea de arriba: para que no vuelva a proponerse.

---

## 3 · Planificado y bloqueado

Cada ítem nombra **qué lo destraba y de quién depende**.

| qué | qué lo destraba | depende de |
|---|---|---|
| ⭐ **`D-NN` — el motor no sabe PARA QUÉ CORRIDA está resolviendo. UNA pieza, dos síntomas.** Ver la entrada larga debajo de esta tabla: **se anota como una sola porque arreglarla dos veces la va a arreglar distinto** | **una decisión de diseño**: qué identifica una corrida y cómo viaja. Los dos síntomas la necesitan igual | usuario |
| **`CAMPANAS` necesita columna de `Id cuentas`** — medido el 19/08: sus diez columnas no la tienen, y **el nombre no sirve como clave** (`docs/CENSO_ids_campanas_2026-08-19.md`). Los cuatro ids ya están medidos | **agregar la columna por `COLUMNAS_DELTA_`**, con su fila en `ESCRITORES.md`. ⛔ **Es lo que falta antes de cargar las campañas** | interno |
| **`R-NN` del recorte heredado de Call Center** — *(era el frente 8 del Próximo; bajó acá el 16/08)*. **Los nueve `enc_*` de Call Center leen `reuniones/Agenda JM`, que es un agregado por encuentro ya calculado río arriba, y nadie declaró qué tipos de llamado entran en ese agregado.** El corte por `Tipo de llamado` existe una capa más abajo —en `reuniones/Call`— y el motor no lo ve: **hoy hereda un recorte que no eligió y que no está escrito en ninguna parte.** Es `C-64` otra vez, filas contra agregado. ⚠ **La premisa anterior era falsa y queda escrita para que no vuelva:** decía *"`enc_*` filtra `Tipo de llamado IN (Convocatoria, IVR convocatoria)` y `cc_*` no filtra"*, y **las dos mitades son falsas** (medido el 16/08 contra los snapshots del 15/08) — **no existe ningún marcador `cc_*`** (son tokens de las láminas 2 y 5 **sin fila**, que publican `—` por `_32.2`) **y ningún `enc_*` filtra por `Tipo de llamado`** (los nueve llevan guardas `!=0`, que `D-33` clasificó como restricción técnica). El único filtro `Convocatoria` es `mail_tipo=Convocatoria`, que es **mail**. El frente salió de un reporte de validación que se pasó al plan **sin cruzarlo contra `MARCADORES`** | **la decisión sobre los `cc_*`**, que el usuario ya tomó en su primera mitad: **siguen publicando `—` por `_32.2`** (16/08). Lo que falta es la otra mitad — **si `reuniones/Call` o `Métricas EDVs` pasan a `fuente`, o si el recorte se declara sin leerlas**. Hoy las dos están fuera del alcance de lectura a propósito, y `Métricas EDVs` además tiene dueño en otra planilla y clave `ID Reunión`, no `ID Cuentas`. **Subordinado a *primero se cierra la migración, después se cablea*** | usuario |
| **`C-61` — dónde se inserta la columna que mueve 229 cuentas** *(era la decisión 1 del reporte del 16/08)*. La mitad de escritorio está medida: **el motor lee por posición**, y **`looker/CC` tiene cero filas de `MAPEO` y cero marcadores**, así que hoy no hay mapeo de `CC` que un corrimiento pueda romper. Falta el censo de la solapa y la decisión de **a la derecha del todo** (riesgo cero) **o en el medio** (corre todas las letras a su derecha, y el mapeo apunta una más allá **sin fallar**) | **la decisión del 16/08: *primero se cierra la migración, después se cablea*.** No es un pendiente suelto: está **diferido a propósito** detrás de la migración. El censo (`censarSolapasParaAlta()` sobre `looker/CC`) puede correrse antes, porque es sólo lectura | usuario |
| **Unificar los cuatro pares `enc_*` / `ivr_*`** — `enc_atendidos`/`ivr_atendidos`, `enc_e75`/`ivr_75`, `enc_e75_pct`/`ivr_75_pct`, `enc_marque1`/`ivr_marque1` | **el piloto de `D-33`**, y después `C-01`. Misma base, misma solapa, mismo campo, sin filtro: **no es descuido, es una migración a medio hacer** — `TOKENS.md` ya declara `enc_*` como canónico y los `ivr_*` siguen cableados porque las **láminas 2 y 5** los usan. **Decidido (usuario, 15/08): sobrevive `enc_*`.** No entra al `_2` porque unificar es **renombrar tokens en la plantilla**, que es de `C-01`, y arrastra esas dos láminas | usuario, por `C-01` |
| **Los siete `ecv_*` ambiguos** | `D-33` ya está escrita, así que lo que falta es aplicarla a esta familia. **Es precondición de globalizarla**, no prolijidad: mismo nombre y distinto hecho — y su ambigüedad es **dentro de `jm`**, entre la lámina 5 (agregado del período) y la 6 (por encuentro), no entre informes | interno |
| **Los estados `-` y `---`** — ✅ **HECHO, 20/08/2026** (`docs/Prompts/2026-08-20_1_cuatro_simbolos.md`). Estaba **decidido y diferido** desde el 16/08 —*se queda `«FALTA:token»` mientras `S-05` valga, `---` se implementa el día que haya lector externo*— y **entró antes**, por decisión del usuario del 20/08. ⚠ **Dos diferencias respecto de lo que esta fila decía, y conviene leerlas:** **(a)** son **cuatro símbolos y no dos** — `/////` falta el token · `---` falló · `-` sin dato · `-1.234-` dudoso; **(b)** **`-` quedó reservado a `sin_datos`** y no es el genérico que el título de esta fila sugería. La línea que importa es `/////` vs `---`, que dice **quién arregla qué**: cableado o fuente. **(c)** **`S-05` no se cayó**: el crudo no se retiró, quedó detrás del checkbox, así que lo que entró es un **modo** y no un reemplazo | — ya no bloquea nada. **La salvaguarda se verificó y sigue en pie:** el reporte de corrida sigue contando los cuatro estados por separado (`Marcadores: N resueltos · N sin dato · N a revisar · N en error`), así que *"no calculable"* y *"falló el cableado"* siguen distinguidos aunque el deck use símbolos | usuario — **decidió el 16/08 y adelantó el 20/08** |
| **Los nombres de los tokens de la lámina del "1 a 1"**, más *"el desglose por herramienta es sólo de `jm`"* (`CONFIG_INFORMES.md` §1.9) | el `_2` | interno |
| **`tipo` viaja con el ítem del encuentro**, y **qué consume hoy `LAMINAS`** | nada técnico: **espera su turno.** Son las dos piezas de *"que la lámina se use sólo en 1 a 1"* | interno |
| **Sellado y alta de la lámina del "1 a 1" en `jm`** (`L-052`+) **y su cableado** | los nombres. **Hasta entonces la lámina se queda en la plantilla, visible y sin cablear**: sus `«FALTA:token»` son la lista de lo que falta, y por eso **no se sella ni se le crea fila en `LAMINAS`** | interno |
| **Qué pasa con la lámina "Uno a uno — resultados plataforma" de `secco`**, que tiene los `u1_bench_*` marcados | decisión del usuario entre las tres salidas de `CONFIG_INFORMES.md` §1.9: retirarla, cablearla con los mismos tokens de `jm`, o dejarla como está | usuario |
| **La remedición de los cuatro bloques PRE contra `V-101`** | la corrida del 15/08 | interno |
| Fuente de MiBA | definir de dónde salen los datos | tercero |
| ¿M2 tiene ventana propia, o usa la del informe? | `R-11` + su Addendum 1 (02/08/2026) cerraron la semana del informe: **siete días, viernes a jueves**, que es exactamente el único caso observado de M2 (vie 24/07 → jue 30/07). La etiqueta vieja de esta fila, "ventana jueves-a-jueves", **no la sostiene su propia evidencia** y se descarta. Queda una sola pregunta, más chica: si M2 se rige por `R-11` como todo lo demás —y entonces esta fila se cierra— o si tiene una ventana propia que todavía no se observó. Sigue haciendo falta una segunda semana | equipo |
| Qué regla selecciona los envíos de M2 dentro de la ventana | no es la marca `M2` ni la fecha; si es curaduría manual, hace falta registro a nivel `ID MailUp` | equipo |
| La lámina dice 18 envíos y 11 campañas; el número sale de 10 envíos y 3 campañas | preguntar quién armó la lámina | equipo |
| Etapa 2: actualizar el deck en sitio (`D-06`) | el mapa `token → objectId` de la etapa 1, más decidir qué hace el motor cuando una caja registrada ya no está | interno |
| `D-16` · acceso por usuario a informes y datos | resolver la pieza 3: cómo se sostiene la restricción sobre archivos de Drive y bases, no sólo sobre el panel. Requiere el panel construido (`D-04`) para probar contra algo real. ⭐ **Y la decisión del 23/08 le cambia la forma antes de que se agarre** — ver la última fila de esta tabla: `D-16` punto 3 nombra **dos** caminos de fuga, *«el usuario abre el deck directo»* y *«el motor corre con su identidad (`D-15`) y lee bases que el usuario no debería ver»*. **El segundo desaparece**: si el motor ejecuta siempre como él mismo, el usuario nunca toca una base. **Queda uno solo, y es el que el usuario nombró: quién queda como dueño del deck generado y a quién se le comparte** | interno |
| Qué pasa con `m2` en `MAPEO` — las 19 filas duplicadas de `digital`, y si se mapea `Cuentas M2` | **el `Paso-2.5`**, cuando se siembre `MARCADORES` leyendo los `{{token}}` reales de las plantillas (`D-17`). Recién ahí se sabe si algún token pide los atributos de `Cuentas M2`. **El criterio ya está fijado** (usuario, 03/08/2026): `Cuentas M2` es un **catálogo de cuentas** —eje, área, nombre de campaña—, **no una fuente de métricas**; se mapea **sólo si algún token necesita esos atributos**. Las **métricas** de M2 salen de `digital`, no de `m2`. Sin token que las pida, las 19 filas se despiden y no se mapea nada | interno |
| Los `camp_*` no dan número: `CAMPANAS` no tiene ninguna fila de `jm` | que alguien cargue **el temario** en `CAMPANAS` — las campañas que el equipo elige mostrar, con `mostrar` y `orden`, y **no las del período**: la selección es por temario (`R-17`, 07/08/2026) y una campaña anterior a la ventana entra igual. Sin filas, la sección `campana` emite 0 ítems — medido el 06/08: `itemsDeSeccion_('campana')` devuelve `items: 0`. Ojo con `periodo_id`: vacío, la fila no entra a ningún informe (`D-19`) | usuario |
| 16 tokens del Resumen Ejecutivo sin fuente: los ocho de Call Center (`cc_base` no existe en ninguna base), los seis de impresiones por plataforma y `contenidos_total` | decidir de dónde salen. No es cableado pendiente: **el dato no está en ninguna de las cuatro bases** | equipo |
| La fila `resumen_ejecutivo` de `SECCIONES` está declarada `repetible` + `manual`, y está medido que **no puede ser repetible** | una línea: los tokens de GCBA llevan prefijo propio, así que el bloque no se itera. Es cambio de configuración, no de código | usuario |
| ⭐⭐ **DEPLOY MULTIUSUARIO — que otro usuario entre por link y genere el deck.** *(anotado el 23/08/2026 por decisión del usuario; **va al final de la cola y no se trabaja todavía**)*. **La decisión ya está tomada: el motor ejecuta con SU identidad** —`executeAs: USER_DEPLOYING`— **y el acceso se controla por lista blanca. Las bases quedan compartidas con el motor, no con cada usuario.** ⛔ **Deroga `D-15`** (que eligió *"ejecuta el usuario que accede"*) **y arrastra a `D-02`** — y no es una lectura mía: **`D-15` lo declara ella misma**, *"si alguna vez se pasara a ejecutar como: yo, las bases dejarían de necesitar compartirse y `D-02` cambiaría de sentido. No son decisiones independientes"*. ⚠ **El `D-NN` que las supersede NO se escribe hoy**, y el motivo es el de la columna de al lado: una decisión que se apoya en una premisa sin medir no se registra como tomada | **Dos cosas, en este orden.** ⑴ **Que cierre la fase `informe semanal`** (`D-38`) — por eso va al final. ⑵ ⛔ **Una medición previa que puede tumbar la decisión entera:** con `executeAs: USER_DEPLOYING`, `Session.getActiveUser().getEmail()` **suele volver vacío en cuentas Gmail** —lo dice la propia `D-15`—. **Si vuelve vacío, la lista blanca no filtra a nadie y `access: ANYONE` deja la URL abierta.** ⚠ **Y al anotarlo aparece que esa medición NO es la que ya está en el plan:** `T4.1` (§2, Tramo 4) mide `getActiveUser()` bajo *"ejecuta el usuario que accede"* — **el despliegue que esta decisión descarta**. Son **dos mediciones distintas**, la nueva **no estaba escrita en ningún lado**, y `T4.1` no la contesta | usuario |
| **Concurrencia** — *va con el deploy de arriba*. Con **un** usuario ninguna de las dos se puede manifestar; con **dos**, sí. **`FALTANTES` se pisa entera en cada corrida**: `escribirFaltantes_` borra de la fila 2 hasta el final y reescribe (`Generador.gs`, `B.7`/`D-12`), y **eso es correcto hoy a propósito** —*"es la lista de trabajo de lo que falta cablear, no un historial"*—. **`ANCLAJE_PENDIENTE` también se escribe** durante `anclarEncuentros`. ⭐ **No son bugs: son decisiones correctas para un usuario, que dejan de serlo con dos** — y ése es justo el modo de falla que no se ve hasta que ya pasó | **el deploy**. Antes de eso no hay con qué reproducirlo | interno |
| **Los símbolos del deck pasan a ser interfaz** — *va con el deploy de arriba*. Los cuatro —`/////` falta el token · `---` falló · `-` sin dato · `-1.234-` dudoso— **hasta hoy los miraba sólo el desarrollador**. Con otro usuario entrando por link, **los lee alguien que no sabe qué significan**, y dos de ellos mandan a trabajos opuestos | **el deploy** | usuario |

Nota: los tokens de MiBA ya están marcados en las plantillas, así que en cuanto corra el
Paso 4 van a emitir `«FALTA:miba_*»` en `FALTANTES` en cada corrida. **Lo postergado se
auto-reporta.**

---

### ⭐ La pieza que falta: **el motor no sabe para qué corrida ni para qué informe está resolviendo**

> **Una sola pieza, dos síntomas.** Se anota junta a propósito: **si se arregla por separado se va
> a arreglar dos veces y distinto** — dos formas de decir "para qué corrida", que después hay que
> reconciliar.

**La causa es la misma en los dos casos y ya estaba medida el 16/08:** las funciones que resuelven
**no reciben la identidad de la corrida**. Reciben la *ventana*, que es una consecuencia, no la
identidad.

| dónde | qué recibe | qué le falta |
|---|---|---|
| `resolverVentana(opciones)` | `campana`, `periodo_ref`, … | **`informe_id`** |
| `itemsDeSeccion_(seccion, informeId, ventanaInforme)` | `ventanaInforme` | **el `periodo_id` de la corrida** |

#### Síntoma 1 · `jm` y `secco` resuelven la MISMA ventana (16/08)

Los cinco eslabones de `D-20` son **campaña → `periodo_ref` del marcador → sección → `CONFIG` →
`R-11` calculado**, y **no hay eslabón de informe**. Como `CONFIG` es **un único par de celdas
global**, los dos informes caen ahí y resuelven **24–30/07** con origen `config`. Los eslabones 2 y
3 no se disparan nunca: `periodo_ref` está vacío en los **78 marcadores** y en las **36 secciones**.

**Se puede forzar a mano** —`generarInforme(informeId, periodoId)` pisa la cadena entera— **pero no
se resuelve solo.**

**Qué necesita:** que `informe_id` entre a la cadena de `D-20` como eslabón, por encima de
`CONFIG`.

#### Síntoma 2 · la selección semanal de campañas no existe (18/08)

Con `CAMPANAS` como lista y sin el filtro por `informe_id`, **lo único que decide en qué corrida
sale una campaña es `periodo_id`** — y la rama `CAMPANAS` de `itemsDeSeccion_` sólo exige que **no
esté vacío**, no que **coincida con el período de la corrida**.

⚠ **Consecuencia concreta y verificable: con las tres campañas cargadas, las tres saldrían en
TODOS los informes.** No es un olvido del cambio del 18/08: es esta pieza.

**Qué necesita:** que `itemsDeSeccion_` reciba el `periodo_id` de la corrida y compare contra
`CAMPANAS.periodo_id`. Hoy no lo tiene — la rama `REUNIONES` se lo saca a `anclarEncuentros`, que
es una fuente distinta y no le sirve a `CAMPANAS`.

#### Por qué es una sola pieza y no dos

**Las dos preguntas son la misma:** *"¿de qué corrida es esto?"*. Un arreglo que le pase
`periodo_id` a `itemsDeSeccion_` sin tocar `resolverVentana` deja el motor sabiendo la corrida para
elegir ítems y **sin saberla para resolver la ventana** — que es de donde salen los números. Y al
revés, ídem.

**El precedente de este repo dice qué pasa cuando se parte una decisión así:** `R-16` y `R-17` se
separaron y las dos versiones divergieron hasta que `R-21` tuvo que unificarlas. La fila de §7 que
declara a `R-21` dueña única de esa pregunta existe por eso.

⚠ **Y lo que NO es:** no es un bug de `CAMPANAS` ni de `D-20`. Los dos módulos hacen bien lo que
tienen delante; **lo que falta es un dato que nadie les pasa**.

## 4 · Backlog (sin orden, sin fecha)

- **El refresco de un deck ya publicado** — es la fase `informe actualizable` de `D-38`, y **no
  empieza hasta que cierre la otra**. Parte A escrita y sin correr: un censo de viabilidad, sólo
  lectura, cuyo §A.1 punto 3 —*¿una lámina repetida conserva algo que diga de qué ítem es?*— puede
  cerrar el tema antes de empezar.
  (`docs/Prompts/2026-08-22_24_refresco_de_deck_publicado.md`, ⏸ diferido en su propio encabezado.
  Va acá y no a §2 por lo mismo que el banco de láminas: un prompt escrito y sin correr que no está
  en el plan no lo encuentra nadie.)
- **Un banco de láminas compartidas** — Parte 0 escrita, sin correr; la premisa dura es si la API
  permite insertar una slide de otra presentación.
  (`docs/Prompts/2026-08-21_12_banco_de_laminas.md`. ⚠ **Un prompt sin correr que no está en el
  plan no lo encuentra nadie** — por eso la línea, decisión del usuario 21/08.)
- **El tercer informe.** *(Bajó de "Planificado y bloqueado" el 14/08, aplicando la prueba de §9.)*
  Su columna de destrabe decía *"no es prioritario: el objetivo es la capacidad de incorporar
  informes, no un informe puntual"* — **eso es una razón para no hacerlo, no algo que lo
  destrabe.** Si no podés decir qué lo desbloquea, es backlog. Nada de esto cambia la decisión:
  sigue sin ser prioritario, y por el mismo motivo.
- **`C-21`** — ocho fixtures sin versionar. **No se resuelve midiendo**, y por eso no es un
  pendiente con destrabe.
- **`gcba_pauta_meta` y `pauta_meta` con la definición completa idéntica**, filtro vacío
  incluido: **un número que hoy se publica dos veces.** Lo anota el `_2` en
  `PENDIENTES_consistencia.md`, que es su dueño; acá queda el puntero para que el orden lo
  contemple.
- **`A-14` / `A-15`** — `enc_alcance` sin fuente medible **porque la base está incompleta**, no
  porque la hipótesis falle. La distinción importa: no hay nada que arreglar en el motor.
- **`C-58`** — los `cc_*` no van contra `Agenda JM`.
- **`ecv_barrio1-3`**, diferido por decisión previa.
- **Catálogos canónicos para las categorías que todavía no lo tienen.** Barrios **ya lo tiene**
  —la solapa `Comunas` de `rdv`, 48 filas, más las variantes ortográficas de `Parseo.gs`— y por
  eso sale de acá: `R-18` lo declara como la fuente de la forma publicada. Lo que queda es
  **qué otras categorías publican texto libre sin catálogo detrás**, donde la forma publicada
  depende de qué fila se leyó primero. Sin orden y sin fecha.
- Historial de `FALTANTES` — `tools/snapshot.js` ya lo archivaría por corrida.
- Fusionar `SUPUESTOS.md` y `REGLAS_NEGOCIO.md`: son la misma clase de cosa (enunciados con
  ID, ciclo de vida y derogación idénticos). **Decisión del usuario** — rompe ~40
  referencias si se hace mal.
- Cortes baratos de `Instalar.gs` según `INVENTARIO_CODIGO.md` Parte C: plantillas y
  `diagnosticoDrive`.
- Unificar el motor de diff/upsert: son 113 líneas compartidas por cinco trabajos más
  `Fechas.gs`, y `menuEstadoConfiguracion_` lo **reimplementa** en vez de usarlo. El arreglo
  del P1 de asimetría Estado/Aplicar es hacerlo usar el motor común, no parchear la
  comparación.
