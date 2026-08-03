# Paso 5 (v2) — Campañas repetibles + corrida end-to-end

**Estado:** vivo · **Fecha:** 2026-08-03 · **Ubicación:** `docs/Prompts/Paso-5-v2.md`

> **Reemplaza a `Paso-5.md`**, que se archiva en `docs/Prompts/_archivo/` al implementar
> esto.
>
> **Por qué se reescribió:** el original filtra `CAMPANAS` por `informe_id` + `mostrar=sí`
> y nada más. `D-19` agregó `periodo_id`, y sin él este paso **emitiría campañas que la
> decisión excluye**. Además el `Paso-2.15` Parte 0 encontró que los `tipo` vivos de
> `CAMPANAS` no coinciden con la lista que el original da por buena, y que las tres filas
> **no son de ejemplo**: están editadas a mano.
>
> Requiere los Pasos 0–4. Cierra el motor headless. **NO toca `Marcadores.gs`.**
>
> **Un commit por parte. Se para y se avisa al final de cada una.**

---

## Parte 0 — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

**0.1 · `CAMPANAS` vivo.** Sus columnas, sus filas, y el valor de `tipo` de cada una. Lo
que hay que resolver con el listado a la vista: el original nombra los tipos
`destacada / encuentro_ministros / proveedor`, el comentario de `Instalar.gs` declara
`campana · uno_a_uno · tematico · primera_persona · ministros · proveedor`, y los valores
vivos medidos el 02/08 no estaban completos en ninguna de las dos listas. **`tipo` no
tiene ningún lector en el repo.** Reportar cuál es la lista real y si `tipo` ganó un
consumidor desde entonces.

**0.2 · `periodo_id`.** Cuántas filas de `CAMPANAS` lo tienen cargado. Al cerrar el
`Paso-2.15` estaban las tres vacías, lo que con `D-19` significa que **ninguna campaña se
emitiría**. Si sigue así, este paso no puede probarse sin que una persona cure al menos
una fila: decirlo y **parar**, es tarea del usuario y no del motor.

**0.3 · Qué dejó el Paso 4.** Cómo copia la plantilla, dónde la deja, y cómo reemplaza
tokens. Este paso extiende eso, no lo reescribe.

**0.4 · Los bloques repetibles en las plantillas.** Si las plantillas ya están marcadas
con tokens `camp_*`, reportar en qué slides aparecen y si hay alguna marca que delimite el
bloque modelo. Sin eso, la Parte A tiene que inventar la convención y conviene saberlo
antes.

**Reportar 0.1–0.4 y PARAR.**

---

## Parte A — Identificar el bloque plantilla de cada tipo

En el Slides plantilla, el bloque de campaña es un conjunto de slides modelo con tokens
`camp_*` (y los propios de cada tipo). Hace falta una convención para marcar dónde empieza
y termina el bloque modelo de cada tipo — una slide con un marcador guía al inicio, o un
rango declarado en una hoja de registro.

**Preferir la hoja de registro sobre la marca en la plantilla**, salvo que `0.4` muestre
que ya hay marcas puestas: un rango declarado se cambia sin editar el deck, y es la
dirección de `D-01`. Documentar la convención elegida en el encabezado del módulo y en
`docs/TOKENS.md`.

---

## Parte B — Expansión por campaña

`expandirCampanias(informe_id, copiaId)`:

1. **Filtrar `CAMPANAS`** por `informe_id` + `mostrar = sí` + **`periodo_id` no vacío**
   (`D-19`). Ordenar por `orden`.
2. **Reportar las excluidas y por qué.** Una campaña que el usuario tildó y no salió
   porque le falta `periodo_id` tiene que aparecer en el reporte final, no desaparecer en
   silencio. Es el modo de falla más caro de este paso: el equipo ve un informe completo y
   le falta una campaña.
3. Por cada campaña: duplicar el bloque modelo de su `tipo` y reemplazar sus tokens usando
   **la ventana de esa campaña**. La campaña es el primer eslabón de la cadena de `D-20`,
   así que el despachador del Paso 3 ya la resuelve si se le pasa la campaña.
4. Al terminar, eliminar los bloques modelo originales de la copia.
5. Si no hay campañas de un tipo, eliminar ese bloque modelo.

**Un `tipo` sin bloque modelo en la plantilla no se calla:** sale ⚠ con el nombre del tipo
y de la campaña. Es la firma de una campaña curada contra una plantilla que no la
contempla.

---

## Parte C — Orquestación end-to-end

`generarInforme(informe_id)`, extendiendo el del Paso 4:

```
copia de la plantilla → tokens fijos → expandirCampanias → reporte final
```

El reporte final lleva: tokens fijos resueltos, campañas emitidas con su ventana, campañas
excluidas con el motivo, y los `«FALTA:token»`.

**Dónde queda el archivo:** en la carpeta de salidas. **Nada de este paso escribe dentro de
la carpeta del motor ni la recorre** — ahí vive la planilla de control y una subcarpeta
`_Back up archivo` con respaldos manuales, y un respaldo pisado no se recupera.

---

## Parte D — Prueba

Ítem de menú **"Generar informe completo"**. Correr `jm` de punta a punta y verificar:

- los tokens fijos con valores reales;
- una slide por cada campaña seleccionada, **cada una con su propia ventana** — no con la
  del informe;
- las campañas excluidas listadas con su motivo;
- el reporte de ⚠ vacío o con motivos claros.

**Sobre correr `secco`:** el original lo pedía en la misma prueba. Hacerlo sólo si el
Tramo 3 ya empezó; si no, es el segundo informe y su corrida **es la medición de `D-01`**,
que merece su propio paso y su propio conteo de líneas.

Este paso deja el **motor headless completo**: dado un `informe_id`, genera el Slides final
leyendo todo desde las hojas de registro. Después vienen el panel y la automatización.

---

## Qué NO hacer

- No emitir una campaña sin `periodo_id` (`D-19`).
- No usar la ventana del informe para una campaña que tiene la suya.
- No escribir dentro de la carpeta del motor.
- No tocar `Marcadores.gs`.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
