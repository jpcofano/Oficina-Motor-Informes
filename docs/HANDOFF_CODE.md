# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-02 · último commit al escribirlo: el de esta entrada

## Dónde estamos

**El diff de configuración quedó sin ruido, por primera vez desde que existe.**

```
cambiadas: 0 · agregadas: 0 · migraciones: 0 · solo_en_hoja: 7
· protegidas (con diferencia): 0 · protegidas (sin diferencia): 8 · sin cambios: sí
```

Ese `protegidas (con diferencia): 0` es el final de un piso que arrastraba desde el Paso
2.11 C.2: eran diez líneas que aparecían en cada corrida, bajaron a ocho con la Parte E y
llegaron a cero con el 2.12. **No queda ninguna fila donde el seed quiera algo distinto de
lo que hay en la planilla.**

Cerrados hoy: **Paso 1.8** (`✅`), **Paso 2.11 Parte E** (`✅`), **Paso 2.12 Partes 2 y 3**
(`✅`). `SOLAPAS` quedó con 84 filas y **cero en `uso=revisar`**.

## Qué sigue — Tramo 1 (`docs/PLAN.md` §2)

Del tramo quedan cinco, sin orden entre sí:

1. Dar acceso de lectura a `reporteseinformesgcba` sobre las cuatro bases (`D-02`). **No
   depende de terceros**: son cuentas del usuario.
2. **Generalizar `hayUi_()`** — desbloquea correr el protocolo entero por API. Hoy protege
   un solo camino de menú de los 34, y por eso "Aplicar" y "Estado" siguen exigiendo que
   una persona abra la planilla.
3. `periodo_id` en `CAMPANAS` y `REUNIONES` (`D-08`). No toca código.
4. Repuntar `carpeta_salida` a reportes (`D-03`).
5. **Registrar M2** — primera medición de `D-01`, con la predicción anotada *antes* de
   correrla.

## Lo que hay que saber antes de tocar algo

- **`origen` en `SOLAPAS` hace dos trabajos**: procedencia (*"lo decidió una persona"*) y
  protección (*"el sembrador no lo toca"*). Mientras sean la misma columna, marcar la
  procedencia congela la fila entera. Es la raíz común de dos hallazgos ya cerrados y del
  P2 abierto de las notas de `rdv`. Separarlos es un paso propio.
- **Una predicción numérica declara su unidad.** El diff de configuración cuenta **celdas**,
  no filas — costó una predicción de 15 contra una medición de 30 que eran lo mismo.
  Nota de método 3 en `docs/PLAN.md`.
- **Ni `consolidarMapeoLooker_` ni `auditarFormulasResumenesLooker_` vuelven al menú** hasta
  que se arregle la inferencia invertida (P1). Tampoco
  `reclasificarSolapasM2Invertidas_`, retirada y con su encabezado.
- **`PROYECTO.md` está congelado**; su §2 dice lo contrario que `D-02` sobre qué cuenta
  ejecuta. Marcado en el encabezado del propio archivo.

## Abierto

`docs/PENDIENTES_consistencia.md`. Lo que toca de cerca a lo que viene:

- **P1 · la inferencia invertida** de `auditarFormulasResumenesLooker_`. Falta un estado
  `ambas_independientes` para cuando la fórmula apunta a una hoja que no es la otra del par.
- **P1 · `promoverFechasElegidas()`** escribe siete filas de `MAPEO` que ningún `SEED_MAPEO_`
  conoce. Es el P1 original de `C.2-7` y sigue sin declarar.
- **P2 · las notas de las ocho protegidas de `rdv`** dicen "sin decidir" sobre filas
  decididas, con la causa raíz de `origen` explicada arriba.
- **`H-4`** · `m2/Cuentas` quedó `ignorar` y las cinco filas de `MAPEO` que la mapean están
  huérfanas. Mapear una solapa que se ignora es una inconsistencia distinta de clasificarla.
- **P2 · `diagnosticoBases_()` lista solapas `ignorar`** — es **precondición de `D-11`**, así
  que vuelve en el Tramo 5 si no se resuelve antes.
