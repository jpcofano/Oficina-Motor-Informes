# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-09-02 — **`secco` dejó de salir en hueco.** Los 168 marcadores
compartidos están en `informe_id = '*'` (`D-54`), los `_revisar` se pusieron y después se
levantaron los 18 que el CSV validaba (`D-56`), y **ministros arrancó: 1 de 10**.
**Suites: 85 bancos, 2 en rojo** —los dos preexistentes y reales—. **`clasp push` hecho.**

### ⭐ Lo último, en cinco líneas

- ⭐⭐ **`D-54` aplicado: 168 filas en `*`**, 52 se quedan en `jm`. Es lo que hacía falta para que la
  decisión exista en el motor y no sólo en `PLAN.md` — una fila `jm` **no la puede leer `secco`**.
- ⭐ **`D-56`: el CSV de casos es la fuente de verdad de la validación**, no `MARCADORES.notas`. Se
  pusieron 76 `_revisar` y se levantaron **18** con caso `V-` `exacto`.
- ⭐ **`D-55`**: una columna que describe un **hecho mecánico** se autocorrige; una que describe una
  **decisión editorial** se reporta y se corrige a mano.
- **Ministros: `ambito=ministros` propio y `emin_encuentros` cableada** — con `V-49` reproducido
  **dos veces**, en fixture y en corrida real, las dos dando **8**.
- ⚠ **El `.gitattributes` cerró el `P1` de los line endings**: el veredicto de las suites ya no
  depende de qué copia del repo se mire.

### ⛔ Lo que hay que correr, y es tuyo

1. ⭐ **`aplicarAsteriscoCompartidos()` otra vez.** `m2_camp_lista` quedó en `informe_id = jm` —su
   token no estaba en la plantilla de `secco` cuando se midió el inventario— y por eso sale
   `/////` en `L-014`. **Es idempotente**: sólo toca lo que falta.
2. **`diagCablearEminEncuentros()`** y, si está bien, **`cablearEminEncuentros()`**.
3. ⚠ **Lo que venía pendiente de antes y sigue en pie:** **Aplicar configuración** —que siembra
   `MAPEO.ivr_vocero` y arrastra `SOLAPAS.ventana_ref = 'propia'` del desglose,
   `campo_id_cuenta = ivr_id_cuenta` y las dos filas de fechas—, `instalar()`, `cablearGcbaIvr()`,
   `censarTokensSinMarcador()` y `diagDondeVivenLosIvr()`.

---

## Ministros — **1 de 10**, y las otras nueve tienen dueño

| | estado |
|---|---|
| ✅ **`emin_encuentros`** | cableada. `CONTEO` sobre `rdv/RVD JM-CM - ES` con `ambito=ministros`. **Nace sin `_revisar`** porque `V-49` la valida y el número se reprodujo |
| ⏳ **`emin_lista`** | ⛔ **no se puede con la configuración de hoy**: `LISTA_CRUDA` toma **un** `campo_logico`, sin plantilla, **y además deduplica** — con `figura` sola publicaría **7** donde hay **8 encuentros**. Necesita que acepte una plantilla `figura + fecha` |
| ⏳ **los 8 de métricas** | salen de `digital` **por `id_cuenta`**, que sale del anclaje, que parte del **temario** — y **hoy no hay ningún ministro en `REUNIONES`** |

⭐ **La medición que ordenó todo:** `ministros` es `modo = agregado` y **no itera `REUNIONES`**, así
que `emin_encuentros` no necesita ni temario ni anclaje. Los ocho sí.

⛔ **Y hay una trampa dormida antes de cargar ministros al temario** (`PENDIENTES`, `P1`): **`figura`
no llega al ítem de encuentro**, así que un `SECCIONES.filtro` sobre ella leería `undefined` y **no
matchearía ninguna lámina, sin fallar**. El día que se cargue un ministro, la sección `encuentro`
lo expande junto con los de `jm`. Son dos líneas, con el precedente del `_11` (`tipo`) y el `_25`
(`fecha`).

---

## Lo que quedó medido y NO se tocó, con su motivo

- ⛔ **`reuniones/Agenda funcionarios` está declarada `uso = fuente` y no se puede usar** — la figura
  se carga mal ahí. La medición contra el fixture queda anotada en `PENDIENTES` **porque es más
  barato que volver a medirla**.
- ⚠ **`rdv` tiene una solapa que `SOLAPAS` no declara**: `Funcionarios  Ministros`, 90 filas muertas
  desde agosto **2025**, sin métricas. No sirve para nada de esto, pero **una solapa sin declarar es
  invisible para todo censo**.
- ⚠ **`DIGITAL` recorta por cuenta y `resumen_metricas_dinamico` por fecha.** Sobre una campaña
  fuera de ventana, el desagregado publica y el agregado no. **Hoy es inofensivo porque el temario
  elige campañas vivas**; se anotó como condición.
- ⚠ **`camp_env4_fecha` aparece como texto literal** en `L-022` — sin llaves, así que ningún censo
  lo ve. Encaja con lo medido el 22/08: ese token **no existe** porque la fecha está en celda
  combinada.

---

## La cola

1. ⛔⛔ **`P0` · El escritor del temario no sabe QUITAR.** Una campaña que el usuario sacó **se sigue
   publicando**. Toca el ESCRITOR, no el lector. Cuelga de `D-53`.
2. **Los 7 `m2_*`**: el usuario confirma que `L-038`/`L-014` salió **exacto** contra el deck del
   29/08. ⇒ **falta escribir el caso en el CSV** —con los siete valores, que los confirma él— y
   recién ahí entran a `LEVANTAN_POR_CASO_`. ⛔ **No se levantan citando `V-110`**: ese caso es un
   testigo previo a un cambio de esquema y **nace vacío a propósito**.
3. **`emin_lista` + los 8 de métricas** — ver arriba.
4. **Los 45 tokens compartidos sin fila** — cableado, no migración.
5. **La opción 4** (que la expansión saltee las escondidas): **medido, 2 copias muertas por
   corrida**, y se pospuso **después de las corridas**.
6. **`R-02` citado con dos sentidos**: la regla del temario es `R-04`. Censo: 17 citas equivocadas.
7. ⚠ **`node tools/escritores.js` está roto** — `inventario.js` tira *«llaves desbalanceadas»*.
