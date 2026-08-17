# 2026-08-16_6 — `DIMENSIONES_` deja de ser un mapa en código y pasa a ser hoja de registro

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> ## ⛔ VA DESPUÉS DE CERRAR LA MIGRACIÓN. No es una preferencia de orden
>
> **Mover la tabla mientras se migra es cambiar el traductor y lo traducido al mismo tiempo, y
> ninguna comparación aguanta las dos variables juntas.** Si una tanda no reprodujera, no habría
> forma de saber si falló la migración de esa familia o la mudanza de la tabla — y el proyecto ya
> tiene el precedente de lo que cuesta: la migración del piloto corrió antes de que existiera la
> columna `dimensiones` y dejó ocho marcadores publicando el mismo número **sin que nada fallara**.
>
> **Objetivo único:** que agregar o corregir una dimensión **deje de exigir `clasp push`**.

---

## Por qué: `D-33` promete una simetría que hoy no cumple

`D-33` se justificó con este argumento, y está escrito en `PLAN.md`:

> *el motor ya sabe que una medida se llama distinto en cada base, para eso está `MAPEO`; del lado
> de los cortes no había nada equivalente. `D-33` le da a las dimensiones lo que `MAPEO` ya le
> daba a las medidas.*

**Hoy esa simetría es a medias.** `MAPEO` es una **hoja**: agregar el mapeo de un campo nuevo es
agregar una fila. `DIMENSIONES_` es un **mapa literal en `Fuentes.gs`**: agregar un valor de
dimensión, o enseñarle a una base a expresar uno que ya existe, es **editar un `.gs` y pushear**.

**Y eso es exactamente lo que `D-01` mide.** `CLAUDE.md` §2: *"todo valor que pueda cambiar sin que
cambie la lógica vive en una hoja de configuración, no en el código"*. El precedente lo dice con
todas las letras — el Paso 2.9F sacó el umbral de anclaje a `CONFIG.umbral_anclaje_reunion`, y el
comentario que dejó explica el motivo: *"cambiarlo ya no exige `clasp push`"*.

**Una expresión física de dimensión es un valor de negocio**, no lógica: `jm` en `digital/Directa
Mail` es *"el remitente es tal casilla"*, y el día que cambie la casilla cambia el valor, no el
motor.

---

## Parte 0 — medir antes de mover, y es lo que fija el criterio de éxito

**No editar nada todavía.**

1. **El contenido de hoy, contado.** `DIMENSIONES_` (`Fuentes.gs`) tiene la forma
   `dimensión → valor → "base|solapa" → expresión física`. Reportar **cuántas filas son** al
   aplanarlo, y **cuáles**. Al 16/08 son tres dimensiones —`ambito`, `plataforma`, `tipo_envio`—
   con **13 pares (valor, base|solapa)**; verificarlo, no citarlo.
2. **Quién lo lee.** Hoy sólo `condicionesDeDimensiones_`. Confirmarlo con un grep — si aparece un
   segundo lector, **el alcance cambia y se reporta antes de seguir**.
3. **La medición de `D-01`, tomada ANTES:** *"agregar un valor de dimensión nuevo cuesta N líneas
   de `.gs` y un `clasp push`"*. Ése es el número que este prompt tiene que bajar a **cero líneas
   de `.gs`**, y sin el "antes" la mejora no se puede afirmar.

---

## Parte A — la hoja

**Nombre propuesto: `DIMENSIONES`.** Una fila por (dimensión, valor, base, solapa):

| columna | qué lleva |
|---|---|
| `dimension` | `ambito`, `plataforma`, `tipo_envio` |
| `valor` | `jm`, `gcba`, `meta`, `google`, `programmatic`, `convocatoria`, `m2` |
| `base_id` | la base donde esa expresión vale |
| `solapa` | la solapa — la clave de hoy es `base|solapa` y **no se simplifica** |
| `expresion_fisica` | la condición en el vocabulario del `filtro` |
| `notas` | por qué esa expresión y no otra |

⚠ **Tres cosas de la forma actual que la hoja TIENE que soportar, y que se pierden si se diseña
la tabla mirando sólo el caso fácil:**

1. **Expresiones compuestas.** `programmatic` es
   `Plataforma!=Meta && Plataforma!=Google ads` — dos condiciones en una celda. **`R-24` no se
   deroga:** `programmatic` se calcula **por resta y no por lista**, y el día que aparezca una
   plataforma nueva tiene que quedar adentro sola. Si alguien "normaliza" la tabla partiendo eso
   en dos filas, hay que decir cómo se recombinan.
2. **Negaciones.** `gcba` es **todo lo que no es `jm`** (`D-33`), no un valor propio: se expresa
   negando la misma condición. La hoja guarda la negación **explícita**, igual que hoy.
3. **La clave es el par `base|solapa`, no la base.** La misma dimensión se dice distinto en
   `looker/DIGITAL` (`nombre_campaña~=JM`) y en `looker/resumen_metricas_dinamico`
   (`campana~=JM`) — **misma base, solapas distintas, campos distintos**.

⚠ **Y una que NO se mueve, para que nadie la busque en la hoja:** **«una dimensión ausente
significa todas»** es semántica de `condicionesDeDimensiones_`, **no una fila de la tabla**. No se
inventa un valor `todas` — es la decisión del usuario del 15/08 y el piloto la verificó con el
descuadre.

---

## Parte B — el lector, el sembrador y el registro

1. **`condicionesDeDimensiones_` lee la hoja**, con `memoRegistro_` como el resto de los registros
   (`leerMapeo`, `leerSolapas`): **una lectura por corrida**, no una por marcador.

2. **El fallo sigue siendo ruidoso, y esto es lo más importante de la parte.** Hoy una dimensión
   desconocida, un valor desconocido o una base que no sabe expresarlo devuelven `ok: false` con
   el motivo. **Eso no puede degradarse al pasar a hoja.** ⚠ **Y aparece un caso nuevo que el mapa
   en código no tenía: la hoja vacía, ausente o ilegible.** Tiene que **fallar con motivo propio**,
   nunca devolver `condiciones: ''` — porque una condición vacía **devuelve el universo entero**,
   que es el modo de falla más caro del proyecto. Es el mismo razonamiento de
   `verificarLecturaDeFuente_` con `#REF!`.

3. **El sembrador, y su comportamiento de propagación se DECIDE, no se hereda.** El repo tiene dos
   familias: `upsertPorClave_` (el seed corrige) y `CONFIG`/`SECCIONES` (la hoja manda, el seed
   siembra lo ausente). **Elegir cuál, decir por qué, y escribirlo al lado de la función** — la
   lección del 16/08 es que un default prudente sin decisión declarada se vuelve una pregunta
   abierta meses después.
   - **Recomendación, que el prompt propone y el usuario confirma:** *la hoja manda*. Es una tabla
     de negocio que una persona va a ajustar, y ése es el punto del cambio.
   - ⚠ **Con su consecuencia dicha:** corregir una expresión en el seed **no llegará a la hoja**,
     y hay que editar la celda. `docs/ESCRITORES.md` §1 bis.

4. **El registro documental, en el mismo commit** (`CLAUDE.md` §3):
   - fila en **`CLAUDE.md` §7** — la pregunta es *"¿cómo se expresa físicamente un corte lógico en
     cada base?"*, que hoy **no tiene dueño**;
   - fila en **`docs/ESCRITORES.md`** §1 y en la tabla de propagación §1 bis;
   - la hoja entra en **las tres listas duplicadas a propósito** —`ALCANCE_REGISTROS_`,
     `HOJAS_REGISTRO` de `tools/escritores.js`, `HOJAS` de `tools/snapshot.js`— y
     **`node tools/listas.js` tiene que pasar**. Es exactamente el caso de `LAMINAS`, que nació en
     una sola de las tres y estuvo un día sin respaldo declarado sin que nada lo señalara.

---

## Parte C — verificar, y el control es el piloto ya cerrado

**La mudanza no puede cambiar un solo número.**

1. **Control positivo de la traducción, fuera de Apps Script**, extrayendo el código real del repo
   —como `tools/probar-encabezado.js`—: para cada una de las 13 filas, la hoja tiene que producir
   **exactamente la misma expresión física** que el mapa de hoy. Es una prueba de equivalencia y
   se puede escribir **antes** de mover nada, contra el mapa actual.
2. **Los tres casos de fallo, afirmados:** dimensión desconocida · valor desconocido · par
   `base|solapa` no definido. **Y el cuarto, nuevo: hoja ausente o vacía.** Los cuatro devuelven
   `ok: false` con motivo, y **ninguno devuelve condiciones vacías**.
3. **Contra el motor:** `testigoDeImpresiones()` sobre los ocho del piloto, ya migrados y
   verificados. **Mismas cuentas de filas y descuadre en cero** — el mismo criterio que cerró el
   piloto, por el mismo motivo: con `looker` moviéndose, los valores absolutos no sirven.
   **Con el canario primero.**
4. **La medición de `D-01`, tomada DESPUÉS:** agregar un valor de dimensión nuevo tiene que costar
   **una fila y cero líneas de `.gs`**. Si no da cero, decir cuántas quedaron y por qué — es una
   medición, no un criterio de aceptación (`CLAUDE.md` §2).

---

## Lo que este prompt **no** hace

- **No cambia ninguna dimensión ni ningún valor.** Es una mudanza, no un rediseño.
- **No deroga `R-24`** — `programmatic` sigue por resta.
- **No toca `MARCADORES`**, ni los ocho del piloto, ni ninguna plantilla.
- **No define «todas» como valor.** Ausente sigue significando todas, en el código.
- **No mueve `SEPARADOR_CONDICIONES_FILTRO_` ni el parser de `filtro`.** La hoja guarda el texto
  en el vocabulario que el parser ya entiende; si hiciera falta tocar el parser, **eso es otro
  prompt** y se reporta.
