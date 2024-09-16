const db = require("../config/conexion.js");
    async function obtenerUsuariosDeAfiliado(tipo, orderBy = 'DESC') {
        const query = `
        SELECT * FROM usuarios
        WHERE afiliado = $1
        ORDER BY creacion ${orderBy}
        `;
        const result = await db.query(query, [tipo]);
        return result.rows; // Devuelve la lista de comentarios relacionados con el proyecto
      }
  


  module.exports = {
    obtenerUsuariosDeAfiliado,
  };
  