# Medición 2 — El corte JM/GCBA está en `Id cuentas`, y el problema del grano queda solo

**Fecha de lectura:** 2026-08-30. **Revisión 2** — actualiza la tabla de referencia con la segunda
lectura del tablero y corrige dos afirmaciones de la revisión 1 (§7).
**Continúa** `MEDICION_looker_DIGITAL_2026-08-30.md`.
**Contesta** la pregunta ⭐ del `HANDOFF_validar_resumen_ejecutivo.md` §2.2 y §7.2.

---

## 0 · Procedencia

| qué | dónde | huella |
|---|---|---|
| `digital` = **Seguimiento Digital** | `.xlsx` descargado por el usuario el 30/08 · `docs/_fixtures/Seguimiento_Digital_2026-08-30.xlsx` | `d7b917f5711dcdd7…3edf70d6a` |
| solapa | `CAMPAÑAS_DESGLOCE_DIGITAL` — **5.149 filas**, 26 columnas | |
| referencia externa | tablero de carga, ventana 21–28 ago 2026, **dos lecturas: 29/08 y 30/08** | captura |

---

## 1 · ⛔⛔ La referencia se mueve, y eso cambia cómo hay que citarla

El mismo tablero, la **misma ventana ya cerrada** (21–28/08, terminada dos días antes), leído con
un día de diferencia:

| | | lectura 29/08 | lectura 30/08 | Δ |
|---|---|---|---|---|
| **JM** | implementaciones | 29 (10·10·9) | 29 (10·10·9) | — |
| | Meta | 2.254.296 | 2.254.346 | +50 |
| | Google | 1.219.456 | 1.219.244 | −212 |
| | DV360 | 6.996.560 | 6.907.699 | **−88.861 · −1,27 %** |
| | **total** | 10.470.312 | **10.381.289** | −89.023 · −0,85 % |
| **GCBA** | implementaciones | 281 (100·60·**121**) | 280 (100·60·**120**) | **−1 en DV360** |
| | Meta | 24.163.932 | 24.164.426 | +494 |
| | Google | 19.843.859 | 19.841.789 | −2.070 |
| | DV360 | 62.490.631 | 61.398.036 | **−1.092.595 · −1,75 %** |
| | **total** | 106.498.422 | **105.404.251** | −1.094.171 · −1,03 % |

⭐ **Un período cerrado sigue cambiando de valor.** Casi todo el movimiento está en DV360, y una
implementación DV360 de GCBA **desapareció** entre las dos lecturas.

⇒ **Regla que esto obliga: toda cifra del tablero se cita con fecha de lectura, igual que una
planilla.** «Lo que publica la plataforma para 21–28/08» no identifica un número. Y una validación
que cierre al 1 % está dentro del propio ruido de la referencia: **el criterio de aceptación no
puede ser más fino que ±2 %.**

⚠ Lo que **no** se mueve son los conteos de implementaciones: 29 JM las dos veces, y GCBA 281→280.
**Los conteos siguen siendo el control fuerte.** Todo lo que sigue usa la lectura del **30/08**.

---

## 2 · El encabezado real, y la columna que nadie está usando

```
A Id accion · B Id cuentas · C Año · D Mes · E Nombre Campaña · F Plataforma
G Cuenta · H Eje · I Fecha inicio · J Fecha fin · K Estado · L Nomenclatura
M Presupuesto · N Consumo · O Impresiones · P Visualizaciones · Q Clics
R Objetivo · S Tipo Campaña · T «JM | GCBA | POLICIA» · U Prioridad
V nombre_campaña · W eje · X area · Y estado · Z proyecto
```

⭐ **La columna T se llama literalmente `JM | GCBA | POLICIA`.** La marca de a quién pertenece una
campaña **existe y está declarada**. La hipótesis del §5 del handoff —«no existe ninguna marca»—
queda desmentida.

⛔ **Y está abandonada.** Reparto: `GCBA` 5.013 · `JM` 111 · `Sin Tipo` 19 · `LINDA` 6. Las 111
filas `JM` se concentran en dic-2025 → abr-2026 y **quedan 4 en agosto 2026**, contra las 29
implementaciones JM que el tablero declara sólo en la semana 21–28/08.

⛔ **Contradice al nombre en 530 casos, no en uno.** De las **620** filas con «JM» en el nombre,
T dice `JM` en **90** y `GCBA` en **530**. Además hay **21** filas con T=`JM` y ningún «JM» en el
nombre. El caso `3527-AGOJDGAG` que `Fuentes.gs` registra el 27/08 no es una excepción: es **el
85 %** de los casos. La decisión de descartarla, tomada el 27/08, queda respaldada.

⚠ **Cómo reproducir el reparto**, porque una segunda medición dio otros números: columna de índice
**19** (la vigésima, encabezado exacto `JM | GCBA | POLICIA`), sobre las **5.149** filas con dato,
**todas de 26 celdas** — no hay filas cortas que corran los índices. Los cuatro valores suman
5.149.
La medición discrepante da `GCBA` 4.219 · vacío 829 · `JM` 95, que **suma 5.143 y no 5.149**, y su
829 es exactamente la cantidad de celdas vacías de la columna **S** (`Tipo Campaña`). Eso apunta a
un corrimiento de índice, no a una diferencia de artefacto. **A verificar antes de citar cualquiera
de los dos repartos como crudo.**

---

## 3 · ⭐⭐ La marca real está en `Id cuentas`

`Id cuentas` tiene forma `NNNN-MMMSSSSS`: número, mes, y un **sufijo de cinco letras**.

| terminación | filas | con «JM» en el nombre | % |
|---|---|---|---|
| **`AG`** (sufijo `JDGAG`, Jefatura de Gobierno) | 540 | **517** | **96 %** |
| `GJ` | 693 | 68 | 10 % |
| `VC` | 342 | 10 | 3 % |
| `GC` | 3.464 | 21 | 0,6 % |

**Es una columna, es estable, y no depende de texto libre.**

⚠ **33 filas no respetan la forma** —19 sin `Id cuentas`, 1 con `Falta ID`, 13 con sufijo de diez
letras— y aparecen igual en las dos solapas. Ver §6.

### 3 bis · ⭐⭐ `AG` y `JDGAG` no son lo mismo, y la diferencia decide el cableado

Sólo dos sufijos terminan en `AG`: **`JDGAG` 531 filas** y **`SEGAG` 9 filas**. Las nueve son la
misma cuenta:

```
2475-ENESEGAG · «Recorrida por Servicio Penitenciario de Marcos»
  3 Meta · 4 Google ads · 2 DV360 · T = GCBA en las nueve · 4.108.318 impresiones
```

⇒ **`SEG` + `AG` es la agenda de Seguridad, de otro funcionario** —el nombre dice «de Marcos»—,
no la de Jefatura de Gobierno. La terminación `AG` marca *«es una agenda»*; las tres letras
anteriores dicen **de quién**.

⛔ **La condición correcta es `JDGAG`, no la terminación `AG`.** Con `AG` esas nueve filas entran a
JM, y son el único caso donde el criterio explícito de la planilla —la columna T, que ahí dice
`GCBA`— y el nombre coinciden en contra. **Un criterio que contradice a los otros dos a la vez no
es un caso borde: es un error.**

⚠ Ninguna de las nueve cae en la ventana 21–28/08, así que **esto no cambia ningún número de §4 ni
de §5**. Cambia qué se cablea.

---

## 4 · La prueba: los conteos del tablero

Ventana **solape con 21–28/08** sobre `Fecha inicio` / `Fecha fin` (343 filas). Referencia: lectura
del 30/08.

**Lámina JM — implementaciones**

| criterio | Meta | Google | DV360 |
|---|---|---|---|
| **tablero (referencia)** | **10** | **10** | **9** |
| ⭐ `Id cuentas` termina en `AG` | **10** | 9 | **9** |
| «JM» en el nombre — *criterio vivo del motor* | 8 | 7 | 7 |
| columna T = `JM` | 2 | 1 | 1 |

**Lámina GCBA — implementaciones**

| criterio | Meta | Google | DV360 |
|---|---|---|---|
| **tablero (referencia)** | **100** | **60** | **120** |
| ⭐ `Id cuentas` termina en `AG` | 102 | 69 | 128 |
| «JM» en el nombre | 104 | 71 | 130 |
| columna T = `JM` | 110 | 77 | 136 |

⇒ **`Id cuentas` se acerca más que el criterio vivo en las seis celdas.**

⚠ **Corrección (rev. 3).** La revisión anterior decía «reproduce el universo del tablero, falla en
una sola celda». **Eso vale sólo para JM.** Del lado GCBA **ningún criterio reproduce el tablero**:
`AG` da 102/69/128 contra 100/60/120, y el criterio vivo 104/71/130. El titular honesto es
*«se acerca más en las seis»*, no *«reproduce»*.

⭐ **Y un hallazgo de método que corrige la lectura de la tabla:** «implementaciones» en el tablero
se corresponde con **filas**, no con `Id cuentas` distintos. Contado por cuenta, `AG` da 10/7/8 y
no pega ninguna columna. La unidad de comparación es la fila.

⭐⭐ **La evidencia que sí es fuerte está en el diferencial, no en los totales.** De las 343 filas
de la ventana, **sólo 6 discrepan** entre el criterio vivo y `AG`. Las seis son `AGOJDGAG`, las
seis van en la misma dirección, y las seis son POST del «1 a 1» y de RDV — **es decir, JM**. `AG`
acierta las seis. **El sufijo corrige el error; no lo mueve de lugar.**

---

## 5 · ⛔ Y las sumas siguen sin cerrar, por el motivo del documento anterior

Mismas filas, sumando `Impresiones` (col O), contra la lectura del 30/08:

| | corte `AG` | tablero | |
|---|---|---|---|
| JM total | 13.953.803 | 10.381.289 | **134 %** |
| GCBA total | 264.024.170 | 105.404.251 | **251 %** |

⚠ Las tres plataformas nombradas dejan afuera **16 filas «otras»** —TikTok, Twitter, Twitch, Uber,
Mercado Libre— con 6.688.644 impresiones, que el motor mete en `programmatic` por resta y el
tablero no rotula. Está contado aparte a propósito.

⭐ **Los conteos cierran y las sumas no. Eso aísla el defecto:** las filas correctas están
seleccionadas; lo que se suma de cada una es de más. `Impresiones` es el **total de vida de la
campaña**, y las campañas de la ventana siguen corriendo después del 28/08 —seis de las de JM
terminan el 31/08—. GCBA se infla más porque sus campañas son más largas.

⇒ **Los dos problemas quedaron separados y los dos tienen nombre:**

1. ✅ **El corte** — resuelto: `Id cuentas` termina en `AG`.
2. ⛔ **El grano temporal** — sin resolver: ninguna de las dos solapas guarda impresiones por
   semana.

---

## 6 · Las filas que ningún criterio ubica

**33 filas** no respetan `NNNN-MMMSSSSS`, en las dos solapas y con los mismos valores. Las 19 sin
`Id cuentas` tienen además `T = Sin Tipo` y `nombre_campaña` vacío. Entre ellas:

```
Agenda con 1 - 1 A 1 - Retiro - 23/7
Agenda Post con 1 - 1 A 1 - San Cristobal - 24/7   (×3)
Post Agenda RDV con 1 Villa Devoto  Seguridad 14
RDV Ministros con 12 - Comuna 4 - 11/5
Agenda Entrega de Espadines a Comisarios Grales
```

Son campañas del «1 a 1» y de RDV — **son JM** — y **ningún criterio automático las toma**: no
tienen sufijo, no dicen «JM» en el nombre, y T dice `Sin Tipo`. Caen en GCBA por negación, sin
fallar y sin avisar.

⭐ **Esto no es un defecto que el sufijo introduce: es preexistente y compartido.** El criterio
vivo del motor las pierde exactamente igual.

**En la ventana 21–28/08 quedan 2 filas así, con 4.793.072 impresiones** —las dos de «Entrega de
Espadines a Comisarios Grales»—, que es el **4,5 %** del total GCBA del tablero. No es despreciable
y no lo arregla ningún corte: es un defecto de carga en la planilla de terceros.

---

## 7 · Correcciones a la revisión 1 de este documento

1. ⛔ **La tabla de referencia era la lectura del 29/08** y se citaba sin fecha. Reemplazada por la
   del 30/08, con las dos y su delta (§1).
2. ⛔ **«Las dos solapas difieren en 768.128, 0,02 %»** se presentaba como si caracterizara la
   relación entre `looker/DIGITAL` y el desglose. **No la caracteriza: es la foto de un día.** Sobre
   el fixture del 28/08 la diferencia es de **833.759.806 · 24 %**, y `looker/DIGITAL` va **19 filas
   sin `Plataforma`** que el 30/08 ya no tiene.
   ⇒ `looker/DIGITAL` es una **copia rezagada** de la misma consulta, y el rezago se resolvió entre
   el 28 y el 30.
   ⛔⛔ **Consecuencia:** la corrida `jm-20260828-193948` leyó esa solapa **el 28/08, con 24 % de
   atraso**. Los ocho `imp_*` de `L-031` y `L-032` salieron de ahí. **Es causa suficiente de
   discrepancia por sí sola**, aparte del corte y del grano.

---

## 8 · Lo que sigue

1. ⭐⭐ **El grano temporal es lo único que bloquea.** El tablero publica el período; las planillas
   no lo guardan. Sin esa fuente, ningún corte valida las láminas.
2. ⭐ **Cablear el corte por `Id cuentas`, con la condición `JDGAG`** — no la terminación `AG`
   (§3 bis). `ambito.jm` sobre `digital|CAMPAÑAS_DESGLOCE_DIGITAL` pasa a una condición sobre el
   id; `gcba` es su negación (`D-33` intacto). Antes de cablear: repetirlo sobre la hoja viva.
3. **Decidir qué hacer con las filas sin marca** (§6): reportarlas al equipo o mantener una lista a
   mano. Ningún criterio las resuelve.
4. **El atraso de `looker/DIGITAL`** como causa de discrepancia en decks ya publicados (§7.2).
5. **La mudanza a medias de los ocho `imp_*`**: `DIMENSIONES_` declara el desglose, `MARCADORES`
   sigue apuntando a `looker|DIGITAL`. Verificado sobre la configuración viva del 30/08.

⛔ Nada de esto se cablea desde acá. Va como prompt a Claude Code.
