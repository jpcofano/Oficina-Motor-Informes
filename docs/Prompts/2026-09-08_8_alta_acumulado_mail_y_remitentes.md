# `2026-09-08_8` · Dar de alta `acumulado | Mail`, y recién después las cinco `camp_envN_rem`

**Destino:** `docs/Prompts/`. **Estado:** no ejecutado.
**Continúa** `2026-09-08_7`, ejecutado el 08/09 23:13. **Modelo: Opus, effort alto.**

⛔ **Sólo esto.** No se levanta ningún `_revisar` — eso es el prompt siguiente.

---

## 0 · Qué pasó, y qué falta de verdad

**`G1` del `_7` barrió `digital/Directa Mail`** —25 columnas, 0 candidatas— y concluyó *«la fuente
no tiene el dato»*. **La fuente que el usuario nombró es otra:** `acumulado | Mail`, de *DGPLES -
Directa acumulado*, la misma base que Call Center.

⛔⛔ **Y esa solapa no está medida.** No está registrada en `SOLAPAS` ni mapeada en `MAPEO`.
⇒ **El hueco no es de cableado: es de alta.** Este prompt son **dos trabajos en orden**, y el
segundo no arranca si el primero no cierra.

⭐ Lo que sí está confirmado por el `G0` de esa corrida: en esa base el remitente **está
normalizado** —`acc_remitente` col Q— y `DIMENSIONES_.ambito` la compara contra los literales
**`JM`** y **`GCBA`**. Es un indicio fuerte de que la solapa hermana trae lo mismo. **Indicio, no
medición.**

⚠ **Dos observaciones de esa misma corrida, al reporte y no al arreglo:**

1. El barrido leyó **2.482 de 2.524 filas**. Un *«ninguna columna trae `JM`/`GCBA`»* sobre el 98 %
   **no es un negativo firme**. Que un barrido sea entero o declare su recorte.
2. `gcba_cc_base` quedó con caso `C-108 (cerrado)` y sus dos hermanas **sin caso**, habiendo nacido
   en la misma escritura. **Reportar por qué difieren.** No arreglarlo acá.

---

## 1 · Trabajo 1 — el alta · con los instrumentos que ya existen

⛔ **No escribir un censo nuevo.** Están los tres y se usan en este orden:

1. **`censarSolapasParaAlta()`** — dice qué solapas tiene `acumulado` y cuáles están `SIN
   REGISTRAR`. ⭐ **Volcar la base entera, no sólo `Mail`**: si hay más solapas sin registrar, es
   ahora que se ven y se anotan (no se dan de alta).
2. **`censarSolapasSinRegistrarEnProfundidad()`** sobre `Mail` — banda, títulos textuales sin
   normalizar, **y si tiene fórmulas**.
   ⛔⛔ **Es el gate del alta:** una solapa con fórmulas que referencian otra solapa **es derivada**,
   y `R-02` excluye las derivadas como fuente. **Si `Mail` resulta derivada, `uso = derivada` y las
   cinco filas NO salen de ahí.** Reportar y parar.
3. **`inventariarSolapas()`** — registra la fila en `SOLAPAS` con su `firma_encabezado`.
   ⚠ Escribe `origen = auto` y una re-siembra la pisa. Si esta fila tiene que sobrevivir a una
   re-siembra, va `manual` a mano — **decisión del usuario, se reporta, no se toma.**

**Y el alta de `MAPEO`**, una fila por campo que las cinco necesiten: la columna del ámbito, y
`fecha_periodo` para que el `separador` funcione. **Indexado por letra de columna, nunca por
título** — `Desglose impresiones` ya mostró que los títulos se repiten.

⛔ **Trabajo 1 termina en reporte.** Si el gate de `R-02` cae, o si la columna de ámbito no existe,
**el Trabajo 2 no se ejecuta** y el destrabe pasa a ser del equipo (`C-01`).

---

## 2 · Trabajo 2 — las cinco filas · y el riesgo que no desaparece

⛔⛔ **Los otros 40 tokens de envío de `L-047` son `FILA` sobre `digital | Directa Mail`.** Si el
remitente sale de **otra solapa**, `valor_fijo = 2` toma **el segundo envío de esa solapa**, que no
tiene por qué ser el segundo envío de la otra.

⇒ **La tabla quedaría completa y con el remitente de otro envío en cada fila.** Es peor que el
`/////`, porque **no se ve mirando el deck.**

### Los gates, todos antes de la primera escritura

| gate | qué exige | si falla |
|---|---|---|
| **G0** | `Mail` quedó registrada con `uso = fuente` (Trabajo 1) | ⛔ no se escribe nada |
| **G1** | la columna de ámbito trae **`JM`/`GCBA`** y nada más. ⚠ **Ojo con el espacio final**: `'JM '` ya apareció en `Directa IVR` y cayó en el ámbito contrario sin fallar | ⛔ no se escribe nada |
| **G2** | ⭐⭐ las dos solapas **alinean envío por envío** sobre la misma ventana, verificado por una clave **que no sea la posición** (`fecha` + `enviados`, o la campaña) | ⛔ no se escribe nada. ⛔⛔ **Y NO se escribe el mail crudo como salida de compromiso** |

⭐ **Declarar los dos conteos de filas aunque coincidan.** Un cinco y un cinco declarados son un
dato; un silencio no.

### Si los tres pasan

Con `backupMarcadores_()` primero:

- **`camp_env1_rem`** se **reescribe** —hoy en fila 149, sobre `digital/Directa Mail` con
  `mail_remitente`— para apuntar a la solapa nueva.
- **`camp_env2_rem`** … **`camp_env5_rem`**, alta, iguales, cambiando sólo `valor_fijo`.
- `operacion = FILA`, `separador = fecha_periodo`, `formato = texto`.

⛔ **Las cinco nacen con `_revisar`.** Ningún caso las validó, y el diagnóstico del 08/09 dejó la
regla explícita: **sin caso, el guión está bien.**

⭐ **Relectura desde la hoja al final, marcador por marcador.**

⛔ **Nada más.** No se toca `Fuentes.gs`, ni `DIMENSIONES_`, ni ninguna plantilla, ni ninguna
planilla de terceros, ni un `formato` fuera de estas cinco filas.

---

## 3 · Docs

`docs/` con el resultado, y las entradas en `PLAN.md` y `BITACORA.md`.

**La corrección que este prompt obliga:** el reporte del `_7` dice *«la fuente no tiene el dato»*.
**Es falso y hay que dejarlo escrito**: midió `digital/Directa Mail` cuando la fuente es
`acumulado | Mail`. ⭐ **El error no fue el barrido: fue que el gate nombraba una conclusión —«no
hay columna»— en vez de nombrar la solapa que tenía que abrir.** Un gate que no dice sobre qué
mide, mide sobre lo que tiene a mano.

**Y `D1` sigue sin vivir en ningún lado:** la columna Envío publica el **ámbito**, no el mail, y es
**la misma condición que `DIMENSIONES_` aplica** en esa base. Si mañana cambia el criterio, cambian
las dos cosas o se desincronizan en silencio. Va a `CONFIG_INFORMES.md` y **cierra el ítem 15**.

---

## 4 · Los botones, que son del usuario

1. `censarSolapasParaAlta()` — leer antes de seguir.
2. `censarSolapasSinRegistrarEnProfundidad()` — **acá se decide si `Mail` es fuente o derivada.**
3. `inventariarSolapas()` — registra.
4. `diagAplicarRemitentes20260908()` — seco.
5. `aplicarRemitentes20260908()` — escribe.
6. **Corrida de `jm` con `periodo_id = julio_24_30`.**

**Lo que la corrida tiene que contestar:**

- ⭐⭐ **¿La fila 1 de la columna Envío dice `JM`?** Hoy publica el mail de Jorge Macri. **Si dice
  `GCBA`, la alineación se corrió y hay que revertir con el backup.**
- ⛔ ¿Cada Envío se corresponde con su fila? Cruzar contra `camp_envN_enviados`, que ya publica.
  **Es la única forma de ver una desalineación.**
- ¿Las cinco publican, **entre guiones**?
- ¿`camp_env4_fecha` publica? Se escribió en el `_7` y su corrida quedó pendiente.
- ⛔⛔ ¿Cambió algún otro valor? **No debería.** Si se movió uno, **parar**.
