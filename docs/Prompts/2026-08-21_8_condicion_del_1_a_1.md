# 2026-08-21_8 — `tipo` viaja con el ítem: el habilitador de la condición del 1 a 1

> **Estado:** Parte 0 y A ejecutadas · **subagente:** ninguno
>
> **Objetivo único:** que el `tipo` de una reunión llegue al generador, que es la pieza sin la
> cual **ninguna** de las formas posibles de la condición del 1 a 1 puede funcionar.
>
> Sale de la decisión del usuario del 21/08: *"es en vez del iceberg; es una condición del 1 a 1
> que lleva la nueva en vez del iceberg, las otras van con iceberg."*

---

## Parte 0 — medido

**Tres piezas separan el estado de hoy de la condición pedida, y sólo la primera se hace acá.**

**1 · ⭐ `tipo` se perdía entre la hoja y el generador.** `leerReuniones_` devuelve la fila entera
de `REUNIONES` —`tipo` incluido—, pero `anclarEncuentrosSinCache_` recortaba el ítem a seis campos:
`reunion`, `fecha`, `etapa`, `idCuenta`, `score`, `registroDigital`, `candidatoNombre`.

⚠ **Y `filtrarItemsPorSeccion_` lee los atributos con `e[campo]` sobre ese mismo objeto**, así que
un `SECCIONES.filtro = tipo=Uno a uno` leía `undefined` y **no matcheaba ninguna fila, sin fallar**.
La sección habría emitido **cero ítems** — el modo de falla de siempre.

**2 · El generador no lee `LAMINAS` en absoluto.** Medido: los únicos lectores de la hoja son
`Auditoria.gs` (el censo) y `Sellador.gs` (el sellado). **`Generador.gs` no la menciona.**

**3 · ⭐ `LAMINAS.filtro` ya existe y nadie lo usa.** La columna está en el esquema desde el `_11`,
y el seed declara qué significa vacío: *"`seccion_id`, `modo`, `itera_sobre` y `filtro` vacíos
significan **hereda de `SECCIONES`**"*. **Es el casillero diseñado para exactamente esto.**

---

## Parte A — hecho

`tipo: reunion.tipo` en el ítem que arma el anclaje.

⚠ **Se agrega `tipo` y nada más.** Copiar la fila entera sería más simple y es peor: `asignaciones`
viaja a `PropertiesService` en la corrida desatendida (`2026-08-20_10`), y engordar el ítem con diez
columnas que nadie pidió agranda un estado que tiene tope de tamaño.

## Parte B — hecho

**`tools/probar-tipo-en-item.js`, 10 afirmaciones.** No mira sólo que el campo exista: **mira que el
filtro matchee**, que son dos afirmaciones distintas y la segunda es la que importa. Incluye el
filtro complementario —sin él, uno que devolviera siempre un ítem pasaría igual— y **la rotura a
propósito**: con el ítem viejo, el filtro deja **0 de 2**.

---

## ⏸ Lo que queda, y necesita una decisión antes del código

**La condición pedida tiene dos formas posibles y dan decks distintos.** Con `tipo` ya viajando, las
dos son implementables; lo que falta es elegir.

**Forma A — por sección.** Dos secciones hermanas con `padre = encuentro`:
`encuentro_iceberg` con `filtro = tipo!=Uno a uno` y una nueva con `filtro = tipo=Uno a uno`.
**No toca el generador**: `SECCIONES.filtro` ya funciona. ⚠ Pero las dos son `modo = unica`, y una
sección `unica` **no se emite por ítem** — se resuelve una vez en la etapa 4. Sirve si hay **un solo**
1 a 1 por semana, que es el caso de hoy.

**Forma B — por lámina.** `LAMINAS.filtro` en `L-053` y en la del iceberg, y el bloque repetible
elige qué lámina entra **para cada ítem**. Es la forma general y la que el esquema anticipa.
⚠ **Exige que el generador lea `LAMINAS`**, que es la Parte A del `2026-08-21_4` y arrastra la
decisión sobre qué significa `seccion_id` vacío.

⛔ **No se elige acá.**

## Lo que este prompt **no** hace

- ⛔ No crea ninguna sección ni escribe `LAMINAS`.
- ⛔ No hace que el generador lea `LAMINAS`.
- ⛔ No cablea ningún `u1_`.
