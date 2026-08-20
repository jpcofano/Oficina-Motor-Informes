# 2026-08-20_3 — El fixture como tercer camino de verificación

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** escribir que **Code puede verificar un número contra un fixture de disco**, y
> escribir con la misma claridad **qué no puede verificar así**.
>
> ⛔ **No mide ningún número en este prompt.** Es el ajuste de método; las validaciones concretas
> son prompts propios.

---

## Por qué se escribe

La regla vigente es *Code no valida contra las bases externas: su token sólo alcanza la planilla de
control; escribe el instrumento y el usuario corre*. **Sigue siendo cierta para la base viva y deja
de serlo para los exports**: `docs/_fixtures/` tiene archivos en disco —fuera de git, por la
decisión de privacidad de `C-21`— que Code puede leer directamente.

**El costo de no escribirlo:** preguntas que ya se pueden contestar hoy siguen esperando un botón.
`X-19` —la frecuencia publicada 8,4 contra el ratio 8,89 contra `looker/ALCANCE` 2,27—, el alcance
de `3305` con −4,3 %, y la regla de selección de M2 son las tres **preguntas sobre el dato**, y las
tres tienen su foto y su deck en la misma carpeta.

---

## Parte 0 — medir. Sólo lectura. **Reportar y parar.**

> **Modelo: Sonnet · effort medio.**

1. **Qué hay hoy en `docs/_fixtures/`**, en disco: nombre, bytes y `sha256` de cada archivo.
   **Contrastar contra la tabla de huellas del `README.md`** y reportar las tres categorías:
   coincide · está en disco sin fila · tiene fila y no está.
2. **Qué se puede abrir sin instalar nada**: `.zip`, `.xlsx`, y qué solapas trae cada uno. Reportar
   **la lista de solapas por archivo**, que es lo que decide qué caso se puede medir con cuál.
3. **Los decks publicados** listados por ID en el `README.md`: confirmar que se alcanzan con el
   conector de Drive y que se puede leer un número de una lámina.
4. **Qué dice hoy `CLAUDE.md` §4 sobre quién verifica qué.** Citar el texto vigente. **No
   reescribirlo todavía** — la Parte A necesita saber contra qué está escribiendo.
5. **Los casos de `casos_validacion` que hoy están frenados esperando una corrida** y que un
   fixture podría contestar. Reportar **cuántos y cuáles**, sin abrir ninguno.

**Reportar todo junto y parar.** ⛔ No medir ningún número en esta corrida.

---

## Parte A — la regla, en `CLAUDE.md` §4

> **Modelo: Opus · effort alto.** Cambia quién puede afirmar qué, que es la regla más cara de este
> proyecto.

**Tres caminos de verificación, y cada uno con lo que NO alcanza:**

| camino | contesta | no contesta |
|---|---|---|
| **estructural, desde el log** | partición, identidad de filas, cuentas — lo que se lee del reporte sin ver el dato | nada sobre el valor absoluto |
| **fixture, Code sobre disco** | *¿la definición de este marcador produce el número publicado?* | qué dice la base **hoy** |
| **corrida, el usuario** | la traza, la rama, el estado de la hoja viva | nada reproducible seis semanas después |

**Cuatro reglas que van con el camino nuevo, y ninguna es opcional:**

1. ⭐ **El `sha256` se verifica contra la tabla ANTES de citar un número.** Ya está escrito en el
   `README.md` de la carpeta; acá se eleva a regla de método. Un caso `exacto` medido contra un
   archivo anónimo no es reproducible, que es lo que `C-21` vino a arreglar.
2. ⭐ **Reproducir el cálculo en node o Python es una reimplementación.** Es el error que este repo
   cometió cuatro veces —*el instrumento que reproduce lógica del motor y la reproduce peor*—.
   **Cuando la lógica exista en un `.gs`, se extrae la función real**, como hace
   `tools/probar-formato-revisar.js`. Reescribirla a mano se permite **sólo** cuando se está
   verificando la **definición del negocio** y no el motor, y **el reporte tiene que decir cuál de
   las dos cosas hizo**.
3. **Un fixture es una foto fechada, y su fecha es parte del resultado.** Un número medido sobre el
   export del 31/07 responde por el 31/07 y por ningún otro día. Es la misma disciplina que los
   snapshots de `_snapshots/`, que se citaban como si fueran de hoy hasta que se versionaron.
4. **Un número reproducido contra un fixture no prueba que el motor lo lea así.** Prueba que la
   definición es correcta. **Son dos afirmaciones distintas y el caso de validación tiene que
   decir cuál está haciendo** — si difieren, eso es el hallazgo, no el ruido.

⚠ **Lo que esto NO cambia:** la corrida sigue siendo del usuario, la traza sigue sin existir fuera
de ella, y **el fixture no vuelve verificable nada de lo que depende de la base viva** — los nueve
`camp_*`, la rama por cuenta y la selección semanal siguen exactamente donde están.

---

## Parte B — la documentación que lo hace usable

> **Modelo: Sonnet · effort medio.**

1. **`docs/_fixtures/README.md`** — la tabla de huellas se completa con lo que la Parte 0 encontró
   en disco. **Una fila nunca se edita**: si un export cambió, es otra fila.
2. **`docs/PENDIENTES_consistencia.md`** — los casos que la Parte 0 punto 5 listó pasan a decir
   **con qué fixture se contestarían**, en vez de *"espera una corrida"*. Es la mitad accionable
   del ajuste: sin esto, la regla nueva existe y nadie la usa.
3. `docs/BITACORA.md` — la entrada, con la cuenta de casos que cambiaron de estado.

## Lo que este prompt **no** hace

- ⛔ No mide ningún número ni cierra ningún caso de validación.
- ⛔ No sube ningún fixture a git. La decisión de privacidad de `C-21` no se toca.
- ⛔ No toca la regla de que la corrida es del usuario.
