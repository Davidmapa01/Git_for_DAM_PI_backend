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
    if (error) console.error("[MySQL] Error en valoraciones.js:", error.message);
});

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
