# Paso 2.5 — Sembrar `MARCADORES` desde los tokens de las plantillas

> **Regla de oro:** este paso NO calcula nada. Lee los `{{token}}` de las plantillas de
> Slides y escribe filas de config. La aritmética llega en el Paso 3.
>
> **Un commit por parte.**

---

## Por qué

`MARCADORES` tiene hoy 3 filas de ejemplo y necesita ~200 (JM ≈110 tokens, SECCO
similar). Cargarlas a mano es un día de trabajo y propenso a errores de tipeo, que en
este motor no fallan ruidosamente: un token mal escrito simplemente queda sin
reemplazar en el deck.

La plantilla **ya es la fuente de verdad** de qué tokens existen. Este paso invierte el
trabajo: en vez de escribir 200 filas, se revisan 200 filas ya creadas.

**Lo que el helper NO hace:** decidir de dónde sale cada token. `base_id`,
`campo_logico` y `operacion` quedan **vacíos a propósito** — eso es criterio humano y se
completa en el Paso 3. El helper solo garantiza que no falte ni sobre ningún token.

---

## Parte A — `sembrarMarcadoresDesdePlantillas()`

Agregala a `Instalar.gs` (junto a `seedConfiguracion`) y sumala al menú como
**"Sembrar marcadores desde plantillas"**.

1. **Recorré `INFORMES`** (vía `leerInformes()`), tomando las filas con `activo=sí` y
   `plantilla_id` cargado. Si alguna activa no tiene `plantilla_id`, avisá y salteala
   (hay que correr antes "Registrar plantillas").

2. **Por cada plantilla**, abrila con `SlidesApp.openById(plantilla_id)` y extraé
   todos los `{{token}}`:
   - Recorré `getSlides()`, y en cada slide `getShapes()`, `getTables()` (celda por
     celda) y `getGroups()` **recursivamente** — hay tokens dentro de tablas y grupos,
     no solo en cajas sueltas.
   - Sacá el texto con `getText().asString()` y aplicá `/\{\{([^}]+)\}\}/g`.
   - Guardá el **número de slide** (1-based) de la primera aparición.
   - Deduplicá por nombre de token: un token repetido en varias slides es **una sola
     fila** en `MARCADORES`.

3. **Escribí en `MARCADORES`** con `upsertPorClave_`, clave **`(informe_id, marcador)`**.
   Por cada token:

   | columna | valor |
   |---|---|
   | `marcador` | el token sin llaves, p. ej. `ecv_inscriptos` |
   | `familia` | el prefijo hasta el primer `_` (`ecv_inscriptos` → `ecv`). Si no tiene `_`, familia = el token entero (`periodo`, `frecuencia`) |
   | `informe_id` | el `informe_id` de la plantilla |
   | `base_id` | **vacío** |
   | `campo_logico` | **vacío** |
   | `periodo_ref` | **vacío** |
   | `calculo` | **vacío** |
   | `formato` | **vacío** |
   | `notas` | `slide N` (dónde aparece — sirve para el QA) |

   ⚠ **Crítico:** `upsertPorClave_` reescribe la fila entera con
   `headers.map(h => (h in obj) ? obj[h] : '')`. Si un token ya existe y un humano ya
   le cargó `base_id`/`campo_logico`, **el upsert se lo borra**. Modificá el helper (o
   usá una variante) para que, en filas existentes, **solo complete celdas vacías y
   nunca pise valores cargados**. Este paso tiene que poder correrse muchas veces sin
   destruir trabajo manual.

4. **Reporte final** (alert + log):
   - Por informe: tokens encontrados, filas nuevas, filas ya existentes.
   - **Tokens sin `base_id`** (cuántos faltan resolver) — es el marcador de avance real.
   - **Filas huérfanas**: marcadores en la hoja cuyo token **ya no está** en la
     plantilla. **No las borres**: listalas para que el usuario decida (puede ser una
     plantilla que cambió, o un token mal escrito).

→ **Commit A:** `Paso 2.5 ✅ — sembrar MARCADORES desde tokens de plantillas`

---

## Parte B — Reporte de cobertura de configuración

Agregá **"Ver cobertura de configuración"** al menú: recorre `MARCADORES` y muestra,
por informe, cuántos marcadores están **completos** (con `base_id` + `campo_logico` +
`operacion`) y cuántos **pendientes**, con la lista de los primeros ~20 pendientes.

Es el tablero de avance del cableado: al principio va a decir "0 de 110" y el trabajo
del Paso 3 es llevarlo a verde. También sirve para detectar tokens que **nunca** van a
tener fuente (los que se cargan a mano, ver `docs/CONFIG_INFORMES.md`).

→ **Commit B:** `Paso 2.5 ✅ — reporte de cobertura de configuración`

---

## Prueba del usuario

1. Verificar que `INFORMES` tenga `plantilla_id` en `jm` y `secco` (si no, correr antes
   "Registrar plantillas").
2. Menú → **"Sembrar marcadores desde plantillas"**.
3. En `MARCADORES`: deben aparecer ~110 filas de `jm` y las de `secco`, con `familia` y
   `notas` (`slide N`) completos, y `base_id`/`campo_logico` vacíos.
4. **Test de no-destrucción:** completá a mano `base_id=rdv` y `campo_logico=inscriptos`
   en la fila `ecv_inscriptos`, y **volvé a correr el helper**. Esos valores tienen que
   seguir ahí. Si se borraron, el punto 3 de la Parte A está mal implementado.
5. Menú → **"Ver cobertura de configuración"**: debe reportar casi todo pendiente.

---

## Nota sobre los tokens que no salen de una base

Varios tokens son de carga manual o de fuente todavía indefinida (insights, títulos de
campaña, temas de conversación, MiBA). Van a quedar sin `base_id` **para siempre**, y
está bien: el motor los resuelve con `operacion=TEXTO` leyendo un valor cargado a mano.
No los trates como pendientes de cableado. El detalle está en
`docs/CONFIG_INFORMES.md`.
