# R-09 y R-10 — para agregar a `docs/REGLAS_NEGOCIO.md`

> Verificadas contra las cuatro bases del 31/07.
> Numeración continúa a R-05 (JM/GCBA), R-06 (el id manda), R-07 (`fecha_corte`),
> R-08 (el vínculo reunión↔cuenta es curado). **Trabajamos en español.**

---

## R-09 · Lo cancelado no entra al informe

### El hecho

Las filas de reuniones que no se hicieron **conservan las métricas de la convocatoria**.
Medido en `rdv/RVD JM-CM - ES`:

```
Realizada               653
Suspendida               58
en agenda                 6
Reprogramada              2
Se modifico el barrio     1

→ 34 de las 61 filas no-realizadas tienen Inscriptos o Asistentes distintos de cero
```

Ejemplos: Jorge Macri 26/07/2025 suspendida con 62 inscriptos; Clara Muzzio 12/08/2025
suspendida con 49. Tiene sentido — la gente se inscribió y después se suspendió el
encuentro. Pero una `SUMA` sobre `rdv` sin filtrar por estado **suma 34 convocatorias a
encuentros que nunca pasaron**, y devuelve un total plausible.

### La regla

**Sólo entra al informe lo que efectivamente ocurrió.** El filtro por estado es
obligatorio y va *antes* de cualquier agregación, no después.

### El vocabulario no es el mismo en cada base

Esta es la parte que hay que escribir, porque no se puede adivinar:

| base · solapa | columna | entra | no entra | ambiguo → decide la persona |
|---|---|---|---|---|
| `rdv/RVD JM-CM - ES` | `STATUS REUNIÓN` | `Realizada` | `Suspendida`, `en agenda` | `Reprogramada`, `Se modifico el barrio` |
| `digital/Digital` | `Estado` | `Finalizada`, `Activa` | `De baja` | `Pausada`, `Stand by`, `Pendiente` |
| `digital/Directa Mail` | `Estado` | `Implementado` | `Proyectado` | `En curso` |
| `digital/Directa IVR` | `Estado` | `Implementado` | — | — |
| `looker/resumen_metricas_dinamico` | `estado` | `Finalizada`, `Activa` | — | **no tiene estado de cancelación** |

**Consecuencia sobre `looker`:** su columna `estado` sólo distingue `Finalizada`/`Activa`.
No puede detectar una campaña dada de baja. Si `looker` se usa como control cruzado —como
en el caso V-20— hay que saber que **no filtra lo cancelado** y que una divergencia contra
`digital` puede ser eso y no un error.

### La distinción que importa: se cancela la unidad, no la fila

`Directa Mail` tiene `Tipo de mail = 'Cancelación'` (15 filas) y `'Reprogramación'` (9).
**Esas filas no son filas canceladas: son envíos reales, que salieron, con métricas
reales.** Es el mail que avisa que el encuentro se cancela.

El caso concreto:

```
cuenta 3347-JULJDGAG — "Te Cuento Bs As 21/7 Orden Público Eje Norte"
   17/07 · Estado='Implementado' · Tipo='Cancelación' · Enviados=110 · Aperturas=31
```

**Esa cuenta no tiene ninguna marca de cancelada.** `Estado` dice `Implementado`, que es lo
correcto: el mail se implementó. Lo que se canceló es el **encuentro del 21/07**, que no
existe como fila en ningún lado — se movió al 28/07 y ahí nació la cuenta `3387-JULJDGGC`.

De ahí la formulación precisa:

> La cancelación aplica a la **unidad de informe** (la reunión, la campaña), no a la fila
> de datos. Una cuenta cuyo último envío es de tipo `Cancelación` o `Reprogramación` es
> **candidata a excluir**, y la señal es indirecta: hay que mirar el envío, no el estado.

### Tarea asociada

En el match por confianza (R-08), un candidato cuyo último envío sea `Cancelación` o
`Reprogramación`:

1. **nunca se auto-selecciona**, aunque gane por similitud;
2. se muestra en la lista con la marca visible y el motivo;
3. si la persona lo elige igual, se registra el porqué en `REUNIONES.notas`.

Sin esto, `3347` y `3387` son indistinguibles por nombre y el auto-pick puede tomar el
cancelado con total naturalidad.

---

## R-10 · Los encabezados se normalizan por espacios, nunca por mayúsculas

### El hecho, en dos partes

**Parte 1 — hay encabezados con salto de línea adentro.** Doce en las cuatro bases, y seis
están en `digital/Directa IVR`, que es solapa fuente de los casos V-16 a V-19:

```
digital/Directa IVR   'Llamados\nRealizados'   'Llamados\nAtendidos'
                      'Escucharon\n +75%'      '%\nAtendidos'
                      '%\n+75%'                '%\nMarque 1'
looker/IVR            'Llamados\nRealizados'   'Llamados\nAtendidos'  'Escucharon\n +75%'
rdv/Visualiz_*        'Tipo respuesta\nCampaña'   '% \nEntregados'
```

`casos_validacion_2026-07-31.csv` los escribe como `Llamados Realizados`,
`Escucharon +75%`. **Un match literal falla en los cuatro casos de IVR.** Y `'Escucharon\n
+75%'` tiene un espacio *después* del salto: reemplazar `\n` por espacio da
`Escucharon  +75%`, con dos espacios, que tampoco matchea.

Además hay 21 encabezados con espacio sobrante: `'Masculinos '` en cinco solapas de `rdv`
—incluida la solapa fuente `RVD JM-CM - ES`—, `'Asunto '` en `m2/M2 Directa`,
`'Equipo  solicitante'` con doble espacio.

**Parte 2 — y por eso no se puede normalizar mayúsculas.** Quince pares de encabezados
colisionan si se pliega el case. Tres están en solapa fuente activa:

```
digital/CAMPAÑAS_DESGLOCE_DIGITAL   'Nombre Campaña' vs 'nombre_campaña'
                                    'Eje'            vs 'eje'
                                    'Estado'         vs 'estado'
```

Son **columnas distintas con contenido distinto** en la misma solapa. Bajar todo a
minúsculas las colapsa y `buscarMapeo` devuelve la primera que encuentra — sin error.
Exactamente el modo de falla caro.

Hay además cuatro casos de **duplicado exacto**, que ninguna normalización arregla:
`looker/URLs` tiene `id_cuentas` dos veces y `nombre_campaña` dos veces;
`digital/RDV JM 2 VECES` e `digital/INFORME` tienen `Clics` dos veces.

### La regla

Al leer un encabezado, aplicar **exactamente** esto y nada más:

```
normalizar(h) = colapsar(/\s+/ → ' ', h).trim()
```

- Colapsa saltos de línea, tabs, espacios dobles y espacios en los bordes.
- **Preserva mayúsculas, acentos y guiones bajos.** `Eje` y `eje` siguen siendo distintos.
- Se aplica a los dos lados: al encabezado leído y al valor de `MAPEO`.

### Tarea asociada

1. Aplicar `normalizar()` en `Fuentes.gs` donde hoy se hace `trim()` sobre encabezados, y
   en `buscarMapeo()`.
2. **Guardar la firma con el encabezado crudo**, no el normalizado. `SOLAPAS.firma_encabezado`
   existe para detectar que un tercero cambió una columna; si guarda el normalizado, pierde
   los cambios de espaciado, que son justamente los que rompen.
3. Agregar al diagnóstico un control de **encabezados duplicados tras normalizar**, por
   solapa. Hoy hay cuatro casos reales; que aparezcan como ⚠ y no como una columna elegida
   al azar.
4. Corregir la traza de `casos_validacion_2026-07-31.csv` o —mejor— dejarla como está y que
   la normalización la resuelva. Es el primer test de que R-10 funciona: si V-16 a V-19 dan
   ✅ sin tocar el CSV, la regla está bien implementada.
