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

---

## 2 · Próximo (ordenado, con dependencias)

1. **Tramo 1 — cerrar configuración.** Sale cuando el diff da cero ruido.
   - ~~Dar acceso de lectura a `reporteseinformesgcba` sobre las cuatro bases (`D-02`)~~ —
     **ya estaba dado, verificado el 02/08/2026** contra la API de Drive: las cuatro tienen a
     `reporteseinformesgcba` con rol **`writer`**. Deja dos cosas a la vista, ninguna de este
     tramo: **(1)** el rol es más ancho que el que pide `D-02` y que el que declara el
     `RUNBOOK` ("como Lector, el motor sólo lee datos"); **(2)** la nota que decía *"las
     cuatro son cuentas del usuario"* **es falsa** — los dueños reales son
     `brianbanderbek` (rdv), `tarnowski.jp` (digital y m2) y `dgples.comunicacion` (looker),
     así que **sí hay terceros**, aunque el acceso ya no haya que pedirlo.
   - ~~Abrir el P1 del tercer escritor de `MAPEO` (`consolidarMapeoLooker_`)~~ — **hecho
     02/08/2026** (Paso 2.11 Parte E): retirado del menú junto con el diagnóstico que le
     pasaba la dirección invertida. `MAPEO` vuelve a dos escritores de contenido vivos.
     Dejó abierto un P1 nuevo, que **no** es de este tramo: la inferencia invertida de
     `auditarFormulasResumenesLooker_`.
   - ~~`Paso-2.12` Parte 2 — las 17 disposiciones de `SOLAPAS.uso`~~ — **hecho 02/08/2026**
     (`BITACORA`, Paso 2.12 Partes 3 y 2, y su cierre): cero filas en `revisar`.
   - ~~Generalizar `hayUi_()`~~ — **hecho 02/08/2026** (Paso 2.14): el protocolo entero corre
     por API.
   - ~~`periodo_id` en `CAMPANAS` y `REUNIONES` (`D-08`)~~ — **hecho 02/08/2026**
     (`Paso-2.15` Parte B, `c4797d8`). Columna primera en las dos hojas, las diez filas
     existentes con el valor vacío y su significado fijado en `D-19`.
   - ~~Repuntar `carpeta_salida` a reportes (`D-03`)~~ — **hecho 02/08/2026** (`Paso-2.15`
     Parte A, `aca39bf`). Apareció que una clave hacía de dos: el ID viejo era la carpeta
     donde vive la planilla de control y quedó como `carpeta_motor`, sin lector.
   - ~~**Activar `m2`**~~ — **cerrado 02/08/2026 por el `Paso-2.16`, y no como estaba
     escrito.** La Parte A mostró que **no había nada que activar**: las 19 filas de
     `MAPEO` de `m2` están duplicadas en `digital` campo por campo, ninguna apunta a una
     solapa `fuente` —catorce van a vistas `referencia` con período tipeado a mano y cinco
     a una `ignorar`—, y la única solapa `fuente` que `m2` tiene (`Cuentas M2`) no está
     mapeada. Los tres cambios quedaron así:
     **(a)** `modo_periodo` a `filtrar` — **descartado**: sin `fecha_periodo` en ninguna
     solapa de `m2`, habría convertido toda lectura en `«FALTA:fecha_periodo»`, y nada lee
     `m2` hoy, así que el error habría quedado latente.
     **(b)** `fecha_periodo` — **ya existía**, en la solapa correcta:
     `digital/Directa Mail` columna F, promovida en el Paso 2.3.x. La fuente es `digital`,
     no `m2/Directa mail`, que es `derivada` (decisión del usuario tras A.3; `buscarMapeo`
     la habría rechazado igual, exige `uso = fuente`).
     **(c)** el filtro por `Estado` — **es todo lo que quedó del paso**, y resultó medir
     algo más útil: no cuánto cuesta una base nueva, sino **cuánto cuesta el primer filtro
     declarativo** (`D-21`), que es reusable.
     *La predicción se cumplió:* las dos primeras eran config —tanto que salieron gratis— y
     la tercera exigió `.gs`. **Medición de `D-01`: +253 / −5 líneas en cuatro archivos**
     (`Fuentes.gs` +170, `Pruebas.gs` +56, `Instalar.gs` +25, `Config.gs` +2), de las
     cuales una parte grande son comentarios y el control positivo nuevo.
     **Sigue abierto y no es de este tramo:** si `m2` se despide de `MAPEO` (las 19 filas
     duplicadas) o si se mapea `Cuentas M2` y `m2` se queda sólo con lo suyo.

2. **Tramo 2 — corte vertical, JM solo.** Pasos 3, 4 y 5. Se hace contra JM únicamente:
   construir los dos en paralelo impide después distinguir qué necesitó código y qué salió
   solo. Los prompts vigentes son **`docs/Prompts/Paso-3-v3.md`**, `docs/Prompts/Paso-4.md`
   y **`docs/Prompts/Paso-5-v2.md`** (03/08/2026: la auditoría de premisas mandó reescribir
   los dos, `Paso-3-v2.md` y `Paso-5.md` quedaron en `docs/Prompts/_archivo/`).
   **`Paso-4.md` se revisa antes de ejecutarlo** — está escrito y casi seguro asume
   copiar-y-reemplazar sin registrar la configuración de la corrida (`D-06`); además le
   falta absorber la impresión del período en la lámina, `D-19`/`D-20` y la firma de
   `generarInforme`, que no coincide con la del Paso 5.
   - **Un bloqueo tapa a los tres: `INFORMES.plantilla_id` está vacío** en `jm` y en
     `secco` en la hoja viva. Sin eso no hay de dónde leer tokens ni qué copiar. Es tarea
     del usuario: los IDs están en el repo, pero cuál es la plantilla canónica es una
     decisión.
   - **El default de período de `R-11` (siete días, viernes a jueves) y la impresión de las
     fechas en la lámina son parte de estos pasos, no un paso propio**: el cálculo entra
     donde se resuelve la ventana (Paso 3) y la impresión donde se reemplazan los tokens
     (Paso 4). Es **default, no validación**: lo cargado en `CONFIG` manda siempre, y dos
     períodos consecutivos pueden solaparse o dejar hueco sin que el motor diga nada
     (`R-11` Addendum 1). El extremo inclusivo ya está cerrado; no queda nada que preguntar
     antes de implementarlo.
   - **El Paso 3 tiene que resolver `D-20`: el período por sección.** Es lo que el
     `Paso-3-v3` toma como su Parte B, y es la razón por la que se reescribió. Son tres
     cosas y van
     juntas porque las tres tocan `resolverVentana()`: **(1)** la columna de período en
     `SECCIONES` —que **entra a `COLUMNAS_DELTA_` antes** de que se toquen sus `headers`,
     por lo que midió el `Paso-2.15` 0.2—; **(2)** el eslabón nuevo en la cadena, en la
     posición que ya fija el Addendum 1 de `D-20` (`campaña > marcador > sección > CONFIG >
     semana`) — el Paso 3 la implementa, no la decide; **(3)** el cálculo del default de
     `R-11`, que es **el último eslabón de esa misma cadena** y hoy no existe: con `CONFIG`
     vacío la función devuelve error, no una semana.
   - **Los cuatro ítems que el `Paso-3-v3` no cubre — corregido el 03/08/2026 con su
     destino real.** Al reemplazar al `v2`, Code anotó acá que el `v3` deja afuera `R-12`,
     los dos valores de ventana a `CONFIG`, el empate técnico del match y la migración de
     `status = Realizada`. **El hecho es cierto; la inferencia de que le faltan al Paso 3
     no.** Decisión del usuario, 03/08/2026: los tres primeros son del **matcher**
     (`Union.gs`), que no comparte código con el despachador de marcadores, y van en un
     **paso propio todavía sin escribir**; el cuarto es **configuración suelta**. La línea
     queda porque sin ella los cuatro se pierden de vista — lo que cambia es a quién se le
     reclaman. Anotado también como nota al pie del `Paso-3-v3`.
   - **Paso del matcher (`Union.gs`) — sin escribir, después del Paso 3.** Tres cosas que
     tocan la misma función: **`R-12`** (ampliar la búsqueda de candidatos antes de declarar
     `sin_link`), los **dos valores de ventana a `CONFIG`** —la corta, hoy constante de
     módulo, y la ampliada, que no existe— y el **empate técnico** del match, que
     `DISENO_match_temario.md` §6.4 declara y ningún código implementa
     (`PENDIENTES_consistencia.md`). No entra en el Paso 3 ni en el 4.
   - **Migrar el filtro `status = Realizada` de `Union.gs` a `MAPEO.valores_incluidos`**
     (`D-21`) — **es configuración suelta, no parte de un paso de código** (decisión del
     usuario, 03/08/2026). Se declara la celda midiendo antes y después cuántas filas de
     `rdv` entran; lo que queda —retirar `VALOR_STATUS_REALIZADA_` de `Union.gs`, que
     pasaría a filtrar dos veces sin cambiar el resultado— va con el paso del matcher.

3. **Tramo 3 — prueba de motor.** SECCO, midiendo líneas de `.gs` tocadas. Es el paso que
   valida la tesis del proyecto; si falla, lo que salga es el trabajo real del tramo
   siguiente.
   - **Revisión programada, al llegar acá o a producción, lo que ocurra primero:** el repo
     es **público** y expone 14 IDs de recursos internos —las cuatro bases, la planilla de
     control, las tres carpetas, las plantillas, el script id—. Se decidió el 02/08/2026
     dejarlo público **por ahora** y revisarlo en este hito. El censo completo, la
     distinción con el `P0` de datos personales y los dos sub-ítems (`.clasp.json`
     trackeado, `PLANTILLA_JM_CANONICA_` hardcodeada) están en
     `docs/PENDIENTES_consistencia.md`, `P0` de direccionabilidad.

4. **Tramo 4 — panel** (`D-04`). El resto del tramo depende del primer ítem.
   - **Primero, y antes de escribir código del panel:** verificar qué devuelve
     `getActiveUser()` con el despliegue *"ejecuta el usuario que accede"*, entrando desde
     `reporteseinformesgcba`. Si vuelve vacío, **`D-15` se revisa antes de escribir código
     del panel** — sin identidad confiable, la lista blanca no filtra nada.
   - Recién después, el panel: `doGet`, selección de informes, corrida a demanda.
   - La hoja de accesos y el filtrado por usuario son `D-16`, y la pieza 3 de esa decisión
     está sin resolver (`§3`).

5. **Tramo 5 — chequeo previo programado** (`D-11`). Es todo lo que queda de lo que antes
   eran los Pasos 10-12.

---

## 3 · Planificado y bloqueado

Cada ítem nombra **qué lo destraba y de quién depende**.

| qué | qué lo destraba | depende de |
|---|---|---|
| Fuente de MiBA | definir de dónde salen los datos | tercero |
| Tercer informe | no es prioritario: el objetivo es la capacidad de incorporar informes, no un informe puntual | usuario |
| ¿M2 tiene ventana propia, o usa la del informe? | `R-11` + su Addendum 1 (02/08/2026) cerraron la semana del informe: **siete días, viernes a jueves**, que es exactamente el único caso observado de M2 (vie 24/07 → jue 30/07). La etiqueta vieja de esta fila, "ventana jueves-a-jueves", **no la sostiene su propia evidencia** y se descarta. Queda una sola pregunta, más chica: si M2 se rige por `R-11` como todo lo demás —y entonces esta fila se cierra— o si tiene una ventana propia que todavía no se observó. Sigue haciendo falta una segunda semana | equipo |
| Qué regla selecciona los envíos de M2 dentro de la ventana | no es la marca `M2` ni la fecha; si es curaduría manual, hace falta registro a nivel `ID MailUp` | equipo |
| La lámina dice 18 envíos y 11 campañas; el número sale de 10 envíos y 3 campañas | preguntar quién armó la lámina | equipo |
| Etapa 2: actualizar el deck en sitio (`D-06`) | el mapa `token → objectId` de la etapa 1, más decidir qué hace el motor cuando una caja registrada ya no está | interno |
| `D-16` · acceso por usuario a informes y datos | resolver la pieza 3: cómo se sostiene la restricción sobre archivos de Drive y bases, no sólo sobre el panel. Requiere el panel construido (`D-04`) para probar contra algo real | interno |
| Qué pasa con `m2` en `MAPEO` — las 19 filas duplicadas de `digital`, y si se mapea `Cuentas M2` | **el `Paso-2.5`**, cuando se siembre `MARCADORES` leyendo los `{{token}}` reales de las plantillas (`D-17`). Recién ahí se sabe si algún token pide los atributos de `Cuentas M2`. **El criterio ya está fijado** (usuario, 03/08/2026): `Cuentas M2` es un **catálogo de cuentas** —eje, área, nombre de campaña—, **no una fuente de métricas**; se mapea **sólo si algún token necesita esos atributos**. Las **métricas** de M2 salen de `digital`, no de `m2`. Sin token que las pida, las 19 filas se despiden y no se mapea nada | interno |

Nota: los tokens de MiBA ya están marcados en las plantillas, así que en cuanto corra el
Paso 4 van a emitir `«FALTA:miba_*»` en `FALTANTES` en cada corrida. **Lo postergado se
auto-reporta.**

---

## 4 · Backlog (sin orden, sin fecha)

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
