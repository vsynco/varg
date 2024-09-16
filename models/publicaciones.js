// publicaciones.js (models)
const db = require("../config/conexion.js");

async function crearPublicacion(titulo, contenido, user_id, marca_id) {
  const query =
    "INSERT INTO publicaciones (titulo, contenido, user_id, marca_id, fecha) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)";
  const values = [titulo, contenido, user_id, marca_id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarPublicacion(id, marca_id, titulo, contenido) {
  const query =
    "UPDATE publicaciones SET marca_id = $2, titulo = $3, contenido = $4 WHERE id = $1";
  const values = [id, marca_id, titulo, contenido];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function obtenerTodasLasPublicacionesDeMarca(marca_id) {
  const query = "SELECT * FROM publicaciones WHERE marca_id = $1";
  const values = [marca_id];
  const result = await db.query(query, values);
  return result.rows;
}

async function obtenerTodasLasPublicacionesDeMarca(marca_id) {
  const query = "SELECT * FROM publicaciones WHERE marca_id = $1";
  const values = [marca_id];
  const result = await db.query(query, values);
  return result.rows;
}

async function obtenerTodasLasPublicaciones() {
  const query = "SELECT * FROM publicaciones";
  const result = await db.query(query);
  return result.rows;
}

async function obtenerPublicacionPorId(id) {
  const query = "SELECT * FROM publicaciones WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows[0];
}

async function eliminarPublicacion(id) {
  const query = "DELETE FROM publicaciones WHERE id = $1";
  await db.query(query, [id]);
  // No es necesario retornar nada en este caso
}

module.exports = {
  crearPublicacion,
  editarPublicacion,
  obtenerTodasLasPublicacionesDeMarca,
  obtenerTodasLasPublicaciones,
  obtenerPublicacionPorId,
  eliminarPublicacion,
  obtenerTodasLasPublicacionesDeMarca,
};
