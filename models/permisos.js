// planes.js (models)
const db = require("../config/conexion.js");

async function permisoVerTareasDeTerceros(user_id, plan_id) {
  const query =
    "SELECT * FROM permisos WHERE user_id = $1 AND plan_id = $2 AND permiso = 'ver_tareas_de_terceros' AND activo = 'true'";
  const result = await db.query(query, [user_id, plan_id]);
  return result.rows.length > 0; // Devuelve true si hay registros, false si no hay registros
}

module.exports = {
  permisoVerTareasDeTerceros,
};
