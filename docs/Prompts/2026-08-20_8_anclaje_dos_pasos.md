# 2026-08-20_8 — El anclaje de reuniones busca en dos pasos: acotado primero, amplio si no encuentra

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que un encuentro del temario encuentre su campaña aunque haya arrancado
> antes de la ventana de la corrida.
>
> ⛔ **No toca la sección `campana`.** Las campañas destacadas ya se resuelven por cuenta y sin
> recorte por ventana (`R-17` + `campo_id_cuenta`). Ese camino está hecho y anda.

---

## La decisión del usuario, 20/08/2026

⭐ **La campaña de una reunión puede arrancar hasta 10 días antes del encuentro. Se busca en ese
recorte; si no encuentra, se amplía.**

**Y la propiedad que lo hace seguro, escrita como regla:** el recorte es **performance, no
criterio**. Un candidato que existe tiene que aparecer igual — el primer paso sólo decide **cuánto
se tarda**, nunca **qué se encuentra**. Si el recorte pudiera cambiar el resultado, sería un filtro
disfrazado de optimización, y ésos son los que fallan sin avisar.

**El lugar ya está preparado y vacío.** `CONFIG` tiene las dos claves desde `T2.9.2`:

```
ventana_candidatos_anclaje_dias           14
ventana_candidatos_anclaje_ampliada_dias  (vacía = no ampliar, que es lo que hace hoy)
```

`R-12` declaró la mitad ampliada y la dejó sin implementar, esperando esta decisión. **Este prompt
la completa; no inventa un mecanismo nuevo.**

---

## Parte 0 — medir dónde se pierde el candidato. Sólo lectura. **Reportar y seguir.**

> **Modelo: Sonnet · effort alto.**

⭐ **La pregunta que decide el tamaño del cambio: ¿el candidato se pierde por cercanía de fecha o
por el universo?** Son dos recortes distintos, encadenados, y sólo uno de los dos es el culpable:

| recorte | dónde | qué lo controla |
|---|---|---|
| **el universo** | `unirDigitalPorCuenta(ventana)` lee la solapa maestra recortada | la ventana de la corrida |
| **la cercanía** | `candidatosCercanosPorFecha_(…, ventanaCandidatosAnclajeDias_())` | `CONFIG`, hoy 14 |

**Si el candidato ya no está en el universo, ampliar la cercanía no lo trae.** Medirlo antes de
escribir una línea.

1. **Qué recorta `leerFuente` sobre la solapa maestra de digital**: qué campo de fecha usa, y si esa
   solapa tiene `ventana_ref` declarada en `SOLAPAS`. ⭐ **Si `ventana_ref` está vacía, la maestra
   puede no estar recortándose en absoluto** — y entonces el universo no es el problema y el cambio
   es sólo de cercanía. Reportarlo con todas las letras.
2. **`ventanaCandidatosAnclajeDias_()` = 14: ¿es ±14 o sólo hacia atrás?** Leer
   `candidatosCercanosPorFecha_` y decirlo. **De esto depende si los 10 días del usuario ya están
   cubiertos** por el valor actual.
3. **El caso real, medido**: para el encuentro de Parque Avellaneda del 12/08 con la ventana
   14–20/08, reportar si sale en `encuentros`, en `sinLink` o en `bajaConfianza`, y **el motivo
   textual**. Es el síntoma que distingue los dos recortes.
4. **La mitad no implementada**: dónde está declarada la ampliada, qué devuelve hoy y **quién la
   llama** — al 20/08 la función existe y devuelve `null`, que significa *no ampliar*.
5. **El umbral de anclaje** y cómo se puntúa un candidato. La ampliación va a traer más candidatos;
   hay que saber contra qué compiten.

---

## Parte A — los dos pasos

> **Modelo: Opus · effort alto.** Cambia qué campaña se ancla a qué encuentro, y de ahí salen
> números publicados.

**El escalón, con la regla de corte explícita:**

1. Se busca con el recorte acotado.
2. **Si encuentra por encima del umbral, se queda con eso y NO amplía.**
3. Si no encuentra, **se amplía y se vuelve a buscar** sobre el conjunto ampliado.

⭐ **La regla 2 no es una optimización: es determinismo.** Sin ella, ampliar podría traer un
candidato con mejor score y el resultado dependería de si el paso 1 encontró algo — el mismo
encuentro se anclaría distinto según cuántos días se hayan configurado. **Lo que el paso 1 resuelve,
queda resuelto.**

⚠ **La ampliación se aplica al recorte que la Parte 0 señaló como culpable, y sólo a ése.** Si el
universo es el que pierde el candidato, ampliar la cercanía no arregla nada y hay que decirlo en vez
de aplicar el cambio donde no toca.

**Tres cosas que van en la traza, porque sin ellas el cambio es invisible:**

- **qué paso resolvió** cada encuentro — acotado o ampliado;
- **cuántos candidatos** entraron en cada paso;
- **cuántos encuentros necesitaron el segundo paso** en la corrida.

⭐ Ese último número es el que dice si la decisión de 10 días fue acertada: si casi todos necesitan
ampliar, el recorte está mal calibrado y no sirve de nada; si no lo necesita ninguno, no cambió nada
y hay que sospechar que no se aplicó.

⛔ **`encontrarFilaRdvDeReunion_` no se toca.** Ya busca por la fecha propia del encuentro, no por
la ventana de la corrida, y eso está bien: **es el patrón que este prompt extiende a `digital`, no
algo a corregir.**

---

## Parte B — el control positivo

> **Modelo: Sonnet · effort alto.**

Sobre funciones puras con candidatos de prueba, **sin planilla**.

1. ⭐ **Un candidato dentro del recorte acotado se encuentra en el paso 1, y el paso 2 no corre.**
   La afirmación incluye *que el segundo paso no corrió*, no sólo que el resultado es correcto.
2. ⭐ **Un candidato a 10 días de distancia, fuera del acotado, se encuentra en el paso 2.**
   Es el caso que motiva el prompt.
3. ⭐ **Determinismo:** un caso donde el conjunto ampliado contiene un candidato de **mejor** score
   que el que encontró el paso 1 → **gana el del paso 1**. Sin esta afirmación, la regla de corte
   es una intención y no un comportamiento.
4. **Sin candidato en ninguno de los dos pasos** → `sinLink` con su motivo, igual que hoy.
5. **La ampliada vacía se comporta como hoy**: no amplía, y el paso 2 no existe. Es la garantía de
   que el cambio se puede apagar desde `CONFIG` sin tocar código.

⚠ **Antes de dar el verde, romper a propósito la regla de corte** y verificar que caiga la
afirmación 3. Un control que sólo mira el resultado final no distingue "buscó en dos pasos" de
"buscó una vez en el conjunto grande".

---

## Parte C — la documentación

> **Modelo: Sonnet · effort medio.**

1. **`docs/REGLAS_NEGOCIO.md`, `R-12`** — Addendum: la mitad ampliada se implementa, con la
   decisión del usuario del 20/08 (10 días para la campaña de una reunión) y **la regla de que el
   recorte es performance y no criterio**. El enunciado de `R-12` no se altera.
2. **`docs/CONFIG_INFORMES.md`** — el valor elegido y qué significa vacío.
3. **`docs/PLAN.md`** — `T2.9.2` pierde su mitad pendiente.
4. `docs/BITACORA.md`.

## Lo que este prompt **no** hace

- ⛔ No toca la sección `campana` ni la rama por cuenta.
- ⛔ No toca `encontrarFilaRdvDeReunion_`.
- ⛔ No amplía la ventana de ningún marcador agregado: `imp_*`, `mail_*`, `m2_*` y el status semanal
  siguen leyendo la semana. **Ampliarles la ventana los multiplicaría en silencio**, que es
  exactamente lo que esta solución evita.
- ⛔ No cambia `D-19` ni cómo el temario selecciona.
