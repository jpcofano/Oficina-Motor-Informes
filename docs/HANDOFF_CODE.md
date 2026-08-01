# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-01 (lote nocturno) · último commit al escribirlo: `45fe14e`

## Dónde estamos

**C.2-2 a C.2-6 implementadas y pusheadas. Ninguna probada contra la planilla.**
Lote encadenado, un commit por parte: `63095d9` (C.2-2), `3401861` (C.2-3), `f0d12ea`
(C.2-5), `d561b6d` (C.2-4), `45fe14e` (C.2-6). `clasp push` hecho, así que la planilla ya
tiene el código nuevo. El árbol de trabajo queda limpio.

Con esto el diff pasa de "funciona" a "dice qué miró": cabecera de corrida y bloque de
alcance, migraciones adentro del diff, `solo_en_hoja`, protegidas que dicen qué se
saltearon, y resumen desagregado.

## Qué quedó hecho y qué no

| parte | estado | nota |
|---|---|---|
| C.2-2 cabecera + alcance | hecha | el bloque nombra **diez** hojas, no nueve: las del prompt + `MARCADORES` |
| C.2-3 migraciones por el diff | hecha | cada migración acepta `aplicar=false` para que "Estado" las vea sin aplicarlas |
| C.2-5 `solo_en_hoja` | hecha | reporta, nunca borra |
| C.2-4 protegidas con diferencia | hecha | la protegida **sin** diferencia también emite línea, explícita |
| C.2-6 resumen desagregado | hecha | más `otras líneas (sin categoría)`, que el prompt no pedía |
| **C.2-7 documentación + snapshots** | **NO hecha** | `docs/_snapshots/` nunca existió en el repo. Es lo único del prompt que queda |

**Nada quedó bloqueado por falta de decisión.** Las cuatro desviaciones respecto del texto
del prompt están en el addendum 3 de `docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md`.

## Por qué hay controles positivos, y qué prueban

**El protocolo de siete pasos pasa igual aunque las cinco partes estén mal
implementadas**: cero cambios sigue siendo cero cambios. Por eso cada parte tiene su
`probar_*()` en `Pruebas.gs` (archivo nuevo): alimenta la función con hojas sintéticas
(`hojaFalsa_`), introduce una discrepancia conocida y afirma que se detecta. No tocan la
planilla, así que no hay nada que revertir.

Verificado además por **mutación** (fuera de la planilla, con node): se rompió cada
función a propósito —incluido reintroducir el bug original de cada parte— y los controles
cazaron **18 de 18** roturas. Un control que pasa siempre no distingue "anda" de "no miré".

## Protocolo para mañana — paso por paso

Nombres verificados contra el `MENU_` actual de `Codigo.gs`. Menú raíz: **▶ Motor de
Informes**.

### 0 · Limpiar las filas de prueba que quedaron del protocolo anterior

Siguen en la planilla desde la corrida del 31/07. **Leer antes de ejecutar**: una de las
tres no se restaura, se borra.

| qué | acción |
|---|---|
| `SOLAPAS`, fila `zz_prueba` | **borrar** |
| `MAPEO`, fila `zz_prueba` | **borrar** |
| `MAPEO`, fila `ahhh / cc / cdcdd` | **borrar, NO restaurar** |

La clave de `MAPEO` es el trío `(base_id, solapa, campo_logico)`. Al editar `solapa` a
`ahhh`, la clave original `(m2, M2 periodo DIRECTA, or)` desapareció y **el seed ya la
volvió a crear**. Restaurar la fila `ahhh` a esos valores dejaría dos filas con el mismo
trío — el duplicado que la clave compuesta del Paso 2.3.2 existe para evitar. Confirmar
antes que la fila re-creada está: `m2 | M2 periodo DIRECTA | or | M2 periodo DIRECTA | G`,
notas vacías (`SEED_MAPEO_`, `Instalar.gs:629`).

### 1 · Diagnóstico → **"Correr pruebas del diff"**

Es lo primero porque no toca nada y valida el instrumento antes de usarlo.

> **Esperado:** las cinco pruebas ✅ y "Las 5 pruebas pasaron". Cualquier ❌ nombra la
> parte y qué se esperaba — si aparece, **parar acá**: el resto del protocolo mide con un
> instrumento roto.

### 2 · Configuración → **"Estado de configuración"** (sólo lectura, antes de tocar nada)

> **Esperado:** la hoja `ESTADO_CONFIGURACION` ahora arranca con **cabecera de corrida**
> (`ejecutado_por = menuEstadoConfiguracion_`, `fecha_hora` de ahora) y un **bloque
> ALCANCE con diez filas**, una por hoja de registro. `MARCADORES` tiene que decir
> `auditada = no` con motivo `sin sembrador`. `CAMPANAS` y `REUNIONES`, `no` con
> "excluida a propósito". Las otras siete, `sí`, con `filas_en_hoja` y `filas_en_seed`.
> En el resumen aparece una línea nueva: **"Migraciones pendientes … 0 celda(s)"** — si da
> distinto de cero, anotar cuáles (son migraciones que el apply va a escribir).

### 3 · Control positivo — las cinco ediciones a mano

Sin esto, "cero discrepancias" en el paso 5 no distingue *no hay problema* de *no miré*.
Después de limpiar el paso 0, volver a introducirlas:

1. `BASES` · `m2.hoja_default` → `Cuentas M2`
2. `MAPEO` · fila `m2 | M2 periodo DIRECTA | or`: `solapa` → `ahhh`, `hoja` → `cc`,
   `notas` → `cdcdd`
3. `SOLAPAS` · `rdv||RDV CONJUNTO`, `uso`: `revisar` → `ignorar` (es `origen=manual`)
4. `MAPEO` · fila nueva `zz_prueba | hoja inventada | zz_borrar | … | A | texto`
5. `SOLAPAS` · fila nueva `zz_prueba | hoja inventada | revisar | seed`

**Para el bloque de alcance hace falta además desalinear una hoja**, porque con todo
alineado el bloque se ve igual esté bien o mal: la edición 2 ya sirve — deja `MAPEO` con
una fila de menos respecto del seed y una huérfana, así que `filas_en_hoja` y
`filas_en_seed` tienen que diferir en esa fila.

Correr **"Estado de configuración"**.

> **Esperado, y esto es lo que hay que mirar de verdad:**
> - `BASES` reporta `m2 · hoja_default · Cuentas M2 → (vacío)`.
> - `MAPEO` reporta `m2||M2 periodo DIRECTA||or` como **falta en la planilla**.
> - **Nuevo (C.2-5):** `m2||ahhh||or` y `zz_prueba||hoja inventada||zz_borrar` salen como
>   **`solo_en_hoja`**, con la fila donde están y "(no está en el seed — no se toca)".
>   Antes no aparecían: la fila `ahhh` sobrevivió tres corridas sin que nadie la nombrara.
> - **Nuevo (C.2-4):** `rdv||RDV CONJUNTO` sale como
>   **`protegida (habría cambiado)`** con `uso · ignorar → revisar (no aplicado:
>   origen=manual)`. Las protegidas que ya coinciden con el seed salen como
>   **`protegida (sin diferencias)`** — antes las diez salían con las celdas vacías y no se
>   sabía cuál era cuál.

### 4 · Configuración → **"Aplicar configuración"**

> **Esperado:** el `alert()` ya no dice un solo total. Dice
> `cambiadas: N · agregadas: N · migraciones: N · solo_en_hoja: N · protegidas (con
> diferencia): N · protegidas (sin diferencia): N · sin cambios: sí/no`.
> Las tres ediciones de filas existentes se revierten y se reportan; las dos claves
> inventadas **siguen en la hoja** y siguen saliendo como `solo_en_hoja`.
> En `DIFF_CONFIGURACION`: cabecera con `ejecutado_por = menuAplicarConfiguracion_`, bloque
> ALCANCE de diez filas, y el detalle abajo.

### 5 · Configuración → **"Aplicar configuración"** otra vez, sin tocar nada

> **Esperado (es el criterio de idempotencia, el que más importa):**
> `cambiadas: 0 · agregadas: 0 · migraciones: 0 · sin cambios: sí`.
> `solo_en_hoja: 2` **sí puede seguir apareciendo** — son las dos claves inventadas, y que
> sigan reportándose es lo correcto: se reportan, no se borran.
> **Si aparece alguna línea de `migracion`, es un hallazgo**: significa que una migración
> vuelve a escribir en cada corrida, que es exactamente el bug que C.2-3 vino a hacer
> visible. Anotar cuál.

### 6 · Configuración → **"Estado de configuración"**

> **Esperado:** cero discrepancias, `migraciones pendientes: 0`, y **consistente con lo que
> acaba de reportar el apply**. Las dos claves inventadas siguen saliendo `solo_en_hoja`.
> Si "Estado" dice cero y un "Aplicar" inmediato cambia algo, es el bloqueante 2 otra vez.

### 7 · Limpiar

Borrar las dos filas `zz_prueba` y la huérfana `ahhh` (mismo criterio del paso 0), y correr
**"Estado de configuración"** una vez más para confirmar que queda en cero.

## Trabado

Nada. Los pendientes abiertos están en `docs/PENDIENTES_consistencia.md`; los dos nuevos de
este lote: **P0 de API executable** (se sirve la versión desplegada, no `HEAD` — con las dos
mitigaciones sin implementar) y **P2 de la convención `probar_*()`**, que el prompt citaba
como `CLAUDE.md` §5 y no está escrita en ningún lado (§5 es Handoffs).

## Qué sigue después de que el protocolo pase

1. **C.2-7** — documentación y `docs/_snapshots/`, lo único que queda del prompt.
2. `Paso-2.12` Parte 2 (las 17 disposiciones de `SOLAPAS.uso`), que ahora sí puede
   apoyarse en lo que reportan las protegidas.
3. `Paso-2.11` Parte D — `BASES.fila_encabezado` vestigial y los dos accesos directos de
   `Union.gs` (H-2), más retirar `reclasificarSolapasM2Invertidas_`.
