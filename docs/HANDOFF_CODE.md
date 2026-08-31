# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-31 — **`2026-08-31_3` cerrado en tres commits: la sección de
campaña destacada ya no sale dos veces, y salió `D-53`.** ✅ **El usuario confirmó el deck de `jm`
con 23 láminas** (eran 32, con nueve duplicadas). **`clasp push` hecho.**

### ⭐ Lo último, en cuatro líneas

- ⭐⭐ **La rama `CAMPANAS` de `itemsDeSeccion_` selecciona por VERSIÓN del informe.** Exigía que
  `periodo_id` no estuviera vacío y nada más, así que las **dos filas** de `3512-AGOSEGGJ` —una por
  versión— daban dos ítems y **dieciocho láminas donde van nueve**.
- ⭐⭐ **`D-53`: `periodo_id` identifica una versión del informe, no una semana.** Decisión del
  usuario. Dos filas con la misma ventana **son dos versiones**, no un duplicado. `D-19` se
  **confirmó** en el mismo acto.
- ⭐ **Un solo lugar decide el período:** `periodosDeLaCorrida_` (`Union.gs`), y **`leerReuniones_`
  pasó a usarlo**. El `periodo_id` **no viaja en la firma**: ya llega en `ventanaInforme.origen`.
- ⛔ **Y salió un `P0` nuevo que es peor que el que se arregló:** `cargarTemarioCampanas_` **sabe
  agregar y no sabe quitar**, así que una campaña que el usuario **sacó** del temario se sigue
  publicando.

⚠ **Y una afirmación que este paso DESMINTIÓ, dicha acá porque la versión anterior de este handoff
la publicaba como decisión:** *«una campaña que aparezca dos veces en el deck no es un bug — la
unicidad es responsabilidad de la carga del temario, no del motor»*. **Con `D-53` es falsa**: era un
bug del motor y está arreglado. Se verificó que **no vive en ningún documento con dueño** —sólo
estaba acá—, así que muere con esta reescritura.

### ⛔ Lo que hay que correr, y es tuyo

1. ⭐ **Una corrida de `secco`** con `2026_agosto_21_28`. **Es lo único del `_31_3` que quedó sin
   verificar.** El testigo de estructura dice que produciría **10** láminas repetibles contra 18,
   pero eso es la predicción de la expansión, **no un deck**. `secco` declara 8 láminas de campaña
   destacada (`L-016`–`L-023`) y es el que la justificación vencida decía proteger.
2. **Mirar los valores del deck de `jm` que ya sacaste.** No se tocó ningún marcador, así que
   **deberían ser los mismos que antes**; nadie los comparó. Si un número cambió, es un hallazgo.

⚠ **Lo que venía pendiente de antes y sigue en pie:** el punto 1 del handoff anterior —**Aplicar
configuración**, que siembra `MAPEO.ivr_vocero` y arrastra `SOLAPAS.ventana_ref = 'propia'`,
`campo_id_cuenta = ivr_id_cuenta` y las dos filas de fechas—, `instalar()`, `cablearGcbaIvr()`,
`censarTokensSinMarcador()` y `diagDondeVivenLosIvr()`. **Nada de eso lo tocó el `_31_3`.**

### ⚠ Las suites: 79 bancos, **4 en rojo, y ninguno es de este cambio**

| banco | causa |
|---|---|
| `probar-ambito-ivr.js` · `probar-desglose-como-fuente.js` | **defectos preexistentes** — ya estaban rojos en `HEAD` |
| `probar-hojas-config.js` · `probar-periodo-id-campana.js` | ⛔ **hardcodean `\r\n`** y el working tree está en **LF** |

⭐ **Verificado, no supuesto:** se extrajo `HEAD` a un temporal, se convirtió a LF y se corrieron las
suites — **los mismos cuatro rojos**. Los `.gs` de la copia de trabajo están en **LF** e
`Instalar.gs` también, sin que nadie lo haya editado. **Un checkout limpio y la copia de trabajo dan
veredictos distintos sobre el mismo código** → `P1` nuevo en `PENDIENTES`.

### Los tres commits

| commit | qué |
|---|---|
| `b4a8dce` | `D-53` en `PLAN.md`, el `P0` del escritor en `PENDIENTES`, y los snapshots del 31/08 de las 11 hojas |
| `2271b34` | **Parte A** — `testigoDeEstructura()` y la toma ANTES |
| `a04f3d5` | **Parte B** — el filtro, el helper único, los dos bancos y la toma DESPUÉS |

### ⭐ El instrumento nuevo, porque sirve para más que esto

**`testigoDeEstructura()`** (`Auditoria.gs`, sin parámetros, desde el editor). Mide **ítems por
sección repetible con su clave**, para `jm` y `secco`: nombra las claves repetidas, distingue *«no
filtró»* de *«no lo dice»*, imprime las versiones de `PERIODOS` con la misma ventana y lleva control
positivo al final.

⭐⭐ **Existe porque todos los demás testigos miden números, y este defecto no se veía en ninguno**
— las dieciocho láminas duplicadas publicaban cifras correctas.

---

## La cola

1. ⛔⛔ **`P0` · El escritor del temario no sabe QUITAR.** `cargarTemarioCampanas_` dedupea por
   `campana_id || periodo_id` y saltea lo que ya existe, así que **una campaña que el usuario sacó
   se sigue publicando** — y lo mismo aplica a `REUNIONES`. **Prompt propio: toca el ESCRITOR, no
   el lector.** Cuelga de `D-53`. ⚠ Lleva una decisión adentro que es del usuario: **quitar es
   borrar la fila o ponerle `mostrar = no`**.
2. **Los `ivr_*` de JM**: decidir si llevan `ambito=jm`. Depende de `diagDondeVivenLosIvr()`.
3. **Los tres `cc_*` de `L-034`** — bloqueados por `X-28`, que espera una frase del equipo (`C-80`).
4. **`ecv_asistentes` = 485 sigue sin validar.**
5. **El 93 % de Meta en cero en `looker/DIGITAL`** — destraba la mudanza de los ocho `imp_*`.
6. **`P1` · Los `\r\n` de los tres bancos**, y la pregunta de fondo que es tuya: **si el repo
   normaliza los `.gs` a un solo line ending** o convivimos con los dos.
7. **`P2` · `leerReuniones_` cita `D-19` para un caso que `D-19` no cubre** — le corresponde `D-53`.
   Es un cambio de **mensaje**, no de comportamiento. ⛔ No se hizo en el `_31_3` porque **movería
   los 11 excluidos de `encuentro`, que son la evidencia de que el cambio no rompió esa rama**.
   Conviene que vaya con el prompt del punto 1, que ya abre ese archivo.
8. **`R-02` citado con dos sentidos**: la regla del temario es `R-04`. Censo del 27/08: **17 citas
   equivocadas** contra 7 correctas.
9. **`D-33` quedó a medias** — ver su estado al 26/08 en `PLAN.md`.
10. ⚠ **`node tools/escritores.js` está roto** — `inventario.js` tira *«Llaves desbalanceadas tras
    limpiar Auditoria.gs»*, así que la matriz no se puede regenerar. Prompt propio.
