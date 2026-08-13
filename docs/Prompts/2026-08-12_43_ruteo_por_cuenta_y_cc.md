# `_43` · Qué mide el bloque Call Center de la base nueva, y el ruteo por cuenta que falta

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> Objetivo: **destrabar lo que se pueda cablear antes de la demo.** Este prompt no da de alta la
> base ni cablea ningún token — mide qué arbitra la base nueva y deja construido el mecanismo por el
> que un marcador lee **la fila de la cuenta que se está emitiendo**. El alta, el cableado y la
> corrida van en el `_44`.
>
> Contexto: hoy `datosDeMarcador_` tiene dos ramas por cuenta, `rdv` (por `opciones.fila_rdv`) y
> `digital` (por `filasDigitalDeEncuentro`). Cualquier otra base cae a `leerFuente`, que devuelve la
> solapa entera **sin el contexto del ítem** — y publicaría el mismo agregado en las seis láminas.
> Es el bug que el `_28` arregló para `rdv`.

---

## Parte A · Sólo lectura — ¿la base nueva arbitra sobre Call Center?

**Modelo: Opus. Effort: alto.** La respuesta decide si un número publicable cambia de fuente.

Planilla: `12b0v67FbxjuIndK7DgVU3MYxx-k0yBIS9gtyV45rFaY`, solapa `Agenda JM` (encabezado en la fila 2)
y `Agenda JM | Post`. Contra `looker/CC`, para **las 7 cuentas ancladas** de julio y `junio_sem2`.

1. **Columna por columna.** Listar las columnas del bloque Call Center de `Agenda JM` con su nombre
   literal, y las de `looker/CC`. Para cada cuenta, los valores de las dos, lado a lado.
2. **Los ceros: ¿son medición o falta de carga?** El censo midió que Call Center coincide en 3 de 7
   y **los tres son ceros**, y que `3387` da 0 discados contra 7.954 de `looker`. La pregunta es si
   esos ceros conviven con el resto de la fila cargada o si son parte de un bloque entero en cero,
   como pasa con `3346` en digital. Reportar, por cuenta, cuántas celdas del bloque CC están en cero
   y si el resto de la fila trae dato.
3. **`X-21` — la pregunta que vale.** `3387` tiene **tres** filas en `looker/CC` y la lámina publica
   la suma de dos (7.232 = 6.977 + 255; quedan 722 afuera). **¿La fila de `Agenda JM` trae una fecha
   de envío o de encuentro que permita elegir entre las tres?** Si la trae: mostrar las tres filas de
   `looker/CC` con lo que tengan de fecha y decir si la de la base separa dos de la tercera. Si no la
   trae, decirlo — y `X-21` sigue abierto.
4. **Estado vivo, no snapshot.** El `_42` mostró que `MARCADORES_2026-08-11.tsv` ya envejeció en la
   fila de `enc_alcance`. Leer de las hojas vivas: `uso` de `looker/CC`, `looker/DIGITAL` y
   `looker/ALCANCE` en `SOLAPAS`, y si `looker/CC` y `looker/DIGITAL` tienen columna con el
   `id_cuenta` y cuántas filas por cuenta. Reportar la fecha y hora de lectura.

**Reportar y parar.** Tres respuestas posibles y las tres son útiles: la base arbitra CC, la base
mide otra cosa (como pasó con los mails), o la base está sin cargar ahí. **No inventar la tercera si
los datos dan la segunda.**

---

## Parte B · El ruteo por cuenta, declarativo

**Modelo: Opus. Effort: alto.** Es diseño y va con su `D-NN`.

Independiente del resultado de A: hace falta para la base nueva **y** para `looker`, y hoy es el
único bloqueo de los 8 tokens sin fila del `_38` más `enc_impresiones`.

1. **Decidir entre dos caminos y escribir por qué**, en `docs/PLAN.md` como `D-NN`:
   - una **tercera rama** en `datosDeMarcador_`, cableada a la base nueva como las otras dos;
   - o un **campo declarativo** — una columna en `BASES` o `SOLAPAS` que nombre el campo lógico que
     lleva el `id_cuenta`, de modo que cualquier base con esa columna se filtre por la cuenta del
     ítem que se está emitiendo, sin código nuevo por base.

   **El argumento que inclina:** la segunda sirve a la base nueva y a `looker` con un solo
   mecanismo, y es la dirección que `D-01` ya midió. Si al escribirlo aparece un motivo para la
   primera, ése es el resultado y se escribe — no se fuerza el camino elegante.
2. **Implementarlo.** Con la misma guarda de solapa que tiene la rama de `rdv`: la letra de columna
   vale para la solapa donde se resolvió el mapeo, y si el marcador apunta a otra hay que caer a la
   rama general — si no, sale un número plausible de la columna equivocada.
3. **Sin recorte por ventana en la rama por cuenta.** Igual que `rdv` y por el mismo motivo: el
   temario ya seleccionó (`R-17`), y San Cristóbal 23/07 quedaría afuera de la ventana de julio.
   Dejarlo escrito en el comentario, con el caso.
4. **Prueba** (**modelo: Sonnet**). Un fixture por afirmación, con el criterio de `CLAUDE.md` §4: un
   dato que satisfaga dos afirmaciones a la vez no distingue entre ellas. Como mínimo: filtra por la
   cuenta del ítem; cae a la rama general cuando no hay `id_cuenta`; y la guarda de solapa dispara.
   **No se cablea ningún marcador todavía**, así que ninguna corrida cambia de salida.

**Un commit para la decisión y otro para la implementación con su prueba**, o uno solo si la
decisión sale corta. Que el mensaje diga cuál de los dos caminos se tomó.

---

## Qué no entra

- El alta en `BASES` / `SOLAPAS` / `MAPEO` y el cableado de tokens — `_44`.
- La regla de `digital/Alcance`, que sigue abierta y sigue publicando `—`.
- `X-21`, salvo que A.3 lo conteste. Si lo contesta, se anota y se cablea en el `_44`.

---

## Reporte final

- Las tres respuestas de A, con la hora de lectura.
- Qué camino se tomó en B.1 y el `D-NN` que quedó.
- Qué queda listo para cablear en el `_44` y qué sigue sin fuente.
