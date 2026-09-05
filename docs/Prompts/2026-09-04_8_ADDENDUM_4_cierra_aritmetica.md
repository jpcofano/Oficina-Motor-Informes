# Addendum 4 — `2026-09-04_8_tokens_sin_resolver_y_formato_emin.md`

**Fecha:** 05/09/2026 · **Cierra las dos aritméticas que la Parte B dejó abiertas.**
⇒ **Actualizar la entrada de `docs/PENDIENTES_consistencia.md`**: ya no son huecos.

---

## Code tenía razón en las dos, y las dos son el mismo error mío

**Mezclé apariciones con únicos en la tabla de familias.** Conté con `sed 's/_.*//'` sobre la lista
completa, no sobre el conjunto de únicos.

```bash
python3 -c "
import re,collections
t=open('deck.md',encoding='utf8').read()
toks=[x.replace('\\\\','') for x in re.findall(r'\{\{[a-z0-9_\\\\]+\}\}',t)]
print('apariciones:',len(toks),'unicos:',len(set(toks)))
c=collections.Counter(toks)
print('duplicados:',[k for k,v in c.items() if v>1])
print(collections.Counter(k[2:-2].split('_')[0] for k in set(toks)))
"
```

### 1 · La suma da 60, no 62 — el error está en `et_*`

| familia | **únicos** | apariciones |
|---|---|---|
| `conv_*` | 13 | 13 |
| `camp_resp_*` + `camp_tasa_resp` | 13 | 26 |
| `rep_*` | 11 | 11 |
| **`et_*`** | **9** | **11** ← lo que puse en la tabla |
| `rrss_*` | 9 | 9 |
| `u1_bench_*` | 3 | 3 |
| `ecv_comuna` · `ecv_minutos` | 2 | 3 |
| | **60** ✅ | **76** ✅ |

⇒ **`et_*` son 9, no 11.** Corregido, la suma cierra en 60 y la diferencia de 2 desaparece.

### 2 · El exceso es 16 y son 16 — pero no todos de campaña

**Los dieciséis tokens que aparecen dos veces:**

- los **13** `camp_resp_*` + `camp_tasa_resp` → los dos bloques de campaña, como decía;
- ⭐ **`et_fecha`, `et_nombre`, `ecv_comuna`** → **no son del bloque de campaña.**

⇒ **Mi atribución era incorrecta**, no sólo incompleta: dije que todo el exceso venía del bloque
duplicado, y tres no.

### ⭐ Y lo que esos tres sí son — porque la duda vale más que la corrección

```
et_fecha    → slide6/L-006 · slide7/L-007
et_nombre   → slide6/L-006 · slide7/L-007
ecv_comuna  → slide4/L-004 · slide5/L-005
```

**Láminas distintas y consecutivas, no un bloque repetido.** ⇒ ⭐ **Es el mismo token usado en dos
láminas fijas**, no una segunda sección que se expande.

⚠ **Eso importaba comprobarlo:** una segunda sección repetible habría sido justo el escenario donde
el ítem 33 aparecía, y habría cambiado la lectura del control que ya se dio por pasado. **No lo es.**
El control del ítem 33 sigue en pie.

---

## Qué hacer

**Sonnet**, effort normal, un commit de documentación:

- Reemplazar en `PENDIENTES_consistencia.md` las dos aritméticas abiertas por su cierre.
- Corregir `et_*` de 11 a **9** en la tabla del censo. **El total del lote de cableado baja en 2.**
- ⭐ Dejar escrito **que se cerraron y cómo**, no borrarlas: *«el prompt mezcló apariciones con
  únicos»* es la clase de error que se repite, y el registro es lo que hace que se note la segunda
  vez.

⭐ **Y la forma de la Parte B se mantiene**: anotar una aritmética que no cierra en vez de
reproducirla fue lo correcto, y es lo que permitió cerrarla al día siguiente en dos comandos. **El
único límite real era el acceso al `.pptx`, y era del entorno, no del método.**
