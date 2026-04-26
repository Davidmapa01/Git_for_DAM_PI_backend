const { Router } = require("express");
const router      = Router();
const mysql       = require("mysql");

const db = mysql.createConnection({
    host:     "sql7.freesqldatabase.com",
    user:     "sql7824067",
    password: "dgDRtLqi5r",
    database: "sql7824067",
    port:     3306
});

db.connect((error) => {
    if (error) console.error("[MySQL] Error en usuarios.js:", error.message);
});

function obtenerUsuarioCompleto(email, callback) {
    db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, rows) => {
        if (err || !rows.length) return callback(err, null);
        const usuario = rows[0];
        usuario.esCuidador = usuario.esCuidador === 1;
        db.query("SELECT * FROM valoraciones WHERE emailCuidador = ?", [email], (err, vals) => {
            if (err) return callback(err, null);
            usuario.valoraciones = vals || [];
            usuario.mascotas     = [];
            callback(null, usuario);
        });
    });
}

router.post("/login", (req, res) => {
    const { email, contrasena } = req.body;
    if (!email || !contrasena)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    db.query("SELECT * FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, rows) => {
        if (err)          return res.status(500).json({ exito: false, mensaje: err.message });
        if (!rows.length) return res.status(404).json({ exito: false, mensaje: "El email introducido no está registrado." });

        const usuario = rows[0];
        if (usuario.contrasena !== contrasena)
            return res.status(401).json({ exito: false, mensaje: "La contraseña es incorrecta." });

        obtenerUsuarioCompleto(email.toLowerCase(), (err, usuarioCompleto) => {
            if (err) return res.status(500).json({ exito: false, mensaje: err.message });
            res.json({ exito: true, mensaje: "Login correcto.", usuario: usuarioCompleto });
        });
    });
});

router.post("/registro", (req, res) => {
    const { email, contrasena, nombre, poblacion } = req.body;
    if (!email || !contrasena || !nombre || !poblacion)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    db.query("SELECT id FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, rows) => {
        if (err)         return res.status(500).json({ exito: false, mensaje: err.message });
        if (rows.length) return res.status(409).json({ exito: false, mensaje: "El email introducido ya se encuentra registrado." });

        const nuevoUsuario = {
            email:                  email.toLowerCase(),
            contrasena:             contrasena,
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

        db.query("INSERT INTO usuarios SET ?", nuevoUsuario, (err) => {
            if (err) return res.status(500).json({ exito: false, mensaje: err.message });
            nuevoUsuario.esCuidador   = false;
            nuevoUsuario.valoraciones = [];
            nuevoUsuario.mascotas     = [];
            res.json({ exito: true, mensaje: "Usuario registrado correctamente.", usuario: nuevoUsuario });
        });
    });
});

router.post("/recuperarContrasena", (req, res) => {
    const { email, nuevaContrasena } = req.body;
    if (!email || !nuevaContrasena)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    db.query("UPDATE usuarios SET contrasena = ? WHERE email = ?",
        [nuevaContrasena, email.toLowerCase()], (err) => {
        if (err) return res.status(500).json({ exito: false, mensaje: err.message });
        res.json({ exito: true, mensaje: "Contraseña actualizada correctamente." });
    });
});

router.get("/listarUsuarios", (req, res) => {
    db.query("SELECT * FROM usuarios", (err, rows) => {
        if (err) return res.status(500).json({ exito: false, mensaje: err.message });

        db.query("SELECT * FROM valoraciones", (err, vals) => {
            if (err) return res.status(500).json({ exito: false, mensaje: err.message });

            const usuarios = rows.map(u => ({
                ...u,
                esCuidador:   u.esCuidador === 1,
                mascotas:     [],
                valoraciones: vals.filter(v => v.emailCuidador === u.email)
            }));

            res.json({ exito: true, usuarios });
        });
    });
});

router.get("/usuarioPorEmail/:email", (req, res) => {
    obtenerUsuarioCompleto(req.params.email.toLowerCase(), (err, usuario) => {
        if (err)      return res.status(500).json({ exito: false, mensaje: err.message });
        if (!usuario) return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado." });
        res.json({ exito: true, usuario });
    });
});

router.post("/actualizarUsuario", (req, res) => {
    const { email, ...campos } = req.body;
    if (!email) return res.status(400).json({ exito: false, mensaje: "Falta el email." });

    if (campos.esCuidador !== undefined)
        campos.esCuidador = campos.esCuidador === "true" || campos.esCuidador === true ? 1 : 0;

    db.query("UPDATE usuarios SET ? WHERE email = ?", [campos, email.toLowerCase()], (err) => {
        if (err) return res.status(500).json({ exito: false, mensaje: err.message });

        obtenerUsuarioCompleto(email.toLowerCase(), (err, usuario) => {
            if (err) return res.status(500).json({ exito: false, mensaje: err.message });
            res.json({ exito: true, mensaje: "Usuario actualizado correctamente.", usuario });
        });
    });
});

module.exports = router;
