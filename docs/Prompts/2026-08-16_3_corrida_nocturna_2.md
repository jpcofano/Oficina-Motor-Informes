# 2026-08-16_3 — Corrida nocturna

> **Estado:** ejecutado el 16/08/2026 · **subagente:** ninguno
>
> **Objetivo único:** ejecutar lo que corrige algo que hoy está mal, y dejar preparado lo que
> mañana sólo necesite una corrida contra la planilla.
>
> **Autorizado a ejecutar los tres bloques sin preguntar.** No hay gate.
>
> **Esta corrida rinde poco a propósito.** Casi todo lo que queda —la Parte C del piloto, la
> Parte A de `R-26`, el censo de `looker/CC`, la tanda 1— necesita la planilla. Lo que sí se
> puede hacer es el bloque 1, y dejar los otros dos listos para una sola corrida cada uno.

---

## Las reglas

1. **No decidir nada que sea del usuario.** Si un bloque llega a un punto donde hay que elegir,
   anotarlo y pasar al siguiente.
2. **No escribir sobre ninguna hoja de registro.** Ni `MARCADORES`, ni `MAPEO`, ni `SOLAPAS`.
3. **No tocar los ocho del piloto**, que siguen migrados y sin verificar, ni plantillas, ni
   cablear nada.
4. **Un commit por bloque**, y **documentación separada de código** — la desviación de anoche
   con el encabezado de `tools/catalogo.js` no se repite.
5. **Si una premisa falla, el bloque para ahí** y se reporta. Ya pasó dos veces esta semana y
   las dos fueron las más útiles de la noche.
6. **Un solo reporte al final.**

---

## Bloque 1 — ejecutar el testigo de `D-31` · **Opus** · effort: alto

`docs/Prompts/2026-08-16_2_testigo_encabezado_conectado.md`, entero.

Es lo único de esta corrida que corrige algo que hoy está mal: el frente 6 figura cerrado y
`leerMapeoSinCache_` no indexa `encabezado`, así que dejó el dato y no la alarma.

Las tres condiciones ya están en el prompt. Dos cosas más para esta ejecución:

- **La prueba se corre fuera de Apps Script**, extrayendo el código real del repo y no una
  copia, como se hizo con `probarGateDeUsoDeSolapas_`. Así queda verificado antes de que el
  usuario toque nada.
- **Los tres casos del control positivo son obligatorios** —esperado ≠ real reporta, esperado =
  real no reporta, `encabezado` vacío no es desalineamiento— y si alguno no se puede montar, se
  dice cuál y por qué en vez de darlo por cubierto.

**Si la prueba no pasa, el bloque para y no se commitea el código.**

---

## Bloque 2 — preparar, sin ejecutar · **Opus** · effort: alto

Dos prompts escritos y sus instrumentos pusheados **sin correr**. Los revisa el usuario a la
mañana; esta noche sólo se dejan listos.

### 2a · La tanda 1 de la migración

Los `mail_*` / `gcba_mail_*` de `digital/Directa Mail`: la dimensión ya está en el `filtro` y
sólo hay que sacarla del nombre.

- **El canario es uno de los cuatro grupos de `digital/Directa IVR`** —`filtro` vacío, no se
  migran en ninguna tanda, ya salen en el log—. Elegí cuál y decí por qué ése.
- **La precondición que descubriste anoche, escrita como precondición y no como nota:** el par
  `frecuencia`/`gcba_frecuencia` **queda fuera de la tanda 1**, y el día que migre, su propia
  verificación no va a tener canario en `looker`. Que el prompt de esa tanda futura arranque
  resolviendo eso.
- **La tanda 1 no arranca hasta que la Parte C del piloto cierre.** Si el piloto no reproduce,
  no hay tanda. Que esté en el encabezado del prompt, no al final.
- Misma estructura que el piloto: testigo → migración → verificación, comparando **traza antes
  que valores** y contra `MARCADORES_2026-08-15.tsv`, no contra la corrida anterior.

### 2b · Los tres pares `pauta_*`

`pauta_google`/`gcba_pauta_google`, `pauta_meta`/`gcba_pauta_meta`, `pauta_prog`/`gcba_pauta_prog`:
definición idéntica, **filtro vacío en los dos lados**, y el log del 15/08 los muestra dando el
mismo valor.

**No es migración, es un número publicado dos veces.** El prompt es de validación: medir qué
publica cada uno y en qué lámina, y determinar si uno de los dos está mal, si los dos lo están
porque falta el filtro, o si `gcba_pauta_*` nunca debió existir. **No proponer el arreglo:**
medir y reportar.

Es el caso que más se parece a una migración y el que menos lo es — con el nombre nuevo el error
dejaría de verse.

---

## Bloque 3 — la lista de la mañana · **Sonnet** · effort: normal

Actualizar `docs/CORRIDAS_pendientes_2026-08-16.md` y `HANDOFF_CODE.md` con lo que quedó, en
orden de lo que destraba:

1. **`testigoDeImpresiones()`** — Parte C del piloto, con `gcba_frecuencia` como precondición
   dura. Destraba la tanda 1 y todo el frente 13.
2. **La Parte A de `R-26`** — independiente de la migración, se puede correr aunque `looker`
   siga inestable.
3. **Los instrumentos de 2a y 2b**, marcados como *"el prompt lo revisa el usuario antes"*.
4. **El censo de `looker/CC`**, que sigue siendo sólo lectura y se puede adelantar.

Mantené la sección de **lo que NO hay que correr**, con `revertirPilotoDeImpresiones()` adentro.

---

## Lo que esta corrida **no** hace

- **No verifica el piloto.** Necesita `looker` estable.
- **No ejecuta la tanda 1 ni los `pauta_*`.** Los deja escritos.
- **No corre `R-26`.**
- **No decide** el formato del catálogo, ni mueve `DIMENSIONES_` a hoja, ni define `-` y `---`,
  ni toca `reuniones/Call`. Las cuatro son del usuario y ya están anotadas.
