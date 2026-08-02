# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-01 (cierre de sesión) · último commit al escribirlo: el de esta entrada

## Dónde estamos

**`DOC-6` cerrado. El repo tiene por primera vez un plan escrito y un solo índice.**
Cero cambios en `.gs` en toda la sesión de documentación.

Antes de hoy el plan vivía en el `§6` del handoff de claude.ai —que se reemplaza cada
sesión— y las reglas estaban en dos catálogos que había que mantener sincronizados a mano.
Ahora: **`docs/PLAN.md`** tiene el plan y 14 decisiones `D-NN`, **`CLAUDE.md` §7 es el
único índice**, y `Plan Inicial/PROYECTO.md` está **congelado** con un mapa de adónde fue
cada una de sus nueve secciones.

## Lo que cambió de lugar hoy — mapa corto

| pregunta | dueño ahora |
|---|---|
| ¿Qué sigue y en qué orden? ¿Qué decisión estructural está tomada? | `docs/PLAN.md` |
| ¿Arquitectura, esquema, decisión estructural? | `docs/PLAN.md` §1, como `D-NN` |
| ¿Convención de proceso o aprendizaje? | `CLAUDE.md`, en la sección donde se aplica |
| ¿Cómo se resuelve el período de un token? | `docs/TOKENS.md` §5 (las tres capas) |
| ¿Quién puede escribir esta hoja de registro? | `docs/ESCRITORES.md` |
| ¿Cómo está construido el código? | los scripts de `tools/` re-corridos, no el `.md` |
| ¿Dónde se registra un `.md` nuevo? | **sólo** `CLAUDE.md` §7 |

## Lo que hay que saber antes de tocar algo

- **`PROYECTO.md` §2 está superado y dice lo contrario que el plan.** Al 30/07 decía que
  ejecuta `jpcofanogcba1`; `D-02` (01/08) dice que ejecuta `reporteseinformesgcba`, que
  **todavía necesita** que le den lectura sobre las cuatro bases. Está marcado en el
  encabezado del congelado, pero si alguien cita §2 de memoria, va a citar al revés.
- **Los `D-NN` no se editan: se superseden.** Una decisión estructural nueva nace como
  `D-15`, citando la que reemplaza.
- **`CLAUDE.md` quedó en 275 líneas**, por encima del ~250 sugerido. Decidido no recortar:
  lo que engordó son invariantes y aprendizajes. Si algún día hay que bajarlo, el candidato
  es §7 (29 filas) y es un paso propio — recortar una tabla de dueños al pasar es cómo se
  pierde un dueño sin que nadie se entere.

## Qué sigue — el orden está en `docs/PLAN.md` §2

1. **Cerrar el Paso 1.8** — es el punto 1 del plan. Las cuatro pruebas de aceptación del
   §7 de su prompt **nunca corrieron como tales**; verificado que `fd58902` no trae ningún
   cierre. Falta la corrida y el commit con el `✅`.
2. **Tramo 1 — cerrar configuración.** Siete ítems, con el pedido de acceso de
   `reporteseinformesgcba` a las cuatro bases arrancando ya porque depende de terceros.
3. Tramos 2 a 5: corte vertical JM → prueba de motor con SECCO → panel → chequeo previo.

## Abierto, sin cambios en esta sesión

Todo `docs/PENDIENTES_consistencia.md`, que hoy sumó tres entradas migradas del
`PROYECTO.md` congelado: el bloqueante `{{m2_salud_camp}}` (bloquea armonizar la plantilla
canónica de JM), la mejora de `ultima_carga` en `CONFIG`, y la pregunta abierta de si
`looker` ya trae hecho el join que arma `unirDigitalPorCuenta()`.

Los tres hallazgos que abrió `C.2-7` siguen abiertos, y el `AUD-3` le sumó evidencia al
primero: `MAPEO` tiene **tres** escritores, no dos — el tercero es
`consolidarMapeoLooker_` (`Solapas.gs:455-456`), que además escribe `BASES` y `SOLAPAS`.
