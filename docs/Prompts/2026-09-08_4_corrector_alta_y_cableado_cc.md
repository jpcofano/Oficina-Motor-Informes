# 2026-09-08_4 — Corrector de adjudicación, alta de la base y cableado de los tres `cc_*`

**Reemplaza al `2026-09-08_3`**, que paró en la Parte A y **tenía tres premisas falsas**. Están
corregidas abajo y señaladas, para que no vuelvan.

**Objetivo único:** que `cc_base`, `cc_contactados` y `cc_contact_pct` salgan en el deck de `jm`
leyendo la base nueva.

**Subagente: ninguno.**

| parte | modelo | effort | escribe |
|---|---|---|---|
| **A** | Sonnet | normal | ⛔ nada — sólo lectura, reportar y parar |
| **B** | **Opus** | **alto** | el caso corrector + regenerar `CASOS_POR_MARCADOR_` |
| **C** | **Opus** | **alto** | el alta + el cableado + `clasp push` |

**Sacrificabilidad:** A imprescindible. **B se puede entregar sin C** — deja el banco en verde y
no publica nada. ⛔ **Nunca C sin B:** el alta es el evento que despierta el cruce, y sin el
corrector publicaría los tres entre guiones.

---

## Las decisiones del usuario, 08/09/2026

| | |
|---|---|
| **adjudicación** | salida **(a)**: un caso nuevo y posterior. ⛔ **No se re-mide nada**: los tres siguen validados por `V-126` a `V-130`, y lo único que se corrige es que `C-115` y `C-117` los reclamaron por mención |
| **`base_id`** | **`acumulado`** |
| **prefijo de `campo_logico`** | **`acc_`** |
| **política de ajuste** | *«en las próximas corridas cualquier número que esté mal se ajusta»* — ⭐ va escrita en el caso corrector, porque cambia el umbral de lo que frena una publicación |

---

## ⛔ Las tres premisas falsas del `_3`, medidas y corregidas

Las verifiqué leyendo el código. **No volver a pedirlas.**

1. **`SEED_SOLAPAS_` NO lleva `firma_encabezado` con contenido.** `filaSolapa_` la emite en `''`
   siempre; la escribe `inventariarSolapas`. Lo mismo con `filas_datos` y `filas_crudas`.
   El seed siembra **cinco**: `uso`, `fila_encabezado`, `ventana_ref`, `campo_id_cuenta`, `notas`.
2. **`SEED_MAPEO_` NO tiene columna de encabezado testigo.** Sus filas son exactamente
   `{ base_id, campo_logico, hoja, columna, notas }` — cinco campos y ninguno más.
   ⛔ **No pedir «letra + encabezado» en el seed**: el testigo vive en la planilla y lo escribe
   otro escritor.
3. **`FILA_ENCABEZADO_POR_BASE_` es `{ rdv: 1, digital: 1, looker: 1, m2: 3 }`** — no tiene
   `reuniones` y no va a tener `acumulado`. ⭐ **`filaSolapa_` lee de ahí**, así que una base
   ausente da `undefined`. O se agrega la base al mapa, o la solapa declara
   `fila_encabezado: 1` explícito. **Opus elige y declara cuál.**

---

## Parte A — Premisas

**Sonnet · normal · SÓLO LECTURA · «reportar y parar».** ⛔ Cero ediciones.

1. ⭐ **Cómo se crean filas NUEVAS de `MARCADORES`.** Es lo único del camino que no está
   medido: el `_3` midió que `BASES`, `SOLAPAS` y `MAPEO` los siembra el sembrador solo, pero
   **no midió `MARCADORES`**. ⛔ **Si hace falta que una persona toque la planilla, decirlo
   antes de escribir nada** — cambia quién ejecuta la Parte C.
2. **El vocabulario de `operacion` y de `formato`** que el motor acepta hoy, leídos del código.
   ⭐ Y **cómo se declara un `PCT`**: si el cociente va en `campo_logico` con `/`, confirmarlo
   contra un ejemplo vivo. ⛔ No asumir la forma.
3. **La `familia`** — reportar las que existen y **cuál corresponde a los `cc_*` del Resumen**.
   ⛔ Si no hay una familia `cc`, **decirlo y no inventarla**: puede que estos marcadores no
   lleven familia.
4. **El caso corrector: qué `estado` corresponde.** Leer el vocabulario admitido y `D-58`.
   ⭐ Reportar **qué campo lee `generar-casos-por-marcador.js` para desempatar** — si es la
   fecha del archivo o un campo de la fila. De eso depende que el corrector gane.
5. **Máximos de ID** con el grep que los reproduce. (Al escribir esto: `V-130`, `C-117`,
   `X-43`, `D-60`, `R-34`, `S-06`.)

**Reportar y parar** si 1 o 4 sale desmentida.

---

## Parte B — El corrector

**Opus · alto.**

Crear `docs/casos_validacion_2026-09-08b.csv` —o el nombre que el patrón del repo imponga, si
ya hay uno del 08/09— con el **mismo encabezado exacto** que el anterior, y **una fila por
marcador**:

- `cc_base`, `cc_contactados`, `cc_contact_pct` → reafirman **`exacto`** con los valores de
  `V-126` a `V-130` y la clave `Remitente=JM` + `Fecha` en ventana.
- `cc_campanias` → vuelve a **`abierto`**, que es lo que `C-112` dice. Hoy quedaría `cerrado`
  por mención de `C-115`.

⭐ **La nota de cada fila declara qué corrige y por qué**: `C-115` y `C-117` son casos de método
y nombraron estos tokens en `token_propuesto`; el generador lee ese campo como *«qué marcador
afirma este caso»*, no como *«de qué habla»*. ⛔ **No es una revalidación** — no se midió nada
nuevo y los `V-` originales siguen siendo el testigo.

⛔ **`C-115` y `C-117` no se editan ni se retractan.** Un caso no se edita; lo que cambia es
cuál gana por `D-58`.

⭐ **Y dejar escrita la política del usuario:** los números se ajustan en las corridas
siguientes cuando aparezcan mal. Es la regla que decide qué frena una publicación y qué no.

Después: **regenerar `CASOS_POR_MARCADOR_`** con `node tools/generar-casos-por-marcador.js` y
**correr `node tools/probar-guiones-grupos.js` como comando separado, sin tubería** — con pipe
el exit code es el del filtro, que es exactamente la trampa que hizo leer verde un rojo.

⛔ **Si después de regenerar los tres no quedan en `exacto`, PARAR y reportar.** No seguir a C.

---

## Parte C — El alta y el cableado

**Opus · alto.** Sólo si B dejó el banco verde y los tres en `exacto`.

**El alta, y sólo la solapa `Call Center - Métricas`:**

- **`SEED_BASES_`** — `base_id: 'acumulado'`, el `sheet_id`
  `1f8Jy9S09EjWhXo-RF6llXnk8alQCJxWSZAdnfp3WR60`, `nombre` el real del archivo
  (*DGPLES - Directa acumulado*), y los demás campos según la estructura que ya tiene el seed.
  ⭐ **`modo_periodo` da igual acá y hay que decirlo en la nota**: el `_3` midió que
  `ventana_ref: 'propia'` fuerza `filtrar` gane lo que gane la base.
- **`SEED_SOLAPAS_`** — **una** fila, `uso: 'fuente'`, `ventana_ref: 'propia'`.
  Resolver `fila_encabezado` según la premisa falsa 3.
- **`SEED_MAPEO_`** — los campos lógicos con prefijo **`acc_`**, y **sólo los que los tres
  tokens necesitan**. ⛔ No mapear las 22 columnas por si acaso.
  ⭐ El prefijo es obligatorio y el motivo está medido: `cc_contactados` **ya existe como
  `campo_logico` en `looker` y en `reuniones`**. `buscarMapeo` scopea por base y solapa, así que
  reusarlo funcionaría — lo que no sobrevive es la lectura humana. Es el mismo criterio que
  `lcc_`.
- **`DIMENSIONES_.ambito`** — clave `acumulado|Call Center - Métricas`:
  `jm` → `= JM`, `gcba` → `= GCBA`. ⛔ **Positivo por los dos lados, NO `!= JM`.**

**El cableado** — las filas de `MARCADORES` para los tres, en `jm`, por el camino que la
premisa 1 haya determinado.

⭐ **Toda la aritmética vive en `Marcadores.gs`** — ⛔ no calcular el porcentaje en otro lado.
⭐ **`cc_contact_pct` es derivado y comparte filas con sus dos insumos**, así que el cociente
**se cumple por construcción**: eso se declara en la nota, no se presenta como control.

⛔ **`cc_campanias` no se cablea** — `C-112` abierto.
⛔ **`gcba_cc_*` no se cablean** — la entrada de `DIMENSIONES_` queda lista y el cableado es
otro paso.
⛔ **Ninguna otra solapa de la planilla se registra**, ni con `uso: 'ignorar'`.

**`clasp push` como comando separado**, nunca encadenado con `&&` a través de un pipe.
**Avisar y parar.** ⛔ La corrida de verificación es del usuario.

⚠ **Cómo tiene que salir, declarado antes de correr:** contra las dos ventanas de los testigos,
`6.011`/`1.878`/`31` y `6.851`/`1.616`. Si da otra cosa, **es el cableado y no la base** — la
base reprodujo esos números dos veces con instrumento determinista.

---

## Reporte

```
PARTE A
  1 MARCADORES: sembrador o persona ... …  ⛔ si es persona, decirlo
  2 operacion / formato / forma del PCT ... …
  3 familia de los cc_* ............... existe / no hay ⛔
  4 estado del corrector + qué desempata ... …
  5 máximos ......................... V-__ C-__ X-__ D-__ R-__ S-__

PARTE B
  CSV corrector ............ creado, N filas   ids: …
  regenerado ............... sí / no
  probar-guiones-grupos.js . VERDE / rojo ⛔   (sin tubería)
  los tres en exacto ....... sí / no ⛔
  cc_campanias ............. abierto / otro ⛔

PARTE C
  BASES / SOLAPAS / MAPEO / DIMENSIONES_ ... escritos
  solapas registradas ...................... cuántas (tiene que ser 1)
  fila_encabezado .......................... cómo se resolvió
  MARCADORES ............................... qué filas
  clasp push ............................... sí / no

BLOQUEANTES
FUERA DE ALCANCE  —  anotar, no arreglar
```

⛔ **No inventar el faltante.** Si el prompt no alcanza, se reporta como falta.
