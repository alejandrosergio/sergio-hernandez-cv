# Currículum profesional · Sergio Hernández

Currículum web bilingüe de **Sergio Alejandro Hernández Patiño**, Desarrollador .NET y Power Platform con **+6 años de experiencia** y capacidad full stack. Presenta su trayectoria, especialidades en .NET, Microsoft Power Platform e inteligencia artificial, y capacidad para acompañar el ciclo de vida completo del software.

**[Consultar el currículum publicado](https://sergio-hernandez-cv.alejosergio3000.chatgpt.site/)**

**[Repositorio público del proyecto](https://github.com/alejandrosergio/sergio-hernandez-cv)**

## Funcionalidades

- Español e inglés, con contenido completo en ambas páginas estáticas y banderas integradas que alternan sin otra descarga.
- Diseño adaptable a móvil y escritorio, con modos claro y oscuro y reflujo al ampliar el texto.
- Halo azul discreto que acompaña al ratón y respeta teclado, táctil y reducción de movimiento.
- Ajustes de texto, alto contraste, reducción de movimiento y espaciado de lectura.
- Selector con CV resumido primero y CV completo después, con impresión en A4 en el idioma actual.
- Ambas versiones impresas conservan los contactos y un enlace al currículum web, visible solo al imprimir. Todos los vínculos impresos se distinguen en azul y subrayados.
- Navegación por secciones y botón para volver al inicio.
- Tooltips nativos breves en los botones y ayudas visuales compactas en los contactos.
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
  cursor.js           Detalle decorativo del ratón
  tooltips.js         Ayudas compactas de los contactos
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

Edita el contenido en `src/index.html` y las traducciones en `src/locales/en.json`. Los textos propios de la impresión resumida están en `src/recruiter.json`; el perfil completo, nombres, contactos, tecnologías, empresas, cargos, fechas y formación se reutilizan del CV completo. Los cambios de apariencia y comportamiento se realizan en `src/styles.css` y `src/script.js`. Ejecuta la generación para actualizar `dist/` y las copias HTML.

Los metadatos y el mapa del sitio están configurados para la dirección publicada indicada arriba. Si cambias el dominio, actualiza la constante `origin` en `scripts/build.mjs` y vuelve a generar.

## Mantenimiento con Sites y GitHub

Al solicitar cambios desde el proyecto local, el agente sigue `AGENTS.md`: modifica y verifica el currículum, publica la web existente en Sites y guarda los mismos archivos en la rama `main` de este repositorio. La respuesta debe confirmar ambos resultados.

La configuración y los pasos para usar el proyecto están en [docs/SINCRONIZACION.md](docs/SINCRONIZACION.md). Este flujo se ejecuta al atender una petición con acceso a ambos servicios; no instala un proceso de sincronización en segundo plano. Sites y GitHub mantienen historiales independientes, con el mismo contenido del proyecto.

## Impresión

Selecciona **Imprimir CV** y elige **CV resumido**, que aparece primero, o **CV completo**. El resumido presenta el perfil completo, todas las tecnologías y la trayectoria condensada. El completo incluye todo el contenido de la web. Ambos abren la impresión del navegador, usan el idioma seleccionado y conservan los vínculos a Maps, correo, teléfono, LinkedIn y GitHub.

Los documentos impresos incluyen un enlace clicable al currículum completo en la web del mismo idioma. Ese enlace se oculta en la página de pantalla. Desactiva los encabezados y pies de página del navegador para una presentación limpia.

## Recursos

La fotografía corresponde al titular del currículum, con vestuario y fondo editados mediante IA por petición suya, con el objetivo de conservar su identidad y expresión. La licencia de las banderas se conserva en `public/flags/LICENSE.txt`. La página no incorpora analítica ni formularios; las preferencias de lectura se guardan localmente en el navegador.

## Identidad y conocimientos confirmados

El logo utiliza un monograma SH geométrico con margen interior, centrado en una cabeza de agente robot con hombros simétricos. El favicon conserva el robot completo, con los hombros visibles también a 16 px. La cabecera identifica el sitio como «Sergio Hernández · Currículum vitae», con su traducción al inglés.

Alejandro’sTech será la web completa para la experiencia, proyectos, servicios y contenidos sobre desarrollo, automatización e IA. Su tarjeta compacta es un botón activo con animación y tooltip nativo, muestra Próximamente y al pulsarlo informa del estado de la web. El nombre y el estado se centran entre sí, con el globo separado a la izquierda. Mientras no exista una URL real, el botón no navega y ambas impresiones muestran el nombre con Próximamente.

El pie muestra «Copyright © 2026 Alejandro’sTech. Todos los derechos reservados.», con su traducción al inglés. El currículum mantiene su alcance breve. Los proyectos detallados, casos de estudio y contenidos ampliados se reservan para Alejandro’sTech.

Las tecnologías incluyen ASP.NET Core/Web API, Entity Framework Core, LINQ, inyección de dependencias, pruebas unitarias y procedimientos almacenados; en Power Platform, apps canvas/model-driven, plugins de Dataverse, componentes PCF, RPA, conectores personalizados y soluciones/ALM. Fueron confirmadas por el titular y se reutilizan en ambas versiones impresas. Los seis años corresponden a la trayectoria profesional total, no a una duración atribuida a cada tecnología.

React figura como tecnología frontend actual. Java, Spring Boot, Oracle, PL/SQL y microservicios se muestran únicamente en la experiencia de CODESA, junto con Angular. La sección de tecnologías describe los conocimientos que se ofrecen actualmente. El cargo confirmado en DynamizaTIC es «Desarrollador Senior • Microsoft 365», traducido como «Senior Developer • Microsoft 365» en inglés, también en ambas impresiones.

Las etiquetas de tecnologías agrupan las capacidades relacionadas sin duplicar Power Apps, Dataverse ni RPA. Los portales de administración confirmados son Microsoft Defender (Security), Microsoft Entra ID (Identity), Azure, SharePoint y Power Platform. Python no se presenta como competencia. El CV resumido mantiene tres tarjetas de tecnología con igual espacio y conserva todos los conocimientos ofrecidos.

La cabecera presenta «Desarrollador .NET y Power Platform», con desarrollo full stack, automatización e integración de IA como alcance. La cronología acordada es CODESA (sept. 2020–mar. 2021, 6 meses), Intelecto (mar. 2021–mar. 2023, 2 años), Auto Control Empresarial (mar. 2023–mar. 2025, 2 años) y DynamizaTIC (mar. 2025–oct. 2026, 1 año y 7 meses). Los meses intermedios se reconstruyeron con las duraciones y fueron aceptados por el titular.

Las fechas se editan en los atributos data-start y data-end de cada experiencia en src/index.html. El generador calcula los textos de meses y las duraciones en español e inglés, y los reutiliza en el CV resumido. Se cuentan diferencias de meses sin sumar dos veces los límites compartidos. La duración acordada es aproximadamente 6 años y 1 mes. Las descripciones de DynamizaTIC se redactan en pasado porque la experiencia figura cerrada.
