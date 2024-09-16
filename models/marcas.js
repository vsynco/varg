// marcas.js (models)
const db = require("../config/conexion.js");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

async function obtenerMarca() {
  const query = "SELECT * FROM marcas";
  const result = await db.query(query);
  return result.rows; // Devuelve la lista completa de marcas
}

async function obtenerUsuariosDeMarcaTotales(userId) {
  try {
    const query = `SELECT usuario FROM roles WHERE user_id = $1;`;
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function obtenerTodasLasMarcas(user_id) {
  try {
    const query =
      "SELECT DISTINCT ON (m.id) m.* FROM marcas m INNER JOIN roles v ON m.id = v.marca_id WHERE v.user_id = $1 AND (v.rol = 'administrador' OR v.rol = 'Rol') ORDER BY m.id, m.nombre;";
    const result = await db.query(query, [user_id]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function obtenerMarcasDatosGestor(user_id) {
  try {
    // 1. Obtén todas las marcas para el usuario dado.
    const marcasQuery =
      "SELECT m.id, m.nombre FROM marcas m INNER JOIN roles v ON m.id = v.marca_id WHERE v.user_id = $1 AND (v.rol = 'administrador' OR v.rol = 'Rol') ORDER BY m.nombre;";
    const marcasResult = await db.query(marcasQuery, [user_id]);
    const marcas = marcasResult.rows;

    // Para cada marca...
    for (const marca of marcas) {
      // 2. Obtén todos los estados asociados.
      const estadosQuery =
        "SELECT e.id, e.nombre FROM estados e WHERE e.marca_id = $1 ORDER BY e.orden;";
      const estadosResult = await db.query(estadosQuery, [marca.id]);
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

      // Agrega los estados a la marca.
      marca.estados = estados;
    }

    // Devuelve las marcas con sus estados y números de proyectos.
    return marcas;
  } catch (error) {
    throw error;
  }
}

async function obtenerMarcasDatosRol(user_id) {
  try {
    // 1. Obtén todas las marcas para el usuario dado.
    const marcasQuery =
      "SELECT m.id, m.nombre FROM marcas m INNER JOIN roles v ON m.id = v.marca_id WHERE v.user_id = $1 AND (v.rol = 'administrador' OR v.rol = 'Rol') ORDER BY m.nombre;";
    const marcasResult = await db.query(marcasQuery, [user_id]);
    const marcas = marcasResult.rows;

    // Para cada marca...
    for (const marca of marcas) {
      // 2. Obtén todos los estados asociados.
      const estadosQuery =
        "SELECT e.id, e.nombre FROM estados e WHERE e.marca_id = $1 ORDER BY e.orden;";
      const estadosResult = await db.query(estadosQuery, [marca.id]);
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

      // Agrega los estados a la marca.
      marca.estados = estados;
    }

    // Devuelve las marcas con sus estados y números de proyectos.
    return marcas;
  } catch (error) {
    throw error;
  }
}

async function obtenerMarcasEstadosRoles(user_id) {
  try {
    const marcasQuery =
      "SELECT DISTINCT ON (m.id) m.* FROM marcas m INNER JOIN roles v ON m.id = v.marca_id WHERE v.user_id = $1 AND (v.rol = 'administrador' OR v.rol = 'Rol') ORDER BY m.id, m.nombre;";
    const marcasResult = await db.query(marcasQuery, [user_id]);

    for (let marca of marcasResult.rows) {
      const estadosQuery =
        "SELECT * FROM estados WHERE marca_id = $1 ORDER BY orden;";
      const estadosResult = await db.query(estadosQuery, [marca.id]);
      marca.estados = estadosResult.rows;

      const rolesQuery =
        "SELECT u.id, u.nombre FROM roles v INNER JOIN usuarios u ON v.user_id = u.id WHERE v.marca_id = $1 AND v.rol = 'Rol';";
      const rolesResult = await db.query(rolesQuery, [marca.id]);
      marca.roles = rolesResult.rows;
    }

    return marcasResult.rows;
  } catch (error) {
    throw error;
  }
}

async function agregarMarca(nombre, descripcion) {
  const query =
    "INSERT INTO marcas (nombre, descripcion) VALUES ($1, $2) RETURNING id";
  const result = await db.query(query, [nombre, descripcion]);
  return result.rows;
}

async function editarMarca(
  id,
  nombre,
  descripcion,
  servicio,
  sociedad,
  rut,
  banco,
  banco_destinatario,
  header_logo,
  banco_rut,
  banco_cuenta_tipo,
  banco_cuenta_numero,
  banco_correo,
  footer_timbre,
  footer_firma,
  background_color,
  font_color
) {
  const query =
    "UPDATE marcas SET nombre = $2, descripcion = $3, servicio = $4, sociedad = $5, rut = $6, banco_destinatario = $7, header_logo = $8, banco = $9, banco_rut = $10, banco_cuenta_tipo = $11, banco_cuenta_numero = $12, banco_correo = $13, footer_timbre = $14, footer_firma = $15, background_color = $16, font_color = $17 WHERE id = $1";
  const result = await db.query(query, [
    id,
    nombre,
    descripcion,
    servicio,
    sociedad,
    rut,
    banco_destinatario,
    header_logo,
    banco,
    banco_rut,
    banco_cuenta_tipo,
    banco_cuenta_numero,
    banco_correo,
    footer_timbre,
    footer_firma,
    background_color,
    font_color,
  ]);
  return result.rows; // Devuelve la lista completa de marcas
}

async function eliminarMarca(id) {
  const query = "DELETE FROM marcas WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows; // Devuelve la lista completa de marcas
}

async function obtenerMarcaPaginado(user_id, perPage, offset) {
  const query = `SELECT * FROM marcas WHERE id IN (SELECT marca_id FROM roles WHERE user_id = $1 AND (rol = 'administrador' OR rol = 'Rol')) LIMIT $2 OFFSET $3`;
  const result = await db.query(query, [user_id, perPage, offset]);
  return result.rows;
}

async function obtenerListadoMarcas(user_id) {
  const query = `SELECT id,nombre FROM marcas WHERE id IN (SELECT marca_id FROM roles WHERE user_id = $1 AND rol = 'administrador')`;
  const result = await db.query(query, [user_id]);
  return result.rows;
}

async function obtenerTotalMarcas(user_id) {
  const query = `SELECT COUNT(*) FROM marcas WHERE id IN (SELECT marca_id FROM roles WHERE user_id = $1 AND rol = 'administrador')`;
  const result = await db.query(query, [user_id]);
  return parseInt(result.rows[0].count);
}

async function obtenerMarcaPorId(id) {
  const query = "SELECT * FROM marcas WHERE id = $1;";
  const result = await db.query(query, [id]);
  return result.rows[0];
}

async function obtenerDatosJsonDeMarca(marcaId) {
  const query = "SELECT datos_json FROM marcas WHERE id = $1";
  const result = await db.query(query, [marcaId]);
  return result.rows[0].datos_json;
}

module.exports = {
  obtenerMarca,
  agregarMarca,
  editarMarca,
  eliminarMarca,
  obtenerMarcaPaginado,
  obtenerTotalMarcas,
  obtenerMarcaPorId,
  obtenerDatosJsonDeMarca,
  obtenerTodasLasMarcas,
  obtenerUsuariosDeMarcaTotales,
  obtenerListadoMarcas,
  obtenerMarcasEstadosRoles,
  obtenerMarcasDatosRol,
  obtenerMarcasDatosGestor,
};
