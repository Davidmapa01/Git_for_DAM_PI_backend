# APPASEO — Backend

API REST desarrollada con Node.js y Express para la aplicación APPASEO, una plataforma que conecta dueños de mascotas con cuidadores disponibles.

## Tecnologías

- **Node.js** — entorno de ejecución
- **Express** — framework web
- **MySQL** — base de datos relacional alojada en FreeSQLdatabase
- **UUID** — generación de identificadores únicos

## Requisitos

- Node.js instalado
- Conexión a internet (la base de datos está alojada en FreeSQLdatabase)

## Instalación

```bash
npm install
```

## Arrancar el servidor

```bash
node src/index.js
```

El servidor arranca en el puerto **3000**. En la consola deben aparecer los mensajes:

```
[MySQL] Conexión establecida correctamente.
Servidor APPASEO corriendo en puerto 3000
```

## Estructura del proyecto

```
AppaseoBackend/
    src/
        index.js              # Configuración del servidor Express
        db.js                 # Compatibilidad (migrado a MySQL)
        mysql.js              # Rutas de demostración MySQL (/api/mysql/)
        routes/
            usuarios.js       # Rutas de gestión de usuarios (MySQL)
            anuncios.js       # Rutas de gestión de anuncios (MySQL)
            valoraciones.js   # Rutas de gestión de valoraciones (MySQL)
```

## Rutas disponibles

### Usuarios

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| POST | `/login` | Valida credenciales y devuelve el usuario | 200, 400, 401, 404, 500 |
| POST | `/registro` | Registra un nuevo usuario | 200, 400, 409, 500 |
| POST | `/recuperarContrasena` | Actualiza la contraseña de un usuario | 200, 400, 404, 500 |
| POST | `/actualizarUsuario` | Actualiza campos del perfil de un usuario | 200, 400, 500 |
| GET | `/listarUsuarios` | Devuelve todos los usuarios con sus valoraciones | 200, 500 |
| GET | `/usuarioPorEmail/:email` | Devuelve un usuario por su email | 200, 404, 500 |

### Anuncios

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| POST | `/publicarAnuncio` | Publica una nueva petición de acogida | 200, 400, 500 |
| GET | `/listarAnuncios` | Devuelve todas las peticiones activas | 200, 500 |
| DELETE | `/eliminarAnuncio/:id` | Desactiva una petición por su id | 200, 500 |

### Valoraciones

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| POST | `/addValoracion` | Añade una valoración a un cuidador | 200, 400, 500 |

### Rutas MySQL (demostración)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/mysql/usuarios` | Lista todos los usuarios |
| GET | `/api/mysql/usuarioPorEmail/:email` | Devuelve un usuario por email |
| POST | `/api/mysql/login` | Login via MySQL |
| POST | `/api/mysql/registro` | Registro via MySQL |

## Base de datos

La base de datos está alojada en **FreeSQLdatabase** y tiene 3 tablas:

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Datos personales, credenciales y configuración de cuidador |
| `anuncios` | Peticiones de acogida publicadas por cuidadores |
| `valoraciones` | Opiniones de usuarios sobre cuidadores |

## Usuarios de prueba

| Email | Contraseña | Población | Cuidador |
|-------|------------|-----------|----------|
| david@gmail.com | 1234 | Valencia | No |
| noelia@gmail.com | 1234 | Valencia | Sí |
| pablo@gmail.com | 1234 | Valencia | Sí |
| isabel@gmail.com | 1234 | Madrid | Sí |
| andres@gmail.com | 1234 | Barcelona | Sí |
| cintia@gmail.com | 1234 | Valencia | Sí |
| carlos@gmail.com | 1234 | Valencia | Sí |
| lucia@gmail.com | 1234 | Sevilla | No |
| marta@gmail.com | 1234 | Barcelona | Sí |

## Notas

- El email se almacena en minúsculas. La contraseña se almacena tal como la introduce el usuario.
- El campo `esCuidador` se convierte de string a entero (0/1) al guardarse en MySQL.
- Los tipos de mascota se almacenan como CSV en MySQL y se convierten a array al devolverse a Unity.
- Las valoraciones están en tabla separada. Cada petición de usuario completo requiere dos consultas SQL.
