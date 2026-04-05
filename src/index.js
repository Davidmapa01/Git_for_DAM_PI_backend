const express = require("express");
const app     = express();
const morgan  = require("morgan");
const cors    = require("cors");

// ── Settings ─────────────────────────────────────────────────────────────────
app.set("port", process.env.PORT || 3000);
app.set("json spaces", 2);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(morgan("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ── Ruta de prueba ────────────────────────────────────────────────────────────
app.get("/holaGET", (req, res) => {
    res.json({ mensaje: "Servidor APPASEO funcionando correctamente" });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use("/", require("./routes/usuarios"));
app.use("/", require("./routes/anuncios"));
app.use("/", require("./routes/valoraciones"));

// ── Arrancar servidor ─────────────────────────────────────────────────────────
app.listen(app.get("port"), () => {
    console.log("Servidor APPASEO corriendo en puerto " + app.get("port"));
});
