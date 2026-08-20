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

---

## 2 · Próximo (ordenado, con dependencias)

### Los frentes abiertos al 14/08/2026 — el orden

> **Esta lista manda sobre el orden; los tramos de abajo siguen describiendo el trabajo.** Los
> `T<tramo>.<n>` no se retiran ni se renumeran: son la estructura del corte vertical y su texto
> es la especificación de cada pieza. Lo que cambió es que el trabajo de agosto dejó de entrar
> por tramos y entra por frentes, así que **el orden vive acá y el detalle allá**.

**El criterio del orden, y es la mitad de la decisión:** la **definición del vocabulario va antes
que todo cableado nuevo.** Cada marcador que se crea con la estructura vieja es deuda que se
contrae **sabiendo** que es deuda. Una vez tomada la decisión, lo nuevo nace bien y lo viejo se
migra sin apuro — por eso la migración de los 51 no bloquea a nadie, pero la decisión sí.

> **La decisión que ordena todo lo demás (usuario, 16/08): primero se cierra la migración,
> después se cablea.** Por eso el frente 7 (`C-61`) y el 8 bajaron a §3 como **bloqueados por esa
> decisión**, no como pendientes sueltos. La secuencia viva es: **Parte C del piloto → 12 bis →
> tanda 1**.
>
> **Estado al 16/08/2026** (bloque 1 de la corrida nocturna `2026-08-16_1`): **los frentes 1, 2,
> 4 y 6 están hechos**, y el **5 está migrado y pendiente de verificación** — no "en curso": la
> escritura terminó, lo que falta es leer la Parte C, y falta porque `looker` estaba
> recalculando. **La precondición para leerla es el canario `gcba_frecuencia`**: mientras dé `0`,
> la base está en tránsito y el resultado no significa nada.
>
> **El frente 7 ya no es el primero vivo**: su mitad de escritorio está medida (el motor lee por
> posición, y `looker/CC` no tiene ni una fila de `MAPEO`) y el resto quedó **diferido detrás de la
> migración**, en §3.

| # | frente | por qué va acá |
|---|---|---|
| 1 | ~~**El alta de las 20 solapas de `reuniones`**, con su censo volcado a un documento de evidencia en `docs/` **antes** de escribirla~~ — **hecho 15/08**: son **24** filas, en **2 `fuente` · 5 `referencia` · 17 `ignorar`** | Cierra el `_1`. Es el punto 5 del `_4`, **frenado porque la medición existía sólo en un reporte de conversación** — el alta se escribe citando el documento, y cada nota de `ignorar` sale de una fila medida y no de una frase |
| 2 | ~~**El sembrador deja de pisar un `uso` existente** *(`_3`)*~~ — **hecho 15/08, `D-32` verificado punta a punta**: `reuniones/Agenda funcionarios` puesta a mano en `fuente` contra un seed que decía `ignorar`, y el sembrador **no la revirtió** | **Va antes de la migración.** Ésa toca muchas filas de configuración y hoy existe un mecanismo que puede revertirlas en silencio — ya pasó con `CAMPAÑAS_DESGLOCE_DIGITAL` esta semana |
| 3 | **`C-64` — las dos capas de la base**, aplicado a lo que falta | El caso **está cerrado como explicación**: filas contra agregado, resuelto en call center (`C-62`), IVR (`V-98`) y mail (`V-99`), y explica el patrón `X-16`/`X-17`. **Lo que queda es aplicar el mismo criterio a `pauta_*` y Alerta Naranja.** Va acá porque decide **de qué capa se lee**, no cómo se nombra: es independiente del vocabulario y condiciona todo cableado posterior |
| 4 | ~~**`_2` — censo de dimensiones y `D-NN` del vocabulario**~~ — **hecho 15/08: `D-33` escrita**, sobre las 78 filas medidas, con las tres dimensiones y la frontera dimensión / restricción técnica trazada | La decisión de estructura: una medida, y el corte como **dimensión**. **Todo lo que se cablee antes de esto nace con el corte metido en el nombre** |
| 5 | ~~**El piloto: `imp_total` y sus siete hermanos**~~ — ✅ **PASÓ, 16/08/2026 11:58.** Las ocho cuentas de filas **idénticas** al testigo, descuadre **cero** en los dos ámbitos, y el canario sin migrar confirmando desde afuera que se movió la base. ⚠ **No se verificó por igualdad de valores** —con `looker` moviéndose no se puede—: se verificó por **identidad de filas + descuadre + canario**. Detalle y criterio completo en §1, *"El piloto de `D-33` PASÓ"*. **Esto autoriza el frente 13** | **Es el caso que justifica el frente entero**, medido el 15/08: una medida × `ambito` (2) × `plataforma` (3, con `programmatic` por resta) = **ocho nombres para un solo hecho**. Se migra a una medida con dos dimensiones y se verifica que `jm` reproduzca los mismos números **contra `docs/_snapshots/MARCADORES_2026-08-15.tsv`**, que es la línea base de `D-33`. Barato, y **si no reproduce, el plan se detiene acá** |
| 6 | ~~**La letra manda, el título valida** — cada fila de `MAPEO` lleva el encabezado que espera encontrar en esa letra *(`_6`)*~~ — **hecho 14–15/08, `D-31`**: 154 filas con `encabezado`, las 7 vacías son las de `promoverFechasElegidas()`. **Con el límite que expuso `C-09`: el testigo documenta el rótulo, no el contenido**, y **nunca es fallback** | **Va antes de `C-61` porque le saca el filo.** Hoy insertar una columna corre todas las letras a su derecha y el mapeo apunta una más allá **sin fallar**: un `SUMA` sobre la columna de al lado devuelve un número, no un error. El título como testigo convierte eso en falla ruidosa. **La función que valida se difiere** (usuario, 14/08); **poblar la columna ya mide**, y esa medición puede encontrar mapeos ya corridos |
| 7 | **`C-61`** — el alta de columna que mueve 229 cuentas · ⬇ **DIFERIDO a §3** (usuario, 16/08): *primero se cierra la migración, después se cablea*. La medición (a) ya está hecha y queda acá; el censo de `looker/CC` puede adelantarse porque es sólo lectura | **Bloquea el embudo de Call Center.** Dos mediciones antes de escribir: **(a)** si el motor lee CC **por encabezado o por posición** — si es por posición, una columna nueva corre todo lo demás **sin que nada falle**; **(b)** cuántos tokens ya validados cambian de valor, y **ninguno de los exactos vigentes puede moverse**. — **Medido el 16/08 (bloque 2 de la nocturna, sólo código y snapshot): el motor lee por POSICIÓN.** La letra de `MAPEO` se convierte en índice (`columnaLetraAIndice_`), de ahí sale el título, y con el título se extrae — **el encabezado es derivado de la posición, nunca un criterio propio**. **Y el riesgo cambia de signo: `looker/CC` tiene CERO filas de `MAPEO` y CERO marcadores**, así que hoy no hay mapeo de `CC` que un corrimiento pueda romper. **Lo que falta es de planilla** y está en la lista de corridas |
| 8 | ⬇ **BAJADO a §3, Planificado y bloqueado** (usuario, 16/08) — el enunciado era falso y lo que queda depende de una decisión | Ver la fila *"`R-NN` del recorte heredado de Call Center"* en §3. **No se borra**: la entrada de allá dice cuál era la premisa anterior y por qué era falsa |
| 9 | **`R-26`** — el "1 a 1" se comunica sólo por digital | **Independiente de todo lo demás**, y por eso puede adelantarse. Su Parte A puede falsar la premisa; si eso pasa, no se escribe nada y `R-26` queda como hueco |
| 10 | **`enc_impresiones` / `enc_visualizaciones` / `enc_clics`** — ✅ **DESBLOQUEADO 18/08.** Falta cablear **dos**: `enc_visualizaciones` y `enc_clics` (sin fila). `enc_impresiones` **ya existe** en `reuniones/Agenda JM`, `ULTIMO`, `filtro = imp_totales!=0` | Operación confirmada 4 de 4. Se cablea **ya con el vocabulario decidido** (`D-33` addendum 2). ⚠ ~~**Antes hay que resolver si su solapa sigue apagada**: `digital/Digital` está en `ignorar` y cuatro marcadores la apuntan~~ — **PREMISA VENCIDA, medida el 18/08: hoy CERO marcadores apuntan a `digital/Digital`.** `enc_alcance` se re-apuntó a `digital/Alcance` el 12/08 (`_39`) y `enc_impresiones` vive en `reuniones`. **El bloqueo no existe.** Es la cuarta cifra del plan corregida midiendo |
| 11 | **El embudo de Call Center** | Depende de **7 y 8**: sin el alta de columna no hay dato, y sin la regla no está declarado qué universo se cuenta |
| 12 | **`alcance` y `clics` de campaña destacada, y `m2_campanias`** como `LISTA + CUENTA(LISTA)` | `m2_campanias` además espera una definición del usuario |
| **12 bis** | ~~**Conectar el testigo de `D-31`**~~ — **HECHO la noche del 16/08.** `leerMapeoSinCache_` indexa `encabezado` (ésa era la causa raíz), `desalineamientoDeEncabezado_` compara —y recibe una **lista** de esperados, porque hay **12 grupos (base, solapa, letra) con más de una fila**—, el aviso sale por el cierre de corrida, y `verificarEncabezadosDeMapeo()` barre todo `MAPEO` sin generar informe. **El valor devuelto no cambia nunca.** Control positivo fuera de Apps Script extrayendo el código real: 13 afirmaciones, y los 5 mutantes mueren. **Falta su primera medición contra la planilla** | **El frente 6 dejó el dato y no la alarma**, y eso se midió el 16/08: `leerMapeoSinCache_` **ni siquiera indexa** la columna `encabezado`, y `buscarMapeo` devuelve sólo `{ hoja, columna }` — **no hay un punto del camino de lectura que compare nada**. Con el motor leyendo **por posición**, un corrimiento de columna hace que el mapeo apunte una más allá **sin fallar**; y con títulos repetidos —`Base_Digital` tiene ocho `ID Cuentas`— `obj[h] = fila[i]` **gana el último**, así que puede devolver **ni siquiera la columna vecina**. Va antes de la tanda 1 porque la migración toca muchas filas de configuración y conviene tener la alarma puesta antes, no después. ⚠ **La política ya está decidida en `D-31` y la función la aplica, no la reinventa:** no corregir la letra sola nunca, reportar los dos valores, no bloquear la corrida. **Y el límite es del instrumento, no una omisión:** el testigo compara **rótulos, no contenido** — `C-09` es la prueba, y tiene que estar dicho en el código y no sólo en `D-31`. Prompt: `docs/Prompts/2026-08-16_2_testigo_encabezado_conectado.md` |
| 13 | **La migración, por tandas** — ⚠ **el alcance real son 48, no 78** (17/08; ver *"Tres cifras corregidas"*). ✅ **CERRADO 17/08/2026 — 42 de 48, que es TODO LO MIGRABLE.** Piloto, tandas 1, 2, 3 y 4 cerradas. ⚠ **Los seis restantes NO son una tanda pendiente ni deuda de vocabulario: son un hueco de dato** (`@ultimo_ambiguo`) — ver abajo. **Esto destraba el 13 bis** | Empieza por los que **ya tienen la dimensión escrita en el `filtro`** y sólo hay que sacarla del nombre: los `mail_*`/`gcba_mail_*` y `frecuencia`/`gcba_frecuencia`. **No son "los nueve pares `gcba_*`"** —eso era una cifra del snapshot del 11/08 que la medición corrigió—, y **los tres pares `pauta_*` NO entran**: tienen filtro vacío en los dos lados, así que son un número publicado dos veces y van a validación (`PENDIENTES`). **Cada tanda se compara contra `docs/_snapshots/MARCADORES_2026-08-15.tsv`, no contra la corrida anterior** — así los errores no se acumulan de tanda en tanda. **No bloquea a nadie:** lo nuevo ya nace con la estructura buena |
| **13 bis** | **`DIMENSIONES_` pasa a ser hoja de registro** — ✅ **DECIDIDO** (usuario, 16/08): la tabla de traducción de dimensión lógica a expresión física **tiene que ser una hoja**, no un mapa en código. Es lo que `D-33` promete con la simetría hacia `MAPEO` y **hoy cumple a medias**: `MAPEO` es una hoja y agregar un mapeo es una fila; `DIMENSIONES_` vive en `Fuentes.gs` y agregar un valor exige **editar un `.gs` y pushear** — justo lo que `D-01` mide. ✅ **DESTRABADO el 17/08 al cerrar la tanda 4.** El motivo por el que esperaba sigue valiendo y conviene no perderlo: **mover la tabla mientras se migra es cambiar el traductor y lo traducido al mismo tiempo, y ninguna comparación aguanta las dos variables juntas.** Con la migración cerrada (42 de 48) esa colisión ya no existe. Prompt: `docs/Prompts/2026-08-16_6_dimensiones_a_hoja.md`, **sin ejecutar** |
| 14 | **El catálogo de tokens generado desde `MARCADORES`** — qué mide cada uno, de dónde sale, con qué operación y con qué filtro · **primera versión hecha 16/08**: `tools/catalogo.js` → `docs/CATALOGO_tokens.md` | **Es el objetivo declarado de todo esto:** que alguien del equipo arme una filmina eligiendo tokens documentados que dicen qué son y cómo se arman. **Generado, no escrito a mano** — a mano se desincroniza en la primera migración. — **Se regenera después de cada tanda** (usuario, 16/08): es parte de cerrar la tanda, no una tarea aparte. ⚠ **Y para cuando se defina el formato definitivo: la columna `config` es el acierto de la primera versión y hay que conservarla como distinción.** Dice **"la fila está bien armada"**, no *"el token anda"* — y son cosas distintas: el cruce estático da **78 de 78** mientras el motor publica **diez en error**, porque ésos fallan en ejecución. Llamarla `estado` habría hecho leer lo segundo donde sólo dice lo primero |

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
- `T2.9.2` — los dos valores de ventana a `CONFIG`: la corta (hoy constante de módulo) y la
  ampliada (no existe)
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
| `D-16` · acceso por usuario a informes y datos | resolver la pieza 3: cómo se sostiene la restricción sobre archivos de Drive y bases, no sólo sobre el panel. Requiere el panel construido (`D-04`) para probar contra algo real | interno |
| Qué pasa con `m2` en `MAPEO` — las 19 filas duplicadas de `digital`, y si se mapea `Cuentas M2` | **el `Paso-2.5`**, cuando se siembre `MARCADORES` leyendo los `{{token}}` reales de las plantillas (`D-17`). Recién ahí se sabe si algún token pide los atributos de `Cuentas M2`. **El criterio ya está fijado** (usuario, 03/08/2026): `Cuentas M2` es un **catálogo de cuentas** —eje, área, nombre de campaña—, **no una fuente de métricas**; se mapea **sólo si algún token necesita esos atributos**. Las **métricas** de M2 salen de `digital`, no de `m2`. Sin token que las pida, las 19 filas se despiden y no se mapea nada | interno |
| Los `camp_*` no dan número: `CAMPANAS` no tiene ninguna fila de `jm` | que alguien cargue **el temario** en `CAMPANAS` — las campañas que el equipo elige mostrar, con `mostrar` y `orden`, y **no las del período**: la selección es por temario (`R-17`, 07/08/2026) y una campaña anterior a la ventana entra igual. Sin filas, la sección `campana` emite 0 ítems — medido el 06/08: `itemsDeSeccion_('campana')` devuelve `items: 0`. Ojo con `periodo_id`: vacío, la fila no entra a ningún informe (`D-19`) | usuario |
| 16 tokens del Resumen Ejecutivo sin fuente: los ocho de Call Center (`cc_base` no existe en ninguna base), los seis de impresiones por plataforma y `contenidos_total` | decidir de dónde salen. No es cableado pendiente: **el dato no está en ninguna de las cuatro bases** | equipo |
| La fila `resumen_ejecutivo` de `SECCIONES` está declarada `repetible` + `manual`, y está medido que **no puede ser repetible** | una línea: los tokens de GCBA llevan prefijo propio, así que el bloque no se itera. Es cambio de configuración, no de código | usuario |

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
