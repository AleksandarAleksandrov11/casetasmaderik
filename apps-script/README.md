# Hoja de solicitudes de Casetas Maderik

Cada vez que alguien pide presupuesto en la web, la solicitud se guarda en una hoja de Google y te llega un email de aviso a info@casetasmaderik.es. Opcionalmente, el cliente puede recibir un email de confirmación (viene desactivado; ver "Ajustes habituales"). Esta guía explica cómo dejarlo funcionando. No hace falta saber programar: solo copiar, pegar y seguir los pasos en orden. Calcula unos 15 minutos.

## Qué vas a tener

- Pestaña **Solicitudes**: una fila por solicitud, con número correlativo, estado (Nuevo, Contactado, Presupuesto enviado, Reservado, Perdido), datos de contacto, evento, fechas, lugar, casetas y origen de la visita. Las filas en estado Nuevo salen en negrita.
- Pestaña **Panel**: total de solicitudes en grande, actividad de hoy, de la semana y del mes, casetas pedidas, tasa de cierre, tablas por estado, por tipo de evento y por provincia, origen de las visitas, gráfico de los últimos 12 meses y próximos eventos. Se actualiza sola.
- Menú **Casetas Maderik** dentro de la hoja con tres opciones: configurar o reparar la hoja, enviar una solicitud de prueba y ver el secreto de conexión.

## Paso 1. Crear la hoja

1. Entra en [Google Drive](https://drive.google.com) con la cuenta de Google que va a recibir las solicitudes (la de info@casetasmaderik.es si es una cuenta de Google Workspace).
2. Pulsa **Nuevo > Hojas de cálculo de Google > Hoja de cálculo en blanco**.
3. Arriba a la izquierda, cambia el nombre "Hoja de cálculo sin título" por **Casetas Maderik · Solicitudes**. (Si se te olvida, el paso 3 lo cambia solo.)

## Paso 2. Pegar el código

1. En la hoja, abre el menú **Extensiones > Apps Script**. Se abre el editor en otra pestaña.
2. Arriba a la izquierda, cambia el nombre "Proyecto sin título" por **Casetas Maderik**.
3. En la lista de archivos de la izquierda verás `Código.gs` (o `Code.gs`). Ábrelo, borra todo lo que tenga y pega el contenido completo del archivo `apps-script/Code.gs` de este proyecto.
4. Pulsa el icono de guardar (el disquete) o Ctrl + S (Cmd + S en Mac).
5. Opcional pero recomendable: en el menú de la izquierda, entra en **Configuración del proyecto** (el engranaje), marca **Mostrar el archivo de manifiesto "appsscript.json" en el editor**, vuelve al editor, abre `appsscript.json`, sustituye su contenido por el del archivo `apps-script/appsscript.json` y guarda. Así quedan fijadas la zona horaria de Madrid y la configuración de la aplicación web.

## Paso 3. Ejecutar la configuración y aceptar permisos

1. En el editor, arriba, elige la función **setup** en el desplegable que está junto al botón **Ejecutar**.
2. Pulsa **Ejecutar**.
3. Google te pedirá permisos la primera vez: pulsa **Revisar permisos**, elige tu cuenta y, si aparece el aviso "Google no ha verificado esta aplicación", pulsa **Configuración avanzada > Ir a Casetas Maderik (no seguro)**. Es normal: la aplicación es tuya y solo tú la usas. Pulsa **Permitir**.
4. Espera a que en el registro de abajo ponga "Ejecución completada". Vuelve a la pestaña de la hoja y recárgala: verás las pestañas **Solicitudes** y **Panel** y el menú **Casetas Maderik**.

`setup` se puede ejecutar todas las veces que quieras (desde el editor o desde el menú **Casetas Maderik > Configurar o reparar la hoja**). Si alguien desordena formatos, colores o el filtro, vuelve a dejarlo todo bien sin tocar los datos. Nota: rehace el formato condicional y el panel, así que no añadas tus propias reglas de colores en la pestaña Solicitudes ni escribas en el Panel.

## Paso 4. Copiar el secreto de conexión

El secreto es una contraseña larga que comparten la web y la hoja para que nadie más pueda escribir en ella.

1. En la hoja, abre **Casetas Maderik > Ver secreto de conexión**.
2. Copia el texto que aparece (sin espacios delante ni detrás) y guárdalo un momento: lo necesitas en el paso 6.

No lo compartas con nadie ni lo pegues en emails o chats.

## Paso 5. Implementar como aplicación web

1. En el editor de Apps Script, arriba a la derecha, pulsa **Implementar > Nueva implementación**.
2. Pulsa el engranaje junto a "Seleccionar tipo" y elige **Aplicación web**.
3. Rellena:
   - **Descripción**: Formulario web.
   - **Ejecutar como**: **Yo** (tu cuenta).
   - **Quién tiene acceso**: **Cualquier usuario**. (Es necesario para que Vercel pueda enviar las solicitudes. La seguridad la pone el secreto del paso 4.)
4. Pulsa **Implementar**. Si te vuelve a pedir permisos, acéptalos como en el paso 3.
5. Copia la **URL de la aplicación web**. Tiene esta forma y termina en `/exec`:
   `https://script.google.com/macros/s/AKfy...larguísimo.../exec`

Para comprobar que responde, pega esa URL en el navegador: debe mostrar `{"ok":true}`.

## Paso 6. Conectar la web en Vercel

1. Entra en [Vercel](https://vercel.com), abre el proyecto de la web y ve a **Settings > Environment Variables**.
2. Añade estas dos variables para el entorno **Production** (y también **Preview** si quieres probar en las vistas previas):
   - `APPS_SCRIPT_URL`: la URL `/exec` del paso 5.
   - `APPS_SCRIPT_SECRET`: el secreto del paso 4.
3. Guarda y vuelve a desplegar la web: **Deployments**, en el último despliegue pulsa los tres puntos y elige **Redeploy**. Las variables nuevas solo se aplican en un despliegue nuevo.

Si falta `APPS_SCRIPT_URL` en producción, la web no pierde la solicitud en silencio: muestra un error al usuario con la opción de escribir por WhatsApp y deja un mensaje claro en los registros de Vercel.

## Paso 7. Probar

1. En la hoja, abre **Casetas Maderik > Enviar solicitud de prueba**. Debe aparecer una fila nueva con el nombre "Prueba (borrar)". Los emails de esta prueba van **solo** a la dirección de pruebas `testEmail` del bloque `CONFIG`, nunca a info@casetasmaderik.es ni a ningún cliente. Si dejas `testEmail` vacío (`''`), la prueba no envía ningún email y solo crea la fila.
2. Después, haz una prueba real desde la web: entra en `https://casetasmaderik.es/contacto`, rellena el formulario con tus datos y envíalo. Debe aparecer la fila con el número siguiente y llegarte el email con los botones Llamar, WhatsApp, Responder y Abrir hoja.
3. Borra las filas de prueba cuando quieras. El número correlativo no se repite aunque borres filas.

## Cómo publicar una versión nueva sin cambiar la URL

Si en el futuro cambias el código (por ejemplo, para activar el email al cliente), hay que publicar una versión nueva de la misma implementación. Si creas una implementación nueva, la URL cambia y tendrías que actualizarla en Vercel.

1. Pega el código nuevo en `Code.gs` y guarda.
2. Pulsa **Implementar > Gestionar implementaciones**.
3. Selecciona la implementación activa (Formulario web) y pulsa el lápiz (**Editar**).
4. En **Versión**, elige **Nueva versión** y pulsa **Implementar**.

La URL `/exec` sigue siendo la misma y no hay que tocar nada en Vercel.

## Ajustes habituales

Todos están al principio de `Code.gs`, en el bloque `CONFIG`:

- `sendClientConfirmation`: `false` (por defecto) no envía nada al cliente; `true` le envía un email de confirmación con el resumen de su solicitud.
- `notifyEmail`: dirección que recibe los avisos de las solicitudes reales.
- `testEmail`: única dirección a la que envía emails la solicitud de prueba. Vacía, la prueba no envía ningún email.
- `responseTime`, `phoneDisplay`, `whatsappNumber`: datos que aparecen en los emails.

Tras cambiarlos, publica una versión nueva como se explica arriba.

## Cuotas de email de Google

Los emails se envían con tu cuenta mediante MailApp, que tiene un límite diario:

- Cuenta gratuita de Gmail: unos **100 emails al día**.
- Google Workspace: unos **1.500 emails al día**.

Cada solicitud gasta un email (el aviso interno), o dos si activas la confirmación al cliente. Con una cuenta gratuita y la confirmación activada eso son unas 50 solicitudes al día. Si se acaba la cuota, la solicitud se guarda igualmente en la hoja; solo se pierde el email, y queda anotado en **Apps Script > Ejecuciones**.

## Uso diario

- Cambia el **Estado** de cada solicitud con el desplegable. El color cambia solo y el Panel se actualiza.
- Usa **Notas internas** y **Último contacto** (doble clic para elegir la fecha) para el seguimiento.
- El filtro de la cabecera permite ver, por ejemplo, solo las solicitudes en estado Nuevo.
- No cambies los títulos de la fila 1 ni el orden de las columnas: el script los necesita. Si alguien lo intenta, Google muestra un aviso.

## Si algo falla

- **No llegan solicitudes desde la web**: abre la URL `/exec` en el navegador (debe mostrar `{"ok":true}`), revisa que en Vercel estén las dos variables sin espacios y que hayas vuelto a desplegar. En Vercel, **Logs** muestra mensajes que empiezan por `[presupuesto]` con la causa.
- **Mensaje "APPS_SCRIPT_SECRET no coincide" en los registros de Vercel**: vuelve a copiar el secreto desde **Casetas Maderik > Ver secreto de conexión**.
- **La respuesta de Apps Script no es JSON**: la implementación no tiene acceso "Cualquier usuario" o la URL no termina en `/exec`.
- **Errores dentro del script**: en el editor de Apps Script, menú de la izquierda **Ejecuciones**.
- **La hoja se ha desordenado**: **Casetas Maderik > Configurar o reparar la hoja**.
