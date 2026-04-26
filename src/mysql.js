const { Router } = require("express");
const router      = Router();
const mysql       = require("mysql");

// ── Conexión con FreeSQLdatabase ─────────────────────────────────────────────
const db = mysql.createConnection({
    host:     "sql7.freesqldatabase.com",
    user:     "sql7824067",
    password: "dgDRtLqi5r",
    database: "sql7824067",
    port:     3306
});

db.connect((error) => {
    if (error) {
        console.error("[MySQL] Error de conexión:", error.message);
    } else {
        console.log("[MySQL] Conexión establecida correctamente.");
    }
});

// ════════════════════════════════════════════════════════════════════════════
//  GET /api/mysql/usuarios — lista todos los usuarios
// ════════════════════════════════════════════════════════════════════════════
router.get("/usuarios", (req, res) => {
    const sql = "SELECT * FROM usuarios";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ exito: false, mensaje: err.message });
        res.json({ exito: true, usuarios: result });
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  GET /api/mysql/usuarioPorEmail/:email — obtiene un usuario por email
// ════════════════════════════════════════════════════════════════════════════
router.get("/usuarioPorEmail/:email", (req, res) => {
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [req.params.email], (err, result) => {
        if (err)             return res.status(500).json({ exito: false, mensaje: err.message });
        if (!result.length)  return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado." });
        res.json({ exito: true, usuario: result[0] });
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /api/mysql/login — valida credenciales
// ════════════════════════════════════════════════════════════════════════════
router.post("/login", (req, res) => {
    const { email, contrasena } = req.body;
    if (!email || !contrasena)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email.toLowerCase()], (err, result) => {
        if (err)            return res.status(500).json({ exito: false, mensaje: err.message });
        if (!result.length) return res.status(404).json({ exito: false, mensaje: "El email introducido no está registrado." });

        const usuario = result[0];
        if (usuario.contrasena !== contrasena.toLowerCase())
            return res.status(401).json({ exito: false, mensaje: "La contraseña es incorrecta." });

        res.json({ exito: true, mensaje: "Login correcto.", usuario });
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /api/mysql/registro — registra un nuevo usuario
// ════════════════════════════════════════════════════════════════════════════
router.post("/registro", (req, res) => {
    const { email, contrasena, nombre, poblacion } = req.body;
    if (!email || !contrasena || !nombre || !poblacion)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    const sqlCheck = "SELECT id FROM usuarios WHERE email = ?";
    db.query(sqlCheck, [email.toLowerCase()], (err, result) => {
        if (err)           return res.status(500).json({ exito: false, mensaje: err.message });
        if (result.length) return res.status(409).json({ exito: false, mensaje: "El email ya está registrado." });

        const nuevoUsuario = {
            email:                  email.toLowerCase(),
            contrasena:             contrasena.toLowerCase(),
            nombre:                 nombre.toLowerCase(),
            poblacion:              poblacion.toLowerCase(),
            descripcion:            "",
            rutaFotoPerfil:         "",
            esCuidador:             0,
            telefono:               "",
            fechaRegistro:          new Date().toLocaleDateString("es-ES"),
            puedeEnviarFotos:       "",
            admiteAnimalesCuidados: "",
            esFumador:              ""
        };

        const sql = "INSERT INTO usuarios SET ?";
        db.query(sql, nuevoUsuario, (err, result) => {
            if (err) return res.status(500).json({ exito: false, mensaje: err.message });
            res.json({ exito: true, mensaje: "Usuario registrado correctamente.", usuario: nuevoUsuario });
        });
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /api/mysql/actualizarUsuario — actualiza campos del usuario
// ════════════════════════════════════════════════════════════════════════════
router.post("/actualizarUsuario", (req, res) => {
    const { email, ...campos } = req.body;
    if (!email) return res.status(400).json({ exito: false, mensaje: "Falta el email." });

    if (campos.esCuidador !== undefined)
        campos.esCuidador = campos.esCuidador === "true" || campos.esCuidador === true ? 1 : 0;

    const sql = "UPDATE usuarios SET ? WHERE email = ?";
    db.query(sql, [campos, email.toLowerCase()], (err) => {
        if (err) return res.status(500).json({ exito: false, mensaje: err.message });

        db.query("SELECT * FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, result) => {
            if (err) return res.status(500).json({ exito: false, mensaje: err.message });
            res.json({ exito: true, mensaje: "Usuario actualizado correctamente.", usuario: result[0] });
        });
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  GET /api/mysql/anuncios — lista todos los anuncios activos
// ════════════════════════════════════════════════════════════════════════════
router.get("/anuncios", (req, res) => {
    const sql = "SELECT * FROM anuncios WHERE activo = 1";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ exito: false, mensaje: err.message });

        // Convertir tiposMascota de string CSV a array
        const anuncios = result.map(a => ({
            ...a,
            tiposMascota: a.tiposMascota ? a.tiposMascota.split(",") : [],
            activo: a.activo === 1
        }));

        res.json({ exito: true, anuncios });
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /api/mysql/publicarAnuncio — publica un nuevo anuncio
// ════════════════════════════════════════════════════════════════════════════
router.post("/publicarAnuncio", (req, res) => {
    const { emailCuidador, nombreCuidador, poblacion, tiposMascota,
            cantidadAnimales, precioPorDia, descripcion, fechaInicio, fechaFin } = req.body;

    if (!emailCuidador || !nombreCuidador || !poblacion || !tiposMascota || !fechaInicio || !fechaFin)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    const nuevoAnuncio = {
        id:               require("uuid").v4(),
        emailCuidador:    emailCuidador.toLowerCase(),
        nombreCuidador:   nombreCuidador.toLowerCase(),
        poblacion:        poblacion.toLowerCase(),
        tiposMascota:     Array.isArray(tiposMascota) ? tiposMascota.join(",") : tiposMascota,
        cantidadAnimales: parseInt(cantidadAnimales) || 0,
        precioPorDia:     parseFloat(precioPorDia) || 0,
        descripcion:      (descripcion || "").toLowerCase(),
        fechaInicio,
        fechaFin,
        fechaPublicacion: new Date().toLocaleDateString("es-ES"),
        activo:           1
    };

    db.query("INSERT INTO anuncios SET ?", nuevoAnuncio, (err) => {
        if (err) return res.status(500).json({ exito: false, mensaje: err.message });
        res.json({ exito: true, mensaje: "Anuncio publicado correctamente.", anuncio: nuevoAnuncio });
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  DELETE /api/mysql/eliminarAnuncio/:id — desactiva un anuncio
// ════════════════════════════════════════════════════════════════════════════
router.delete("/eliminarAnuncio/:id", (req, res) => {
    const sql = "UPDATE anuncios SET activo = 0 WHERE id = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ exito: false, mensaje: err.message });
        res.json({ exito: true, mensaje: "Anuncio eliminado correctamente." });
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  GET /api/mysql/valoraciones/:emailCuidador — lista valoraciones de un cuidador
// ════════════════════════════════════════════════════════════════════════════
router.get("/valoraciones/:emailCuidador", (req, res) => {
    const sql = "SELECT * FROM valoraciones WHERE emailCuidador = ?";
    db.query(sql, [req.params.emailCuidador], (err, result) => {
        if (err) return res.status(500).json({ exito: false, mensaje: err.message });
        res.json({ exito: true, valoraciones: result });
    });
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /api/mysql/addValoracion — añade una valoración
// ════════════════════════════════════════════════════════════════════════════
router.post("/addValoracion", (req, res) => {
    const { emailCuidador, emailValorador, nombreValorador, puntuacion, descripcion } = req.body;
    if (!emailCuidador || !emailValorador || !puntuacion)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    const nuevaValoracion = {
        emailCuidador:   emailCuidador.toLowerCase(),
        emailValorador:  emailValorador.toLowerCase(),
        nombreValorador: (nombreValorador || "").toLowerCase(),
        puntuacion:      parseInt(puntuacion),
        descripcion:     (descripcion || "").toLowerCase(),
        fecha:           new Date().toLocaleDateString("es-ES")
    };

    db.query("INSERT INTO valoraciones SET ?", nuevaValoracion, (err) => {
        if (err) return res.status(500).json({ exito: false, mensaje: err.message });
        res.json({ exito: true, mensaje: "Valoración añadida correctamente.", valoracion: nuevaValoracion });
    });
});

module.exports = router;
