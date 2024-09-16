// proyectos.js (models)
const db = require("../config/conexion.js");

async function actualizarEstadoProyecto(id, nuevoEstado) {
  const query = "UPDATE proyectos SET proyecto_estado = $1 WHERE id = $2";
  await db.query(query, [nuevoEstado, id]);
}

module.exports = {
  actualizarEstadoProyecto,
};
