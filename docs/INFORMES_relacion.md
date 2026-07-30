# Los dos informes y sus plantillas — qué comparten y qué no

> Verificado token por token contra `JM_marcada.pptx` (22 slides) y `SECCO_marcada.pptx`
> (29 slides), espejos de las plantillas canónicas
> `117I0qn1…` (JM) y `1_ZKjWhL…` (SECCO).

---

## La relación en una línea

**Dos informes, dos plantillas, un núcleo de datos compartido.** Ninguno contiene al otro:
cada uno tiene más contenido propio que común.

| | tokens |
|---|---|
| compartidos por las dos plantillas | **93** |
| solo JM | **98** |
| solo SECCO | **72** |
| unión | **263** |

No se puede generar SECCO recortando JM, ni al revés. Pero tampoco son dos sistemas: 93
tokens salen del mismo cálculo y tienen que dar el mismo número.

---

## Qué comparten

| familia | compartidos | qué es |
|---|---|---|
| `camp_*` | **53 de 53** | El bloque de campaña destacada es **literalmente el mismo**: ocho slides, cero diferencias entre plantillas. Objetivo, herramientas, formatos, resultados agregados, desagregado digital, desagregado mail, respuestas |
| `enc_*` | 16 | El iceberg del encuentro: aperturas, OR, clics, CTOR, mails enviados y entregados, contactados, efectivos, base llamada, atendidos, escucha +75%, marque 1, impresiones |
| `ecv_*` | 11 | Inscriptos y su desagregado por canal (mail, digital, call center, difusión, IVR), asistentes, población |
| `m2_*` | 8 | Solo el bloque de **M2 directa**: mails enviados/entregados, aperturas, OR, clics, CTOR, campañas, envíos |
| `rrss_*` | 4 | Solo los `c1_pct` … `c4_pct`. **Ver la trampa más abajo** |

---

## Qué es exclusivo de cada uno

### Solo JM (98)

| familia | n | qué es |
|---|---|---|
| `gcba_*` | 19 | La slide de Resumen Ejecutivo GCBA entera |
| `m2_*` | 23 | La **matriz digital de M2** (cinco categorías × impresiones/audiencia/clics/visualizaciones/campañas). SECCO no la tiene |
| `rrss_*` | 17 | `area1` … `area10`, menciones, visualizaciones, escalas, insight |
| `mail_*`, `cc_*`, `ivr_*`, `imp_*`, `pauta_*` | 21 | El Resumen Ejecutivo JM y la slide de alcance semanal por herramienta |
| `ecv_*`, `enc_*`, otros | 18 | barrios impactados, alcance potencial, audiencia de pauta |

### Solo SECCO (72)

| familia | n | qué es |
|---|---|---|
| `conv_*` | 13 | Conversación en X: menciones, vistas, usuarios, sentiment, temas |
| `rep_*` | 11 | Repercusiones por período |
| `emin_*` | 10 | Encuentros de ministros |
| `et_*` | 9 | Estrategia de comunicación del encuentro temático (textos) |
| `post_*` | 6 | Comunicaciones post |
| `u1_*` | 3 | Benchmarks del uno a uno por plataforma |
| `rrss_*`, `enc_*`, `ecv_*`, `m2_*` | 20 | `c1_txt`…`c4_txt`, clics/CTR digital, alcance, base total, llamados, minutos, comuna, implementaciones |

---

## Lo que esto implica para el motor

**1. Un token compartido es una sola fila en `MARCADORES`.** Se calcula una vez y lo consumen
las dos plantillas. Por eso los nombres del núcleo común **no pueden divergir**: si en una
plantilla el mismo concepto se llama distinto, se cablean dos filas para el mismo número y
tarde o temprano dan distinto.

**2. Y por eso mismo, un renombre nunca es "de un token": es de un concepto en dos lugares.**
Es exactamente el error de `enc_audiencia`. En JM ese nombre estaba mal (era el alcance
digital) y en SECCO estaba bien (era la audiencia de IVR). Se renombró globalmente y se
rompió el que estaba bien. **Toda lista de renombres tiene que ser por `informe_id`** —
ya está implementado así en `Armonizar.gs` desde el 2.2.1.

**3. `camp_*` es el caso ideal y conviene tratarlo como tal.** 53 de 53 idénticos: el bloque
de campaña destacada es el mismo artefacto en las dos plantillas. Se cablea una vez, se
emite N veces por informe, y cualquier cambio de diseño ahí impacta los dos informes a la
vez. Si alguna vez divergen, es un error, no una variante.

**4. La trampa de `rrss_*`: la familia es la misma, la estructura no.** 4 tokens compartidos
sobre 26. JM arma un tablero de diez áreas con menciones y escalas; SECCO arma cuatro
cuentas con su texto. Comparten solo los cuatro porcentajes. **Un nombre de familia común no
garantiza que el bloque sea compartido** — hay que mirar los tokens, no el prefijo.

**5. `m2_*` está partido en dos mitades con destinos distintos.** La parte de **directa** (8
tokens) es compartida; la **matriz digital** (23) es exclusiva de JM. Al cablear M2 hay que
saber de cuál de las dos se está hablando.

**6. Los `et_*` de SECCO son textos de estrategia, no métricas.** No los calcula el motor:
los escribe el equipo. Son candidatos naturales a `operacion=TEXTO` con `valor_fijo`, o a
salir de una hoja de textos por encuentro.

---

## Consecuencia operativa

Las dos plantillas se editan por separado y las edita el equipo. El motor no las unifica ni
las sincroniza. Lo único que tiene que mantenerse alineado es **el vocabulario de los 93
tokens compartidos**, y esa alineación se verifica, no se asume:

`inventarioPlantillas()` (menú de mantenimiento) reporta los tokens de cada plantilla. Si un
token del núcleo común aparece en una y no en la otra, o aparece con otro nombre, es una
divergencia que hay que resolver antes de sembrar `MARCADORES`.
