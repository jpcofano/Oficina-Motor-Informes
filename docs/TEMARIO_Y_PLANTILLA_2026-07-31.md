# TEMARIO Y PLANTILLA — Motor de Informes (GCBA) — 2026-07-31

> Complementa a `HANDOFF 2026-07-31.md`. Documenta tres cosas que hasta ahora vivían
> sólo en comentarios de una presentación: **de dónde sale la lista de reuniones**,
> **cómo se estructura**, y **qué cambió entre las dos versiones de la plantilla SECCO**.
>
> Origen: lectura directa de ambas presentaciones desde Drive el 31/07.
> **Trabajamos en español.**

---

## 0. Por qué este documento existe

La lista de reuniones que define el informe **llega por WhatsApp** y hoy no tiene lugar
en el motor. Alguien la transcribe a mano.

En la presentación `SECCO_marcada_info_informe`
(`1yIlCIBGJHsJBNLaMDqBNf75b2gzyMVnlwB5JJArNZv0`) esa lista está escrita como
**comentarios de slide**, uno por bloque, cargados por Brian Matías Banderbek el
29/07/2026.

**La plantilla vigente (`1_ZKjWhL-bhCP8yHQ8PJ33ymyjSXu3thh7MKMOxB4-n8`) no tiene esos
comentarios.** Son dos archivos distintos. Si el deck viejo se archiva, el temario del
24–30/07 desaparece — y con él, el único ejemplo real del formato en que el equipo
piensa el informe.

---

## 1. El temario del 24/07 al 30/07, transcripto

Formato observado: `eje | tipo nombre fecha (etapa)`, con numeración de orden.

| # | eje | tipo | nombre | fecha | etapa | estado del comentario |
|---|---|---|---|---|---|---|
| — | JM | Uno a uno | San Cristóbal | 23/07 | pre | abierto |
| 2 | JM | Uno a uno | Retiro | 24/07 | pre | abierto |
| — | JM | Encuentro Temático | Orden Público | 28/07 | — | **resuelto** |
| — | JM | Uno a uno | San Cristóbal | 23/07 | POST | abierto |
| — | JM | Uno a uno | Retiro | 24/07 | post | abierto |
| — | Ministros | Reuniones de la semana | 24/07 al 30/07 inclusive | — | acumulado | abierto |
| 6 | M2 | Campañas y enviados de la semana | 24/07 al 30/07 | — | — | abierto |

Comentario adicional, sobre el tercer bloque de Comunicaciones Post:
**"ESTE ESTA DE MÁS, SOLO TENEMOS 2 POST"**.

### Lo que el temario enseña

1. **La numeración es del temario, no de la slide.** Aparecen "2)" y "6)" sueltos: la
   lista original está numerada y sólo algunos comentarios arrastraron el número.
2. **`pre` y `post` son la misma reunión con datos distintos.** San Cristóbal 23/07 y
   Retiro 24/07 aparecen dos veces cada uno. `pre` = convocatoria (alcance objetivo,
   inscriptos). `post` = resultados (comunicaciones posteriores).
3. **La cantidad de bloques es variable.** Dos posts esa semana, tres en la plantilla.
4. **No todos los ítems son reuniones.** Ministros y M2 son bloques agregados de
   período, no encuentros individuales. Comparten la lista pero no la mecánica.

---

## 2. `REUNIONES` — esquema propuesto

Mismo patrón que `CAMPANAS`: curado a mano, porque los nombres son inconsistentes entre
fuentes y el temario es una decisión humana, no un filtro.

| columna | tipo | ejemplo | notas |
|---|---|---|---|
| `orden` | número | `2` | orden en el informe |
| `eje` | texto | `JM` | `JM` / `Ministros` / `M2` |
| `tipo` | texto | `Uno a uno` | `Uno a uno` / `Encuentro Temático` / `ECV` / `Primera persona` / `Agregado` |
| `nombre` | texto | `Retiro` | barrio, comuna o tema |
| `fecha` | fecha | `24/07/2026` | fecha del encuentro |
| `etapa` | texto | `pre` | `pre` / `post` / vacío |
| `mostrar` | texto | `sí` | filtro de emisión |
| `texto_original` | texto | `2) JM \| Uno a uno en Retiro 24/07 (pre)` | la línea cruda del WhatsApp |
| `notas` | texto | | |

### `texto_original` no es decorativo

Es el seguro contra el parseo silencioso. El motor **propone** una interpretación de la
línea cruda; la persona la confirma o la corrige. Nunca parsea callado.

Es el mismo criterio que gobierna `CAMPANAS` y la misma razón: un parseo que falla
ruidosamente cuesta un minuto; uno que acierta mal produce un informe plausible sobre la
reunión equivocada.

### Consecuencia sobre la clave de match

El handoff registró que la clave del match humano (`digital/RDV JM 2 VECES`) es
**`(Funcionario, Barrio, Fecha)`**. El temario agrega una dimensión:

**`(Funcionario, Barrio, Fecha, Etapa)`**

**Pendiente de verificar:** si `RDV JM 2 VECES` distingue `pre` de `post`. Si no lo hace,
el conjunto de control cubre sólo la mitad del problema y hay que saberlo antes de usarlo
para validar el anclaje.

---

## 3. Diff entre las dos plantillas SECCO

| | deck con comentarios | plantilla vigente |
|---|---|---|
| ID | `1yIlCIBGJHsJBNLaMDqBNf75b2gzyMVnlwB5JJArNZv0` | `1_ZKjWhL-bhCP8yHQ8PJ33ymyjSXu3thh7MKMOxB4-n8` |
| comentarios | 8 (el temario) | ninguno |
| slides Uno a uno | **2** | **1** |
| sección Primera persona | presente, **sin marcar** | eliminada |
| `ecv_insc_ivr` | no existe | **agregado** |

### 3.1 La segunda slide de Uno a uno se borró

En el deck viejo el bloque de Uno a uno aparecía dos veces —una por reunión— pero
**ambas con exactamente los mismos tokens**: `{{ecv_comuna}}`, `{{ecv_fecha}}`,
`{{ecv_asistentes}}`, `{{ecv_minutos}}`, `{{u1_bench_*}}`. De haberse corrido así, Retiro
habría mostrado los números de San Cristóbal, sin error visible.

En la plantilla vigente hay **una sola**. El riesgo de duplicación desapareció, pero el
problema se invirtió: una semana con dos Uno a uno no entra en una sola slide.

**Conclusión: el bloque de encuentro debe emitirse por reunión**, iterando `REUNIONES`
filtrada por `mostrar=sí` y ordenada por `orden` — exactamente la mecánica ya definida
para `CAMPANAS`. Vale igual para el bloque `post_camp*`.

### 3.2 "Primera persona" fue eliminada

Tenía la misma estructura que Encuentro Temático (Estrategia + Iceberg) pero con `xx` en
vez de tokens, más un antecedente hardcodeado
(`Mismo dispositivo: 27/04 (Pauls) | 727 inscriptos y 128 asistentes (18%)`).

Ya no está. Si el temario vuelve a traer una Primera persona, hay que marcarla —
presumiblemente reusando `et_*` + `enc_*`.

### 3.3 El bloque de alcance objetivo pasó de 4 canales a 5

Se agregó `IVR: {{ecv_insc_ivr}} ({{ecv_insc_ivr_pct}}%)` junto a Mail, Digital, Call
Center y Difusión. Hay que sumarlo a `MARCADORES`.

### 3.4 La plantilla cambia entre semanas, a mano

Es el hallazgo estructural. Entre dos versiones separadas por días se agregaron y
quitaron slides y tokens.

**El motor no puede asumir un set fijo de slides ni de tokens.** Refuerza dos decisiones
ya tomadas: descubrir todo por hojas de registro, y que un token faltante escriba
`«FALTA:token»` en vez de romper la corrida.

---

## 4. Familias de tokens: `et_*` vs `enc_*`

Queda abierto en el handoff como "resolver naming". La lectura de la plantilla sugiere
que **no compiten**:

- **`et_*`** — identidad y estrategia del Encuentro Temático: `et_nombre`, `et_fecha`,
  `et_mail`, `et_ivr`, `et_cc`, `et_directa`, `et_convocatoria`, `et_post_periodo`,
  `et_digital`. Es texto descriptivo, no métrica.
- **`enc_*`** — el bloque de métricas (el "iceberg"): `enc_audiencia`,
  `enc_mails_enviados`, `enc_llamados`, `enc_e75`, `enc_or`, `enc_ctor`, `enc_ctr`,
  `enc_alcance`, `enc_base_total`, `enc_base_llamada`, `enc_ll_contactados`,
  `enc_ll_efectivos`, `enc_marque1`, `enc_atendidos`, `enc_impresiones`.

Si es así, `enc_*` es la familia reusable por cualquier tipo de encuentro y **no hay que
renombrar nada**. Marcado como hipótesis: confirmar contra la plantilla JM antes de
cerrarlo.

**Nota aparte:** `ecv_*` se usa en las slides de Uno a uno (`ecv_comuna`, `ecv_fecha`,
`ecv_asistentes`, `ecv_inscriptos`, `ecv_poblacion`). O bien `ecv_` es genérico
"encuentro con vecinos", o hay una inconsistencia heredada. Sin decidir.

---

## 5. Respuestas a preguntas abiertas del handoff

### Ministros va acumulado

El comentario lo dice explícito: *"Del 24/07 al 30/07 inclusive - **Acumulado**"*.
Además `{{emin_lista}}` ("Encuentros contempladas") **imprime la lista de reuniones en la
slide** — o sea que `REUNIONES` no sólo dirige la búsqueda de datos, también alimenta
texto del informe.

### M2 tiene ambigüedad en los bordes del período

*"Acá, el día del cierre que sería 30/07, tenemos campañas que llevamos y campañas que
no. Lo mismo para el día 23/07, tenemos campañas que entran y otras que no."*

M2 **tampoco se resuelve por filtro de fecha**. En los días de borde la inclusión es una
decisión humana. Es el mismo argumento que sostiene `CAMPANAS` con `mostrar=sí`, ahora
confirmado por el equipo.

Responde parcialmente la pregunta abierta sobre acumulación: el problema no es sólo si
los números se acumulan, es **qué campañas entran** en la ventana.

### `post_camp3` sobra

*"ESTE ESTA DE MÁS, SOLO TENEMOS 2 POST"*. El comentario no está en la plantilla vigente
pero **el token sigue ahí**. Argumento adicional para que el bloque post sea dinámico.

---

## 6. Hardcodeados detectados en la plantilla vigente

Candidatos a `CONFIG` o a token, hoy escritos a mano:

**Fechas viejas** (en un deck de julio):
- `Febrero 2026` (portada de sección)
- `Seguimiento Mayo 2026` (sección Análisis y Datos)

Son el modo de falla caro en su forma más pura: un informe de julio que dice mayo, y
nadie lo mira dos veces.

**Benchmarks:**
- Mail: OR 22%, CTOR 3%
- IVR: Escucha +75%: 40%
- Digital CTR: 1,3% (temáticas) / 0,2% (ministros)
- VTR: ECVs 60%, Uno a uno 55%, Temáticas 44%, Primera persona 27%

**Contenido de ejemplo sin token:**
- Temas de conversación: `Tormenta Negra`, `Coparticipación`, `Htal Clínicas`
- Canales RRSS: `a_l`, `music_noe`, `fac`
- `zz` en la slide de respuestas
- Los `xx` del índice y de varias tablas

---

## 7. Pendientes que abre este documento

- [ ] Verificar si `digital/RDV JM 2 VECES` distingue `pre` / `post`
- [ ] Confirmar `et_*` vs `enc_*` contra la plantilla JM
- [ ] Decidir si `ecv_*` es genérico o inconsistencia heredada
- [ ] Agregar `ecv_insc_ivr` / `ecv_insc_ivr_pct` a `MARCADORES`
- [ ] Crear la hoja `REUNIONES` con el esquema de §2
- [ ] Definir cómo se carga el texto de WhatsApp (pegado crudo + parseo propuesto)
- [ ] Cargar el ID de la plantilla vigente en `INFORMES`
- [ ] Mover benchmarks a `CONFIG`
- [ ] Emitir bloques de encuentro y de post dinámicamente, no como slides fijas
- [ ] Definir si el deck con comentarios se archiva y dónde queda el registro del temario

---

## 8. Principio que confirma la sesión

El handoff del 31/07 cerró con: *el modo de falla caro no es el que rompe, es el que
devuelve un número plausible*.

La revisión de plantillas lo muestra en un tercer lugar, después del lector y de las
herramientas de diagnóstico: **la plantilla misma**. Dos slides con tokens idénticos y
una portada que dice "Febrero 2026" no producen ningún error. Producen un informe
prolijo y equivocado.

Corolario operativo: **el token `filas` de la traza de `VISTA_PREVIA` es obligatorio**,
y conviene que la traza incluya también a qué reunión corresponde cada bloque emitido.
