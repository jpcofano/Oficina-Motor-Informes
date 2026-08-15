# CENSO — las 24 solapas de `reuniones` (14/08/2026)

> **Estado: evidencia congelada.** No se edita. Es la medición que habilita el alta de
> `SOLAPAS` para la base `reuniones`; el alta se escribe **citando este documento**, y cada
> nota de `ignorar` sale de una fila de acá y no de una frase.
>
> **reemplaza:** nada.

## Por qué existe

La Parte A2 del `docs/Prompts/2026-08-14_1_mapeo_metricas_plataforma_reuniones.md` censó estas
solapas el 14/08 y **el resultado sólo existió en un reporte de conversación**. Cuando el punto 5
del `_4` fue a escribir el alta, el repo nombraba **tres** de las veinte solapas nuevas y ninguna
de las otras diecisiete: no había con qué escribir un motivo verificable. Un motivo que nadie
puede verificar en noviembre es indistinguible de una regla — es el modo de falla que revirtió
`CAMPAÑAS_DESGLOCE_DIGITAL` esta misma semana.

**Este documento es la medición, no la decisión.** No clasifica nada: dice qué hay.

## Cómo se midió

`censarSolapasParaAlta()` (`Auditoria.gs`), corrida el 14/08/2026 a las 21:33–21:34. Recorre las
bases de `BASES`, censa cada solapa con `diagPlanillaExterna_` y **cruza contra `SOLAPAS` vivo**
—no contra el seed—. Por solapa: nombre exacto, `getLastRow()` × `getLastColumn()`, si la
registra `SOLAPAS` hoy y con qué `uso`, y las filas 1 y 2.

**Las filas incluyen el encabezado**, porque son `getLastRow()` crudo. `Agenda JM` figura con 156
y `SOLAPAS` le registra `filas_datos: 154`: la diferencia son las dos filas de encabezado
(`fila_encabezado: 2`). No es una discrepancia.

**Total medido: 24 solapas. Registradas hoy: 4. Sin registrar: 20.** El conteo confirma el del
`_4` —20 nuevas— y **corrige el "otras 17" del Addendum 2 del `_1`**, que está corrido en uno. El
addendum no se edita; queda corregido acá.

---

## Las 4 registradas hoy

| solapa | filas × cols | `uso` | qué es |
|---|---|---|---|
| `Agenda JM` | 156 × 44 | **`fuente`** | PRE, una fila por encuentro. Encabezado en fila 2: `ID · Funcionario · Barrio / Comuna · Tipo · Fecha · Fecha de envío · Enviados · Entregados · Aperturas · % OR · Clics · % CTOR`. Banda fila 1: `Comunicación Directa | Mailing` |
| `Agenda JM \| Post` | 106 × 29 | **`fuente`** | POST, mismo `ID` que la PRE (`C-50`). Banda fila 1 `Información del encuentro` … `Comunicación Digital | Acumulado`; fila 2 `ID · Funcionario · Barrio / Comuna · Tipo · Fecha · Habitantes · Alcance · Alcance potencial · % Cobertura · Impresiones totales · Clics · % CTR` |
| `Agenda funcionarios` | 555 × 25 | `ignorar` | encuentros de otros funcionarios |
| `Barrios` | 71 × 2 | `referencia` | `Barrio | Comuna | Zona` → `Habitantes` |

---

## Las 20 sin registrar

Ordenadas como salieron del censo. **La columna «motivo medido» es lo que la medición muestra,
no un veredicto** — la clasificación es del alta, no de este documento.

| # | solapa | filas × cols | motivo medido |
|---|---|---|---|
| 1 | `EDVs \| Estados` | 695 × 17 | Bandas fila 1: `INFORMACIÓN DEL ENCUENTRO` … `DIGITAL`. Fila 2: `Estado · ID Cuentas · Tipo · Nombre · Funcionario · Barrio · Fecha · Fecha de inicio · Fecha de fin · Estado · Fecha de inicio · Fecha de fin`. **Estados por equipo, no métricas** |
| 2 | `EDVs \| Activos` | 3 × 3 | `EDVs activas por equipo` → `DIGITAL: 1 | MAIL: 1 | CALL CENTER: 0`. **Tres celdas de tablero**, sin clave ni filas |
| 3 | `Base_mail` | 360 × 8 | `ID Cuentas · Fecha de envío · Enviados · Entregados · Aperturas · % OR · Clics · % CTOR`. **Capa de filas del canal mail** (`C-64`): una fila por envío. El agregado por cuenta ya está en `Agenda JM` |
| 4 | `Base_IVR` | 61 × 9 | `ID Cuentas · Audiencia · Llamados realizados · Llamados atendidos · % Atendidos · Escucharon +75% · % Escucha +75% · Marque 1 · % Marque 1`. **Capa de filas del canal IVR** (`C-64`) |
| 5 | `Base_Call` | 227 × 5 | `ID Cuentas · Base enviada · Base discada · Contactados · Efectivos`. **Capa de filas de call center** (`C-64`) |
| 6 | `Base_Digital` | 1910 × 27 | **Ocho bloques lado a lado**, cada uno con su propia lista de ids. Bandas fila 1: `Meta Convocatoria · Google Convocatoria · Programmatic Convocatoria · Alcance Meta Convocatoria` …; fila 2 repite `ID Cuentas · Impresiones · Clics` por bloque, y `ID Cuentas · Alcance real · Alcance pot.` en el de alcance. **Es la fuente de la que `Agenda JM!AF` y `Agenda JM \| Post!G` están copiados a mano** (`R-27`), y **la evidencia de que no existe banda de alcance de Google ni de Programmatic** |
| 7 | `EDVs \| Seguimiento Funcionarios` | 291 × 27 | Fila 2: `Funcionario · Barrio / Comuna · Fecha · Estado · Enviados · … · Habitantes · Alcance manual`. **Misma forma que `digital/EDV` (291 × 27, `referencia`)** — mismo alto y ancho: duplicado de otra base |
| 8 | `Digital \| Base Post` | 38 × 8 | `ID Cuentas · Nombre campaña | Digital · Impresiones · Alcance · Frecuencia · Views · Clics en el enlace · Alcance potencial`. **Excepción del Addendum 2: es POST y por eso era candidata.** Sin medir contra el universo `Uno a uno` |
| 9 | `Métricas EDVs` | 760 × 45 | Bandas `INFORMACIÓN DEL ENCUENTRO` … `MAIL`; fila 2 arranca `ID Reunión · Tipo · Evento · Funcionario · Barrio · Fecha · Estado · Enviados …`. **Su clave se llama `ID Reunión`, no `ID Cuentas`** |
| 10 | `Total` | 2633 × 14 | Bandas `INFO CAMPAÑA · DIGITAL · DIRECTA`; fila 2 `Estado · ID Cuentas · Tipo · Nombre · Fecha de inicio · Fecha de fin · …`. **Consolidado de estados de campaña**, no de métricas de encuentro |
| 11 | `IVR` | 104 × 21 | ⚠ **La fila 1 son datos, no encabezados** (`0781-NOVINFGC | Implementado | Yamila Abayay | Mon Jan 13 2025 …`). Solapa sin fila de títulos |
| 12 | `Call` | 1330 × 28 | `Nombre de la campaña en CC · N° Campaña · ID Call · ID plataforma (CCI) · ID plataforma (CCE) · ID Cuentas · Campaña · …`. **Mismo alto que `looker/CC` (1330)** |
| 13 | `Call (JM)` | 227 × 28 | Misma forma que `Call`, recortada a JM. **Mismo alto que `Base_Call` (227)** |
| 14 | `Call (Funcionarios)` | 977 × 28 | Misma forma que `Call`, recortada a funcionarios. 227 + 977 = 1204, contra 1330 de `Call` |
| 15 | `Métricas digital` | 961 × 9 | `ID Cuentas · Nombre campaña | Digital · Impresiones · Alcance · Frecuencia · Views · Clics en el enlace totales · Alcance potencial · Post`. **Excepción del Addendum 2: es la única con `Views`**, y `Visualizaciones` para el PRE es hueco abierto. Sin medir contra el universo `Uno a uno` |
| 16 | `Desglose impresiones` | 2747 × 6 | `Social · Impresiones · Google · Impresiones2 · Programmatic · Impresiones3`. **Excepción del Addendum 2**, por llamarse igual que la decisión editorial del 13/08. **Medido: son tres pares (id, impresiones) lado a lado, con listas de ids independientes** — no una tabla por encuentro. Y **no tiene columna de alcance**, consistente con `R-27` |
| 17 | `Digital` | 961 × 19 | `ID Cuentas · Nombre campaña | Cuentas · Nombre campaña | Digital · Mes · JM | GCBA | POLICIA · Encargado PM · …`. **Mismo alto que `Métricas digital` (961)** |
| 18 | `Mail` | 383 × 14 | ⚠ **La fila 1 son datos, no encabezados** (`0869-ENESALGC | Implementado | 03/01/2025 …`). Solapa sin fila de títulos |
| 19 | `Estados` | 14 × 3 | `Equipo · Estado · Recategorización`. **Tabla de desplegables**, 14 filas |
| 20 | `EDVs \| Resumen` | 174 × 16 | `EDVs realizadas (a hoy)` = 682; fila 2 `Fecha · JM · Ministros · Total` ×2. **Tablero de conteos**, no fuente por encuentro |

---

## Lo que este censo **no** midió, y hace falta antes de clasificar las tres excepciones

El Addendum 2 del `_1` pide medir `Desglose impresiones`, `Métricas digital` y
`Digital | Base Post` **contra el universo `Uno a uno` antes** de mandarlas a `ignorar`. Esa
medición **sigue sin estar hecha**, y el `_4` la da por hecha con un *"0 de 25 Uno a uno"* cuyo
origen no se pudo reconstruir.

⚠ **Y el número 25 no sale del temario.** `REUNIONES` tiene **5** filas con `tipo = "Uno a uno"`
—San Cristóbal ×2, Retiro ×2, Boedo—, medido el 14/08 con `censarTemarioPorTipo()`. El temario
tiene una fila por línea publicada, **no una por encuentro de la base**: el universo de los 25
tiene que salir de la columna `Tipo` de `Agenda JM` (156 filas), no de acá. Lo mide
`censarUniversosDeSolapasDeEncuentro()`, que todavía no se corrió.

**Hasta que eso se mida, las tres excepciones no se clasifican.**

---

## Dos cosas más que el censo dejó a la vista

**`miba` está en `BASES` sin `sheet_id`.** El censo la saltea con
`[miba] sin sheet_id en BASES — no se censa`. Es consistente con `PLAN.md` §3, que tiene *"Fuente
de MiBA — definir de dónde salen los datos"* como bloqueado y dependiente de un tercero. Queda
anotado porque **el motor la tiene registrada y vacía**, no ausente.

**El censo cubrió 108 solapas en 6 bases**, no sólo las 24 de `reuniones`. Lo de las otras cinco
bases no entra a este documento —su alcance son las 24— pero **una de esas lecturas contradice a
un documento vivo** y va como hallazgo a `docs/PENDIENTES_consistencia.md`, que es su dueño.
