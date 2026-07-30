# Selección de columnas de fecha (`fecha_periodo`)

> Resultado de `detectarColumnasFecha()` del 30/07/2026, revisado a mano.
> Documento **congelado**: si se vuelve a correr la detección y algo cambia, se escribe
> una versión nueva, no se edita esta.
> Referencia: `docs/Prompts/Paso-2.3.1.md`, `docs/Prompts/Paso-2.3.2.md`.

---

## Elegidas

Ocho filas marcadas con `elegida = sí` en `DIAG_FECHAS`.

| base | solapa | col | encabezado en la hoja | nombre real | nota |
|---|---|---|---|---|---|
| `rdv` | `RVD JM-CM - ES` | **E** | FECHA | FECHA | limpia |
| `rdv` | `RDV_otros_ministros` | **E** | hora_cita_evento | `fecha_inicio_evento` | ⚠ encabezados corridos |
| `digital` | `Digital` | **E** | Fecha de inicio | — | ⚠ rango |
| `digital` | `Directa SMS` | **D** | Fecha de envio | — | evento puntual |
| `digital` | `Directa Mail` | **F** | Fecha envio | — | ⚠ dato erróneo |
| `digital` | `Directa IVR` | **D** | Inicio | — | ⚠ rango |
| `digital` | `Seguimiento digital` | **L** | Fecha de inicio | — | ⚠ rango |
| `looker` | `resumen_metricas_dinamico` | **C** | fecha_inicio | — | ⚠ rango |

### Advertencias abiertas

**⚠ encabezados corridos — `RDV_otros_ministros`.** La fila de encabezados no
corresponde a los datos. Se mapea por letra de columna. Detalle y guardarraíl en
`docs/RDV_otros_ministros_riesgo.md`. La columna E es la fecha del evento pese a
llamarse `hora_cita_evento`.

**⚠ dato erróneo — `Directa Mail` col F.** Contiene un valor con año `20206` (tipeo en la
base). **Corregir en origen antes de promover:** con esa fila adentro, cualquier cálculo
de rango o de "última fecha" queda inservible.

**⚠ rango — cinco filas de `digital` y `looker`.** Estas solapas no tienen *una fecha por
fila*: tienen **pares inicio/fin**, donde cada fila es una campaña que dura un tramo.
Filtrar por la fecha de inicio deja afuera toda campaña que empezó antes del período pero
**estuvo activa durante** el período — una campaña de marzo a agosto no aparecería en el
informe de julio.

Decisión pendiente con el equipo: ¿una campaña se reporta en el período **en que
arranca**, o en **todos aquellos en que estuvo activa**? Si es lo segundo, el filtro
necesita dos columnas (`fecha_desde` / `fecha_hasta`) y una condición de solapamiento, no
un `fecha_periodo` único. **Estas cinco elecciones son provisorias hasta que se resuelva.**

### Cobertura incompleta

Filas con `pct_fecha < 1`: `digital/Digital` (0,96), `digital/Seguimiento digital`
(0,97). Son filas **sin fecha cargada**, que quedan fuera del filtro. No es bloqueante,
pero el equipo tiene que conocer el número: mirar los contadores `filas_sin_fecha` /
`filas_fecha_invalida` que `leerFuente` ya reporta, en la primera corrida.

---

## `m2` — sin elección

Varias solapas de `m2` son **vistas con banner de período**, no fuentes crudas: fila 1
con `Periodo:` y dos fechas escritas a mano, fila 2 vacía, encabezados reales en fila 3.
Por eso la detección devolvió fechas en la columna `encabezado`: leyó el banner.

No aplica a todas las solapas de `m2` — `M2 periodo DIGITAL` y `M2 periodo DIRECTA`
devolvieron encabezados legibles. Si son crudas o filtradas, no está determinado.

**Falta identificar cuál es la solapa de origen de `m2`.** Consultar al equipo. Enlaza
con el pendiente ya existente de agregar M2 a `FUENTES.md` y `MAPEO`.

---

## Criterio de exclusión

> **Una solapa es fuente cruda si el encabezado está en la fila 1 y no hay ningún período
> escrito a mano arriba de los datos.**

Si el período vive en la hoja, lo que devuelva depende de lo último que tipeó una
persona: un informe de julio puede salir con el recorte de mayo **sin fallar**. Eso no es
una fuente, es el resultado del proceso manual que el motor viene a reemplazar. Mismo
tipo peligroso que las fechas hardcodeadas de SECCO.

### Excluidas y por qué

| base | solapa | motivo |
|---|---|---|
| `rdv` | `Para Revisar` | copia de trabajo |
| `rdv` | `Copia de Para Revisar` | copia de trabajo |
| `rdv` | `Copia de Para Revisar 1` | copia de trabajo |
| `rdv` | `RVD JM-CM - ES Back Up` | backup |
| `rdv` | col `HORA` / `Hora` (varias solapas) | hora sin fecha (`1899-12-30`), no es fecha |
| `digital` | `Buscador por periodo digital` | vista con banner |
| `digital` | `Buscador por periodo directa` | vista con banner |
| `m2` | solapas con encabezado en fila 3 | vista con banner |

### Sin decidir — requieren revisión contra `MAPEO`

No excluidas ni elegidas: no está claro cuáles lee el motor y cuáles son auxiliares o
derivadas. **Decidir una por una antes de la próxima corrida.**

`rdv`: `RDV CONJUNTO`, `Agenda`, `Aux_Maximos`, `Datos_Unpivot`, `Seguimiento`,
`Funcionarios / Ministros`, `Visualiz_respuestas_GCBA`, `Visualiz_respuestas_JM`,
`Visualiz_SMS`.
`digital`: `Cuentas`, `CAMPAÑAS_DESGLOCE_DIGITAL`, `Digital 2026 acumulado`, `m2 digital`,
`RDV JM 2 VECES`, `Limpia Fun`.
`looker`: `Cuentas`.

⚠ **`digital` tiene una solapa `RDV`** con el mismo contenido que la base `rdv`. Si las
dos se leen, hay riesgo de **doble conteo**. Verificar cuál es la buena.

---

## Mejoras pendientes en el detector

1. **Lista de exclusión por (base, solapa)**, saltada antes de escanear y reportada al
   final. `DIAG_FECHAS` se borra y reescribe en cada corrida, así que `elegida` **no
   guarda conocimiento**: sin lista, la próxima detección vuelve a ofrecer las copias y
   los backups, y alguien apurado marca uno. La bandera no puede ir por fila en
   `DIAG_FECHAS` — se borraría igual — y el motivo de exclusión es de la solapa, no de la
   columna.

2. **Marcar fechas fuera de rango plausible** (antes de 2015, o después del año actual +
   2). Descarta solas las columnas `HORA` (`1899-12-30`) y canta el `20206` de
   `Directa Mail`.

3. **Firma de encabezados** para solapas de bases ajenas: registrar la fila de
   encabezados y fallar si cambió. Ver `docs/RDV_otros_ministros_riesgo.md`.

---

## Verificación posterior a la promoción

Sobre `rdv / RVD JM-CM - ES` — la única elección sin advertencias — correr el chequeo de
**R-01**: agrupar por (columna A `Figura`, columna E) y contar grupos con más de una fila.
Tiene que dar **cero**. Si da violaciones, lo más probable es que la columna elegida sea
de sistema y no la del encuentro: la regla funciona como test de la elección.
