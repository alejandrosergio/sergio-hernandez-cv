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
4. Instalar las dependencias cuando falten o cambien, generar con `pnpm build` y verificar con `pnpm check`. Revisar la presentación y las versiones de impresión cuando el cambio afecte a su diseño o comportamiento. Reutilizar comprobaciones válidas si sus entradas no cambian.
5. Publicar el Site mediante las herramientas y el flujo oficiales de Sites. Confirmar el estado satisfactorio de la publicación y conservar el público actual.
6. Guardar en GitHub la misma versión de los archivos administrados. Usar la conexión GitHub o Git con autenticación existente. Para las herramientas Git Data, crear los blobs y el árbol, crear un commit con el padre actual y actualizar `main` con comprobación del SHA esperado, sin forzar. Verificar la referencia y los archivos resultantes.
7. Informar de ambos resultados: URL de la web, enlace al commit de GitHub y verificaciones relevantes. Si uno falla, indicar qué quedó pendiente y resolverlo antes de dar por completa la sincronización. No afirmar que ambos están actualizados sin comprobarlo.

Archivos administrados: `src/`, `public/`, `scripts/`, `dist/`, `docs/`, `.openai/hosting.json`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.gitignore`, `README.md`, `LEEME.md` y `AGENTS.md`. Preservar otros archivos de GitHub que no formen parte de la edición solicitada. Las eliminaciones de archivos administrados deben corresponder a cambios deliberados del proyecto.

Sites y GitHub tienen historiales de commits independientes. Comparar los contenidos y hashes de los archivos; no exigir que los SHA de ambos commits sean iguales ni combinar sus historiales mediante un push forzado. Si existe `.codex/sync-state.json`, usarlo como referencia de la última sincronización verificada y actualizarlo después de comprobar ambos destinos. Ese archivo local solo contiene identificadores, SHA y hashes de archivos, nunca credenciales. Si falta, reconstruir la comparación a partir de ambos árboles antes de sobrescribir archivos divergentes.

No guardar credenciales, tokens, perfiles del navegador, `.env`, `node_modules/`, `.git/`, `.codex/`, `.sites-runtime/` ni archivos temporales en el repositorio. Las credenciales de Sites son temporales: mantenerlas en memoria y pasarlas por la entrada protegida del flujo, nunca en argumentos o archivos.

## Contenido y funcionamiento

- Mantener el alcance breve del currículum. Los proyectos detallados, casos de estudio y contenidos ampliados se reservan para Alejandro’sTech. No añadirlos al CV sin una petición expresa del usuario.
- Perfil: Analista y Desarrollador de Software full stack, +6 años; español e inglés. Evitar repetir el cargo al comienzo de la descripción y no presentarlo como un perfil exclusivamente backend.
- En DynamizaTIC el cargo confirmado es «Desarrollador Senior • Microsoft 365», traducido como «Senior Developer • Microsoft 365» en inglés, también en ambas versiones impresas.
- Los títulos al compartir e imprimir destacan Power Platform · .NET · IA (AI en inglés), manteniendo full stack como capacidad dentro del perfil.
- React es la tecnología frontend actual confirmada. Angular se conserva en la experiencia histórica de CODESA, sin ofrecerse como competencia actual. Mantener PCF sin añadir «con React» a su etiqueta.
- .NET, Power Platform e IA mantienen la misma jerarquía de títulos y acentos. En escritorio, Power Platform ocupa dos filas junto a .NET e IA apiladas; adaptar la composición al tamaño de pantalla.
- Mantener la fotografía de perfil aprobada, los contactos y sus vínculos, la accesibilidad y la impresión sin controles. La última edición autorizada conserva su identidad, rostro, pelo, barba y expresión, con pose sentada de brazos cruzados, polo de punto gris carbón de cuello bajo sobre camiseta blanca y fondo de estudio azul suave según sus referencias. Las futuras ediciones seguirán los cambios que autorice el titular, preservando su identidad.
- El halo del ratón es decorativo, transparente y con seguimiento suave, conserva el cursor nativo y se desactiva con teclado, táctil, impresión, alto contraste o reducción de movimiento. Mantener el reflujo al ampliar el texto, sin ocultar desbordamientos ni reducir la tipografía.
- Mantener CV completo y CV resumido de lectura rápida, con impresión en ambos idiomas. El CV resumido reutiliza la descripción completa del perfil de la web y conserva todas las tecnologías confirmadas del completo. Los enlaces impresos se muestran en azul y subrayados. El enlace al currículum web se muestra solo al imprimir, oculto en la página de pantalla. El selector ofrece únicamente impresión, con CV resumido primero y enfocado al abrir el selector, seguido de CV completo.
- Describir el ciclo de vida completo como capacidad profesional, con enfoque para reclutadores. Mantener el texto «Años de experiencia creando soluciones empresariales» y las tarjetas bajo la foto centradas y compactas, con altura ajustada al texto y sin saltos de línea forzados; las tecnologías del CV resumido ocupan tres tarjetas de igual altura. Las fechas no llevan la anotación de periodo de contrato.
- Mantener las tecnologías y la experiencia confirmadas por el titular; no inventar resultados, certificaciones, herramientas o fechas. Java, Spring Boot, Oracle, PL/SQL y microservicios figuran como experiencia histórica en CODESA, no como tecnologías que se ofrecen actualmente. Python no está confirmado y no debe añadirse como competencia.
- Los portales de administración confirmados son Security, Identity, Azure, SharePoint y Power Platform.
- Usar comas en lugar de puntos y coma en el texto visible del currículum. El pie usa Copyright ©, Alejandro’sTech y la reserva de derechos del idioma actual, sin describir la marca.
- El logo usa iniciales SH geométricas con margen interior dentro de una cabeza de agente robot con hombros simétricos, sin etiquetas HTML y compacto a 32 px. El favicon conserva el robot completo con hombros visibles también a 16 px.
- La tarjeta Alejandro’sTech mantiene el nombre y Próximamente centrados entre sí, con el globo separado a la izquierda y altura compacta.
- Los botones tienen tooltips nativos y breves en ambos idiomas, conservando su respuesta de pulsación. Solo los contactos usan ayudas visuales compactas, accesibles con teclado y Escape, ocultas al imprimir. Las tecnologías no llevan ayudas ni subrayados punteados. Respetar la reducción de movimiento.
- Las dos banderas del selector se integran en las páginas generadas. Alternar su visibilidad con el idioma, sin descargar o sustituir imágenes al pulsar.
- La marca elegida es Alejandro’sTech. Mientras no tenga URL, mostrar Próximamente también en ambas impresiones, sin crear un enlace ficticio.
- La tarjeta de la marca es un botón activo que muestra un aviso de Próximamente sobre la web completa (experiencia, proyectos, servicios y contenidos de desarrollo, automatización e IA), sin navegar hasta disponer de una URL real.

## Alcance de la sincronización

Este flujo se ejecuta al atender una petición del usuario desde este proyecto o desde un chat que tenga acceso a él y a ambas conexiones. No es un servicio permanente ni una sincronización automática de cambios hechos fuera de ese flujo. No crear horarios o automatizaciones recurrentes sin una solicitud adicional del usuario.
