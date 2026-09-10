# 2026-09-10_2 — `CASOS_POR_MARCADOR_` al día, y el diff de `D-60` **en seco**

> **Objetivo único:** que el cruce caso → marcador conozca los **8** CSV, que el banco vuelva a
> verde, y que se vea **qué movería `D-60`** — sin mover nada.
>
> **Subagente: ninguno.**
>
> ⛔ **NO se escribe una sola celda de `MARCADORES`.** Ni un `_revisar` puesto, ni uno levantado.
> Esa escritura **mueve números publicados** y va en su propio prompt y en su propio deck.

| parte | modelo | effort | escribe |
|---|---|---|---|
| **0** | Sonnet | medio | nada — reportar y parar |
| **A** | Sonnet | medio | `Auditoria.gs` (la constante generada) |
| **B** | **Opus** | **alto** | un bloque en `PENDIENTES` — **ninguna celda** |

---

## Parte 0 — SÓLO LECTURA · reportar y parar

### 0.1 Los ocho, contados

```
ls docs/casos_validacion_*.csv | wc -l
```

⚠ **En el clon del remoto son 7**: el del 10/09 todavía no está commiteado. **Si este prompt corre
antes del commit, el generador ve 7 y la constante sigue mintiendo.** ⇒ **commitear primero**, o
verificar que el archivo está en `docs/` aunque el commit no haya salido.

### 0.2 ⛔ El `caso_id` repetido entre archivos — ítem **29**, y muerde acá

`C-84` y `C-85` están **duplicados entre CSV**: el del 28/08 reinició la serie `C-`. El generador
indexa por marcador y **la clave del cruce de `D-56` no es única**, así que un `caso_id` repetido
puede hacer que gane el caso equivocado.

⭐ **Reportar, antes de generar:** qué `caso_id` aparecen en más de un archivo, con su archivo y su
estado. ⛔ **Si alguno de los repetidos es `exacto` o `contradice`, parar** — decide qué gana el
usuario, no el generador.

⭐ El criterio ya decidido para los ids nuevos: **el máximo global de todos los CSV**, no por
archivo.

### 0.3 ⛔ Confirmar que el `_1` dejó lo que dijo

El reporte del `2026-09-10_1` nombra el árbol —prompt, documento de validación, CSV, README de
fixtures, 11 snapshots— y **no nombra los dos destinos de su B.2/B.3**:

| qué | ¿está? |
|---|---|
| la sección `secco` en `docs/CIERRE_POR_LAMINA.md` | ⛔ reportar |
| el título del documento y la línea *«Nada sobre `secco`»* | ⛔ reportar |
| la fila de `CLAUDE.md` §7 — *«una fila por lámina de `jm`»* | ⛔ reportar |

**Si no están, se hacen en este prompt** — es la mitad documental que ya estaba decidida, no un
objetivo nuevo. Si están, se dice y se sigue.

**⛔ Reportar y parar.**

---

## Parte A — regenerar, no editar a mano

`tools/generar-casos-por-marcador.js` ya emite el bloque entero. **Se corre y se pega**; ⛔ no se
edita el mapa a mano ni se toca sólo el `7`.

**Los tres testigos que se mueven juntos, y son del mismo bloque:**

| testigo | de a |
|---|---|
| `CASOS_POR_MARCADOR_ARCHIVOS_` | `7` → **8** |
| `CASOS_POR_MARCADOR_GENERADA_` | `'2026-09-08'` → **la fecha de hoy** |
| `CASOS_POR_MARCADOR_` | el mapa entero |

⭐ **Y uno que NO detona, medido y no supuesto:** `tools/probar-cambios-0409.js` ya no cuenta CSV
—`dir.length >= CSV_PREVIOS_.length` y la lista de los cuatro que tienen que seguir estando—, así
que un CSV nuevo **lo hace crecer y eso no es una falla**. No se toca.

**Control:** `probar-guiones-grupos.js` tiene que pasar de rojo a verde **por el motivo correcto**
—la cuenta de archivos, no por otra afirmación—. ⛔ Si se pone verde y alguna de sus afirmaciones
dejó de evaluarse, el hallazgo es el banco.

⛔ **`clasp push` en su propio comando**, después de leer el verde. Nunca encadenado a una tubería.

---

## Parte B — Opus, effort alto · el diff **en seco**

**Correr el cruce y publicar la lista, sin aplicar nada.** Tres columnas y nada más:

| grupo | qué es |
|---|---|
| **(a) levantaría** | marcador con `_revisar` y caso **`exacto` vigente** |
| **(b) pondría** | marcador **limpio** con caso **`contradice`** posterior |
| **(c) chocan** | dos casos que se contradicen sobre el mismo marcador |

### ⛔ Las tres excepciones ya decididas — se cruzan ANTES de listar

**No se re-litigan y no entran a (a) aunque el cruce las traiga:**

1. `post_habitantes1` y `post_alcance1` — cobertura **410 %** contra una identidad que cerraba en
   89 de 89. Un caso `exacto` sobre una foto **no habilita a publicar sin marca lo que una
   identidad viva desmiente hoy**.
2. Los ocho `imp_*` — marcados por **`D-58`**, universo y grano temporal, no por falta de caso.
3. Todo lo **congelado** por el usuario: los Resúmenes Ejecutivos, los `*_bench_*`, y lo que vive
   sólo en láminas escondidas **en las dos** plantillas.

⚠ **Y la dirección que ya falló una vez:** el cruce corre **en un solo sentido** si sólo se mira
(a). `u1_post_meta_alcance` tenía caso `contradice` y **ninguna marca** — publicando sin aviso. **La
(b) no es opcional.**

### ⛔ Lo que la Parte B NO hace

- No escribe `MARCADORES`.
- No corre `aplicarGuionesValidados()` ni ningún `confirmar*()`.
- ⛔ **No re-corre una función `confirmar*()` sin cruzar su lista contra los CSV posteriores a su
  fecha** — su lista está **congelada** en el día que se escribió, y re-aplicarla limpiaría
  marcadores que un caso fechado declara contradictorios.

**Sale a `docs/PENDIENTES_consistencia.md`**, fechado, con los tres grupos y sus nombres completos.
⛔ **Nombres, no conteos**: un grupo (a) con «8 marcadores» y sin la lista no se puede ni discutir.

---

## ⛔ Hard stops

1. ⛔ **Ninguna escritura sobre `MARCADORES` en este prompt**, por más obvio que se vea el
   levantamiento.
2. ⛔ **Si un `caso_id` repetido es `exacto` o `contradice`, parar** (0.2).
3. ⛔ **Si el generador ve 7 archivos, parar** — la constante quedaría mintiendo con otro número.
4. **Dos commits separados:** código (A) y documentación (B + lo que falte del `_1`).
