# CLAUDE.md — Motor de Informes (GCBA)

Motor en Google Apps Script que arma informes en Google Slides leyendo datos de Google
Sheets. **Es un motor, no un informe:** agregar un informe nuevo = plantilla nueva +
filas de config. Nunca requiere tocar código.

Plan y decisiones → `docs/PLAN.md` (§9). Operación → `docs/RUNBOOK.md`.
Contexto histórico → `Plan Inicial/PROYECTO.md`, **congelado** desde el 01/08/2026.
Punto de partida de cada sesión → `docs/HANDOFF_CODE.md` (estado actual) + el handoff más
reciente de `docs/Sesiones/` (verificaciones de claude.ai). Ver §5.

---

## 1. Antes de escribir una línea

**Greppear el nombre de toda función o `var` global nueva.** Apps Script concatena todos
los `.gs` en un único scope global: dos definiciones con el mismo nombre no dan error,
una pisa a la otra en silencio. Este repo se edita desde dos herramientas que no se ven
entre sí (esta sesión con git, y claude.ai directo sobre la carpeta), así que la colisión
es un riesgo real, no teórico — ya pasó con `parsearFecha_`.

```
grep -rn "function nombreNuevo_" *.gs
```

---

## 2. Reglas de código — invariantes

- **Regla de oro: toda la aritmética vive en `Marcadores.gs` y en ningún otro lado.**
  Los demás módulos solo leen config, leen datos o pintan Slides. Si un cálculo aparece
  fuera de `Marcadores.gs`, es un bug de arquitectura aunque el número dé bien.
- **La extensibilidad se mide, no se declara** (`docs/PLAN.md`, `D-01`). Si agregar un
  informe o una base necesita tocar `.gs`, eso se anota como medición, no se silencia.
  El objetivo es que ese número baje. No es criterio de aceptación: nada se bloquea por
  esto, pero nada se esconde tampoco.
- **Nada de valores hardcodeados.** Todo valor que pueda cambiar **sin que cambie la
  lógica** —nombres de estados, umbrales, ventanas de días, IDs de carpeta— vive en una
  hoja de configuración, no en el código. Es la dirección de `D-01`: si cambiar un
  parámetro de negocio exige `clasp push`, eso es una línea de `.gs` que no debería hacer
  falta.
  - **Los nombres son el caso particular** que esta regla ya cubría: bases y plantillas se
    descubren leyendo las hojas de registro (`CONFIG`, `BASES`, `INFORMES`, `MARCADORES`,
    `MAPEO`, `CAMPANAS`, `PERIODOS`). Un nombre de base o de plantilla literal en el
    código está mal.
  - **El precedente dice el motivo con todas las letras**: el Paso 2.9F sacó el umbral de
    anclaje de `Union.gs` a `CONFIG.umbral_anclaje_reunion`, y el comentario que dejó en
    `Instalar.gs` lo explica — *"cambiarlo ya no exige `clasp push`"*.
  - La regla se lee **antes** de escribir la constante, no después: una constante de
    módulo con un valor de negocio adentro (`VENTANA_DIAS_CANDIDATOS_ANCLAJE_ = 14`,
    `VALOR_STATUS_REALIZADA_ = 'Realizada'`) es deuda desde la línea uno, aunque funcione.
- **Nada que venga de una planilla se compara crudo: se normalizan los dos lados.** Una
  celda trae espacios de más, saltos de línea pegados y valores tipeados a mano; comparar
  con `===` contra un literal falla en silencio y el síntoma aparece lejos —filas que no
  entran, un `MAPEO` que no matchea, un token que sale `«FALTA:»`—. Esto estaba en el
  código en cuatro lugares y en ninguna regla hasta el 02/08/2026.
  - **La forma la fija `R-10`**: colapsar `/\s+/` a un espacio y `trim()`, **preservando
    mayúsculas y acentos**. No es una preferencia: plegar el case colapsa quince pares de
    encabezados reales que son columnas distintas con contenido distinto.
  - **Antes de escribir un normalizador nuevo, mirar los cuatro que ya existen** (§1, el
    grep previo): `normalizar_` (`Parseo.gs`, pliega case y acentos — para matchear texto
    libre), `normalizarParaComparar_` (`Instalar.gs`, canonicaliza fechas para el diff),
    `normalizarIdCuenta_` (`Union.gs`, `String().trim()` para claves de join) y
    `normalizarValorDeclarado_` (`Fuentes.gs`, la forma de `R-10`). Cuatro ya son una
    señal; un quinto **sin el motivo escrito arriba de la función** es deuda.
- **La plantilla es del equipo, el motor se adapta** (`docs/REGLAS_NEGOCIO.md`, `C-01`).
  Nunca al revés. Toda migración que escriba sobre una plantilla crea backup antes.
- **Reparto de responsabilidad por módulo:** estructura de hojas → `Instalar.gs`; acceso a
  datos y caché → `Fuentes.gs`; aritmética → `Marcadores.gs`; despacho y reemplazo en
  Slides → `Generador.gs`. Es la forma larga de la regla de oro: si un módulo hace el
  trabajo de otro, el número puede dar bien igual y la arquitectura ya está rota.
- **Los renombres de tokens son por `informe_id`, nunca globales.** El mismo nombre puede
  ser correcto en una plantilla e incorrecto en otra — lo demostró la regresión de
  `enc_audiencia`.
- **Una solapa con `uso = 'ignorar'` en la hoja `SOLAPAS` no se toca nunca.** Ni se lee,
  ni se audita, ni se mapea, ni se diagnostica, ni se la menciona en un reporte de
  hallazgos. Consultar con `usoSolapa_(base_id, solapa)` antes de recorrer solapas y
  saltear las ignoradas de entrada. No son un pendiente ni algo a revisar: ya se
  decidieron. Son pivots, backups, copias de trabajo y duplicados — el caso `digital/RDV`
  duplica la base `rdv` y leerla produce doble conteo. Auditarlas es tiempo perdido y,
  peor, reabre discusiones cerradas.
  (`revisar` es un estado distinto y sí requiere atención; no confundirlos.)
- Las bases se abren por ID con `SpreadsheetApp.openById()`, una sola vez por corrida,
  vía el caché de módulo en `Fuentes.gs`.
- Archivos `.gs` en PascalCase (`Fuentes.gs`, `Marcadores.gs`). Funciones privadas con
  sufijo `_`.

---

## 3. Dónde va cada cosa — ruteo obligatorio

**No crear archivos `.md` nuevos.** Si algo hay que documentar, va en el documento que la
tabla de §7 declara dueño de esa pregunta. Si de verdad no entra en ninguno, **preguntar
antes de crearlo** y, si se crea, agregarle su fila en **§7, en el mismo commit**. Esta es
la regla que más importa: el repo ya acumuló una docena de documentos que nacieron sueltos
y divergieron entre sí. Los prompts nuevos van a `docs/Prompts/` (`Paso-N.md` para pasos
del motor, `DOC-N_*.md` para trabajo documental — no consume número de paso —,
`AUD-N_*.md` para auditorías). **Los prompts fechados llevan `AAAA-MM-DD_N_descripcion.md`,
con la fecha real del día en que se escriben y un número de orden dentro del día**, porque
entra más de uno por día: sin el `N`, dos prompts distintos del mismo día se leen como el
mismo, y el nombre deja de ordenar. El `N` cuenta sólo los archivos que siguen esta
convención — un número que cuenta archivos que no la llevan no se puede verificar mirando la
carpeta. Relevamientos o hallazgos fechados: **ninguno nuevo** — la
conclusión va al documento que §7 declara dueño de esa pregunta; si es estructural, a
`docs/PLAN.md` como `D-NN`.

**§7 es el único índice.** Hasta el 01/08 esta regla pedía registrar el documento nuevo
también en la taxonomía de `PROYECTO.md` §9: dos índices del mismo repo, sincronizados a
mano. Era la divergencia que la regla venía a evitar, fabricada por la regla misma
(`DOC-6` D.4).

**Un prompt declara su estado cuando se lo toca**, no antes: al 02/08 lo declaran 5 de 58 y
**no se van a editar los 53 restantes** — una pasada de mantenimiento sobre prompts que en
su mayoría ya corrieron es trabajo que no rinde (`DOC-7`). Para saber si un prompt se
ejecutó, el cruce válido es **el designador de paso contra los encabezados de
`docs/BITACORA.md`**, no el nombre de archivo: la bitácora nombra el paso, no el archivo, así
que buscar por nombre da falsos negativos en casi todos. Ojo con los pasos **sin número**
(`MENU_declarado_por_tabla.md`): se escapan de ese cruce, y por eso uno quedó sin entrada
hasta que lo encontró el censo del `DOC-7`.

**Los tres estados de un documento**: *vivos* se editan; *congelados* se leen y no se
editan (si un congelado necesita cambiar, el cambio va al documento vivo dueño de esa
pregunta según §7 — no al PROYECTO, que desde el 01/08 también está congelado — o el doc
pasa a vivo explícitamente); *archivados* en `Plan Inicial/_archivo/`, `docs/Prompts/_archivo/` o
`docs/Sesiones/_archivo/`. El estado lo declara **cada documento en su propio
encabezado**, no un índice central. Editar un congelado en silencio es exactamente lo que
costó la mitad del `DOC-1`.

**Antes de pedir que se corrija algo en un archivo existente, grepearlo primero.**
Un pedido de corregir algo que no está ahí empuja a editar de más, y a meter en un archivo
contenido que tiene dueño en otro. Si el grep da cero, el resultado correcto es cero
ediciones y se registra el cero. Aplica a los tres lados: al que escribe el prompt, al que
lo pasa y a Code. Origen: 01/08, `AUD-3` Tarea 1 — se pidieron tres correcciones sobre una
sospecha no verificada; las tres premisas no estaban en el archivo.

---

## 4. Flujo de trabajo — un paso, un test, un commit

**Antes de empezar: un prompt no ejecutado es una hipótesis, no un plan.** Se verifican sus
premisas contra el estado de hoy y, si alguna venció, **se reporta y se para antes de la
primera edición**. Las citas a `archivo:línea` se resuelven **por nombre**, no por número:
una línea corrida es inofensiva, una premisa vencida no. En los prompts nuevos, no escribir
números de línea como dato — si se citan, es como referencia, y envejecen con cualquier
commit. (Origen: 02/08. El `Paso-2.14` citaba `Instalar.gs:2052` y `:1819`, hoy `:2140` y
`:1908`, y no pasó nada; el `Paso-2.12` hablaba de 17 filas y de dos casos difíciles que ya
estaban resueltos en la planilla, y eso **no se detecta releyendo el prompt** — se detectó
cruzando contra los datos al ejecutar.)

**El prompt se revisa antes de ejecutarlo, y lo que habría que cambiarle se reporta.** Un
prompt es una hipótesis escrita por alguien que no midió. Verificar las premisas es la
mitad; la otra mitad es mirar el prompt entero contra el repo y decir, antes de la primera
edición, si tiene:

- Una premisa que el repo desmiente — el párrafo de arriba. El caso puntual ya está en §3:
  pedir que se corrija algo que no está en el archivo. Esa regla no se repite acá; ésta es
  el movimiento completo del que aquélla es un caso.
- Un paso que pide hacer algo que ya está hecho, o que el repo muestra innecesario.
- Un método peor que uno disponible. Proponerlo; **no cambiarlo en silencio**.
- Una decisión `D-NN`, `R-NN` o `S-NN` que el prompt derogaría sin decirlo.

**Mejorar no es ampliar.** No agregar objetivos, no arreglar de paso lo que se ve roto al
lado, no refactorizar lo que se toca. Es "un prompt, un objetivo" —abajo— mirado desde este
lado: revisar el prompt no es licencia para ampliar el alcance. Si aparece algo que merece
prompt propio, se anota en el reporte y se sigue.

**Todo prompt declara arriba qué subagente usa, o dice explícitamente que ninguno.** Sin esa
línea **no se invoca ninguno**. Los dos que hay —`verificador` y `cableador`, en
`.claude/agents/`— tienen su `description` escrita para **invocación explícita**, no para
auto-delegación: el control queda en el prompt y no en lo que el modelo considere pertinente. Un
subagente que escribe en una hoja de registro no arranca por criterio propio.

- **Y el reporte del `verificador` no es luz verde.** Corre **dentro** de la sesión que
  implementa y **hereda sus premisas**; no reemplaza la verificación contra los archivos vivos.
  Es la misma regla de siempre —*quien implementa no se autoverifica*— y hay que decirla acá
  porque la herramienta nueva invita a creer lo contrario.

**Y no inventar el faltante.** Si el prompt no alcanza para saber qué hacer, eso se reporta
como falta. No se completa con un supuesto razonable: un supuesto razonable metido en
silencio es indistinguible de una instrucción, y sobrevive a la corrida. Esto **no choca con
`docs/SUPUESTOS.md`**, cuyo encabezado manda asumir lo más probable y seguir — ese mecanismo
cubre huecos **del dominio** y exige registrar el supuesto **con ID**, que es exactamente lo
que lo deja a la vista y reversible. Lo que esta regla prohíbe es el supuesto **silencioso
sobre qué hay que hacer**. Registrar un `S-NN` es la forma de cumplirla, no su excepción. Es
el mismo principio que `D-10` —al motor le falta una definición, pregunta y no la fabrica— y
que `D-19`/`D-21` —ninguna fila entra ni se excluye en silencio—, aplicado a quien ejecuta
el prompt en vez de al motor.

1. Se termina un paso → **se avisa y se para.** No se avanza al siguiente por cuenta
   propia.
2. El usuario prueba y confirma.
3. Recién ahí se documenta y se commitea: **entrada en `docs/BITACORA.md` siempre**,
   `docs/HANDOFF_CODE.md` reescrito, y `docs/PLAN.md` si el paso cambió algo estructural
   (decisión nueva = `D-NN` nuevo; una vieja no se edita, se supersede).
4. Mensaje: `Paso N ✅ — <resumen corto>`. Un paso por commit, sin bundles.
5. Si el working tree tiene cambios de más de un paso al momento de commitear: **parar y
   preguntar**, no bundlear.
6. Commits de documentación separados de commits de código.
7. Excepción: un prompt puede pedir varios commits internos (Partes A/B/C) si lo indica.

**Un prompt, un objetivo.** No se mezclan objetivos en una corrida, **por barato que parezca
el segundo**. Pedido por el usuario el 08/08 y escrito acá el 12/08.

El dato que lo justifica, porque es contundente: con el formato anterior —corridas de cinco
puntos que mezclaban documentación barata con código caro, **y la documentación primero**—
entre el 04 y el 07/08 salieron **dieciocho commits y un solo cambio de código**. La
documentación salía siempre; el código, nunca: cuando la corrida se quedaba sin margen, lo
que ya estaba hecho era lo barato. Con un objetivo por prompt, las cuatro corridas siguientes
produjeron código **en las cuatro**.

**Documentación mínima durante, completa al final.** Una línea de bitácora por commit
mientras se trabaja; el resto —bitácora larga, `HANDOFF_CODE.md`, `PLAN.md`— **cuando el
código funciona**, no antes y no intercalado. **Si el código no llega, se documenta lo que se
hizo, no lo que se planeaba.**

**Toda premisa del prompt se verifica antes de aplicarla, incluidas las que el prompt da por
medidas.** Van **cuatro prompts seguidos con una premisa central falsa**, y en los cuatro la
detectó una medición de la Parte 0: el nombre de `Directa Mail` no tenía barrio ni fecha; la
figura no existe del lado digital; las dos cuentas homónimas nunca empataron; las celdas de
la lámina 18 estaban combinadas y no vacías. **Frenar sobre una premisa vencida y seguir por
otro lado es el comportamiento correcto, no una desviación** — y por eso la Parte 0 de un
prompt se corre aunque parezca trámite.

**`git push` después de cada commit, sin preguntar.** El remoto no es un canal de
release: es el backup del trabajo y la única forma que tiene la sesión de claude.ai de ver
el estado real del repo. Un commit sin pushear es invisible. Pushear al terminar cada
paso, no acumular al final de la sesión.

Si el push es rechazado porque el remoto avanzó, **parar y preguntar.** `--force` **no se
usa por cuenta propia: requiere confirmación explícita del usuario**, pedida en el momento.
No está vetado —el repo es backup y canal de contexto, no un historial compartido con
terceros— pero sigue siendo la última opción: este repo se edita desde dos herramientas que
no se ven entre sí, y un force-push pisa trabajo que no está a la vista. Antes de pedir la
confirmación, mirar qué commits se estarían tirando.

Quien implementa no se autoverifica. Los errores del Paso 2.2 se cazaron verificando
archivos vivos, no leyendo los reportes de las funciones. Reportar lo que se hizo, no
declarar que funciona.

**Quien toca una función con control positivo corre los controles antes de cerrar.** No
alcanza con que pase el protocolo: `Pruebas.gs` existe justamente porque **el protocolo de
siete pasos del 2.11 pasa igual aunque los cinco controles estén mal** —cero cambios sigue
siendo cero cambios— y lo mismo vale para cualquier verificación end-to-end. Origen: 02/08.
La Parte E del 2.11 cambió `alinearSolapasLookerADinamico_`, se verificó contra la planilla
(el número dio bien) y **no se re-corrieron los controles**; el de `C.2-3` quedó fallando un
día entero, invisible, hasta que lo encontró el Paso 2.14 al correrlos por API.

**Un test puede acertar el hecho y errar la inferencia.** `getFormulas()` sobre las dos
hojas de `looker` devolvió bien "esta tiene fórmula"; la conclusión "por lo tanto deriva
de la otra hoja del par" era falsa — la fórmula era un `QUERY()` sobre una **tercera**
hoja, y la clasificación quedó invertida hasta el Paso 2.9 Parte C. El texto de la fórmula
estaba disponible desde el 2.8: faltó mirarlo antes de aceptar la etiqueta. Cuando un
instrumento devuelve una **etiqueta** (`derivada`, `plausible`, `ok`), verificar el dato
crudo del que salió, no la etiqueta.

**Un número correcto puede salir de las filas equivocadas, y ninguna verificación del proyecto
lo miraba.** Antes de dar por bueno un número, preguntar **de qué filas sale**: qué entra, cuál
es el denominador, y **quién declaró ese recorte**. No alcanza con que el token tenga fila en
`MARCADORES`, el `MAPEO` resuelva, la fuente traiga filas y el formato sea el correcto — eso es
exactamente lo que pasó con la lámina 5 el 07/08: los seis marcadores de `ecv_alcance_semanal`
pasaron las cuatro verificaciones y contaban **doce figuras en vez de una**, porque `rdv` trae
el gabinete entero y nadie había declarado la señal de corte (`R-15` addendum 1).

- **Todas las verificaciones existentes preguntan si el número salió; ninguna preguntaba si
  salió del universo que corresponde.** Ése es el hueco que esta convención cubre.
- El síntoma es el peor de este proyecto: **el número plausible.** `15` encuentros no se ve mal
  al lado de `4`; se ve como un buen dato. Sobrevivió porque nada lo contradecía.
- **Se pregunta antes de cablear, no después.** Un token nuevo sobre una fuente cuyo universo
  no está declarado nace mal, y en lote el error se multiplica en vez de corregirse.

**Un dato medido una vez y citado tres veces envejece igual que cualquier otro.** Una medición
no se vuelve permanente porque haya viajado: cada vez que se **usa para decidir**, se vuelve a
medir. El caso, 07–08/08: *"`CAMPAÑAS_DESGLOCE_DIGITAL` está registrada como `revisar`"* se
escribió en un prompt, se repitió en el reporte de la corrida siguiente y se citó en un tercero
como fundamento de un cambio — **y ya era falso: la solapa estaba como `fuente`**. Nadie mintió;
el dato simplemente venció, y las tres citas lo hicieron parecer más firme cada vez.

- **La cita no es la fuente.** Si un prompt, un reporte o una bitácora afirman el estado de una
  hoja, del código o de una base, eso es **evidencia fechada**, no el estado de hoy — vale lo
  mismo que un `.md` congelado (§7).
- **Es el mismo error de los dos lados**: quien escribe el prompt y quien lo ejecuta. No alcanza
  con que uno de los dos verifique.

**Y una trampa de lectura del instrumento: `FALTANTES` lista por ítem, no por token.** Un token
de una sección repetible aparece **una vez por ítem emitido** y con el sufijo `@<ítem>`, así que
**contar tokens ahí mezcla láminas** — los `@San Cristóbal (pre)` son de la lámina 6, no de la 5.
De ahí salió un conteo de "nueve" que eran diez. Para saber qué tokens tiene **una lámina**, se
lee la lámina; `FALTANTES` responde otra pregunta.

**Y el corolario operativo: antes de escribir un filtro, verificar que su campo esté en
`MAPEO`.** `aplicarFiltroDeMarcador_` resuelve el campo con `buscarMapeo` contra la base y
solapa **del marcador**, y un filtro **propio** cuyo campo no está mapeado **no filtra: falla**
con `«FALTA:…@filtro_campo_no_mapeado»`. Escribir seis celdas sin ese chequeo previo es dejar
seis marcadores rotos de una sola pasada. Un `buscarMapeo(base, solapa, campo)` antes de la
primera celda cuesta una llamada.

- **La asimetría es a propósito y conviene conocerla:** un filtro **heredado** de la sección
  cuyo campo no existe en esa base **se ignora en silencio y no es error** —`SECCIONES.filtro`
  se escribe en el vocabulario de la fuente de iteración—, pero uno **propio** falla. Así que
  el mismo texto de filtro se comporta distinto según dónde se lo escriba.
- **Y al escribir sobre una hoja de registro, no pisar lo que ya está.** Si la celda trae otro
  valor, se reporta y no se toca: pisarlo borra una decisión que alguien tomó y que no está
  en ningún otro lado.

**Apps Script es una plataforma con límites conocidos, y ese conocimiento se usa.** En todo
lo que toca ejecución —límite de tiempo por invocación, cuotas, bloqueos, timeouts propios
de cada servicio, concurrencia sobre la misma planilla, costo de `flush()`, `LockService`—
aplicar lo que se sabe de la plataforma. Es un cuerpo de conocimiento que este proyecto no
venía usando.

- **Sirve para generar candidatos, no para cerrar causas.** Distinguir siempre el hecho de
  plataforma —citable— de la afirmación sobre esta corrida, que necesita evidencia de esta
  corrida.
- **Causa y observación no son lo mismo.** "Murió a los 324 s" es una observación. "Murió
  por el límite de 6 minutos" es una causa, y necesita evidencia que descarte las otras.
  Sin eso va como candidato, **nombrado como candidato**.
- **Una medición con dos cosas corriendo no es una medición.** Antes de tomar un número
  como dato, verificar que hubo una sola corrida.
- **El instrumento es parte del sistema.** La instrumentación escribe en la misma planilla
  que se está diagnosticando. Cuando el síntoma es contención o tiempo, preguntarse si el
  instrumento participa del problema antes de leer lo que informa.

Origen de esta regla y de la de revisar el prompt, arriba: las dos corridas del 18/08. La
primera atribuyó la muerte al límite de 6 minutos sin evidencia que descartara la contención
de Sheets; la segunda lo corrigió. Y en ninguna se estaba aplicando conocimiento de Apps
Script como plataforma, que es donde estaba la respuesta.

**Dos cosas que se llaman igual no son la misma cosa, y en este repo pasa seguido.** Antes de
concluir *"eso no está mapeado"*, *"esa columna no existe"* o *"esa solapa no tiene el dato"*,
**verificar sobre qué se buscó**. El caso que lo instaló, 07/08: se buscó la fuente de la
lámina 7 en la solapa `Seguimiento digital` y se concluyó que veinte tokens no tenían fuente.
El dato estaba mapeado desde antes del 01/08 — **en la solapa `Digital`, de esa misma base**.
La confusión es de nombres y está en los datos, no en quien busca: **`"Seguimiento Digital"` es
el nombre de la base `digital`**, y además hay **una solapa** que se llama casi igual; y
`BASES.digital.hoja_default` es una **tercera** cosa, `Digital`. Tres nombres parecidos, tres
referentes distintos.

- **La regla operativa:** un "no está" se reporta **nombrando el ámbito exacto en el que se
  buscó** —base, solapa, columna—, nunca a secas. Un "no está" sin ámbito es una conclusión
  que nadie puede verificar y que se propaga sola: ésta llegó a cuatro documentos en una
  noche.
- **Y se busca en el registro vivo**, no en un snapshot: un volcado envejece con la primera
  escritura, incluida la que uno mismo acaba de hacer.

---

## 5. Handoffs — dos archivos, dos dueños

El repo se edita desde dos herramientas que no se ven entre sí. Cada una tiene su handoff
y **nunca escribe en el del otro.** Así se evita el conflicto de sincronización de OneDrive
que partió el `HANDOFF.md` único original.

**`docs/HANDOFF_CODE.md` — de Code. Se reescribe.**
Solo estado actual: en qué paso estamos, qué sigue, qué está trabado y por qué. Es un
puntero al presente, no un historial: al actualizarlo se **reemplaza** el contenido, no se
agrega abajo. La historia ya vive en `docs/BITACORA.md`. Se actualiza al cerrar cada paso,
antes del commit.

**`docs/Sesiones/HANDOFF AAAA-MM-DD.md` — de claude.ai. Son snapshots.**
Los baja el usuario de sus conversaciones y los deja en la carpeta. **Code no escribe ahí
nunca**, ni crea archivos nuevos en ese directorio. Solo los lee: el más reciente por fecha
es contexto valioso para arrancar, porque suele traer verificaciones hechas contra los
archivos vivos. Los anteriores se archivan en `docs/Sesiones/_archivo/`.

Al arrancar una sesión, leer los dos: `HANDOFF_CODE.md` dice dónde quedó el trabajo, el
handoff de claude.ai más reciente dice qué se verificó y qué se decidió.

---

## 6. Mapa del repo

```
CLAUDE.md                           este archivo — convenciones y ruteo, raíz del repo
*.gs, Panel.html, appsscript.json   código Apps Script (raíz — así lo espera clasp)
docs/PLAN.md                        plan, decisiones D-NN, backlog
Plan Inicial/PROYECTO.md            maestro histórico — CONGELADO 01/08/2026
Plan Inicial/_archivo/              historial: docs superados, plantillas .pptx espejo
docs/RUNBOOK.md                     guía de operación
docs/TOKENS.md                      diccionario de tokens
docs/PENDIENTES_consistencia.md     inconsistencias abiertas
docs/Prompts/                       Paso-N / DOC-N / AUD-N
docs/BITACORA.md                    qué hizo cada paso (append-only, solo Code)
docs/HANDOFF_CODE.md                estado actual (se reescribe, solo Code)
docs/REGLAS_NEGOCIO.md              reglas del dominio, ID R-NN
docs/SUPUESTOS.md                   supuestos asumidos, ID S-NN
docs/ESCRITORES.md                  quién escribe cada hoja de registro (vivo)
docs/INVENTARIO_CODIGO.md           foto del código al 01/08 (congelado)
docs/Sesiones/                      handoffs bajados de claude.ai — Code no escribe acá
tools/                              scripts de verificación independiente
```

`.claspignore` ya está configurado para pushear solo `appsscript.json`, `*.gs` y `*.html`.
Al agregar un tipo de archivo nuevo, verificar que no se cuele al push.

---

## 7. Quién es dueño de qué — una pregunta, un dueño único

Instalada por `DOC-5` (31/07/2026). No es un ranking: dos documentos con preguntas
distintas nunca compiten. La precedencia entra solo como desempate, al final.

| pregunta | dueño único | quién escribe |
|---|---|---|
| ¿Cómo se trabaja en este proyecto? (método, regla de parada, invariantes) | `CLAUDE.md` (raíz) | los dos |
| ¿Arquitectura, esquema, decisión estructural? | `docs/PLAN.md` §1, como `D-NN` — ID estable, y **una decisión no se edita: se supersede** con otra que la cita. Heredó la pregunta de `PROYECTO.md` §1–§6/§8 al congelarlo (`DOC-6` E) | los dos |
| ¿Convención de proceso o aprendizaje? | **Este archivo**, en la sección donde se aplica: §1 el namespace global, §3 el grep previo, §4 la verificación. Un aprendizaje no va a un depósito aparte — va donde alguien lo va a leer justo antes de repetir el error. Heredó la pregunta de `PROYECTO.md` §9 | los dos |
| ¿Dónde estamos ahora mismo (qué paso, qué falta)? | `docs/HANDOFF_CODE.md` — se reescribe entero | solo Code |
| ¿Qué sigue y en qué orden? ¿Qué decisión de arquitectura ya está tomada? | `docs/PLAN.md` — decisiones `D-NN` (estables, se superseden), Próximo / Planificado y bloqueado / Backlog. Distinto del handoff: éste dice **hacia dónde**, el handoff dice **dónde estamos** | los dos |
| ¿Qué se hizo y cuándo, historial completo? | `docs/BITACORA.md` — append-only. Si discrepa con `HANDOFF_CODE.md` sobre un hecho histórico, **gana la bitácora**: no puede perder una entrada al reescribirse; el handoff es un resumen que puede quedar atrás y se reconstruye desde ella | solo Code |
| ¿Qué se verificó/decidió en la última sesión de claude.ai? | El handoff de `docs/Sesiones/` **vigente por cadena de reemplazo** (ver abajo), no por ubicación de carpeta | solo claude.ai |
| ¿Qué se construyó en un paso puntual y cómo se verifica? | El prompt vigente de su cadena en `docs/Prompts/`. No dice si ya corrió ni si sigue siendo cierto hoy — eso es de la bitácora y el handoff | los dos; no se edita una vez ejecutado (addenda fechados sí, ver abajo) |
| ¿Qué dice una regla del dominio? | `docs/REGLAS_NEGOCIO.md`, ID `R-NN`, append-only, derogación con fecha | los dos |
| ¿Qué supuesto se está asumiendo? | `docs/SUPUESTOS.md`, ID `S-NN`, ídem | los dos |
| ¿Cómo se llama este token? | `docs/TOKENS.md` | los dos |
| ¿Qué inconsistencia documental sigue abierta? | `docs/PENDIENTES_consistencia.md` | los dos |
| ¿Qué se le preguntó al equipo y sigue sin respuesta? | `docs/PENDIENTES_consistencia.md`, sección propia "Preguntas al equipo" (nacen en docs congelados como `VALIDACION` §7; al congelarse el doc, la pregunta viva se copia ahí) | los dos |
| ¿Qué número dio una medición y contra qué se verificó? | `docs/VALIDACION_*.md` + su CSV de casos — congelados, uno nuevo por corrida de validación | nadie edita; se crea uno nuevo |
| ¿Qué dio una corrida de protocolo de prueba y contra qué se verificó? | `docs/PROTOCOLO_*_corrida_*.md` — congelados, uno nuevo por corrida. Distinto de `VALIDACION_*`: eso mide números del informe contra las bases, esto verifica el comportamiento del motor contra un protocolo escrito | nadie edita; se crea uno nuevo |
| ¿Cómo se opera / se corre algo? | `docs/RUNBOOK.md` | los dos |
| ¿A qué URL le pego, con qué cuenta, y dónde vive esa credencial? | `docs/ENTORNO.local.md` — **fuera de git** (Paso 1.8). Ningún otro documento repite una URL o una cuenta: el RUNBOOK explica la operatoria y apunta acá. **Frontera** (Paso 2.15): son credenciales y URLs de acceso, no identificadores de recursos que ya viven en los seeds — un ID de carpeta de Drive está en `SEED_CONFIG_DEFAULTS_`, que está en git, así que esconderlo acá no lo protege: sólo lo saca de la vista de claude.ai, contra el corolario del final de esta tabla | los dos |
| ¿Qué es cada carpeta de Drive y para qué sirve? | `docs/RUNBOOK.md`, tabla "Las carpetas de Drive": rol, ID, nombre real, cuenta dueña y quién la lee. Distinto de las dos filas de configuración: ésas dicen qué valor usa el motor, ésta dice qué es cada recurso | los dos |
| ¿Qué decisión editorial lleva cada informe? (qué campañas, qué va a mano) | `docs/CONFIG_INFORMES.md` | los dos |
| ¿Qué debe cumplir una lámina nueva pedida en lenguaje natural? | `docs/OBJETIVO_lamina_nueva.md` | los dos |
| ¿Qué va a hacer el motor si corro ahora? | Las **hojas de registro** vivas (`CONFIG`, `BASES`, `INFORMES`, `MARCADORES`, `MAPEO`, `CAMPANAS`, `PERIODOS`, `SOLAPAS`, `SECCIONES`). Autoridad total sobre el comportamiento — y sobre nada más (nota abajo) | humano y motor, vía menú |
| ¿Qué *debería* decir esa configuración? | Los `SEED_*` de `Instalar.gs` — el **valor** | los dos |
| ¿Quién puede escribir esta hoja de registro, y por qué camino? | `docs/ESCRITORES.md` — contrato vivo, distinto del anterior: ése dice qué valor va, éste dice quién tiene derecho a ponerlo. Matriz regenerable con `tools/escritores.js` | los dos |
| ¿Cómo está construido el código y qué alcanza a qué? | **Los scripts de `tools/`, re-corridos** (`inventario.js`, `escritores.js`) — nunca el `.md`. `docs/INVENTARIO_CODIGO.md` es la foto del 01/08/2026 y envejece; el script es el que sigue siendo cierto | los dos |
| ¿Qué operaciones tiene el motor? | **`OPERACIONES_` en `Marcadores.gs`** — es un **mapa explícito**, así que la lista es exacta por construcción y no puede envejecer. Mismo criterio que la fila de arriba: el código es la fuente, no un `.md` que se desincroniza. Una operación nueva se documenta **en su propio comentario**, con el motivo, y el escape hatch `FN:` es la medición de `D-01`: si crece, falta una genérica | los dos |
| ¿Cómo está configurada la herramienta? (subagentes, `settings.json`, hooks) | **`.claude/`** — `settings.json` los permisos, `settings.local.json` lo de esta máquina, `agents/*.md` los subagentes. Se editan **a mano**: desde la `v2.1.220` `/agents` ya no crea nada, y **los agentes se cargan al arranque** — un archivo nuevo con la sesión abierta no existe hasta reiniciarla | los dos |
| ¿Cuáles son los datos? | Las cuatro bases (`rdv`, `digital`, `looker`, `m2`) — dueños ajenos, el motor solo lee. No divergen de nada: **son** el dato; la nota de abajo no les aplica | el equipo y dueños externos |
| ¿Qué versión vale si el disco local y git divergen? | **El disco local.** Git atrasado es una falla de respaldo a corregir, no una contradicción a dirimir. Corolario: lo que claude.ai tenga que ver, tiene que estar pusheado — un archivo sin pushear no está en la conversación | — |

**Hojas de registro: estado, no verdad.** Si lo que hace el motor y lo que dice el
sembrador no coinciden, ninguno "gana": es un **hallazgo**, va a
`docs/PENDIENTES_consistencia.md` (pasó con `BASES.m2.hoja_default`, y este cuadro existe
por eso). Aplica solo a las hojas de registro, no a las cuatro bases.

**Cadena de reemplazo — un solo campo, `reemplaza:`.** El documento nuevo declara en su
encabezado a cuál(es) reemplaza; el viejo no se edita y por eso no puede apuntar a nada.
Mismo campo en prompts y en handoffs. Un documento puede ser reemplazado por **varios**
(`Paso-2.10` quedó partido en dos addenda) — para saber qué está vigente hay que seguir
todas las declaraciones, no la primera. Vigente = lo que ninguna declaración cubre.

**Addenda fechados.** "No se edita" significa no alterar una línea del texto original —
no que el documento quede mudo ante un error propio: un addendum fechado y marcado que
corrige una premisa es válido (ejemplos: `docs/DISENO_match_temario.md` §9,
`docs/Prompts/DOC-5_orden_documental.md`).

**Todo lo demás es evidencia congelada, no dueño de ninguna pregunta:** los relevamientos
y hallazgos fechados de `docs/` (`AUD-2`, `HALLAZGOS_validacion_decks`,
`DISENO_match_temario`, `FECHAS_seleccion`, `GRANO_TEMPORAL`, `INFORMES_relacion`,
`MAPEO_completo`, `PLANTILLAS_QA_y_armonizacion`, `RDV_otros_ministros_riesgo`,
`SECCIONES`, `TEMARIO_Y_PLANTILLA_*`, `INVENTARIO_CODIGO` — foto del código del
01/08/2026, AUD-3; para saber qué es cierto hoy se re-corren sus scripts), los prompts ya
ejecutados, los handoffs archivados y todo `_archivo/`. Explican cómo se llegó; nunca qué
es cierto hoy.

**Desempate**, para el caso raro en que dos documentos reclamen la misma pregunta: gana
el que **esta tabla** declara dueño; si ninguno lo es, gana el que lleve la **fecha
escrita** más reciente — nunca la fecha de commit, nunca la ubicación de carpeta (la
ubicación fue justo lo que falló con los handoffs del 31/07).

---

## 8. Idioma

Todo en español: código, comentarios, documentación, commits y conversación.

---

## 9. Plan y decisiones

`docs/PLAN.md` es el único lugar donde vive el plan. Tiene las **decisiones de
arquitectura** con ID `D-NN` —estables, nunca se reutilizan; una decisión no se edita, se
**supersede** con otra que la cita— y tres secciones de futuro cuya frontera es lo que hace
que el archivo sirva:

- **Próximo** — lista **ordenada**, con las dependencias dichas.
- **Planificado y bloqueado** — cada ítem nombra **qué lo destraba y de quién depende**.
- **Backlog** — sin orden y sin fecha.

La prueba para saber en cuál va algo: **si no podés decir qué lo desbloquea, es backlog.**

El invariante de `D-01` no está acá: vive en §2, con los demás invariantes de código, que
es donde lo lee quien está por tocar un `.gs`.
