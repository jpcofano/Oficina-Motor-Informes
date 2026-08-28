# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-28 (2) — **`D-51` (`||` en los filtros) y `D-52`
(`ventana_ref = 'propia'`): el prerequisito para mudar los ocho `imp_*`, medido — ⛔ **no mueven
ningún número de este deck**.** **Suites: 76 bancos, ~1191 afirmaciones.**

### ⭐ Lo último, en cuatro líneas

- ⭐⭐ **`D-51`: el lenguaje de filtros gana `||`.** El ámbito del desglose **está partido en dos
  columnas disjuntas** —`des_campana_2` (V) 372 filas `JM`, `des_campana_3` (U, rotulada
  `Prioridad`) 248, unión **620**, que es lo que looker ve con su columna única—. ⛔ **Con una sola,
  un tercio de las filas caía en `gcba`**, Coghlan entre ellas. **No fallaba: publicaba.**
- ⭐⭐ **`D-52`: `SOLAPAS.ventana_ref = 'propia'`.** `BASES.digital.modo_periodo = 'snapshot'` corta
  en `leerFuente` **antes de toda la lógica de fechas**, así que el desglose no llegaba nunca al
  solape de `R-16`. **El mecanismo ya existía desde el 07/08** — faltaba que la solapa llegara.
- ⭐ **El alcance es una celda y una solapa**, a propósito: cambiar el `modo_periodo` de la base
  tocaba `Directa Mail` y sus `mail_*` validados, e inferirlo del mapeo de fechas le cambiaba el
  universo a **cuatro solapas vivas** que ya declaran `fecha_fin_periodo`.
- ⚠ **El orden manda y está afirmado:** `propia` se aplica **antes** que
  `sin_recorte_por_ventana`, así que **el parámetro sigue ganando** y la lectura por cuenta —los
  `u1_*`, el temario— **no cambia**.

### ⛔ Lo que hay que correr, y es tuyo — EN ESTE ORDEN

1. **`clasp push`** — arrastra **todo lo pendiente desde el `2026-08-27_2`**, incluidos los seis
   commits del 27 y los dos de hoy. Nada de esto está en Apps Script.
2. ⭐ **Aplicar configuración** — es la que siembra `SOLAPAS.campo_id_cuenta = ivr_id_cuenta` para
   `digital/Directa IVR` **y ahora también `ventana_ref = 'propia'`** en el desglose, más las dos
   filas nuevas de `MAPEO` (`fecha_periodo` → **I**, `fecha_fin_periodo` → **J**).
   **`instalar()` no siembra**; ésta sí.
3. **`instalar()`** — `CORRIDAS` gana `ejecucion` **como segunda columna**; `REUNIONES` gana
   `id_cuenta` antes de `notas`, vacía.
4. **Una corrida de `jm`.**

⚠ **Y si ya corriste `moverImpresionesAlDesglose()`, corré `volverImpresionesALooker()`**: los ocho
`imp_*` están **revertidos a `looker/DIGITAL`** en el seed, y dejarlos mudados publicaría el 11× de
Meta que está medido.

### ⛔⛔ Qué mirar en esa corrida — y qué NO va a cambiar

⛔⛔ **Corrección del 28/08, medida contra el registro: `D-51` y `D-52` NO mueven ningún número
de este deck.** La versión anterior de este handoff decía que la corrida iba a mostrar los números
del dashboard en el Resumen Ejecutivo. **Es falso.**

- ⛔ **Ningún marcador de `L-031` lee el desglose.** Los ocho `imp_*` están en `looker/DIGITAL`
  —la mudanza se revirtió por el 11× de Meta— y esa solapa **no declara `propia`**.
- ⛔ **Los 26 que SÍ leen el desglose son los `u1_*` del 1 a 1 y los `post_periodo*`**, y sus
  dimensiones son `etapa` y `plataforma` — **ninguna usa `ambito`**, así que el `||` de `D-51`
  tampoco los toca.
- ⭐ **Y los que leen esa solapa la leen POR CUENTA**, con `sin_recorte_por_ventana`, que es
  exactamente lo que el banco afirma que sigue ganando. **Los seis casos exactos `V-114`…`V-119`
  quedan intactos, y eso es lo correcto**, no un efecto que faltó.

⭐⭐ **Entonces qué son las dos decisiones de hoy: el prerequisito que faltaba para mudar los ocho
`imp_*` al desglose.** Esa mudanza tenía **dos** bloqueos —el universo sin recortar y el 11× de
Meta— y hoy se cerró el primero. **El segundo sigue abierto y sin diagnosticar.**

⚠ **El testigo del dashboard sigue siendo válido, pero para OTRO momento:** cuando los `imp_*`
se muden, se cruza contra `Meta 1.921.695 · Google 1.023.101 · DV360 5.330.034`. Hoy no hay nada
que cruzar.

### ⭐⭐ Lo que la corrida SÍ verifica — `L-034`, pendiente del 27/08

| caja | antes | esperado |
|---|---|---|
| Mails entregados · Aperturas | 872.669 · 249.439 | **sin dato** — ese encuentro no tuvo mail |
| ENCUENTROS · INSCRIPTOS · barrios | 1 · 83 · Coghlan | **idénticos** — es el control positivo |

⭐ **La identidad que lo cierra sin depender de ninguna foto:** `mail_entregados` de `L-031` tiene
que seguir en **872.669** y el de `L-034` **no**. Si los dos siguen iguales, el desdoble no ocurrió.

⚠ **Y dos líneas del log valen más que el deck:**

```
etapa 4: láminas gobernadas por el temario — L-033, L-034, L-036
etapa 4 · L-034: el temario gobierna digital|Directa Mail, looker|DIGITAL, digital|Directa IVR
```

Si aparece `⚠ … NO declaran campo_id_cuenta`, esa línea nombra las solapas que **siguen**
publicando el universo de la ventana. No frena nada; es el `X-41` que no queda callado.

### ⚠ Cuatro cosas declaradas, no resueltas

- ⚠ **Un encuentro de ancla floja ahora EMITE su lámina** (`D-50`), con los `enc_*` en `«FALTA»`.
- ⚠ **Una cuenta mal anclada que se escribe queda congelada** (`D-49`) — en una celda que se ve y se
  corrige, que es lo que antes no pasaba.
- ⛔ **`looker/DIGITAL` tiene el 93 % de las filas de Meta en cero**, y por eso el desglose da **11×**
  en esa plataforma y **1 de 337** de diferencia en DV360. **Sin diagnosticar**, y es lo que frena
  mudar los ocho `imp_*`. Abierto en `PENDIENTES`.
- ⛔ **`C-78` se contradice con el `snapshot` de `digital`**: afirma que `Directa Mail` recorta por
  ventana. Sin resolver.

### ⛔ Lo que NO se verificó

**Ningún commit corrió en Apps Script.** Las 76 suites miden de qué filas sale un número, con qué
criterio y dónde se pinta; **no miden un deck**. `D-51` y `D-52` **mueven números publicados** y su
verificación es una corrida.

⚠ **Y `872.669` nunca se pudo reproducir desde disco:** el fixture más nuevo de `digital` es del
20/08 y la ventana arranca el 21. `tools/medir-mail-entregados-jm.py` sí reproduce el caso validado
`X-31` —**538.291** sobre seis filas, `sha256` verificado— y con eso confirma la **definición**, que
es otra pregunta.

---

## La cola, después de la corrida

1. **Los tres `cc_*` de `L-034`** — bloqueados por `X-28`, que espera una frase del equipo (`C-80`).
2. **`ecv_asistentes` = 485 sigue sin validar.**
3. **El 93 % de Meta en cero en `looker/DIGITAL`** — destraba la mudanza de los ocho `imp_*`.
4. **`R-02` citado con dos sentidos**: la regla del temario es `R-04`. Censo del 27/08: **17 citas
   equivocadas en `.gs`/`.html` contra 7 correctas**; se corrigieron sólo las escritas ese día.
5. **`D-33` quedó a medias** — ver su estado al 26/08 en `PLAN.md`.
