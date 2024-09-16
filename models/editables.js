const db = require("../config/conexion.js");

async function agregarEditable(proyecto_id, tarea_id, receta, doc_nombre, doc_texto) {
  const query =
    "INSERT INTO editables (proyecto_id, tarea_id, receta, doc_nombre, doc_texto) VALUES ($1, $2, $3, $4, $5)";
  const result = await db.query(query, [proyecto_id, tarea_id, receta, doc_nombre, doc_texto]);
  return result.rows;
}


async function mostrarEditables(proyecto_id) {
  const query = `
    SELECT 
      editables.*, 
      CASE 
        WHEN editables.tarea_id = 0 THEN 'General'
        ELSE tareas.nombre 
      END AS tarea_nombre
    FROM editables
    LEFT JOIN tareas ON editables.tarea_id = tareas.id
    WHERE editables.proyecto_id = $1
    ORDER BY editables.fecha_creacion DESC;
  `;
  const result = await db.query(query, [proyecto_id]);
  return result.rows;
}


module.exports = {
  agregarEditable,
  mostrarEditables,
};
