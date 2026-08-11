# Corrida nocturna — 10/08

**Cómo se lee.** Cola en orden. **Ninguna tarea espera una respuesta del usuario.** Si una se
traba, se anota y se pasa a la siguiente. **Regla de dos intentos:** si algo falla dos veces, se
anota y se sigue. Un commit por tarea, con el ID adelante.

**Modelo por tarea, declarado en cada una.** Sin declaración, Sonnet.

**Subagente `verificador` antes de arrancar**, sobre este archivo y sobre el `_25`.

---

## Las dos instrucciones nuevas del usuario, del 10/08

### 1 · No perseguir números exactos

**Los números de las bases siguen cambiando** — `looker/DIGITAL` pasó de 4.591 a 4.904 filas en un
día. Entonces:

> **El objetivo de esta corrida es que los mecanismos sean correctos y que los controles internos
> cierren. No que un valor coincida con un deck.**

Controles internos son los que se verifican **contra sí mismos**: que la partición sume, que JM +
GCBA dé el total, que dos caminos a la misma cifra coincidan, que una función corrida dos veces
escriba cero la segunda. **Ésos sí tienen que cerrar exacto.**

**Lo que no se hace: comparar contra un informe publicado.** Sigue valiendo, y ahora con una razón
más — un número que no coincide con el deck **puede ser correcto**, porque la base se movió desde
que el deck se armó. Si algo llama la atención, **se anota como pregunta para la ventana de
validación** y la corrida sigue.

### 2 · `uso = ignorar` deja de ser intocable

Se puede reclasificar una solapa cuando la medición lo justifique. **Pero con el criterio, no a
ciegas** — y el criterio es el que puso a `digital/Digital` en `ignorar`:

> **Una solapa vuelve a `fuente` si tiene datos vivos del período. Si está congelada, no.**

`digital/Digital` quedó en `ignorar` por `R-22` porque **es una tabla congelada**: informaba 1.297
filas con datos de diciembre de 2025 y daba verde. Reactivarla sin medir republicaría eso. **La
medición manda sobre las dos direcciones:** si tiene datos del período, vuelve; si sigue
congelada, se queda y se anota qué se midió.

Reclasificar **por el camino del seed**, no escribiendo la celda a mano: `aplicarClasificacionSolapas_`
pisa toda fila `origen = seed` en cada corrida.

> ⚠ **Corrección del 10/08, posterior: esta autorización queda escrita y esta corrida no la
> ejercita.** `N2` dejó de depender de reclasificar —los cuatro tokens se re-apuntan a una solapa
> que **ya** es `fuente`— y lo de las solapas en `ignorar` bajó a `N4` **como medición y nada
> más**. O sea: **ninguna tarea de esta cola cambia un `uso`.** El criterio de arriba sigue siendo
> el criterio; lo que falta para aplicarlo es la medición de rangos de fechas de `N4`.

---

## Lo que NO se hace, pase lo que pase

- **No se escribe sobre ninguna plantilla.** Leer sí. Sellar, anexar notas, `setText`: no.
- **No se compara ningún número con un informe publicado**, ni siquiera en una Parte A.
- **No se borra nada.** Snapshot antes de escribir en la planilla; si falla, la tarea no se hace.
- **No se cierra ningún paso como verificado.**
- **No se decide el nombre de una columna ni el alcance de una siembra.** Lo que no esté escrito
  se reporta.
- **No se reclasifica ninguna solapa.** Ver la corrección de arriba.

---

## `N1` · El `_25` — cablear las impresiones y cerrar el `P0`

`docs/Prompts/2026-08-10_25_cablear_impresiones.md`, completo. **Modelo: por parte, como el prompt
declara** — `A` y `B` Sonnet, `C` y `D` Opus effort alto, `E` Sonnet.

**Su Parte A termina en «reportar y parar», y de noche se resuelve así:** se sigue si `A.1` a `A.4`
confirman. **Cualquier resultado distinto para y pasa a `N2`**, con el reporte escrito.

**Los tres controles de su Parte C son controles internos y tienen que cerrar exacto.** Si uno no
cierra, **no se corre la Parte D**: `imp_total` descansa en que la partición sea una partición.

---

## `N2` · Los cuatro tokens en error, re-apuntados a `looker/resumen_metricas_dinamico` — **Opus**

**Opus porque mueve qué fuente alimenta un token publicable.**

Los cuatro que siguen en `error` en el resumen de `jm` —`enc_impresiones`, `enc_alcance`,
`frecuencia` y `gcba_frecuencia`— apuntan a `digital/Digital`, que está en `ignorar` por `R-22`.
Se re-apuntan a **`looker/resumen_metricas_dinamico`**, que ya está mapeada, es legible, tiene
`fecha_periodo` + `fecha_fin_periodo` (o sea recorte por solape, `R-16`) y `campana` para el corte
JM con `R-23`.

**Campos ya mapeados del lado destino:** `dig_impresiones`, `alcance`, `frecuencia`.

### ⚠ Antes de cablear, y es la parte que decide: la **operación** no es `SUMA` para los tres

| campo | operación | por qué |
|---|---|---|
| `dig_impresiones` | **`SUMA` tiene sentido** | las impresiones se acumulan |
| `alcance` | **`SUMA` NO** | es **gente única**, y sumar por campaña cuenta a la misma persona tantas veces como campañas la alcanzaron |
| `frecuencia` | **`SUMA` no significa nada** | es un **promedio por definición** |

**Reportar qué operación corresponde a cada uno y NO cablear `alcance` ni `frecuencia` hasta que
esté decidido.** Un `SUMA` sobre `alcance` publica un número **plausible y grande**, que es el modo
de falla que ya frenamos dos veces.

**La hipótesis a reportar, no a asumir:** `frecuencia` suele ser impresiones sobre alcance, y el
motor tiene `RATIO`. Pero si la columna de la solapa **ya trae el valor calculado por campaña**,
agregarlo sigue necesitando decidir cómo — **promedio simple o ponderado por impresiones no dan lo
mismo**.

### Los dos datos medidos el 10/08 que hacen falta para no arrancar torcido

- **Hoy los cuatro son `ULTIMO`, no `SUMA`.** `enc_impresiones` y `enc_alcance` sin filtro;
  `frecuencia` y `gcba_frecuencia` con `dig_jm_gcba=JM` / `!=JM`. O sea que la pregunta de la
  tabla de arriba **no es «cambiar `SUMA` por otra cosa»: es elegir la operación por primera vez**,
  y `ULTIMO` sobre `alcance` tampoco está justificado — sólo falla distinto.
- **El `campo_logico` cambia de nombre en dos de los cuatro.** Del lado de `digital/Digital` son
  `dig_impresiones`, `dig_alcance` y `dig_frecuencia`; del lado de `looker` son `dig_impresiones`,
  **`alcance`** y **`frecuencia`**. Re-apuntar la `solapa` sin renombrar el `campo_logico` deja el
  marcador fallando con `«FALTA:…»` — visible, pero es una corrida perdida.
- **Y el filtro también cambia de vocabulario:** `dig_jm_gcba` no existe en `looker`. El corte JM
  de esa solapa es `campana~=JM` / `campana!~=JM` (`R-23`), que es lo que ya usan `imp_total` y
  `gcba_imp_total` hoy.

**Lo que sí se puede cablear en esta corrida es `enc_impresiones`.** Los otros tres se reportan con
la operación propuesta y su motivo, y se dejan sin tocar.

---

## `N3` · La Parte B del `_19` — el escritor de columnas de `LAMINAS` — Opus

`docs/Prompts/2026-08-10_19_escritor_de_columnas_de_laminas.md`, **acotado por el `19.1`**:
**sólo la Parte B y la Parte D. La Parte C sigue fuera de alcance.**

**Verificar primero si `escribirColumnaLaminas_` ya existe** — el `_19` quedó reportado como
cerrado en un turno y acotado en otro, y **no hay reporte de que su Parte B haya corrido**. Si ya
existe, `N3` es una verificación de cinco minutos y se pasa a `N4`.

Sigue valiendo su criterio: **ninguna celda de `L-031` o `L-032` se escribe.**

---

## `N4` · Si sobra margen — Sonnet

En este orden, y **sólo lo que entre entero**:

1. **Las solapas en `uso = ignorar`, medidas — y nada más que medidas.** Para cada una: filas de
   datos hoy, qué columna de fecha tiene, y **el rango de fechas que cubre**. Ése es el dato que
   decide, no el conteo. **No se reclasifica ninguna**: la medición se reporta y la decisión es de
   otra corrida.
   - **`digital/Digital`** — la que tiene `frecuencia` e `ivr_*`. Medir si sigue congelada en
     diciembre de 2025 o si se actualizó. **Si sigue congelada, el resultado se escribe en
     `R-22`**: la regla se apoyaba en un caso fundador que ya se había medido flojo.
   - **`digital/CAMPAÑAS_DESGLOCE_DIGITAL`** — tiene el desglose por plataforma y una columna
     `JM | GCBA | POLICIA`. Fue descartada **para `imp_*`** por medición. **Para `pauta_*` nadie la
     midió.** Reportar qué unidades contables tiene y cuáles podrían ser lo que `pauta_*` cuenta.
     **No cablear**: `C-12` está abierto y se cierra en la ventana de validación.
2. **El `_21`** — las reglas de proceso a `CLAUDE.md` y la cola a `PLAN.md`. Es barato y evita que
   la próxima sesión repita el orden equivocado.
3. **`ESCRITORES.md`** — censo del 03/08, sin fila `LAMINAS`, y `tools/escritores.js` con diez
   hojas hardcodeadas contra las once de `ALCANCE_REGISTROS_`. **Las tres listas divergen.**
   Agregar `LAMINAS` a la herramienta, re-correr, y **reportar la divergencia como hallazgo** — no
   arreglarla en silencio.

**Nada de esto se empieza si no entra entero.** Cuando el margen no alcanza para terminar una
tarea, no se empieza: se reporta dónde quedó la cola. Es la regla del `17.1` §3 y ya se ejerció
bien dos veces.

---

## El reporte de la mañana

Un solo documento, legible sin abrir el repo:

- **Qué corrió, qué no, y por qué no.**
- **Las decisiones que hubo que tomar, marcadas como propias**, con lo que se descartó al lado.
- **Los controles internos, con su resultado.** Son el criterio de esta corrida: si cerraron,
  el mecanismo está bien aunque el número no se parezca a ningún deck.
- **Los conteos, con fecha y hora de lectura.** Las bases se mueven; un conteo sin fecha ya
  demostró que envejece en un día.
- **La operación propuesta para `alcance` y `frecuencia`**, con su motivo y con lo que hace falta
  decidir antes de cablearlas.
- **Las preguntas para la ventana de validación**, juntas y al final: es la lista que se pasa
  entera a la otra conversación.
- **Las premisas que se cayeron.** Es lo primero que se mira.
