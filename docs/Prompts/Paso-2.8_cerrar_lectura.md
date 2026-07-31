# Paso 2.8 — Cerrar la lectura: `alcance`, `looker`, y las 18 filas de `m2`

> **Qué es:** los tres pendientes que dejó la prueba de lectura por ventana del 30/07,
> más un cuarto que apareció en la misma corrida. Dos son de un renglón; dos son
> diagnósticos.
>
> **Objetivo:** que "Probar lectura por ventana" devuelva ✅ en las cuatro bases con
> conteos que se puedan defender. Es la precondición del Paso 3 — sin esto, los
> marcadores leen de fuentes que todavía no sabemos si están bien.
>
> **No toca Slides, no siembra `MARCADORES`.** Un commit por parte.
> **Trabajamos en español.**
>
> ⚠ **Namespace (`PROYECTO.md` §9):** antes de nombrar cualquier función nueva,
> `grep -rn "function nombre" *.gs`.

---

## Punto de partida — la corrida del 30/07

```
Ventana: 2026-06-26 → 2026-07-03
✅ rdv    (RVD JM-CM - ES, col FECHA)  — 720 totales, 16 en ventana, 0 sin fecha, 0 inválida
✅ digital (Digital, snapshot)          — 960 filas (337 sin clave descartadas)
⚠️ looker                               — «FALTA:fecha_periodo@looker/resumen_metricas»
✅ m2     (M2 periodo DIRECTA, snapshot)— 18 filas
```

`rdv` es el único que se lee sano. Los otros tres tienen algo que explicar, y **dos de
ellos devolvieron ✅**.

---

## Parte A — Borrar `digital/Digital/alcance`

Confirmado por la auditoría de la Parte B del Paso 2.7: la columna **E** de
`digital/Digital` es `Fecha de inicio`, no alcance. La fila de `MAPEO` está mal y el
alcance ya está cubierto por `digital/Alcance/alc_alcance`.

1. Eliminá la fila `digital` / `Digital` / `alcance` de `MAPEO` **y de `SEED_MAPEO_`**
   en `Instalar.gs`, para que no vuelva en la próxima siembra.
2. **Anotá el hallazgo lateral:** la columna **D** de esa solapa se llama `Audiencia`.
   Es candidata a la "Audiencia Alcanzada" de JM 5, que sigue abierta desde hace varios
   handoffs. La otra candidata es `looker/Audiencias` (303 filas,
   `Segmentacion | Tipo | Audiencias Potenciales | Área`). Registrá las dos en
   `docs/CONFIG_INFORMES.md`, sin elegir.

**Test:** "Probar lectura por ventana" ya no menciona `alcance` en `digital/Digital`.

→ **Commit A:** `Paso 2.8 ✅ — MAPEO: eliminada digital/Digital/alcance (col E era Fecha de inicio)`

---

## Parte B — Destrabar `looker`: los 25 mapeos, juntos

`«FALTA:fecha_periodo@looker/resumen_metricas»` sale porque los mapeos están partidos:
24 campos cuelgan de `resumen_metricas` y **`fecha_periodo` cuelga de
`resumen_metricas_dinamico`**. Ninguna de las dos tiene el juego completo.

1. En `MAPEO` y en `SEED_MAPEO_`: la fila `looker` / `resumen_metricas_dinamico` /
   `fecha_periodo` pasa a solapa **`resumen_metricas`**. Los 25 quedan juntos.
2. Es **provisorio** y tiene que decirlo en `notas`: si el test de la Parte C determina
   que la fuente es `_dinamico`, se mueven los 25 para allá.

**Test:** "Probar lectura por ventana" devuelve ✅ para `looker`, con conteo.

→ **Commit B:** `Paso 2.8 ✅ — looker: los 25 mapeos consolidados en resumen_metricas`

---

## Parte C — El test de fórmulas, esta vez sí

La auditoría que se corrió volcó **encabezados**, no fórmulas. Los encabezados idénticos
ya se sabían desde el 30/07; no discriminan nada. Lo que falta es saber **cuál deriva de
cuál**.

1. `getFormulas()` sobre las filas **2 a 4** de `resumen_metricas` y de
   `resumen_metricas_dinamico`. Reportar, por cada una, si las celdas traen fórmula o
   valor, y **la fórmula literal** si la hay.
2. Lectura del resultado:
   - una con fórmulas y la otra con valores → la de valores es `fuente`, la otra
     `derivada`;
   - **las dos con valores planos** → no hay vínculo detectable. **Frená y reportá.** Sin
     vínculo, la que no se refresque queda vieja **sin cambiar de forma ni de conteo**
     (las dos tienen 903 filas y el mismo orden de columnas), y eso lo tiene que
     contestar el dueño: `dgples.comunicacion@gmail.com`.
3. Chequeo de apoyo, barato: comparar los valores de 3 o 4 `id_cuentas` entre las dos.
   **Si ya difieren hoy**, la pregunta al dueño es urgente y hay que decirlo así.
4. Con la respuesta: dejar una en `fuente` y la otra en `derivada` en `SOLAPAS`
   (`origen=manual`), alinear `BASES.hoja_default`, y mover los 25 mapeos si hace falta.
5. **Cerrar DOC-3 Parte A** dejando escrito el porqué. Si gana `resumen_metricas`, la
   corrección que pedía DOC-3 queda cancelada — y hay que decir por qué, o en dos meses
   vuelve a abrirse como pendiente.

→ **Commit C:** `Paso 2.8 ✅ — looker: fuente decidida por getFormulas() + DOC-3 Parte A cerrada`

---

## Parte D — `m2` devolvió 18 filas de 29.533

Este es el importante. `SOLAPAS` registra **29.533 filas** en `M2 periodo DIRECTA`. La
lectura devolvió **18**, en modo snapshot, o sea sin filtrar por ventana. Y salió con ✅.

Un lector que devuelve el 0,06% de una base **sin fallar** es el modo de falla caro en su
forma más pura: río abajo, un marcador va a sumar esas 18 filas y a producir un número
plausible.

1. **Volcá las filas 1 a 8 completas** de `M2 periodo DIRECTA`, con sus valores tal cual.
   `BASES` declara `fila_encabezado=3` para `m2`; hay que ver qué hay en las filas 1 y 2
   (¿banner de período escrito a mano?) y si el encabezado real está en la 3.
2. **Encontrá dónde se cortan las 18.** Las dos hipótesis: el lector para en la primera
   fila vacía, o `getDataRange()` devuelve más de lo que el parseo acepta. Reportá la
   línea exacta donde se decide el corte.
3. **Aplicá el mismo chequeo a las otras tres bases.** Comparar, por cada base,
   `filas_datos` de `SOLAPAS` contra las filas que devuelve el lector. `digital` dio 960
   de 1297 y `rdv` 720 de 1362 — **ninguno de los dos cierra tampoco**, y nadie lo había
   mirado. Puede haber explicación (filas sin clave, filas vacías al final), pero tiene
   que estar dicha.
4. **Guardarraíl nuevo:** que el lector avise cuando devuelve **menos del 50%** de las
   filas que `SOLAPAS` registra para esa solapa. No un error — un ⚠ en el reporte. Es
   barato y agarra toda esta familia de fallas.

**No corrijas `fila_encabezado` a ojo.** Si resulta que `M2 periodo DIRECTA` tiene banner
de período, la conclusión no es ajustar el número: es que la solapa **no es fuente
cruda** y la pregunta al equipo sobre cuál es la solapa de métricas de `m2` pasa a ser
bloqueante de verdad.

→ **Commit D:** `Paso 2.8 ✅ — diagnóstico del corte de filas + guardarraíl de cobertura`

---

## Parte E — Las 337 filas sin clave de `digital`

De 1297 filas de `digital/Digital`, **337 se descartaron por no tener clave** — un 26%.

Puede ser correcto (campañas sin `id_cuenta` asignado) o puede ser que la columna clave
esté mal elegida. Recordá que `digital/Digital/clave` apunta a la **columna A**, con
valores como `"Ciudad Bilingue"` —nombre de campaña— mientras `dig_id_cuenta` está en la
**T** con `"0637-OCTEDUCG"`. AUD-2 concluyó que `unirDigitalPorCuenta` une por
`*_id_cuenta`, pero **el descarte por clave usa `clave`**, que es otra cosa.

1. Volcá **10 de las 337 filas descartadas**, con las columnas A y T.
2. Contestá: ¿están vacías en A, en T, o en las dos? ¿Son filas reales o relleno del
   final de la hoja?
3. Si el descarte se hace por la columna A y la clave de unión es la T, **son dos claves
   distintas para la misma solapa** y hay que decirlo. No lo arregles acá.

→ **Commit E:** `Paso 2.8 ✅ — diagnóstico de las 337 filas sin clave en digital`

---

## Prueba del usuario

1. "Probar lectura por ventana": las cuatro bases en ✅, ninguna con `«FALTA:…»`.
2. Los conteos cierran contra `SOLAPAS`, o la diferencia está explicada en el reporte.
3. Ninguna base dispara el guardarraíl del 50%.
4. Leer el reporte de la Parte C: **cuál de los dos `resumen_metricas` quedó como fuente
   y por qué.**
5. Leer el reporte de la Parte D: qué hay en las filas 1 y 2 de `M2 periodo DIRECTA`.

---

## Lo que sigue abierto

- **Timeout de `menuProbarUnionYAnclaje_`** (6 min, 30/07) — sin diagnosticar. Es el
  próximo paso y el único bloqueante real del Bloque 2. La Tarea 7 de AUD-1 sigue escrita
  y sin correr.
- **`m2`: cuál es la solapa de métricas.** Bloqueante para todos los tokens `m2_*`.
- **Tres solapas `Cuentas`** (4398 / 3453 / 961) — cuál es la maestra.
- **`EDV`** (290 filas) y **`Respuestas JM 📩`** (3692) — sin identificar; la segunda es
  candidata a fuente de los `enc_*`.
- **"Audiencia Alcanzada" de JM 5** — ahora con dos candidatas (Parte A punto 2).
- **`firma_encabezado`** — reservada, sin implementar, va antes del 3-v2.
- **13+ commits sin pushear** y la prueba de DOC-2 (instalador dos veces, `MARCADORES`
  sin `calculo`).
