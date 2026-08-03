# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-03 (madrugada, cierre del Tramo 1) · último commit al escribirlo: el de esta entrada

## Dónde estamos

**El Tramo 1 está cerrado.** Los siete ítems salieron; el último fue el `Paso-2.16`.

**El `Paso-2.16` no hizo lo que decía su título.** Su Parte A mostró que **no había ningún
`m2` que activar**: las 19 filas de `MAPEO` de `m2` están duplicadas en `digital` campo por
campo, ninguna apunta a una solapa `fuente`, y la única solapa `fuente` que `m2` tiene
(`Cuentas M2`) no está mapeada. De los tres cambios, **(a)** se descartó —`filtrar` sin
`fecha_periodo` habría roto toda lectura de `m2`—, **(b)** ya existía en la solapa correcta
(`digital/Directa Mail.fecha_periodo` = F) y **(c)** fue todo el paso.

**Lo que se construyó es más útil que lo que se pedía:** el **filtro declarativo por valor
de columna** (`D-21`). `MAPEO.valores_incluidos` declara qué valores entran; lo que no está
declarado queda afuera **y se cuenta**. La primera aplicación es `digital/Directa Mail`:
**2114 → 2073 filas**, con 41 excluidas (`Proyectado` 30, vacío 11).

**Medición de `D-01`: +253 / −5 líneas de `.gs`** en cuatro archivos. El renglón de "por qué
hubo que tocar código" es uno solo y es reusable: **el motor no tenía forma declarativa de
excluir filas por valor**.

Números de referencia, verificados por API al cerrar:
`cambiadas 0 · agregadas 0 · migraciones 0 · solo_en_hoja 7 · protegidas (con diferencia) 0 ·
protegidas (sin diferencia) 8 · sin cambios: sí`. `MAPEO` en 121 filas. Los **6 controles**
de `Pruebas.gs` pasan, incluido `probarListaBlancaValores_`.

## Qué sigue

**El Tramo 2: los Pasos 3, 4 y 5, contra JM solo.** `Paso-4.md` se revisa antes de
ejecutarlo. El Paso 3 arrastra cinco cosas ya decididas y sin implementar, todas anotadas en
`PLAN.md` §2:

1. **`D-20`** — el período por sección: la columna en `SECCIONES` (que **entra a
   `COLUMNAS_DELTA_` antes** de que se toquen sus `headers`), el eslabón en la cadena
   `campaña > marcador > sección > CONFIG > semana`, y el cálculo del default de `R-11`,
   que hoy no existe.
2. **`R-12`** — ampliar la búsqueda de candidatos antes de declarar `sin_link`, con los dos
   valores de ventana a `CONFIG`.
3. **El empate técnico** del match, que `DISENO_match_temario.md` §6.4 declara y ningún
   código implementa.
4. **Migrar `status = Realizada`** de `Union.gs` a `MAPEO.valores_incluidos` — ver abajo,
   tiene una decisión pendiente adelante.
5. El filtrado por período que `D-19` habilitó (`Paso-2.15` B.5).

## Decisiones esperando al usuario

Ninguna bloquea el Tramo 2; las cuatro se pueden resolver cuando toque.

- **`rdv/status` quedó sin declarar, contra lo planeado.** El plan era declarar
  `Realizada` ahora y migrar el consumidor en el Paso 3, pero al verificar apareció que con
  este diseño **declarar es conectar**: `leerFuente` aplica toda lista blanca declarada, así
  que cargar la celda cambiaría en el acto lo que ve *cualquier* lectura de `rdv`, no sólo
  el matcher de `Union.gs` —que ya filtra por su cuenta—. No pude medir el impacto porque
  `leerFuente` no acepta una ventana por API (`Utilities.formatDate` rechaza strings), así
  que **tomé la decisión conservadora de no activarlo**. Está en `D-21` y en la bitácora.
- **Qué pasa con `m2`**: si se despide de `MAPEO` —las 19 filas duplicadas, incluidas las 5
  que violan el invariante de `ignorar`— o si se mapea `Cuentas M2` y `m2` se queda sólo con
  lo suyo. Es probablemente un `D-NN`.
- **El acceso de `reportes` a las cuatro bases es `writer`, no lector**, y los dueños son
  terceros (`brianbanderbek`, `tarnowski.jp`, `dgples.comunicacion`). Bajarlo a lector es
  una acción tuya sobre Drive. Conviene decidirlo antes del Paso 4.
- **`CONFIG.periodo_hasta` = `03/07`** son ocho días inclusive y `R-11` fija siete. Ya está
  confirmado que es arrastre, no intención, pero **la celda no se toca**: la corrige una
  persona. No bloquea nada hasta el Paso 3.

## Qué mirar antes de tocar algo

- **El diff no ve los valores de `CONFIG`** (`PENDIENTES`, `P1`). Para cambiar un valor:
  vaciar la celda y sembrar, o editarla a mano y actualizar el seed en el mismo commit.
- **`upsertPorClave_` reescribe la fila entera** (`PENDIENTES`, `P1`). El día que alguien le
  ponga sembrador a `CAMPANAS` sin incluir `periodo_id`, la curaduría se borra sola.
- **Tres significados distintos de una celda vacía**, a propósito: `D-19` (la fila no
  entra), `D-20` (usa el default), `D-21` (no hay filtro). Están escritos uno al lado del
  otro para que nadie los unifique.
- **El repo es público y expone 14 IDs internos** (`PENDIENTES`, `P0`). Decidido: sigue
  público, se revisa al llegar a producción o a una versión de prueba.
- **`/dev` alternó 404 y página de login durante toda la verificación del 2.16**, con el
  token válido y los 21 `.gs` parseando bien. Se perdió el reporte de una corrida de
  `Aplicar` —la llamada se ejecutó pero la respuesta no volvió— y hubo que verificar el
  estado leyendo la hoja. **Reintentar tres veces antes de sospechar del código**, y usar el
  atajo de `new vm.Script` que documenta el RUNBOOK.

## Trabado

Nada.
