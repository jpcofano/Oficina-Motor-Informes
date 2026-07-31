# REGLAS DE NEGOCIO

> Supuestos del dominio que el motor da por ciertos. Cada uno tiene ID estable.
> Si una regla se cae, se marca como **derogada** con fecha — no se borra.

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