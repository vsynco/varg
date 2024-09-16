const db = require("../config/conexion.js");

async function obtenerCobranzas() {
  const query = `
    SELECT
      cobranzas.*,
      condominios.nombre AS condominio_nombre,
      condominios.rut AS condominio_rut
    FROM
      cobranzas
    INNER JOIN condominios ON cobranzas.condominio_id = condominios.id
    ORDER BY cobranzas.id;
  `;
  const values = [];
  const result = await db.query(query, values);
  return result.rows;
}


async function obtenerMisCobranzas(idUsuario) {
  const query = `
    SELECT
      cobranzas.*,
      condominios.nombre AS condominio_nombre,
      condominios.rut AS condominio_rut
    FROM
      cobranzas
    INNER JOIN condominios ON cobranzas.condominio_id = condominios.id
    INNER JOIN condominios_usuarios ON cobranzas.condominio_id = condominios_usuarios.id_condominio
    WHERE
      condominios_usuarios.id_usuario = $1
    ORDER BY cobranzas.id;
  `;
  const values = [idUsuario];
  const result = await db.query(query, values);
  return result.rows;
}



async function obtenerCobranza(id) {
  const query = `
    SELECT
      cobranzas.*,
      condominios.nombre AS condominio_nombre,
      condominios.rut AS condominio_rut
    FROM
      cobranzas
    INNER JOIN condominios ON cobranzas.condominio_id = condominios.id
    WHERE cobranzas.id = $1;
  `;
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
}


async function verificarMiCobranza(id, idUsuario) {
  const query = `
    SELECT COUNT(*) FROM "condominios_usuarios"
    WHERE "id_condominio" = (
      SELECT "condominio_id" FROM "cobranzas" WHERE "id" = $1
    ) AND "id_usuario" = $2;
  `;
  const values = [id, idUsuario];
  const result = await db.query(query, values);
  return result.rows[0].count;
}


async function obtenerMiCobranza(id) {
  const query = `
    SELECT
      cobranzas.*,
      condominios.nombre AS condominio_nombre,
      condominios.rut AS condominio_rut
    FROM
      cobranzas
    INNER JOIN condominios ON cobranzas.condominio_id = condominios.id
    WHERE cobranzas.id = $1;
  `;
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function agregarCobranza(condominio_id, estado = 'Iniciado', cobranza_originario = false, cobranza_originario_check = false, info_cbr = false, info_cbr_check = false, formulario = false, formulario_check = false, terminado = false, acta = false, aprobado = false, reducido = false, inscrito_cbr = false, doc_url = null, carp_url = null, certificado_url = null, acta_url = null, responsabilidad = 'asamblea') {
  const query = "INSERT INTO cobranzas (condominio_id, estado, cobranza_originario, cobranza_originario_check, info_cbr, info_cbr_check, formulario, formulario_check, terminado, acta, aprobado, reducido, inscrito_cbr, doc_url, carp_url, certificado_url, acta_url, responsabilidad) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *;";
  const values = [condominio_id, estado, cobranza_originario, cobranza_originario_check, info_cbr, info_cbr_check, formulario, formulario_check, terminado, acta, aprobado, reducido, inscrito_cbr, doc_url, carp_url, certificado_url, acta_url, responsabilidad];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function agregarCobranzaCbr(id, foja, numero, ano) {
  const query = "UPDATE cobranzas SET foja = $1, numero = $2, ano = $3 WHERE id = $4 RETURNING *;";
  const values = [foja, numero, ano, id];
  const result = await db.query(query, values);
  return result.rows[0];
}


async function agregarCobranzaCaratula(id, caratula) {
  const query = "UPDATE cobranzas SET caratula = $1 WHERE id = $2 RETURNING *;";
  const values = [caratula, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarFormulario(id, caratula) {
  const query = "UPDATE cobranzas SET formulario = $1 WHERE id = $2 RETURNING *;";
  const values = [caratula, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarFormularioCheck(id, caratula, doc_id, doc_url) {
  const query = "UPDATE cobranzas SET formulario_check = $1, doc_id = $2, doc_url = $3 WHERE id = $4 RETURNING *;";
  const values = [caratula, doc_id, doc_url, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarFormularioCheckFalse(id, caratula, doc_id, doc_url) {
  const query = "UPDATE cobranzas SET formulario_check = $1, doc_id = $2, doc_url = $3 WHERE id = $4 RETURNING *;";
  const values = [caratula, doc_id, doc_url, id];
  const result = await db.query(query, values);
  return result.rows[0];
}


async function editarCarpUrl(id, carp_url, carp_id) {
  const query = "UPDATE cobranzas SET carp_url = $1, carp_id = $2 WHERE id = $3 RETURNING *;";
  const values = [carp_url, carp_id, id];
  const result = await db.query(query, values);
  return result.rows[0];
}


async function editarDocumentos(id, caratula) {
  const query = "UPDATE cobranzas SET cobranza_originario = $1 WHERE id = $2 RETURNING *;";
  const values = [caratula, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarDocumentosCheck(id, caratula) {
  const query = "UPDATE cobranzas SET cobranza_originario_check = $1 WHERE id = $2 RETURNING *;";
  const values = [caratula, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarCbr(id, caratula) {
  const query = "UPDATE cobranzas SET info_cbr = $1 WHERE id = $2 RETURNING *;";
  const values = [caratula, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarCbrCheck(id, caratula) {
  const query = "UPDATE cobranzas SET info_cbr_check = $1 WHERE id = $2 RETURNING *;";
  const values = [caratula, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function activarCobranza(id, caratula) {
  const query = "UPDATE cobranzas SET activado = $1 WHERE id = $2 RETURNING *;";
  const values = [caratula, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarTerminado(id, info) {
  const query = "UPDATE cobranzas SET terminado = $1 WHERE id = $2 RETURNING *;";
  const values = [info, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarTerminadoCheck(id, info) {
  const query = "UPDATE cobranzas SET terminado_check = $1 WHERE id = $2 RETURNING *;";
  const values = [info, id];
  const result = await db.query(query, values);
  return result.rows[0];
}


  async function editarTerminadoCheckCitacion(id, caratula, citacion_id, citacion_url) {
    const query = "UPDATE cobranzas SET terminado_check = $1, citacion_id = $2, citacion_url = $3 WHERE id = $4 RETURNING *;";
    const values = [caratula, citacion_id, citacion_url, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function editarTerminadoCheckConsulta(id, consulta_id, consulta_url) {
    const query = "UPDATE cobranzas SET consulta_id = $1, consulta_url = $2 WHERE id = $3 RETURNING *;";
    const values = [consulta_id, consulta_url, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

async function editarAprobado(id, caratula, doc_id, doc_url) {
  const query = "UPDATE cobranzas SET aprobado = $1, acta_id = $2, acta_url = $3 WHERE id = $4 RETURNING *;";
  const values = [caratula, doc_id, doc_url, id];
  const result = await db.query(query, values);
  return result.rows[0];
}


async function editarActa(id, info) {
  const query = "UPDATE cobranzas SET acta = $1 WHERE id = $2 RETURNING *;";
  const values = [info, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarReducido(id, info) {
  const query = "UPDATE cobranzas SET reducido = $1 WHERE id = $2 RETURNING *;";
  const values = [info, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarInscrito(id, info) {
  const query = "UPDATE cobranzas SET inscrito_cbr = $1 WHERE id = $2 RETURNING *;";
  const values = [info, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarInscritoCheck(id, info) {
  const query = "UPDATE cobranzas SET inscribo_cbr_check = $1 WHERE id = $2 RETURNING *;";
  const values = [info, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function editarCarpUrl(id, carp_url, carp_id) {
  const query = "UPDATE cobranzas SET carp_url = $1, carp_id = $2 WHERE id = $3 RETURNING *;";
  const values = [carp_url, carp_id, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function derivarCliente(id, responsabilidad) {
  const query = "UPDATE cobranzas SET responsabilidad = $1, revisiones = revisiones + 1 WHERE id = $2;";
    const values = [responsabilidad, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function derivarAbogado(id, responsabilidad) {
  const query = "UPDATE cobranzas SET responsabilidad = $1 WHERE id = $2;";
  const values = [responsabilidad, id];
  const result = await db.query(query, values);
  return result.rows[0];
}

  module.exports = {
    obtenerCobranzas,
    obtenerCobranza,
    agregarCobranza,
    agregarCobranzaCbr,
    agregarCobranzaCaratula,
    editarFormulario,
    editarFormularioCheck,
    editarDocumentos,
    editarDocumentosCheck,
    editarCbr,
    editarCbrCheck,
    editarTerminado,
    editarTerminadoCheck,
    editarAprobado,
    editarActa,
    editarReducido,
    editarInscrito,
    editarInscritoCheck,
    editarCarpUrl,
    editarTerminadoCheckCitacion,
    editarTerminadoCheckConsulta,
    obtenerMisCobranzas,
    obtenerMiCobranza,
    verificarMiCobranza,
    derivarCliente,
    derivarAbogado,
    activarCobranza,
    editarCarpUrl,
    editarFormularioCheckFalse
  };
  