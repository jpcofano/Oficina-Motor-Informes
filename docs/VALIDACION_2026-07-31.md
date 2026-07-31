# VALIDACIÓN — Informe SECCO/SSCDI 31-07 contra las cuatro bases

> Sesión del 31/07, cuenta paralela. Material: `Seguimiento SECCO - SSCDI (31-07).pptx`
> (48 láminas, el informe realmente presentado) + las cuatro bases descargadas **el mismo
> día**, más el mensaje de WhatsApp que originó el temario.
> Repo leído en `48beb2a`. **Trabajamos en español.**
>
> Es la primera vez que se puede comparar informe publicado ↔ base ↔ temario con las tres
> cosas de la misma fecha. Esto no reemplaza al `docs/Sesiones/HANDOFF 2026-07-31.md`: lo
> corrige en dos puntos y le cierra tres preguntas abiertas.

---

## 0. Titular

**El informe es reproducible en un 60% largo, con traza exacta al dígito.** Lo que no
cierra no es ruido: son cinco causas identificadas, todas nombrables y todas con
consecuencia de diseño.

Y hay una que hay que leer primero, porque el handoff del 31/07 la dejó marcada como
bloqueante y **estaba equivocada**.

---

## 1. Lo que hay que corregir del handoff del 31/07

### 1.1 El lector NO colapsa por clave. `m2` tiene 18 filas y punto.

La hipótesis central del handoff era que `leerFuente` devolvía una fila por valor distinto
de clave, y que por eso `M2 periodo DIRECTA` daba 18 en vez de 29.533. Conclusión: "`m2`
está perfecto, es una tabla de detalle, todos los totales del informe salen bajos".

Medido sobre el archivo:

```
M2 periodo DIRECTA — filas totales: 29.534
                     filas con algún dato (desde la fila 4): 18
```

**Las 29.515 restantes están vacías.** Son filas de fórmula arrastrada. El lector devolvió
18 porque hay 18. `SOLAPAS.filas_datos` es el que miente, no `leerFuente`.

Consecuencias:

- La **Parte B del `Paso-2.9 v2` deja de ser bloqueante.** No hay que arreglar el lector.
- Hay que arreglar `filas_datos`: debe contar filas no vacías, no `getDataRange()`.
- Las otras tres brechas (`rdv` 720/1362, `digital` 960/1297, `looker` 903 con 899 sin
  fecha) **pierden su explicación común y necesitan una propia cada una**. Probablemente
  la misma: relleno de fórmula.
- El guardarraíl de cobertura estaba mal calibrado contra un denominador inflado.

> Nota de método, porque se repite: la sesión anterior buscó la causa común cuando cuatro
> bases mostraron el mismo síntoma. Era el criterio correcto y produjo una hipótesis
> elegante y falsa. La causa común existía —relleno de fórmula— pero estaba un nivel más
> abajo, en el conteo, no en la lectura.

### 1.2 Las solapas `periodo` son una vista manual, no una fuente

| solapa | período escrito en la fila 1 | filas con dato |
|---|---|---|
| `m2 / M2 periodo DIRECTA` | **03/07 → 10/07** | 18 |
| `m2 / M2 periodo DIGITAL` | **22/05 → 29/05** | 13 |
| `m2 / Mail per` | 03/07 → 10/07 | 70 |
| `digital / Mail per` | **10/07 → 11/07** | 4 |

El informe se presentó el 31/07 sobre la semana 24–30/07. **Ninguna de las cuatro apuntaba
a esa semana, y las cuatro apuntaban a semanas distintas entre sí.** Alguien mueve esas
celdas a mano cuando necesita el recorte, y quedan donde quedaron.

**Ninguna de las cuatro puede ser `uso=fuente`.** Van a `referencia`. El motor filtra por
su propia ventana sobre la tabla de detalle (`M2 Directa`, `Directa Mail`), nunca sobre una
vista cuyo recorte depende de dos celdas editables.

Detalle inquietante: la lámina M2 del informe dice **18 envíos**, y `M2 periodo DIRECTA`
tiene hoy exactamente 18 filas — con otro período. Muy probablemente la lámina se arma
re-apuntando esas celdas y leyendo ahí. Test de un minuto: poner 24/07–30/07 y ver si
`enviados` da 995.194.

---

## 2. La cadena completa: WhatsApp → 48 láminas

El mensaje que originó el informe, mapeado contra lo que salió:

| # temario | línea cruda | láminas | fuente de los números |
|---|---|---|---|
| Cercanía 1 | JM \| Uno a uno en San Cristóbal 23/07 (pre + post) | 12–13 | RDV ✅ · DESGLOCE (pre) ✅ · post ✗ |
| Cercanía 2 | JM \| Uno a uno en Retiro 24/07 (pre + post) | 14–15 | RDV ✅ · DESGLOCE (pre) ✅ · post ✗ |
| Cercanía 3 | JM \| Primera Persona con Pareto 27/07 | 16–19 | RDV ✅ · resto **quedó en `xx`** |
| Cercanía 4 | JM \| Encuentro Temático Orden Público 28/07 | 20–21 | RDV ✅ · Mail ✅ · IVR ✅ · CC ≈ · Digital ≈ |
| Cercanía 5 | Ministros \| Reuniones de la semana | 22–23 | ✗ no reproducible |
| Cercanía 6 | M2 \| Campañas y enviados de la semana | 24–25 | ✗ no reproducible |
| Cercanía 7 | M2 \| Registro Civil: piezas + métricas | 26–28 | ✗ sin fuente en las 4 bases |
| Destacada 1 | Egreso de cadetes | 29–33 | Mail ✅ · Digital ≈ |
| Destacada 2 | Operativo saturación 1-11-14 | 34–42 | Mail ✅ · Digital ✗ |
| Destacada 3 | Desalojo 900 (estrategia) | 43–44 | sólo estrategia, sin métricas |
| Destacada 4 | Video obras de salud | — | **no entró** (el material no llegó) |
| DGAYD 1 | Semana JM | 4–6 | ✗ fuera de las 4 bases |
| DGAYD 2 | Conversación digital Operativo 900 | 7–8 | ✗ fuera de las 4 bases |
| DGAYD 3 | Comparativo Recuperación de Propiedades | 9–10 | ✗ fuera de las 4 bases |
| Otros | Status reunión con PC | 45–47 | texto |

### Lo que esto enseña sobre `REUNIONES`

1. **El temario tiene tres bloques, no uno.** `Cercanía y M2` (numerado), `Campañas
   destacadas` (numerado aparte) y `DGAYD` (numerado aparte). El parser actual asume una
   lista plana. Hace falta una columna `bloque`, y el `orden` es *dentro* del bloque.
2. **El índice del informe reordena.** El temario arranca por Cercanía; el informe arranca
   por DGAYD (láminas 4–10) y mete Cercanía en el medio. El orden de emisión no es el orden
   del temario — hace falta un `orden_informe` separado, o que `SECCIONES` mande.
3. **"En caso de que llegue el material" es un estado.** Dos ítems lo traían; uno entró sin
   métricas (Desalojo 900) y el otro no entró. `mostrar` con `sí`/`no` no alcanza:
   hace falta `pendiente`.
4. **DGAYD no sale de estas bases.** Escucha social. Es una quinta fuente que hoy no está
   ni mapeada ni mencionada, y son 7 de las 48 láminas.

---

## 3. Lo verificado, al dígito

### 3.1 RDV cierra perfecto — y contesta dos pendientes

Solapa `RVD JM-CM - ES`, ventana 20/07–01/08, 26 filas.

| lámina | dato | deck | RDV | |
|---|---|---|---|---|
| 13 | San Cristóbal 23/07 inscriptos | 138 | 138 | ✅ |
| 13 | asistentes | 9 | 9 | ✅ |
| 15 | Retiro 24/07 inscriptos | 98 | 98 | ✅ |
| 15 | asistentes | 10 | 10 | ✅ |
| 21 | Orden Público inscriptos | 753 | 753 | ✅ |
| 21 | asistentes (26%) | 199 | 199 (26,4%) | ✅ |
| 21 | Mail | 361 (48%) | 361 | ✅ |
| 21 | Digital | 180 (24%) | **col `RRSS` = 180** | ✅ |
| 21 | Call Center | 169 (22%) | 169 | ✅ |
| 21 | IVR | 43 (6%) | 43 | ✅ |
| 18 | Pareto Call Center | 103 | 103 | ✅ |

**Pendiente cerrado 1 — `ecv_insc_ivr`.** Es la columna `IVR` de RDV. Estaba marcado como
"agregar a MARCADORES" en `TEMARIO_Y_PLANTILLA`; ya tiene fuente.

**Pendiente cerrado 2 — `Digital` del iceberg no es digital.** Es la columna `RRSS` de RDV:
inscriptos que llegaron por redes. No tiene nada que ver con `digital_impresiones`. Cablearlo
a la fuente digital daría un número plausible y equivocado — el modo de falla caro, otra vez.

**Bonus: la lámina 18 (Pareto) se puede completar entera.** El deck la dejó con `xx` en
todo salvo Call Center. RDV tiene: inscriptos **1.344**, asistentes **267 (20%)**,
Mail **807**, RRSS **434**, Call Center **103**. Es la prueba más directa de que el motor
sirve: cuatro números que el equipo no llegó a cargar a mano estaban en la base.

### 3.2 IVR cierra por SUMA sobre `id_cuenta`

Orden Público, cuenta `3387-JULJDGGC`, dos filas en `Directa IVR` (22/07 y 23/07):

| | fila 22/07 | fila 23/07 | suma | deck |
|---|---|---|---|---|
| llamados | 40.874 | 37.763 | **78.637** | 78.637 ✅ |
| atendidos | 37.055 | 34.179 | **71.234** | 71.234 (91%) ✅ |
| escucha +75% | 13.766 | 13.833 | **27.599** | 27.599 (39%) ✅ |
| marque 1 | 82 | 174 | **256** | 256 ✅ |

Idéntico en `looker/resumen_metricas_dinamico`, columnas `ivr_*`. **Cualquiera de las dos
fuentes sirve y coinciden.** Es el bloque más limpio de todo el informe.

### 3.3 Mail: el iceberg usa UN envío, no la cuenta

| | |
|---|---|
| lámina 21 muestra | 44.043 enviados |
| cuenta 3387 acumula | **271.701** enviados en 5 envíos |
| fila del 25/07 | 44.043 / 43.439 / 4.652 (10,7%) / 145 (3,1%) ✅ |

La lámina de convocatoria toma **el envío de convocatoria**, no el total de la cuenta. Los
otros cuatro envíos del 3387 son "Te Cuento" de otros ejes y el post.

**Consecuencia de diseño:** `SUMA por id_cuenta` da el número equivocado para el iceberg.
La selección del envío es humana. O se agrega una columna de rol (`convocatoria` / `post` /
`refuerzo`), o la fila del envío se cablea desde `REUNIONES`.

Nota: la columna `Nomenclatura` ya trae `... Conv ...` / `... Post ...` / `... Pre ...` en
varias filas. Ahí puede estar el rol sin inventar nada. **Vale revisarlo antes de agregar
una columna.**

### 3.4 Las tablas de mail de campaña cierran fila por fila

**Egreso de cadetes** (lámina 33) — 3 de 4 filas exactas:

| envío | deck (env/entr/aper/clics) | base 31/07 | |
|---|---|---|---|
| JM 17/07 | 163.749 / 163.348 / 101.422 / 478 | idéntico | ✅ |
| JM 18/07 | 40.293 / 37.876 / 6.685 / 55 | idéntico | ✅ |
| GCBA 20/07 | 95.225 / 94.604 / 48.687 / 213 | 94.**601** | ≈ |
| JM 27/07 | 148.445 / 146.811 / 8.894 / 147 | 146.786 / 9.116 / 151 | ≈ |

**Operativo 1-11-14** (lámina 40) — 3 de 4 exactas:

| envío | deck | base 31/07 | |
|---|---|---|---|
| JM 24/07 | 215.240 / 214.666 / 123.884 / 1.024 | idéntico | ✅ |
| JM 25/07 | 24.805 / 24.447 / 1.151 / 37 | idéntico | ✅ |
| GCBA 27/07 | 112.423 / 111.526 / 48.476 / 448 | idéntico | ✅ |
| JM 28/07 | 170.867 / 168.853 / 7.904 / 129 | 168.840 / 8.304 / 137 | ≈ |

### 3.5 Digital PRE de los Uno a uno: exacto por plataforma

`digital/CAMPAÑAS_DESGLOCE_DIGITAL`, agrupado por `Id cuentas` + `Plataforma`:

| cuenta | plataforma | impresiones | clics | CTR calculado | deck |
|---|---|---|---|---|---|
| `3354` San Cristóbal | Google ads | 17.401 | 496 | **2,85%** | 496 (2,85%) ✅ |
| `3354` San Cristóbal | Meta | 25.099 | 778 | **3,10%** | 778 (3,10%) ✅ |
| `3346` Retiro | Meta | 18.015 | 1.833 vistas | **10,2%** | 1.833 (10%) ✅ |

Total `3354` = 42.500 impresiones. El deck agrega, para el mismo encuentro,
94.955 y 43.205 de impresiones POST. **Esas no están en ninguna de las cuatro bases.**

---

## 4. Los cinco motivos por los que algo no cierra

Ordenados por cuánto rompen.

### C-1 · La foto del deck es anterior a la foto de la base

Todas las diferencias "chicas" van en la misma dirección: **la base tiene más**, porque la
campaña siguió corriendo entre el armado y la descarga.

| dato | deck (armado ~30/07) | base (descarga 31/07) | Δ |
|---|---|---|---|
| Orden Público CC base total | 8.255 | 8.978 | +723 |
| Orden Público CC base llamada | 7.232 | 7.954 | +722 |
| Orden Público CC contactados | 1.901 | 2.169 | +268 |
| Orden Público CC efectivos | 1.514 | 1.766 | +252 |
| Cadetes 27/07 aperturas | 8.894 | 9.116 | +222 |
| 1-11-14 28/07 aperturas | 7.904 | 8.304 | +400 |
| Pareto CC contactados | 1.380 | 1.878 | +498 |

**Esto no es un error de nadie. Es la naturaleza del dato.** Pero define una decisión de
arquitectura que hoy no está tomada:

> El motor necesita **`fecha_corte`** como parámetro de primera clase, y toda validación
> tiene que ser contra una foto fechada. Sin eso, cada corrida va a "no cerrar" por unos
> cientos y nadie va a poder distinguir un bug de las 24 horas que pasaron.

Es exactamente el argumento que dejaba `Snapshot.gs` (hoy vacío) como opcional. Deja de
serlo.

### C-2 · Dos filas mal cargadas rompen el match por `id_cuenta`

**Caso A — el envío más grande de 1-11-14 no tiene cuenta.**

La fila del 24/07 (215.240 mails, el 52% del volumen de la campaña) está cargada con
`ID Cuentas = "Pieza"` y `Eje` / `Área` = `"Revisar"`.

```
looker suma para 3410:  308.095   (= 24.805 + 112.423 + 170.867)
volumen real:           523.335   (+ 215.240)
```

Un motor que sume por `id_cuenta` **pierde el 41% de la campaña sin avisar**.

**Caso B — el envío GCBA de cadetes tiene el nombre de otra campaña.**

La fila del 20/07 con `id = 3305-JULSEGGJ` (cadetes) se llama
`"Vacunación Antirrabica Animales (17/7 al 21/7)"`. El id está bien; el nombre miente.

**Los dos casos juntos dan la regla:** el `id_cuenta` manda y el nombre no se usa nunca
para decidir pertenencia — pero hace falta un control explícito de **filas con métricas y
sin `id_cuenta` válido**, que hoy no existe y que habría cazado el caso A al instante.

### C-3 · El agregado suma universos de JM y aperturas de JM+GCBA

Verificado en las dos campañas, exacto al dígito:

**Cadetes, fila GLOBAL:**
```
enviados   352.487 = 163.749 + 40.293 + 148.445        ← sólo JM
entregados 348.035 = 163.348 + 37.876 + 146.811        ← sólo JM
aperturas  165.688 = 101.422 + 6.685 + 8.894 + 48.687  ← JM + GCBA
clics          893 =     478 +    55 +   147 +     213 ← JM + GCBA
```

**1-11-14, fila GLOBAL:**
```
enviados   410.912 = 215.240 + 24.805 + 170.867        ← sólo JM
aperturas  181.415 = 123.884 + 1.151 + 7.904 + 48.476  ← JM + GCBA
```

Dos campañas, cuatro métricas, patrón idéntico. **No es un error de copiado: es una
convención.** Y tiene sentido — el envío GCBA va a *no apertores del envío de JM*, así que
sumar su universo duplicaría gente, pero sus aperturas son impacto nuevo.

Lo que importa: **es la diferencia entre 352.487 y 447.712** (lo que da Looker sumando
todo). Hay que confirmarla con el equipo y escribirla en `REGLAS_NEGOCIO.md`, porque el
motor no la puede adivinar y el %OR que sale (48%) mezcla numerador y denominador de
universos distintos.

### C-4 · El POST digital no vive en las bases

San Cristóbal y Retiro: el PRE está completo y exacto en `DESGLOCE`; el POST (94.955 y
43.205 de impresiones para San Cristóbal; 284.353 y 75.021 para Retiro) no aparece en
ninguna solapa. Se carga a mano desde los paneles de plataforma.

Mientras siga así, el bloque POST de Uno a uno **no se puede automatizar** y hay que decidir
si emite `«FALTA:token»` o si se le agrega una hoja de carga manual.

### C-5 · "M2" en la lámina no es el `Eje` de las bases

La lámina 25 lista 11 campañas como M2. Entre ellas:

- *Cortes y desvíos AU Dellepiane* → en `Directa Mail`, `Eje = Movilidad`
- *Inauguración Centro de Diagnóstico Porteño* → `Eje = Cuidado`

Filtrando `Eje = M2` en la ventana 24–30/07 dan **19 envíos / 894.797 enviados**, contra
los **18 envíos / 995.194** de la lámina. No coincide ni por arriba ni por abajo.

**Es la confirmación empírica del criterio `CAMPANAS` con `mostrar=sí`.** La lista es
curada. No hay filtro que la reproduzca, y buscarlo es tiempo perdido.

---

## 5. Lo que directamente no tiene fuente

| bloque | lámina | qué falta |
|---|---|---|
| Ministros semanal | 23 | 685.623 entregados / 153.401 aperturas / 1.196.316 impresiones. Ninguna agregación probada lo reproduce (por cuenta da 750.528; por envíos de la ventana, 701.493). Falta saber **qué encuentros entran y con qué recorte**. |
| M2 semanal | 25 | ver C-5 |
| Registro Civil | 28 | 3.061 enviados / 9 campañas. **Cero filas** de Registro Civil en las cuatro bases. Fuente desconocida — probablemente automatizaciones de MailUp. |
| Habitantes del eje | 21 | 596.482. RDV tiene población por comuna (Comuna 13 = 126.831); el eje agrupa varias y no hay tabla de ejes. |
| Todo DGAYD | 4–10 | escucha social. Quinta fuente, sin mapear. |

---

## 6. Impacto sobre el plan

| documento / decisión | qué cambia |
|---|---|
| `Paso-2.9 v2` Parte B | **Deja de ser bloqueante.** El lector está bien. Se convierte en "arreglar `filas_datos`". |
| `SOLAPAS` | `M2 periodo DIRECTA/DIGITAL` y las dos `Mail per` bajan a `uso=referencia`. Saca 4 de las 9 en `revisar`. |
| `Snapshot.gs` | Deja de ser opcional. `fecha_corte` es requisito (C-1). |
| `MARCADORES` | `ecv_insc_ivr` ← `rdv/IVR`. `ecv_insc_digital` ← `rdv/RRSS` (**no** digital). |
| `REGLAS_NEGOCIO.md` | Nueva R-03: agregado JM/GCBA (C-3). Nueva R-04: el id manda, el nombre nunca (C-2). |
| `REUNIONES` | Falta `bloque` y `orden_informe`. `mostrar` necesita el estado `pendiente`. |
| `CAMPANAS` | Confirmado empíricamente. Sin cambios. |
| Corte vertical (Parte G) | **Orden Público 28/07 es el mejor candidato**: 12 tokens verificados al dígito entre RDV, Mail e IVR, todos por caminos distintos. |

---

## 7. Preguntas para el equipo

Ordenadas por lo que desbloquean.

1. **¿La fila GLOBAL suma a propósito los universos de JM y las aperturas de JM+GCBA?**
   (C-3). Desbloquea todos los agregados de campaña.
2. **¿Qué encuentros entran en la lámina de Ministros y con qué recorte** — ¿los del
   temario, los `Realizada`, los que tuvieron envío en la ventana? La lámina lista 11
   incluyendo cuatro que en RDV figuran `en agenda` sin asistentes.
3. **¿De dónde salen las métricas de Registro Civil?**
4. **¿Quién carga el POST digital de los Uno a uno y desde dónde?** (C-4)
5. **¿La columna `Nomenclatura` de `Directa Mail` sirve para distinguir
   convocatoria / pre / post / refuerzo?** Si sí, resuelve §3.3 sin agregar nada.
6. Avisar de las dos filas mal cargadas (C-2) para que las corrijan en origen.
7. **DGAYD: ¿de qué herramienta salen las 7 láminas de escucha social?**

---

## 8. El principio, tercera aparición

El handoff del 30/07 lo dejó así: *el modo de falla caro no es el que rompe, es el que
devuelve un número plausible.*

Esta validación lo encontró dos veces más, y las dos habrían pasado inadvertidas:

- **`Digital: 180` del iceberg es `RRSS` de RDV**, no digital. Cablearlo a la fuente
  digital habría dado un número perfectamente creíble y de otra magnitud.
- **El envío del 24/07 de 1-11-14** no tiene `id_cuenta`. Una suma por id devuelve 308.095
  con total naturalidad. Nadie mira dos veces un número de seis cifras.

Y una tercera, en la dirección contraria y más incómoda: **la hipótesis del colapso del
lector también era plausible.** Explicaba cuatro síntomas con una causa, se derivaba de un
buen instinto metodológico, y era falsa. La única defensa fue abrir el archivo y contar.
