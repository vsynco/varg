// planes.js (models)
const db = require("../config/conexion.js");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

async function obtenerPlan() {
  const query = "SELECT * FROM planes";
  const result = await db.query(query);
  return result.rows; // Devuelve la lista completa de planes
}

async function obtenerUsuariosDePlanTotales(userId) {
  try {
    const query = `SELECT usuario FROM roles WHERE user_id = $1;`;
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function obtenerTodasLasPlanes(user_id) {
  try {
    const query =
      "SELECT DISTINCT ON (m.id) m.* FROM planes m INNER JOIN roles v ON m.id = v.plan_id WHERE v.user_id = $1 AND (v.rol = 'administrador' OR v.rol = 'Rol') ORDER BY m.id, m.nombre;";
    const result = await db.query(query, [user_id]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function obtenerPlanesDatosGestor(user_id) {
  try {
    // 1. Obtén todas las planes para el usuario dado.
    const planesQuery =
      "SELECT m.id, m.nombre FROM planes m INNER JOIN roles v ON m.id = v.plan_id WHERE v.user_id = $1 AND (v.rol = 'administrador' OR v.rol = 'Rol') ORDER BY m.nombre;";
    const planesResult = await db.query(planesQuery, [user_id]);
    const planes = planesResult.rows;

    // Para cada plan...
    for (const plan of planes) {
      // 2. Obtén todos los estados asociados.
      const estadosQuery =
        "SELECT e.id, e.nombre FROM estados e WHERE e.plan_id = $1 ORDER BY e.orden;";
      const estadosResult = await db.query(estadosQuery, [plan.id]);
      const estados = estadosResult.rows;

      // Para cada estado...
      for (const estado of estados) {
        // 3. Cuenta el número de proyectos.
        const proyectosQuery =
          "SELECT COUNT(*) FROM proyectos p WHERE p.proyecto_estado = $1;";
        const proyectosResult = await db.query(proyectosQuery, [estado.id]);
        const numeroproyectos = proyectosResult.rows[0].count;

        // Agrega los datos al estado.
        estado.numeroproyectos = numeroproyectos;
      }

      // Agrega los estados a la plan.
      plan.estados = estados;
    }

    // Devuelve las planes con sus estados y números de proyectos.
    return planes;
  } catch (error) {
    throw error;
  }
}

async function obtenerPlanesDatosRol(user_id) {
  try {
    // 1. Obtén todas las planes para el usuario dado.
    const planesQuery =
      "SELECT m.id, m.nombre FROM planes m INNER JOIN roles v ON m.id = v.plan_id WHERE v.user_id = $1 AND (v.rol = 'administrador' OR v.rol = 'Rol') ORDER BY m.nombre;";
    const planesResult = await db.query(planesQuery, [user_id]);
    const planes = planesResult.rows;

    // Para cada plan...
    for (const plan of planes) {
      // 2. Obtén todos los estados asociados.
      const estadosQuery =
        "SELECT e.id, e.nombre FROM estados e WHERE e.plan_id = $1 ORDER BY e.orden;";
      const estadosResult = await db.query(estadosQuery, [plan.id]);
      const estados = estadosResult.rows;

      // Para cada estado...
      for (const estado of estados) {
        // 3. Cuenta el número de proyectos.
        const proyectosQuery =
          "SELECT COUNT(*) FROM proyectos p WHERE p.proyecto_estado = $1 AND p.user_id = $2;";
        const proyectosResult = await db.query(proyectosQuery, [
          estado.id,
          user_id,
        ]);
        const numeroproyectos = proyectosResult.rows[0].count;

        // Agrega los datos al estado.
        estado.numeroproyectos = numeroproyectos;
      }

      // Agrega los estados a la plan.
      plan.estados = estados;
    }

    // Devuelve las planes con sus estados y números de proyectos.
    return planes;
  } catch (error) {
    throw error;
  }
}

async function obtenerPlanesEstadosRoles(user_id) {
  try {
    const planesQuery = // Muestra planes donde se es administrador (marca) o Lider (Plan)
      "SELECT DISTINCT ON (m.id) m.id, m.nombre FROM planes m INNER JOIN roles v ON m.id = v.plan_id WHERE v.user_id = $1 AND (v.rol = 'administrador' OR v.rol = 'lider') ORDER BY m.id, m.nombre;";
    const planesResult = await db.query(planesQuery, [user_id]);

    for (let plan of planesResult.rows) {
      // Por cada plan
      const rolesQuery =
        "SELECT u.id, u.nombre FROM roles v INNER JOIN usuarios u ON v.user_id = u.id WHERE v.plan_id = $1 AND v.rol = 'administrador' OR v.rol = 'lider';";
      const rolesResult = await db.query(rolesQuery, [plan.id]);
      plan.roles = rolesResult.rows;
    }

    return planesResult.rows;
  } catch (error) {
    throw error;
  }
}

async function obtenerPlanesRoles(user_id) {
  try {
    // Paso 1: Buscar permisos "crear_proyectos" con user_id específico
    const resultadosDelPaso1 = await db.query(
      "SELECT plan_id FROM permisos WHERE permiso = $1 AND user_id = $2 ORDER BY plan_id",
      ["crear_proyectos", user_id]
    );

    const planesConAsignados = [];

    // Paso 2: Por cada plan obtenido, buscar nombres y asignados
    for (const resultado of resultadosDelPaso1.rows) {
      const plan = await db.query(
        "SELECT id, nombre FROM planes WHERE id = $1",
        [resultado.plan_id]
      );

      const asignados = await db.query(
        "SELECT permisos.rol_id, usuarios.nombre FROM permisos JOIN usuarios ON permisos.user_id = usuarios.id WHERE permisos.permiso = $1 AND permisos.plan_id = $2 ORDER BY usuarios.id",
        ["liderar_proyectos", resultado.plan_id]
      );

      // Agregar al resultado final
      planesConAsignados.push({
        gestionables: { id: plan.rows[0].id, nombre: plan.rows[0].nombre },
        asignados: asignados.rows,
      });
    }

    return planesConAsignados;
  } catch (error) {
    console.error("Error en obtenerPlanesRoles:", error);
    throw error;
  }
}

async function agregarPlan(nombre, descripcion, marca_id) {
  const query =
    "INSERT INTO planes (nombre, descripcion, marca_id) VALUES ($1, $2, $3) RETURNING id";
  const result = await db.query(query, [nombre, descripcion, marca_id]);
  return result.rows;
}

async function editarPlan(id, nombre, descripcion) {
  const query = "UPDATE planes SET nombre = $2, descripcion = $3 WHERE id = $1";
  const result = await db.query(query, [id, nombre, descripcion]);
  return result.rows; // Devuelve la lista completa de planes
}

async function eliminarPlan(id) {
  const query = "DELETE FROM planes WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows; // Devuelve la lista completa de planes
}

async function obtenerPlanPaginado(user_id, perPage, offset) {
  const query = `SELECT planes.*, marcas.nombre AS marca_nombre, marcas.font_color AS marca_font_color, marcas.background_color AS marca_background_color FROM planes JOIN marcas ON planes.marca_id = marcas.id WHERE planes.id IN (SELECT plan_id FROM roles WHERE user_id = $1 AND (rol = 'administrador' OR rol = 'lider')) LIMIT $2 OFFSET $3;`;
  const result = await db.query(query, [user_id, perPage, offset]);
  return result.rows;
}

async function obtenerListadoPlanes(user_id) {
  const query = `SELECT * FROM planes WHERE id IN (SELECT plan_id FROM roles WHERE user_id = $1 AND rol = 'administrador')`;
  const result = await db.query(query, [user_id]);
  return result.rows;
}

async function obtenerTotalPlanes(user_id) {
  const query = `SELECT COUNT(*) FROM planes WHERE id IN (SELECT plan_id FROM roles WHERE user_id = $1 AND rol = 'administrador')`;
  const result = await db.query(query, [user_id]);
  return parseInt(result.rows[0].count);
}

async function obtenerPlanPorId(id) {
  const query =
    "SELECT m.*, e.id AS estado_id FROM planes m LEFT JOIN estados e ON m.id = e.plan_id AND e.orden = 0 WHERE m.id = $1;";
  const result = await db.query(query, [id]);
  return result.rows[0];
}

async function obtenerDatosJsonDePlan(planId) {
  const query = "SELECT datos_json FROM planes WHERE id = $1";
  const result = await db.query(query, [planId]);
  return result.rows[0].datos_json;
}

// Verificado
async function mostrarPlanes() {
  const query = "SELECT id, nombre, descripcion FROM planes";
  const result = await db.query(query);
  return result.rows;
}

async function mostrarPlanesIdNombre() {
  const query = "SELECT id, nombre FROM planes";
  const result = await db.query(query);
  return result.rows;
}


module.exports = {
  obtenerPlan,
  agregarPlan,
  editarPlan,
  eliminarPlan,
  obtenerPlanPaginado,
  obtenerTotalPlanes,
  obtenerPlanPorId,
  obtenerDatosJsonDePlan,
  obtenerTodasLasPlanes,
  obtenerUsuariosDePlanTotales,
  obtenerListadoPlanes,
  obtenerPlanesEstadosRoles,
  obtenerPlanesDatosRol,
  obtenerPlanesDatosGestor,
  obtenerPlanesRoles,
  mostrarPlanes,
  mostrarPlanesIdNombre,
};
