# Paso 1.9 — MAPEO completo + columnas `fila_encabezado` / `modo_periodo` en BASES

> **Regla de oro:** este paso NO calcula nada y NO lee bases en vivo. Solo amplía el
> esquema de `BASES` y completa las filas semilla de `MAPEO`.
>
> **Va después del Paso 1.8 y antes del Paso 2.** El Paso 2 (lectura con ventana de
> fechas) depende de las dos cosas que se arreglan acá.
>
> **Un commit por parte** (regla instaurada en el Paso 1.8).

---

## Por qué hace falta

Revisando `Instalar.gs` contra el diseño aparecieron dos huecos:

1. **`SEED_MAPEO_` está incompleto.** Las dos filas de `rdv` tienen `columna: ''`
   ("verificar col real") y **`looker` no está sembrado**. El relevamiento completo de
   las 4 bases ya existe en `docs/MAPEO_completo.md` (28/07) — falta bajarlo al código.
2. **`BASES` no tiene `fila_encabezado` ni `modo_periodo`.** Sus headers hoy son
   `base_id | nombre | sheet_id | hoja_default | tipo | activo | notas`. M2 necesita
   `fila_encabezado=3` y `modo_periodo=snapshot`; sin eso el Paso 2 va a leer la fila 3
   de M2 como si fuera un dato más y a intentar filtrar por fecha una hoja que ya viene
   filtrada.

---

## Parte A — Ampliar el esquema de `BASES`

Agregá a `HOJAS_CONFIG_.BASES.headers` las columnas **`fila_encabezado`** y
**`modo_periodo`**, ubicadas después de `hoja_default`:

```
base_id | nombre | sheet_id | hoja_default | fila_encabezado | modo_periodo | tipo | activo | notas
```

**Insertalas de forma idempotente sobre hojas ya instaladas**, con el mismo mecanismo
que usó el Paso 0.5 para `periodo_ref` / `desde` / `hasta` (`asegurarColumna_`): si la
hoja `BASES` ya existe con el esquema viejo, insertá las columnas en su posición **sin
tocar las filas cargadas**.

Semántica:
- **`fila_encabezado`**: número de fila donde están los headers. Default `1`.
- **`modo_periodo`**: `filtrar` (el motor filtra por ventana de fechas) o `snapshot`
  (la hoja ya viene acotada al período; se lee entera). Default `filtrar`.

**Actualizá también `SEED_BASES_`** con los dos campos nuevos. Esto es importante:
`upsertPorClave_` arma la fila con `headers.map(h => (h in obj) ? obj[h] : '')`, así que
si los objetos semilla no traen las claves nuevas, **las va a escribir vacías**.

| base_id | hoja_default | fila_encabezado | modo_periodo |
|---|---|---|---|
| rdv | RVD JM-CM - ES | 1 | filtrar |
| digital | Digital | 1 | filtrar |
| looker | resumen_metricas | 1 | filtrar |
| m2 | M2 periodo DIRECTA | **3** | **snapshot** |
| miba | *(vacío)* | 1 | filtrar |

> Aprovechá y corregí `HOJAS_CONFIG_.BASES.ejemplos`, donde `m2` todavía tiene
> `hoja_default: '(a confirmar)'` — ya está confirmada: `M2 periodo DIRECTA`.

→ **Commit A:** `Paso 1.9 ✅ — BASES: columnas fila_encabezado y modo_periodo`

---

## Parte B — Completar `SEED_MAPEO_`

### ⚠ Convención de `campo_logico` — leer antes de escribir

En `MARCADORES` el esquema es `marcador | familia | informe_id | base_id |
campo_logico | …` y los ejemplos ya cargados son:

```
marcador='ecv_inscriptos'  familia='ecv'  base_id='rdv'  campo_logico='inscriptos'
```

O sea: **el prefijo de familia vive en `marcador`, NO en `campo_logico`.** El
`campo_logico` es el nombre pelado del campo dentro de esa base. `docs/MAPEO_completo.md`
lo escribió con prefijo (`ecv_inscriptos`) porque venía de la vista de tokens; **acá va
sin prefijo**, para no duplicar las filas `rdv/inscriptos` que el seed ya crea.

Recordá que la clave del upsert es `(base_id, campo_logico)`, así que un mismo nombre
puede repetirse entre bases distintas (`m2/campana` y `looker/campana` conviven bien).

### Reemplazá el array `SEED_MAPEO_` por:

**`rdv`** — hoja `RVD JM-CM - ES` (esto resuelve las dos filas pendientes):

| campo_logico | columna | notas |
|---|---|---|
| figura | A | filtro por figura |
| barrio | B | |
| evento | C | |
| fecha | E | **filtro de período** |
| status | I | filtro (Realizada) |
| inscriptos | K | (resuelto) |
| insc_mail | L | |
| insc_cc | M | |
| insc_ivr | N | |
| insc_digital | O | header real "RRSS" — duda resuelta |
| insc_dif | P | |
| asistentes | Q | |
| comuna | AA | |
| poblacion | AB | habitantes |

**`looker`** — hoja `resumen_metricas` (una fila por campaña; los prefijos acá son de
**canal**, no de familia de token):

| campo_logico | columna | | campo_logico | columna |
|---|---|---|---|---|
| campana | B | | cc_contactados | T |
| fecha_inicio | C | | cc_efectivos | U |
| fecha_fin | D | | ivr_audiencia | V |
| eje | E | | ivr_atendidos | X |
| area | F | | ivr_escucha75 | Y |
| estado | G | | ivr_marque1 | Z |
| dig_impresiones | H | | sms_enviados | AA |
| dig_visualizaciones | I | | sms_entregados | AB |
| dig_clics | J | | mail_enviados | N |
| alcance | K | | mail_entregados | O |
| frecuencia | M | | mail_aperturas | P |
| | | | mail_clics | Q |

**`m2`** — dejá las 14 filas que ya están (DIRECTA: campana B, fecha C, envios D,
entregados E, aperturas F, or G, clics H, ctor I · DIGITAL: campana_dig B,
impresiones F, alcance_dig G, views I, clics_dig K) y **agregá** `estado` → col `E`
de `M2 periodo DIGITAL`.

**`digital` (Seguimiento Digital)** — **NO lo siembres.** Ver la nota de abajo.

### Ajuste en el resumen final

`seedConfiguracion()` hoy lista como "pendientes de confirmar" las filas con `columna`
vacía. Con este cambio no debería quedar ninguna: verificá que el alert salga **sin la
sección ⚠**.

→ **Commit B:** `Paso 1.9 ✅ — MAPEO completo (rdv + looker + m2)`

---

## Prueba del usuario

1. `clasp push` → menú → **"Instalar / reparar hojas"** (para que aparezcan las
   columnas nuevas de `BASES` sin perder lo cargado).
2. Menú → **"Cargar config inicial"**.
3. En `BASES`: verificar `fila_encabezado` / `modo_periodo`, y que `m2` diga `3` /
   `snapshot`. Confirmar que **no se borró** ningún `sheet_id` ya cargado.
4. En `MAPEO`: verificar 14 filas de `rdv` (con `inscriptos`=K y `fecha`=E, ya sin
   "verificar col real"), 23 de `looker` y 15 de `m2`.
5. El alert final **no** debe mostrar la sección ⚠ de pendientes.
6. Correr **"Cargar config inicial" de nuevo**: no se duplican filas (upsert idempotente).

---

## Decisión que sigue abierta (NO la resuelvas vos)

**Looker vs. Seguimiento Digital como fuente de verdad digital/directa.** Las dos
cubren lo mismo y ambas están relevadas en `docs/MAPEO_completo.md`.

Por eso este paso siembra **solo Looker**: no por descarte técnico, sino para no
sembrar dos fuentes equivalentes antes de que exista la decisión. Mapear ambas en
`MAPEO` no generaría "doble verdad" —`MAPEO` es solo lookup físico
`campo_logico → columna`— pero sí ruido innecesario. La canonicidad se define en
`MARCADORES`, al decidir qué `base_id` alimenta cada token: **eso es el Paso 3**.

Argumento a favor de Looker: viene consolidado por campaña en una sola hoja, que calza
con el modelo "una fila por campaña → `camp_*`". Seguimiento Digital da más detalle por
canal, pero son 5 hojas y más joins. **La decisión es del usuario** — preguntala al
arrancar el Paso 3, y si elige Seguimiento Digital, el apéndice de
`docs/MAPEO_completo.md` ya tiene las columnas listas para sembrar.
