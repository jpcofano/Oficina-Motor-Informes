# REGLAS DE NEGOCIO

> Supuestos del dominio que el motor da por ciertos. Cada uno tiene ID estable.
> Si una regla se cae, se marca como **derogada** con fecha — no se borra.
>
> **Este archivo es el canon.** Una regla citada en cualquier otro documento con un ID
> distinto al de acá está vencida, no es una segunda opinión — ver la nota de renumeración
> al final.

## R-01 — Un encuentro por Figura por día

**Enunciado:** en la base RDV, cada Figura (columna A) registra como máximo un
encuentro por día. No existen dos filas con la misma Figura y la misma fecha.

**Origen:** regla operativa del equipo. Confirmada el 30/07/2026.

**Clave implicada:** el par (`Figura`, `fecha_periodo`) identifica unívocamente una
fila de RDV. Contar filas dentro de una ventana equivale a contar encuentros; no hace
falta deduplicar por día.

**Cómo se verifica:** agrupar RDV por (columna A, columna de `fecha_periodo` según
`MAPEO`) y contar grupos con más de una fila. Tiene que dar cero.

**Si falla:** el exceso son duplicados de carga o la regla cambió. No se ajusta el
cálculo en silencio: se reporta el conteo de violaciones y se decide con el equipo.
Un doble registro no detectado infla los totales sin fallar.

## R-02 — Criterio de fuente cruda (exclusión de solapas)

**Enunciado:** una solapa es fuente cruda si el encabezado está en la fila 1 y no hay
ningún período escrito a mano arriba de los datos. Si el período vive en la hoja (banner
tipo "Periodo: dd/mm — dd/mm" y encabezados reales más abajo), lo que devuelva depende de
lo último que tipeó una persona: un informe de julio puede salir con el recorte de mayo
**sin fallar**. Eso no es una fuente, es el resultado del proceso manual que el motor
viene a reemplazar — mismo tipo peligroso que las fechas hardcodeadas de SECCO.

**Origen:** Paso 2.3.3, a partir de las copias de trabajo y vistas con banner encontradas
al correr `detectarColumnasFecha()` sobre `rdv`/`digital`/`m2` el 30/07/2026. Detalle
completo en `docs/FECHAS_seleccion.md` ("Criterio de exclusión").

**Cómo se aplica:** dos mecanismos en `Fechas.gs`, según qué tan resuelta está la base.

- `SOLAPAS_EXCLUIDAS_` (lista negra) para bases con solapas todavía "sin decidir" —
  `rdv` (4 copias de trabajo/backup) y `digital` (2 vistas con banner). Cubre lo ya
  identificado; lo que falta decidir sigue en `docs/FECHAS_seleccion.md` ("Sin decidir").
- `SOLAPAS_PERMITIDAS_` (lista blanca) para bases donde `MAPEO` ya está sembrado sin
  ambigüedad y se sabe con certeza cuáles son las únicas solapas reales — hoy `m2`:
  `MAPEO` (`Instalar.gs` `SEED_MAPEO_`) solo referencia `M2 periodo DIRECTA` y
  `M2 periodo DIGITAL` para las 14 filas de `m2_*` (ver `docs/MAPEO_completo.md` "M2"),
  así que cualquier otra solapa del libro (vistas con banner u otras) queda afuera sin
  necesidad de enumerarlas por nombre — no había que adivinar cuáles son las de banner,
  alcanzaba con mirar qué solapas usa `MAPEO` de verdad.

**Si falla:** para lista negra, agregar la solapa nueva a `SOLAPAS_EXCLUIDAS_[base_id]` y
documentar el motivo en `docs/FECHAS_seleccion.md`. Para lista blanca, si `MAPEO` suma una
solapa nueva para esa base, sumarla a `SOLAPAS_PERMITIDAS_[base_id]`. Nunca se decide por
heurística (p. ej. "toda solapa con 'Copia' en el nombre"): una copia de trabajo sin ese
patrón pasaría desapercibida.

## R-03 — Rango plausible de una columna de fecha

**Enunciado:** una columna candidata a `fecha_periodo` con fechas anteriores a **2015** o
posteriores al **año actual + 2** se marca como `rango_plausible = no` en `DIAG_FECHAS`
(no se excluye — la marca es para que el humano la mire antes de elegirla).

**Origen:** Paso 2.3.3, parte C. La regla agarra dos casos reales encontrados el
30/07/2026: las columnas `HORA`, que Sheets guarda internamente como fecha `1899-12-30` y
por eso clasifican como candidatas `FECHA`; y un valor con año `20206` (tipeo de carga) en
`digital / Directa Mail` columna F, que invalida cualquier cálculo de rango sobre esa
columna. `2015` es el piso porque no hay datos del proyecto anteriores a esa fecha;
año+2 en vez de un tope fijo para no tener que tocar la regla cada año.

**Cómo se verifica:** correr `detectarColumnasFecha()` y mirar `DIAG_FECHAS`, columna
`rango_plausible`. Las columnas `HORA` y `digital/Directa Mail` col F (mientras no se
corrija el `20206` en la base) tienen que salir `no`.

**Si falla (una columna elegida sale `no`):** no promoverla tal cual — corregir el dato de
origen (el tipeo) o descartar la columna como candidata de `fecha_periodo` y buscar otra.

## C-01 — La plantilla es del equipo, el motor se adapta

**Enunciado:** el equipo edita el diseño en Google Slides; el motor lee lo que el
equipo tiene, nunca al revés. `INFORMES.plantilla_id` es la única verdad sobre qué
archivo usa cada informe — si hay dos candidatos, no se elige por criterio técnico: se
pregunta. El motor solo escribe sobre la plantilla en una migración explícita (una
armonización de tokens), nunca en una corrida normal — la generación semanal copia la
plantilla y escribe sobre la copia. Toda migración que escribe sobre la plantilla hace
backup antes: es un archivo compartido y editado por otras personas.

**Origen:** Paso 2.2.2, tras encontrar dos presentaciones JM distintas en Drive (mismo
nombre, distinto orden de slides) donde `INFORMES.plantilla_id` apuntaba a la que no
usa el equipo. Detalle completo en `Plan Inicial/PROYECTO.md` §6.

**Cómo se verifica:** `INFORMES.plantilla_id` coincide con el ID que el equipo
reconoce como su plantilla viva (confirmarlo con el equipo, no por inspección técnica
del archivo). Toda función que escribe sobre una plantilla (`armonizarPlantillas()`)
aborta esa presentación si el backup falla, en vez de escribir sin red.

**Si falla:** si aparece una plantilla nueva o dudosa en la carpeta de
`CONFIG.carpeta_plantillas`, no se asigna a `INFORMES.plantilla_id` por descarte —
se pregunta cuál es la real y la otra se marca `[OBSOLETA — no usar]` en Drive (no se
borra: puede servir de referencia).

### Suspensión acotada — 14/08/2026: durante el desarrollo, la plantilla es del motor

**`C-01` NO se deroga.** Vuelve a regir en producción, y todo lo de arriba sigue vigente:
backup previo obligatorio, aborto si el backup falla, y ninguna caja se mueve ni se
reescribe.

**Qué suspende, y sólo eso:** la autorización expresa del usuario del 14/08 permite
**retirar una lámina** de la plantilla, que no es una armonización de tokens y por lo tanto
**no estaba cubierta** por la excepción de migración explícita que `C-01` ya contemplaba.

**Por qué se anota en vez de aplicarse en silencio:** armonizar **no necesitaba esta
autorización** —`C-01` ya la daba—; retirar una lámina sí. Confundir las dos cosas haría
parecer que `C-01` se aflojó, y no se aflojó.

**Alcance ejercido hasta hoy:** una lámina, la grilla de cinco ejes de M2 (slide 10 de la
plantilla canónica de JM), **escondida y no borrada** (`skipped`), con backup previo. Es
reversible en un clic y la evidencia queda a la vista.

#### Addendum 1 — 07/08/2026: el motor puede escribir las notas del orador para sellar el ancla

**Qué agrega, y sólo eso:** además de retirar una lámina, el motor queda autorizado a
**escribir las notas del orador de la plantilla** para sellar el ancla de identidad de
`D-23` — los campos `#lamina: L-NNN` y `#seccion: <seccion_id>`.

**Por qué hace falta escribirlo.** La suspensión de arriba autoriza **retirar una lámina** y
nada más; escribir las notas **no estaba cubierto** ni por ella ni por la excepción de
migración explícita de `C-01`, que habla de armonización de tokens. Verificado contra este
archivo antes de escribir este addendum, no supuesto.

**El motor anexa, nunca reemplaza.** Ninguna llamada a `setText` sobre las notas del orador
queda autorizada. La razón está medida el 07/08/2026: **dos láminas de `SECCO_marcada` ya
tienen notas escritas por el equipo** —la 8, con 285 caracteres de antecedentes de una
temática, y la 25, con 267 sobre conversación en X— y la 8 es además una de las láminas cuya
sección es ambigua. Pisarlas destruiría trabajo humano que nadie tiene copiado.

**Qué NO autoriza este addendum**, con todas las letras:

- **esconder o mostrar láminas** desde el motor (`setSkipped`) — eso necesita su propia
  autorización, y `D-23` la nombra como precondición de la Fase 4;
- **insertar o borrar láminas**;
- **mover o reescribir cajas**, ni en el cuerpo ni en las notas.

La dirección general —que durante el desarrollo la plantilla se administre por el motor—
queda escrita en `D-23`. **Acá la autorización crece por operación**, con su alcance ejercido
anotado, que es como está escrita la suspensión de arriba y lo que la hace verificable.

**Lo que no cambia:** backup previo obligatorio, aborto si el backup falla, ninguna caja se
mueve ni se reescribe, y **`C-01` vuelve a regir entero en producción**.

**Alcance ejercido hasta hoy:** ninguno. El sellador no está implementado — esta autorización
es su precondición, no su registro.

#### Addendum 2 — 07/08/2026: la autorización se acota a un solo campo

**Es un recorte, no una ampliación.** El `Addendum 1` de arriba autoriza escribir las notas
del orador para sellar **`#lamina: L-NNN` y `#seccion: <seccion_id>`**. El `Addendum 1 a D-23`
del mismo día dejó **sin función al segundo campo** —la clasificación se declara en la hoja
`LAMINAS`, no en el deck—, así que la autorización queda acotada a **`#lamina: L-NNN` y nada
más**. Escribir `#seccion:` en una plantilla **no está autorizado**, porque ya no existe como
campo del ancla.

**No se toca el texto del `Addendum 1`.** Siguen valiendo, sin cambio, su "qué NO autoriza"
—esconder o mostrar láminas, insertar o borrar láminas, mover o reescribir cajas—, su "el
motor anexa una línea, nunca `setText`", y su alcance ejercido, que **sigue siendo ninguno**:
el sellador no existe.

**La frontera con la limpieza del ancla, para que quede escrita.** La función que borra el
ancla de un informe generado **no entra acá y no necesita autorización de `C-01`**: actúa
sobre la copia, que es salida del motor y que el motor ya escribe entera. `C-01` protege la
**plantilla** — y la plantilla **no se limpia nunca** (`D-23`, addendum 1, punto 8).

#### Addendum 3 — 09/08/2026: se borró **una** de las dos notas del equipo, no las dos

> ⚠️ **Este addendum se escribió primero diciendo que se habían borrado las dos, y era falso.**
> Se corrigió el mismo día, minutos después, cuando el lector de notas de `B.0` lo midió contra
> la plantilla. La premisa venía del `11.1` §6 y se escribió sin verificar. Queda anotado acá
> porque es el tercer documento seguido que repite ese dato sin medirlo.

**Es una corrección de hecho, no de autorización.** Nada de lo que el `Addendum 1` autoriza o
prohíbe cambia: el motor **sigue anexando y nunca reemplazando**, y `setText` sobre las notas
del orador **sigue sin estar autorizado**.

**Qué cambió, medido el 09/08 con `contarAnclasDeLaminas()` sobre las dos plantillas vivas:**

| lámina de `SECCO_marcada` | `C-01 Add. 1` (07/08) | medido hoy |
|---|---|---|
| **8** — antecedentes de una temática | 285 caracteres | **sin notas** — borrada |
| **25** — conversación en X | 267 caracteres | **267 caracteres, intacta** |

**Se borró la 8. La 25 sigue en la plantilla, al dígito.** `JM_marcada` no tiene ninguna nota,
como ya decía el `Addendum 1`.

**Consecuencia operativa, y es la que importa:** el orden que fija
`docs/NOTAS_ORADOR_SECCO_8_y_25.md` —copiar al repo, backup, borrar las dos, recién ahí sellar—
**está a medias**. El sellado del `_11` anexa y no pisa, así que la nota de la 25 no corre riesgo
de destruirse; pero **borrarla después del sellado se llevaría el ancla**, que es exactamente lo
que ese orden venía a evitar.

**El texto del `Addendum 1` no se altera** — sigue siendo el registro fiel de por qué la regla se
escribió. Lo que hay que leer con este addendum al lado es su ejemplo: **hoy no es verificable
contra la plantilla.**

**Dónde vive ese contenido ahora:** `docs/NOTAS_ORADOR_SECCO_8_y_25.md`, evidencia congelada, con
su fila en `CLAUDE.md` §7. ⚠️ **Ese archivo entró al repo recién el 09/08**: llegó adjunto el
mismo día en que se borraron las notas y quedó fuera del repo por un pedido acotado a otros tres
archivos. **Entre el borrado y hoy, la única copia de esas notas estuvo fuera de git.**

**Por qué la regla no se debilita.** El `Addendum 1` prohíbe `setText` porque **puede** haber
trabajo humano en las notas, no porque lo hubiera en esas dos. El caso que lo motivó desapareció;
el riesgo no. La próxima nota que alguien escriba a mano no va a estar anunciada.

**Consecuencia para el `_11`:** su `0.5` declara esas dos láminas *"caso de prueba obligatorio"*, y
**ese caso ya no existe**. El reemplazo, aceptado el 09/08: una nota puesta a mano en una **copia
desechable**, con el control *"el texto propio sigue entero **y** el ancla aparece como línea
nueva"* — que da rojo si el sellado no ocurre, condición que el caso original ya no puede cumplir.

#### Addendum 4 — 09/08/2026: borrar una nota del orador, con la copia en el repo como precondición

**Autorización expresa del usuario, 09/08/2026.** Es una **ampliación**, no un recorte, y por eso
se escribe **antes** de ejercerla: `C-01` y su `Addendum 1` autorizan **anexar** a las notas del
orador y prohíben `setText` sobre ellas con todas las letras. **Borrar una nota es `setText('')`,
así que no estaba cubierto por nada de lo anterior.**

**Qué autoriza, y sólo eso:** **vaciar** las notas del orador de una lámina puntual, nombrada, y
sólo cuando su contenido **ya está transcripto en el repo y verificado carácter por carácter
contra la plantilla**.

**Precondiciones, las cuatro y en este orden:**

1. **La copia existe en el repo** y responde una pregunta declarada en `CLAUDE.md` §7.
2. **La transcripción se verificó contra la plantilla**, no por largo sino por texto — dos
   cadenas distintas pueden medir lo mismo.
3. **Backup previo de la plantilla**, y **aborto si el backup falla**. Es de `C-01` y no se
   negocia.
4. **Se borra una lámina nombrada**, nunca un barrido.

**Por qué hace falta, y es una razón de orden, no de limpieza.** El sellador del `_11` escribe el
ancla `#lamina: L-NNN` **en el área de notas**. Una nota que se borre **después** del sellado se
lleva el ancla con ella. Así que el borrado va antes o no va — y la alternativa (dejar la nota y
sellar encima) obliga a no tocar nunca más esa lámina.

**Qué NO autoriza este addendum**, con todas las letras:

- **borrar notas en lote** o por criterio automático — es una lámina, nombrada, por vez;
- **borrar sin la copia en el repo verificada**: sin el punto 2, esto es destrucción de trabajo
  humano, que es exactamente lo que el `Addendum 1` vino a impedir;
- **reemplazar el texto por otro.** Vaciar no es reescribir;
- nada de lo que los addenda anteriores ya prohíben: esconder o mostrar láminas, insertar o
  borrar láminas, mover o reescribir cajas, escribir `#seccion:`.

**Lo que no cambia:** el motor **sigue anexando y nunca reemplazando** para sellar. Esta
autorización cubre el borrado previo, no el sellado.

**Alcance ejercido hasta hoy:** una nota, la de la **lámina 25 de `SECCO_marcada`** —267
caracteres de texto sobre conversación en X—, transcripta en
`docs/NOTAS_ORADOR_SECCO_8_y_25.md` y verificada contra la plantilla el 09/08 antes de borrarla.
La lámina 8 de la misma plantilla ya había sido borrada a mano el 08/08, fuera del motor.

**Con esto, `SECCO_marcada` queda sin ninguna nota del equipo**, y el orden que fija
`docs/NOTAS_ORADOR_SECCO_8_y_25.md` —copiar al repo, backup, borrar, recién ahí sellar— queda
completo por primera vez.

## R-04 — El temario define el universo, no la fecha

**Enunciado:** una campaña está activa todos los días de su tramo, pero el proceso
arranca **seleccionando las reuniones del temario** — la fecha no decide qué campañas
entran al informe. Qué campañas entran lo decide la selección humana de encuentros
(temario); la fecha de inicio de campaña se usa **únicamente** para resolver el match
campaña↔encuentro. **Ninguna base digital se filtra por ventana para decidir
contenido.**

**Corolario:** `digital` y `looker` se leen en modo `snapshot`; sus columnas de fecha
elegidas el 30/07 (`docs/FECHAS_seleccion.md`) sirven para acotar lectura y
diagnóstico, no para seleccionar filas del informe.

**Origen:** respuesta del usuario, 30/07/2026, a la pregunta que dejó abierta el Paso
2.4 ("¿una campaña se reporta en el período en que arranca, o en todos los que estuvo
activa?"). Detalle en `docs/Prompts/DOC-3_verificacion_bases_vivas.md` Parte E.

> Nota de numeración: esta regla se documentó primero como "R-02" en el prompt de
> origen, pero **`R-02` ya estaba tomado** por "Criterio de fuente cruda" (arriba). Se
> asigna `R-04` para no romper el ID estable de la regla existente — cada ID se asigna
> una sola vez y no se reutiliza.

**Cómo se verifica:** el diseño del Paso 2.4 (anclaje RDV + link por `id_cuenta`) no
depende de las ventanas de fecha de `digital`/`looker` para decidir qué campaña entra;
si un cambio futuro empieza a filtrar `digital`/`looker` por ventana para ese fin,
contradice esta regla.

**Si falla:** si el equipo corrige esta respuesta (p. ej. "en realidad sí importa el
tramo completo de la campaña"), esta regla se marca derogada con fecha y el diseño del
Paso 2.4 vuelve a abrirse — las seis elecciones de fecha de `digital`/`looker` dejan de
ser solo diagnóstico y pasan a necesitar `fecha_desde`/`fecha_hasta` + condición de
solapamiento.

## R-05 — El agregado GLOBAL suma universos de JM y aperturas de JM+GCBA

**Enunciado:** en el agregado GLOBAL de una campaña, "enviados" suma **solo el universo
de JM** (el envío GCBA va a no-apertores del envío de JM; sumar su universo también
duplicaría destinatarios); "aperturas" suma **JM + GCBA** (las aperturas de GCBA son
impacto nuevo, no duplicado).

**Origen:** `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` Parte F, verificado
contra el informe SECCO/JM publicado del 31/07 (`docs/VALIDACION_2026-07-31.md`) —
exacto al dígito en dos campañas, cuatro métricas:

```
Cadetes GLOBAL:
  enviados   352.487 = 163.749 + 40.293 + 148.445         ← sólo JM
  aperturas  165.688 = 101.422 + 6.685 + 8.894 + 48.687   ← JM + GCBA

1-11-14 GLOBAL:
  enviados   410.912 = 215.240 + 24.805 + 170.867         ← sólo JM
  aperturas  181.415 = 123.884 + 1.151 + 7.904 + 48.476   ← JM + GCBA
```

**Cómo se verifica:** reconstruir el agregado GLOBAL de una campaña con envíos JM y GCBA
y confirmar que "enviados" cierra sumando solo JM y "aperturas" sumando los dos.

**Si falla:** **marcada como hipótesis hasta que el equipo la confirme** — no está cerrada
como las demás reglas de este archivo. Si el equipo dice que el universo también suma
GCBA (o que las aperturas no), esta regla se deroga con fecha. La diferencia entre
352.487 y 447.712 (sumar GCBA también en enviados) es la magnitud del error si se aplica
mal.

## R-06 — El `id_cuenta` manda; el nombre nunca decide pertenencia

**Enunciado:** la pertenencia de una fila de canal (mail, digital, etc.) a una cuenta o
campaña se decide **por `id_cuenta`**, nunca por el nombre de campaña. Un `id_cuenta`
placeholder (p. ej. `"Pieza"`) o un nombre que no coincide con el de la campaña real no
cambian a qué cuenta pertenece la fila — y tampoco alcanza para excluirla ni para
agruparla con otras por nombre.

**Origen:** `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` Parte F (R-04 en el
prompt de origen — renumerada acá para no chocar con el `R-04` ya asignado en este
archivo). Dos filas reales de la validación del 31/07:
- El envío del 24/07 de la campaña `1-11-14` (215.240 mails, 41% de la campaña) tiene
  `ID Cuentas = "Pieza"` y `Eje`/`Área = "Revisar"`. Looker suma 308.095 en lugar de
  523.335, **sin avisar**.
- El envío GCBA del 20/07 de `cadetes` tiene el `id_cuenta` correcto
  (`3305-JULSEGGJ`) pero el nombre de **otra** campaña (`"Vacunación Antirrabica
  Animales"`).

**Cómo se verifica:** un control de "filas con métricas y sin `id_cuenta` válido", por
base y por solapa, habría cazado el primer caso al instante — barato y es el único
control que detecta este modo de falla. **Pendiente de implementar** (Paso 2.10 Parte B /
`Paso-2.10_PartesBC_verificado.md`, que además mide 334 filas de `digital/Digital` en esta
misma condición — el 26% de la solapa).

**Si falla:** si aparece un caso donde agrupar por nombre da el resultado correcto y por
`id_cuenta` no, revisar si el `id_cuenta` de origen está mal cargado antes de tocar esta
regla — la evidencia hasta ahora es que el nombre es el dato que miente, no el id.

## R-07 — `fecha_corte` es obligatoria

**Enunciado:** toda comparación entre un informe publicado y las bases en vivo tiene que
declarar una **fecha de corte**. Las campañas siguen corriendo entre que se arma el
informe y se descarga la base; sin una fecha de corte declarada, cada corrida difiere de
la anterior por unos cientos y nadie puede distinguir un bug real del simple paso del
tiempo.

**Origen:** `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` Parte F (R-05 en el
prompt de origen — renumerada). Verificado en la validación del 31/07: todas las
diferencias medidas entre el informe publicado y la base descargada el mismo día van en
la misma dirección (la base tiene más) y son de una magnitud consistente con las horas
transcurridas entre ambos eventos.

**Cómo se verifica:** comparar un informe publicado contra la base descargada más de una
vez en el mismo día — si las diferencias no son todas en la misma dirección, hay algo más
que el paso del tiempo.

**Si falla:** `Snapshot.gs` (hoy vacío, ver `docs/GRANO_TEMPORAL.md`) deja de ser
opcional — es la mitigación: guardar la foto de cada corrida junto a su `fecha_corte`.

## R-08 — El vínculo reunión↔cuenta es curado, no derivable

**Enunciado:** ni la fecha ni el nombre permiten unir de forma confiable una reunión de
`REUNIONES`/`rdv` con su cuenta de `digital`. El link **tiene que cargarse a mano**
(curado en `REUNIONES`), nunca inferirse por similitud de fecha o de texto.

**Origen:** `docs/Prompts/Paso-2.10_PartesBC_verificado.md`, "Hallazgo lateral antes de
la Parte E" (escrito ahí como candidato a `R-06`, renumerado acá por la misma razón que
R-06/R-07). Caso concreto, verificado contra las bases del 31/07:
- `rdv/RVD JM-CM - ES` fila 709 → `Encuentro Temático "Orden Público" – Eje Norte`,
  **28/07**.
- `digital/Directa Mail` cuenta `3387-JULJDGGC` → `Te Cuento Bs As 21/7 Orden Público Eje
  Norte`.

Ni la fecha (21/07 contra 28/07 — el encuentro se movió y el nombre de la cuenta quedó
viejo) ni el nombre (`Encuentro Temático` contra `Te Cuento Bs As`) permiten el join.
Peor: existe una cuenta predecesora **cancelada**, `3347-JULJDGAG`, con texto casi
idéntico (`Te Cuento Bs As 21/7 Orden Público Eje Norte`) — un match difuso por nombre
levanta las dos y duplica (ver R-09).

**Cómo se verifica:** intentar unir este caso por fecha o por nombre falla o produce
ambigüedad (dos candidatas casi idénticas, una de ellas cancelada).

**Si falla:** `REUNIONES` necesita una columna curada `id_cuenta` (y, por R-09/§3.3 de
`Paso-2.10_PartesBC_verificado.md`, también qué envío puntual — `ID MailUp`). Es la misma
familia que R-06 pero en la dirección contraria: R-06 dice que el nombre nunca decide
pertenencia *dentro* de una cuenta; esto dice que el nombre tampoco decide **qué cuenta
pertenece a qué reunión**.

## R-09 — Lo cancelado no entra al informe

**Enunciado:** solo entra al informe lo que efectivamente ocurrió. El filtro por estado
es obligatorio y va **antes** de cualquier agregación, no después — una fila de reunión
cancelada o suspendida **conserva las métricas de la convocatoria** (la gente se inscribió
antes de que se suspendiera), así que una `SUMA` sin filtrar por estado suma convocatorias
a encuentros que nunca pasaron y devuelve un total plausible.

**Origen:** `docs/Prompts/REGLAS_R09_R10.md`, verificado contra las cuatro bases del
31/07. Medido en `rdv/RVD JM-CM - ES`:

```
Realizada               653
Suspendida               58
en agenda                 6
Reprogramada              2
Se modifico el barrio     1

→ 34 de las 61 filas no-realizadas tienen Inscriptos o Asistentes distintos de cero
```

Ejemplos reales: Jorge Macri 26/07/2025 suspendida con 62 inscriptos; Clara Muzzio
12/08/2025 suspendida con 49.

**El vocabulario de estado no es el mismo en cada base** — no se puede adivinar, hay que
declararlo por base/solapa:

| base · solapa | columna | entra | no entra | ambiguo → decide la persona |
|---|---|---|---|---|
| `rdv/RVD JM-CM - ES` | `STATUS REUNIÓN` | `Realizada` | `Suspendida`, `en agenda` | `Reprogramada`, `Se modifico el barrio` |
| `digital/Digital` | `Estado` | `Finalizada`, `Activa` | `De baja` | `Pausada`, `Stand by`, `Pendiente` |
| `digital/Directa Mail` | `Estado` | `Implementado` | `Proyectado` | `En curso` |
| `digital/Directa IVR` | `Estado` | `Implementado` | — | — |
| `looker/resumen_metricas_dinamico` | `estado` | `Finalizada`, `Activa` | — | **no tiene estado de cancelación** |

**Consecuencia sobre `looker`:** su columna `estado` solo distingue `Finalizada`/`Activa`
— no puede detectar una campaña dada de baja. Si `looker` se usa como control cruzado, una
divergencia contra `digital` puede ser justamente eso, no un error del motor.

**La distinción que importa: se cancela la unidad de informe (la reunión, la campaña), no
la fila de datos.** `digital/Directa Mail` tiene `Tipo de mail = 'Cancelación'` (15 filas)
y `'Reprogramación'` (9) — **esas filas no están canceladas: son envíos reales que
salieron, con métricas reales.** Es el mail que avisa que el encuentro se cancela. Caso
concreto:

```
cuenta 3347-JULJDGAG — "Te Cuento Bs As 21/7 Orden Público Eje Norte"
   17/07 · Estado='Implementado' · Tipo='Cancelación' · Enviados=110 · Aperturas=31
```

Esa cuenta no tiene ninguna marca de cancelada (`Estado='Implementado'` es correcto: el
mail se implementó). Lo que se canceló es el **encuentro del 21/07**, que no existe como
fila en ningún lado — se movió al 28/07 y ahí nació la cuenta `3387-JULJDGGC` (ver R-08).

**Cómo se verifica:** un candidato cuyo último envío sea `Cancelación` o `Reprogramación`
es indistinguible por nombre de su sucesor (`3347` vs. `3387`) — hay que mirar el envío,
no el estado, para no auto-seleccionarlo.

**Si falla:** en el match por confianza (R-08), un candidato cuyo último envío sea
`Cancelación`/`Reprogramación` (1) nunca se auto-selecciona aunque gane por similitud,
(2) se muestra en la lista de baja confianza con la marca visible y el motivo, (3) si la
persona lo elige igual, se registra el porqué en `REUNIONES.notas`. **Pendiente de
implementar** (tarea asociada de `docs/Prompts/REGLAS_R09_R10.md`, sobre el match por
confianza de Paso 2.9 Parte F).

## R-10 — Los encabezados se normalizan por espacios, nunca por mayúsculas

**Enunciado:** al leer un encabezado de columna, aplicar exactamente
`normalizar(h) = colapsar(/\s+/ → ' ', h).trim()` y nada más — colapsa saltos de línea,
tabs, espacios dobles y espacios en los bordes, pero **preserva mayúsculas, acentos y
guiones bajos**. Se aplica a los dos lados de la comparación: al encabezado leído de la
hoja y al valor cargado en `MAPEO`.

**Origen:** `docs/Prompts/REGLAS_R09_R10.md`, verificado contra las cuatro bases del
31/07. Dos hechos que exigen esta forma exacta y ninguna otra:

1. **Doce encabezados tienen salto de línea adentro** (seis en `digital/Directa IVR`,
   solapa fuente de los casos V-16 a V-19 de `docs/casos_validacion_2026-07-31.csv`):
   `'Llamados\nRealizados'`, `'Llamados\nAtendidos'`, `'Escucharon\n +75%'` (con espacio
   **después** del salto — reemplazar `\n` por espacio da `'Escucharon  +75%'`, con dos
   espacios, que tampoco matchea contra `'Escucharon +75%'` si no se colapsa). Más 21
   encabezados con espacio sobrante (`'Masculinos '` en cinco solapas de `rdv`, incluida
   la fuente `RVD JM-CM - ES`; `'Asunto '` en `m2/M2 Directa`; `'Equipo  solicitante'` con
   doble espacio).
2. **Por eso no se puede normalizar mayúsculas también.** Quince pares de encabezados
   colisionan si se pliega el case — tres en solapa fuente activa
   (`digital/CAMPAÑAS_DESGLOCE_DIGITAL`: `'Nombre Campaña'` vs. `'nombre_campaña'`,
   `'Eje'` vs. `'eje'`, `'Estado'` vs. `'estado'`). Son **columnas distintas con
   contenido distinto** en la misma solapa; bajar a minúsculas las colapsa y
   `buscarMapeo` devuelve la primera que encuentra, sin error — el modo de falla caro en
   su forma más pura. Hay además cuatro duplicados exactos que ninguna normalización
   arregla (`looker/URLs`: `id_cuentas` y `nombre_campaña` cada uno dos veces;
   `digital/RDV JM 2 VECES` y `digital/INFORME`: `Clics` dos veces).

**Cómo se verifica:** aplicar `normalizar()` a los encabezados de `digital/Directa IVR` y
confirmar que matchean contra `'Llamados Realizados'`/`'Escucharon +75%'` tal como los
escribe `docs/casos_validacion_2026-07-31.csv` — es el primer test de que la regla está
bien implementada: si los casos V-16 a V-19 dan ✅ **sin tocar el CSV**, funciona.

**Si falla:** **pendiente de implementar** (tarea asociada de
`docs/Prompts/REGLAS_R09_R10.md`): aplicar `normalizar()` en `Fuentes.gs` donde hoy se
hace `trim()` sobre encabezados y en `buscarMapeo()`; guardar `SOLAPAS.firma_encabezado`
con el encabezado **crudo**, no el normalizado (si guarda el normalizado, pierde los
cambios de espaciado, que son justo los que rompen); agregar al diagnóstico un control de
encabezados duplicados tras normalizar, por solapa (hoy hay cuatro casos reales; que
salgan como ⚠, no como una columna elegida al azar).
---

## R-11 — La semana del informe va de viernes a viernes

> ⚠ **Leer primero el Addendum 1 (02/08/2026), al final de esta regla.** Cierra el
> pendiente del extremo (es **inclusivo**: siete días, viernes a jueves), pone la jerarquía
> al derecho —**configurar es el caso normal, el cálculo es el piso**— y corrige el párrafo
> "Cómo se verifica" de abajo, que da por consistente un `CONFIG` que no lo es.

**Enunciado:** el período que reporta el informe es una semana de **viernes a viernes**.
Es el default en dos lugares: para **mostrar** el período en las láminas, y para
**calcularlo** cuando nadie lo cargó a mano.

**Precedencia — el cálculo automático nunca pisa a una persona:** si
`CONFIG.periodo_desde` / `CONFIG.periodo_hasta` están cargados, mandan ellos. El default
sólo entra cuando esos valores están vacíos. Misma dirección que `D-10` y que la
preselección de `DIAG_FECHAS`: lo que decidió un humano no se recalcula solo.

**Origen:** decisión del usuario, 02/08/2026.

**Cómo se verifica:** con `CONFIG` cargado, el período impreso en la lámina es el de
`CONFIG` aunque no caiga en viernes. Con `CONFIG` vacío, el período calculado arranca un
viernes. Al 02/08/2026 `CONFIG` tiene `2026-06-26` → `2026-07-03`, **los dos viernes**
(verificado), así que el valor cargado ya es consistente con la regla y no hay que tocarlo.

**Pendiente de definir, y no lo decide esta regla:** si el extremo final es inclusivo o
exclusivo. `CONFIG` hoy dice viernes 26/06 → viernes 03/07, que leído inclusive son **ocho
días**; el único período real observado en un temario es vie 24/07 → jue 30/07, "inclusive"
según su propio texto, que son **siete**. Las dos formas describen la misma semana con
distinto extremo. Hace falta la respuesta antes de implementar el cálculo (Pasos 3 y 4).

**Si falla:** si el equipo corrige el día de corte, esta regla se marca derogada con fecha
y se revisa la fila de `PLAN.md` §3 que apunta acá, más el encabezado de `Automatizacion.gs`
(ver `docs/PENDIENTES_consistencia.md`).

### Addendum 1 — 02/08/2026, decisión del usuario

El texto de arriba no se altera; esto lo corrige y lo completa el mismo día.

**1 · El extremo es inclusivo: la semana son siete días, viernes a jueves.** El caso de
referencia es **vie 24/07 → jue 30/07**. Queda cerrado el "Pendiente de definir" de arriba,
y cerrado en favor de la evidencia primaria —el comentario de la slide 1 y el renglón del
temario, los dos viernes-a-jueves—, no de la etiqueta "jueves-a-jueves" de la fila de
`PLAN.md` §3.

**2 · La jerarquía, al derecho: lo cargado manda; el cálculo es el piso.** El párrafo de
"Precedencia" de arriba dice lo mismo, pero de atrás para adelante, como si configurar
fuera la excepción. Es al revés: **configurar es el caso normal.**

El motivo explica todo el resto: **el informe lleva siempre lo más actual, y las reuniones
que no entraron una semana se ponen en la siguiente.** Por eso la ventana real varía — a
veces viernes a viernes, a veces jueves a viernes. El default de siete días es lo que se
usa **cuando nadie cargó nada**; no es una expectativa sobre lo que va a estar cargado, ni
algo contra lo cual validar lo que una persona escribió.

**3 · Dos consecuencias, escritas ahora para no descubrirlas en el Paso 3:**

- **Dos períodos consecutivos pueden solaparse o dejar hueco, y eso es válido y esperado.**
  El motor **no** valida continuidad entre períodos ni alerta por solapamiento. Un control
  que avise "esta semana pisa a la anterior" estaría reportando el funcionamiento normal.
- **Por eso `periodo_id` (`D-08`) no es una comodidad, es lo que hace reconstruible la
  curaduría.** Con ventanas variables, sin clave de período la curaduría de una semana
  pisa la de la anterior y **no hay forma de reconstruirla**: no se puede deducir a qué
  semana pertenecía una fila mirando su fecha, porque las ventanas ni siquiera son
  disjuntas. Es el argumento que faltaba en la Parte B del `Paso-2.15`.

**4 · Corrección al "Cómo se verifica" de arriba.** Ese párrafo dice que `CONFIG`
(`2026-06-26` → `2026-07-03`) "ya es consistente con la regla y no hay que tocarlo".
**Lo primero es falso**: leído inclusive son ocho días, y con esta regla la semana que
arranca el vie 26/06 termina el **jue 02/07**. Lo segundo sigue en pie y por un motivo más
fuerte: **no se toca porque lo cargó una persona**, y el punto 2 dice que eso manda. La
discrepancia queda anotada en `docs/PENDIENTES_consistencia.md`, no corregida en la hoja.


### Addendum 2 — 20/08/2026, decisión del usuario: **cuál semana se propone es la última cerrada**

El enunciado de `R-11` no se altera, y el Addendum 1 tampoco. Esto responde una pregunta que
**ninguno de los dos hacía**.

**`R-11` define qué ES la semana** —siete días, viernes a jueves, extremos inclusive— **y nunca
dijo CUÁL se elige respecto de la fecha de corrida.** Eso lo eligió el código, sin regla detrás:
`semanaR11_` devolvía la semana que **contiene** a la fecha. Por eso esto entra como addendum y
**no como derogación**: no hay enunciado previo que contradecir.

**Lo que se decide:** cuando el motor propone una semana —el eslabón 5 de la cadena de `D-20`, el
que corre con `CONFIG` vacío— propone **la última semana CERRADA**.

| se corre el… | propone |
|---|---|
| jueves 20/08/2026 | **14/08 – 20/08** — el jueves cierra su propia semana |
| **viernes 21/08/2026** | **14/08 – 20/08**, no 21–27: la semana que arranca ese viernes todavía no cerró |
| sábado 22/08 · miércoles 26/08 | 14/08 – 20/08 — la propuesta no se mueve |
| jueves 27/08/2026 | 21/08 – 27/08 |

⚠ **El viernes es el único día donde esto difiere de la lectura anterior, y es exactamente el día
en que se genera `jm`.** Los otros seis días del ciclo las dos lecturas coinciden. Es lo que hace
que la decisión importe y, a la vez, lo que la vuelve fácil de verificar mal: **un caso de prueba
tomado un jueves no distingue una lectura de la otra.**

**Lo que NO cambia, y conviene decirlo porque es lo que más se confunde:**

- **El punto 2 del Addendum 1 sigue intacto**: *configurar es el caso normal, el cálculo es el
  piso*. Lo cargado en `CONFIG` sigue mandando siempre. Esto sólo dice **qué se calcula cuando no
  hay nada cargado**.
- **`semanaR11_` no cambió de comportamiento.** Sigue devolviendo la semana que **contiene** a la
  fecha, y sigue siendo la correcta para agrupar un encuentro por su semana
  (`diagEncuentrosPorSemana_`) — ahí "la última cerrada" no significa nada, porque la pregunta es
  sobre un hecho pasado y no sobre una propuesta. La función nueva **se apoya** en ella: le
  pregunta por el jueves anterior o igual a la fecha de corrida.

**Origen:** decisión del usuario, 20/08/2026, ejecutada en `docs/Prompts/2026-08-20_2_semana_por_defecto.md`.

**Cómo se verifica:** `node tools/probar-semana-cerrada.js`, sin planilla y sin esperar a un
viernes. Incluye las nueve afirmaciones de `semanaR11_` tal como están, para poder demostrar que la
función vieja no se tocó.

**Si falla:** si el equipo decide que la propuesta debe ser la semana en curso, se marca este
addendum derogado con fecha y el eslabón 5 vuelve a llamar a `semanaR11_` directamente. La función
vieja sigue ahí, intacta, justamente para que esa reversión sea de una línea.

---

## R-12 — Ampliar antes de rendirse: no se reporta "sin match" sin haber buscado fuera de la ventana corta

**Enunciado:** la búsqueda de candidatos para el match reunión↔cuenta **se acota primero a
una ventana corta, por costo**. Si no hay match en esa ventana, **se amplía la búsqueda
antes de dar el vínculo por perdido**. Un `sin_link` sólo es legítimo después de haber
buscado en la ventana ampliada.

**Es el complemento de `R-08`.** Esa regla dice que el vínculo reunión↔cuenta **no es
derivable** —por eso hay confirmación humana—; ésta responde la pregunta que aquélla deja
abierta: **cuánto hay que buscar antes de declarar que no hay vínculo.**

**Su costo, escrito:** un encuentro perdido en silencio. Un `sin_link` prematuro no falla
ni avisa: el encuentro simplemente no aparece en el informe, y nadie tiene cómo notar la
diferencia entre "no existe la cuenta" y "estaba a dieciséis días".

**Origen:** decisión del usuario, 02/08/2026.

**Cómo se aplica.** La ventana corta ya existe y su motivo está escrito en el código:
`VENTANA_DIAS_CANDIDATOS_ANCLAJE_ = 14` (`Union.gs`) es **lo que disuelve el timeout** —
puntuar 500 encuentros × 1297 cuentas no terminaba en seis minutos; contra 5-20 candidatos
cercanos en fecha, sí. Lo que falta es la segunda mitad: hoy, si no hay candidato en esos
14 días, se reporta `sin_link` y no se reintenta.

**Los dos valores pasan a `CONFIG`** —la ventana corta y la ampliada—, por el mismo
argumento con que el Paso 2.9F sacó `umbral_anclaje_reunion` del código: cambiar un
parámetro de negocio no puede exigir `clasp push`. Hoy uno es constante de módulo y el otro
no existe.

**No se implementa con esta regla.** El cambio de comportamiento es del **Paso 3**; acá
queda registrada la decisión.

**Cómo se verifica:** una reunión cuya cuenta esté fuera de la ventana corta pero dentro de
la ampliada tiene que aparecer como candidata —con su banda de confianza—, no como
`sin_link`.

**Si falla:** si ampliar resulta demasiado caro en tiempo de ejecución, la salida **no** es
volver a la ventana corta en silencio: es reportar explícitamente que la búsqueda se
truncó, para que un `sin_link` nunca se confunda con "busqué todo".

---

### Addendum 1 — 20/08/2026: la mitad ampliada se implementa, y el recorte queda declarado como performance

El enunciado de arriba no se altera. Esto implementa lo que `R-12` declaró y `T2.9.2` dejó
esperando, y **agrega la propiedad que lo hace seguro**.

**Decisión del usuario, 20/08/2026:** *la campaña de una reunión puede arrancar hasta 10 días antes
del encuentro. Se busca en ese recorte; si no encuentra, se amplía.*

⭐ **La propiedad, escrita como regla porque es la que hay que sostener: el recorte es
PERFORMANCE, no criterio.** Un candidato que existe tiene que aparecer igual — el primer paso
decide **cuánto se tarda**, nunca **qué se encuentra**. Un recorte que pudiera cambiar el resultado
sería un filtro disfrazado de optimización, y ésos fallan sin avisar.

**El escalón, con su regla de corte:**

1. Se busca con el recorte acotado (`CONFIG.ventana_candidatos_anclaje_dias`).
2. **Si encuentra por encima del umbral, se queda con eso y NO amplía.**
3. Si no, se amplía (`…_ampliada_dias`) y se vuelve a buscar.

⭐ **La regla 2 no es una optimización: es determinismo.** Sin ella, ampliar podría traer un
candidato con mejor score y **el mismo encuentro se anclaría distinto según cuántos días haya
configurados** — el resultado dependería de un número de `CONFIG` en vez de los datos.

**Vacío significa no ampliar**, que es el comportamiento anterior. El cambio se apaga desde
`CONFIG` sin tocar código.

---

### ⚠ Addendum 1 bis — lo que la medición encontró, y por qué los 10 días NO se implementan como un recorte

**Medido el 20/08 antes de escribir una línea** (`2026-08-20_8` Parte 0). La pregunta era cuál de
los dos recortes encadenados pierde el candidato. **La respuesta es ninguno de los dos:**

| recorte | qué lo controla | ¿pierde un candidato a 10 días? |
|---|---|---|
| **el universo** — `unirDigitalPorCuenta` sobre `digital/Seguimiento digital` | la ventana de la corrida | **No.** `BASES.digital.modo_periodo = snapshot`, y `leerFuente` *"ignora la ventana y devuelve todas las filas"*. El universo **no se recorta** |
| **la cercanía** — `candidatosCercanosPorFecha_` | `CONFIG`, hoy `14` | **No.** El filtro es `Math.abs(...) <= msVentana`: **±14 días simétricos**. Los 10 entran con margen |

⭐ **Lo que sí lo pierde es el SCORE, y ampliar el recorte no lo toca.**
`scoreMatchDigitalRdv_` reparte por fecha así:

```
menos de 1 día  → +0,50
hasta 2 días    → +0,25
más de 2 días   → +0      (no suma; tampoco resta, a propósito)
```

Con el umbral en `0,6`, un candidato a 10 días **ya está en el conjunto** y **no suma nada por
fecha**: ancla sólo si barrio (0,5) + tipo (0,2) + tokens (0,3 × solapamiento) lo llevan solos por
encima. Barrio exacto **más** tipo alcanza (0,7); barrio solo no (0,5).

⚠ **Y ampliar no es neutro: puede empeorar.** El comentario de esa función dice que la fecha es
*"la única señal que separa"* dos campañas del mismo eje — es lo que puso once números de Orden
Público en la cuenta equivocada (`3347` en vez de `3387`, medido el 10/08). **Traer más candidatos
que puntúan cero por fecha aumenta los empates que el desempate tiene que resolver.**

**Consecuencia para la decisión del usuario:** los 10 días son un hecho del negocio y el motor hoy
**no los honra** — pero el lugar donde faltan es **el score**, no el recorte. Se anota como
propuesta y **no se aplica en este paso**: mover el reparto de puntaje por fecha cambia qué cuenta
se ancla a qué encuentro, y de ahí salen números publicados. **Es una decisión del usuario con su
propia medición**, no un efecto colateral de implementar `R-12`.

---

## R-13 — Los `m2_*` usan la ventana del informe, y el motor va a diferir de lo publicado

**Enunciado:** los tokens `m2_*` **no llevan `periodo_ref` propio**. Su ventana es la del
informe: caen al eslabón 4 de la cadena (`CONFIG`) o al 5 (el cálculo de `R-11`), como todo
lo demás. Y esa ventana es la de `R-11`: **siete días, viernes a jueves, con los dos extremos
inclusive**.

**Origen:** decisión del usuario, 03/08/2026.

**La consecuencia, escrita antes de que pase para que nadie la reporte como bug:** el equipo
hoy trabaja **de viernes a viernes**, ocho días. El motor usa siete. **Los números del motor
van a diferir de los publicados**, y la diferencia va a estar en las filas del **viernes de
cierre** — el octavo día, que el equipo incluye y el motor no. Es una diferencia **conocida y
deliberada**, no un error de cálculo ni de lectura.

**Qué NO se hace con esa diferencia:** no se ajusta la ventana para que los números cierren,
no se agrega un caso especial para `m2_*`, y no se valida lo cargado en `CONFIG` contra los
siete días. Si el equipo carga ocho días en `CONFIG`, **manda `CONFIG`**: configurar es el
caso normal y el cálculo es el piso (`R-11` Addendum 1, punto 2).

**El default de selección:** entra **todo lo que tenga `Implementado` o `En curso`** en la
ventana, y el equipo saca o pone lo que necesite. Los dos valores son los que ya declara
`MAPEO.valores_incluidos` para `digital/Directa Mail/mail_estado` (`D-21`); esta regla no los
redefine, los referencia.

**Cómo se verifica:** correr el informe sobre una semana ya publicada y comparar los `m2_*`.
Si la única diferencia son las filas del viernes de cierre, la regla se está cumpliendo. Si
hay diferencias en otros días, eso **sí** es un hallazgo.

**Si falla:** si el equipo pasa a siete días —o el motor a ocho— esta regla se marca derogada
con fecha y se revisa junto con `R-11`, que es de donde sale la ventana.

---

## R-14 — Una campaña entra si su rango de fechas **se solapa** con la ventana del informe

**Enunciado:** entra toda campaña cuyo rango de fechas se solape con la ventana del informe —
alguno de sus días entre **inicio** y **fin** cae dentro de la semana. **No** es "empieza en la
ventana" ni "termina en la ventana": una campaña que arrancó tres semanas antes y sigue
corriendo entra, y una que arranca el jueves y termina en septiembre también.

Fuente del dato: la solapa `Seguimiento digital` de la base `digital`.

**Origen:** decisión del usuario, 06/08/2026.

**Por qué se escribe:** el criterio no estaba en ningún lado — se midió el 06/08 y **no
existía** ni acá ni en `SUPUESTOS.md`. Cada consumidor que necesitara seleccionar campañas lo
habría inventado, y las tres formas razonables (empieza / termina / se solapa) dan conjuntos
distintos sobre los mismos datos.

**⚠ Hoy no es aplicable.** `MAPEO` tiene `sd_fecha_inicio` (columna `L`) y **no tiene fecha de
fin**. Sin el extremo derecho no hay rango, y sin rango no hay solape que evaluar: lo único
computable hoy es "empieza en la ventana", que es precisamente lo que esta regla dice que
**no** es. La regla queda escrita y esperando el mapeo de `Fecha de fin`.

> **Addendum 1 — 07/08/2026. El párrafo de arriba no se altera; lo que cambia es su estado:
> `R-14` es aplicable hoy, y la fuente no es la que decía.**
>
> **1 · La fuente correcta es la solapa `Digital`, no `Seguimiento digital`.** Lo decidió el
> usuario el 07/08 (`CONFIG_INFORMES.md` §1.8.1). El enunciado nombraba `Seguimiento digital`
> por una **trampa de nombres**: *"Seguimiento Digital"* es el **nombre de la base `digital`**
> y además hay una **solapa** que se llama casi igual. Son cosas distintas.
>
> **2 · El rango existe y estaba mapeado desde antes del 01/08.** En `digital/Digital`:
> `dig_fecha_inicio` → `E`, `dig_fecha_fin` → `F`. **Hay extremo derecho, hay rango, y `R-14`
> se puede evaluar.** El "no es aplicable" de arriba queda **superado**.
>
> **3 · Y sobre la ventana de hoy da cero — pero no por la regla.** Medido el 07/08 sobre las
> 1297 filas de `Digital`, ventana 24–30/07/2026: **"empieza en la ventana" da 0 y el solape de
> `R-14` también da 0**. El motivo es que **las 897 fechas reales de la solapa van de
> 2024-08-29 a 2026-01-02**: no hay ninguna campaña que llegue a julio de 2026. La regla es
> correcta y el dato no alcanza. **Un cero acá no es evidencia contra `R-14`.**
>
> **4 · El caso que la verifica sigue sin poder correrse**, por lo mismo: hace falta una
> semana con datos. Cuando la haya, el control es el del párrafo de arriba — una campaña que
> empiece antes del viernes y termine después del jueves.
>
> **5 · `sd_fecha_fin` y `sd_estado` (mapeados el 07/08 sobre `Seguimiento digital`) no se
> borran** y quedan **sin consumidor**: se mapearon cuando la fuente que esta regla nombraba
> era esa solapa. Son filas válidas de `MAPEO` que hoy nadie lee.

**Cómo se verifica, cuando se pueda:** tomar una semana con una campaña que arranque antes del
viernes de inicio y termine después del jueves de cierre —una que no toque ninguno de los dos
extremos— y comprobar que entra. Ése es el caso que distingue el solape de las otras dos
lecturas; los casos que empiezan o terminan dentro de la ventana **no** discriminan y no
sirven de control.

**Si falla:** si aparece una campaña sin fecha de fin cargada, esta regla no dice qué hacer con
ella. No se asume "sigue vigente" ni "dura un día": se registra el hueco y se pregunta
(`D-10` — al motor le falta una definición, pregunta y no la fabrica).

---

## R-15 — El corte JM / GCBA es **una señal por canal**, no una sola

**Enunciado:** no hay una columna que diga si algo es de JM o de GCBA. Hay **cuatro
respuestas distintas**, una por canal, y usar la de un canal en otro da un número plausible y
equivocado.

| canal | dónde se lee | JM es | GCBA es |
|---|---|---|---|
| **IVR** | `digital/Directa IVR`, columna `G` — `Vocero` | `JM` | `GCBA` |
| **Mail** | `digital/Directa Mail`, columna `G` — `Mail remitente` | `jorge.macri@buenosaires.gob.ar` | **todo el resto** |
| **SMS** | *(no hay columna)* | — | **todo** |
| **Pauta digital** | `digital/Digital`, columna `B` — `JM \| GCBA \| POLICIA` | `JM` | `GCBA` *(y `POLICIA`, que es un tercer valor)* |

**Origen:** decisión del usuario, 04/08/2026. Reafirmada el 07/08 al declarar los filtros de
la selección de campaña destacada.

**Lo medido, 04/08 y re-verificado el 07/08:**

- `Vocero`: **58 filas de 58 con dato**, `JM` 53 · `GCBA` 5. Cero cuentas con dos voceros.
- `Mail remitente`: ninguna vacía, y **21 remitentes distintos**, no dos.
  `jorge.macri@buenosaires.gob.ar` son **294 filas (13,7 %)**; el resto lo encabezan
  `infovecinos` (936) y `baparticipacionciudadana` (626).
- `JM | GCBA | POLICIA`: sobre 1297 filas — `GCBA` 739 · `JM` 205 · **`POLICIA` 16** · 337
  vacías.

**Tres consecuencias que no se derivan solas y por eso van escritas:**

1. **GCBA se define por resta, no por lista.** En mail, *"todo el que no sea `jorge.macri`"*
   — incluidas las direcciones que aparezcan en el futuro. **No hay ni va a haber una lista
   declarada de las otras veinte.** Por eso el cableado usa `mail_remitente!=jorge.macri@…`
   y no una lista blanca: una lista se desactualiza sola y excluye en silencio.
2. **Si el mail sale de JM, la campaña directa es de JM.** El remitente no es sólo el corte de
   la lámina de mail: **define la pertenencia de la campaña directa entera**.
3. **El vocero y la pauta son preguntas distintas.** `Vocero` dice **quién habla en el audio**;
   `JM | GCBA | POLICIA` dice **de quién es la campaña**. Que coincidan en la mayoría de las
   filas no las hace la misma columna.

**Y una asimetría que ya mordió:** cada fila de `digital/Directa Mail` es **un envío**, no una
cuenta. Medido el 04/08: **de las 880 cuentas con filas de mail, 136 mandan desde dos
remitentes distintos** —el par más común es `infovecinos` + `jorge.macri` sobre la misma
cuenta—. **El remitente es una señal por envío**, así que **no se puede propagar por
`id_cuenta`**. Cualquier diseño que asigne un remitente a una cuenta entera está mal.

**Dónde NO se aplica el corte:** la lámina de **agregados** de campaña destacada va **JM+GCBA
junta, sin corte**. La de **desagregados** muestra el remitente por fila, y ahí es **un dato,
no un filtro**.

**Cómo se verifica:** `gcba_mail_*` sobre la ventana tiene que dar exactamente el complemento
de `mail_*` — mismas filas totales, particionadas. Medido el 07/08: 7 filas JM + 80 GCBA sobre
las 87 de la ventana. Si la suma no cierra, hay filas que no caen de ningún lado y eso es el
hallazgo.

**Si falla:** si aparece un canal nuevo, **no se le hereda el criterio de otro**: se pregunta
cuál es su señal. Ésa es la regla, no un detalle de implementación.

### Addendum 1 — 07/08/2026: `rdv` es el quinto canal, y su señal es la columna `Figura`

**El texto de arriba no se altera, y su tabla tampoco.** Esto la extiende con una quinta fila:

| canal | dónde se lee | JM es | GCBA es |
|---|---|---|---|
| **Encuentros** | `rdv/RVD JM-CM - ES`, columna `A` — `Figura` (mapeada como `figura`) | `Jorge Macri` | **todo el resto** |

**Esto es lo que la regla de arriba ya mandaba hacer.** *"Si aparece un canal nuevo, no se le
hereda el criterio de otro: se pregunta cuál es su señal."* `rdv` no era un canal nuevo — era
un canal cuya señal **nunca se preguntó**, y no declararla no se leyó como un hueco sino como
que no hacía falta.

**El efecto medido, que es lo que vuelve útil a esta fila.** Sin la señal declarada, la lámina 5
del informe `jm` contaba **doce figuras**: en la ventana 24–30/07 hay 15 filas de 12 figuras
distintas y **sólo 4 son de Jorge Macri**. `ecv_encuentros` publicaba **15** donde el número es
**4**. Una regla con el error que evitó al lado envejece mejor que una regla sola.

**`GCBA` se define por resta, igual que en mail.** *Todo el que no sea `Jorge Macri`* — hoy son
once figuras y mañana pueden ser doce. **No hay ni va a haber una lista declarada de las otras**:
una lista se desactualiza sola y excluye en silencio.

**El valor matchea literal.** Medido el 07/08: `Jorge Macri` aparece **exacto en las 4 filas**,
sin variantes de escritura, sin espacios de más y sin acentos. No necesita pasar por la solapa
de equivalencias.

**Dónde se aplica:** hoy sólo en los seis marcadores de `ecv_alcance_semanal`, por
`MARCADORES.filtro`. La sección `encuentro` **no lo necesita**: itera sobre `REUNIONES`, que es
una hoja curada y **no tiene columna `figura`**.

---

## R-16 — La selección por período entra por **solape**, y el default es la semana

**Enunciado:** una fila entra a una sección **por período** si sus **días activos** —entre
fecha de inicio y fecha de fin— **tocan la semana del informe**. Es `R-14` aplicada: el
criterio es `inicio ≤ fin_de_ventana` **y** `fin ≥ inicio_de_ventana`. **No** es "empieza en la
ventana".

**El default es la semana; el temario es la alternativa, no el default.** Cada sección declara
su régimen (`D-09`): por período o por temario (`R-04`, el temario define el universo y la
fecha no decide). Lo que esta regla fija es **qué hace el régimen por período**, y que es el
que se asume cuando la sección no declara temario.

> **Addendum 1 — 07/08/2026: la contradicción se cerró, y parte de esta regla queda
> superseded por `R-17`.** El texto de arriba no se altera; esto dice qué de él sigue rigiendo
> y qué no. **Es un puntero, no una copia**: la prioridad de selección se lee en `R-17` y sólo
> ahí.
>
> | de esta regla | qué pasa |
> |---|---|
> | **el criterio de solape** —`inicio ≤ fin_de_ventana` y `fin ≥ inicio_de_ventana`— y su motivo (las campañas empiezan unos tres días antes) | **queda vivo.** Está medido: IVR dejó de dar cero sobre la ventana 24–30/07 |
> | **"y el default es la semana"**, del título, y el párrafo que lo desarrolla | **superseded por `R-17`** |
> | **la cláusula de filtros** *"sobre los días activos dentro de la semana"* | **superseded por `R-17`** |
> | el bloque `⚠ CONTRADICCIÓN ABIERTA` que estaba acá | **cerrado.** Lo reemplaza este addendum |
>
> **El título de esta regla quedó con la mitad vencida.** Una `R-NN` no se edita, así que el
> título se lee con este addendum al lado: lo que sigue siendo cierto es *"la selección por
> período entra por solape"*; lo que ya no, *"y el default es la semana"*.
>
> **Nada de lo que se ejecutó se movió.** El solape sobre los agregados es el terreno donde las
> dos versiones coincidían, y `R-16` nunca se cableó sobre la sección `campana`.

**Origen:** decisión del usuario, 07/08/2026. `R-14` (06/08) fijó el criterio de solape;
ésta lo declara **el default de la selección** y agrega el motivo de dominio.

**El motivo, que no estaba escrito en ninguna parte: las campañas suelen empezar unos tres
días antes.** Por eso "empieza en la ventana" pierde justo las que importan. El caso que lo
mostró, medido el 07/08: las dos campañas de IVR del encuentro de Orden Público arrancan el
**22 y el 23/07**, la ventana empieza el **24**, y siguen activas toda la semana. Con el
criterio viejo, IVR daba **cero por un día**.

**⚠ Los tres días NO son un parámetro.** El solape ya los cubre — una campaña que arranca tres
días antes y sigue activa, entra— y agregar un valor de "días antes" sería inventar una
decisión que nadie tomó. **No existe ni va a existir una clave de configuración de
anticipación.**

**Las filas sin fecha de fin no cambian de criterio, y el motor lo dice.** No se les asume un
fin implícito: un criterio distinto aplicado en silencio a un subconjunto es exactamente el
número plausible que este proyecto persigue. Siguen entrando por su fecha única, y la traza lo
declara.

**Los filtros que acompañan a la selección**, cuando la sección es de campaña destacada:
`Mail remitente` y `Vocero` según `R-15`, sobre los **días activos dentro de la semana**.

**Cómo se verifica:** IVR tiene que dejar de dar cero sobre la ventana 24–30/07/2026, y las
fuentes que ya daban bien —`Directa Mail`, `Directa SMS`— **no se tienen que mover**.

**Si falla:** si el solape hace entrar filas que el equipo no publica, **la salida no es volver
a "empieza en la ventana"**: es agregar el filtro que las distingue y dejarlo declarado.

## R-17 — El temario selecciona, los filtros acotan, y la semana es el fallback

**Enunciado:** qué campañas entran a un informe se decide en **tres niveles, en este orden**:

1. **El temario selecciona.** `mostrar` + `orden` en `CAMPANAS`. Si hay temario, **manda**, y
   se busca **en toda la base, sin filtro de ventana**. Una campaña puede ser anterior a la
   ventana del informe y entrar igual.
2. **Los filtros del usuario acotan lo que el temario ya eligió.** Son los de `R-15`, canal por
   canal — **no se repiten acá**: una sola fuente de verdad, y un valor duplicado es un valor
   que se desincroniza.
3. **La semana es el fallback, no un filtro previo.** Decide **sólo cuando no hay temario**.

**La diferencia que generó la contradicción está en el nivel 3**, y por eso se dice dos veces:
la semana **no filtra antes** del temario. Si hay temario, la ventana no participa de la
selección.

**Qué supersede de `R-16`, y qué no.** Supersede *"el default es la semana; el temario es la
alternativa, no el default"* y la cláusula de filtros *"sobre los días activos dentro de la
semana"* — con el nivel 2, los filtros acotan lo que el temario eligió, y el temario buscó en
toda la base. **No supersede el criterio de solape**: cómo se decide si una fila toca la
ventana se sigue leyendo en `R-16`, que queda vivo y medido.

**El caso testigo, que es lo que la sostiene:** **San Cristóbal, 23/07, entra con ventana
24–30/07** (`docs/CONFIG_INFORMES.md` §1.7). Una regla con un hecho medido al lado envejece
mejor que una regla sola.

**Origen:** decisión del usuario, 07/08/2026, en respuesta a la contradicción que `R-16` dejó
anotada. **Confirma** la versión de `CONFIG_INFORMES.md` §1.1 —*"la ventana agrega, el temario
selecciona"*— e **invierte el orden** de `A.1` del prompt
`docs/Prompts/2026-08-07_4_once_respuestas.md`, que decía *"por defecto la semana… si no, por
temario"*. **Esa versión queda derogada.** El prompt **no se edita**: vive en un prompt ya
ejecutado y se lo cita, no se lo corrige.

**Estado del código, verificado el 07/08/2026: el motor ya hace esto.** No es deuda ni cambio
pendiente. `itemsDeSeccion_` (`Generador.gs`) filtra `CAMPANAS` por `informe_id`, `mostrar` y
`periodo_id` no vacío (`D-19`), más `SECCIONES.filtro` — **sin ninguna intervención de la
ventana**. Y las **dos** llamadas a `entraPorSolape_` que existen en el repo están las dos del
lado de los agregados: la rama `filtrar` de `leerFuente` (`Fuentes.gs`) y el agregado global
(`Generador.gs`). *(Se nombran las funciones y no las líneas: los números envejecen con
cualquier commit.)*

**Qué NO cambia.** La ventana sigue rigiendo **los agregados** —`ecv_*`, ministros, `m2`—, que
son sumas de un período. Ahí las dos versiones siempre coincidieron, y el criterio de solape de
`R-16` sigue vigente sin tocar.

**Cómo se verifica:** **hoy no se puede sobre `campana`.** `CAMPANAS` tiene tres filas y las
tres son de `secco`, con `periodo_id` vacío, así que por `D-19` ninguna emite. La verificación
queda declarada para cuando haya filas de `jm`: una campaña destacada anterior a la ventana,
con `mostrar = sí` y `periodo_id` cargado, tiene que **entrar**. Se dice que no se verificó, en
vez de darlo por hecho.

**Si falla:** si entran campañas que el equipo no publica, la salida **no es reponer el filtro
de ventana** — es corregir el temario, que es donde vive la decisión editorial.

### Addendum 1 — 09/08/2026: el recorte de los agregados

**El texto de arriba no se altera.** Esto acota una de sus frases.

`R-17` dice, en *"Qué NO cambia"*: *"La ventana sigue rigiendo **los agregados** —`ecv_*`,
ministros, `m2`—, que son sumas de un período."* **Se acota para `ecv_*`:** el agregado suma los
encuentros que **`R-21`** seleccionó, no los que caen en la ventana. Es el agregado **de los
encuentros del informe**, y el informe los elige por temario.

**Ministros y `m2` no cambian: siguen por ventana.** Ministros es la unión de `RVD JM-CM - ES` y
`RDV_otros_ministros` excluyendo `Figura=Jorge Macri`, y `m2` tiene sus bordes del 23/07 y 30/07
como decisión humana. **Ninguno de los dos itera `REUNIONES` para elegir** — `Union.gs` ya excluye
`tipo='Agregado'` del anclaje, así que la distinción ya está en el código.

**Lo medido que lo obliga, 09/08/2026** (`C-01`…`C-04` de
`docs/casos_validacion_2026-08-09_addendum.csv`): con la ventana 24/07–30/07 el motor publica
**4 encuentros** y **2.307 inscriptos**; el deck publicado **también dice 4**, pero **son otros
cuatro** — el deck incluye San Cristóbal 23/07 y excluye Caballito 29/07, el motor al revés.
**El total coincidía y el universo no**, que es la peor forma de este error.

**Encuadre, porque el prompt que trajo el caso lo tenía al revés.** El `_10` decía que esto
*"contradice a `R-17`"*. **No la contradice: el motor estaba haciendo exactamente lo que `R-17`
mandaba.** Lo que faltaba era la regla de selección, que es `R-21`. La corrección la levantó el
`verificador` y la confirmó el `10.1` §5.

## R-18 — Una lista `DISTINCT` publica el canon del catálogo, nunca el texto de la celda

**Enunciado:** una operación que devuelve una lista de valores distintos —barrios, y cualquier
otra categoría— se rige por seis cosas, y por ninguna más.

**1 · La clave de comparación es el valor normalizado.** `normalizar_` (`Parseo.gs`): pliega
acentos y mayúsculas y hace `trim()`. `Palermo` y `palermo` son **el mismo valor**.

> **El límite, escrito porque importa:** `normalizar_` **no colapsa espacios internos**, no toca
> puntuación y no toca guiones. *Villa Gral Mitre* con doble espacio **no** colapsaría contra la
> variante de un solo espacio. **Hoy el caso no existe** —medido el 07/08: cero pares colapsan y
> los valores están escritos limpios—, y **no se crea un normalizador nuevo por un caso que
> nadie tiene**. Si aparece, la salida está declarada: se **compone** con el colapso de espacios
> de `R-10`, y el motivo se escribe arriba de la función (`CLAUDE.md` §2, que ya cuenta cuatro
> normalizadores y pide justificar el quinto).

**2 · La forma publicada sale del catálogo canónico de esa categoría, nunca de la celda.** Para
barrios el catálogo es la solapa **`Comunas` de `rdv`** —48 filas, barrio→comuna— y el mapeo lo
hace **`parsearBarrio_`**, que primero prueba la tabla de variantes ortográficas de `Parseo.gs`
y después el catálogo. **La lista canónica no se construye: ya existe.**

**3 · Lo que no matchea el catálogo no se publica.** Queda **fuera de la lista**, el token va a
**`REVISAR`** y el valor entra al **listado de faltantes con su fila**. **Nunca crudo y nunca en
silencio** — son las dos formas de fallar acá, y esta regla le cierra la puerta a las dos. Un
valor crudo publicado se lee como canon; uno descartado sin registro desaparece sin que nadie
se entere.

**4 · La lista hereda el universo de su sección, y eso es parte del contrato de la operación.**
No es una nota al pie: cuando se cablee `ecv_barrios`, su fila de `MARCADORES` lleva
`filtro = figura=Jorge Macri`, igual que las seis del `Addendum 1` de `R-15`. **Sin eso el
`DISTINCT` cuenta de más** — es exactamente el error que se corrigió en la lámina 5 el
07/08/2026, y **ésta es la operación con más chances de repetirlo**: una lista larga se lee como
riqueza de datos, no como un universo mal recortado. Medido: sin filtro **11 barrios**, con
filtro **4**.

**5 · El orden de salida es alfabético sobre la forma publicada**, con comparación de
castellano. Alfabético es lo que hace la lista **reproducible entre corridas**; el orden de
aparición depende de en qué fila quedó cada dato y cambia sin que cambie el dato.

**6 · No se trunca, y cero filas da `sin_datos`.** Salen **todos** los que sobrevivan al filtro;
si no entran en la caja, **el motor no recorta** — es problema de plantilla y se resuelve ahí.
Con cero filas devuelve **`sin_datos`**, no `""` ni `0`: es el precedente de `SUMA`, que sobre
cero filas da `sin_datos` porque un vacío publicado se lee como *"ningún barrio"*, que es una
afirmación que el motor no midió.

**Qué NO dice esta regla, y va explícito:** **no toca `R-10`.** `R-10` rige la lectura de
**encabezados de columna** —su enunciado lo dice, y el segundo "valor" que menciona es el de
`MAPEO`, que también es un nombre de columna—. Ésta rige **valores de celda**. Son dos
normalizaciones con dos propósitos y **conviven**. Se escribe explícito porque es el
malentendido que el `P2` de `PENDIENTES_consistencia.md` ya tuvo una vez: daba por sentado que
`R-10` empujaba en contra de deduplicar `Palermo`/`palermo`, y **no la alcanza**.

**Origen:** decisión del usuario, 07/08/2026. El punto 2 **supersede a la decisión del mismo
día** que fijaba *"se publica el valor tal como está escrito en la celda"* — se tomó **sin saber
que el catálogo existía**, y se movió cuando apareció el dato. **Una decisión que se corrige
porque apareció evidencia no es una decisión que estaba mal**, y la distinción vale escribirla.

**Cómo se verifica:** hoy **no se puede** — `ecv_barrios` no tiene fila en `MARCADORES` y la
operación `DISTINCT` no existe. La verificación queda declarada para cuando se implemente: sobre
la ventana 24–30/07 con el filtro puesto tiene que devolver **exactamente cuatro** —Belgrano,
Caballito, Retiro, Villa Urquiza—, en ese orden, y ningún valor fuera del catálogo.

### Addendum 1 — 07/08/2026: los estados son cuatro, no dos

**El texto de arriba no se altera.** Los puntos 3 y 6 escribieron dos estados y hacen falta
cuatro, porque hay dos casos que se confunden entre sí:

| caso | estado |
|---|---|
| **cero filas** tras el filtro | **`sin_datos`** |
| **fila con la celda vacía** | **no es un no-match.** No entra a la lista, **no dispara `REVISAR`**, y **se cuenta en la traza** |
| **valor que no matchea** el catálogo | **`REVISAR`** |
| **todas** las filas rechazadas por no matchear | **`REVISAR`, nunca `sin_datos`** |

**El motivo, que es lo que hay que dejar escrito:** **`sin_datos` afirma que no había nada.** Si
había valores y se descartaron, decir `sin_datos` es **publicar una afirmación que el motor no
midió** — el mismo modo de falla que el `0` de audiencia que se leía como *"no llamamos a
nadie"*. Cuatro barrios rechazados y cero barrios en la fuente son hechos distintos y tienen
que verse distintos.

**Y la celda vacía es el caso que más fácil se hace mal.** Una fila sin barrio cargado **no es
un valor que el catálogo rechazó**: es una fila que no aportó dato. Contarla como no-match
mandaría el token a `REVISAR` por un motivo falso y escondería los rechazos reales entre ruido.
Va a la traza, que es donde se ve sin ensuciar el estado.

## R-19 — Una fuente que dejó de traer no es un dato: es una falla

**Enunciado:** cuando una solapa declarada `uso = fuente` **no devuelve lo que suele devolver**,
el motor **falla con motivo** en vez de seguir con lo que haya. Cero filas no es "un período sin
actividad"; un encabezado con `#REF!` no es "una columna que se llama así".

**Es el mismo principio que ya rige la publicación, aplicado a la lectura.** El proyecto tiene
escrito que un token sin valor publica `«FALTA»` antes que un número plausible. `R-19` dice lo
mismo un paso antes: **antes de calcular mal, no leer**.

**El modo de falla que la motiva, medido el 08/08/2026.** Tres solapas fuente de `digital`
—`Seguimiento digital`, `Alcance` y `CAMPAÑAS_DESGLOCE_DIGITAL`— son **espejos**: su contenido
entra por `IMPORTRANGE` desde planillas de terceros a las que esta cuenta **no tiene acceso**.
El espejo es la fuente y no hay alternativa.

Un `IMPORTRANGE` roto —permiso revocado del otro lado, planilla borrada, id cambiado— **no tira
excepción, no vacía la hoja y no devuelve un error**: deja **una fila** cuyo único valor es el
**string** `"#REF!"`. Medido: `getLastRow()` da **1**, `typeof` da **`string`**.

**Sin guarda, la cadena entera es silenciosa:** encabezado `#REF!` → cero filas de datos →
`SUMA` devuelve `sin_datos` → el token publica `«FALTA»` → **nada falla**. **Un permiso caído se
ve exactamente igual que una semana sin campañas.** Y un permiso se revoca del otro lado, sin
avisar.

**Las tres capas, y por qué son tres:**

| capa | qué mira | configuración |
|---|---|---|
| **1 · centinela** | la fila de encabezado trae `#REF!`, `#N/A`, `Loading...`… | **`CONFIG.centinelas_lectura`** — vacío **cae al seed**, no desactiva |
| **2 · cero filas** | una solapa `fuente` devuelve **cero** filas de datos | ninguna: el corte es cero |
| **3 · piso** | trae mucho menos de lo habitual —12 de 4889— | **`SOLAPAS.filas_minimas`**, **vacío = sin chequeo** |

La 1 es determinista y **no puede dar falso positivo**: ningún encabezado legítimo se llama
`#REF!`. La 2 se verificó antes de activarla — **las 19 solapas `fuente` traen datos hoy**, así
que ninguna se convierte en falla. La 3 cubre la degradación **parcial**, que las otras dos no
ven, y **nace inerte a propósito**: el piso lo fija una persona que conoce la fuente, editando
la celda y **sin tocar código**.

**Los centinelas van en configuración y no en el código** por la misma razón que el umbral de
anclaje: es una lista de valores que puede cambiar sin que cambie la lógica (`D-01`).

**El motivo nombra la solapa y el centinela encontrado**, nunca "error de lectura". Quien lo lea
a las siete de la mañana necesita saber que **se le cayó un permiso del otro lado**, no que algo
falló.

**Cómo se verifica:** simular un `IMPORTRANGE` roto sobre una planilla desechable y confirmar
que la lectura falla con `«FALTA:lectura@base/solapa»` en vez de devolver cero filas. Verificado
el 08/08 sobre las tres capas, más el control de que una solapa `referencia` vacía **no** falla.

**Si falla:** si una fuente empieza a dar cero legítimamente, **la salida no es apagar la
guarda**: es que esa solapa no era `fuente`. El `uso` describe qué se espera de ella.

---

---

## R-20 — Para fechas pasadas, `en agenda` cuenta como realizada — sólo para contar

> ⚠ **SIN MECANISMO — decidida 09/08/2026, no implementada. No citar como vigente.**
>
> No hay forma de expresarla en configuración: `MAPEO.valores_incluidos` es una **lista
> estática** y esta regla es **condicional a la fecha**. Implementarla exige una segunda ruta de
> lectura de `rdv/RVD JM-CM - ES` que no pase por la lista blanca, usada **sólo** por el contador
> de encuentros — anotada en `docs/PENDIENTES_consistencia.md`. **Va en un prompt propio.**

**Acota `R-09`, no la deroga.** `R-09` sigue rigiendo toda lectura **numérica** de
`rdv/RVD JM-CM - ES`, y la lista blanca de `D-21 Addendum 1`
(`MAPEO.rdv/RVD JM-CM - ES/status.valores_incluidos`) sigue siendo `"Realizada"` sola, **sin
tocar**.

**Alcance:** el **conteo y el listado** de encuentros — `emin_encuentros`, `emin_lista`, y
cualquier cardinalidad de reuniones. **Nunca** una suma, un promedio ni un porcentaje.

**Condición:** `STATUS REUNIÓN = "en agenda"` **y** fecha del encuentro anterior al cierre de la
ventana del informe. Una fila `en agenda` con fecha futura sigue sin contar: todavía no pasó.
**`Suspendida`, `Reprogramada` y `Se modifico el barrio` no se tocan** — `Suspendida` declara que
el encuentro **no ocurrió**, que es distinto de una hoja desactualizada.

**Los números de esa fila no se leen.** Se buscan en la otra solapa por el mismo encuentro
(la cascada de `docs/DISENO_match_temario.md` §5 bis). Si no están, el token va a `REVISAR`.
**Nunca a cero** — un cero se suma y se publica; un `REVISAR` frena.

**Origen:** decisión del usuario, 09/08/2026. *"Para fechas pasadas, `Realizada` y `en agenda`
cuentan igual — la hoja no siempre se actualiza. Suma encuentros y no suma números, así que el
dato se busca en la otra solapa y si no está va a `REVISAR`, no a cero."*

**Por qué no contradice a `R-09`, que es lo que hay que entender antes de tocarla.** `R-09:334`
midió que **34 de las 61 filas no-realizadas traen `Inscriptos` o `Asistentes` distintos de
cero**. Eso no debilita esta regla: la funda. Que una fila `en agenda` traiga un número **no la
vuelve confiable, la vuelve peligrosa** — suma en silencio. Por eso `R-20` la deja contar y le
prohíbe aportar.

*(El prompt `_10` justificaba esta regla diciendo que esas filas vienen vacías. **Ese argumento
es falso y queda retirado** por el `10.1` §1: lo agregó el redactor, no estaba en la decisión del
usuario, y `R-09:334` lo desmiente.)*

**Lo medido, 09/08/2026 01:5x** — vocabulario completo de `STATUS REUNIÓN` sobre las **1362**
filas de la solapa, leído por `excluidas_por_valor` de `contarLecturaBase_`:

| valor | hoy (09/08) | `R-09` (31/07) |
|---|---|---|
| `Realizada` | 662 | 653 |
| `Suspendida` | 58 | 58 |
| **`en agenda`** | **7** | 6 |
| `Reprogramada` | 2 | 2 |
| `Se modifico el barrio` | 1 | 1 |

**El catálogo está cerrado**: los mismos cinco valores a nueve días de distancia. Y la regla es
chica por construcción — **`en agenda` son 7 filas en toda la historia de la solapa**.

⚠ **Ojo con el número al verificar:** el `10.1` dice *"contra las 6 filas `en agenda` de
`R-09:331`"*. **Hoy son 7.** `R-09` es evidencia fechada del 31/07 y entró una fila más. Se
verifica contra **el conteo del día**, no contra el 6.

**Cómo se verifica:** las filas `en agenda` de fecha pasada tienen que entrar al conteo, y
**ninguna tiene que aportar un número**. El conteo con la regla es siempre `>=` que sin ella.

**Si falla:** si el conteo sube y algún agregado también, el mecanismo se filtró a la rama
numérica. **Se retira el mecanismo, no se ajusta el número.**

---

## R-21 — Prioridad de selección de encuentros

> ⚠ **PARCIALMENTE SIN MECANISMO — decidida 09/08/2026.** El nivel 1 existe a medias y el
> nivel 3 no existe. Ver *"Estado de implementación"*, abajo. El código va en el `_12`.

El universo de encuentros de un informe se resuelve **en cascada**, de más específico a más
general, y **el primer eslabón que resuelve corta**:

1. **`REUNIONES` del período.** El temario es la lista curada; para eso existe. La fecha del
   encuentro **no** decide si entra — `Reuniones.gs` ya lo dice (*"universo del informe, no la
   fecha"*) y `R-11 Addendum 1` ya estableció que con ventanas variables la fecha no determina el
   período.
2. **Filtro explícito del usuario**, vía `SECCIONES.filtro`.
3. **Semana en curso**, por defecto.

**Origen:** decisión del usuario, 09/08/2026, sobre `C-01`…`C-04` de
`docs/casos_validacion_2026-08-09_addendum.csv`.

**Por qué.** San Cristóbal 23/07 se publicó en el informe del 31/07, y Caballito 29/07 en el del
07/08. **El encuentro se informa con un informe de retraso, dos veces.** Una selección temporal no
puede reproducir eso; una lista curada sí. No es un caso raro: es cómo trabaja el equipo.

**Relación con `R-17`, que es lo que hay que leer junto.** `R-17` fija la prioridad para
**campañas** y dice que la ventana rige los agregados. `R-21` fija la prioridad para
**encuentros**, y su `Addendum 1` acota `R-17` para el agregado `ecv_*`. Las dos reglas se
complementan y **ninguna deroga a la otra**. `C-01`…`C-04` **no eran un incumplimiento de
`R-17`** —el motor hacía lo que `R-17` mandaba—: era esta regla, que faltaba.

### Estado de implementación — lo que falta, medido

**Nivel 1, a medias.** `leerReuniones_` (`Reuniones.gs`) filtra por `eje` y `mostrar`, **no por
`periodo_id`**: hoy toda fila con `mostrar = sí` entra a **todo** informe, de cualquier semana. La
rama `CAMPANAS` de `itemsDeSeccion_` sí excluye `periodo_id` vacío citando `D-19`; la rama
`REUNIONES`, cinco líneas más arriba, no. **Es una omisión, no un diseño.**

**Nivel 3, inexistente.** `resolverVentana` termina en `CONFIG`, no en `hoy()`, y el corte de
semana —**viernes a jueves**— vive en un solo lugar, `docs/DISENO_match_temario.md` §2, y **nunca
se promovió a `CONFIG`**.

**Hasta que exista el panel, caer sin período es `REVISAR`, no una semana adivinada** — mismo
criterio que `D-19`: ninguna fila entra ni se excluye en silencio. *(Decisión del coordinador,
marcada como propia en el `10.1` §5.)*

**Y un tercer defecto medido que muerde acá:** el caché de `anclarEncuentros` se indexa por
`desde||hasta` sola, así que **dos informes de períodos distintos con la misma ventana se pisan**.

**Cómo se verifica:** un encuentro con fecha fuera de la ventana pero con fila en `REUNIONES` del
período **tiene que entrar**; uno con fecha dentro de la ventana y sin fila en `REUNIONES`
**no**. El caso testigo es el par San Cristóbal 23/07 / Caballito 29/07, que en el mismo deck
caen de los dos lados.

**Si falla:** si entran encuentros que el equipo no publicó, la salida **no es reponer el filtro
por fecha** — es corregir el temario, que es donde vive la decisión editorial. Mismo criterio que
el *"si falla"* de `R-17`.

---

## R-22 — Una solapa que dejó de actualizarse es peor que una que falla

**Enunciado:** cuando el dato de una solapa **deja de actualizarse**, se declara `uso = ignorar`
en `SOLAPAS` **en cuanto se detecta**. Una fuente que falla se ve; una que devuelve datos viejos
**publica un número plausible** y no falla nada. **La lista de solapas congeladas es el estado de
un día, no la regla** — la regla es el principio.

**Origen:** decisión del usuario, 09/08/2026, sobre `digital/Digital` y
`digital/CAMPAÑAS_DESGLOCE_DIGITAL`.

**Lo medido, 09/08:** `digital/Digital` tiene **205 filas JM que llegan a diciembre de 2025** y
cero datos de 2026; **cuatro marcadores de las láminas 2 y 3 la estaban leyendo**, más dos de la
lámina 6. `CAMPAÑAS_DESGLOCE_DIGITAL` tiene filas JM hasta el **17/04/2026**, y de las **436 que
solapan la ventana 24–31/07 las JM son cero**.

### Qué garantiza `ignorar` y qué no

**El corte está en `buscarMapeo` (`Config.gs:244-247`).** `ignorar` **apaga los marcadores** que
leen de esa solapa: pasan a `«FALTA:…@solapa_no_fuente(base/solapa)»`, visible y con motivo.
**No apaga la solapa.** `abrirHoja` y `leerFuente` no consultan `uso`, así que los caminos que no
pasan por `MAPEO` —diagnósticos, auditorías, cualquier llamada directa— la siguen leyendo. Está
declarado a propósito en `Fuentes.gs:623-625`.

**Consecuencia: declarar `ignorar` protege lo que se publica, no lo que se mide.** Un diagnóstico
que corra contra una solapa congelada va a informar que la base anda.

**Y de ahí sale una obligación que no se deriva sola:** si la solapa congelada es el
`hoja_default` de su base, **hay que mover el default en el mismo commit**, o `probarLecturaPeriodo`
y `contarLecturaBase_` van a seguir midiéndola. Se hizo el 09/08:
`BASES.digital.hoja_default` pasó de `Digital` a `Seguimiento digital`, y el conteo del
diagnóstico cayó de **1297 filas de la tabla muerta a 979 de la maestra viva**.

**El hueco que queda abierto:** si aparece una solapa congelada que **además** se lee por camino
directo y no es `hoja_default` de nada, `ignorar` no alcanza y **no hay mecanismo**. Anotado en
`docs/PENDIENTES_consistencia.md`.

### Cómo se escribe

**Por el seed, no por la celda.** `SEED_SOLAPAS_` es el dueño declarado del contenido de
`SOLAPAS` (`docs/ESCRITORES.md`), y `aplicarClasificacionSolapas_` **pisa toda fila con
`origen = seed`**. Escribir la celda a mano sin tocar el seed produce **ping-pong con el
sembrador** — el precedente está escrito en `Instalar.gs:406-409`:
`reclasificarSolapasM2Invertidas_` se retiró por eso mismo. La excepción es una fila marcada
`origen = manual`, que el sembrador **no toca** (`Instalar.gs:1511-1526`).

**Cómo se verifica:** los marcadores que leían de la solapa congelada tienen que caer a
`«FALTA:…@solapa_no_fuente»` **y no a cero**. Verificado el 09/08 sobre los seis de
`digital/Digital`.

**Precisión sobre qué cambia exactamente, porque el resumen de la corrida se lee mal si no está
dicha.** El **valor publicado** es `«FALTA:token»` — igual que cualquier otro token sin valor,
porque los dos puntos que pintan preguntan `estado === 'ok'` y todo lo demás cae al mismo camino
(`Generador.gs:783-788`). Lo que cambia es **el motivo**, que pasa a
`«FALTA:<campo>@solapa_no_fuente(base/solapa)»`, y **el estado interno, que es `error`, no
`sin_datos`**. En el resumen de la corrida eso aparece como una columna `error` distinta de cero:
**no es que algo se rompió, es la solapa declarada fuera de uso.**

### ⚠ Lo medido DESPUÉS, y acota el alcance de esta regla

Al apagar `digital/Digital` el resumen de `jm` fue de `51 / ok 38 / sin_datos 13 / error 0` a
`51 / ok 38 / sin_datos 7 / error 6`. **`ok` no se movió: 38 antes y 38 después.**

**Por lo tanto los seis no venían de `ok`: venían de `sin_datos`.** Ya no publicaban ningún
número — la solapa es `snapshot` pero sus filas `JM` son de 2025, así que el recorte por ventana
del marcador las dejaba afuera y `SUMA` devolvía `sin datos, no cero` (`Marcadores.gs:118-125`).

**Qué significa para la regla, dicho sin adornos:** en **este** caso apagar la solapa **no evitó
un número viejo, porque no había ninguno publicándose**. Lo que mejoró es el **motivo**: de *"no
hay datos"* —que invita a buscar el dato— a *"esta solapa está declarada fuera de uso"*, que es la
respuesta correcta y ahorra la búsqueda.

**El principio de la regla no cambia** —una fuente que devuelve datos viejos es peor que una que
falla— pero **el caso que la originó no lo demuestra**. Quien la cite para justificar un apagado
tiene que medir si esa solapa **estaba publicando algo**, y no asumirlo: el conteo de `ok` antes y
después es la medición que lo dice en un renglón.

⚠ **Dos nombres que se parecen demasiado, y una de las dos NO se congeló.**
`looker/resumen_metricas` —sin sufijo— es un **pegado de valores** y quedó en `uso = derivada`:
no baja a `ignorar` porque `derivada` ya la corta en `buscarMapeo` **y además dice qué es**.
`looker/resumen_metricas_dinamico` es **otra solapa**, es la fuente viva que declara `S-01`
—`QUERY()` sobre `Cuentas`—, **sigue en `uso = fuente`** y es la única de `looker` que el motor
lee hoy (949 filas, 26 en la ventana). Confundirlas apaga la única fuente que funciona.

**Si falla:** si un marcador que leía de una solapa recién congelada **sigue publicando un
número**, no está resolviendo por `MAPEO` — y ése es un camino que hay que encontrar y nombrar,
no un permiso para devolverla a `fuente`.

---

## R-23 — En `looker`, el corte JM/GCBA está en el nombre de la campaña

**Enunciado.** Si el **nombre de la campaña contiene `JM`**, la fila es **JM**. **Todo lo demás es
GCBA, por negación.** Se expresa con el operador de pertenencia que el motor ya tiene:

```
JM     →  campana~=JM
GCBA   →  campana!~=JM
```

**No hace falta ninguna capacidad nueva.** `~=` y su negado `!~=` existen desde el 08/08
(`Generador.gs`, `OPERADORES_FILTRO_`), y la comparación pasa por `normalizarValorDeclarado_`,
el canónico de `R-10`.

**Origen:** decisión del usuario, 10/08/2026. Ejemplo textual que dio:
`PRIMERA PERSONA | JM | PAULA PARETTO 27/7`.

**⚠ Alcance: `looker`, y nada más.** El corte JM/GCBA en Mail, SMS y CC **se resuelve por otros
campos** —`R-15` los declara uno por uno— y ésos no están en esta base. **No extender esta regla
a lo que no se midió.**

### Lo medido, 10/08/2026 — `looker/resumen_metricas_dinamico`, columna `nombre_campaña`

| | |
|---|---|
| filas totales | **951** |
| con `JM` (`~=`) | **74** |
| sin `JM` | **877** |
| sin nombre de campaña | **0** |
| **la suma cierra** | ✅ 74 + 877 + 0 = 951 |
| falsos positivos —`JM` dentro de otra palabra— | **0** |
| variantes de case que `~=` no matchearía | **0** |

**Los dos ceros son lo que deja usar `~=` sin culpa.** El primero dice que no hay ninguna fila que
entre a JM por accidente; el segundo, que **la sensibilidad a mayúsculas no cuesta nada acá** —
`normalizarValorDeclarado_` no pliega case (`R-10`), así que un solo `jm` en minúscula se habría
ido a GCBA sin avisar, y no hay ninguno.

**Y una advertencia sobre el separador, porque el ejemplo del usuario induce al error:** el nombre
viene en segmentos separados por ` | `, pero **`JM` casi nunca es un segmento propio**. Sólo lo es
en **3 de las 74**; las otras 71 lo traen dentro de un segmento (`RDV JM`, `Cafe JM`, `1 A 1 JM`,
`ANUNCIO JM`). **Un filtro que buscara `JM` como segmento capturaría 3 filas en vez de 74.** El
operador correcto es la pertenencia, no la igualdad de segmento.

### La decisión sobre las campañas mixtas — usuario, 10/08

**Cinco campañas nombran a JM y a GCBA a la vez. Van enteras a JM.**

```
CAMPAÑA JM + GCBA | SEGURIDAD | 600 desalojos en la Ciudad
CAMPAÑA GCBA/AGENDA JM | SALUD | HTAL. ZUBIZARRETA: RECORRIDA OBRAS
CAMPAÑA JM + GCBA | SEGURIDAD | Operativo de Seguridad en Subte
GCBA + JM | SEGURIDAD | Desalojo de propiedad Anchoris 183
CAMPAÑA JM + GCBA | SEGURIDAD | Desalojo cuatro propiedades en Constitución
```

**No es un borde del operador: es una decisión editorial.** La regla de negación ya las manda a JM
—contienen `JM`—, así que **el comportamiento no cambia**; lo que cambia es que ahora está
decidido en vez de ser un efecto colateral.

**⚠ Y la consecuencia que hay que tener a la vista: no aportan nada a GCBA.** Son cinco campañas
de 951 que el corte cuenta una sola vez, del lado de JM. Si algún día un informe de GCBA parece
faltarle una campaña de seguridad, empezar por acá.

**Si el criterio cambia** —por ejemplo, que una campaña mixta cuente en los dos lados— eso **no se
arregla con el filtro**: `campana~=JM` y `campana!~=JM` son complementarios por construcción y su
suma es siempre el total. Contar una fila dos veces exige otro mecanismo, y sería otra regla.

**Cómo se verifica:** `JM + GCBA = total de filas`, sin solapamiento y sin resto — el control que
cerró esta medición. Y sobre una ventana concreta, que ninguna fila con nombre vacío entre a
GCBA por la puerta de atrás: hoy son **cero**, y ese cero hay que volver a medirlo, no citarlo.

**Si falla:** si aparecen variantes de escritura —`jm`, `Jm`— la salida **no es plegar el case en
el operador**: `~=` es sensible a propósito porque `R-10` lo es, y plegarlo acá dejaría dos
regímenes conviviendo. Es corregir el nombre en la base, o declarar la variante.

---

## R-24 — `imp_prog` es todo lo que no es Meta ni Google ads: **por resta, no por lista**

**Enunciado.** En `looker/DIGITAL`, las impresiones se reparten en tres tokens y el tercero se
define **por negación de los otros dos**:

```
imp_meta     →  Plataforma = Meta
imp_google   →  Plataforma = Google ads
imp_prog     →  Plataforma != Meta  Y  != Google ads
```

**No se enumera.** `imp_prog` **no** es `Plataforma = DV360`, ni la lista
`DV360, TikTok, Mercado Libre, Twitter`.

**Origen:** decisión del usuario del 09/08/2026 —*las plataformas sueltas entran a
Programmatic*—, formalizada el 10/08 al medir que no son tres plataformas sino más
(`A-04`, `docs/casos_validacion_2026-08-09_addendum.csv`).

### Por qué por resta, y está medido dos veces

**`A-03` decía que `DV360` era la única tercera, y era cierto para la ventana que midió.** Es el
modo de falla exacto que esta regla evita: **enumerar lo que había en una ventana**. `A-04` midió
sobre el universo completo y encontró seis; cablear `= DV360` habría perdido **82 filas en
silencio**.

**Y la validación llegó el mismo día que se escribió esta regla.** Medido el **10/08/2026 sobre la
solapa viva** —no sobre el fixture—, `Plataforma` tiene **ocho** valores distintos:

| plataforma | filas | lado |
|---|---|---|
| `Meta` | 1783 | `imp_meta` |
| `Google ads` | 1385 | `imp_google` |
| `DV360` | 1629 | `imp_prog` |
| `TikTok` | 55 | `imp_prog` |
| `Mercado Libre` | 21 | `imp_prog` |
| `Twitter` | 12 | `imp_prog` |
| **`Twitch `** ⚠ | **5** | `imp_prog` |
| **`Uber`** | **5** | `imp_prog` |

**`Twitch` y `Uber` no estaban en `A-04`.** El `_22` §C decía, con razón para el fixture del 31/07,
que *"no están en `looker/DIGITAL` — estaban en `CAMPAÑAS_DESGLOCE_DIGITAL`, hoy en `uso =
ignorar`. La regla por resta las cubre igual si algún día aparecen"*.

**Aparecieron el mismo día.** Una lista explícita escrita el 10/08 ya habría estado incompleta el
10/08.

⚠ **Y `Twitch ` viene con un espacio al final.** Es exactamente el contrapunto que esta regla
necesitaba: **por resta, un valor mal escrito cae del lado correcto**; por lista, un `Twitch`
enumerado sin espacio **no matchea y la fila desaparece sin fallar**.

### El contrapunto, medido

Una regla por resta tiene el riesgo simétrico: **una plataforma mal escrita de los dos lados
positivos** —un `Meta ` con espacio, un `Google Ads` con mayúscula— **cae en `imp_prog` en vez de
fallar**. Se midió antes de escribir la regla:

**Cero colisiones.** Ninguno de los ocho valores difiere de otro sólo en espacios o mayúsculas.
`Meta` y `Google ads` vienen escritos de una sola forma cada uno.

**`R-23` había medido lo mismo para `nombre_campaña`, pero eso fue en la columna `F` y esto es la
`B`: cada columna se mide sola.**

### Alcance

**`looker/DIGITAL`.** No se extiende a `CAMPAÑAS_DESGLOCE_DIGITAL` —que tiene su propia columna
`Plataforma` y quedó en `uso = ignorar` por `R-22`— ni a ninguna otra base. Lo que no se midió no
entra.

**Cómo se verifica:** `imp_meta + imp_google + imp_prog` = total de impresiones de la solapa para
el mismo universo, **sin resto**. Y los valores distintos de `Plataforma` se vuelven a listar cada
vez: **una novena plataforma no rompe la regla, pero cambia el reparto** y conviene enterarse.

**Si falla:** si `Meta` o `Google ads` aparecen con una variante de escritura, la salida **no es
plegar el case en el filtro** —`R-10` no pliega y `~=` tampoco—: es corregir el valor en la base,
o declarar la variante con su propio filtro.

---

## R-25 — Una solapa sin fecha propia toma la ventana de otra, **por pertenencia y no por join**

**Hermana de `R-16`, y la diferencia es la que importa:** `R-16` decide **cómo** se recorta una
solapa —punto o solape—; ésta decide **con qué fecha** cuando la solapa no tiene ninguna.

**Enunciado.** Una solapa que no tiene columna temporal declara **de qué otra solapa de la misma
base toma la ventana** y **por qué clave se cruza**. El motor recorta la solapa de referencia con
**su** ventana —punto o solape, según lo que ella declare, o sea `R-16` sin cambios—, arma el
**conjunto** de claves que sobreviven, y deja pasar las filas cuya clave está en ese conjunto.

```
SOLAPAS.ventana_ref                 → de qué solapa (vacío = tiene fecha propia)
MAPEO.clave_ventana, de los dos lados → qué columna es la clave en cada una
```

### Por qué pertenencia y no join

**Un join produce filas nuevas; esto sólo decide si una fila entra o no.** La solapa que se
recorta **no toma ningún dato** de la de referencia: no necesita el nombre, ni el estado, ni las
fechas en la fila.

Y eso no es una preferencia de estilo: **si la clave estuviera repetida del lado de la
referencia, un join multiplicaría las filas y las métricas se contarían dos veces sin fallar.**
Un conjunto de pertenencia es inmune —un id repetido entra una vez—, así que el modo de falla más
caro desaparece **por construcción y no por cuidado**.

### El caso que la motivó, con la medición

`looker/DIGITAL` (10/08/2026, ventana `2026-07-24 → 2026-07-30`) tiene todo lo que hace falta para
las impresiones menos el tiempo: `nombre_campaña` en `F` resuelve el corte JM (`R-23`), `estado`
en `I` el filtro, `Plataforma` e `Impresiones` el desglose (`R-24`). **No tiene ninguna columna
temporal** — `fecha_inicio` y `fecha_fin` viven en `looker/Cuentas` (`C-19`). Hasta este cambio
fallaba con `«FALTA:fecha_periodo@looker/DIGITAL»`.

| | |
|---|---|
| `Cuentas` — filas / ids distintos / repetidos | 1011 / 1011 / **0** |
| `Cuentas` — filas sin `fecha_inicio` | 58 |
| `Cuentas` — ids en la ventana | 92 |
| `DIGITAL` — filas totales | 4896 |
| **en ventana** | **966** |
| fuera de ventana | 3765 |
| clave vacía | 18 |
| **clave huérfana** | **147** (31 ids distintos) |

**Cero ids repetidos** en `Cuentas`: el diseño por pertenencia era inmune igual, pero el número
queda escrito porque es la evidencia de por qué se eligió, no una consecuencia de haber acertado.

### Los cuatro conteos van separados, y suman

Es `R-20` aplicado —*un vacío no es un valor*—: una fila que sale por **no tener clave** no salió
por la misma razón que una cuya clave **no existe del otro lado**, ni que una cuya clave existe
pero **cayó fuera de la ventana**. Son tres explicaciones distintas de un total corto, y
mezclarlas es lo que hace que un número corto se discuta en vez de explicarse.

```
en_ventana + fuera_de_ventana + clave_vacía + clave_huérfana + excluidas_por_valor = totales
       966 +             3765 +          18 +            147 +                  0 = 4896
```

### Un solo nivel

**La solapa de referencia no puede a su vez referirse a otra**, y el segundo nivel falla con
motivo propio en vez de colgar la corrida. El ciclo más corto —una solapa que se declara a sí
misma— tiene su propio mensaje, porque es el más fácil de tipear.

**Cómo se verifica.** Sobre una solapa que **sí** tiene fecha propia, el recorte por referencia
contra sí misma tiene que dar **exactamente** lo mismo que el recorte directo. Medido el 10/08
sobre `looker/Cuentas`: 92 filas y 92 claves por los dos caminos, cero de un lado solo.

**Si falla:** un conjunto de referencia en cero, o una cuenta de huérfanas parecida al total, no
se corrige ampliando la ventana — se mira primero si la clave está resolviendo la columna
correcta. Los encabezados de las dos solapas **no coinciden** (`id_cuentas` contra `Id cuentas`) y
por eso la clave se resuelve por `MAPEO` y nunca por texto.

**Alcance.** Sólo `looker/DIGITAL → looker/Cuentas`, que es la única declaración que existe hoy.
La referencia es **dentro de la misma base**: cruzar entre bases no está medido y no entra.

---

## R-27 — El alcance lo aporta **sólo Meta**

> **`R-26` no está tomado por esta regla.** Está reservado por el prompt del "1 a 1"
> (`docs/Prompts/2026-08-13_1_R-26_uno_a_uno_solo_digital.md`), que al 14/08/2026 no se ejecutó.
> Si ese prompt falsa su premisa y nunca lo escribe, `R-26` queda como hueco: los IDs son
> estables y no se reutilizan.

**Enunciado.** De las tres plataformas del bloque digital —Meta, Google, Programmatic—, **la
única que aporta alcance es Meta.** No es una preferencia de diseño ni un recorte de
conveniencia: no existe dato de alcance de las otras dos.

### Por qué es regla y no preferencia: lo dice la estructura de la base

Decisión del usuario del 14/08/2026, **confirmada por la forma de `reuniones/Base_Digital`**, que
es lo que la vuelve regla. La solapa titula sus bandas con todas las letras:

| banda | qué archiva |
|---|---|
| `Alcance Meta Convocatoria` | el alcance de la PRE |
| `Alcance Meta Post` | el alcance de la POST |

**No existe banda de alcance de Google ni de Programmatic.** Las dos que hay nombran a Meta en el
rótulo. Una regla que dijera "el alcance es el de Meta porque es el que tenemos" sería una
excusa; ésta dice que **el dato de las otras dos no existe en la fuente**, que es un hecho
verificable y que alguien puede desmentir mostrando la banda que falta.

### La consecuencia, que es la mitad útil: un rótulo mal puesto

El `Alcance` que la solapa **POST** archiva bajo la banda `Acumulado` **está mal rotulado.** No
es un acumulado de las tres plataformas: el número sale del bloque `Alcance Meta Post` de
`Base_Digital`, y se verificó **celda a celda** — Retiro `47.753`, exacto. Lo mismo del lado PRE:
`Agenda JM!AF` ("Alcance manual") es `Base_Digital!K`, banda `Alcance Meta Convocatoria`, San
Cristóbal `1.412`.

Las dos filas de `MAPEO` de `alc_real` ya lo dicen en sus notas (`Instalar.gs`, `_1` Parte B).
Esta regla es el lugar donde vive el **por qué**, para que la nota de `MAPEO` no tenga que
sostenerlo sola.

**Corolario de lectura, y es el que importa en la plantilla:** la lámina del "1 a 1" muestra ese
alcance **en la tarjeta de Meta porque es de Meta**, no por conveniencia de diseño. Quien vea el
alcance junto a Meta y sospeche un error de maquetación, que lea esto antes de moverlo.

### Qué la desmiente

Que aparezca en `Base_Digital` —o en cualquier fuente del bloque digital— una banda de alcance de
Google o de Programmatic. Ahí el alcance deja de ser una medida de una plataforma y pasa a ser
una que se agrega, y **el rótulo `Acumulado` de la POST pasaría a ser correcto**, que es
exactamente el modo de falla que esta regla previene: hoy es un rótulo equivocado, mañana podría
ser un rótulo cierto sobre otro número.

---

## Nota de renumeración — por qué `R-03`/`R-04`/`R-05` significan dos cosas según el archivo (DOC-6, 01/08/2026)

**Qué pasó.** `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` definió tres reglas
como `R-03`, `R-04` y `R-05`. Al consolidarlas acá (`REGLAS_R09_R10`, 31/07/2026,
`764dc1e`) resultó que `R-03` y `R-04` ya estaban asignados a otras dos reglas con
contenido distinto, así que las tres se renumeraron `+2`:

| en los documentos de origen | canon vigente |
|---|---|
| `R-03` · el agregado suma universos de JM y aperturas de JM+GCBA | **`R-05`** |
| `R-04` · el `id_cuenta` manda | **`R-06`** |
| `R-05` · `fecha_corte` es obligatoria | **`R-07`** |

**Por qué no se arregló en origen.** La regla de ID estable ya existía y funcionó: acá
ningún ID se reusó ni cambió de significado. Lo que quedó fuera del alcance de esa
consolidación fueron los **documentos congelados**, que por definición no se editan. El
criterio es el de un ADR: *una decisión no se edita, se supersede* — así que los tres
archivos afectados llevan una **nota de equivalencia fechada al pie**, y su texto original
queda intacto:

- `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` — las tres definiciones.
- `docs/Prompts/Paso-2.10_PartesBC_verificado.md` — **sólo las líneas 23 y 97**: el resto
  del documento ya cita el canon, porque es el que diagnosticó la colisión y propuso este
  mismo renumerado.
- `docs/VALIDACION_2026-07-31.md` — la tabla "Qué cambia" (línea 342).

**Lo que se verificó y no hizo falta tocar.** Las 34 citas de IDs `R-`/`S-` de
`docs/BITACORA.md` (12 IDs distintos) son **todas consistentes con este canon**. La única
mención de la numeración vieja está en la entrada de `REGLAS_R09_R10`, que narra el
renumerado en sí: es historia correcta, no una cita vencida.

**No es el único caso, y el otro ya está resuelto en su lugar.** `R-04` lleva su propia
nota de numeración en el cuerpo de la regla: se documentó primero como `R-02` en su prompt
de origen, y `R-02` ya estaba tomado. Esa nota y esta cubren colisiones **distintas** y no
se contradicen — la de `R-04` es de un ID solo, ésta es del corrimiento `+2` de tres.

**Qué hacer si vuelve a pasar.** Antes de asignar un ID nuevo, greppear el prefijo en todo
el repo (`grep -rnoE "R-[0-9]{2}" --include=*.md .`), no sólo en este archivo. La colisión
no se produjo acá: se produjo en un prompt que asignó IDs sin mirar el canon. Es el mismo
patrón que `CLAUDE.md` §1 ya exige para nombres de función y `CLAUDE.md` §3 para pedidos de
corrección: **greppear antes de escribir.**

### Addendum 2 a `R-17` — 12/08/2026: el universo del agregado queda EN REVISIÓN

**El texto de `R-17` no se altera, y el `Addendum 1` tampoco.** Esto no lo deroga: lo pone **en
revisión** y dice por qué no se aplica mientras tanto.

El `Addendum 1` afirma que para `ecv_*` el agregado suma **los encuentros que `R-21` seleccionó** —
una decisión fija, igual para todos los informes. Lo medido lo contradice:

| caso | qué mide |
|---|---|
| `C-29`, `C-33`, `C-37` | **tres decks `jm` publicados, ninguno tiene lámina agregada.** Ninguno trae inscriptos, encuentros ni barrios impactados: sólo los individuales por encuentro. Los 28 tokens `ecv_*` de la lámina 5 de `JM_marcada` no reproducen nada que el equipo publique en `jm` |
| `C-30` | **`secco` sí tiene agregado, y usa un tercer universo**, declarado por escrito en su propia lámina 5: último trimestre, período de reuniones más reciente de JM, con exclusión de encuentros uno a uno. Y además **segmenta por tipo**: una lámina agrega RdV + Encuentro Temático, otra sólo Primera Persona |
| `C-28` | **retracta `V-38` a `V-45`.** El 2445 que sostenía al `Addendum 1` no salió de ningún deck: lo midió la rama de validación con un rango 23/07–31/07 elegido a mano, y es la **unión** de dos universos, no uno de ellos |
| `V-71` | 2333 es la suma de los cuatro encuentros que el deck publica **individualmente** — no es un agregado publicado |

**Lo que queda asentado, y nada más:**

1. **El `Addendum 1` no se deroga y no se aplica.** Queda en revisión, con los casos citados por
   `caso_id`. Nadie construye sobre él hasta que se cierre.
2. **El universo del agregado no es una constante del motor: es una propiedad del informe.** `jm` y
   `secco` no comparten criterio, así que no puede vivir cableado en el código ni en una regla
   única.
3. **El eje no es ventana-contra-temario**, y escribirlo así sería el error de fondo. `C-30` muestra
   **tres** dimensiones —ventana, exclusión por tipo de encuentro, y segmentación por tipo en
   láminas distintas—. Un booleano no alcanza; un booleano sería enumerar en vez de derivar.

**No se implementa nada con esto.** Ni columna en `INFORMES`, ni `D-NN`, ni un marcador.

---

### Addendum a `R-21` — 12/08/2026: el nivel 2 era otro mecanismo, y el nivel 1 quedó cerrado

**El texto de `R-21` no se altera.** Esto corrige el nivel 2, fecha el 3 y cierra el 1.

**1 · El nivel 2 estaba nombrando el mecanismo equivocado.** `R-21` lo escribe como *"Filtro
explícito del usuario, vía `SECCIONES.filtro`"*. El usuario enunció la cascada el **11/08/2026** así:
*si hay temario manda el temario; si hay **período personalizado** manda el período personalizado;
si no, la semana en curso*. Los niveles 1 y 3 coinciden con lo escrito; **el 2 no**.

Lo que el usuario describe es un **período personalizado explícito** — el override que viaja por la
cadena de `D-20` y que el Panel expone como selector de período. `SECCIONES.filtro` es **otra cosa**:
filtra los **ítems de una iteración** por un atributo, no elige el universo temporal.

**`SECCIONES.filtro` no desaparece: acota lo que el nivel ya eligió**, que es exactamente lo que
`R-17` nivel 2 dice para campañas.

**2 · Nivel 3, estado al 12/08/2026: sigue sin existir.** `resolverVentana` termina en `CONFIG`, no
en `hoy()`, y el corte viernes–jueves vive en un solo lugar —`docs/DISENO_match_temario.md` §2— sin
promoverse a `CONFIG`. **Se repite el estado con fecha; no se arregla acá.**

**3 · Nivel 1, CERRADO el 11/08/2026** (commits `540ed22` y `c0b58b5`).

Estaba a medias: `leerReuniones_` filtraba por `eje` y `mostrar` y **no** por `periodo_id`, así que
toda fila con `mostrar = sí` entraba a todo informe. El `_30` Parte A midió por qué no se podía
cerrar ese día: **las 7 filas de `REUNIONES` con `periodo_id` vacío, y `PERIODOS` sin ninguna fila
que cubriera 24/07–30/07**. El `_31.1` Parte B destrabó las dos cosas.

**Cómo quedó implementado, que importa para no volver a discutirlo:** el `periodo_id` **sale del
`origen` de la ventana** —`resolverVentana` ya devuelve `periodo_ref:<id>` cuando la corrida trae
override, y esa ventana viaja hasta `anclarEncuentros`—, y no de un parámetro nuevo en cuatro
firmas. **Sin override no se filtra, y el retorno lo dice**: la cadena de `D-20` puede terminar en
`CONFIG`, que no tiene `periodo_id`, y deducirlo del rango sería la *"semana adivinada"* que esta
misma regla prohíbe. Las excluidas se listan con motivo, citando `D-19`.

**Dos cosas más de esa noche, que son de la misma familia y si no se pierden:**

- **`curarCamposReuniones_`** (`Reuniones.gs`), gemela de `curarCamposMarcadores_`: el único
  escritor declarado de `REUNIONES` sólo **agrega** filas, así que un backfill de `periodo_id` sobre
  las que ya existían no tenía camino. **La clave es `texto_original` y no `orden`**, porque
  `cargarTemarioReuniones_` deja `orden` vacío cuando la línea no trae el prefijo `N)`.
- **`bajaConfianza` era una exclusión silenciosa.** `anclarEncuentros` devuelve tres listas y
  `itemsDeSeccion_` concatenaba dos: un encuentro con el ancla por debajo de
  `CONFIG.umbral_anclaje_reunion` desaparecía del deck **sin una línea en `excluidos`**. Ahora se
  lista con su puntaje, el umbral y el puntero a `ANCLAJE_PENDIENTE`. **Sigue sin emitirse, y eso es
  correcto**: el ancla decide qué fila de `rdv` se lee, así que emitirlo publicaría barrio,
  inscriptos y población de una fila que el motor no está seguro de haber acertado. Es la misma
  clase de falla que `D-19` y `D-21` cierran en los otros caminos.

---

## R-26 — El encuentro "1 a 1" se convoca **sólo por digital**, como **régimen** y no como invariante aritmética

**Origen:** decisión del usuario, 13/08/2026. **Medida el 17/08/2026** con
`medirUnoAUnoDeRdv()` sobre `rdv/RVD JM-CM - ES`, **sin recorte por ventana** — se quería el
comportamiento del **tipo de encuentro**, no el de una semana.

### La medición

**23 encuentros `"1 a 1"`, los 23 de Jorge Macri.**

| canal | suma | filas con valor ≠ 0 | share |
|---|---|---|---|
| `insc_digital` | **4.313** | **23 de 23** | **99,61%** |
| `insc_mail` | 18 | **17 de 23** | 0,42% |
| `insc_cc` | 0 | **0 de 23** | — |
| `insc_ivr` | 0 | **0 de 23** | — |
| `insc_dif` | 0 | **0 de 23** | — |

### El enunciado, y por qué es un régimen

**El "1 a 1" se convoca por el canal digital. Call center, IVR y difusión valen cero por diseño,
no por falta de dato** — son **cero absoluto**: ni una sola fila de las 23.

⚠ **Pero el mail NO es cero, y por eso la regla NO es una invariante aritmética.** Aparece en
**17 de los 23 encuentros** y suma **18 inscriptos en total** — cerca de **uno por encuentro**.
**Eso no es un canal de convocatoria: es un residuo.**

**La diferencia importa y es la mitad que sirve:**

- **Como régimen**, la regla dice *"así se convoca este tipo de encuentro"*, y un mail suelto no
  la contradice: la confirma, porque muestra que el canal existe y **no se usa para convocar**.
- **Como invariante aritmética** —*"los canales no digitales son siempre cero"*— la regla sería
  **falsa**, y cualquiera que la usara para validar encontraría 17 contraejemplos.

### La consecuencia operativa, que es para qué existe la regla

**Un `ecv_insc_*` no digital en cero sobre un "1 a 1" es correcto y NO se reporta como hueco de
cableado.** Es el modo de falla que esta regla evita: alguien ve `insc_cc = 0` en la lámina del
"1 a 1", lo toma por un token sin cablear, y "arregla" algo que estaba bien.

⚠ **Y las 17 filas que traen mail SE PUBLICAN, no se recortan.** La regla describe cómo se
convoca, **no autoriza a filtrar** las filas que se apartan. Recortarlas sería fabricar el dato
que confirma la regla — exactamente lo que `D-19` y `D-21` prohíben en los otros caminos: ninguna
fila entra ni se excluye en silencio.

### Hallazgo aparte — el descuadre de 1 sin ventana, que NO cambia la regla

**`insc_mail + insc_digital = 18 + 4.313 = 4.331`, contra `inscriptos = 4.330`. Sobra 1.**

**Y en la ventana semanal la identidad cerraba exacta** (2.307, medido el mismo día con
`testigoDeRdv()`). Así que el descuadre **aparece sólo sin recorte temporal**.

**No cambia el enunciado de arriba** —una diferencia de 1 en 4.330 no mueve un 99,61%— pero **se
deja anotado y no se deja pasar**: significa que sobre el histórico completo los canales no suman
exactamente el total, y las explicaciones posibles son distintas entre sí —una fila con doble
conteo, un inscripto por una vía no listada, un valor tipeado— **y ninguna está medida**. Es una
pregunta del dominio y va a `PENDIENTES`.

### Su reversión

Si aparecieran encuentros "1 a 1" con **call center o IVR distintos de cero**, esta regla deja de
describir el régimen y hay que reescribirla. El mail ya está contemplado: **su presencia no la
deroga**, y por eso la regla se escribió así y no como *"los demás canales son cero"*.


---

## R-28 — Los totales del "1 a 1" suman **una** etapa, no las dos

**Decisión editorial del equipo, medida el 21/08/2026.** No se tomó acá: se leyó del deck publicado
y se verificó contra la base del mismo día.

**Enunciado.** En la lámina del "1 a 1", los totales de arriba **no son la suma de las cinco filas
de la campaña**. Cada total suma **la etapa que corresponde a lo que esa etapa mide**:

| token | qué suma | por qué |
|---|---|---|
| `u1_total_clics` | sólo las filas **PRE** | el PRE es convocatoria, y la lámina lo rotula `CLICS (CTR)` |
| `u1_total_vistas` | sólo las filas **POST** | el POST es difusión, y la lámina lo rotula `VISUALIZACIONES (VTR)` |
| `u1_total_impresiones` | **las dos** etapas | es el volumen total, no una medida de una etapa |
| `u1_total_frecuencia` | `impresiones / alcance` | verificado: 377.997 / 55.255 = 6,84 · publicado **6,8** |
| `u1_total_alcance` | ⛔ **otra fuente** | son **usuarios únicos y no se suman**. `digital/Alcance` (`alc_alcance`) es el candidato — **no se asume** |

**No es un capricho, y por eso la regla se sostiene sola:** la propia lámina rotula el PRE por
clics y el POST por visualizaciones. Sumar las dos etapas en el mismo total mezcla dos preguntas
distintas —cuánta gente respondió a la convocatoria, y cuánta vio la difusión— en un número que no
contesta ninguna.

### La evidencia

Medida el 21/08/2026 sobre el fixture `Seguimiento Digital  2026-08-20.zip` —huella registrada en
`docs/_fixtures/README.md`—, que trae **la base y el deck del mismo día**, así que el cruce
*definición → número publicado* se hace entero sin conectarse a nada (`CLAUDE.md` §4).

**Cuenta `3487-AGOJDGAG`** (Uno a uno en Parque Avellaneda, 12/08), lámina 5 del deck
`Informe semanal JM - (14_08 al 21_08)`. **Cinco filas en `digital/CAMPAÑAS_DESGLOCE_DIGITAL`**, que
son el producto etapa × plataforma:

| etapa | plataforma | impresiones | visualizaciones | clics |
|---|---|---|---|---|
| PRE | DV360 | 86.572 | 0 | 148 |
| PRE | Meta | 65.554 | 0 | 1.324 |
| POST | DV360 | 35.605 | 21.425 | 81 |
| POST | Google ads | 132.310 | 115.968 | 118 |
| POST | Meta | 74.639 | 11.121 | 208 |

### ⭐ El contraejemplo, que es la mitad que importa

**Cablear `u1_total_clics` como "SUMA sobre las tres plataformas" —que es lo que parece obvio—
publicaría 1.879 contra 1.472.** Un **28 % de más**, plausible y equivocado.

Es exactamente el modo de falla que este proyecto persigue: **el número correcto salido de las filas
equivocadas**. No falla, no avisa, y `1.879` al lado de `1.472` no se ve mal — se ve como un buen
dato. **Una regla que no dice qué error evita se lee como burocracia**, y por eso el contraejemplo
va adentro de la regla y no en una nota al pie.

### Lo que esta regla NO dice

⚠ **No dice de dónde sale el alcance.** `u1_total_alcance` publicó **55.255**, y no es la suma de
los `ALCANCE` del propio deck (21.401 + 44.296 = 65.697): el alcance son usuarios únicos y sumarlo
los cuenta dos veces. La solapa `digital/Alcance` ya está mapeada y es el candidato — **queda
abierto**.

⚠ **Y un cabo suelto del deck de origen, dicho para que no se lea como un error del motor:**
`u1_total_impresiones` publica 377.997 y la suma de las propias celdas del deck da 378.267. **Los
270 de diferencia son del deck contra sí mismo** — el total y el desagregado parecen tomados en
momentos distintos.
