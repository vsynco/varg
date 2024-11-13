const db = require('../config/turso');

async function insertarPersona({ nombre, email, contrasena }) {
    try {
      const result = await db.execute(
        `INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?) RETURNING *`,
        [nombre, email, contrasena]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en insertarPersona:', error);
      throw error;
    }
  }

  async function obtenerPersonaEmail(email) {
    try {
      const result = await db.execute(`SELECT * FROM usuarios WHERE email = ?`, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en obtenerPersonaEmail:', error);
      throw error;
    }
  }

  async function obtenerPersonaId(id) {
    try {
      const result = await db.execute(`SELECT * FROM usuarios WHERE id = ?`, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en obtenerPersonaId:', error);
      throw error;
    }
  }

module.exports = {
    obtenerPersonaId,
    obtenerPersonaEmail,
    insertarPersona,
};