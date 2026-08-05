# Pedido — El corte JM / GCBA sale de `Vocero` en `Directa IVR`

**Estado:** vivo · **Fecha:** 2026-08-04 · **Ubicación:** `docs/Prompts/2026-08-04_Pedido-1_corte_jm_gcba.md`

> **Convención de nombres, desde hoy.** Los prompts que no son pasos del plan llevan
> **fecha primero y número dentro del día**: `AAAA-MM-DD_Pedido-N_tema.md`. Los `Paso-N`
> siguen como están — su número es el del plan y significa otra cosa. **Los archivos
> anteriores no se renombran:** `PLAN.md` y `BITACORA.md` los citan por nombre.

> **Va después de la corrida nocturna, no durante.**
>
> **Decisión del usuario, 04/08/2026.** El corte entre JM y GCBA no es una sola señal: es una por
> canal.
>
> - **IVR** — la columna **`Vocero`** de `digital/Directa IVR`. Esa fila trae el `id_cuenta`, así
>   que el corte se propaga por cuenta a lo que no tenga señal propia.
> - **Mail** — el **remitente**, en `digital/Directa Mail` **columna G**. Si sale de
>   `jorge.macri@buenosaires.gob.ar`, es JM.
> - **SMS** — **todo GCBA.** No hay corte que hacer.
>
> **Esto cierra el pendiente** que figuraba como "falta la marca que separa JM de GCBA en mail,
> SMS y CC", y que en `PENDIENTES_consistencia.md` estaba anotado como el error de validación
> dominante.
>
> `Vocero` **no aparece en ningún lado del repo**: no está en `MAPEO`, ni en el código, ni en la
> documentación. Es una columna viva que nunca se registró.

---

## Parte 0 — Verificación. Sólo lectura. Reportar y **PARAR**.

**0.1 · `Vocero`.** Ubicarla en `digital/Directa IVR`: en qué letra está, cuántas filas tienen
valor, y **la lista de valores distintos con su conteo**. Es lo que va a decidir cómo se escribe
el filtro, y no hay que suponer que dice exactamente "JM" y "GCBA".

**0.1 bis · El remitente, que está en dos lados.** En `digital/Directa Mail` es la **columna G**,
y el usuario no recuerda el encabezado exacto —"MAIL" o "mail remitente"—: **leerlo, no
suponerlo**. Y `docs/Prompts/DOC-3` documenta además una columna `Remitente` en **`m2/Cuentas`**,
la tabla de atributos por campaña, con `ID Cuentas`.

Reportar las dos: encabezado exacto y valores distintos con conteo. Y si coinciden entre sí para
una misma cuenta, porque si no coinciden hay que elegir cuál manda.

`m2/Cuentas` es `uso = fuente` y **no tiene ni un campo mapeado** — es una de las dos que
quedaron así.

**0.2 · La cobertura, que es lo que puede arruinar la idea.** El corte se propaga por
`id_cuenta`, así que **una cuenta que no tenga fila en `Directa IVR` se queda sin vocero**.
Reportar, sobre el universo de `id_cuenta` del libro: cuántas aparecen en `Directa IVR` y cuántas
no, y de las que no, en qué solapas sí están. Si el porcentaje sin cobertura es alto, el corte no
alcanza y hay que decirlo antes de cablear nada.

**0.3 · Consistencia.** Un mismo `id_cuenta` con **dos voceros distintos** en `Directa IVR` es un
dato roto. Reportar cuántos casos hay, con el detalle.

**0.4 · El universo de remitentes.** Listar los distintos que aparezcan, con conteo. `SECCIONES`
ya declara una sección que **se repite por remitente (JM / GCBA)**, así que el corte de mail ya
estaba previsto en el diseño del deck; lo que falta es la columna registrada. Si aparecen más de
dos remitentes, decirlo: la sección asume dos.

**Reportar `0.1`–`0.4` y PARAR.**

---

## Parte A — Registrarlo

Agregar a `MAPEO`:

- `digital/Directa IVR/vocero` → su columna;
- `digital/Directa Mail/` → **columna G**, el remitente;
- la de `m2/Cuentas` **sólo si `0.1 bis` muestra que hace falta** — si la de `Directa Mail`
  alcanza, no se mapea y se anota por qué.

**Van al seed además de la hoja**, o `upsertPorClave_` las borra en la corrida siguiente.

El `campo_logico` sigue la convención de la solapa salvo que el diccionario ya tenga un nombre
para esto — `docs/TOKENS.md` declara `camp_remitente` y `camp_bench_remitente` en la slide 22.
**Verificar antes de inventar un nombre.**

**SMS no necesita nada:** es todo GCBA y no lleva columna ni filtro.

---

## Parte B — La regla, en `REGLAS_NEGOCIO.md`

Una `R-NN` nueva —el número lo asigna el archivo— con esto:

- **El corte entre JM y GCBA es una señal por canal, no una sola.**
  - **IVR:** la columna `Vocero` de `digital/Directa IVR`.
  - **Mail:** el remitente. `jorge.macri@buenosaires.gob.ar` es JM; el resto, GCBA.
  - **SMS:** todo GCBA, sin excepción y sin columna que mirar.
- **El vocero se propaga por `id_cuenta`** a lo que no tenga señal propia. Una cuenta hereda el
  vocero de su fila de `Directa IVR`.
- **Una cuenta sin señal propia y sin fila en `Directa IVR` queda sin clasificar.** No se asume
  JM por descarte: se reporta, con el número que haya dado `0.2`.
- Los valores válidos son los que devuelvan `0.1` y `0.4`, escritos tal cual figuran en la base.
- La dirección de correo va **en la regla, no en el código**: es un valor y `CLAUDE.md` §2 no
  admite hardcodearlo. El filtro se declara en `MAPEO.valores_incluidos`.

Referenciar el pendiente que cierra, y anotar en `PENDIENTES_consistencia.md` que queda cerrado
con la fecha.

---

## Parte C — Dejarlo usable, no cablearlo

**No cablear marcadores nuevos en este pedido.** Los tokens de mail, SMS y CC dependen del
`id_cuenta` del ítem, que llega con el Paso 5.

Lo que sí: que el filtro por vocero se pueda declarar **desde la configuración**, con el
mecanismo que ya existe —`MAPEO.valores_incluidos`, el filtro declarativo del `2.16`— y no con
código nuevo. Si con eso no alcanza porque el filtro tiene que aplicarse a una solapa distinta de
la que trae la columna, **decirlo y parar**: eso es un mecanismo nuevo y lo decide el usuario.

---

---

## Parte D — Antes de decidir nada sobre mayúsculas: verificar el fundamento de `R-10`

**Sólo lectura. Reportar y PARAR.**

`R-10` normaliza espacios pero **no** mayúsculas ni acentos, y su segundo fundamento es que
**quince pares de encabezados colisionarían** si se plegara el case — tres en solapa fuente
activa, en `digital/CAMPAÑAS_DESGLOCE_DIGITAL`: `'Nombre Campaña'` vs `'nombre_campaña'`,
`'Eje'` vs `'eje'`, `'Estado'` vs `'estado'`. La regla las declara **columnas distintas con
contenido distinto**.

**Eso está afirmado, no demostrado.** La verificación del 31/07 dejó la conclusión y no los
valores. Y la firma de la solapa admite otra lectura: las cinco columnas en minúscula
—`nombre_campaña`, `eje`, `area`, `estado`, `proyecto`— están **todas juntas al final**, después
de `Prioridad`, que es el patrón de un bloque agregado aparte. Si su contenido resulta ser el
mismo, `R-10` pierde ese fundamento.

**D.1 · Comparar las tres parejas fila por fila** en las 4591 filas: `Nombre Campaña` vs
`nombre_campaña`, `Eje` vs `eje`, `Estado` vs `estado`. Reportar, por pareja: cuántas filas
coinciden exacto, cuántas coinciden plegando mayúsculas y acentos, cuántas difieren de verdad, y
**tres ejemplos de las que difieran**.

**D.2 · Las otras doce colisiones.** `R-10` dice quince pares en total. Listar los doce
restantes, con solapa y `uso`, para saber cuántos están en solapas que alguien lee.

**D.3 · La columna `JM | GCBA | POLICIA`.** Existe en esa misma solapa y es exactamente el corte
que resuelven las Partes A a C por vocero y remitente. Reportar sus valores distintos con conteo,
y **cuántas cuentas quedarían clasificadas por esta vía contra las otras dos**. Si clasifica más
y no se contradice, el diseño del corte cambia y hay que decirlo antes de cablear.

> ⚠ `CAMPAÑAS_DESGLOCE_DIGITAL` aparece en `digital` **y** en `m2` con la misma firma y las
> mismas 4591 filas. `SOLAPAS` ya lo anota: hay que saber cuál manda antes de mapear ninguna.
> **No mapear ninguna de las dos en este pedido.**

**Reportar `D.1`–`D.3` y PARAR.** Si `D.1` muestra que las parejas son la misma cosa, plegar el
case pasa a ser viable — **pero cambiar `R-10` es decisión del usuario** y no se hace acá.

---

## Parte E — Que el mapeo sobreviva a que muevan una columna

**Pedido del usuario, 04/08/2026.** Hoy `MAPEO` apunta por **letra**. Si alguien inserta una
columna en la planilla, la letra sigue apuntando a la misma posición y **el sistema lee otra
columna sin decir nada**. Es el peor modo de falla que tiene: no rompe, miente.

**Esto es genérico y más grande que el corte JM/GCBA.** Toca todas las lecturas, no sólo las tres
columnas de arriba. Si al abrirlo aparece que no entra en un paso, **decirlo y hacer primero las
Partes A a C**, que no dependen de esto.

**`R-10` ya define la normalización y nunca se implementó:** colapsar `/\s+/` a un espacio y
`trim`, preservando mayúsculas, acentos y guiones bajos, aplicada **a los dos lados** de la
comparación. Es el normalizador que este cambio necesita. **No escribir uno nuevo.**

**Consecuencia práctica, que hay que decirle al usuario:** con `R-10` tal como está, el
encabezado esperado se escribe **tal cual figura en la planilla**, con sus mayúsculas y acentos.
Si alguien renombra `MAIL` a `Mail`, el control falla y el sistema avisa — no lee mal, pero pide
una corrección. Si la Parte D muestra que plegar el case es seguro, esto se puede ablandar
después.

**El cambio:**

1. **Una columna nueva en `MAPEO`** para el encabezado esperado. Va **primero a
   `COLUMNAS_DELTA_`, y recién después a los `headers`** — al revés, la corrida intermedia cae en
   la rama sin delta y reescribe la fila 1 sobre las ~120 filas curadas. Es exactamente lo que
   pasó con `SECCIONES` y `periodo_ref`. Correr el diff antes y después; la referencia es
   `protegidas (con diferencia): 0`.
2. **Al leer:** se busca por letra, se compara el encabezado real de esa letra contra el
   esperado, normalizados los dos.
   - **Coinciden** → se usa la letra, como hoy.
   - **No coinciden** → se busca el encabezado esperado en toda la fila de encabezados. **Si
     aparece, se usa esa columna** y la traza dice que la columna se movió, de dónde a dónde.
   - **No aparece en ningún lado** → error con motivo, no un valor silencioso.
3. **Celda vacía = sin verificación**, y se comporta como hoy. Es el mismo criterio que
   `valores_incluidos`. Las ~120 filas existentes quedan vacías y **no cambian de comportamiento**.
4. **Cargar el encabezado sólo en las filas nuevas** de la Parte A. Completar las 120 es
   curaduría y va aparte.

**Control positivo:** una fila con encabezado esperado que no coincide con la letra, y cuyo
encabezado sí existe en otra columna, tiene que resolver a la columna correcta y dejarlo en la
traza.

---

## Qué NO hacer

- No editar celdas de las bases.
- No asumir los valores de `Vocero` ni del remitente: leerlos.
- No hardcodear la dirección de correo en un `.gs`.
- No clasificar como JM las cuentas sin señal.
- No mapear el resto de `m2/Cuentas`: sólo la columna que haga falta.
- No escribir un normalizador de encabezados nuevo: `R-10` ya lo define.
- No completar el encabezado esperado en las ~120 filas existentes.
- No agregar la columna a `headers` antes que a `COLUMNAS_DELTA_`.
- No cambiar `R-10`: la Parte D mide, el usuario decide.
- No mapear `CAMPAÑAS_DESGLOCE_DIGITAL`, ni la de `digital` ni la de `m2`.
- No cablear marcadores.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.

---

## Addendum — 05/08/2026 · dos partes quedaron sin objeto

> **El texto de arriba no se edita: ya se ejecutó.** Esto es un addendum fechado, la forma
> que fija `CLAUDE.md` §7 para que un documento ejecutado no quede mudo ante un error
> propio. Lo escribió la corrida nocturna del 05/08 (punto 3).
>
> Las Partes **0** y **D** corrieron el 04/08 y están en `docs/BITACORA.md`. Lo que sigue
> es lo que esas mediciones le hicieron a las partes que todavía no se ejecutaron.

**Parte A, tercera viñeta — cancelada por regla.** `m2/Cuentas` pasó de `revisar` a
**`uso = ignorar`** en `SOLAPAS`, entre el snapshot del 01/08 y la corrida. Una solapa
`ignorar` **no se lee, no se audita y no se mapea** (`CLAUDE.md` §2). Se leyó antes de
saberlo, siguiendo la instrucción `0.1 bis` de este mismo prompt, que la declaraba
`uso = fuente`: **lo leído queda como nota en la bitácora, no como mapeo**. Su columna `U`
(`Remitente`) tiene otro vocabulario que la columna G de `Directa Mail` —`GCBA` / `JM` /
`ANUNCIO` / `PDLC` contra direcciones de correo—, así que tampoco era la misma variable.

**Parte B — inaplicable a mail.** El enunciado *"el vocero se propaga por `id_cuenta`"* no
sirve para el remitente: **136 de las 880 cuentas con filas de mail mandan desde dos
remitentes distintos**, y el par más común es `infovecinos` + `jorge.macri` sobre la misma
cuenta. **El remitente es señal por envío, no por cuenta.** Para IVR sí aplica: **0 cuentas
con dos voceros**.

**Lo que queda vivo de este pedido.** Los tres canales tienen señal propia y ninguno
necesita propagación: **IVR** por su columna `Vocero` (G, `JM` 53 · `GCBA` 4, 57/57 filas
con dato), **mail** por `Mail remitente` (G) fila a fila, **SMS** todo `GCBA` por decisión.
Lo que queda **sin ninguna señal** es **el call center y la pauta digital** —y para pauta
apareció después una respuesta mejor: `digital/Digital` columna B, mapeada como
`dig_jm_gcba` (ver `Pedido-3`), que contesta *de quién es la campaña*, no *quién habla en
el audio*. **Eso es pregunta para el usuario, no trabajo pendiente de este prompt.**
