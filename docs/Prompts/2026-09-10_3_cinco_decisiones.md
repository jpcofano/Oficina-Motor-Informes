# 2026-09-10_3 — Las cinco decisiones del usuario del 10/09

> **Objetivo único:** aplicar decisiones **ya tomadas**. Ninguna se re-litiga, ninguna se amplía.
>
> **Subagente: ninguno.**
>
> ⛔ **Sólo se escriben las filas de `MARCADORES` que las Partes C y D nombran.** ⛔ **No se aplica
> `D-60` completo**: el grupo (a) tiene **17** y el usuario autorizó **dos**. Levantar los otros 15
> sería una aplicación masiva sin decisión, que es exactamente lo que deshizo una decisión suya el
> 01/09 y vivió ocho días.

| parte | modelo | effort | escribe |
|---|---|---|---|
| **0** | Sonnet | medio | nada — reportar y parar |
| **A** | Sonnet | medio | `CIERRE_POR_LAMINA.md` · `CONFIG_INFORMES.md` |
| **B** | Sonnet | medio | el CSV del 10/09 |
| **C** | Sonnet | medio | 2 celdas de `MARCADORES` |
| **D** | **Opus** | **alto** | 1 fila de `MARCADORES` |

---

## Parte 0 — SÓLO LECTURA · reportar y parar

1. ⛔ **¿El `git push` salió?** Los dos commits tienen que estar en el remoto. Si no, **parar**:
   nada de lo de abajo se escribe sobre un repo que claude.ai no puede ver.
2. **Reportar el estado de las filas que las Partes C y D van a tocar** — `formato`, `notas`,
   `informe_id` — leídas de la hoja **viva**, no del snapshot.
3. ⭐ **El máximo global de `caso_id` sobre los ocho CSV**, que es de donde salen los ids nuevos.
4. Confirmar si el bloque de `emin_impresiones` / `emin_clics` (pasado aparte) **ya se ejecutó**.
   Si sí, la Parte B no lo repite y lo dice.

---

## Parte A — dos decisiones de alcance, y las dos son del usuario

### A.1 ⭐ Nueve láminas de `secco` pasan a 🚫 **fuera de alcance**

**Decisión del usuario, 10/09/2026.**

| láminas | qué son | por qué |
|---|---|---|
| `L-004` · `L-005` · `L-006` · `L-007` | uno a uno en comunas · encuentro temático | ⭐ **las escondió el usuario** — no es el ítem 27 |
| `L-023` | Directa: respuestas | fuera de alcance, como `L-048` de `jm` |
| `L-025` · `L-026` · `L-027` · `L-028` | conversación en X · temas · repercusiones · RRSS | ídem `L-050` de `jm` |

⛔ **🚫 no es ⛔ postergado ni ✅ anticipado**: dice *«esto no entra en la fase»*, y es lo único que
**saca la lámina del conteo**. ⚠ **Y no es un cierre: nadie las verificó.** Si alguna vuelve al
alcance, vuelve como ⛔ y con todo su trabajo por delante.

⛔ **Escribir cuántos tokens quedan DORMIDOS en cada una**, medido y no estimado. Es el número que
hay que saber **antes** de volver a mostrarlas: el día que alguien las muestre, salen enteras en
`/////` y se va a leer como *«se rompió algo»*.

⭐ **Reproductor, y da el total de crudos del deck:** `1+5+2+9` en `L-004`…`L-007` y `13+13+11+9`
en `L-023`/`L-025`/`L-027`/`L-028` = **63 de los 76**. Los 13 restantes son la segunda copia de
`L-023`. ⚠ **Eso es del deck expandido, no de la plantilla** — el conteo por lámina lo mide Code.

**Recalcular el conteo de la sección `secco`** de `CIERRE_POR_LAMINA.md`. ⛔ **Ningún ✅.**

### A.2 ⭐ `L-020`/`L-022` — el envío de más **se conserva**, y es una decisión

**Decisión del usuario, 10/09/2026.** El motor publica **tres** envíos de *Operativo Muro* y el
equipo **dos**: el del `02/09` («No apertores del envío de jm») lo poda el equipo.

⭐ **Se conserva, y el motivo es que el deck del motor CIERRA CONSIGO MISMO en los dos lugares:**

```
121.789 + 145.744 + 176.870 = 444.403   = el GLOBAL de L-022 = el «Entregados» de L-020
 31.138 +  55.326 +  64.042 = 150.506   = el «Aperturas»  de L-020
```

⛔ **Y por qué NO se saca para igualar al equipo**, que es la parte que hay que dejar escrita: la
poda es **editorial y manual** — el equipo eligió cuál sacar. El motor no tiene regla que lo
reproduzca, y **cualquier regla que se inventara para acertarle sería calibrar contra el resultado
esperado**: un rodeo, no un mecanismo. Además habría que sacarlo **en los dos lugares a la vez** o
el agregado deja de cuadrar con su propio desagregado.

⚠ **Queda como divergencia declarada, no como caso abierto**, y va a `CONFIG_INFORMES.md` §2.5 con
fecha. **Se habla con el equipo; no se cablea nada.**

---

## Parte B — dos casos al CSV del 10/09

### B.1 `emin_impresiones` y `emin_clics` → `aproximado`

**Sólo si la Parte 0.4 dice que no se ejecutó.** Motor `2.117.760` y `6.175 (0,3 %)`; equipo
`2.080.277` y `6.941 (0,3 %)`. Estado **`aproximado`**: decisión del usuario, la diferencia es por
**momentos de carga** de la fuente.

⛔ La nota lleva las tres cosas que impiden que esto sea un cierre falso:

1. ⚠ **las dos diferencias van en direcciones OPUESTAS** — `+1,8 %` y `−11 %`. Una carga en
   progreso explica una, no las dos — el mecanismo **no está medido**; se cierra por decisión;
2. ⛔ **`reuniones` nunca fue medida por `R-31`** — está **sin medir**, que es un tercer estado, y
   su default declarado es fuera del control por igualdad exacta;
3. ⭐ los tres de Directa de la misma lámina salen **idénticos** — `984.590`, `171.218`, `3.259`.

⭐ **Condición de reapertura:** si en una corrida futura se apartan **más** que hoy, o si `R-31`
llega a medir `reuniones` y la da **estable**.

### B.2 ⚠ Lo que NO se cierra, y va en la misma nota

La caja **Alcance** del bloque digital de `L-012` **no publica ni un símbolo** — ni número, ni
`/////`, ni `-`. El equipo publica `1.037.621`. ⛔ **Una caja vacía no manda a ningún trabajo, que
es peor que un `/////`.** No se le abre caso ni se le escribe fila: no se sabe si es un token sin
fila o una caja que la plantilla no declara, y eso lo contesta el censo posicional.

---

## Parte C — `emin_lista` y `emin_encuentros`: **quitar la marca**

**Decisión explícita del usuario, 10/09/2026** — que es lo que `D-58` exige para la mitad que
**quita**: *«esa solapa está cerrada, hoy salió igual»*.

Los dos están en el **grupo (c)** del diff: dos casos que se contradicen sobre el mismo marcador.
`C-101` los dio por universo equivocado el 06/09; `C-106` y `V-137` los volvieron a medir y el
criterio de corte por **fecha del encuentro** reproduce. Hoy la lista publica **11 de 11** con las
mismas fechas que el equipo.

⛔ **`imp_prog` es el tercero del grupo (c) y NO se toca:** su marca es por **universo y grano
temporal** (`D-58`), no por falta de caso.

**Cómo se escribe, y las dos guardas que ya costaron caro:**

- ⭐ **Backup antes**, y **releer de la hoja** después: el escritor verifica **lo que quedó**, no lo
  que pidió escribir. Un vaciado que no ocurrió publica el valor viejo sin fallar.
- ⛔ **`revisarASinValidar_` repone la marca si `notas` sigue diciendo `SIN VALIDAR`.** Mirar esa
  celda **antes**, o el levantamiento dura hasta la próxima corrida.

---

## Parte D — Opus, effort alto · `cc_campanias`: se elige la candidata **2**

**Decisión del usuario, 10/09/2026:** *«elegí alguna y cerralo»*. `C-112` mide nueve candidatas y
cuatro aciertan las dos ventanas; agosto no discrimina, así que **todo el peso está en julio** y
**el acierto no desempata**.

⭐ **Se elige `Tipo de llamado` distintos —la 2— y el desempate es por MODO DE FALLA, no por
acierto**, que es el mismo criterio con el que se eligió la regla provisoria de `X-28`:

| candidata | modo de falla |
|---|---|
| **2 · `Tipo de llamado` distintos** | ⭐ columna **tipada**, y sus cadenas —`Convocatoria`, `IVR convocatoria`— ya las usa un filtro **validado** (`V-91`/`S-01`). Un valor nuevo **sube el conteo de forma visible** |
| 3 y 8 · por nombre de campaña | ⛔ **descartadas por precedente medido**: `CENSO_ids_campanas` dice que el nombre **no sirve como clave** — cuatro solapas, cuatro grafías, y una fila que trae el nombre de otra campaña |
| 7 · `Tipo` distintos | ⚠ es **la otra familia** que etiqueta la misma fila con palabras distintas (`C-114`). Empata en acierto y no tiene el filtro validado detrás |

**Se cablea con `_revisar`**, y ⛔ **no porque el número sea dudoso: porque la REGLA que elige es
provisoria.** ⭐ **Condición de salida escrita:** el sufijo se quita el día que aparezca una tercera
ventana donde las cuatro candidatas **difieran**, o que el equipo conteste. Son cuatro celdas y
ningún `clasp push`.

⚠ **Y el gate que ya falló una vez:** verificar que el marcador lea **la base nueva**
(`acumulado`), **no `looker/CC`** — el cruce caso → marcador no scopea por base.

⛔ **`gcba_cc_campanias` NO entra**: el usuario nombró uno. Si se quiere, va con su propia decisión.

---

## ⛔ Hard stops

1. ⛔ **Si el push no salió, no se escribe nada.**
2. ⛔ **Sólo las tres filas de `MARCADORES` de C y D.** Los otros 15 del grupo (a) **no se tocan**.
3. ⛔ **Ningún ✅** en el tablero.
4. ⛔ **Si `revisarASinValidar_` va a reponer la marca de C, parar y decirlo** en vez de escribir
   dos veces.
5. **Commits separados:** documentación (A, B) y configuración (C, D). `git push` después de cada
   uno.
