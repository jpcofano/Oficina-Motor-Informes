# Cerrar las láminas 1 a 6 de `JM`

**Modelo:** Opus, effort alto.

**Subagentes:** `verificador` antes de la Parte 0.

**Un objetivo.** Un deck de seis láminas que se genera entero y **se puede mostrar**, con el
iterador de reuniones a la vista. **Toca `.gs` y `MARCADORES`.**

**El criterio de cierre no es el mismo para todas.** Las láminas 1 a 5 cierran con **cero
`«FALTA»` visible**. La lámina 6 cierra con **una lámina por reunión, con su barrio y su fecha
correctos, y todo número que no llegue mostrando el motivo** — no en blanco. Son dos varas
distintas a propósito: en la 6 lo que se muestra es que el motor itera, no que tiene todos los
números.

**Este prompt es corto a propósito.** Su Parte 0 es **una** medición, no seis. El proyecto tiene
verificación de sobra y no tiene nada que mostrar; el desbalance se corrige acá.

---

## El alcance, medido

Inventario de tokens de `JM_marcada`, contado sobre la plantilla:

| lámina | tokens | qué hay |
|---|---|---|
| 1 | 1 | `periodo` |
| 2 | 21 | `mail_*`, `imp_*`, `pauta_*`, `cc_*`, `ivr_*`, `contenidos_total`, `frecuencia` |
| 3 | 19 | **los mismos con prefijo `gcba_`** |
| 4 | **0** | ningún token |
| 5 | 28 | cerrada el 08/08 |

**Dos hechos que definen el trabajo:**

1. **La lámina 3 es la 2 con otro universo.** La regla ya existe: `R-15 Addendum 1` — columna `A`
   `Figura`, `JM` = Jorge Macri, **`GCBA` por resta**. Si la 2 sale, la 3 tiene que salir
   aplicando la regla, **no cableando diecinueve tokens de nuevo**. Si termina cableándose dos
   veces, algo del diseño está mal y hay que decirlo antes.
2. **Ocho tokens de la lámina 2 ya los usa la 5**, que publica bien: `mail_aperturas`, `mail_or`,
   `mail_entregados`, `cc_base`, `cc_contactados`, `cc_contact_pct`, `ivr_atendidos`,
   `imp_total`. **Si ya resuelven, la lámina 2 tiene trece tokens nuevos, no veintiuno.**

3. **El iterador de la lámina 6 ya funciona, y eso es lo que se muestra.** En la corrida medida
   generó **cinco láminas** —San Cristóbal pre y post, Retiro pre y post, Orden Público— y las
   cinco anclaron con cuenta. Cuatro pintaron cero **porque `3354-JULJDGAG` y `3346-JULJDGAG` no
   tienen filas en las solapas de canal para esa ventana**; Orden Público, con `3387-JULJDGGC`,
   resolvió 31 tokens y pintó 11. **No falta cableado: faltan datos, y eso tiene que verse.**

---

## Parte 0 — una sola medición

**Correr el diagnóstico sobre `JM` y devolver una tabla: los 98 tokens de las láminas 1 a 6, y
para cada uno si hoy resuelve, si sale `«FALTA»`, o si publica un valor.** Con el valor al lado
cuando resuelva.

Para la lámina 6, además: **cuántas láminas generó, con qué reunión, qué cuenta y cuántos tokens
pintó cada una.** Es el número que dice si el iterador sigue funcionando como en la corrida
medida.

Nada más. **No auditar, no proponer, no revisar el diseño.** El resto de este prompt depende
únicamente de ese conteo.

**Reportar y parar.**

---

## Parte A — los trece de la lámina 2 *(o los que queden)*

Cablear los tokens de la lámina 2 que la Parte 0 marcó como faltantes, **en un solo bloque**,
usando las fuentes que ya están registradas. Los que ya resuelven **no se tocan**.

Cada token que se cablea deja su fila en `MARCADORES` con `base_id · solapa · campo_logico`
completos. **Ninguno se deja plausible:** si de qué fuente sale un número no está claro, la fila
va vacía y **el token entra a la lista de preguntas del final**, no a una celda con el valor más
probable.

## Parte B — la lámina 3 por regla, no por cableado

Aplicar el universo GCBA a los tokens de la lámina 2 ya resueltos. **El resultado esperado es
cero filas nuevas cableadas a mano**, o muy pocas y con motivo.

**Y el chequeo contraintuitivo que hay que hacer sí o sí:** al cambiar de universo, **algunos
porcentajes suben**. Pasó el 08/08 con la lámina 5 — `insc_cc` e `insc_ivr` son 100 % de JM, así
que al filtrar su numerador no cambia y el denominador cae. **Filtrar no baja todo:
redistribuye.** Un número que sube no es prueba de que la regla esté mal, y frenar por eso ya
costó una corrida.

## Parte C — la lámina 6 dice por qué

**No se cablean los 23 `enc_*` acá.** Lo que se hace es que **un número que no llega salga con
motivo en vez de en blanco**: *«la cuenta 3354-JULJDGAG no tiene filas en Directa Mail para esta
ventana»*, no `«FALTA:enc_mails_enviados»` a secas.

`R-19` ya fijó el principio —una fuente que dejó de traer no es un dato, es una falla— y `REVISAR`
ya existe como estado. **Esto es aplicarlos a la lámina que se va a mostrar.**

Una lámina vacía parece un motor roto. Una que dice qué le falta parece un motor que sabe lo que
hace, y **es la diferencia entre mostrar el sistema y no poder mostrarlo**.

## Parte D — la corrida que se muestra

Generar el deck y reportar, lámina por lámina, cuántos tokens pintaron. Criterio de cierre:
**cero `«FALTA»` visible en las láminas 1 a 5**, y en la 6 **una lámina por reunión con barrio,
fecha y motivo de lo que falte**.

Si algo queda en `«FALTA»`, **la lista de esos tokens con la pregunta concreta que cada uno
necesita** — de qué fuente sale ese número — es la salida del prompt. Es lo que el usuario
responde en una sentada.

---

## Anexo

- **La lámina 4 no tiene ningún token.** Puede ser una lámina de imagen o puede ser un hueco de la
  plantilla. **Reportarlo, no rellenarlo.**
- **`ecv_barrio1-3`** están postergados por decisión y **`ecv_insc_dif`** tiene una decisión
  abierta sobre si una celda vacía cuenta como cero. **Ninguno de los dos se reabre acá**: si
  aparecen en la Parte 0, se reportan y se dejan como están.
- **Los `camp_bench_*` están fuera de alcance por decisión del usuario. No resucitar.**
