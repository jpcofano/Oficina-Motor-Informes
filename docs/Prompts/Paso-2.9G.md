# Paso 2.9G v2 — La hoja `SECCIONES`, jerárquica

> Registro de qué secciones tiene cada informe, **cómo se emite cada una** y **cuándo se
> omite**.
> Leer antes: `docs/SECCIONES.md` (v2, verificada contra tres informes publicados).
> **La v1 de este prompt proponía una lista plana y no alcanza.** Queda reemplazada.
> Trabajamos en español.

## Por qué jerárquica

Medido en informes reales, el bloque de campaña va de **3 a 21 láminas**:

| campaña | láminas |
|---|---|
| Lanzamiento BAX | 3 |
| Prioridad porteña | 4 |
| Desalojo N° 700 | 6 |
| Declaración de servicios esenciales | 8 |
| Grandes Generadores | **21** |

Tres cosas explican la diferencia, y ninguna cabe en una lista plana:

1. **Sub-secciones opcionales.** Servicios esenciales no tiene "Desagregados Digital"
   porque la campaña no usó digital. La ausencia es información.
2. **Anidamiento.** Grandes Generadores repite **por audiencia** —Gastronómicos,
   Hoteleros, Encargados, Consorcios, Comerciantes, Volquetes— y cada una tiene un
   subconjunto distinto de láminas.
3. **Repetición dentro de la sub-sección.** "Directa: respuestas" se emite una vez por
   remitente (JM / GCBA).

## Tarea

### 1. Crear la hoja `SECCIONES`

| columna | ejemplo | notas |
|---|---|---|
| `seccion_id` | `campana_desag_mail` | identificador estable, único |
| `padre` | `campana` | vacío = sección de primer nivel |
| `orden` | `6` | orden **dentro del padre** |
| `nombre` | `Desagregados Directa: envío de mail` | legible |
| `informes` | `JM,SECCO` | en qué informes aparece |
| `modo` | `repetible` | `unica` / `repetible` / `agregado` |
| `itera_sobre` | `CAMPANAS` | `REUNIONES` / `CAMPANAS` / `AUDIENCIAS` / vacío |
| `filtro` | `tipo=Uno a uno` | qué filas del origen |
| `opcional` | `sí` | ¿puede no emitirse? |
| `condicion` | `hubo_mail` | qué la activa |
| `familia_tokens` | `camp_env` | prefijos que resuelve |
| `estado` | `activa` | `activa` / `manual` / `revisar` |
| `falta` | `fuente sin definir` | qué se necesita para activarla |
| `notas` | | |

**`laminas` no es una columna.** Cuántas láminas salen es el resultado de qué
sub-secciones se activaron, no un dato de configuración. Si lo escribís fijo, va a
mentir.

### 2. Sembrar

Primer nivel:

| `seccion_id` | `informes` | `modo` | `itera_sobre` |
|---|---|---|---|
| `portada` | JM,SECCO | `unica` | |
| `indice` | SECCO | `unica` | |
| `resumen_ejecutivo` | JM | `repetible` | entidad (JM / GCBA) |
| `analisis_comparativo` | SECCO | `repetible` | red social |
| `semana_jm_conversacion` | SECCO | `unica` | |
| `miba` | SECCO | `unica` | |
| `portada_digital_directa` | JM,SECCO | `unica` | |
| `encuentro` | JM,SECCO | `repetible` | `REUNIONES` |
| `comunicaciones_post` | JM,SECCO | `repetible` | `REUNIONES` etapa=post |
| `impacto_comunicacional` | SECCO | `unica` | |
| `ministros` | SECCO | **`agregado`** | |
| `m2` | JM,SECCO | **`agregado`** | |
| `campana` | JM,SECCO | `repetible` | `CAMPANAS` |
| `nuevos_proveedores` | SECCO | `repetible` | proveedor |
| `analisis_tematico` | SECCO | `repetible` | tema |
| `otros_temas` | SECCO | `unica` | |
| `cierre` | JM,SECCO | `unica` | |

Hijos de `campana`:

| `seccion_id` | `opcional` | `condicion` |
|---|---|---|
| `campana_portada` | no | |
| `campana_objetivo` | no | |
| `campana_herramientas` | no | |
| `campana_formatos` | sí | hubo piezas digitales |
| `campana_agregados` | sí | ya hay resultados |
| `campana_audiencia` | sí | la campaña se segmenta por audiencia |
| `campana_desag_digital` | sí | hubo digital |
| `campana_desag_mail` | sí | hubo mail |
| `campana_desag_respuestas` | sí | hubo respuestas — **una por remitente** |

Hijos de `campana_audiencia` (`modo=repetible`, `itera_sobre=AUDIENCIAS`):
`aud_formatos`, `aud_directa`, `aud_contacto_ciudadano` — los tres opcionales.

Hijos de `encuentro`: `encuentro_portada` (no opcional), `encuentro_estrategia`,
`encuentro_iceberg`, `encuentro_resultados` — los tres últimos opcionales. Ni siquiera dos
Uno a uno tienen la misma cantidad de láminas.

Hijos de `m2`: `m2_status`, `m2_caudal`.

### 3. Lector

`leerSecciones_(informe_id)`: devuelve el árbol de secciones de ese informe, ordenado por
`orden` dentro de cada nivel. Una sección entra si `informes` la incluye.

### 4. Lo que falta se marca en la hoja, no en un doc

**No abras un archivo de pendientes.** Cada sección que todavía no se puede emitir se
registra con `estado` y `falta`. Una lista en un `.md` envejece sin que nadie se entere;
una fila en la hoja aparece cada vez que el motor recorre las secciones.

Sembrá así:

| `seccion_id` | `estado` | `falta` |
|---|---|---|
| `miba` | `manual` | fuente sin definir en el motor; el bloque ya se publica lleno a mano |
| `analisis_comparativo` | `manual` | sin marcar en la plantilla; fuente de la serie interanual |
| `impacto_comunicacional` | `manual` | sin marcar en la plantilla |
| `nuevos_proveedores` | `manual` | sin marcar; falta base de Uber / Twitch / Mercado Libre |
| `analisis_tematico` | `manual` | ad-hoc por tema, puede no ser automatizable |
| `otros_temas` | `manual` | sin marcar en la plantilla |
| `resumen_ejecutivo` | `manual` | es redacción, no dato |
| `encuentro_iceberg` | `revisar` | `ecv_*` se usa para ECV y para Uno a uno — definir si es genérico |
| todas las `opcional=sí` | `revisar` | condición de activación inferida de 3 informes |

Estas secciones **existen en informes reales**: hoy las llena una persona. Registrarlas
igual, porque si no están en la hoja nadie se acuerda de que faltan.

Cuando una se cablea, `estado` pasa a `activa` y `falta` se vacía.

### 5. Los tokens se resuelven dentro del bloque

`ecv_asistentes` aparece en la sección de Uno a uno y en el iceberg. Si se resuelve
globalmente, la emisión de una reunión pisa la de la otra y el informe muestra los números
de San Cristóbal bajo el título de Retiro, sin error visible.

**El contexto de resolución es el ítem que se está emitiendo** —la reunión, la campaña, la
audiencia—, no el informe entero. El mismo token vale distinto en cada copia, y en cada
nivel del árbol.

No hace falta implementarlo acá, pero dejalo escrito en el código como contrato.

## Lo que este paso NO hace

- No copia láminas ni emite nada.
- No calcula.
- No resuelve las condiciones de activación: sólo las registra.

## Restricciones

- Toda la aritmética vive sólo en `Marcadores.gs`.
- `SOLAPAS` manda para las bases. Ignorá `uso=ignorar`.
- Nada hardcodeado: los nombres salen de la hoja.
- **Nunca asumir `unica` por defecto.** Asumir única en algo repetible es exactamente el
  error que este paso corrige: la plantilla tiene una lámina de Uno a uno y esa semana
  hubo dos reuniones.
- La siembra pisa `origen=auto` y `seed`, **nunca `manual`** — mismo criterio que
  `SOLAPAS`.

## Test de aceptación

- `SECCIONES` existe con el árbol sembrado y `padre` resuelve correctamente.
- `leerSecciones_('JM')` devuelve sólo las de JM; `leerSecciones_('SECCO')`, las de SECCO.
  Los bloques compartidos aparecen en las dos.
- Exactamente **dos** secciones tienen `modo=agregado`: `ministros` y `m2`.
- Las `repetible` tienen `itera_sobre` completo.
- Las `opcional=sí` tienen `condicion` escrita.
- **Ninguna fila con `estado` distinto de `activa` tiene `falta` vacío.** Si no se puede
  emitir, tiene que estar escrito qué le falta.
- Correr `instalar()` dos veces no duplica ni pisa filas `manual`.

### Verificación contra los samples

En `Plan Inicial\_archivo\samples\Informes ejemplo`, reconstruí el árbol de una campaña y
comparalo con las láminas reales:

- `Declaración de servicios esenciales` (03-07) → 8 láminas, **sin** `campana_desag_digital`
- `Lanzamiento BAX` (03-07) → 3 láminas, sólo portada + objetivo + herramientas
- `Grandes Generadores` (08-05) → 21 láminas, con 6 audiencias

Si el árbol sembrado no puede producir esas tres formas, el esquema está incompleto.
Reportá qué falta en vez de forzarlo.

## Commit

`feat: hoja SECCIONES jerárquica con opcionalidad y ruteo por informe`
