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

## 2 · Próximo (ordenado, con dependencias)

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
- `T2.1.1` — el motor mira el reloj y corta antes del límite
- `T2.1.2` — el cierre se escribe siempre: fecha, tokens puestos, faltantes
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

**`T2.4` · los cuatro objetivos contra un deck real.** `SUMA` sobre cero filas, `ULTIMO` por
fecha, el agregado global de `digital`, el sembrado del Resumen Ejecutivo. Escritos y nunca
vistos contra una corrida. Sale apenas exista `T2.1`. **No arrastra el anclaje** (ver `T2.9`).

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
| **2** | `sellarPlantilla(informe_id)` **crea la hoja `LAMINAS` y sella, en una sola operación.** Por cada lámina sin ancla: toma el siguiente id de la hoja, escribe la fila y **anexa `#lamina: L-NNN`** a las notas del orador. No toca las que ya tienen ancla. Nunca `setText`: anexa. Columnas: `lamina_id`, `informe_id`, `seccion_id`, `orden_plantilla` (reportado, **no** autoritativo), `escondida`, `origen`, `modo`, `itera_sobre`, `filtro` (los tres vacíos = heredan), `rol`, **`cobertura`** (renombrada desde `estado` el 09/08 por el `11.1` §1 — `SECCIONES.estado` ya existe y responde otra pregunta: aquélla es de ejecución, ésta es de cobertura; valores `cerrada` · `parcial` · `abierta`), `falta` (**se queda así**: significa lo mismo que `SECCIONES.falta`), `notas`. Es `SOLAPAS` del lado del deck, y es `D-17` aplicado a láminas | **la autorización de `C-01` para escribir las notas** (`REGLAS_NEGOCIO.md`, suspensión acotada + sus dos addenda). El acceso ya está: las dos plantillas dan `EDIT` a la cuenta del script |
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
| Los `camp_*` no dan número: `CAMPANAS` no tiene ninguna fila de `jm` | que alguien cargue **el temario** en `CAMPANAS` — las campañas que el equipo elige mostrar, con `mostrar` y `orden`, y **no las del período**: la selección es por temario (`R-17`, 07/08/2026) y una campaña anterior a la ventana entra igual. Sin filas, la sección `campana` emite 0 ítems — medido el 06/08: `itemsDeSeccion_('campana')` devuelve `items: 0`. Ojo con `periodo_id`: vacío, la fila no entra a ningún informe (`D-19`) | usuario |
| 16 tokens del Resumen Ejecutivo sin fuente: los ocho de Call Center (`cc_base` no existe en ninguna base), los seis de impresiones por plataforma y `contenidos_total` | decidir de dónde salen. No es cableado pendiente: **el dato no está en ninguna de las cuatro bases** | equipo |
| La fila `resumen_ejecutivo` de `SECCIONES` está declarada `repetible` + `manual`, y está medido que **no puede ser repetible** | una línea: los tokens de GCBA llevan prefijo propio, así que el bloque no se itera. Es cambio de configuración, no de código | usuario |

Nota: los tokens de MiBA ya están marcados en las plantillas, así que en cuanto corra el
Paso 4 van a emitir `«FALTA:miba_*»` en `FALTANTES` en cada corrida. **Lo postergado se
auto-reporta.**

---

## 4 · Backlog (sin orden, sin fecha)

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
