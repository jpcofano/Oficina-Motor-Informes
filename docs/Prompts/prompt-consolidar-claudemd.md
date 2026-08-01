# Tarea: resolver la duplicación de CLAUDE.md y ajustar la regla de force push

Dos cambios de configuración. Ejecutalos completos, sin pedir confirmación
intermedia, y cerrá con un informe corto.

---

## Contexto que hace falta para decidir bien

El repo de este proyecto **no es un historial colaborativo**. Sirve como backup y
como forma de que yo pueda pasarle contexto del código a Claude en la web. No hay
otras personas trabajando sobre él, y no hay ramas de terceros que se puedan
perder. Esto cambia el criterio de las dos decisiones de abajo.

---

## Cambio 1 — Un solo dueño para las convenciones de shell

Hoy las convenciones generales están duplicadas: la sección completa en
`~/.claude/CLAUDE.md` y dos de ellas (sin `cd` antepuesto, commits sin heredoc)
también en el `CLAUDE.md` del proyecto.

Resolución: **el archivo de usuario es el dueño único de las convenciones
generales.**

- Dejá `~/.claude/CLAUDE.md` como está, con la sección completa.
- Sacá del `CLAUDE.md` del proyecto todo lo que sea convención general de shell
  o de seguridad — lo que aplicaría igual en cualquier proyecto.
- En el `CLAUDE.md` del proyecto conservá **solo lo específico de Motor de
  Informes**: la convención de un archivo HANDOFF nuevo por sesión, el detalle
  de que la API executable sirve la versión desplegada y no HEAD, las reglas
  sobre `clasp push` y redespliegue, la estructura de `docs/`, y cualquier
  convención de nombres o de código propia del proyecto.

Si al sacar una convención general del archivo de proyecto queda una sección
vacía o un encabezado huérfano, limpialo.

---

## Cambio 2 — Bajar `git push --force` de deny a ask

Está como `deny` en el settings del proyecto, bloqueado de plano. Pasalo a
`ask`, en los dos shells:

```
"ask": [
  "Bash(git push --force*)",
  "PowerShell(git push --force*)"
]
```

Y actualizá el texto del `CLAUDE.md` del proyecto que hoy lo prohíbe sin
excepción, para que diga que requiere confirmación explícita en vez de estar
vetado.

Motivo: el repo es backup y canal de contexto, no historial compartido. No hay
trabajo de otros que un force push pueda destruir.

Dejá el resto de los `ask` y `deny` como están. En particular no toques
`Bash(rm -r*)`, `Bash(rm -f*)` ni el bloque de deny de credenciales.

---

## Informe final

1. Qué secciones sacaste del `CLAUDE.md` del proyecto y qué quedó.
2. En qué archivo quedó cada regla de force push, y cómo redactaste el texto
   nuevo en CLAUDE.md.
3. Confirmá que los settings.json siguen parseando.

Recordá al cierre que hay que reiniciar la sesión para que apliquen.
