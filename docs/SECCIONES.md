# SECCIONES — Motor de Informes (GCBA) — v2

> Inventario de secciones y **modo de emisión**, verificado contra informes publicados.
> **La v1 se derivó sólo de la plantilla y estaba equivocada en lo esencial.** Queda
> reemplazada por este documento.
> Trabajamos en español.

## Qué se verificó

| informe | láminas |
|---|---|
| plantilla SECCO vigente | 29 |
| `Informe_semanal_JM_26_06_AL_03_07` | 29 |
| `Copia_de_Seguimiento_SECCO-SSCDI_03-07` | **66** |
| `Copia_de_Seguimiento_SECCO-SSCDI_08-05` | **79** |

**Un informe real tiene entre 2 y 3 veces las láminas de la plantilla.** La plantilla no
describe el informe: describe los bloques con los que se arma.

---

## Corrección 1 — el bloque de campaña es de largo variable

La v1 decía "6 láminas por campaña". Es falso. Medido:

| informe | campaña | láminas |
|---|---|---|
| 03-07 | Decreto: servicios esenciales | 8 |
| 03-07 | Lanzamiento BAX | **3** |
| 03-07 | Programas para personas mayores | 8 |
| 08-05 | Grandes Generadores | **21** |
| 08-05 | Prioridad porteña | 4 |
| 08-05 | Desalojo N° 700 | 6 |
| 08-05 | Post Evento Colapinto | 7 |
| 08-05 | Cafecito BA en Palermo | 5 |

**De 3 a 21 láminas.** Las sub-secciones son **opcionales según los canales que usó la
campaña**:

- `Objetivo y período` — siempre
- `Herramientas y audiencias` — siempre
- `Formatos digitales implementados` — sólo si hubo piezas digitales
- `Resultados agregados` — sólo si ya hay resultados
- `Desagregados Digital` — sólo si hubo digital *(servicios esenciales no la tiene)*
- `Desagregados Directa: envío de mail` — sólo si hubo mail
- `Desagregados Directa: respuestas` — **una por remitente**
- `Contacto Ciudadano` — sólo si hubo call center

BAX aparece con 3 láminas porque la campaña recién arrancaba. **La ausencia de una
sub-sección es información**, no un error de armado.

## Corrección 2 — hay anidamiento

`Grandes Generadores` (21 láminas) no repite por campaña: repite **por audiencia dentro
de la campaña**.

```
Grandes Generadores
├── Gastronómicos        → formatos+resultados · directa · contacto ciudadano
├── Hoteleros            → formatos+resultados · directa
├── Encargados           → formatos+resultados · directa · contacto ciudadano
├── Adm. de Consorcios   → directa · contacto ciudadano
├── Comerciantes         → formatos+resultados · directa
└── Volquetes            → contacto ciudadano
```

Cada audiencia tiene un subconjunto distinto. **`SECCIONES` como lista plana no alcanza**:
hace falta jerarquía, o al menos una columna `padre`.

Lo mismo, más chico: `Directa: respuestas` se repite por remitente (JM / GCBA). En
servicios esenciales están las dos; en personas mayores sólo GCBA.

## Corrección 3 — JM es un subconjunto de SECCO, no otro informe

Comparando la misma semana (26/06–03/07):

| bloque | JM | SECCO |
|---|---|---|
| Uno a uno Comuna 10 (24/06) | 4–5 | 21–22 |
| Comunicaciones Post | 6–7 | 23–24 |
| M2 | 8–10 | 29–31 |
| Servicios esenciales | 11–18 | 32–39 |
| Personas mayores | 19–26 | 43–50 |

**Contenido idéntico, mismos números.** JM agrega `Resumen Ejecutivo` (JM y GCBA); SECCO
agrega Análisis comparativo, MiBA, Ministros, BAX y Nuevos Proveedores.

Confirma lo que ya estaba anotado como principio —SECCO reusa los nombres de token de
JM— pero **no significa "calcular una vez y congelar"**. Los dos informes no se arman el
mismo día y las campañas siguen corriendo: si SECCO sale una semana después, el alcance
de una campaña abierta creció y el número **debe** cambiar.

Las dos opciones son válidas según el caso:

- **Recalcular callado** → los dos informes dicen distinto y nadie sabe por qué. Es el
  desvío de 867 vs 1.026 clics documentado en el punteo del 30/07.
- **Congelar callado** → SECCO publica números viejos de una campaña que siguió.

Entonces el valor compartido se calcula una vez, **se guarda**, y cuando el segundo
informe lo encuentra distinto, **la persona decide si reusa o actualiza**. Ver
`docs/Prompts/Paso-2.9H.md`.

## Corrección 4 — la plantilla no tiene todas las secciones

Secciones presentes en informes reales y ausentes de la plantilla vigente:

| sección | dónde | láminas | modo |
|---|---|---|---|
| Análisis comparativo Imagen JM (interanual) | 03-07 · 4–12 | 9 | `repetible` por red social |
| **Integración MiBA** | 03-07 · 17–19 | 3 | `unica` |
| Semana JM — Impacto comunicacional | 03-07 · 25–26 | 2 | `unica` |
| Nuevos Proveedores | 03-07 · 51–57 | 7 | **`repetible` por proveedor** (Uber, Twitch, ML) |
| **Encuentros con vecinos (ECV)** | 08-05 · 3–4 | 2 | `repetible` por encuentro |
| Campañas destacadas — Listado | 08-05 · 15 | 1 | `unica` |
| Análisis temático ad-hoc (Subte, Clausuras) | 08-05 · 60–72 | 13 | `repetible` por tema |
| Otros temas | 08-05 · 78 | 1 | `unica` |

**MiBA no está parked: se está usando.** El informe del 03-07 tiene tres láminas con
datos reales (*Universo Consultado 709.102*). La fuente sigue sin definirse del lado del
motor, pero el bloque existe y alguien lo llena.

## Corrección 5 — el iceberg es genérico

Pendiente de la v1: ¿el iceberg es exclusivo del Encuentro Temático?

**No.** En 08-05 lámina 4: *"Villa Devoto 04/05 | Iceberg"*, un **ECV**. El iceberg se
usa con cualquier tipo de encuentro.

Confirma que `enc_*` es la familia de métricas reusable y que **no hay que renombrar
nada**. Queda abierto sólo `ecv_*`, que se usa tanto para ECV como para Uno a uno.

## Corrección 6 — el bloque de encuentro también varía

| informe | encuentro | láminas |
|---|---|---|
| 08-05 | ECV Villa Devoto | 2 (portada + iceberg) |
| 08-05 | Uno a uno Comuna 13 | 3 (portada+período · estrategia+audiencias · resultados) |
| 03-07 | Uno a uno Comuna 10 | 2 (portada · datos) |

Ni siquiera dos Uno a uno tienen la misma cantidad de láminas.

---

## Los dos agregados se confirman

- **Encuentros de ministros** — una vez, con `Semana del 26/06 al 02/07` y `ENCUENTROS:`
  listando los del período. En los dos SECCO aparece una sola vez.
- **M2** — una vez (`Status semanal` + `Caudal semanal`, 2–3 láminas).

Ninguna otra sección suma el período.

## `(parcial)` es un marcador del equipo

Aparece sistemáticamente en los títulos:

```
Resultados agregados (parciales)
Resultados desagregados | Digital (parciales)
Difusión (parcial)
Impacto Convocatoria y Post (parcial)
Post (parcial)
```

Es cómo el equipo avisa que **la campaña sigue corriendo y los números van a cambiar**.
Tres veces en JM, siete en SECCO 03-07, seis en 08-05.

**Debería ser un campo, no texto tipeado en el título.** Si `CAMPANAS` tuviera una
columna `parcial`, el motor escribiría el sufijo solo y quedaría registrado qué números
del informe son provisorios.

## Los informes publicados no sirven para validar valores

Los números se actualizan después de presentado el informe. Comparar un sample contra las
bases de hoy **va a dar distinto por diseño**, y esa diferencia no es un error.

Los samples sirven para verificar **estructura**: qué bloques hay, cuántas veces
aparecen, en qué orden, qué sub-secciones son opcionales. Para eso son excelentes.

Es el mismo motivo por el que el punteo del 30/07 pide **guardar la foto de cada
período**: sin serie histórica un informe pasado no se puede reproducir.

## Cuidado al contar desde los samples

El SECCO 03-07 tiene las láminas **59 a 66 sin llenar**, con `xx`, `xxK`, `xx%`
arrastrados de la plantilla. Son borrador que quedó al final del archivo publicado.

Dos consecuencias: al contar bloques hay que excluirlas, y **los `xx` sobreviven a la
publicación** — el motor debería marcarlos como `«FALTA:token»` en vez de dejarlos pasar.

---

## Qué necesita `SECCIONES` para servir

La v1 proponía una lista plana. No alcanza. Mínimo:

| columna | por qué |
|---|---|
| `padre` | anidamiento campaña → audiencia |
| `opcional` | la sub-sección puede no emitirse |
| `condicion` | qué la activa (*hubo digital*, *hubo call center*) |
| `compartida_con` | bloques que van a JM y a SECCO |

Y `laminas` deja de ser un número fijo: pasa a ser el resultado de qué sub-secciones se
activaron.

## Lo que falta vive en la hoja, no acá

Este documento no lleva lista de pendientes. **Cada sección que todavía no se puede
emitir queda marcada en `SECCIONES` con qué le falta**, igual que `SOLAPAS` registra las
solapas en `revisar`.

Una lista de pendientes en un `.md` envejece sin que nadie se entere. Una fila en la hoja
aparece cada vez que el motor recorre las secciones.

Los estados:

| `estado` | qué significa |
|---|---|
| `activa` | el motor la emite |
| `manual` | existe en informes reales, hoy la llena una persona — **cablear a futuro** |
| `revisar` | registrada, pero algún atributo sin confirmar |

Y la columna `falta` dice qué se necesita para activarla. Por ejemplo:

| `seccion_id` | `estado` | `falta` |
|---|---|---|
| `miba` | `manual` | fuente sin definir en el motor; el bloque ya se publica lleno a mano |
| `analisis_comparativo` | `manual` | sin marcar en la plantilla; fuente de la serie interanual |
| `nuevos_proveedores` | `manual` | sin marcar; falta base de Uber / Twitch / Mercado Libre |
| `analisis_tematico` | `manual` | ad-hoc por tema, puede no ser automatizable |
| `resumen_ejecutivo` | `manual` | es redacción, no dato |
| `campana_desag_mail` | `revisar` | condición de activación inferida de 3 informes |
| `encuentro_iceberg` | `revisar` | `ecv_*` se usa para ECV y para Uno a uno — definir si es genérico |

Cuando una sección se cablea, `estado` pasa a `activa` y `falta` se vacía. El día que no
quede ningún `manual` ni `revisar`, el informe sale entero del motor.

**`parcial` no es de acá**: es una columna de `CAMPANAS`. Ver `Paso-2.9H`.
