# Currículum profesional · Sergio Hernández

Currículum web bilingüe de **Sergio Alejandro Hernández Patiño**, Analista y Desarrollador de Software con **+6 años de experiencia**. Presenta su trayectoria, especialidades en .NET, Microsoft Power Platform e inteligencia artificial, y capacidad para acompañar el ciclo de vida completo del software.

**[Consultar el currículum publicado](https://sergio-hernandez-cv.alejosergio3000.chatgpt.site/)**

**[Repositorio público del proyecto](https://github.com/alejandrosergio/sergio-hernandez-cv)**

## Funcionalidades

- Español e inglés, con contenido completo en ambas páginas estáticas.
- Diseño adaptable a móvil y escritorio, con modos claro y oscuro.
- Ajustes de texto, alto contraste, reducción de movimiento y espaciado de lectura.
- Selector de CV completo y CV resumido, con impresión en A4 en el idioma actual.
- Ambas versiones impresas conservan los contactos y un enlace al currículum web, visible solo al imprimir.
- Navegación por secciones y botón para volver al inicio.
- Metadatos SEO, referencias entre idiomas, sitemap y datos estructurados del perfil.
- Copia HTML autónoma y archivos minificados para publicación.

## Tecnología del sitio

La interfaz utiliza **HTML5, CSS3 y JavaScript**. La generación se realiza con **Node.js y pnpm**, utilizando esbuild, html-minifier-terser, linkedom y fflate. El sitio publicado funciona con archivos estáticos y recursos locales.

## Estructura

```text
src/                  Contenido y código editable
  index.html          Versión original en español
  locales/en.json     Traducciones al inglés
  recruiter.json      Resumen para reclutadores en español e inglés
  styles.css          Estilos de pantalla e impresión
  script.js           Idioma, tema, accesibilidad y navegación
public/               Fotografía, banderas y favicon
scripts/              Generación y verificaciones
dist/                 Archivos listos para abrir o publicar
docs/                 Guía para mantener Sites y GitHub al día
AGENTS.md             Instrucciones persistentes de mantenimiento
.openai/hosting.json   Vínculo al proyecto existente en Sites
LEEME.md              Documentación detallada
package.json          Herramientas y comandos del proyecto
```

## Abrir sin instalar herramientas

Abre `dist/index.html` en el navegador. Para utilizar un único archivo con todos los recursos incorporados, abre `dist/descargas/CV_Sergio_Hernandez.html`.

## Editar y generar

Con Node.js y pnpm instalados:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm check
```

Edita el contenido en `src/index.html` y las traducciones en `src/locales/en.json`. El resumen breve bilingüe está en `src/recruiter.json`; nombres, contactos, tecnologías, empresas, cargos, fechas y formación se reutilizan del CV completo. Los cambios de apariencia y comportamiento se realizan en `src/styles.css` y `src/script.js`. Ejecuta la generación para actualizar `dist/` y las copias HTML.

Los metadatos y el mapa del sitio están configurados para la dirección publicada indicada arriba. Si cambias el dominio, actualiza la constante `origin` en `scripts/build.mjs` y vuelve a generar.

## Mantenimiento con Sites y GitHub

Al solicitar cambios desde el proyecto local, el agente sigue `AGENTS.md`: modifica y verifica el currículum, publica la web existente en Sites y guarda los mismos archivos en la rama `main` de este repositorio. La respuesta debe confirmar ambos resultados.

La configuración y los pasos para usar el proyecto están en [docs/SINCRONIZACION.md](docs/SINCRONIZACION.md). Este flujo se ejecuta al atender una petición con acceso a ambos servicios; no instala un proceso de sincronización en segundo plano. Sites y GitHub mantienen historiales independientes, con el mismo contenido del proyecto.

## Impresión

Selecciona **Imprimir CV** y elige **CV completo** o **CV resumido**. El completo incluye todo el contenido de la web; el resumido presenta un perfil breve, todas las tecnologías y la trayectoria condensada. Ambos abren la impresión del navegador, usan el idioma seleccionado y conservan los vínculos a Maps, correo, teléfono, LinkedIn y GitHub.

Los documentos impresos incluyen un enlace clicable al currículum completo en la web del mismo idioma. Ese enlace se oculta en la página de pantalla. Desactiva los encabezados y pies de página del navegador para una presentación limpia.

## Recursos

La fotografía corresponde al titular del currículum. La licencia de las banderas se conserva en `public/flags/LICENSE.txt`. La página no incorpora analítica ni formularios; las preferencias de lectura se guardan localmente en el navegador.

## Identidad y conocimientos confirmados

El logo SH utiliza trazos de código y nodos como identidad visual del currículum. Alejandro’sTech es la marca elegida para el portfolio y servicios freelance: el acceso indica Próximamente y no tiene un destino asignado. El pie presenta el lema «IA y automatización que trabajan para tu negocio». Ambas impresiones incluyen Alejandro’sTech con Próximamente mientras no tenga una URL.

Las tecnologías incluyen ASP.NET Core/Web API, Entity Framework Core, LINQ, inyección de dependencias, pruebas unitarias y procedimientos almacenados; en Power Platform, apps canvas/model-driven, plugins de Dataverse, componentes PCF, RPA, conectores personalizados y soluciones/ALM. Fueron confirmadas por el titular y se reutilizan en ambas versiones impresas. Los seis años corresponden a la trayectoria profesional total, no a una duración atribuida a cada tecnología.

Java y Spring Boot se muestran únicamente en la experiencia de CODESA, junto con microservicios y Angular. La sección de tecnologías describe los conocimientos que se ofrecen actualmente.
