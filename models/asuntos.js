const db = require("../config/conexion.js");

async function informarCompletado(id, columna) {
  const query = `
    UPDATE asuntos
    SET ${columna} = true
    WHERE id = $1;
  `;
  const values = [id];
  await db.query(query, values);
}

async function obtenerAsuntos() {
  const query = `
    SELECT
      asuntos.*,
      clientes.nombre AS cliente_nombre,
      clientes.rut AS cliente_rut
    FROM
      asuntos
    INNER JOIN clientes ON asuntos.cliente_id = clientes.id
    ORDER BY asuntos.id;
  `;
  const values = [];
  const result = await db.query(query, values);
  return result.rows;
}

async function obtenerMisAsuntos(idUsuario) {
  const query = `
    SELECT
      asuntos.*,
      clientes.nombre AS cliente_nombre,
      clientes.rut AS cliente_rut
    FROM
      asuntos
    INNER JOIN clientes ON asuntos.cliente_id = clientes.id
    INNER JOIN clientes_representantes ON asuntos.cliente_id = clientes_representantes.id_cliente
    WHERE
      clientes_representantes.id_usuario = $1
    ORDER BY asuntos.id;
  `;
  const values = [idUsuario];
  const result = await db.query(query, values);
  return result.rows;
}

async function obtenerAsunto(id) {
  const query = `
    SELECT
      asuntos.*,
      clientes.nombre AS cliente_nombre,
      clientes.rut AS cliente_rut
    FROM
      asuntos
    INNER JOIN clientes ON asuntos.cliente_id = clientes.id
    WHERE asuntos.id = $1;
  `;
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
}


async function verificarMiAsunto(id, idUsuario) {
  const query = `
    SELECT COUNT(*) FROM "clientes_representantes"
    WHERE "id_cliente" = (
      SELECT "cliente_id" FROM "asuntos" WHERE "id" = $1
    ) AND "id_usuario" = $2;
  `;
  const values = [id, idUsuario];
  const result = await db.query(query, values);
  return result.rows[0].count;
}


async function obtenerMiAsunto(id) {
  const query = `
    SELECT
      asuntos.*,
      clientes.nombre AS cliente_nombre,
      clientes.rut AS cliente_rut
    FROM
      asuntos
    INNER JOIN clientes ON asuntos.cliente_id = clientes.id
    WHERE asuntos.id = $1;
  `;
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function agregarAsunto(cliente_id, estado = 'Iniciado', tipo = 'Judicial') {
  const query = "INSERT INTO asuntos (cliente_id, estado, tipo) VALUES ($1, $2, $3) RETURNING *;";
  const values = [cliente_id, estado, tipo];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function agregarAsuntoCaratula(id, caratula) {
  const query = "UPDATE asuntos SET caratula = $1 WHERE id = $2 RETURNING *;";
  const values = [caratula, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function creaBorrador(id, doc_id, doc_url) {
  const query = "UPDATE asuntos SET doc_id = $1, doc_url = $2 WHERE id = $3 RETURNING *;";
  const values = [doc_id, doc_url, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarFormularioCheckFalse(id, caratula, doc_id, doc_url) {
  const query = "UPDATE asuntos SET formulario_check = $1, doc_id = $2, doc_url = $3 WHERE id = $4 RETURNING *;";
  const values = [caratula, doc_id, doc_url, id];
  const result = await db.query(query, values);
  return result.rows[0];
}


async function editarCarpUrl(id, carp_url, carp_id) {
  const query = "UPDATE asuntos SET carp_url = $1, carp_id = $2 WHERE id = $3 RETURNING *;";
  const values = [carp_url, carp_id, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarCbr(id, foja, numero, ano) {
  const query = `
    UPDATE asuntos 
    SET foja = $1, numero = $2, ano = $3 
    WHERE id = $4 
    RETURNING *;
  `;
  const values = [foja, numero, ano, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

  async function editarTerminadoCheckCitacion(id, caratula, citacion_id, citacion_url) {
    const query = "UPDATE asuntos SET terminado_check = $1, citacion_id = $2, citacion_url = $3 WHERE id = $4 RETURNING *;";
    const values = [caratula, citacion_id, citacion_url, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function editarTerminadoCheckConsulta(id, consulta_id, consulta_url) {
    const query = "UPDATE asuntos SET consulta_id = $1, consulta_url = $2 WHERE id = $3 RETURNING *;";
    const values = [consulta_id, consulta_url, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

async function editarAprobado(id, caratula, doc_id, doc_url) {
  const query = "UPDATE asuntos SET aprobado = $1, acta_id = $2, acta_url = $3 WHERE id = $4 RETURNING *;";
  const values = [caratula, doc_id, doc_url, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarCarpUrl(id, carp_url, carp_id) {
  const query = "UPDATE asuntos SET carp_url = $1, carp_id = $2 WHERE id = $3 RETURNING *;";
  const values = [carp_url, carp_id, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

// Derivaciones

async function derivarCliente(id, responsabilidad) {
  const query = "UPDATE asuntos SET responsabilidad = $1, revisiones = revisiones + 1 WHERE id = $2;";
    const values = [responsabilidad, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function derivarAbogado(id, responsabilidad) {
  const query = "UPDATE asuntos SET responsabilidad = $1 WHERE id = $2;";
  const values = [responsabilidad, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

  module.exports = {
    obtenerAsuntos,
    obtenerAsunto,
    agregarAsunto,
    agregarAsuntoCaratula,
    editarCbr,
    editarAprobado,
    editarCarpUrl,
    editarTerminadoCheckCitacion,
    editarTerminadoCheckConsulta,
    obtenerMisAsuntos,
    obtenerMiAsunto,
    verificarMiAsunto,
    derivarCliente,
    derivarAbogado,
    editarCarpUrl,
    editarFormularioCheckFalse,
    informarCompletado,
    creaBorrador
  };
  