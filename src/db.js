const fs   = require("fs");
const path = require("path");

const RUTA_DB = path.join(__dirname, "datos_db.json");

// ── Cargar datos desde disco o usar los por defecto ───────────────────────────
let db;

if (fs.existsSync(RUTA_DB)) {
    try {
        const contenido = fs.readFileSync(RUTA_DB, "utf8");
        db = JSON.parse(contenido);
        console.log("[DB] Datos cargados desde disco.");
    } catch (e) {
        console.log("[DB] Error al leer datos, usando datos por defecto.");
        db = datosPorDefecto;
    }
} else {
    console.log("[DB] No existe archivo de datos, usando datos por defecto.");
    db = datosPorDefecto;
    guardarEnDisco();
}

// ── Función para guardar en disco ─────────────────────────────────────────────
function guardarEnDisco() {
    try {
        fs.writeFileSync(RUTA_DB, JSON.stringify(db, null, 2), "utf8");
    } catch (e) {
        console.error("[DB] Error al guardar en disco:", e.message);
    }
}

module.exports = { db, guardarEnDisco };
