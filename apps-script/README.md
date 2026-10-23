# Hoja de solicitudes de Casetas Maderik

Cada vez que alguien pide presupuesto en la web, la solicitud se guarda como una fila en una hoja de Google, con la fecha y la hora. Una segunda pestaña cuenta los leads. El script no envía ningún email. Calcula unos 10 minutos.

## Qué vas a tener

- Pestaña **Solicitudes**: una fila por solicitud con Nº, Fecha, Hora, Nombre, Teléfono, Email, Empresa, Tipo de evento, Fecha de inicio, Fecha de fin, Localidad, Provincia, Casetas y Comentarios. Solo los datos del formulario.
- Pestaña **Contador**: total de leads, leads de hoy y del mes en curso (se actualizan solos), y debajo una tabla con los leads de cada mes.

## Paso 1. Crear la hoja y pegar el código

1. En [Google Drive](https://drive.google.com), con la cuenta que va a recibir las solicitudes, crea una hoja de cálculo en blanco y llámala **Casetas Maderik · Solicitudes**.
2. En la hoja, abre **Extensiones > Apps Script**.
3. Abre `Código.gs`, borra todo y pega el contenido completo de `apps-script/Code.gs`. Guarda (Ctrl + S o Cmd + S).
4. Recomendable: en **Configuración del proyecto** (engranaje) marca **Mostrar el archivo de manifiesto "appsscript.json"**, abre `appsscript.json`, pega el contenido de `apps-script/appsscript.json` y guarda. Fija la zona horaria de Madrid.

## Paso 2. Configurar

1. En el desplegable junto a **Ejecutar**, elige **configurar** y pulsa **Ejecutar**.
2. Acepta los permisos la primera vez (**Revisar permisos**, tu cuenta y, si sale "Google no ha verificado esta aplicación", **Configuración avanzada > Ir a Casetas Maderik**). La aplicación es tuya.
3. En el **Registro de ejecución** aparece una línea "Secreto para APPS_SCRIPT_SECRET en Vercel: …". Copia ese secreto (sin espacios). No lo compartas.

Se crean las pestañas Solicitudes y Contador. Puedes volver a ejecutar `configurar` cuando quieras: no borra datos y el secreto no cambia.

## Paso 3. Publicar como aplicación web

1. **Implementar > Nueva implementación**, tipo **Aplicación web**.
2. **Ejecutar como**: Yo. **Quién tiene acceso**: Cualquier usuario (la seguridad la pone el secreto).
3. Pulsa **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).

## Paso 4. Conectar la web en Vercel

1. En Vercel, proyecto de la web, **Settings > Environment Variables**, añade para **Production**:
   - `APPS_SCRIPT_URL`: la URL `/exec` del paso 3.
   - `APPS_SCRIPT_SECRET`: el secreto del paso 2.
2. Vuelve a desplegar (**Deployments > … > Redeploy**): las variables nuevas solo se aplican en un despliegue nuevo.

## Paso 5. Probar

Envía el formulario desde `/contacto` con tus datos. Aparece una fila nueva en Solicitudes y el Contador sube en 1. Borra la fila de prueba cuando quieras (el Contador mensual no se descuenta solo: corrige la cifra del mes a mano si lo necesitas).

## Cambiar el código sin cambiar la URL

Pega el código nuevo, guarda y en **Implementar > Gestionar implementaciones** edita la implementación activa con **Versión: Nueva versión**. La URL `/exec` no cambia.

## Si algo falla

- **No llegan solicitudes**: revisa en Vercel las dos variables (sin espacios) y que hayas vuelto a desplegar. En Vercel, **Logs** muestra mensajes `[presupuesto]` con la causa.
- **"APPS_SCRIPT_SECRET no coincide"** en los registros: ejecuta otra vez `configurar` y copia el secreto del registro.
- **Errores dentro del script**: en Apps Script, menú **Ejecuciones**.
- No cambies el orden de las columnas de Solicitudes.
