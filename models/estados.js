// estados.js (models)
const db = require("../config/conexion.js");

async function obtenerEstadosPorPlan(planId) {
  const query = "SELECT * FROM estados WHERE plan_id = $1";
  const result = await db.query(query, [planId]);
  return result.rows;
}

async function obtenerEstadoPorId(estadoId) {
  try {
    const query = "SELECT * FROM estados WHERE id = $1";
    const result = await db.query(query, [estadoId]);
    return result.rows[0]; // Devuelve el primer estado encontrado (debería ser único por ID)
  } catch (error) {
    console.error("Error al obtener el estado por ID:", error);
    return null; // Devuelve null en caso de error
  }
}

async function crearEstado(planId, nombre, orden) {
  const query =
    "INSERT INTO estados (plan_id, nombre, orden) VALUES ($1, $2, $3)";
  await db.query(query, [planId, nombre, orden]);
}

async function estadoCero(planId) {
  const query =
    "SELECT COUNT(*) AS count_estados FROM estados WHERE plan_id = $1 AND orden = 0;";
  const result = await db.query(query, [planId]);

  // Obtén el valor de "count_estados" del resultado
  const countEstados = result.rows[0].count_estados;

  return countEstados;
}

async function estadoCeroId(planId) {
  const query = "SELECT id FROM estados WHERE plan_id = $1 AND orden = 0;";
  const result = await db.query(query, [planId]);

  // Obtén el valor de "id" del resultado
  const estadoId = result.rows[0].id;

  return estadoId;
}

async function editarEstado(estadoId, nombre) {
  const query = "UPDATE estados SET nombre = $1 WHERE id = $2";
  await db.query(query, [nombre, estadoId]);
}

async function contarEstadosPorPlan(planId) {
  const query = "SELECT COUNT(*) FROM estados WHERE plan_id = $1";
  const result = await db.query(query, [planId]);
  return parseInt(result.rows[0].count, 10);
}

async function actualizarOrdenesDeEstados(nuevosOrdenes) {
  if (!nuevosOrdenes || !Array.isArray(nuevosOrdenes)) {
    throw new Error("nuevosOrdenes debe ser un array válido.");
  }

  const client = await db.query("BEGIN"); // Inicia la transacción

  try {
    for (const { estadoId, nuevoOrden } of nuevosOrdenes) {
      const query = "UPDATE estados SET orden = $1 WHERE id = $2";
      await db.query(query, [nuevoOrden, estadoId]);
    }

    await db.query("COMMIT"); // Compromete la transacción
  } catch (error) {
    await db.query("ROLLBACK"); // Revierte la transacción
    throw error;
  }
}

// Función para obtener el orden de un estado por su ID
async function obtenerOrdenEstado(estadoId) {
  const query = "SELECT orden FROM estados WHERE id = $1";
  const result = await db.query(query, [estadoId]);
  if (result.rows.length === 0) {
    throw new Error("Estado no encontrado.");
  }
  return result.rows[0].orden;
}
// Función para eliminar estado por su ID
async function eliminarEstado(estadoId) {
  try {
    // Obtén el orden del estado que se va a eliminar
    const obtenerOrdenQuery =
      "SELECT orden, plan_id FROM estados WHERE id = $1";
    const { rows } = await db.query(obtenerOrdenQuery, [estadoId]);

    if (rows.length === 0) {
      throw new Error("El estado no se encontró.");
    }

    const { orden, plan_id: planId } = rows[0];

    // Elimina el estado por su ID
    const eliminarQuery = "DELETE FROM estados WHERE id = $1";
    await db.query(eliminarQuery, [estadoId]);

    // Actualiza los órdenes de los estados restantes
    const actualizarOrdenesQuery =
      "UPDATE estados SET orden = orden - 1 WHERE plan_id = $1 AND orden > $2";
    await db.query(actualizarOrdenesQuery, [planId, orden]);

    // Devuelve un mensaje de éxito o cualquier otro resultado necesario
    return "Estado eliminado con éxito.";
  } catch (error) {
    throw error;
  }
}

module.exports = {
  obtenerEstadosPorPlan,
  crearEstado,
  editarEstado,
  eliminarEstado,
  obtenerEstadoPorId,
  contarEstadosPorPlan,
  actualizarOrdenesDeEstados,
  obtenerOrdenEstado,
  estadoCero,
  estadoCeroId,
};
