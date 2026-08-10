# VALIDACIÓN — dos semanas de `JM` contra las bases, y contra los decks publicados

> **Congelado.** Nadie lo edita: si hay una corrida nueva, se crea otro
> (`CLAUDE.md` §7). Su par de casos es **`docs/casos_validacion_2026-08-09_addendum.csv`**,
> **55 casos** numerados `V-38`+, `C-01`+, `X-10`+, `A-01`+. Eran 43 al escribirse; el 10/08
> entraron `A-01`…`A-03`, `C-12`…`C-18`, `V-64`…`V-66`. **Ninguna fila previa se editó** —
> verificado con diff antes de pisar el archivo.
>
> Sesión del 09/08/2026. Material: los decks publicados de las semanas **24/07–31/07** y
> **31/07–06/08**, con sus bases del mismo período. Repo leído en `d24a07e`.
>
> **Reemplaza a nada.** Es el segundo de su serie: el primero es
> `docs/VALIDACION_2026-07-31.md`, que midió el informe `SECCO/SSCDI` del 31/07. Éste mide
> **`JM`**, y por primera vez **dos semanas seguidas**, que es lo que deja ver los patrones
> que una sola no muestra.

---

## 0. Titular

**Los bloques de mail y SMS del resumen ejecutivo reproducen exacto, al dígito.** Es la
primera vez que `R-15` —el corte JM/GCBA por canal— se verifica **contra los valores
publicados** y no sólo contra la partición de filas: `V-53`…`V-58` y `V-61`…`V-63`.

Y hay tres cosas que no cierran, cada una de un tipo distinto:

1. **Un error publicado** que la base no tiene: la lámina 17 del deck del 07/08 dice
   *Quirós*; las dos solapas de `rdv` dicen **Francisco Quintana**, misma fecha y dirección
   (`C-07`).
2. **Un universo distinto del que el motor calcula** en el agregado semanal (`C-01`…`C-04`).
   No es un defecto: es una regla que faltaba, y salió `R-21`.
3. **Tres números que no se pudieron reproducir desde ninguna fuente registrada** — los
   `imp_*` del resumen ejecutivo. Ver §4, que es lo que queda abierto.

---

## 1. Lo que reproduce exacto

**Mail, corte JM (`V-53`…`V-55`)** — `digital/Directa Mail`, filtro
`mail_remitente=jorge.macri@buenosaires.gob.ar`, ventana 24/07–31/07:

| token | publicado | medido |
|---|---|---|
| `mail_envios` | 8 | 8 ✅ |
| `mail_entregados` | 831.604 | ✅ |
| `mail_aperturas` | 196.573 | ✅ (24 % sobre entregados) |

**Mail, corte GCBA (`V-56`…`V-58`)** — el complemento exacto: **8 JM + 91 GCBA = 99 filas**
de la ventana. `gcba_mail_entregados` 3.477.476 y `gcba_mail_aperturas` 986.057, las dos
exactas. **Esto verifica la consecuencia 1 de `R-15`**: GCBA por resta, sin columna propia.

**SMS (`V-61`…`V-63`)** — `digital/Directa SMS`, **sin corte por figura**, que es lo que
`R-15` ya declaraba (SMS no tiene columna y va entero a GCBA). 1 envío, 51.706 entregados,
1.076 clics.

**Agregado semanal `ecv_*` (`V-38`…`V-45`)** — `rdv/RVD JM-CM - ES`, `Figura=Jorge Macri`,
`STATUS=Realizada`, sobre el universo **del temario**: 2.445 inscriptos, 497 asistentes,
5 encuentros, y el desglose por canal cerrando al peso contra el total (`V-45`, la identidad
`Mail+CC+IVR+RRSS+Difusión = Inscriptos`).

**Y una duda vieja que queda cerrada dos veces:** `ecv_insc_digital` sale de la columna
**`RRSS`**, no de una fuente digital (`V-40`, que confirma `V-09` del 31/07). El `MAPEO` vivo
ya lo dice — `rdv/RVD JM-CM - ES/insc_digital → columna O`, notas *"header real RRSS — duda
resuelta"*.

---

## 2. El error publicado

**`C-07`.** La lámina 17 del deck del 07/08 atribuye un encuentro a **Quirós**. Las **dos**
solapas de `rdv` —`RVD JM-CM - ES` y `RDV_otros_ministros`— dicen **Francisco Quintana**, con
la misma fecha (06/08) y la misma dirección. **Son personas distintas.**

No es un problema del motor: el motor todavía no publica esa lámina. Es un dato para el
equipo, y la razón por la que conviene que el motor la publique.

---

## 3. El universo del agregado — de acá salió `R-21`

**`C-01`…`C-04`.** El motor, filtrando por la ventana 24/07–30/07, publica **4 encuentros**
con 2.307 inscriptos. El deck publicado **también dice 4**, pero **son otros cuatro**: el
deck incluye San Cristóbal 23/07 y no incluye Caballito 29/07; el motor hace lo contrario.

**El número coincidía y el universo no.** Es el modo de falla que `CLAUDE.md` §4 nombra: un
número correcto sacado de las filas equivocadas, sólo que acá ni siquiera se notaba porque
el total de encuentros daba igual.

**El patrón se repite y por eso es regla, no anécdota:** San Cristóbal 23/07 se publicó en el
informe del 31/07, y Caballito 29/07 en el del 07/08 (`C-04`). **El encuentro se informa con
un informe de retraso, dos veces.** Una selección temporal no puede reproducir eso; una lista
curada sí.

**Encuadre corregido.** El `_10` decía que esto *"contradice a `R-17`"*. **No.** `R-17` dice
literalmente que la ventana sigue rigiendo los agregados `ecv_*`. El motor estaba haciendo lo
que `R-17` manda. Lo que faltaba era la regla — es **`R-21`**, y `R-17` recibió su
**Addendum 1** para acotar el recorte de los agregados.

---

## 4. Lo que NO se pudo reproducir — y es lo que queda abierto

### 4.1 Los `imp_*` del resumen ejecutivo

`X-10` declara `imp_total = imp_meta + imp_google + imp_prog = 716.650 + 531.403 + 5.194.898
= 6.442.951`. **Ninguno de los tres se pudo reproducir.**

Medido el 09/08 sobre `digital/CAMPAÑAS_DESGLOCE_DIGITAL` (4889 filas, `uso = fuente`,
legible, **cero filas en `MAPEO`**), que es la única solapa registrada con `Plataforma` e
`Impresiones` juntas:

- De las **436 filas que solapan la ventana 24–31/07**, la columna `JM | GCBA | POLICIA` da
  **GCBA 431, `Sin Tipo` 5 y JM cero**.
- Las filas `JM` de esa solapa **existen —107 en total— pero se cortan en abril de 2026**.
  Ninguna en julio ni en agosto.
- Cruzando por `Id cuentas` contra las 166 cuentas JM de `digital/Digital`: **34 filas en
  toda la historia, 0 en la ventana.**

**Los tres números no salen de ahí con ningún corte JM.** La otra candidata registrada es
`looker/DIGITAL` (4591 filas, `Plataforma` + `Impresiones`), que **hoy es ilegible para el
motor**: `looker` es `modo_periodo = filtrar` y esa solapa no tiene `fecha_periodo` en
`MAPEO`. **De dónde salieron esos tres números sigue sin saberse.**

### 4.2 Un hallazgo que salió de buscar lo anterior

**Las columnas `Google`, `Programmatic` y `Meta` de `digital/Seguimiento digital` son
booleanos de texto** — `"true"` / `"false"`, **cero valores numéricos** en 950+ filas. Y los
seis marcadores `pauta_*` / `gcba_pauta_*` están cableados sobre ellas con
**`operacion = SUMA`** y `tipo_esperado: numero`.

**`SUMA` sobre `"true"`/`"false"` no puede dar 9, 7 ni 14**, que es lo que `X-11` pide para
`contenidos_total`. Contar los `true` en la ventana tampoco reproduce (da 1/1/1). **Sea cual
sea el número correcto, los seis `pauta_*` están publicando algo que su fuente no puede
producir.**

### 4.3 El bloque de Call Center

`V-` no cubre CC porque **no se pudo medir desde el motor**. El cruce que reproduce los
valores publicados —`Base barrida` 4726+1285 = **6.011** y contactados 1380+498 = **1.878**,
sobre `3289-JUNJDGAG`— se hizo **fuera del motor**, y no es replicable adentro hoy:

- `looker/CC` no tiene ninguna fila en `MAPEO`, y `looker` es `filtrar` sin `fecha_periodo`
  en esa solapa.
- **`looker/Cuentas` tiene `uso = ignorar`** — `CLAUDE.md` §2 prohíbe leerla, y su nota
  declara por qué: es el origen de `resumen_metricas_dinamico`, así que cruzarla es **doble
  conteo**.
- `nombre_campaña` **no existe como campo lógico** en ninguna base, y **`looker/CC` no tiene
  esa columna** (`ID Cuentas · Base enviada · Base barrida · Contactados · Efectivos`).

**El número es sólido; el camino de cableado no existe.** Son dos preguntas distintas y
conviene no confundirlas.

Lo que sí quedó decidido con evidencia: ~~`cc_base` es `Base barrida`, no `Base enviada`
(que da 6673 sobre la misma cuenta)~~ — **CERRADO el 10/08 por `C-17`, con `C-18` al lado.** Ver
abajo. Y *"2 campañas"* son **las dos filas de CC de una cuenta**, no dos cuentas.

#### `cc_base` — cerrado el 10/08, con dos evidencias independientes y su límite

**Es `Base barrida`.** Lo cierra `C-17`, y lo que lo hace un cierre y no una preferencia es que
son **dos números publicados del mismo deck que no se derivan uno del otro**:

| caso | evidencia |
|---|---|
| `V-64` | `cc_base` = **6.011** — `Base barrida` 4726 + 1285 sobre `3289-JUNJDGAG`. Con `Base enviada` daría 6.673 |
| `V-66` | `cc_contact_pct` = **31 %** — `1878/6011` = 31,2 % redondea a 31 (publicado). Con `Base enviada`: `1878/6673` = 28,1 % → **28 %** |

**`V-66` es lo que convierte la coincidencia en confirmación:** el porcentaje **no se deriva del
otro número publicado**, así que confirma en vez de repetir. Y la semántica acompaña —*discada =
barrida* es lo efectivamente marcado; *enviada* es la base cargada—, que es lo que hace que el
número y el significado apunten al mismo lado.

⚠ **`C-18` es el límite, y va pegado al cierre porque sin él la afirmación viaja más fuerte de lo
que se midió:** el deck del 07/08 **no publica ningún bloque de Call Center**, así que esto está
**confirmado por dos números de UN deck, no por dos decks**.

### 4.4 `IVR` en esta ventana

`C-11`: **cero filas de IVR** en la ventana 24/07–31/07. El bloque IVR del resumen ejecutivo
es posterior a este deck y hay que validarlo contra una semana que lo publique.

---

## 5. Lo que esta validación cambió en el repo

| salió de acá | dónde quedó |
|---|---|
| `R-20` — `en agenda` cuenta para contar, no para sumar | `REGLAS_NEGOCIO.md`, **marcada `SIN MECANISMO`** |
| `R-21` — prioridad de selección de encuentros | `REGLAS_NEGOCIO.md` |
| `R-17 Addendum 1` — el recorte de los agregados | `REGLAS_NEGOCIO.md` |
| `R-15 Addendum 2` — CC e IVR son un canal con dos etapas | pendiente: Parte B del `_10` |
| el operador `CONTIENE` | pendiente: Parte B del `_10` |
| `C.4` retirado | `PENDIENTES_consistencia.md` |
| los `pauta_*` sobre columnas booleanas | §4.2, **sin pendiente propio todavía** |

---

## 6. Qué NO se midió acá, para que no se lea de más

- **No se re-midió nada del `31/07`.** Este documento no revisa `VALIDACION_2026-07-31.md`.
- **No se corrió el motor sobre estas dos ventanas.** Los "publicado" salen de los decks y
  los "medido" de las bases; lo que el motor produciría hoy **sólo se verificó en los casos
  `C-01`…`C-03`**.
- **No se leyó ninguna solapa `uso = ignorar`**, así que todo lo que dependa de
  `looker/Cuentas` quedó fuera del alcance por regla, no por olvido.
