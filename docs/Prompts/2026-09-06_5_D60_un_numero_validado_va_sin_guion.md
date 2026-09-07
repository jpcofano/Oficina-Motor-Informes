# 2026-09-06_5 — `D-60`: un número validado va sin guion

**Cuatro partes.** La `A` escribe una regla, la `B` la aplica, la `C` retira una función, la `D`
tapa un hueco de medición.

---

## Reglas

1. ⛔ **No corras nada contra la planilla viva.** ⛔ **No hagas `clasp push`.** ⛔ **No toques
   plantillas.**
2. ⛔ **Si algo necesita una decisión no escrita, PARÁ ESA PARTE** con la pregunta exacta.
3. **Un commit por parte.** ⛔ **Ningún número al reporte sin el comando que lo produjo.**
4. ⭐ **El cruce se hace sobre el BLOQUE entero, no sobre los casos que este prompt nombra.** Si algo
   de acá contradice una decisión que no nombro, **gana la decisión** y se reporta.

**Subagentes:** `verificador` al cerrar `A`, `B` y `C`. ⛔ `cableador` **no se usa**.

---

## Parte 0 — Premisas · **Sonnet** · effort normal · SÓLO LECTURA

| # | premisa | reproductor | esperado |
|---|---|---|---|
| **0.1** | El último `D-NN` es `D-59` | `grep -roE '\bD-[0-9]{2}\b' docs/*.md CLAUDE.md \| grep -oE 'D-[0-9]{2}' \| sort -u -t- -k2 -n \| tail -1` | `D-59` ⇒ el nuevo es **`D-60`** |
| **0.2** | La lista de hoy son siete | leer `GUIONES_A_LEVANTAR_` | los cuatro del `C-99` + `emin_or`/`emin_ctor`/`emin_ctr` |
| **0.3** | `emin_lista` y `emin_encuentros` están afuera **por el gate de `D-58`** | leer el bloque «los que no entran» | declarados, con el motivo |
| **0.4** | `imp_prog` cruza la mitad insegura | leer su entrada | `previos` con `contradice`, vigente `exacto` (`V-108`) |
| **0.5** | La lista de `levantarRevisar_` es del 01/09 y **4 de 24 vencieron** | la medición de la Parte D del `_4` | `enc_impresiones`, `ivr_75`, `ivr_75_pct`, `ivr_marque1` |
| **0.6** | El desarme **subcuenta**: 7 de 24 quedan fuera del filtro | ídem | las celdas con `vs` y con llaves no pasan |

---

## Parte A — `D-60` · **Opus** · effort alto

⭐⭐ **Decisión del usuario, 06/09:** *«los números validados tienen que estar sin guiones; con que
se hayan validado una vez, está»*.

**`D-60`, en una línea:** ⭐ **un marcador cuyo caso VIGENTE es `exacto` va sin `_revisar`.** El
historial anterior no lo bloquea.

⇒ **Esto resuelve la pregunta que `D-58` dejó abierta**, y la resuelve **simétricamente**: el más
nuevo manda **en las dos direcciones**. Poner la marca y sacarla dejan de ser asimétricas.
⛔ **`D-58` no se borra ni se reescribe**: `D-60` la completa y se dice así, con la fecha.

### ⛔ El límite, y es lo único de esta regla que puede hacer daño

*«Validado una vez»* **no puede significar que un `exacto` viejo sobreviva a un `contradice`
posterior.** Si significara eso, `X-42` y `X-43` quedarían anulados y el deck publicaría sin aviso
cuatro números que un caso desmiente. ⇒ **`D-60` habla del caso VIGENTE, no de cualquier caso del
historial**, y eso va escrito en la regla, no dado por entendido.

⭐ **Y la parte que decide el usuario, con el número al lado:** **medí cuántos marcadores tienen un
`exacto` viejo y un `contradice` más nuevo.**

- **Si el número es cero**, no hay nada que decidir y la regla se aplica entera. **Decilo en el
  reporte con el comando.**
- **Si es mayor que cero**, **listalos por nombre y pará**: son los únicos donde las dos lecturas de
  la frase del usuario dan resultados opuestos.

⛔ **Un conteo no alcanza acá.** Se listan por identidad, con el caso viejo y el nuevo al lado.

### Y la condición que la reabre

*«se revisa si aparece un caso que valide un marcador y después se descubra que la validación era
del formato y no del valor»* — ⚠ **porque ya pasó**: `C-102` valida el `%` duplicado, no el
universo, y estuvo a punto de habilitar tres levantamientos que no correspondían.

`verificador` al cerrar. Un commit.

---

## Parte B — La lista, recalculada con `D-60` · **Opus** · effort alto

Recalculá `GUIONES_A_LEVANTAR_` aplicando `D-60`: **entra todo marcador con `exacto` vigente.**

- **Entran** los siete de hoy, más **`emin_lista`**, **`emin_encuentros`** —`C-105` los declara
  `exacto` vigente y **el criterio es del usuario, no una medición**— y **`imp_prog`** (`V-108`).
- ⛔ **No entran** los que tienen `contradice` vigente: los cuatro de `X-42`, `X-32`, y cualquier
  otro que el cruce devuelva. **La marca es el aviso y ahí sigue haciendo falta.**
- ⛔ **Tampoco los de `cerrado` / `abierto` / `deriva`.** ⭐ **`cerrado` es «no se vuelve sobre
  esto», no «el número coincide»** — `D-60` habla de `exacto` y de nada más.
- ⛔ **`camp_titulo` sigue afuera**: no tiene caso, el ítem 9 está abierto, y sacarle la marca sería
  declarar validado lo que está en investigación.

⭐ **El número final salís de medirlo, no de esta lista.** Si tu cruce devuelve algo distinto de
diez, **gana tu medición** y lo reportás con el comando.

### Lo que no cambia

- **La lista sigue explícita y congelada, con su fecha adentro.** `D-60` cambia **quién entra**, no
  que la lista sea auditable.
- ⛔ **Levantar son DOS escrituras**: `formato` y el `SIN VALIDAR` de `notas`. Si una falla, ninguna.
- ⭐ **El gate de identidad de ministros SE MANTIENE** —Sabor entra, Quirós no—, y el motivo es que
  **no valida nada**: verifica que el corte por `D` esté haciendo efecto **antes de escribir**. ⚠ La
  decisión del usuario cerró *qué* tiene que publicar la lista; **no** dice que la hoja ya lo esté
  haciendo. Si el gate no pasa, **no se escribe nada**.
- **Banco por identidad**: falla si entra alguno con `contradice` vigente, y falla si el gate no
  aborta la operación entera.

⛔ **No la corras.**

`verificador` al cerrar. Un commit.

---

## Parte C — `levantarRevisar_` se retira · **Sonnet** · effort normal

⭐ **Decisión, 06/09: sobrevive `guionesValidados_`.** Tiene el cruce de `D-58`/`D-60` y su constante
declara cuándo se congeló.

**El motivo está medido:** la lista de `levantarRevisar_` es del **01/09**, y **4 de sus 24 ya no
tienen `exacto` vigente** —`enc_impresiones`, `ivr_75`, `ivr_75_pct`, `ivr_marque1`—. ⇒ **Re-correrla
hoy les sacaría la marca sin ningún caso que las respalde.** Es `confirmarNumerosDeUnoAUno()` otra
vez, pero viva y sin gate.

- ⛔ **No se borra: se desactiva.** Que **falle con un mensaje** que diga por qué y a qué función ir.
  Una función eliminada vuelve a escribirse; una que aborta explicando, no.
- ⛔ **Su registro y su lista quedan** — son evidencia fechada de lo que se levantó el 01/09.
- ⭐ **Y el hallazgo va a la documentación como caso general, no como anécdota**: *«toda lista
  congelada que escribe en la hoja tiene que cruzarse contra los CSV posteriores a su fecha antes de
  re-correrse»*. Ya está en `D-58` y en `CLAUDE.md` §4 — **si ya está, registrá el cero** y sumá
  sólo la medición nueva.

`verificador` al cerrar. Un commit.

---

## Parte D — El desarme que subcuenta · **Sonnet** · effort normal

**7 de 24 quedan fuera de la constante** porque las celdas con `vs` y con llaves no pasan el filtro.
⚠ **Falla del lado seguro** —de menos, nunca de más— pero **falla**: un marcador que no entra a la
constante es invisible para todos los cruces que la usan.

- Arreglá el desarme para que reconozca esas formas.
- ⭐ **Control positivo sintético y obligatorio**: una celda de cada forma —con ` / `, con ` vs `,
  con llaves— que el desarme **tiene que** partir bien. ⛔ **Si el control no pasa, aborta**: un
  desarme que devuelve menos no se distingue de uno que no mira nada.
- ⭐ **Y reportá el delta por identidad**: qué marcadores entran ahora que antes no. ⛔ **Si alguno de
  los nuevos tiene `exacto` vigente, la lista de la Parte B cambia** — decilo, no lo apliques solo.

`verificador` al cerrar. Un commit.

---

## El reporte

1. La tabla de la Parte 0.
2. Una fila por parte: parte · estado · commit · una línea.
3. **«Para correr»**, en orden, con **qué tiene que dar cada una**.
4. **«Bloqueado, decide el usuario»** — la pregunta exacta, una línea. ⭐ Si la medición de la Parte
   A dio cero, **acá no va nada de `D-60`**.
5. Lo que encontraste y no estaba en el prompt.

## Orden

```
0 → A (Opus)   ← la regla; todo lo demás cuelga de ella
    D (Sonnet) ← antes que B: puede cambiar quién entra a la lista
    B (Opus)   ← la que mueve los números del deck
    C (Sonnet)
```
