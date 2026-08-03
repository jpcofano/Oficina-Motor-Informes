# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-03 (sesión nocturna, segunda tanda: el relevamiento de la
lámina M2 contra el informe original, la slide 10 congelada y la Parte 0 del `Paso-3-v3`) ·
último commit al escribirlo: el de esta entrada

## Dónde estamos

**El Tramo 1 está cerrado y el Tramo 2 arrancó por el `Paso-3-v3`.** El bloqueo que lo tapaba
—`INFORMES.plantilla_id` vacío— se resolvió el 03/08. El `Paso-2.5` quedó en pausa por la
armonización de JM, que no bloquea a los Pasos 3, 4 y 5.

**Los tres prompts del Tramo 2 quedaron alineados.** `Paso-3-v3`, `Paso-4` (con su Addendum 1
anexado hoy) y `Paso-5-v2`. El choque de firma entre el 4 y el 5 está cerrado: `periodo_id`
es **parámetro opcional** de `generarInforme` y manda la cadena de `D-20`.

**Las cuatro decisiones del usuario del 03/08 están ejecutadas**, cada una con su medición:

1. **Plantillas — hecho.** `jm` → `117I0qn1…` (`JM_marcada`, 22 slides, 158 tokens),
   `secco` → `1_ZKjWhL…` (`SECCO_marcada`, 29 slides, 119 tokens). Las dos son Google Slides
   nativas, dueño `reporteseinformesgcba`, verificadas contra la carpeta. La declaración de
   `Armonizar.gs` (`117I0qn1…` canónica, `1JrHvs_p…` obsoleta) **seguía siendo cierta**, y
   los dos IDs salieron del `.gs`: viven en `SEED_INFORMES_` → `INFORMES`.
2. **`D-21` — hecho, y esta vez sí se pudo medir.** `rdv/status = Realizada` declarado.
   Entran **653 de 1362** filas; en la ventana de `CONFIG`, **16 → 13**.
3. **`m2` en `MAPEO` — no se decide, con criterio fijado.** Se movió al `Paso-2.5` y el
   criterio quedó escrito en `PLAN.md` §3.
4. **Acceso de las bases — verificado.** Las cuatro con `reporteseinformesgcba` en `reader`.
   Una excepción que **no es de rol**: `rdv` está compartida como `anyoneWithLink = writer`.

Y `D-01` tiene su nota fechada: **deseable, no requisito**. No bloquea un paso ni obliga a
rediseñar.

## Trabado

1. **El `Paso-2.5` está en pausa**, esperando la armonización de JM. Eso está anotado en
   `PENDIENTES` como `⏸ esperando autorización` y **no se vuelve sobre ello**: el filtro de
   láminas congeladas ya está hecho y verificado, y lo único que falta es una corrida que
   escribe sobre la plantilla del equipo. No es trabajo pendiente de Code.
   *(`SECCO` sí está armonizada. El `Paso-2.5` no bloquea a los Pasos 3, 4 y 5.)*
2. **`CAMPANAS` sigue con las tres filas sin `periodo_id`** (`D-19`). No traba implementar el
   `Paso-5-v2`, pero su `0.2` para ahí y no se puede probar. Curarlas es tarea tuya.

**Nada de esto traba a los Pasos 3 y 4.** El `Paso-3-v3` tiene su Parte 0 corrida y **las
siete premisas se sostienen**: está listo para ejecutarse.

## En pausa, y no se vuelve sobre esto

> Cuatro cosas quedaron **esperándote** el 03/08/2026, con el detalle en
> `docs/PENDIENTES_consistencia.md` → "Preguntas al equipo". **No se re-preguntan, no se
> proponen como próximo paso y no cuentan como bloqueo de este handoff.** Vuelven a la
> conversación sólo cuando las traigas.
>
> Son: las **tres preguntas al equipo sobre la lámina M2** (si la grilla por ejes se dejó de
> usar; qué mide la línea ancha, si es que sigue vigente; si el cruce de nombres de JM se
> corrige en la plantilla o se registra como está) y la **autorización para correr la
> armonización de JM**.

## Esperando decisión tuya
- **`rdv` compartida como `anyoneWithLink = writer`** (`P0` nuevo). El permiso explícito de
  las cuentas del motor es `reader` y está bien puesto; el link lo pisa. Cualquiera con el
  ID edita la base — y el ID está en un repo público. **No lo tocó Code**: es archivo de un
  tercero (`brianbanderbek`) con catorce colaboradores, sacar el link puede romperle el
  trabajo a alguien. Lo mínimo, si tiene que seguir existiendo: bajarlo de `writer` a
  `reader`.
- **`R-01` no se cumple: 5 grupos** con más de un encuentro por (Figura, fecha) en `rdv`.
  **`anclarEncuentros()` no corre** mientras falle, así que el matcher está bloqueado. `R-01`
  manda reportar el conteo y decidir con el equipo; está en "Preguntas al equipo".
  **No lo causó `D-21`** — esa verificación no pasa por `leerFuente`.
- **`CONFIG.periodo_hasta` = `03/07`** son ocho días inclusive y `R-11` fija siete. Confirmado
  que es arrastre, no intención. **La celda no se toca: la corrige una persona.**
- **Si algún día se suma `En agenda` a la lista blanca de `rdv`:** en la base está escrito
  **`en agenda`, en minúscula**, y `R-10` compara sin plegar mayúsculas.

## Esperando permiso

**Ninguno.** No quedó ningún comando pendiente de aprobación. Un comando se frenó —una
tanda de sondeos sobre la base `rdv`— y **no se reintentó**: la medición salió por otro
camino, midiendo desde el motor una base a la vez.

## Qué sigue

**El Tramo 2, por los Pasos 3 y 4**, que no dependen de la armonización. El `Paso-2.5` queda
en pausa (ver arriba) y no hay que volver sobre él.

> **Criterio del tramo, tuyo, 03/08:** las solapas y el mapeo que falten **se ajustan después
> de la primera prueba de punta a punta**, no antes. Un token sin cablear sale como
> `«FALTA:token»` y queda listado. **No se abre trabajo de mapeo por anticipado** — tampoco
> por lo que salió del relevamiento de la lámina M2. Está en `PLAN.md` §2.

- **`Paso-3-v3`** — **Parte 0 corrida y todo en pie; se puede arrancar por la Parte A.** Al
  hacerlo, tener presente que falta una operación: las seis del prompt devuelven un escalar y
  ninguna arma una **lista** de valores concatenados, que es lo que pide la caja de nombres
  de campaña de la lámina M2 (`P1` nuevo en `PENDIENTES`, con sus candidatos).
- **`Paso-4`** — ya tiene su Addendum 1. Ojo con dos cosas que el addendum deja anotadas: el
  período se imprime **inclusive en los dos extremos** y es **el que se usó**, no el de
  `CONFIG`; y el deck generado queda con **la cuenta que ejecuta** como dueño, aunque caiga
  en la carpeta de reportes — hay que reportar quién queda como dueño del primero.
- **`Paso-5-v2`** — implementable; probable sólo con una fila de `CAMPANAS` curada.
- **Paso del matcher (`Union.gs`), sin escribir.** Junta `R-12`, los dos valores de ventana a
  `CONFIG`, el empate técnico del match, el retiro de `VALOR_STATUS_REALIZADA_` —que hoy
  filtra dos veces por lo mismo— y la asimetría de `verificarPrecondicionAnclaje_`, que lee
  con `getDataRange()` directo y por eso **no ve la lista blanca**: cuenta duplicados de
  `R-01` sobre filas que el matcher nunca va a mirar.

## Qué mirar antes de tocar algo

- **`upsertPorClave_` reescribe la fila entera, y ya se cobró una** (`PENDIENTES`, ahora
  `P0`). `INFORMES.plantilla_id` llegó vacío al 03/08 **aunque se había cargado el 30/07**:
  el seed lo declaraba `''` y cada "Aplicar configuración" lo borraba. **`SOLAPAS` está
  expuesta hoy** por la misma vía: `firma_encabezado`, `filas_datos` y `filas_crudas` no
  están en los objetos del sembrador, así que la próxima corrida que cambie algo de una fila
  las borra — **65 de 84 filas** las tienen pobladas. **No se tocó la maquinaria**: es de
  cinco hojas y el arreglo cambia la semántica de todas. Regla mientras tanto: **una columna
  nueva se agrega al `SEED_*` con su valor real, nunca con `''`.**
- **Ningún `.gs` recorre `getTables()` ni `getGroups()`** (`P1` nuevo). El inventario reporta
  **158** tokens en JM y el recorrido completo encuentra **191**; en SECCO, **119** contra
  **167**. Faltan 33 y 48. La armonización está a salvo —`replaceAllText` es de toda la
  presentación— pero **el `Paso-2.5` sembraría de menos** si copiara el recorrido viejo.
  `mapaDeTokens_` (`Armonizar.gs`, nuevo hoy, sólo lectura) ya tiene el recorrido correcto y
  sirve de base. Los invisibles están listados por slide en `PENDIENTES`, con dos cosas a
  resolver antes de sembrar: `camp1..camp4` de JM **no tienen guión bajo** —la regla de
  familia los manda a cuatro familias de un miembro— y `post_*` de SECCO **es una familia que
  `INFORMES` no declara**.
- **El registro automático de plantillas no sirve para esta carpeta** (`P0` nuevo). La
  canónica de JM **no aparece al listar** —desde `DriveApp` y desde la Drive API, por padre y
  por nombre— y se abre perfecto por ID; el recorrido **baja a `_backups`**, donde vive la
  obsoleta. Con las celdas vacías habría cargado la obsoleta. Hoy, cargadas, devuelve 7
  conflictos y sirve de diagnóstico. **La carpeta de salidas es hija de la de plantillas**,
  así que cuando el Paso 4 deje decks ahí, el registro los va a ver como candidatos.
- **Una respuesta grande no vuelve por `/dev`, y se disfraza de token vencido.** Medido:
  `ping` en 33 ms y `probarLecturaPeriodo()` fallando cuatro veces seguidas, alternando 404 y
  página de login con HTTP 200. No era el token ni el endpoint: eran las miles de filas de la
  respuesta. **Antes de sospechar, mirar el tamaño de lo que se pidió.** La salida es pedir
  menos: `contarLecturaBase_(baseId)` (`Fuentes.gs`, nuevo hoy) da los mismos conteos de una
  base y sin las filas.
- **El diff no ve los valores de `CONFIG`** (`PENDIENTES`, `P1`). Para cambiar un valor:
  vaciar la celda y sembrar, o editarla a mano y actualizar el seed en el mismo commit.
- **Tres significados distintos de una celda vacía**, a propósito: `D-19` (la fila no entra),
  `D-20` (usa el eslabón siguiente), `D-21` (no hay filtro). Están escritos uno al lado del
  otro para que nadie los unifique.
- **El repo es público y expone 14 IDs internos** (`PENDIENTES`, `P0`). Decidido: sigue
  público, se revisa al llegar a producción o a una versión de prueba. El sub-ítem de
  `PLANTILLA_JM_CANONICA_` **se cerró hoy**; lo que cierra es la duplicación, no la
  exposición.

## Números de referencia, verificados hoy por API

`cambiadas 0 · agregadas 0 · migraciones 0 · solo_en_hoja 7 · protegidas (con diferencia) 0 ·
protegidas (sin diferencia) 8 · sin cambios: sí` — idénticos a los del cierre del `2.16`.
`MAPEO` en 121 filas, `MARCADORES` en 3. Los **6 controles** de `Pruebas.gs` pasan, corridos
tres veces a lo largo de la sesión: después de las plantillas, después de `D-21` y al cerrar.

## Estado de los prompts sin ejecutar

| prompt | estado al 03/08 (noche) |
|---|---|
| `Paso-2.5` | **Parte 0 corrida y en pausa.** `0.2` resuelta, `0.3` resuelta por `D-17`, `D-20` no lo afecta. **`0.1` no cerró**: la canónica de JM sigue sin armonizar, y correr la armonización está `⏸ esperando autorización` |
| `Paso-2.13` | **sirve como está**, auditado hoy. Una premisa **vencida** en la Parte 4 (`PROYECTO.md` congelado; la pregunta la heredó `CLAUDE.md` §7) y tres números corregidos en el lugar. Su **Parte 3 ganó un segundo cruce**, `m2_envios`/`m2_campanias`, anotado junto al de `enc_mails_enviados` |
| `Paso-3-v3` | **Parte 0 corrida: las siete premisas se sostienen.** `filasDigitalDeEncuentro` existe (`Union.gs:576`), así que el agujero que se temía no está. **Listo para ejecutarse.** Tres cosas a la vista, ninguna bloqueante — están en la bitácora |
| `Paso-4` | vigente **con Addendum 1** (03/08), sin ejecutar |
| `Paso-5-v2` | vigente, sin ejecutar. Su `0.2` para si `CAMPANAS` sigue sin `periodo_id` |
| `DOC-8` | sirve como está. Dos cosas a mirar al ejecutarlo, en la bitácora del 03/08 |
