# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-27 (3) — **`L-034` cierra al temario: `D-47` a `D-50` en cuatro
commits, más un P0 ajeno que apareció en el medio.** **Suites: 70 bancos, ~1090 afirmaciones.**

### ⭐ Lo último, en cinco líneas

- ⛔⛔ **`Instalar.gs:82` abría un `/*` que nunca cerraba, desde el 22/08.** Se comía **diez de las
  dieciséis claves de `HOJAS_CONFIG_`**, así que `instalar()` no creaba ni reparaba esas hojas y sus
  `COLUMNAS_DELTA_` no corrían. **Un chequeo de sintaxis no lo habría visto: el archivo parseaba.**
- ⛔ **Y destapó un off-by-one latente:** `COLUMNAS_DELTA_.CORRIDAS` ponía `ejecucion` **antes** de
  `corrida_id`. Confirmado contra la hoja viva: `CORRIDAS` tiene 8 columnas y no tiene `ejecucion`.
- ⭐⭐ **`D-47`: el universo de un marcador sin ítem es de la LÁMINA.** Un token compartido entre
  láminas de universos distintos se resuelve una vez por lámina y se pinta en la suya. **No hizo
  falta una columna nueva** — `LAMINAS.seccion_id` ya lo declaraba.
- ⭐ **`D-48`: tres salidas, no dos** — falla si el temario no resolvió nada, **sin dato** si
  resolvió y ninguno tiene fila, el número si las hay. Lo impuso un dato tuyo: ese encuentro no
  tuvo mail.
- ⭐ **`D-49`: `REUNIONES.id_cuenta`** — la cuenta del encuentro se declara en la fila, como en
  `CAMPANAS`. Hasta hoy, un anclaje que acertaba **no dejaba rastro en ninguna hoja**.

### ⛔ Lo que hay que correr, y es tuyo — EN ESTE ORDEN

1. **`clasp push`** — arrastra el `2026-08-27_2` que ya estaba pendiente **más los cuatro commits de
   hoy**. Nada de esto está en Apps Script.
2. ⭐ **Aplicar configuración** — es la que siembra `SOLAPAS.campo_id_cuenta = ivr_id_cuenta` para
   `digital/Directa IVR`. **`instalar()` no siembra**; ésta sí. La fila es `origen = seed`, así que
   no está protegida.
3. **`instalar()`** — `CORRIDAS` gana `ejecucion` **como segunda columna**; `REUNIONES` gana
   `id_cuenta` antes de `notas`, vacía. Las otras ocho hojas revividas, sin cambios.
4. **Una corrida de `jm`.**

### ⭐⭐ Qué mirar en esa corrida — es la primera que MUEVE números publicados

| caja de `L-034` | antes | esperado |
|---|---|---|
| Mails entregados · Aperturas (OR) | 872.669 · 249.439 | **sin dato** — ese encuentro no tuvo mail |
| Impresiones | `-48.571-` | el del temario, o sin dato |
| ENCUENTROS · INSCRIPTOS · barrios | 1 · 83 · Coghlan | **idénticos** — es el control positivo |

⭐ **La identidad que lo cierra sin depender de ninguna foto:** `mail_entregados` de `L-031` tiene
que seguir en **872.669** y el de `L-034` **no**. Si los dos siguen iguales, el desdoble no ocurrió;
si `L-031` también cambió, se rompió algo que estaba bien.

⚠ **Dos líneas del log valen más que el deck:**

```
etapa 4: láminas gobernadas por el temario — L-034, L-036
etapa 4 · L-034: el temario gobierna digital|Directa Mail, looker|DIGITAL, digital|Directa IVR
```

Y si aparece `⚠ … NO declaran campo_id_cuenta`, esa línea nombra las solapas que **siguen**
publicando el universo de la ventana. No frena nada; es el `X-41` que no queda callado.

⚠ **Y `REUNIONES.id_cuenta` debería quedar poblada** para el encuentro anclado. Ése es el id que el
27/08 no estaba en ningún lado.

### ⚠ Tres cosas declaradas, no resueltas

- ⚠ **Un encuentro de ancla floja ahora EMITE su lámina** (`D-50`), con los `enc_*` en `«FALTA»`. Es
  lo que ya hacía un `sinLink`, pero es visible y conviene no leerlo como regresión.
- ⚠ **Una cuenta mal anclada que se escribe queda congelada** (`D-49`). Está en una celda que se ve
  y se corrige, que es lo que antes no pasaba — pero hay que saberlo.
- ⚠ **Los tres `cc_*` de `L-034` siguen sin fila** y salen `/////`. Los frena `X-28`, que espera una
  frase del equipo (`C-80`).

### ⛔ Lo que NO se verificó

**Ninguno de los cuatro commits corrió en Apps Script.** Las 70 suites miden de qué filas sale un
número y dónde se pinta; **no miden un deck**. `D-47` es el primer cambio del proyecto que mueve
números publicados y su verificación es una corrida, no una suite.

⚠ **Y `872.669` nunca se pudo reproducir desde disco:** el fixture más nuevo de `digital` es del
20/08 y la ventana arranca el 21. `tools/medir-mail-entregados-jm.py` sí reproduce el caso validado
`X-31` —**538.291** sobre seis filas, `sha256` verificado— y con eso confirma la **definición**, que
es otra pregunta.

---

## La cola, después de la corrida

1. **Los tres `cc_*`** — bloqueados por `X-28`.
2. **`ecv_asistentes` = 485 sigue sin validar**, y `ecv_fecha` / `ecv_barrio1-3` ya tienen fila desde
   el 22/08.
3. **`R-02` citado con dos sentidos**: la regla del temario es `R-04`. Censo del 27/08: **17 citas
   equivocadas en `.gs`/`.html` contra 7 correctas**; se corrigieron sólo las escritas ese día.
   Abierto en `PENDIENTES`.
4. **`D-33` quedó a medias** — ver su estado al 26/08 en `PLAN.md`.
