# 2026-08-17_4 — Tanda 4: `frecuencia` / `gcba_frecuencia`, la última de `looker`

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que el par de `looker/resumen_metricas_dinamico` declare su corte de
> `ambito` en `dimensiones`. **Con esto la migración queda completa sobre todo lo que se puede
> migrar** — 42 de 48; los seis restantes están bloqueados por un hueco de dato, no de vocabulario.
>
> **Estado: 40 de 48 migrados.** Piloto, tanda 1 (mail), tanda 2 (`m2`) y tanda 3 (`rdv`) cerradas.

---

## ⚠ La precondición que este prompt existe para resolver

**Migrar este par deja `looker` sin ningún marcador sin migrar.** `looker` tiene **exactamente
diez** —los ocho del piloto y estos dos— así que después de esta tanda **no queda ninguno que
pueda hacer de canario en esa base**.

**Está anotado desde el 16/08**, cuando el par salió de la tanda 1 justamente por eso. **Ahora
toca, y la salida ya está probada.**

### La salida: verificación en la misma sesión — la misma que destrabó `rdv`

**Testigo → migración → verificación, con minutos entre tomas.** Funcionó dos veces el 17/08:
**11 minutos** en la tanda 2 y **5 min 52 s** en la tanda 3, y las dos cerraron por igualdad
exacta.

**El criterio es `CLAUDE.md` §4:** la pregunta no es *"¿está quieta la base?"* sino **"¿se mueve
dentro del intervalo de la verificación?"**. Una base que se mueve **no bloquea** si el intervalo
es corto.

### ⚠ Pero acá hay una diferencia real con las tres tandas anteriores

**`looker` se mueve DENTRO de ventanas cerradas, y está medido varias veces esta semana:**

| cuándo | qué se movió |
|---|---|
| 15/08, 1h45 | `gcba_imp_total` **+138.427** impresiones, misma ventana |
| 16/08, ~1 h | `imp_total` de **34.289.779 a 34.293.287** |
| 15/08 | el numerador de `gcba_frecuencia` cayó a **0** durante un recálculo |

**`digital` crecía FUERA de la ventana** —por eso los valores en ventana daban idénticos—.
**`looker` se mueve DENTRO.** Son cosas distintas y ésta es la que rompe la comparación.

**Entonces: la igualdad exacta puede NO darse aunque la migración esté bien.** Y hay que decirlo
antes de correr, porque el reflejo entrenado por las tres tandas anteriores va a ser leer un valor
distinto como una falla.

---

## El control de esta tanda: **la partición de ámbito, y es fuerte**

**Medido:** `frecuencia` lee **4 de 26** y `gcba_frecuencia` **22 de 26**.

```
4 + 22 = 26   ✔   partición exhaustiva del universo
```

**Es disjunta y exhaustiva por construcción**, igual que la de la tanda 1: `campana~=JM` y
`campana!~=JM` son complementarios, así que **toda fila cae en exactamente una de las dos**.

**Si la dimensión traduce mal, esa suma deja de dar 26.** Y a diferencia de los valores, **la
cuenta de filas no depende del drift de los números** — `looker` puede recalcular impresiones sin
que cambie cuántas campañas hay.

**Este es el control principal de la tanda, no el respaldo.** Es la inversión respecto de las
tandas 2 y 3, donde el principal eran los valores idénticos.

| | tanda 1 | tandas 2 y 3 | **tanda 4** |
|---|---|---|---|
| control principal | partición exhaustiva | **valores idénticos** | **partición exhaustiva** |
| por qué | `digital` crecía fuera de ventana | ventana estable en el intervalo | **`looker` se mueve DENTRO de la ventana** |

⚠ **Y si el universo cambia de 26**, eso es la base recalculando y **no la migración**: hay que
mirar que **las dos partes sumen el nuevo total**, no que den 4 y 22.

---

## Parte A — el testigo, **sólo lectura**

1. **Los dos valores**, con **la cuenta de filas de cada uno**, atribuidos nominalmente.
2. **La partición**: `filas(frecuencia) + filas(gcba_frecuencia)` y el **universo**. Verificar que
   sumen. ⚠ **Si ya no cierra antes de migrar, parar y reportar** — un control que nace roto no
   detecta nada después.
3. **Guardar en `docs/_snapshots/TESTIGO_frecuencia_AAAA-MM-DD_HHMM.md`, con la HORA.**
4. **Los consumidores**: en qué láminas están los dos. Wrapper **sin argumentos**
   (`CLAUDE.md` §2).

⚠ **NO hay canario que correr, y es correcto.** No existe ninguno posible en `looker` una vez
migrado el par, y **el intervalo corto lo reemplaza**. No inventar uno de otra base: mediría que
**esa** base esté quieta, que no es la pregunta.

---

## Parte B — estructurar

`frecuencia` → `dimensiones = ambito=jm` · `gcba_frecuencia` → `dimensiones = ambito=gcba`.

⚠ **El `filtro` queda VACÍO en los dos**: su filtro es sólo el corte de ámbito, sin restricción
técnica que preservar — igual que en las tandas 1, 2 y 3.

**Reversión con los filtros generados LEYENDO `docs/_snapshots/MARCADORES_2026-08-17.tsv`** y
verificados carácter a carácter. Son `campana~=JM` y `campana!~=JM`: el `~=` y el `!~=` son
operadores distintos y confundirlos **da un filtro que no matchea nada y devuelve cero sin
fallar**.

**Wrappers sin `_` y sin parámetros:** `migrarTanda4DeFrecuencia()` / `revertirTanda4DeFrecuencia()`.

---

## Parte C — verificar, **en la misma sesión**

| # | qué | qué significa |
|---|---|---|
| **1** | **la partición** `filas(jm) + filas(gcba) = universo` | ⭐ **el control principal.** Si no cierra, es la migración |
| 2 | las cuentas de filas, una a una | si cambiaron **las dos** y la partición cierra, es la base |
| 3 | los valores | ⚠ **pueden diferir sin que nada esté mal** — `looker` recalcula. **Un valor distinto NO detiene la tanda si la partición cierra** |

**El orden es éste y no el inverso.** Es la inversión respecto de las tandas 2 y 3: acá **los
valores son el dato más débil**, no el criterio.

**Si la partición cierra:** escribirlo en `PLAN.md` con las tres horas y el criterio, **regenerar
el catálogo** (`node tools/snapshot.js` y después `node tools/catalogo.js`, en ese orden), y
declarar **la migración completa sobre lo migrable: 42 de 48**.

**Si la partición NO cierra:** revertir y reportar. **No se ajusta hasta que dé.**

---

## Lo que este prompt **no** hace

- **No toca los seis `enc_mails_*`**, que están bloqueados por `@ultimo_ambiguo` — un hueco de
  **dato**, no de vocabulario, y su destrabe es una decisión del usuario.
- **No renombra ningún token.**
- **No mueve `DIMENSIONES_` a hoja** — eso es el frente 13 bis y va **después** de cerrar la
  migración, porque mover el traductor mientras se traduce deja dos variables juntas.
- **No toca plantillas.**
