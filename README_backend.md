# APPASEO — Backend

API REST desarrollada con Node.js y Express para la aplicación APPASEO, una plataforma que conecta dueños de mascotas con cuidadores disponibles.

## Tecnologías

- **Node.js** — entorno de ejecución
- **Express** — framework web
- **UUID** — generación de identificadores únicos
- **Persistencia en disco** — los datos se guardan en `datos_db.json`

## Instalación

```bash
npm install
```

## Arrancar el servidor

```bash
node src/index.js
```

El servidor arranca en el puerto **3000**. Verifica que funciona accediendo a:
```
http://localhost:3000/holaGET
```

## Estructura del proyecto

```
AppaseoBackend/
    src/
        index.js              # Configuración del servidor Express
        db.js                 # Lógica de persistencia en disco
        datos_db.json         # Base de datos en disco (se genera automáticamente)
        routes/
            usuarios.js       # Rutas de gestión de usuarios
            anuncios.js       # Rutas de gestión de anuncios
            valoraciones.js   # Rutas de gestión de valoraciones
```

## Rutas disponibles

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/login` | Valida credenciales y devuelve el usuario |
| POST | `/registro` | Registra un nuevo usuario |
| POST | `/recuperarContrasena` | Actualiza la contraseña de un usuario |
| POST | `/actualizarUsuario` | Actualiza campos del perfil de un usuario |
| GET | `/listarUsuarios` | Devuelve todos los usuarios registrados |
| GET | `/usuarioPorEmail/:email` | Devuelve un usuario por su email |

### Anuncios

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/publicarAnuncio` | Publica un nuevo anuncio de cuidador |
| GET | `/listarAnuncios` | Devuelve todos los anuncios activos |
| DELETE | `/eliminarAnuncio/:id` | Desactiva un anuncio por su id |

### Valoraciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/addValoracion` | Añade una valoración a un cuidador |

### Prueba de conexión

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/holaGET` | Verifica que el servidor está funcionando |

## Persistencia de datos

Los datos se guardan automáticamente en `src/datos_db.json` tras cada operación de escritura. Al arrancar el servidor, si el archivo existe se carga desde disco; si no existe, se inicializa con los datos de prueba definidos en `db.js`.

## Usuarios de prueba

| Email | Contraseña | Población | Cuidador |
|-------|------------|-----------|----------|
| david@gmail.com | 1234 | valencia | No |
| noelia@gmail.com | 1234 | valencia | Sí |
| pablo@gmail.com | 1234 | valencia | Sí |
| isabel@gmail.com | 1234 | madrid | Sí |
| andres@gmail.com | 1234 | barcelona | Sí |
| cintia@gmail.com | 1234 | valencia | Sí |

## Notas

- Todos los campos de texto se almacenan en minúsculas para evitar conflictos de comparación.
- El campo `esCuidador` se convierte correctamente de string a booleano al recibirse desde Unity.
- La base de datos en memoria está preparada para ser migrada a MySQL en futuras versiones.
