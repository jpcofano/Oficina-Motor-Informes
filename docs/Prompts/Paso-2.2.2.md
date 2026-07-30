# Paso 2.2.2 — Plantilla canónica única, backup previo, y armonizar sobre el archivo correcto

> **Regla de oro:** este paso no calcula nada. Define de qué archivo se agarra el motor,
> hace que la armonización deje de ser destructiva, y recién ahí aplica el 2.2.1 sobre la
> plantilla que corresponde.
>
> **El código del 2.2.1 ya está escrito** (`c5d9f02`, `e0cd96f`) pero **nunca se ejecutó
> contra las Slides**. Este paso no lo rehace: lo apunta al archivo correcto y le agrega la
> red de seguridad que le faltaba.
>
> **Un commit por parte.**

---

## El problema

Hay **dos presentaciones JM distintas** en Drive:

| ID | estado | orden de slides |
|---|---|---|
| `117I0qn1XP1JCiz2mU32hUY1iiMUmrAAvHOsczd7u6jI` | **sin armonizar** — `135`, `enc_audiencia`, `enc_clics`, `rrss_prom`, sin `ecv_insc_ivr` | matriz M2 **antes** de "Campañas destacadas GCBA" |
| `1JrHvs_pdvdwWGZ1CQNmuJr9Bi3XvqyOMJhRweeJAzbE` | armonizado (slides 5 y 6 corregidas) | matriz M2 **después** |

No son el mismo archivo en dos momentos: el orden de slides difiere, así que ya venían
divergiendo antes de la armonización.

**`INFORMES.plantilla_id` apunta a `1JrHvs_p…`, pero la plantilla del equipo es
`117I0qn1…`.** Se armonizó el archivo equivocado.

Y hay algo estructural detrás: **`Armonizar.gs` escribe sobre la plantilla con
`SlidesApp.openById()`, sin copiar** (línea 89). No hay ningún `makeCopy()` en el proyecto —
`Generador.gs`, que es el que va a copiar para generar cada informe, sigue siendo un stub de
9 líneas (Paso 4). Es decir: **cada corrida de la armonización es destructiva y sin vuelta
atrás.** Ya costó una regresión en SECCO.

---

## La regla que queda fijada

**La plantilla es del equipo; el motor se adapta.** El equipo edita el diseño, y el motor
lee lo que el equipo tiene. Nunca al revés.

De ahí se derivan tres cosas, y van en `PROYECTO.md §6`:

1. **`INFORMES.plantilla_id` es la única verdad** sobre qué archivo usa cada informe. Si hay
   dos candidatos, no se elige por criterio técnico: se pregunta.
2. **El motor solo escribe sobre la plantilla en una migración explícita** (una armonización
   de tokens), nunca en una corrida normal. La generación semanal **copia** y escribe sobre
   la copia (Paso 4).
3. **Toda migración hace backup antes.** Es una función que corre sobre un archivo compartido
   y editado por otras personas.

---

## Parte A — `inventarioPlantillas()`

Función nueva en `Armonizar.gs`, ítem de menú **"Inventario de plantillas"** en
mantenimiento. Para cada fila de `INFORMES` con `plantilla_id`:

- nombre del archivo, ID, URL, carpeta padre y fecha de última modificación;
- cantidad de slides;
- el título (primer texto) de cada slide, numerado;
- cantidad de tokens `{{...}}` distintos, y **si contiene alguno de los tokens viejos**
  (`enc_audiencia_ivr`, `enc_audiencia_pauta`, `enc_clics`, `rrss_prom`, `m2_clics_a`,
  `135` suelto). Eso responde de un vistazo "¿esta está armonizada o no?".

Sirve para lo que acaba de pasar: dos archivos parecidos y ninguna forma rápida de saber
cuál es cuál.

→ **Commit A:** `Paso 2.2.2 ✅ — inventarioPlantillas(): qué archivo es cada plantilla`

---

## Parte B — Backup obligatorio antes de armonizar

En `armonizarPlantillas()`, **antes** de tocar nada:

1. Crear (si no existe) una subcarpeta `_backups` dentro de la carpeta de Plantillas
   (`1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi`).
2. `DriveApp.getFileById(plantillaId).makeCopy('<nombre> — backup <yyyy-MM-dd HH:mm>', backupFolder)`.
3. **Si el backup falla, abortar.** No se armoniza sin copia.
4. El reporte final tiene que mostrar el **ID y la URL de cada backup**, arriba de todo. Si
   algo sale mal, esa línea es lo primero que se necesita.

Es la diferencia entre "se rompió SECCO y lo arreglamos a mano" y "se rompió SECCO,
restauramos y probamos de nuevo".

→ **Commit B:** `Paso 2.2.2 ✅ — backup obligatorio antes de armonizar`

---

## Parte C — Repuntar `INFORMES` a la plantilla canónica

1. `INFORMES` fila `jm` → `plantilla_id = 117I0qn1XP1JCiz2mU32hUY1iiMUmrAAvHOsczd7u6jI`.
   `secco` no cambia: `1_ZKjWhL-bhCP8yHQ8PJ33ymyjSXu3thh7MKMOxB4-n8`.
2. `registrarPlantillasDesdeCarpeta()` **no debe pisar un `plantilla_id` ya cargado**. Hoy
   asigna por nombre de archivo y puede volver a apuntar a `1JrHvs_p…` en la próxima corrida,
   deshaciendo esto en silencio. Cambialo a: si la celda ya tiene un ID **distinto** del que
   encontró, **no escribe** y lo reporta como conflicto, con los dos IDs y los dos nombres.
   Que la decisión la tome una persona.
3. Marcá `1JrHvs_p…` como fuera de uso: renombrala en Drive a
   `[OBSOLETA — no usar] <nombre actual>`. **No la borres:** tiene la armonización aplicada y
   sirve como referencia de cómo tiene que quedar la canónica.

→ **Commit C:** `Paso 2.2.2 ✅ — INFORMES apunta a la plantilla canónica; registrar no pisa IDs`

---

## Parte D — Armonizar la canónica

Con A, B y C hechos, correr la armonización sobre `jm` (ahora `117I0qn1…`) y `secco`. El
código del 2.2 y el 2.2.1 ya está: listas por `informe_id`, renombres de M2, limpieza
recorriendo grupos, restauración de `enc_audiencia` en SECCO.

⚠ **Antes de correr, dos chequeos en el código** (`grep -n "m2_vis_e\|m2_camp1\|m2_camp2" Armonizar.gs`):

```
m2_vis_e  → m2_desalojos_vis      (NO m2_seguridad_vis)
m2_camp1  → m2_desalojos_camp     (NO m2_subtes_camp)
m2_camp2  → m2_subtes_camp
```

Los sufijos `_a`…`_e` **no siguen el orden de las columnas**. Si esos tres se generaron por
orden de letra, caen en la columna equivocada y el nombre pasa a mentir con confianza, que es
peor que el nombre viejo.

⚠ **SECCO ya está parcialmente armonizada** (tiene `ecv_insc_ivr`, `enc_clics_ctor`,
`rrss_prom_general`, y la caja "Audiencia" rota). La armonización tiene que ser **idempotente**:
un renombre cuyo origen no existe reporta 0 y sigue. Si alguno tira error o rompe, es un bug
de la función, no del archivo.

→ **Commit D:** `Paso 2.2.2 ✅ — armonización aplicada sobre las plantillas canónicas`

---

## Parte E — Doc

En `PROYECTO.md §6`, la regla de arriba (tres puntos) más la tabla de plantillas canónicas
con ID. En `docs/TOKENS.md`, actualizar el ID de JM en la advertencia de verificación.

→ **Commit E:** `Doc: plantilla canónica única y regla de no escribir sobre la del equipo`

---

## Bloqueante antes de la Parte D

En la slide de la matriz digital de M2 hay **seis** cajas de campañas, no cinco:

```
x=0.67  y=4.42  {{m2_camp2}}       columna Subtes
x=2.61  y=4.42  {{m2_camp1}}       Desalojos
x=4.57  y=4.42  {{m2_camp3}}       Tránsito
x=6.44  y=4.42  {{m2_camp4}}       Salud
x=8.22  y=4.42  {{m2_camp5}}       Seguridad
x=1.40  y=4.94  {{m2_salud_camp}}  ← huérfana, entre Subtes y Desalojos, una fila más abajo
```

`{{m2_salud_camp}}` **no está en la columna de Salud** pese al nombre, y está dentro del área
visible: se imprime. Está en las dos versiones de JM.

El usuario tiene que mirar esa caja y decidir:

- **es un sobrante** → se borra junto con los 14 números de ejemplo, y `m2_camp4` →
  `m2_salud_camp` queda limpio;
- **se queda** → sacar `m2_camp4 → m2_salud_camp` de la lista, o quedan dos cajas visibles con
  el mismo token. El problema de `enc_audiencia`, otra vez.

**No corras la Parte D sin esto resuelto.**

---

## Prueba del usuario

1. Menú → **"Inventario de plantillas"**. Confirmar que `jm` → `117I0qn1…` y `secco` →
   `1_ZKjWhL…`, con la cantidad de slides y sin tokens viejos **después** de la Parte D.
2. Que exista `_backups` con una copia de cada plantilla, fechada, y que el reporte muestre
   sus URLs.
3. Las seis verificaciones de `Paso-2.2.1.md`, ahora sobre `117I0qn1…`.
4. Correr `registrarPlantillasDesdeCarpeta()` y confirmar que **no pisa** los IDs: si
   `1JrHvs_p…` sigue en la carpeta, tiene que reportar conflicto, no reescribir.
5. Correr la armonización **dos veces**: la segunda, 0 reemplazos y ningún error.

---

## Lo que este paso deja abierto

- Por qué existen dos JM con distinto orden de slides. No hace falta resolverlo para seguir,
  pero si el equipo tenía dos flujos de edición en paralelo, va a volver a pasar.
- Las fechas hardcodeadas de SECCO ("Febrero 2026" slide 3, "Seguimiento Mayo 2026" slide 25,
  el `2026` fijo de la slide 24) y los temas de ejemplo de la 25.
- SECCO 26: nueve cajas `xx` sin fuente.
