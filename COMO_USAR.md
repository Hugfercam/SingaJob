# Cómo utilizar la metodología común de Codex — v1.1

## 1. Instalación en cualquier repositorio

1. Copia `AGENTS.md`, `README.md` y `docs/` a la **raíz** de tu nuevo proyecto.
2. Completa `README.md` con **tu propia idea**. No afirmes que algo ya funciona si todavía es un objetivo.
3. Abre la carpeta del proyecto en tu editor e inicia **una nueva sesión** de Codex.
4. Codex reconocerá `AGENTS.md` como instrucciones del repositorio. `README.md` y `docs/*.md` son documentos ordinarios: se consultan porque las reglas y los prompts lo indican, **no por una lectura automática garantizada**.
5. En un proyecto existente, **no sobrescribas** un README ni los documentos ya existentes. Integra o adapta las plantillas tras revisarlos.
6. No necesitas copiar este archivo `COMO_USAR.md` dentro de cada repositorio; puede quedarse en la plantilla maestra.

## 2. Fases

**Descubrimiento:** idea, problema, usuarios, MVP y preguntas abiertas; sin código por defecto.  
**Arquitectura:** revisar necesidades y repositorio, comparar opciones, aprobar decisiones y registrarlas si son relevantes.  
**Desarrollo iterativo:** una tarea concreta, implementación acotada, pruebas, documentación y continuidad.

## 3. Prompt de primera sesión (nueva idea)

> Lee `AGENTS.md`, `README.md` y `docs/WORK_STATE.md`. Estamos iniciando el proyecto y todavía no debes modificar archivos ni escribir código. Analiza la idea, distingue objetivos e hipótesis, propone un MVP, presenta alternativas de arquitectura justificadas y una hoja de ruta sencilla. Identifica riesgos, costes y preguntas abiertas. Espera mi aprobación antes de realizar cambios.

## 4. Prompt para reanudar un proyecto

> Sigue `AGENTS.md`. Revisa `README.md`, `docs/WORK_STATE.md`, la estructura real y `git status`. Contrasta la documentación con los archivos actuales. Resume qué está comprobado, qué queda pendiente y cuál es el siguiente paso. No modifiques archivos hasta que acordemos la tarea, salvo que te lo indique expresamente.

## 5. Prompt para una nueva tarea

> Quiero [objetivo]. Sigue `AGENTS.md`, consulta el contexto relevante y revisa el código relacionado. Si la tarea lo justifica, utiliza `docs/tasks/TASK_TEMPLATE.md`. Expón alcance, riesgos y validaciones. Pide aprobación para cambios importantes o de riesgo; en cambios simples y reversibles puedes implementar directamente.

## 6. Prompt de cierre

> Revisa el diff, ejecuta las validaciones pertinentes disponibles y registra los resultados reales. Actualiza la ficha de tarea y `docs/WORK_STATE.md` cuando corresponda. Resume qué cambió, qué se verificó, qué no y el siguiente paso. No hagas commit, push ni despliegues sin mi autorización.

## 7. Cómo probar la metodología

Después de **tres tareas reales**, completa `docs/METODOLOGIA_EVALUACION.md`: comprueba si Codex leyó los archivos, planificó lo complejo, hizo cambios acotados, probó correctamente y documentó lo justo. Registra fricciones reales antes de preparar la siguiente versión.

## 8. Qué archivo se modifica y cuándo

- `README.md`: visión, usuarios, funcionalidades objetivo y MVP consensuado; modificar cuando evolucione el producto.
- `AGENTS.md`: reglas de trabajo estables; modificar solo cuando haya una mejora justificada.
- `docs/WORK_STATE.md`: estado real de la tarea; actualizar al pausar o terminar trabajo relevante.
- `docs/DECISIONS.md`: decisiones técnicas significativas, no cada ajuste menor.
- `docs/tasks/`: fichas de trabajos relevantes o de varias sesiones.
- `docs/METODOLOGIA_EVALUACION.md`: revisión puntual del proceso, no diario.

**Regla práctica:** estas instrucciones ayudan a trabajar; no debemos convertirlas en trabajo adicional sin valor.
