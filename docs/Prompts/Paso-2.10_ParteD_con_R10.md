# Paso 2.10 — R-10 en código + Parte D (hoja `VALIDACION`)

> Destino: `docs/Prompts/Paso-2.10_ParteD_con_R10.md`
> Corre **después** de las Partes B y C. Reemplaza a la Parte D del prompt original,
> a la que le antepone la implementación de R-10 porque D depende de ella.
> Entradas: `docs/REGLAS_NEGOCIO.md` R-10, `docs/casos_validacion_2026-07-31.csv`,
> `docs/VALIDACION_2026-07-31.md`.
> **Trabajamos en español.** Un commit por parte.

---

## Por qué R-10 va antes que D

Cuatro de los 48 casos leen `digital/Directa IVR`, cuyos encabezados reales traen **salto
de línea adentro**:

```
'Llamados\nRealizados'   'Llamados\nAtendidos'   'Escucharon\n +75%'
'%\nAtendidos'           '%\n+75%'               '%\nMarque 1'
```

El CSV los escribe `Llamados Realizados`, `Escucharon +75%`. Sin `normalizar()`, los casos
**V-16 a V-19 fallan por el encabezado, no por el dato**, y quien mire el ❌ va a
diagnosticar un problema de lectura que no existe.

---

## Parte R-10 — `normalizar()` de encabezados

### La función

```
normalizar(h) = String(h).replace(/\s+/g, ' ').trim()
```

Colapsa saltos de línea, tabs, espacios dobles y bordes.
**Preserva mayúsculas, acentos y guiones bajos.** No hacer `toLowerCase()`.

### Por qué no se pliega el case

Quince pares de encabezados colisionan si se baja a minúsculas. Tres están en solapa fuente
activa, la de los casos V-21 a V-26:

```
digital/CAMPAÑAS_DESGLOCE_DIGITAL   'Nombre Campaña' vs 'nombre_campaña'
                                    'Eje'            vs 'eje'
                                    'Estado'         vs 'estado'
```

Son columnas distintas con contenido distinto. Plegarlas colapsa dos en una y `buscarMapeo`
devuelve la primera **sin error**.

### Tareas

1. Escribir `normalizar_()` en `Fuentes.gs`. Grep antes de nombrarla (namespace global de
   Apps Script).
2. Aplicarla en los dos lados: al encabezado leído de la hoja y al valor de `MAPEO`, en
   `leerFuente` y en `buscarMapeo()`. Reemplaza los `trim()` que hoy se hacen sobre
   encabezados — no se agrega encima.
3. **`SOLAPAS.firma_encabezado` guarda el encabezado CRUDO**, no el normalizado. La firma
   existe para detectar que un tercero cambió una columna; si guarda el normalizado pierde
   justo los cambios de espaciado, que son los que rompen.
4. Agregar al diagnóstico un control de **encabezados duplicados tras normalizar**, por
   solapa, con ⚠. Hoy hay cuatro casos reales de duplicado exacto que ninguna normalización
   arregla: `looker/URLs` tiene `id_cuentas` dos veces y `nombre_campaña` dos veces;
   `digital/RDV JM 2 VECES` e `digital/INFORME` tienen `Clics` dos veces.

### Criterio de aceptación

**No editar `casos_validacion_2026-07-31.csv`.** Si V-16 a V-19 dan ✅ con el CSV tal como
está, R-10 quedó bien. Si hay que tocar el CSV para que pasen, la normalización quedó floja.

---

## Parte D — La hoja `VALIDACION`

Sin esto, cada corrección posterior es una opinión.

### Esquema

| columna | contenido |
|---|---|
| `caso_id` | `V-01`…`V-37`, `D-01`…`D-06`, `X-01`…`X-05` |
| `bloque` | agrupador (`et_orden_publico_2807`, `camp_cadetes`, …) |
| `token` | token propuesto |
| `esperado` | valor del informe publicado del 31/07 |
| `base`, `solapa`, `clave`, `columna`, `operacion` | la traza |
| `estado_esperado` | `exacto` / `deriva` / `sin_fuente` |
| `obtenido`, `delta`, `resultado`, `nota` | los escribe el motor |

### Tareas

1. Crear la hoja en `HOJAS_CONFIG_` y **sembrarla desde el CSV**, no transcribir valores a
   mano.
2. `menuCorrerValidacion_()`: por cada fila con `estado_esperado != 'sin_fuente'`, resolver
   la traza, escribir `obtenido` / `delta` / `resultado`, y mostrar `N ✅ · N ⚠ · N ❌`.
3. Semántica de `resultado`:
   - `exacto` → ✅ sólo si `delta == 0`. Cualquier otra cosa es ❌.
   - `deriva` → ✅ si `delta >= 0`; ⚠ si `delta < 0`.
   - `sin_fuente` → no se corre; se reporta aparte como pendiente.

### Cómo se resuelve la traza, por bloque

Los 48 casos usan cuatro formas. Están todas verificadas contra las bases del 31/07:

| bloque | mecánica | verificado |
|---|---|---|
| V-01…V-11, V-33…V-37 | `rdv/RVD JM-CM - ES`, **una fila** por `Figura`+`EVENTO`+`FECHA`, columna directa | ✅ |
| V-12…V-15, V-27…V-32 | `digital/Directa Mail`, **una fila** por `ID Cuentas`+`Fecha envio` | ✅ |
| V-16…V-19 | `digital/Directa IVR`, **SUMA de 2 filas** por `ID cuentas` | ✅ |
| V-20 | `looker/resumen_metricas_dinamico`, una fila por `id_cuentas` — control cruzado de V-16 | ✅ |
| V-21…V-26 | `digital/CAMPAÑAS_DESGLOCE_DIGITAL`, SUMA por `Id cuentas`+`Plataforma` | ✅ |
| D-01…D-06 | `looker/resumen_metricas_dinamico`, una fila por `id_cuentas` | ✅ |

### Tres cosas que van a aparecer y no son bugs

**1. `D-05` va a dar ⚠, y está bien.** Medido sobre la base del 31/07:

```
caso   columna                informe      base      delta
D-01   call_enviado             8.255     8.978      +723
D-02   call_discado             7.232     7.954      +722
D-03   call_contactados         1.901     2.169      +268
D-04   call_efectivos           1.514     1.766      +252
D-05   digital_impresiones  2.295.332 2.293.619    −1.713   ← baja
D-06   meta_alcance            65.576    66.345      +769
```

Cinco suben —las campañas siguieron corriendo entre el armado y la descarga— pero
**`digital_impresiones` baja**. Las plataformas reexpresan y deduplican impresiones hacia
atrás. `VALIDACION_2026-07-31 §C-1` dice que todas las diferencias van en la misma
dirección; con seis casos medidos, **no es cierto para digital**.

No cambiar la regla: ⚠ es la respuesta correcta, porque "la base tiene menos" merece que
alguien mire. Escribir en `nota` de D-05 que la baja está medida y explicada, para que el
amarillo no se lea como regresión.

**2. `V-30` matchea por nombre, y contradice R-06 a propósito.** Su clave es
`Nombre campaña=Operativo Saturación…` en vez de `ID Cuentas`, porque **esa fila —215.240
mails, el envío más grande de la campaña— tiene `ID Cuentas = "Pieza"`** (`VALIDACION`
C-2 Caso A). Es una excepción documentada a R-06, no un descuido. Dejarla como está y
anotarlo en `nota`: si algún día corrigen la fila en origen, V-30 pasa a clave por id.

**3. Dos tokens tienen nombre engañoso.** `enc_or` = 4.652 es la columna `Aperturas`, un
conteo, no una tasa. `enc_ctor` = 145 es `Clics`. Los nombres vienen de la plantilla y se
respetan; no renombrarlos en este paso, pero que quede en `nota` para que nadie los divida
por nada.

### Criterio de aceptación

`menuCorrerValidacion_()` corre entera sin excepciones y reporta:

- **37 de 37 casos `exacto` en ✅.** El original pedía 30; están los 37 verificados contra
  las bases, así que menos de 37 es un hallazgo y hay que documentar cuál falló y por qué.
  Ninguno se borra de la hoja.
- **5 ✅ y 1 ⚠ en los `deriva`**, siendo el ⚠ exactamente D-05.
- Los 5 casos `X-*` reportados aparte como pendientes, sin correr.
