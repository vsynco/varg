const db = require("../config/conexion.js");

async function informarCompletado(id, columna) {
  const query = `
    UPDATE reglamentos
    SET ${columna} = true
    WHERE id = $1;
  `;
  const values = [id];
  await db.query(query, values);
}

async function obtenerReglamentos() {
  const query = `
    SELECT
      reglamentos.*,
      condominios.nombre AS condominio_nombre,
      condominios.rut AS condominio_rut
    FROM
      reglamentos
    INNER JOIN condominios ON reglamentos.condominio_id = condominios.id
    ORDER BY reglamentos.id;
  `;
  const values = [];
  const result = await db.query(query, values);
  return result.rows;
}

async function obtenerMisReglamentos(idUsuario) {
  const query = `
    SELECT
      reglamentos.*,
      condominios.nombre AS condominio_nombre,
      condominios.rut AS condominio_rut
    FROM
      reglamentos
    INNER JOIN condominios ON reglamentos.condominio_id = condominios.id
    INNER JOIN condominios_usuarios ON reglamentos.condominio_id = condominios_usuarios.id_condominio
    WHERE
      condominios_usuarios.id_usuario = $1
    ORDER BY reglamentos.id;
  `;
  const values = [idUsuario];
  const result = await db.query(query, values);
  return result.rows;
}

async function obtenerReglamento(id) {
  const query = `
    SELECT
      reglamentos.*,
      condominios.nombre AS condominio_nombre,
      condominios.rut AS condominio_rut
    FROM
      reglamentos
    INNER JOIN condominios ON reglamentos.condominio_id = condominios.id
    WHERE reglamentos.id = $1;
  `;
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
}


async function verificarMiReglamento(id, idUsuario) {
  const query = `
    SELECT COUNT(*) FROM "condominios_usuarios"
    WHERE "id_condominio" = (
      SELECT "condominio_id" FROM "reglamentos" WHERE "id" = $1
    ) AND "id_usuario" = $2;
  `;
  const values = [id, idUsuario];
  const result = await db.query(query, values);
  return result.rows[0].count;
}


async function obtenerMiReglamento(id) {
  const query = `
    SELECT
      reglamentos.*,
      condominios.nombre AS condominio_nombre,
      condominios.rut AS condominio_rut
    FROM
      reglamentos
    INNER JOIN condominios ON reglamentos.condominio_id = condominios.id
    WHERE reglamentos.id = $1;
  `;
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function agregarReglamento(condominio_id, estado = 'Iniciado', reglamento_originario = false, reglamento_originario_check = false, info_cbr = false, info_cbr_check = false, formulario = false, formulario_check = false, terminado = false, acta = false, aprobado = false, reducido = false, inscrito_cbr = false, doc_url = null, carp_url = null, certificado_url = null, acta_url = null, responsabilidad = 'asamblea') {
  const query = "INSERT INTO reglamentos (condominio_id, estado, reglamento_originario, reglamento_originario_check, info_cbr, info_cbr_check, formulario, formulario_check, terminado, acta, aprobado, reducido, inscrito_cbr, doc_url, carp_url, certificado_url, acta_url, responsabilidad) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *;";
  const values = [condominio_id, estado, reglamento_originario, reglamento_originario_check, info_cbr, info_cbr_check, formulario, formulario_check, terminado, acta, aprobado, reducido, inscrito_cbr, doc_url, carp_url, certificado_url, acta_url, responsabilidad];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function agregarReglamentoCaratula(id, caratula) {
  const query = "UPDATE reglamentos SET caratula = $1 WHERE id = $2 RETURNING *;";
  const values = [caratula, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function creaBorrador(id, doc_id, doc_url) {
  const query = "UPDATE reglamentos SET doc_id = $1, doc_url = $2 WHERE id = $3 RETURNING *;";
  const values = [doc_id, doc_url, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarFormularioCheckFalse(id, caratula, doc_id, doc_url) {
  const query = "UPDATE reglamentos SET formulario_check = $1, doc_id = $2, doc_url = $3 WHERE id = $4 RETURNING *;";
  const values = [caratula, doc_id, doc_url, id];
  const result = await db.query(query, values);
  return result.rows[0];
}


async function editarCarpUrl(id, carp_url, carp_id) {
  const query = "UPDATE reglamentos SET carp_url = $1, carp_id = $2 WHERE id = $3 RETURNING *;";
  const values = [carp_url, carp_id, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarCbr(id, foja, numero, ano) {
  const query = `
    UPDATE reglamentos 
    SET foja = $1, numero = $2, ano = $3 
    WHERE id = $4 
    RETURNING *;
  `;
  const values = [foja, numero, ano, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

  async function editarTerminadoCheckCitacion(id, caratula, citacion_id, citacion_url) {
    const query = "UPDATE reglamentos SET terminado_check = $1, citacion_id = $2, citacion_url = $3 WHERE id = $4 RETURNING *;";
    const values = [caratula, citacion_id, citacion_url, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function editarTerminadoCheckConsulta(id, consulta_id, consulta_url) {
    const query = "UPDATE reglamentos SET consulta_id = $1, consulta_url = $2 WHERE id = $3 RETURNING *;";
    const values = [consulta_id, consulta_url, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

async function editarAprobado(id, caratula, doc_id, doc_url) {
  const query = "UPDATE reglamentos SET aprobado = $1, acta_id = $2, acta_url = $3 WHERE id = $4 RETURNING *;";
  const values = [caratula, doc_id, doc_url, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarCarpUrl(id, carp_url, carp_id) {
  const query = "UPDATE reglamentos SET carp_url = $1, carp_id = $2 WHERE id = $3 RETURNING *;";
  const values = [carp_url, carp_id, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

// Derivaciones

async function derivarCliente(id, responsabilidad) {
  const query = "UPDATE reglamentos SET responsabilidad = $1, revisiones = revisiones + 1 WHERE id = $2;";
    const values = [responsabilidad, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function derivarAbogado(id, responsabilidad) {
  const query = "UPDATE reglamentos SET responsabilidad = $1 WHERE id = $2;";
  const values = [responsabilidad, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

  module.exports = {
    obtenerReglamentos,
    obtenerReglamento,
    agregarReglamento,
    agregarReglamentoCaratula,
    editarCbr,
    editarAprobado,
    editarCarpUrl,
    editarTerminadoCheckCitacion,
    editarTerminadoCheckConsulta,
    obtenerMisReglamentos,
    obtenerMiReglamento,
    verificarMiReglamento,
    derivarCliente,
    derivarAbogado,
    editarCarpUrl,
    editarFormularioCheckFalse,
    informarCompletado,
    creaBorrador
  };
  