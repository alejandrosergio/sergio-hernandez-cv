# Sites y GitHub

El código de esta carpeta corresponde al currículum publicado en Sites. El usuario pide que cada modificación de su currículum termine con la web publicada y el código actualizado en el repositorio `alejandrosergio/sergio-hernandez-cv`.

- [Currículum publicado en Sites](https://sergio-hernandez-cv.alejosergio3000.chatgpt.site/).
- [Código e historial en GitHub](https://github.com/alejandrosergio/sergio-hernandez-cv), repositorio público, rama `main`.

La política operativa está en `AGENTS.md`. El enlace al Site está en `.openai/hosting.json`; ese archivo contiene la identificación del proyecto y la carpeta estática, sin credenciales.

## Usar el proyecto en la aplicación de escritorio

1. Añadir esta carpeta como proyecto local: `C:\Users\Sergi\Documents\Codex\sergio-hernandez-cv`.
2. Abrir los chats para el currículum desde ese proyecto, con Sites y GitHub disponibles.
3. Pedir los cambios en lenguaje natural. El agente aplica las modificaciones, verifica, publica el Site y guarda un commit en GitHub siguiendo `AGENTS.md`.
4. Comprobar en la respuesta el resultado de ambos destinos. El repositorio conserva el historial del código; Sites conserva sus versiones publicadas.

ChatGPT Work local y Codex pueden usar un proyecto con acceso a los archivos y a las herramientas necesarias. Mantener la política dentro del repositorio evita depender solo de la memoria de un chat.

## Estado y acceso

El repositorio público `alejandrosergio/sergio-hernandez-cv` está creado y la conexión de GitHub ha permitido guardar un commit. Para dar por terminada cada entrega, verificar además los archivos completos de la rama `main` y el resultado satisfactorio de la publicación en Sites.

Si cambia la autenticación o la política de acceso, completar la conexión solicitada por la aplicación y volver a verificar. No copiar tokens ni contraseñas al chat o al código.

Los cambios realizados directamente en otros chats o en GitHub deben integrarse cuando vuelva a ejecutarse este flujo. No hay un proceso en segundo plano vigilando ambos destinos.
