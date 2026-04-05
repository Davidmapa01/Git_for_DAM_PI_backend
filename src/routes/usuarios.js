const { Router }           = require("express");
const router               = Router();
const { db, guardarEnDisco } = require("../db");

// ════════════════════════════════════════════════════════════════════════════
//  POST /login
// ════════════════════════════════════════════════════════════════════════════
router.post("/login", (req, res) => {
    const { email, contrasena } = req.body;

    if (!email || !contrasena)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    const usuario = db.usuarios.find(u => u.email === email.toLowerCase());

    if (!usuario)
        return res.status(404).json({ exito: false, mensaje: "El email introducido no está registrado." });

    if (usuario.contrasena !== contrasena.toLowerCase())
        return res.status(401).json({ exito: false, mensaje: "La contraseña es incorrecta." });

    res.json({ exito: true, mensaje: "Login correcto.", usuario });
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /registro
// ════════════════════════════════════════════════════════════════════════════
router.post("/registro", (req, res) => {
    const { email, contrasena, nombre, poblacion } = req.body;

    if (!email || !contrasena || !nombre || !poblacion)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    const existe = db.usuarios.find(u => u.email === email.toLowerCase());

    if (existe)
        return res.status(409).json({ exito: false, mensaje: "El email introducido ya se encuentra registrado." });

    const nuevoUsuario = {
        email:               email.toLowerCase(),
        contrasena:          contrasena.toLowerCase(),
        nombre:              nombre.toLowerCase(),
        poblacion:           poblacion.toLowerCase(),
        descripcion:         "",
        rutaFotoPerfil:      "",
        esCuidador:          false,
        tipoMascotaQueCuida: "",
        mascotas:            [],
        valoraciones:        []
    };

    db.usuarios.push(nuevoUsuario);
    guardarEnDisco();
    res.json({ exito: true, mensaje: "Usuario registrado correctamente.", usuario: nuevoUsuario });
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /recuperarContrasena
// ════════════════════════════════════════════════════════════════════════════
router.post("/recuperarContrasena", (req, res) => {
    const { email, nuevaContrasena } = req.body;

    if (!email || !nuevaContrasena)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    const usuario = db.usuarios.find(u => u.email === email.toLowerCase());

    if (!usuario)
        return res.status(404).json({ exito: false, mensaje: "El email introducido no está registrado." });

    usuario.contrasena = nuevaContrasena.toLowerCase();
    guardarEnDisco();
    res.json({ exito: true, mensaje: "Contraseña actualizada correctamente." });
});

// ════════════════════════════════════════════════════════════════════════════
//  GET /listarUsuarios
// ════════════════════════════════════════════════════════════════════════════
router.get("/listarUsuarios", (req, res) => {
    res.json({ exito: true, usuarios: db.usuarios });
});

// ════════════════════════════════════════════════════════════════════════════
//  GET /usuarioPorEmail/:email
// ════════════════════════════════════════════════════════════════════════════
router.get("/usuarioPorEmail/:email", (req, res) => {
    const usuario = db.usuarios.find(u => u.email === req.params.email.toLowerCase());

    if (!usuario)
        return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado." });

    res.json({ exito: true, usuario });
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /actualizarUsuario
// ════════════════════════════════════════════════════════════════════════════
router.post("/actualizarUsuario", (req, res) => {
    const { email, ...campos } = req.body;

    if (!email)
        return res.status(400).json({ exito: false, mensaje: "Falta el email." });

    const usuario = db.usuarios.find(u => u.email === email.toLowerCase());

    if (!usuario)
        return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado." });

    if (campos.esCuidador !== undefined)
        campos.esCuidador = campos.esCuidador === "true" || campos.esCuidador === true;

    if (campos.tipoMascotaQueCuida !== undefined)
        campos.tipoMascotaQueCuida = campos.tipoMascotaQueCuida.toLowerCase();

    Object.assign(usuario, campos);
    guardarEnDisco();
    res.json({ exito: true, mensaje: "Usuario actualizado correctamente.", usuario });
});

module.exports = router;
