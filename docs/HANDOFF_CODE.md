# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-02 · último commit al escribirlo: el de esta entrada

## Dónde estamos

**Tramo 1 en curso.** Cerrados hoy: el Paso 1.8 (`✅`, cuatro pruebas de aceptación) y el
Paso 2.11 Parte E (`✅`, el escritor de looker). En ejecución: `Paso-2.12` Parte 2.

El diff de configuración quedó con **cero ruido salvo lo que falta decidir**: la última
corrida da `cambiadas: 0 · agregadas: 0 · migraciones: 0 · solo_en_hoja: 7 · protegidas
(con diferencia): 8`, y las ocho son las decisiones humanas de `rdv` que el `Paso-2.12`
Parte 2 viene a alinear.

## Lo que cerró la Parte E

`consolidarMapeoLooker_` —el tercer escritor de `MAPEO` que encontró solo el censo del
`AUD-3`— salió del menú junto con el diagnóstico que le pasaba la dirección. Ninguna de
las dos funciones se borró.

**Por qué importaba:** `auditarFormulasResumenesLooker_` devuelve `fuente:
'resumen_metricas'`, al revés de `S-01`, y con esa dirección alimentaba a la
consolidación. Un click revertía `S-01` sobre `MAPEO`, `SOLAPAS` y `BASES`, bajo un texto
de confirmación que sonaba autorizado. **La inferencia sigue invertida** — es un `P1` en
`docs/PENDIENTES_consistencia.md`, se anotó y no se arregló.

**El piso de diez protegidas bajó a ocho.** Las dos de `looker` no eran decisiones
humanas: su `origen=manual` lo escribía la propia migración. Con el seed diciendo ya
`fuente`/`derivada`, la protección sólo congelaba la peor versión de las notas.

## Qué sigue — `docs/PLAN.md` §2, Tramo 1

Del tramo quedan, sin orden entre sí:

1. **En curso:** `Paso-2.12` Parte 2 — Grupo A (15 filas en `revisar`, `origen=seed`) y
   Grupo B (las 8 protegidas de `rdv`, alinear el seed sin tocar `origen`).
2. Dar acceso de lectura a `reporteseinformesgcba` sobre las cuatro bases (`D-02`). **No
   depende de terceros**: son cuentas del usuario.
3. Generalizar `hayUi_()` — desbloquea correr el protocolo entero por API. Hoy protege un
   solo camino de menú de los 34.
4. `periodo_id` en `CAMPANAS` y `REUNIONES` (`D-08`). No toca código.
5. Repuntar `carpeta_salida` a reportes (`D-03`).
6. Registrar M2 — **primera medición de `D-01`**, con la predicción anotada antes de
   correrla.

## Lo que hay que saber antes de tocar algo

- **Ni `consolidarMapeoLooker_` ni `auditarFormulasResumenesLooker_` vuelven al menú** hasta
  que la inferencia esté arreglada. Sus encabezados lo dicen.
- **`PROYECTO.md` está congelado**; su §2 dice lo contrario que `D-02` sobre qué cuenta
  ejecuta. Marcado en el encabezado del propio archivo.
- **Los `D-NN` no se editan: se superseden.** Una premisa fáctica que se cae sí se corrige
  con nota fechada — hay un ejemplo bajo `D-02`.
- **Un `.md` nuevo se registra sólo en `CLAUDE.md` §7.**

## Abierto, sin cambios

Todo `docs/PENDIENTES_consistencia.md`, que hoy sumó el P1 de la inferencia invertida.
Sigue abierto el P1 original de `C.2-7`: `promoverFechasElegidas()` escribe siete filas de
`MAPEO` que ningún `SEED_MAPEO_` conoce — **no era de la Parte E** y no se tocó.
