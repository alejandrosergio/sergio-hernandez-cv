# Revisión de contenido e impresiones

## Referencia anterior conservada

- GitHub, rama `main` antes de esta revisión: `ce8f251e381e10f53829ab09dae8e978b47a9fab`.
- Sites, versión 41: `appgprj_6ab43a615b348191bbb5481a891b4b2b~appgver_f20d68e82a148191a2e8ab4ecee8df43`.
- Commit de fuentes de Sites: `0be21279a1c15d989ea3c240236b794d944531ec`.
- Copia local: `tmp/backups/cv-v41-antes-revision-impresiones.zip`. Contiene los 40 archivos administrados anteriores y un manifiesto de hashes. Se comprobó la copia descomprimida contra todos los hashes.

El ZIP es local y está excluido del repositorio. Los commits anteriores permanecen en el historial. Para volver, recuperar los archivos administrados de esa referencia sobre una nueva revisión, integrar primero cualquier cambio posterior, regenerar y comprobar, y publicar y sincronizar siguiendo `AGENTS.md`. No restablecer ni forzar `main`, ni mezclar los historiales independientes de Sites y GitHub. No se ha ejecutado ninguna reversión.

## Antes y después

| Elemento | Versión anterior | Revisión |
| --- | --- | --- |
| Experiencia | Descripción breve de tareas | Trabajo y finalidad empresarial según el texto confirmado, sin métricas inventadas |
| Formación | Denominación de Software con sigla ADSI | Análisis y Desarrollo de Sistemas de Información (ADSI), con traducción descriptiva |
| Resumido | Tres tarjetas paralelas con todo el inventario y fotografía | Competencias seleccionadas en bloques de ancho completo y sin fotografía |
| Orden de papel | Tecnologías antes de experiencia, fechas laterales en el completo | Perfil, experiencia, competencias y formación, en orden lógico y una columna |
| Cabecera completa | Experiencia total junto al perfil en la columna de la fotografía | Experiencia total junto a la identidad, fotografía solo en cabecera |
| Marca pendiente | Alejandro’sTech y Próximamente en papel | Solo en la web, ambos CV conservan el enlace real al currículum |

El perfil, los cargos, los países y la cronología se reutilizan de la web. La versión completa también reutiliza sus descripciones, competencias y formación. Solo las viñetas condensadas y la selección del resumido viven en `src/recruiter.json`. Se mantienen dos versiones de impresión y dos idiomas, con el diseño de pantalla anterior.

La formación confirmada es «Tecnólogo en Análisis y Desarrollo de Sistemas de Información (ADSI)», Servicio Nacional de Aprendizaje (SENA), 2019–2021. En inglés: «Technology degree in Information Systems Analysis and Development (ADSI)». No se presenta como ingeniería ni grado universitario de bachelor.

## Verificación reproducible

1. Ejecutar `pnpm build` y `pnpm check`.
2. Ejecutar `node scripts/prepare-print-check.mjs`. Genera cuatro HTML y el manifiesto en `tmp/pdfs/`, usando el DOM generado y las reglas reales de impresión. Solo se incorporan los recursos locales y se omiten los scripts, ya que idioma y variante están seleccionados en el documento.
3. Convertir esos cuatro HTML a PDF con el motor de impresión de Edge o Chromium, A4, sin cabeceras y pies añadidos por el navegador, respetando el CSS. Conservar los nombres del manifiesto bajo `output/pdf/`.
4. Ejecutar `python scripts/check-pdfs.py` con un Python que disponga de `pypdf` y `pdfplumber`. Revisa ambos órdenes de extracción, secciones, perfil, empleo completo en una misma página, competencias sin intercalar, ADSI, enlaces, ausencia de marca pendiente, límites de texto y tamaño del cuerpo.
5. Renderizar las páginas con Poppler y revisar todas las imágenes. La comprobación de texto no reemplaza la revisión visual de espacios, recortes y solapamientos.

Resultado verificado de esta revisión: resumido de una página A4 en español e inglés, completo de dos páginas A4 en ambos idiomas, seis páginas revisadas visualmente. Cuerpo principal de 10 pt, metadatos y contactos de 9 pt. Cada PDF conserva seis destinos de enlace. Las dos extracciones mantienen juntas empresa, cargo, periodo, país, duración y viñetas. Sin páginas vacías, recortes observados ni columnas de competencias intercaladas.

Los PDF y las imágenes de revisión son salidas locales excluidas del repositorio, no nuevas opciones de descarga del Site. No se ha probado un ATS real ni se promete compatibilidad universal o una puntuación ATS.

## Referencias consultadas

- [Greenhouse: dificultades de extracción de currículums](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse). Describe posibles problemas con columnas, tablas, cabeceras e imágenes. Una extracción incompleta no equivale por sí sola a un rechazo automático.
- [SENA: Resolución 1183 de 2020](https://normograma.sena.edu.co/compilacion/docs/resolucion_sena_1183_2020.htm). Distingue la denominación ADSI de la posterior ADSO. La asistencia y fechas del titular proceden de su confirmación.
