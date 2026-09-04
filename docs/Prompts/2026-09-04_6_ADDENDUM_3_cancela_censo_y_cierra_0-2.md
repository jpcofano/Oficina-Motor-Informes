# Addendum 3 — `2026-09-04_6_guiones_contra_deck_equipo.md`

**Fecha:** 04/09/2026 · **Cancela `censarM2Vivo()`. Cierra la Parte 0.2 por otro lado.**

⚠ **Declaración de límite.** El clon de esta sesión no se pudo actualizar (`git clone` falló por
red). Lo que sigue se leyó de un clon de hoy más temprano: **el ítem 36 no está en él**, así que
sobre el ítem 36 no se afirma nada — se afirma sobre lo que sí está escrito en `docs/PLAN.md` y
`docs/BITACORA.md`. **Reverificar contra el clon actualizado antes de ejecutar.**

---

## 1 · `censarM2Vivo()` ya no decide nada. No correrlo.

El log de `aplicarCambios0409()` cerró la pregunta: los siete `m2_*` tenían `_revisar` a las 14:05
y el deck de `jm` es de las 11:42. **Los guiones de M2 salen del `_revisar`.** Rama 2. Punto.

Lo único que el censo agregaría es si esas filas son `jm` o `'*'`, y eso sólo serviría para
explicar por qué `secco` salió limpio. Pero esa pregunta tiene **dos** salidas más baratas y
**cualquiera de las dos alcanza**:

- si las filas son `jm`, `secco` lee otras y no hay nada que explicar;
- si `secco` corrió después de las 14:05, salió limpio porque ya estaban limpias — sin importar el
  `informe_id`.

⭐ **Y el propio reporte de Code lo dice sin sacar la conclusión:** aun con rama 1 haría falta
fechar el deck. ⇒ **El censo no cierra nada solo.** Un paso que no puede cerrar por sí mismo, en
una pregunta cuya respuesta ya no cambia ninguna decisión, no se corre: los seis `m2_*` están
limpios desde las 14:05, ya salieron del alcance de la Parte C, y su validación descansa en `V-124`
más el cierre contra el deck del equipo — nada de eso depende del `informe_id`.

⚠ **Si más adelante hace falta saber si los `m2_*` son `jm` o `'*'`**, se pregunta ahí y por su
propio motivo. Guardar `censarM2Vivo()` sin correrlo está bien; correrlo hoy es gastar el turno en
la pregunta que ya se contestó.

---

## 2 · Lo que sí cierra la Parte 0.2 · **Opus** · effort alto

`docs/PLAN.md` registra que el 01/09 se levantó el `_revisar` de **18** marcadores, con backup
`_BACKUP_MARCADORES_2026-09-01_1130_levantar`. Y `docs/BITACORA.md` registra la otra mitad de ese
mismo día: **76 marcadores marcados como sospechosos mirando `MARCADORES.notas` sola**, de los que
18 se revirtieron medio día después porque el CSV decía lo contrario.

⇒ **El 01/09 hubo una aplicación masiva que PUSO `_revisar`.** Neto ~58, contra los **54** que el
censo de la Parte 0.1 encontró marcados hoy y limpios el 31/08. ⚠ **54 y 58 no son el mismo
número**: cuadrarlo es parte del trabajo, no un detalle. Algunos de los 76 podían ya tenerlo.

### La pregunta, en una línea

> ⭐⭐ **¿Están los 24 `u1_*` de `L-053` entre los que el 01/09 marcó?**

Si están, `L-053` queda explicado entero y la Parte 0.2 se cierra: `confirmarNumerosDeUnoAUno()`
los limpió el 26/08 y la aplicación masiva del 01/09 se los repuso.

### Cómo medirlo

- Comparar el backup `_BACKUP_MARCADORES_2026-09-01_1130_levantar` contra la hoja viva **en la
  columna `formato`**, y contra `docs/_snapshots/MARCADORES_2026-08-31.tsv`.
- Reproductor del lado del snapshot, para el 31/08:

```bash
awk -F'\t' 'NR>1 && $12 ~ /_revisar/ {print $1"\t"$3}' \
  docs/_snapshots/MARCADORES_2026-08-31.tsv | sort
```

- **Control positivo:** la lista de los 24 `u1_*` ya existe en `FORMATOS_SIN_REVISAR_L053_`
  (`Instalar.gs`). Usarla como conjunto de referencia — no reescribirla a mano.

**Reportar y parar.**

---

## 3 · ⭐⭐ El hallazgo que hay que escribir aunque la medición dé que no

Si la aplicación del 01/09 repuso el `_revisar` sobre los 24 `u1_*`, entonces **una decisión del
usuario ya aplicada —la del 26/08— fue deshecha por una aplicación masiva posterior, y nada lo
detectó durante ocho días.** El deck lo mostró todo ese tiempo y se leyó como si fuera lo esperado.

Eso no es un bug de M2 ni de `L-053`: es que **el estado de una celda de `MARCADORES` no tiene
dueño único**, y dos escritores legítimos —una decisión puntual y un cruce masivo— se pisan sin
que el segundo sepa del primero.

⇒ Registrar como decisión o regla —no como nota— en el documento que el ruteo de `CLAUDE.md` §7
señale como dueño. La forma que la hace verificable después:

> **Una aplicación masiva sobre `MARCADORES.formato` tiene que declarar qué filas toca y compararlas
> contra las decisiones puntuales ya aplicadas, antes de escribir.** El registro de esas decisiones
> es el conjunto de funciones `confirmar*()` de `Instalar.gs` y los CSV fechados.

⚠ **Escrita como condición, no como estado.** *«El `_revisar` de `L-053` está levantado»* vence
sola y venció. *«Ninguna aplicación masiva posterior al 26/08 tocó las 24 filas de
`FORMATOS_SIN_REVISAR_L053_`»* es algo que un censo puede mirar.

Y la consecuencia inmediata, que vale medir en la misma pasada:

⇒ **Las diez que se aplicaron hoy a las 14:05 corren el mismo riesgo.** Si existe un cruce masivo
que se vuelve a correr, se las lleva puestas igual. **Verificar que sigan limpias** después de
cualquier aplicación futura no es paranoia: es el único control que distingue una limpieza que
duró de una que se deshizo.

Un commit, separado del de código.

---

## 4 · Lo que queda del `_6` después de esto

| parte | estado |
|---|---|
| **0.1** | ✅ corrida — 90 con `_revisar` |
| **0.2** | la cierra la sección 2 de este addendum |
| **A** | ✅ **rama 2 confirmada** para M2. Para `L-053`, la decide la sección 2 |
| **B** | **agregar filas** al CSV del 04/09 (ya existe con `V-125` y `C-87`) |
| **C** | alcance reducido a **cuatro**: sólo el global de `L-047` |
| **D** | sin cambios |

⭐ **Y el ítem 33 pasó su control**, con el deck de `secco` de dos campañas: dos bloques
`L-016`…`L-023`, `L-024` una sola vez, títulos **y números** distintos por bloque. Va al CSV del
04/09 como caso, con el deck nombrado y fechado.

⛔ **Lo que ese mismo control dejó abierto, y no es lo que se creía:** `L-023` no publica el título
de campaña **porque la lámina no declara el token** —en el XML hay runs vacíos donde iría— y pasa
igual en `jm` (`L-048`) y en los dos bloques por igual. **No es el pintado por presentación.** Es
más barato de lo que se anotó.
