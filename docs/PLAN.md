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

---

## 2 · Próximo (ordenado, con dependencias)

1. **Tramo 1 — cerrar configuración.** Sale cuando el diff da cero ruido.
   - Dar acceso de lectura a `reporteseinformesgcba` sobre las cuatro bases (`D-02`).
     **No depende de terceros**: las cuatro son cuentas del usuario y se comparten sin
     pedirle permiso a nadie (corregido el 02/08/2026 — ver la nota bajo `D-02`).
   - ~~Abrir el P1 del tercer escritor de `MAPEO` (`consolidarMapeoLooker_`)~~ — **hecho
     02/08/2026** (Paso 2.11 Parte E): retirado del menú junto con el diagnóstico que le
     pasaba la dirección invertida. `MAPEO` vuelve a dos escritores de contenido vivos.
     Dejó abierto un P1 nuevo, que **no** es de este tramo: la inferencia invertida de
     `auditarFormulasResumenesLooker_`.
   - `Paso-2.12` Parte 2 — las 17 disposiciones de `SOLAPAS.uso`. Las diez líneas
     `protegida (habría cambiado)` son la lista de trabajo y son todas de `SOLAPAS`.
   - Generalizar `hayUi_()` — desbloquea correr el protocolo entero por API.
   - `periodo_id` en `CAMPANAS` y `REUNIONES` (`D-08`).
   - Repuntar `carpeta_salida` a reportes (`D-03`).
   - **Registrar M2** con los parámetros validados el 01/08: `modo_periodo` de `snapshot` a
     `filtrar`, `fecha_periodo` → `Fecha envio` de la solapa `Directa mail`, y excluir
     `Estado = Proyectado`. Es la **primera medición de `D-01`** (eje "base nueva").
     *Predicción a anotar antes de correrla:* las dos primeras son config; excluir
     `Proyectado` probablemente no lo sea, y si es así ése es el primer renglón de la lista
     de "por qué hubo que tocar código".

2. **Tramo 2 — corte vertical, JM solo.** Pasos 3, 4 y 5. Se hace contra JM únicamente:
   construir los dos en paralelo impide después distinguir qué necesitó código y qué salió
   solo. **`Paso-4.md` se revisa antes de ejecutarlo** — está escrito y casi seguro asume
   copiar-y-reemplazar sin registrar la configuración de la corrida (`D-06`).

3. **Tramo 3 — prueba de motor.** SECCO, midiendo líneas de `.gs` tocadas. Es el paso que
   valida la tesis del proyecto; si falla, lo que salga es el trabajo real del tramo
   siguiente.

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
| Ventana jueves-a-jueves de M2 | confirmar con una segunda semana; hoy hay **un solo caso observado** | equipo |
| Qué regla selecciona los envíos de M2 dentro de la ventana | no es la marca `M2` ni la fecha; si es curaduría manual, hace falta registro a nivel `ID MailUp` | equipo |
| La lámina dice 18 envíos y 11 campañas; el número sale de 10 envíos y 3 campañas | preguntar quién armó la lámina | equipo |
| Etapa 2: actualizar el deck en sitio (`D-06`) | el mapa `token → objectId` de la etapa 1, más decidir qué hace el motor cuando una caja registrada ya no está | interno |
| `D-16` · acceso por usuario a informes y datos | resolver la pieza 3: cómo se sostiene la restricción sobre archivos de Drive y bases, no sólo sobre el panel. Requiere el panel construido (`D-04`) para probar contra algo real | interno |

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
