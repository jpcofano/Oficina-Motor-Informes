# Addendum · 2026-08-22 · Paso `2026-08-22_22` — el agregado NO es diseño nuevo

**Fecha:** 2026-08-22, con la Parte 0 corrida.
**Addendum a:** `docs/Prompts/2026-08-22_22_agregado_temario_ivr_ventana.md` — **que no se edita.**

---

## ⛔ 0 · La premisa del prompt estaba mal, y el error es del prompt

El `_22` planteó el agregado de `L-034` como una **pregunta de diseño abierta**. No lo es. Está
decidido y escrito **desde el 09/08/2026**, y el prompt no cruzó las `R-NN` antes de preguntar.

| regla | qué dice | fecha |
|---|---|---|
| `R-21` | El universo de encuentros se resuelve en cascada; **el temario es el nivel 1** y *"la fecha del encuentro **no** decide si entra"* | 09/08 |
| `R-17` Addendum 1 | *"el agregado `ecv_*` suma los encuentros que **`R-21`** seleccionó, no los que caen en la ventana. Es el agregado **de los encuentros del informe**"* | 09/08 |

Y `R-21` lleva desde entonces la marca **`PARCIALMENTE SIN MECANISMO`**, con *"el nivel 1 existe a
medias y el nivel 3 no existe. El código va en el `_12`"*.

⭐ **Entonces el `0.1` no descubrió que falta diseño: confirmó que `R-21` sigue sin implementar
trece días después.** La medición es correcta y vale; la conclusión *"pasa a diseño"* no.

**La Parte A se reencuadra: implementar el nivel 1 de `R-21` para el agregado, no decidir si
hacerlo.**

---

## 1 · Las tres cosas que el `0.3` dejó abiertas ya están contestadas

**⛔ *"Parque Avellaneda es del 12/08, fuera de la ventana"*.** `R-21` nivel 1: la fecha no decide.
Con el temario como universo entra, y **eso es lo correcto**, no un efecto colateral.

**⛔ *"855/186 coinciden con el equipo y anclar al temario los movería"*.** El `0.3` mismo midió por
qué no es un contraejemplo: **el deck del equipo no tiene lámina de agregado semanal**; esos
855/186 están en la lámina del encuentro de Salud. **Son dos preguntas distintas.** Que un total de
la semana coincida hoy con el número de un encuentro es **la señal de que el universo está mal**,
no evidencia de que esté bien. `R-17` Addendum 1 lo dice: es el agregado *de los encuentros del
informe*, en plural.

**⛔ La regla 4 del prompt —controlar contra el deck del equipo— no se puede cumplir**, y el `0.3`
lo demostró. **Se reemplaza:** el control es que `ecv_encuentros` dé **la cantidad de ítems del
temario** —hoy 2, y publica 1— y que `ecv_barrios` los liste a los dos. Se verifica contra
`REUNIONES`, no contra el deck del equipo.

---

## 2 · La ventana del anclaje también está decidida

`ventanaCandidatosAnclajeDias_()` y `ventanaCandidatosAnclajeAmpliadaDias_()`: paso 1 acotado, y
si no resuelve, **paso 2 ampliado**. Configurable, implementado, con su traza (`paso_anclaje`,
`candidatos_anclaje`).

**No se rediscute.** Si algo de un paso futuro parece necesitar cambiarla, primero se cita la regla
y recién después se propone.

---

## 3 · Parte A, reencuadrada · **Opus** · effort alto

Implementar el nivel 1 de `R-21` para el agregado de `L-034`, con lo que el `0.1` midió: los
marcadores tienen tres caminos a las filas y ninguno recibe un conjunto de ítems.

1. **Leer `R-21` entera, incluida su sección *"Estado de implementación"***, antes de escribir una
   línea. Dice qué falta y dónde, y fue escrita para este momento.
2. ⭐ **`SECCIONES.modo = 'agregado'` es hoy una etiqueta muerta** —el `0.1` lo midió: se lee en un
   solo lugar y sólo para preguntar `=== 'repetible'`—, y **las tres secciones que la declaran son
   justamente las de agregado**. Ése es el gancho declarativo que ya existe y nadie conectó.
   Evaluarlo antes de inventar un mecanismo nuevo.
3. **Son 17 marcadores en ese par, no seis** (corrección del `0.2`). Y tres de ellos —`ecv_barrio`,
   `ecv_poblacion`, `enc_evento`— **se emiten también dentro del bloque de encuentro**, donde
   entran por `fila_rdv` y `dimensiones` no se aplica. ⛔ **El mismo marcador se comporta distinto
   según dónde salga: el cambio no puede romper el camino por ítem.** Control positivo para los
   dos caminos.
4. **`ecv_encuentros` deja de contar sobre `inscriptos`.** Cuenta ítems del temario.
5. **`gcba` no se toca**, y el `0.2` lo despejó: cero marcadores cuelgan de la resta sobre `rdv`.
   ⚠ Pero `DIMENSIONES_.ambito.gcba` **sigue declarando** `'rdv|RVD JM-CM - ES': 'figura!=Jorge
   Macri'`, negando una definición que dejará de existir. **Anotarlo**: hoy no cuesta nada y el día
   que alguien cablee un `gcba_*` ahí, cuesta un número.

---

## 4 · Parte B — el IVR perdió su fila de títulos · **Opus** · effort alto

El `0.4` descartó las dos hipótesis del prompt: ni la fila 1 ni la 2 tienen rótulos, las dos son
datos de enero, y **la hoja crece por abajo**. No es `fila_encabezado = 2`.

Las dos salidas que el `0.4` encontró, y **ninguna se ejecuta sin decisión del usuario**:

- **(a) Que el equipo reponga la fila de títulos.** Es su planilla (`C-01`). No cuesta código y deja
  `D-31` con testigo.
- **(b) `fila_encabezado = 0`**, que `SOLAPAS` ya contempla. Recupera la fila perdida y **deja a
  `D-31` sin testigo en esa solapa** — el motor quedaría leyendo por letra sin nada que lo
  contradiga, que es exactamente lo que `D-31` existe para evitar.

**Escribir las dos con su costo en `PENDIENTES` y parar.** Los doce marcadores que el `0.4` listó
se mueven en cualquiera de los dos casos.

---

## 5 · El aviso del panel que afirma algo falso · **parte nueva** · **Sonnet**

El `0.5` encontró que `avisosDeVentanaPropuesta_` dice *"la semana propuesta no tiene fila en
`PERIODOS`"* cuando `agosto_14_20` **es exactamente esa ventana**. Sólo mira si el origen empieza
con `periodo_ref:` y nunca busca una fila que coincida.

⚠ **`CLAUDE.md` ya tiene escrita la lección para este mismo aviso:** *"mostrar una advertencia
equivocada es tan caro como no mostrar ninguna, porque la próxima se lee con la misma
desconfianza"*.

**Arreglarlo**, con lo que el `0.5` propone: el front ya sabe buscar la fila cuya ventana coincide
—`periodoBuscado()` lo hace—, así que el aviso puede decir *"hay una fila que coincide:
`agosto_14_20`, elegila para que el recorte se aplique"*. Accionable en vez de alarmante. Y de
rebote ataca el P1 de la fila 9.

Control positivo: con una ventana que sí tiene fila, el aviso **no** dice que no la tiene.

---

## 6 · Y la instrucción de método, porque es la tercera vez

⛔ **Antes de tratar algo como pregunta abierta, buscarlo en `docs/REGLAS_NEGOCIO.md` y en las
`D-NN` de `PLAN.md`.** Si hay una regla, se cita y se implementa; sólo si no hay ninguna es una
decisión.

Vale para los dos lados: **el prompt del `_22` incumplió esto primero** —preguntó por `D-33` y no
por `R-17`/`R-21`— y por eso el reporte contestó una pregunta que no había que hacer. Que la Parte
0 midiera bien no compensa haber medido lo que ya estaba decidido.
