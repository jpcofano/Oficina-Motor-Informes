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
  - **El caso raro en que la copia a mano ES el diseño, y qué hacer entonces.** Las tres listas
    de hojas de registro —`ALCANCE_REGISTROS_` en `Instalar.gs`, `HOJAS_REGISTRO` en
    `tools/escritores.js`, `HOJAS` en `tools/snapshot.js`— están duplicadas **a propósito**: las
    dos herramientas de `tools/` son el contra-qué del motor, y si leyeran la lista del código
    que auditan dejarían de ser independientes. Unificarlas rompería lo que las hace útiles.
  - **Un valor escrito a mano no es deuda por estar escrito a mano: es deuda cuando nadie se
    entera de que quedó viejo.** `LAMINAS` nació el 09/08, entró en una de las tres listas y no
    en las otras dos, y **nada lo señaló** — la hoja pasó un día sin respaldo declarado y fuera
    de la matriz de escritores. **Cuando la duplicación es el diseño, la salida no es borrarla:
    es que el desajuste falle.** `tools/listas.js` (10/08) lee las tres por texto y sale con
    error si difieren; su control positivo es sacar una hoja de una lista y ver que rompa.
- **Agregar una columna a una hoja de registro es tocar N lectores, no uno. Greppear el nombre
  de la columna antes de dar el alta por terminada.** Van **tres casos en una semana**, los tres
  con el mismo modo de falla: la columna entra al `SEED_*` y a **un** consumidor, y los demás
  lectores quedan atrás **sin fallar**.
  - `campo_id_cuenta` (`_44`) entró al seed y a la lista de columnas que compara
    `aplicarClasificacionSolapas_`, **y no a `leerFilasSolapas_`**. Síntoma: `"undefined"` **como
    texto** en un diff, un mes después.
  - `encabezado` (`D-31`) se habría poblado sólo en la hoja, y `upsertPorClave_` la **borra** al
    primer cambio de otra columna — `headers.map(h => (h in obj) ? obj[h] : '')`.
  - `uso` con espacios: seis comparadores en el camino de lectura, **todos crudos**, y `R-10`
    escrita desde el 02/08 (`PENDIENTES`, 15/08).
  - **La checklist, que es lo accionable:** `grep -rn "<columna>" *.gs` y mirar **(a)** los
    lectores que arman el registro —`leerSolapas`, `leerFilasSolapas_`, `leerRegistro_`—,
    **(b)** los `SEED_*` y `COLUMNAS_DELTA_`, **(c)** todo `upsertPorClave_` que escriba esa
    hoja, porque **blanquea lo que el objeto no traiga**, y **(d)** `tools/` — las tres listas
    duplicadas a propósito.
  - **El síntoma nunca es un error**: es un `undefined` disfrazado de texto, una celda que se
    vacía sola, o una comparación que no matchea. Por eso hay que buscarlo al escribir y no
    esperar a que aparezca.
- **Toda fila nueva de `MAPEO` lleva letra y encabezado.** La letra es la referencia operativa
  y **la única forma de encontrar la columna**; `encabezado` documenta qué título hay hoy en esa
  letra. Escribir una sin la otra deja el hueco abierto justo donde la documentación dice que
  está cerrado (`D-31`, 14/08/2026).
  - **El encabezado es testigo, nunca fallback.** El día que alguien lo use como *"si la letra
    falla, buscá por título"*, vuelve el problema completo y peor: los títulos **se repiten**
    —`Agenda JM | Post` tiene cuatro `% CTR`, `Base_Digital` ocho `ID Cuentas`, `Desglose
    impresiones` tres claves— así que el fallback acertaría a veces y erraría en silencio otras.
  - **Va en el seed, no sólo en la hoja**, y no es prolijidad: `upsertPorClave_` reescribe la
    fila entera con `(h in obj) ? obj[h] : ''` cuando cambia **cualquier otra** columna, así que
    un valor que el seed no conoce se borra solo. Con el testigo en el seed, además, **el diff
    de `instalar()` muestra el desalineamiento sin que exista todavía quien lo compare**.
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
- **Todo marcador nuevo nace con el corte en `dimensiones`. Nunca en `filtro`, nunca en el
  nombre.** (17/08/2026, al cerrar la migración.) `filtro` queda **sólo** para **restricciones
  técnicas** — `estado=Activa`, las guardas `!=0` —, que son reglas de validez de la fila y no
  cortes que alguien del equipo pediría.
  - **La frontera es la misma que fijó `D-33` para migrar, aplicada al alta:** una **dimensión** es
    un corte que alguien pediría (*"esto pero de GCBA"*, *"esto pero de Meta"*); una **restricción
    técnica** es lo que hace válida a la fila. Si dudás, preguntá si el equipo lo pediría por
    nombre: `ambito=gcba` sí, `estado=Activa` no.
  - **Por qué se escribe acá y no en el prompt de cada cableado:** la migración sacó el corte de
    `filtro` en **42 marcadores** y ese trabajo se revierte de a uno. **El primer cableado con
    apuro reinstala el problema**, y no falla — publica un número correcto con el corte en el lugar
    equivocado, que es como llegaron los 42.
  - **El caso bien hecho ya está en la hoja y sirve de molde:** `enc_impresiones` tiene
    `filtro = imp_totales!=0` y `dimensiones` vacío. **Eso es correcto**: no tiene corte, tiene una
    guarda. Vaciarle el `filtro` "para ser consistente" sería el error simétrico.
  - **Un marcador sin ningún corte lleva `dimensiones` vacío**, y eso no es deuda: **ausente
    significa «todas»** (decisión del usuario, 15/08). No se inventa un valor `todas`.
- **Un token es una medida más sus dimensiones, y el corte no va en el nombre** (`D-33`,
  15/08/2026). El vocabulario es **global**: `ambito` (`jm`/`gcba`), `plataforma`
  (`meta`/`google`/`programmatic`) y `tipo_envio` (`convocatoria`/`m2`) son cortes declarados, no
  prefijos. Ocho marcadores de `looker/DIGITAL` que sólo difieren en el `filtro` son **una**
  medida con dos dimensiones.
  - **Esto reemplaza a *"los renombres de tokens son por `informe_id`, nunca globales"***, que
    valió hasta el 15/08. La premisa de aquélla —*"el mismo nombre puede ser correcto en una
    plantilla e incorrecto en otra"*— **se invierte cuando el corte deja de estar en el nombre**:
    lo que hacía a un token específico de un informe era justamente el prefijo.
  - **Sin régimen de transición, y es deliberado:** `S-05` está vivo —hay un solo lector— y no
    hace falta mantener dos sistemas andando. La regresión de `enc_audiencia` que fundó la regla
    vieja sigue siendo el caso a no repetir; lo que cambia es cómo se evita.
  - ⚠ **La frontera que hay que respetar al migrar:** una **dimensión** es un corte que alguien
    del equipo pediría; una **restricción técnica** es una regla de validez de la fila. Las nueve
    guardas `!=0` y `estado=Activa` **no son dimensiones** y se quedan en `filtro`.
- **`lamina_id` es global y corrido, y el orden de sellado es `secco` primero, `jm` después.**
  `secco` toma `L-001`–`L-029`, `jm` `L-030`–`L-051`. La clave de unicidad es **`lamina_id`
  sola**, no el par plantilla + id, y el contador es `max(lamina_id) + 1` sobre la hoja entera.
  - **El motivo del orden importa más que el orden, y es de legibilidad, no técnico.** La
    documentación del proyecto entera dice *"lámina 2"*, *"lámina 6"*, *"la lámina 10 escondida"*
    refiriéndose a la **posición en la plantilla `jm`**. Con `jm` arrancando en `L-030`,
    **ningún `lamina_id` se parece a una de esas posiciones** y no hay forma de confundirlos. Al
    revés —`jm` desde `L-001`— coincidían por casualidad, que es la peor forma de no colisionar.
  - **Los ids son orden de asignación, no orden de deck.** Una lámina nueva en el medio de `jm`
    toma el siguiente al máximo, **no se inserta**. La posición vive en la plantilla; el id, en
    el registro — por eso `LAMINAS.orden_plantilla` es reportado y nunca autoritativo.
  - **Una tercera plantilla toma `L-052` en adelante**, y eso tiene que ser esperado.
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
- **Toda función pensada para que la corra una persona desde el editor va SIN `_` final Y SIN
  PARÁMETROS.** Son **dos** condiciones y hay que cumplir las dos: Apps Script no lista en el
  desplegable ni las que terminan en `_` —trata el sufijo como privado— **ni las que reciben
  argumentos**, porque no tiene dónde pedírselos. Una función que falla cualquiera de las dos es
  una función que nadie puede correr.
  - **La primera mitad ya costó dos veces:** `diagPlanillaExterna_` se midió y su resultado no
    quedó en ningún lado, y `diffSolapasSinAplicar_` se pusheó sin forma de invocarla.
  - **La segunda se agregó el 16/08, y es la tercera vez que aparece:**
    `censarTokensEnPlantilla(informeId, tokensCsv)` se pusheó como wrapper público, sin `_`, y
    **igual no aparecía en el desplegable**. La salida es un wrapper **sin argumentos** que la
    llama con los valores del caso — `censarTokensDelPiloto()` —, no cambiarle la firma a la que
    ya sirve para otros usos.
  - **El síntoma es el mismo en los tres casos y no se parece a un error:** la función está
    pusheada, el código es correcto, y la persona simplemente **no la encuentra en la lista**.
  - **El interior sigue con `_`**, y eso no cambia: lo que se agrega es un **wrapper público**
    que lo llama. Así el motor conserva su namespace y la persona tiene su botón.
  - **Un wrapper que corre varias cosas las corre en el orden que corresponde**, y es la mitad
    de su valor: `verificarGateDeUso()` no corre la prueba de punta a punta si la pura falló,
    porque sobre un cálculo roto el resultado de la otra no significa nada.
  - **Y devuelve por `Logger.log`, no sólo por `return`**: el editor no muestra el valor de
    retorno. Una función que sólo retorna es, desde ahí, una que no dice nada.

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

**`SIN MECANISMO` es para decisiones que no tienen prompt que las destrabe. Si el destrabe está
en la cola, va a `PENDIENTES` y no a una regla.** Decisión del usuario, 09/08.

- **La marca no es una forma suave de escribir una regla que todavía no se puede aplicar.** Es
  para lo que el usuario ya decidió y **nadie va a implementar en el horizonte visible** — `R-20`
  es el caso: necesita una segunda ruta de lectura de `rdv` que no está en ninguna cola.
- **Si lo que falta es un prompt que ya está en el orden, es un pendiente.** El caso que fijó la
  regla: `R-15 Addendum 2` esperaba que `looker/Cuentas` volviera a `fuente`, y eso es la Parte A
  del prompt siguiente. Escribirlo como regla marcada habría creado una marca que hay que sacar a
  mano dos prompts después.
- **Una marca que hay que sacar a mano es deuda**, y de la peor clase: nadie la saca, y la regla
  queda diciendo "no citar como vigente" cuando ya es vigente. Un pendiente, en cambio, se cierra
  con un tachado y una fecha.

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

**Hay tres caminos para verificar un número, y cada uno tiene algo que NO contesta.** Se escriben
acá por primera vez (20/08/2026, `2026-08-20_3`). ⚠ **Esto no deroga ninguna regla**: la
formulación que se venía citando de memoria —*"Code no valida contra las bases externas; escribe el
instrumento y el usuario corre"*— **nunca estuvo escrita en este archivo ni en `docs/`**, se buscó
y no está. Lo que sigue vigente y no cambia es *quien implementa no se autoverifica*, arriba.

| camino | contesta | **no** contesta |
|---|---|---|
| **estructural, desde el log** | partición, identidad de filas, cuentas — lo que se lee del reporte sin ver el dato | nada sobre el valor absoluto |
| **fixture, Code sobre disco** | *¿la definición de este marcador produce el número publicado?* | qué dice la base **hoy** |
| **corrida, el usuario** | la traza, la rama, el estado de la hoja viva | nada reproducible seis semanas después |

**Lo que habilita el camino del medio, y por qué es nuevo:** `docs/_fixtures/` tiene exports en
disco —fuera de git, por la decisión de privacidad de `C-21`— que Code puede abrir con la
biblioteca estándar, sin instalar nada: un `.zip` y un `.xlsx` son lo mismo, y un `.pptx` también.
**Las bases y el deck que salió de ellas viven en el mismo archivo del mismo día**, así que el
cruce *definición → número publicado* se hace entero sin conectarse a nada.

**Cuatro reglas que van con el camino nuevo, y ninguna es opcional:**

1. ⭐ **El `sha256` se verifica contra la tabla de huellas ANTES de citar un número.** Ya está
   escrito en el `README.md` de la carpeta; acá se eleva a regla de método. Un archivo pegado en
   un chat, sin huella, es **anónimo**: nada distingue un export del que le siguió dos días
   después, y los dos se llaman casi igual. Un caso `exacto` medido contra un archivo anónimo **no
   es reproducible**, que es lo que `C-21` vino a arreglar.
2. ⭐ **Reproducir el cálculo en node o Python es una reimplementación**, y es el error que este
   repo ya cometió cuatro veces —*el instrumento que reproduce lógica del motor y la reproduce
   peor*—. **Cuando la lógica existe en un `.gs`, se extrae la función real**, como hacen
   `tools/probar-formato-revisar.js` y `tools/probar-simbolos-faltante.js`. Reescribirla a mano se
   permite **sólo** cuando lo que se verifica es la **definición del negocio** y no el motor, y
   **el reporte tiene que decir cuál de las dos cosas hizo**.
3. **Un fixture es una foto fechada, y su fecha es parte del resultado.** Un número medido sobre el
   export del 31/07 responde por el 31/07 y por ningún otro día. Es la misma disciplina que los
   snapshots de `_snapshots/`, que se citaban como si fueran de hoy hasta que se versionaron.
   **El caso testigo ya existe y conviene citarlo en vez de volver a descubrirlo:** `X-17` no se
   puede cerrar con lo que hay en disco, y su propia nota dice por qué — *"el conteo nuevo 16/14/21
   salió de una base de 4.904 filas y el fixture del 31/07 tiene 4.569"*.
4. **Un número reproducido contra un fixture no prueba que el motor lo lea así.** Prueba que **la
   definición** es correcta. Son dos afirmaciones distintas y el caso de validación tiene que decir
   cuál está haciendo — **si difieren, eso es el hallazgo, no el ruido.**

⚠ **Lo que esto NO cambia:** la corrida sigue siendo del usuario, la traza sigue sin existir fuera
de ella, y **el fixture no vuelve verificable nada de lo que depende de la base viva** — los nueve
`camp_*`, la rama por cuenta y la selección semanal siguen exactamente donde estaban.

**Un símbolo que no distingue «no se cableó» de «no se llegó» convierte un problema de tiempo en
un diagnóstico de cableado.** Es la familia del número plausible, movida a la capa de presentación:
el glifo no miente sobre un valor, miente sobre **por qué no hay valor** — y las dos causas mandan
a trabajos opuestos.

- **El caso, medido el 20/08/2026:** la corrida de `jm` de las 15:45 se cortó por presupuesto y el
  deck salió con **269 `/////`**, de los cuales **264 eran del corte**. `/////` significa *nadie lo
  cableó*, así que el deck mandaba a cablear 264 tokens **que ya estaban cableados**. Lo que hacía
  falta era correr de nuevo.
- **Por qué no lo atajaba nada:** los cuatro símbolos del `2026-08-20_1` se eligen por el **estado
  del marcador**, y un token que la corrida no alcanzó a mirar **no tiene estado**. Cae en *«sin
  información suficiente → el símbolo más ruidoso»*, que era la regla correcta cuando se escribió
  — con una causa menos.
- ⭐ **Lo accionable, y es una pregunta que se hace al agregar cualquier símbolo:** *¿qué trabajo
  manda a hacer este glifo, y hay más de una causa que lleve a él?* Si dos causas distintas
  comparten símbolo y **piden acciones distintas**, falta un símbolo — no una nota al pie.
- ⚠ **Y el corolario sobre el reporte, que es la mitad barata:** mientras el glifo se decide, **el
  reporte lo dice en su primera línea**. Un deck cortado era indistinguible de uno completo mirando
  el deck, y sus conteos se leían como cobertura. Lo que cambia cómo se lee todo lo demás va
  arriba, no en un bloque lateral.

**Un caché que guarda el handle y no el dato no cachea nada, y el síntoma es un costo por ítem que
parece trabajo real.** `cacheBases_` guardaba el **archivo abierto** de cada base y el nombre decía
«caché de bases», así que durante semanas nadie miró más abajo: **cada llamada a `leerFuente` hacía
su propio `getDataRange().getValues()`**, una lectura completa de la solapa. Y `leerFuente` se llama
**una vez por marcador**, no una vez por solapa — 38 marcadores de un ítem de encuentro tocan 5
solapas y hacían **38 lecturas enteras**.

- **Por qué no se veía:** el gasto se reparte perfectamente entre los ítems, así que se lee como
  *«cada encuentro cuesta 25 s»* — una frase que suena a trabajo del dominio y no a un bug. **Un
  costo lineal en la unidad de trabajo es el mejor escondite de una relectura**, porque la
  proporcionalidad parece explicarlo.
- ⭐ **La pregunta que lo destapa, y es barata:** *¿qué guarda exactamente este caché — el acceso o
  el contenido?* Son dos cosas y sólo una ahorra el viaje.
- ⚠ **Y la trampa al arreglarlo, que es donde se rompe un número:** la clave tiene que garantizar
  **exactamente las mismas filas**, no parecerse. Cachear el **dato crudo** por `base‖hoja` es
  seguro porque el recorte sigue corriendo después; meter la ventana en la clave para que "pegue
  más seguido" **cambia qué filas ve el consumidor**, y eso es un valor movido, no una
  optimización.

**Un mecanismo que se reanuda solo necesita una guarda de progreso; sin ella, «tarda» y «no
avanza» se ven igual hasta que se agota la cuota.** Un proceso que se vuelve a agendar a sí mismo no
tiene a nadie mirando: la única diferencia observable entre uno que avanza despacio y uno que no
avanza nada es **cuánta cuota queda**, y para cuando eso se nota ya se gastó.

- **La guarda concreta:** si una ejecución no marcó **ni una** unidad de trabajo como hecha, **la
  siguiente no se crea**. Cuesta una comparación y convierte un consumo silencioso en un reporte.
- ⭐ **Y la que hace falta al lado, que es menos obvia:** la guarda de progreso **corta bien y
  diagnostica mal**. Si una sola unidad de trabajo es más grande que una ejecución, el mecanismo
  la toma, no la termina, no la puede marcar hecha, y la siguiente vuelve a empezarla — la guarda
  lo corta e informa *«no avanza»*, **cuando la verdad es «la unidad es demasiado grande»**. Son
  dos arreglos distintos: uno se arregla mirando por qué falla, el otro **partiendo la unidad**.
  **El planificador tiene que poder nombrar los dos casos distinto.**
- ⚠ **Y contar la unidad correcta es parte de la guarda.** Acá la unidad no era la sección ni el
  ítem: es la **asignación** —ítem × lámina modelo—, y medido daban **16 ítems contra 36
  asignaciones**. Un planificador que cuenta la unidad equivocada se equivoca por más del doble, y
  el síntoma es una corrida que corta cuando el plan decía que entraba.

**Un presupuesto que sólo se consulta en el bucle no protege las etapas que están fuera del bucle, y
el síntoma es llegar al límite duro con un techo declarado.** El techo de una corrida sólo existe
donde alguien lo mira. Si el reloj se consulta entre unidades de trabajo —entre ítems, entre
archivos, entre filas—, todo lo que pasa **antes de la primera** y **después de la última** corre sin
freno, y el corte ordenado nunca llega a ejecutarse.

- **El caso, medido el 21/08/2026:** `CONFIG.presupuesto_corrida_seg` estaba en **150** —quedó bajo
  de una prueba de la noche anterior— y la corrida de `jm` llegó igual al muro duro de Apps Script,
  **360 s**. Más del doble del techo. El reloj se miraba en **dos** sitios, los dos dentro del bucle
  de asignaciones; el arranque —anclaje + unión digital + duplicación, 70-80 s más una llamada a la
  API de Slides por lámina— corría **sin ningún punto de control**.
- ⚠ **Lo que hace caro este modo de falla es que el sobregiro no deja evidencia.** Un corte ordenado
  escribe: barre los crudos, cierra la fila, quita el sello. **El muro no escribe nada** — ni la
  causa. Así que la corrida que más falta hace diagnosticar es exactamente la que no dejó con qué.
- ⭐ **La pregunta concreta, y se hace al escribir el techo, no al primer muro:** *¿cuál es el tramo
  más largo entre dos consultas del reloj?* Si ese tramo puede durar más que el techo, el techo es
  decorativo. **No alcanza con un control «antes de entrar» a la etapa cara**: si la etapa es
  indivisible y se pasa sola, el control de la entrada la dejó pasar con toda razón.
- ⭐ **Y el corolario que vale para cualquier corte: la clase del corte importa tanto como el corte.**
  *«El arranque no entra en el techo»* y *«me quedé sin presupuesto en el medio»* mandan a trabajos
  **opuestos** —subir el techo o partir el arranque contra correr de nuevo—, y un corte genérico los
  confunde. Es la misma familia que el `/////` que no distinguía *«nadie lo cableó»* de *«no se
  llegó»*: el símbolo no miente sobre un valor, miente sobre **por qué**.
- ⚠ **La reserva del cierre se mide, no se elige.** Si la reserva no cubre el cierre completo, el
  corte ordenado **igual muere en el muro** y toda la maquinaria de corte no sirve para nada. Un
  número elegido a ojo que nadie vuelve a mirar es indistinguible de uno correcto hasta el día que
  no alcanza — así que el cierre se cronometra y el reporte avisa cuando no entra.
- ⚠ **Y el mismo día, la mitad barata del mismo problema: un techo declarado en dos lugares es un
  techo que puede mentir en uno de los dos.** El panel tenía `var TECHO_S = 350` escrito en el HTML
  mientras el motor leía `150` de la hoja, así que **la regla del cronómetro dibujó una escala hasta
  350 y el contador pasó el techo real sin ponerse en rojo**. Mintió justo en el lugar que la persona
  mira. Es `CLAUDE.md` §2 en su forma más literal, y el arreglo es que el front pregunte en vez de
  contestar — la misma corrección que el `|| S.faltantesComoRaya` del 20/08.

**Cuando un paso se parte en dos, hay que preguntar de qué mitad cuelga el estado.** Partir
«expandir y resolver» en dos operaciones es correcto; lo que no se ve es que **el marcado de
«hecho» se queda pegado a la primera mitad** y pasa a mentir. El 20/08 la corrida desatendida
expandía tres secciones, resolvía cero y **marcaba las tres `hecha`** — el deck salió con todos los
tokens crudos y el plan decía que estaba completo.

- **Por qué no se ve al partir:** antes de partir, las dos mitades eran la misma llamada y
  cualquiera de las dos señales servía. El corte las separa **y las dos siguen compilando**.
- ⭐ **La pregunta concreta, y hay que hacérsela al partir, no después:** *¿qué campo del resultado
  prueba que la SEGUNDA mitad ocurrió?* Si la respuesta es el mismo que antes, el estado quedó del
  lado equivocado. Acá `repetibles.secciones` es el reporte de expansión y `repetibles.items` el de
  resolución — **dos campos del mismo objeto**, y el marcado leía el primero.
- ⚠ **El síntoma no es un error: es un estado que dice «terminado» sobre trabajo que no se hizo**,
  y todo lo que viene después lo cree. La huella que lo delató fue una columna de tiempos **vacía**
  en filas marcadas `hecha`.
- ⭐ **Y la defensa, cuando el mecanismo corre solo: un invariante que ligue las dos mitades.** Acá
  es `corte ⇒ pendientes ≥ 1` — *«no terminé»* y *«no queda nada»* no pueden ser ciertas a la vez.
  ⚠ **Tiene que ser automático:** entre el corte y la continuación pasa **un minuto**, así que
  cualquier guarda que dependa de que alguien mire y cancele **no llega**.

**Una rama nueva que nunca se ejecutó no está sin probar: está sin escribir el control.** Las dos
cosas se ven igual en un tablero de suites verdes, y son opuestas. *Sin probar* es código que un
control mira y todavía no cubre del todo; *sin control* es código que **ninguna afirmación toca**, y
ahí el verde de al lado no dice absolutamente nada sobre él.

- **El caso, medido el 21/08/2026:** el retorno de `generarInformeConCache_` resolvía el deck con
  `copia.getName()`, y `copia` **sólo se asigna en la rama que copia la plantilla**. Al continuar un
  deck quedaba `undefined` y tiraba `TypeError` **fuera del `try/catch`** — o sea que **la
  reanudación real no podía terminar nunca**. Vivió desde el 20/08 con las **tres** suites del repo
  en verde: 18 afirmaciones del planificador, 14 de `resueltas`, 17 del reloj. **Ninguna tocaba esa
  rama.**
- ⚠ **Y lo que lo hizo indetectable no fue la falta de corridas, sino que la única corrida real
  salió por otro camino.** La corrida desatendida del 20/08 terminó por *«no quedan secciones
  pendientes»*, que **devuelve antes de llamar a `generarInforme`**. O sea: el mecanismo *se probó*,
  y la prueba pasó sin ejecutar una línea de lo que se había agregado. **Una corrida que termina
  bien es evidencia sobre el camino que tomó, no sobre la función que la contiene.**
- ⭐ **Lo accionable, y es una pregunta que se hace al agregar la rama, no después del primer
  incidente:** *¿qué afirmación existente falla si esta rama nueva no funciona?* Si la respuesta es
  «ninguna», el trabajo no está terminado, por más que el código esté escrito y pusheado. **El
  control mínimo es que la rama VUELVA** — ni siquiera que haga lo correcto: el bug de acá lo
  habría cazado una sola afirmación que dijera *«continuar sobre un deck existente devuelve `ok`»*.
- ⚠ **Y el corolario que hace falta al lado, porque el banco recién escrito cae en él:** un
  `ok: true` puede convivir con un fallo adentro. `generarInforme` **atrapa las excepciones a
  propósito** —así la fila de `CORRIDAS` cierra igual— y devuelve `ok: true` con el `fallo` en el
  resultado. El primer intento del control nuevo pasó **seis afirmaciones sobre un recorrido que
  murió en la etapa 2** por un stub de menos. **Un control de «vuelve» tiene que afirmar también
  que volvió sin fallo y sin corte**, o mide que la función existe.
- **El barrido va con el arreglo, y no sólo la línea que falló.** Toda variable asignada en una sola
  rama de un `if/else` y leída después es el mismo error esperando, y **las dos ramas compilan**.
  Acá el barrido dio **una sola** —`copia`— y ese cero medido también se escribe: un cero que nadie
  buscó no se distingue de «no miré».

**Inferir la identidad de algo por su contenido funciona hasta que el contenido cambia — y los dos
síntomas no se parecen entre sí, que es lo que hace cara la lección.** Cuando el motor deduce *qué
es* una cosa mirando *qué tiene adentro*, la deducción vale mientras el adentro sea distintivo. Deja
de valer por dos lados a la vez, y **parecen dos bugs distintos**.

- **El caso, medido el 21/08/2026.** `slidesModeloDe_` decidía a qué sección pertenece una lámina
  **por la familia de los tokens que lleva**. Salió mal en las dos direcciones posibles:
  - **Por defecto:** la lámina del "1 a 1" lleva 32 tokens `u1_`, **ninguna sección declara esa
    familia**, y entonces no pertenecía a nada — no se expandía, no se resolvía y **nadie la
    nombraba**. Estuvo así sin que ninguna verificación la señalara.
  - **Por exceso:** una copia sin pintar lleva los mismos tokens crudos que su modelo, así que
    **es indistinguible de un modelo** — la N² que multiplica las láminas en cada ronda.
- ⭐ **Son el mismo error con dos caras, y por eso el arreglo es uno solo:** que la identidad se
  **declare** en vez de deducirse. `D-37` la pone en `LAMINAS.seccion_id` y el modelo se resuelve
  por el ancla, no por lo que la lámina tiene adentro.
- ⚠ **Y la trampa al arreglarlo, que hay que MEDIR y no razonar:** el sustituto también puede
  viajar con la copia. Acá el ancla vive en las notas del orador y **`slide.duplicate()` copia las
  notas** — medido, no supuesto —, así que **resolver por `lamina_id` sobre un deck ya expandido
  devuelve copias y no mata la N² por sí solo**. Lo que la mata es **calcular el conjunto una vez,
  antes de la primera duplicación**. La otra salida —borrarle la marca a cada copia— se descartó
  con motivo: destruiría notas del orador legítimas.
- **La pregunta accionable, antes de escribir cualquier inferencia:** *¿qué pasa cuando el contenido
  que estoy mirando aparece donde no debería, y qué pasa cuando no aparece donde sí?* Las dos
  respuestas tienen que ser un reporte, no un silencio.

**Quien toca una función con control positivo corre los controles antes de cerrar.** No
alcanza con que pase el protocolo: `Pruebas.gs` existe justamente porque **el protocolo de
siete pasos del 2.11 pasa igual aunque los cinco controles estén mal** —cero cambios sigue
siendo cero cambios— y lo mismo vale para cualquier verificación end-to-end. Origen: 02/08.
La Parte E del 2.11 cambió `alinearSolapasLookerADinamico_`, se verificó contra la planilla
(el número dio bien) y **no se re-corrieron los controles**; el de `C.2-3` quedó fallando un
día entero, invisible, hasta que lo encontró el Paso 2.14 al correrlos por API.

**Un instrumento que mide un cambio no puede depender de lo que el cambio modifica.** Van
**tres casos en dos días** y los tres se ven igual: el criterio se escribe mirando el estado de
**hoy**, y el instrumento existe para medir el paso a **mañana**.

- **El gate de `D-32`** se probó contra el caso que lo motivó —una degradación— y no contra el
  que lo rompía: una fila que **no existe**. Las siete afirmaciones daban verde mientras el alta
  no entraba.
- **El testigo del piloto** agrupaba los marcadores exigiendo que **difirieran en el `filtro`**.
  Migrados, el corte pasó a `dimensiones` y los ocho comparten `filtro` — **el instrumento dejó
  de verlos justo después de migrarlos**, devolvió 14 de 22 y nada falló.
- **La migración** escribió `filtro` y no `dimensiones` porque la columna no existía: media
  operación de dos pasos, con el sistema en un estado que ninguno de los dos lados contempla.

**Lo accionable:** antes de escribir un instrumento que va a correr **antes y después** de un
cambio, preguntarse **qué de lo que estoy usando para identificar lo que mido va a cambiar**. Si
el criterio menciona la cosa que se migra —la columna, el nombre, el prefijo—, el instrumento
mide una sola de las dos fotos. **El síntoma nunca es un error: es un conjunto que se achica sin
que nadie lo pida.**

**Un cambio de seed no existe hasta que se empuja, y el sembrador no tiene forma de decirlo.**
Van **dos casos en una semana**, con el **mismo síntoma** —*la corrida termina bien y la hoja no
se mueve*— y **causas distintas**:

- **15/08, las 20 solapas: era la corrida equivocada.** `instalar()` **no siembra** —crea/repara
  hojas y aplica `COLUMNAS_DELTA_`—; el que siembra es el ítem de menú **Aplicar configuración**.
- **16/08, `INFORMES.periodicidad`: era código sin pushear.** El seed se corrigió en el repo y
  `clasp push` había corrido **antes** de esa edición. Verificado bajando el proyecto con
  `clasp pull` a un temporal: seguía diciendo `mensual`.

**En los dos el sembrador informó la verdad sobre lo que tenía delante**, y en los dos **la
conclusión rápida habría sido "el sembrador está roto"** — que era falso, y perseguirla habría
costado el día.

- **Lo accionable, antes de acusar al sembrador:** verificar **qué versión corrió**. Que el repo
  tenga el valor bueno no dice nada; lo que importa es qué tiene el proyecto de Apps Script.
  `clasp pull` a un directorio temporal lo responde **sin pisar nada** y en dos comandos.
- **Y la regla de higiene que lo evita:** `clasp push` **después** de tocar un `.gs`, no antes de
  la próxima tanda de ediciones. Un push que corrió antes del cambio es indistinguible de uno que
  no corrió.
- ⚠ **El corolario que hace falta saber igual: que el seed llegue no garantiza que la hoja
  cambie.** Hay dos hojas donde una corrección **nunca** llega —`CONFIG` y `SECCIONES`, que sólo
  siembran lo ausente—. La tabla de qué se propaga y qué no vive en `docs/ESCRITORES.md`, y es lo
  primero que hay que mirar antes de corregir un valor en un `SEED_*`.

**Y su contracara, que es la mitad que faltaba: la comparación no puede depender de lo que se
mueve solo.** Un testigo sirve si la única diferencia entre las dos tomas es el cambio que se
está midiendo. Cuando la fuente se mueve por su cuenta —`looker` recalcula, y el 15/08 movió
138.427 impresiones en 1h45 y dejó un numerador en **cero**— un valor distinto **no dice nada**,
ni a favor ni en contra.

- ⚠ **Y la pregunta correcta no es «¿está quieta la base?» sino «¿se mueve DENTRO del intervalo
  de la verificación?»** (17/08/2026). Las dos se confunden fácil y llevan a conclusiones
  opuestas:
  - **`digital` parecía quieta y no lo está**: su universo creció de 2.239 a 2.241 en 13 horas.
    Lo estable era **la ventana cerrada de julio**, que es lo único que la comparación miraba.
  - **`rdv` no necesita canario aunque no tenga ninguno posible.** La verificación corre
    **testigo → migración → testigo en la misma sesión**, con **minutos** entre tomas — y dos
    lecturas separadas **12 horas** dieron idénticas. En cinco minutos no cambia; y si cambiara,
    **las cuentas de filas lo delatarían**.
  - **La consecuencia práctica:** una base que se mueve **no** bloquea la verificación si el
    intervalo es corto. Lo que bloquea es comparar contra un testigo **de otro día** — que es lo
    que pasó en el piloto, y por eso allá el canario sí hizo falta.
  - **Y el corolario para elegir controles:** los que dependen del **universo completo** se mueven
    entre tomas; los que viven **dentro de la ventana** no. Un `RESTO` que cambia no acusa a la
    migración hasta haber mirado si creció el universo.
- **Cuando el intervalo es largo, la forma barata es un canario: un valor que el cambio NO
  toca.** En el piloto de `D-33` es `gcba_frecuencia` —sin migrar, de otra
  solapa— y ya viene en el log de cada corrida: mientras dé `0`, la base está en tránsito y la
  comparación no se lee.
- **Un canario propio cuesta menos que cualquier verificación escrita**, y mide mejor: es el
  mismo camino de lectura que lo que se está comparando.
- **Lo que distingue "se rompió" de "la base se movió" es la cuenta de filas, no el valor.**
  Mismas filas y otro número es el cambio; otras filas es la fuente. El 15/08 las ocho cuentas
  fueron idénticas —46, 313, 14, 12, 20, 82, 84, 147— con valores muy distintos, y eso solo
  descartó la migración como causa.

**Una corrida que no hizo nada tiene que fallar, no informar cero.** Van **dos casos** con el
mismo modo de falla: la corrida termina bien, la hoja no se mueve, y **el reporte sigue con el
paso siguiente como si hubiera pasado algo**. El 15/08 fue el alta de las 20 solapas; el 17/08,
`migrarTanda4DeFrecuencia()` informó *"0 celda(s)"*, imprimió cómo leer la Parte C, y los dos
testigos dieron idénticos **porque en el medio no hubo migración**.

- ⚠ **Lo que hace caro este caso es que el cero se disfraza de éxito justo donde el criterio es la
  igualdad.** *"Los dos testigos coinciden"* es la definición de tanda cerrada. Una migración que
  no ocurrió **la satisface perfecto**, y ninguna verificación posterior la distingue.
- **La guarda va en el escritor, no en el llamador**, por el mismo motivo que la de todo-o-nada:
  protege a todos, no al que se acordó. `curarCamposMarcadores_` ahora devuelve `ok:false` con el
  diagnóstico por marcador —¿existe la fila?, ¿qué dice la hoja?, ¿qué se pedía?—, así que los
  once wrappers lo heredaron sin tocarlos y **dejaron de imprimir el paso siguiente**.
- **«Ya estaba aplicado» también falla, y es deliberado**: es idempotencia y no rotura, pero
  presentarla como éxito es exactamente lo que hizo que la tanda 4 se leyera como ejecutada.

**Un `⚠` en el medio de un reporte que termina en `✅` se lee como verde.** El testigo de la tanda
4 avisó *"sin operandos legibles"* **con la palabra correcta**, y abajo el bloque de la partición
cerraba con `✅ CIERRA`. **El aviso pasó inadvertido dos corridas seguidas.**

- **La combinación a evitar tiene nombre: un control principal en verde sobre un instrumento
  incompleto.** El que estaba roto era justo el que distingue *se movió el numerador* de *se movió
  el denominador*, en la tanda donde los valores son el dato débil.
- **Lo accionable: los avisos se acumulan y se imprimen ÚLTIMOS, después del veredicto**, y el
  bloque final dice **qué NO cubre** el verde de arriba. No alcanza con emitir el aviso; hay que
  ponerlo donde termina la lectura.

**Un testigo que no mide el cambio no es testigo del cambio, por más que dé verde.** Van **tres
casos** y el tercero es el más limpio: el gate de la Parte B del `2026-08-19_1` comparó
`testigoDeFrecuencia()` antes y después de declarar `campo_id_cuenta`, y **los dos salieron
idénticos byte a byte**. Eso satisface *"se aplicó y no rompió"* **y** *"no se aplicó"* —las dos
por igual—, así que el verde no distingue nada.

- **La causa es concreta y verificable, no una metáfora:** el testigo lee `SOLAPAS`… **no**, y ahí
  está todo. Imprime `traza`, y el aviso que delataría el caso —*"la solapa declara
  `campo_id_cuenta` y este marcador se emite SIN ítem"*— vive en `origen`, que **es otro campo y no
  entra en la traza**. El instrumento no puede ver lo que cambió aunque el motor lo esté diciendo.
- **Es la misma familia que las dos reglas de arriba**, con la diferencia que la hace peor: allá la
  corrida no hacía nada y **el reporte lo decía mal**; acá la corrida hace lo correcto y **el
  reporte no puede saberlo**. Un cero disfrazado de éxito se arregla haciendo fallar al escritor;
  esto no se arregla en el escritor.
- **Lo accionable, y es la pregunta que hay que hacerse ANTES de correr el par de testigos:** *¿qué
  campo de esta salida cambiaría si el cambio NO se hubiera aplicado?* Si la respuesta es
  «ninguno», el testigo mide otra cosa y **hace falta mirar la hoja a mano** — que es lo que se
  hizo el 19/08, y está bien que se haya hecho; lo que no está bien es no haberlo dicho.
- ⚠ **Y el corolario para quien escriba el próximo:** un testigo de una declaración de esquema
  **tiene que leer el esquema**, no sólo sus consecuencias. Comparar números para saber si una
  celda se escribió es medir el eco en vez de la voz.

**Y el control verde también se lee, porque una prueba puede probar lo contrario de lo que
dice.** `Pruebas.gs:456` afirmaba *"ULTIMO saltea la celda vacía del final"* sobre el fixture
`[10, 5, '']`. Pasaba desde el día que se escribió — y lo que verificaba era **"ULTIMO elige
por posición"**, porque `5` es el último valor no vacío y el dato satisface las dos
afirmaciones por igual. Se destapó el 12/08, cuando el `_39` cambió `opULTIMO` para que **no
elija** sin fecha utilizable: la prueba se puso roja diciendo que se había roto el salteo del
vacío, que seguía intacto.

- **Una prueba así es peor que no tenerla.** Una ausente deja el terreno libre; una que miente
  **bloquea el cambio correcto** y lo hace con la autoridad de un control que venía pasando. El
  costo no se paga cuando se escribe: se paga meses después, y lo paga otro.
- **La forma de detectarlo, que es lo único accionable:** un fixture cuyo dato satisface más de
  una afirmación no distingue entre ellas. La pregunta a un control verde no es *"¿pasa?"* sino
  **"¿con qué otro dato seguiría pasando, y qué afirmación distinta estaría probando ahí?"**.
  `[5, 5, '']` separa las dos: pasa con el salteo y es indiferente a la posición.
- **Cuando un control se pone rojo al cambiar una función, la primera pregunta es qué probaba
  de verdad** — no cómo hacerlo pasar de nuevo. Ajustar el fixture para que vuelva a verde es
  cómo se pierde el hallazgo.
- **Y la variante más barata de cometer: un fixture inventado en vez de copiado.** El 17/08 la
  prueba de `operandosDeRatio_` usaba `RATIO dig_impresiones/alcance = …`, deducido del *template*
  de `opRATIO`; la traza real es `RATIO dig_impresiones (col H)/alcance (col K) = …`, porque el
  despachador arma los nombres con la columna pegada. **El fixture y el código compartían el mismo
  supuesto falso**, así que no había dato que los distinguiera y las seis afirmaciones daban verde
  sobre un extractor que **no matcheaba nada en producción**.
  - **La regla operativa: un fixture de formato se COPIA de una salida real, nunca se deduce del
    código que lo emite.** Deducirlo prueba que sabés leer el template — que es justo lo que no
    hace falta verificar.
  - **El síntoma, otra vez, no es un error:** el instrumento informó *"cambió el formato de la
    traza"*, que es lo que hay que decir cuando el formato cambió, **con el texto correcto tres
    líneas más arriba en el mismo log**. Un instrumento no puede distinguir *"el mundo cambió"* de
    *"yo lo estoy leyendo mal"*: esa pregunta la tiene que hacer quien lee.

**Un comentario que afirma un contrato es una premisa sin testigo.** `Reuniones.gs` declaraba
*"`leerReuniones_()` … mismo contrato que `leerCampanas()`"*. **Era falso**: `leerReuniones_`
devolvía una **lista** y `leerCampanas` un **mapa indexado** que **perdía filas repetidas en
silencio**. La línea sobrevivió porque **nada la contradecía** — describía el diseño que se quería,
no el que había, y no existe nada que compare un comentario contra el código que acompaña.

- **Es la misma familia que la regla del instrumento**, un escalón más abajo: allá el criterio se
  escribe mirando el estado de hoy y deja de medir cuando el estado cambia; acá la afirmación
  **nunca fue cierta** y igual duró, porque un comentario no falla nunca.
- **Lo accionable, y es barato:** cuando un comentario afirma que **dos cosas se comportan igual**
  —mismo contrato, mismo formato, misma forma de retorno—, **abrí las dos**. Es la única
  verificación posible y toma un minuto. Un comentario que dice *"igual que X"* es una invitación a
  no mirar X, que es exactamente lo contrario de lo que debería producir.
- ⚠ **Y el que más engaña es el que se vuelve cierto solo.** Éste lo es **desde el 18/08**, cuando
  `CAMPANAS` pasó a leerse como lista. Si alguien lo mira hoy, verifica y confirma, **no se entera
  de que estuvo mintiendo meses** — y el hallazgo, que era que las dos hojas divergían, se pierde.

**Un test puede acertar el hecho y errar la inferencia.** `getFormulas()` sobre las dos
hojas de `looker` devolvió bien "esta tiene fórmula"; la conclusión "por lo tanto deriva
de la otra hoja del par" era falsa — la fórmula era un `QUERY()` sobre una **tercera**
hoja, y la clasificación quedó invertida hasta el Paso 2.9 Parte C. El texto de la fórmula
estaba disponible desde el 2.8: faltó mirarlo antes de aceptar la etiqueta. Cuando un
instrumento devuelve una **etiqueta** (`derivada`, `plausible`, `ok`), verificar el dato
crudo del que salió, no la etiqueta.

**Y el corolario del instrumento propio: convertir antes de mirar el tipo destruye el tipo.**
Una celda de Sheets llega tipada —`boolean`, `number`, `Date`, `string`— y un `String(celda)`
puesto para "normalizar" antes de inspeccionarla **disfraza un booleano de texto**: `true` se
vuelve `"true"`, y un conteo de `typeof v === 'number'` da cero sobre una columna que el motor
suma perfecto, porque `Number(true) === 1`. Origen: 09/08. Así nació el hallazgo *"los seis
`pauta_*` publican un cero falso"*, que era falso —publican `1`, con estado `ok`— y **llegó a un
prompt antes de que nadie lo verificara contra el motor**.

- **La regla operativa:** antes de afirmar que una columna "no es numérica" o "viene vacía",
  mirar `typeof` **sobre el valor crudo**, y contrastar contra lo que el motor lee de esa misma
  columna. Son dos instrumentos y tienen que coincidir; si no coinciden, el equivocado suele ser
  el de afuera.
- ⚠ **Y volvió a pasar el 20/08, dentro de un VERIFICADOR, que es donde más caro sale.**
  `verificarAlcanceDesatendido()` filtraba con `String(b.activo).toLowerCase() !== 'sí'` y
  `leerRegistro_` devuelve `activo` **ya booleano** (`Config.gs`, `esVerdadero_`): `String(true)` es
  `'true'`, así que **descartó las cinco bases en silencio** y la función **emitió veredicto igual**.
  Los otros seis lectores del repo usan `if (!base.activo || …)` — el único que convirtió fue el que
  verificaba.
- ⭐ **Lo accionable que faltaba, y es la regla nueva: un control tiene que declarar CUÁNTO midió.**
  «Ningún problema» y «no se probó nada» se ven idénticos en un log sin conteo. **Cero unidades
  verificadas es un problema, no un silencio**, y el log dice `n de m`. Sin eso, el verde de un
  control se cita como evidencia de algo que nunca se ejecutó.

- **Es el mismo error que `looker ilegible entero`** del 08/08 —una llamada mal construida leída
  como propiedad del dato— y por eso van juntos: **cuando la medición propia contradice al motor,
  la primera hipótesis es que la medición está mal**, no el motor.

**Pero eso tiene un borde, y sin el borde la regla sirve para tapar bugs reales.** Lo que los tres
casos —`looker ilegible`, `String(celda)` sobre booleanos, `ignorar bloquea la lectura`— tienen en
común **no es "medí por fuera del motor"**: es que **el instrumento propio reproducía lógica que
el motor ya tenía** —parsear una fecha, leer un tipo, resolver un `uso`— **y la reproducía peor**.
Ahí el motor gana, siempre.

- **El motor NO gana cuando la medición es de su salida contra un hecho externo.** Ahí es el
  sospechoso, y hay precedentes: `parsearFiltro_` sin `contiene`, `leerReuniones_` sin filtro por
  `periodo_id`, los seis `pauta_*` sin `filtro`. **Ninguno de los tres se habría encontrado con la
  regla aplicada sin este borde.**
- **La pregunta que separa los dos casos:** ¿estoy reimplementando algo que el motor ya hace, o
  estoy comparando lo que el motor publicó contra algo que él no puede saber? Lo primero es un
  error de instrumento; lo segundo es cómo se encuentran los bugs.

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
docs/CATALOGO_tokens.md             qué mide cada token — salida de tools/catalogo.js, no se edita
docs/PENDIENTES_consistencia.md     inconsistencias abiertas
docs/Prompts/                       Paso-N / DOC-N / AUD-N
docs/BITACORA.md                    qué hizo cada paso (append-only, solo Code)
docs/HANDOFF_CODE.md                estado actual (se reescribe, solo Code)
docs/REGLAS_NEGOCIO.md              reglas del dominio, ID R-NN
docs/SUPUESTOS.md                   supuestos asumidos, ID S-NN
docs/ESCRITORES.md                  quién escribe cada hoja de registro (vivo)
docs/INVENTARIO_CODIGO.md           foto del código al 01/08 (congelado)
docs/_snapshots/                    volcados fechados de las hojas de registro (tools/snapshot.js)
docs/Sesiones/                      handoffs bajados de claude.ai — Code no escribe acá
tools/                              scripts de verificación independiente
                                    (`listas.js` chequea que las tres listas de hojas coincidan)
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
| ¿Cómo se elige el universo de encuentros de un informe? | **`R-21` y sólo ahí** — la cascada de tres niveles con sus addenda. **No se copia acá**: duplicarla garantiza que las dos versiones se separen, que es lo que ya pasó entre `R-16` y `R-17`. Esta fila es el puntero, no el contenido | los dos |
| ¿Qué supuesto se está asumiendo? | `docs/SUPUESTOS.md`, ID `S-NN`, ídem | los dos |
| ¿Cómo se llama este token? | `docs/TOKENS.md` | los dos |
| ¿Qué mide cada token, de dónde sale y con qué operación y filtro? | **`tools/catalogo.js`, re-corrido** — nunca el `.md`. `docs/CATALOGO_tokens.md` es su salida y **declara en la primera línea de qué snapshot salió**: es evidencia fechada, mismo criterio que `inventario.js` y `escritores.js`. Distinto de `TOKENS.md`, que responde **cómo se llama** y dónde se usa; esto responde **qué es**. ⚠ **Su columna `config` dice sólo que la configuración resuelve** — no que el token publique bien, y menos que el número salga de las filas correctas | los dos; el `.md` no se edita, se regenera |
| ¿Qué inconsistencia documental sigue abierta? | `docs/PENDIENTES_consistencia.md` | los dos |
| ¿Qué se le preguntó al equipo y sigue sin respuesta? | `docs/PENDIENTES_consistencia.md`, sección propia "Preguntas al equipo" (nacen en docs congelados como `VALIDACION` §7; al congelarse el doc, la pregunta viva se copia ahí) | los dos |
| ¿Qué número dio una medición y contra qué se verificó? | `docs/VALIDACION_*.md` + su CSV de casos — congelados, uno nuevo por corrida de validación | nadie edita; se crea uno nuevo |
| ¿Qué decía una hoja de registro en una fecha dada? | `docs/_snapshots/AAAA-MM-DD_<hoja>.*`, generados por `tools/snapshot.js`. **Se versionan, y por eso existen**: el "snapshot del 11/08" se venía citando en cuatro documentos **como si fuera de hoy** porque no estaba en el repo y nadie podía mirarle la fecha. Un snapshot es **evidencia fechada** — al entrar uno nuevo, se revisa que ningún documento vivo cite cifras del viejo sin decir de cuándo son | nadie edita; se crea uno nuevo |
| ¿Qué corridas de Apps Script están esperando, y qué destraba cada una? | `docs/CORRIDAS_pendientes_AAAA-MM-DD.md` — **una sola lista, ordenada por lo que destraba**. Nace de una corrida nocturna y **se consume**: cuando sus ítems se corrieron, el documento queda como evidencia congelada y el siguiente lo reemplaza. Distinto de `PLAN.md`, que ordena **frentes**: esto ordena **botones que hay que apretar** | los dos |
| ¿Qué solapas tiene una base, con qué forma, y cuáles registra `SOLAPAS`? | `docs/CENSO_solapas_*_AAAA-MM-DD.md` — congelado, uno nuevo por corrida de censo. **Existe porque un censo que sólo vive en un reporte no se puede citar ni verificar**, y así se perdió el de la Parte A2 del `2026-08-14_1`: cuando el alta fue a escribirse, el repo nombraba 3 de 20 solapas. Es la evidencia que un alta de `SOLAPAS` **cita**; no clasifica —eso es del alta— y envejece como cualquier medición: para saber qué hay hoy se re-corre `censarSolapasParaAlta()` | nadie edita; se crea uno nuevo |
| ¿Con qué `Id cuentas` se identifica una campaña, y por qué no por nombre? | `docs/CENSO_ids_campanas_AAAA-MM-DD.md` — congelado, uno nuevo por corrida. **Existe porque el nombre NO sirve como clave**: cuatro solapas dan cuatro grafías, ninguna igual a la del deck, y una fila de `Directa Mail` trae el nombre de **otra** campaña. Es la evidencia que una carga de `CAMPANAS` **cita**; no decide qué campañas van —eso es del usuario— y envejece como cualquier medición | nadie edita; se crea uno nuevo |
| ¿Dónde se va el tiempo de una corrida, y por qué no entra en el techo? | `docs/AUDITORIA_tiempos_AAAA-MM-DD.md` — congelado, uno nuevo por auditoría. **Existe porque el rastro de etapas vive en una celda que el cierre pisa** y sin volcarlo no se puede citar: la del 21/08 mide que **la etapa 3 se lleva el 62-88 %** y que **cada asignación resuelve los 111 marcadores del informe para usar 15**. Distinto de `VALIDACION_*`, que mide **números** contra las bases: esto mide **segundos** contra el techo | nadie edita; se crea uno nuevo |
| ¿Qué dio una corrida de protocolo de prueba y contra qué se verificó? | `docs/PROTOCOLO_*_corrida_*.md` — congelados, uno nuevo por corrida. Distinto de `VALIDACION_*`: eso mide números del informe contra las bases, esto verifica el comportamiento del motor contra un protocolo escrito | nadie edita; se crea uno nuevo |
| ¿Cómo se opera / se corre algo? | `docs/RUNBOOK.md` — setup y ciclo de desarrollo | los dos |
| ¿Qué hace una persona para sacar el informe de la semana? | `docs/PROCESO_SEMANAL.md` — la secuencia de uso, de la lista de WhatsApp al deck, con cada paso marcado **[hoy]** o **[falta]**. Distinto del RUNBOOK: ése cubre el setup y el desarrollo, éste el uso. Es además la especificación del panel, que es esta secuencia con botones | los dos |
| ¿A qué URL le pego, con qué cuenta, y dónde vive esa credencial? | `docs/ENTORNO.local.md` — **fuera de git** (Paso 1.8). Ningún otro documento repite una URL o una cuenta: el RUNBOOK explica la operatoria y apunta acá. **Frontera** (Paso 2.15): son credenciales y URLs de acceso, no identificadores de recursos que ya viven en los seeds — un ID de carpeta de Drive está en `SEED_CONFIG_DEFAULTS_`, que está en git, así que esconderlo acá no lo protege: sólo lo saca de la vista de claude.ai, contra el corolario del final de esta tabla | los dos |
| ¿Qué es cada carpeta de Drive y para qué sirve? | `docs/RUNBOOK.md`, tabla "Las carpetas de Drive": rol, ID, nombre real, cuenta dueña y quién la lee. Distinto de las dos filas de configuración: ésas dicen qué valor usa el motor, ésta dice qué es cada recurso | los dos |
| ¿Qué decisión editorial lleva cada informe? (qué campañas, qué va a mano) | `docs/CONFIG_INFORMES.md` | los dos |
| ¿Qué debe cumplir una lámina nueva pedida en lenguaje natural? | `docs/OBJETIVO_lamina_nueva.md` | los dos |
| ¿Qué decía una nota del orador que se borró de una plantilla? | `docs/NOTAS_ORADOR_SECCO_8_y_25.md` — evidencia congelada. Son las **dos únicas** notas del equipo de las dos plantillas (`SECCO` 8 y 25); se copiaron acá y se borraron de la plantilla **antes** de que el `_11` sellara, porque el sellado escribe en esa misma área | nadie edita |
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
