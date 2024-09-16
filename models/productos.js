const db = require("../config/conexion.js");

async function obtenerProductos() {
    const query = "SELECT * FROM Producto;";
    const result = await db.query(query);
    return result.rows;
}

module.exports = {
    obtenerProductos,
};