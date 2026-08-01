# Tarea: consolidar permisos y documentar convenciones de shell

Esta tarea es de configuración, no de código. Ejecutala completa, sin pedir
confirmación intermedia. Al final entregá un informe de lo que cambiaste.

---

## Contexto

El `settings.json` global acumuló cientos de reglas generadas por
"Yes, don't ask again". Muchas son rutas absolutas de un proyecto puntual,
fragmentos de pipes guardados como comandos sueltos, o duplicados. Además hay
reglas peligrosas y credenciales incrustadas. Hay que consolidarlo y dejar
documentadas las convenciones que evitan que el problema se repita.

---

## Paso 1 — Inventario

Leé y reportá el estado actual de:

- `~/.claude/settings.json` (global)
- `.claude/settings.json` del proyecto, si existe
- `.claude/settings.local.json` del proyecto, si existe
- `~/.claude/CLAUDE.md`
- `CLAUDE.md` del proyecto

Para cada uno: cuántas reglas tiene y si hay secciones de convenciones de shell
ya presentes.

**Importante:** si encontrás tokens, claves o credenciales dentro de alguna
regla, **no los imprimas ni los copies a ningún archivo nuevo**. Reportá
solamente: en qué archivo están, cuántos son y de qué tipo (OAuth, API key,
etc.). Nada más.

---

## Paso 2 — Reescribir el `settings.json` global

Reescribí `~/.claude/settings.json` aplicando estos criterios:

**Eliminar:**

- Cualquier regla que contenga un token, clave o credencial literal.
- `Read(//c//**)` y cualquier regla que habilite leer una unidad entera.
- Reglas con rutas absolutas de un proyecto específico (van al settings del
  proyecto, no al global).
- Fragmentos de pipes guardados como comandos sueltos
  (`Bash(Select-Object ...)`, `Bash(Out-String)`, `Bash(xargs ...)` sin contexto,
  y similares). No son comandos, son pedazos de otro comando.
- Reglas malformadas o que sean claramente basura de parseo.
- Entradas de `additionalDirectories` que no sean rutas válidas y vigentes.

**Consolidar:**

Colapsá las variantes de un mismo comando en una sola regla con comodín.
Veinte reglas `Bash(node -e "...")` distintas se convierten en `Bash(node *)`.
Las de `git -C "<ruta larga>" <subcomando>` se convierten en `Bash(git *)`.

**Agregar los espejos de PowerShell.**

Las reglas son por herramienta: una regla `Bash(...)` no cubre el mismo comando
ejecutado por PowerShell. Por cada comando de desarrollo permitido en Bash,
agregá su equivalente `PowerShell(...)`. Como mínimo: git, npm, npx, node,
clasp, firebase, python.

**Espejar también los `ask`.** Si `Bash(git push --force*)` está en `ask`,
`PowerShell(git push --force*)` también tiene que estar. Un freno que existe en
un solo shell no es un freno.

**Deny de credenciales.** Asegurá que estén, con anclaje absoluto `//**/`
(en un settings de usuario, un `/path` se ancla en `~/.claude/`, no en el
proyecto):

```
Read(//**/.env)
Read(//**/.env.*)
Read(//**/.clasprc.json)
Read(//**/service-account*.json)
Read(//**/*.pem)
Read(~/.config/gcloud/**)
Read(~/.config/configstore/**)
Read(~/.ssh/**)
```

**Antes de escribir, guardá una copia** del archivo original como
`~/.claude/settings.json.bak`.

---

## Paso 3 — Vaciar el `settings.local.json`

`.claude/settings.local.json` es donde se acumulan los "don't ask again" del
proyecto, y **pisa a las settings globales**. Si tiene reglas que contradicen la
configuración nueva, gana el local.

Vacialo dejándolo en `{}`, salvo que contenga alguna regla específica del
proyecto que valga la pena conservar — en ese caso movela al
`.claude/settings.json` del proyecto (ese sí se commitea) y dejá el local vacío.

---

## Paso 4 — Documentar las convenciones en CLAUDE.md

Agregá al `~/.claude/CLAUDE.md` (nivel usuario, para que aplique a todos los
proyectos) una sección `## Convenciones de shell y seguridad` con estas reglas.
Si la sección ya existe, actualizala en vez de duplicarla.

### Un solo shell por comando

No mezclar cmdlets de PowerShell (`Get-Content`, `Measure-Object`,
`Select-Object`, `Where-Object`) dentro de un comando Bash, ni al revés.
Contar líneas: `wc -l archivo`. Ver el final: `tail -3 archivo`.

### Comandos simples

Sin subshells `( )`, sin fallbacks `||`, sin redirecciones defensivas
`2>/dev/null`, sin cadenas de más de dos o tres subcomandos. Si un comando
necesita un fallback, hacer dos llamadas separadas y legibles.

### Sin `cd` antepuesto

La sesión ya corre en el directorio del proyecto. No anteponer
`cd "<ruta>" && ...`. Para operar sobre otro repo, `git -C <ruta>`, y solo
cuando es realmente necesario.

### Commits sin heredoc

Usar `-m` repetido:

```
git commit -m "título" -m "cuerpo"
```

Nunca `git commit -m "$(cat <<'EOF' ... EOF)"` ni backticks. La sustitución de
comando dispara una verificación de seguridad que ninguna regla puede desactivar
y obliga a aprobar cada commit a mano. Para mensajes largos, `git commit -F`.

### Nunca incrustar credenciales

Prohibido escribir tokens o claves literales dentro de un comando. Los comandos
quedan en el historial, en los archivos de permisos y en los logs. Usar variables
de entorno, o el CLI que ya maneja la sesión (`firebase`, `gcloud`, `clasp`).

### Archivos que no se leen ni se imprimen

`.env`, `.env.*`, `.clasprc.json`, `service-account*.json`, `*.pem`,
`~/.config/gcloud/`, `~/.config/configstore/`, `~/.ssh/`.
Si hace falta saber si existen, verificar existencia o listar nombres de claves,
nunca valores.

### Antes de commitear

Verificar con `git status` que no entre ninguno de esos archivos. Si aparece uno,
agregarlo a `.gitignore` y avisar antes de seguir.

### Operaciones destructivas

Avisar y esperar confirmación antes de: `rm -rf` sobre algo que no sea un
temporal de esta sesión, `git reset --hard`, `git push --force`,
`git filter-repo`, `Remove-Item -Recurse -Force`, borrado de colecciones en
Firestore, `taskkill`/`pkill` sobre procesos ajenos a la sesión.

---

## Paso 5 — Informe final

Reportá:

1. Cuántas reglas tenía el global y cuántas quedaron.
2. Qué reglas eliminaste por peligrosas, con el motivo de cada una.
3. Si encontraste credenciales: en qué archivos y de qué tipo. Sin transcribirlas.
4. Qué se movió del local al settings del proyecto, si hubo algo.
5. Qué secciones agregaste o actualizaste en CLAUDE.md.

Cerrá recordando que los cambios en `settings.json` y `CLAUDE.md` se leen al
iniciar la sesión, así que hay que reiniciar para que apliquen.
