# Supabase — preparación V2

## Estado real

La URL y la publishable key están en `supabase-config.js`. Se verificó mediante
GET `/auth/v1/settings`: HTTP 200, email habilitado, confirmación de correo requerida.
El usuario confirmó la ejecución de `supabase/001-profiles.sql` en SQL Editor.
La API de perfiles rechazó una lectura sin sesión con HTTP 401.
`index.html` carga la configuración, `cuenta-api.js` y `cuenta-ui.js`: registro,
inicio/cierre de sesión y creación/edición del apodo mediante REST nativo.
La sesión vive solo en memoria: recargar requiere iniciar sesión otra vez.
El perfil no sincroniza la carrera y el ranking conserva su proveedor original.
Esta etapa NO implementa retos, ligas ni validación de puntajes.

## Configurar el proyecto

1. Abrir https://supabase.com/dashboard y seleccionar el proyecto
   `twltqbmlcswngssfgqyd`.
2. Authentication → URL Configuration: configurar Site URL con la URL real
   publicada del juego. Si se usa GitHub Pages:
   `https://renzobarbitta.github.io/copero/`.
   Agregar esa misma URL a Redirect URLs. Evitar comodines amplios.
3. Authentication → Providers → Email: mantener email habilitado y confirmación
   de correo activada. No desactivar seguridad para facilitar pruebas.
4. SQL Editor → New query: pegar TODO el contenido de `supabase/001-profiles.sql`
   y ejecutar Run. El script usa una transacción y se puede volver a ejecutar.
5. Debe aparecer “Success. No rows returned”. La tabla `copero_profiles` tendrá
   RLS habilitado; no crear políticas de acceso público ni permitir escrituras
   de puntuaciones desde el navegador.

Para abrir el SQL en esta máquina:
`c:\Users\Asus\Desktop\CoperoActualizado\supabase\001-profiles.sql`

## Seguridad y límites

- La publishable key es pública, no es una contraseña administrativa.
- No incluir secret keys, service_role ni contraseñas de base en el repositorio.
- El perfil solo se lee/modifica por su propietario autenticado. No guarda email.
- El apodo se debe presentar con textContent al implementar la interfaz.
- Las clasificaciones futuras deben exponer solo apodo y resultados mediante
  funciones específicas. No abrir la tabla de perfiles para resolver un listado.
- Los intentos competitivos deberán reservarse transaccionalmente en el servidor.
  Los resultados deberán calcularse a partir de acciones verificadas, no confiar
  en un campo de puntaje enviado por el cliente. Esto no elimina bots.
- El correo integrado de Supabase tiene restricciones de uso y destinatarios.
  Antes de abrir registros al público, configurar SMTP propio y comprobar entrega,
  límites y protección contra abuso en Authentication. No prometer registros
  masivos con el proveedor de prueba.

## Validación pendiente

Se probó en Chrome el HTML real con REST simulado: registro, inicio de sesión,
guardado/lectura de apodo, recarga, nuevo inicio de sesión y cierre. Sin errores JS.
También se comprobó el refresco del ranking de 0 a 1 fila sin crear carrera.
Estas pruebas NO validan la entrega de correos ni las políticas con usuarios reales.
Antes de publicar cuentas, probar con dos usuarios confirmados: cada uno debe poder crear y editar su
perfil, pero no consultar ni editar el del otro; un cliente sin sesión no debe poder
leer ni insertar perfiles. Esto debe comprobarse mediante la API con sesiones de
usuario, no desde SQL Editor (que tiene permisos administrativos).

Para la prueba manual, servir esta carpeta con un servidor HTTP local, abrir
“Mi cuenta”, crear una cuenta propia y confirmar el correo. Iniciar sesión, guardar
el apodo y usar “Volver a leer perfil”. Recargar e iniciar sesión otra vez debe
recuperar el mismo apodo. No compartir contraseñas ni tokens en el chat.

No hacer cambios al ranking existente hasta completar y probar la nueva API.
