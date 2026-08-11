# `_23` · La ventana por referencia — el "join" que `C-19` acotó

> **Modelo por parte.** `A` Sonnet · `B` **Opus, effort alto** · `C` **Opus, effort alto** ·
> `D` Sonnet.
> `B` es diseño y `C` decide qué filas entran en la ventana de un número que va a un deck. `A` es
> verificar forma y `D` es documentar.
>
> **No cablea ningún marcador.** Construye la capacidad y la deja verificada; el cableado de
> `imp_meta`, `imp_google` e `imp_prog` es el prompt siguiente.

---

## 0 · El problema, y por qué no es un join

`looker/DIGITAL` tiene todo lo que hace falta para las impresiones **menos el tiempo**:
`nombre_campaña` en `F` resuelve el corte JM, `estado` en `I` resuelve el filtro, `Plataforma` e
`Impresiones` resuelven el desglose. **No tiene ninguna columna temporal** — `fecha_inicio` y
`fecha_fin` viven sólo en `Cuentas` (`C-19`).

Hoy eso hace que `leerFuente` falle con `«FALTA:fecha_periodo@looker/DIGITAL»`, y está bien que
falle: es el modo de falla correcto para una solapa que no puede recortarse.

**Lo que hace falta no es un join, y la diferencia importa para el diseño:**

> **Un join produce filas nuevas. Esto sólo necesita decidir si una fila entra o no.**
>
> `DIGITAL` no toma **ningún dato** de `Cuentas`: no necesita el nombre, ni el estado, ni las
> fechas en la fila. Necesita saber si su `id_cuenta` está **dentro del conjunto** de cuentas que
> caen en la ventana.

Eso tiene una consecuencia práctica que sola justifica el enfoque: **si `id_cuenta` estuviera
repetido en `Cuentas`, un join multiplicaría las filas de `DIGITAL` y las impresiones se contarían
dos veces, sin fallar.** Un conjunto de pertenencia es inmune a eso — un id repetido entra una
vez. **El modo de falla más caro desaparece por construcción, no por cuidado.**

---

## A · Verificación de premisas — Sonnet, sólo lectura

**A.1 · Dónde se decide la ventana hoy.** Reportar el punto de `leerFuente` donde se resuelve
`fecha_periodo`, dónde se decide punto contra solape con `fecha_fin_periodo`, y **qué campos del
resultado describen el recorte** — `criterio_ventana`, `filas_en_ventana`, `filas_sin_fecha` y los
demás. La capacidad nueva tiene que encajar ahí y devolver la misma forma, no una paralela.

**A.2 · Qué pasa hoy con `DIGITAL`.** Confirmar que falla con `FALTA:fecha_periodo` y **no** con
excepción ni con un recorte que no recorta.

**A.3 · La solapa de referencia.** Para `looker/Cuentas`: que `fecha_inicio` y `fecha_fin` estén
mapeados o sean mapeables, y **si `id_cuenta` se repite**. Reportar cuántos ids distintos hay
sobre cuántas filas. **No bloquea** —el diseño es inmune—, pero el número va escrito: es la
evidencia de por qué se eligió pertenencia.

**A.4 · El cruce.** Cuántas filas de `DIGITAL` tienen `id_cuenta` no vacío, cuántas de ésas
aparecen en `Cuentas`, y cuántas quedan huérfanas. **Las huérfanas son el riesgo real de esta
capacidad**: hoy no entran en ninguna ventana y no las cuenta nadie.

**Si las cuatro confirman, seguir a la Parte B sin volver a preguntar.**

---

## B · El diseño — Opus

**Declarativo, y por el camino que ya existe.** El motor ya decide punto contra solape mirando si
la solapa declara `fecha_fin_periodo` en `MAPEO`. Esta capacidad es **la tercera rama de la misma
decisión**, y se declara igual: con campos lógicos, no con código por solapa.

Contrato, con la forma a elegir por Code:

> Una solapa que **no tiene fecha propia** declara **de qué solapa la toma y por qué clave**.
> `leerFuente` lee esa solapa de referencia, la recorta con **su** ventana —punto o solape, según
> lo que ella declare—, arma el conjunto de claves que sobreviven, y deja pasar las filas cuya
> clave está en el conjunto.

**Lo que el diseño tiene que resolver, y son las decisiones de verdad:**

1. **Dónde se declara.** Dos filas de `MAPEO` con campos lógicos nuevos, o dos columnas de
   `SOLAPAS`. **Elegir una y decir por qué**, contra el criterio de `CLAUDE.md` §7: quién es el
   dueño de «¿de dónde saca la fecha esta solapa?».
2. **La recursión.** La solapa de referencia **no puede a su vez referirse a otra.** Un nivel, y
   el segundo falla con motivo propio. Sin ese tope, una referencia circular cuelga la corrida.
3. **Qué dice la traza.** `criterio_ventana` gana un valor nuevo que nombra **la solapa de
   referencia y la clave**. Alguien mirando la traza tiene que poder reconstruir por qué entraron
   esas filas sin abrir el código.
4. **Los tres conteos que no pueden faltar**, porque son los que hacen que un número corto se
   pueda explicar: filas con clave vacía, filas con clave huérfana, y **el tamaño del conjunto de
   referencia**. Son el equivalente de `filas_sin_fecha`, y se reportan aparte por el mismo motivo
   — es `R-20`: **un vacío no es un valor**, y una fila que sale por no tener clave no salió por la
   misma razón que una que salió por fecha.
5. **El costo.** `Cuentas` se lee una vez por corrida, no una vez por marcador. Decir dónde vive
   ese caché y qué lo invalida.

**Reportar el diseño elegido con lo descartado al lado, y seguir.** No parar: la elección entre
`MAPEO` y `SOLAPAS` es de implementación, y `CLAUDE.md` ya habilita decidirla reportando.

---

## C · La implementación — Opus

Sobre el diseño de `B`. **Greppear todo nombre nuevo antes de escribirlo.**

**Predicción antes de medir**, y en las mismas unidades: cuántas filas de `DIGITAL` entran en la
ventana en curso, cuántas quedan por clave vacía y cuántas por huérfana. Escribirlo, después
medir, pegar las dos columnas.

**El control que cierra la capacidad**, y es barato: sobre `looker/Cuentas` —que **sí** tiene
fecha propia— el recorte por referencia contra sí misma tiene que dar **exactamente** lo mismo que
el recorte directo. Si difiere, la capacidad está mal y se ve antes de tocar `DIGITAL`.

**Y el segundo control, contra lo ya validado:** con la ventana resuelta, `A-01` a `A-03` midieron
`imp_meta`, `imp_google` e `imp_prog` sobre este mismo universo. **No compares contra el deck** —
eso es de la rama de validación. Lo que sí se puede es reportar **cuántas filas** quedan tras el
recorte y el corte JM, para que la otra ventana lo confronte con las suyas. **Un conteo de filas
no es un número publicado.**

---

## D · Documentación — Sonnet

- **`REGLAS_NEGOCIO.md`** — la regla nueva junto a `R-16`, que es su hermana: `R-16` decide **cómo**
  se recorta, ésta decide **con qué fecha** cuando la solapa no tiene una. Con la fecha de la
  medición y el conteo de huérfanas.
- **`PLAN.md`** — la decisión de diseño de `B.1` con lo descartado, y el número que esté libre al
  escribirla. **No anunciarlo antes.**
- **`PENDIENTES_consistencia.md`** — las huérfanas de `A.4`, con su conteo. Y **cerrar la entrada
  de la disyuntiva de período de `looker`** que quedó del `_18`: esta capacidad la responde para
  `DIGITAL`.
- **`BITACORA.md`** — la predicción y la medición de `C`, con fecha y hora de lectura.

### Criterios de aceptación

1. `looker/Cuentas` recortada por referencia contra sí misma da **idéntico** al recorte directo.
2. `looker/DIGITAL` deja de fallar con `FALTA:fecha_periodo` y devuelve filas con la misma forma
   de resultado que cualquier otra fuente.
3. Los tres conteos de `B.4` aparecen en la traza y **suman**: en ventana + fuera + clave vacía +
   huérfanas = total de filas leídas.
4. Una solapa de referencia que a su vez declara referencia **falla con motivo propio**, no cuelga.
5. **Ningún marcador cableado. Ninguna plantilla tocada. `LAMINAS` intacta.**

---

## Lo que sigue, y no está acá

Con esto, `imp_meta`, `imp_google` e `imp_prog` quedan cableables: fuente `looker/DIGITAL`, corte
`nombre_campaña~=JM`, filtro `estado=Activa`, plataformas por `R-24` —Meta, Google ads, y el resto
por resta—, ventana por referencia a `Cuentas`.

**Y recién ahí se cierra el `P0`:** `imp_total` y `gcba_imp_total` son derivados (`X-10`, `V-59`) y
se les retira la fuente propia **después** de que existan los tres sumandos, nunca antes. El orden
está escrito desde el `10.1` §3 y no cambió.
