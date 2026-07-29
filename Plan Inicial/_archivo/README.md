# Motor de Informes

Genera presentaciones (Google Slides / .pptx) a partir de bases en Google Sheets.
Configurable: período, fuentes, y qué calcula cada valor — sin tocar código.

La arquitectura y el orden de construcción están en **`PLAN.md`**.

---

## Puesta en marcha (una sola vez)

Requiere Node y [clasp](https://github.com/google/clasp).

```bash
npm install -g @google/clasp
clasp login
cd motor-informes
clasp create --type sheets --title "Motor de Informes"
clasp push
```

`clasp create` genera el `.clasp.json` (con el scriptId) y una planilla nueva
vinculada. `clasp push` sube estos archivos. Después:
`clasp open` para abrir el proyecto, y desde la planilla corrés `instalar`.

---

## Flujo de trabajo con Claude Code

Trabajamos **de a un paso** de `PLAN.md`:

1. Te paso el prompt del paso N (lo pega el usuario en Claude Code).
2. Code implementa **solo ese paso**, en los archivos que el paso indica.
3. `clasp push` y lo probás según el criterio "Probás" del paso.
4. Si pasa, marcamos el paso y vamos al N+1. Si no, iteramos sobre el mismo.

Cada archivo `.gs` ya tiene su contrato escrito en el encabezado: Code implementa
adentro de esas firmas y no cambia la estructura sin avisar. Así no perdemos el hilo.

---

## Mapa de archivos

| Archivo | Rol | Paso |
|---|---|---|
| `Codigo.gs` | Menú y ruteo (entry point) | 0 |
| `Instalar.gs` | Crea hojas de config + ejemplo | 0 |
| `Config.gs` | Config y resolución de período | 1 |
| `Fuentes.gs` | Lectura de hojas fuente | 2 |
| `Marcadores.gs` | **El corazón**: resuelve cada valor | 3 |
| `Generador.gs` | Copia plantilla y arma el deck | 4–5 |
| `Panel.html` | UI del panel lateral | 6–8 |
| `PanelBackend.gs` | Funciones que llama el panel | 6–8 |
| `Snapshot.gs` | Reproducibilidad | 9 |
| `Automatizacion.gs` | Trigger semanal + mail | 10 |
