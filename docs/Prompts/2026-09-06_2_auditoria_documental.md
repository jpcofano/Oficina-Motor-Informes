# 2026-09-06_2 — Auditoría documental y recorte de CLAUDE.md

**Cinco partes.** ⭐ **La Parte A es la que baja el costo de todas las sesiones que vengan.**

⛔ **Nada de este prompt toca código.** Ni un `.gs`, ni `tools/`, ni plantillas. ⛔ **Nada corre
contra la planilla viva.** ⛔ **No hay `clasp push`.**

⚠ **Este prompt asume que la nocturna `2026-09-06_1` ya cerró.** Si sigue abierta, **parar acá**:
las dos escriben documentación y se pisan.

**Subagentes:** `auditor-doc` en las Partes B y C. `documentador` en la Parte E. ⛔ `verificador`
**no se usa** — no hay premisas de motor que verificar. ⛔ `cableador` **no se usa**.

---

## Las reglas de la auditoría

1. ⛔ **Nada se borra.** Todo movimiento de texto es **mover**, no reescribir. Si el texto cambia
   al moverse, dejó de ser el mismo texto y la trazabilidad se rompe.
2. ⛔ **Ninguna contradicción se resuelve en este prompt.** Se detectan y se listan **con las dos
   citas enfrentadas**. El enunciado que gana lo elige el usuario.
3. ⛔ **Ningún número al reporte sin el comando que lo produjo.**
4. **Por nombre, no por `archivo:línea`.**
5. **Un commit por parte.**

---

## Parte 0 — Premisas · **Sonnet** · effort normal · SÓLO LECTURA · ⛔ termina en reportar y parar

| # | premisa | reproductor | esperado |
|---|---|---|---|
| **0.1** | `CLAUDE.md` pesa ~160 KB y tiene 9 secciones `H2` | `wc -c CLAUDE.md` y `grep -c '^## ' CLAUDE.md` | ≈ `164332` y `9` |
| **0.2** | ⭐ **La §4 sola es ~3/4 del archivo** | `awk '/^## 4\./,/^## 5\./' CLAUDE.md \| wc -c` | ≈ `117000`, contra `160011` del total |
| **0.3** | ⭐ **La §4 no tiene subsecciones**: 1.434 líneas sin un solo `###` | `awk '/^## 4\./,/^## 5\./' CLAUDE.md \| grep -c '^### '` | `0` |
| **0.4** | El archivo tiene ~136 fechas `DD/MM` — narrativa histórica embebida | `grep -oE '[0-9]{1,2}/[0-9]{1,2}' CLAUDE.md \| wc -l` | ≈ `136` |
| **0.5** | ⭐⭐ **`CLAUDE.md` §4 ordena parar al terminar cada paso** | `grep -n 'se avisa y se para' CLAUDE.md` | aparece, dentro de la lista numerada de §4 |
| **0.6** | Los cinco documentos grandes son los que están medidos abajo | `ls -l CLAUDE.md docs/PLAN.md docs/BITACORA.md docs/REGLAS_NEGOCIO.md docs/PENDIENTES_consistencia.md` | ver tabla |
| **0.7** | `docs/Prompts/` tiene los prompts copiados y `docs/Prompts/_archivo/` existe | `ls docs/Prompts \| wc -l` y `ls -d docs/Prompts/_archivo` | un número y el directorio |

**La tabla de tamaños de `0.6`, medida el 06/09 desde fuera de la sesión — reproducila, no la
copies:**

| archivo | bytes |
|---|---|
| `docs/BITACORA.md` | 1.115.511 |
| `docs/PLAN.md` | 274.369 |
| `CLAUDE.md` | 164.332 |
| `docs/REGLAS_NEGOCIO.md` | 152.328 |
| `docs/PENDIENTES_consistencia.md` | 141.152 |

⛔ **Si `0.2`, `0.3` o `0.5` no se sostienen, parar y reportar**: la Parte A cambia de forma.

⭐ **Reportar la Parte 0 y PARAR.** Las partes A–E esperan luz verde del usuario.

---

## Parte A — Recortar `CLAUDE.md` sin perder una línea · **Opus** · effort alto

⭐⭐ **El problema, y no es de estilo:** `CLAUDE.md` se carga entero en cada arranque de sesión y
en cada subagente que lo lea. A ~160 KB son **entre 40.000 y 45.000 tokens** —estimación por
caracteres, no medición— **antes del primer mensaje**. Cada subagente que arranca con *«leé
`CLAUDE.md` entero»* paga eso otra vez.

⛔ **Y el recorte NO es resumir.** Resumir pierde los casos que hacen que las reglas se obedezcan
—*«la lámina 5 publicaba 15 encuentros cuando el número era 4»* es lo que sostiene la regla—.
**Se mueve, no se condensa.**

### Lo que se hace

**Separar en `CLAUDE.md` dos cosas que hoy están mezcladas en la §4:**

- **La regla** — el enunciado imperativo. **Se queda.**
- **El caso que la originó** — el párrafo con fecha, el número, qué pasó. **Se mueve** a un
  archivo nuevo, `docs/ORIGENES.md`, con un ancla por regla.

Cada regla que pierde su caso **queda con un puntero de una línea**: *«origen: `docs/ORIGENES.md`
§<ancla>»*. ⭐ **El caso sigue existiendo y sigue siendo encontrable**; deja de cargarse en cada
sesión.

### Cómo se verifica que no se perdió nada

⭐⭐ **Éste es el control que hace que la parte valga:**

```
cat CLAUDE.md docs/ORIGENES.md > /tmp/despues.txt
```

**El conjunto de líneas no vacías de `/tmp/despues.txt` tiene que contener el conjunto de líneas
no vacías del `CLAUDE.md` anterior**, salvo las líneas de puntero agregadas. Un `diff` de
conjuntos ordenados, no un conteo de bytes.

⛔ **Si el control no da, se revierte la parte entera.** No se ajusta el control.

### Lo que NO se toca en esta parte

- ⛔ **Ninguna regla cambia de enunciado.** Ni una palabra. Mover ≠ redactar.
- ⛔ **No se reordenan las secciones.** El ruteo de §3 se mantiene tal cual.
- ⛔ **No se toca `docs/PLAN.md`, `REGLAS_NEGOCIO.md` ni `BITACORA.md`.** Otra parte, otro prompt.

**Reportar el antes/después en bytes y la estimación de tokens ahorrados, con el comando.**

Un commit.

---

## Parte B — Los subagentes que pagan `CLAUDE.md` entero · **Sonnet** · effort normal

`verificador` y `cableador` dicen ambos *«abrí y leé `CLAUDE.md` (raíz del repo) — las
convenciones enteras»*. ⛔ **Cada invocación paga los ~45.000 tokens otra vez**, y desde la
Parte A la mitad de ese peso es narrativa que un subagente no necesita.

Reescribir esa instrucción en los dos: **qué secciones**, no *«entero»*. ⭐ **La lista de lectura
la determinás midiendo qué necesita cada uno**, no por criterio general — y el reporte dice cómo
la determinaste.

⛔ **Todo lo demás de esos dos archivos queda intacto.** Los modos de falla nombrados, los casos
testigo, las reglas de escritura: no se tocan.

⚠ **Los tres agentes nuevos** —`censista`, `documentador`, `auditor-doc`— **ya nacen con lectura
acotada y con `model:` propio.** Verificalo y decilo; si alguno pide más de lo que necesita,
es un hallazgo.

Un commit.

---

## Parte C — El barrido de contradicciones · **Sonnet** · effort normal · SÓLO LECTURA

⭐ **Con `auditor-doc`.** Cinco clases, y el reporte va por clase:

1. **Enunciados incompatibles** sobre lo mismo en dos archivos. ⚠ **Uno ya está localizado y sirve
   de control**: el título de `R-11` dice *«de viernes a viernes»* y su Addendum 1 define *«siete
   días, viernes a jueves»*. **Si el barrido no lo encuentra, el barrido no sirve** — arreglar el
   barrido, no agregarlo a mano.
2. **IDs rotos** — `D-NN`, `R-NN`, `S-NN`, `C-NN`, `V-NN` citados y no definidos, definidos dos
   veces, o superseded sin que el viejo lo diga.
3. **Datos en dos fuentes de verdad** — el mismo número o la misma lista mantenidos en dos
   archivos. ⛔ **No importa si hoy coinciden.**
4. **Reglas huérfanas** — enunciadas y sin nada que las aplique. ⚠ Grepear `.gs` **sólo** para
   confirmar un candidato ya encontrado en la documentación.
5. **Prompts ejecutados sin copiar a `docs/Prompts/`** — la Parte D.

⛔ **Ninguna se resuelve acá.** Salida: la tabla del `auditor-doc`, con las dos citas y el comando.

⭐ **Declarar la cobertura**: cuántos IDs de cuántos se cruzaron. Un barrido parcial declarado se
continúa; uno presentado como completo manda a todos a confiar en lo que no se miró.

Un commit (sólo el reporte).

---

## Parte D — Los catorce prompts del 04/09 · **Sonnet** · effort normal

`HANDOFF_CODE.md` declara **catorce prompts del 04/09 ejecutados sin copiarse a `docs/Prompts/`**
—violación de §3— y aclara que *«eran trece y el número estaba mal»*.

**Lo que se hace, y es sólo esto:**

- **Reproducir la lista** cruzando `git log` del 04/09 contra los archivos que hay en
  `docs/Prompts/`. **El comando va al reporte.**
- **Confirmar o corregir el catorce.**
- Dejar la lista en `docs/PENDIENTES_consistencia.md`, fechada, con **qué falta de cada uno**
  (principal, addendum, o ambos).

⛔⛔ **NO se reconstruye ninguno de memoria.** Un prompt reconstruido es indistinguible de uno
real y sobrevive a la corrida. ⚠ El `_9 Addendum 1` **nunca llegó a la sesión**: sobre su
contenido no se afirma nada.

⚠ **Y verificar el otro hueco que el `HANDOFF` declara:** que **no existe** ningún `_8 Addendum
5`, aunque el `2026-09-05_1` lo dé por ejecutado. `git log` decide.

Un commit.

---

## Parte E — La condición vigilable que faltó · **Sonnet** · effort normal

`HANDOFF_CODE.md` estuvo **62 commits atrasado** (02/09 → 05/09) y **lo encontró el usuario
preguntando, no un control**.

⭐ **Con `documentador`.** Escribir en `docs/PENDIENTES_consistencia.md`, fechado:

- **Cuál es la condición vigilable** que lo habría detectado — un comando que compare la fecha
  del último commit contra la fecha declarada en el `HANDOFF`.
- **Dónde tendría que correr** para que no dependa de que alguien pregunte.

⛔ **No implementarla en esta parte.** Escribir la condición y **quién la corre** es la decisión;
implementarla es otro prompt.

Un commit.

---

## El reporte

1. La tabla de la Parte 0. **Y parar ahí.**
2. Después de la luz verde: una fila por parte — parte · estado · commit · una línea.
3. **Parte A**: bytes antes/después, tokens estimados ahorrados, y **el resultado del diff de
   conjuntos**.
4. **Parte C**: cobertura declarada — IDs cruzados sobre IDs totales.
5. **«Bloqueado, decide el usuario»** — la pregunta exacta, una línea cada una.
6. **Lo que encontraste y no estaba en el prompt.** **Mejorar no es ampliar.**

## Orden y sacrificabilidad

```
0 → (parar, luz verde) → A (Opus)   ← la que baja el costo de todo lo demás
                          B (Sonnet) ← barata, multiplica el efecto de A
                          C (Sonnet) ← el barrido; puede correrse solo
                          D (Sonnet) ← la deuda declarada
                          E (Sonnet) ← ⚠ la primera que se cae
```

## Lo que esta auditoría NO puede cerrar

| qué | por qué |
|---|---|
| Cuál enunciado gana en cada contradicción | ⛔ decide el usuario |
| El texto de `R-11` | ⛔ `REGLAS_NEGOCIO.md` es append-only; el enunciado lo cambia el usuario |
| Los catorce prompts del 04/09 | ⛔ no se reconstruyen de memoria |
| Si `CLAUDE.md` §4 punto 1 —*«se avisa y se para»*— sigue vigente | ⛔ es la regla que hace que Code frene en cada paso. **Cambiarla es decisión del usuario, no de la auditoría** |
