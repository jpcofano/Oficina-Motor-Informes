# Renumerar los prompts que dicen 18/08 y se hicieron el 05 y el 06

> **Estado:** ejecutado el 06/08/2026.

**Un objetivo.** Que el nombre de archivo diga la fecha real. No se toca código.

**El problema.** Los prompts de `docs/Prompts/` llevan fecha en el nombre, pero la
serie está corrida: hay archivos llamados `2026-08-18_…` que se commitearon el 05
y el 06. Con uno por día no molestaba; con cinco en un día, el nombre dejó de
ordenar y dos prompts distintos se leen como el mismo.

**El alcance son sólo los `2026-08-18_…`.** Los anteriores se quedan como están:
son de otra época y renombrarlos rompe más de lo que aclara.

---

## Parte 0 — la fecha real de cada uno (sólo lectura, reportar y parar)

`0.1` · **Listar los `2026-08-18_…` de `docs/Prompts/`.**

`0.2` · **La fecha real de cada uno**: la del commit que lo agregó.

```
git log --diff-filter=A --format='%h %ad' --date=format:'%Y-%m-%d %H:%M' -- <archivo>
```

`0.3` · **La tabla propuesta**: nombre viejo → nombre nuevo, con el formato
`YYYY-MM-DD_N_descripcion.md`, donde `N` es el orden dentro de ese día.
Desempate cuando dos entraron en el mismo commit: primero el original, después su
continuación o addendum.

`0.4` · **Quién los referencia.** Greppear los nombres viejos en todo `docs/` y en
`CLAUDE.md`. Incluir los encabezados de estado **dentro** de los propios archivos,
que citan al original por nombre.

**Reportar `0.1`–`0.4` y parar.**

---

## Parte A — renombrar

`git mv`, para que el historial siga el archivo.

Actualizar todas las referencias que encontró `0.4`, incluidas las internas.

**Nada de contenido cambia.** Si al abrir un archivo aparece algo más que
arreglar, se anota en el reporte y sigue.

---

## Parte B — la convención

Una línea donde la §3 de `CLAUDE.md` rutea los prompts: el nombre lleva la fecha
real del día en que se escribe, más un número de orden dentro del día, porque
entra más de uno por día.

Entrada en `docs/BITACORA.md` con el origen: la serie se había corrido hasta el 18
sobre días que eran 05 y 06.

---

## Cuándo está hecho

- Ningún archivo de `docs/Prompts/` dice `2026-08-18`.
- Ninguna referencia quedó apuntando a un nombre que ya no existe.
- La convención está escrita.

## El reporte

1. La tabla de `0.3`, con la fecha real de cada uno.
2. Qué referencias actualizaste.
3. Qué decisiones tomaste solo.
4. Qué premisa de este prompt resultó falsa, si alguna.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.

---

## Respuesta del usuario a las dos preguntas de la Parte 0 (06/08)

**`N` cuenta sólo los archivos que siguen la convención.** `donde_muere` va como
`2026-08-05_1_donde_muere.md`: un número que cuenta archivos que no lo llevan no
se puede verificar mirando la carpeta.

**El campo `Fecha:` de `donde_muere` se corrige, y se anota que decía otra cosa.**
No es contenido del prompt: es metadato del archivo, de la misma clase que el
nombre. Corregir uno y dejar el otro mintiendo deja el archivo contradiciéndose a
sí mismo. El cuerpo no se toca — sólo ese campo, con la anotación al lado:
`**Fecha:** 2026-08-05 (el archivo decía 2026-08-18; ver el renombre del 06/08)`.
Ese "decía 2026-08-18" es lo que deja rastro de por qué cambió el nombre.

**Los encabezados `(2026-08-18)` de `BITACORA.md` quedan fuera de alcance**: es
append-only, y la entrada nueva de la Parte B es la corrección — que diga que las
entradas de esos trabajos llevan una fecha corrida y cuál es la real.

**El corrimiento más viejo —los `2026-08-08` a `2026-08-17`, todos del 05/08—
queda anotado y no se toca.** Que la entrada de bitácora diga que el alcance
fueron cinco archivos y que hay diez más con el mismo problema, dejados a
propósito.
