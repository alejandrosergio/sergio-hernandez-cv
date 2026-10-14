# Currículum profesional · Sergio Hernández

Currículum web bilingüe de **Sergio Alejandro Hernández Patiño**, Analista y Desarrollador de Software con **+6 años de experiencia**. Presenta su trayectoria, especialidades en .NET, Microsoft Power Platform e inteligencia artificial, y capacidad para acompañar el ciclo de vida completo del software.

**[Consultar el currículum publicado](https://sergio-hernandez-cv.alejosergio3000.chatgpt.site/)**

**[Repositorio público del proyecto](https://github.com/alejandrosergio/sergio-hernandez-cv)**

## Funcionalidades

- Español e inglés, con contenido completo en ambas páginas estáticas.
- Diseño adaptable a móvil y escritorio, con modos claro y oscuro.
- Ajustes de texto, alto contraste, reducción de movimiento y espaciado de lectura.
- Selector de CV Web completo y CV Reclutador de una página, con descarga PDF e impresión en A4.
- PDF en español e inglés con enlaces de contacto y un enlace al currículum web que solo aparece en el documento impreso.
- Navegación por secciones y botón para volver al inicio.
- Metadatos SEO, referencias entre idiomas, sitemap y datos estructurados del perfil.
- Copia HTML autónoma y archivos minificados para publicación.

## Tecnología del sitio

La interfaz utiliza **HTML5, CSS3 y JavaScript**. La generación se realiza con **Node.js y pnpm**, utilizando esbuild, html-minifier-terser, linkedom, fflate y PDFKit; pdf-lib verifica los documentos generados. El sitio publicado funciona con archivos estáticos y recursos locales.

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

Edita el contenido en `src/index.html` y las traducciones en `src/locales/en.json`. El resumen breve bilingüe está en `src/recruiter.json`; nombres, contactos, empresas, cargos, fechas y formación se reutilizan del CV completo. Los cambios de apariencia y comportamiento se realizan en `src/styles.css` y `src/script.js`. Ejecuta la generación para actualizar `dist/`, los cuatro PDF y las descargas.

Los metadatos y el mapa del sitio están configurados para la dirección publicada indicada arriba. Si cambias el dominio, actualiza la constante `origin` en `scripts/build.mjs` y vuelve a generar.

## Mantenimiento con Sites y GitHub

Al solicitar cambios desde el proyecto local, el agente sigue `AGENTS.md`: modifica y verifica el currículum, publica la web existente en Sites y guarda los mismos archivos en la rama `main` de este repositorio. La respuesta debe confirmar ambos resultados.

La configuración y los pasos para usar el proyecto están en [docs/SINCRONIZACION.md](docs/SINCRONIZACION.md). Este flujo se ejecuta al atender una petición con acceso a ambos servicios; no instala un proceso de sincronización en segundo plano. Sites y GitHub mantienen historiales independientes, con el mismo contenido del proyecto.

## Impresión

Selecciona **Imprimir CV** y elige **CV Web** o **CV Reclutador**. Cada opción permite descargar el PDF directamente o abrir la impresión del navegador. El CV Web incluye todo el contenido; el CV Reclutador ofrece una página con perfil, competencias, experiencia resumida, formación y contactos. Ambos usan el idioma seleccionado y conservan los vínculos a Maps, correo, teléfono, LinkedIn y GitHub.

Los dos documentos incluyen un enlace clicable al currículum completo en la web. Ese enlace se oculta en la página de pantalla. Para guardar desde el diálogo del navegador, elige **Guardar como PDF** y desactiva sus encabezados y pies de página. Las descargas se generan en `dist/descargas/` como `CV_Sergio_Hernandez_Web_ES.pdf`, `CV_Sergio_Hernandez_Reclutador_ES.pdf` y sus versiones `_EN.pdf`.

## Recursos

La fotografía corresponde al titular del currículum. La licencia de las banderas se conserva en `public/flags/LICENSE.txt`. La página no incorpora analítica ni formularios; las preferencias de lectura se guardan localmente en el navegador.
