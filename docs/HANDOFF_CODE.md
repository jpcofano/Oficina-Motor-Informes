# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-01 (tarde) · último commit al escribirlo: el de esta entrada

## Dónde estamos

**AUD-3 ejecutado. C.2-7 cerrado más temprano hoy. Sin nada trabado. Cero cambios en `.gs` pendientes.**

El código está mapeado: `docs/INVENTARIO_CODIGO.md` (congelado — grafo de llamadas,
huérfanas clasificadas, trabajos y costuras de `Instalar.gs`, menú) y
`docs/ESCRITORES.md` (**vivo** — contrato de quién escribe cada hoja de registro, con
matriz regenerable). Los dos con script en `tools/` (`inventario.js`, `escritores.js`):
si dentro de un mes el mapa parece viejo, se re-corre, no se le cree.

## Lo que el AUD-3 dejó establecido

- **20 huérfanas, no 18** — 8 adelantadas (los 5 `op*` del Paso 3, `abrirPanel`,
  `filasDigitalDeEncuentro`, `parsearPersonas_`) + 6 colgadas (el camino de escritura de
  `Valores.gs`: el punto de cableado existe — `corteVerticalRetiro2407_` calcula sin
  registrar) + 6 muertas (instrumentos de consola de casos cerrados). Ninguna borrada:
  AUD-3 clasifica, no resuelve.
- **`MAPEO` tiene TRES escritores, no dos**: upsert/`SEED_*`, `promoverFechasElegidas`
  (`Fechas.gs`) y **`consolidarMapeoLooker_` (`Solapas.gs:455-456`)** — el tercero lo
  encontró el censo solo, era el control positivo del patrón. También escribe `BASES` y
  `SOLAPAS`. Regla operativa provisoria en `ESCRITORES.md` §2.1.
- **`MARCADORES`: nada la siembra y nada la escribe salvo una migración de renombre**
  (`migrarCalculoAOperacion_`). H-6 confirmado desde el código — insumo directo del 2.13.
- **`CAMPANAS`: cero escritores** — consistente con "curada a mano".
- **33 de 36 ítems de menú tocan `getUi()` y son no-invocables por la API**; el único
  protegido es `probarConexionBases` vía `hayUi_`. Insumo del paso que quiera exponer
  diagnósticos por `/dev`.
- Las mediciones externas del punto de partida: exactas en funciones/archivos/duplicados
  e `Instalar.gs`; las líneas ("~8.100" → 8.410), el menú (~34 → 36) y `getUi` (37 → 40)
  eran aproximadas. Detalle y conciliación en `INVENTARIO_CODIGO.md` §0.

## Reglas nuevas de esta sesión

- **`CLAUDE.md` §3: grepear antes de pedir una corrección** — la Tarea 1 del AUD-3 pidió
  corregir tres premisas que no estaban en el archivo; el resultado correcto fue cero
  ediciones, registrado.
- `CLAUDE.md` §7: la fila "¿qué debería decir esa configuración?" ya tiene a quién
  señalar — `SEED_*` (el valor) + `ESCRITORES.md` (el camino).

## Chequeo pendiente que este cierre confirmó

**El Paso 1.8 no tiene ✅.** Su entrada de bitácora (commit `4fa54f5`) dice "las cuatro
de aceptación no corrieron" y ningún commit posterior —incluido `fd58902`— registra que
hayan corrido como tales. La API se usó en serio (5/5 `probar*_`, `bases`), pero las
cuatro pruebas del Paso 1.8 §7 como protocolo nunca se corrieron. Cerrarlo es una
corrida de esas cuatro + una línea en la bitácora.

## Qué sigue

1. **Las cuatro pruebas de aceptación del Paso 1.8 §7** — lo único que le falta a ese
   paso para su ✅.
2. **`Paso-2.11` Parte D** — `BASES.fila_encabezado` vestigial (H-2), `Union.gs:36`/`:261`,
   retirar `reclasificarSolapasM2Invertidas_`, nombres hardcodeados de `Fechas.gs:66` y
   `Auditoria.gs:348`. El inventario §C ya dice qué comparte cada pieza.
3. **`Paso-2.11` Parte E** — formalizar el contrato de escritores que `ESCRITORES.md`
   dejó redactado (el tercero de `MAPEO` incluido).
4. **`Paso-2.12` Parte 2** — las 17 en `revisar` de `SOLAPAS`; `ESCRITORES.md` §2.2 trae
   el desglose de las 10 protegidas (8 `uso` donde el humano gana, 2 `notas` donde el
   seed es mejor).
5. **`Paso-2.13`** — `SEED_MARCADORES_`; el snapshot está tomado y el censo confirma que
   hoy nadie escribe esa hoja.
6. Lo que el usuario anticipó: **DOC-6** para lo que salga de acá en adelante.

## P1/P2 abiertos sin cambios

Los tres de C.2-7 (filas huérfanas de `MAPEO` — ahora con el tercer escritor censado —,
asimetría Estado/Aplicar, `diagnosticoBases_` listando `ignorar`) más el resto de
`docs/PENDIENTES_consistencia.md`. AUD-3 no arregló ninguno: es sólo lectura.
