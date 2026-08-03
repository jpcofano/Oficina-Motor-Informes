# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-02 (cierre del Paso 2.15) · último commit al escribirlo: el de esta entrada

## Dónde estamos

**El Tramo 1 queda con un solo ítem abierto: el `Paso-2.16`.** Nada bloqueado, nada
esperando a un tercero.

El **Paso 2.15** se cerró entero, en cuatro commits (`aca39bf`, `555880c`, `c4797d8`,
`4de320a`):

- **`carpeta_salida` apunta a la carpeta de reportes.** Apareció al ejecutarlo que una clave
  hacía de dos: el ID viejo era la carpeta **donde vive la planilla de control**, así que el
  primer deck del Paso 4 habría caído al lado del motor. Quedó como clave nueva
  `carpeta_motor`, sin lector.
- **`periodo_id` es la primera columna de `CAMPANAS` y `REUNIONES`.** Las diez filas
  existentes quedaron con el valor vacío, y `D-19` fija qué significa ese vacío: **sin
  período asignado**, nunca "el vigente".
- **`cargarTemario` exige el período y falla explícito.** Antes habría escrito la celda vacía
  en silencio.

Números de referencia, verificados por API al cerrar:
`cambiadas 0 · agregadas 0 · migraciones 0 · solo_en_hoja 7 · protegidas (con diferencia) 0 ·
protegidas (sin diferencia) 8 · sin cambios: sí`. `CONFIG` en 7 filas, 0 sin completar.
`CAMPANAS` 3 filas, `REUNIONES` 7. Los cinco controles de `Pruebas.gs`: 5 de 5.

**`REUNIONES` salió de la lista de "hojas verificadas/reparadas" de cada corrida.** Entró a
`COLUMNAS_DELTA_`, así que ya no recibe la reescritura de encabezados en cada `instalar()`.
Es el efecto buscado; si vuelve a aparecer, es que agregó una columna.

## Qué sigue

**`Paso-2.16` — activar `m2`.** Es el último ítem del Tramo 1 y la **primera medición de
`D-01`**, así que va en su propio commit. Su Parte A es sólo lectura y termina con una
decisión para el usuario: el ítem del plan manda mapear `fecha_periodo` contra
`m2/Directa mail`, que el Paso 2.10 Parte C declaró **derivada** de `digital/Directa Mail`.
**Si A.3 confirma que la fuente es `digital`, el prompt se corrige antes de la Parte B.**

Después del 2.16, el Tramo 1 cierra y arranca el **Tramo 2** (Pasos 3, 4 y 5, contra JM
solo). `Paso-4.md` se revisa antes de ejecutarlo.

## Qué mirar antes de tocar algo

- **El diff no ve los valores de `CONFIG`** (`PENDIENTES`, `P1`). Seis claves pueden diferir
  del seed sin que ninguna verificación lo note — demostrado sobre una divergencia real en
  este paso. Para cambiar un valor: vaciar la celda y sembrar, o editarla a mano y actualizar
  el seed en el mismo commit.
- **`upsertPorClave_` reescribe la fila entera** (`PENDIENTES`, `P1`). Hoy no puede
  dispararse; el día que alguien le ponga sembrador a `CAMPANAS` sin incluir `periodo_id`, la
  curaduría se borra sola.
- **El repo es público y expone 14 IDs de recursos internos** (`PENDIENTES`, `P0`). Decidido
  el 02/08: sigue público por ahora, se revisa al llegar a producción o a una versión de
  prueba (anotado en `PLAN.md` §2, Tramo 3).
- **Las cuatro bases tienen a `reportes` como `writer`, no como lector**, y **sus dueños no
  son cuentas del usuario** — verificado contra Drive el 02/08. La nota vieja de `PLAN.md`
  que decía lo contrario ya está corregida.

## Trabado

Nada.
