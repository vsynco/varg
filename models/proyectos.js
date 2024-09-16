// proyectos.js (models)
const db = require("../config/conexion.js");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

async function obtenerProyectoPorId(id) {
  const query = "SELECT * FROM proyectos WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows[0]; // Devuelve el proyecto encontrado
}

async function obtenerProyectosPorPlan(plan_id) {
  const query = "SELECT * FROM proyectos WHERE plan_id = $1";
  const result = await db.query(query, [plan_id]);
  return result.rows; // Devuelve los proyectos seleccionados
}

async function obtenerProyectosPropiosPlan(plan_id, user_id) {
  const query = "SELECT * FROM proyectos WHERE plan_id = $1 AND cliente_id = (SELECT cr.id_cliente FROM clientes_representantes cr JOIN contactos c ON cr.id_contacto = c.id WHERE c.id_usuario = $2 LIMIT 1)";
  const result = await db.query(query, [plan_id, user_id]);
  return result.rows; // Devuelve los proyectos seleccionados
}

async function obtenerTareaCodigo(id) {
  const query = "SELECT tarea_codigo FROM proyectos WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows[0].tarea_codigo; // Devuelve solo el valor de tarea_codigo
}

async function obtenerProyectoPorIdAndHash(id, hash) {
  const query = "SELECT * FROM proyectos WHERE id = $1 AND tarea_codigo = $2";
  const result = await db.query(query, [id, hash]);
  return result.rows[0]; // Devuelve el proyecto encontrado
}

async function obtenerProyecto() {
  const query = "SELECT * FROM proyectos";
  const result = await db.query(query);
  return result.rows; // Devuelve la lista completa de proyectos
}

async function obtenerRolesPorPlan(planId) {
  try {
    // Consulta SQL para obtener estados y usuarios por plan
    const consulta = `SELECT v.id AS rol_id, u.nombre AS usuario_nombre
    FROM roles v
    INNER JOIN usuarios u ON v.user_id = u.id
    WHERE v.plan_id = $1;`;

    // Ejecuta la consulta y devuelve los resultados
    const { rows } = await db.query(consulta, [planId]);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function obtenerEstadosConNombrePorPlan(planId) {
  try {
    // Consulta SQL para obtener estados y usuarios por plan
    const consulta = `SELECT e.id AS estado_id, e.nombre AS estado_nombre
    FROM estados e
    WHERE e.plan_id = $1;`;

    // Ejecuta la consulta y devuelve los resultados
    const { rows } = await db.query(consulta, [planId]);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function obtenerEstadosPorPlan(plan_id) {
  const query = "SELECT * FROM estados WHERE plan_id = $1 ORDER BY orden";
  const result = await db.query(query, [plan_id]);
  return result.rows;
}

async function obtenerProyectos(user_id) {
  const query = `
  SELECT 
    proyectos.*, 
    planes.marca_id, 
    planes.nombre AS plan_nombre,
    marcas.background_color AS marca_background_color, 
    marcas.font_color AS marca_font_color, 
    marcas.nombre AS marca_nombre
  FROM 
    proyectos
  INNER JOIN 
    planes ON proyectos.plan_id = planes.id
  INNER JOIN 
    marcas ON planes.marca_id = marcas.id
  WHERE 
    proyectos.plan_id IN (
      SELECT DISTINCT 
        CASE 
          WHEN p_terceros.activo THEN p_terceros.plan_id
          WHEN p_propio.activo THEN p_propio.plan_id
        END AS plan_id
      FROM (
        SELECT plan_id, activo
        FROM permisos
        WHERE user_id = $1 AND permiso = 'ver_listado_asignado_terceros'
      ) AS p_terceros
      FULL OUTER JOIN (
        SELECT plan_id, activo
        FROM permisos
        WHERE user_id = $1 AND permiso = 'ver_listado_asignado'
      ) AS p_propio
      ON p_terceros.plan_id = p_propio.plan_id
    )
    ORDER BY proyectos.id
`;  const result = await db.query(query, [user_id]);
  return result.rows; // Devuelve los proyectos seleccionados
}

async function obtenerProyectoPaginado(user_id, perPage, offset) {
  const query = `SELECT 
  p.*, 
  LEFT(c.comentario, 150) || CASE WHEN LENGTH(c.comentario) > 150 THEN '...' ELSE '' END AS ultimo_comentario,
  u.foto_perfil AS foto_perfil,
  m.nombre AS nombre_plan,
  m.background_color,
  m.font_color,
  e.nombre AS nombre_estado
FROM proyectos AS p
LEFT JOIN (
  SELECT proyecto_id, comentario, user_id
  FROM comentarios AS c1
  WHERE fecha = (
    SELECT MAX(fecha)
    FROM comentarios AS c2
    WHERE c1.proyecto_id = c2.proyecto_id
  )
) AS c ON p.id = c.proyecto_id
LEFT JOIN usuarios AS u ON c.user_id = u.id
LEFT JOIN planes AS m ON p.plan_id = m.id
LEFT JOIN estados AS e ON p.proyecto_estado::text = e.id::text
WHERE p.user_id = $1 OR p.plan_id IN (
  SELECT plan_id
  FROM roles
  WHERE user_id = $1 AND rol = 'administrador'
)
ORDER BY p.id DESC
LIMIT $2 OFFSET $3;

  `;
  const result = await db.query(query, [user_id, perPage, offset]);
  return result.rows;
}

async function obtenerProyectoPaginadoAsignado(perPage, offset, userId) {
  const query = `SELECT 
  p.*, 
  LEFT(c.comentario, 150) || CASE WHEN LENGTH(c.comentario) > 150 THEN '...' ELSE '' END AS ultimo_comentario, 
  u.foto_perfil AS foto_perfil, 
  m.nombre AS nombre_plan, 
  e.nombre AS nombre_estado
FROM proyectos AS p 
LEFT JOIN (
  SELECT proyecto_id, comentario, user_id 
  FROM comentarios AS c1 
  WHERE fecha = (
      SELECT MAX(fecha) 
      FROM comentarios AS c2 
      WHERE c1.proyecto_id = c2.proyecto_id
  )
) AS c ON p.id = c.proyecto_id 
LEFT JOIN usuarios AS u ON c.user_id = u.id 
LEFT JOIN planes AS m ON p.plan_id = m.id 
LEFT JOIN estados AS e ON p.proyecto_estado::text = e.id::text 
WHERE p.user_id = $1
ORDER BY p.id DESC
LIMIT $2 OFFSET $3;
`;
  const result = await db.query(query, [userId, perPage, offset]);
  return result.rows;
}

async function buscarproyectosPorQuery(
  userId,
  query,
  planId,
  proyectoEstado,
  perPage,
  offset
) {
  try {
    const queryString = `%${query}%`;

    const sqlQuery = `SELECT p.*, LEFT(c.comentario, 150) || CASE WHEN LENGTH(c.comentario) > 150 THEN '...' ELSE '' END AS ultimo_comentario, u.foto_perfil AS foto_perfil, m.nombre AS nombre_plan, e.nombre AS nombre_estado
    FROM proyectos AS p
    LEFT JOIN (
      SELECT proyecto_id, comentario, user_id
      FROM comentarios AS c1
      WHERE fecha = (
        SELECT MAX(fecha)
        FROM comentarios AS c2
        WHERE c1.proyecto_id = c2.proyecto_id
      )
    ) AS c ON p.id = c.proyecto_id
    LEFT JOIN usuarios AS u ON c.user_id = u.id
    LEFT JOIN planes AS m ON p.plan_id = m.id
    LEFT JOIN estados AS e ON p.proyecto_estado = e.id
    WHERE p.user_id = $1
    AND (p.proyecto_info ILIKE $2 OR p.proyecto_correo ILIKE $2 OR p.proyecto_fono ILIKE $2)
    AND (p.plan_id = COALESCE($3, p.plan_id) OR $3 IS NULL)
    AND (p.proyecto_estado = COALESCE($4, p.proyecto_estado) OR $4 IS NULL)
    LIMIT $5
    OFFSET $6;
    
  `;

    const result = await db.query(sqlQuery, [
      userId,
      queryString,
      planId,
      proyectoEstado,
      perPage,
      offset,
    ]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error al buscar proyectos por consulta: ${error.message}`);
  }
}

async function obtenerTotalproyectos() {
  const query = "SELECT COUNT(*) FROM proyectos";
  const result = await db.query(query);
  return parseInt(result.rows[0].count);
}

async function obtenerTotalproyectosConFiltros(
  userId,
  query,
  planId,
  proyectoEstado
) {
  try {
    const queryString = `%${query}%`;

    const sqlQuery = `
      SELECT COUNT(*)
      FROM proyectos AS p
      WHERE p.user_id = $1
      AND (p.proyecto_info ILIKE $2 OR p.proyecto_correo ILIKE $2 OR p.proyecto_fono ILIKE $2)
      AND (p.plan_id = COALESCE($3, p.plan_id) OR $3 IS NULL)
      AND (p.proyecto_estado = COALESCE($4, p.proyecto_estado) OR $4 IS NULL);
    `;

    const result = await db.query(sqlQuery, [
      userId,
      queryString,
      planId,
      proyectoEstado,
    ]);

    return parseInt(result.rows[0].count);
  } catch (error) {
    throw new Error(
      `Error al obtener el total de proyectos con filtros: ${error.message}`
    );
  }
}

async function editarProyecto(
  id,
  user_id,
  plan_id,
  nombre,
  proyecto_fono,
  proyecto_info,
  proyecto_correo
) {
  const query = `
        UPDATE proyectos
        SET user_id = $2,
            plan_id = $3,
            nombre = $4,
            proyecto_fono = $5,
            proyecto_info = $6,
            proyecto_correo = $7
        WHERE id = $1
        RETURNING *
    `;

  const result = await db.query(query, [
    id,
    user_id,
    plan_id,
    nombre,
    proyecto_fono,
    proyecto_info,
    proyecto_correo,
  ]);

  return result.rows[0];
}

async function eliminarProyecto(id) {
  try {
    // Inicia una transacción para garantizar la consistencia de los datos
    await db.query("BEGIN");

    // Elimina todos los comentarios relacionados con el proyecto
    const deleteComentariosQuery =
      "DELETE FROM comentarios WHERE proyecto_id = $1";
    await db.query(deleteComentariosQuery, [id]);

    // Luego, elimina el proyecto
    const deleteProyectoQuery = "DELETE FROM proyectos WHERE id = $1";
    await db.query(deleteProyectoQuery, [id]);

    // Confirma la transacción
    await db.query("COMMIT");

    return "Proyecto y comentarios relacionados eliminados correctamente";
  } catch (error) {
    // Si ocurre un error, realiza un rollback para deshacer la transacción
    await db.query("ROLLBACK");
    console.error("Error al eliminar proyecto:", error);
    throw error;
  }
}

async function asignacionProyecto(plan_id) {
  const query = `
      SELECT user_id FROM roles
      WHERE plan_id = $1 AND estado = 'Activo' AND rol = 'Rol'
      ORDER BY asignacion ASC 
      LIMIT 1;
    `;
  const result = await db.query(query, [plan_id]);

  if (result.rows.length > 0) {
    return result.rows[0].user_id; // Devuelve el valor si hay resultados
  } else {
    return null; // Devuelve null u otro valor adecuado si no hay resultados
  }
}

async function actualizaAsignacion(user_id) {
  const query = `
  UPDATE roles SET asignacion = CURRENT_TIMESTAMP WHERE user_id = $1 AND rol = 'Rol';
      `;
  const result = await db.query(query, [user_id]);
  return result.rows[0];
}

async function agregarProyecto(
  rol_id,
  plan_id,
  nombre,
  cliente_id,
  proyecto_estado,
  proyecto_fono,
  proyecto_info,
  proyecto_correo,
  tarea_codigo
) {
  const query = `
      INSERT INTO proyectos (rol_id, plan_id, nombre, cliente_id, proyecto_estado, proyecto_fono, proyecto_info, proyecto_correo, tarea_codigo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
  const result = await db.query(query, [
    rol_id,
    plan_id,
    nombre,
    cliente_id,
    proyecto_estado,
    proyecto_fono,
    proyecto_info,
    proyecto_correo,
    tarea_codigo
  ]);
  return result.rows[0];
}

async function obtenerPropuestaRol(Correo) {
  const query =
    "SELECT v.*, m.nombre AS nombre_plan FROM roles AS v LEFT JOIN planes AS m ON v.plan_id = m.id WHERE v.estado = 'Pendiente' AND v.correo = $1;";
  const result = await db.query(query, [Correo]);
  return result.rows;
}

async function obtenerPropuestaRolRechazada(Correo) {
  const query =
    "SELECT v.*, m.nombre AS nombre_plan FROM roles AS v LEFT JOIN planes AS m ON v.plan_id = m.id WHERE v.estado = 'Rechazado' AND v.correo = $1;";
  const result = await db.query(query, [Correo]);
  return result.rows;
}

module.exports = {
  obtenerProyecto,
  agregarProyecto,
  editarProyecto,
  eliminarProyecto,
  obtenerProyectoPorId,
  obtenerProyectoPaginado,
  obtenerTotalproyectos,
  obtenerEstadosPorPlan,
  obtenerProyectoPaginadoAsignado,
  obtenerRolesPorPlan,
  obtenerEstadosConNombrePorPlan,
  buscarproyectosPorQuery,
  obtenerTotalproyectosConFiltros,
  asignacionProyecto,
  actualizaAsignacion,
  obtenerPropuestaRol,
  obtenerPropuestaRolRechazada,
  obtenerProyectos,
  obtenerProyectoPorIdAndHash,
  obtenerTareaCodigo,
  obtenerProyectosPorPlan,
  obtenerProyectosPropiosPlan,
};
