const db = require("../config/conexion.js");

async function actualizaAsignacionMasivo(user_id) {
  const query = `
  UPDATE roles SET asignacion = CURRENT_TIMESTAMP WHERE user_id = $1 AND rol = 'Rol';
      `;
  const result = await db.query(query, [user_id]);
  return result.rows[0];
}

async function crearProyectoMasivo(
  nombre,
  proyecto_correo,
  proyecto_fono,
  proyecto_info,
  proyecto_estado,
  plan_id
) {
  const query = `
  INSERT INTO proyectos (nombre, proyecto_correo, proyecto_fono, proyecto_info, proyecto_estado, user_id, plan_id)
  SELECT $1, $2, $3, $4, $5, user_id, $6
  FROM roles
  WHERE plan_id = $6 AND estado = 'Activo' AND rol = 'Rol'
  ORDER BY asignacion ASC 
  LIMIT 1
  RETURNING user_id;
    `;

  try {
    const result = await db.query(query, [
      nombre,
      proyecto_correo,
      proyecto_fono,
      proyecto_info,
      proyecto_estado,
      plan_id,
    ]);

    if (result.rows.length > 0) {
      return result.rows[0].user_id; // Corrección aquí
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  crearProyectoMasivo,
  actualizaAsignacionMasivo,
};
