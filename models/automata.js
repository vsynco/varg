// cotizaciones.js

const db = require("../config/conexion.js");
const { Pool } = require("pg");

// Tabla: cotizaciones
// Campo: fecha
// Campo: user_id
// Campo: marca_id
// Campo: id
// Campo: prospecto_id
// Campo: estado
// Campo: url_cotizacion

async function generarCotizacion(
  fecha,
  user_id,
  marca_id,
  prospecto_id,
  estado,
  url_cotizacion
) {
  const query =
    "INSERT INTO cotizaciones (fecha, user_id, marca_id, prospecto_id, estado, url_cotizacion) VALUES ($1, $2, $3, $4, $5, $6)";
  const result = await db.query(query, [
    fecha,
    user_id,
    marca_id,
    prospecto_id,
    estado,
    url_cotizacion,
  ]);
  return result.rows;
}

async function obtenerCotizacionesPorProspecto(prospecto_id) {
  const query =
    "SELECT * FROM cotizaciones WHERE prospecto_id = $1 ORDER BY id DESC;";
  const result = await db.query(query, [prospecto_id]);
  return result.rows;
}

module.exports = {
  generarCotizacion,
  obtenerCotizacionesPorProspecto,
};
