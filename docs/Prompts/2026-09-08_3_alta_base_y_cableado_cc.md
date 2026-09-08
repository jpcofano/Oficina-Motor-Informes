# 2026-09-08_3 — Alta de la base nueva y cableado de los tres `cc_*` validados

**Objetivo único:** que `cc_base`, `cc_contactados` y `cc_contact_pct` salgan en el deck de `jm`
leyendo la base nueva.

⛔ **`cc_campanias` NO entra**: `C-112` está abierto y cuatro candidatas empatan. Su token se
queda como está.
⛔ **Los cuatro `ecv_*` de la lámina 5 NO entran.** El motivo está abajo y es de mecanismo, no
de decisión.

**Subagente: ninguno.**

| parte | modelo | effort | escribe |
|---|---|---|---|
| **A** | Sonnet | normal | ⛔ nada — sólo lectura, reportar y parar |
| **B** | **Opus** | **alto** | el alta: `SEED_BASES_`, `SEED_SOLAPAS_`, `SEED_MAPEO_`, `DIMENSIONES_` |
| **C** | **Opus** | **alto** | las filas de `MARCADORES` + `clasp push` |

**B y C van en Opus:** mueven tres números a un deck publicable. **C depende de B** y ninguna
se puede hacer sin la otra, pero **se reportan por separado**: un alta correcta con un cableado
mal hecho es un número plausible y equivocado, y hay que poder ver cuál de las dos falló.

**Sacrificabilidad:** A imprescindible. Si falta presupuesto **se entrega B sin C** —una base de
alta sin marcadores no publica nada y no rompe nada—. ⛔ **Nunca C sin B.**

---

## ⛔ El gate, y es una línea: `C-115`

`C-115` midió que **el cruce caso→marcador no scopea por base**. Hoy es inerte porque **no
existe ningún marcador `cc_*` vivo**; **el alta es exactamente el evento que lo despierta.**

⭐ **La verificación concreta, y va ANTES de cualquier escritura de `MARCADORES`:** que el
marcador que se cree lea **la base nueva** y no `looker/CC`. Las dos tienen una columna que se
llama casi igual —`Base Barrida` contra `Base barrida`— y **`R-10` normaliza la diferencia**.

⛔ **Y el otro evento que el alta despierta:** el rojo conocido de
`probar-guiones-grupos.js`. Está documentado como *seguro hoy porque hay cero marcadores `cc_*`
vivos*. **Esa premisa se cae con este prompt.** La Parte A lo mide y **si sigue rojo, se reporta
antes de escribir**, no después.

---

## Lo decidido, que no se vuelve a discutir

| | |
|---|---|
| **fuente** | `Call Center - Métricas` de `1f8Jy9S09EjWhXo-RF6llXnk8alQCJxWSZAdnfp3WR60` |
| **ventana** | `Fecha` (col K) **propia** — ⛔ no pertenencia |
| **ámbito `jm`** | `Remitente` (col Q) **`= JM`** |
| **ámbito `gcba`** | `Remitente` **`= GCBA`** — ⛔ **positivo, NO `!= JM`** |
| **convivencia** | la base nueva **convive** con `looker/CC`; lo validado ahí queda vigente |
| **alcance** | **una solapa**, `Call Center - Métricas`. ⛔ Ni `Mail`, ni `SMS`, ni `IVR`, ni las otras dos de call center |

**Los testigos, del CSV del 08/09** — son los números que el cableado tiene que reproducir:

| token | 24–31/07 | 14–20/08 | caso |
|---|---|---|---|
| `cc_base` | **6.011** | **6.851** | `V-126` `V-127` |
| `cc_contactados` | **1.878** | **1.616** | `V-128` `V-130` |
| `cc_contact_pct` | **31** | 24 sin testigo | `V-129` · `C-116` |

⚠ **`cc_contact_pct` publica agosto sin testigo.** Por `D-60` un `exacto` vigente alcanza para ir
sin `_revisar`, y `V-129` lo es. **Va sin marca, y es una decisión tomada a sabiendas.**

⚠ **`C-117` está abierto y no bloquea:** `ID cuentas ~= JDGAG` **solo** también reproduce los dos
números, así que `Remitente` es **suficiente y no probado necesario**. Se elige igual porque es
el corte de **ámbito** —el mismo que sirve para `gcba_cc_*`— y `JDGAG` es un id de cuenta clavado
que no distingue JM de GCBA. ⭐ **Ese argumento hay que dejarlo escrito**, o el empate vuelve.

---

## Parte A — Premisas

**Sonnet · normal · SÓLO LECTURA · «reportar y parar».** ⛔ Cero ediciones.

1. ⭐ **El rojo de `probar-guiones-grupos.js`.** Correrlo y reportar el estado **de hoy**, con
   el ítem de `PLAN.md` que lo documenta. ⛔ **Si sigue rojo, reportar y PARAR**: su seguridad
   se apoyaba en que no hubiera marcadores `cc_*`, y este prompt los crea.
2. ⭐ **`C-115`** — leer la clave y la nota, y reportar **qué campos cruza
   `generar-casos-por-marcador.js`** y por dónde entraría la confusión entre las dos solapas.
3. **El procedimiento de alta real**, leído del código y no del seed: qué hace el sembrador con
   una `base_id` nueva, qué protege `origen = manual` (`D-32`), y **si el alta la escribe el
   sembrador o hace falta que una persona toque la planilla**. ⛔ Si hace falta una persona,
   **decirlo antes de escribir código**.
4. **`ventana_ref: 'propia'`** — releer `VENTANA_PROPIA_` y `D-52`, y reportar qué le hace a
   `BASES.modo_periodo`. La base nueva **es acumulada**: si el modo queda en snapshot, la
   ventana no filtra.
5. **`DIMENSIONES_.ambito`** — dónde se agrega la entrada nueva, y confirmar que la clave es
   `base|solapa`. Reportar **cómo se llamaría** la clave de la solapa nueva.
6. **Las filas de `MARCADORES` de los tres tokens hoy**: existen o no, con qué `informe_id`,
   `base`, `solapa`, `operacion` y `formato`. ⛔ **Si alguna existe apuntando a `looker/CC`,
   reportar y PARAR**: esto sería una migración y no un alta, y cambia el prompt.
7. **Máximos de ID** con el grep que los reproduce. (Al escribir esto: `V-130`, `C-117`,
   `X-43`, `D-60`, `R-34`, `S-06`.)

---

## Parte B — El alta

**Opus · alto.** Sólo si A pasó, y **sólo la solapa `Call Center - Métricas`**.

- `SEED_BASES_`: la base, con el `sheet_id` y el `modo_periodo` que la premisa 4 haya
  determinado.
- `SEED_SOLAPAS_`: **una** fila, `uso = 'fuente'`, `ventana_ref = 'propia'`, con
  `firma_encabezado` **copiada del censo**, no tipeada.
- `SEED_MAPEO_`: los campos lógicos que los tres tokens necesitan y **nada más** —
  ⛔ no mapear las 22 columnas «por si acaso». Cada fila con **letra y encabezado testigo**
  (`D-31`), y **el encabezado sale del log del censo**.
- `DIMENSIONES_.ambito`: `jm` → `= JM`, `gcba` → `= GCBA`, sobre la clave que la premisa 5
  determinó.

⛔ **Ninguna otra solapa de la planilla se registra**, ni siquiera con `uso = 'ignorar'`, salvo
que la premisa 3 diga que el sembrador las crea igual — **en cuyo caso se reporta y no se
inventa el `uso` de 37 solapas**.

⭐ **Backup antes de escribir**, si el procedimiento de la premisa 3 toca la planilla.

**Reportar y parar antes de C.**

---

## Parte C — El cableado

**Opus · alto.**

Las filas de `MARCADORES` para **`cc_base`, `cc_contactados`, `cc_contact_pct`** en `jm`.

⭐ **Toda la aritmética vive en `Marcadores.gs`** — ⛔ no calcular el porcentaje en otro lado.
⭐ **`cc_contact_pct` es un derivado y no puede estar más validado que sus insumos**: si sale de
`cc_contactados / cc_base`, comparte filas con los dos y **el ratio se cumple por construcción**
— eso se declara, no se presenta como control.

⛔ **`cc_campanias` no se toca.** ⛔ **`gcba_cc_*` no se cablean en este prompt**: la entrada de
`DIMENSIONES_` queda escrita y lista, y el cableado es otro paso.

**Después: `clasp push` como comando separado**, nunca encadenado con `&&` a través de un pipe.
**Avisar y parar.** ⛔ **La corrida de verificación es del usuario** — el prompt no declara
validado nada que no haya corrido.

⚠ **Y el control que hay que decir cómo va a salir ANTES de correr:** una corrida contra las dos
ventanas de los testigos tiene que dar `6.011`/`1.878`/`31` y `6.851`/`1.616`. Si da otra cosa,
**es el cableado, no la base** — la base ya reprodujo esos números dos veces con instrumento
determinista.

---

## Reporte

```
PARTE A
  1 probar-guiones-grupos.js ..... verde / ROJO ⛔   [ítem de PLAN]
  2 C-115: qué cruza ............. …
  3 alta: sembrador o persona .... …
  4 'propia' y modo_periodo ...... …
  5 clave de DIMENSIONES_ ........ …
  6 filas de MARCADORES hoy ...... existen / no ⛔
  7 máximos ...................... V-__ C-__ X-__ D-__ R-__ S-__

PARTE B
  BASES / SOLAPAS / MAPEO / DIMENSIONES_ ... escritos / no
  solapas registradas ..................... cuántas (tiene que ser 1)
  backup .................................. sí / no aplica

PARTE C
  filas de MARCADORES ..... cuáles
  gate C-115 verificado ... sí / no ⛔   (lee la base nueva, NO looker/CC)
  clasp push .............. sí / no

BLOQUEANTES
FUERA DE ALCANCE  —  anotar, no arreglar
```

⛔ **No inventar el faltante.** Si el prompt no alcanza, se reporta como falta.
