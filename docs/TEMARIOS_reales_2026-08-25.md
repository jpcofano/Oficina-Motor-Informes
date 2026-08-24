# TEMARIOS REALES — el formato de entrada, tal como llega · 25/08/2026

> **Estado: congelado.** Evidencia fechada. No se edita; si llega otro temario, entra uno nuevo.
>
> ⛔⛔ **Por qué existe, y es el motivo de método que lo hace importante.** Hasta hoy **todo lo que
> el repo suponía sobre el temario salía de lo que quedó cargado en la hoja `REUNIONES`** — que es
> el **resultado de una adaptación manual**, no la entrada. Se razonó sobre el efecto y se lo tomó
> por la causa.
>
> **Estos son los primeros dos temarios reales que tenemos**, pasados por el usuario el 25/08.

---

## Los dos, textuales

**Semana de agosto:**

```
1) JM | Uno a uno en Parque Avellaneda 12/08 (pre + post)
2) JM | Encuentro Temático: Salud 14/08
```

**Semana de julio (`julio_24_30`):**

```
1) JM | Uno a uno en San Cristóbal 23/07 (pre + post)
2) JM | Uno a uno en Retiro 24/07 (pre + post)
4) JM | Encuentro Temático Orden Público 28/07
```

---

## ⭐ Lo que dicen, y contradice lo que el repo suponía

**UNA línea por encuentro.** Cuando se aclara la etapa, dice **`(pre + post)` junto**; muchas veces
no se aclara nada.

⛔ **Y `parsearLineaReunion_` busca `(pre)` o `(post)` EXACTOS.** Medido corriendo el parser real
contra estas líneas el 25/08:

| línea | `etapa` | `notas` |
|---|---|---|
| `… Parque Avellaneda 12/08 (pre + post)` | **(vacía)** | `pre + post` |
| `… San Cristóbal 23/07 (pre + post)` | **(vacía)** | `pre + post` |
| `… Orden Público 28/07` | (vacía) | (vacía) |
| `… San Cristóbal 23/07 (pre)` | `pre` | (vacía) |
| `… San Cristóbal 23/07 (POST)` | `post` | (vacía) |
| `… Retiro 24/07 (pre+post)` | **(vacía)** | `pre+post` |
| `… Retiro 24/07 (PRE + POST)` | **(vacía)** | `PRE + POST` |

⇒ **La forma real cae a `notas` y `etapa` queda vacía.** Las dos filas por encuentro que hay hoy en
`REUNIONES` **no salieron de este temario**: alguien lo reescribió a mano, partiendo cada línea en
dos, para que el parser produjera `etapa`.

⚠ **El parser es case-insensitive y eso funciona** —`(POST)` da `post`—; lo que no contempla es la
forma conjunta.

## ⚠ Y un segundo hallazgo del mismo parseo, que no se estaba buscando

`2) JM | Encuentro Temático: Salud 14/08` produce **`nombre = ": Salud"`**, con los dos puntos
adentro. El tipo `Encuentro Temático` matchea y lo que queda del texto se toma como nombre tal
cual.

Es el mismo `: Salud` sucio que ya se veía en `FALTANTES` como `enc_alcance_pct @: Salud` y que
estaba anotado como *«el parseo del nombre del ítem sigue roto y a propósito»*. **Lo nuevo es que
ahora se sabe de dónde sale: del separador `:` que el temario usa entre el tipo y el nombre**, y
que las otras líneas no llevan.

---

## Cómo se usa esta evidencia

**Se cita, no se interpreta de nuevo.** Cualquier afirmación sobre *«qué trae el temario»* se
verifica contra este archivo, no contra `REUNIONES` — que es el estado después de la mano humana.

⚠ **Y envejece como cualquier medición:** son **dos** semanas. Que las dos usen `(pre + post)` no
prueba que sea la única forma; prueba que la forma que el parser espera **no aparece en ninguna de
las dos**.
