# Paso 2.10 — Anclar el motor a números verificados

> Destino: `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md`
> Contexto de entrada: `docs/VALIDACION_2026-07-31.md` (nuevo, se agrega en la Parte A) y
> `casos_validacion_2026-07-31.csv`.
> Continúa a `Paso-2.9 v2`, del que **corrige la Parte B**.
> **Trabajamos en español.** Todo comentario, nombre de función y mensaje de UI, en español.

---

## Por qué existe este paso

Por primera vez tenemos las tres cosas de la misma fecha: el informe publicado del 31/07,
las cuatro bases descargadas el mismo día, y el mensaje de WhatsApp que originó el temario.
Se validaron **37 números al dígito** y se identificaron **5 causas** para los que no cierran.

Eso cambia dos cosas del plan y habilita el corte vertical con un criterio de éxito que ya
no es "el motor corrió" sino "el motor devolvió 753 y la base dice 753".

**Regla que gobierna todo el paso: ningún cambio se da por bueno hasta que un caso de
`VALIDACION` pasa en verde.** No alcanza con que la función exista.

---

## Parte A — Incorporar la validación al repo

1. Copiar `VALIDACION_2026-07-31.md` a `docs/`.
2. Copiar `casos_validacion_2026-07-31.csv` a `docs/`.
3. En `docs/Sesiones/`, archivo nuevo `HANDOFF_2026-07-31-2.md` que registre, en tres
   párrafos: que se validó contra el informe publicado, que la hipótesis del colapso del
   lector queda desmentida, y que el corte vertical pasa a ser Orden Público 28/07.
   **Convención de `PROYECTO.md` §9: archivo nuevo, nunca editar uno anterior.**

No tocar código en esta parte.

---

## Parte B — `filas_datos` cuenta filas vacías (corrige el Paso 2.9 Parte B)

### El hecho

```
M2 periodo DIRECTA — filas totales: 29.534 · filas con algún dato desde la fila 4: 18
```

Las 29.515 restantes son relleno de fórmula. **`leerFuente` está bien: devolvió 18 porque
hay 18.** La hipótesis del colapso por clave era falsa.

### Tarea

1. En el inventario que escribe `SOLAPAS`, cambiar `filas_datos` para que cuente **filas con
   al menos una celda no vacía tras `trim()`**, no `getDataRange().getNumRows()`.
2. Agregar la columna `filas_crudas` al lado, con el valor viejo. La diferencia entre ambas
   **es el diagnóstico**, y perderla sería perder la evidencia.
3. Recalibrar el guardarraíl de cobertura contra `filas_datos` corregido, y reportar
   **siempre el porcentaje**, con ⚠ bajo 90% — como ya quedó anotado en el handoff del 31/07.
4. Volver a correr el inventario y **anotar en el handoff las nuevas brechas de `rdv`
   (720/1362), `digital` (960/1297) y `looker` (903)**. Ya no tienen explicación común. Si
   quedan explicadas por relleno de fórmula, decirlo; si no, dejarlas abiertas. No inventar
   una causa.

### Criterio de aceptación

`SOLAPAS` muestra `m2/M2 periodo DIRECTA` con `filas_datos=18`, `filas_crudas=29534`, y el
diagnóstico deja de reportar un colapso que no existe.

---

## Parte C — Las solapas `periodo` bajan a `referencia`

### El hecho

El día del informe de la semana 24–30/07, los períodos escritos a mano en la fila 1 eran:

| solapa | período | filas con dato |
|---|---|---|
| `m2/M2 periodo DIRECTA` | 03/07 → 10/07 | 18 |
| `m2/M2 periodo DIGITAL` | 22/05 → 29/05 | 13 |
| `m2/Mail per` | 03/07 → 10/07 | 70 |
| `digital/Mail per` | 10/07 → 11/07 | 4 |

Cuatro recortes distintos, ninguno el del informe. **Son vistas cuyo alcance depende de dos
celdas editables.**

### Tarea

1. En `SEED_SOLAPAS_`, poner las cuatro en `uso=referencia`, `origen=seed`, con
   `notas='vista con período manual en fila 1 — no es fuente; ver VALIDACION_2026-07-31 §1.2'`.
2. Verificar que **ninguna fila de `MAPEO` apunte a esas cuatro solapas**. Si alguna apunta,
   reapuntarla a la tabla de detalle correspondiente (`m2/M2 Directa`, `digital/Directa Mail`)
   y dejar constancia.
3. Respetar la regla ya establecida: la siembra pisa `auto` y `seed`, **nunca `manual`**.

### Criterio de aceptación

Las 9 solapas en `revisar` bajan a 5. Ninguna fila de `MAPEO` lee una solapa `periodo`.

---

## Parte D — La hoja `VALIDACION`

Es la pieza central del paso. Sin esto, cada corrección posterior es una opinión.

### Esquema

| columna | contenido |
|---|---|
| `caso_id` | `V-01` … `V-37`, `D-01` … `D-06`, `X-01` … `X-05` |
| `bloque` | agrupador (`et_orden_publico_2807`, `camp_cadetes`, …) |
| `token` | token propuesto |
| `esperado` | el valor del informe publicado del 31/07 |
| `base`, `solapa`, `clave`, `columna`, `operacion` | la traza de dónde sale |
| `estado_esperado` | `exacto` / `deriva` / `sin_fuente` |
| `obtenido` | lo escribe el motor |
| `delta` | `obtenido - esperado` |
| `resultado` | ✅ / ⚠ / ❌, lo escribe el motor |
| `nota` | libre |

### Tarea

1. Crear la hoja en `HOJAS_CONFIG_` y **sembrarla desde `docs/casos_validacion_2026-07-31.csv`**.
   No transcribir los valores a mano en el código: leerlos del CSV o pegarlos como bloque
   único y verificable.
2. Escribir `menuCorrerValidacion_()`: por cada fila con `estado_esperado != 'sin_fuente'`,
   resolver la traza, escribir `obtenido`, `delta` y `resultado`, y mostrar un resumen
   `N ✅ · N ⚠ · N ❌`.
3. Semántica de `resultado`, y es lo que hace útil a la hoja:
   - `estado_esperado=exacto` → ✅ sólo si `delta == 0`. Cualquier otra cosa es ❌.
   - `estado_esperado=deriva` → ✅ si `delta >= 0` (la base creció); ⚠ si `delta < 0`
     (la base tiene *menos* que el informe: eso no debería pasar y hay que mirarlo).
   - `estado_esperado=sin_fuente` → no se corre; se reporta aparte como pendiente.

**Por qué `deriva` se trata distinto:** entre que se arma el informe y que se descarga la
base pasan horas y las campañas siguen corriendo. Todas las diferencias medidas van en la
misma dirección y son de esa magnitud. Exigir `delta == 0` ahí haría fallar 6 casos sanos y
enseñaría a ignorar los rojos.

### Criterio de aceptación

`menuCorrerValidacion_()` corre entera sin excepciones y reporta al menos **30 de 37 casos
`exacto` en ✅**. Los que fallen se documentan uno por uno; ninguno se borra de la hoja.

---

## Parte E — El corte vertical: Orden Público 28/07

Reemplaza a la Parte G del 2.9 v2, que apuntaba a Retiro. Orden Público es mejor candidato
por una razón concreta: tiene **12 tokens verificados al dígito, por cuatro caminos
distintos** (RDV directo, Mail por fila única, IVR por SUMA de dos filas, Looker como
fuente alternativa que coincide). Ejercita el motor entero, no una ruta.

### Los 12 tokens

| token | valor | fuente | operación |
|---|---|---|---|
| `enc_inscriptos` | 753 | `rdv/RVD JM-CM - ES` | VALOR |
| `enc_asistentes` | 199 | idem | VALOR |
| `ecv_insc_mail` | 361 | idem, col `Mail` | VALOR |
| `ecv_insc_digital` | 180 | idem, col **`RRSS`** | VALOR |
| `ecv_insc_cc` | 169 | idem, col `Call Center` | VALOR |
| `ecv_insc_ivr` | 43 | idem, col `IVR` | VALOR |
| `enc_mails_enviados` | 44.043 | `digital/Directa Mail`, id 3387 + fecha 25/07 | VALOR |
| `enc_mails_entregados` | 43.439 | idem | VALOR |
| `enc_or` | 4.652 | idem | VALOR |
| `enc_ctor` | 145 | idem | VALOR |
| `enc_llamados` | 78.637 | `digital/Directa IVR`, id 3387 | **SUMA (2 filas)** |
| `enc_atendidos` | 71.234 | idem | **SUMA (2 filas)** |

### Dos trampas, y son el punto del ejercicio

**`ecv_insc_digital` = 180 sale de la columna `RRSS` de RDV, no de la fuente digital.**
Son inscriptos que llegaron por redes. Cablearlo a `digital_impresiones` devolvería un
número creíble y de otra magnitud. Es el modo de falla caro en su forma más pura, y hay que
dejarlo escrito en el comentario del código.

**`enc_mails_enviados` = 44.043 es UN envío, no la cuenta.** La cuenta `3387-JULJDGGC`
acumula 271.701 enviados en 5 envíos. La lámina de convocatoria usa el envío de
convocatoria. Un `SUMA por id_cuenta` da 6 veces el valor correcto.

Antes de resolver esto agregando una columna de rol, **revisar la columna `Nomenclatura`
de `Directa Mail`**: ya trae marcas del tipo `... Conv ...`, `... Pre ...`, `... Post ...`
en varias filas. Si sirve, no hay que inventar nada. Si no sirve, decirlo y recién ahí
proponer la columna.

### Tarea

1. Cablear los 12 en `MARCADORES`.
2. Emitir a `VISTA_PREVIA` con la traza obligatoria: valor · base · solapa · columna ·
   operación · **`filas` (cuántas entraron)** · reunión a la que corresponde el bloque.
   El token `filas` es lo que hace visible cualquier problema de lectura, y el de reunión es
   lo que evita que dos bloques muestren el mismo dato — que es exactamente lo que pasaba en
   la plantilla vieja con las dos slides de Uno a uno.
3. `enc_llamados` y `enc_atendidos` deben mostrar `filas=2`. Si muestran `filas=1`, hay un
   colapso real y ahí sí hay que mirar el lector.

### Criterio de aceptación

Los 12 en `VISTA_PREVIA` con traza completa, y los 12 casos correspondientes de `VALIDACION`
en ✅.

---

## Parte F — Reglas de negocio nuevas

Agregar a `docs/REGLAS_NEGOCIO.md`. Son decisiones, no código: se escriben ahora para que el
Paso 3 no las tenga que adivinar.

### R-03 · El agregado suma universos de JM y aperturas de JM+GCBA

Verificado en dos campañas, cuatro métricas, exacto al dígito:

```
Cadetes GLOBAL:
  enviados   352.487 = 163.749 + 40.293 + 148.445         ← sólo JM
  aperturas  165.688 = 101.422 + 6.685 + 8.894 + 48.687   ← JM + GCBA

1-11-14 GLOBAL:
  enviados   410.912 = 215.240 + 24.805 + 170.867         ← sólo JM
  aperturas  181.415 = 123.884 + 1.151 + 7.904 + 48.476   ← JM + GCBA
```

Racional probable: el envío GCBA va a *no apertores del envío de JM*, así que sumar su
universo duplicaría gente; sus aperturas, en cambio, son impacto nuevo.

**Marcar como hipótesis hasta que el equipo la confirme.** Es la diferencia entre 352.487 y
447.712, y el %OR resultante mezcla numerador y denominador de universos distintos.

### R-04 · El `id_cuenta` manda; el nombre nunca decide pertenencia

Dos filas reales lo obligan:

- El envío del 24/07 de 1-11-14 (215.240 mails, el 41% de la campaña) tiene
  `ID Cuentas = "Pieza"` y `Eje`/`Área` = `"Revisar"`. Looker suma 308.095 en lugar de
  523.335, sin avisar.
- El envío GCBA del 20/07 de cadetes tiene el id correcto (`3305-JULSEGGJ`) y el nombre de
  otra campaña: `"Vacunación Antirrabica Animales"`.

**Tarea asociada:** agregar al diagnóstico un control de **filas con métricas y sin
`id_cuenta` válido**, por base y por solapa. Habría cazado el primer caso al instante. Es
barato y es el único control que detecta este modo de falla.

### R-05 · `fecha_corte` es obligatoria

Todas las diferencias entre el informe y la base van en la misma dirección: la base tiene
más, porque las campañas siguieron corriendo. Sin una fecha de corte declarada, cada corrida
va a diferir por unos cientos y nadie va a poder distinguir un bug del paso del tiempo.

`Snapshot.gs` (hoy vacío) deja de ser opcional.

---

## Parte G — `REUNIONES`: tres columnas que faltan

El temario del 31/07, ya cargado, muestra tres cosas que el esquema actual no soporta:

1. **`bloque`** — el mensaje tiene tres: `Cercanía y M2`, `Campañas destacadas`, `DGAYD`.
   Cada uno numera desde 1. El parser actual asume lista plana y va a colisionar los `orden`.
2. **`orden_informe`** — el informe no respeta el orden del temario: arranca por DGAYD
   (láminas 4–10) y mete Cercanía después. `orden` es del temario; el de emisión es otro.
3. **`mostrar` necesita `pendiente`** — dos ítems decían *"en caso de que llegue el
   material"*. Uno entró sin métricas, el otro no entró. `sí`/`no` no alcanza.

Cargar el temario del 24–30/07 completo en `REUNIONES`, con `texto_original` literal, como
juego de prueba del parser. **Ninguna fila arranca con `mostrar='sí'`: eso lo decide la
persona.**

---

## Lo que NO hay que hacer en este paso

- **No buscar el filtro que reproduce la lámina M2.** No existe: la lista incluye campañas
  con `Eje = Movilidad` y `Eje = Cuidado`. Es curada, y eso confirma el criterio `CAMPANAS`.
- **No intentar reproducir Ministros, Registro Civil ni DGAYD.** Son preguntas para el
  equipo, no problemas de código. Quedan como `X-01` a `X-05` en `VALIDACION`.
- **No automatizar el POST digital de los Uno a uno.** No está en ninguna base. Que emita
  `«FALTA:token»` y se vea.
- **No sembrar las ~200 filas de `MARCADORES`.** Sigue bloqueado por la armonización de
  plantillas. Doce tokens que cierran valen más que doscientos que no se pueden verificar.

---

## Orden sugerido

`B` → `C` → `D` → `E` → `F` → `G` → `A`

`B` y `C` son baratos y sacan ruido del diagnóstico. `D` antes que `E` porque sin la hoja de
validación el corte vertical no tiene contra qué medirse. `A` al final para que el handoff
registre lo que efectivamente pasó, no lo que se planeaba.

---

## Nota de método, que ya va tres veces

*El modo de falla caro no es el que rompe: es el que devuelve un número plausible.*

Esta validación lo encontró dos veces más — `RRSS` disfrazado de digital, y un envío de
215.240 mails sin `id_cuenta` — y una tercera en dirección incómoda: **la hipótesis del
colapso del lector también era plausible.** Explicaba cuatro síntomas con una causa y se
derivaba de un buen instinto. Era falsa. La única defensa fue abrir el archivo y contar
filas.

De ahí que este paso ponga la hoja `VALIDACION` antes que el corte vertical, y no al revés.

---

> **Nota de equivalencia (DOC-6 Parte B, 01/08/2026) — no modifica el texto de arriba.**
> Los IDs `R-03` / `R-04` / `R-05` de este documento corresponden a `R-05` / `R-06` /
> `R-07` del canon vigente (`docs/REGLAS_NEGOCIO.md`). Se renumeraron `+2` al consolidar,
> porque `R-03` y `R-04` ya estaban asignados a otras dos reglas; este texto no se
> modifica. Alcanza a las tres definiciones de la Parte F (§`R-03`, §`R-04`, §`R-05`).
