# `_24` · El filtro de más de una condición

> **Modelo por parte.** `A` Sonnet · `B` **Opus, effort alto** · `C` **Opus, effort alto** ·
> `D` Sonnet.
>
> **No cablea ningún marcador.** Construye la capacidad y la deja verificada. El cableado de los
> tres `imp_*` es el prompt siguiente.

---

## 0 · La decisión que trae este prompt

Los tres `imp_*` necesitan tres condiciones a la vez —`nombre_campaña~=JM`, `estado=Activa`,
`Plataforma=Meta`— y el motor admite una. Este prompt agrega la conjunción.

### 0.1 · El separador es `&&`, y es decisión del coordinador

De los seis que la medición dejó libres en los dos barridos —`&&`, `;`, `::`, `^`, `AND`, `&`—:

- **`AND` se descarta por el mismo motivo que se descartó `CONTIENE` a favor de `~=`**: una
  palabra **aparecería dentro del valor** de un filtro sobre texto libre. El precedente está
  escrito y no hay razón para contradecirlo.
- **`&` solo se descarta porque no está libre en los datos**: aparece en dos URLs. `&&` sí lo
  está, y el doble carácter es justamente lo que lo separa del simple.
- **`;` se descarta por un riesgo que el barrido no mide**: es el separador de campos de CSV en
  configuraciones regionales de es-AR. Las hojas de este proyecto se exportan, y el requisito no
  negociable de `~=` era **sobrevivir a exportar la hoja**.
- **`^` y `::` sobreviven todo pero no dicen nada.** Entre dos candidatos técnicamente
  equivalentes, gana el que se entiende sin abrir la documentación — que es el criterio con el
  que se eligió `~=`.

**`&&` es ASCII 38 duplicado, no se transforma al copiar, pegar ni exportar a TSV, está libre en
los 33 textos vivos y en las 31 columnas barridas, y significa «y» para cualquiera que lo lea.**

**El contrapunto, medido y explícito:** `&` simple aparece en dos URLs de los datos. **El parseo
tiene que cortar en `&&` y nunca en `&`**, y eso lleva prueba propia — una URL con `a&b` no puede
partirse en dos condiciones.

### 0.2 · Sólo `AND`. No hay `OR`, y es a propósito

`OR` exige precedencia, paréntesis y una gramática de verdad. **No hay ni un caso medido que lo
pida**: los 33 textos vivos son de una condición y las nueve demandas nuevas —tres `imp_*`, seis
`pauta_*`— son todas conjunciones.

Y hay un caso que **parece** `OR` y no lo es: `imp_prog` es «todo lo que no es Meta ni Google ads»
(`R-24`), que se escribe con dos negaciones en conjunción —`Plataforma!=Meta && Plataforma!=Google
ads`— y no con una disyunción. **La regla por resta ya evitó el `OR` sin proponérselo.**

Si algún día aparece una demanda real de `OR`, entra con su caso y su medición. **No se construye
por si acaso.**

### 0.3 · La herencia no se toca

Hoy el filtro propio del marcador **reemplaza** al de la sección. **Eso queda exactamente igual.**

No es una omisión: **cambiarlo a que sume movería el resultado de los 33 filtros vivos**, y este
prompt no mueve ningún número. Un marcador que hoy reemplaza el filtro de su sección tiene que
seguir haciéndolo, con el mismo conteo de filas, después del cambio.

Si sumar resulta ser lo correcto, es otra decisión, con su medición del antes y el después.

---

## A · Verificación de premisas — Sonnet, sólo lectura

**A.1** Los 33 textos de filtro vivos —32 en `MARCADORES`, 1 en `SECCIONES`, 9 distintos—: listar
los 9 distintos y **confirmar que ninguno contiene `&&`**. Es la premisa que hace seguro el
cambio: si alguno lo tuviera, su significado cambiaría en silencio.

**A.2** Confirmar que `parsearFiltro_` es el **único** lugar donde se parsea un texto de filtro, y
que `valorPasaFiltro_` es la única comparación. Ya hubo tres copias de la comparación y agregar un
operador en una sola dejó a las otras **filtrando mal sin fallar**; el mismo riesgo aplica al
parseo.

**A.3** Listar **todos** los llamadores de `parsearFiltro_` y de `valorPasaFiltro_`, con qué
esperan de vuelta. La firma va a cambiar de un objeto a una lista, y **un llamador que siga
leyendo `f.campo` no va a fallar: va a leer `undefined` y filtrar mal**.

**A.4** Confirmar que los 6 `enc_*` sobre `digital/Directa Mail` filtran `mail_tipo=Convocatoria`
sin cortar por remitente, mientras sus hermanos `mail_*`/`gcba_mail_*` sí cortan. **Reportar y no
tocar** — puede que la iteración por encuentro ya acote, o puede faltarles la figura. Es de la
rama de validación, no de acá.

**Si A.1 a A.3 confirman, seguir sin volver a preguntar.**

---

## B · El diseño — Opus

- **`parsearFiltro_` devuelve una lista de condiciones**, no un objeto. Una condición sola es una
  lista de uno: **no hay dos caminos, hay uno con n = 1**. Ésa es la forma que evita que el caso
  viejo y el nuevo diverjan.
- **Cada condición se parsea con la lógica de hoy**, sin cambios: el orden de `OPERADORES_FILTRO_`
  —`!~=` antes que `~=` antes que `!=` antes que `=`— sigue igual y sigue siendo el que evita que
  `!=` se lea como `=`.
- **Se cortan primero las condiciones y después los operadores.** Al revés, un valor con `&&`
  rompería el corte.
- **Errores con la condición señalada.** Si la tercera de tres está mal escrita, el motivo dice
  cuál. Un `filtro_mal_escrito` sobre un texto de tres condiciones es inútil si no dice dónde.
- **Todas las condiciones se resuelven contra `MAPEO` antes de filtrar**, y si una falla, falla el
  filtro entero con su motivo. **Nunca se aplica un subconjunto**: filtrar por dos de tres da un
  número plausible sacado del universo equivocado.
- **La guarda del filtro heredado se mantiene por condición.** Un filtro de sección cuyo campo no
  está mapeado para esta solapa **no se aplica y no es error** — sin eso, `comunicaciones_post`
  rompería todos sus marcadores. Con varias condiciones, la pregunta nueva es qué pasa si **una
  sola** de las heredadas no mapea. **Decidirlo, escribirlo y decir qué se descartó.**
- **La traza dice las condiciones aplicadas y cuántas filas quedaron después de todas.** No un
  desglose por condición: eso es ruido. Pero si quedan cero, **sí** hay que poder saber cuál las
  cortó, o un filtro de tres condiciones se vuelve imposible de depurar.

---

## C · La implementación — Opus

**Greppear todo nombre nuevo antes de escribirlo.**

**El control de no-regresión es el criterio principal, y va antes que cualquier caso nuevo:** los
9 textos distintos de filtro vivos, corridos antes y después, **tienen que dar exactamente el
mismo conteo de filas**. Predicción escrita antes, medición después, las dos columnas al lado.

**Casos de prueba en `Pruebas.gs`**, y estos cinco no pueden faltar:

1. Una condición sola: idéntico a hoy.
2. Tres condiciones, todas verdaderas; y tres con una falsa.
3. **Un valor que contiene `&` simple** —una de las dos URLs medidas— **no se parte**.
4. Una condición mal escrita entre dos buenas: falla, y el motivo **dice cuál**.
5. Una condición cuyo campo no está en `MAPEO`: falla entera, **no filtra por las otras dos**.

**No cablear ningún marcador.** La capacidad se prueba con los filtros que ya existen y con los
casos de `Pruebas.gs`.

---

## D · Documentación — Sonnet

- **El comentario de `OPERADORES_FILTRO_`** suma la conjunción, con **la medición que eligió `&&`
  y los cinco descartados con su motivo**. Ese comentario es el lugar donde ya vive la
  argumentación de `~=`; es el mismo lector.
- **`REGLAS_NEGOCIO.md` o `PLAN.md`** — la decisión, con el número que esté libre al escribirla.
  **No anunciarlo antes.** Incluir §0.2: no hay `OR`, y por qué.
- **`TOKENS.md` o donde se documente la sintaxis de `filtro`** — la forma nueva, con un ejemplo
  real de los que vienen: `nombre_campaña~=JM && estado=Activa && Plataforma=Meta`.
- **`BITACORA.md`** — el control de no-regresión con sus dos columnas, y `A.4` como hallazgo para
  la ventana de validación.

### Criterios de aceptación

1. **Los 9 filtros vivos dan el mismo conteo de filas que antes.** Es el único que no se negocia.
2. Los cinco casos de `C` están en `Pruebas.gs` y pasan.
3. Un valor con `&` simple no se parte.
4. La herencia sigue siendo reemplazo, no suma.
5. **Ningún marcador cableado. Ninguna plantilla tocada. `LAMINAS` intacta.**

---

## Lo que sigue

Con esto, los tres `imp_*` quedan cableables sobre `looker/DIGITAL` — y antes hay que mapear
`nombre_campaña`, `estado`, `Plataforma` e `Impresiones`, que hoy no están: **sin eso los filtros
fallan con motivo propio, que es correcto pero no es lo que se quiere.**

Y recién después se cierra el `P0`: `imp_total` y `gcba_imp_total` son derivados y se les retira
la fuente propia **cuando existan los tres sumandos**, no antes.
