# Currículum de Sergio Hernández

## Acuerdo de mantenimiento

El usuario ha solicitado que cada cambio que pida para este currículum se aplique al código, se publique en el Site existente y se guarde también en GitHub. Mantener ambos destinos al día forma parte de cada petición. No pedir otra confirmación conversacional para cambios, publicaciones y sincronizaciones rutinarias ya autorizadas; respetar siempre las aprobaciones de las herramientas y cualquier restricción explícita posterior del usuario.

Destinos de este proyecto:

- Site: `appgprj_6ab43a615b348191bbb5481a891b4b2b`.
- Web publicada: `https://sergio-hernandez-cv.alejosergio3000.chatgpt.site/`.
- GitHub: `alejandrosergio/sergio-hernandez-cv`, rama `main`.
- `.openai/hosting.json` mantiene el vínculo al Site existente. No registrar otro Site ni sustituir su identificador.

## Flujo de cada cambio

1. Leer este archivo y las instrucciones de Sites disponibles. Abrir y sincronizar las fuentes del Site mediante su flujo oficial antes de editar. Conservar el resultado de apertura para publicar.
2. Leer la rama y el árbol actuales de GitHub. Comparar con el estado conocido; conservar cambios del usuario en cualquiera de los dos destinos. Integrar diferencias antes de continuar y pedir información solo cuando una decisión del usuario sea indispensable. No forzar referencias, borrar historial ni sobrescribir cambios concurrentes.
3. Editar `src/` y, cuando proceda, `public/`. Mantener español e inglés. `dist/` es la salida generada, no el lugar de edición manual.
4. Instalar las dependencias cuando falten o cambien, generar con `pnpm build` y verificar con `pnpm check`. Revisar la presentación o el PDF cuando el cambio afecte a su diseño o comportamiento. Reutilizar comprobaciones válidas si sus entradas no cambian.
5. Publicar el Site mediante las herramientas y el flujo oficiales de Sites. Confirmar el estado satisfactorio de la publicación y conservar el público actual.
6. Guardar en GitHub la misma versión de los archivos administrados. Usar la conexión GitHub o Git con autenticación existente. Para las herramientas Git Data, crear los blobs y el árbol, crear un commit con el padre actual y actualizar `main` con comprobación del SHA esperado, sin forzar. Verificar la referencia y los archivos resultantes.
7. Informar de ambos resultados: URL de la web, enlace al commit de GitHub y verificaciones relevantes. Si uno falla, indicar qué quedó pendiente y resolverlo antes de dar por completa la sincronización. No afirmar que ambos están actualizados sin comprobarlo.

Archivos administrados: `src/`, `public/`, `scripts/`, `dist/`, `docs/`, `.openai/hosting.json`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.gitignore`, `README.md`, `LEEME.md` y `AGENTS.md`. Preservar otros archivos de GitHub que no formen parte de la edición solicitada. Las eliminaciones de archivos administrados deben corresponder a cambios deliberados del proyecto.

Sites y GitHub tienen historiales de commits independientes. Comparar los contenidos y hashes de los archivos; no exigir que los SHA de ambos commits sean iguales ni combinar sus historiales mediante un push forzado. Si existe `.codex/sync-state.json`, usarlo como referencia de la última sincronización verificada y actualizarlo después de comprobar ambos destinos. Ese archivo local solo contiene identificadores, SHA y hashes de archivos, nunca credenciales. Si falta, reconstruir la comparación a partir de ambos árboles antes de sobrescribir archivos divergentes.

No guardar credenciales, tokens, perfiles del navegador, `.env`, `node_modules/`, `.git/`, `.codex/`, `.sites-runtime/` ni archivos temporales en el repositorio. Las credenciales de Sites son temporales: mantenerlas en memoria y pasarlas por la entrada protegida del flujo, nunca en argumentos o archivos.

## Contenido y funcionamiento

- Perfil: Analista y Desarrollador de Software, +6 años; español e inglés.
- .NET, Power Platform e IA tienen el mismo peso visual.
- Mantener la fotografía original, los contactos y sus vínculos, la accesibilidad y la impresión sin controles.
- Describir el ciclo de vida completo como capacidad profesional, con enfoque para reclutadores.
- Mantener las tecnologías y la experiencia confirmadas por el titular; no inventar resultados, certificaciones, herramientas o fechas.

## Alcance de la sincronización

Este flujo se ejecuta al atender una petición del usuario desde este proyecto o desde un chat que tenga acceso a él y a ambas conexiones. No es un servicio permanente ni una sincronización automática de cambios hechos fuera de ese flujo. No crear horarios o automatizaciones recurrentes sin una solicitud adicional del usuario.
