# 2026-08-19_1 — Campañas: del temario al deck

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que el camino completo del usuario funcione para campañas — **pega el
> temario → se cargan con su `ID Cuentas` → los `camp_*` publican** — con los nueve tokens de la
> lámina de resultados agregados.
>
> ⛔ **No toca `REUNIONES`, ni la ventana, ni la selección semanal.**

---

## ⚠ Corrección de premisa 1 — **`Campanas.gs` ya hace la resolución nombre → id, desde el 08/08**

**La sesión del 19/08 diseñó una carga a mano de tres filas de `CAMPANAS` sin saber que el
cargador de temario existía.** Medido en `HEAD 293bbab`:

`Campanas.gs` (405 líneas) ya parte el temario en bloques, encuentra *"Campañas destacadas"*,
resuelve cada nombre contra el catálogo de `digital/Seguimiento digital` —**columnas B y C, que son
`Nombre campaña | Cuentas` y `Nombre campaña | Digital`**— con **equivalencia que manda y similitud
que propone** (`CAMPANAS_equivalencias`, umbral y margen en `CONFIG`), toma `desde`/`hasta` **de la
base y no del temario**, no duplica filas, y ante la duda **entra con `mostrar = sí`** (`AJ-1`).

**`docs/PROCESO_SEMANAL.md` lo tiene documentado paso por paso y marcado `[hoy]`.**

⚠ **Consecuencia inmediata: `medirCampanasParaCarga()` reimplementó lo que `resolverIdDeCampana_`
ya hacía.** Sirvió —midió que los cuatro ids resuelven en 8 solapas— pero **no es la vía del
proceso** y no debe crecer. Queda como instrumento de medición, no como camino de carga.

### El hueco real, y es de **una línea**

`cargarTemarioCampanas_` escribe **`campana_id = el ID Cuentas`** (o `SIN_ID_<nombre>` cuando no
resuelve) y **no escribe `id_cuenta`**, porque esa columna **no existía el 08/08** — nació ayer.

Y `itemsDeSeccion_` pasa al ítem **`id_cuenta: c.id_cuenta`**, que hoy sale **vacío**.

**Entonces el temario ya trae el id, y el ítem no lo recibe.** Eso es lo que la Parte A cierra.

---

## ⚠ Corrección de premisa 2 — **`campo_id_cuenta` no se pone a mano**

Al cerrar el 19/08 quedó dicho que declarar `campo_id_cuenta = id_cuenta` en
`looker/resumen_metricas_dinamico` era edición a mano en la hoja. **Es falso: el próximo «Aplicar
configuración» la borra.**

- Es una de las **cinco columnas que siembra `aplicarClasificacionSolapas_`** —`uso`,
  `fila_encabezado`, `ventana_ref`, `campo_id_cuenta`, `notas`—;
- a diferencia de `uso`, **no está protegida por `D-32`**;
- `filaSolapa_` la incluye **siempre** en el objeto, y `upsertPorClave_` reescribe **la fila
  entera** con `(h in obj) ? obj[h] : ''`;
- la fila de esa solapa tiene **`origen = seed`**, no `manual`.

**Es `D-31` con `encabezado`, textual: una columna que el seed conoce y no declara se blanquea
sola.** Va al `SEED_SOLAPAS_`.

---

## Parte 0 — medir. Sólo lectura. **Reportar y parar.**

> **Modelo: Sonnet · effort medio.** Leer celdas, contar filas, greppear.

1. **`CAMPANAS`, volcada entera**: orden real de columnas —al 19/08 quedó `… mostrar · id_cuenta ·
   orden`— y **todas las filas** con `periodo_id`, `campana_id`, `informe_id`, `mostrar`,
   `id_cuenta`, `notas`.
2. **`CAMPANAS_equivalencias`**: ¿existe la hoja?, ¿cuántas filas tiene?
3. **`CONFIG`**: valores de `umbral_similitud_campana` y `margen_similitud_campana`. Si están
   vacíos, los defaults son `0.8` y `0.2` — **decirlo, no asumirlo**.
4. **`SOLAPAS`**: valor actual de `campo_id_cuenta` y de `origen` para
   `looker/resumen_metricas_dinamico`. Al 18/08: `` y `seed`.
5. **El grano** — filas por `id_cuenta` en `looker/resumen_metricas_dinamico`. Medido el 19/08:
   **1 de 995** para los cuatro ids.
   ⛔ **Gate: si algún id da ≠ 1, parar.** Con una fila la operación no tiene consecuencia; con
   dos, `ULTIMO` y `SUMA` dan números distintos y eso lo decide el usuario.
6. **Los ocho campos en `MAPEO`** (ver la tabla de la Parte D). Al 18/08 estaban los ocho.
   ⚠ **Reportar que `alcance` mapea a la columna `meta_alcance`.** El encabezado dice **Meta**; el
   deck dice *"Usuarios alcanzados"* sin plataforma. **Es `A-12` llegando por otro lado. No se
   resuelve acá**, se deja dicho.
7. **Cero `camp_*` en `MARCADORES`** — confirmar. Al 18/08 eran cero, sobre 78 filas.
8. **Testigo pre de `frecuencia` y `gcba_frecuencia`**, con hora: partición `4 + 22 = 26`, cuentas
   de filas y **los dos denominadores** (475.723 y 1.249.387 el 17/08).
   ⚠ **Viven en la solapa que la Parte B está por declarar.** Con la opción `A` (19/08) no deberían
   moverse —sin ítem caen a la rama general, con ventana— pero *"no debería"* es premisa, no
   medición. **Es el par que la tanda 4 cerró hace dos días.**
9. **Los dos sin fuente, para que el usuario los revise** — reportar qué hay hoy, sin cablear:
   - **`camp_dir_impl`** (*"N implementaciones"* de Directa) — candidato `digital/Directa Mail`,
     `CONTEO` por `Id cuentas`. **Medido el 19/08: 4 · 4 · 4 · 2 filas** para los cuatro ids.
     Reportar las fechas de esas filas.
   - **`camp_dig_impl`** (*"formatos digitales implementados"*) — candidato
     `digital/CAMPAÑAS_DESGLOCE_DIGITAL` (`uso = fuente`, **4904 filas**, impresiones/clics/
     visualizaciones por plataforma con filtro `Id cuentas` + `Plataforma`; es la fuente de los
     `u1_*`). ⚠ **No tiene ni un `campo_logico` en `MAPEO`** — reportar cuántas filas da por id y
     cuántas plataformas distintas.

**Reportar todo junto y parar.** Las partes A–E se autorizan con ese reporte.

---

## Parte A — el cargador escribe `id_cuenta`

> **Modelo: Opus · effort alto.** Define la clave de join de toda la sección.

En `cargarTemarioCampanas_`, la fila que se arma gana **`id_cuenta: r.id`** — el id resuelto, o
**vacío** si `via = 'sin_resolver'`.

**Por qué las dos columnas y no una, aunque hoy `campana_id` traiga el mismo valor:**

- **`campana_id` es la clave de la fila** y tiene que existir siempre: cuando el nombre no
  resuelve vale `SIN_ID_<nombre>`, que **no es un id de cuenta**. Usarla como join haría que el
  motor buscara `SIN_ID_egreso_de_cadetes` en la base y **encontrara cero filas sin poder decir por
  qué**.
- **`id_cuenta` vacío significa exactamente una cosa: el temario no resolvió.** Es la señal que la
  lámina necesita para publicar un hueco visible en vez de un número.

⚠ **Y el caso que obliga a que sean dos y no un renombre:** una campaña puede entrar al informe
**sin id** —`AJ-1`, ante la duda entra— y esa fila **tiene que ser editable a mano después**. Con
una sola columna, completar el id a mano cambiaría la clave de la fila.

**No se toca `resolverIdDeCampana_`, ni los umbrales, ni el catálogo, ni la solapa de
equivalencias.** Sólo se escribe una columna más.

---

## Parte B — `campo_id_cuenta` al `SEED_SOLAPAS_`

> **Modelo: Sonnet · effort medio.** Aplicar una decisión ya tomada, por el escritor declarado.

1. La fila de `looker` / `resumen_metricas_dinamico` pasa a declarar
   **`campo_id_cuenta: 'id_cuenta'`**, con el mismo mecanismo que las dos de `reuniones`.
2. **El comentario dice por qué, en una línea:** el grano de esta solapa **es la campaña** —995
   filas, **1 por `id_cuenta`**, medido el 19/08— y la campaña es el ítem de la iteración, así que
   el recorte lo hace la cuenta y **no la fecha** (`D-30` + `R-17`: *el temario ya seleccionó*).
3. **`docs/ESCRITORES.md`**: no se agrega escritor —la fila de `SOLAPAS` ya declara que el seed
   siembra esta columna—. **Se agrega a la nota que `campo_id_cuenta` NO está protegida como
   `uso`**, y que por eso una edición a mano no sobrevive. **Es el hallazgo transversal de este
   prompt.**
4. ⚠ **No tocar ninguna otra fila de `SEED_SOLAPAS_`.** Las de `digital` **no llegan a esta rama**
   —la rama de `digital` las atrapa antes— así que declararles la columna no cambia nada y sí mueve
   filas de una hoja curada.

**Después de aplicar, correr el testigo de `0.8` otra vez.** ⛔ **Si la partición o los
denominadores se movieron, parar antes de la Parte D.**

---

## Parte C — el formato que marca un número **a revisar**

> **Modelo: Sonnet · effort medio.** Una línea en el formateador y su prueba.

**Decisión del usuario, 19/08: un número que no está confirmado se publica igual, entre guiones.**
`-8,89-` en vez de `8,89`.

**Cómo entra: como sufijo `_revisar` sobre cualquier formato existente.**
`formatearValorMarcador_` aplica el formato base y **envuelve el resultado en guiones**. Así valen
`numero_revisar`, `miles_revisar`, `porcentaje_sin_signo_revisar` sin escribir cuatro formatos.

**Tres razones para que sea un formato y no un estado nuevo:**

1. **Los cuatro estados ya están cerrados y `REVISAR` significa otra cosa** —valor **vacío** con
   rechazos (`R-18` addendum 1)—. Reusar ese nombre para *"hay número pero no confía"* rompería la
   afirmación que el estado hace.
2. **Quitar la marca el día que se confirme es editar una celda de `MARCADORES`.** Sin `clasp
   push`. Es `D-01`.
3. **El valor crudo no cambia** — sigue siendo el que se audita; los guiones son pintura.

⚠ **Y el límite, que va escrito en el código:** esto marca **desconfianza declarada por una
persona**, no un estado que el motor midió. **El motor no puede poner ni sacar ese sufijo solo.**

**Prueba** (`tools/`, sin red y sin planilla): que `numero_revisar` sobre `8.891…` dé `-8,89-`, que
`miles_revisar` dé `-3.042.983-`, que el sufijo **no rompa** ninguno de los cinco formatos ya
existentes, y el **control negativo**: `numero` sigue dando `8,89` sin guiones.

---

## Parte D — el alta de los nueve

> **Modelo: Opus · effort alto.** Cada fila publica un número en un deck.

**Por `curarMarcadores_(quitar, agregar)`**, la puerta declarada para agregar filas enteras por
decisión de una persona. ⚠ **No hay `SEED_MARCADORES_` y no lo va a haber** (`D-17`).

Todas con `informe_id = jm`, `familia = camp`, `dimensiones` **vacío**, `filtro` **vacío**:

| `marcador` | `base_id` | `solapa` | `campo_logico` | `operacion` | `formato` |
|---|---|---|---|---|---|
| `camp_impresiones` | `looker` | `resumen_metricas_dinamico` | `dig_impresiones` | `ULTIMO` | `miles` |
| `camp_visualizaciones` | `looker` | `resumen_metricas_dinamico` | `dig_visualizaciones` | `ULTIMO` | `miles` |
| `camp_clics` | `looker` | `resumen_metricas_dinamico` | `dig_clics` | `ULTIMO` | `miles` |
| `camp_alcance` | `looker` | `resumen_metricas_dinamico` | `alcance` | `ULTIMO` | `miles` |
| `camp_entregados` | `looker` | `resumen_metricas_dinamico` | `mail_entregados` | `ULTIMO` | `miles` |
| `camp_aperturas` | `looker` | `resumen_metricas_dinamico` | `mail_aperturas` | `ULTIMO` | `miles` |
| `camp_ctor` | `looker` | `resumen_metricas_dinamico` | `mail_clics/mail_aperturas` | `PCT` | `porcentaje_sin_signo` |
| `camp_frecuencia` | `looker` | `resumen_metricas_dinamico` | `dig_impresiones/alcance` | `RATIO` | `numero_revisar` |
| `camp_titulo` | `digital` | `Seguimiento digital` | `sd_campana_cuentas` | `ULTIMO` | `texto` |

### Las cinco decisiones que hay adentro

**1 · `ULTIMO` y no `SUMA`, aunque con una fila den lo mismo.** Es la que hay que justificar:
`imp_total`, `mail_entregados` y `mail_aperturas` —los hermanos que ya publican esas medidas— usan
`SUMA`. **El grano es distinto y por eso la operación también:** aquéllos leen solapas con muchas
filas por cuenta y su trabajo es agregarlas; acá la lectura por cuenta devuelve **una sola fila**
(gate `0.5`). ⚠ **El desempate es qué pasa el día que haya dos:** `SUMA` sumaría en silencio un
alcance —que es deduplicado y no se suma— dando un número grande y plausible; `ULTIMO` **elige por
fecha y lo dice en la traza**. Es el criterio que hizo que `ULTIMO` dejara de ser *"la última
posición del array"* el 12/08.

**2 · `camp_frecuencia` es el `RATIO`, no la columna `frecuencia_total` (col M).** La solapa tiene
las dos vías. **Se elige el ratio porque el hecho «frecuencia» ya tiene una sola definición en este
motor** —`frecuencia`/`gcba_frecuencia`, tanda 4, `RATIO dig_impresiones/alcance`— y leer la
columna acá crearía **dos definiciones del mismo hecho**, que es exactamente lo que `D-33` terminó
de cerrar hace dos días. El ratio además **deja numerador y denominador en la traza**, que es lo
que permitió cerrar la tanda 4.
⚠ **Va con `_revisar` porque `X-19` sigue abierta:** el deck publica **8,4** para `3305` y eso **no
es** el ratio (`28.253.288 / 3.178.282 = 8,89`) **ni** `looker/ALCANCE` (2,27). **El número que
salga es del motor, y no hay que reproducir el 8,4.**
**La Parte 0 mide la col M igual**, como control: si difiere del ratio, es un hallazgo y se anota.

**3 · `camp_titulo` sale de la base, no de `CAMPANAS.nombre`.** Decisión del usuario, 19/08: el
título es **`Nombre campaña | Cuentas`**. Es la misma columna contra la que
`catalogoDeCampanas_` resuelve el id, así que **lo que se publica y lo que se matcheó son el mismo
texto** — y `CAMPANAS.nombre` queda como el nombre del temario, que es lo que la persona escribió.
⚠ **Llega por la rama de `digital`** (unión por cuenta): `sd_campana_cuentas` ya está en
`CAMPOS_DIMENSION_MAESTRA_`. **Requiere el `id_cuenta` del ítem** — o sea, depende de la Parte A.

**4 · `dimensiones` vacío, y NO es una excepción a la regla del 17/08.** *«Todo marcador nuevo nace
con el corte en `dimensiones`»* — y **estos no tienen corte**. La campaña no es una dimensión: es
**el ítem de la iteración** (medido el 18/08) y ya es contexto por dos vías. Ponerle `campana=X` a
un marcador que se emite dentro de una lámina por campaña recortaría lo mismo dos veces.

**5 · `filtro` vacío, sin guarda `!=0`.** Los `enc_*` llevan `imp_totales!=0` porque la fila del
encuentro existe siempre y el cero significa *"no hubo"*. Acá una campaña **sin fila no publica**, y
una fila con cero **es un cero real**. ⚠ **Agregar la guarda por simetría convertiría un cero
verdadero en `«FALTA»`** — el error simétrico de `D-33` addendum 2.

### `notas`

Cada fila: **fecha, prompt, vía de lectura y `SIN VALIDAR`.** Ej.: *"2026-08-19_1 — rama por cuenta
(`D-30`/`R-17`), 1 fila por id medida el 19/08. SIN VALIDAR"*. ⚠ **`SIN VALIDAR` es literal:**
ninguno de estos nueve se comparó contra un deck, y de los cuatro que sí se compararon **tres no
reprodujeron exacto** (addendum a `X-19`, 19/08).

---

## Parte E — verificar

> **Modelo: Sonnet · effort medio.** Contra criterios que la Parte 0 dejó escritos.

1. **Nueve filas nuevas, ninguna otra movida.** `MARCADORES`: **78 → 87**, y las 78 idénticas.
2. ⭐ **La traza dice `rama por cuenta`, no `agregado global`.** Es **el** control de esta tanda: si
   `campo_id_cuenta` no llegó o el ítem no trae cuenta, **igual sale un número** —el agregado de
   995 filas— y va a ser grande y plausible. ⚠ **Leer la traza es lo único que distingue los dos
   casos.** Tiene que decir `sin recorte por ventana` y el `id_cuenta` del ítem.
3. **`frecuencia` y `gcba_frecuencia` no se movieron** — contra el testigo de `0.8`.
4. **`camp_frecuencia` sale entre guiones** en el deck, y el crudo en `VALORES` **sin** guiones.
5. **Los nueve valores por campaña, con su `id_cuenta` al lado**, en el reporte de la corrida.
   **No se comparan contra ningún deck acá** — eso es la ventana de validación, y esta tabla es su
   insumo.
6. **`node tools/listas.js` pasa**; `docs/CATALOGO_tokens.md` regenerado; snapshots versionados
   **antes y después**.

---

## Lo que este prompt **no** hace

- ⛔ **No carga campañas.** Eso lo hace el usuario con *Cargar temario de campañas* (`PROCESO_
  SEMANAL.md`, paso 2) y lo confirma en el paso 3.
- ⛔ **No cablea `camp_dig_impl` ni `camp_dir_impl`** — la Parte 0 los mide para que el usuario
  revise la solapa; cablearlos es otro prompt.
- **No toca las láminas 19 y 20** ni las cinco ranuras `camp_env*`.
- **No toca `resolverIdDeCampana_`, los umbrales, ni `CAMPANAS_equivalencias`.**
- **No hace crecer `medirCampanasParaCarga()`** — queda como instrumento de medición, no como
  camino de carga.
- **No resuelve la pieza faltante** —`informe_id` y el `periodo_id` de la corrida en la cadena—.
  ⚠ **Consecuencia sabida y aceptada: mientras no exista, toda campaña cargada sale en todos los
  informes.** Está en `PLAN.md` §3 y no es una regresión de esta tanda.
