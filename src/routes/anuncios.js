const { Router }             = require("express");
const router                 = Router();
const { db, guardarEnDisco } = require("../db");
const { v4: uuidv4 }         = require("uuid");

// ════════════════════════════════════════════════════════════════════════════
//  POST /publicarAnuncio
// ════════════════════════════════════════════════════════════════════════════
router.post("/publicarAnuncio", (req, res) => {
    const { emailCuidador, nombreCuidador, poblacion,
            tiposMascota, precioPorDia, descripcion,
            fechaInicio, fechaFin } = req.body;

    if (!emailCuidador || !nombreCuidador || !poblacion ||
        !tiposMascota  || !precioPorDia   || !fechaInicio || !fechaFin)
        return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios." });

    const nuevoAnuncio = {
        id:               uuidv4(),
        emailCuidador:    emailCuidador.toLowerCase(),
        nombreCuidador:   nombreCuidador.toLowerCase(),
        poblacion:        poblacion.toLowerCase(),
        tiposMascota:     Array.isArray(tiposMascota)
                            ? tiposMascota.map(t => t.toLowerCase())
                            : [tiposMascota.toLowerCase()],
        precioPorDia:     parseFloat(precioPorDia),
        descripcion:      (descripcion || "").toLowerCase(),
        fechaInicio,
        fechaFin,
        fechaPublicacion: new Date().toLocaleDateString("es-ES"),
        activo:           true
    };

    db.anuncios.push(nuevoAnuncio);
    guardarEnDisco();
    res.json({ exito: true, mensaje: "Anuncio publicado correctamente.", anuncio: nuevoAnuncio });
});

// ════════════════════════════════════════════════════════════════════════════
//  GET /listarAnuncios
// ════════════════════════════════════════════════════════════════════════════
router.get("/listarAnuncios", (req, res) => {
    const activos = db.anuncios.filter(a => a.activo);
    res.json({ exito: true, anuncios: activos });
});

// ════════════════════════════════════════════════════════════════════════════
//  DELETE /eliminarAnuncio/:id
// ════════════════════════════════════════════════════════════════════════════
router.delete("/eliminarAnuncio/:id", (req, res) => {
    const index = db.anuncios.findIndex(a => a.id === req.params.id);

    if (index === -1)
        return res.status(404).json({ exito: false, mensaje: "Anuncio no encontrado." });

    db.anuncios[index].activo = false;
    guardarEnDisco();
    res.json({ exito: true, mensaje: "Anuncio eliminado correctamente." });
});

module.exports = router;
