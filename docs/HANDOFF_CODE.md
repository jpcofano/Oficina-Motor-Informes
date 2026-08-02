# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-01 · último commit al escribirlo: el de esta entrada

## Dónde estamos

**Paso 1.8 cerrado con su `✅`. Empieza el Tramo 1 — cerrar configuración.**

Las cuatro pruebas de aceptación del Paso 1.8 §7 corrieron: **4 de 4**, con los cuatro
criterios cumplidos (JSON y nunca HTML, el mail correcto, `llamar` devolviendo lo mismo que
el menú, y ninguna respuesta con el `API_TOKEN` adentro). Era el punto 1 de `docs/PLAN.md`
§2 y ya salió de la lista.

Con eso el paso queda cerrado del todo: **Code puede invocar cualquier función del motor
contra HEAD sin que nadie abra la planilla.** Es la capacidad que hace ejecutable buena
parte de lo que viene.

## Qué sigue — Tramo 1, siete ítems (`docs/PLAN.md` §2)

Sale cuando el diff da cero ruido. No están ordenados entre sí salvo el primero, que
depende de terceros:

1. **Pedir acceso de `reporteseinformesgcba` a las cuatro bases** (`D-02`) — **arranca ya**:
   dos bases son de dueños externos y el pedido tiene demora. Hoy la cuenta que pasa la
   Barrera 1 es `jpcofanogcba1`.
2. Abrir el P1 del **tercer escritor de `MAPEO`** (`consolidarMapeoLooker_`,
   `Solapas.gs:455-456`), que además escribe `BASES.hoja_default` y seis celdas de `SOLAPAS`
   desde un ítem de menú.
3. **`Paso-2.12` Parte 2** — las 17 disposiciones de `SOLAPAS.uso`. Las diez líneas
   `protegida (habría cambiado)` son la lista de trabajo, y `docs/ESCRITORES.md` §2.2 ya
   trae el desglose: ocho son `uso` donde el humano tiene razón, dos son `notas` donde el
   seed es mejor.
4. **Generalizar `hayUi_()`** — desbloquea correr el protocolo entero por API. Hoy protege
   un solo camino de menú de los 36 (`docs/INVENTARIO_CODIGO.md` Parte D).
5. **`periodo_id` en `CAMPANAS` y `REUNIONES`** (`D-08`). No toca código: el censo confirma
   que `CAMPANAS` tiene cero escritores.
6. **Repuntar `carpeta_salida`** a reportes (`D-03`).
7. **Registrar M2** con los parámetros validados el 01/08 — `modo_periodo` de `snapshot` a
   `filtrar`, `fecha_periodo` → `Fecha envio` de `Directa mail`, y excluir
   `Estado = Proyectado`. Es la **primera medición de `D-01`**, y el plan pide anotar la
   predicción *antes* de correrla: las dos primeras son config, la tercera probablemente no.

## Lo que hay que saber antes de tocar algo

- **`PROYECTO.md` está congelado** desde el 01/08. Su §2 dice lo contrario que `D-02` sobre
  qué cuenta ejecuta el motor — está marcado en el encabezado del propio archivo, pero
  quien lo cite de memoria va a citar al revés.
- **Los `D-NN` no se editan: se superseden.** Decisión estructural nueva = `D-15`.
- **Un `.md` nuevo se registra sólo en `CLAUDE.md` §7.** `PROYECTO.md` dejó de ser índice.
- `CLAUDE.md` quedó en 275 líneas, por encima del ~250 sugerido. Decidido no recortar.

## Abierto, sin cambios

Todo `docs/PENDIENTES_consistencia.md`. Lo que toca directamente al Tramo 1: el bloqueante
`{{m2_salud_camp}}` (bloquea armonizar la plantilla canónica de JM), la asimetría
Estado/Aplicar en las protegidas, y `diagnosticoBases_()` listando solapas `ignorar` — este
último es **precondición de `D-11`**, así que va a volver en el Tramo 5 si no se resuelve
antes.

`llamar` sigue sin lista blanca de sólo lectura: **diferido al Paso 6** por decisión del
usuario, porque sobre `/dev` las dos barreras ya exigen una cuenta con permiso de edición.
