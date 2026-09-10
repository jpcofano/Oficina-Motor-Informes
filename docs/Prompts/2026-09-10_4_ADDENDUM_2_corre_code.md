# ADDENDUM 2 al `2026-09-10_4` — 10/09/2026 · corré vos, por la API de `/dev`

> **Decisión del usuario, 10/09/2026: no hay botones que apretar. Corré todo.**
>
> ⭐ **El camino existe y está documentado: `docs/RUNBOOK.md` Parte G, la API de pruebas sobre
> `/dev`.** La acción `llamar` invoca una función del motor por nombre —`fn` y `args`— y devuelve
> JSON. Existe **exactamente para esto**: *«que Claude Code pueda invocar una función del motor
> contra el código que acaba de pushear y leer el resultado, sin abrir la planilla y sin pedirle a
> nadie que apriete un botón del menú»*.
>
> ⛔ **Esto no deroga *«quien implementa no se autoverifica»*.** Ver el punto 4.

---

## 1 — El orden, y no es negociable

```
clasp push  →  node tools/api.js llamar fn=<diag seco>  →  leer el JSON  →  el que escribe
```

⛔ **`/dev` sirve HEAD, o sea lo que dejó el ÚLTIMO `clasp push`.** Correr la API antes de pushear
mide el código viejo, y eso **no falla**: devuelve un JSON perfectamente válido de otra versión. Es
el caso ya medido del 16/08 — *un push que corrió antes del cambio es indistinguible de uno que no
corrió*.

⛔ **Y `clasp push` va en su propio comando**, después de leer el verde con su alcance declarado
(`ADDENDUM 1`, punto 1).

---

## 2 Si las credenciales no están, **parar**

`docs/ENTORNO.local.md` y `.env` están **fuera de git**. Las dos barreras se evalúan siempre y
**fallan cerradas**:

1. el mail con el que está logueado clasp tiene que estar en `CONFIG.mails_autorizados`
   —`node tools/token.js --info` lo dice—;
2. el `token` del pedido contra la propiedad de script `API_TOKEN`.

⛔ **Si alguna falta: reportar cuál y parar.** No reconstruir la URL a mano, no probar variantes,
no escribir ninguna credencial ni ninguna URL en el reporte, en la bitácora ni en un commit.

⭐ **`ping` primero**: verifica las dos barreras de una y cuesta un pedido.

---

## 3 Qué corrés, en este orden

| # | qué | por qué en ese lugar |
|---|---|---|
| 1 | `ping` | las dos barreras |
| 2 | `censarCajasSecco()` · `censarCajasJm()` | ⭐ **destraban C.1** y contestan la caja `Alcance` vacía de `L-012`, el par (3) de `L-018` y si el cruce estaba en `jm` |
| 3 | los dos `diag*()` **en seco** de C.2 y C.3 | se leen **antes** de escribir |
| 4 | los dos que escriben | sólo si el seco se ve bien |
| 5 | C.1, con la lista que salió del censo | ⛔ **una sola aplicación**, no dos |
| 6 | la corrida de `secco` | ver el punto 5 |

⛔ **Entre 3 y 4 hay una lectura humana del JSON.** Un `diag` seco que nadie mira no es un modo
seco: es un paso más.

---

## 4 ⛔ La verificación NO sale del retorno del escritor

**Quien implementa no se autoverifica**, y con la API la tentación es peor porque el JSON del
escritor se ve como una medición.

⭐ **Después de cada escritura, releer la hoja por OTRO camino:** la acción `registros`, que hace
`dump` de una hoja de registro. *«32 celdas escritas»* dice qué se pidió; *«las 32 quedaron»* lo
dice la hoja.

⛔ **Y el caso que lo vuelve obligatorio acá es el VACIADO:** una celda que tenía que quedar vacía
y conservó su valor viejo **publica el número anterior sin fallar** — es justo lo que hace C.2 con
el `SIN VALIDAR`.

---

## 5 La corrida de `secco` — se dispara y se lee, no se espera

⛔ **`D-57`: la corrida es desatendida y en tandas.** El retorno del pedido **no es el veredicto** —
puede volver `ok: true` con un `fallo` adentro, y una tanda que cortó deja trabajo pendiente.

**Lo que hay que leer es `CORRIDAS`**, y el invariante ya está escrito: **`corte ⇒ pendientes ≥ 1`**.
Si dice corte y `pendientes = 0`, el hallazgo es la fila.

⭐ **Y esta corrida tiene que contestar cinco cosas concretas** —van al reporte, una por una:

1. la caja rotulada **Aperturas** del lado Directa publica el GLOBAL de aperturas de mail de su
   propia `L-022`, y la rotulada **Clics** el TOTALES de clics de su propia `L-021` (`C-126`);
2. las **implementaciones** dejan de estar invertidas;
3. las cajas de C.1 dicen el **nombre del token** y ya no `/////`;
4. `cc_campanias` publica, **entre guiones**;
5. `emin_lista` y `emin_encuentros` publican **sin guiones** — y ⛔ **siguen sin guiones en la
   corrida SIGUIENTE**, que es lo único que prueba que el `SIN VALIDAR` se fue de verdad.

⚠ **Y las seis identidades internas del desagregado digital tienen que seguir cerrando** —
Meta + Google + Programmatic = TOTALES en impresiones, vistas y clics, en las dos campañas. Es el
control que **no depende del deck del equipo** y no caduca.

---

## ⛔ Hard stops

1. ⛔ **Nada de la API antes del `clasp push`.**
2. ⛔ **Credencial ausente → parar y reportar cuál.** Nunca escribir una credencial ni una URL.
3. ⛔ **Ninguna escritura sin su `diag` seco leído antes.**
4. ⛔ **Ninguna verificación desde el retorno del escritor.**
5. ⛔ **Ninguna fila de C.1 antes del censo**, y **una sola aplicación**.
6. ⛔ **`u1_total_*` no reciben fila.** ⛔ **`imp_prog` no se toca.** ⛔ **Ningún ✅ en el tablero.**
