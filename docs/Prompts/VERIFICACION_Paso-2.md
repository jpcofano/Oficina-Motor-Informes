# VERIFICACIÓN — Paso 2 (lectura con ventana de fechas)

> Ubicación en el repo: `docs/Prompts/VERIFICACION_Paso-2.md`
> El paso no se commitea hasta que **todos** los criterios de aceptación pasan.

---

## 0. Pre-checks (bloquean el paso)

Si alguno falla, el Paso 2 puede "andar" y devolver números mal. Verificar **antes** de
probar nada.

| # | Check | Cómo se verifica | Estado |
|---|---|---|---|
| P1 | `appsscript.json` tiene `"timeZone": "America/Argentina/Buenos_Aires"` | abrir el archivo en el repo | ☐ |
| P2 | `appsscript.json` tiene `oauthScopes` explícitos | ídem | ☐ |
| P3 | `BASES` tiene columna `fila_encabezado` y `m2` dice `3` | abrir la planilla de control | ☐ |
| P4 | `BASES` tiene columna `modo_periodo` y `m2` dice `snapshot` | ídem | ☐ |
| P5 | `MAPEO` tiene fila de columna-fecha para `rdv`, `digital`, `looker` | ídem | ☐ |

**Por qué P1 importa:** sin timezone explícito, el script corre en el timezone por
defecto del proyecto. Las filas del **primer y último día** de la ventana entran o salen
según la hora de carga. El medio de la semana siempre da bien — por eso el bug no se ve
hasta que alguien audita un total.

**Por qué P3/P4 importan:** `m2` se rompe por partida doble. Encabezado en fila 3 (si el
lector asume fila 1, las claves del objeto salen basura y todo marcador de esa base cae
en `«FALTA:token»`) y modo snapshot (si le aplicás ventana de fechas, devuelve 0 filas
sin error).

---

## 1. Contrato de salida del lector

Además de las filas, el lector devuelve un diagnóstico **por base**. Sin esto el paso no
es verificable: "no tiró error" no es lo mismo que "leyó bien".

```
{
  base_id: 'rdv',
  hoja: 'RVD JM-CM - ES',
  modo: 'filtrar',
  fila_encabezado: 1,
  columna_fecha: '<nombre real de la columna>',
  ventana_aplicada: { desde: '...', hasta: '...' },   // null si modo=snapshot
  filas_totales: 0,
  filas_en_ventana: 0,
  filas_sin_fecha: 0,
  filas_fecha_invalida: 0,
  filas: [ ... ]
}
```

Regla: `filas_en_ventana + filas_sin_fecha + filas_fecha_invalida + descartadas_fuera_de_ventana
= filas_totales`. Si no cierra, hay filas desapareciendo en silencio.

Y una función de prueba manual: `probarLecturaPeriodo()` que corra las 4 bases activas y
loguee el diagnóstico de cada una. Es lo que se usa para todo lo de abajo.

---

## 2. Criterios de aceptación

| # | Criterio | Cómo se prueba | Estado |
|---|---|---|---|
| A1 | Las 4 bases activas abren y devuelven diagnóstico | correr `probarLecturaPeriodo()` | ☐ |
| A2 | `miba` se saltea sin romper (`activo=no`) | no aparece en el log, no tira error | ☐ |
| A3 | `filas_en_ventana` de `rdv` coincide con el filtro manual | filtrar la planilla por el mismo rango y contar | ☐ |
| A4 | Ídem `digital` | ídem | ☐ |
| A5 | Ídem `looker` | ídem | ☐ |
| A6 | `m2` devuelve **todas** las filas, `ventana_aplicada=null` | log: `modo=snapshot` | ☐ |
| A7 | `m2` trae los nombres de columna reales (no `Columna1`, no vacíos) | log del primer objeto | ☐ |
| A8 | Los conteos cierran (ver regla en §1) | log | ☐ |
| A9 | Base con hoja inexistente da error claro con `base_id` | cambiar a mano el nombre de hoja en `BASES` y correr | ☐ |
| A10 | Cambiar el período en `CONFIG` cambia los conteos | correr con dos períodos distintos | ☐ |

**A3–A5 son el corazón del paso.** El resto puede pasar con un lector roto; esto no.

---

## 3. Trampas conocidas (revisar en el código, no solo en el output)

**Parseo de fechas.** Sheets devuelve a veces `Date` y a veces string, según cómo esté
formateada la celda. Si cae un string `dd/mm/yyyy` y se parsea con `new Date(str)` o
`Date.parse(str)`, JS lo lee como **mm/dd**: el 03/07 se vuelve 7 de marzo. Hay que
detectar el tipo y, si es texto, partir por separador de forma explícita. Nunca
`Date.parse` sobre texto.

Prueba puntual: buscar en `rdv` una fila con día ≤ 12 y verificar que cae en el mes
correcto.

**Bordes inclusivos.** La ventana va `[desde 00:00:00.000 , hasta 23:59:59.999]`. Si se
compara contra `hasta` a medianoche, se pierde todo lo cargado ese día con hora.

Prueba puntual: correr con `desde = hasta = <un día con datos>` y confirmar que no
devuelve 0.

**Filas sin fecha.** No se descartan en silencio: van a `filas_sin_fecha`. Si el número
es alto en alguna base, es un hallazgo para revisar con el equipo, no un detalle técnico.

**Comparar por valor, no por objeto.** Normalizar todo a timestamp antes de comparar.

---

## 4. Preguntas a validar contra los informes de muestra

Estas **no** se resuelven por criterio técnico. Los informes los escribe el equipo, así
que cada una se contesta mirando un deck real de referencia y confirmando con quien lo
arma. Anotar acá la respuesta y la fuente (qué deck, qué slide, quién confirmó).

| # | Pregunta | Por qué cambia el resultado | Dónde se ve en el deck | Respuesta / fuente |
|---|---|---|---|---|
| V1 | Campañas que cruzan semanas: ¿el número es **acumulado desde el inicio** o **solo el tramo del período**? | cambia el número, no la presentación | comparar el mismo indicador de una campaña en dos decks consecutivos: si crece siempre, es acumulado | |
| V2 | ¿Cuál es la columna de fecha correcta por base cuando hay más de una candidata (carga vs. evento vs. envío)? | dos columnas dan dos totales distintos y ambos "parecen" bien | pedir un total conocido de un deck y ver cuál columna lo reproduce | |
| V3 | Fuente de verdad digital/directa: **Looker** o **Seguimiento Digital** | cubren lo mismo con números que pueden no coincidir | tomar una campaña de un deck y ver qué base reproduce el número publicado | |
| V4 | `conv_*`, `rep_*`, `rrss_*`, `camp_resp_*` de SECCO: ¿de dónde salen? | no están en ninguna de las 4 bases — 3 slides sin fuente | preguntar por esas slides específicas: ¿hay quinta base o es carga manual? | |
| V5 | Encuentro temático (SECCO 6–8): ¿cómo se sabe **cuál** encuentro es el del período? | el motor no tiene forma de deducirlo | ver cómo se elige hoy a mano | |
| V6 | ¿Las filas sin fecha cuentan o no cuentan en los totales publicados? | si el equipo hoy las incluye a mano, el motor va a dar de menos | comparar total del deck vs. `filas_en_ventana` | |

**Regla de trabajo:** ninguna de estas se resuelve por default en el código. Mientras no
haya respuesta, el marcador afectado sale `«FALTA:token»` — visible — en vez de un número
plausible pero inventado.

---

## 5. Cierre del paso

- [ ] Pre-checks P1–P5 en verde
- [ ] Criterios A1–A10 en verde
- [ ] Trampas de §3 revisadas en el código
- [ ] Preguntas de §4 anotadas (no necesariamente resueltas — sí registradas)
- [ ] Commit único del Paso 2
- [ ] `HANDOFF.md` actualizado con lo aprendido

Lo de §4 que quede sin respuesta se sube a **`docs/CONFIG_INFORMES.md`** como pendiente
de validación, con la pregunta redactada tal cual para llevarla al equipo.
