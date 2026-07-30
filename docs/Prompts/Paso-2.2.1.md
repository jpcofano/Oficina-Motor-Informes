# Paso 2.2.1 — Parche: regresión en SECCO y matriz de M2 sin aplicar

> **Parche del Paso 2.2**, verificado leyendo las dos plantillas vivas después de correr
> "Armonizar tokens de plantillas". Dos problemas: uno introducido por la armonización, otro
> que quedó sin ejecutar.
>
> **No avanza el plan.** Cierra el 2.2 para que el 2.5 pueda sembrar `MARCADORES` sobre
> plantillas correctas.
>
> **Un commit por parte.**

---

## Lo que sí funcionó (no lo toques)

Verificado en `1JrHvs_p…` (JM) y `1_ZKjWhL…` (SECCO):

- **JM slide 5 quedó correcta**: las diez cajas con su token, `135` → `{{ivr_marque1}}`,
  `{{alcance}}` creado, `{{ecv_insc_ivr}}` agregado, y el `{{ivr_atendidos}}` duplicado
  desapareció. El criterio de "etiqueta + caja de valor más cercana" que implementaste
  funcionó.
- **JM slide 6**: `enc_clics_ctor`, `enc_alcance` + `_pct`, `enc_base_total`, y las dos cajas
  cruzadas ("Mails Enviados" / "Audiencia") quedaron derechas.
- `rrss_prom` → `rrss_prom_general` en las dos plantillas.
- `{{ecv_insc_ivr}}` en JM 5, JM 6 y SECCO 8.

---

## Problema 1 — Regresión en SECCO: la lista de renombres se aplicó a las dos plantillas

**El error es del prompt, no de la implementación:** `Paso-2.2.md` no dijo que
`{{enc_audiencia}}` → `{{enc_alcance}}` es un renombre **exclusivo de JM**. En SECCO ese
token ya era correcto — era la audiencia de la columna IVR, no el alcance digital.

Estado actual de SECCO slide 8:

```
{{enc_alcance}}                            Audiencia   ← ERROR: era {{enc_audiencia}}
{{enc_alcance}} ({{enc_alcance_pct}}%)     Alcance     ← correcta
```

Un token, dos números: exactamente el problema que el 2.2 venía a resolver, movido de lugar.
Y `{{enc_audiencia}}` ya no existe en ninguna de las dos plantillas.

### 1.a Restaurar la caja

En SECCO slide 8, columna IVR (la que tiene "Marque 1", "Escucha +75%", "Atendidos"), la
caja con etiqueta **"Audiencia"** vuelve a `{{enc_audiencia}}`.

⚠ Ubicala **por etiqueta**, no por texto del valor: hay dos cajas con `{{enc_alcance}}` y
buscar por valor es ambiguo. Es el mismo criterio que ya usaste en la Parte B.1 del 2.2.

⚠ **No toques** la caja con etiqueta "Alcance": esa `{{enc_alcance}}` + `{{enc_alcance_pct}}`
es correcta.

### 1.b Las listas de renombres pasan a ser por plantilla

Esto es lo que evita que vuelva a pasar. En `Armonizar.gs`, en vez de un array único
aplicado a todas las presentaciones, una lista **por `informe_id`**:

- **`jm`**: todos los renombres actuales, incluido `enc_audiencia` → `enc_alcance`.
- **`secco`**: solo los que apliquen a SECCO. `enc_audiencia` → `enc_alcance` **no va**.

Si un `informe_id` de `INFORMES` no tiene lista definida, la función **no lo toca** y lo
avisa en el reporte. Mejor no hacer nada que aplicar la lista de otra plantilla.

Dejá un comentario arriba del array explicando por qué: *los nombres de token colisionan
entre plantillas; el mismo nombre viejo puede ser correcto en una y estar mal en la otra*.

→ **Commit 1:** `Paso 2.2.1 ✅ — restaurar enc_audiencia en SECCO y listas de renombre por plantilla`

---

## Problema 2 — JM slide 10 quedó sin tocar

Ni los renombres de M2 (`TOKENS.md §4`) ni la limpieza de la Parte B.4 se aplicaron. Sigue
todo como estaba:

| hoy | tiene que quedar |
|---|---|
| `m2_clics_a`, `m2_aud_a`, `m2_vis_a` (columna Subtes) | `m2_subtes_clics`, `m2_subtes_aud`, `m2_subtes_vis` |
| `m2_clics_b`, `m2_aud_b` (Tránsito) | `m2_transito_clics`, `m2_transito_aud` |
| `m2_clics_c`, `m2_aud_c` (Desalojos) | `m2_desalojos_clics`, `m2_desalojos_aud` |
| **`m2_vis_e`** — está en la columna **Desalojos** | `m2_desalojos_vis` |
| `m2_clics_d`, `m2_aud_d` (Salud) | `m2_salud_clics`, `m2_salud_aud` |
| `m2_clics_e`, `m2_seguridad_aud` (Seguridad) | `m2_seguridad_clics`, `m2_seguridad_aud` |
| `m2_camp2` (bajo Subtes), `m2_camp1` (Desalojos), `m2_camp3` (Tránsito), `m2_camp4` (Salud), `m2_camp5` (Seguridad) | `m2_subtes_camp`, `m2_desalojos_camp`, `m2_transito_camp`, `m2_salud_camp`, `m2_seguridad_camp` |

⚠ **`m2_vis_e` y los `m2_camp*` no son renombres uno a uno**: los sufijos no siguen el orden
de las columnas. `m2_vis_e` está en Desalojos y `m2_camp1`/`m2_camp2` están invertidos
respecto del orden visual. Un `replaceAllText` ciego los renombra al lugar equivocado.
**Estos van por posición**, como la Parte B.1 — identificando la columna por su encabezado
("Subtes", "Tránsito", "Desalojos", "Salud", "Seguridad") y la métrica por su etiqueta
("Clics", "Audiencia", "Visualizaciones", "campañas").

`m2_salud_camp` y `m2_seguridad_imp` ya están bien: no los toques.

**Visualizaciones:** solo Subtes y Desalojos tienen caja. Tránsito, Salud y Seguridad no
tienen dónde ponerla, así que **no crees** `m2_transito_vis`, `m2_salud_vis` ni
`m2_seguridad_vis`.

**Limpieza (B.4):** borrá los 14 números hardcodeados que están fuera del área visible
(coordenadas `y` negativas). Siguen ahí: `73.181`, `15.793.427`, `1.782.747`, `34.483`,
`2.567.696`, `308.879`, `46.021`, `7.387.326`, `27.326`, `12.742.329`, `1.101.777`,
`184.030`, `978.523`, `1.242.288`, más los textos "Desalojo - 6 campañas", "Avenidas
porteñas - 1 campañas", "Puntos seguros - 1 campañas" y "Estaciones de subtes - 3 campañas".

→ **Commit 2:** `Paso 2.2.1 ✅ — JM slide 10: M2 por categoría y limpieza de ejemplos`

---

## Prueba del usuario

⚠ **Orden importa.** Si arreglás la caja de SECCO a mano y después se corre la armonización
con la lista todavía global, se vuelve a romper. Corré el parche completo, no una mitad.

Buscar en cada plantilla:

1. En **SECCO**: `enc_audiencia` → **un** resultado, en la caja "Audiencia" de la columna
   IVR de la slide 8. `enc_alcance` → **un** resultado (la caja "Alcance"), no dos.
2. En **JM**: `enc_audiencia` → **un** resultado, la caja "Audiencia" de la slide 6.
3. En **JM**: `m2_clics_a` → ningún resultado. `m2_subtes_clics` → uno.
4. En **JM**: `m2_vis_e` → ningún resultado. `m2_desalojos_vis` → uno, **en la columna de
   Desalojos** (esto hay que mirarlo, no buscarlo).
5. En **JM slide 10**: ningún número suelto arriba del canvas.
6. Correr la armonización **de nuevo** después del parche: 0 reemplazos en todo. Si algo
   cambia, hay un renombre que se pisa.

---

## Después de esto

Con el 2.2.1 confirmado, se puede sacar la advertencia de `docs/TOKENS.md` (Parte D del 2.2,
que quedó pendiente a propósito) y habilitar el Paso 2.5.

## Lo que sigue pendiente y no es de este parche

- Fechas hardcodeadas en SECCO: **"Febrero 2026"** (slide 3), **"Seguimiento Mayo 2026"**
  (slide 25) y el **`2026`** fijo al lado de `{{fecha_mes}}` (slide 24). No estaban en el
  alcance del 2.2. Son del mismo tipo peligroso que el `135`: no fallan, salen con el mes de
  otro informe.
- Los temas de ejemplo de SECCO 25 ("Tormenta Negra", "Coparticipación", "Htal Clínicas") al
  lado de `{{conv_tema1-4}}`.
- SECCO 26: nueve cajas `xx` sin tokenizar, sin fuente definida.
