# Currículum web de Sergio Hernández

Currículum bilingüe de un Analista y Desarrollador de Software con +6 años de experiencia. Presenta .NET, Power Platform e inteligencia artificial con títulos de igual jerarquía y una distribución ajustada a su contenido, gestión del ciclo de vida completo (ALM), liderazgo técnico y datos SQL y NoSQL. Auto Control Empresarial figura en 2023–2025 y DynamizaTIC en 2025–2027, indicando el periodo de contrato. Idiomas: español nativo e inglés B1.

## Abrir el currículum

El sitio publicado sirve la versión en español en `/` y la versión en inglés en `/en/`. Ambas contienen todo el currículum en el HTML, incluso sin JavaScript. El botón de idioma cambia el contenido, los controles, la URL y los metadatos sin recargar la página.

La copia `CV_Sergio_Hernandez.html` de la descarga funciona por sí sola: incorpora estilos, comportamiento, fotografía y banderas. También puedes abrir `index.html` junto con los archivos y carpetas del ZIP sin instalar dependencias.

## Editar y generar

- `src/index.html`: contenido original en español.
- `src/locales/en.json`: traducciones al inglés.
- `src/recruiter.json`: resumen bilingüe para reclutadores, sin datos profesionales inventados.
- `src/script.js`: controladores de idioma, tema, accesibilidad, impresión y navegación.
- `src/styles.css`: estilos de pantalla e impresión, sin reglas de papel redundantes.
- `public/`: fotografía original, banderas y favicon que se copian a la versión publicada.
- `scripts/build.mjs`: genera las páginas estáticas, minifica HTML/CSS/JavaScript y actualiza las descargas.
- `scripts/build-print.mjs`: reutiliza los datos y todas las tecnologías del CV completo en el marcado para impresión resumida.
- `scripts/check.mjs`: revisa enlaces locales, traducciones, metadatos, las dos opciones de impresión, el teclado y los enlaces de las versiones impresas.
- `dist/`: archivos listos para publicar. Los recursos se sirven localmente, sin dependencias en ejecución.

Con Node.js y pnpm disponibles:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm check
```

El proyecto fija las versiones de sus herramientas de desarrollo. Solo esbuild tiene autorizado un paso de instalación propio. Para editar, cambia los originales en `src/` y vuelve a generar; no edites directamente las copias minificadas. Conserva `public/`, que contiene la fotografía original y las banderas con su licencia. La generación reconstruye los recursos de `dist/` desde esta carpeta, también al utilizar el ZIP descargado.

## Impresión

**Imprimir CV** abre un selector con **CV completo** (todo el contenido) y **CV resumido** (perfil breve, todas las tecnologías y experiencia condensada). Cada versión abre el diálogo de impresión del navegador en el idioma actual.

Ambos documentos incluyen **Ver el currículum vitae completo en la web**, un enlace clicable a la página del mismo idioma. El enlace solo se muestra al imprimir. Se mantienen los enlaces reales de correo, teléfono, Google Maps, LinkedIn y GitHub.

Los estilos de papel usan A4 y fondo blanco independientemente del tema, contraste o escala de lectura. Ocultan navegación, botones flotantes, el selector y accesibilidad. La impresión utiliza el idioma y la versión seleccionados. Desactiva los encabezados y pies de página del navegador para una presentación limpia. Si el visor integrado bloquea el diálogo, el sitio permite abrir la misma versión del CV en una nueva pestaña.

## Accesibilidad

La tuerca abre ajustes de texto del 100–200 %, alto contraste, reducción de movimiento y espaciado de lectura. Escape cierra el panel y devuelve el foco. Las preferencias se recuerdan solo en este navegador cuando está disponible el almacenamiento. **Restablecer ajustes** restaura el texto al 100 % y la preferencia de movimiento del sistema.

El botón de la esquina inferior izquierda aparece después de bajar 320 píxeles y vuelve al inicio respetando la reducción de movimiento. Los contactos están centrados, con iconos y enlaces descriptivos. La navegación tiene en cuenta la cabecera fija solo cuando realmente está fija.

## SEO

Las páginas en español e inglés tienen títulos y descripciones específicos, dirección canónica propia, referencias recíprocas `hreflang`, metadatos para compartir y datos estructurados `ProfilePage`/`Person`. Se generan `robots.txt` y un mapa del sitio con ambas versiones. Las descargas no se anuncian para indexación. La fotografía original se reutiliza en los metadatos de vista previa.

HTML, CSS y JavaScript se minifican con herramientas dedicadas. Los recursos incluyen una huella de contenido en su URL para evitar que una actualización utilice archivos antiguos. Estas mejoras facilitan el rastreo y reducen el peso; la indexación, posición y visitas dependen también de los buscadores y de la difusión del perfil.

## Privacidad

La página publica los datos profesionales y la fotografía facilitados por el titular. No incorpora analítica, formularios, cookies ni bibliotecas externas en ejecución. Tema, idioma y accesibilidad se guardan localmente; no se envían a otros servicios. Los enlaces externos solo se abren cuando se seleccionan.

## Identidad y conocimientos confirmados

El logo SH utiliza trazos de código y nodos como identidad visual del currículum. Alejandro’sTech es la marca elegida para el portfolio y servicios freelance: el acceso indica Próximamente y no tiene un destino asignado. El pie presenta el lema «IA y automatización que trabajan para tu negocio». Ambas impresiones incluyen Alejandro’sTech con Próximamente mientras no tenga una URL.

Las tecnologías incluyen ASP.NET Core/Web API, Entity Framework Core, LINQ, inyección de dependencias, pruebas unitarias y procedimientos almacenados; en Power Platform, apps canvas/model-driven, plugins de Dataverse, componentes PCF, RPA, conectores personalizados y soluciones/ALM. Fueron confirmadas por el titular y se reutilizan en ambas versiones impresas. Los seis años corresponden a la trayectoria profesional total, no a una duración atribuida a cada tecnología.

Java y Spring Boot se muestran únicamente en la experiencia de CODESA, junto con microservicios y Angular. La sección de tecnologías describe los conocimientos que se ofrecen actualmente.
