# Paso 2.9 — Cerrar con supuestos, arreglar el lector y hacer el corte vertical

> **Cambio de marcha.** Hasta acá se resolvió cada duda antes de avanzar. A partir de
> ahora se **asume lo más probable, se registra el supuesto con ID, y se sigue**. Cuando
> un número no cierre, se busca el supuesto que lo explica en vez de reabrir todo.
>
> **Excepción: la Parte B.** Es un bug del lector que afecta a las cuatro bases y hace
> que todos los totales salgan bajos sin fallar. Va primero y no se asume nada.
>
> **Un commit por parte. Trabajamos en español.**
>
> ⚠ **Namespace (`PROYECTO.md` §9):** `grep -rn "function nombre" *.gs` antes de nombrar.

---

## Parte A — `docs/SUPUESTOS.md`

Archivo nuevo con ID estable, igual que `REGLAS_NEGOCIO.md`. Cada supuesto: qué se
asumió, con qué evidencia, **qué síntoma lo desmiente**, y cómo se revierte.

| ID | supuesto | evidencia | síntoma que lo desmiente |
|---|---|---|---|
| **S-01** | La fuente de `looker` es **`resumen_metricas_dinamico`** | es una `QUERY` viva sobre `Cuentas`; `resumen_metricas` son valores pegados | los totales de Looker quedan quietos entre semanas |
| **S-02** | El contrato de fecha es **`fecha_periodo`**; `fecha` queda derogado | la selección congelada del 30/07 usa `fecha_periodo` | una base filtra por una columna que nadie eligió |
| **S-03** | Las 337 filas "sin clave" de `digital` son campañas sin `id_cuenta` | 26% del total | una campaña del temario no aparece en el informe |

**Nota:** el supuesto que decía que `m2` no tiene fuente cruda **se cae** con la Parte B.
Si ya se escribió en algún lado, marcarlo derogado con fecha, no borrarlo.

→ **Commit A:** `Paso 2.9 ✅ — docs/SUPUESTOS.md con S-01 a S-03`

---

## Parte B — El lector devuelve una fila por clave, no las filas

**Bloqueante. Todo lo demás se apoya en esto.**

Los cuatro conteos de la corrida del 30/07:

| base | `SOLAPAS.filas_datos` | leídas |
|---|---|---|
| `rdv` | 1362 | 720 |
| `digital` | 1297 | 960 (337 "sin clave" descartadas) |
| `looker` | 903 | 903 |
| `m2` | 29.533 | **18** |

Se estaban explicando de a uno —filas vacías acá, campañas sin cuenta allá, vista con
banner en `m2`— y cuatro explicaciones distintas para el mismo síntoma es señal de que la
explicación es una sola.

**Hipótesis: `leerFuente` colapsa por `clave` y devuelve una fila por valor distinto.**
`M2 periodo DIRECTA` tiene 29.533 filas de envío repartidas en ~18 campañas: colapsado da
exactamente 18. `digital` descartando "sin clave" es la misma mecánica, más visible.

Si es así, **`m2` está bien** —es una tabla de detalle— y lo que falla es que el lector
entrega una fila por campaña en vez de las 29.533 para que `SUMA` las sume. Todos los
totales del informe saldrían bajos, sin ningún error.

1. **Verificar en el código:**
   ```bash
   grep -n "clave\|Map\|Set\|dedup\|indexOf\|\[clave\]\|reduce" Fuentes.gs
   ```
   Buscá si arma un objeto o `Map` indexado por clave y devuelve sus valores. Reportá la
   línea exacta.
2. **Verificar en los datos:** cuántos valores distintos tiene la columna `campana` de
   `M2 periodo DIRECTA`. Si son 18, está confirmado. Ídem `rdv`: ¿720 coincide con los
   encuentros únicos por `(Figura, fecha)`? Es justo la clave que define **R-01**.
3. **Corregir separando dos cosas que hoy están juntas:**
   - `leerFuente()` devuelve **todas las filas** de la ventana. No deduplica.
   - La deduplicación, si hace falta para algo, es una operación aparte y explícita.
   Un lector que colapsa por su cuenta hace imposible cualquier `SUMA` correcta.
4. **Las filas sin clave no se descartan en silencio.** Se devuelven, y el conteo de
   cuántas no tienen clave sale en el reporte como dato, no como filtro aplicado.
5. **Guardarraíl:** el aviso de cobertura no debería haber dejado pasar 960/1297 ni
   720/1362. Bajar el umbral o —mejor— reportar el porcentaje siempre y marcar ⚠ por
   debajo del 90%.

**Test:** después del arreglo, `m2` devuelve del orden de 29.533 filas, `rdv` del orden
de 1362 y `digital` de 1297. Si alguno sigue corto, ahí sí hay una segunda causa y se
diagnostica sola.

→ **Commit B:** `Paso 2.9 ✅ — leerFuente devuelve todas las filas; la deduplicación deja de ser implícita`

---

## Parte C — `looker`: la fuente es `_dinamico` (S-01)

El test de fórmulas dio un resultado que la Parte C del 2.8 no contemplaba:

```
=QUERY(Cuentas!A2:G; "SELECT * WHERE Col1 is not null AND Col7 <> 'Pendiente'"; 0)
```

`_dinamico` **no deriva de `resumen_metricas`: deriva de `Cuentas`**. Son independientes,
no fuente y copia — el criterio "fórmulas = derivada" no aplica.

Y lo invierte: `_dinamico` es una consulta viva que crece con `Cuentas`;
`resumen_metricas` es un pegado congelado que hoy coincide y la semana que viene no.
Encima, `resumen_metricas` devolvió **899 de 903 filas sin fecha**.

1. `SOLAPAS`: `resumen_metricas_dinamico` → `fuente`; `resumen_metricas` → `derivada`.
   Las dos `origen=manual`, con nota apuntando a **S-01**.
2. Mover las **25 filas** de `MAPEO` a `resumen_metricas_dinamico`. La corrida anterior
   movió 0 y dejó todo al revés.
3. `BASES.hoja_default` de `looker` → `resumen_metricas_dinamico`.
4. **Revertir la migración** que dejó `resumen_metricas` como fuente, o corregirle el
   sentido — que no vuelva a invertirlo en el próximo `instalar()`.
5. **Cerrar DOC-3 Parte A**: queda confirmada, con el motivo escrito en `PROYECTO.md` §5.

**Test:** `looker` lee con fechas y devuelve un número plausible en la ventana, no 0 de
903.

→ **Commit C:** `Paso 2.9 ✅ — looker: fuente = resumen_metricas_dinamico (S-01), DOC-3 Parte A cerrada`

---

## Parte D — Un solo contrato de fecha (S-02)

El reporte dice `col fecha "fecha_inicio"`: el lector usa el `campo_logico` **`fecha`**,
el contrato viejo. `fecha_periodo` no gobierna la lectura. Señalado desde DOC-2 Parte 0.

1. `leerFuente()` y todo lo que resuelva columna de fecha usan **`fecha_periodo`**.
2. Las filas `campo_logico='fecha'` de `MAPEO` y `SEED_MAPEO_` quedan
   `notas='DEROGADA — ver S-02'`. **No se borran.**
3. Sin `fecha_periodo` mapeado → `«FALTA:fecha_periodo@base/solapa»`. **No caer al viejo
   en silencio.**

→ **Commit D:** `Paso 2.9 ✅ — fecha_periodo como contrato único (S-02)`

---

## Parte E — Terminar de borrar `alcance`

El reporte dice `columna (no encontrada)`: la migración borró el valor pero **dejó la
fila**. Eliminarla de `MAPEO` y de `SEED_MAPEO_`.

Anotado aparte, sin decidir: la columna **D** de `digital/Digital` se llama `Audiencia`.
Es candidata a la "Audiencia Alcanzada" de JM 5, junto con `looker/Audiencias` (303
filas). Registrar las dos en `docs/CONFIG_INFORMES.md`.

→ **Commit E:** `Paso 2.9 ✅ — MAPEO: fila digital/Digital/alcance eliminada`

---

## Parte F — El anclaje deja de ser un portón: pasa a ser una sugerencia

**Acá se disuelve el timeout, por diseño y no por optimización.**

`R-02` dice que el temario define el universo: la selección es humana. Entonces
`anclarEncuentros()` **no decide qué entra al informe** — propone el link
campaña↔encuentro para que una persona lo confirme. Puntuar 500 encuentros contra 1297
cuentas es trabajo que nadie pidió.

1. **`CAMPANAS` es la entrada, no la salida.** El usuario elige; el motor lee métricas
   solo de lo elegido.
2. `anclarEncuentros()` corre **sobre el conjunto ya filtrado**: los encuentros de la
   ventana (16 en la prueba del 30/07) contra las cuentas candidatas de esa ventana. El
   timeout desaparece sin tocar el scoring.
3. Lo que no matchea sale como **sugerencia con score**. Nada se descarta solo.
4. El umbral `0.6` sale del código y va a `CONFIG`: es parámetro de negocio, hoy cambiarlo
   exige `clasp push`.
5. **Validación:** `digital/RDV JM 2 VECES` tiene 37 encuentros con el link hecho a mano
   por `(Funcionario, Barrio, Fecha)`. Correr el anclaje sobre esos 37 y comparar. Es la
   única medición real del scoring que existe.

→ **Commit F:** `Paso 2.9 ✅ — anclaje acotado a la selección humana (R-02); umbral a CONFIG`

---

## Parte G — Corte vertical: diez tokens de punta a punta

En vez de sembrar ~200 filas de `MARCADORES` (Paso 2.5, bloqueado por la armonización de
plantillas), **cablear diez a mano** y hacer andar la cadena entera.

**Precondición: la Parte B tiene que estar verificada.** Con el lector colapsando, toda
`SUMA` da bajo y el corte vertical validaría números equivocados.

1. Elegí **una sola slide** de la JM canónica —la de campaña, que es la que se repite— y
   cableá sus tokens en `MARCADORES`: `base_id`, `solapa`, `campo_logico`, `operacion`,
   `periodo_ref`.
2. Implementá en `Marcadores.gs` **solo** las operaciones que esos diez necesiten
   (`SUMA`, `CONTEO`, `RATIO`, `ULTIMO`, `TEXTO`), con la tabla de `Paso-3-v2` como
   contrato. **Toda la aritmética vive acá y en ningún otro módulo.**
3. **Traza obligatoria por token:** valor + de qué base, solapa, columna y operación
   salió, y **cuántas filas entraron**. Ese último dato es el que hace visible el bug de
   la Parte B si vuelve.
4. Ojo con el contrato del 2.4: `filasDigitalDeEncuentro` devuelve **arreglos de filas**
   (`mail_filas`, etc.), no columnas planas. `SUMA` opera sobre eso.
5. Salida a una hoja **`VISTA_PREVIA`**: una fila por token, con valor y traza. Sin
   Slides todavía.

**Test:** correr con 2026-06-26 → 2026-07-03 y una campaña elegida a mano. Los diez
tokens tienen valor o `«FALTA:…»`, y **cada uno dice de dónde salió**.

→ **Commit G:** `Paso 2.9 ✅ — corte vertical: 10 tokens con traza en VISTA_PREVIA`

---

## Prueba del usuario

1. Los cuatro conteos de lectura cierran contra `SOLAPAS`, o la diferencia está explicada.
2. `looker` lee con fechas y devuelve un número plausible en la ventana.
3. "Probar unión y anclaje" **termina**.
4. `VISTA_PREVIA` tiene diez filas y cada una dice base, solapa, columna, operación y
   filas usadas.
5. Sobre los 37 de `RDV JM 2 VECES`: cuántos coinciden con el link humano.

---

## Sigue abierto (no bloquea)

- Tres solapas `Cuentas` (4398 / 3453 / 961): cuál es la maestra.
- `EDV` (290) y `Respuestas JM 📩` (3692) — la segunda, candidata a los `enc_*`.
- "Audiencia Alcanzada" de JM 5: `digital/Digital` col D vs. `looker/Audiencias`.
- `firma_encabezado` — antes del 3-v2.
- Commits sin pushear; prueba de DOC-2 (`MARCADORES` sin `calculo`).
