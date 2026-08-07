# La ventana de selección pasa a solape (`R-14` aplicada)

**Un objetivo.** Que la selección por período deje de preguntar *"¿empieza en la semana?"* y
pase a preguntar *"¿alguno de sus días activos cae en la semana?"*. Es `R-14`, escrita el
06/08 y **sin ningún consumidor** hasta hoy.

**Va aparte de las once respuestas porque cambia números en todos lados.** Todo agregado que
filtra por ventana puede mover su valor.

**Lo que destraba, medido:** IVR da cero por **un día**. Las dos campañas de Orden Público
arrancan el 22 y el 23/07 y la ventana empieza el 24 — siguen activas toda la semana. Y el
motivo que dio el usuario y que no estaba escrito en ningún lado: **las campañas suelen
empezar unos tres días antes**.

---

## Parte 0 — corta, sólo lo que la escritura necesita

`0.1` · **Dónde se decide hoy que una fila entra por período.** Un solo lugar o varios: si son
varios, decir cuáles, porque el cambio tiene que entrar en todos o en ninguno.

`0.2` · **Qué filas tienen las dos fechas.** El solape necesita inicio **y** fin. Reportar qué
fuentes tienen las dos mapeadas y **qué hace el motor con las que sólo tienen inicio** — ésas
no pueden cambiar de criterio y hay que decir qué pasa con ellas.

**Reportar y seguir sin parar**, salvo que `0.2` muestre que la mayoría no tiene fecha de fin:
ahí sí, parar.

---

## Parte A

`A.1` · **El solape es el criterio por defecto** de la selección por período. La regla es
`R-14`: entra si inicio ≤ fin de ventana **y** fin ≥ inicio de ventana.

`A.2` · **Las filas sin fecha de fin** siguen como están, y **el motor lo dice** — no se las
trata como si tuvieran un fin implícito. Un criterio distinto aplicado en silencio a un
subconjunto es exactamente el número plausible que este proyecto persigue.

`A.3` · **La selección por temario no se toca.** El usuario fue explícito: *la semana por
defecto, y si no, por temario*. Éste es el "por defecto".

`A.4` · **Los tres días de anticipación son un dato de dominio, no un parámetro.** El solape ya
los cubre: una campaña que arranca tres días antes y sigue activa, entra. **No agregar ningún
valor de "días antes"** — sería inventar una decisión que nadie tomó.

---

## Cuándo está hecho

**El control es el punto, no el cambio.** Antes y después, sobre la misma ventana, marcador por
marcador:

- **qué se movió**, con el valor viejo y el nuevo;
- **IVR tiene que dejar de dar cero** — es la prueba de que el criterio hace lo que se espera;
- **nada tiene que moverse en las fuentes que ya daban bien**, y si algo se mueve, se reporta
  antes de commitear.

Verificación humana: la corre el usuario desde el menú. Queda pendiente.

## El reporte

1. **Qué valores cambiaron**, uno por uno. Va arriba de todo.
2. Qué pasó con las filas sin fecha de fin.
3. Qué decisiones tomaste solo.
4. Qué premisa resultó falsa.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
