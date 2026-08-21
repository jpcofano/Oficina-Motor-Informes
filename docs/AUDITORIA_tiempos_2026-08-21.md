# Auditoría de tiempos de corrida — 2026-08-21

> **Evidencia congelada.** Mide dónde se va el tiempo de una corrida de `jm` y por qué el motor
> "se traba". No propone: mide, y ordena las salidas por lo que cuestan.
>
> **Instrumento:** el rastro de etapas que `marcarEtapa_` escribe en la columna `faltantes` de
> `CORRIDAS`, con `flush()` por etapa — leído con `panel_ultimasCorridas`. ⭐ **Es la única medición
> directa que existe**, y sobrevive incluso a una corrida que muere en el muro.
>
> ⚠ **Ocho corridas tienen rastro; las anteriores al 20/08 no.** El rastro se agregó el 20/08
> (`2026-08-20_9`), así que todo lo de antes es ciego.

---

## ⛔ El hallazgo, en una línea

**Cada asignación resuelve los 111 marcadores del informe y usa 15.** La etapa 3 se lleva el
**62–88 %** del techo, y **la próxima corrida no entra**: proyecta **493 s** contra un techo útil de
**320**.

---

## 1 · Dónde se va el tiempo, medido

```
corrida     e1 exp  e2 mapa  e3 items     e4    total  impresiones
─────────────────────────────────────────────────────────────────
185459         17s      13s      267s     7s     304s      36
183602         45s      24s      239s    13s     321s      97
114540         68s      10s      233s    10s     321s     170
175132         70s      21s      204s     7s     302s     158
172003         97s      11s      195s    13s     316s     154
171421         80s      16s      200s    11s     307s     155
─────────────────────────────────────────────────────────────────
100115        117s      24s        1s    18s     160s       0   ← sin ítems
094731         76s      16s        1s     0s      93s       0   ← sin ítems
```

**La etapa 3 —la pasada por ítem— es el 62 %, 65 %, 68 %, 73 %, 74 % y 88 % del total.** Entre 195 y
267 s, promedio **223 s**.

⚠ **Y las seis corridas con ítems cortaron TODAS en la etapa 4**, por el mismo motivo: llegan ahí con
~300 s gastados de 320 útiles, y la etapa 4 pide 60. **Ninguna publicó jamás los tokens fijos.**

**Las dos sin ítems son el control:** con la etapa 3 en 1 s, el total baja a 93 y 160 s. **Confirman
que el costo está en la etapa 3 y no repartido.**

---

## 2 · La causa, en el código

`Generador.gs`, dentro del bucle de asignaciones:

```js
var resolucionItem = resolverMarcadores(informeId, asignacion.item.opciones);
var porMarcadorItem = {};
resolucionItem.resultados.forEach(function (r) { porMarcadorItem[r.marcador] = r; });

tokensDeSlide_(slide).forEach(function (token) {
  var r = porMarcadorItem[token];
  …
});
```

⭐ **`resolverMarcadores(informeId, …)` resuelve TODOS los marcadores del informe** —
`leerMarcadores_()` filtrado por `informe_id`, sin mirar la lámina — **y después se usan sólo los
tokens que esa lámina tiene.**

**Medido hoy sobre `jm`:**

| | |
|---|---|
| marcadores que resuelve **cada** asignación | **111** |
| tokens que la lámina promedio **usa** | **15** |
| desperdicio | **~87 %** |

**Los tokens por lámina de los bloques repetibles**, para que se vea el desbalance:

```
L-052   2      L-040   0      L-044   1      L-047  50
L-035  30      L-041   1      L-045  11      L-048  15
L-053  36      L-042   3      L-046  31
                L-043   7
```

⚠ **La portada del encuentro (`L-052`) tiene 2 tokens y resuelve 111 marcadores para pintarlos.**

**Costo medido:** `233 s / 16 asignaciones = 14,6 s por asignación` (corrida `114540`). Eso es
esencialmente **un `resolverMarcadores` completo por lámina copiada**.

---

## 3 · ⛔ La próxima corrida no entra, y el número lo dice

**Tres cosas cambiaron hoy y las tres empujan en la misma dirección:**

| cambio | efecto |
|---|---|
| **+24 marcadores `u1_`** (87 → 111) | cada asignación cuesta **+28 %** |
| **`campana` pasó de 8 a 9 láminas** (`D-37`) | 2 campañas × 9 = **18** asignaciones |
| **`encuentro` volvió a emitir** (se tildó `mostrar`) | 2 encuentros × 2 = **4** asignaciones |

```
22 asignaciones × 14,6 s × 1,28  =  411 s   (etapa 3)
                    + etapa 1 ~70 s
                    + etapa 2 ~15 s
                    ─────────────────
                              493 s
techo útil (350 − 30 de reserva) = 320 s
```

⚠ **Va a cortar EN la etapa 3**, no en la 4 — o sea **antes de terminar los ítems**. El deck va a
salir con encuentros o campañas sin pintar. **Con el mecanismo desatendido eso se reanuda solo**,
pero cada ejecución vuelve a pagar el arranque.

⭐ **Y esto explica lo que se vio hoy**: *"no llegó a generar, cortó por tiempo, pero parece que armó
bien el deck, no salió ningún número"*. **Armó bien el deck** — la etapa 1 tardó 17 s, lo más rápido
medido — **y se quedó sin tiempo en la 3.**

---

## 4 · Las salidas, ordenadas por lo que cuestan

**A · ⭐ Resolver sólo los marcadores de la lámina.** El bucle ya sabe qué tokens tiene la slide:
`tokensDeSlide_(slide)` se llama **tres líneas después**. Pasarle ese conjunto a `resolverMarcadores`
convierte 111 en ~15.

- **Techo del ahorro: ~87 %** de la etapa 3 → de 411 s a **~55 s**.
- ⚠ **No es lineal**, y hay que medirlo antes de prometerlo: parte del costo de `resolverMarcadores`
  es fijo por llamada —leer `MARCADORES`, `MAPEO`, `SOLAPAS`— y **el caché de `2026-08-20_11` ya lo
  cubre**. Lo que se ahorra es la resolución **por marcador**, que es la parte que escala.
- **Riesgo:** un marcador que hoy se resuelve y no se usa deja de resolverse. Si algo depende de ese
  efecto lateral —el conteo del resumen, `FALTANTES`— cambia. **Hay que mirarlo, no asumirlo.**

**B · Cachear la resolución entre asignaciones del mismo ítem.** Un ítem con 2 láminas resuelve dos
veces lo mismo con las **mismas** `opciones`. Con 22 asignaciones sobre ~4 ítems distintos, el ahorro
es de **22 llamadas a ~4**.

- ⚠ **La clave tiene que ser las `opciones` completas**, no el ítem: `fila_rdv` e `id_cuenta` son lo
  que cambia el resultado. Una clave que "pegue más seguido" mueve un número (`CLAUDE.md` §4).
- **Se combina con A** y es más barata de implementar.

**C · Subir el techo.** ⛔ **No es una salida**: el muro de Apps Script está en 360 y `CONFIG` ya
está en 350. No hay margen.

**D · Partir la corrida.** Ya existe (`D-36`, corrida desatendida) y **es lo que va a pasar solo**.
⚠ Pero **cada ejecución vuelve a pagar los 70–80 s de arranque**, y la Parte C del `2026-08-20_10`
—persistir el anclaje— **no se hizo**. Con tres ejecuciones son 210 s de recálculo.

---

## 5 · Lo que la etapa 1 dice, y es un hallazgo secundario

**La expansión varía entre 17 y 117 s** — un factor de 7 sobre el mismo trabajo nominal.

⚠ El arranque —anclaje + unión digital— **se cachea por ejecución**, así que la variación no es de
código: es de **la plataforma y del tamaño de las bases ese día**. `100115` gastó 117 s en expandir y
**emitió cero ítems**: pagó el arranque entero para nada.

⭐ **Es el mismo costo que la Parte C del `2026-08-20_10` venía a eliminar persistiendo el anclaje.**
Sigue sin hacerse, y esta medición le pone precio: **entre 17 y 117 s por ejecución**.

---

## 6 · ⚠ Lo que esta auditoría NO contesta

- **Cuánto de los 14,6 s por asignación es fijo y cuánto por marcador.** La proyección del punto 3
  supone que escala con la cantidad de marcadores —por eso el ×1,28— y **eso no está medido**. Si
  buena parte fuera fijo, la salida A rinde menos de lo que dice el punto 4.
- **Qué pasa con el conteo y con `FALTANTES` si se resuelve menos.** Es el riesgo de la salida A y
  **hay que mirarlo en el código**, no deducirlo.
- **Nada sobre `secco`.** Todas las corridas medidas son de `jm`.
- **Nada de antes del 20/08.** El rastro no existía; las diez corridas anteriores son ciegas.
