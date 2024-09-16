const db = require("../config/conexion.js");

async function obtenerPersonasJuridicas() {
  const query = `
      SELECT 
    c.*, -- todos los datos del persona_juridica
    COUNT(CASE WHEN cu.principal = false THEN 1 END) AS principal_false,
    COUNT(CASE WHEN cu.principal = true THEN 1 END) AS principal_true
FROM 
    personas_juridicas c
LEFT JOIN 
    personas_juridicas_usuarios cu ON cu.id_persona_juridica = c.id
GROUP BY 
    c.id
ORDER BY
    c.id;
  `;
  const values = [];
  const result = await db.query(query, values);
  return result.rows;
}


  async function obtenerMisPersonasJuridicas(user_id) {
    const query = "SELECT c.* FROM personas_juridicas c JOIN personas_juridicas_usuarios cu ON c.id = cu.id_persona_juridica WHERE cu.id_usuario = $1;";
    const values = [user_id];
    const result = await db.query(query, values);
    return result.rows;
  }

async function obtenerPersonaJuridica(id) {
    const query = "SELECT * FROM personas_juridicas WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  
  async function obtenerCondominoUsuariosContactos(id) {
    const query = `
      SELECT
        cu.*,
        COALESCE(u.nombre, c.nombre) AS nombre,
        COALESCE(u.email, c.email) AS email,
        COALESCE(u.telefono, c.telefono) AS telefono,
        COALESCE(u.region, c.region) AS region,
        CASE
          WHEN cu.contacto_id IS NOT NULL THEN 'Contacto'
          ELSE 'Usuario'
        END AS tipo
      FROM
        personas_juridicas_usuarios cu
      LEFT JOIN
        usuarios u ON cu.id_usuario = u.id AND cu.contacto_id IS NULL
      LEFT JOIN
        contactos c ON cu.contacto_id = c.id AND cu.contacto_id IS NOT NULL
      WHERE
        cu.id_persona_juridica = $1
      ORDER BY cu.id;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows;
  }
  
  

async function verificarMiPersonaJuridica(id, idUsuario) {
    const query = "SELECT COUNT(*) FROM personas_juridicas_usuarios WHERE id_usuario = $1 AND id_persona_juridica = $2;";
    const values = [idUsuario, id];
    const result = await db.query(query, values);
    return result.rows[0].count > 0;
  }


  async function obtenerMiPersonaJuridica(id) {
    const query = "SELECT * FROM personas_juridicas WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function buscarPersonasJuridicas(buscar) {
    const query = "SELECT * FROM personas_juridicas WHERE nombre ILIKE $1 OR rut ILIKE $1;";
    const values = [`%${buscar}%`];
    const result = await db.query(query, values);
    return result.rows;
  }

  
  async function agregarPersonaJuridica(nombre, rut, domicilio, comuna) {
    const query = "INSERT INTO personas_juridicas (nombre, rut, domicilio, comuna) VALUES ($1, $2, $3, $4) RETURNING *;";
    const values = [nombre, rut, domicilio, comuna];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function asignarUsuario(id, persona_juridica_id, permiso) {
    const query = "INSERT INTO personas_juridicas_usuarios (id_usuario, id_persona_juridica, permiso) VALUES ($1, $2, $3);"
    const values = [id, persona_juridica_id, permiso];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function asignarContacto(usuario, contacto, persona_juridica_id, permiso) {
    const query = "INSERT INTO personas_juridicas_usuarios (id_usuario, contacto_id, id_persona_juridica, permiso) VALUES ($1, $2, $3, $4);"
    const values = [usuario, contacto, persona_juridica_id, permiso];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function asignarPrincipal(id) {
    const query = "UPDATE personas_juridicas_usuarios SET principal = true WHERE id = $1 RETURNING id_persona_juridica;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function desasignarPrincipal(id, persona_juridica_id) {
    const query = "UPDATE personas_juridicas_usuarios SET principal = false WHERE id != $1 AND id_persona_juridica = $2;";
    const values = [id, persona_juridica_id];
    const result = await db.query(query, values);
    return result.rows[0];
  }


  module.exports = {
    obtenerPersonasJuridicas,
    obtenerPersonaJuridica,
    buscarPersonasJuridicas,
    agregarPersonaJuridica,
    asignarUsuario,
    obtenerMisPersonasJuridicas,
    obtenerMiPersonaJuridica,
    verificarMiPersonaJuridica,
    asignarContacto,
    obtenerCondominoUsuariosContactos,
    asignarPrincipal,
    desasignarPrincipal
  };
  