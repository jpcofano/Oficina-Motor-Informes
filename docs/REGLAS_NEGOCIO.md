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
