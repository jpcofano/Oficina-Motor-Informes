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