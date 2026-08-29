# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-29 — **tres commits: el ámbito de IVR (`gcba_ivr_*` de `L-032`),
el `periodo_id` que no llegaba a `resolverVentana`, y dos afirmaciones vencidas sobre `informe_id`.**
**Suites: 78 bancos, ~1243 afirmaciones.** ⭐ **`clasp push` HECHO y verificado** con un `clasp pull`
a un temporal — el proyecto vivo tiene todo, incluidos los ocho commits que venían pendientes desde
el `2026-08-27_2`.

### ⭐ Lo último, en cuatro líneas

- ⭐⭐ **El `periodo_id` no llegaba a `resolverVentana`, y por eso `jm-20260828-193948` sacó ~130
  tokens `camp_*` en `---`.** `resolverMarcadores` armaba un literal de **tres** claves que lo
  descartaba justo antes de usarlo. **Migración a medias:** el literal es del 03/08, y el commit del
  18/08 que hizo `CAMPANAS` una lista tocó el productor y la hoja final **y no el intermediario**.
- ⚠ **Con UNA fila por campaña el defecto no tenía síntoma** —`per === ''` y el filtro correcto dan
  lo mismo—. **La segunda fila no lo causó: lo destapó.**
- ⭐⭐ **`digital/Directa IVR` ya sabe decir `ambito`**, con la columna **G `Vocero`** medida sobre el
  fixture del 28/08: **`JM` 55 / `GCBA` 8** sobre 63 filas. Calcar `nombre_campaña~=JM` habría
  perdido dos filas **sin fallar**.
- ⚠ **`L-031` no cambió**: los `ivr_*` de JM **siguen sin caja** en la plantilla. Lo que el usuario
  agregó está en **`L-032`**, el resumen de GCBA.

### ⛔ Lo que hay que correr, y es tuyo — EN ESTE ORDEN

1. ⭐ **Aplicar configuración** — siembra `MAPEO.ivr_vocero` (col G). **Sin esa fila el filtro que
   genera la dimensión falla con `@filtro_campo_no_mapeado`.** Arrastra además lo que ya venía
   pendiente: `SOLAPAS.ventana_ref = 'propia'` en el desglose, `campo_id_cuenta = ivr_id_cuenta` en
   `digital/Directa IVR`, y las dos filas de `MAPEO` de fechas. **`instalar()` no siembra**; ésta sí.
2. **`instalar()`** — `CORRIDAS` gana `ejecucion` como segunda columna; `REUNIONES` gana `id_cuenta`
   antes de `notas`, vacía.
3. **`cablearGcbaIvr()`** — las tres filas de `L-032`. Relee lo que quedó en la hoja y **para en rojo
   si no quedó como se pidió**.
4. **`censarTokensSinMarcador()`** — los tres **no** tienen que aparecer más en `L-032`.
5. **`diagDondeVivenLosIvr()`** — decide si existe el paso siguiente (ver abajo).
6. **Una corrida de `jm`.**

⚠ **Y si ya corriste `moverImpresionesAlDesglose()`, corré `volverImpresionesALooker()`**: los ocho
`imp_*` están **revertidos a `looker/DIGITAL`** en el seed, y dejarlos mudados publicaría el 11× de
Meta que está medido.

### ⭐⭐ Qué mirar en esa corrida

| qué | antes | esperado |
|---|---|---|
| los ~130 `camp_*` | `---` con *«2 filas en CAMPANAS — ambigua»* | **valor**, cada bloque con **su** ventana |
| el bloque IVR de `L-032` | no existía | valor **o vacío** — ver abajo |
| `L-034`: Mails entregados · Aperturas | 872.669 · 249.439 | **sin dato** — ese encuentro no tuvo mail |
| `L-034`: ENCUENTROS · INSCRIPTOS · barrios | 1 · 83 · Coghlan | **idénticos** — es el control positivo |

⭐ **La identidad que cierra `L-034` sin depender de ninguna foto:** `mail_entregados` de `L-031`
tiene que seguir en **872.669** y el de `L-034` **no**. Si los dos siguen iguales, el desdoble no
ocurrió.

⚠ **El bloque IVR del resumen es CONDICIONAL** (`C-31`, `C-38`): el equipo lo publica cuando hay
datos en la ventana. El fixture del 28/08 tiene **8 filas GCBA, 6 con datos y 2 vacías**. **Vacío no
es lo mismo que roto.**

⚠ **Y una campaña que aparezca DOS VECES en el deck no es un bug**: es la opción A que elegiste el
28/08 —*«las reuniones y las campañas tienen que salir siempre»*—. **La unicidad es responsabilidad
de la carga del temario, no del motor.**

### ⛔ Lo que NO se verificó

**Ningún commit corrió en Apps Script.** Las 78 suites miden de qué filas sale un número, con qué
criterio y dónde se pinta; **no miden un deck**. La verificación del arreglo del `periodo_id` **es
una corrida**, no una suite.

### ⚠ Cuatro cosas declaradas, no resueltas

- ⚠ **El bloque de JM de IVR CONTIENE al de GCBA.** Los cuatro `ivr_*` de `L-031` tienen
  `dimensiones` **vacío**, y ausente significa «todas»: agregan las 63 filas. Ponerles `ambito=jm`
  **mueve un número publicado** → otro paso, otro deck. **`diagDondeVivenLosIvr()` dice si hoy
  publican algo**, y de eso depende que ese paso exista.
- ⚠ **`L-032` sumó CUATRO tokens y sólo tres son `gcba_ivr_*`.** Hay un cuarto token nuevo que **ya
  tiene fila** y no está identificado.
- ⚠ **Una tercera afirmación vencida, encontrada y NO tocada:** el comentario de `Generador.gs:2318`
  repite lo que `R-17` y `PENDIENTES` acaban de corregir. B2 declara *«no toca código»*.
- ⛔ **`looker/DIGITAL` tiene el 93 % de las filas de Meta en cero**, y por eso el desglose da **11×**
  en esa plataforma. **Sin diagnosticar**, y es lo que frena mudar los ocho `imp_*`.

### ⚠ Un archivo sin trackear que no es mío

`docs/Prompts/2026-08-28_3_campana_no_emite_en_periodo_personalizado.md` está **sin commitear**. El
`_5` lo cita como *«continúa `2026-08-28_3`, ya ejecutado»*, así que **claude.ai no puede ver la
mitad de esa cadena**. No lo bundleé con mis commits porque es de otro paso — decime si lo subo.

---

## La cola, después de la corrida

1. **Los `ivr_*` de JM**: decidir si llevan `ambito=jm`. Depende de `diagDondeVivenLosIvr()`.
2. **Los tres `cc_*` de `L-034`** — bloqueados por `X-28`, que espera una frase del equipo (`C-80`).
3. **`ecv_asistentes` = 485 sigue sin validar.**
4. **El 93 % de Meta en cero en `looker/DIGITAL`** — destraba la mudanza de los ocho `imp_*`.
5. **La selección semanal de campañas** — con el `informe_id` afuera desde el 18/08, lo único que
   decide es que `periodo_id` **no esté vacío**, no que coincida con la corrida. `itemsDeSeccion_`
   ni siquiera recibe el período. Declarado en `R-17` Addendum 2.
6. **`R-02` citado con dos sentidos**: la regla del temario es `R-04`. Censo del 27/08: **17 citas
   equivocadas** contra 7 correctas.
7. **`D-33` quedó a medias** — ver su estado al 26/08 en `PLAN.md`.
