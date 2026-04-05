const { Router }             = require("express");
const router                 = Router();
const { db, guardarEnDisco } = require("../db");

// ════════════════════════════════════════════════════════════════════════════
//  POST /addValoracion
// ════════════════════════════════════════════════════════════════════════════
router.post("/addValoracion", (req, res) => {
    const { emailCuidador, emailValorador, puntuacion, descripcion } = req.body;

    if (!emailCuidador || !emailValorador || !puntuacion)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    const usuario = db.usuarios.find(u => u.email === emailCuidador.toLowerCase());

    if (!usuario)
        return res.status(404).json({ exito: false, mensaje: "Cuidador no encontrado." });

    if (!usuario.esCuidador)
        return res.status(400).json({ exito: false, mensaje: "El usuario no es cuidador." });

    const valoracion = {
        emailValorador: emailValorador.toLowerCase(),
        puntuacion:     parseInt(puntuacion),
        descripcion:    (descripcion || "").toLowerCase(),
        fecha:          new Date().toLocaleDateString("es-ES")
    };

    if (!usuario.valoraciones) usuario.valoraciones = [];
    usuario.valoraciones.push(valoracion);

    guardarEnDisco();
    res.json({ exito: true, mensaje: "Valoración añadida correctamente.", valoracion });
});

module.exports = router;
