const db = require("../config/conexion.js");

async function obtenerClientes() {
  const query = `
      SELECT 
    c.*, -- todos los datos del cliente
    COUNT(CASE WHEN cu.principal = false THEN 1 END) AS principal_false,
    COUNT(CASE WHEN cu.principal = true THEN 1 END) AS principal_true
FROM 
    clientes c
LEFT JOIN 
    clientes_representantes cu ON cu.id_cliente = c.id
GROUP BY 
    c.id
ORDER BY
    c.id;
  `;
  const values = [];
  const result = await db.query(query, values);
  return result.rows;
}


  async function obtenerMisClientes(user_id) {
    const query = "SELECT c.* FROM clientes c JOIN clientes_representantes cu ON c.id = cu.id_cliente WHERE cu.id_usuario = $1;";
    const values = [user_id];
    const result = await db.query(query, values);
    return result.rows;
  }

async function obtenerCliente(id) {
    const query = "SELECT * FROM clientes WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  
  async function obtenerClientesPropios(user_id) {
    const query = `
      SELECT * 
      FROM clientes 
      WHERE id = (
        SELECT cr.id_cliente 
        FROM clientes_representantes cr 
        JOIN contactos c ON cr.id_contacto = c.id 
        WHERE c.id_usuario = $1 
        LIMIT 1
      )
    `;
    const result = await db.query(query, [user_id]);
    return result.rows; // Devuelve los clientes seleccionados
  }
  
  
  async function obtenerClienteUsuariosContactos(id) {
    const query = `
      SELECT
        cu.*,
        c.nombre AS nombre,
        c.email AS email,
        c.telefono AS telefono,
        c.region AS region,
        'Contacto' AS tipo
      FROM
        clientes_representantes cu
      LEFT JOIN
        contactos c ON cu.id_contacto = c.id
      WHERE
        cu.id_cliente = $1
      ORDER BY cu.id;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows;
  }
    
  

async function verificarMiCliente(id, idUsuario) {
    const query = "SELECT COUNT(*) FROM clientes_representantes WHERE id_usuario = $1 AND id_cliente = $2;";
    const values = [idUsuario, id];
    const result = await db.query(query, values);
    return result.rows[0].count > 0;
  }


  async function obtenerMiCliente(id) {
    const query = "SELECT * FROM clientes WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function buscarClientes(buscar) {
    const query = "SELECT * FROM clientes WHERE nombre ILIKE $1 OR rut ILIKE $1;";
    const values = [`%${buscar}%`];
    const result = await db.query(query, values);
    return result.rows;
  }

  
  async function agregarCliente(nombre, rut, domicilio, comuna) {
    const query = "INSERT INTO clientes (nombre, rut, domicilio, comuna) VALUES ($1, $2, $3, $4) RETURNING *;";
    const values = [nombre, rut, domicilio, comuna];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function asignarUsuario(id, cliente_id, permiso) {
    const query = "INSERT INTO clientes_representantes (id_usuario, id_cliente, permiso) VALUES ($1, $2, $3);"
    const values = [id, cliente_id, permiso];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function asignarContacto(contacto, cliente_id, permiso) {
    const query = "INSERT INTO clientes_representantes (id_contacto, id_cliente, permiso) VALUES ($1, $2, $3);"
    const values = [contacto, cliente_id, permiso];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function asignarPrincipal(id) {
    const query = "UPDATE clientes_representantes SET principal = true WHERE id = $1 RETURNING id_cliente;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function desasignarPrincipal(id, cliente_id) {
    const query = "UPDATE clientes_representantes SET principal = false WHERE id != $1 AND id_cliente = $2;";
    const values = [id, cliente_id];
    const result = await db.query(query, values);
    return result.rows[0];
  }


  module.exports = {
    obtenerClientes,
    obtenerCliente,
    buscarClientes,
    agregarCliente,
    asignarUsuario,
    obtenerMisClientes,
    obtenerMiCliente,
    verificarMiCliente,
    asignarContacto,
    obtenerClienteUsuariosContactos,
    asignarPrincipal,
    desasignarPrincipal,
    obtenerClientesPropios
  };
  