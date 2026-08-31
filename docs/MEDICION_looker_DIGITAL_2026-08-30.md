# Medición — `looker/DIGITAL` sobre las hojas vivas, y por qué el Resumen Ejecutivo no se puede validar contra ella

**Fecha de lectura:** 2026-08-30. **Contra:** hojas vivas vía conector de Drive.
**Destino:** `docs/`. **Reemplaza** las mediciones sobre fixtures citadas en
`HANDOFF_validar_resumen_ejecutivo.md` §3–§5.

---

## 0 · Procedencia de todo lo que sigue

| qué | dónde | cuándo |
|---|---|---|
| `looker` = **Base Looker** | `1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ`, propietario `dgples.comunicacion@gmail.com` | `modifiedTime` 2026-08-29T23:35:50Z · leída 30/08 |
| copia congelada | **Base Looker (3) [fija]**, `1wWSkr08shGI3IEPGRs0Q3dcigN4XSM-RBJybESHDyHk`, propietario `jpcofanogcba1@gmail.com` | creada 2026-08-22T22:03Z |
| configuración | **Motor de Informes**, `1aPWibSbng2kn91DhhWPVXEsn3VHQLbgAIxx6erBZbIY` | `modifiedTime` 2026-08-29T15:23Z |
| deck del equipo / plataforma | captura de pantalla del tablero de carga, ventana **21 ago 2026 – 28 ago 2026** | aportada por el usuario 30/08 |

**Método:** export `.xlsx` de cada libro, parseado con `openpyxl`. Sin escritura sobre ninguna
planilla.

---

## 1 · ⛔ Advertencia de método, y una corrección mía

El export **markdown** de Drive (`read_file_content`) **trunca las solapas grandes sin avisar**:
devolvió **275** filas de `looker/DIGITAL`. El `.xlsx` de la misma solapa, el mismo día, tiene
**5.149**.

⚠ Toda medición que yo reporté antes en esta conversación a partir del export markdown —incluido
un «el fixture reproduce la solapa viva» que llegué a afirmar— **está viciada y queda anulada**.
El error propio vale registrarlo porque el modo de fallar es el peor: el export no falla, devuelve
menos filas y todo cierra.

⛔ **Regla: para contar filas de una solapa, `.xlsx`. Nunca el export markdown.**

---

## 2 · ⭐⭐ El hallazgo que decide: `looker/DIGITAL` es acumulada y no tiene columna de fecha

**Encabezado real, 9 columnas, sin ninguna temporal:**

```
A Id cuentas · B Plataforma · C Impresiones · D Visualizaciones · E Clics
F nombre_campaña · G eje · H area · I estado
```

Confirma el §6 del handoff: A, B, C, F, I están donde decía. Las columnas J–S existen en el rango
usado (`A1:S5150`) pero **están vacías en las 5.149 filas**.

**Y la solapa acumula.** Las dos lecturas del mismo libro:

| | filas | suma de `Impresiones` | cuentas distintas |
|---|---|---|---|
| copia **fija** del 22/08 | 5.039 | 3.311.613.450 | 750 |
| **viva**, leída el 30/08 | 5.149 | 3.447.138.131 | 781 |

Crece y no se reinicia. `SOLAPAS` lo dice desde el otro lado: `looker/DIGITAL` tiene
`ventana_ref = Cuentas` y la nota *«no tiene columna temporal propia»*. El recorte temporal
disponible es **por qué cuentas**, nunca **por cuánto de cada cuenta**.

⛔⭐⭐ **Una impresión de esta solapa es el total de vida de la campaña. Ningún filtro sobre ella
puede producir un número semanal.** El Resumen Ejecutivo pide impresiones de una semana. La fuente
no las tiene.

**Eso subsume la discusión del corte.** Aunque el corte JM/GCBA estuviera perfecto, la cifra
seguiría siendo acumulada contra una plataforma que publica el período.

---

## 3 · ⛔⛔ RETRACTADO — «Ningún filtro reproduce el deck»

> **Retractación fechada 2026-08-30, posterior al testigo ANTES de la Parte A del prompt
> `2026-08-30_2`. Este apartado entero se retira. Se conserva porque el error es instructivo.**
>
> **La premisa que lo sostiene es falsa y era inventada, no medida.** El apartado afirma
> «`periodo_ref = (vacío)` → sin ventana de fechas en el token». **No es así:** con `periodo_ref`
> vacío el motor **calcula** la ventana por `R-11`, y para esta corrida calcula **2026-08-21 →
> 2026-08-27**. La traza del testigo lo dice en los ocho `imp_*`.
>
> ⛔ **Las veinte combinaciones de la tabla de abajo nunca incluyeron la ventana que el motor
> usa.** No son un barrido incompleto: son veinte mediciones prolijas de la pregunta equivocada.
>
> **Lo que el motor publica realmente**, medido en vivo el 30/08 con el criterio viejo:
>
> | token | motor | deck `jm-20260828-193948` |
> |---|---|---|
> | `gcba_imp_total` | 147.753.414 · 191 filas | 132.908.538 |
> | `imp_total` | 486.982 · 6 filas | 86.009 |
>
> **Mismo orden de magnitud en los dos**, contra los 259 M que daba la mejor aproximación de este
> documento. ⇒ **`L-031` sí leyó esta solapa.** La conclusión contraria era un artefacto de la
> premisa.
>
> La brecha que queda es chica y tiene candidatos ya nombrados en la §7 quater de
> `MEDICION_corte_id_cuentas_2026-08-30.md`: el atraso de `looker/DIGITAL`, DV360 sin consolidar,
> y el default de `R-11`. ⛔ **Corregido el 30/08: acá decía «la ventana de 8 días», y esa causa
> estaba al revés** — `21–28` es la ventana correcta.
>
> ⭐⭐ **Y el candidato que resultó ser el grande está medido en
> [`MEDICION_cableado_JDGAG_2026-08-30.md`](MEDICION_cableado_JDGAG_2026-08-30.md): es ESTA
> SOLAPA.** El mismo corte y la misma ventana, sobre `digital|CAMPAÑAS_DESGLOCE_DIGITAL` en vez de
> acá, dan **86 %** del tablero contra el **44,8 %** que publica `L-031`. Lo que este documento
> concluye en su §2 —que la solapa no sirve para el Resumen Ejecutivo— **se confirma por otro
> camino**, y el reemplazo ya está declarado en `DIMENSIONES_` desde el 28/08.
>
> ⚠ **La lección, en `CLAUDE.md` §4:** una premisa inventada no produce un error visible — produce
> mediciones prolijas de otra pregunta. El tramo salteado acá no era un llamador: era **qué
> significa una celda vacía**.

### Lo retractado, tal como estaba

Cableado vivo, leído de `MARCADORES` (**221 filas**, no las 164 que devolvió el markdown):

```
imp_meta / imp_google / imp_prog          looker|DIGITAL · Impresiones · SUMA
gcba_imp_meta / gcba_imp_google / gcba_imp_prog
imp_total / gcba_imp_total
  filtro      = estado=Activa
  periodo_ref = (vacío)   → sin ventana de fechas en el token
  dimensiones = ambito=jm|gcba  [&& plataforma=meta|google|programmatic]
```

Veinte combinaciones de ventana × estado, sobre las dos lecturas del libro. Totales:

| lectura | estado | ventana sobre `Cuentas` | GCBA | JM |
|---|---|---|---|---|
| viva | Activa | sin ventana | 547.767.099 | 16.176.264 |
| viva | Activa | solape 21–28/08 | 259.544.005 | 15.951.276 |
| viva | Activa | contenida | 5.705.311 | 0 |
| viva | Activa | `estado_cuentas=Activa` | 541.949.701 | 15.951.276 |
| viva | todos | solape | 700.279.214 | 22.706.457 |
| fija | Activa | sin ventana | 498.349.748 | 28.577.720 |
| fija | Activa | solape | 196.896.213 | 20.720.051 |
| fija | todos | solape | 577.107.955 | 20.720.051 |

~~**El deck publicó GCBA 132.908.538 y JM 86.009. No aparece en ninguna.** El orden de magnitud de
JM —decenas de miles contra decenas de millones— dice que `L-031` **no leyó esta solapa**.~~

~~⚠ Falta el estado del libro al momento exacto de la corrida (28/08 19:41). Las dos lecturas que
tengo lo encierran —22/08 y 30/08— y ninguna se le acerca, pero eso **acota**, no prueba.~~

⛔ **Falso. Ver la retractación al inicio de este apartado.**

---

## 4 · Los cuatro juegos de números, y el que manda

Ventana **21–28/08** en los cuatro casos.

| | Meta | Google | Programmatic / DV360 | Total |
|---|---|---|---|---|
| **Plataforma de carga** · JM | 2.254.296 | 1.219.456 | 6.996.560 | **10.470.312** |
| **Plataforma de carga** · GCBA | 24.163.932 | 19.843.859 | 62.490.631 | **106.498.422** |
| deck manual del equipo · JM | 1.766.535 | 919.055 | 5.330.034 | 8.015.624 |
| deck manual del equipo · GCBA | 21.254.411 | 16.606.342 | 54.777.029 | 92.637.782 |
| motor `L-031` JM | 77.995 | 8.014 | 0 | 86.009 |
| motor `L-032` GCBA | 24.330.320 | 26.478.176 | 82.100.042 | 132.908.538 |

⭐ **La plataforma es la fuente de verdad y da conteos, no sólo sumas:** 29 implementaciones JM
(10 Meta · 10 Google · 9 DV360) y 281 GCBA (100 · 60 · 121). Eso permite verificar un universo sin
comparar una suma.

⚠ **El deck del equipo es ~15 % más chico que la plataforma en todas las celdas.** Consistente con
haberse armado uno o dos días antes. **No es la referencia; la plataforma sí.**

⚠ **`Programmatic` del motor ≠ `DV360` de la plataforma.** El motor lo define por resta —todo lo
que no es Meta ni Google ads— y en la solapa viva eso arrastra además **TikTok 56 · Mercado Libre
27 · Twitter 12 · Twitch 6 · Uber 5** filas. La plataforma rotula sólo DV360 (1.715 filas en la
solapa). La diferencia es chica pero está, y no está registrada como decisión.

---

## 5 · El corte JM: funciona, y aun así no alcanza

Sobre la solapa viva completa, `nombre_campaña ~= JM` da **94 nombres distintos · 620 filas ·
94 cuentas** de 781. No es cero y no son tres nombres: **el corte por texto discrimina en esta
solapa.**

⚠ **Corrección (rev. 2).** La revisión 1 decía que el §5.1 del handoff —«17 de 713 filas, tres
nombres»— «no describe la solapa viva». **Eso estaba mal planteado y se retira.** El §5.1 es una
medición sobre el fixture del 28/08 y **reproduce exacta sobre su propio artefacto**: 713 filas
`Activa`, 17 en JM. Mis «94 nombres» son otra medición —toda la solapa, sin filtro de estado,
sobre el artefacto del 30/08— y **no la refutan: miden otra cosa**. Las dos son correctas.
Es el mismo error de comparar entre artefactos que este documento le señala a otros.

⛔ **Pero el universo del período no está.** Cuentas con solape 21–28/08 en `Cuentas`: **93**. De
ésas, **67** aparecen en `DIGITAL`, y **sólo 4 tienen «JM» en el nombre**:

```
1 A 1 JM | 21/8 COGHLAN
1 a 1 JM | Almagro 6/8
Campañas genéricias RDV JM
Mail JM I Infraestructura | Estacionamientos truchos
```

**La plataforma declara 29 implementaciones JM en esa misma semana.** Cuatro contra veintinueve.
⇒ La brecha **no la explica el corte**: la solapa no tiene las campañas JM de la semana.

⚠ Uno de los cuatro es `Mail JM I …` — una campaña de mail contando como impresión digital. Vale
mirarlo aparte.

---

## 6 · Datos de la corrida, leídos de `CORRIDAS`

```
corrida_id   jm-20260828-193948
informe_id   jm
periodo_id   2026_agosto_21_28      (PERIODOS: 2026-08-21 → 2026-08-28)
deck_id      1WjxU6VjD3Cc8PNRP12pVWFMc6PHsUZMAcawLXJd
generado     2026-08-28 19:41:26
tokens       94 reemplazados · 278 faltantes
```

⭐ La ventana del motor **coincide con la de la plataforma** (21–28/08). La ventana no es la
discrepancia.

⚠ **Dos correcciones posteriores encadenadas, y la segunda restituye lo de arriba.**
Primero se anotó que esto «se caía» porque `21_28` son 8 días con dos viernes y la semana vie-jue
es `21_27`. ⛔ **Eso también era falso y se retira:** decisión del usuario del 30/08, **`21–28` es
lo que el equipo publica y lo que muestra el tablero** —límite superior inclusivo—. **La frase
original queda en pie: la ventana del motor coincidía con la de la plataforma.** Lo que no coincide
es el **default de `R-11`** (vie–jue, 21–27), y eso es lo que entra como cuarta causa en la §7
quater de `MEDICION_corte_id_cuentas_2026-08-30.md`.

⭐ **Confirmado el ADDENDUM 1 del `2026-08-28_3` §3:** el encabezado vivo de `CAMPANAS` es
`… mostrar · id_cuenta · orden`. El seed describe una hoja que no existe.

---

## 7 · Qué del handoff queda en pie y qué no

| § | afirmación | estado |
|---|---|---|
| §6 | columnas A/B/C/F/I de `DIGITAL` | ✅ confirmado sobre la hoja viva |
| §6 | `Plataforma` trae muchos valores, no tres | ✅ ocho valores |
| §6 | «Programmatic no es DV360, es el complemento» | ✅ en el motor — ⚠ y por eso no coincide con la plataforma |
| §4 | «el fixture es de otro momento» | ⚠ sin decidir: la copia fija del 22/08 y la viva del 30/08 difieren entre sí (5.039 vs 5.149 filas) |
| §5.1 | 713 filas Activa · 17 en JM · tres nombres | ✅ **reproduce exacta** sobre su artefacto (fixture 28/08), verificado con dos lectores. Sobre el del 30/08 son 720 Activa — es crecimiento, no discrepancia |
| §5 | hipótesis «no existe marca de a quién pertenece una campaña» | ⛔ desmentida por partida doble: `des_ambito` (col T del desglose) y `ivr_vocero` existen, y el corte por nombre **sí** discrimina en `DIGITAL` |
| §2 | «la pregunta 2 manda sobre la 1» | ⛔ **se invierte.** El corte es secundario: la fuente no tiene grano semanal (§2 de este documento) |
| §3 | «ni la suma de los dos coincide» | ✅ y ahora se explica: se están sumando totales de vida |

---

## 8 · Lo que sigue, en orden

1. ⭐⭐ **Decidir de dónde salen las impresiones semanales.** `looker/DIGITAL` no puede darlas.
   Candidatos a medir: `digital/CAMPAÑAS_DESGLOCE_DIGITAL` (que `Fuentes.gs` ya declara y a donde
   un comentario del 28/08 dice que los ocho `imp_*` iban a mudarse, mudanza **no aplicada** en
   `MARCADORES`), o la propia plataforma de carga como fuente.
2. **Medir el desglose igual que esto**, con `.xlsx`, y ver si reproduce los seis números de la
   plataforma. Falta acceso: `Seguimiento Digital`
   (`1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY`) todavía no está compartida.
3. **Sólo después**, el corte JM/GCBA — que ya tiene tres candidatos medibles: nombre,
   `des_ambito`, `ivr_vocero`.
4. **Cerrar la mudanza a medias** de los `imp_*`: o se mueven las filas de `MARCADORES`, o se
   saca la entrada de `DIMENSIONES_`. Hoy el código declara un camino que la configuración no usa.

⛔ **Nada de esto se cablea desde acá.** Va como prompt a Claude Code.
