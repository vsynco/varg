// comentarios.js (models)
const db = require("../config/conexion.js");
const { Pool } = require("pg");

async function obtenerComentariosPorPlan(proyectoId) {
  const query = "SELECT * FROM comentarios WHERE proyecto_id = $1";
  const result = await db.query(query, [proyectoId]);
  return result.rows; // Devuelve la lista de comentarios relacionados con el proyecto
}

async function obtenerComentariosPorProyecto(proyectoId) {
  const query = `
    SELECT 
      c.*, 
      u.foto_perfil, 
      u.nombre
    FROM comentarios AS c
    LEFT JOIN usuarios AS u ON c.user_id = u.id
    WHERE c.proyecto_id = $1
  `;
  const result = await db.query(query, [proyectoId]);
  return result.rows; // Devuelve la lista de comentarios relacionados con el proyecto, incluyendo la foto de perfil y el nombre del usuario que hizo cada comentario
}

async function agregarComentario(user_id, proyecto_id, comentario) {
  const query = `
    INSERT INTO comentarios (user_id, proyecto_id, fecha, comentario)
    VALUES ($1, $2, NOW(), $3)
    RETURNING *
  `;
  const result = await db.query(query, [user_id, proyecto_id, comentario]);
  return result.rows[0]; // Devuelve el comentario agregado
}

async function eliminarComentario(id) {
  const query = "DELETE FROM comentarios WHERE id = $1";
  await db.query(query, [id]);
}

module.exports = {
  obtenerComentariosPorPlan,
  obtenerComentariosPorProyecto,
  agregarComentario,
  eliminarComentario,
};
