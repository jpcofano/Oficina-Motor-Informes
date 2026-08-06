# `PLAN.md §2` — cerrar la escalera entera, en pasos chicos

**Un objetivo.** Documentación. No se toca código.

**Por qué.** `PLAN.md` abre con su propia regla: *"una entrada es una línea o un
párrafo corto; si necesita más, el detalle va a `BITACORA.md` y acá queda el
puntero. Un plan que hay que leer entero para saber qué sigue deja de usarse."*
La §2 tiene ~147 líneas con tachados y párrafos de historia. Dejó de usarse: el
trabajo de los últimos dos días no entró en ella y se perdió de vista.

**No se crea un archivo nuevo.** El ruteo ya dice que el plan vive acá; un
`ESTADO.md` sería el segundo índice que la §3 vino a evitar.

**Lo que este prompt NO hace.** No cierra ni reabre ningún pendiente, no decide
prioridades de negocio, no toca la §1. Sólo ordena lo que ya está escrito en
`PLAN.md` y en `PENDIENTES_consistencia.md` en una escalera con IDs.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **Qué de la §2 es historia.** Todo lo tachado y todo lo "hecho" ya está en
`BITACORA.md`. Reportar cuánto de las ~147 líneas cae de cada lado, y **confirmar
que cada ítem hecho tiene su entrada allá** — si alguno no la tiene, no se puede
resumir sin perderlo.

`0.2` · **Tres líneas que parecen vencidas.** Verificar y reportar, sin corregir:
  - La §2 dice que `INFORMES.plantilla_id` está vacío en `jm` y que eso tapa los
    Pasos 3, 4 y 5. Se están generando decks.
  - `Paso-4.md` se declara *vivo, nunca ejecutado*, pero el motor de reemplazo
    funciona.
  - `PENDIENTES` tiene `P1 · API de pruebas: llamar no tiene lista blanca de sólo
    lectura`. `4934f9c` resolvió el reintento por otro camino: ¿lo cierra, lo
    cambia, o no lo toca?

`0.3` · **La escalera de abajo es mi lectura de los títulos de `PENDIENTES`, no de
sus cuerpos.** Para cada ítem que la escalera toma de ahí, abrir el pendiente y
confirmar que el sub-paso lo describe. **Reportar los que no encajan** — es más
barato moverlos ahora que escribir un prompt contra un ítem mal ubicado.

`0.4` · **Los IDs.** ¿`Paso-5.1`, `5.1.1`, `Paso-6`, `Paso-7` chocan con alguna
numeración existente? Greppear antes de asignar, como pide la §1.

**Reportar `0.1`–`0.4` y parar.**

---

## Parte A — la §2 reescrita

Cada ítem, **una línea**. Lo hecho se resume con puntero a `BITACORA.md`; el
detalle no se copia. **Cada sub-paso es un prompt y un commit.**

### Tramo 2 — corte vertical, JM solo · *acá estamos*

**`5.1` · la corrida siempre cierra.** Hoy una corrida sin tiempo muere sin decir
qué hizo. El objetivo no es que termine: es que deje siempre un deck usable y la
lista de lo que faltó. **Es el MVP.**
  - `5.1.1` — el motor mira el reloj y corta antes del límite
  - `5.1.2` — el cierre se escribe siempre: fecha, tokens puestos, faltantes
  - `5.1.3` — la fila guarda hasta qué ítem llegó

**`5.2` · bajar el costo por ítem.** Mejora, no requisito.
  - `5.2.1` — medir el presupuesto de una corrida
  - `5.2.2` — sacar lo repetido por ítem
  - `5.2.3` — comprobar que ningún valor cambió

**`5.3` · reanudar.** Depende de `5.1.3`. **Decidido (usuario, 06/08):** la
llamada vuelve enseguida con el `corrida_id` y el cliente consulta la fila hasta
que cierre. Que la llamada espere el ciclo completo **no es una opción**: el
`doPost` que la atiende es él mismo una ejecución de Apps Script y se muere antes
que la continuación que estaría esperando. Los usuarios del motor ven el deck y el
reporte, no la respuesta HTTP.
  - `5.3.1` — continuar desde el índice guardado, invocado a mano
  - `5.3.2` — la continuación se dispara sola. **Verificar antes la cuota de
    disparadores** — 90 min/día en cuentas gratuitas, 6 h en Workspace, y un deck
    de tres ejecuciones son 18 min por corrida
  - `5.3.3` — `LockService`, para que dos continuaciones no se pisen
  - `5.3.4` — el cliente consulta la fila hasta el cierre, en vez de retener la
    llamada

**`5.4` · los cuatro objetivos contra un deck real.** `SUMA` sobre cero filas,
`ULTIMO` por fecha, el agregado global de digital, el sembrado del Resumen
Ejecutivo. Escritos y nunca vistos contra una corrida. Sale apenas exista `5.1`.

**`5.5` · las operaciones que faltan.** `PENDIENTES`: una que devuelva **lista** y
no número (`P1`), `DISTINCT` para `ecv_barrios` (`P2`), y un formato de
porcentaje sin signo (`P2`). Cada token sin operación es un `«FALTA:»` garantizado.

**`5.6` · los tres grupos que recortan a cero filas.** IVR (0 de 57 sobre Inicio),
`sd_pauta_*` y Digital. **Ya no es pregunta al equipo (usuario, 06/08):** los
agregados van por la ventana del informe, viernes a jueves. Lo que hay que medir
es **por qué esa ventana da cero**.

**`5.7` · el instrumento.** `marcarEtapa_` traga sus excepciones, así que una fila
puede decir que una corrida no arrancó cuando llegó a la etapa 4. Hoy es lo único
que nos dice qué pasa.

**`5.8` · el score de anclaje.** `PENDIENTES P1`: saturó en 1,00 y el circuito de
`ANCLAJE_PENDIENTE` nunca se probó de punta a punta.

### `Paso 6` — el matcher (`Union.gs`)

Ya nombrado en la §2 como paso propio sin escribir. Las cuatro cosas tocan la
misma función:
  - `6.1` — `R-12`: ampliar la búsqueda de candidatos antes de declarar `sin_link`
  - `6.2` — los dos valores de ventana a `CONFIG`: la corta (hoy constante de
    módulo) y la ampliada (no existe)
  - `6.3` — el empate técnico que `DISENO_match_temario.md` §6.4 declara y ningún
    código implementa
  - `6.4` — retirar `VALOR_STATUS_REALIZADA_`, que hoy filtra dos veces por lo
    mismo, y que `verificarPrecondicionAnclaje_` no pasa por `leerFuente`

### Tramo 3 — prueba de motor (SECCO)

  - `7.1` — correr SECCO midiendo líneas de `.gs` tocadas. **Es el paso que valida
    la tesis del proyecto** (`D-01`); si falla, lo que salga es el trabajo del
    tramo siguiente.
  - `7.2` — la revisión de exposición del repo público, programada para este hito:
    14 IDs internos, datos personales en el historial, `.clasp.json` trackeado,
    `PLANTILLA_JM_CANONICA_` hardcodeada. Los cuatro son `P0` en `PENDIENTES`.

### Tramo 4 — panel (`D-04`)

  - `8.1` — **primero:** qué devuelve `getActiveUser()` con el despliegue "ejecuta
    el usuario que accede". Si vuelve vacío, `D-15` se revisa antes de escribir
    código de panel.
  - `8.2` — `doGet`, selección de informes, corrida a demanda
  - `8.3` — `D-16`: acceso por usuario. La pieza 3 sigue sin resolver (§3)

### Tramo 5 — chequeo previo programado (`D-11`)

  - `9.1` — todo lo que queda de lo que antes eran los Pasos 10-12

### Higiene — sin orden, cada uno un prompt cuando toque

Los `P0` y `P1` de `PENDIENTES` que no son de ningún tramo. **No se listan de nuevo
acá**: la §2 pone el puntero al archivo y su prioridad, que es su dueño. Los dos
que hoy son acción del usuario y no de Code:
  - `rdv` compartida como `anyoneWithLink = writer`, que pisa el `reader` explícito
  - el registro automático de plantillas no ve la de JM y sí ve los backups

### A revisar a futuro, no bloqueante

**Los 33 tokens que el motor no ve.** `PENDIENTES P1`: ningún `.gs` recorre
`getTables()` ni `getGroups()`. **Decisión del usuario (06/08): no bloquea el
tramo.** Son tokens sin información, y se revisan más adelante. Queda como línea
en la §2 con puntero al pendiente, para que no se pierda de vista.

### Dato del terreno, no problema

**El límite de ejecución de Apps Script son 6 minutos**, iguales para cuentas
gratuitas y Workspace, y no se puede extender. Una línea, para que nadie vuelva a
proponer agrandarlo.

---

## Parte B — lo que se saca de la §2

Lo hecho, resumido a una línea con puntero a `BITACORA.md`.

Lo trabado por terceros va a la §3, que es su lugar: `camp_` sin filas `jm` en
`CAMPANAS`, los 16 tokens sin fuente (ocho de Call Center, seis de impresiones,
`contenidos_total`), la fila `resumen_ejecutivo` declarada repetible, los siete
shortcuts de Drive que el token no puede borrar.

Entrada en `BITACORA.md` con el origen y con **lo que la §2 decía antes**, para que
el resumen sea reversible.

---

## Cuándo está hecho

- La §2 se lee entera en una pantalla y dice qué sigue.
- Cada sub-paso tiene ID, y el ID sirve para nombrar su prompt y su commit.
- Nada de lo hecho se perdió: cada línea resumida tiene su puntero.
- Lo trabado por terceros está en la §3 con quién lo destraba.

## El reporte

1. Las mediciones `0.1`-`0.4`.
2. Los ítems de la escalera que no encajaban con su pendiente, y dónde los pusiste.
3. Qué sacaste y a dónde fue.
4. Qué decisiones tomaste solo.
5. Qué premisa de este prompt resultó falsa, si alguna.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
