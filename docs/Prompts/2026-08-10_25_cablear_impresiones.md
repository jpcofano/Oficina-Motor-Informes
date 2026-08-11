# `_25` · Cablear las impresiones, y cerrar el `P0` sin construir un derivado

> **Modelo por parte.** `A` Sonnet · `B` Sonnet · `C` **Opus, effort alto** · `D` **Opus, effort
> alto** · `E` Sonnet.
>
> `C` y `D` mueven números que van a un deck. `A`, `B` y `E` son forma, mapeo y documentación.
>
> **Code no compara ningún valor contra un informe publicado.** Reporta el número y el conteo de
> filas; la confrontación con el deck es de la ventana de validación, con caso numerado.

---

## 0 · Las dos decisiones que trae este prompt

### 0.1 · Los filtros, ya decididos y sin margen

Con `R-23`, `R-24`, `R-25` y el `&&` del `_24`, los seis tokens quedan escritos sin inventar nada:

| token | filtro |
|---|---|
| `imp_meta` | `nombre_campaña~=JM && estado=Activa && Plataforma=Meta` |
| `imp_google` | `nombre_campaña~=JM && estado=Activa && Plataforma=Google ads` |
| `imp_prog` | `nombre_campaña~=JM && estado=Activa && Plataforma!=Meta && Plataforma!=Google ads` |
| `gcba_imp_meta` | `nombre_campaña!~=JM && …` — idem, con el corte invertido |
| `gcba_imp_google` | idem |
| `gcba_imp_prog` | idem |

Todos: base `looker`, solapa `DIGITAL`, columna `Impresiones`, operación `SUMA`, ventana por
referencia a `Cuentas`.

**`imp_prog` va por resta y no por lista** (`R-24`): una lista explícita estaba incompleta el mismo
día que se escribió — Twitch y Uber aparecieron, y Twitch con un espacio al final.

### 0.2 · El `P0` se cierra sin operación nueva — decisión del coordinador

**El motor no tiene derivación.** Las siete operaciones de `OPERACIONES_` agregan filas de una
solapa; **ninguna suma otros tokens.** Retirarle la fuente a `imp_total` lo dejaría publicando
`«FALTA»` para siempre.

**Y no hace falta construirla.** Lo que el `P0` objetaba no era que `imp_total` tuviera fuente: era
que tenía **otra** fuente —`resumen_metricas_dinamico`— y que eso era un segundo camino al mismo
número, destinado a divergir. La solución es apuntarlo a la fuente correcta:

> **`imp_total` es `SUMA` sobre `looker/DIGITAL.Impresiones` con
> `nombre_campaña~=JM && estado=Activa`** — la misma solapa, el mismo corte, **sin la condición de
> plataforma**.

**Y ahí aparece un control gratis, que es el argumento fuerte de esta decisión:** por `R-24`, las
tres plataformas **particionan el universo** — Meta, Google ads, y todo lo demás por resta,
incluida la fila con `Plataforma` vacía. Entonces:

```
imp_total  ==  imp_meta + imp_google + imp_prog
```

**tiene que dar exacto, en cada corrida.** No es un derivado con un solo camino: son dos caminos
sobre la misma fuente que **no pueden diferir salvo por un bug**, y esa igualdad es el control de
que la partición por resta sigue siendo una partición. Un derivado de verdad no habría dado esa
red.

Idéntico para `gcba_imp_total` con `nombre_campaña!~=JM`.

**El contrapunto, que va escrito al lado:** si algún día el filtro de plataforma dejara de
particionar —por ejemplo, si alguien cambiara `imp_prog` a una lista explícita—, la igualdad se
rompería. **Que se rompa es el punto.** Va como control corrible, no como comentario.

---

## A · Verificación de premisas — Sonnet, sólo lectura

**A.1** `looker/DIGITAL` tiene hoy sólo `clave_ventana` en `MAPEO`. Confirmar, y confirmar que
`nombre_campaña`, `estado`, `Plataforma` e `Impresiones` **no están**.

**A.2** Las columnas son `F`, `I`, `B` y `C`. **Verificarlo contra la solapa viva**, con el
encabezado exacto de cada una. `V-67` las midió sobre el fixture del 31/07 y ya sabemos que el
fixture y la viva difieren en volumen. **Y atención al encabezado**: `Cuentas` dice `id_cuentas` y
`DIGITAL` dice `Id cuentas` — el desajuste que ya costó una medición en falso.

**A.3** Qué filas de `MARCADORES` existen hoy para los ocho tokens —los seis por plataforma más
los dos totales—: cuáles existen, a qué apuntan, con qué filtro y en qué estado quedan hoy.

**A.4** Confirmar que `imp_total` y `gcba_imp_total` siguen apuntando a
`resumen_metricas_dinamico` y **nadie los tocó** desde que se anotó el `P0`.

**A.5 · La predicción, antes de tocar nada.** Sobre la ventana en curso, para cada uno de los
ocho: cuántas filas quedan tras el filtro. **Filas, no importes** — un conteo de filas no es un
número publicado. Ya hay medido: 966 en ventana, 63 JM, 382 `Activa`, 51 las dos, con Meta 16,
Google ads 14, DV360 21. **Faltan las tres chicas y las de plataforma vacía**, que son las que
`imp_prog` absorbe por resta y las que la enumeración perdía.

**Si A.1 a A.4 confirman, seguir sin volver a preguntar.**

---

## B · Las cuatro filas de `MAPEO` — Sonnet

`nombre_campaña` (`F`), `estado` (`I`), `Plataforma` (`B`), `Impresiones` (`C`), sobre
`looker/DIGITAL`.

**Por el camino del seed, no escribiendo la celda a mano** — el precedente ya se cobró una:
`aplicarClasificacionSolapas_` pisa toda fila `origen = seed` en cada corrida.

**Con `tipo_esperado` declarado**, y ahí `Impresiones` es la que importa: si llega como texto, la
`SUMA` devuelve cero **sin fallar**. Reportar el tipo real de las celdas antes de declararlo.

---

## C · El cableado — Opus

Los seis tokens por plataforma, con los filtros de §0.1.

**Predicción escrita antes, medición después, las dos columnas al lado.** Reportar por token: el
valor, el conteo de filas, y la traza completa.

**Los tres controles que tienen que cerrar en la misma corrida:**

1. **`imp_meta + imp_google + imp_prog` = la `SUMA` sin condición de plataforma.** Es §0.2 medido
   antes de que `imp_total` lo use.
2. **JM + GCBA = total**, sobre el mismo corte y la misma ventana, sin solapamiento y sin resto.
   Es `R-23` aplicado a la ventana, el mismo control que cerró en el cableado anterior.
3. **Ninguna fila cae en dos tokens.** Meta y Google ads son igualdades exactas y `imp_prog` es su
   negación conjunta: la partición es por construcción, **pero medirla es lo que detecta un
   `Plataforma` con espacio al final del lado equivocado.**

**Si un control no cierra, parar antes de la Parte D.** `imp_total` descansa en la partición.

---

## D · El `P0` — Opus

Re-apuntar `imp_total` y `gcba_imp_total` a `looker/DIGITAL` con el filtro de §0.2. **Por
`curarCamposMarcadores_`**, que no pisa si el valor coincide y devuelve anterior/nuevo — el mismo
camino declarado que se usó la vez anterior. **Cero filas creadas. Snapshot previo.**

**Y la nota de esas dos filas registra el movimiento entero**, porque estos dos números ya
estuvieron publicando desde una fuente equivocada con estado `ok`: **qué valor tenían, con qué
fuente, con qué recorte, y desde cuándo.** Un número que cambió sin que la nota lo diga es peor
que uno que nunca se cableó, porque parece verificado.

**El control de §0.2 va a `Pruebas.gs` como caso corrible**, no como comentario: `imp_total` menos
la suma de los tres tiene que dar cero. El día que alguien convierta `imp_prog` en una lista
explícita, **tiene que fallar ahí y no en un deck**.

---

## E · Documentación — Sonnet

- **`BITACORA.md`** — las predicciones y las mediciones de `A.5`, `C` y `D`, con fecha y hora de
  lectura, y los tres controles con su resultado.
- **`PENDIENTES_consistencia.md`** — cerrar el `P0` citando este prompt. **Tachado, no borrado.**
- **`PLAN.md`** — la decisión de §0.2 con lo descartado al lado —construir una operación de
  derivación— y **el número que esté libre al escribirla**. No anunciarlo antes.
- **Para la ventana de validación**, sin medirlo acá: los seis valores y sus conteos de filas
  quedan en el reporte para que `A-01` a `A-03` se confronten allá. Y **`X-16`/`C-12` siguen
  abiertos** — el conteo de `pauta_*` cambió de universo con `R-25` y hay que reprobar las cuatro
  unidades.

### Criterios de aceptación

1. Los tres controles de `C` cierran.
2. Ningún token de impresiones apunta a `resumen_metricas_dinamico`.
3. El control de partición está en `Pruebas.gs` y pasa.
4. Las notas de `imp_total` y `gcba_imp_total` dicen qué valor tenían y desde cuándo.
5. Ninguna plantilla tocada. `LAMINAS` intacta, `verificarLaminas()` verde.

---

## Lo que queda después

Las láminas 2 y 3 pasan a tener sus impresiones. **Siguen esperando `pauta_*`** —`C-12` abierto— y
`frecuencia` e `ivr_*`, que están en `digital/Digital` y quedaron en `ignorar` por `R-22`.

Y recién con eso corrido tiene sentido volver a la Parte D del `2026-08-09_1`: **ahí la cobertura
de esas dos láminas efectivamente habrá cambiado**, que es la condición que el `1.4` §2 exige y que
el `19.1` encontró incumplida.
